import{r as f,j as e,L as T}from"./index-D7pXJXkH.js";import{B as t,P as j,I as p,H as E,T as n}from"./Paper-Cyl37ja4.js";import{T as S}from"./Tooltip-BpGEyTYM.js";import{D as M}from"./Download-BKYGKf7U.js";import{C as F}from"./ContentCopy-PE5Vu7Zm.js";import{B as w}from"./Button-BJgHq-zh.js";import{A as z}from"./Add-CL53DhVf.js";import{A as R,a as D,b as G}from"./AccordionDetails-aaCjmipr.js";import{C as $}from"./Chip-sxSLqfvX.js";import{D as k}from"./Delete-ChrOPmnB.js";import{E as N}from"./ExpandMore-CbnAiKk0.js";import{T as l,F as O,I as U,S as H}from"./TextField-DuDeyOSB.js";import{F as b}from"./FormControlLabel-CPJ5-c3p.js";import{S as _}from"./Switch-DkkzjR19.js";import{M as m}from"./MenuItem-C1kwkJyb.js";import{S as X}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./SwitchBase-BJFlT-yl.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";function me(){const[r,c]=f.useState([{id:"1",listen:80,serverName:"example.com",ssl:!1,root:"/var/www/html",index:"index.html index.htm",locations:[{id:"1",path:"/",type:"static",tryFiles:"$uri $uri/ /index.html"},{id:"2",path:"/api",type:"proxy",proxyPass:"http://localhost:3000"}],enableGzip:!0,enableCors:!1}]),[g,C]=f.useState({open:!1,message:""}),y=f.useMemo(()=>{let s="";return s+=`# Generated Nginx Configuration

worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;

`,r.forEach(o=>{o.enableGzip&&(s+=`    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;

`),s+=`    server {
        listen ${o.listen}${o.ssl?" ssl http2":""};
        server_name ${o.serverName};

`,o.ssl&&(s+=`        ssl_certificate ${o.sslCert||"/etc/nginx/ssl/cert.pem"};
        ssl_certificate_key ${o.sslKey||"/etc/nginx/ssl/key.pem"};
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

`),o.root&&(s+=`        root ${o.root};
`),o.index&&(s+=`        index ${o.index};
`),o.enableCors&&(s+=`
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

`),s+=`
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

`,o.errorPage404&&(s+=`        error_page 404 ${o.errorPage404};
`),o.locations.forEach(a=>{switch(s+=`
        location ${a.path} {
`,a.type){case"static":a.tryFiles&&(s+=`            try_files ${a.tryFiles};
`);break;case"proxy":s+=`            proxy_pass ${a.proxyPass};
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
`;break;case"redirect":s+=`            return 301 ${a.redirectUrl};
`;break;case"return":s+=`            return ${a.returnCode||200}${a.returnBody?` '${a.returnBody}'`:""};
`;break}s+=`        }
`}),s+=`    }

