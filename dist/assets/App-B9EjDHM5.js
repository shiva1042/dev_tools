import{r as i,j as e,L as E}from"./index-D7pXJXkH.js";import{B as s,I as l,H as M,T as r,P as f}from"./Paper-Cyl37ja4.js";import{C as w}from"./Chip-sxSLqfvX.js";import{F,I as R,S as U,T as L}from"./TextField-DuDeyOSB.js";import{M as N}from"./MenuItem-C1kwkJyb.js";import{T as u}from"./Tooltip-BpGEyTYM.js";import{C as x}from"./ContentCopy-PE5Vu7Zm.js";import{T as W,a as A}from"./Tab-qKNGPrBq.js";import{A as z}from"./Add-CL53DhVf.js";import{S as O}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";const q={"& .MuiOutlinedInput-root":{"& fieldset":{borderColor:"#333"},"&:hover fieldset":{borderColor:"#555"},"&.Mui-focused fieldset":{borderColor:"#1976d2"}},"& .MuiInputLabel-root":{color:"grey.500"},"& .MuiInputBase-input":{color:"grey.300"},"& .MuiSelect-icon":{color:"grey.500"}},y={sequence:`@startuml
title Sequence Diagram Example

actor User
participant "Web App" as App
participant "API Server" as API
database "Database" as DB

User -> App: Open page
activate App
App -> API: GET /data
activate API
API -> DB: SELECT query
activate DB
DB --> API: Result set
deactivate DB
API --> App: JSON response
deactivate API
App --> User: Render page
deactivate App

note right of API: API handles\\nauthentication

alt Success
  User -> App: Submit form
  App -> API: POST /data
  API --> App: 201 Created
else Failure
  API --> App: 400 Bad Request
  App --> User: Show error
end

@enduml`,class:`@startuml
title Class Diagram Example

abstract class Animal {
  - name: String
  - age: int
  + getName(): String
  + makeSound(): void {abstract}
}

class Dog extends Animal {
  - breed: String
  + makeSound(): void
  + fetch(): void
}

class Cat extends Animal {
  - indoor: boolean
  + makeSound(): void
  + purr(): void
}

interface Trainable {
  + train(command: String): void
  + obey(): boolean
}

Dog ..|> Trainable

class Owner {
  - name: String
  - pets: List<Animal>
  + addPet(animal: Animal): void
}

Owner "1" *-- "0..*" Animal : owns

@enduml`,activity:`@startuml
title Activity Diagram Example

start

:Receive request;

if (Authenticated?) then (yes)
  :Load user profile;

  fork
    :Fetch preferences;
  fork again
    :Fetch notifications;
  end fork

  :Build response;

  while (More items?) is (yes)
    :Process item;
  endwhile (no)

  :Send response;
else (no)
  :Return 401 Unauthorized;
endif

stop

@enduml`,usecase:`@startuml
title Use Case Diagram Example

left to right direction

actor Customer
actor Admin

rectangle "E-Commerce System" {
  usecase "Browse Products" as UC1
  usecase "Add to Cart" as UC2
  usecase "Checkout" as UC3
  usecase "Make Payment" as UC4
  usecase "Manage Products" as UC5
  usecase "View Reports" as UC6

  Customer --> UC1
  Customer --> UC2
  Customer --> UC3
  UC3 --> UC4 : <<include>>

  Admin --> UC5
  Admin --> UC6
}

@enduml`,state:`@startuml
title State Diagram Example

[*] --> Idle

state Idle {
  [*] --> WaitingForInput
}

Idle --> Processing : Submit
Processing --> Validating : Parse input

state Validating {
  [*] --> CheckFormat
  CheckFormat --> CheckRules : Format OK
  CheckFormat --> Error : Invalid format
  CheckRules --> [*] : Valid
  CheckRules --> Error : Rule violation
}

Validating --> Saving : Valid
Validating --> Idle : Invalid

Saving --> Completed : Success
Saving --> Error : Failure

Error --> Idle : Retry
Completed --> [*]

@enduml`,component:`@startuml
title Component Diagram Example

package "Frontend" {
  [React App] as FE
  [State Manager] as SM
}

package "Backend" {
  [REST API] as API
  [Auth Service] as Auth
  [Business Logic] as BL
}

package "Data Layer" {
  [Database] as DB
  [Cache] as Cache
}

FE --> SM
FE --> API : HTTP/REST
API --> Auth : Authenticate
API --> BL : Process
BL --> DB : Read/Write
BL --> Cache : Cache queries

@enduml`,deployment:`@startuml
title Deployment Diagram Example

node "Client" {
  [Browser]
}

cloud "CDN" {
  [Static Assets]
}

node "Load Balancer" {
  [Nginx]
}

node "App Server 1" {
  [Node.js App]
}

node "App Server 2" {
  [Node.js App] as App2
}

database "Primary DB" {
  [PostgreSQL]
}

