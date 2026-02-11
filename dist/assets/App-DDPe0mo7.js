import{r as f,j as a,L as ee}from"./index-D7pXJXkH.js";import{B as m,I as $,H as ae,T as h,P as A}from"./Paper-Cyl37ja4.js";import{T as c,F as v,I as T,S as k}from"./TextField-DuDeyOSB.js";import{A as L,a as I,b as Q}from"./AccordionDetails-aaCjmipr.js";import{E as M}from"./ExpandMore-CbnAiKk0.js";import{M as y}from"./MenuItem-C1kwkJyb.js";import{F as z}from"./FormControlLabel-CPJ5-c3p.js";import{S as w}from"./Switch-DkkzjR19.js";import{D as W}from"./Delete-ChrOPmnB.js";import{B as F}from"./Button-BJgHq-zh.js";import{A as K}from"./Add-CL53DhVf.js";import{T as te,a as se}from"./Tab-qKNGPrBq.js";import{T as ne}from"./Tooltip-BpGEyTYM.js";import{C as le}from"./ContentCopy-PE5Vu7Zm.js";import{S as re}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";import"./SwitchBase-BJFlT-yl.js";function we(){const[d,_]=f.useState([{name:"my.exchange",type:"topic",durable:!0,autoDelete:!1},{name:"my.dlx",type:"fanout",durable:!0,autoDelete:!1}]),[p,E]=f.useState([{name:"my.queue",durable:!0,exclusive:!1,autoDelete:!1,ttl:"86400000",maxLength:"",dlx:"my.dlx",dlrk:"dead-letter",queueType:"classic"},{name:"my.dlq",durable:!0,exclusive:!1,autoDelete:!1,ttl:"",maxLength:"10000",dlx:"",dlrk:"",queueType:"classic"}]),[g,S]=f.useState([{source:"my.exchange",destination:"my.queue",destType:"queue",routingKey:"events.#"},{source:"my.dlx",destination:"my.dlq",destType:"queue",routingKey:""}]),[r,j]=f.useState({host:"localhost",port:"5672",vhost:"/",user:"guest",pass:"guest"}),[B,N]=f.useState(0),[P,R]=f.useState(""),U=f.useCallback(s=>{navigator.clipboard.writeText(s),R("Copied!")},[]),O=()=>_(s=>[...s,{name:"",type:"direct",durable:!0,autoDelete:!1}]),Z=()=>E(s=>[...s,{name:"",durable:!0,exclusive:!1,autoDelete:!1,ttl:"",maxLength:"",dlx:"",dlrk:"",queueType:"classic"}]),J=()=>S(s=>[...s,{source:"",destination:"",destType:"queue",routingKey:""}]),C=(s,l)=>_(t=>t.map((i,u)=>u===s?{...i,...l}:i)),b=(s,l)=>E(t=>t.map((i,u)=>u===s?{...i,...l}:i)),D=(s,l)=>S(t=>t.map((i,u)=>u===s?{...i,...l}:i)),o={"& .MuiOutlinedInput-root":{"& fieldset":{borderColor:"#333"},"&:hover fieldset":{borderColor:"#555"},"&.Mui-focused fieldset":{borderColor:"#1976d2"}},"& .MuiInputLabel-root":{color:"grey.500"},"& .MuiInputBase-input":{color:"grey.300"},"& .MuiSelect-icon":{color:"grey.500"}},H=f.useMemo(()=>{const s=`amqp://${r.user}:${r.pass}@${r.host}:${r.port}${r.vhost==="/"?"":"/"+r.vhost}`,l=`#!/bin/bash
# rabbitmqadmin commands
${d.filter(e=>e.name).map(e=>`rabbitmqadmin declare exchange name=${e.name} type=${e.type} durable=${e.durable} auto_delete=${e.autoDelete}`).join(`
`)}

