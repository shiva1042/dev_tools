import{r as c,j as o,L as F}from"./index-D7pXJXkH.js";import{B as m,I,H as B,T as u,P as w}from"./Paper-Cyl37ja4.js";import{A as K,a as N,b as R}from"./AccordionDetails-aaCjmipr.js";import{E as O}from"./ExpandMore-CbnAiKk0.js";import{T as U,a as v}from"./Tab-qKNGPrBq.js";import{T as H}from"./Tooltip-BpGEyTYM.js";import{C as W}from"./ContentCopy-PE5Vu7Zm.js";import{S as _}from"./Snackbar-CXSrz_ev.js";import{F as q,S as X,T as V}from"./TextField-DuDeyOSB.js";import{M as Y}from"./MenuItem-C1kwkJyb.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";const d=i=>i.map(([g,a,b,n,f])=>({key:g,value:a,description:b,type:n,options:f})),Z=d([["broker.id","0","Unique broker identifier","number"],["listeners","PLAINTEXT://:9092","Listener configuration","string"],["advertised.listeners","PLAINTEXT://localhost:9092","Listeners published to ZooKeeper","string"],["log.dirs","/var/kafka-logs","Log directory","string"],["num.partitions","3","Default number of partitions","number"],["default.replication.factor","1","Default replication factor","number"],["log.retention.hours","168","Hours to keep log segments","number"],["log.retention.bytes","-1","Max bytes per partition (-1=unlimited)","number"],["log.segment.bytes","1073741824","Max size of a log segment (bytes)","number"],["zookeeper.connect","localhost:2181","ZooKeeper connection string","string"],["auto.create.topics.enable","true","Auto-create topics","select",["true","false"]],["num.io.threads","8","I/O threads for network requests","number"],["num.network.threads","3","Network threads","number"],["message.max.bytes","1048576","Max message size (bytes)","number"]]),G=d([["name","my-topic","Topic name","string"],["partitions","3","Number of partitions","number"],["replication-factor","1","Replication factor","number"],["cleanup.policy","delete","Cleanup policy","select",["delete","compact","delete,compact"]],["retention.ms","604800000","Retention time (ms), 7 days default","number"],["segment.bytes","1073741824","Segment size (bytes)","number"],["min.insync.replicas","1","Min in-sync replicas","number"],["compression.type","producer","Compression type","select",["producer","none","gzip","snappy","lz4","zstd"]],["max.message.bytes","1048576","Max message bytes","number"]]),J=d([["bootstrap.servers","localhost:9092","Broker list","string"],["acks","all","Acknowledgment setting","select",["all","0","1","-1"]],["retries","2147483647","Number of retries","number"],["batch.size","16384","Batch size (bytes)","number"],["linger.ms","0","Linger time (ms)","number"],["buffer.memory","33554432","Buffer memory (bytes)","number"],["key.serializer","org.apache.kafka.common.serialization.StringSerializer","Key serializer","string"],["value.serializer","org.apache.kafka.common.serialization.StringSerializer","Value serializer","string"],["enable.idempotence","true","Enable idempotent producer","select",["true","false"]],["max.in.flight.requests.per.connection","5","Max in-flight requests","number"],["compression.type","none","Compression","select",["none","gzip","snappy","lz4","zstd"]]]),Q=d([["bootstrap.servers","localhost:9092","Broker list","string"],["group.id","my-consumer-group","Consumer group ID","string"],["auto.offset.reset","earliest","Offset reset strategy","select",["earliest","latest","none"]],["enable.auto.commit","true","Auto-commit offsets","select",["true","false"]],["auto.commit.interval.ms","5000","Auto-commit interval (ms)","number"],["max.poll.records","500","Max records per poll","number"],["max.poll.interval.ms","300000","Max poll interval (ms)","number"],["session.timeout.ms","45000","Session timeout (ms)","number"],["key.deserializer","org.apache.kafka.common.serialization.StringDeserializer","Key deserializer","string"],["value.deserializer","org.apache.kafka.common.serialization.StringDeserializer","Value deserializer","string"],["fetch.min.bytes","1","Min fetch bytes","number"],["fetch.max.wait.ms","500","Max fetch wait (ms)","number"]]);function be(){const[i,g]=c.useState(Z),[a,b]=c.useState(G),[n,f]=c.useState(J),[l,L]=c.useState(Q),[y,A]=c.useState(0),[C,j]=c.useState(""),E=c.useCallback(r=>{navigator.clipboard.writeText(r),j("Copied!")},[]),$=(r,s,t,e)=>{s(r.map(h=>h.key===t?{...h,value:e}:h))},x=r=>r.map(s=>`${s.key}=${s.value}`).join(`
`),p=a.find(r=>r.key==="name")?.value||"my-topic",z=a.find(r=>r.key==="partitions")?.value||"3",T=a.find(r=>r.key==="replication-factor")?.value||"1",k=a.filter(r=>!["name","partitions","replication-factor"].includes(r.key)),S=c.useMemo(()=>{const r=`# Kafka Broker Configuration
${x(i)}

# Topic: ${p}
# (Create via CLI or admin client)

# Producer Configuration
${x(n)}

# Consumer Configuration
${x(l)}`,s=`# Kafka Configuration (YAML)
broker:
${i.map(e=>`  ${e.key}: ${e.value}`).join(`
`)}

topic:
  name: ${p}
  partitions: ${z}
  replication-factor: ${T}
  config:
${k.map(e=>`    ${e.key}: ${e.value}`).join(`
`)}

producer:
${n.map(e=>`  ${e.key}: ${e.value}`).join(`
`)}

consumer:
${l.map(e=>`  ${e.key}: ${e.value}`).join(`
`)}`;k.map(e=>`${e.key}=${e.value}`).join(",");const t=`#!/bin/bash
# Kafka CLI Commands

# Create Topic
kafka-topics.sh --create \\
  --bootstrap-server ${i.find(e=>e.key==="listeners")?.value.replace("PLAINTEXT://","")||"localhost:9092"} \\
  --topic ${p} \\
  --partitions ${z} \\
  --replication-factor ${T} \\
  --config ${k.map(e=>`${e.key}=${e.value}`).join(" --config ")}

# Describe Topic
kafka-topics.sh --describe \\
  --bootstrap-server ${i.find(e=>e.key==="listeners")?.value.replace("PLAINTEXT://","")||"localhost:9092"} \\
  --topic ${p}

# Producer (console)
kafka-console-producer.sh \\
  --bootstrap-server ${n.find(e=>e.key==="bootstrap.servers")?.value||"localhost:9092"} \\
  --topic ${p} \\
  --producer-property acks=${n.find(e=>e.key==="acks")?.value||"all"}

# Consumer (console)
kafka-console-consumer.sh \\
  --bootstrap-server ${l.find(e=>e.key==="bootstrap.servers")?.value||"localhost:9092"} \\
  --topic ${p} \\
  --group ${l.find(e=>e.key==="group.id")?.value||"my-group"} \\
  --from-beginning

# Describe Consumer Group
kafka-consumer-groups.sh \\
  --bootstrap-server ${l.find(e=>e.key==="bootstrap.servers")?.value||"localhost:9092"} \\
  --group ${l.find(e=>e.key==="group.id")?.value||"my-group"} \\
  --describe`;return[r,s,t]},[i,a,n,l]),M={"& .MuiOutlinedInput-root":{"& fieldset":{borderColor:"#333"},"&:hover fieldset":{borderColor:"#555"},"&.Mui-focused fieldset":{borderColor:"#1976d2"}},"& .MuiInputLabel-root":{color:"grey.500"},"& .MuiInputBase-input":{color:"grey.300"},"& .MuiSelect-icon":{color:"grey.500"}},D=(r,s)=>o.jsx(m,{sx:{display:"flex",flexDirection:"column",gap:1.5},children:r.map(t=>o.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:2},children:[o.jsx(u,{variant:"caption",sx:{color:"grey.500",fontFamily:"monospace",minWidth:280,fontSize:12},children:t.key}),t.type==="select"?o.jsx(q,{size:"small",sx:{minWidth:180,...M},children:o.jsx(X,{value:t.value,onChange:e=>$(r,s,t.key,e.target.value),sx:{color:"grey.300",fontSize:13},children:(t.options||[]).map(e=>o.jsx(Y,{value:e,children:e},e))})}):o.jsx(V,{size:"small",value:t.value,onChange:e=>$(r,s,t.key,e.target.value),type:(t.type==="number","text"),sx:{flex:1,maxWidth:400,...M}}),o.jsx(u,{variant:"caption",sx:{color:"grey.600",fontSize:11},children:t.description})]},t.key))}),P=[{label:"Broker Config",fields:i,setter:g},{label:"Topic Config",fields:a,setter:b},{label:"Producer Config",fields:n,setter:f},{label:"Consumer Config",fields:l,setter:L}];return o.jsxs(m,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a",color:"grey.300",p:3},children:[o.jsxs(m,{sx:{maxWidth:1100,mx:"auto"},children:[o.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[o.jsx(F,{to:"/",children:o.jsx(I,{size:"small",sx:{color:"grey.500"},children:o.jsx(B,{})})}),o.jsx(u,{variant:"h5",sx:{fontWeight:700},children:"Kafka Config Builder"})]}),P.map(r=>o.jsxs(K,{defaultExpanded:!0,sx:{bgcolor:"#111",border:"1px solid #222",mb:1,"&:before":{display:"none"}},children:[o.jsx(N,{expandIcon:o.jsx(O,{sx:{color:"grey.500"}}),children:o.jsx(u,{variant:"subtitle1",sx:{fontWeight:600,color:"grey.300"},children:r.label})}),o.jsx(R,{children:D(r.fields,r.setter)})]},r.label)),o.jsxs(w,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mt:3},children:[o.jsxs(m,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[o.jsxs(U,{value:y,onChange:(r,s)=>A(s),sx:{"& .MuiTab-root":{color:"grey.500",fontSize:12,textTransform:"none"},"& .Mui-selected":{color:"#90caf9"}},children:[o.jsx(v,{label:"Properties"}),o.jsx(v,{label:"YAML"}),o.jsx(v,{label:"CLI Commands"})]}),o.jsx(H,{title:"Copy",children:o.jsx(I,{onClick:()=>E(S[y]),sx:{color:"grey.400"},children:o.jsx(W,{})})})]}),o.jsx(m,{component:"pre",sx:{color:"#81c784",fontFamily:"monospace",fontSize:12,overflow:"auto",maxHeight:500,whiteSpace:"pre-wrap",m:0,mt:1},children:S[y]})]})]}),o.jsx(_,{open:!!C,autoHideDuration:2e3,onClose:()=>j(""),message:C})]})}export{be as default};
//# sourceMappingURL=App-3qZuX8Nm.js.map
