import{r as d,j as e,L as W}from"./index-D7pXJXkH.js";import{B as t,P as p,I as R,H as E,T as i}from"./Paper-Cyl37ja4.js";import{C as q}from"./Chip-sxSLqfvX.js";import{T as b}from"./TextField-DuDeyOSB.js";import{T as v}from"./Tooltip-BpGEyTYM.js";import{T as F,a as I}from"./Tab-qKNGPrBq.js";import{C as D}from"./ContentCopy-PE5Vu7Zm.js";import{S as A}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";const f={"& .MuiInputBase-root":{bgcolor:"#0a0a0a",color:"grey.300",fontFamily:"monospace",fontSize:13},"& .MuiOutlinedInput-notchedOutline":{borderColor:"#333"}};function X(){const[r,_]=d.useState("token_bucket"),[o,C]=d.useState(100),[a,z]=d.useState(200),[n,B]=d.useState(60),[m,M]=d.useState(150),[j,$]=d.useState(0),[T,w]=d.useState(!1),g=d.useMemo(()=>{const s=o,l=a,u=o*n,x=Math.max(0,(m-o)/m*100),c=r==="leaky_bucket"?1e3/o:0,h=a/o;return{tokensPerSec:s,bucketCapacity:l,windowRequests:u,rejectionRate:x,avgLatencyMs:c,burstDurationSec:h}},[o,a,n,m,r]),S=d.useMemo(()=>{const s=[];let l=a;for(let u=0;u<10;u++){const x=m;let c=0;if(r==="token_bucket")l=Math.min(a,l+o),c=Math.min(x,l),l-=c;else if(r==="leaky_bucket")c=Math.min(x,o);else if(r==="fixed_window"||r==="sliding_window"){const h=Math.ceil(o*n/n);c=Math.min(x,h)}s.push({second:u+1,incoming:x,accepted:c,rejected:x-c})}return s},[o,a,m,r,n]),y=d.useMemo(()=>{const s=`# Nginx Rate Limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=${o}r/s;

server {
    location /api/ {
        limit_req zone=api burst=${a} nodelay;
        limit_req_status 429;
    }
}`,l=`// Express Rate Limiting (express-rate-limit)
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: ${n*1e3}, // ${n} seconds
  max: ${o*n}, // ${o*n} requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', limiter);`,u=`// Spring Boot Rate Limiting (Bucket4j)
@Bean
public Bucket createBucket() {
    Bandwidth limit = Bandwidth.classic(
        ${a}, // capacity
        Refill.greedy(${o}, Duration.ofSeconds(1)) // ${o} tokens per second
    );
    return Bucket.builder().addLimit(limit).build();
}

// Usage in filter
if (bucket.tryConsume(1)) {
    filterChain.doFilter(request, response);
} else {
    response.setStatus(429);
}`,x=`-- Redis Sliding Window (Lua Script)
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = ${n}
local limit = ${o*n}

redis.call('ZREMRANGEBYSCORE', key, 0, now - window * 1000)
local count = redis.call('ZCARD', key)

if count < limit then
    redis.call('ZADD', key, now, now .. math.random())
    redis.call('EXPIRE', key, window)
    return 1 -- allowed
else
    return 0 -- rejected
end`,c=`# Kong Rate Limiting Plugin
plugins:
  - name: rate-limiting
    config:
      second: ${o}
      policy: local
      fault_tolerant: true
      hide_client_headers: false
      redis_timeout: 2000`,h=`# Envoy Rate Limiting
