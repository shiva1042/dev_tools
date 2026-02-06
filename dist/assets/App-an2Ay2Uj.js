import{j as o,r as v,L as T}from"./index-BkyuEPT-.js";import{c as x,B as s,P as f,I as g,H as M,T as w}from"./Paper-DfaW9WtE.js";import{T as S,a as k}from"./ToggleButtonGroup-CTS2Me8g.js";import{E as B}from"./Edit-B_oWiFcd.js";import{V as L}from"./Visibility-BzBkIAvC.js";import{D as _}from"./Divider-D8e0OBqr.js";import{T as b}from"./Tooltip-BhxRvP2v.js";import{U as F}from"./Upload-BFaibih6.js";import{D as E}from"./Download-BrcJzUip.js";import{C as V}from"./ContentCopy-Bbf9qDpY.js";import{T as R}from"./TextField-CKUhk3op.js";import{S as D}from"./Snackbar-C3pDCdOy.js";import{C as U}from"./Code-BogC1_8I.js";import{C as q,H as A}from"./HorizontalRule-CqfkTUd0.js";import{L as N}from"./Link-C2lWero-.js";import{I as O}from"./Image-B_esA3BU.js";import{T as W}from"./TableChart-Bz1lWV6-.js";import"./dividerClasses-BchBYyiZ.js";import"./Modal-BG9ZP5_0.js";import"./index-BTYDg4gW.js";const P=x(o.jsx("path",{d:"M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42M10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5"})),J=x(o.jsx("path",{d:"M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"})),Q=x(o.jsx("path",{d:"M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5m0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5m0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5M7 19h14v-2H7zm0-6h14v-2H7zm0-8v2h14V5z"})),Y=x(o.jsx("path",{d:"M2 17h2v.5H3v1h1v.5H2v1h3v-4H2zm1-9h1V4H2v1h1zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2zm5-6v2h14V5zm0 14h14v-2H7zm0-6h14v-2H7z"})),G=x(o.jsx("path",{d:"M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"})),K=x(o.jsx("path",{d:"M5 4v3h5.5v12h3V7H19V4z"})),X=`# Welcome to Markdown Editor

This is a **live preview** markdown editor. You can write markdown on the left and see the rendered output on the right.

## Features

- **Bold** and *italic* text
- [Links](https://example.com)
- Lists (ordered and unordered)
- Code blocks
- Tables
- And more!

### Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

### Table Example

| Name | Age | City |
|------|-----|------|
| John | 30  | NYC  |
| Jane | 25  | LA   |
| Bob  | 35  | SF   |

### Task List

- [x] Create markdown editor
- [x] Add live preview
- [ ] Add more features

> **Note:** This is a blockquote. It's great for highlighting important information.

---

*Happy writing!*
`,Z=i=>{let e=i;return e=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),e=e.replace(/```(\w+)?\n([\s\S]*?)```/g,(n,h,c)=>`<pre class="code-block"><code class="language-${h||"text"}">${c.trim()}</code></pre>`),e=e.replace(/`([^`]+)`/g,'<code class="inline-code">$1</code>'),e=e.replace(/^###### (.+)$/gm,"<h6>$1</h6>"),e=e.replace(/^##### (.+)$/gm,"<h5>$1</h5>"),e=e.replace(/^#### (.+)$/gm,"<h4>$1</h4>"),e=e.replace(/^### (.+)$/gm,"<h3>$1</h3>"),e=e.replace(/^## (.+)$/gm,"<h2>$1</h2>"),e=e.replace(/^# (.+)$/gm,"<h1>$1</h1>"),e=e.replace(/\*\*\*(.+?)\*\*\*/g,"<strong><em>$1</em></strong>"),e=e.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*(.+?)\*/g,"<em>$1</em>"),e=e.replace(/___(.+?)___/g,"<strong><em>$1</em></strong>"),e=e.replace(/__(.+?)__/g,"<strong>$1</strong>"),e=e.replace(/_(.+?)_/g,"<em>$1</em>"),e=e.replace(/~~(.+?)~~/g,"<del>$1</del>"),e=e.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" style="max-width: 100%;">'),e=e.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>'),e=e.replace(/^&gt; (.+)$/gm,"<blockquote>$1</blockquote>"),e=e.replace(/^---$/gm,"<hr>"),e=e.replace(/^\*\*\*$/gm,"<hr>"),e=e.replace(/^- \[x\] (.+)$/gm,'<div class="task"><input type="checkbox" checked disabled> $1</div>'),e=e.replace(/^- \[ \] (.+)$/gm,'<div class="task"><input type="checkbox" disabled> $1</div>'),e=e.replace(/^- (.+)$/gm,"<li>$1</li>"),e=e.replace(/(<li>.*<\/li>\n?)+/g,"<ul>$&</ul>"),e=e.replace(/^\d+\. (.+)$/gm,"<li>$1</li>"),e=e.replace(/^\|(.+)\|$/gm,(n,h)=>{const c=h.split("|").map(p=>p.trim());if(c.every(p=>/^-+$/.test(p)))return"<!-- table separator -->";const u=!e.includes("<!-- table separator -->")||e.lastIndexOf("<table>")>e.lastIndexOf("</table>")?"th":"td";return`<tr>${c.map(p=>`<${u}>${p}</${u}>`).join("")}</tr>`}),e=e.replace(/(<tr>.*<\/tr>\n?)+/g,"<table>$&</table>"),e=e.replace(/<!-- table separator -->\n?/g,""),e=e.replace(/^(?!<[a-z]|$)(.+)$/gm,"<p>$1</p>"),e=e.replace(/\n\n+/g,`
`),e},ee=`
  .preview {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #d4d4d4;
  }
  .preview h1, .preview h2, .preview h3, .preview h4, .preview h5, .preview h6 {
    color: #fff;
    margin: 1.5em 0 0.5em;
    font-weight: 600;
  }
  .preview h1 { font-size: 2em; border-bottom: 1px solid #333; padding-bottom: 0.3em; }
  .preview h2 { font-size: 1.5em; border-bottom: 1px solid #333; padding-bottom: 0.3em; }
  .preview h3 { font-size: 1.25em; }
  .preview p { margin: 1em 0; }
  .preview a { color: #61afef; text-decoration: none; }
  .preview a:hover { text-decoration: underline; }
  .preview code.inline-code {
    background: #2a2a2a;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
    color: #e06c75;
  }
  .preview pre.code-block {
    background: #1a1a1a;
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    border: 1px solid #333;
  }
  .preview pre.code-block code {
    color: #abb2bf;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
  }
  .preview blockquote {
    border-left: 4px solid #61afef;
    margin: 1em 0;
    padding: 0.5em 1em;
    background: #1a1a1a;
    color: #9ca3af;
  }
  .preview ul, .preview ol {
    margin: 1em 0;
    padding-left: 2em;
  }
  .preview li { margin: 0.25em 0; }
  .preview hr {
    border: none;
    border-top: 1px solid #333;
    margin: 2em 0;
  }
  .preview table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }
  .preview th, .preview td {
    border: 1px solid #333;
    padding: 0.5em 1em;
    text-align: left;
  }
  .preview th {
    background: #1a1a1a;
    font-weight: 600;
  }
  .preview .task {
    display: flex;
    align-items: center;
    gap: 0.5em;
    margin: 0.25em 0;
  }
  .preview img {
    max-width: 100%;
    border-radius: 4px;
  }
`;function je(){const[i,e]=v.useState(X),[n,h]=v.useState("split"),[c,j]=v.useState({open:!1,message:""}),u=v.useMemo(()=>Z(i),[i]),l=(t,r="",m="")=>{const a=document.querySelector("textarea");if(!a)return;const d=a.selectionStart,$=a.selectionEnd,y=i.substring(d,$)||m,I=i.substring(0,d)+t+y+r+i.substring($);e(I),setTimeout(()=>{a.focus(),a.setSelectionRange(d+t.length,d+t.length+y.length)},0)},p=async(t,r)=>{await navigator.clipboard.writeText(t),j({open:!0,message:`${r} copied`})},H=(t,r)=>{const m=new Blob([t],{type:"text/plain"}),a=URL.createObjectURL(m),d=document.createElement("a");d.href=a,d.download=r,d.click(),URL.revokeObjectURL(a)},z=t=>{const r=t.target.files?.[0];if(r){const m=new FileReader;m.onload=a=>{e(a.target?.result)},m.readAsText(r)}},C=[{icon:o.jsx(P,{}),action:()=>l("**","**","bold"),tooltip:"Bold"},{icon:o.jsx(J,{}),action:()=>l("*","*","italic"),tooltip:"Italic"},{divider:!0},{icon:o.jsx(K,{}),action:()=>l("## ","","Heading"),tooltip:"Heading"},{icon:o.jsx(G,{}),action:()=>l("> ","","quote"),tooltip:"Quote"},{icon:o.jsx(U,{}),action:()=>l("`","`","code"),tooltip:"Inline Code"},{divider:!0},{icon:o.jsx(Q,{}),action:()=>l("- ","","item"),tooltip:"Bullet List"},{icon:o.jsx(Y,{}),action:()=>l("1. ","","item"),tooltip:"Numbered List"},{icon:o.jsx(q,{}),action:()=>l("- [ ] ","","task"),tooltip:"Task"},{divider:!0},{icon:o.jsx(N,{}),action:()=>l("[","](url)","link text"),tooltip:"Link"},{icon:o.jsx(O,{}),action:()=>l("![","](url)","alt text"),tooltip:"Image"},{icon:o.jsx(W,{}),action:()=>l(`
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`,"",""),tooltip:"Table"},{icon:o.jsx(A,{}),action:()=>l(`
---
`,"",""),tooltip:"Horizontal Rule"}];return o.jsxs(s,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a",display:"flex",flexDirection:"column"},children:[o.jsx(f,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:o.jsxs(s,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[o.jsxs(s,{sx:{display:"flex",alignItems:"center",gap:2},children:[o.jsx(T,{to:"/",children:o.jsx(g,{size:"small",sx:{color:"grey.500"},children:o.jsx(M,{})})}),o.jsx(w,{variant:"h5",sx:{color:"white",fontWeight:600},children:"Markdown Editor"})]}),o.jsx(s,{sx:{display:"flex",alignItems:"center",gap:2},children:o.jsxs(S,{value:n,exclusive:!0,onChange:(t,r)=>r&&h(r),size:"small",children:[o.jsxs(k,{value:"edit",sx:{color:"grey.400"},children:[o.jsx(B,{sx:{fontSize:18,mr:.5}})," Edit"]}),o.jsx(k,{value:"split",sx:{color:"grey.400"},children:"Split"}),o.jsxs(k,{value:"preview",sx:{color:"grey.400"},children:[o.jsx(L,{sx:{fontSize:18,mr:.5}})," Preview"]})]})})]})}),o.jsxs(f,{elevation:0,sx:{bgcolor:"#0d0d0d",borderBottom:"1px solid #222",px:2,py:.5,display:"flex",alignItems:"center",gap:.5},children:[C.map((t,r)=>t.divider?o.jsx(_,{orientation:"vertical",flexItem:!0,sx:{mx:1,borderColor:"#333"}},r):o.jsx(b,{title:t.tooltip||"",children:o.jsx(g,{size:"small",onClick:t.action,sx:{color:"grey.500"},children:t.icon})},r)),o.jsx(s,{sx:{flex:1}}),o.jsx(b,{title:"Upload",children:o.jsxs(g,{size:"small",component:"label",sx:{color:"grey.500"},children:[o.jsx(F,{fontSize:"small"}),o.jsx("input",{type:"file",hidden:!0,accept:".md,.markdown,.txt",onChange:z})]})}),o.jsx(b,{title:"Download Markdown",children:o.jsx(g,{size:"small",onClick:()=>H(i,"document.md"),sx:{color:"grey.500"},children:o.jsx(E,{fontSize:"small"})})}),o.jsx(b,{title:"Copy Markdown",children:o.jsx(g,{size:"small",onClick:()=>p(i,"Markdown"),sx:{color:"grey.500"},children:o.jsx(V,{fontSize:"small"})})})]}),o.jsxs(s,{sx:{flex:1,display:"flex",overflow:"hidden"},children:[(n==="edit"||n==="split")&&o.jsx(s,{sx:{flex:1,p:2,display:"flex",flexDirection:"column"},children:o.jsx(R,{multiline:!0,fullWidth:!0,value:i,onChange:t=>e(t.target.value),placeholder:"Write your markdown here...",sx:{flex:1,"& .MuiInputBase-root":{height:"100%",alignItems:"flex-start",fontFamily:"monospace",fontSize:14,bgcolor:"#111",color:"#d4d4d4",lineHeight:1.6},"& .MuiInputBase-input":{height:"100% !important",overflow:"auto !important"},"& .MuiOutlinedInput-notchedOutline":{borderColor:"#333"}}})}),n==="split"&&o.jsx(s,{sx:{width:1,bgcolor:"#333"}}),(n==="preview"||n==="split")&&o.jsx(s,{sx:{flex:1,p:2,overflow:"auto"},children:o.jsxs(f,{sx:{bgcolor:"#111",border:"1px solid #222",p:3,minHeight:"100%"},children:[o.jsx("style",{children:ee}),o.jsx("div",{className:"preview",dangerouslySetInnerHTML:{__html:u}})]})})]}),o.jsxs(f,{elevation:0,sx:{bgcolor:"#111",borderTop:"1px solid #222",px:3,py:1,display:"flex",gap:3},children:[o.jsxs(w,{variant:"caption",sx:{color:"grey.600"},children:[i.length," characters"]}),o.jsxs(w,{variant:"caption",sx:{color:"grey.600"},children:[i.split(/\s+/).filter(Boolean).length," words"]}),o.jsxs(w,{variant:"caption",sx:{color:"grey.600"},children:[i.split(`
`).length," lines"]})]}),o.jsx(D,{open:c.open,autoHideDuration:2e3,onClose:()=>j({...c,open:!1}),message:c.message})]})}export{je as default};
//# sourceMappingURL=App-an2Ay2Uj.js.map
