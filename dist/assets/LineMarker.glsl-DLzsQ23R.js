import{_ as p,bb as N,b6 as G,s7 as X,aU as R}from"./Expand-EkfAPcFa.js";import{t as Z}from"./BufferView-idZzLUwQ.js";import{c as ee,o as V,q as te,s as U}from"./Emissions.glsl-B7ZnG-oy.js";import{an as ie,Y as re,p as ae,ad as se,W as oe,x as ne,y as ce,aI as le,$ as pe,ap as de,ai as he,am as ve,a0 as ue,a6 as me,a7 as fe,ar as E,as as ge,at as I,au as Se,av as Pe,aw as ye,ax as _e,ay as we,b5 as ze,b6 as B,b7 as xe,b8 as $e,b9 as be,az as Te,aA as d,s as Ve,o as ke,ba as Oe,a$ as De,bb as We}from"./Texture-C2zBWbFI.js";import{_ as Ce}from"./index-BkyuEPT-.js";import{Q as Me}from"./InterleavedLayout-poEi2x4k.js";import{T as M,d as L,r as q}from"./renderState-C6Fc3Ut3.js";import{t as o,n as w}from"./glsl-B5bJgrnA.js";import{s as Le}from"./ShaderBuilder-BgZ-6npi.js";import{t as je,v as Ae,w as Fe,y as Y,z as H,A as Ne,B as Re}from"./RibbonLine.glsl-3vL4Ds0C.js";function J(r){const e=new Le,{space:i,anchor:t,hasTip:P,hasScreenSizePerspective:z}=r,u=i===2,g=i===1;e.include(je,r),e.include(Ae,r),e.include(ie,r);const{vertex:a,fragment:S,varyings:y}=e;re(a,r),e.attributes.add("position","vec3"),e.attributes.add("previousDelta","vec4"),e.attributes.add("uv0","vec2"),y.add("vColor","vec4"),y.add("vpos","vec3",{invariant:!0}),y.add("vUV","vec2"),y.add("vSize","float"),P&&y.add("vLineWidth","float"),a.uniforms.add(new ae("nearFar",({camera:l})=>l.nearFar),new se("viewport",({camera:l})=>l.fullViewport)).code.add(o`vec4 projectAndScale(vec4 pos) {
vec4 posNdc = proj * pos;
posNdc.xy *= viewport.zw / posNdc.w;
return posNdc;
}`),a.code.add(o`void clip(vec4 pos, inout vec4 prev) {
float vnp = nearFar[0] * 0.99;
if (prev.z > -nearFar[0]) {
float interpolation = (-vnp - pos.z) / (prev.z - pos.z);
prev = mix(pos, prev, interpolation);
}
}`),u?(e.attributes.add("normal","vec3"),oe(a),a.constants.add("tiltThreshold","float",.7),a.code.add(o`vec3 perpendicular(vec3 v) {
vec3 n = (viewNormal * vec4(normal.xyz, 1.0)).xyz;
vec3 n2 = cross(v, n);
vec3 forward = vec3(0.0, 0.0, 1.0);
float tiltDot = dot(forward, n);
return abs(tiltDot) < tiltThreshold ? n : n2;
}`)):a.code.add(o`vec2 perpendicular(vec2 v) {
return vec2(v.y, -v.x);
}`);const h=u?"vec3":"vec2";return a.code.add(o`
      ${h} normalizedSegment(${h} pos, ${h} prev) {
        ${h} segment = pos - prev;
        float segmentLen = length(segment);

        // normalize or zero if too short
        return (segmentLen > 0.001) ? segment / segmentLen : ${u?"vec3(0.0, 0.0, 0.0)":"vec2(0.0, 0.0)"};
      }

      ${h} displace(${h} pos, ${h} prev, float displacementLen) {
        ${h} segment = normalizedSegment(pos, prev);

        ${h} displacementDirU = perpendicular(segment);
        ${h} displacementDirV = segment;

        ${t===1?"pos -= 0.5 * displacementLen * displacementDirV;":""}

        return pos + displacementLen * (uv0.x * displacementDirU + uv0.y * displacementDirV);
      }
    `),g&&(a.uniforms.add(new ne("inverseProjectionMatrix",({camera:l})=>l.inverseProjectionMatrix)),a.code.add(o`vec3 inverseProject(vec4 posScreen) {
posScreen.xy = (posScreen.xy / viewport.zw) * posScreen.w;
return (inverseProjectionMatrix * posScreen).xyz;
}`),a.code.add(o`bool rayIntersectPlane(vec3 rayDir, vec3 planeOrigin, vec3 planeNormal, out vec3 intersection) {
float cos = dot(rayDir, planeNormal);
float t = dot(planeOrigin, planeNormal) / cos;
intersection = t * rayDir;
return abs(cos) > 0.001 && t > 0.0;
}`),a.uniforms.add(new ce("perScreenPixelRatio",({camera:l})=>l.perScreenPixelRatio)),a.code.add(o`
      vec4 toFront(vec4 displacedPosScreen, vec3 posLeft, vec3 posRight, vec3 prev, float lineWidth) {
        // Project displaced position back to camera space
        vec3 displacedPos = inverseProject(displacedPosScreen);

        // Calculate the plane that we want the marker to lie in. Note that this will always be an approximation since ribbon lines are generally
        // not planar and we do not know the actual position of the displaced prev vertices (they are offset in screen space, too).
        vec3 planeNormal = normalize(cross(posLeft - posRight, posLeft - prev));
        vec3 planeOrigin = posLeft;

        ${w(r.hasCap,`if(prev.z > posLeft.z) {
                vec2 diff = posLeft.xy - posRight.xy;
                planeOrigin.xy += perpendicular(diff) / 2.0;
             }`)};

        // Move the plane towards the camera by a margin dependent on the line width (approximated in world space). This tolerance corrects for the
        // non-planarity in most cases, but sharp joins can place the prev vertices at arbitrary positions so markers can still clip.
        float offset = lineWidth * perScreenPixelRatio;
        planeOrigin *= (1.0 - offset);

        // Intersect camera ray with the plane and make sure it is within clip space
        vec3 rayDir = normalize(displacedPos);
        vec3 intersection;
        if (rayIntersectPlane(rayDir, planeOrigin, planeNormal, intersection) && intersection.z < -nearFar[0] && intersection.z > -nearFar[1]) {
          return vec4(intersection.xyz, 1.0);
        }

        // Fallback: use depth of pos or prev, whichever is closer to the camera
        float minDepth = planeOrigin.z > prev.z ? length(planeOrigin) : length(prev);
        displacedPos *= minDepth / length(displacedPos);
        return vec4(displacedPos.xyz, 1.0);
      }
  `)),le(a),e.include(Fe),a.main.add(o`
    // Check for special value of uv0.y which is used by the Renderer when graphics
    // are removed before the VBO is recompacted. If this is the case, then we just
    // project outside of clip space.
    if (uv0.y == 0.0) {
      // Project out of clip space
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
    }
    else {
      vec4 pos  = view * vec4(position, 1.0);
      vec4 prev = view * vec4(position + previousDelta.xyz * previousDelta.w, 1.0);

      float lineWidth = getLineWidth(${w(z,"pos.xyz")});
      float screenMarkerSize = getScreenMarkerSize(lineWidth);

      clip(pos, prev);

      ${u?o`${w(r.hideOnShortSegments,o`
                if (areWorldMarkersHidden(pos.xyz, prev.xyz)) {
                  // Project out of clip space
                  gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
                  return;
                }`)}
            pos.xyz = displace(pos.xyz, prev.xyz, getWorldMarkerSize(pos.xyz));
            vec4 displacedPosScreen = projectAndScale(pos);`:o`
            vec4 posScreen = projectAndScale(pos);
            vec4 prevScreen = projectAndScale(prev);
            vec4 displacedPosScreen = posScreen;

            displacedPosScreen.xy = displace(posScreen.xy, prevScreen.xy, screenMarkerSize);
            ${w(g,o`
                vec2 displacementDirU = perpendicular(normalizedSegment(posScreen.xy, prevScreen.xy));

                // We need three points of the ribbon line in camera space to calculate the plane it lies in
                // Note that we approximate the third point, since we have no information about the join around prev
                vec3 lineRight = inverseProject(posScreen + lineWidth * vec4(displacementDirU.xy, 0.0, 0.0));
                vec3 lineLeft = pos.xyz + (pos.xyz - lineRight);

                pos = toFront(displacedPosScreen, lineLeft, lineRight, prev.xyz, lineWidth);
                displacedPosScreen = projectAndScale(pos);`)}`}
      forwardViewPosDepth(pos.xyz);
      // Convert back into NDC
      displacedPosScreen.xy = (displacedPosScreen.xy / viewport.zw) * displacedPosScreen.w;

      // Convert texture coordinate into [0,1]
      vUV = (uv0 + 1.0) / 2.0;
      ${w(!u,"vUV = noPerspectiveWrite(vUV, displacedPosScreen.w);")}
      ${w(P,"vLineWidth = noPerspectiveWrite(lineWidth, displacedPosScreen.w);")}

      vSize = screenMarkerSize;
      vColor = getColor();

      // Use camera space for slicing
      vpos = pos.xyz;

      gl_Position = displacedPosScreen;
    }`),S.include(pe,r),e.include(de,r),S.include(he),S.uniforms.add(new ve("intrinsicColor",({color:l})=>l),new ee("tex",({markerTexture:l})=>l)).constants.add("texelSize","float",1/Y).code.add(o`float markerAlpha(vec2 samplePos) {
samplePos += vec2(0.5, -0.5) * texelSize;
float sdf = texture(tex, samplePos).r;
float pixelDistance = sdf * vSize;
pixelDistance -= 0.5;
return clamp(0.5 - pixelDistance, 0.0, 1.0);
}`),P&&(e.include(H),S.constants.add("relativeMarkerSize","float",Ne/Y).constants.add("relativeTipLineWidth","float",Re).code.add(o`
    float tipAlpha(vec2 samplePos) {
      // Convert coordinates s.t. they are in pixels and relative to the tip of an arrow marker
      samplePos -= vec2(0.5, 0.5 + 0.5 * relativeMarkerSize);
      samplePos *= vSize;

      float halfMarkerSize = 0.5 * relativeMarkerSize * vSize;
      float halfTipLineWidth = 0.5 * max(1.0, relativeTipLineWidth * noPerspectiveRead(vLineWidth));

      ${w(u,"halfTipLineWidth *= fwidth(samplePos.y);")}

      float distance = max(abs(samplePos.x) - halfMarkerSize, abs(samplePos.y) - halfTipLineWidth);
      return clamp(0.5 - distance, 0.0, 1.0);
    }
  `)),e.include(ue,r),e.include(H),S.main.add(o`
    discardBySlice(vpos);
    discardByTerrainDepth();

    vec4 finalColor = intrinsicColor * vColor;

    // Cancel out perspective correct interpolation if in screen space or draped
    vec2 samplePos = ${w(!u,"noPerspectiveRead(vUV)","vUV")};
    finalColor.a *= ${P?"max(markerAlpha(samplePos), tipAlpha(samplePos))":"markerAlpha(samplePos)"};
    outputColorHighlightOID(finalColor, vpos, finalColor.rgb);`),e}const Ue=Object.freeze(Object.defineProperty({__proto__:null,build:J},Symbol.toStringTag,{value:"Module"}));let Ee=class extends me{constructor(e,i){super(e,i,new fe(Ue,()=>Ce(()=>Promise.resolve().then(()=>Ge),void 0)),Q(i).locations)}_makePipelineState(e,i){const{output:t,oitPass:P,space:z,hasOccludees:u}=e;return M({blending:V(t)?_e(P):null,depthTest:z===0?null:{func:ye(P)},depthWrite:Pe(e),drawBuffers:Se(t,we(P,t)),colorWrite:L,stencilWrite:u?I:null,stencilTest:u?i?E:ge:null,polygonOffset:{factor:0,units:-10}})}initializePipeline(e){return e.occluder?(this._occluderPipelineTransparent=M({blending:q,depthTest:B,depthWrite:null,colorWrite:L,stencilWrite:null,stencilTest:ze}),this._occluderPipelineOpaque=M({blending:q,depthTest:B,depthWrite:null,colorWrite:L,stencilWrite:$e,stencilTest:xe}),this._occluderPipelineMaskWrite=M({blending:null,depthTest:be,depthWrite:null,colorWrite:null,stencilWrite:I,stencilTest:E})):this._occluderPipelineTransparent=this._occluderPipelineOpaque=this._occluderPipelineMaskWrite=null,this._occludeePipelineState=this._makePipelineState(e,!0),this._makePipelineState(e,!1)}getPipeline(e,i){return e?this._occludeePipelineState:i===11?this._occluderPipelineTransparent??super.getPipeline():i===10?this._occluderPipelineOpaque??super.getPipeline():this._occluderPipelineMaskWrite??super.getPipeline()}};function Q(r){const e=Me().vec3f("position").vec4f16("previousDelta").vec2f16("uv0");return r.hasVVColor?e.f32("colorFeatureAttribute"):e.vec4u8("color",{glNormalized:!0}),r.hasVVOpacity&&e.f32("opacityFeatureAttribute"),r.hasVVSize?e.f32("sizeFeatureAttribute"):e.f16("size"),r.worldSpace&&e.vec3f16("normal"),e.freeze()}class c extends Te{constructor(e){super(),this.spherical=e,this.space=1,this.anchor=0,this.occluder=!1,this.writeDepth=!1,this.hideOnShortSegments=!1,this.hasCap=!1,this.hasTip=!1,this.hasVVSize=!1,this.hasVVColor=!1,this.hasVVOpacity=!1,this.hasOccludees=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.hasScreenSizePerspective=!1,this.textureCoordinateType=0,this.emissionSource=0,this.discardInvisibleFragments=!0,this.occlusionPass=!1,this.hasVVInstancing=!1,this.hasSliceTranslatedView=!0,this.olidColorInstanced=!1,this.overlayEnabled=!1,this.snowCover=!1}get draped(){return this.space===0}get worldSpace(){return this.space===2}}p([d({count:3})],c.prototype,"space",void 0),p([d({count:2})],c.prototype,"anchor",void 0),p([d()],c.prototype,"occluder",void 0),p([d()],c.prototype,"writeDepth",void 0),p([d()],c.prototype,"hideOnShortSegments",void 0),p([d()],c.prototype,"hasCap",void 0),p([d()],c.prototype,"hasTip",void 0),p([d()],c.prototype,"hasVVSize",void 0),p([d()],c.prototype,"hasVVColor",void 0),p([d()],c.prototype,"hasVVOpacity",void 0),p([d()],c.prototype,"hasOccludees",void 0),p([d()],c.prototype,"terrainDepthTest",void 0),p([d()],c.prototype,"cullAboveTerrain",void 0),p([d()],c.prototype,"hasScreenSizePerspective",void 0);class ot extends Ve{constructor(e,i){super(e,Be),this.produces=new Map([[2,t=>t===9||V(t)&&this.parameters.renderOccluded===8],[3,t=>te(t)],[10,t=>U(t)&&this.parameters.renderOccluded===8],[11,t=>U(t)&&this.parameters.renderOccluded===8],[4,t=>V(t)&&this.parameters.writeDepth],[8,t=>V(t)&&!this.parameters.writeDepth],[18,t=>V(t)||t===9]]),this.intersectDraped=void 0,this._configuration=new c(i)}getConfiguration(e,i){return super.getConfiguration(e,i,this._configuration),this._configuration.space=i.slot===18?0:this.parameters.worldSpace?2:1,this._configuration.hideOnShortSegments=this.parameters.hideOnShortSegments,this._configuration.hasCap=this.parameters.cap!==0,this._configuration.anchor=this.parameters.anchor,this._configuration.hasTip=this.parameters.hasTip,this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.hasOccludees=i.hasOccludees,this._configuration.writeDepth=this.parameters.writeDepth,this._configuration.hasVVSize=this.parameters.hasVVSize,this._configuration.hasVVColor=this.parameters.hasVVColor,this._configuration.hasVVOpacity=this.parameters.hasVVOpacity,this._configuration.occluder=this.parameters.renderOccluded===8,this._configuration.oitPass=i.oitPass,this._configuration.terrainDepthTest=i.terrainDepthTest&&V(e),this._configuration.cullAboveTerrain=i.cullAboveTerrain,this._configuration.hasScreenSizePerspective=this.parameters.screenSizePerspective!=null,this._configuration}get visible(){return this.parameters.color[3]>=ke}intersect(){}createBufferWriter(){return new qe(Q(this.parameters),this.parameters)}createGLMaterial(e){return new Ie(e)}}class Ie extends De{dispose(){super.dispose(),this._markerTextures?.release(this._markerPrimitive),this._markerPrimitive=null}beginSlot(e){const i=this._material.parameters.markerPrimitive;return i!==this._markerPrimitive&&(this._material.setParameters({markerTexture:this._markerTextures.swap(i,this._markerPrimitive)}),this._markerPrimitive=i),this.getTechnique(Ee,e)}}class Be extends Oe{constructor(){super(...arguments),this.width=0,this.color=[1,1,1,1],this.markerPrimitive="arrow",this.placement="end",this.cap=0,this.anchor=0,this.hasTip=!1,this.worldSpace=!1,this.hideOnShortSegments=!1,this.writeDepth=!0,this.hasSlicePlane=!1,this.vvFastUpdate=!1,this.stipplePattern=null,this.markerTexture=null}}class qe{constructor(e,i){this.layout=e,this._parameters=i}elementCount(){return this._parameters.placement==="begin-end"?12:6}write(e,i,t,P,z,u){const g=t.get("position").data,a=g.length/3;let S=[1,0,0];const y=t.get("normal");this._parameters.worldSpace&&y!=null&&(S=y.data);let h=1,l=0;this._parameters.vvSize?l=t.get("sizeFeatureAttribute").data[0]:t.has("size")&&(h=t.get("size").data[0]);let $=[1,1,1,1],j=0;this._parameters.vvColor?j=t.get("colorFeatureAttribute").data[0]:t.has("color")&&($=t.get("color").data);let A=0;this._parameters.vvOpacity&&(A=t.get("opacityFeatureAttribute").data[0]);const x=new Float32Array(z.buffer),_=Z(z.buffer),k=new Uint8Array(z.buffer);let v=u*(this.layout.stride/4);const b=x.BYTES_PER_ELEMENT/_.BYTES_PER_ELEMENT,K=4/b,T=(n,D,m,f)=>{x[v++]=n[0],x[v++]=n[1],x[v++]=n[2],We(D,n,_,v*b),v+=K;let s=v*b;if(_[s++]=m[0],_[s++]=m[1],v=Math.ceil(s/b),this._parameters.vvColor)x[v++]=j;else{const W=Math.min(4*f,$.length-4),C=4*v++;k[C]=255*$[W],k[C+1]=255*$[W+1],k[C+2]=255*$[W+2],k[C+3]=255*$[W+3]}this._parameters.vvOpacity&&(x[v++]=A),s=v*b,this._parameters.vvSize?(x[v++]=l,s+=2):_[s++]=h,this._parameters.worldSpace&&(_[s++]=S[0],_[s++]=S[1],_[s++]=S[2]),v=Math.ceil(s/b)},F=(n,D)=>{const m=N(Ye,g[3*n],g[3*n+1],g[3*n+2]),f=He;let s=n+D;do N(f,g[3*s],g[3*s+1],g[3*s+2]),s+=D;while(X(m,f)&&s>=0&&s<a);e&&(R(m,m,e),R(f,f,e)),T(m,f,[-1,-1],n),T(m,f,[1,-1],n),T(m,f,[1,1],n),T(m,f,[-1,-1],n),T(m,f,[1,1],n),T(m,f,[-1,1],n)},O=this._parameters.placement;return O!=="begin"&&O!=="begin-end"||F(0,1),O!=="end"&&O!=="begin-end"||F(a-1,-1),null}}const Ye=G(),He=G(),Ge=Object.freeze(Object.defineProperty({__proto__:null,build:J},Symbol.toStringTag,{value:"Module"}));export{ot as g};
//# sourceMappingURL=LineMarker.glsl-DLzsQ23R.js.map
