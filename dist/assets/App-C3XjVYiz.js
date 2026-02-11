import{r as a,j as e,L as h,s as f,P as j,t as b}from"./index-D7pXJXkH.js";import{A as N}from"./arrow-left-Cd3U9X7n.js";import{T as w}from"./trash-2-BZyXJkI7.js";const g=[{name:"Fibonacci",code:`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}`},{name:"Array Methods",code:`const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('Original:', nums);
console.log('Filter even:', nums.filter(n => n % 2 === 0));
console.log('Map x2:', nums.map(n => n * 2));
console.log('Reduce sum:', nums.reduce((a, b) => a + b, 0));`},{name:"Object Destructuring",code:`const user = { name: 'John', age: 30, city: 'NYC', skills: ['JS', 'React'] };
const { name, age, ...rest } = user;
console.log('Name:', name);
console.log('Age:', age);
console.log('Rest:', rest);`},{name:"Promises",code:`const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('Start');
  await delay(100);
  console.log('After 100ms');
  const results = await Promise.all([1, 2, 3].map(async (n) => {
    await delay(50);
    return n * 10;
  }));
  console.log('Results:', results);
}
main();`}];function k(){const[o,l]=a.useState(g[0].code),[c,i]=a.useState([]),[u,m]=a.useState(!1),[x,d]=a.useState(null),p=a.useCallback(async()=>{i([]),m(!0),d(null);const s=[],r={log:(...t)=>s.push({type:"log",text:t.map(n=>typeof n=="object"?JSON.stringify(n):String(n)).join(" ")}),error:(...t)=>s.push({type:"error",text:t.map(n=>String(n)).join(" ")}),warn:(...t)=>s.push({type:"warn",text:t.map(n=>String(n)).join(" ")}),info:(...t)=>s.push({type:"info",text:t.map(n=>typeof n=="object"?JSON.stringify(n):String(n)).join(" ")})},y=performance.now();try{await new Function("console",`return (async () => { ${o} })()`)(r)}catch(t){s.push({type:"error",text:t instanceof Error?`${t.name}: ${t.message}`:String(t)})}d(Math.round((performance.now()-y)*100)/100),i(s),m(!1)},[o]);return e.jsx("div",{className:"min-h-screen bg-gray-950 text-white",children:e.jsxs("div",{className:"max-w-5xl mx-auto p-6",children:[e.jsxs("div",{className:"flex items-center gap-4 mb-6",children:[e.jsx(h,{to:"/",className:"p-2 hover:bg-gray-800 rounded-lg",children:e.jsx(N,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold flex items-center gap-2",children:[e.jsx(f,{className:"w-6 h-6 text-green-400"})," Code Snippet Runner"]}),e.jsx("p",{className:"text-gray-400 text-sm",children:"Run JavaScript in the browser"})]})]}),e.jsx("div",{className:"flex flex-wrap gap-2 mb-4",children:g.map(s=>e.jsx("button",{onClick:()=>l(s.code),className:"px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300",children:s.name},s.name))}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-gray-400",children:"Code"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("button",{onClick:p,disabled:u,className:"flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm",children:[e.jsx(j,{className:"w-4 h-4"})," Run"]}),e.jsx("button",{onClick:()=>l(""),className:"flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm",children:e.jsx(w,{className:"w-4 h-4"})})]})]}),e.jsx("textarea",{value:o,onChange:s=>l(s.target.value),rows:20,className:"w-full p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-green-500 text-green-300",spellCheck:!1})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-gray-400",children:"Output"}),x!==null&&e.jsxs("span",{className:"text-xs text-gray-500 flex items-center gap-1",children:[e.jsx(b,{className:"w-3 h-3"}),x,"ms"]})]}),e.jsx("div",{className:"p-4 bg-gray-900 border border-gray-800 rounded-xl font-mono text-sm min-h-[480px] max-h-[480px] overflow-y-auto",children:c.length===0?e.jsx("span",{className:"text-gray-600",children:"Click Run to execute code..."}):c.map((s,r)=>e.jsxs("div",{className:`py-0.5 ${s.type==="error"?"text-red-400":s.type==="warn"?"text-yellow-400":"text-gray-300"}`,children:[e.jsx("span",{className:"text-gray-600 mr-2 select-none",children:r+1}),s.text]},r))})]})]})]})})}export{k as default};
//# sourceMappingURL=App-C3XjVYiz.js.map
