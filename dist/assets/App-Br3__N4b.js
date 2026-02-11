import{r as d,j as e,L as se}from"./index-D7pXJXkH.js";import{B as o,P as h,I as m,H as ae,T as g}from"./Paper-Cyl37ja4.js";import{T as c,F as O,S as R,I as te}from"./TextField-DuDeyOSB.js";import{A as I}from"./Add-CL53DhVf.js";import{D as T}from"./Delete-ChrOPmnB.js";import{M as j}from"./MenuItem-C1kwkJyb.js";import{C as le}from"./Chip-sxSLqfvX.js";import{T as re,a as oe}from"./Tab-qKNGPrBq.js";import{T as B}from"./Tooltip-BpGEyTYM.js";import{C as ne}from"./ContentCopy-PE5Vu7Zm.js";import{D as ie}from"./Download-BKYGKf7U.js";import{S as ce}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";const pe=["Deployment","Service","Ingress","ConfigMap","Secret","ServiceAccount","HorizontalPodAutoscaler","PersistentVolumeClaim"];function De(){const[v,L]=d.useState("my-chart"),[w,P]=d.useState("0.1.0"),[A,N]=d.useState("A Helm chart for Kubernetes"),[H,W]=d.useState("1.0.0"),[u,$]=d.useState([]),[y,S]=d.useState([{key:"replicaCount",value:"1",type:"number"},{key:"image.repository",value:"nginx",type:"string"},{key:"image.tag",value:"latest",type:"string"},{key:"service.type",value:"ClusterIP",type:"string"},{key:"service.port",value:"80",type:"number"}]),[x,C]=d.useState([{kind:"Deployment",name:"main"},{kind:"Service",name:"main"}]),[f,E]=d.useState(0),[V,M]=d.useState({open:!1,message:""}),K=()=>$([...u,{name:"",version:"",repository:""}]),U=s=>$(u.filter((t,a)=>a!==s)),z=(s,t,a)=>{const l=[...u];l[s]={...l[s],[t]:a},$(l)},F=()=>S([...y,{key:"",value:"",type:"string"}]),_=s=>S(y.filter((t,a)=>a!==s)),D=(s,t,a)=>{const l=[...y];l[s]={...l[s],[t]:a},S(l)},Y=()=>C([...x,{kind:"Deployment",name:""}]),q=s=>C(x.filter((t,a)=>a!==s)),J=()=>{let s=`apiVersion: v2
name: ${v}
description: ${A}
type: application
version: ${w}
appVersion: "${H}"
`;return u.length>0&&(s+=`
dependencies:
`,u.forEach(t=>{s+=`  - name: ${t.name}
    version: ${t.version}
    repository: ${t.repository}
`})),s},G=()=>{const s={};y.forEach(a=>{const l=a.key.split(".");let r=s;for(let n=0;n<l.length-1;n++)(!r[l[n]]||typeof r[l[n]]!="object")&&(r[l[n]]={}),r=r[l[n]];const p=l[l.length-1];if(a.type==="number")r[p]=Number(a.value)||0;else if(a.type==="boolean")r[p]=a.value==="true";else if(a.type==="array")try{r[p]=JSON.parse(a.value)}catch{r[p]=[]}else r[p]=a.value});const t=(a,l)=>{let r="";return Object.entries(a).forEach(([p,n])=>{const k="  ".repeat(l);n!==null&&typeof n=="object"&&!Array.isArray(n)?r+=`${k}${p}:
${t(n,l+1)}`:Array.isArray(n)?(r+=`${k}${p}:
`,n.forEach(ee=>{r+=`${k}  - ${ee}
`})):r+=`${k}${p}: ${n}
`}),r};return t(s,0)},Q=s=>{const t=`{{ include "${v}.fullname" . }}`,a=`    app.kubernetes.io/name: {{ include "${v}.name" . }}
    app.kubernetes.io/instance: {{ .Release.Name }}`;switch(s.kind){case"Deployment":return`apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${t}
  labels:
${a}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
${a}
  template:
    metadata:
      labels:
${a}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.service.port }}
`;case"Service":return`apiVersion: v1
kind: Service
metadata:
  name: ${t}
  labels:
${a}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.port }}
      protocol: TCP
  selector:
