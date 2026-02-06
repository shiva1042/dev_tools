import{r as d,j as e,L as B}from"./index-BkyuEPT-.js";import{B as r,P as g,I as j,H as U,T as c}from"./Paper-DfaW9WtE.js";import{C as F}from"./Chip-B2vQh-SX.js";import{T as A}from"./Tooltip-BhxRvP2v.js";import{D as R}from"./Download-BrcJzUip.js";import{C as q}from"./ContentCopy-Bbf9qDpY.js";import{T as u,F as b,I as T,S as f}from"./TextField-CKUhk3op.js";import{F as y}from"./FormControlLabel-DgI77G4w.js";import{S as x}from"./Switch-DNMKYfpx.js";import{B as P}from"./Button-BaUHX52Q.js";import{A as G}from"./Add-Xpg_St2a.js";import{M as h}from"./MenuItem-KaSofiBm.js";import{D as _}from"./Delete-DJrvTfeZ.js";import{T as H,a as C}from"./Tab-uMaspo5w.js";import{S as J}from"./Snackbar-C3pDCdOy.js";import"./Modal-BG9ZP5_0.js";import"./index-BTYDg4gW.js";import"./SwitchBase-BzCKRfcR.js";import"./listItemIconClasses-DiMy5ZeU.js";import"./listItemTextClasses-C6vt__np.js";import"./dividerClasses-BchBYyiZ.js";const W=["String","Long","Integer","Double","Float","Boolean","BigDecimal","LocalDate","LocalDateTime","Instant","UUID","byte[]","Enum"],Y=["IDENTITY","SEQUENCE","TABLE","AUTO","UUID"],V=["OneToOne","OneToMany","ManyToOne","ManyToMany"],Q=["LAZY","EAGER"];function je(){const[v,D]=d.useState(0),[n,p]=d.useState({className:"User",tableName:"users",packageName:"com.example.entity",useLombok:!0,useAuditing:!0,fields:[{id:"1",name:"id",type:"Long",isId:!0,nullable:!1,unique:!0,generationType:"IDENTITY"},{id:"2",name:"username",type:"String",isId:!1,nullable:!1,unique:!0,length:50},{id:"3",name:"email",type:"String",isId:!1,nullable:!1,unique:!0,length:100},{id:"4",name:"password",type:"String",isId:!1,nullable:!1,unique:!1,length:255},{id:"5",name:"active",type:"Boolean",isId:!1,nullable:!1,unique:!1},{id:"6",name:"createdAt",type:"LocalDateTime",columnName:"created_at",isId:!1,nullable:!1,unique:!1}]}),[k,I]=d.useState({open:!1,message:""}),S=d.useMemo(()=>{const s=new Set;s.add("jakarta.persistence.*"),n.useLombok&&(s.add("lombok.Data"),s.add("lombok.NoArgsConstructor"),s.add("lombok.AllArgsConstructor"),s.add("lombok.Builder")),n.useAuditing&&(s.add("org.springframework.data.annotation.CreatedDate"),s.add("org.springframework.data.annotation.LastModifiedDate"),s.add("org.springframework.data.jpa.domain.support.AuditingEntityListener")),n.fields.forEach(a=>{a.type==="BigDecimal"&&s.add("java.math.BigDecimal"),a.type==="LocalDate"&&s.add("java.time.LocalDate"),a.type==="LocalDateTime"&&s.add("java.time.LocalDateTime"),a.type==="Instant"&&s.add("java.time.Instant"),a.type==="UUID"&&s.add("java.util.UUID"),(a.relationshipType==="OneToMany"||a.relationshipType==="ManyToMany")&&(s.add("java.util.Set"),s.add("java.util.HashSet"))});let t=`package ${n.packageName};

`;return Array.from(s).sort().forEach(a=>{t+=`import ${a};
`}),t+=`
`,n.useLombok&&(t+=`@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
`),t+=`@Entity
@Table(name = "${n.tableName}")
`,n.useAuditing&&(t+=`@EntityListeners(AuditingEntityListener.class)
`),t+=`public class ${n.className} {

`,n.fields.forEach(a=>{if(a.isId&&(t+=`    @Id
`,a.generationType&&(a.generationType==="UUID"?t+=`    @GeneratedValue(strategy = GenerationType.UUID)
`:t+=`    @GeneratedValue(strategy = GenerationType.${a.generationType})
`)),a.relationshipType){let o=`    @${a.relationshipType}`;const m=[];a.targetEntity&&m.push(`targetEntity = ${a.targetEntity}.class`),a.mappedBy&&m.push(`mappedBy = "${a.mappedBy}"`),a.fetchType&&m.push(`fetch = FetchType.${a.fetchType}`),a.cascadeTypes&&a.cascadeTypes.length>0&&(a.cascadeTypes.length===1?m.push(`cascade = CascadeType.${a.cascadeTypes[0]}`):m.push(`cascade = {${a.cascadeTypes.map(w=>`CascadeType.${w}`).join(", ")}}`)),m.length>0&&(o+=`(${m.join(", ")})`),t+=o+`
`,(a.relationshipType==="ManyToOne"||a.relationshipType==="OneToOne")&&(t+=`    @JoinColumn(name = "${a.columnName||a.name+"_id"}")
`)}else{const o=[];a.columnName&&a.columnName!==a.name&&o.push(`name = "${a.columnName}"`),a.nullable||o.push("nullable = false"),a.unique&&!a.isId&&o.push("unique = true"),a.length&&a.type==="String"&&o.push(`length = ${a.length}`),a.precision&&o.push(`precision = ${a.precision}`),a.scale&&o.push(`scale = ${a.scale}`),o.length>0&&(t+=`    @Column(${o.join(", ")})
`)}n.useAuditing&&((a.name==="createdAt"||a.name==="created_at")&&(t+=`    @CreatedDate
`),(a.name==="updatedAt"||a.name==="updated_at")&&(t+=`    @LastModifiedDate
`));let l=a.type;a.relationshipType==="OneToMany"||a.relationshipType==="ManyToMany"?l=`Set<${a.targetEntity||"Object"}>`:(a.relationshipType==="ManyToOne"||a.relationshipType==="OneToOne")&&(l=a.targetEntity||"Object"),t+=`    private ${l} ${a.name}`,(a.relationshipType==="OneToMany"||a.relationshipType==="ManyToMany")&&(t+=" = new HashSet<>()"),t+=`;

`}),n.useLombok||n.fields.forEach(a=>{const l=a.name.charAt(0).toUpperCase()+a.name.slice(1);let o=a.type;a.relationshipType==="OneToMany"||a.relationshipType==="ManyToMany"?o=`Set<${a.targetEntity||"Object"}>`:(a.relationshipType==="ManyToOne"||a.relationshipType==="OneToOne")&&(o=a.targetEntity||"Object"),t+=`    public ${o} get${l}() {
`,t+=`        return ${a.name};
`,t+=`    }

`,t+=`    public void set${l}(${o} ${a.name}) {
`,t+=`        this.${a.name} = ${a.name};
`,t+=`    }

`}),t+=`}
`,t},[n]),E=d.useMemo(()=>{const t=n.fields.find(a=>a.isId)?.type||"Long";return`package ${n.packageName.replace(".entity",".repository")};

import ${n.packageName}.${n.className};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ${n.className}Repository extends JpaRepository<${n.className}, ${t}>, JpaSpecificationExecutor<${n.className}> {

    // Add custom query methods here
    // Example: Optional<${n.className}> findByEmail(String email);

}
`},[n]),N=d.useMemo(()=>{let s=`package ${n.packageName.replace(".entity",".dto")};

`;return n.useLombok&&(s+=`import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

`,s+=`@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
`),s+=`public class ${n.className}DTO {

`,n.fields.filter(t=>!t.relationshipType).forEach(t=>{s+=`    private ${t.type} ${t.name};
`}),n.useLombok||(s+=`
    // Add getters and setters
`),s+=`
}
`,s},[n]),z=async s=>{await navigator.clipboard.writeText(s),I({open:!0,message:"Copied to clipboard"})},L=()=>{const t=[{name:`${n.className}.java`,content:S},{name:`${n.className}Repository.java`,content:E},{name:`${n.className}DTO.java`,content:N}][v],a=new Blob([t.content],{type:"text/plain"}),l=URL.createObjectURL(a),o=document.createElement("a");o.href=l,o.download=t.name,o.click(),URL.revokeObjectURL(l)},M=()=>{p({...n,fields:[...n.fields,{id:String(Date.now()),name:"newField",type:"String",nullable:!0,unique:!1,isId:!1}]})},O=s=>{p({...n,fields:n.fields.filter(t=>t.id!==s)})},i=(s,t)=>{p({...n,fields:n.fields.map(a=>a.id===s?{...a,...t}:a)})},$=[S,E,N][v];return e.jsxs(r,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[e.jsx(g,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:e.jsxs(r,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs(r,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(B,{to:"/",children:e.jsx(j,{size:"small",sx:{color:"grey.500"},children:e.jsx(U,{})})}),e.jsx(c,{variant:"h5",sx:{color:"white",fontWeight:600},children:"JPA Entity Generator"}),e.jsx(F,{label:"Spring Boot",size:"small",color:"success"})]}),e.jsxs(r,{sx:{display:"flex",gap:1},children:[e.jsx(A,{title:"Download",children:e.jsx(j,{onClick:L,sx:{color:"grey.500"},children:e.jsx(R,{})})}),e.jsx(A,{title:"Copy",children:e.jsx(j,{onClick:()=>z($),sx:{color:"grey.500"},children:e.jsx(q,{})})})]})]})}),e.jsxs(r,{sx:{display:"flex",height:"calc(100vh - 70px)"},children:[e.jsxs(r,{sx:{flex:1,p:2,overflow:"auto"},children:[e.jsxs(g,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsx(c,{variant:"subtitle1",sx:{color:"grey.300",mb:2},children:"Entity Configuration"}),e.jsxs(r,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(u,{size:"small",label:"Class Name",value:n.className,onChange:s=>p({...n,className:s.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(u,{size:"small",label:"Table Name",value:n.tableName,onChange:s=>p({...n,tableName:s.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}})]}),e.jsx(u,{size:"small",label:"Package Name",value:n.packageName,onChange:s=>p({...n,packageName:s.target.value}),fullWidth:!0,sx:{mb:2,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsxs(r,{sx:{display:"flex",gap:3},children:[e.jsx(y,{control:e.jsx(x,{checked:n.useLombok,onChange:s=>p({...n,useLombok:s.target.checked}),size:"small"}),label:e.jsx(c,{sx:{color:"grey.400",fontSize:14},children:"Use Lombok"})}),e.jsx(y,{control:e.jsx(x,{checked:n.useAuditing,onChange:s=>p({...n,useAuditing:s.target.checked}),size:"small"}),label:e.jsx(c,{sx:{color:"grey.400",fontSize:14},children:"Spring Data Auditing"})})]})]}),e.jsxs(g,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsxs(r,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsx(c,{variant:"subtitle1",sx:{color:"grey.300"},children:"Fields"}),e.jsx(P,{startIcon:e.jsx(G,{}),onClick:M,size:"small",sx:{color:"grey.400"},children:"Add Field"})]}),n.fields.map(s=>e.jsxs(g,{sx:{bgcolor:"#0a0a0a",border:"1px solid #333",p:2,mb:2},children:[e.jsxs(r,{sx:{display:"flex",gap:2,mb:1},children:[e.jsx(u,{size:"small",label:"Name",value:s.name,onChange:t=>i(s.id,{name:t.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsxs(b,{size:"small",sx:{minWidth:130},children:[e.jsx(T,{sx:{color:"grey.500"},children:"Type"}),e.jsx(f,{value:s.type,label:"Type",onChange:t=>i(s.id,{type:t.target.value}),sx:{color:"grey.300"},children:W.map(t=>e.jsx(h,{value:t,children:t},t))})]}),e.jsx(u,{size:"small",label:"Column Name",value:s.columnName||"",onChange:t=>i(s.id,{columnName:t.target.value}),placeholder:"optional",sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(j,{size:"small",onClick:()=>O(s.id),sx:{color:"grey.500"},children:e.jsx(_,{})})]}),e.jsxs(r,{sx:{display:"flex",gap:2,alignItems:"center",flexWrap:"wrap"},children:[e.jsx(y,{control:e.jsx(x,{checked:s.isId,onChange:t=>i(s.id,{isId:t.target.checked}),size:"small"}),label:e.jsx(c,{sx:{color:"grey.400",fontSize:12},children:"@Id"})}),e.jsx(y,{control:e.jsx(x,{checked:!s.nullable,onChange:t=>i(s.id,{nullable:!t.target.checked}),size:"small"}),label:e.jsx(c,{sx:{color:"grey.400",fontSize:12},children:"Required"})}),e.jsx(y,{control:e.jsx(x,{checked:s.unique,onChange:t=>i(s.id,{unique:t.target.checked}),size:"small"}),label:e.jsx(c,{sx:{color:"grey.400",fontSize:12},children:"Unique"})}),s.isId&&e.jsxs(b,{size:"small",sx:{minWidth:120},children:[e.jsx(T,{sx:{color:"grey.500",fontSize:12},children:"Generation"}),e.jsx(f,{value:s.generationType||"",label:"Generation",onChange:t=>i(s.id,{generationType:t.target.value}),sx:{color:"grey.300",fontSize:12},children:Y.map(t=>e.jsx(h,{value:t,children:t},t))})]}),s.type==="String"&&e.jsx(u,{size:"small",label:"Length",type:"number",value:s.length||"",onChange:t=>i(s.id,{length:parseInt(t.target.value)||void 0}),sx:{width:80,"& .MuiInputBase-root":{color:"grey.300",fontSize:12}}})]}),e.jsxs(r,{sx:{mt:1},children:[e.jsxs(b,{size:"small",sx:{minWidth:130,mr:2},children:[e.jsx(T,{sx:{color:"grey.500",fontSize:12},children:"Relationship"}),e.jsxs(f,{value:s.relationshipType||"",label:"Relationship",onChange:t=>i(s.id,{relationshipType:t.target.value||void 0}),sx:{color:"grey.300",fontSize:12},children:[e.jsx(h,{value:"",children:"None"}),V.map(t=>e.jsx(h,{value:t,children:t},t))]})]}),s.relationshipType&&e.jsxs(e.Fragment,{children:[e.jsx(u,{size:"small",label:"Target Entity",value:s.targetEntity||"",onChange:t=>i(s.id,{targetEntity:t.target.value}),sx:{mr:1,width:120,"& .MuiInputBase-root":{color:"grey.300",fontSize:12}}}),e.jsxs(b,{size:"small",sx:{minWidth:100,mr:1},children:[e.jsx(T,{sx:{color:"grey.500",fontSize:12},children:"Fetch"}),e.jsx(f,{value:s.fetchType||"",label:"Fetch",onChange:t=>i(s.id,{fetchType:t.target.value||void 0}),sx:{color:"grey.300",fontSize:12},children:Q.map(t=>e.jsx(h,{value:t,children:t},t))})]})]})]})]},s.id))]})]}),e.jsxs(r,{sx:{width:550,borderLeft:"1px solid #222",display:"flex",flexDirection:"column"},children:[e.jsx(r,{sx:{borderBottom:"1px solid #222"},children:e.jsxs(H,{value:v,onChange:(s,t)=>D(t),children:[e.jsx(C,{label:"Entity",sx:{color:"grey.400",fontSize:12}}),e.jsx(C,{label:"Repository",sx:{color:"grey.400",fontSize:12}}),e.jsx(C,{label:"DTO",sx:{color:"grey.400",fontSize:12}})]})}),e.jsx(r,{sx:{flex:1,p:2,overflow:"auto"},children:e.jsx(g,{sx:{bgcolor:"#0a0a0a",p:2,border:"1px solid #333",height:"100%"},children:e.jsx(c,{component:"pre",sx:{fontFamily:"monospace",fontSize:11,color:"#d4d4d4",m:0,whiteSpace:"pre-wrap"},children:$})})})]})]}),e.jsx(J,{open:k.open,autoHideDuration:2e3,onClose:()=>I({...k,open:!1}),message:k.message})]})}export{je as default};
//# sourceMappingURL=App-DFOPvziG.js.map
