import{r as c,j as e,L as z}from"./index-D7pXJXkH.js";import{B as s,I as u,H as I,T as a,P as f}from"./Paper-Cyl37ja4.js";import{F as B,I as L,S as F,T as h}from"./TextField-DuDeyOSB.js";import{M as G}from"./MenuItem-C1kwkJyb.js";import{C as g}from"./Chip-sxSLqfvX.js";import{C as y}from"./ContentCopy-PE5Vu7Zm.js";import{T as D,a as $}from"./Tab-qKNGPrBq.js";import{T as H}from"./Tooltip-BpGEyTYM.js";import{S as O}from"./Snackbar-CXSrz_ev.js";import"./Modal-D7HjXXDN.js";import"./index-TG-1g2lY.js";import"./listItemIconClasses-DDVksOcs.js";import"./listItemTextClasses-Dg6klgp1.js";import"./dividerClasses-B6nfchaP.js";const v={auth_code:{name:"Authorization Code",description:"Standard flow for server-side apps. Most secure for confidential clients."},auth_code_pkce:{name:"Authorization Code + PKCE",description:"Recommended for SPAs and mobile apps. Uses code verifier/challenge instead of client secret."},client_credentials:{name:"Client Credentials",description:"Machine-to-machine authentication. No user interaction required."},implicit:{name:"Implicit (Deprecated)",deprecated:!0,description:"Legacy flow for SPAs. Tokens returned directly in URL fragment. Use PKCE instead."},ropc:{name:"Resource Owner Password (Deprecated)",deprecated:!0,description:"User provides credentials directly. Only for trusted first-party apps."},device_code:{name:"Device Code",description:"For input-constrained devices (TVs, CLI tools). User authorizes on a separate device."}},J=["Client App","User/Browser","Auth Server","Resource Server"],m={"Client App":"#1565c0","User/Browser":"#2e7d32","Auth Server":"#e65100","Resource Server":"#6a1b9a"};function ae(){const[d,A]=c.useState("auth_code"),[o,T]=c.useState("my-client-id"),[n,j]=c.useState("http://localhost:3000/callback"),[i,R]=c.useState("openid profile email"),[t,U]=c.useState("https://auth.example.com"),[x,E]=c.useState(0),[C,b]=c.useState(""),_=c.useCallback(r=>{navigator.clipboard.writeText(r),b("Copied!")},[]),w="dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",S="E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",P=(()=>{const r=`${t}/authorize?response_type=code&client_id=${o}&redirect_uri=${encodeURIComponent(n)}&scope=${encodeURIComponent(i)}&state=random_state_value`;switch(d){case"auth_code":return[{from:"Client App",to:"User/Browser",label:"1. Redirect to Auth Server",description:"Client redirects user to authorization endpoint",request:`GET ${r}`,response:"HTTP 302 Redirect to Auth Server login page"},{from:"User/Browser",to:"Auth Server",label:"2. User Authenticates",description:"User enters credentials and consents",request:"User submits login form to Auth Server",response:`HTTP 302 Location: ${n}?code=AUTH_CODE_HERE&state=random_state_value`},{from:"Auth Server",to:"Client App",label:"3. Authorization Code Returned",description:"Auth server redirects back with authorization code",request:`GET ${n}?code=AUTH_CODE_HERE&state=random_state_value`,response:"Client receives the authorization code"},{from:"Client App",to:"Auth Server",label:"4. Exchange Code for Tokens",description:"Client exchanges authorization code for tokens (server-side)",request:`POST ${t}/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE_HERE
&redirect_uri=${n}
&client_id=${o}
&client_secret=CLIENT_SECRET`,response:`{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBh...",
  "id_token": "eyJhbG..."
}`},{from:"Client App",to:"Resource Server",label:"5. Access Protected Resource",description:"Use access token to call API",request:`GET https://api.example.com/userinfo
Authorization: Bearer eyJhbG...`,response:`{
  "sub": "user123",
  "name": "John Doe",
  "email": "john@example.com"
}`}];case"auth_code_pkce":return[{from:"Client App",to:"Client App",label:"1. Generate PKCE Codes",description:"Generate code_verifier and code_challenge",request:`code_verifier = "${w}"
code_challenge = BASE64URL(SHA256(code_verifier))
  = "${S}"`,response:"Stored locally in client app"},{from:"Client App",to:"User/Browser",label:"2. Redirect to Auth Server",description:"Redirect with PKCE challenge",request:`GET ${r}&code_challenge=${S}&code_challenge_method=S256`,response:"HTTP 302 Redirect to Auth Server"},{from:"User/Browser",to:"Auth Server",label:"3. User Authenticates",description:"User logs in and consents",request:"User submits credentials",response:`HTTP 302 Location: ${n}?code=AUTH_CODE&state=random_state_value`},{from:"Client App",to:"Auth Server",label:"4. Exchange Code + Verifier",description:"Exchange code with verifier (no client_secret needed)",request:`POST ${t}/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE
&redirect_uri=${n}
&client_id=${o}
&code_verifier=${w}`,response:`{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBh..."
}`},{from:"Client App",to:"Resource Server",label:"5. Access Resource",description:"Call API with access token",request:`GET https://api.example.com/resource
Authorization: Bearer eyJhbG...`,response:'{ "data": "protected resource" }'}];case"client_credentials":return[{from:"Client App",to:"Auth Server",label:"1. Request Token",description:"Client authenticates directly with credentials",request:`POST ${t}/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=${o}
&client_secret=CLIENT_SECRET
&scope=${encodeURIComponent(i)}`,response:`{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600
}`},{from:"Client App",to:"Resource Server",label:"2. Access Resource",description:"Use token to access API",request:`GET https://api.example.com/resource
Authorization: Bearer eyJhbG...`,response:'{ "data": "protected resource" }'}];case"implicit":return[{from:"Client App",to:"User/Browser",label:"1. Redirect to Auth Server",description:"Token returned directly (no code exchange)",request:`GET ${t}/authorize?response_type=token&client_id=${o}&redirect_uri=${encodeURIComponent(n)}&scope=${encodeURIComponent(i)}&state=random_state`,response:"HTTP 302 to Auth Server"},{from:"User/Browser",to:"Auth Server",label:"2. User Authenticates",description:"User logs in",request:"User submits credentials",response:`HTTP 302 Location: ${n}#access_token=eyJhbG...&token_type=Bearer&expires_in=3600&state=random_state`},{from:"Auth Server",to:"Client App",label:"3. Token in Fragment",description:"Token is in URL fragment (never sent to server)",request:`${n}#access_token=eyJhbG...`,response:"Client extracts token from window.location.hash"}];case"ropc":return[{from:"User/Browser",to:"Client App",label:"1. User Provides Credentials",description:"User enters credentials directly in client app",request:`username: john@example.com
password: ********`,response:"Credentials stored temporarily in client"},{from:"Client App",to:"Auth Server",label:"2. Exchange Credentials for Tokens",description:"Client sends credentials to token endpoint",request:`POST ${t}/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&username=john@example.com
&password=user_password
&client_id=${o}
&scope=${encodeURIComponent(i)}`,response:`{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBh..."
}`}];case"device_code":return[{from:"Client App",to:"Auth Server",label:"1. Request Device Code",description:"Device requests a user code",request:`POST ${t}/device/code
Content-Type: application/x-www-form-urlencoded

client_id=${o}&scope=${encodeURIComponent(i)}`,response:`{
  "device_code": "GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS",
  "user_code": "WDJB-MJHT",
  "verification_uri": "${t}/device",
  "expires_in": 1800,
  "interval": 5
}`},{from:"Client App",to:"User/Browser",label:"2. Display User Code",description:"Show code and URL to user",request:`Go to: ${t}/device
Enter code: WDJB-MJHT`,response:"User opens URL on phone/computer"},{from:"User/Browser",to:"Auth Server",label:"3. User Authorizes",description:"User enters code and authorizes",request:"User enters WDJB-MJHT and logs in",response:"Authorization granted"},{from:"Client App",to:"Auth Server",label:"4. Poll for Token",description:"Device polls token endpoint",request:`POST ${t}/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:device_code
&device_code=GmRhmhcxhwAzkoEqiMEg_DnyEysNkuNhszIySk9eS
&client_id=${o}`,response:`{
  "access_token": "eyJhbG...",
  "token_type": "Bearer",
  "expires_in": 3600
}`}]}})(),k=(r=>{const l={auth_code:`// Node.js - Authorization Code Flow
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/login', (req, res) => {
  const url = '${t}/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: '${o}',
    redirect_uri: '${n}', scope: '${i}',
    state: crypto.randomBytes(16).toString('hex'),
  });
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const { data } = await axios.post('${t}/token', new URLSearchParams({
    grant_type: 'authorization_code', code,
    redirect_uri: '${n}', client_id: '${o}',
    client_secret: process.env.CLIENT_SECRET,
  }));
  res.json({ access_token: data.access_token });
});`,auth_code_pkce:`// Node.js - PKCE Flow
const crypto = require('crypto');
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

app.get('/login', (req, res) => {
  const { verifier, challenge } = generatePKCE();
  req.session.codeVerifier = verifier;
  const url = '${t}/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: '${o}',
    redirect_uri: '${n}', scope: '${i}',
    code_challenge: challenge, code_challenge_method: 'S256',
  });
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { data } = await axios.post('${t}/token', new URLSearchParams({
    grant_type: 'authorization_code', code: req.query.code,
    redirect_uri: '${n}', client_id: '${o}',
    code_verifier: req.session.codeVerifier,
  }));
  res.json(data);
});`,client_credentials:`// Node.js - Client Credentials
const axios = require('axios');
async function getToken() {
  const { data } = await axios.post('${t}/token', new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: '${o}',
    client_secret: process.env.CLIENT_SECRET,
    scope: '${i}',
  }));
  return data.access_token;
}`,implicit:`// JavaScript SPA - Implicit Flow (Deprecated)
function login() {
  window.location.href = '${t}/authorize?' + new URLSearchParams({
    response_type: 'token', client_id: '${o}',
    redirect_uri: '${n}', scope: '${i}',
  });
}
function handleCallback() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}`,ropc:`// Node.js - ROPC Flow (Deprecated)
async function login(username, password) {
  const { data } = await axios.post('${t}/token', new URLSearchParams({
    grant_type: 'password', username, password,
    client_id: '${o}', scope: '${i}',
  }));
  return data;
}`,device_code:`// Node.js - Device Code Flow
async function deviceFlow() {
  const { data: device } = await axios.post('${t}/device/code', new URLSearchParams({
    client_id: '${o}', scope: '${i}',
  }));
  console.log(\`Go to \${device.verification_uri} and enter: \${device.user_code}\`);
  while (true) {
    await new Promise(r => setTimeout(r, device.interval * 1000));
    try {
      const { data } = await axios.post('${t}/token', new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: device.device_code, client_id: '${o}',
      }));
      return data.access_token;
    } catch (e) { if (e.response?.data?.error !== 'authorization_pending') throw e; }
  }
}`},q={auth_code:`# Python - Authorization Code Flow
import requests
from flask import Flask, redirect, request

app = Flask(__name__)

@app.route('/login')
def login():
    return redirect(f'${t}/authorize?response_type=code&client_id=${o}'
                    f'&redirect_uri=${n}&scope=${i}')

@app.route('/callback')
def callback():
    code = request.args.get('code')
    resp = requests.post('${t}/token', data={
        'grant_type': 'authorization_code', 'code': code,
        'redirect_uri': '${n}', 'client_id': '${o}',
        'client_secret': os.environ['CLIENT_SECRET'],
    })
    return resp.json()`,auth_code_pkce:`# Python - PKCE Flow
import hashlib, base64, secrets
def generate_pkce():
    verifier = secrets.token_urlsafe(32)
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode()).digest()
    ).rstrip(b'=').decode()
    return verifier, challenge`,client_credentials:`# Python - Client Credentials
resp = requests.post('${t}/token', data={
    'grant_type': 'client_credentials',
    'client_id': '${o}',
    'client_secret': os.environ['CLIENT_SECRET'],
    'scope': '${i}',
})
token = resp.json()['access_token']`,implicit:"# Implicit flow is browser-only; not applicable to Python servers.",ropc:`# Python - ROPC (Deprecated)
resp = requests.post('${t}/token', data={
    'grant_type': 'password',
    'username': username, 'password': password,
    'client_id': '${o}', 'scope': '${i}',
})`,device_code:`# Python - Device Code Flow
import time, requests
resp = requests.post('${t}/device/code', data={
    'client_id': '${o}', 'scope': '${i}'
}).json()
print(f"Go to {resp['verification_uri']} and enter: {resp['user_code']}")
while True:
    time.sleep(resp['interval'])
    token_resp = requests.post('${t}/token', data={
        'grant_type': 'urn:ietf:params:oauth:grant-type:device_code',
        'device_code': resp['device_code'], 'client_id': '${o}',
    }).json()
    if 'access_token' in token_resp: break`};return[l[r],q[r]]})(d),p={"& .MuiOutlinedInput-root":{"& fieldset":{borderColor:"#333"},"&:hover fieldset":{borderColor:"#555"},"&.Mui-focused fieldset":{borderColor:"#1976d2"}},"& .MuiInputLabel-root":{color:"grey.500"},"& .MuiInputBase-input":{color:"grey.300"},"& .MuiSelect-icon":{color:"grey.500"}};return e.jsxs(s,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a",color:"grey.300",p:3},children:[e.jsxs(s,{sx:{maxWidth:1e3,mx:"auto"},children:[e.jsxs(s,{sx:{display:"flex",alignItems:"center",gap:1,mb:3},children:[e.jsx(z,{to:"/",children:e.jsx(u,{size:"small",sx:{color:"grey.500"},children:e.jsx(I,{})})}),e.jsx(a,{variant:"h5",sx:{fontWeight:700},children:"OAuth2 Flow Visualizer"})]}),e.jsxs(f,{sx:{bgcolor:"#111",border:"1px solid #222",p:3,mb:3},children:[e.jsxs(s,{sx:{display:"flex",gap:2,flexWrap:"wrap",mb:2},children:[e.jsxs(B,{size:"small",sx:{minWidth:260,...p},children:[e.jsx(L,{sx:{color:"grey.500"},children:"OAuth2 Flow"}),e.jsx(F,{value:d,label:"OAuth2 Flow",onChange:r=>A(r.target.value),sx:{color:"grey.300"},children:Object.entries(v).map(([r,l])=>e.jsx(G,{value:r,children:l.name},r))})]}),v[d].deprecated&&e.jsx(g,{label:"DEPRECATED",size:"small",color:"warning"})]}),e.jsx(a,{variant:"body2",sx:{color:"grey.500",mb:2},children:v[d].description}),e.jsxs(s,{sx:{display:"flex",gap:2,flexWrap:"wrap"},children:[e.jsx(h,{size:"small",label:"Client ID",value:o,onChange:r=>T(r.target.value),sx:{flex:1,minWidth:200,...p}}),e.jsx(h,{size:"small",label:"Redirect URI",value:n,onChange:r=>j(r.target.value),sx:{flex:1,minWidth:250,...p}}),e.jsx(h,{size:"small",label:"Scopes",value:i,onChange:r=>R(r.target.value),sx:{flex:1,minWidth:200,...p}}),e.jsx(h,{size:"small",label:"Auth Server URL",value:t,onChange:r=>U(r.target.value),sx:{flex:1,minWidth:250,...p}})]})]}),e.jsxs(f,{sx:{bgcolor:"#111",border:"1px solid #222",p:3,mb:3},children:[e.jsx(a,{variant:"subtitle1",sx:{fontWeight:600,mb:2},children:"Flow Diagram"}),e.jsx(s,{sx:{display:"flex",gap:2,mb:3,flexWrap:"wrap"},children:J.map(r=>e.jsxs(s,{sx:{display:"flex",alignItems:"center",gap:.5},children:[e.jsx(s,{sx:{width:12,height:12,borderRadius:"50%",bgcolor:m[r]}}),e.jsx(a,{variant:"caption",sx:{color:"grey.400"},children:r})]},r))}),P.map((r,l)=>e.jsxs(s,{sx:{mb:3,pl:2,borderLeft:`3px solid ${m[r.from]}`},children:[e.jsxs(s,{sx:{display:"flex",alignItems:"center",gap:1,mb:.5},children:[e.jsx(g,{label:r.from,size:"small",sx:{bgcolor:m[r.from],color:"#fff",fontSize:11}}),e.jsx(a,{variant:"caption",sx:{color:"grey.600"},children:"->"}),e.jsx(g,{label:r.to,size:"small",sx:{bgcolor:m[r.to],color:"#fff",fontSize:11}}),e.jsx(a,{variant:"subtitle2",sx:{color:"grey.300"},children:r.label})]}),e.jsx(a,{variant:"body2",sx:{color:"grey.500",mb:1},children:r.description}),e.jsxs(s,{sx:{display:"flex",gap:2,flexWrap:"wrap"},children:[e.jsxs(s,{sx:{flex:1,minWidth:250},children:[e.jsxs(s,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx(a,{variant:"caption",sx:{color:"grey.600"},children:"Request"}),e.jsx(u,{size:"small",onClick:()=>_(r.request),sx:{color:"grey.600"},children:e.jsx(y,{sx:{fontSize:14}})})]}),e.jsx(s,{component:"pre",sx:{bgcolor:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:1,p:1,color:"#90caf9",fontSize:11,fontFamily:"monospace",whiteSpace:"pre-wrap",overflow:"auto",maxHeight:150,m:0},children:r.request})]}),e.jsxs(s,{sx:{flex:1,minWidth:250},children:[e.jsxs(s,{sx:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx(a,{variant:"caption",sx:{color:"grey.600"},children:"Response"}),e.jsx(u,{size:"small",onClick:()=>_(r.response),sx:{color:"grey.600"},children:e.jsx(y,{sx:{fontSize:14}})})]}),e.jsx(s,{component:"pre",sx:{bgcolor:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:1,p:1,color:"#81c784",fontSize:11,fontFamily:"monospace",whiteSpace:"pre-wrap",overflow:"auto",maxHeight:150,m:0},children:r.response})]})]})]},l))]}),e.jsxs(f,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsxs(s,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs(D,{value:x,onChange:(r,l)=>E(l),sx:{"& .MuiTab-root":{color:"grey.500",fontSize:12,textTransform:"none"},"& .Mui-selected":{color:"#90caf9"}},children:[e.jsx($,{label:"Node.js"}),e.jsx($,{label:"Python"})]}),e.jsx(H,{title:"Copy",children:e.jsx(u,{onClick:()=>_(k[x]),sx:{color:"grey.400"},children:e.jsx(y,{})})})]}),e.jsx(s,{component:"pre",sx:{color:"#ce93d8",fontFamily:"monospace",fontSize:12,overflow:"auto",maxHeight:500,whiteSpace:"pre-wrap",m:0,mt:1},children:k[x]})]})]}),e.jsx(O,{open:!!C,autoHideDuration:2e3,onClose:()=>b(""),message:C})]})}export{ae as default};
//# sourceMappingURL=App-C7syoNRb.js.map
