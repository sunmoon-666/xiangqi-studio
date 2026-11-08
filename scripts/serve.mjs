import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
const types={'.js':'application/javascript','.mjs':'application/javascript','.wasm':'application/wasm','.css':'text/css','.html':'text/html; charset=utf-8'};
const root=resolve('dist'),port=Number(process.env.PORT||4186);
http.createServer(async(req,res)=>{
  try{
    const route=new URL(req.url,'http://localhost').pathname;
    const file=resolve(root,'.'+(route==='/'?'/index.html':decodeURIComponent(route)));
    if(!file.startsWith(root+sep))throw Error();
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':data.length,
      'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp'});res.end(data);
  }catch{res.writeHead(404);res.end();}
}).listen(port,'127.0.0.1',()=>console.log('http://127.0.0.1:'+port));
