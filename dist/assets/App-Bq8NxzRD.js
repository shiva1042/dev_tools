import{r as d,j as s,L as V}from"./index-D7pXJXkH.js";import{B as l,I as u,H as K,T as h,P as y}from"./Paper-Cyl37ja4.js";import{C as P}from"./Chip-sxSLqfvX.js";import{F as G,S as J,T as _}from"./TextField-DuDeyOSB.js";import{M as z}from"./MenuItem-C1kwkJyb.js";import{D as Q}from"./Delete-ChrOPmnB.js";import{A as k}from"./Add-CL53DhVf.js";import{C as X}from"./Checkbox-BgIpc1EP.js";import{T as Z,a as ee}from"./Tab-qKNGPrBq.js";import{T as se}from"./Tooltip-BpGEyTYM.js";import{C as re}from"./ContentCopy-PE5Vu7Zm.js";import{S as ie}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";import"./SwitchBase-BJFlT-yl.js";function Se(){const[a,E]=d.useState([{id:"r1",name:"Admin",parentId:null},{id:"r2",name:"Editor",parentId:"r1"},{id:"r3",name:"Viewer",parentId:"r2"}]),[c,I]=d.useState(["users:read","users:write","users:delete","posts:read","posts:create","posts:delete","settings:read","settings:write"]),[p,f]=d.useState({r1:new Set(["users:read","users:write","users:delete","posts:read","posts:create","posts:delete","settings:read","settings:write"]),r2:new Set(["users:read","posts:read","posts:create","posts:delete"]),r3:new Set(["users:read","posts:read"])}),[S,w]=d.useState(""),[g,A]=d.useState(""),[C,O]=d.useState(0),[T,N]=d.useState(""),U=()=>"r"+Math.random().toString(36).slice(2,8),B=d.useCallback(e=>{navigator.clipboard.writeText(e),N("Copied!")},[]),$=()=>{if(!S.trim())return;const e=U();E(i=>[...i,{id:e,name:S.trim(),parentId:null}]),f(i=>({...i,[e]:new Set})),w("")},D=e=>{E(i=>i.filter(t=>t.id!==e).map(t=>t.parentId===e?{...t,parentId:null}:t)),f(i=>{const t={...i};return delete t[e],t})},v=()=>{!g.trim()||c.includes(g.trim())||(I(e=>[...e,g.trim()]),A(""))},H=e=>{I(i=>i.filter(t=>t!==e)),f(i=>{const t={};return Object.entries(i).forEach(([o,m])=>{const b=new Set(m);b.delete(e),t[o]=b}),t})},L=(e,i)=>{f(t=>{const o=new Set(t[e]||[]);return o.has(i)?o.delete(i):o.add(i),{...t,[e]:o}})},j=d.useCallback(e=>{const i=a.find(o=>o.id===e);if(!i)return new Set;const t=p[e]||new Set;if(i.parentId){const o=j(i.parentId);return new Set([...t,...o])}return new Set(t)},[a,p]),F=(e,i)=>{E(t=>t.map(o=>o.id===e?{...o,parentId:i}:o))},M=d.useMemo(()=>{const e=a.map(r=>({name:r.name,inherits:r.parentId&&a.find(n=>n.id===r.parentId)?.name||null,permissions:Array.from(p[r.id]||[]),effectivePermissions:Array.from(j(r.id))})),i=JSON.stringify({roles:e},null,2),t=`roles:
${e.map(r=>`  - name: "${r.name}"
    ${r.inherits?`inherits: "${r.inherits}"
    `:""}permissions:
${r.permissions.map(n=>`      - "${n}"`).join(`
`)}`).join(`
`)}`,o=`-- RBAC Schema
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES roles(id)
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) UNIQUE NOT NULL
);

CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Insert permissions
${c.map((r,n)=>`INSERT INTO permissions (id, name) VALUES (${n+1}, '${r}');`).join(`
`)}

-- Insert roles
${a.map((r,n)=>`INSERT INTO roles (id, name, parent_id) VALUES (${n+1}, '${r.name}', ${r.parentId?a.findIndex(x=>x.id===r.parentId)+1:"NULL"});`).join(`
`)}

