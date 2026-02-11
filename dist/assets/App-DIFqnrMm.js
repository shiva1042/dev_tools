import{r as n,j as o,L as ee}from"./index-D7pXJXkH.js";import{B as i,I as z,H as oe,T as g,P}from"./Paper-Cyl37ja4.js";import{C as f}from"./Chip-sxSLqfvX.js";import{T as j}from"./TextField-DuDeyOSB.js";import{B as y}from"./Button-BJgHq-zh.js";import{F as se}from"./FormGroup-CXuhKFj_.js";import{F as W}from"./FormControlLabel-CPJ5-c3p.js";import{C as re}from"./Checkbox-BgIpc1EP.js";import{S as ae}from"./Switch-DkkzjR19.js";import{T as le,a as te}from"./Tab-qKNGPrBq.js";import{T as ne}from"./Tooltip-BpGEyTYM.js";import{C as ie}from"./ContentCopy-PE5Vu7Zm.js";import{S as de}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./SwitchBase-BJFlT-yl.js";const ce=["GET","POST","PUT","DELETE","PATCH","OPTIONS","HEAD"],F=["Content-Type","Authorization","X-Requested-With","Accept","Origin","X-Api-Key","Cache-Control","X-CSRF-Token"];function He(){const[r,H]=n.useState(["http://localhost:3000"]),[u,E]=n.useState(""),[x,N]=n.useState(["GET","POST","OPTIONS"]),[t,A]=n.useState(["Content-Type","Authorization"]),[h,_]=n.useState(""),[a,R]=n.useState([]),[C,T]=n.useState(""),[d,G]=n.useState("86400"),[c,B]=n.useState(!1),[b,q]=n.useState(0),[I,M]=n.useState(""),X=n.useCallback(e=>{navigator.clipboard.writeText(e),M("Copied!")},[]),v=()=>{u.trim()&&!r.includes(u.trim())&&(H([...r,u.trim()]),E(""))},k=()=>{h.trim()&&!t.includes(h.trim())&&(A([...t,h.trim()]),_(""))},D=()=>{C.trim()&&!a.includes(C.trim())&&(R([...a,C.trim()]),T(""))},K=e=>N(l=>l.includes(e)?l.filter(p=>p!==e):[...l,e]),U=e=>A(l=>l.includes(e)?l.filter(p=>p!==e):[...l,e]);r.join(", ");const O=x.join(", "),S=t.join(", "),w=a.join(", "),L=n.useMemo(()=>{const e=`# Nginx CORS Configuration
${r.length===1&&r[0]==="*"?"add_header 'Access-Control-Allow-Origin' '*' always;":`# For multiple origins, use map or check $http_origin
set $cors_origin "";
${r.map(s=>`if ($http_origin = "${s}") { set $cors_origin $http_origin; }`).join(`
`)}
add_header 'Access-Control-Allow-Origin' $cors_origin always;`}
add_header 'Access-Control-Allow-Methods' '${O}' always;
add_header 'Access-Control-Allow-Headers' '${S}' always;
${a.length?`add_header 'Access-Control-Expose-Headers' '${w}' always;`:""}
add_header 'Access-Control-Max-Age' ${d} always;
${c?"add_header 'Access-Control-Allow-Credentials' 'true' always;":""}

# Handle preflight
if ($request_method = 'OPTIONS') {
    return 204;
}`,l=`# Apache .htaccess CORS Configuration
<IfModule mod_headers.c>
    ${r.length===1?`Header set Access-Control-Allow-Origin "${r[0]}"`:`SetEnvIf Origin "(${r.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})" CORS_ORIGIN=$0
    Header set Access-Control-Allow-Origin "%{CORS_ORIGIN}e" env=CORS_ORIGIN`}
    Header set Access-Control-Allow-Methods "${O}"
    Header set Access-Control-Allow-Headers "${S}"
    ${a.length?`Header set Access-Control-Expose-Headers "${w}"`:""}
    Header set Access-Control-Max-Age "${d}"
    ${c?'Header set Access-Control-Allow-Credentials "true"':""}
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=204,L]
</IfModule>`,p=`// Express.js CORS Configuration
const cors = require('cors');

const corsOptions = {
  origin: ${r.length===1?`'${r[0]}'`:`[${r.map(s=>`'${s}'`).join(", ")}]`},
  methods: [${x.map(s=>`'${s}'`).join(", ")}],
  allowedHeaders: [${t.map(s=>`'${s}'`).join(", ")}],
  ${a.length?`exposedHeaders: [${a.map(s=>`'${s}'`).join(", ")}],`:""}
  maxAge: ${d},
  credentials: ${c},
};

