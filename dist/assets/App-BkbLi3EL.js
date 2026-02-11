import{r,j as e,L as b,C as f}from"./index-D7pXJXkH.js";import{A as y}from"./arrow-left-Cd3U9X7n.js";import{R as j}from"./rotate-ccw-BnADc20T.js";import{M as v}from"./maximize-2-BKZTq2a_.js";const n=[{name:"Blank",html:`<h1>Hello World</h1>
<p>Start coding here...</p>`,css:`body {
  font-family: sans-serif;
  padding: 20px;
  color: #333;
}`,js:""},{name:"Card",html:`<div class="card">
  <h2>Card Title</h2>
  <p>Card content goes here.</p>
  <button>Learn More</button>
</div>`,css:`body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; margin: 0; }
.card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 320px; }
.card h2 { margin-top: 0; color: #333; }
.card button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
.card button:hover { background: #2563eb; }`,js:""},{name:"Form",html:`<form class="form">
  <h2>Contact Us</h2>
  <input type="text" placeholder="Name" />
  <input type="email" placeholder="Email" />
  <textarea placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>`,css:`body { font-family: sans-serif; display: flex; justify-content: center; padding: 40px; background: #1a1a2e; margin: 0; }
.form { background: #16213e; padding: 32px; border-radius: 16px; width: 320px; }
.form h2 { color: white; margin-top: 0; }
.form input, .form textarea { width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #334; background: #0f3460; color: white; border-radius: 8px; box-sizing: border-box; }
.form button { width: 100%; padding: 12px; background: #e94560; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }`,js:""}];function S(){const[i,o]=r.useState(n[0].html),[c,l]=r.useState(n[0].css),[x,d]=r.useState(n[0].js),[t,m]=r.useState("html"),[a,p]=r.useState(!1),h=r.useRef(null),g=`<!DOCTYPE html><html><head><style>${c}</style></head><body>${i}<script>${x}<\/script></body></html>`,u=s=>{o(s.html),l(s.css),d(s.js)};return e.jsx("div",{className:"min-h-screen bg-gray-950 text-white",children:e.jsxs("div",{className:`${a?"fixed inset-0 z-50 bg-gray-950":"max-w-6xl mx-auto"} p-4`,children:[e.jsxs("div",{className:"flex items-center gap-4 mb-4",children:[e.jsx(b,{to:"/",className:"p-2 hover:bg-gray-800 rounded-lg",children:e.jsx(y,{className:"w-5 h-5"})}),e.jsx("div",{children:e.jsxs("h1",{className:"text-xl font-bold flex items-center gap-2",children:[e.jsx(f,{className:"w-5 h-5 text-emerald-400"})," HTML/CSS Playground"]})}),e.jsx("div",{className:"flex-1"}),e.jsxs("div",{className:"flex gap-2",children:[n.map(s=>e.jsx("button",{onClick:()=>u(s),className:"px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs",children:s.name},s.name)),e.jsx("button",{onClick:()=>{o(""),l(""),d("")},className:"px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs",children:e.jsx(j,{className:"w-3 h-3"})}),e.jsx("button",{onClick:()=>p(!a),className:"px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs",children:e.jsx(v,{className:"w-3 h-3"})})]})]}),e.jsxs("div",{className:`grid ${a?"grid-cols-2 h-[calc(100vh-80px)]":"grid-cols-1 lg:grid-cols-2"} gap-4`,children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("div",{className:"flex gap-1",children:["html","css","js"].map(s=>e.jsx("button",{onClick:()=>m(s),className:`px-3 py-1.5 rounded-t text-sm uppercase font-mono ${t===s?"bg-gray-800 text-emerald-400":"bg-gray-900 text-gray-500 hover:text-gray-300"}`,children:s},s))}),t==="html"&&e.jsx("textarea",{value:i,onChange:s=>o(s.target.value),className:"w-full h-[400px] p-4 bg-gray-900 border border-gray-800 rounded-b-xl rounded-tr-xl font-mono text-sm text-orange-300 resize-none focus:outline-none",spellCheck:!1}),t==="css"&&e.jsx("textarea",{value:c,onChange:s=>l(s.target.value),className:"w-full h-[400px] p-4 bg-gray-900 border border-gray-800 rounded-b-xl rounded-tr-xl font-mono text-sm text-blue-300 resize-none focus:outline-none",spellCheck:!1}),t==="js"&&e.jsx("textarea",{value:x,onChange:s=>d(s.target.value),className:"w-full h-[400px] p-4 bg-gray-900 border border-gray-800 rounded-b-xl rounded-tr-xl font-mono text-sm text-yellow-300 resize-none focus:outline-none",spellCheck:!1})]}),e.jsx("div",{className:"bg-white rounded-xl overflow-hidden",style:{minHeight:a?"100%":420},children:e.jsx("iframe",{ref:h,srcDoc:g,className:"w-full h-full border-0",sandbox:"allow-scripts",style:{minHeight:a?"100%":420}})})]})]})})}export{S as default};
//# sourceMappingURL=App-BkbLi3EL.js.map