-- Assign permissions
${a.flatMap((r,n)=>Array.from(p[r.id]||[]).map(x=>`INSERT INTO role_permissions (role_id, permission_id) VALUES (${n+1}, ${c.indexOf(x)+1});`)).join(`
`)}`,m=`// Spring Security RBAC Configuration
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class RbacConfig {

${e.map(r=>`    public static final String ROLE_${r.name.toUpperCase()} = "${r.name}";`).join(`
`)}

    @Bean
    public RoleHierarchy roleHierarchy() {
        RoleHierarchyImpl hierarchy = new RoleHierarchyImpl();
        hierarchy.setHierarchy(
${a.filter(r=>r.parentId).map(r=>`            "ROLE_${(a.find(n=>n.id===r.parentId)?.name||"").toUpperCase()} > ROLE_${r.name.toUpperCase()}"`).join(` + "\\n" +
`)}
        );
        return hierarchy;
    }
}`,b=`# Casbin RBAC Policy
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act

# Policies
${a.flatMap(r=>Array.from(p[r.id]||[]).map(n=>{const[x,Y]=n.split(":");return`p, ${r.name}, ${x}, ${Y}`})).join(`
`)}

# Role inheritance
${a.filter(r=>r.parentId).map(r=>`g, ${a.find(n=>n.id===r.parentId)?.name||""}, ${r.name}`).join(`
`)}`,q=`// Node.js RBAC Middleware
const roles = ${JSON.stringify(e.reduce((r,n)=>({...r,[n.name]:{permissions:n.permissions,inherits:n.inherits}}),{}),null,2)};

function getEffectivePermissions(roleName) {
  const role = roles[roleName];
  if (!role) return new Set();
  const perms = new Set(role.permissions);
  if (role.inherits) {
    getEffectivePermissions(role.inherits).forEach(p => perms.add(p));
  }
  return perms;
}

