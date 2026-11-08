export class Pikafish {
  worker=null;
  state='idle';
  timer=null;
  constructor(update,onMove){this.update=update;this.onMove=onMove;}
  cancel(){
    clearTimeout(this.timer);
    this.worker?.terminate();
    this.worker=null; this.state='idle';
  }
  fail(message){
    this.cancel();this.state='failed';this.update(message);
  }
  watch(ms,message){clearTimeout(this.timer);this.timer=setTimeout(()=>this.fail(message),ms);}
  command(command){this.worker.postMessage({type:'command',command});}
  play(history){
    this.history=history;
    if(this.state==='ready'){this.search();return;}
    if(!crossOriginIsolated || typeof SharedArrayBuffer==='undefined'){
      this.fail('当前浏览器未启用多线程支持，请用新版 Chrome、Edge 或 Safari 打开。');return;
    }
    if(this.worker)return;
    this.state='loading';this.update('正在加载皮卡鱼神经网络…');
    this.watch(120000,'引擎加载超时，请检查网络后重试。');
    try{
      const worker=new Worker('/engine/worker.js');this.worker=worker;
      worker.onmessage=({data})=>{if(worker===this.worker)this.receive(data);};
      worker.onerror=()=>{if(worker===this.worker)this.fail('引擎启动失败，请重试。');};
      const base=location.origin+'/engine/';
      worker.postMessage({type:'init',jsUrl:base+'pikafish.js',wasmUrl:base+'pikafish.wasm',netUrl:base+'pikafish.nnue'});
    }catch{this.fail('浏览器无法启动象棋引擎，请重试。');}
  }
  receive(m){
    if(m.type==='error'){this.fail('无法加载皮卡鱼引擎，请重试。');return;}
    if(m.type==='net-progress'){
      this.update('正在加载神经网络 · '+Math.min(100,Math.round(100*m.loaded/50706378))+'%');return;
    }
    if(m.type==='ready'){this.command('uci');return;}
    if(m.type!=='line')return;
    if(m.line==='uciok'){
      this.command('setoption name Threads value '+Math.min(8,navigator.hardwareConcurrency||1));
      this.command('setoption name Hash value 64');this.command('isready');
    }else if(m.line==='readyok'){this.state='ready';this.search();}
    else if(m.line.startsWith('info depth ')){
      const depth=m.line.match(/\bdepth (\d+)/)?.[1];
      if(depth)this.update('全力搜索中 · 深度 '+depth+' 层');
    }else if(m.line.startsWith('bestmove ') && this.state==='thinking'){
      clearTimeout(this.timer);this.state='ready';this.onMove(m.line.split(' ')[1]);
    }
  }
  search(){
    this.state='thinking';this.update('全力搜索中 · 每步 15 秒');
    this.watch(55000,'搜索未完成，请重试。');
    this.command('position startpos moves '+this.history.join(' '));
    this.command('go movetime 15000');
  }
}