database "Replica DB" {
  [PostgreSQL] as PgReplica
}

[Browser] --> [Static Assets]
[Browser] --> [Nginx]
[Nginx] --> [Node.js App]
[Nginx] --> App2
[Node.js App] --> [PostgreSQL]
App2 --> PgReplica

@enduml`,object:`@startuml
title Object Diagram Example

object "user1 : User" as u1 {
  id = 1
  name = "Alice"
  email = "alice@example.com"
  role = "admin"
}

object "user2 : User" as u2 {
  id = 2
  name = "Bob"
  email = "bob@example.com"
  role = "member"
}

object "team1 : Team" as t1 {
  id = 1
  name = "Engineering"
}

object "project1 : Project" as p1 {
  id = 1
  name = "Platform"
  status = "active"
}

t1 --> u1 : members
t1 --> u2 : members
t1 --> p1 : projects
u1 --> p1 : manages

@enduml`,timing:`@startuml
title Timing Diagram Example

robust "Web Server" as WS
concise "Client" as C

@0
WS is Idle
C is Idle

@100
C is Requesting
WS is Processing

@200
WS is Responding

@250
C is Rendering
WS is Idle

@400
C is Complete

@500
C is Idle

@enduml`},H=[{label:"Note",code:"note right of Actor: Note text"},{label:"Activate",code:"activate Participant"},{label:"Alt block",code:`alt Condition
  ...
else Other
  ...
end`},{label:"Loop",code:`loop N times
  ...
end`},{label:"Group",code:`group Label
  ...
end`},{label:"Divider",code:"== Section =="},{label:"Arrow styles",code:`A -> B: solid
A --> B: dashed
A ->> B: async
A ->x B: lost`},{label:"Class field",code:`+ publicMethod(): void
- privateField: String
# protectedMethod(): int`},{label:"Inheritance",code:"Child --|> Parent"},{label:"Composition",code:"Parent *-- Child"},{label:"Aggregation",code:"Parent o-- Child"},{label:"Dependency",code:"ClassA ..> ClassB"},{label:"Interface impl",code:"Class ..|> Interface"},{label:"If/else",code:`if (condition?) then (yes)
  :action;
else (no)
  :other action;
endif`},{label:"Fork/Join",code:`fork
  :task 1;
fork again
  :task 2;
end fork`},{label:"While loop",code:`while (condition?) is (yes)
  :action;
endwhile (no)`},{label:"Start/Stop",code:`start
...
stop`}],S=[{label:"Default",directive:""},{label:"Monochrome",directive:"skinparam monochrome true"},{label:"Sketchy",directive:"skinparam handwritten true"},{label:"Dark Blue",directive:`skinparam backgroundColor #1a1a2e
skinparam defaultFontColor #e0e0e0
skinparam classBorderColor #16213e
skinparam classBackgroundColor #0f3460`},{label:"Minimal",directive:`skinparam shadowing false
skinparam defaultFontSize 12
skinparam roundcorner 8`}],V={Arrows:["A -> B : label","A --> B : dashed","A ->> B : async","A ->o B : circle end","A ->x B : cross end","A <-> B : bidirectional"],Participants:["actor Name",'participant "Label" as Alias',"boundary Name","control Name","entity Name","database Name","queue Name"],"Class Members":["+ public","- private","# protected","~ package-private","{abstract}","{static}"],Relationships:["A --|> B : extends","A ..|> B : implements","A *-- B : composition","A o-- B : aggregation","A --> B : association","A ..> B : dependency"]};function re(){const[c,j]=i.useState("sequence"),[d,n]=i.useState(y.sequence),[k,g]=i.useState(0),[m,v]=i.useState(0),[b,h]=i.useState(""),p=i.useCallback(a=>{navigator.clipboard.writeText(a),h("Copied!")},[]),I=a=>{g(a);const t=S[a];if(!t.directive){n(o=>o.replace(/^(skinparam .*\n)*/gm,"").replace(/@startuml\n*/,`@startuml
`));return}n(o=>o.replace(/^(skinparam .*\n)*/gm,"").replace(/@startuml\n*/,`@startuml
`).replace(`@startuml
`,`@startuml
${t.directive}
`))},P=a=>{j(a),n(y[a]),g(0)},B=a=>{n(t=>{const o=t.lastIndexOf("@enduml");return o===-1?t+`
`+a:t.slice(0,o)+a+`

