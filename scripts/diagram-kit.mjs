/** Native, editable scientific diagrams. No reference images are embedded. */
export function diagramKit(slide, {font='Microsoft YaHei', ink='#233858'}={}) {
  let serial=0;
  const shape=(geometry,name,x,y,w,h,fill='none',stroke=ink,lw=1.5,extra={})=>{
    if(typeof geometry!=='string'||typeof name!=='string'||![x,y,w,h].every(Number.isFinite)||w<0||h<0)
      throw new TypeError(`Invalid shape geometry: ${geometry} / ${name}`);
    return slide.shapes.add({geometry,name:`${name}-${++serial}`,position:{left:x,top:y,width:w,height:h},
      fill,line:{fill:stroke,width:lw,style:'solid'},...extra});
  };
  const text=(name,value,x,y,w,h,size=22,color=ink,bold=false,align='left')=>{
    const s=shape('textbox',name,x,y,w,h,'none','none',0);
    s.text=value;s.text.style={typeface:font,fontSize:size,color,bold,alignment:align,
      verticalAlignment:'middle',insets:0,autoFit:'none',wrap:'none'};
    return s;
  };
  const poly=(name,points,fill='none',stroke=ink,lw=1.5,close=true)=>{
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
    const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x||1,h=Math.max(...ys)-y||1;
    return shape('custom',name,x,y,w,h,fill,stroke,lw,{customPaths:[{width:w,height:h,
      commands:[{moveTo:{x:points[0][0]-x,y:points[0][1]-y}},...points.slice(1).map(p=>({lineTo:{x:p[0]-x,y:p[1]-y}})),...(close?[{close:{}}]:[])]}]});
  };
  const line=(name,x1,y1,x2,y2,color=ink,lw=2,dashed=false)=>{
    const s=poly(name,[[x1,y1],[x2,y2]],'none',color,lw,false);
    if(dashed)s.line={fill:color,width:lw,style:'dashed'};return s;
  };
  const arrow=(name,x1,y1,x2,y2,color=ink,lw=2,head=9,dashed=false)=>{
    line(name,x1,y1,x2,y2,color,lw,dashed);
    const a=Math.atan2(y2-y1,x2-x1), b=.47;
    poly(name+'-head',[[x2,y2],[x2-head*Math.cos(a-b),y2-head*Math.sin(a-b)],
      [x2-head*Math.cos(a+b),y2-head*Math.sin(a+b)]],color,color,.5);
  };
  const ellipse=(name,x,y,w,h,fill,stroke=ink,lw=1.5)=>shape('ellipse',name,x,y,w,h,fill,stroke,lw);
  const panel=(name,title,x,y,w,h,tint)=>{
    shape('roundRect',name+'-frame',x,y,w,h,'#FFFFFF',ink,1.8,{borderRadius:16});
    shape('rect',name+'-title-fill',x+1,y+1,w-2,43,tint,'none',0);
    line(name+'-title-rule',x,y+44,x+w,y+44,ink,1.4);
    text(name+'-title',title,x+18,y+5,w-36,32,24,ink,true);
  };
  const slab=(name,x,y,w,h,fill,label='',depth=13)=>{
    const d=depth;
    poly(name+'-top',[[x,y],[x+d,y-d],[x+w+d,y-d],[x+w,y]],fill,ink,1.1);
    poly(name+'-side',[[x+w,y],[x+w+d,y-d],[x+w+d,y+h-d],[x+w,y+h]],fill,ink,1.1);
    shape('rect',name+'-front',x,y,w,h,fill,ink,1.2);
    if(label)text(name+'-label',label,x+8,y+2,w-16,h-4,19,ink,true,'center');
  };
  return {shape,text,poly,line,arrow,ellipse,panel,slab};
}
