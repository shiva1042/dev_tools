import{r as t,j as e,L as p,G as d}from"./index-D7pXJXkH.js";import{A as u}from"./arrow-left-Cd3U9X7n.js";import{C as j}from"./check-Jlm96853.js";import{C as b}from"./copy-D1UXnL3R.js";import{D as f}from"./download-Cn_1lRlf.js";const i={flowchart:`flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,sequence:`sequenceDiagram
    participant Client
    participant Server
    participant Database

    Client->>Server: HTTP Request
    Server->>Database: Query
    Database-->>Server: Results
    Server-->>Client: HTTP Response`,classDiagram:`classDiagram
    class User {
        +Long id
        +String name
        +String email
        +getFullName()
    }
    class Order {
        +Long id
        +Date createdAt
        +calculate()
    }
    User "1" --> "*" Order : places`,erDiagram:`erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "is in"
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        date createdAt
    }`,stateDiagram:`stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : submit
    Processing --> Success : complete
    Processing --> Error : fail
    Error --> Idle : retry
    Success --> [*]`,gantt:`gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design          :a2, after a1, 5d
    section Development
    Backend         :b1, after a2, 14d
    Frontend        :b2, after a2, 14d
    section Testing
    QA Testing      :c1, after b1, 7d`,pie:`pie showData
    title Browser Market Share
    "Chrome" : 65
    "Safari" : 19
    "Firefox" : 10
    "Edge" : 5
    "Other" : 1`,gitGraph:`gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    merge develop
    commit id: "Release"`};function S(){const[s,n]=t.useState(i.flowchart),[o,l]=t.useState(!1),[N,m]=t.useState(""),x=async()=>{await navigator.clipboard.writeText(s),l(!0),setTimeout(()=>l(!1),2e3)},g=a=>{n(i[a]),m("")},h=async()=>{const a=new Blob([`<!-- Mermaid Diagram -->
${s}`],{type:"text/plain"}),c=URL.createObjectURL(a),r=document.createElement("a");r.href=c,r.download="diagram.mmd",r.click(),URL.revokeObjectURL(c)};return e.jsx("div",{className:"min-h-screen bg-gray-950 text-white",children:e.jsxs("div",{className:"max-w-7xl mx-auto p-6",children:[e.jsxs("div",{className:"flex items-center gap-4 mb-8",children:[e.jsx(p,{to:"/",className:"p-2 hover:bg-gray-800 rounded-lg transition-colors",children:e.jsx(u,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold flex items-center gap-2",children:[e.jsx(d,{className:"w-6 h-6 text-pink-400"}),"Mermaid Diagram Editor"]}),e.jsx("p",{className:"text-gray-400 text-sm",children:"Create diagrams with Mermaid syntax"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"flex flex-wrap gap-2",children:Object.keys(i).map(a=>e.jsx("button",{onClick:()=>g(a),className:"px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs capitalize",children:a.replace(/([A-Z])/g," $1").trim()},a))}),e.jsxs("div",{className:"p-4 bg-gray-900 rounded-lg border border-gray-800",children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsx("h3",{className:"text-sm font-medium text-gray-300",children:"Mermaid Code"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:x,className:"flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm",children:o?e.jsx(j,{className:"w-4 h-4 text-green-400"}):e.jsx(b,{className:"w-4 h-4"})}),e.jsx("button",{onClick:h,className:"flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm",children:e.jsx(f,{className:"w-4 h-4"})})]})]}),e.jsx("textarea",{value:s,onChange:a=>n(a.target.value),className:"w-full h-96 p-4 bg-gray-950 border border-gray-800 rounded-lg text-pink-400 font-mono text-sm resize-none focus:outline-none focus:border-pink-500/50",spellCheck:!1})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"p-4 bg-gray-900 rounded-lg border border-gray-800",children:[e.jsx("h3",{className:"text-sm font-medium text-gray-300 mb-3",children:"Preview"}),e.jsx("div",{className:"p-4 bg-white rounded-lg min-h-96 flex items-center justify-center",children:e.jsxs("div",{className:"text-center text-gray-500",children:[e.jsx(d,{className:"w-12 h-12 mx-auto mb-4 text-gray-400"}),e.jsx("p",{className:"text-sm",children:"Mermaid preview would render here"}),e.jsx("p",{className:"text-xs mt-2",children:"In production, integrate with mermaid.js library"}),e.jsx("pre",{className:"mt-4 p-4 bg-gray-100 rounded text-left text-xs text-gray-700 overflow-auto max-h-64",children:s})]})})]}),e.jsxs("div",{className:"p-4 bg-gray-900 rounded-lg border border-gray-800",children:[e.jsx("h3",{className:"text-sm font-medium text-gray-300 mb-3",children:"Syntax Reference"}),e.jsxs("div",{className:"space-y-3 text-xs text-gray-400",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-pink-400 font-medium",children:"Flowchart:"}),e.jsxs("code",{className:"ml-2 text-gray-500",children:["A[Box] --> B","{Decision}"]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-pink-400 font-medium",children:"Sequence:"}),e.jsx("code",{className:"ml-2 text-gray-500",children:"A->>B: Message"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-pink-400 font-medium",children:"Class:"}),e.jsxs("code",{className:"ml-2 text-gray-500",children:["class Name ","{ +method() }"]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-pink-400 font-medium",children:"ER:"}),e.jsxs("code",{className:"ml-2 text-gray-500",children:["ENTITY ||--o","{"," OTHER"]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-pink-400 font-medium",children:"State:"}),e.jsx("code",{className:"ml-2 text-gray-500",children:"[*] --> State1"})]})]})]}),e.jsxs("div",{className:"p-4 bg-gray-900 rounded-lg border border-gray-800",children:[e.jsx("h3",{className:"text-sm font-medium text-gray-300 mb-3",children:"Resources"}),e.jsxs("div",{className:"space-y-2 text-xs",children:[e.jsx("a",{href:"https://mermaid.js.org/syntax/flowchart.html",target:"_blank",rel:"noopener noreferrer",className:"block text-pink-400 hover:underline",children:"Flowchart Syntax →"}),e.jsx("a",{href:"https://mermaid.js.org/syntax/sequenceDiagram.html",target:"_blank",rel:"noopener noreferrer",className:"block text-pink-400 hover:underline",children:"Sequence Diagram Syntax →"}),e.jsx("a",{href:"https://mermaid.live/",target:"_blank",rel:"noopener noreferrer",className:"block text-pink-400 hover:underline",children:"Mermaid Live Editor →"})]})]})]})]})]})})}export{S as default};
//# sourceMappingURL=App-BTyfjfj4.js.map
