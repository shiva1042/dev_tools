import{j as e,r as b,L as $}from"./index-D7pXJXkH.js";import{c as T,j as N,B as o,I as f,H as A,T as s,P as y}from"./Paper-Cyl37ja4.js";import{A as S}from"./Add-CL53DhVf.js";import{D as F}from"./Delete-ChrOPmnB.js";import{P as L}from"./Print-Djt-2ALf.js";import{T as E,C as R}from"./CssBaseline-DeS9gcvM.js";import{B as C}from"./Button-BJgHq-zh.js";import{G as n}from"./Grid-DMJTgXcA.js";import{T as a,F as B,I as W,S as k}from"./TextField-DuDeyOSB.js";import{D as v}from"./Divider-B9yt4ut0.js";import{M as q}from"./MenuItem-C1kwkJyb.js";import{T as O}from"./TableContainer-C19E4kdv.js";import{T as U,a as z,b as x,c as H}from"./TableRow-1P7jHd41.js";import{T as G}from"./TableHead-15RDn3et.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./dividerClasses-B6nfchaP.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";const M=T(e.jsx("path",{d:"M18 17H6v-2h12zm0-4H6v-2h12zm0-4H6V7h12zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2z"})),V=N({palette:{mode:"dark",primary:{main:"#10b981"},background:{default:"#0f172a",paper:"#1e293b"}}}),D=[{code:"USD",symbol:"$"},{code:"EUR",symbol:"€"},{code:"GBP",symbol:"£"},{code:"INR",symbol:"₹"},{code:"JPY",symbol:"¥"},{code:"CAD",symbol:"C$"},{code:"AUD",symbol:"A$"}];function me(){const g=b.useRef(null),[t,r]=b.useState({invoiceNumber:"INV-001",invoiceDate:new Date().toISOString().split("T")[0],dueDate:new Date(Date.now()+720*60*60*1e3).toISOString().split("T")[0],fromName:"Your Company Name",fromAddress:`123 Business Street
City, State 12345`,fromEmail:"billing@company.com",fromPhone:"+1 (555) 123-4567",toName:"Client Company",toAddress:`456 Client Avenue
City, State 67890`,toEmail:"accounts@client.com",toPhone:"+1 (555) 987-6543",items:[{id:"1",description:"Web Development Services",quantity:40,unitPrice:75},{id:"2",description:"UI/UX Design",quantity:20,unitPrice:85}],notes:`Thank you for your business!
Payment is due within 30 days.`,taxRate:10,currency:"USD"}),c=()=>D.find(i=>i.code===t.currency)?.symbol||"$",m=t.items.reduce((i,d)=>i+d.quantity*d.unitPrice,0),h=m*(t.taxRate/100),j=m+h,P=()=>{r({...t,items:[...t.items,{id:Date.now().toString(),description:"",quantity:1,unitPrice:0}]})},I=i=>{r({...t,items:t.items.filter(d=>d.id!==i)})},u=(i,d,l)=>{r({...t,items:t.items.map(p=>p.id===i?{...p,[d]:l}:p)})},w=()=>{if(!g.current)return;const d=window.open("","_blank");d&&(d.document.write(`
      <html>
        <head>
          <title>Invoice ${t.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .title { font-size: 32px; font-weight: bold; color: #10b981; }
            .section { margin-bottom: 24px; }
            .label { font-weight: bold; color: #666; font-size: 12px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: bold; }
            .totals { text-align: right; }
            .total-row { font-size: 18px; font-weight: bold; }
            .notes { background: #f9f9f9; padding: 16px; border-radius: 4px; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">INVOICE</div>
            <div>
              <div><strong>${t.invoiceNumber}</strong></div>
              <div>Date: ${t.invoiceDate}</div>
              <div>Due: ${t.dueDate}</div>
            </div>
          </div>
          <div style="display: flex; gap: 40px; margin-bottom: 30px;">
            <div class="section" style="flex: 1;">
              <div class="label">FROM</div>
              <div><strong>${t.fromName}</strong></div>
              <div style="white-space: pre-line;">${t.fromAddress}</div>
              <div>${t.fromEmail}</div>
              <div>${t.fromPhone}</div>
            </div>
            <div class="section" style="flex: 1;">
              <div class="label">BILL TO</div>
              <div><strong>${t.toName}</strong></div>
              <div style="white-space: pre-line;">${t.toAddress}</div>
              <div>${t.toEmail}</div>
              <div>${t.toPhone}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${t.items.map(l=>`
                <tr>
                  <td>${l.description}</td>
                  <td>${l.quantity}</td>
                  <td>${c()}${l.unitPrice.toFixed(2)}</td>
                  <td>${c()}${(l.quantity*l.unitPrice).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="totals">
            <div>Subtotal: ${c()}${m.toFixed(2)}</div>
            <div>Tax (${t.taxRate}%): ${c()}${h.toFixed(2)}</div>
            <div class="total-row">Total: ${c()}${j.toFixed(2)}</div>
          </div>
          ${t.notes?`<div class="notes"><strong>Notes:</strong><br/>${t.notes}</div>`:""}
        </body>
      </html>
    `),d.document.close(),d.print())};return e.jsxs(E,{theme:V,children:[e.jsx(R,{}),e.jsx(o,{sx:{minHeight:"100vh",p:3},children:e.jsxs(o,{sx:{maxWidth:1400,mx:"auto"},children:[e.jsxs(o,{sx:{display:"flex",alignItems:"center",mb:3,gap:2},children:[e.jsx(f,{component:$,to:"/",size:"small",children:e.jsx(A,{})}),e.jsx(M,{sx:{color:"primary.main",fontSize:32}}),e.jsx(s,{variant:"h5",fontWeight:600,color:"primary.main",children:"Invoice Generator"}),e.jsx(o,{sx:{flexGrow:1}}),e.jsx(C,{variant:"outlined",startIcon:e.jsx(L,{}),onClick:w,children:"Print / Save PDF"})]}),e.jsxs(n,{container:!0,spacing:3,children:[e.jsx(n,{size:{xs:12,lg:6},children:e.jsxs(y,{sx:{p:3},children:[e.jsx(s,{variant:"h6",gutterBottom:!0,children:"Invoice Details"}),e.jsxs(n,{container:!0,spacing:2,children:[e.jsx(n,{size:{xs:4},children:e.jsx(a,{fullWidth:!0,size:"small",label:"Invoice Number",value:t.invoiceNumber,onChange:i=>r({...t,invoiceNumber:i.target.value})})}),e.jsx(n,{size:{xs:4},children:e.jsx(a,{fullWidth:!0,size:"small",type:"date",label:"Invoice Date",value:t.invoiceDate,onChange:i=>r({...t,invoiceDate:i.target.value}),InputLabelProps:{shrink:!0}})}),e.jsx(n,{size:{xs:4},children:e.jsx(a,{fullWidth:!0,size:"small",type:"date",label:"Due Date",value:t.dueDate,onChange:i=>r({...t,dueDate:i.target.value}),InputLabelProps:{shrink:!0}})})]}),e.jsx(v,{sx:{my:3}}),e.jsxs(n,{container:!0,spacing:3,children:[e.jsxs(n,{size:{xs:6},children:[e.jsx(s,{variant:"subtitle2",color:"primary",gutterBottom:!0,children:"From (Your Details)"}),e.jsxs(o,{sx:{display:"flex",flexDirection:"column",gap:1.5},children:[e.jsx(a,{size:"small",label:"Company Name",value:t.fromName,onChange:i=>r({...t,fromName:i.target.value})}),e.jsx(a,{size:"small",label:"Address",multiline:!0,rows:2,value:t.fromAddress,onChange:i=>r({...t,fromAddress:i.target.value})}),e.jsx(a,{size:"small",label:"Email",value:t.fromEmail,onChange:i=>r({...t,fromEmail:i.target.value})}),e.jsx(a,{size:"small",label:"Phone",value:t.fromPhone,onChange:i=>r({...t,fromPhone:i.target.value})})]})]}),e.jsxs(n,{size:{xs:6},children:[e.jsx(s,{variant:"subtitle2",color:"primary",gutterBottom:!0,children:"Bill To (Client)"}),e.jsxs(o,{sx:{display:"flex",flexDirection:"column",gap:1.5},children:[e.jsx(a,{size:"small",label:"Client Name",value:t.toName,onChange:i=>r({...t,toName:i.target.value})}),e.jsx(a,{size:"small",label:"Address",multiline:!0,rows:2,value:t.toAddress,onChange:i=>r({...t,toAddress:i.target.value})}),e.jsx(a,{size:"small",label:"Email",value:t.toEmail,onChange:i=>r({...t,toEmail:i.target.value})}),e.jsx(a,{size:"small",label:"Phone",value:t.toPhone,onChange:i=>r({...t,toPhone:i.target.value})})]})]})]}),e.jsx(v,{sx:{my:3}}),e.jsxs(o,{sx:{display:"flex",alignItems:"center",mb:2},children:[e.jsx(s,{variant:"subtitle2",color:"primary",children:"Line Items"}),e.jsx(o,{sx:{flexGrow:1}}),e.jsx(C,{size:"small",startIcon:e.jsx(S,{}),onClick:P,children:"Add Item"})]}),t.items.map((i,d)=>e.jsxs(o,{sx:{display:"flex",gap:1,mb:1,alignItems:"center"},children:[e.jsx(a,{size:"small",placeholder:"Description",value:i.description,onChange:l=>u(i.id,"description",l.target.value),sx:{flex:2}}),e.jsx(a,{size:"small",type:"number",placeholder:"Qty",value:i.quantity,onChange:l=>u(i.id,"quantity",parseInt(l.target.value)||0),sx:{width:80}}),e.jsx(a,{size:"small",type:"number",placeholder:"Price",value:i.unitPrice,onChange:l=>u(i.id,"unitPrice",parseFloat(l.target.value)||0),sx:{width:100}}),e.jsxs(s,{sx:{width:100,textAlign:"right"},children:[c(),(i.quantity*i.unitPrice).toFixed(2)]}),e.jsx(f,{size:"small",onClick:()=>I(i.id),color:"error",children:e.jsx(F,{fontSize:"small"})})]},i.id)),e.jsx(v,{sx:{my:3}}),e.jsxs(n,{container:!0,spacing:2,children:[e.jsx(n,{size:{xs:6},children:e.jsxs(B,{fullWidth:!0,size:"small",children:[e.jsx(W,{children:"Currency"}),e.jsx(k,{value:t.currency,label:"Currency",onChange:i=>r({...t,currency:i.target.value}),children:D.map(i=>e.jsxs(q,{value:i.code,children:[i.symbol," ",i.code]},i.code))})]})}),e.jsx(n,{size:{xs:6},children:e.jsx(a,{fullWidth:!0,size:"small",type:"number",label:"Tax Rate (%)",value:t.taxRate,onChange:i=>r({...t,taxRate:parseFloat(i.target.value)||0})})}),e.jsx(n,{size:{xs:12},children:e.jsx(a,{fullWidth:!0,size:"small",multiline:!0,rows:2,label:"Notes",value:t.notes,onChange:i=>r({...t,notes:i.target.value})})})]})]})}),e.jsx(n,{size:{xs:12,lg:6},children:e.jsxs(y,{sx:{p:4,bgcolor:"#ffffff",color:"#333"},ref:g,children:[e.jsxs(o,{sx:{display:"flex",justifyContent:"space-between",mb:4},children:[e.jsx(s,{variant:"h4",fontWeight:"bold",color:"primary.main",children:"INVOICE"}),e.jsxs(o,{sx:{textAlign:"right"},children:[e.jsx(s,{variant:"h6",children:t.invoiceNumber}),e.jsxs(s,{variant:"body2",children:["Date: ",t.invoiceDate]}),e.jsxs(s,{variant:"body2",children:["Due: ",t.dueDate]})]})]}),e.jsxs(n,{container:!0,spacing:4,sx:{mb:4},children:[e.jsxs(n,{size:{xs:6},children:[e.jsx(s,{variant:"caption",color:"text.secondary",children:"FROM"}),e.jsx(s,{fontWeight:"bold",children:t.fromName}),e.jsx(s,{variant:"body2",sx:{whiteSpace:"pre-line"},children:t.fromAddress}),e.jsx(s,{variant:"body2",children:t.fromEmail}),e.jsx(s,{variant:"body2",children:t.fromPhone})]}),e.jsxs(n,{size:{xs:6},children:[e.jsx(s,{variant:"caption",color:"text.secondary",children:"BILL TO"}),e.jsx(s,{fontWeight:"bold",children:t.toName}),e.jsx(s,{variant:"body2",sx:{whiteSpace:"pre-line"},children:t.toAddress}),e.jsx(s,{variant:"body2",children:t.toEmail}),e.jsx(s,{variant:"body2",children:t.toPhone})]})]}),e.jsx(O,{children:e.jsxs(U,{size:"small",children:[e.jsx(G,{children:e.jsxs(z,{sx:{bgcolor:"#f5f5f5"},children:[e.jsx(x,{children:e.jsx("strong",{children:"Description"})}),e.jsx(x,{align:"right",children:e.jsx("strong",{children:"Qty"})}),e.jsx(x,{align:"right",children:e.jsx("strong",{children:"Unit Price"})}),e.jsx(x,{align:"right",children:e.jsx("strong",{children:"Amount"})})]})}),e.jsx(H,{children:t.items.map(i=>e.jsxs(z,{children:[e.jsx(x,{children:i.description}),e.jsx(x,{align:"right",children:i.quantity}),e.jsxs(x,{align:"right",children:[c(),i.unitPrice.toFixed(2)]}),e.jsxs(x,{align:"right",children:[c(),(i.quantity*i.unitPrice).toFixed(2)]})]},i.id))})]})}),e.jsxs(o,{sx:{mt:3,textAlign:"right"},children:[e.jsxs(s,{children:["Subtotal: ",c(),m.toFixed(2)]}),e.jsxs(s,{children:["Tax (",t.taxRate,"%): ",c(),h.toFixed(2)]}),e.jsxs(s,{variant:"h6",fontWeight:"bold",color:"primary.main",children:["Total: ",c(),j.toFixed(2)]})]}),t.notes&&e.jsx(o,{sx:{mt:4,p:2,bgcolor:"#f9f9f9",borderRadius:1},children:e.jsxs(s,{variant:"body2",sx:{whiteSpace:"pre-line"},children:[e.jsx("strong",{children:"Notes:"}),e.jsx("br",{}),t.notes]})})]})})]})]})})]})}export{me as default};
//# sourceMappingURL=App-BIzWkcAn.js.map
