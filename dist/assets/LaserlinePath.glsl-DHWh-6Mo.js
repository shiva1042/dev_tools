import{b6 as o,eK as pe,bb as T,kP as ue,b0 as Y,dW as q,c$ as fe,aU as _,br as $,a$ as z,be as K,qb as ge,aY as b,jz as Z,kw as J,dv as ee,h5 as me,aQ as _e,gi as be,ha as ve,cw as Pe,b7 as te,cc as we,aP as N,bq as U,rv as Ve,b9 as De,_ as u,dD as xe,wr as R,cd as Ee,g as S,k as ye,ws as Le,aR as W}from"./Expand-EkfAPcFa.js";import{t as Se}from"./VisualElement-ZrPfd1aw.js";import{y as Ce,a as Me,R as Ae,p as $e,b as Re}from"./frustum-CN-6xvq_.js";import{k as Te,aa as Oe,v as Ue,a4 as qe,am as C,A as Ie,y as ie,a3 as M,a6 as ne,a7 as ae,a8 as je,a9 as ze,R as Ne,x as We,p as Fe,aY as He,aA as D,ab as Be,ac as F,bk as Ge}from"./Texture-C2zBWbFI.js";import{e as ke,r as Qe}from"./Compositing.glsl-DY79jPv1.js";import{Q as se,t as Xe}from"./InterleavedLayout-poEi2x4k.js";import{r as Ye}from"./OverlayCompositing.glsl-Dt6zOAZ7.js";import{r as Ke}from"./VertexBuffer-Jo8jcKG-.js";import{_ as re}from"./index-BkyuEPT-.js";import{t as r,n as H}from"./glsl-B5bJgrnA.js";import{s as le}from"./ShaderBuilder-BgZ-6npi.js";import{a as f,h as w,c as B}from"./Emissions.glsl-B7ZnG-oy.js";let G=class{constructor(e){this._renderCoordsHelper=e,this._origin=o(),this._dirty=!1,this._count=0}set vertices(e){const n=pe(3*e.length);let i=0;for(const a of e)n[i++]=a[0],n[i++]=a[1],n[i++]=a[2];this.buffers=[n]}set buffers(e){if(this._buffers=e,this._buffers.length>0){const n=this._buffers[0],i=3*Math.floor(n.length/3/2);T(this._origin,n[i],n[i+1],n[i+2])}else T(this._origin,0,0,0);this._dirty=!0}get origin(){return this._origin}draw(e){const n=this._ensureVAO(e);n!=null&&(e.bindVAO(n),e.drawArrays(ue.TRIANGLES,0,this._count))}dispose(){this._vao!=null&&this._vao.dispose()}get _layout(){return this._renderCoordsHelper.viewingMode===1?Je:et}_ensureVAO(e){return this._buffers==null?null:(this._vao??=this._createVAO(e,this._buffers),this._ensureVertexData(this._vao,this._buffers),this._vao)}_createVAO(e,n){const i=this._createDataBuffer(n);return this._dirty=!1,new Ye(e,new Ke(e,Xe(this._layout),i))}_ensureVertexData(e,n){if(!this._dirty)return;const i=this._createDataBuffer(n);e.buffer()?.setData(i),this._dirty=!1}_createDataBuffer(e){const n=e.reduce((g,c)=>g+k(c),0);this._count=n;const i=this._layout.createBuffer(n),a=this._origin;let s=0,l=0;const d="startUp"in i?this._setUpVectors.bind(this,i):void 0;for(const g of e){for(let c=0;c<g.length;c+=3){const L=T(Q,g[c],g[c+1],g[c+2]);c===0?l=this._renderCoordsHelper.getAltitude(L):this._renderCoordsHelper.setAltitude(L,l);const m=s+2*c;d?.(c,m,g,L);const j=Y(Q,L,a);if(c<g.length-3){for(let v=0;v<6;v++)i.start.setVec(m+v,j);i.extrude.setValues(m,0,-1),i.extrude.setValues(m+1,1,-1),i.extrude.setValues(m+2,1,1),i.extrude.setValues(m+3,0,-1),i.extrude.setValues(m+4,1,1),i.extrude.setValues(m+5,0,1)}if(c>0)for(let v=-6;v<0;v++)i.end.setVec(m+v,j)}s+=k(g)}return i.buffer}_setUpVectors(e,n,i,a,s){const l=this._renderCoordsHelper.worldUpAtPosition(s,Ze);if(n<a.length-3)for(let d=0;d<6;d++)e.startUp.setVec(i+d,l);if(n>0)for(let d=-6;d<0;d++)e.endUp.setVec(i+d,l)}};function k(t){return 3*(2*(t.length/3-1))}const Ze=o(),Q=o(),Je=se().vec3f("start").vec3f("end").vec2f("extrude").vec3f("startUp").vec3f("endUp"),et=se().vec3f("start").vec3f("end").vec2f("extrude");function oe(t,e){const n=t.fragment;n.include(Te),t.include(Oe),n.include(ke),n.uniforms.add(new f("globalAlpha",i=>i.globalAlpha),new w("glowColor",i=>i.glowColor),new f("glowWidth",(i,a)=>i.glowWidth*a.camera.pixelRatio),new f("glowFalloff",i=>i.glowFalloff),new w("innerColor",i=>i.innerColor),new f("innerWidth",(i,a)=>i.innerWidth*a.camera.pixelRatio),new Ue("depthMap",i=>i.depth?.attachment),new B("normalMap",i=>i.normals)),n.code.add(r`vec4 premultipliedColor(vec3 rgb, float alpha) {
return vec4(rgb * alpha, alpha);
}`),n.code.add(r`vec4 laserlineProfile(float dist) {
if (dist > glowWidth) {
return vec4(0.0);
}
float innerAlpha = (1.0 - smoothstep(0.0, innerWidth, dist));
float glowAlpha = pow(max(0.0, 1.0 - dist / glowWidth), glowFalloff);
return blendColorsPremultiplied(
premultipliedColor(innerColor, innerAlpha),
premultipliedColor(glowColor, glowAlpha)
);
}`),n.code.add(r`bool laserlineReconstructFromDepth(out vec3 pos, out vec3 normal, out float angleCutoffAdjust, out float depthDiscontinuityAlpha) {
float depth = depthFromTexture(depthMap, uv);
if (depth == 1.0) {
return false;
}
float linearDepth = linearizeDepth(depth);
pos = reconstructPosition(gl_FragCoord.xy, linearDepth);
float minStep = 6e-8;
float depthStep = clamp(depth + minStep, 0.0, 1.0);
float linearDepthStep = linearizeDepth(depthStep);
float depthError = abs(linearDepthStep - linearDepth);
vec3 normalReconstructed = normalize(cross(dFdx(pos), dFdy(pos)));
vec3 normalFromTexture = normalize(texture(normalMap, uv).xyz * 2.0 - 1.0);
float blendFactor = smoothstep(0.15, 0.2, depthError);
normal = normalize(mix(normalReconstructed, normalFromTexture, blendFactor));
angleCutoffAdjust = mix(0.0, 0.004, blendFactor);
float ddepth = fwidth(linearDepth);
depthDiscontinuityAlpha = 1.0 - smoothstep(0.0, 0.01, -ddepth / linearDepth);
return true;
}`),e.contrastControlEnabled?n.uniforms.add(new B("frameColor",(i,a)=>i.colors),new f("globalAlphaContrastBoost",i=>i.globalAlphaContrastBoost)).code.add(r`float rgbToLuminance(vec3 color) {
return dot(vec3(0.2126, 0.7152, 0.0722), color);
}
vec4 laserlineOutput(vec4 color) {
float backgroundLuminance = rgbToLuminance(texture(frameColor, uv).rgb);
float alpha = clamp(globalAlpha * max(backgroundLuminance * globalAlphaContrastBoost, 1.0), 0.0, 1.0);
return color * alpha;
}`):n.code.add(r`vec4 laserlineOutput(vec4 color) {
return color * globalAlpha;
}`)}const I=q(6);function ce(t){const e=new le;e.include(qe),e.include(oe,t);const n=e.fragment;if(t.lineVerticalPlaneEnabled||t.heightManifoldEnabled)if(n.uniforms.add(new f("maxPixelDistance",(i,a)=>t.heightManifoldEnabled?2*a.camera.computeScreenPixelSizeAt(i.heightManifoldTarget):2*a.camera.computeScreenPixelSizeAt(i.lineVerticalPlaneSegment.origin))),n.code.add(r`float planeDistancePixels(vec4 plane, vec3 pos) {
float dist = dot(plane.xyz, pos) + plane.w;
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}`),t.spherical){const i=(s,l,d)=>_(s,l.heightManifoldTarget,d.camera.viewMatrix),a=(s,l)=>_(s,[0,0,0],l.camera.viewMatrix);n.uniforms.add(new C("heightManifoldOrigin",(s,l)=>(i(p,s,l),a(V,l),Y(V,V,p),$(h,V),h[3]=z(V),h)),new Ie("globalOrigin",s=>a(p,s)),new f("cosSphericalAngleThreshold",(s,l)=>1-Math.max(2,K(l.camera.eye,s.heightManifoldTarget)*l.camera.perRenderPixelRatio)/z(s.heightManifoldTarget))),n.code.add(r`float globeDistancePixels(float posInGlobalOriginLength) {
float dist = abs(posInGlobalOriginLength - heightManifoldOrigin.w);
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}
float heightManifoldDistancePixels(vec4 heightPlane, vec3 pos) {
vec3 posInGlobalOriginNorm = normalize(globalOrigin - pos);
float cosAngle = dot(posInGlobalOriginNorm, heightManifoldOrigin.xyz);
vec3 posInGlobalOrigin = globalOrigin - pos;
float posInGlobalOriginLength = length(posInGlobalOrigin);
float sphericalDistance = globeDistancePixels(posInGlobalOriginLength);
float planarDistance = planeDistancePixels(heightPlane, pos);
return cosAngle < cosSphericalAngleThreshold ? sphericalDistance : planarDistance;
}`)}else n.code.add(r`float heightManifoldDistancePixels(vec4 heightPlane, vec3 pos) {
return planeDistancePixels(heightPlane, pos);
}`);if(t.pointDistanceEnabled&&(n.uniforms.add(new f("maxPixelDistance",(i,a)=>2*a.camera.computeScreenPixelSizeAt(i.pointDistanceTarget))),n.code.add(r`float sphereDistancePixels(vec4 sphere, vec3 pos) {
float dist = distance(sphere.xyz, pos) - sphere.w;
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}`)),t.intersectsLineEnabled&&n.uniforms.add(new ie("perScreenPixelRatio",i=>i.camera.perScreenPixelRatio)).code.add(r`float lineDistancePixels(vec3 start, vec3 dir, float radius, vec3 pos) {
float dist = length(cross(dir, pos - start)) / (length(pos) * perScreenPixelRatio);
return abs(dist) - radius;
}`),(t.lineVerticalPlaneEnabled||t.intersectsLineEnabled)&&n.code.add(r`bool pointIsWithinLine(vec3 pos, vec3 start, vec3 end) {
vec3 dir = end - start;
float t2 = dot(dir, pos - start);
float l2 = dot(dir, dir);
return t2 >= 0.0 && t2 <= l2;
}`),n.main.add(r`vec3 pos;
vec3 normal;
float angleCutoffAdjust;
float depthDiscontinuityAlpha;
if (!laserlineReconstructFromDepth(pos, normal, angleCutoffAdjust, depthDiscontinuityAlpha)) {
fragColor = vec4(0.0);
return;
}
vec4 color = vec4(0.0);`),t.heightManifoldEnabled){n.uniforms.add(new M("angleCutoff",a=>A(a)),new C("heightPlane",(a,s)=>he(a.heightManifoldTarget,a.renderCoordsHelper.worldUpAtPosition(a.heightManifoldTarget,p),s.camera.viewMatrix)));const i=t.spherical?r`normalize(globalOrigin - pos)`:r`heightPlane.xyz`;n.main.add(r`
      vec2 angleCutoffAdjusted = angleCutoff - angleCutoffAdjust;
      // Fade out laserlines on flat surfaces
      float heightManifoldAlpha = 1.0 - smoothstep(angleCutoffAdjusted.x, angleCutoffAdjusted.y, abs(dot(normal, ${i})));
      vec4 heightManifoldColor = laserlineProfile(heightManifoldDistancePixels(heightPlane, pos));
      color = max(color, heightManifoldColor * heightManifoldAlpha);`)}return t.pointDistanceEnabled&&(n.uniforms.add(new M("angleCutoff",i=>A(i)),new C("pointDistanceSphere",(i,a)=>ge(tt(i,a)))),n.main.add(r`float pointDistanceSphereDistance = sphereDistancePixels(pointDistanceSphere, pos);
vec4 pointDistanceSphereColor = laserlineProfile(pointDistanceSphereDistance);
float pointDistanceSphereAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, abs(dot(normal, normalize(pos - pointDistanceSphere.xyz))));
color = max(color, pointDistanceSphereColor * pointDistanceSphereAlpha);`)),t.lineVerticalPlaneEnabled&&(n.uniforms.add(new M("angleCutoff",i=>A(i)),new C("lineVerticalPlane",(i,a)=>it(i,a)),new w("lineVerticalStart",(i,a)=>nt(i,a)),new w("lineVerticalEnd",(i,a)=>at(i,a))),n.main.add(r`if (pointIsWithinLine(pos, lineVerticalStart, lineVerticalEnd)) {
float lineVerticalDistance = planeDistancePixels(lineVerticalPlane, pos);
vec4 lineVerticalColor = laserlineProfile(lineVerticalDistance);
float lineVerticalAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, abs(dot(normal, lineVerticalPlane.xyz)));
color = max(color, lineVerticalColor * lineVerticalAlpha);
}`)),t.intersectsLineEnabled&&(n.uniforms.add(new M("angleCutoff",i=>A(i)),new w("intersectsLineStart",(i,a)=>_(p,i.lineStartWorld,a.camera.viewMatrix)),new w("intersectsLineEnd",(i,a)=>_(p,i.lineEndWorld,a.camera.viewMatrix)),new w("intersectsLineDirection",(i,a)=>(b(h,i.intersectsLineSegment.vector),h[3]=0,$(p,Z(h,h,a.camera.viewMatrix)))),new f("intersectsLineRadius",i=>i.intersectsLineRadius)),n.main.add(r`if (pointIsWithinLine(pos, intersectsLineStart, intersectsLineEnd)) {
float intersectsLineDistance = lineDistancePixels(intersectsLineStart, intersectsLineDirection, intersectsLineRadius, pos);
vec4 intersectsLineColor = laserlineProfile(intersectsLineDistance);
float intersectsLineAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, 1.0 - abs(dot(normal, intersectsLineDirection)));
color = max(color, intersectsLineColor * intersectsLineAlpha);
}`)),n.main.add(r`fragColor = laserlineOutput(color * depthDiscontinuityAlpha);`),e}function A(t){return J(st,Math.cos(t.angleCutoff),Math.cos(Math.max(0,t.angleCutoff-q(2))))}function tt(t,e){const n=_(ot,t.pointDistanceOrigin,e.camera.viewMatrix),i=K(t.pointDistanceOrigin,t.pointDistanceTarget);return be(ct,n,i)}function it(t,e){const n=ve(t.lineVerticalPlaneSegment,.5,p),i=t.renderCoordsHelper.worldUpAtPosition(n,rt),a=$(V,t.lineVerticalPlaneSegment.vector),s=Pe(p,i,a);return $(s,s),he(t.lineVerticalPlaneSegment.origin,s,e.camera.viewMatrix)}function nt(t,e){const n=b(p,t.lineVerticalPlaneSegment.origin);return t.renderCoordsHelper.setAltitude(n,0),_(n,n,e.camera.viewMatrix)}function at(t,e){const n=te(p,t.lineVerticalPlaneSegment.origin,t.lineVerticalPlaneSegment.vector);return t.renderCoordsHelper.setAltitude(n,0),_(n,n,e.camera.viewMatrix)}function he(t,e,n){return _(X,t,n),b(h,e),h[3]=0,Z(h,h,n),me(X,h,lt)}const st=ee(),p=o(),h=fe(),rt=o(),V=o(),X=o(),lt=_e(),ot=o(),ct=we(),ht=Object.freeze(Object.defineProperty({__proto__:null,build:ce,defaultAngleCutoff:I},Symbol.toStringTag,{value:"Module"}));class dt extends ze{constructor(){super(...arguments),this.innerColor=N(1,1,1),this.innerWidth=1,this.glowColor=N(1,.5,0),this.glowWidth=8,this.glowFalloff=8,this.globalAlpha=.75,this.globalAlphaContrastBoost=2,this.angleCutoff=q(6),this.pointDistanceOrigin=o(),this.pointDistanceTarget=o(),this.lineVerticalPlaneSegment=U(),this.intersectsLineSegment=U(),this.intersectsLineRadius=3,this.heightManifoldTarget=o(),this.lineStartWorld=o(),this.lineEndWorld=o()}}class pt extends ne{constructor(e,n){super(e,n,new ae(ht,()=>re(()=>Promise.resolve().then(()=>vt),void 0)),je)}}function de(t){const e=new le;e.include(oe,t);const{vertex:n,fragment:i}=e;n.uniforms.add(new Ne("modelView",(s,{camera:l})=>Ve(ft,l.viewMatrix,s.origin)),new We("proj",({camera:s})=>s.projectionMatrix),new f("glowWidth",(s,{camera:l})=>s.glowWidth*l.pixelRatio),new Fe("pixelToNDC",({camera:s})=>J(ut,2/s.fullViewport[2],2/s.fullViewport[3]))),e.attributes.add("start","vec3"),e.attributes.add("end","vec3"),t.spherical&&(e.attributes.add("startUp","vec3"),e.attributes.add("endUp","vec3")),e.attributes.add("extrude","vec2"),e.varyings.add("uv","vec2"),e.varyings.add("vViewStart","vec3"),e.varyings.add("vViewEnd","vec3"),e.varyings.add("vViewSegmentNormal","vec3"),e.varyings.add("vViewStartNormal","vec3"),e.varyings.add("vViewEndNormal","vec3");const a=!t.spherical;return n.main.add(r`
    vec3 pos = mix(start, end, extrude.x);

    vec4 viewPos = modelView * vec4(pos, 1);
    vec4 projPos = proj * viewPos;
    vec2 ndcPos = projPos.xy / projPos.w;

    // in planar we hardcode the up vectors to be Z-up */
    ${H(a,r`vec3 startUp = vec3(0, 0, 1);`)}
    ${H(a,r`vec3 endUp = vec3(0, 0, 1);`)}

    // up vector corresponding to the location of the vertex, selecting either startUp or endUp */
    vec3 up = extrude.y * mix(startUp, endUp, extrude.x);
    vec3 viewUp = (modelView * vec4(up, 0)).xyz;

    vec4 projPosUp = proj * vec4(viewPos.xyz + viewUp, 1);
    vec2 projUp = normalize(projPosUp.xy / projPosUp.w - ndcPos);

    // extrude ndcPos along projUp to the edge of the screen
    vec2 lxy = abs(sign(projUp) - ndcPos);
    ndcPos += length(lxy) * projUp;

    vViewStart = (modelView * vec4(start, 1)).xyz;
    vViewEnd = (modelView * vec4(end, 1)).xyz;

    vec3 viewStartEndDir = vViewEnd - vViewStart;

    vec3 viewStartUp = (modelView * vec4(startUp, 0)).xyz;

    // the normal of the plane that aligns with the segment and the up vector
    vViewSegmentNormal = normalize(cross(viewStartUp, viewStartEndDir));

    // the normal orthogonal to the segment normal and the start up vector
    vViewStartNormal = -normalize(cross(vViewSegmentNormal, viewStartUp));

    // the normal orthogonal to the segment normal and the end up vector
    vec3 viewEndUp = (modelView * vec4(endUp, 0)).xyz;
    vViewEndNormal = normalize(cross(vViewSegmentNormal, viewEndUp));

    // Add enough padding in the X screen space direction for "glow"
    float xPaddingPixels = sign(dot(vViewSegmentNormal, viewPos.xyz)) * (extrude.x * 2.0 - 1.0) * glowWidth;
    ndcPos.x += xPaddingPixels * pixelToNDC.x;

    // uv is used to read back depth to reconstruct the position at the fragment
    uv = ndcPos * 0.5 + 0.5;

    gl_Position = vec4(ndcPos, 0, 1);
  `),i.uniforms.add(new ie("perScreenPixelRatio",s=>s.camera.perScreenPixelRatio)),i.code.add(r`float planeDistance(vec3 planeNormal, vec3 planeOrigin, vec3 pos) {
return dot(planeNormal, pos - planeOrigin);
}
float segmentDistancePixels(vec3 segmentNormal, vec3 startNormal, vec3 endNormal, vec3 pos, vec3 start, vec3 end) {
float distSegmentPlane = planeDistance(segmentNormal, start, pos);
float distStartPlane = planeDistance(startNormal, start, pos);
float distEndPlane = planeDistance(endNormal, end, pos);
float dist = max(max(distStartPlane, distEndPlane), abs(distSegmentPlane));
float width = fwidth(distSegmentPlane);
float maxPixelDistance = length(pos) * perScreenPixelRatio * 2.0;
float pixelDist = dist / min(width, maxPixelDistance);
return abs(pixelDist);
}`),i.main.add(r`fragColor = vec4(0.0);
vec3 dEndStart = vViewEnd - vViewStart;
if (dot(dEndStart, dEndStart) < 1e-5) {
return;
}
vec3 pos;
vec3 normal;
float angleCutoffAdjust;
float depthDiscontinuityAlpha;
if (!laserlineReconstructFromDepth(pos, normal, angleCutoffAdjust, depthDiscontinuityAlpha)) {
return;
}
float distance = segmentDistancePixels(
vViewSegmentNormal,
vViewStartNormal,
vViewEndNormal,
pos,
vViewStart,
vViewEnd
);
vec4 color = laserlineProfile(distance);
float alpha = (1.0 - smoothstep(0.995 - angleCutoffAdjust, 0.999 - angleCutoffAdjust, abs(dot(normal, vViewSegmentNormal))));
fragColor = laserlineOutput(color * alpha * depthDiscontinuityAlpha);`),e}const ut=ee(),ft=De(),gt=Object.freeze(Object.defineProperty({__proto__:null,build:de},Symbol.toStringTag,{value:"Module"}));class mt extends dt{constructor(){super(...arguments),this.origin=o()}}class O extends ne{constructor(e,n){super(e,n,new ae(gt,()=>re(()=>Promise.resolve().then(()=>Pt),void 0)),_t)}}const _t=new Map([["start",0],["end",1],["extrude",2],["startUp",3],["endUp",4]]);class y extends He{constructor(){super(...arguments),this.contrastControlEnabled=!1,this.spherical=!1}}u([D()],y.prototype,"contrastControlEnabled",void 0),u([D()],y.prototype,"spherical",void 0);class E extends y{constructor(){super(...arguments),this.heightManifoldEnabled=!1,this.pointDistanceEnabled=!1,this.lineVerticalPlaneEnabled=!1,this.intersectsLineEnabled=!1}}u([D()],E.prototype,"heightManifoldEnabled",void 0),u([D()],E.prototype,"pointDistanceEnabled",void 0),u([D()],E.prototype,"lineVerticalPlaneEnabled",void 0),u([D()],E.prototype,"intersectsLineEnabled",void 0);let P=class extends Be{constructor(t){super(t),this.isDecoration=!0,this.produces=F.LASERLINES,this.consumes={required:[F.LASERLINES,"normals"]},this.requireGeometryDepth=!0,this._configuration=new E,this._pathTechniqueConfiguration=new y,this._heightManifoldEnabled=!1,this._pointDistanceEnabled=!1,this._lineVerticalPlaneEnabled=!1,this._intersectsLineEnabled=!1,this._intersectsLineInfinite=!1,this._pathVerticalPlaneEnabled=!1,this._passParameters=new mt;const e=t.view.stage.renderView.techniques,n=new y;n.contrastControlEnabled=t.contrastControlEnabled,e.precompile(O,n)}initialize(){this._passParameters.renderCoordsHelper=this.view.renderCoordsHelper,this._pathTechniqueConfiguration.spherical=this.view.state.viewingMode===1,this._pathTechniqueConfiguration.contrastControlEnabled=this.contrastControlEnabled,this._techniques.precompile(O,this._pathTechniqueConfiguration),this._blit=new Qe(this._techniques,2)}destroy(){this._pathVerticalPlaneData=xe(this._pathVerticalPlaneData),this._blit=null}get _techniques(){return this.view.stage.renderView.techniques}get heightManifoldEnabled(){return this._heightManifoldEnabled}set heightManifoldEnabled(t){this._heightManifoldEnabled!==t&&(this._heightManifoldEnabled=t,this.requestRender(1))}get heightManifoldTarget(){return this._passParameters.heightManifoldTarget}set heightManifoldTarget(t){b(this._passParameters.heightManifoldTarget,t),this.requestRender(1)}get pointDistanceEnabled(){return this._pointDistanceEnabled}set pointDistanceEnabled(t){t!==this._pointDistanceEnabled&&(this._pointDistanceEnabled=t,this.requestRender(1))}get pointDistanceTarget(){return this._passParameters.pointDistanceTarget}set pointDistanceTarget(t){b(this._passParameters.pointDistanceTarget,t),this.requestRender(1)}get pointDistanceOrigin(){return this._passParameters.pointDistanceOrigin}set pointDistanceOrigin(t){b(this._passParameters.pointDistanceOrigin,t),this.requestRender(1)}get lineVerticalPlaneEnabled(){return this._lineVerticalPlaneEnabled}set lineVerticalPlaneEnabled(t){t!==this._lineVerticalPlaneEnabled&&(this._lineVerticalPlaneEnabled=t,this.requestRender(1))}get lineVerticalPlaneSegment(){return this._passParameters.lineVerticalPlaneSegment}set lineVerticalPlaneSegment(t){R(t,this._passParameters.lineVerticalPlaneSegment),this.requestRender(1)}get intersectsLineEnabled(){return this._intersectsLineEnabled}set intersectsLineEnabled(t){t!==this._intersectsLineEnabled&&(this._intersectsLineEnabled=t,this.requestRender(1))}get intersectsLineSegment(){return this._passParameters.intersectsLineSegment}set intersectsLineSegment(t){R(t,this._passParameters.intersectsLineSegment),this.requestRender(1)}get intersectsLineInfinite(){return this._intersectsLineInfinite}set intersectsLineInfinite(t){t!==this._intersectsLineInfinite&&(this._intersectsLineInfinite=t,this.requestRender(1))}get pathVerticalPlaneEnabled(){return this._pathVerticalPlaneEnabled}set pathVerticalPlaneEnabled(t){t!==this._pathVerticalPlaneEnabled&&(this._pathVerticalPlaneEnabled=t,this._pathVerticalPlaneData!=null&&this.requestRender(1))}set pathVerticalPlaneVertices(t){this._pathVerticalPlaneData==null&&(this._pathVerticalPlaneData=new G(this._passParameters.renderCoordsHelper)),this._pathVerticalPlaneData.vertices=t,this.pathVerticalPlaneEnabled&&this.requestRender(1)}set pathVerticalPlaneBuffers(t){this._pathVerticalPlaneData==null&&(this._pathVerticalPlaneData=new G(this._passParameters.renderCoordsHelper)),this._pathVerticalPlaneData.buffers=t,this.pathVerticalPlaneEnabled&&this.requestRender(1)}setParameters(t){Ge(this._passParameters,t)&&this.requestRender(1)}precompile(){this._acquireTechnique()}render(t){const e=t.find(({name:l})=>l===this.produces);if(this.isDecoration&&!this.bindParameters.decorations||this._blit==null)return e;const n=this.renderingContext,i=t.find(({name:l})=>l==="normals");this._passParameters.normals=i?.getTexture();const a=()=>{(this.heightManifoldEnabled||this.pointDistanceEnabled||this.lineVerticalPlaneSegment||this.intersectsLineEnabled)&&this._renderUnified(),this.pathVerticalPlaneEnabled&&this._renderPath()};if(!this.contrastControlEnabled)return n.bindFramebuffer(e.fbo),a(),e;this._passParameters.colors=e.getTexture();const s=this.fboCache.acquire(e.fbo.width,e.fbo.height,"laser lines");return n.bindFramebuffer(s.fbo),n.setClearColor(0,0,0,0),n.clear(16640),a(),n.unbindTexture(e.getTexture()),this._blit.blend(n,s,e,this.bindParameters)||this.requestRender(1),s.release(),e}_acquireTechnique(){return this._configuration.heightManifoldEnabled=this.heightManifoldEnabled,this._configuration.lineVerticalPlaneEnabled=this.lineVerticalPlaneEnabled,this._configuration.pointDistanceEnabled=this.pointDistanceEnabled,this._configuration.intersectsLineEnabled=this.intersectsLineEnabled,this._configuration.contrastControlEnabled=this.contrastControlEnabled,this._configuration.spherical=this.view.state.viewingMode===1,this._techniques.get(pt,this._configuration)}_renderUnified(){if(!this._updatePassParameters())return;const t=this._acquireTechnique();if(t.compiled){const e=this.renderingContext;e.bindTechnique(t,this.bindParameters,this._passParameters),e.screen.draw()}else this.requestRender(1)}_renderPath(){if(this._pathVerticalPlaneData==null)return;const t=this._techniques.get(O,this._pathTechniqueConfiguration);if(t.compiled){const e=this.renderingContext;this._passParameters.origin=this._pathVerticalPlaneData.origin,e.bindTechnique(t,this.bindParameters,this._passParameters),this._pathVerticalPlaneData.draw(e)}else this.requestRender(1)}_updatePassParameters(){if(!this._intersectsLineEnabled)return!0;const t=this.bindParameters.camera,e=this._passParameters;if(this._intersectsLineInfinite){if(Ce(Ee(e.intersectsLineSegment.origin,e.intersectsLineSegment.vector),x),x.c0=-Number.MAX_VALUE,!Ae(t.frustum,x))return!1;$e(x,e.lineStartWorld),Re(x,e.lineEndWorld)}else b(e.lineStartWorld,e.intersectsLineSegment.origin),te(e.lineEndWorld,e.intersectsLineSegment.origin,e.intersectsLineSegment.vector);return!0}get test(){}};u([S({constructOnly:!0})],P.prototype,"contrastControlEnabled",void 0),u([S()],P.prototype,"isDecoration",void 0),u([S()],P.prototype,"produces",void 0),u([S()],P.prototype,"consumes",void 0),P=u([ye("esri.views.3d.webgl-engine.effects.laserlines.LaserLineRenderer")],P);const x=Me();class Tt extends Se{constructor(e){super(e),this._angleCutoff=I,this._style={},this._heightManifoldTarget=o(),this._heightManifoldEnabled=!1,this._intersectsLine=U(),this._intersectsLineEnabled=!1,this._intersectsLineInfinite=!1,this._lineVerticalPlaneSegment=null,this._pathVerticalPlaneBuffers=null,this._pointDistanceLine=null,this.applyProperties(e)}get testData(){}createResources(){this._ensureRenderer()}destroyResources(){this._disposeRenderer()}updateVisibility(){this._syncRenderer(),this._syncHeightManifold(),this._syncIntersectsLine(),this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance()}get angleCutoff(){return this._angleCutoff}set angleCutoff(e){this._angleCutoff!==e&&(this._angleCutoff=e,this._syncAngleCutoff())}get style(){return this._style}set style(e){this._style=e,this._syncStyle()}get heightManifoldTarget(){return this._heightManifoldEnabled?this._heightManifoldTarget:null}set heightManifoldTarget(e){e!=null?(b(this._heightManifoldTarget,e),this._heightManifoldEnabled=!0):this._heightManifoldEnabled=!1,this._syncRenderer(),this._syncHeightManifold()}set intersectsWorldUpAtLocation(e){if(e==null)return void(this.intersectsLine=null);const n=this.view.renderCoordsHelper.worldUpAtPosition(e,bt);this.intersectsLine=Le(e,n),this.intersectsLineInfinite=!0}get intersectsLine(){return this._intersectsLineEnabled?this._intersectsLine:null}set intersectsLine(e){e!=null?(R(e,this._intersectsLine),this._intersectsLineEnabled=!0):this._intersectsLineEnabled=!1,this._syncIntersectsLine(),this._syncRenderer()}get intersectsLineInfinite(){return this._intersectsLineInfinite}set intersectsLineInfinite(e){this._intersectsLineInfinite=e,this._syncIntersectsLineInfinite()}get lineVerticalPlaneSegment(){return this._lineVerticalPlaneSegment}set lineVerticalPlaneSegment(e){this._lineVerticalPlaneSegment=e!=null?R(e):null,this._syncLineVerticalPlane(),this._syncRenderer()}get pathVerticalPlane(){return this._pathVerticalPlaneBuffers}set pathVerticalPlane(e){this._pathVerticalPlaneBuffers=e,this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance(),this._syncRenderer()}get pointDistanceLine(){return this._pointDistanceLine}set pointDistanceLine(e){this._pointDistanceLine=e!=null?{origin:W(e.origin),target:e.target?W(e.target):null}:null,this._syncPointDistance(),this._syncRenderer()}get isDecoration(){return this._isDecoration}set isDecoration(e){this._isDecoration=e,this._renderer&&(this._renderer.isDecoration=e)}_syncRenderer(){this.attached&&this.visible&&(this._intersectsLineEnabled||this._heightManifoldEnabled||this._pointDistanceLine!=null||this._pathVerticalPlaneBuffers!=null)?this._ensureRenderer():this._disposeRenderer()}_ensureRenderer(){this._renderer==null&&(this._renderer=new P({view:this.view,contrastControlEnabled:!0,isDecoration:this.isDecoration}),this._syncStyle(),this._syncHeightManifold(),this._syncIntersectsLine(),this._syncIntersectsLineInfinite(),this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance(),this._syncAngleCutoff())}_syncStyle(){this._renderer!=null&&this._renderer.setParameters(this._style)}_syncAngleCutoff(){this._renderer?.setParameters({angleCutoff:this._angleCutoff})}_syncHeightManifold(){this._renderer!=null&&(this._renderer.heightManifoldEnabled=this._heightManifoldEnabled&&this.visible,this._heightManifoldEnabled&&(this._renderer.heightManifoldTarget=this._heightManifoldTarget))}_syncIntersectsLine(){this._renderer!=null&&(this._renderer.intersectsLineEnabled=this._intersectsLineEnabled&&this.visible,this._intersectsLineEnabled&&(this._renderer.intersectsLineSegment=this._intersectsLine))}_syncIntersectsLineInfinite(){this._renderer!=null&&(this._renderer.intersectsLineInfinite=this._intersectsLineInfinite)}_syncPathVerticalPlane(){this._renderer!=null&&(this._renderer.pathVerticalPlaneEnabled=this._pathVerticalPlaneBuffers!=null&&this.visible,this._pathVerticalPlaneBuffers!=null&&(this._renderer.pathVerticalPlaneBuffers=this._pathVerticalPlaneBuffers))}_syncLineVerticalPlane(){this._renderer!=null&&(this._renderer.lineVerticalPlaneEnabled=this._lineVerticalPlaneSegment!=null&&this.visible,this._lineVerticalPlaneSegment!=null&&(this._renderer.lineVerticalPlaneSegment=this._lineVerticalPlaneSegment))}_syncPointDistance(){if(this._renderer==null)return;const e=this._pointDistanceLine,n=e!=null;this._renderer.pointDistanceEnabled=n&&e.target!=null&&this.visible,n&&(this._renderer.pointDistanceOrigin=e.origin,e.target!=null&&(this._renderer.pointDistanceTarget=e.target))}_disposeRenderer(){this._renderer!=null&&this.view.stage&&(this._renderer.destroy(),this._renderer=null)}forEachMaterial(){}}const bt=o(),vt=Object.freeze(Object.defineProperty({__proto__:null,build:ce,defaultAngleCutoff:I},Symbol.toStringTag,{value:"Module"})),Pt=Object.freeze(Object.defineProperty({__proto__:null,build:de},Symbol.toStringTag,{value:"Module"}));export{Tt as c};
//# sourceMappingURL=LaserlinePath.glsl-DHWh-6Mo.js.map
