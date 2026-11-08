export const START = [
  'rnbakabnr','.........','.c.....c.','p.p.p.p.p','.........',
  '.........','P.P.P.P.P','.C.....C.','.........','RNBAKABNR',
].join('');
export const sideOf = p => p === '.' ? null : p === p.toUpperCase() ? 'red' : 'black';
export const opposite = side => side === 'red' ? 'black' : 'red';
export const symbol = {K:'帥',A:'仕',B:'相',N:'馬',R:'車',C:'炮',P:'兵',k:'將',a:'士',b:'象',n:'馬',r:'車',c:'砲',p:'卒'};
export function square(i) { return 'abcdefghi'[i%9] + (9-Math.floor(i/9)); }
export function indexOfSquare(s) {return (9-Number(s[1]))*9 + 'abcdefghi'.indexOf(s[0]);}
const row = i => Math.floor(i/9);
function reaches(board, from, to) {
  if (from === to || board[from] === '.') return false;
  const x=from%9, y=row(from), tx=to%9, ty=row(to);
  const dx=tx-x, dy=ty-y, ax=Math.abs(dx), ay=Math.abs(dy);
  const red=sideOf(board[from])==='red';
  const palace=tx>=3 && tx<=5 && (red ? ty>=7 : ty<=2);
  switch(board[from].toUpperCase()) {
    case 'P': return (dx===0 && dy===(red?-1:1)) || (dy===0 && ax===1 && (red?y<=4:y>=5));
    case 'A': return palace && ax===1 && ay===1;
    case 'B': return ax===2 && ay===2 && (red ? ty>=5 : ty<=4) && board[(from+to)/2]==='.';
    case 'N':
      if(ax===2 && ay===1) return board[from+Math.sign(dx)]==='.';
      return ax===1 && ay===2 && board[from+9*Math.sign(dy)]==='.';
    case 'K':
      if(palace && ax+ay===1) return true;
      if(dx!==0 || board[to].toUpperCase()!=='K') return false;
      break;
    case 'R': case 'C': break;
    default: return false;
  }
  if(ax && ay) return false;
  const step=dx ? Math.sign(dx) : 9*Math.sign(dy);
  let screens=0;
  for(let i=from+step;i!==to;i+=step) if(board[i]!=='.') screens++;
  return screens===(board[from].toUpperCase()==='C' && board[to]!=='.' ? 1 : 0);
}
export function inCheck(board, side) {
  const king=board.indexOf(side==='red'?'K':'k');
  if(king===-1) return true;
  for(let i=0;i<90;i++) if(sideOf(board[i])===opposite(side) && reaches(board,i,king)) return true;
  return false;
}
export function move(board,from,to) {
  const next=[...board]; next[to]=next[from]; next[from]='.'; return next.join('');
}
export function legalTargets(board,from) {
  const side=sideOf(board[from]);
  if(!side) return [];
  const result=[];
  for(let to=0;to<90;to++) {
    if(sideOf(board[to])===side || board[to].toUpperCase()==='K' || !reaches(board,from,to)) continue;
    if(!inCheck(move(board,from,to),side)) result.push(to);
  }
  return result;
}
export function result(board,side,history) {
  const movable=[...board].some((p,i)=>sideOf(p)===side && legalTargets(board,i).length);
  if(!movable) return (side==='red'?'黑':'红')+'方胜 · '+(inCheck(board,side)?'将死':'困毙');
  const repeats=[];
  for(let n=0;n<history.length;n++) if(history[n].board===board && history[n].side===side) repeats.push(n);
  if(repeats.length>=3) {
    const cycle=history.slice(repeats.at(-3)+1);
    const checkers=['red','black'].filter(color=>cycle.filter(h=>h.side===opposite(color)).every(h=>inCheck(h.board,h.side)));
    if(checkers.length===1) return (checkers[0]==='red'?'黑':'红')+'方胜 · 对手长将';
    return '和棋 · 三次重复';
  }
  if(history.length>120 && history.slice(-120).every(h=>h.capture===false)) return '和棋 · 六十回合无吃子';
  return '';
}
export function notation(board,from,to) {
  const piece=board[from],red=sideOf(piece)==='red';
  const digits=red?'一二三四五六七八九':'１２３４５６７８９';
  const file=i=>digits[red ? 8-i%9 : i%9];
  const dy=row(to)-row(from);
  const sameFile=[...board].map((p,i)=>p===piece && i%9===from%9?i:null).filter(i=>i!==null).sort((a,b)=>red?a-b:b-a);
  let name=symbol[piece]+file(from);
  if(sameFile.length>1) {
    const rank=sameFile.indexOf(from);
    const prefix=rank===0?'前':rank===sameFile.length-1?'后':sameFile.length===3?'中':digits[rank];
    name=prefix+symbol[piece];
  }
  const action=dy===0?'平':(red?dy<0:dy>0)?'进':'退';
  const target=dy===0 || 'NBA'.includes(piece.toUpperCase())?file(to):digits[Math.abs(dy)-1];
  return name+action+target;
}
