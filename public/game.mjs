import {START,symbol,sideOf,opposite,move,legalTargets,inCheck,result,notation,square,indexOfSquare} from './rules.mjs';
import {drawLines} from './board.mjs';
import {Pikafish} from './engine.mjs';
const $=id=>document.getElementById(id);
const initial=()=>({board:START,side:'red',label:'',uci:'',capture:false});
let history=[initial()],mode='ai',selected=null,legal=[],end='',confirmAction;
const current=()=>history.at(-1);
const engine=new Pikafish(info=>{$('detail').textContent=info;$('retry').hidden=engine.state!=='failed';},uci=>{
  if(mode!=='ai'||current().side!=='black'||end)return;
  if(!/^[a-i][0-9][a-i][0-9]$/.test(uci)){engine.fail('引擎未返回有效走法，请重试。');return;}
  const from=indexOfSquare(uci.slice(0,2)),to=indexOfSquare(uci.slice(2));
  if(sideOf(current().board[from])!=='black'||!legalTargets(current().board,from).includes(to)){
    engine.fail('引擎局面已失同步，请重试。');return;
  }
  commit(from,to);
});
const cells=Array.from({length:90},(_,i)=>{
  const b=document.createElement('button');b.className='cell';b.addEventListener('click',()=>choose(i));
  $('squares').append(b);return b;
});
function choose(i){
  const {board,side}=current();
  if(end || (mode==='ai'&&side==='black'))return;
  if(legal.includes(i)){commit(selected,i);return;}
  selected=i!==selected && sideOf(board[i])===side?i:null;
  legal=selected!==null?legalTargets(board,selected):[];render();
}
function commit(from,to){
  const old=current(),board=move(old.board,from,to),side=opposite(old.side);
  history.push({board,side,from,to,label:notation(old.board,from,to),uci:square(from)+square(to),capture:old.board[to]!=='.'});
  selected=null;legal=[];afterChange();
}
function afterChange(){
  end=result(current().board,current().side,history);render();
  if(mode==='ai' && current().side==='black' && !end)engine.play(history.slice(1).map(h=>h.uci));
}
function render(){
  const {board,side,from,to}=current();const ai=mode==='ai';
  cells.forEach((b,i)=>{
    const p=board[i],color=sideOf(p);
    b.className=['cell',selected===i?'selected':'',legal.includes(i)?'target':'',i===from||i===to?'last':''].join(' ');
    b.setAttribute('aria-label',square(i)+' '+(color?(color==='red'?'红':'黑')+symbol[p]:'空位')+(legal.includes(i)?' 可走':''));
    if(p!=='.'){const piece=document.createElement('span');piece.className='piece '+color;piece.textContent=symbol[p];b.replaceChildren(piece);}else b.replaceChildren();
  });
  $('ai').setAttribute('aria-pressed',String(ai));$('local').setAttribute('aria-pressed',String(!ai));
  $('topSeat').textContent=ai?'皮卡鱼':'黑方棋手';$('bottomSeat').textContent=ai?'玩家':'红方棋手';
  $('rivalLabel').textContent=ai?'对弈引擎':'对弈方式';$('rival').innerHTML=ai?'皮卡鱼 <em>PIKAFISH</em>':'同屏轮流执子';
  $('badge').textContent=ai?'最高难度':'双人';
  $('round').textContent='第 '+String(Math.floor((history.length-1)/2)+1).padStart(2,'0')+' 回合';
  $('turn').dataset.side=side;$('turn').textContent=end||(side==='red'?'红方':'黑方')+(inCheck(board,side)?'应将':'行棋');
  $('detail').textContent=end?'本局已结束，可查看棋谱或重新开局。':selected!==null?(legal.length?'点击标记的位置落子':'该棋子暂无合法走法'):'选择己方棋子，查看合法落点';
  $('undo').disabled=history.length===1;$('retry').hidden=true;
  const rows=[];
  for(let n=1;n<history.length;n+=2){
    const row=document.createElement('div');row.className='row';
    for(const text of [String((n+1)/2).padStart(2,'0'),history[n].label,history[n+1]?.label||'—']){
      const span=document.createElement('span');span.textContent=text;row.append(span);
    } rows.push(row);
  }
  if(!rows.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='落子后，棋谱将记录于此';rows.push(empty);}
  $('moves').replaceChildren(...rows);$('moves').scrollTop=$('moves').scrollHeight;
}
function reset(next){
  engine.cancel();mode=next;history=[initial()];selected=null;legal=[];afterChange();
}
function dialog(title,body,action){
  confirmAction=action;$('dialogTitle').textContent=title;$('dialogText').textContent=body;
  $('confirm').hidden=!action;$('dismiss').textContent=action?'取消':'知道了';$('dialog').showModal();
}
function change(next){
  if(history.length>1)dialog('重新开局？','当前棋谱将清空，红方先行。',()=>reset(next));
  else reset(next);
}
$('confirm').onclick=()=>{$('dialog').close();confirmAction?.();};
$('dismiss').onclick=()=>$('dialog').close();
$('help').onclick=()=>dialog('对弈规则','红方先行。点击己方棋子，再点击标记的交叉点即可落子。\n\n车走直线，马走日（蹩马腿时不能走），象走田且不能过河。士和将帅在九宫内活动，双方将帅不能照面。炮隔一子吃子，兵卒过河后可横走。\n\n将死或无棋可走的一方负。三次重复时，单方连续将军判负，否则判和。连续六十回合无吃子判和。\n\n人机模式下你执红先行，皮卡鱼每步最多搜索约 15 秒。');
$('ai').onclick=()=>{if(mode!=='ai')change('ai');};$('local').onclick=()=>{if(mode!=='local')change('local');};
$('restart').onclick=()=>change(mode);
$('undo').onclick=()=>{
  if(history.length<=1)return;
  engine.cancel();history.pop();
  if(mode==='ai' && current().side==='black' && history.length>1)history.pop();
  selected=null;legal=[];afterChange();
};
$('retry').onclick=()=>{engine.cancel();afterChange();};
new ResizeObserver(()=>drawLines($('lines'))).observe($('board'));
render();
