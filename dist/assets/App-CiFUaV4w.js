import{j as e,r as i,L as K}from"./index-D7pXJXkH.js";import{c as p,B as o,P as u,I as N,H as V,T as n}from"./Paper-Cyl37ja4.js";import{F as W}from"./FormControlLabel-CPJ5-c3p.js";import{S as M}from"./Switch-DkkzjR19.js";import{C as U}from"./CompareArrows-DPuNsP-4.js";import{B as I}from"./Button-BJgHq-zh.js";import{C as b}from"./Chip-sxSLqfvX.js";import{T as k}from"./TextField-DuDeyOSB.js";import{S as _}from"./Snackbar-CXSrz_ev.js";import{T as X}from"./Tablet-BYe9dGEW.js";import"./SwitchBase-BJFlT-yl.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";const L=p(e.jsx("path",{d:"M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2zM4 6h16v10H4z"})),j=p(e.jsx("path",{d:"M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3m-2 20h-4v-1h4zm3.25-3H6.75V4h10.5z"})),Y=p(e.jsx("path",{d:"M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02zm-7.31.29C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81z"})),q=p(e.jsx("path",{d:"M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2m0 14H3V5h18z"})),T=[{label:"Mobile S",width:320,icon:e.jsx(j,{sx:{fontSize:14}}),category:"mobile"},{label:"Mobile M",width:375,icon:e.jsx(j,{sx:{fontSize:14}}),category:"mobile"},{label:"Mobile L",width:425,icon:e.jsx(j,{sx:{fontSize:14}}),category:"mobile"},{label:"Tablet",width:768,icon:e.jsx(X,{sx:{fontSize:14}}),category:"tablet"},{label:"Laptop",width:1024,icon:e.jsx(L,{sx:{fontSize:14}}),category:"laptop"},{label:"Laptop L",width:1440,icon:e.jsx(L,{sx:{fontSize:14}}),category:"laptop"},{label:"4K",width:2560,icon:e.jsx(q,{sx:{fontSize:14}}),category:"desktop"}],H=[{name:"sm",min:640},{name:"md",min:768},{name:"lg",min:1024},{name:"xl",min:1280},{name:"2xl",min:1536}],G=`<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: sans-serif; background: #1a1a2e; color: #e0e0e0; padding: 16px; }
  .container { max-width: 100%; }
  h1 { font-size: clamp(1rem, 4vw, 2rem); margin-bottom: 12px; color: #61afef; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }
  .card {
    background: #222;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #333;
  }
  .card h3 { font-size: 14px; margin-bottom: 8px; color: #98c379; }
  .card p { font-size: 12px; color: #888; }
  @media (max-width: 480px) {
    .grid { grid-template-columns: 1fr; }
    h1 { color: #e06c75; }
  }
  @media (min-width: 481px) and (max-width: 768px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
    h1 { color: #e5c07b; }
  }
</style>
</head>
<body>
  <div class="container">
    <h1>Responsive Layout Test</h1>
    <p style="margin-bottom:12px;font-size:13px;color:#666;">Resize to see layout changes. Heading color changes at breakpoints.</p>
    <div class="grid">
      <div class="card"><h3>Card 1</h3><p>Content goes here with some text.</p></div>
      <div class="card"><h3>Card 2</h3><p>Another card with content.</p></div>
      <div class="card"><h3>Card 3</h3><p>Third card layout test.</p></div>
      <div class="card"><h3>Card 4</h3><p>Fourth card for grid.</p></div>
      <div class="card"><h3>Card 5</h3><p>Fifth card appears.</p></div>
      <div class="card"><h3>Card 6</h3><p>Sixth card in grid.</p></div>
    </div>
  </div>
</body>
</html>`;function de(){const[m,B]=i.useState(G),[r,y]=i.useState(375),[d,R]=i.useState(!1),[s,E]=i.useState(!1),[l,D]=i.useState(1024),[v,O]=i.useState(""),[g,F]=i.useState(!1),[f,C]=i.useState({open:!1,message:""}),a=i.useRef(null),A=d?Math.max(r,568):r,z=d?r:void 0,P=d?Math.max(l,568):l,$=t=>{let x="xs";for(const h of H)t>=h.min&&(x=h.name);return x},S=()=>{const t=parseInt(v);t>0&&t<=3840&&(y(t),C({open:!0,message:`Width set to ${t}px`}))},w=(t,x)=>{const h=new Blob([m],{type:"text/html"});return URL.createObjectURL(h),e.jsxs(o,{sx:{display:"flex",flexDirection:"column",alignItems:"center",flex:s?1:void 0,minWidth:0},children:[e.jsxs(o,{sx:{width:Math.min(t,a.current?.clientWidth?s?a.current.clientWidth/2-32:a.current.clientWidth-32:t),height:24,position:"relative",mb:.5},children:[e.jsx(o,{sx:{width:"100%",height:1,bgcolor:"#444",position:"absolute",bottom:0}}),e.jsxs(n,{variant:"caption",sx:{color:"#61afef",position:"absolute",left:"50%",transform:"translateX(-50%)",top:0,fontFamily:"monospace"},children:[t,"px"]})]}),e.jsx(o,{sx:{display:"flex",gap:.5,mb:1},children:H.map(c=>e.jsx(b,{label:c.name,size:"small",sx:{bgcolor:t>=c.min?"#1a3a5c":"#1a1a1a",color:t>=c.min?"#61afef":"grey.700",fontSize:10,height:20,border:$(t)===c.name?"1px solid #61afef":"1px solid transparent"}},c.name))}),e.jsx(o,{sx:{width:Math.min(t,a.current?.clientWidth?s?a.current.clientWidth/2-32:a.current.clientWidth-32:t),height:x||"calc(100vh - 280px)",border:"1px solid #333",borderRadius:1,overflow:"hidden",bgcolor:"#fff"},children:e.jsx("iframe",{srcDoc:m,style:{width:t,height:"100%",border:"none",transform:`scale(${Math.min(1,(a.current?.clientWidth?s?a.current.clientWidth/2-32:a.current.clientWidth-32:t)/t)})`,transformOrigin:"top left"},title:`Preview at ${t}px`,sandbox:"allow-same-origin"})})]})};return e.jsxs(o,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[e.jsx(u,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:e.jsxs(o,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs(o,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(K,{to:"/",children:e.jsx(N,{size:"small",sx:{color:"grey.500"},children:e.jsx(V,{})})}),e.jsx(n,{variant:"h5",sx:{color:"white",fontWeight:600},children:"Responsive Breakpoint Tester"})]}),e.jsxs(o,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(W,{control:e.jsx(M,{checked:d,onChange:t=>R(t.target.checked),size:"small"}),label:e.jsxs(o,{sx:{display:"flex",alignItems:"center",gap:.5},children:[e.jsx(Y,{sx:{fontSize:16}})," ",e.jsx(n,{variant:"caption",children:"Landscape"})]}),sx:{color:"grey.400",mr:1}}),e.jsx(W,{control:e.jsx(M,{checked:s,onChange:t=>E(t.target.checked),size:"small"}),label:e.jsxs(o,{sx:{display:"flex",alignItems:"center",gap:.5},children:[e.jsx(U,{sx:{fontSize:16}})," ",e.jsx(n,{variant:"caption",children:"Compare"})]}),sx:{color:"grey.400",mr:1}}),e.jsx(I,{size:"small",onClick:()=>F(!g),sx:{color:"grey.400"},children:g?"Hide Editor":"Edit HTML"})]})]})}),e.jsx(u,{elevation:0,sx:{bgcolor:"#0d0d0d",borderBottom:"1px solid #222",px:3,py:1.5},children:e.jsxs(o,{sx:{display:"flex",gap:1,alignItems:"center",flexWrap:"wrap"},children:[T.map(t=>e.jsx(b,{icon:t.icon,label:`${t.label} (${t.width}px)`,size:"small",onClick:()=>y(t.width),sx:{bgcolor:r===t.width?"#1a3a5c":"#1a1a1a",color:r===t.width?"#61afef":"grey.400",border:r===t.width?"1px solid #61afef":"1px solid #333","& .MuiChip-icon":{color:"inherit"}}},t.label)),e.jsxs(o,{sx:{display:"flex",alignItems:"center",gap:.5,ml:1},children:[e.jsx(k,{size:"small",placeholder:"Custom px",value:v,onChange:t=>O(t.target.value),onKeyDown:t=>t.key==="Enter"&&S(),sx:{width:100,"& .MuiInputBase-root":{color:"grey.300",height:32,fontSize:13},"& .MuiOutlinedInput-notchedOutline":{borderColor:"#333"}}}),e.jsx(I,{size:"small",onClick:S,sx:{color:"grey.400",minWidth:"auto"},children:"Set"})]}),s&&e.jsxs(o,{sx:{display:"flex",alignItems:"center",gap:.5,ml:2},children:[e.jsx(n,{variant:"caption",sx:{color:"grey.500"},children:"Compare:"}),T.map(t=>e.jsx(b,{label:`${t.width}`,size:"small",onClick:()=>D(t.width),sx:{bgcolor:l===t.width?"#3a1a1a":"#1a1a1a",color:l===t.width?"#e06c75":"grey.500",border:l===t.width?"1px solid #e06c75":"1px solid transparent",fontSize:10,height:22}},`c-${t.label}`))]})]})}),e.jsxs(o,{sx:{display:"flex",gap:2,p:2,height:"calc(100vh - 140px)"},children:[g&&e.jsxs(u,{sx:{width:380,bgcolor:"#111",border:"1px solid #222",p:2,flexShrink:0,display:"flex",flexDirection:"column"},children:[e.jsx(n,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"HTML Content"}),e.jsx(k,{multiline:!0,fullWidth:!0,value:m,onChange:t=>B(t.target.value),sx:{flex:1,"& .MuiInputBase-root":{height:"100%",alignItems:"flex-start",fontFamily:"monospace",fontSize:11,bgcolor:"#0a0a0a",color:"#d4d4d4"},"& .MuiOutlinedInput-notchedOutline":{borderColor:"#333"}}})]}),e.jsxs(o,{ref:a,sx:{flex:1,display:"flex",gap:2,justifyContent:"center",overflow:"auto",minWidth:0},children:[w(A,z?Number(z):void 0),s&&w(P)]})]}),e.jsx(_,{open:f.open,autoHideDuration:2e3,onClose:()=>C({...f,open:!1}),message:f.message})]})}export{de as default};
//# sourceMappingURL=App-CiFUaV4w.js.map