`}),s+=`}
`,s},[r]),I=async()=>{await navigator.clipboard.writeText(y),C({open:!0,message:"Copied to clipboard"})},A=()=>{const s=new Blob([y],{type:"text/plain"}),o=URL.createObjectURL(s),a=document.createElement("a");a.href=o,a.download="nginx.conf",a.click(),URL.revokeObjectURL(o)},L=()=>{c([...r,{id:String(Date.now()),listen:80,serverName:"localhost",ssl:!1,root:"/var/www/html",index:"index.html",locations:[],enableGzip:!0,enableCors:!1}])},v=s=>c(r.filter(o=>o.id!==s)),i=(s,o,a)=>{c(r.map(d=>d.id===s?{...d,[o]:a}:d))},B=s=>{c(r.map(o=>o.id===s?{...o,locations:[...o.locations,{id:String(Date.now()),path:"/new",type:"static"}]}:o))},P=(s,o)=>{c(r.map(a=>a.id===s?{...a,locations:a.locations.filter(d=>d.id!==o)}:a))},x=(s,o,a,d)=>{c(r.map(h=>h.id===s?{...h,locations:h.locations.map(u=>u.id===o?{...u,[a]:d}:u)}:h))};return e.jsxs(t,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[e.jsx(j,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:e.jsxs(t,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs(t,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(T,{to:"/",children:e.jsx(p,{size:"small",sx:{color:"grey.500"},children:e.jsx(E,{})})}),e.jsx(n,{variant:"h5",sx:{color:"white",fontWeight:600},children:"Nginx Config Generator"})]}),e.jsxs(t,{sx:{display:"flex",gap:1},children:[e.jsx(S,{title:"Download",children:e.jsx(p,{onClick:A,sx:{color:"grey.500"},children:e.jsx(M,{})})}),e.jsx(S,{title:"Copy",children:e.jsx(p,{onClick:I,sx:{color:"grey.500"},children:e.jsx(F,{})})})]})]})}),e.jsxs(t,{sx:{display:"flex",height:"calc(100vh - 70px)"},children:[e.jsxs(t,{sx:{flex:1,p:2,overflow:"auto"},children:[e.jsx(t,{sx:{display:"flex",justifyContent:"flex-end",mb:2},children:e.jsx(w,{startIcon:e.jsx(z,{}),onClick:L,sx:{color:"grey.400"},children:"Add Server Block"})}),r.map(s=>e.jsxs(R,{defaultExpanded:!0,sx:{bgcolor:"#111",border:"1px solid #222",mb:2,"&:before":{display:"none"}},children:[e.jsx(D,{expandIcon:e.jsx(N,{sx:{color:"grey.500"}}),children:e.jsxs(t,{sx:{display:"flex",alignItems:"center",gap:2,width:"100%"},children:[e.jsx(n,{sx:{color:"grey.300"},children:s.serverName}),e.jsx($,{label:`Port ${s.listen}`,size:"small"}),s.ssl&&e.jsx($,{label:"SSL",size:"small",color:"success"}),e.jsx(t,{sx:{flex:1}}),e.jsx(p,{size:"small",onClick:o=>{o.stopPropagation(),v(s.id)},sx:{color:"grey.500"},children:e.jsx(k,{fontSize:"small"})})]})}),e.jsxs(G,{children:[e.jsxs(t,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(l,{size:"small",label:"Server Name",value:s.serverName,onChange:o=>i(s.id,"serverName",o.target.value),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(l,{size:"small",label:"Port",type:"number",value:s.listen,onChange:o=>i(s.id,"listen",parseInt(o.target.value)||80),sx:{width:100,"& .MuiInputBase-root":{color:"grey.300"}}})]}),e.jsxs(t,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(l,{size:"small",label:"Root",value:s.root||"",onChange:o=>i(s.id,"root",o.target.value),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(l,{size:"small",label:"Index",value:s.index||"",onChange:o=>i(s.id,"index",o.target.value),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}})]}),e.jsxs(t,{sx:{display:"flex",gap:3,mb:2},children:[e.jsx(b,{control:e.jsx(_,{checked:s.ssl,onChange:o=>i(s.id,"ssl",o.target.checked),size:"small"}),label:e.jsx(n,{sx:{color:"grey.400",fontSize:14},children:"SSL/TLS"})}),e.jsx(b,{control:e.jsx(_,{checked:s.enableGzip,onChange:o=>i(s.id,"enableGzip",o.target.checked),size:"small"}),label:e.jsx(n,{sx:{color:"grey.400",fontSize:14},children:"Gzip"})}),e.jsx(b,{control:e.jsx(_,{checked:s.enableCors,onChange:o=>i(s.id,"enableCors",o.target.checked),size:"small"}),label:e.jsx(n,{sx:{color:"grey.400",fontSize:14},children:"CORS"})})]}),s.ssl&&e.jsxs(t,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(l,{size:"small",label:"SSL Certificate",value:s.sslCert||"",onChange:o=>i(s.id,"sslCert",o.target.value),placeholder:"/etc/nginx/ssl/cert.pem",sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(l,{size:"small",label:"SSL Key",value:s.sslKey||"",onChange:o=>i(s.id,"sslKey",o.target.value),placeholder:"/etc/nginx/ssl/key.pem",sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}})]}),e.jsx(n,{variant:"subtitle2",sx:{color:"grey.400",mt:2,mb:1},children:"Locations"}),s.locations.map(o=>e.jsx(j,{sx:{bgcolor:"#0a0a0a",border:"1px solid #333",p:2,mb:1},children:e.jsxs(t,{sx:{display:"flex",gap:2,mb:1},children:[e.jsx(l,{size:"small",label:"Path",value:o.path,onChange:a=>x(s.id,o.id,"path",a.target.value),sx:{width:150,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsxs(O,{size:"small",sx:{width:130},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Type"}),e.jsxs(H,{value:o.type,label:"Type",onChange:a=>x(s.id,o.id,"type",a.target.value),sx:{color:"grey.300"},children:[e.jsx(m,{value:"static",children:"Static Files"}),e.jsx(m,{value:"proxy",children:"Proxy Pass"}),e.jsx(m,{value:"redirect",children:"Redirect"}),e.jsx(m,{value:"return",children:"Return"})]})]}),o.type==="static"&&e.jsx(l,{size:"small",label:"Try Files",value:o.tryFiles||"",onChange:a=>x(s.id,o.id,"tryFiles",a.target.value),placeholder:"$uri $uri/ /index.html",sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),o.type==="proxy"&&e.jsx(l,{size:"small",label:"Proxy Pass",value:o.proxyPass||"",onChange:a=>x(s.id,o.id,"proxyPass",a.target.value),placeholder:"http://localhost:3000",sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),o.type==="redirect"&&e.jsx(l,{size:"small",label:"Redirect URL",value:o.redirectUrl||"",onChange:a=>x(s.id,o.id,"redirectUrl",a.target.value),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(p,{size:"small",onClick:()=>P(s.id,o.id),sx:{color:"grey.500"},children:e.jsx(k,{fontSize:"small"})})]})},o.id)),e.jsx(w,{size:"small",startIcon:e.jsx(z,{}),onClick:()=>B(s.id),sx:{color:"grey.500"},children:"Add Location"})]})]},s.id))]}),e.jsxs(t,{sx:{width:500,borderLeft:"1px solid #222",display:"flex",flexDirection:"column"},children:[e.jsx(t,{sx:{p:2,borderBottom:"1px solid #222"},children:e.jsx(n,{variant:"subtitle2",sx:{color:"grey.400"},children:"nginx.conf"})}),e.jsx(t,{sx:{flex:1,p:2,overflow:"auto"},children:e.jsx(j,{sx:{bgcolor:"#0a0a0a",p:2,border:"1px solid #333",height:"100%"},children:e.jsx(n,{component:"pre",sx:{fontFamily:"monospace",fontSize:11,color:"#d4d4d4",m:0,whiteSpace:"pre-wrap"},children:y})})})]})]}),e.jsx(X,{open:g.open,autoHideDuration:2e3,onClose:()=>C({...g,open:!1}),message:g.message})]})}export{me as default};
//# sourceMappingURL=App-CKToWVVa.js.map
