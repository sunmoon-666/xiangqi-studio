// The canvas and interactive grid share the same half-cell inset.
export function drawLines(canvas) {
  const {width:w,height:h}=canvas.getBoundingClientRect();
  const dpr=devicePixelRatio||1;
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  const c=canvas.getContext('2d');c.scale(dpr,dpr);
  const pad=w*.018,dx=(w-2*pad)/9,dy=(h-2*pad)/10;
  const x=i=>pad+(i+.5)*dx,y=i=>pad+(i+.5)*dy;
  function line(x1,y1,x2,y2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
  c.strokeStyle='#83613f';c.lineWidth=Math.max(1,w/480);
  for(let j=0;j<10;j++)line(x(0),y(j),x(8),y(j));
  for(let i=0;i<9;i++){
    line(x(i),y(0),x(i),y(4));line(x(i),y(5),x(i),y(9));
    if(i===0||i===8)line(x(i),y(4),x(i),y(5));
  }
  for(const j of [0,7]){line(x(3),y(j),x(5),y(j+2));line(x(5),y(j),x(3),y(j+2));}
  c.strokeRect(x(0)-3,y(0)-3,x(8)-x(0)+6,y(9)-y(0)+6);
  for(const j of [2,3,6,7]){
    const files=j===2||j===7?[1,7]:[0,2,4,6,8];
    for(const i of files)for(const a of [-1,1])for(const b of [-1,1]){
      if((i===0 && a<0)||(i===8 && a>0))continue;
      const cx=x(i)+a*dx*.08,cy=y(j)+b*dy*.08;
      line(cx,cy,cx+a*dx*.12,cy);line(cx,cy,cx,cy+b*dy*.12);
    }
  }
  c.fillStyle='#7f5b37';c.textAlign='center';c.textBaseline='middle';
  c.font='500 '+(dx*.50)+'px KaiTi,STKaiti,SimSun,serif';
  c.fillText('楚 河',x(2),y(4.5));c.fillText('漢 界',x(6),y(4.5));
}
