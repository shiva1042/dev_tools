import{dv as I,dm as E,b6 as O,d5 as w,pI as p,d0 as S,O as N,aa as Z,iv as H,eI as V,dD as b,fy as R,gU as U,A as G,gT as B,nD as W,cy as Q,c$ as Y,cu as q,_ as C,g as k,k as X,aP as J,gh as K}from"./Expand-BjFL9QNU.js";import{i as ee,c as te}from"./fontUtils-DYXnALsd.js";import{r as x,k as oe,p as re,v as A,x as v,y as l,z,A as M}from"./Texture-BuTJ8KiH.js";import{t as i}from"./glsl-B5bJgrnA.js";import{i as ae,e as ie}from"./Emissions.glsl-h7htgatk.js";import{b as ne,c as se,d as ce,e as de,f as le,g as he}from"./DefaultMaterial-BgzwWm_C.js";import{i as ue}from"./OverlayCompositing.glsl-B9q8qljH.js";class Me{constructor(e,t="center",r=!1,a=I(),n=E(0,0,0,-1),c="world",d=O(),s=0){this.verticalOffset=e,this.anchor=t,this.hasLabelVerticalOffset=r,this.screenOffset=a,this.centerOffset=n,this.centerOffsetUnits=c,this.translation=d,this.elevationOffset=s}}let Te=class{constructor(e,t="center",r="center",a=null,n=I(),c=!0){this.placement=e,this.horizontalPlacement=t,this.verticalPlacement=r,this.text=a,this.displaySize=n,this.isFocused=c}};class F{constructor(e){this.definition=e,this.key=JSON.stringify(e),this.haloSize=Math.round(e.halo.size),this.textStyle=T(e.color),this.haloStyle=fe(e.halo.color),this.backgroundStyle=e.background.color[3]!==0?T(e.background.color):null}fontString(e){const t=this.definition.font;return`${t.style} ${t.weight} ${e}px ${t.family}, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`}setFontProperties(e,t){e.font=this.fontString(t),e.textAlign="left",e.textBaseline="alphabetic"}static async fromSymbol(e,t){const r=e?.material?.color,a=w.toUnitRGBA(r)??p,n=e.size!=null?S(e.size):12,c=e.lineHeight,d=e.background!=null?w.toUnitRGBA(e.background.color):p,s={family:e.font?.family??"sans-serif",decoration:e.font?.decoration??"none",weight:e.font?.weight??"normal",style:e.font?.style??"normal"},f=e.halo,L=f?.color!=null&&f.size>0?{size:S(f.size),color:w.toUnitRGBA(f.color)}:{size:0,color:p},_=new F({color:a,size:n,background:{color:d,padding:e.background!=null?[.65*n,.5*n]:[0,0],borderRadius:e.background!=null?n*(6/16):0},lineSpacingFactor:c,font:s,halo:L,pixelRatio:t});if(e.font){let D=!1;const P=_.fontString(n);try{D=(await document.fonts.load(P)).some(g=>!ee(g))}catch{N.getLogger("esri.views.3d.webgl-engine.lib.TextRenderParameters").warnOnce(`Failed to preload font '${P}'. Some text symbology may be rendered using the default browser font.`)}if(!D&&!pe.has(e.font.family))try{await te(e.font)}catch{}}return _}}function fe(o){return`rgb(${o.slice(0,3).map(e=>Math.floor(255*e)).toString()})`}function T(o){return`rgba(${o.slice(0,3).map(e=>Math.floor(255*e)).toString()},${o[3]})`}const pe=new Set(["Arial","Times New Roman","Courier New","serif","sans-serif","monospace","cursive","fantasy","system-ui","ui-serif","ui-sans-serif","ui-monospace","ui-rounded","math","emoji","fangsong"]),h=4096;let y=class extends Z{constructor(o){super(o),this.id=H(),this.events=new V,this._glTexture=null,this._atlas=new ve(256,256),this._needsRepack=!1,this._canRepack=!0,this._elementsToRender=new Map,this._elements=new Map,this._uvCallbacks=new Map,this.updating=!1}initialize(){this._canvas=document.createElement("canvas"),this._canvas.setAttribute("id","textAtlasCanvas"),this._canvas.setAttribute("style","display:none"),this._ctx=this._canvas.getContext("2d"),this._stage=this.view.stage,this._stage.addTexture(this),this._updateCanvasElementSize(this._atlas),this._reset()}unload(){this._glTexture=b(this._glTexture),this._frameWorker=R(this._frameWorker),this.updating=!1,this.events.emit("unloaded")}get loaded(){return this._glTexture!=null}get glTexture(){return this._glTexture}static get maxSize(){return m=0,[h-u-m,h-u-m-j]}load(o){if(this._glTexture)return this._glTexture;const e=new U;return e.wrapMode=33071,e.samplingMode=9987,e.hasMipmap=!0,e.preMultiplyAlpha=!0,e.maxAnisotropy=o.parameters.maxMaxAnisotropy,this._glTexture=new G(o,e,this._canvas),this._frameWorker=this.view.resourceController.scheduler.registerTask(B.TEXT_TEXTURE_ATLAS,this),this.setDirty(),this._glTexture}dispose(){this._elements.clear(),this._elementsToRender.clear(),this._frameWorker=R(this._frameWorker),this._glTexture&&(this._stage.removeTexture(this),this._glTexture=b(this._glTexture)),this._canvas.width=0,this._canvas.height=0,this._canvas=null,this._ctx=null}_updateCanvasElementSize(o){this._canvas.width=o.width,this._canvas.height=o.height}_resizeAtlas(o,e){const{width:t,height:r}=this._atlas;t===o&&r===e||(this._atlas.width=o,this._atlas.height=e,this._glTexture?.resize(o,e),this._glTexture?.updateData(0,0,0,t,r,this._canvas),this._updateCanvasElementSize(this._atlas),this._elements.forEach(a=>this._uvCallbacks.get(a.textRenderer.key)?.forEach(n=>n(a.uv))),this._reset())}_reset(){this._elementsToRender.clear(),this._atlas.reset(),this._needsRepack=!0,this.setDirty()}_addAtlasElement(o,e,t,r){const a=this._atlas;if(a.width<t||a.height<r)return!1;let n=a.cursors.get(r);if(!n){if(a.height<a.nextY+r)return!1;n=[new $(a.nextY)],a.cursors.set(r,n),a.nextY+=r}let c=n.find(d=>a.width>=d.x+t);if(c==null){if(a.height<a.nextY+r)return!1;c=new $(a.nextY),a.nextY+=r,n.push(c)}return o.setNewPosition(c),this._elements.set(e,o),this._elementsToRender.set(e,o),c.x+=t,!0}_ensureCallbacks(o){const e=this._uvCallbacks.get(o);if(e)return e;const t=new Set;return this._uvCallbacks.set(o,t),t}_addCallback(o,e){this._ensureCallbacks(o).add(e)}_removeCallback(o,e){const t=this._uvCallbacks.get(o);return!(!t?.delete(e)||t.size!==0)&&(this._uvCallbacks.delete(o),!0)}_processAddition(o){const e=o.textRenderer.key;if(this._needsRepack)return void this._elements.set(e,o);const t=this._atlas,r=o.textRenderer.renderedWidth,a=o.textRenderer.renderedHeight,n=r+u,c=a+u+j;if(!this._addAtlasElement(o,e,n,c)){if(this._canRepack)this._reset();else if(t.width<n){const d=x(Math.max(n,1.5*t.width),h);this._resizeAtlas(d,t.height)}else{const d=t.nextY+c,s=x(Math.max(d,1.5*t.height),h);if(s>t.height)this._resizeAtlas(t.width,s);else if(t.width<h){const f=x(1.5*t.width,h);this._resizeAtlas(f,t.height)}}this._elements.set(e,o)}}_renderElement(o){const e=o.commitNewPosition(),t=o.textRenderer;this._ctx.clearRect(e[0]-u,e[1]-u,t.renderedWidth+2*u,t.renderedHeight+2*u),t.render(this._ctx,e[0],e[1]),this._uvCallbacks.get(t.key)?.forEach(r=>r(o.uv))}get readyToRun(){return this.updating}runTask(o){if(this._glTexture==null)return W;for(;this._needsRepack&&(this._canRepack||this._atlas.height<h&&this._atlas.height<h);){this._canRepack=this._needsRepack=!1;const e=this._elements;this._elements=new Map,e.forEach(t=>this._processAddition(t)),o.madeProgress()}if(this._elementsToRender.size>0){for(const[e,t]of this._elementsToRender){if(o.done)break;this._renderElement(t),this._elementsToRender.delete(e),o.madeProgress()}this._glTexture.setData(this._canvas)}this.updating=this._elementsToRender.size>0}addText(o,e){const t=o.key;this._addCallback(t,e);let r=this._elements.get(t);return r?Q(r.uv,p)||e(r.uv):(r=new me(o),this._processAddition(r),this.setDirty()),{remove:()=>this._removeText(o,e)}}_removeText(o,e){const t=o.key;this._elements.get(t)&&this._removeCallback(t,e)&&(this._elements.delete(t),this._elementsToRender.delete(t),this._canRepack=!0)}setDirty(){this._glTexture&&(this.updating=!0)}get test(){}get usedMemory(){return(this._glTexture?.usedMemory??0)+(this._canvas?.width??0)*(this._canvas?.height??0)*4}};C([k({constructOnly:!0})],y.prototype,"view",void 0),C([k({type:Boolean})],y.prototype,"updating",void 0),y=C([X("esri.views.3d.webgl-engine.lib.TextTextureAtlas")],y);const u=2,j=2;class me{constructor(e){this.textRenderer=e,this._uv=Y(),this._newPosition=[0,0]}get uv(){if(this._xOffset==null||this._yOffset==null)return p;const{renderedWidth:e,renderedHeight:t}=this.textRenderer;return q(this._uv,this._xOffset,this._yOffset+t,this._xOffset+e,this._yOffset)}setNewPosition(e){this._newPosition[0]=e.x,this._newPosition[1]=e.y}commitNewPosition(){return this._xOffset=this._newPosition[0],this._yOffset=this._newPosition[1],this._newPosition}get xOffset(){return this._xOffset}get yOffset(){return this._yOffset}}class ve{constructor(e,t){this.width=e,this.height=t,this.cursors=new Map,this.nextY=0}reset(){this.cursors.clear(),this.nextY=m}}class ${constructor(e){this.y=e,this.x=m}}let m=0,$e=class{constructor(e,t){this._material=e,this._repository=t,this._map=new Map}dispose(){this._map.forEach((e,t)=>{e!=null&&this._repository.release(this._material,t)})}load(e,t,r){if(!this._material.produces.get(t)?.(r))return null;this._map.has(r)||this._map.set(r,this._repository.acquire(this._material,t,r));const n=this._map.get(r);if(n){if(n.ensureResources(e)===2)return n;this._repository.requestRender()}return null}};function Ae(o){o.code.add(i`float normals2FoamIntensity(vec3 n, float waveStrength){
float normalizationFactor =  max(0.015, waveStrength);
return max((n.x + n.y)*0.3303545/normalizationFactor + 0.3303545, 0.0);
}`)}function ye(o){o.code.add(i`vec3 foamIntensity2FoamColor(float foamIntensityExternal, float foamPixelIntensity, vec3 skyZenitColor, float dayMod){
return foamIntensityExternal * (0.075 * skyZenitColor * pow(foamPixelIntensity, 4.) +  50.* pow(foamPixelIntensity, 23.0)) * dayMod;
}`)}function ge(o,e){if(!e.screenSpaceReflections)return;const t=o.fragment;t.include(oe),t.uniforms.add(new re("nearFar",r=>r.camera.nearFar),new A("depthMap",r=>r.depth?.attachment),new v("proj",r=>r.camera.projectionMatrix),new l("invResolutionHeight",r=>1/r.camera.height),new v("reprojectionMatrix",r=>r.ssr.reprojectionMatrix)).code.add(i`
  vec2 reprojectionCoordinate(vec3 projectionCoordinate)
  {
    vec4 zw = proj * vec4(0.0, 0.0, -projectionCoordinate.z, 1.0);
    vec4 reprojectedCoord = reprojectionMatrix * vec4(zw.w * (projectionCoordinate.xy * 2.0 - 1.0), zw.z, zw.w);
    reprojectedCoord.xy /= reprojectedCoord.w;
    return reprojectedCoord.xy * 0.5 + 0.5;
  }

  const int maxSteps = ${e.highStepCount?"150":"75"};

  vec4 applyProjectionMat(mat4 projectionMat, vec3 x)
  {
    vec4 projectedCoord =  projectionMat * vec4(x, 1.0);
    projectedCoord.xy /= projectedCoord.w;
    projectedCoord.xy = projectedCoord.xy*0.5 + 0.5;
    return projectedCoord;
  }

  vec3 screenSpaceIntersection(vec3 dir, vec3 startPosition, vec3 viewDir, vec3 normal)
  {
    vec3 viewPos = startPosition;
    vec3 viewPosEnd = startPosition;

    // Project the start position to the screen
    vec4 projectedCoordStart = applyProjectionMat(proj, viewPos);
    vec3  Q0 = viewPos / projectedCoordStart.w; // homogeneous camera space
    float k0 = 1.0/ projectedCoordStart.w;

    // advance the position in the direction of the reflection
    viewPos += dir;

    vec4 projectedCoordVanishingPoint = applyProjectionMat(proj, dir);

    // Project the advanced position to the screen
    vec4 projectedCoordEnd = applyProjectionMat(proj, viewPos);
    vec3  Q1 = viewPos / projectedCoordEnd.w; // homogeneous camera space
    float k1 = 1.0/ projectedCoordEnd.w;

    // calculate the reflection direction in the screen space
    vec2 projectedCoordDir = (projectedCoordEnd.xy - projectedCoordStart.xy);
    vec2 projectedCoordDistVanishingPoint = (projectedCoordVanishingPoint.xy - projectedCoordStart.xy);

    float yMod = min(abs(projectedCoordDistVanishingPoint.y), 1.0);

    float projectedCoordDirLength = length(projectedCoordDir);
    float maxSt = float(maxSteps);

    // normalize the projection direction depending on maximum steps
    // this determines how blocky the reflection looks
    vec2 dP = yMod * (projectedCoordDir)/(maxSt * projectedCoordDirLength);

    // Normalize the homogeneous camera space coordinates
    vec3  dQ = yMod * (Q1 - Q0)/(maxSt * projectedCoordDirLength);
    float dk = yMod * (k1 - k0)/(maxSt * projectedCoordDirLength);

    // initialize the variables for ray marching
    vec2 P = projectedCoordStart.xy;
    vec3 Q = Q0;
    float k = k0;
    float rayStartZ = -startPosition.z; // estimated ray start depth value
    float rayEndZ = -startPosition.z;   // estimated ray end depth value
    float prevEstimateZ = -startPosition.z;
    float rayDiffZ = 0.0;
    float dDepth;
    float depth;
    float rayDiffZOld = 0.0;

    // early outs
    if (dot(normal, dir) < 0.0 || dot(-viewDir, normal) < 0.0)
      return vec3(P, 0.0);
    float dDepthBefore = 0.0;

    for(int i = 0; i < maxSteps-1; i++)
    {
      depth = -linearDepthFromTexture(depthMap, P); // get linear depth from the depth buffer

      // estimate depth of the marching ray
      rayStartZ = prevEstimateZ;
      dDepth = -rayStartZ - depth;
      rayEndZ = (dQ.z * 0.5 + Q.z)/ ((dk * 0.5 + k));
      rayDiffZ = rayEndZ- rayStartZ;
      prevEstimateZ = rayEndZ;

      if(-rayEndZ > nearFar[1] || -rayEndZ < nearFar[0] || P.y < 0.0  || P.y > 1.0 )
      {
        return vec3(P, 0.);
      }

      // If we detect a hit - return the intersection point, two conditions:
      //  - dDepth > 0.0 - sampled point depth is in front of estimated depth
      //  - if difference between dDepth and rayDiffZOld is not too large
      //  - if difference between dDepth and 0.025/abs(k) is not too large
      //  - if the sampled depth is not behind far plane or in front of near plane

      if((dDepth) < 0.025/abs(k) + abs(rayDiffZ) && dDepth > 0.0 && depth > nearFar[0] && depth < nearFar[1] && abs(P.y - projectedCoordStart.y) > invResolutionHeight)
      {
        float weight = dDepth / (dDepth - dDepthBefore);
        vec2 Pf = mix(P - dP, P, 1.0 - weight);
        if (abs(Pf.y - projectedCoordStart.y) > invResolutionHeight) {
          return vec3(Pf, depth);
        }
        else {
          return vec3(P, depth);
        }
      }

      // continue with ray marching
      P = clamp(P + dP, vec2(0.0), vec2(0.999));
      Q.z += dQ.z;
      k += dk;
      rayDiffZOld = rayDiffZ;
      dDepthBefore = dDepth;
    }
    return vec3(P, 0.0);
  }
  `)}function we(o){o.fragment.uniforms.add(new l("cloudAbsorption",e=>e.clouds.absorption),new l("cloudCoverage",e=>e.clouds.coverage)).code.add(i`vec4 lookupCloudsFromTextureArray(sampler2DArray cubeMap, vec3 rayDir) {
int faceIndex;
vec2 uv;
if(rayDir.z <= 0.0) {
float hazeFactor = smoothstep(-0.01, mix(0.0, 0.075, cloudCoverage), abs(dot(rayDir, vec3(0, 0, 1))));
float shading = clamp(1.0 - cloudAbsorption, 0.6, 1.0) * (1.0 - hazeFactor);
float totalTransmittance = hazeFactor;
return vec4(shading, totalTransmittance, shading, totalTransmittance);
}
if (abs(rayDir.x) >= abs(rayDir.y) && abs(rayDir.x) >= abs(rayDir.z)) {
if(rayDir.x > 0.0) {
faceIndex = 0;
uv = rayDir.yz / rayDir.x;
uv = vec2(-uv.x, uv.y);
} else {
faceIndex = 1;
uv = rayDir.yz / rayDir.x;
uv = vec2(-uv.x, -uv.y);
}
} else if (abs(rayDir.y) >= abs(rayDir.x) && abs(rayDir.y) >= abs(rayDir.z)) {
if(rayDir.y > 0.0) {
faceIndex = 2;
uv = rayDir.xz / rayDir.y;
} else {
faceIndex = 3;
uv = rayDir.xz / rayDir.y;
uv = vec2(uv.x, -uv.y);
}
} else {
if(rayDir.y < 0.0) {
faceIndex = 4;
uv = rayDir.xy / rayDir.z;
uv = vec2(uv.x, -uv.y);
} else {
faceIndex = 5;
uv = rayDir.xy / rayDir.z;
uv = vec2(uv.x, -uv.y);
}
}
uv = 0.5 * (uv + 1.0);
if(faceIndex != 5) {
uv.y = uv.y - 0.5;
}
uv.y = uv.y * 2.0;
vec4 s = texture(cubeMap, vec3(uv, float(faceIndex)));
return s;
}`)}class Ce extends ae{constructor(e,t){super(e,"sampler2DArray",0,(r,a)=>r.bindTexture(e,t(a)))}}function xe(o){const e=o.fragment;e.constants.add("radiusCloudsSquared","float",_e).code.add(i`vec3 intersectWithCloudLayer(vec3 dir, vec3 cameraPosition, vec3 spherePos) {
float B = 2.0 * dot(cameraPosition, dir);
float C = dot(cameraPosition, cameraPosition) - radiusCloudsSquared;
float det = B * B - 4.0 * C;
float pointIntDist = max(0.0, 0.5 *(-B + sqrt(det)));
return (cameraPosition + dir * pointIntDist) - spherePos;
}`),e.uniforms.add(new l("radiusCurvatureCorrection",({clouds:s})=>s.parallax.radiusCurvatureCorrection)).code.add(i`vec3 correctForPlanetCurvature(vec3 dir) {
dir.z = dir.z * (1.0 - radiusCurvatureCorrection) + radiusCurvatureCorrection;
return dir;
}`),e.code.add(i`vec3 rotateDirectionToAnchorPoint(mat4 rotMat, vec3 inVec) {
return (rotMat * vec4(inVec, 0.0)).xyz;
}`),ne(e),se(e);const t=J(.28,.175,.035);e.constants.add("RIM_COLOR","vec3",t),e.code.add(i`
    vec3 calculateCloudColor(vec3 cameraPosition, vec3 worldSpaceRay, vec4 clouds) {
      float upDotLight = dot(cameraPosition, mainLightDirection);
      float dirDotLight = max(dot(worldSpaceRay, mainLightDirection), 0.0);
      float sunsetTransition = clamp(pow(max(upDotLight, 0.0), ${i.float(.3)}), 0.0, 1.0);

      // Base color of the clouds that depends on lighting of the sun and sky
      vec3 ambientLight = calculateAmbientIrradiance(cameraPosition,  0.0);
      vec3 combinedLight = clamp((mainLightIntensity + ambientLight )/PI, vec3(0.0), vec3(1.0));
      vec3 baseCloudColor = pow(combinedLight * pow(clouds.xyz, vec3(GAMMA)), vec3(INV_GAMMA));

      // Rim light around the edge of the clouds simulating scattering of the direct lun light
      float scatteringMod = max(clouds.a < 0.5 ? clouds.a / 0.5 : - clouds.a / 0.5 + 2.0, 0.0);
      float rimLightIntensity = 0.5 + 0.5 * pow(max(upDotLight, 0.0), 0.35);
      vec3 directSunScattering = RIM_COLOR * rimLightIntensity * (pow(dirDotLight, ${i.float(140)})) * scatteringMod;

      // Brighten the clouds around the sun at the sunsets
      float additionalLight = ${i.float(.2)} * pow(dirDotLight, ${i.float(10)}) * (1. - pow(sunsetTransition, ${i.float(.3)})) ;

      return vec3(baseCloudColor * (1.0 + additionalLight) + directSunScattering);
    }
  `),o.include(we),e.uniforms.add(new z("readChannelsRG",s=>s.clouds.readChannels===0),new Ce("cubeMap",s=>s.clouds.data?.cubeMap?.colorTexture)).code.add(i`vec4 sampleCloud(vec3 rayDir, bool readOtherChannel) {
vec4 s = lookupCloudsFromTextureArray(cubeMap, rayDir);
bool readRG = readChannelsRG ^^ readOtherChannel;
s = readRG ? vec4(vec3(s.r), s.g) : vec4(vec3(s.b), s.a);
return length(s) == 0.0 ? vec4(s.rgb, 1.0) : s;
}`),e.uniforms.add(new M("anchorPoint",s=>s.clouds.parallax.anchorPoint),new M("anchorPointNew",s=>s.clouds.parallaxNew.anchorPoint),new v("rotationClouds",s=>s.clouds.parallax.transform),new v("rotationCloudsNew",s=>s.clouds.parallaxNew.transform),new l("cloudsOpacity",s=>s.clouds.opacity),new l("fadeFactor",s=>s.clouds.fadeFactor),new z("crossFade",s=>s.clouds.fadeState===3)).code.add(i`vec4 renderClouds(vec3 worldRay, vec3 cameraPosition) {
vec3 intersectionPoint = intersectWithCloudLayer(worldRay, cameraPosition, anchorPoint);
vec3 worldRayRotated = rotateDirectionToAnchorPoint(rotationClouds, normalize(intersectionPoint));
vec3 worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
vec4 cloudData = sampleCloud(worldRayRotatedCorrected, crossFade);
vec3 cameraPositionN = normalize(cameraPosition);
vec4 cloudColor = vec4(calculateCloudColor(cameraPositionN, worldRay, cloudData), cloudData.a);
if(crossFade) {
intersectionPoint = intersectWithCloudLayer(worldRay, cameraPosition, anchorPointNew);
worldRayRotated = rotateDirectionToAnchorPoint(rotationCloudsNew, normalize(intersectionPoint));
worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
cloudData = sampleCloud(worldRayRotatedCorrected, false);
vec4 cloudColorNew = vec4(calculateCloudColor(cameraPositionN, worldRay, cloudData), cloudData.a);
cloudColor = mix(cloudColor, cloudColorNew, fadeFactor);
}
float totalTransmittance = length(cloudColor.rgb) == 0.0 ?
1.0 :
clamp(cloudColor.a * cloudsOpacity + (1.0 - cloudsOpacity), 0.0 , 1.0);
return vec4(cloudColor.rgb, totalTransmittance);
}`)}const _e=(K.radius+ue)**2;function Fe(o,e){const t=o.fragment;t.include(ce,e),t.include(ie),t.include(ye),e.cloudReflections&&o.include(xe),o.include(ge,e),t.include(de,e),t.constants.add("fresnelSky","vec3",[.02,1,15]),t.constants.add("fresnelMaterial","vec2",[.02,.1]),t.constants.add("roughness","float",.015),t.constants.add("foamIntensityExternal","float",1.7),t.constants.add("ssrIntensity","float",.65),t.constants.add("ssrHeightFadeStart","float",le),t.constants.add("ssrHeightFadeEnd","float",he),t.constants.add("waterDiffusion","float",.92),t.constants.add("waterSeaColorMod","float",.8),t.constants.add("correctionViewingPowerFactor","float",.4),t.constants.add("skyZenitColor","vec3",[.52,.68,.9]),t.constants.add("skyColor","vec3",[.67,.79,.9]),t.constants.add("cloudFresnelModifier","vec2",[1.2,.01]),t.code.add(i`PBRShadingWater shadingInfo;
vec3 getSkyGradientColor(in float cosTheta, in vec3 horizon, in vec3 zenit) {
float exponent = pow((1.0 - cosTheta), fresnelSky[2]);
return mix(zenit, horizon, exponent);
}`),t.uniforms.add(new l("lightingSpecularStrength",r=>r.lighting.mainLight.specularStrength),new l("lightingEnvironmentStrength",r=>r.lighting.mainLight.environmentStrength)),t.code.add(i`vec3 getSeaColor(in vec3 n, in vec3 v, in vec3 l, vec3 color, in vec3 lightIntensity, in vec3 localUp, in float shadow, float foamIntensity, vec3 viewPosition, vec3 position) {
float reflectionHit = 0.0;
float reflectionHitDiffused = 0.0;
vec3 seaWaterColor = linearizeGamma(color);
vec3 h = normalize(l + v);
shadingInfo.NdotV = clamp(dot(n, v), 0.001, 1.0);
shadingInfo.VdotN = clamp(dot(v, n), 0.001, 1.0);
shadingInfo.NdotH = clamp(dot(n, h), 0.0, 1.0);
shadingInfo.VdotH = clamp(dot(v, h), 0.0, 1.0);
shadingInfo.LdotH = clamp(dot(l, h), 0.0, 1.0);
float upDotV = max(dot(localUp,v), 0.0);
vec3 skyHorizon = linearizeGamma(skyColor);
vec3 skyZenit = linearizeGamma(skyZenitColor);
vec3 skyColor = getSkyGradientColor(upDotV, skyHorizon, skyZenit );
float upDotL = max(dot(localUp,l),0.0);
float daytimeMod = 0.1 + upDotL * 0.9;
skyColor *= daytimeMod;
float shadowModifier = clamp(shadow, 0.8, 1.0);
vec3 fresnelModifier = fresnelReflection(shadingInfo.VdotN, vec3(fresnelSky[0]), fresnelSky[1]);
vec3 reflSky = lightingEnvironmentStrength * fresnelModifier * skyColor * shadowModifier;
vec3 reflSea = seaWaterColor * mix(skyColor, upDotL * lightIntensity * LIGHT_NORMALIZATION, 2.0 / 3.0) * shadowModifier;
vec3 specular = vec3(0.0);
if(upDotV > 0.0 && upDotL > 0.0) {
vec3 specularSun = brdfSpecularWater(shadingInfo, roughness, vec3(fresnelMaterial[0]), fresnelMaterial[1]);
vec3 incidentLight = lightIntensity * LIGHT_NORMALIZATION * shadow;
float NdotL = clamp(dot(n, l), 0.0, 1.0);
specular = lightingSpecularStrength * NdotL * incidentLight * specularSun;
}
vec3 foam = vec3(0.0);
if(upDotV > 0.0) {
foam = foamIntensity2FoamColor(foamIntensityExternal, foamIntensity, skyZenitColor, daytimeMod);
}
float correctionViewingFactor = pow(max(dot(v, localUp), 0.0), correctionViewingPowerFactor);
vec3 normalCorrectedClouds = mix(localUp, n, correctionViewingFactor);
vec3 reflectedWorld = normalize(reflect(-v, normalCorrectedClouds));`),e.cloudReflections&&t.uniforms.add(new l("cloudsOpacity",r=>r.clouds.opacity)).code.add(i`vec4 cloudsColor = renderClouds(reflectedWorld, position);
cloudsColor.a = 1.0 - cloudsColor.a;
cloudsColor = pow(cloudsColor, vec4(GAMMA));
cloudsColor *= clamp(fresnelModifier.y * cloudFresnelModifier[0] - cloudFresnelModifier[1], 0.0, 1.0) * cloudsOpacity;`),e.screenSpaceReflections?t.uniforms.add(new v("view",r=>r.camera.viewMatrix),new A("lastFrameColorTexture",r=>r.ssr.lastFrameColor?.getTexture()),new l("fadeFactorSSR",r=>r.ssr.fadeFactor)).code.add(i`vec3 viewDir = normalize(viewPosition);
vec4 viewNormalVectorCoordinate = view * vec4(n, 0.0);
vec3 viewNormal = normalize(viewNormalVectorCoordinate.xyz);
vec4 viewUp = view * vec4(localUp, 0.0);
vec3 viewNormalCorrectedSSR = mix(viewUp.xyz, viewNormal, correctionViewingFactor);
vec3 reflected = normalize(reflect(viewDir, viewNormalCorrectedSSR));
vec3 hitCoordinate = screenSpaceIntersection(reflected, viewPosition, viewDir, viewUp.xyz);
vec3 reflectedColor = vec3(0.0);
if (hitCoordinate.z > 0.0)
{
vec2 reprojectedCoordinate = reprojectionCoordinate(hitCoordinate);
vec2 dCoords = smoothstep(0.3, 0.6, abs(vec2(0.5, 0.5) - hitCoordinate.xy));
float heightMod = smoothstep(ssrHeightFadeEnd, ssrHeightFadeStart, -viewPosition.z);
reflectionHit = clamp(1.0 - (1.3 * dCoords.y), 0.0, 1.0) * heightMod * fadeFactorSSR;
reflectionHitDiffused = waterDiffusion * reflectionHit;
reflectedColor = linearizeGamma(texture(lastFrameColorTexture, reprojectedCoordinate).xyz) *
reflectionHitDiffused * fresnelModifier.y * ssrIntensity;
}
float seaColorMod =  mix(waterSeaColorMod, waterSeaColorMod * 0.5, reflectionHitDiffused);
vec3 waterRenderedColor = tonemapACES((1.0 - reflectionHitDiffused) * reflSky + reflectedColor +
reflSea * seaColorMod + specular + foam);`):t.code.add(i`vec3 waterRenderedColor = tonemapACES(reflSky + reflSea * waterSeaColorMod + specular + foam);`),e.cloudReflections?e.screenSpaceReflections?t.code.add(i`return waterRenderedColor * (1.0 - (1.0 - reflectionHit) * cloudsColor.a) + (1.0 - reflectionHit) * cloudsColor.xyz;
}`):t.code.add(i`return waterRenderedColor * (1.0 - cloudsColor.a) + cloudsColor.xyz;
}`):t.code.add(i`return waterRenderedColor;
}`)}function Le(o,e){e.spherical?o.vertex.code.add(i`vec3 getLocalUp(in vec3 pos, in vec3 origin) {
return normalize(pos + origin);
}`):o.vertex.code.add(i`vec3 getLocalUp(in vec3 pos, in vec3 origin) {
return vec3(0.0, 0.0, 1.0);
}`),e.spherical?o.vertex.code.add(i`mat3 getTBNMatrix(in vec3 n) {
vec3 t = normalize(cross(vec3(0.0, 0.0, 1.0), n));
vec3 b = normalize(cross(n, t));
return mat3(t, b, n);
}`):o.vertex.code.add(i`mat3 getTBNMatrix(in vec3 n) {
vec3 t = vec3(1.0, 0.0, 0.0);
vec3 b = normalize(cross(n, t));
return mat3(t, b, n);
}`)}export{Te as a,Ae as b,xe as c,Me as i,Fe as m,Le as r,F as s,$e as t,y as v};
//# sourceMappingURL=NormalUtils.glsl-BeP-QuLa.js.map
