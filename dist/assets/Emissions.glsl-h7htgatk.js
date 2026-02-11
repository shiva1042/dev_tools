import{jM as y,dF as f}from"./Expand-BjFL9QNU.js";import{t as c,n as m}from"./glsl-B5bJgrnA.js";let u=class{constructor(s,t,i,r,o=null){if(this.name=s,this.type=t,this.arraySize=o,this.bind={0:null,1:null,2:null},r)switch(i){case void 0:break;case 0:this.bind[0]=r;break;case 1:this.bind[1]=r;break;case 2:this.bind[2]=r}}equals(s){return this.type===s.type&&this.name===s.name&&this.arraySize===s.arraySize}},h=class extends u{constructor(s,t,i){super(s,"float",1,(r,o,n)=>r.setUniform1f(s,t(o,n),i))}},C=class extends u{constructor(s,t){super(s,"sampler2D",1,(i,r,o)=>i.bindTexture(s,t(r,o)))}};function w(e){return e===4||e===5||e===6||e===7||e===8}function I(e){return S(e)||e===3}function g(e){return e===9||e===10}function N(e){return p(e)||g(e)}function p(e){return e===0}function d(e){return p(e)||U(e)}function _(e){return d(e)||e===10}function T(e){return d(e)||g(e)}function S(e){return T(e)||$(e)}function $(e){return e===2}function U(e){return e===1}function H(e){return $(e)||w(e)}let V=class extends u{constructor(s,t,i){super(s,"vec3",1,(r,o,n)=>r.setUniform3fv(s,t(o,n),i))}},A=class extends u{constructor(s,t,i){super(s,"vec3",2,(r,o,n,v)=>r.setUniform3fv(s,t(o,n,v),i))}};function G(e,s){switch(s.textureCoordinateType){case 1:return e.attributes.add("uv0","vec2"),e.varyings.add("vuv0","vec2"),void e.vertex.code.add(c`void forwardTextureCoordinates() { vuv0 = uv0; }`);case 2:return e.attributes.add("uv0","vec2"),e.attributes.add("uvRegion","vec4"),e.varyings.add("vuv0","vec2"),e.varyings.add("vuvRegion","vec4"),void e.vertex.code.add(c`void forwardTextureCoordinates() {
vuv0 = uv0;
vuvRegion = uvRegion;
}`);default:y(s.textureCoordinateType);case 0:return void e.vertex.code.add(c`void forwardTextureCoordinates() {}`);case 3:return}}let z=class extends u{constructor(s,t,i){super(s,"float",2,(r,o,n)=>r.setUniform1f(s,t(o,n),i))}};function k(e){e.fragment.code.add(c`vec4 textureAtlasLookup(sampler2D tex, vec2 textureCoordinates, vec4 atlasRegion) {
vec2 atlasScale = atlasRegion.zw - atlasRegion.xy;
vec2 uvAtlas = fract(textureCoordinates) * atlasScale + atlasRegion.xy;
float maxdUV = 0.125;
vec2 dUVdx = clamp(dFdx(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
vec2 dUVdy = clamp(dFdy(textureCoordinates), -maxdUV, maxdUV) * atlasScale;
return textureGrad(tex, uvAtlas, dUVdx, dUVdy);
}`)}function F(e,s){const{textureCoordinateType:t}=s;if(t===0||t===3)return;e.include(G,s);const i=t===2;i&&e.include(k),e.fragment.code.add(c`
    vec4 textureLookup(sampler2D tex, vec2 uv) {
      return ${i?"textureAtlasLookup(tex, uv, vuvRegion)":"texture(tex, uv)"};
    }
  `)}let M=class extends u{constructor(s,t){super(s,"sampler2D",2,(i,r,o)=>i.bindTexture(s,t(r,o)))}};function R(e){e.code.add(c`
    const float GAMMA = ${c.float(f)};
    const float INV_GAMMA = ${c.float(1/f)};

    vec4 delinearizeGamma(vec4 color) {
      return vec4(pow(color.rgb, vec3(INV_GAMMA)), color.a);
    }

    vec3 linearizeGamma(vec3 color) {
      return pow(color, vec3(GAMMA));
    }
  `)}const Q=1,E=1;function W(e,s){if(!d(s.output))return;e.fragment.include(R);const{emissionSource:t,hasEmissiveTextureTransform:i,bindType:r}=s,o=t===3||t===4||t===5;o&&(e.include(F,s),e.fragment.uniforms.add(r===1?new C("texEmission",a=>a.textureEmissive):new M("texEmission",a=>a.textureEmissive)));const n=t===2||o;n&&e.fragment.uniforms.add(r===1?new V("emissiveBaseColor",a=>a.emissiveBaseColor):new A("emissiveBaseColor",a=>a.emissiveBaseColor));const v=t!==0;v&&!(t===7||t===6||t===4||t===5)&&e.fragment.uniforms.add(r===1?new h("emissiveStrength",a=>a.emissiveStrength):new z("emissiveStrength",a=>a.emissiveStrength));const l=t===7,x=t===5,b=t===1||t===6||l;e.fragment.code.add(c`
    vec4 getEmissions(vec3 symbolColor) {
      vec4 emissions = ${n?x?"emissiveSource == 0 ? vec4(emissiveBaseColor, 1.0): vec4(linearizeGamma(symbolColor), 1.0)":"vec4(emissiveBaseColor, 1.0)":b?l?"emissiveSource == 0 ? vec4(0.0): vec4(linearizeGamma(symbolColor), 1.0)":"vec4(linearizeGamma(symbolColor), 1.0)":"vec4(0.0)"};
      ${m(o,`${m(x,`if(emissiveSource == 0) {
              vec4 emissiveFromTex = textureLookup(texEmission, ${i?"emissiveUV":"vuv0"});
              emissions *= vec4(linearizeGamma(emissiveFromTex.rgb), emissiveFromTex.a);
           }`,`vec4 emissiveFromTex = textureLookup(texEmission, ${i?"emissiveUV":"vuv0"});
           emissions *= vec4(linearizeGamma(emissiveFromTex.rgb), emissiveFromTex.a);`)}
        emissions.w = emissions.rgb == vec3(0.0) ? 0.0: emissions.w;`)}
      ${m(v,`emissions.rgb *= emissiveStrength * ${c.float(E)};`)}
      return emissions;
    }
  `)}export{h as a,G as b,C as c,Q as d,R as e,F as f,M as g,V as h,u as i,A as j,I as k,H as l,U as m,w as n,d as o,T as p,$ as q,z as r,S as s,g as t,N as u,p as v,_ as w,W as x};
//# sourceMappingURL=Emissions.glsl-h7htgatk.js.map