app.use(cors(corsOptions));`,m=`// Spring Boot CORS Configuration
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(${r.map(s=>`"${s}"`).join(", ")})
            .allowedMethods(${x.map(s=>`"${s}"`).join(", ")})
            .allowedHeaders(${t.map(s=>`"${s}"`).join(", ")})
            ${a.length?`.exposedHeaders(${a.map(s=>`"${s}"`).join(", ")})`:""}
            .maxAge(${d})
            .allowCredentials(${c});
    }
}`,J=`# Flask CORS Configuration
from flask_cors import CORS

CORS(app,
    origins=[${r.map(s=>`"${s}"`).join(", ")}],
    methods=[${x.map(s=>`"${s}"`).join(", ")}],
    allow_headers=[${t.map(s=>`"${s}"`).join(", ")}],
    ${a.length?`expose_headers=[${a.map(s=>`"${s}"`).join(", ")}],`:""}
    max_age=${d},
    supports_credentials=${c?"True":"False"},
)`,V=`# Django CORS Settings (django-cors-headers)
# settings.py

INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
${r.map(s=>`    "${s}",`).join(`
`)}
]

CORS_ALLOW_METHODS = [
${x.map(s=>`    "${s}",`).join(`
`)}
]

CORS_ALLOW_HEADERS = [
${t.map(s=>`    "${s.toLowerCase()}",`).join(`
`)}
]