rate_limits:
  - actions:
      - remote_address: {}
    stage: 0
    limit:
      requests_per_unit: ${o}
      unit: SECOND`;return[{label:"Nginx",code:s},{label:"Express",code:l},{label:"Spring Boot",code:u},{label:"Redis Lua",code:x},{label:"Kong",code:c},{label:"Envoy",code:h}]},[o,a,n]),L=s=>{navigator.clipboard.writeText(s),w(!0)},k=Math.max(...S.map(s=>s.incoming));return e.jsxs(t,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a",p:3},children:[e.jsx(p,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2,mb:3,borderRadius:2},children:e.jsxs(t,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(W,{to:"/",children:e.jsx(R,{size:"small",sx:{color:"grey.500"},children:e.jsx(E,{})})}),e.jsx(i,{variant:"h5",sx:{color:"white",fontWeight:600},children:"Rate Limit Calculator"})]})}),e.jsxs(t,{sx:{display:"flex",gap:3},children:[e.jsxs(t,{sx:{flex:1},children:[e.jsxs(p,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2,borderRadius:2},children:[e.jsx(i,{variant:"subtitle2",sx:{color:"grey.400",mb:1.5},children:"Algorithm"}),e.jsx(t,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[{value:"token_bucket",label:"Token Bucket",desc:"Allows bursts, steady refill"},{value:"sliding_window",label:"Sliding Window",desc:"Smooth rate across time"},{value:"fixed_window",label:"Fixed Window",desc:"Simple counter per window"},{value:"leaky_bucket",label:"Leaky Bucket",desc:"Constant output rate"}].map(s=>e.jsx(q,{label:s.label,onClick:()=>_(s.value),variant:r===s.value?"filled":"outlined",sx:{bgcolor:r===s.value?"#1976d2":"transparent",color:r===s.value?"white":"grey.400",borderColor:"#333"}},s.value))})]}),e.jsxs(p,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2,borderRadius:2},children:[e.jsx(i,{variant:"subtitle2",sx:{color:"grey.400",mb:1.5},children:"Parameters"}),e.jsxs(t,{sx:{display:"flex",gap:2,flexWrap:"wrap"},children:[e.jsx(b,{size:"small",label:"Requests/sec",type:"number",value:o,onChange:s=>C(Math.max(1,Number(s.target.value))),sx:{...f,width:150}}),(r==="token_bucket"||r==="leaky_bucket")&&e.jsx(b,{size:"small",label:"Burst / Bucket size",type:"number",value:a,onChange:s=>z(Math.max(1,Number(s.target.value))),sx:{...f,width:170}}),(r==="sliding_window"||r==="fixed_window")&&e.jsx(b,{size:"small",label:"Window (sec)",type:"number",value:n,onChange:s=>B(Math.max(1,Number(s.target.value))),sx:{...f,width:150}}),e.jsx(b,{size:"small",label:"Incoming RPS (test)",type:"number",value:m,onChange:s=>M(Math.max(1,Number(s.target.value))),sx:{...f,width:170}})]})]}),e.jsxs(p,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2,borderRadius:2},children:[e.jsx(i,{variant:"subtitle2",sx:{color:"grey.400",mb:1.5},children:"Calculated Values"}),e.jsxs(t,{sx:{display:"flex",gap:3,flexWrap:"wrap"},children:[e.jsxs(t,{children:[e.jsx(i,{sx:{color:"grey.600",fontSize:11},children:"Steady throughput"}),e.jsxs(i,{sx:{color:"#66bb6a",fontFamily:"monospace",fontWeight:700,fontSize:20},children:[o,"/s"]})]}),e.jsxs(t,{children:[e.jsx(i,{sx:{color:"grey.600",fontSize:11},children:"Burst capacity"}),e.jsx(i,{sx:{color:"#42a5f5",fontFamily:"monospace",fontWeight:700,fontSize:20},children:a})]}),e.jsxs(t,{children:[e.jsx(i,{sx:{color:"grey.600",fontSize:11},children:"Window total"}),e.jsx(i,{sx:{color:"#ab47bc",fontFamily:"monospace",fontWeight:700,fontSize:20},children:g.windowRequests})]}),e.jsxs(t,{children:[e.jsx(i,{sx:{color:"grey.600",fontSize:11},children:"Rejection rate"}),e.jsxs(i,{sx:{color:g.rejectionRate>0?"#ef5350":"#66bb6a",fontFamily:"monospace",fontWeight:700,fontSize:20},children:[g.rejectionRate.toFixed(1),"%"]})]}),e.jsxs(t,{children:[e.jsx(i,{sx:{color:"grey.600",fontSize:11},children:"Burst duration"}),e.jsxs(i,{sx:{color:"#ffa726",fontFamily:"monospace",fontWeight:700,fontSize:20},children:[g.burstDurationSec.toFixed(1),"s"]})]})]})]}),e.jsxs(p,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2,borderRadius:2},children:[e.jsx(i,{variant:"subtitle2",sx:{color:"grey.400",mb:1.5},children:"Request Timeline (10 seconds)"}),e.jsx(t,{sx:{display:"flex",gap:.5,alignItems:"flex-end",height:120},children:S.map((s,l)=>e.jsx(v,{title:`Sec ${s.second}: ${s.accepted} accepted, ${s.rejected} rejected`,children:e.jsxs(t,{sx:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:0},children:[e.jsxs(t,{sx:{width:"100%",display:"flex",flexDirection:"column-reverse"},children:[e.jsx(t,{sx:{width:"100%",bgcolor:"#2e7d32",height:`${s.accepted/k*100}px`,borderRadius:"2px 2px 0 0"}}),e.jsx(t,{sx:{width:"100%",bgcolor:"#c62828",height:`${s.rejected/k*100}px`,borderRadius:"2px 2px 0 0"}})]}),e.jsxs(i,{sx:{color:"grey.600",fontSize:10,mt:.5},children:[s.second,"s"]})]})},l))}),e.jsxs(t,{sx:{display:"flex",gap:2,mt:1,justifyContent:"center"},children:[e.jsxs(t,{sx:{display:"flex",alignItems:"center",gap:.5},children:[e.jsx(t,{sx:{width:12,height:12,bgcolor:"#2e7d32",borderRadius:.5}}),e.jsx(i,{sx:{color:"grey.500",fontSize:11},children:"Accepted"})]}),e.jsxs(t,{sx:{display:"flex",alignItems:"center",gap:.5},children:[e.jsx(t,{sx:{width:12,height:12,bgcolor:"#c62828",borderRadius:.5}}),e.jsx(i,{sx:{color:"grey.500",fontSize:11},children:"Rejected"})]})]})]})]}),e.jsxs(p,{sx:{width:480,bgcolor:"#111",border:"1px solid #222",p:0,borderRadius:2,alignSelf:"flex-start"},children:[e.jsx(F,{value:j,onChange:(s,l)=>$(l),variant:"scrollable",scrollButtons:"auto",sx:{borderBottom:"1px solid #222","& .MuiTab-root":{color:"grey.500",textTransform:"none",minHeight:40,fontSize:12},"& .Mui-selected":{color:"#42a5f5"}},children:y.map((s,l)=>e.jsx(I,{label:s.label},l))}),e.jsxs(t,{sx:{p:2},children:[e.jsx(t,{sx:{display:"flex",justifyContent:"flex-end",mb:1},children:e.jsx(v,{title:"Copy config",children:e.jsx(R,{size:"small",onClick:()=>L(y[j].code),sx:{color:"grey.500"},children:e.jsx(D,{fontSize:"small"})})})}),e.jsx(t,{sx:{bgcolor:"#0a0a0a",border:"1px solid #222",borderRadius:1,p:2,maxHeight:500,overflow:"auto"},children:e.jsx(i,{component:"pre",sx:{color:"#98c379",fontFamily:"monospace",fontSize:12,whiteSpace:"pre-wrap",m:0},children:y[j].code})})]})]})]}),e.jsx(A,{open:T,autoHideDuration:2e3,onClose:()=>w(!1),message:"Copied to clipboard"})]})}export{X as default};
//# sourceMappingURL=App-CvttjvyG.js.map
