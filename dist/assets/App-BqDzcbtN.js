import{r as b,j as e,L as Z}from"./index-D7pXJXkH.js";import{B as c,P as g,I as S,H as ee,T as m}from"./Paper-Cyl37ja4.js";import{C as v}from"./Chip-sxSLqfvX.js";import{T as A}from"./Tooltip-BpGEyTYM.js";import{D as te}from"./Download-BKYGKf7U.js";import{C as se}from"./ContentCopy-PE5Vu7Zm.js";import{T as w,F as E,I as L,S as H}from"./TextField-DuDeyOSB.js";import{M as k}from"./MenuItem-C1kwkJyb.js";import{F as T}from"./FormControlLabel-CPJ5-c3p.js";import{S as R}from"./Switch-DkkzjR19.js";import{B as F}from"./Button-BJgHq-zh.js";import{A as O}from"./Add-CL53DhVf.js";import{D as U}from"./Delete-ChrOPmnB.js";import{T as oe,a as re}from"./Tab-qKNGPrBq.js";import{S as le}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";import"./SwitchBase-BJFlT-yl.js";const ne=["string","number","boolean","object","array","function","React.ReactNode","React.CSSProperties","any"];function Re(){const[C,G]=b.useState(0),[s,i]=b.useState({name:"MyComponent",type:"arrow",useTypeScript:!0,exportType:"default",props:[{id:"1",name:"title",type:"string",required:!0},{id:"2",name:"onClick",type:"function",required:!1},{id:"3",name:"children",type:"React.ReactNode",required:!1}],states:[{id:"1",name:"isLoading",type:"boolean",initialValue:"false"},{id:"2",name:"data",type:"any[]",initialValue:"[]"}],hooks:{useState:!0,useEffect:!0,useMemo:!1,useCallback:!1,useRef:!1,useContext:!1},features:{cssModule:!1,styledComponents:!1,tailwind:!0,forwardRef:!1,memo:!1}}),[M,N]=b.useState({open:!1,message:""}),q=b.useMemo(()=>{const{name:t,type:o,useTypeScript:l,exportType:a,props:d,states:h,hooks:x,features:u}=s,y=[];(o==="functional"||o==="arrow")&&y.push("React"),(x.useState||h.length>0)&&y.push("useState"),x.useEffect&&y.push("useEffect"),x.useMemo&&y.push("useMemo"),x.useCallback&&y.push("useCallback"),x.useRef&&y.push("useRef"),x.useContext&&y.push("useContext"),u.forwardRef&&y.push("forwardRef"),u.memo&&y.push("memo");let r=`import { ${y.join(", ")} } from 'react';
`;u.cssModule&&(r+=`import styles from './${t}.module.css';
`),u.styledComponents&&(r+=`import styled from 'styled-components';
`),r+=`
`,l&&d.length>0&&(r+=`interface ${t}Props {
`,d.forEach(n=>{const B=n.required?"":"?";let D=n.type;n.type==="function"&&(D="() => void"),n.type==="array"&&(D="any[]"),r+=`  ${n.name}${B}: ${D};
`}),r+=`}

