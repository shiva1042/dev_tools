import{r as F,j as e,L as _}from"./index-D7pXJXkH.js";import{B as t,P as u,I as x,H as q,T as d}from"./Paper-Cyl37ja4.js";import{C as J}from"./Chip-sxSLqfvX.js";import{T as S}from"./Tooltip-BpGEyTYM.js";import{D as K}from"./Download-BKYGKf7U.js";import{C as I}from"./ContentCopy-PE5Vu7Zm.js";import{T as m,F as N,I as k,S as $}from"./TextField-DuDeyOSB.js";import{M as g}from"./MenuItem-C1kwkJyb.js";import{F as R}from"./FormControlLabel-CPJ5-c3p.js";import{S as w}from"./Switch-DkkzjR19.js";import{B as Q}from"./Button-BJgHq-zh.js";import{A as X}from"./Add-CL53DhVf.js";import{S as Y}from"./SwapHoriz-BnhY7pcY.js";import{D as Z}from"./Delete-ChrOPmnB.js";import{S as ee}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";import"./SwitchBase-BJFlT-yl.js";function ve(){const[a,n]=F.useState({mapperName:"UserMapper",packageName:"com.example.mapper",sourceClass:"User",targetClass:"UserDTO",componentModel:"spring",unmappedTargetPolicy:"WARN",unmappedSourcePolicy:"IGNORE",nullValueMappingStrategy:"RETURN_NULL",fieldMappings:[{id:"1",sourceField:"id",targetField:"id",ignore:!1},{id:"2",sourceField:"firstName",targetField:"firstName",ignore:!1},{id:"3",sourceField:"lastName",targetField:"lastName",ignore:!1},{id:"4",sourceField:"email",targetField:"emailAddress",ignore:!1},{id:"5",sourceField:"createdAt",targetField:"createdDate",expression:"java(source.getCreatedAt().toString())",ignore:!1},{id:"6",sourceField:"password",targetField:"password",ignore:!0}],usesMappers:[],generateInverse:!0,generateUpdateMethod:!0}),[b,z]=F.useState({open:!1,message:""}),M=F.useMemo(()=>{const{mapperName:s,packageName:o,sourceClass:p,targetClass:j,componentModel:C,unmappedTargetPolicy:A,unmappedSourcePolicy:G,nullValueMappingStrategy:O,fieldMappings:V,usesMappers:P,generateInverse:W,generateUpdateMethod:H}=a;let r=`package ${o};

`;r+=`import org.mapstruct.*;
`,C==="spring"&&(r+=`import org.springframework.stereotype.Component;
`),r+=`import java.util.List;

`;const h=[];C!=="default"&&h.push(`componentModel = "${C}"`),h.push(`unmappedTargetPolicy = ReportingPolicy.${A}`),h.push(`unmappedSourcePolicy = ReportingPolicy.${G}`),h.push(`nullValueMappingStrategy = NullValueMappingStrategy.${O}`),P.length>0&&h.push(`uses = {${P.map(c=>`${c}.class`).join(", ")}}`),r+=`@Mapper(${h.join(`,
        `)})
`,r+=`public interface ${s} {

`;const f=V.filter(c=>c.sourceField!==c.targetField||c.ignore||c.expression||c.qualifiedByName);if(f.length>0){r+=`    @Mappings({
`;const c=f.map(i=>{const l=[];return l.push(`source = "${i.sourceField}"`),l.push(`target = "${i.targetField}"`),i.ignore&&l.push("ignore = true"),i.expression&&l.push(`expression = "${i.expression}"`),i.qualifiedByName&&l.push(`qualifiedByName = "${i.qualifiedByName}"`),`        @Mapping(${l.join(", ")})`});r+=c.join(`,
`),r+=`
    })
`}if(r+=`    ${j} toDto(${p} source);

`,r+=`    List<${j}> toDtoList(List<${p}> sources);

`,W){if(f.length>0){r+=`    @Mappings({
`;const c=f.map(i=>{const l=[];return l.push(`source = "${i.targetField}"`),l.push(`target = "${i.sourceField}"`),i.ignore&&l.push("ignore = true"),`        @Mapping(${l.join(", ")})`});r+=c.join(`,
`),r+=`
    })
`}r+=`    ${p} toEntity(${j} dto);

`,r+=`    List<${p}> toEntityList(List<${j}> dtos);

`}if(H){if(r+=`    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
`,f.length>0){r+=`    @Mappings({
`;const c=f.filter(i=>!i.expression).map(i=>{const l=[];return l.push(`source = "${i.targetField}"`),l.push(`target = "${i.sourceField}"`),i.ignore&&l.push("ignore = true"),`        @Mapping(${l.join(", ")})`});r+=c.join(`,
`),r+=`
    })
`}r+=`    void updateEntityFromDto(${j} dto, @MappingTarget ${p} entity);

`}return r+=`    // Custom mapping methods can be added here using @Named annotation
`,r+=`    // @Named("customMethod")
`,r+=`    // default String customMapping(SomeType source) { ... }
`,r+=`}
`,r},[a]),T=`<!-- MapStruct Dependencies -->
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
</dependency>