${a.length?`CORS_EXPOSE_HEADERS = [
${a.map(s=>`    "${s}",`).join(`
`)}
]`:""}
CORS_PREFLIGHT_MAX_AGE = ${d}
CORS_ALLOW_CREDENTIALS = ${c?"True":"False"}`,Y=`{
  "cors": {
    "allowOrigins": [${r.map(s=>`"${s}"`).join(", ")}],
    "allowMethods": [${x.map(s=>`"${s}"`).join(", ")}],
    "allowHeaders": [${t.map(s=>`"${s}"`).join(", ")}],
    ${a.length?`"exposeHeaders": [${a.map(s=>`"${s}"`).join(", ")}],`:""}
    "maxAge": ${d},
    "allowCredentials": ${c}
  }
}`,Z=`// Cloudflare Workers CORS Handler
function handleCORS(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigins = [${r.map(s=>`'${s}'`).join(", ")}];

  const corsHeaders = {
    'Access-Control-Allow-Methods': '${O}',
    'Access-Control-Allow-Headers': '${S}',
    ${a.length?`'Access-Control-Expose-Headers': '${w}',`:""}
    'Access-Control-Max-Age': '${d}',
    ${c?"'Access-Control-Allow-Credentials': 'true',":""}
  };

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    corsHeaders['Access-Control-Allow-Origin'] = ${r.includes("*")?"'*'":"origin"};
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return corsHeaders;
}`;return[e,l,p,m,J,V,Y,Z]},[r,x,t,a,d,c]),Q=["Nginx","Apache","Express.js","Spring Boot","Flask","Django","AWS API GW","Cloudflare"],$={"& .MuiOutlinedInput-root":{"& fieldset":{borderColor:"#333"},"&:hover fieldset":{borderColor:"#555"},"&.Mui-focused fieldset":{borderColor:"#1976d2"}},"& .MuiInputLabel-root":{color:"grey.500"},"& .MuiInputBase-input":{color:"grey.300"}};return o.jsxs(i,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a",color:"grey.300",p:3},children:[o.jsxs(i,{sx:{maxWidth:960,mx:"auto"},children:[o.jsxs(i,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[o.jsx(ee,{to:"/",children:o.jsx(z,{size:"small",sx:{color:"grey.500"},children:o.jsx(oe,{})})}),o.jsx(g,{variant:"h5",sx:{fontWeight:700},children:"CORS Config Builder"})]}),o.jsxs(P,{sx:{bgcolor:"#111",border:"1px solid #222",p:3,mb:3},children:[o.jsx(g,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"Allowed Origins"}),o.jsx(i,{sx:{display:"flex",flexWrap:"wrap",gap:.5,mb:1},children:r.map((e,l)=>o.jsx(f,{label:e,size:"small",onDelete:()=>H(r.filter((p,m)=>m!==l)),sx:{bgcolor:"#1a2332",color:"#90caf9","& .MuiChip-deleteIcon":{color:"#5a8ab5"}}},l))}),o.jsxs(i,{sx:{display:"flex",gap:1,mb:3},children:[o.jsx(j,{size:"small",label:"Origin URL",value:u,onChange:e=>E(e.target.value),onKeyDown:e=>e.key==="Enter"&&v(),sx:{flex:1,...$},placeholder:"https://example.com or *"}),o.jsx(y,{size:"small",variant:"outlined",onClick:v,sx:{borderColor:"#333"},children:"Add"})]}),o.jsx(g,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"Allowed Methods"}),o.jsx(se,{row:!0,sx:{mb:3},children:ce.map(e=>o.jsx(W,{control:o.jsx(re,{checked:x.includes(e),onChange:()=>K(e),size:"small",sx:{color:"grey.600","&.Mui-checked":{color:"#1976d2"}}}),label:o.jsx(g,{variant:"body2",sx:{color:"grey.400"},children:e})},e))}),o.jsx(g,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"Allowed Headers"}),o.jsx(i,{sx:{display:"flex",flexWrap:"wrap",gap:.5,mb:1},children:F.map(e=>o.jsx(f,{label:e,size:"small",onClick:()=>U(e),variant:t.includes(e)?"filled":"outlined",sx:{bgcolor:t.includes(e)?"#1a2332":"transparent",color:t.includes(e)?"#90caf9":"grey.600",borderColor:"#333"}},e))}),o.jsx(i,{sx:{display:"flex",flexWrap:"wrap",gap:.5,mb:1},children:t.filter(e=>!F.includes(e)).map((e,l)=>o.jsx(f,{label:e,size:"small",onDelete:()=>A(t.filter(p=>p!==e)),sx:{bgcolor:"#1a2332",color:"#90caf9","& .MuiChip-deleteIcon":{color:"#5a8ab5"}}},l))}),o.jsxs(i,{sx:{display:"flex",gap:1,mb:3},children:[o.jsx(j,{size:"small",label:"Custom Header",value:h,onChange:e=>_(e.target.value),onKeyDown:e=>e.key==="Enter"&&k(),sx:{flex:1,...$}}),o.jsx(y,{size:"small",variant:"outlined",onClick:k,sx:{borderColor:"#333"},children:"Add"})]}),o.jsx(g,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"Exposed Headers"}),o.jsx(i,{sx:{display:"flex",flexWrap:"wrap",gap:.5,mb:1},children:a.map((e,l)=>o.jsx(f,{label:e,size:"small",onDelete:()=>R(a.filter((p,m)=>m!==l)),sx:{bgcolor:"#1a2332",color:"#90caf9","& .MuiChip-deleteIcon":{color:"#5a8ab5"}}},l))}),o.jsxs(i,{sx:{display:"flex",gap:1,mb:3},children:[o.jsx(j,{size:"small",label:"Exposed Header",value:C,onChange:e=>T(e.target.value),onKeyDown:e=>e.key==="Enter"&&D(),sx:{flex:1,...$}}),o.jsx(y,{size:"small",variant:"outlined",onClick:D,sx:{borderColor:"#333"},children:"Add"})]}),o.jsxs(i,{sx:{display:"flex",gap:2,alignItems:"center",flexWrap:"wrap"},children:[o.jsx(j,{size:"small",label:"Max Age (seconds)",value:d,onChange:e=>G(e.target.value),type:"number",sx:{width:180,...$}}),o.jsx(W,{control:o.jsx(ae,{checked:c,onChange:e=>B(e.target.checked),size:"small"}),label:o.jsx(g,{variant:"body2",sx:{color:"grey.400"},children:"Allow Credentials"})})]})]}),o.jsxs(P,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[o.jsxs(i,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:[o.jsx(le,{value:b,onChange:(e,l)=>q(l),variant:"scrollable",scrollButtons:"auto",sx:{"& .MuiTab-root":{color:"grey.500",fontSize:12,minWidth:80,textTransform:"none"},"& .Mui-selected":{color:"#90caf9"}},children:Q.map(e=>o.jsx(te,{label:e},e))}),o.jsx(ne,{title:"Copy",children:o.jsx(z,{onClick:()=>X(L[b]),sx:{color:"grey.400"},children:o.jsx(ie,{})})})]}),o.jsx(i,{component:"pre",sx:{color:"#81c784",fontFamily:"monospace",fontSize:13,overflow:"auto",maxHeight:500,whiteSpace:"pre-wrap",m:0},children:L[b]})]})]}),o.jsx(de,{open:!!I,autoHideDuration:2e3,onClose:()=>M(""),message:I})]})}export{He as default};
//# sourceMappingURL=App-DIFqnrMm.js.map