`),u.styledComponents&&(r+=`const Container = styled.div\`
  display: flex;
  flex-direction: column;
  padding: 16px;
\`;

`);const j=l&&d.length>0?`props: ${t}Props`:"props",f=d.length>0?`const { ${d.map(n=>n.defaultValue?`${n.name} = ${n.defaultValue}`:n.name).join(", ")} } = props;`:"";let p="";h.length>0&&(h.forEach(n=>{const B=l?`<${n.type}>`:"";p+=`  const [${n.name}, set${n.name.charAt(0).toUpperCase()+n.name.slice(1)}] = useState${B}(${n.initialValue});
`}),p+=`
`),x.useEffect&&(p+=`  useEffect(() => {
    // Component mounted
    console.log('${t} mounted');

    return () => {
      // Cleanup
      console.log('${t} unmounted');
    };
  }, []);

`),x.useRef&&(p+=`  const containerRef = useRef${l?"<HTMLDivElement | null>":""}(null);

`),x.useMemo&&(p+=`  const computedValue = useMemo(() => {
    // Expensive computation
    return null;
  }, []);

`),x.useCallback&&(p+=`  const handleClick = useCallback(() => {
    // Handle click
  }, []);

`);let $="";if(u.styledComponents?$=`    <Container>
      <h1>{title}</h1>
      {children}
    </Container>`:u.tailwind?$=`    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {children}
    </div>`:u.cssModule?$=`    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      {children}
    </div>`:$=`    <div>
      <h1>{title}</h1>
      {children}
    </div>`,p+=`  return (
${$}
  );`,u.forwardRef){const n=l?"<HTMLDivElement, "+t+"Props>":"";o==="arrow"?(r+=`const ${t} = forwardRef${n}((${j}, ref) => {
`,f&&(r+=`  ${f}

`),r+=p,r+=`
});
`):(r+=`const ${t} = forwardRef${n}(function ${t}(${j}, ref) {
`,f&&(r+=`  ${f}

`),r+=p,r+=`
});
`)}else u.memo?o==="arrow"?(r+=`const ${t} = memo((${j}) => {
`,f&&(r+=`  ${f}

`),r+=p,r+=`
});
`):(r+=`const ${t} = memo(function ${t}(${j}) {
`,f&&(r+=`  ${f}

`),r+=p,r+=`
});
`):o==="arrow"?(r+=`const ${t} = (${j}) => {
`,f&&(r+=`  ${f}

`),r+=p,r+=`
};
`):(r+=`function ${t}(${j}) {
`,f&&(r+=`  ${f}

`),r+=p,r+=`
}
`);return(u.memo||u.forwardRef)&&(r+=`
${t}.displayName = '${t}';
`),r+=`
export ${a==="default"?"default ":""}${a==="default"?t:`{ ${t} }`};
`,r},[s]),V=b.useMemo(()=>{const{name:t,props:o,useTypeScript:l}=s;return`import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ${t} from './${t}';

describe('${t}', () => {
  const defaultProps${l?`: React.ComponentProps<typeof ${t}>`:""} = {
${o.filter(a=>a.required).map(a=>{let d="''";return a.type==="number"?d="0":a.type==="boolean"?d="false":a.type==="function"?d="jest.fn()":a.type==="array"?d="[]":a.type==="object"?d="{}":a.type==="string"&&(d="'Test'"),`    ${a.name}: ${d},`}).join(`
`)}
  };

  it('renders without crashing', () => {
    render(<${t} {...defaultProps} />);
  });

  it('renders title correctly', () => {
    render(<${t} {...defaultProps} title="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <${t} {...defaultProps}>
        <span>Child content</span>
      </${t}>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<${t} {...defaultProps} onClick={handleClick} />);

    // Add appropriate click handler test
    // await userEvent.click(screen.getByRole('button'));
    // expect(handleClick).toHaveBeenCalled();
  });
});
`},[s]),W=b.useMemo(()=>{const{name:t,props:o}=s;return`import type { Meta, StoryObj } from '@storybook/react';
import ${t} from './${t}';

const meta: Meta<typeof ${t}> = {
  title: 'Components/${t}',
  component: ${t},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
${o.map(l=>`    ${l.name}: { control: '${l.type==="boolean"?"boolean":l.type==="number"?"number":"text"}' },`).join(`
`)}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
${o.filter(l=>l.required).map(l=>{let a="''";return l.type==="number"?a="42":l.type==="boolean"?a="true":l.type==="string"&&(a="'Example'"),`    ${l.name}: ${a},`}).join(`
`)}
  },
};

export const WithChildren: Story = {
  args: {
    ...Default.args,
    children: 'Child content here',
  },
};
`},[s]),_=async t=>{await navigator.clipboard.writeText(t),N({open:!0,message:"Copied to clipboard"})},Y=()=>{const t=s.useTypeScript?"tsx":"jsx",o=[q,V,W],l=[`${s.name}.${t}`,`${s.name}.test.${t}`,`${s.name}.stories.${t}`],a=new Blob([o[C]],{type:"text/plain"}),d=URL.createObjectURL(a),h=document.createElement("a");h.href=d,h.download=l[C],h.click(),URL.revokeObjectURL(d)},J=()=>{i({...s,props:[...s.props,{id:String(Date.now()),name:"newProp",type:"string",required:!1}]})},K=t=>{i({...s,props:s.props.filter(o=>o.id!==t)})},z=(t,o)=>{i({...s,props:s.props.map(l=>l.id===t?{...l,...o}:l)})},Q=()=>{i({...s,states:[...s.states,{id:String(Date.now()),name:"newState",type:"string",initialValue:"''"}]})},X=t=>{i({...s,states:s.states.filter(o=>o.id!==t)})},P=(t,o)=>{i({...s,states:s.states.map(l=>l.id===t?{...l,...o}:l)})},I=[{label:"Component",content:q},{label:"Test",content:V},{label:"Story",content:W}];return e.jsxs(c,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[e.jsx(g,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:e.jsxs(c,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs(c,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(Z,{to:"/",children:e.jsx(S,{size:"small",sx:{color:"grey.500"},children:e.jsx(ee,{})})}),e.jsx(m,{variant:"h5",sx:{color:"white",fontWeight:600},children:"React Component Generator"}),e.jsx(v,{label:"React",size:"small",color:"info"})]}),e.jsxs(c,{sx:{display:"flex",gap:1},children:[e.jsx(A,{title:"Download",children:e.jsx(S,{onClick:Y,sx:{color:"grey.500"},children:e.jsx(te,{})})}),e.jsx(A,{title:"Copy",children:e.jsx(S,{onClick:()=>_(I[C].content),sx:{color:"grey.500"},children:e.jsx(se,{})})})]})]})}),e.jsxs(c,{sx:{display:"flex",height:"calc(100vh - 70px)"},children:[e.jsxs(c,{sx:{flex:1,p:2,overflow:"auto"},children:[e.jsxs(g,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsx(m,{variant:"subtitle1",sx:{color:"grey.300",mb:2},children:"Component Settings"}),e.jsxs(c,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(w,{size:"small",label:"Component Name",value:s.name,onChange:t=>i({...s,name:t.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsxs(E,{size:"small",sx:{minWidth:130},children:[e.jsx(L,{sx:{color:"grey.500"},children:"Type"}),e.jsxs(H,{value:s.type,label:"Type",onChange:t=>i({...s,type:t.target.value}),sx:{color:"grey.300"},children:[e.jsx(k,{value:"arrow",children:"Arrow Function"}),e.jsx(k,{value:"functional",children:"Function Declaration"})]})]}),e.jsxs(E,{size:"small",sx:{minWidth:130},children:[e.jsx(L,{sx:{color:"grey.500"},children:"Export"}),e.jsxs(H,{value:s.exportType,label:"Export",onChange:t=>i({...s,exportType:t.target.value}),sx:{color:"grey.300"},children:[e.jsx(k,{value:"default",children:"Default"}),e.jsx(k,{value:"named",children:"Named"})]})]})]}),e.jsxs(c,{sx:{display:"flex",gap:2,flexWrap:"wrap"},children:[e.jsx(T,{control:e.jsx(R,{checked:s.useTypeScript,onChange:t=>i({...s,useTypeScript:t.target.checked}),size:"small"}),label:e.jsx(m,{sx:{color:"grey.400",fontSize:12},children:"TypeScript"})}),e.jsx(T,{control:e.jsx(R,{checked:s.features.memo,onChange:t=>i({...s,features:{...s.features,memo:t.target.checked}}),size:"small"}),label:e.jsx(m,{sx:{color:"grey.400",fontSize:12},children:"React.memo"})}),e.jsx(T,{control:e.jsx(R,{checked:s.features.forwardRef,onChange:t=>i({...s,features:{...s.features,forwardRef:t.target.checked}}),size:"small"}),label:e.jsx(m,{sx:{color:"grey.400",fontSize:12},children:"forwardRef"})})]})]}),e.jsxs(g,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsx(m,{variant:"subtitle1",sx:{color:"grey.300",mb:2},children:"Styling"}),e.jsxs(c,{sx:{display:"flex",gap:1},children:[e.jsx(v,{label:"Tailwind CSS",color:s.features.tailwind?"primary":"default",onClick:()=>i({...s,features:{...s.features,tailwind:!0,cssModule:!1,styledComponents:!1}}),sx:{cursor:"pointer"}}),e.jsx(v,{label:"CSS Modules",color:s.features.cssModule?"primary":"default",onClick:()=>i({...s,features:{...s.features,cssModule:!0,tailwind:!1,styledComponents:!1}}),sx:{cursor:"pointer"}}),e.jsx(v,{label:"Styled Components",color:s.features.styledComponents?"primary":"default",onClick:()=>i({...s,features:{...s.features,styledComponents:!0,tailwind:!1,cssModule:!1}}),sx:{cursor:"pointer"}}),e.jsx(v,{label:"Plain CSS",color:!s.features.tailwind&&!s.features.cssModule&&!s.features.styledComponents?"primary":"default",onClick:()=>i({...s,features:{...s.features,tailwind:!1,cssModule:!1,styledComponents:!1}}),sx:{cursor:"pointer"}})]})]}),e.jsxs(g,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsx(m,{variant:"subtitle1",sx:{color:"grey.300",mb:2},children:"Hooks"}),e.jsx(c,{sx:{display:"flex",gap:2,flexWrap:"wrap"},children:Object.entries(s.hooks).map(([t,o])=>e.jsx(T,{control:e.jsx(R,{checked:o,onChange:l=>i({...s,hooks:{...s.hooks,[t]:l.target.checked}}),size:"small"}),label:e.jsx(m,{sx:{color:"grey.400",fontSize:12},children:t})},t))})]}),e.jsxs(g,{sx:{bgcolor:"#111",border:"1px solid #222",p:2,mb:2},children:[e.jsxs(c,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsx(m,{variant:"subtitle1",sx:{color:"grey.300"},children:"Props"}),e.jsx(F,{startIcon:e.jsx(O,{}),onClick:J,size:"small",sx:{color:"grey.400"},children:"Add Prop"})]}),s.props.map(t=>e.jsxs(c,{sx:{display:"flex",gap:2,mb:1,alignItems:"center"},children:[e.jsx(w,{size:"small",label:"Name",value:t.name,onChange:o=>z(t.id,{name:o.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsxs(E,{size:"small",sx:{minWidth:140},children:[e.jsx(L,{sx:{color:"grey.500"},children:"Type"}),e.jsx(H,{value:t.type,label:"Type",onChange:o=>z(t.id,{type:o.target.value}),sx:{color:"grey.300"},children:ne.map(o=>e.jsx(k,{value:o,children:o},o))})]}),e.jsx(T,{control:e.jsx(R,{checked:t.required,onChange:o=>z(t.id,{required:o.target.checked}),size:"small"}),label:e.jsx(m,{sx:{color:"grey.400",fontSize:11},children:"Required"})}),e.jsx(S,{size:"small",onClick:()=>K(t.id),sx:{color:"grey.500"},children:e.jsx(U,{})})]},t.id))]}),e.jsxs(g,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsxs(c,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2},children:[e.jsx(m,{variant:"subtitle1",sx:{color:"grey.300"},children:"State"}),e.jsx(F,{startIcon:e.jsx(O,{}),onClick:Q,size:"small",sx:{color:"grey.400"},children:"Add State"})]}),s.states.map(t=>e.jsxs(c,{sx:{display:"flex",gap:2,mb:1,alignItems:"center"},children:[e.jsx(w,{size:"small",label:"Name",value:t.name,onChange:o=>P(t.id,{name:o.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(w,{size:"small",label:"Type",value:t.type,onChange:o=>P(t.id,{type:o.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(w,{size:"small",label:"Initial Value",value:t.initialValue,onChange:o=>P(t.id,{initialValue:o.target.value}),sx:{flex:1,"& .MuiInputBase-root":{color:"grey.300"}}}),e.jsx(S,{size:"small",onClick:()=>X(t.id),sx:{color:"grey.500"},children:e.jsx(U,{})})]},t.id))]})]}),e.jsxs(c,{sx:{width:550,borderLeft:"1px solid #222",display:"flex",flexDirection:"column"},children:[e.jsx(c,{sx:{borderBottom:"1px solid #222"},children:e.jsx(oe,{value:C,onChange:(t,o)=>G(o),children:I.map((t,o)=>e.jsx(re,{label:t.label,sx:{color:"grey.400",fontSize:12}},o))})}),e.jsx(c,{sx:{flex:1,p:2,overflow:"auto"},children:e.jsx(g,{sx:{bgcolor:"#0a0a0a",p:2,border:"1px solid #333",height:"100%"},children:e.jsx(m,{component:"pre",sx:{fontFamily:"monospace",fontSize:11,color:"#d4d4d4",m:0,whiteSpace:"pre-wrap"},children:I[C].content})})})]})]}),e.jsx(le,{open:M.open,autoHideDuration:2e3,onClose:()=>N({...M,open:!1}),message:M.message})]})}export{Re as default};
//# sourceMappingURL=App-BqDzcbtN.js.map