${a}
`;case"Ingress":return`{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${t}
  labels:
${a}
spec:
  rules:
    - host: {{ .Values.ingress.host }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${t}
                port:
                  number: {{ .Values.service.port }}
{{- end }}
`;case"ConfigMap":return`apiVersion: v1
kind: ConfigMap
metadata:
  name: ${t}
  labels:
${a}
data:
  # Add your config data here
  config.yaml: |
    key: value
`;case"Secret":return`apiVersion: v1
kind: Secret
metadata:
  name: ${t}
  labels:
${a}
type: Opaque
data:
  # Add your base64 encoded secrets here
  secret-key: {{ .Values.secretKey | b64enc | quote }}
`;default:return`apiVersion: v1
kind: ${s.kind}
metadata:
  name: ${t}
  labels:
${a}
`}},b=[{label:"Chart.yaml",content:J()},{label:"values.yaml",content:G()},...x.map(s=>({label:`templates/${s.name||s.kind.toLowerCase()}.yaml`,content:Q(s)}))],X=async s=>{await navigator.clipboard.writeText(s),M({open:!0,message:"Copied to clipboard"})},Z=(s,t)=>{const a=new Blob([t],{type:"text/yaml"}),l=URL.createObjectURL(a),r=document.createElement("a");r.href=l,r.download=s,r.click(),URL.revokeObjectURL(l)},i={"& .MuiInputBase-root":{bgcolor:"#0a0a0a",color:"#d4d4d4",fontSize:14},"& .MuiOutlinedInput-notchedOutline":{borderColor:"#333"},"& .MuiInputLabel-root":{color:"grey.500"}};return e.jsxs(o,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[e.jsx(h,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:e.jsxs(o,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(se,{to:"/",children:e.jsx(m,{size:"small",sx:{color:"grey.500"},children:e.jsx(ae,{})})}),e.jsx(g,{variant:"h5",sx:{color:"white",fontWeight:600},children:"Helm Chart Builder"})]})}),e.jsxs(o,{sx:{display:"flex",gap:3,p:3,minHeight:"calc(100vh - 72px)"},children:[e.jsxs(o,{sx:{flex:1,display:"flex",flexDirection:"column",gap:2,overflow:"auto",maxHeight:"calc(100vh - 100px)"},children:[e.jsxs(h,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(g,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Chart Metadata"}),e.jsxs(o,{sx:{display:"flex",flexDirection:"column",gap:2},children:[e.jsx(c,{label:"Chart Name",size:"small",fullWidth:!0,value:v,onChange:s=>L(s.target.value),sx:i}),e.jsxs(o,{sx:{display:"flex",gap:2},children:[e.jsx(c,{label:"Version",size:"small",fullWidth:!0,value:w,onChange:s=>P(s.target.value),sx:i}),e.jsx(c,{label:"App Version",size:"small",fullWidth:!0,value:H,onChange:s=>W(s.target.value),sx:i})]}),e.jsx(c,{label:"Description",size:"small",fullWidth:!0,value:A,onChange:s=>N(s.target.value),sx:i})]})]}),e.jsxs(h,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsxs(o,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:[e.jsx(g,{variant:"subtitle2",sx:{color:"grey.400"},children:"Dependencies"}),e.jsx(m,{size:"small",onClick:K,sx:{color:"grey.500"},children:e.jsx(I,{})})]}),u.map((s,t)=>e.jsxs(o,{sx:{display:"flex",gap:1,mb:1,alignItems:"center"},children:[e.jsx(c,{placeholder:"Name",size:"small",value:s.name,onChange:a=>z(t,"name",a.target.value),sx:{...i,flex:1}}),e.jsx(c,{placeholder:"Version",size:"small",value:s.version,onChange:a=>z(t,"version",a.target.value),sx:{...i,flex:1}}),e.jsx(c,{placeholder:"Repository URL",size:"small",value:s.repository,onChange:a=>z(t,"repository",a.target.value),sx:{...i,flex:2}}),e.jsx(m,{size:"small",onClick:()=>U(t),sx:{color:"grey.600"},children:e.jsx(T,{fontSize:"small"})})]},t))]}),e.jsxs(h,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsxs(o,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:[e.jsx(g,{variant:"subtitle2",sx:{color:"grey.400"},children:"Values (values.yaml)"}),e.jsx(m,{size:"small",onClick:F,sx:{color:"grey.500"},children:e.jsx(I,{})})]}),y.map((s,t)=>e.jsxs(o,{sx:{display:"flex",gap:1,mb:1,alignItems:"center"},children:[e.jsx(c,{placeholder:"Key (dot notation)",size:"small",value:s.key,onChange:a=>D(t,"key",a.target.value),sx:{...i,flex:2}}),e.jsx(c,{placeholder:"Value",size:"small",value:s.value,onChange:a=>D(t,"value",a.target.value),sx:{...i,flex:2}}),e.jsx(O,{size:"small",sx:{minWidth:100,...i},children:e.jsxs(R,{value:s.type,onChange:a=>D(t,"type",a.target.value),sx:{color:"#d4d4d4","& .MuiOutlinedInput-notchedOutline":{borderColor:"#333"}},children:[e.jsx(j,{value:"string",children:"string"}),e.jsx(j,{value:"number",children:"number"}),e.jsx(j,{value:"boolean",children:"boolean"}),e.jsx(j,{value:"array",children:"array"})]})}),e.jsx(m,{size:"small",onClick:()=>_(t),sx:{color:"grey.600"},children:e.jsx(T,{fontSize:"small"})})]},t))]}),e.jsxs(h,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsxs(o,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:[e.jsx(g,{variant:"subtitle2",sx:{color:"grey.400"},children:"Template Resources"}),e.jsx(m,{size:"small",onClick:Y,sx:{color:"grey.500"},children:e.jsx(I,{})})]}),x.map((s,t)=>e.jsxs(o,{sx:{display:"flex",gap:1,mb:1,alignItems:"center"},children:[e.jsxs(O,{size:"small",sx:{minWidth:180,...i},children:[e.jsx(te,{sx:{color:"grey.500"},children:"Kind"}),e.jsx(R,{value:s.kind,label:"Kind",onChange:a=>{const l=[...x];l[t]={...l[t],kind:a.target.value},C(l)},sx:{color:"#d4d4d4","& .MuiOutlinedInput-notchedOutline":{borderColor:"#333"}},children:pe.map(a=>e.jsx(j,{value:a,children:a},a))})]}),e.jsx(c,{placeholder:"Template name",size:"small",fullWidth:!0,value:s.name,onChange:a=>{const l=[...x];l[t]={...l[t],name:a.target.value},C(l)},sx:i}),e.jsx(le,{label:s.kind,size:"small",sx:{bgcolor:"#1a3a2a",color:"#4caf50",fontSize:11}}),e.jsx(m,{size:"small",onClick:()=>q(t),sx:{color:"grey.600"},children:e.jsx(T,{fontSize:"small"})})]},t))]})]}),e.jsx(o,{sx:{flex:1,display:"flex",flexDirection:"column"},children:e.jsxs(h,{sx:{bgcolor:"#111",border:"1px solid #222",flex:1,display:"flex",flexDirection:"column"},children:[e.jsx(o,{sx:{borderBottom:"1px solid #222"},children:e.jsx(re,{value:f,onChange:(s,t)=>E(t),variant:"scrollable",scrollButtons:"auto",sx:{minHeight:40,"& .MuiTab-root":{minHeight:40,color:"grey.500",fontSize:12,textTransform:"none"}},children:b.map((s,t)=>e.jsx(oe,{label:s.label},t))})}),e.jsxs(o,{sx:{display:"flex",justifyContent:"flex-end",p:1,gap:1,borderBottom:"1px solid #222"},children:[e.jsx(B,{title:"Copy",children:e.jsx(m,{size:"small",onClick:()=>X(b[f]?.content||""),sx:{color:"grey.500"},children:e.jsx(ne,{fontSize:"small"})})}),e.jsx(B,{title:"Download",children:e.jsx(m,{size:"small",onClick:()=>Z(b[f]?.label||"file.yaml",b[f]?.content||""),sx:{color:"grey.500"},children:e.jsx(ie,{fontSize:"small"})})})]}),e.jsx(o,{sx:{flex:1,p:2,overflow:"auto"},children:e.jsx(g,{component:"pre",sx:{fontFamily:"monospace",fontSize:13,color:"#d4d4d4",whiteSpace:"pre-wrap",m:0},children:b[f]?.content||""})})]})})]}),e.jsx(ce,{open:V.open,autoHideDuration:2e3,onClose:()=>M({...V,open:!1}),message:V.message})]})}export{De as default};
//# sourceMappingURL=App-Br3__N4b.js.map