function requirePermission(permission) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) return res.status(401).json({ error: 'Unauthorized' });
    const perms = getEffectivePermissions(userRole);
    if (!perms.has(permission)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// Usage:
// app.get('/users', requirePermission('users:read'), listUsers);
// app.delete('/posts/:id', requirePermission('posts:delete'), deletePost);`;return[i,t,o,m,b,q]},[a,c,p,j]),W=["JSON","YAML","SQL","Spring Security","Casbin","Node.js Middleware"],R={"& .MuiOutlinedInput-root":{"& fieldset":{borderColor:"#333"},"&:hover fieldset":{borderColor:"#555"},"&.Mui-focused fieldset":{borderColor:"#1976d2"}},"& .MuiInputLabel-root":{color:"grey.500"},"& .MuiInputBase-input":{color:"grey.300"},"& .MuiSelect-icon":{color:"grey.500"}};return s.jsxs(l,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a",color:"grey.300",p:3},children:[s.jsxs(l,{sx:{maxWidth:1100,mx:"auto"},children:[s.jsxs(l,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[s.jsx(V,{to:"/",children:s.jsx(u,{size:"small",sx:{color:"grey.500"},children:s.jsx(K,{})})}),s.jsx(h,{variant:"h5",sx:{fontWeight:700},children:"RBAC Designer"})]}),s.jsxs(l,{sx:{display:"flex",gap:3,mb:3,flexWrap:"wrap"},children:[s.jsxs(y,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,flex:1,minWidth:280},children:[s.jsx(h,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"Roles"}),a.map(e=>s.jsxs(l,{sx:{display:"flex",alignItems:"center",gap:1,mb:1},children:[s.jsx(P,{label:e.name,size:"small",sx:{bgcolor:"#1a2332",color:"#90caf9",minWidth:80}}),s.jsx(G,{size:"small",sx:{minWidth:120,...R},children:s.jsxs(J,{displayEmpty:!0,value:e.parentId||"",onChange:i=>F(e.id,i.target.value||null),sx:{color:"grey.400",fontSize:12},children:[s.jsx(z,{value:"",children:s.jsx("em",{children:"No parent"})}),a.filter(i=>i.id!==e.id).map(i=>s.jsx(z,{value:i.id,children:i.name},i.id))]})}),s.jsx(u,{size:"small",onClick:()=>D(e.id),sx:{color:"grey.600"},children:s.jsx(Q,{fontSize:"small"})})]},e.id)),s.jsxs(l,{sx:{display:"flex",gap:1,mt:1},children:[s.jsx(_,{size:"small",placeholder:"Role name",value:S,onChange:e=>w(e.target.value),onKeyDown:e=>e.key==="Enter"&&$(),sx:{flex:1,...R}}),s.jsx(u,{size:"small",onClick:$,sx:{color:"grey.400"},children:s.jsx(k,{})})]})]}),s.jsxs(y,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,flex:1,minWidth:280},children:[s.jsx(h,{variant:"subtitle2",sx:{color:"grey.400",mb:1},children:"Permissions"}),s.jsx(l,{sx:{display:"flex",flexWrap:"wrap",gap:.5,mb:1},children:c.map(e=>s.jsx(P,{label:e,size:"small",onDelete:()=>H(e),sx:{bgcolor:"#1a1a2e",color:"#ce93d8","& .MuiChip-deleteIcon":{color:"#8e6aab"},fontFamily:"monospace",fontSize:11}},e))}),s.jsxs(l,{sx:{display:"flex",gap:1},children:[s.jsx(_,{size:"small",placeholder:"resource:action",value:g,onChange:e=>A(e.target.value),onKeyDown:e=>e.key==="Enter"&&v(),sx:{flex:1,...R}}),s.jsx(u,{size:"small",onClick:v,sx:{color:"grey.400"},children:s.jsx(k,{})})]})]})]}),s.jsxs(y,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:3,overflow:"auto"},children:[s.jsx(h,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Permission Matrix"}),s.jsxs(l,{component:"table",sx:{width:"100%",borderCollapse:"collapse","& th, & td":{border:"1px solid #222",p:.5,textAlign:"center",fontSize:12},"& th":{color:"grey.500",bgcolor:"#0d0d0d"}},children:[s.jsx("thead",{children:s.jsxs("tr",{children:[s.jsx("th",{style:{textAlign:"left",minWidth:100},children:"Role"}),c.map(e=>s.jsx("th",{style:{fontFamily:"monospace",writingMode:"vertical-rl",height:100,whiteSpace:"nowrap",fontSize:11},children:e},e))]})}),s.jsx("tbody",{children:a.map(e=>{const i=j(e.id);return s.jsxs("tr",{children:[s.jsx("td",{style:{textAlign:"left",color:"#90caf9",fontWeight:600},children:e.name}),c.map(t=>{const o=(p[e.id]||new Set).has(t),m=!o&&i.has(t);return s.jsxs("td",{style:{cursor:"pointer",backgroundColor:o?"#1a2332":m?"#1a1a2e":void 0},onClick:()=>L(e.id,t),children:[s.jsx(X,{checked:o,size:"small",sx:{p:0,color:m?"#7b1fa2":"grey.700","&.Mui-checked":{color:"#1976d2"}},onChange:()=>L(e.id,t)}),m&&s.jsx(h,{variant:"caption",sx:{color:"#7b1fa2",display:"block",fontSize:9},children:"inherited"})]},t)})]},e.id)})})]})]}),s.jsxs(y,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[s.jsxs(l,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[s.jsx(Z,{value:C,onChange:(e,i)=>O(i),variant:"scrollable",scrollButtons:"auto",sx:{"& .MuiTab-root":{color:"grey.500",fontSize:12,textTransform:"none"},"& .Mui-selected":{color:"#90caf9"}},children:W.map(e=>s.jsx(ee,{label:e},e))}),s.jsx(se,{title:"Copy",children:s.jsx(u,{onClick:()=>B(M[C]),sx:{color:"grey.400"},children:s.jsx(re,{})})})]}),s.jsx(l,{component:"pre",sx:{color:"#81c784",fontFamily:"monospace",fontSize:12,overflow:"auto",maxHeight:500,whiteSpace:"pre-wrap",m:0,mt:1},children:M[C]})]})]}),s.jsx(ie,{open:!!T,autoHideDuration:2e3,onClose:()=>N(""),message:T})]})}export{Se as default};
//# sourceMappingURL=App-Bq8NxzRD.js.map