${p.filter(e=>e.name).map(e=>{const n=[];return e.ttl&&n.push(`x-message-ttl=${e.ttl}`),e.maxLength&&n.push(`x-max-length=${e.maxLength}`),e.dlx&&n.push(`x-dead-letter-exchange=${e.dlx}`),e.dlrk&&n.push(`x-dead-letter-routing-key=${e.dlrk}`),e.queueType!=="classic"&&n.push(`x-queue-type=${e.queueType}`),`rabbitmqadmin declare queue name=${e.name} durable=${e.durable} auto_delete=${e.autoDelete}${n.length?` arguments='{"`+n.map(x=>{const[Y,q]=x.split("=");return`"${Y}":"${q}"`}).join(",")+"}'":""}`}).join(`
`)}

${g.filter(e=>e.source&&e.destination).map(e=>`rabbitmqadmin declare binding source=${e.source} destination=${e.destination} destination_type=${e.destType} routing_key="${e.routingKey}"`).join(`
`)}`,t=`# Python (pika) Configuration
import pika

credentials = pika.PlainCredentials('${r.user}', '${r.pass}')
parameters = pika.ConnectionParameters(
    host='${r.host}', port=${r.port},
    virtual_host='${r.vhost}', credentials=credentials,
)
connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Declare Exchanges
${d.filter(e=>e.name).map(e=>`channel.exchange_declare(exchange='${e.name}', exchange_type='${e.type}', durable=${e.durable?"True":"False"}, auto_delete=${e.autoDelete?"True":"False"})`).join(`
`)}

# Declare Queues
${p.filter(e=>e.name).map(e=>{const n=[];return e.ttl&&n.push(`'x-message-ttl': ${e.ttl}`),e.maxLength&&n.push(`'x-max-length': ${e.maxLength}`),e.dlx&&n.push(`'x-dead-letter-exchange': '${e.dlx}'`),e.dlrk&&n.push(`'x-dead-letter-routing-key': '${e.dlrk}'`),e.queueType!=="classic"&&n.push(`'x-queue-type': '${e.queueType}'`),`channel.queue_declare(queue='${e.name}', durable=${e.durable?"True":"False"}, exclusive=${e.exclusive?"True":"False"}, auto_delete=${e.autoDelete?"True":"False"}${n.length?`, arguments={${n.join(", ")}}`:""})`}).join(`
`)}

# Create Bindings
${g.filter(e=>e.source&&e.destination).map(e=>e.destType==="queue"?`channel.queue_bind(queue='${e.destination}', exchange='${e.source}', routing_key='${e.routingKey}')`:`channel.exchange_bind(destination='${e.destination}', source='${e.source}', routing_key='${e.routingKey}')`).join(`
`)}`,i=`// Node.js (amqplib) Configuration
const amqplib = require('amqplib');

async function setup() {
  const conn = await amqplib.connect('${s}');
  const ch = await conn.createChannel();

  // Exchanges
${d.filter(e=>e.name).map(e=>`  await ch.assertExchange('${e.name}', '${e.type}', { durable: ${e.durable}, autoDelete: ${e.autoDelete} });`).join(`
`)}

  // Queues
${p.filter(e=>e.name).map(e=>{const n=[];return e.ttl&&n.push(`'x-message-ttl': ${e.ttl}`),e.maxLength&&n.push(`'x-max-length': ${e.maxLength}`),e.dlx&&n.push(`'x-dead-letter-exchange': '${e.dlx}'`),e.dlrk&&n.push(`'x-dead-letter-routing-key': '${e.dlrk}'`),e.queueType!=="classic"&&n.push(`'x-queue-type': '${e.queueType}'`),`  await ch.assertQueue('${e.name}', { durable: ${e.durable}, exclusive: ${e.exclusive}, autoDelete: ${e.autoDelete}${n.length?`, arguments: { ${n.join(", ")} }`:""} });`}).join(`
`)}

  // Bindings
${g.filter(e=>e.source&&e.destination).map(e=>e.destType==="queue"?`  await ch.bindQueue('${e.destination}', '${e.source}', '${e.routingKey}');`:`  await ch.bindExchange('${e.destination}', '${e.source}', '${e.routingKey}');`).join(`
`)}

  return { conn, ch };
}

setup().then(({ ch }) => {
  console.log('RabbitMQ setup complete');
});`,u=`// Java (Spring AMQP) Configuration
@Configuration
public class RabbitMQConfig {

${d.filter(e=>e.name).map(e=>{const n=e.name.replace(/[^a-zA-Z0-9]/g,"")+"Exchange",x={direct:"DirectExchange",topic:"TopicExchange",fanout:"FanoutExchange",headers:"HeadersExchange"}[e.type]||"TopicExchange";return`    @Bean
    public ${x} ${n}() {
        return new ${x}("${e.name}", ${e.durable}, ${e.autoDelete});
    }`}).join(`

`)}

${p.filter(e=>e.name).map(e=>{const n=e.name.replace(/[^a-zA-Z0-9]/g,"")+"Queue",x=[];return e.ttl&&x.push(`.withArgument("x-message-ttl", ${e.ttl})`),e.maxLength&&x.push(`.withArgument("x-max-length", ${e.maxLength})`),e.dlx&&x.push(`.withArgument("x-dead-letter-exchange", "${e.dlx}")`),e.dlrk&&x.push(`.withArgument("x-dead-letter-routing-key", "${e.dlrk}")`),`    @Bean
    public Queue ${n}() {
        return QueueBuilder.${e.durable?"durable":"nonDurable"}("${e.name}")
            ${x.join(`
            `)}
            .build();
    }`}).join(`

`)}

${g.filter(e=>e.source&&e.destination).map((e,n)=>`    @Bean
    public Binding binding${n}() {
        return BindingBuilder.bind(${e.destination.replace(/[^a-zA-Z0-9]/g,"")}Queue())
            .to(${e.source.replace(/[^a-zA-Z0-9]/g,"")}Exchange())
            ${e.routingKey?`.with("${e.routingKey}")`:""};
    }`).join(`

`)}
}`,G=JSON.stringify({rabbit_version:"3.12.0",vhosts:[{name:r.vhost}],users:[{name:r.user,password_hash:"(set your password hash)",tags:"administrator"}],permissions:[{user:r.user,vhost:r.vhost,configure:".*",write:".*",read:".*"}],exchanges:d.filter(e=>e.name).map(e=>({name:e.name,vhost:r.vhost,type:e.type,durable:e.durable,auto_delete:e.autoDelete,internal:!1,arguments:{}})),queues:p.filter(e=>e.name).map(e=>{const n={};return e.ttl&&(n["x-message-ttl"]=parseInt(e.ttl)),e.maxLength&&(n["x-max-length"]=parseInt(e.maxLength)),e.dlx&&(n["x-dead-letter-exchange"]=e.dlx),e.dlrk&&(n["x-dead-letter-routing-key"]=e.dlrk),e.queueType!=="classic"&&(n["x-queue-type"]=e.queueType),{name:e.name,vhost:r.vhost,durable:e.durable,auto_delete:e.autoDelete,arguments:n}}),bindings:g.filter(e=>e.source&&e.destination).map(e=>({source:e.source,vhost:r.vhost,destination:e.destination,destination_type:e.destType,routing_key:e.routingKey,arguments:{}}))},null,2),X=`# docker-compose.yml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3.12-management
    container_name: rabbitmq
    hostname: rabbitmq
    ports:
      - "${r.port}:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: ${r.user}
      RABBITMQ_DEFAULT_PASS: ${r.pass}
      RABBITMQ_DEFAULT_VHOST: ${r.vhost}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./definitions.json:/etc/rabbitmq/definitions.json
      - ./rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  rabbitmq_data:

# rabbitmq.conf
# management.load_definitions = /etc/rabbitmq/definitions.json`;return[l,t,i,u,G,X]},[d,p,g,r]),V=["rabbitmqadmin","Python (pika)","Node.js (amqplib)","Spring AMQP","JSON Definitions","Docker Compose"];return a.jsxs(m,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a",color:"grey.300",p:3},children:[a.jsxs(m,{sx:{maxWidth:1100,mx:"auto"},children:[a.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[a.jsx(ee,{to:"/",children:a.jsx($,{size:"small",sx:{color:"grey.500"},children:a.jsx(ae,{})})}),a.jsx(h,{variant:"h5",sx:{fontWeight:700},children:"RabbitMQ Config Builder"})]}),a.jsxs(A,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[a.jsx(h,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"Connection"}),a.jsxs(m,{sx:{display:"flex",gap:2,flexWrap:"wrap"},children:[a.jsx(c,{size:"small",label:"Host",value:r.host,onChange:s=>j({...r,host:s.target.value}),sx:{flex:1,minWidth:120,...o}}),a.jsx(c,{size:"small",label:"Port",value:r.port,onChange:s=>j({...r,port:s.target.value}),sx:{width:80,...o}}),a.jsx(c,{size:"small",label:"VHost",value:r.vhost,onChange:s=>j({...r,vhost:s.target.value}),sx:{width:80,...o}}),a.jsx(c,{size:"small",label:"User",value:r.user,onChange:s=>j({...r,user:s.target.value}),sx:{flex:1,minWidth:100,...o}}),a.jsx(c,{size:"small",label:"Password",value:r.pass,onChange:s=>j({...r,pass:s.target.value}),sx:{flex:1,minWidth:100,...o}})]})]}),a.jsxs(L,{defaultExpanded:!0,sx:{bgcolor:"#111",border:"1px solid #222",mb:1,"&:before":{display:"none"}},children:[a.jsx(I,{expandIcon:a.jsx(M,{sx:{color:"grey.500"}}),children:a.jsxs(h,{variant:"subtitle1",sx:{fontWeight:600},children:["Exchanges (",d.length,")"]})}),a.jsxs(Q,{children:[d.map((s,l)=>a.jsxs(m,{sx:{display:"flex",gap:1,mb:1,alignItems:"center",flexWrap:"wrap"},children:[a.jsx(c,{size:"small",label:"Name",value:s.name,onChange:t=>C(l,{name:t.target.value}),sx:{flex:1,minWidth:150,...o}}),a.jsxs(v,{size:"small",sx:{width:120,...o},children:[a.jsx(T,{sx:{color:"grey.500"},children:"Type"}),a.jsx(k,{value:s.type,label:"Type",onChange:t=>C(l,{type:t.target.value}),sx:{color:"grey.300"},children:["direct","topic","fanout","headers"].map(t=>a.jsx(y,{value:t,children:t},t))})]}),a.jsx(z,{control:a.jsx(w,{checked:s.durable,onChange:t=>C(l,{durable:t.target.checked}),size:"small"}),label:a.jsx(h,{variant:"caption",sx:{color:"grey.400"},children:"Durable"})}),a.jsx(z,{control:a.jsx(w,{checked:s.autoDelete,onChange:t=>C(l,{autoDelete:t.target.checked}),size:"small"}),label:a.jsx(h,{variant:"caption",sx:{color:"grey.400"},children:"Auto-del"})}),a.jsx($,{size:"small",onClick:()=>_(t=>t.filter((i,u)=>u!==l)),sx:{color:"grey.600"},children:a.jsx(W,{fontSize:"small"})})]},l)),a.jsx(F,{size:"small",startIcon:a.jsx(K,{}),onClick:O,sx:{color:"grey.500"},children:"Add Exchange"})]})]}),a.jsxs(L,{defaultExpanded:!0,sx:{bgcolor:"#111",border:"1px solid #222",mb:1,"&:before":{display:"none"}},children:[a.jsx(I,{expandIcon:a.jsx(M,{sx:{color:"grey.500"}}),children:a.jsxs(h,{variant:"subtitle1",sx:{fontWeight:600},children:["Queues (",p.length,")"]})}),a.jsxs(Q,{children:[p.map((s,l)=>a.jsxs(A,{sx:{bgcolor:"#0d0d0d",border:"1px solid #1a1a1a",p:1.5,mb:1},children:[a.jsxs(m,{sx:{display:"flex",gap:1,mb:1,alignItems:"center",flexWrap:"wrap"},children:[a.jsx(c,{size:"small",label:"Name",value:s.name,onChange:t=>b(l,{name:t.target.value}),sx:{flex:1,minWidth:150,...o}}),a.jsxs(v,{size:"small",sx:{width:120,...o},children:[a.jsx(T,{sx:{color:"grey.500"},children:"Type"}),a.jsx(k,{value:s.queueType,label:"Type",onChange:t=>b(l,{queueType:t.target.value}),sx:{color:"grey.300"},children:["classic","quorum"].map(t=>a.jsx(y,{value:t,children:t},t))})]}),a.jsx(z,{control:a.jsx(w,{checked:s.durable,onChange:t=>b(l,{durable:t.target.checked}),size:"small"}),label:a.jsx(h,{variant:"caption",sx:{color:"grey.400"},children:"Durable"})}),a.jsx(z,{control:a.jsx(w,{checked:s.exclusive,onChange:t=>b(l,{exclusive:t.target.checked}),size:"small"}),label:a.jsx(h,{variant:"caption",sx:{color:"grey.400"},children:"Exclusive"})}),a.jsx($,{size:"small",onClick:()=>E(t=>t.filter((i,u)=>u!==l)),sx:{color:"grey.600"},children:a.jsx(W,{fontSize:"small"})})]}),a.jsxs(m,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[a.jsx(c,{size:"small",label:"TTL (ms)",value:s.ttl,onChange:t=>b(l,{ttl:t.target.value}),sx:{width:120,...o}}),a.jsx(c,{size:"small",label:"Max Length",value:s.maxLength,onChange:t=>b(l,{maxLength:t.target.value}),sx:{width:120,...o}}),a.jsx(c,{size:"small",label:"Dead Letter Exchange",value:s.dlx,onChange:t=>b(l,{dlx:t.target.value}),sx:{flex:1,minWidth:150,...o}}),a.jsx(c,{size:"small",label:"DL Routing Key",value:s.dlrk,onChange:t=>b(l,{dlrk:t.target.value}),sx:{flex:1,minWidth:120,...o}})]})]},l)),a.jsx(F,{size:"small",startIcon:a.jsx(K,{}),onClick:Z,sx:{color:"grey.500"},children:"Add Queue"})]})]}),a.jsxs(L,{defaultExpanded:!0,sx:{bgcolor:"#111",border:"1px solid #222",mb:1,"&:before":{display:"none"}},children:[a.jsx(I,{expandIcon:a.jsx(M,{sx:{color:"grey.500"}}),children:a.jsxs(h,{variant:"subtitle1",sx:{fontWeight:600},children:["Bindings (",g.length,")"]})}),a.jsxs(Q,{children:[g.map((s,l)=>a.jsxs(m,{sx:{display:"flex",gap:1,mb:1,alignItems:"center",flexWrap:"wrap"},children:[a.jsxs(v,{size:"small",sx:{minWidth:150,...o},children:[a.jsx(T,{sx:{color:"grey.500"},children:"Source Exchange"}),a.jsx(k,{value:s.source,label:"Source Exchange",onChange:t=>D(l,{source:t.target.value}),sx:{color:"grey.300"},children:d.filter(t=>t.name).map(t=>a.jsx(y,{value:t.name,children:t.name},t.name))})]}),a.jsx(h,{sx:{color:"grey.600"},children:"->"}),a.jsxs(v,{size:"small",sx:{width:100,...o},children:[a.jsx(T,{sx:{color:"grey.500"},children:"Dest Type"}),a.jsxs(k,{value:s.destType,label:"Dest Type",onChange:t=>D(l,{destType:t.target.value}),sx:{color:"grey.300"},children:[a.jsx(y,{value:"queue",children:"Queue"}),a.jsx(y,{value:"exchange",children:"Exchange"})]})]}),a.jsxs(v,{size:"small",sx:{minWidth:150,...o},children:[a.jsx(T,{sx:{color:"grey.500"},children:"Destination"}),a.jsx(k,{value:s.destination,label:"Destination",onChange:t=>D(l,{destination:t.target.value}),sx:{color:"grey.300"},children:(s.destType==="queue"?p.filter(t=>t.name).map(t=>t.name):d.filter(t=>t.name).map(t=>t.name)).map(t=>a.jsx(y,{value:t,children:t},t))})]}),a.jsx(c,{size:"small",label:"Routing Key",value:s.routingKey,onChange:t=>D(l,{routingKey:t.target.value}),sx:{flex:1,minWidth:120,...o}}),a.jsx($,{size:"small",onClick:()=>S(t=>t.filter((i,u)=>u!==l)),sx:{color:"grey.600"},children:a.jsx(W,{fontSize:"small"})})]},l)),a.jsx(F,{size:"small",startIcon:a.jsx(K,{}),onClick:J,sx:{color:"grey.500"},children:"Add Binding"})]})]}),a.jsxs(A,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mt:2},children:[a.jsxs(m,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[a.jsx(te,{value:B,onChange:(s,l)=>N(l),variant:"scrollable",scrollButtons:"auto",sx:{"& .MuiTab-root":{color:"grey.500",fontSize:12,textTransform:"none"},"& .Mui-selected":{color:"#90caf9"}},children:V.map(s=>a.jsx(se,{label:s},s))}),a.jsx(ne,{title:"Copy",children:a.jsx($,{onClick:()=>U(H[B]),sx:{color:"grey.400"},children:a.jsx(le,{})})})]}),a.jsx(m,{component:"pre",sx:{color:"#81c784",fontFamily:"monospace",fontSize:12,overflow:"auto",maxHeight:500,whiteSpace:"pre-wrap",m:0,mt:1},children:H[B]})]})]}),a.jsx(re,{open:!!P,autoHideDuration:2e3,onClose:()=>R(""),message:P})]})}export{we as default};
//# sourceMappingURL=App-DDPe0mo7.js.map
