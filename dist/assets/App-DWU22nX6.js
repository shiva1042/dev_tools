import{r,j as t,L as Ne}from"./index-D7pXJXkH.js";import{B as b,P as L,I as K,H as Ae,T as $}from"./Paper-Cyl37ja4.js";import{T as u,F as E,I as Y,S as _}from"./TextField-DuDeyOSB.js";import{M as l}from"./MenuItem-C1kwkJyb.js";import{F}from"./FormControlLabel-CPJ5-c3p.js";import{S as J}from"./Switch-DkkzjR19.js";import{A as w}from"./Add-CL53DhVf.js";import{D as O}from"./Delete-ChrOPmnB.js";import{T as ve,a as Ke}from"./Tab-qKNGPrBq.js";import{T as $e}from"./Tooltip-BpGEyTYM.js";import{C as ge}from"./ContentCopy-PE5Vu7Zm.js";import{S as Ce}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";import"./SwitchBase-BJFlT-yl.js";function Ye(){const[x,Q]=r.useState("MyTable"),[o,Z]=r.useState("PAY_PER_REQUEST"),[S,q]=r.useState(5),[T,X]=r.useState(5),[c,ee]=r.useState("pk"),[k,te]=r.useState("S"),[h,ae]=r.useState(!1),[j,se]=r.useState("sk"),[D,ie]=r.useState("S"),[C,P]=r.useState([]),[n,U]=r.useState([]),[p,M]=r.useState([]),[A,re]=r.useState(""),[f,oe]=r.useState(!1),[N,ne]=r.useState("NEW_AND_OLD_IMAGES"),[d,R]=r.useState([]),[H,le]=r.useState(0),[B,W]=r.useState({open:!1,message:""}),ce=()=>U([...n,{id:Date.now(),name:`gsi_${n.length+1}`,partitionKey:"",sortKey:"",projectionType:"ALL",includeAttrs:"",rcu:5,wcu:5}]),me=e=>U(n.filter(a=>a.id!==e)),z=(e,a,s)=>U(n.map(i=>i.id===e?{...i,[a]:s}:i)),pe=()=>M([...p,{id:Date.now(),name:`lsi_${p.length+1}`,sortKey:"",projectionType:"ALL",includeAttrs:""}]),de=e=>M(p.filter(a=>a.id!==e)),G=(e,a,s)=>M(p.map(i=>i.id===e?{...i,[a]:s}:i)),ye=()=>P([...C,{name:"",type:"S"}]),ue=()=>R([...d,{key:"",value:""}]),g=r.useMemo(()=>{const e=[{name:c,type:k}];h&&e.push({name:j,type:D});const a=new Set(e.map(s=>s.name));return n.forEach(s=>{s.partitionKey&&!a.has(s.partitionKey)&&(a.add(s.partitionKey),e.push({name:s.partitionKey,type:"S"})),s.sortKey&&!a.has(s.sortKey)&&(a.add(s.sortKey),e.push({name:s.sortKey,type:"S"}))}),p.forEach(s=>{s.sortKey&&!a.has(s.sortKey)&&(a.add(s.sortKey),e.push({name:s.sortKey,type:"S"}))}),C.forEach(s=>{s.name&&!a.has(s.name)&&(a.add(s.name),e.push(s))}),e},[c,k,h,j,D,n,p,C]),xe=r.useMemo(()=>{const e=g.map(i=>`AttributeName=${i.name},AttributeType=${i.type}`).join(" "),a=h?`AttributeName=${c},KeyType=HASH AttributeName=${j},KeyType=RANGE`:`AttributeName=${c},KeyType=HASH`;let s=`aws dynamodb create-table \\
  --table-name ${x} \\
  --attribute-definitions ${e} \\
  --key-schema ${a} \\
  --billing-mode ${o}`;if(o==="PROVISIONED"&&(s+=` \\
  --provisioned-throughput ReadCapacityUnits=${S},WriteCapacityUnits=${T}`),n.length>0){const i=n.map(m=>{let v=`IndexName=${m.name},KeySchema=[{AttributeName=${m.partitionKey},KeyType=HASH}`;return m.sortKey&&(v+=`,{AttributeName=${m.sortKey},KeyType=RANGE}`),v+=`],Projection={ProjectionType=${m.projectionType}`,m.projectionType==="INCLUDE"&&(v+=`,NonKeyAttributes=[${m.includeAttrs}]`),v+="}",o==="PROVISIONED"&&(v+=`,ProvisionedThroughput={ReadCapacityUnits=${m.rcu},WriteCapacityUnits=${m.wcu}}`),v}).join(" ");s+=` \\
  --global-secondary-indexes ${i}`}if(p.length>0){const i=p.map(m=>{let v=`IndexName=${m.name},KeySchema=[{AttributeName=${c},KeyType=HASH},{AttributeName=${m.sortKey},KeyType=RANGE}],Projection={ProjectionType=${m.projectionType}`;return m.projectionType==="INCLUDE"&&(v+=`,NonKeyAttributes=[${m.includeAttrs}]`),v+="}",v}).join(" ");s+=` \\
  --local-secondary-indexes ${i}`}return f&&(s+=` \\
  --stream-specification StreamEnabled=true,StreamViewType=${N}`),d.length>0&&(s+=` \\
  --tags ${d.filter(i=>i.key).map(i=>`Key=${i.key},Value=${i.value}`).join(" ")}`),s},[x,g,c,j,h,o,S,T,n,p,f,N,d]),he=r.useMemo(()=>{const e={Type:"AWS::DynamoDB::Table",Properties:{TableName:x,BillingMode:o,AttributeDefinitions:g.map(s=>({AttributeName:s.name,AttributeType:s.type})),KeySchema:h?[{AttributeName:c,KeyType:"HASH"},{AttributeName:j,KeyType:"RANGE"}]:[{AttributeName:c,KeyType:"HASH"}]}},a=e.Properties;return o==="PROVISIONED"&&(a.ProvisionedThroughput={ReadCapacityUnits:S,WriteCapacityUnits:T}),n.length>0&&(a.GlobalSecondaryIndexes=n.map(s=>{const i={IndexName:s.name,KeySchema:s.sortKey?[{AttributeName:s.partitionKey,KeyType:"HASH"},{AttributeName:s.sortKey,KeyType:"RANGE"}]:[{AttributeName:s.partitionKey,KeyType:"HASH"}],Projection:{ProjectionType:s.projectionType,...s.projectionType==="INCLUDE"?{NonKeyAttributes:s.includeAttrs.split(",").map(m=>m.trim())}:{}}};return o==="PROVISIONED"&&(i.ProvisionedThroughput={ReadCapacityUnits:s.rcu,WriteCapacityUnits:s.wcu}),i})),p.length>0&&(a.LocalSecondaryIndexes=p.map(s=>({IndexName:s.name,KeySchema:[{AttributeName:c,KeyType:"HASH"},{AttributeName:s.sortKey,KeyType:"RANGE"}],Projection:{ProjectionType:s.projectionType,...s.projectionType==="INCLUDE"?{NonKeyAttributes:s.includeAttrs.split(",").map(i=>i.trim())}:{}}}))),A&&(a.TimeToLiveSpecification={AttributeName:A,Enabled:!0}),f&&(a.StreamSpecification={StreamViewType:N}),d.length>0&&(a.Tags=d.filter(s=>s.key).map(s=>({Key:s.key,Value:s.value}))),JSON.stringify({Resources:{[x.replace(/[^a-zA-Z0-9]/g,"")]:e}},null,2)},[x,g,c,j,h,o,S,T,n,p,A,f,N,d]),be=r.useMemo(()=>{let e=`resource "aws_dynamodb_table" "${x.replace(/[^a-zA-Z0-9_]/g,"_")}" {
  name         = "${x}"
  billing_mode = "${o}"
  hash_key     = "${c}"
`;return h&&(e+=`  range_key    = "${j}"
`),o==="PROVISIONED"&&(e+=`  read_capacity  = ${S}
  write_capacity = ${T}
`),e+=`
`,g.forEach(a=>{e+=`  attribute {
    name = "${a.name}"
    type = "${a.type}"
  }

`}),n.forEach(a=>{e+=`  global_secondary_index {
    name            = "${a.name}"
    hash_key        = "${a.partitionKey}"
`,a.sortKey&&(e+=`    range_key       = "${a.sortKey}"
`),e+=`    projection_type = "${a.projectionType}"
`,a.projectionType==="INCLUDE"&&(e+=`    non_key_attributes = [${a.includeAttrs.split(",").map(s=>`"${s.trim()}"`).join(", ")}]
`),o==="PROVISIONED"&&(e+=`    read_capacity  = ${a.rcu}
    write_capacity = ${a.wcu}
`),e+=`  }

`}),p.forEach(a=>{e+=`  local_secondary_index {
    name            = "${a.name}"
    range_key       = "${a.sortKey}"
    projection_type = "${a.projectionType}"
`,a.projectionType==="INCLUDE"&&(e+=`    non_key_attributes = [${a.includeAttrs.split(",").map(s=>`"${s.trim()}"`).join(", ")}]
`),e+=`  }

`}),A&&(e+=`  ttl {
    attribute_name = "${A}"
    enabled        = true
  }

`),f&&(e+=`  stream_enabled   = true
  stream_view_type = "${N}"

`),d.filter(a=>a.key).forEach(a=>{e+=`  tags = {
    ${a.key} = "${a.value}"
  }
`}),e+="}",e},[x,g,c,j,h,o,S,T,n,p,A,f,N,d]),je=r.useMemo(()=>{let e=`import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

const table = new dynamodb.Table(this, '${x}', {
  tableName: '${x}',
  billingMode: dynamodb.BillingMode.${o},
  partitionKey: { name: '${c}', type: dynamodb.AttributeType.${k==="S"?"STRING":k==="N"?"NUMBER":"BINARY"} },
`;return h&&(e+=`  sortKey: { name: '${j}', type: dynamodb.AttributeType.${D==="S"?"STRING":D==="N"?"NUMBER":"BINARY"} },
`),o==="PROVISIONED"&&(e+=`  readCapacity: ${S},
  writeCapacity: ${T},
`),f&&(e+=`  stream: dynamodb.StreamViewType.${N},
`),A&&(e+=`  timeToLiveAttribute: '${A}',
`),e+=`  removalPolicy: RemovalPolicy.RETAIN,
});
`,n.forEach(a=>{e+=`
table.addGlobalSecondaryIndex({
  indexName: '${a.name}',
  partitionKey: { name: '${a.partitionKey}', type: dynamodb.AttributeType.STRING },
`,a.sortKey&&(e+=`  sortKey: { name: '${a.sortKey}', type: dynamodb.AttributeType.STRING },
`),e+=`  projectionType: dynamodb.ProjectionType.${a.projectionType},
`,a.projectionType==="INCLUDE"&&(e+=`  nonKeyAttributes: [${a.includeAttrs.split(",").map(s=>`'${s.trim()}'`).join(", ")}],
`),e+=`});
`}),e},[x,c,k,h,j,D,o,S,T,n,f,N,A]),fe=r.useMemo(()=>{let e=`import boto3

dynamodb = boto3.resource('dynamodb')

table = dynamodb.create_table(
    TableName='${x}',
    KeySchema=[
        {'AttributeName': '${c}', 'KeyType': 'HASH'},
`;return h&&(e+=`        {'AttributeName': '${j}', 'KeyType': 'RANGE'},
`),e+=`    ],
    AttributeDefinitions=[
`,g.forEach(a=>{e+=`        {'AttributeName': '${a.name}', 'AttributeType': '${a.type}'},
`}),e+=`    ],
    BillingMode='${o}',
`,o==="PROVISIONED"&&(e+=`    ProvisionedThroughput={'ReadCapacityUnits': ${S}, 'WriteCapacityUnits': ${T}},
`),n.length>0&&(e+=`    GlobalSecondaryIndexes=[
`,n.forEach(a=>{e+=`        {
            'IndexName': '${a.name}',
            'KeySchema': [{'AttributeName': '${a.partitionKey}', 'KeyType': 'HASH'}`,a.sortKey&&(e+=`, {'AttributeName': '${a.sortKey}', 'KeyType': 'RANGE'}`),e+=`],
            'Projection': {'ProjectionType': '${a.projectionType}'`,a.projectionType==="INCLUDE"&&(e+=`, 'NonKeyAttributes': [${a.includeAttrs.split(",").map(s=>`'${s.trim()}'`).join(", ")}]`),e+=`},
`,o==="PROVISIONED"&&(e+=`            'ProvisionedThroughput': {'ReadCapacityUnits': ${a.rcu}, 'WriteCapacityUnits': ${a.wcu}},
`),e+=`        },
`}),e+=`    ],
`),f&&(e+=`    StreamSpecification={'StreamEnabled': True, 'StreamViewType': '${N}'},
`),d.length>0&&(e+=`    Tags=[${d.filter(a=>a.key).map(a=>`{'Key': '${a.key}', 'Value': '${a.value}'}`).join(", ")}],
`),e+=`)

table.wait_until_exists()
print(f"Table {table.table_name} created successfully.")`,e},[x,g,c,h,j,o,S,T,n,f,N,d]),V=[xe,he,be,je,fe],Se=["AWS CLI","CloudFormation","Terraform","CDK (TS)","Boto3 (Python)"],Te=async e=>{await navigator.clipboard.writeText(e),W({open:!0,message:"Copied to clipboard"})},y={mb:1,"& .MuiInputBase-root":{color:"grey.300",fontSize:13},"& .MuiOutlinedInput-notchedOutline":{borderColor:"#333"}},I={color:"grey.300",".MuiOutlinedInput-notchedOutline":{borderColor:"#333"}};return t.jsxs(b,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[t.jsx(L,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:t.jsxs(b,{sx:{display:"flex",alignItems:"center",gap:2},children:[t.jsx(Ne,{to:"/",children:t.jsx(K,{size:"small",sx:{color:"grey.500"},children:t.jsx(Ae,{})})}),t.jsx($,{variant:"h5",sx:{color:"white",fontWeight:600},children:"DynamoDB Table Designer"})]})}),t.jsxs(b,{sx:{display:"flex",gap:2,p:2,height:"calc(100vh - 80px)"},children:[t.jsxs(L,{sx:{width:400,bgcolor:"#111",border:"1px solid #222",p:2,overflowY:"auto",flexShrink:0},children:[t.jsx($,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"Table Settings"}),t.jsx(u,{size:"small",fullWidth:!0,label:"Table Name",value:x,onChange:e=>Q(e.target.value),sx:y}),t.jsxs(E,{size:"small",fullWidth:!0,sx:{mb:1},children:[t.jsx(Y,{sx:{color:"grey.500"},children:"Billing Mode"}),t.jsxs(_,{value:o,label:"Billing Mode",onChange:e=>Z(e.target.value),sx:I,children:[t.jsx(l,{value:"PAY_PER_REQUEST",children:"On-Demand"}),t.jsx(l,{value:"PROVISIONED",children:"Provisioned"})]})]}),o==="PROVISIONED"&&t.jsxs(b,{sx:{display:"flex",gap:1},children:[t.jsx(u,{size:"small",fullWidth:!0,label:"RCU",type:"number",value:S,onChange:e=>q(Number(e.target.value)),sx:y}),t.jsx(u,{size:"small",fullWidth:!0,label:"WCU",type:"number",value:T,onChange:e=>X(Number(e.target.value)),sx:y})]}),t.jsx($,{variant:"subtitle2",sx:{color:"grey.400",mt:2,mb:1},children:"Primary Key"}),t.jsxs(b,{sx:{display:"flex",gap:1},children:[t.jsx(u,{size:"small",label:"Partition Key",value:c,onChange:e=>ee(e.target.value),sx:{...y,flex:1}}),t.jsx(E,{size:"small",sx:{width:70},children:t.jsxs(_,{value:k,onChange:e=>te(e.target.value),sx:{...I,fontSize:12},children:[t.jsx(l,{value:"S",children:"S"}),t.jsx(l,{value:"N",children:"N"}),t.jsx(l,{value:"B",children:"B"})]})})]}),t.jsx(F,{control:t.jsx(J,{checked:h,onChange:e=>ae(e.target.checked),size:"small"}),label:"Sort Key",sx:{color:"grey.400"}}),h&&t.jsxs(b,{sx:{display:"flex",gap:1},children:[t.jsx(u,{size:"small",label:"Sort Key",value:j,onChange:e=>se(e.target.value),sx:{...y,flex:1}}),t.jsx(E,{size:"small",sx:{width:70},children:t.jsxs(_,{value:D,onChange:e=>ie(e.target.value),sx:{...I,fontSize:12},children:[t.jsx(l,{value:"S",children:"S"}),t.jsx(l,{value:"N",children:"N"}),t.jsx(l,{value:"B",children:"B"})]})})]}),t.jsxs($,{variant:"subtitle2",sx:{color:"grey.400",mt:2,mb:1},children:["Additional Attributes",t.jsx(K,{size:"small",onClick:ye,sx:{color:"grey.400",ml:1},children:t.jsx(w,{sx:{fontSize:16}})})]}),C.map((e,a)=>t.jsxs(b,{sx:{display:"flex",gap:1,mb:.5},children:[t.jsx(u,{size:"small",value:e.name,onChange:s=>{const i=[...C];i[a].name=s.target.value,P(i)},placeholder:"name",sx:{...y,flex:1,mb:0}}),t.jsx(E,{size:"small",sx:{width:70},children:t.jsxs(_,{value:e.type,onChange:s=>{const i=[...C];i[a].type=s.target.value,P(i)},sx:{...I,fontSize:12},children:[t.jsx(l,{value:"S",children:"S"}),t.jsx(l,{value:"N",children:"N"}),t.jsx(l,{value:"B",children:"B"})]})}),t.jsx(K,{size:"small",onClick:()=>P(C.filter((s,i)=>i!==a)),sx:{color:"grey.600"},children:t.jsx(O,{sx:{fontSize:16}})})]},a)),t.jsxs($,{variant:"subtitle2",sx:{color:"grey.400",mt:2,mb:1},children:["Global Secondary Indexes (",n.length,")",t.jsx(K,{size:"small",onClick:ce,sx:{color:"grey.400",ml:1},children:t.jsx(w,{sx:{fontSize:16}})})]}),n.map(e=>t.jsxs(L,{sx:{bgcolor:"#0a0a0a",border:"1px solid #222",p:1.5,mb:1},children:[t.jsxs(b,{sx:{display:"flex",justifyContent:"space-between",mb:.5},children:[t.jsx(u,{size:"small",value:e.name,onChange:a=>z(e.id,"name",a.target.value),placeholder:"Index name",sx:{...y,mb:0,flex:1,mr:1}}),t.jsx(K,{size:"small",onClick:()=>me(e.id),sx:{color:"grey.600"},children:t.jsx(O,{sx:{fontSize:16}})})]}),t.jsxs(b,{sx:{display:"flex",gap:1,mt:.5},children:[t.jsx(u,{size:"small",value:e.partitionKey,onChange:a=>z(e.id,"partitionKey",a.target.value),placeholder:"Partition key",sx:{...y,mb:0,flex:1}}),t.jsx(u,{size:"small",value:e.sortKey,onChange:a=>z(e.id,"sortKey",a.target.value),placeholder:"Sort key (opt)",sx:{...y,mb:0,flex:1}})]}),t.jsx(E,{size:"small",fullWidth:!0,sx:{mt:.5},children:t.jsxs(_,{value:e.projectionType,onChange:a=>z(e.id,"projectionType",a.target.value),sx:{...I,fontSize:12},children:[t.jsx(l,{value:"ALL",children:"ALL"}),t.jsx(l,{value:"KEYS_ONLY",children:"KEYS_ONLY"}),t.jsx(l,{value:"INCLUDE",children:"INCLUDE"})]})}),e.projectionType==="INCLUDE"&&t.jsx(u,{size:"small",fullWidth:!0,value:e.includeAttrs,onChange:a=>z(e.id,"includeAttrs",a.target.value),placeholder:"attr1, attr2",sx:{...y,mt:.5,mb:0}})]},e.id)),t.jsxs($,{variant:"subtitle2",sx:{color:"grey.400",mt:2,mb:1},children:["Local Secondary Indexes (",p.length,")",t.jsx(K,{size:"small",onClick:pe,sx:{color:"grey.400",ml:1},children:t.jsx(w,{sx:{fontSize:16}})})]}),p.map(e=>t.jsxs(L,{sx:{bgcolor:"#0a0a0a",border:"1px solid #222",p:1.5,mb:1},children:[t.jsxs(b,{sx:{display:"flex",justifyContent:"space-between",mb:.5},children:[t.jsx(u,{size:"small",value:e.name,onChange:a=>G(e.id,"name",a.target.value),placeholder:"Index name",sx:{...y,mb:0,flex:1,mr:1}}),t.jsx(K,{size:"small",onClick:()=>de(e.id),sx:{color:"grey.600"},children:t.jsx(O,{sx:{fontSize:16}})})]}),t.jsx(u,{size:"small",fullWidth:!0,value:e.sortKey,onChange:a=>G(e.id,"sortKey",a.target.value),placeholder:"Sort key",sx:{...y,mt:.5,mb:0}}),t.jsx(E,{size:"small",fullWidth:!0,sx:{mt:.5},children:t.jsxs(_,{value:e.projectionType,onChange:a=>G(e.id,"projectionType",a.target.value),sx:{...I,fontSize:12},children:[t.jsx(l,{value:"ALL",children:"ALL"}),t.jsx(l,{value:"KEYS_ONLY",children:"KEYS_ONLY"}),t.jsx(l,{value:"INCLUDE",children:"INCLUDE"})]})})]},e.id)),t.jsx($,{variant:"subtitle2",sx:{color:"grey.400",mt:2,mb:1},children:"Other Settings"}),t.jsx(u,{size:"small",fullWidth:!0,label:"TTL Attribute",value:A,onChange:e=>re(e.target.value),sx:y}),t.jsx(F,{control:t.jsx(J,{checked:f,onChange:e=>oe(e.target.checked),size:"small"}),label:"DynamoDB Streams",sx:{color:"grey.400",display:"block"}}),f&&t.jsxs(E,{size:"small",fullWidth:!0,sx:{mb:1},children:[t.jsx(Y,{sx:{color:"grey.500"},children:"Stream View Type"}),t.jsxs(_,{value:N,label:"Stream View Type",onChange:e=>ne(e.target.value),sx:I,children:[t.jsx(l,{value:"NEW_IMAGE",children:"NEW_IMAGE"}),t.jsx(l,{value:"OLD_IMAGE",children:"OLD_IMAGE"}),t.jsx(l,{value:"NEW_AND_OLD_IMAGES",children:"NEW_AND_OLD_IMAGES"}),t.jsx(l,{value:"KEYS_ONLY",children:"KEYS_ONLY"})]})]}),t.jsxs($,{variant:"subtitle2",sx:{color:"grey.400",mt:1,mb:1},children:["Tags",t.jsx(K,{size:"small",onClick:ue,sx:{color:"grey.400",ml:1},children:t.jsx(w,{sx:{fontSize:16}})})]}),d.map((e,a)=>t.jsxs(b,{sx:{display:"flex",gap:1,mb:.5},children:[t.jsx(u,{size:"small",value:e.key,onChange:s=>{const i=[...d];i[a].key=s.target.value,R(i)},placeholder:"Key",sx:{...y,flex:1,mb:0}}),t.jsx(u,{size:"small",value:e.value,onChange:s=>{const i=[...d];i[a].value=s.target.value,R(i)},placeholder:"Value",sx:{...y,flex:1,mb:0}}),t.jsx(K,{size:"small",onClick:()=>R(d.filter((s,i)=>i!==a)),sx:{color:"grey.600"},children:t.jsx(O,{sx:{fontSize:16}})})]},a))]}),t.jsxs(L,{sx:{flex:1,bgcolor:"#111",border:"1px solid #222",display:"flex",flexDirection:"column",minWidth:0},children:[t.jsx(b,{sx:{borderBottom:"1px solid #222"},children:t.jsx(ve,{value:H,onChange:(e,a)=>le(a),variant:"scrollable",sx:{"& .MuiTab-root":{color:"grey.500",fontSize:12,minHeight:42}},children:Se.map((e,a)=>t.jsx(Ke,{label:e},e))})}),t.jsx(b,{sx:{display:"flex",justifyContent:"flex-end",p:1,borderBottom:"1px solid #222"},children:t.jsx($e,{title:"Copy",children:t.jsx(K,{size:"small",onClick:()=>Te(V[H]),sx:{color:"grey.500"},children:t.jsx(ge,{fontSize:"small"})})})}),t.jsx(b,{sx:{flex:1,p:2,overflow:"auto"},children:t.jsx($,{component:"pre",sx:{fontFamily:"monospace",fontSize:12,color:"#98c379",whiteSpace:"pre-wrap",m:0},children:V[H]})})]})]}),t.jsx(Ce,{open:B.open,autoHideDuration:2e3,onClose:()=>W({...B,open:!1}),message:B.message})]})}export{Ye as default};
//# sourceMappingURL=App-DWU22nX6.js.map