`+t.slice(o)})},T=i.useMemo(()=>d,[d]),D=[{key:"sequence",label:"Sequence"},{key:"class",label:"Class"},{key:"activity",label:"Activity"},{key:"usecase",label:"Use Case"},{key:"state",label:"State"},{key:"component",label:"Component"},{key:"deployment",label:"Deployment"},{key:"object",label:"Object"},{key:"timing",label:"Timing"}];return e.jsxs(s,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a",color:"grey.300",p:3},children:[e.jsxs(s,{sx:{maxWidth:1200,mx:"auto"},children:[e.jsxs(s,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[e.jsx(E,{to:"/",children:e.jsx(l,{size:"small",sx:{color:"grey.500"},children:e.jsx(M,{})})}),e.jsx(r,{variant:"h5",sx:{fontWeight:700},children:"PlantUML Editor"})]}),e.jsx(s,{sx:{display:"flex",flexWrap:"wrap",gap:.5,mb:2},children:D.map(a=>e.jsx(w,{label:a.label,size:"small",onClick:()=>P(a.key),sx:{bgcolor:c===a.key?"#1976d222":"#222",color:c===a.key?"#90caf9":"grey.400",border:`1px solid ${c===a.key?"#1976d2":"#333"}`,cursor:"pointer"}},a.key))}),e.jsxs(s,{sx:{display:"flex",gap:2,flexWrap:{xs:"wrap",md:"nowrap"}},children:[e.jsx(s,{sx:{flex:2,minWidth:400},children:e.jsxs(f,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsxs(s,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:[e.jsx(r,{variant:"subtitle2",sx:{color:"grey.400"},children:"PlantUML Code"}),e.jsxs(s,{sx:{display:"flex",gap:1},children:[e.jsxs(F,{size:"small",sx:{minWidth:120,...q},children:[e.jsx(R,{sx:{color:"grey.500"},children:"Theme"}),e.jsx(U,{value:k,onChange:a=>I(Number(a.target.value)),label:"Theme",sx:{color:"grey.300"},children:S.map((a,t)=>e.jsx(N,{value:t,children:a.label},t))})]}),e.jsx(u,{title:"Copy PlantUML code",children:e.jsx(l,{onClick:()=>p(T),sx:{color:"grey.400"},children:e.jsx(x,{fontSize:"small"})})})]})]}),e.jsx(L,{multiline:!0,rows:20,fullWidth:!0,value:d,onChange:a=>n(a.target.value),sx:{fontFamily:"monospace","& .MuiOutlinedInput-root":{"& fieldset":{borderColor:"#333"},"&:hover fieldset":{borderColor:"#555"}},"& .MuiInputBase-input":{color:"#81c784",fontFamily:"monospace",fontSize:13,lineHeight:1.5}}})]})}),e.jsx(s,{sx:{flex:1,minWidth:280},children:e.jsxs(f,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsxs(W,{value:m,onChange:(a,t)=>v(t),sx:{mb:1,"& .MuiTab-root":{color:"grey.500",textTransform:"none",fontSize:12,minWidth:60},"& .Mui-selected":{color:"#90caf9"}},children:[e.jsx(A,{label:"Snippets"}),e.jsx(A,{label:"Syntax Ref"})]}),m===0&&e.jsx(s,{sx:{maxHeight:500,overflow:"auto"},children:H.map((a,t)=>e.jsxs(s,{sx:{mb:1,p:1,bgcolor:"#0a0a0a",borderRadius:1,"&:hover":{bgcolor:"#141414"}},children:[e.jsxs(s,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:.5},children:[e.jsx(r,{variant:"caption",sx:{color:"grey.400",fontWeight:600},children:a.label}),e.jsxs(s,{sx:{display:"flex",gap:.5},children:[e.jsx(u,{title:"Insert",children:e.jsx(l,{size:"small",onClick:()=>B(a.code),sx:{color:"grey.500"},children:e.jsx(z,{sx:{fontSize:14}})})}),e.jsx(u,{title:"Copy",children:e.jsx(l,{size:"small",onClick:()=>p(a.code),sx:{color:"grey.500"},children:e.jsx(x,{sx:{fontSize:14}})})})]})]}),e.jsx(r,{sx:{fontFamily:"monospace",fontSize:11,color:"#81c784",whiteSpace:"pre"},children:a.code})]},t))}),m===1&&e.jsx(s,{sx:{maxHeight:500,overflow:"auto"},children:Object.entries(V).map(([a,t])=>e.jsxs(s,{sx:{mb:2},children:[e.jsx(r,{variant:"caption",sx:{color:"grey.400",fontWeight:600,display:"block",mb:.5},children:a}),t.map((o,C)=>e.jsxs(s,{sx:{display:"flex",alignItems:"center",mb:.25},children:[e.jsx(r,{sx:{fontFamily:"monospace",fontSize:11,color:"#90caf9",flex:1},children:o}),e.jsx(l,{size:"small",onClick:()=>p(o.split(":")[0].trim()),sx:{color:"grey.600"},children:e.jsx(x,{sx:{fontSize:10}})})]},C))]},a))})]})})]})]}),e.jsx(O,{open:!!b,autoHideDuration:1500,onClose:()=>h(""),message:b})]})}export{re as default};
//# sourceMappingURL=App-B9EjDHM5.js.map