<!-- MapStruct Processor (add to annotationProcessorPaths in maven-compiler-plugin) -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>1.5.5.Final</version>
            </path>
            <!-- If using Lombok, add lombok-mapstruct-binding -->
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok-mapstruct-binding</artifactId>
                <version>0.2.0</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>`,L=`// MapStruct Dependencies
implementation 'org.mapstruct:mapstruct:1.5.5.Final'
annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'

// If using Lombok, add lombok-mapstruct-binding
annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'`,v=async s=>{await navigator.clipboard.writeText(s),z({open:!0,message:"Copied to clipboard"})},D=()=>{const s=new Blob([M],{type:"text/plain"}),o=URL.createObjectURL(s),p=document.createElement("a");p.href=o,p.download=`${a.mapperName}.java`,p.click(),URL.revokeObjectURL(o)},U=()=>{n({...a,fieldMappings:[...a.fieldMappings,{id:String(Date.now()),sourceField:"sourceField",targetField:"targetField",ignore:!1}]})},E=s=>{n({...a,fieldMappings:a.fieldMappings.filter(o=>o.id!==s)})},y=(s,o)=>{n({...a,fieldMappings:a.fieldMappings.map(p=>p.id===s?{...p,...o}:p)})},B=s=>{n({...a,fieldMappings:a.fieldMappings.map(o=>o.id===s?{...o,sourceField:o.targetField,targetField:o.sourceField}:o)})};return e.jsxs(t,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[e.jsx(u,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:e.jsxs(t,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs(t,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(_,{to:"/",children:e.jsx(x,{size:"small",sx:{color:"grey.500"},children:e.jsx(q,{})})}),e.jsx(d,{variant:"h5",sx:{color:"white",fontWeight:600},children:"MapStruct Mapper Generator"}),e.jsx(J,{label:"Java",size:"small",color:"warning"})]}),e.jsxs(t,{sx:{display:"flex",gap:1},children:[e.jsx(S,{title:"Download",children:e.jsx(x,{onClick:D,sx:{color:"grey.500"},children:e.jsx(K,{})})}),e.jsx(S,{title:"Copy",children:e.jsx(x,{onClick:()=>v(M),sx:{color:"grey.500"},children:e.jsx(I,{})})})]})]})}),e.jsxs(t,{sx:{display:"flex",height:"calc(100vh - 70px)"},children:[e.jsxs(t,{sx:{flex:1,p:2,overflow:"auto"},children:[e.jsxs(u,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsx(d,{variant:"subtitle1",sx:{color:"grey.300",mb:2},children:"Mapper Configuration"}),e.jsxs(t,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(m,{size:"small",label:"Mapper Name",value:a.mapperName,onChange:s=>n({...a,mapperName:s.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(m,{size:"small",label:"Package",value:a.packageName,onChange:s=>n({...a,packageName:s.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}})]}),e.jsxs(t,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(m,{size:"small",label:"Source Class (Entity)",value:a.sourceClass,onChange:s=>n({...a,sourceClass:s.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(m,{size:"small",label:"Target Class (DTO)",value:a.targetClass,onChange:s=>n({...a,targetClass:s.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}})]}),e.jsxs(t,{sx:{display:"flex",gap:2,mb:2},children:[e.jsxs(N,{size:"small",sx:{minWidth:150},children:[e.jsx(k,{sx:{color:"grey.500"},children:"Component Model"}),e.jsxs($,{value:a.componentModel,label:"Component Model",onChange:s=>n({...a,componentModel:s.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"default",children:"Default"}),e.jsx(g,{value:"spring",children:"Spring"}),e.jsx(g,{value:"cdi",children:"CDI"}),e.jsx(g,{value:"jsr330",children:"JSR-330"})]})]}),e.jsxs(N,{size:"small",sx:{minWidth:150},children:[e.jsx(k,{sx:{color:"grey.500"},children:"Unmapped Target"}),e.jsxs($,{value:a.unmappedTargetPolicy,label:"Unmapped Target",onChange:s=>n({...a,unmappedTargetPolicy:s.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"ERROR",children:"ERROR"}),e.jsx(g,{value:"WARN",children:"WARN"}),e.jsx(g,{value:"IGNORE",children:"IGNORE"})]})]}),e.jsxs(N,{size:"small",sx:{minWidth:150},children:[e.jsx(k,{sx:{color:"grey.500"},children:"Null Value"}),e.jsxs($,{value:a.nullValueMappingStrategy,label:"Null Value",onChange:s=>n({...a,nullValueMappingStrategy:s.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"RETURN_NULL",children:"RETURN_NULL"}),e.jsx(g,{value:"RETURN_DEFAULT",children:"RETURN_DEFAULT"})]})]})]}),e.jsxs(t,{sx:{display:"flex",gap:3},children:[e.jsx(R,{control:e.jsx(w,{checked:a.generateInverse,onChange:s=>n({...a,generateInverse:s.target.checked}),size:"small"}),label:e.jsx(d,{sx:{color:"grey.400",fontSize:14},children:"Generate Inverse (toEntity)"})}),e.jsx(R,{control:e.jsx(w,{checked:a.generateUpdateMethod,onChange:s=>n({...a,generateUpdateMethod:s.target.checked}),size:"small"}),label:e.jsx(d,{sx:{color:"grey.400",fontSize:14},children:"Generate Update Method"})})]})]}),e.jsxs(u,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsxs(t,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsx(d,{variant:"subtitle1",sx:{color:"grey.300"},children:"Field Mappings"}),e.jsx(Q,{startIcon:e.jsx(X,{}),onClick:U,size:"small",sx:{color:"grey.400"},children:"Add Mapping"})]}),a.fieldMappings.map(s=>e.jsxs(u,{sx:{bgcolor:"#0a0a0a",border:"1px solid #333",p:2,mb:1},children:[e.jsxs(t,{sx:{display:"flex",gap:2,alignItems:"center",mb:1},children:[e.jsx(m,{size:"small",label:`Source (${a.sourceClass})`,value:s.sourceField,onChange:o=>y(s.id,{sourceField:o.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(S,{title:"Swap fields",children:e.jsx(x,{size:"small",onClick:()=>B(s.id),sx:{color:"grey.500"},children:e.jsx(Y,{})})}),e.jsx(m,{size:"small",label:`Target (${a.targetClass})`,value:s.targetField,onChange:o=>y(s.id,{targetField:o.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(R,{control:e.jsx(w,{checked:s.ignore,onChange:o=>y(s.id,{ignore:o.target.checked}),size:"small"}),label:e.jsx(d,{sx:{color:"grey.400",fontSize:12},children:"Ignore"})}),e.jsx(x,{size:"small",onClick:()=>E(s.id),sx:{color:"grey.500"},children:e.jsx(Z,{})})]}),e.jsx(m,{size:"small",label:"Expression (optional)",value:s.expression||"",onChange:o=>y(s.id,{expression:o.target.value||void 0}),placeholder:"java(source.getField().toString())",fullWidth:!0,sx:{"& .MuiInputBase-root":{color:"grey.300",fontFamily:"monospace",fontSize:12}}})]},s.id))]}),e.jsxs(u,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mt:2},children:[e.jsx(d,{variant:"subtitle1",sx:{color:"grey.300",mb:2},children:"Dependencies"}),e.jsxs(t,{sx:{mb:2},children:[e.jsxs(t,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:1},children:[e.jsx(d,{variant:"caption",sx:{color:"grey.500"},children:"Maven"}),e.jsx(x,{size:"small",onClick:()=>v(T),sx:{color:"grey.500"},children:e.jsx(I,{fontSize:"small"})})]}),e.jsx(u,{sx:{bgcolor:"#0a0a0a",p:1,border:"1px solid #333"},children:e.jsx(d,{component:"pre",sx:{fontFamily:"monospace",fontSize:10,color:"#d4d4d4",m:0,whiteSpace:"pre-wrap"},children:T})})]}),e.jsxs(t,{children:[e.jsxs(t,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:1},children:[e.jsx(d,{variant:"caption",sx:{color:"grey.500"},children:"Gradle"}),e.jsx(x,{size:"small",onClick:()=>v(L),sx:{color:"grey.500"},children:e.jsx(I,{fontSize:"small"})})]}),e.jsx(u,{sx:{bgcolor:"#0a0a0a",p:1,border:"1px solid #333"},children:e.jsx(d,{component:"pre",sx:{fontFamily:"monospace",fontSize:10,color:"#d4d4d4",m:0,whiteSpace:"pre-wrap"},children:L})})]})]})]}),e.jsxs(t,{sx:{width:550,borderLeft:"1px solid #222",display:"flex",flexDirection:"column"},children:[e.jsx(t,{sx:{p:2,borderBottom:"1px solid #222"},children:e.jsxs(d,{variant:"subtitle2",sx:{color:"grey.400"},children:[a.mapperName,".java"]})}),e.jsx(t,{sx:{flex:1,p:2,overflow:"auto"},children:e.jsx(u,{sx:{bgcolor:"#0a0a0a",p:2,border:"1px solid #333",height:"100%"},children:e.jsx(d,{component:"pre",sx:{fontFamily:"monospace",fontSize:11,color:"#d4d4d4",m:0,whiteSpace:"pre-wrap"},children:M})})})]})]}),e.jsx(ee,{open:b.open,autoHideDuration:2e3,onClose:()=>z({...b,open:!1}),message:b.message})]})}export{ve as default};
//# sourceMappingURL=App-DThqPOOQ.js.map
