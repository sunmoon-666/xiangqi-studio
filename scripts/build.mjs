import {readFile,writeFile,cp,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const hashes={
  'pikafish.js':'17bc398028450c4c56df27812324cca8e5af9e2c86662f4a0d7f5b328270df3a',
  'pikafish.wasm':'b437f89ca16a1ff9181878813d1991f60b22067dca6b3feb79a26033224a83b1',
  'pikafish.nnue':'7d13d73569a9b571ba0eb20cf1596247bc2a42738967e61afef6482b231e900e',
};
const sources=['https://github.com/brianhliou/pikafish-wasm/releases/download/v0.1.0/','https://mistboard.com/engine/pikafish/'];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
await mkdir('dist/engine',{recursive:true});
await cp('public','dist',{recursive:true});
for(const [file,hash] of Object.entries(hashes)){
  const path='dist/engine/'+file;
  const existing=await readFile(path).catch(()=>null);
  if(existing && digest(existing)===hash)continue;
  let ok=false;
  for(const root of sources){
    try{
      const res=await fetch(root+file,{signal:AbortSignal.timeout(90000)});
      if(!res.ok)throw Error('HTTP '+res.status);
      const bytes=Buffer.from(await res.arrayBuffer());
      if(digest(bytes)!==hash)throw Error('SHA-256 mismatch');
      await writeFile(path,bytes);ok=true;break;
    }catch(error){console.warn('Download failed:',file,root,error.message);}
  }
  if(!ok)throw Error('Missing verified engine file: '+file);
}
console.log('Built dist with verified Pikafish v0.1.0 assets.');
