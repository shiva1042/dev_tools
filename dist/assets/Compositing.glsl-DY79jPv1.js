import{h3 as $,aY as A,bb as O,b1 as s,b0 as v,vP as f,h0 as y,br as R,oh as F,_ as p}from"./Expand-EkfAPcFa.js";import{_ as x}from"./index-BkyuEPT-.js";import{a9 as P,a4 as M,p as C,k as w,a6 as B,a7 as S,a8 as E,ay as m,aY as G,aA as g}from"./Texture-C2zBWbFI.js";import{T as _,d as b,l as D,r as j}from"./renderState-C6Fc3Ut3.js";import{t as i,n as I}from"./glsl-B5bJgrnA.js";import{s as L}from"./ShaderBuilder-BgZ-6npi.js";import{c as q,a as z}from"./Emissions.glsl-B7ZnG-oy.js";function te(t,e,r=$()){return U(t,y(e),r),R(r.direction,r.direction),r}function U(t,e,r){return X(t,t.screenToRender(e,f(s.get())),r)}function X(t,e,r){if(e==null)return null;const a=f(F(s.get(),e));if(a[2]=0,!t.unprojectFromRenderScreen(a,r.origin))return null;const o=f(F(s.get(),e));o[2]=1;const n=t.unprojectFromRenderScreen(o,s.get());return n==null?null:(v(r.direction,n,r.origin),r)}function re(t,e,r){return V(t,t.screenToRender(e,f(s.get())),r)}function V(t,e,r){A(r.origin,t.eye);const a=O(s.get(),e[0],e[1],1),o=t.unprojectFromRenderScreen(a,s.get());return o==null?null:(v(r.direction,o,r.origin),r)}function W(t){t.code.add(i`const float MAX_RGBA_FLOAT =
255.0 / 256.0 +
255.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 +
255.0 / 256.0 / 256.0 / 256.0 / 256.0;
const vec4 FIXED_POINT_FACTORS = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
vec4 float2rgba(const float value) {
float valueInValidDomain = clamp(value, 0.0, MAX_RGBA_FLOAT);
vec4 fixedPointU8 = floor(fract(valueInValidDomain * FIXED_POINT_FACTORS) * 256.0);
const float toU8AsFloat = 1.0 / 255.0;
return fixedPointU8 * toU8AsFloat;
}`),t.code.add(i`const vec4 RGBA_TO_FLOAT_FACTORS = vec4(
255.0 / (256.0),
255.0 / (256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0),
255.0 / (256.0 * 256.0 * 256.0 * 256.0)
);
float rgbaTofloat(vec4 rgba) {
return dot(rgba, RGBA_TO_FLOAT_FACTORS);
}`),t.code.add(i`const vec4 uninterpolatedRGBAToFloatFactors = vec4(
1.0 / 256.0,
1.0 / 256.0 / 256.0,
1.0 / 256.0 / 256.0 / 256.0,
1.0 / 256.0 / 256.0 / 256.0 / 256.0
);
float uninterpolatedRGBAToFloat(vec4 rgba) {
return (dot(round(rgba * 255.0), uninterpolatedRGBAToFloatFactors) - 0.5) * 2.0;
}`),t.code.add(i`const vec3 uninterpolatedRGBToFloatFactors = vec3(
1.0 / 256.0,
1.0 / 256.0 / 256.0,
1.0 / 256.0 / 256.0 / 256.0
);
float uninterpolatedRGBToFloat(vec3 rgb) {
return (dot(round(rgb * 255.0), uninterpolatedRGBToFloatFactors) - 0.5) * 2.0;
}`)}class h extends P{constructor(){super(...arguments),this.opacity=1}}function T(t){const e=new L,{blitEmissiveMode:r,blitMode:a,hasOpacityFactor:o}=t;e.include(M),e.fragment.uniforms.add(new q("tex",u=>u.texture)),o&&e.fragment.uniforms.add(new z("opacity",u=>u.opacity));const n=a===3;n&&(e.fragment.uniforms.add(new C("nearFar",u=>u.camera.nearFar)),e.fragment.include(w),e.fragment.include(W));const c=r===1;return c&&(e.outputs.add("fragColor","vec4",0),e.outputs.add("fragEmission","vec4",1)),e.fragment.main.add(i`
    ${n?i`
          float normalizedLinearDepth = (-linearDepthFromTexture(tex, uv) - nearFar[0]) / (nearFar[1] - nearFar[0]);
          fragColor = float2rgba(normalizedLinearDepth);`:i`
          fragColor = texture(tex, uv) ${o?"* opacity":""};`}
    ${I(c,"fragEmission = vec4(0.0, 0.0, 0.0, fragColor.a);")}`),e}const N=Object.freeze(Object.defineProperty({__proto__:null,CompositingPassParameters:h,build:T},Symbol.toStringTag,{value:"Module"}));class l extends B{constructor(e,r){super(e,r,new S(N,()=>x(()=>Promise.resolve().then(()=>Y),void 0)),E)}initializePipeline(e){const{blitMode:r,blitEmissiveMode:a}=e,o=a?1:0;switch(r){case 0:case 3:return _({colorWrite:b,drawBuffers:m(0,o)});case 1:return _({blending:j,colorWrite:b,drawBuffers:m(0,o)});default:return _({blending:D,colorWrite:b,drawBuffers:m(0,o)})}}}let d=class extends G{constructor(){super(...arguments),this.blitMode=0,this.blitEmissiveMode=0,this.hasOpacityFactor=!1}};p([g({count:4})],d.prototype,"blitMode",void 0),p([g({count:4})],d.prototype,"blitEmissiveMode",void 0),p([g()],d.prototype,"hasOpacityFactor",void 0);class ae{constructor(e,r=0){this._techniques=e,this._parameters=new h,this._configuration=new d,this._configuration.blitMode=r,e.precompile(l,this._configuration),this._configuration.hasOpacityFactor=!0,e.precompile(l,this._configuration),this._configuration.hasOpacityFactor=!1}blit(e,r,a,o){this.blitTexture(e,r.getTexture(),a,o)}blitTexture(e,r,a,o){e.bindFramebuffer(a.fbo),e.setClearColor(0,0,0,1),e.clear(16384),this._parameters.texture=r;const n=this._techniques.get(l,this._configuration);e.bindTechnique(n,o,this._parameters),e.screen.draw()}blend(e,r,a,o,n=1){this._configuration.hasOpacityFactor=n<1;const c=this._techniques.get(l,this._configuration);return!!c.compiled&&(e.bindFramebuffer(a.fbo),this._parameters.texture=r.getTexture(),this._parameters.opacity=n,e.bindTechnique(c,o,this._parameters),e.screen.draw(),!0)}}function ne(t){t.code.add(`
  vec4 blendColorsPremultiplied(vec4 source, vec4 dest) {
    float oneMinusSourceAlpha = 1.0 - source.a;
    return source + dest * oneMinusSourceAlpha;
  }
  `)}function ie(t,e){return t[0]=e[0]*e[3],t[1]=e[1]*e[3],t[2]=e[2]*e[3],t[3]=e[3],t}function se(t){return!!t.update}const Y=Object.freeze(Object.defineProperty({__proto__:null,CompositingPassParameters:h,build:T},Symbol.toStringTag,{value:"Module"}));export{W as a,d as b,h as c,l as d,ne as e,V as f,X as g,te as l,U as m,ie as n,re as p,ae as r,se as t};
//# sourceMappingURL=Compositing.glsl-DY79jPv1.js.map
