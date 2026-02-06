import{dv as Xe,oh as Jt,kw as Ze,pI as Kt,dm as eo,gh as to,kP as at,_ as E,lk as nt,c$ as Fe,lF as $t,cI as Pt,bb as oe,b6 as R,aU as le,br as q,b0 as Q,b5 as G,oi as St,aS as zt,aY as k,a$ as ye,be as Ot,aO as oo,b7 as L,gy as ao,eQ as At,b9 as Ct,qd as qe,j_ as no,a_ as Je,aP as Mt,ls as so,dW as io,g$ as ro,vL as lo,uL as co,bs as Ke,ql as uo,cu as fo,jZ as po,b as ho,vM as vo,vN as go,vO as mo,eJ as xo,ku as wo,cB as bo,el as yo,uj as $o,rL as Po,vy as So,eK as zo,aQ as Oo,h5 as Ao,bf as Co,cd as Mo,cw as ae,aR as st,fW as Do,fV as Vo}from"./Expand-EkfAPcFa.js";import{s as Dt,g as To}from"./BufferView-idZzLUwQ.js";import{aG as Vt,Y as Fo,ak as Ro,ad as et,y as Ve,aH as jo,W as _o,aI as Tt,aJ as Ft,z as Eo,an as Uo,v as Rt,aK as Io,_ as Ho,a1 as Bo,ai as Go,a3 as it,am as _e,aL as qo,o as te,a0 as Lo,N as ko,a6 as No,a7 as Wo,ay as Qo,ax as Yo,az as Xo,aA as U,s as Zo,t as Jo,aM as Ko,aN as ea,aO as ta,aC as oa,aP as aa,aQ as na,aR as sa,g as rt,aS as ia,aT as lt,aU as ct,aV as ra,aF as la,aW as ca,n as X,m as N,aX as ut,M as ua}from"./Texture-C2zBWbFI.js";import{a as Le,i as fa,c as ft,o as jt,p as Ee}from"./Emissions.glsl-B7ZnG-oy.js";import{_ as pa}from"./index-BkyuEPT-.js";import{Q as _t,t as da}from"./InterleavedLayout-poEi2x4k.js";import{T as ha,d as va,c as ga}from"./renderState-C6Fc3Ut3.js";import{t as ma}from"./VertexAttributeLocations-BfZbt_DV.js";import{u as xa}from"./meshVertexSpaceUtils-DO99m048.js";import{o as wa,x as ba}from"./hydratedFeatures-S0Hjb5qm.js";import{r as H,t as pt,n as Y}from"./vec3f32-WCVSSNPR.js";import{A as ya,U as Et}from"./Indices-G7o4Ym_y.js";import{t as C}from"./orientedBoundingBox-CxKR4BMR.js";import{t as P,n as I}from"./glsl-B5bJgrnA.js";import{s as $a}from"./ShaderBuilder-BgZ-6npi.js";function _n(o){return o.type==="point"}function Pa(o){return o instanceof Float32Array&&o.length>=16}function Sa(o){return Array.isArray(o)&&o.length>=16}function za(o){return Pa(o)||Sa(o)}const Ut=.5;function Oa(o,e){o.include(Vt),o.attributes.add("position","vec3"),o.attributes.add("normal","vec3"),o.attributes.add("centerOffsetAndDistance","vec4");const a=o.vertex;Fo(a,e),Ro(a,e),a.uniforms.add(new et("viewport",t=>t.camera.fullViewport),new Le("polygonOffset",t=>t.shaderPolygonOffset),new Ve("cameraGroundRelative",t=>t.camera.aboveGround?1:-1)),e.hasVerticalOffset&&jo(a),a.code.add(P`struct ProjectHUDAux {
vec3 posModel;
vec3 posView;
vec3 vnormal;
float distanceToCamera;
float absCosAngle;
};`),a.code.add(P`
    float applyHUDViewDependentPolygonOffset(float pointGroundDistance, float absCosAngle, inout vec3 posView) {
      float pointGroundSign = ${e.terrainDepthTest?P.float(0):P`sign(pointGroundDistance)`};
      if (pointGroundSign == 0.0) {
        pointGroundSign = cameraGroundRelative;
      }

      // cameraGroundRelative is -1 if camera is below ground, 1 if above ground
      // groundRelative is 1 if both camera and symbol are on the same side of the ground, -1 otherwise
      float groundRelative = cameraGroundRelative * pointGroundSign;

      // view angle dependent part of polygon offset emulation: we take the absolute value because the sign that is
      // dropped is instead introduced using the ground-relative position of the symbol and the camera
      if (polygonOffset > .0) {
        float cosAlpha = clamp(absCosAngle, 0.01, 1.0);
        float tanAlpha = sqrt(1.0 - cosAlpha * cosAlpha) / cosAlpha;
        float factor = (1.0 - tanAlpha / viewport[2]);

        // same side of the terrain
        if (groundRelative > 0.0) {
          posView *= factor;
        }
        // opposite sides of the terrain
        else {
          posView /= factor;
        }
      }

      return groundRelative;
    }
  `),e.draped&&!e.hasVerticalOffset||_o(a),e.draped||(a.uniforms.add(new Ve("perDistancePixelRatio",t=>Math.tan(t.camera.fovY/2)/(t.camera.fullViewport[2]/2))),a.code.add(P`
    void applyHUDVerticalGroundOffset(vec3 normalModel, inout vec3 posModel, inout vec3 posView) {
      float distanceToCamera = length(posView);

      // Compute offset in world units for a half pixel shift
      float pixelOffset = distanceToCamera * perDistancePixelRatio * ${P.float(Ut)};

      // Apply offset along normal in the direction away from the ground surface
      vec3 modelOffset = normalModel * cameraGroundRelative * pixelOffset;

      // Apply the same offset also on the view space position
      vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;

      posModel += modelOffset;
      posView += viewOffset;
    }
  `)),e.screenCenterOffsetUnitsEnabled&&Tt(a),e.hasScreenSizePerspective&&Ft(a),a.code.add(P`
    vec4 projectPositionHUD(out ProjectHUDAux aux) {
      vec3 centerOffset = centerOffsetAndDistance.xyz;
      float pointGroundDistance = centerOffsetAndDistance.w;

      aux.posModel = position;
      aux.posView = (view * vec4(aux.posModel, 1.0)).xyz;
      aux.vnormal = normal;
      ${e.draped?"":"applyHUDVerticalGroundOffset(aux.vnormal, aux.posModel, aux.posView);"}

      // Screen sized offset in world space, used for example for line callouts
      // Note: keep this implementation in sync with the CPU implementation, see
      //   - MaterialUtil.verticalOffsetAtDistance
      //   - HUDMaterial.applyVerticalOffsetTransformation

      aux.distanceToCamera = length(aux.posView);

      vec3 viewDirObjSpace = normalize(cameraPosition - aux.posModel);
      float cosAngle = dot(aux.vnormal, viewDirObjSpace);

      aux.absCosAngle = abs(cosAngle);

      ${e.hasScreenSizePerspective&&(e.hasVerticalOffset||e.screenCenterOffsetUnitsEnabled)?"vec3 perspectiveFactor = screenSizePerspectiveScaleFactor(aux.absCosAngle, aux.distanceToCamera, screenSizePerspectiveAlignment);":""}

      ${e.hasVerticalOffset?e.hasScreenSizePerspective?"float verticalOffsetScreenHeight = applyScreenSizePerspectiveScaleFactorFloat(verticalOffset.x, perspectiveFactor);":"float verticalOffsetScreenHeight = verticalOffset.x;":""}

      ${e.hasVerticalOffset?P`
            float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * aux.distanceToCamera, verticalOffset.z, verticalOffset.w);
            vec3 modelOffset = aux.vnormal * worldOffset;
            aux.posModel += modelOffset;
            vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;
            aux.posView += viewOffset;
            // Since we elevate the object, we need to take that into account
            // in the distance to ground
            pointGroundDistance += worldOffset;`:""}

      float groundRelative = applyHUDViewDependentPolygonOffset(pointGroundDistance, aux.absCosAngle, aux.posView);

      ${e.screenCenterOffsetUnitsEnabled?"":P`
            // Apply x/y in view space, but z in screen space (i.e. along posView direction)
            aux.posView += vec3(centerOffset.x, centerOffset.y, 0.0);

            // Same material all have same z != 0.0 condition so should not lead to
            // branch fragmentation and will save a normalization if it's not needed
            if (centerOffset.z != 0.0) {
              aux.posView -= normalize(aux.posView) * centerOffset.z;
            }
          `}

      vec4 posProj = proj * vec4(aux.posView, 1.0);

      ${e.screenCenterOffsetUnitsEnabled?e.hasScreenSizePerspective?"float centerOffsetY = applyScreenSizePerspectiveScaleFactorFloat(centerOffset.y, perspectiveFactor);":"float centerOffsetY = centerOffset.y;":""}

      ${e.screenCenterOffsetUnitsEnabled?"posProj.xy += vec2(centerOffset.x, centerOffsetY) * pixelRatio * 2.0 / viewport.zw * posProj.w;":""}

      // constant part of polygon offset emulation
      posProj.z -= groundRelative * polygonOffset * posProj.w;
      return posProj;
    }
  `)}function tt(o){o.uniforms.add(new Eo("alignPixelEnabled",e=>e.alignPixelEnabled)),o.code.add(P`vec4 alignToPixelCenter(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.500123) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = (floor(xy * widthHeight) + vec2(0.5)) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`),o.code.add(P`vec4 alignToPixelOrigin(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.5) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = floor((xy + 0.5 * pixelSz) * widthHeight) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`)}function Aa(o,e){const{vertex:a,fragment:t}=o;o.include(Uo,e),a.include(tt),a.main.add(P`vec4 posProjCenter;
if (dot(position, position) > 0.0) {
ProjectHUDAux projectAux;
vec4 posProj = projectPositionHUD(projectAux);
posProjCenter = alignToPixelCenter(posProj, viewport.zw);
forwardViewPosDepth(projectAux.posView);
vec3 vpos = projectAux.posModel;
if (rejectBySlice(vpos)) {
posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
}
} else {
posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
}
gl_Position = posProjCenter;
gl_PointSize = 1.0;`),t.main.add(P`fragColor = vec4(1);
if(discardByTerrainDepth()) {
fragColor.g = 0.5;
}`)}function Ca(o){o.vertex.uniforms.add(new Ve("renderTransparentlyOccludedHUD",e=>e.hudRenderStyle===0?1:e.hudRenderStyle===1?0:.75),new et("viewport",e=>e.camera.fullViewport),new Rt("hudVisibilityTexture",e=>e.hudVisibility?.getTexture())),o.vertex.include(tt),o.vertex.code.add(P`bool testHUDVisibility(vec4 posProj) {
vec4 posProjCenter = alignToPixelCenter(posProj, viewport.zw);
vec4 occlusionPixel = texture(hudVisibilityTexture, .5 + .5 * posProjCenter.xy / posProjCenter.w);
if (renderTransparentlyOccludedHUD > 0.5) {
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g * renderTransparentlyOccludedHUD < 1.0;
}
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g == 1.0;
}`)}let Ma=class extends fa{constructor(e,a,t){super(e,"vec4",2,(n,i,s)=>n.setUniform4fv(e,a(i,s),t))}};function It(o){const e=new $a,{signedDistanceFieldEnabled:a,occlusionTestEnabled:t,horizonCullingEnabled:n,pixelSnappingEnabled:i,hasScreenSizePerspective:s,debugDrawLabelBorder:l,hasVVSize:c,hasVVColor:r,hasRotation:p,occludedFragmentFade:u,sampleSignedDistanceFieldTexelCenter:d}=o;e.include(Oa,o),e.vertex.include(Io,o);const{occlusionPass:b,output:y,oitPass:m}=o;if(b)return e.include(Aa,o),e;const{vertex:h,fragment:v}=e;e.include(Vt),e.include(Ho,o),e.include(Bo,o),t&&e.include(Ca),v.include(Go),e.varyings.add("vcolor","vec4"),e.varyings.add("vtc","vec2"),e.varyings.add("vsize","vec2");const x=y===9,g=x&&t;g&&e.varyings.add("voccluded","float"),h.uniforms.add(new et("viewport",$=>$.camera.fullViewport),new it("screenOffset",($,B)=>Ze(ze,2*$.screenOffset[0]*B.camera.pixelRatio,2*$.screenOffset[1]*B.camera.pixelRatio)),new it("anchorPosition",$=>me($)),new _e("materialColor",$=>$.color),new Le("materialRotation",$=>$.rotation),new ft("tex",$=>$.texture)),Tt(h),a&&(h.uniforms.add(new _e("outlineColor",$=>$.outlineColor)),v.uniforms.add(new _e("outlineColor",$=>dt($)?$.outlineColor:Kt),new Le("outlineSize",$=>dt($)?$.outlineSize:0))),n&&h.uniforms.add(new Ma("pointDistanceSphere",($,B)=>{const w=B.camera.eye,T=$.origin;return eo(T[0]-w[0],T[1]-w[1],T[2]-w[2],to.radius)})),i&&h.include(tt),s&&(qo(h),Ft(h)),l&&e.varyings.add("debugBorderCoords","vec4"),e.attributes.add("uv0","vec2"),e.attributes.add("uvi","vec4"),e.attributes.add("color","vec4"),e.attributes.add("size","vec2"),e.attributes.add("rotation","float"),(c||r)&&e.attributes.add("featureAttribute","vec4"),h.code.add(n?P`bool behindHorizon(vec3 posModel) {
vec3 camToEarthCenter = pointDistanceSphere.xyz - localOrigin;
vec3 camToPos = pointDistanceSphere.xyz + posModel;
float earthRadius = pointDistanceSphere.w;
float a = dot(camToPos, camToPos);
float b = dot(camToPos, camToEarthCenter);
float c = dot(camToEarthCenter, camToEarthCenter) - earthRadius * earthRadius;
return b > 0.0 && b < a && b * b  > a * c;
}`:P`bool behindHorizon(vec3 posModel) { return false; }`),h.main.add(P`
    ProjectHUDAux projectAux;
    vec4 posProj = projectPositionHUD(projectAux);
    forwardObjectAndLayerIdColor();

    if (rejectBySlice(projectAux.posModel)) {
      // Project outside of clip plane
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }

    if (behindHorizon(projectAux.posModel)) {
      // Project outside of clip plane
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }

    vec2 inputSize;
    ${I(s,P`
        inputSize = screenSizePerspectiveScaleVec2(size, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspective);
        vec2 screenOffsetScaled = screenSizePerspectiveScaleVec2(screenOffset, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspectiveAlignment);`,P`
        inputSize = size;
        vec2 screenOffsetScaled = screenOffset;`)}
    ${I(c,P`inputSize *= vvScale(featureAttribute).xx;`)}

    vec2 combinedSize = inputSize * pixelRatio;
    vec4 quadOffset = vec4(0.0);

    ${I(t,P`
    bool visible = testHUDVisibility(posProj);
    if (!visible) {
      vtc = vec2(0.0);
      ${I(l,"debugBorderCoords = vec4(0.5, 0.5, 1.5 / combinedSize);")}
      return;
    }`)}
    ${I(g,P`voccluded = visible ? 0.0 : 1.0;`)}
  `);const A=P`
      vec2 uv = mix(uvi.xy, uvi.zw, bvec2(uv0));
      vec2 texSize = vec2(textureSize(tex, 0));
      uv = mix(vec2(1.0), uv / texSize, lessThan(uv, vec2(${Va})));
      quadOffset.xy = (uv0 - anchorPosition) * 2.0 * combinedSize;

      ${I(p,P`
          float angle = radians(materialRotation + rotation);
          float cosAngle = cos(angle);
          float sinAngle = sin(angle);
          mat2 rotate = mat2(cosAngle, -sinAngle, sinAngle,  cosAngle);

          quadOffset.xy = rotate * quadOffset.xy;
        `)}

      quadOffset.xy = (quadOffset.xy + screenOffsetScaled) / viewport.zw * posProj.w;
  `,f=i?a?P`posProj = alignToPixelOrigin(posProj, viewport.zw) + quadOffset;`:P`posProj += quadOffset;
if (inputSize.x == size.x) {
posProj = alignToPixelOrigin(posProj, viewport.zw);
}`:P`posProj += quadOffset;`;h.main.add(P`
    ${A}
    ${r?"vcolor = interpolateVVColor(featureAttribute.y) * materialColor;":"vcolor = color / 255.0 * materialColor;"}

    ${I(y===10,P`vcolor.a = 1.0;`)}

    bool alphaDiscard = vcolor.a < ${P.float(te)};
    ${I(a,`alphaDiscard = alphaDiscard && outlineColor.a < ${P.float(te)};`)}
    if (alphaDiscard) {
      // "early discard" if both symbol color (= fill) and outline color (if applicable) are transparent
      gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
      return;
    } else {
      ${f}
      gl_Position = posProj;
    }

    vtc = uv;

    ${I(l,P`debugBorderCoords = vec4(uv01, 1.5 / combinedSize);`)}
    vsize = inputSize;
  `),v.uniforms.add(new ft("tex",$=>$.texture)),u&&!x&&v.uniforms.add(new Rt("depthMap",$=>$.mainDepth),new Ve("occludedOpacity",$=>$.hudOccludedFragmentOpacity));const z=l?P`(isBorder > 0.0 ? 0.0 : ${P.float(te)})`:P.float(te),O=P`
    ${I(l,P`float isBorder = float(any(lessThan(debugBorderCoords.xy, debugBorderCoords.zw)) || any(greaterThan(debugBorderCoords.xy, 1.0 - debugBorderCoords.zw)));`)}

    vec2 samplePos = vtc;

    ${I(d,P`
      float txSize = float(textureSize(tex, 0).x);
      float texelSize = 1.0 / txSize;

      // Calculate how much we have to add/subtract to/from each texel to reach the size of an onscreen pixel
      vec2 scaleFactor = (vsize - txSize) * texelSize;
      samplePos += (vec2(1.0, -1.0) * texelSize) * scaleFactor;`)}

    ${a?P`
      vec4 fillPixelColor = vcolor;

      // Get distance in output units (i.e. pixels)

      float sdf = texture(tex, samplePos).r;
      float pixelDistance = sdf * vsize.x;

      // Create smooth transition from the icon into its outline
      float fillAlphaFactor = clamp(0.5 - pixelDistance, 0.0, 1.0);
      fillPixelColor.a *= fillAlphaFactor;

      if (outlineSize > 0.25) {
        vec4 outlinePixelColor = outlineColor;
        float clampedOutlineSize = min(outlineSize, 0.5*vsize.x);

        // Create smooth transition around outline
        float outlineAlphaFactor = clamp(0.5 - (abs(pixelDistance) - 0.5*clampedOutlineSize), 0.0, 1.0);
        outlinePixelColor.a *= outlineAlphaFactor;

        if (
          outlineAlphaFactor + fillAlphaFactor < ${z} ||
          fillPixelColor.a + outlinePixelColor.a < ${P.float(te)}
        ) {
          discard;
        }

        // perform un-premultiplied over operator (see https://en.wikipedia.org/wiki/Alpha_compositing#Description)
        float compositeAlpha = outlinePixelColor.a + fillPixelColor.a * (1.0 - outlinePixelColor.a);
        vec3 compositeColor = vec3(outlinePixelColor) * outlinePixelColor.a +
          vec3(fillPixelColor) * fillPixelColor.a * (1.0 - outlinePixelColor.a);

        ${I(!x,P`fragColor = vec4(compositeColor, compositeAlpha);`)}
      } else {
        if (fillAlphaFactor < ${z}) {
          discard;
        }

        ${I(!x,P`fragColor = premultiplyAlpha(fillPixelColor);`)}
      }

      // visualize SDF:
      // fragColor = vec4(clamp(-pixelDistance/vsize.x*2.0, 0.0, 1.0), clamp(pixelDistance/vsize.x*2.0, 0.0, 1.0), 0.0, 1.0);
      `:P`
          vec4 texColor = texture(tex, samplePos, -0.5);
          if (texColor.a < ${z}) {
            discard;
          }
          ${I(!x,P`fragColor = texColor * premultiplyAlpha(vcolor);`)}
          `}

    ${I(u&&!x,P`
        float zSample = texelFetch(depthMap, ivec2(gl_FragCoord.xy), 0).x;
        if (zSample < gl_FragCoord.z) {
          fragColor *= occludedOpacity;
        }
        `)}

    ${I(!x&&l,P`fragColor = mix(fragColor, vec4(1.0, 0.0, 1.0, 1.0), isBorder * 0.5);`)}
  `;switch(y){case 0:case 1:e.outputs.add("fragColor","vec4",0),y===1&&e.outputs.add("fragEmission","vec4",1),m===1&&e.outputs.add("fragAlpha","float",y===1?2:1),v.main.add(P`
        ${O}
        ${I(m===2,P`fragColor.rgb /= fragColor.a;`)}
        ${I(y===1,P`fragEmission = vec4(0.0);`)}
        ${I(m===1,P`fragAlpha = fragColor.a;`)}`);break;case 10:v.main.add(P`
        ${O}
        outputObjectAndLayerIdColor();`);break;case 9:e.include(Lo,o),v.main.add(P`
        ${O}
        outputHighlight(${I(g,P`voccluded == 1.0`,P`false`)});`)}return e}function dt(o){return o.outlineColor[3]>0&&o.outlineSize>0}function me(o){return o.textureIsSignedDistanceField?Da(o.anchorPosition,o.distanceFieldBoundingBox,ze):Jt(ze,o.anchorPosition),ze}function Da(o,e,a){Ze(a,o[0]*(e[2]-e[0])+e[0],o[1]*(e[3]-e[1])+e[1])}const ze=Xe(),$e=32e3,Va=P.float($e),Ta=Object.freeze(Object.defineProperty({__proto__:null,build:It,calculateAnchorPosition:me,fullUV:$e},Symbol.toStringTag,{value:"Module"}));let Fa=class extends No{constructor(e,a){super(e,a,new Wo(Ta,()=>pa(()=>Promise.resolve().then(()=>bn),void 0)),ma([Ht,Gt()].map(da))),this.primitiveType=a.occlusionPass?at.POINTS:at.TRIANGLE_STRIP}initializePipeline(e){const{oitPass:a,hasPolygonOffset:t,draped:n,output:i,depthTestEnabled:s,occlusionPass:l}=e,c=s&&!n&&a!==1&&!l&&i!==9;return ha({blending:jt(i)?Yo(a,!0):null,depthTest:s&&!n?{func:515}:null,depthWrite:c?ga:null,drawBuffers:Qo(a,i),colorWrite:va,polygonOffset:t?Ra:null})}};const Ra={factor:0,units:-4},Ht=_t().vec2u8("uv0",{glNormalized:!0}),Bt=_t().vec3f("position").vec3f("normal").vec4i16("uvi").vec4u8("color").vec2f("size").f32("rotation").vec4f("centerOffsetAndDistance").vec4f("featureAttribute"),ja=Bt.clone().vec4u8("olidColor");function Gt(){return ko()?ja:Bt}let j=class extends Xo{constructor(e){super(),this.spherical=e,this.screenCenterOffsetUnitsEnabled=!1,this.occlusionTestEnabled=!0,this.signedDistanceFieldEnabled=!1,this.sampleSignedDistanceFieldTexelCenter=!1,this.hasVVSize=!1,this.hasVVColor=!1,this.hasVerticalOffset=!1,this.hasScreenSizePerspective=!1,this.hasRotation=!1,this.debugDrawLabelBorder=!1,this.hasPolygonOffset=!1,this.depthTestEnabled=!0,this.pixelSnappingEnabled=!0,this.draped=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.occlusionPass=!1,this.occludedFragmentFade=!1,this.horizonCullingEnabled=!0,this.isFocused=!0,this.olidColorInstanced=!1,this.textureCoordinateType=0,this.emissionSource=0,this.discardInvisibleFragments=!0,this.hasVVInstancing=!1,this.snowCover=!1}};E([U()],j.prototype,"screenCenterOffsetUnitsEnabled",void 0),E([U()],j.prototype,"occlusionTestEnabled",void 0),E([U()],j.prototype,"signedDistanceFieldEnabled",void 0),E([U()],j.prototype,"sampleSignedDistanceFieldTexelCenter",void 0),E([U()],j.prototype,"hasVVSize",void 0),E([U()],j.prototype,"hasVVColor",void 0),E([U()],j.prototype,"hasVerticalOffset",void 0),E([U()],j.prototype,"hasScreenSizePerspective",void 0),E([U()],j.prototype,"hasRotation",void 0),E([U()],j.prototype,"debugDrawLabelBorder",void 0),E([U()],j.prototype,"hasPolygonOffset",void 0),E([U()],j.prototype,"depthTestEnabled",void 0),E([U()],j.prototype,"pixelSnappingEnabled",void 0),E([U()],j.prototype,"draped",void 0),E([U()],j.prototype,"terrainDepthTest",void 0),E([U()],j.prototype,"cullAboveTerrain",void 0),E([U()],j.prototype,"occlusionPass",void 0),E([U()],j.prototype,"occludedFragmentFade",void 0),E([U()],j.prototype,"horizonCullingEnabled",void 0),E([U()],j.prototype,"isFocused",void 0);class Hn extends Zo{constructor(e,a){super(e,Ga),this.produces=new Map([[13,t=>Ee(t)&&!this.parameters.drawAsLabel],[14,t=>Ee(t)&&this.parameters.drawAsLabel],[12,()=>this.parameters.occlusionTest],[18,t=>this.parameters.draped&&Ee(t)]]),this._visible=!0,this._configuration=new j(a)}getConfiguration(e,a){const t=this.parameters.draped;return super.getConfiguration(e,a,this._configuration),this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.hasVerticalOffset=!!this.parameters.verticalOffset,this._configuration.hasScreenSizePerspective=!!this.parameters.screenSizePerspective,this._configuration.screenCenterOffsetUnitsEnabled=this.parameters.centerOffsetUnits==="screen",this._configuration.hasPolygonOffset=this.parameters.polygonOffset,this._configuration.draped=t,this._configuration.occlusionTestEnabled=this.parameters.occlusionTest,this._configuration.pixelSnappingEnabled=this.parameters.pixelSnappingEnabled,this._configuration.signedDistanceFieldEnabled=this.parameters.textureIsSignedDistanceField,this._configuration.sampleSignedDistanceFieldTexelCenter=this.parameters.sampleSignedDistanceFieldTexelCenter,this._configuration.hasRotation=this.parameters.hasRotation,this._configuration.hasVVSize=!!this.parameters.vvSize,this._configuration.hasVVColor=!!this.parameters.vvColor,this._configuration.occlusionPass=a.slot===12,this._configuration.occludedFragmentFade=!t&&this.parameters.occludedFragmentFade,this._configuration.horizonCullingEnabled=this.parameters.horizonCullingEnabled,this._configuration.isFocused=this.parameters.isFocused,this._configuration.depthTestEnabled=this.parameters.depthEnabled||a.slot===12,jt(e)&&(this._configuration.debugDrawLabelBorder=!!Jo.LABELS_SHOW_BORDER),this._configuration.oitPass=a.oitPass,this._configuration.terrainDepthTest=a.terrainDepthTest,this._configuration.cullAboveTerrain=a.cullAboveTerrain,this._configuration}intersect(e,a,t,n,i,s){const{options:{selectionMode:l,hud:c,excludeLabels:r},point:p,camera:u}=t,{parameters:d}=this;if(!l||!c||r&&d.isLabel||!e.visible||!p||!u)return;const b=e.attributes.get("featureAttribute"),y=b==null?null:nt(b.data,We),{scaleX:m,scaleY:h}=Qe(y,d,u.pixelRatio);$t(Oe,a),e.attributes.has("featureAttribute")&&Ua(Oe);const v=e.attributes.get("position"),x=e.attributes.get("size"),g=e.attributes.get("normal"),A=e.attributes.get("rotation"),f=e.attributes.get("centerOffsetAndDistance");Dt(v.size>=3);const z=me(d),O=this.parameters.centerOffsetUnits==="screen";for(let $=0;$<v.data.length/v.size;$++){const B=$*v.size;oe(M,v.data[B],v.data[B+1],v.data[B+2]),le(M,M,a),le(M,M,u.viewMatrix);const w=$*f.size;if(oe(F,f.data[w],f.data[w+1],f.data[w+2]),!O&&(M[0]+=F[0],M[1]+=F[1],F[2]!==0)){const V=F[2];q(F,M),Q(M,M,G(F,F,V))}const T=$*g.size;if(oe(ie,g.data[T],g.data[T+1],g.data[T+2]),ke(ie,Oe,u,be),Ye(this.parameters,M,be,u,de),u.applyProjection(M,D),D[0]>-1){O&&(F[0]||F[1])&&(D[0]+=F[0]*u.pixelRatio,F[1]!==0&&(D[1]+=de.alignmentEvaluator.apply(F[1])*u.pixelRatio),u.unapplyProjection(D,M)),D[0]+=this.parameters.screenOffset[0]*u.pixelRatio,D[1]+=this.parameters.screenOffset[1]*u.pixelRatio,D[0]=Math.floor(D[0]),D[1]=Math.floor(D[1]);const V=$*x.size;_[0]=x.data[V],_[1]=x.data[V+1],de.evaluator.applyVec2(_,_);const Z=kt*u.pixelRatio;let ce=0;d.textureIsSignedDistanceField&&(ce=Math.min(d.outlineSize,.5*_[0])*u.pixelRatio/2),_[0]*=m,_[1]*=h;const J=$*A.size,W=d.rotation+A.data[J];if(Ne(p,D[0],D[1],_,Z,ce,W,d,z)){const ne=t.ray;if(le(Te,M,zt(Lt,u.viewMatrix)),D[0]=p[0],D[1]=p[1],u.unprojectFromRenderScreen(D,M)){const S=R();k(S,ne.direction);const xe=1/ye(S);G(S,S,xe),s(Ot(ne.origin,M)*xe,S,-1,Te)}}}}}intersectDraped(e,a,t,n,i){const s=e.attributes.get("position"),l=e.attributes.get("size"),c=e.attributes.get("rotation"),r=this.parameters,p=me(r),u=e.attributes.get("featureAttribute"),d=u==null?null:nt(u.data,We),{scaleX:b,scaleY:y}=Qe(d,r,e.screenToWorldRatio),m=Ha*e.screenToWorldRatio;for(let h=0;h<s.data.length/s.size;h++){const v=h*s.size,x=s.data[v],g=s.data[v+1],A=h*l.size;_[0]=l.data[A],_[1]=l.data[A+1];let f=0;r.textureIsSignedDistanceField&&(f=Math.min(r.outlineSize,.5*_[0])*e.screenToWorldRatio/2),_[0]*=b,_[1]*=y;const z=h*c.size,O=r.rotation+c.data[z];Ne(t,x,g,_,m,f,O,r,p)&&n(i.distance,i.normal,-1)}}createBufferWriter(){return new qa}applyShaderOffsetsView(e,a,t,n,i,s,l){const c=ke(a,t,i,be);return this._applyVerticalGroundOffsetView(e,c,i,l),Ye(this.parameters,l,c,i,s),this._applyPolygonOffsetView(l,c,n[3],i,l),this._applyCenterOffsetView(l,n,l),l}applyShaderOffsetsNDC(e,a,t,n,i){return this._applyCenterOffsetNDC(e,a,t,n),i!=null&&k(i,n),this._applyPolygonOffsetNDC(n,a,t,n),n}_applyPolygonOffsetView(e,a,t,n,i){const s=n.aboveGround?1:-1;let l=Math.sign(t);l===0&&(l=s);const c=s*l;if(this.parameters.shaderPolygonOffset<=0)return k(i,e);const r=oo(Math.abs(a.cosAngle),.01,1),p=1-Math.sqrt(1-r*r)/r/n.viewport[2];return G(i,e,c>0?p:1/p),i}_applyVerticalGroundOffsetView(e,a,t,n){const i=ye(e),s=t.aboveGround?1:-1,l=t.computeRenderPixelSizeAtDist(i)*Ut,c=G(M,a.normal,s*l);return L(n,e,c),n}_applyCenterOffsetView(e,a,t){const n=this.parameters.centerOffsetUnits!=="screen";return t!==e&&k(t,e),n&&(t[0]+=a[0],t[1]+=a[1],a[2]&&(q(ie,t),ao(t,t,G(ie,ie,a[2])))),t}_applyCenterOffsetNDC(e,a,t,n){const i=this.parameters.centerOffsetUnits!=="screen";return n!==e&&k(n,e),i||(n[0]+=a[0]/t.fullWidth*2,n[1]+=a[1]/t.fullHeight*2),n}_applyPolygonOffsetNDC(e,a,t,n){const i=this.parameters.shaderPolygonOffset;if(e!==n&&k(n,e),i){const s=t.aboveGround?1:-1,l=s*Math.sign(a[3]);n[2]-=(l||s)*i}return n}set visible(e){this._visible=e}get visible(){const{color:e,outlineSize:a,outlineColor:t}=this.parameters,n=e[3]>=te||a>=te&&t[3]>=te;return this._visible&&n}createGLMaterial(e){return new _a(e)}calculateRelativeScreenBounds(e,a,t=At()){return Ea(this.parameters,e,a,t),t[2]=t[0]+e[0],t[3]=t[1]+e[1],t}}class _a extends la{constructor(e){super({...e,...e.material.parameters})}beginSlot(e){return this.updateTexture(this._material.parameters.textureId),this._material.setParameters(this.textureBindParameters),this.getTechnique(Fa,e)}}function Ea(o,e,a,t){t[0]=o.anchorPosition[0]*-e[0]+o.screenOffset[0]*a,t[1]=o.anchorPosition[1]*-e[1]+o.screenOffset[1]*a}function ke(o,e,a,t){return za(e)&&(e=$t(Ia,e)),no(t.normal,o,e),le(t.normal,t.normal,a.viewInverseTransposeMatrix),t.cosAngle=Je(qt,Ba),t}function Ua(o){const e=o[0],a=o[1],t=o[2],n=o[3],i=o[4],s=o[5],l=o[6],c=o[7],r=o[8],p=1/Math.sqrt(e*e+a*a+t*t),u=1/Math.sqrt(n*n+i*i+s*s),d=1/Math.sqrt(l*l+c*c+r*r);return o[0]=e*p,o[1]=a*p,o[2]=t*p,o[3]=n*u,o[4]=i*u,o[5]=s*u,o[6]=l*d,o[7]=c*d,o[8]=r*d,o}function Ne(o,e,a,t,n,i,s,l,c){let r=e-n-t[0]*c[0],p=r+t[0]+2*n,u=a-n-t[1]*c[1],d=u+t[1]+2*n;const b=l.distanceFieldBoundingBox;return l.textureIsSignedDistanceField&&b!=null&&(r+=t[0]*b[0],u+=t[1]*b[1],p-=t[0]*(1-b[2]),d-=t[1]*(1-b[3]),r-=i,p+=i,u-=i,d+=i),Ze(ht,e,a),so(we,o,ht,io(s)),we[0]>r&&we[0]<p&&we[1]>u&&we[1]<d}const de=new Ko,M=R(),ie=R(),D=Fe(),qt=R(),Te=R(),we=Xe(),ht=Xe(),Oe=Pt(),Ia=Pt(),Lt=Ct(),Se=Fe(),F=R(),Ue=R(),We=Fe(),be={normal:qt,cosAngle:0},kt=1,Ha=2,_=St(0,0),Ba=Mt(0,0,1);class Ga extends ea{constructor(){super(...arguments),this.renderOccluded=1,this.isDecoration=!1,this.color=qe(1,1,1,1),this.polygonOffset=!1,this.anchorPosition=St(.5,.5),this.screenOffset=[0,0],this.shaderPolygonOffset=1e-5,this.textureIsSignedDistanceField=!1,this.sampleSignedDistanceFieldTexelCenter=!1,this.outlineColor=qe(1,1,1,1),this.outlineSize=0,this.distanceFieldBoundingBox=Fe(),this.rotation=0,this.hasRotation=!1,this.vvSizeEnabled=!1,this.vvSize=null,this.vvColor=null,this.vvOpacity=null,this.vvSymbolAnchor=null,this.vvSymbolRotationMatrix=null,this.hasSlicePlane=!1,this.pixelSnappingEnabled=!0,this.occlusionTest=!0,this.occludedFragmentFade=!1,this.horizonCullingEnabled=!1,this.centerOffsetUnits="world",this.drawAsLabel=!1,this.depthEnabled=!0,this.isFocused=!0,this.focusStyle="bright",this.draped=!1,this.isLabel=!1}get hasVVSize(){return!!this.vvSize}get hasVVColor(){return!!this.vvColor}get hasVVOpacity(){return!!this.vvOpacity}}class qa{constructor(){this.layout=Ht,this.instanceLayout=Gt()}elementCount(e){return e.get("position").indices.length}elementCountBaseInstance(e){return e.get("uv0").indices.length}write(e,a,t,n,i,s){const{position:l,normal:c,color:r,size:p,rotation:u,centerOffsetAndDistance:d,featureAttribute:b,uvi:y}=i;aa(t.get("position"),e,l,s),na(t.get("normal"),a,c,s);const m=t.get("position").indices.length;let h=0,v=0,x=$e,g=$e;const A=t.get("uvi")?.data;A&&A.length>=4&&(h=A[0],v=A[1],x=A[2],g=A[3]);for(let f=0;f<m;++f){const z=s+f;y.setValues(z,h,v,x,g)}if(sa(t.get("color"),4,r,s),rt(t.get("size"),p,s),ia(t.get("rotation"),u,s),t.get("centerOffsetAndDistance")?lt(t.get("centerOffsetAndDistance"),d,s):ct(d,s,m),t.get("featureAttribute")?lt(t.get("featureAttribute"),b,s):ct(b,s,m),n!=null){const f=t.get("position")?.indices;if(f){const z=f.length,O=i.getField("olidColor",To);ra(n,O,z,s)}}return{numVerticesPerItem:1,numItems:m}}writeBaseInstance(e,a){const{uv0:t}=a;rt(e.get("uv0"),t,0)}intersect(e,a,t,n,i,s,l){const{options:{selectionMode:c,hud:r,excludeLabels:p},point:u,camera:d}=n;if(!c||!r||p&&a.isLabel||!u)return;const b=this.instanceLayout.createView(e),{position:y,normal:m,rotation:h,size:v,featureAttribute:x,centerOffsetAndDistance:g}=b,A=a.centerOffsetUnits==="screen",f=me(a);if(y==null||m==null||h==null||v==null||g==null||d==null)return;const z=x==null?null:x.getVec(0,We),{scaleX:O,scaleY:$}=Qe(z,a,d.pixelRatio),B=y.count;for(let w=0;w<B;w++){if(y.getVec(w,M),t!=null&&L(M,M,t),le(M,M,d.viewMatrix),g.getVec(w,Se),oe(F,Se[0],Se[1],Se[2]),!A&&(M[0]+=F[0],M[1]+=F[1],F[2]!==0)){const T=F[2];q(F,M),Q(M,M,G(F,F,T))}if(m.getVec(w,ie),ke(ie,Oe,d,be),Ye(a,M,be,d,de),d.applyProjection(M,D),D[0]>-1){A&&(F[0]||F[1])&&(D[0]+=F[0]*d.pixelRatio,F[1]!==0&&(D[1]+=de.alignmentEvaluator.apply(F[1])*d.pixelRatio),d.unapplyProjection(D,M)),D[0]+=a.screenOffset[0]*d.pixelRatio,D[1]+=a.screenOffset[1]*d.pixelRatio,D[0]=Math.floor(D[0]),D[1]=Math.floor(D[1]),v.getVec(w,_),de.evaluator.applyVec2(_,_);const T=kt*d.pixelRatio;let V=0;a.textureIsSignedDistanceField&&(V=Math.min(a.outlineSize,.5*_[0])*d.pixelRatio/2),_[0]*=O,_[1]*=$;const Z=h.get(w),ce=a.rotation+Z;if(Ne(u,D[0],D[1],_,T,V,ce,a,f)){const J=n.ray;if(le(Te,M,zt(Lt,d.viewMatrix)),D[0]=u[0],D[1]=u[1],d.unprojectFromRenderScreen(D,M)){const W=R();k(W,J.direction);const ne=1/ye(W);G(W,W,ne),l(Ot(J.origin,M)*ne,W,w,Te)}}}}}}function Qe(o,e,a){return o==null||e.vvSize==null?{scaleX:a,scaleY:a}:(ta(Ue,e,o),{scaleX:Ue[0]*a,scaleY:Ue[1]*a})}function Ye(o,e,a,t,n){if(!o.verticalOffset?.screenLength){const c=ye(e);return n.update(a.cosAngle,c,o.screenSizePerspective,o.screenSizePerspectiveMinPixelReferenceSize,o.screenSizePerspectiveAlignment,null),e}const i=ye(e),s=o.screenSizePerspectiveAlignment??o.screenSizePerspective,l=oa(t,i,o.verticalOffset,a.cosAngle,s,o.screenSizePerspectiveMinPixelReferenceSize);return n.update(a.cosAngle,i,o.screenSizePerspective,o.screenSizePerspectiveMinPixelReferenceSize,o.screenSizePerspectiveAlignment,null),G(a.normal,a.normal,l),L(e,e,a.normal)}function Bn(o,e){if(o.type==="point")return ee(o,e,!1);if(wa(o))switch(o.type){case"extent":return ee(o.center,e,!1);case"polygon":return ee(gt(o),e,!1);case"polyline":return ee(vt(o),e,!0);case"mesh":return ee(xa(o.vertexSpace,o.spatialReference)??o.extent.center,e,!1);case"multipoint":return}else switch(o.type){case"extent":return ee(La(o),e,!0);case"polygon":return ee(gt(o),e,!0);case"polyline":return ee(vt(o),e,!0);case"multipoint":return}}function vt(o){const e=o.paths[0];if(!e||e.length===0)return null;const a=lo(e,co(e)/2);return Ke(a[0],a[1],a[2],o.spatialReference)}function La(o){return Ke(.5*(o.xmax+o.xmin),.5*(o.ymax+o.ymin),o.zmin!=null&&o.zmax!=null&&isFinite(o.zmin)&&isFinite(o.zmax)?.5*(o.zmax+o.zmin):void 0,o.spatialReference)}function gt(o){const e=o.rings[0];if(!e||e.length===0)return null;const a=uo(o.rings,!!o.hasZ);return Ke(a[0],a[1],a[2],o.spatialReference)}function ee(o,e,a){const t=a?o:ba(o);return e&&o?ro(o,t,e)?t:null:t}function Gn(o){if(!o)return 0;switch(o.type){case"point":return o.z;case"extent":return o.zmax;case"polygon":return o.hasZ?o.rings.reduce((e,a)=>a.reduce((t,n)=>Math.max(t,n[2]),e),-1/0):void 0;case"polyline":return o.hasZ?o.paths.reduce((e,a)=>a.reduce((t,n)=>Math.max(t,n[2]),e),-1/0):void 0;case"mesh":return o.extent.zmax;case"multipoint":return}}function qn(o,e,a,t=0){if(o){e||(e=At());const n=o;let i=.5*n.width*(a-1),s=.5*n.height*(a-1);return n.width<1e-7*n.height?i+=s/20:n.height<1e-7*n.width&&(s+=i/20),fo(e,n.xmin-i-t,n.ymin-s-t,n.xmax+i+t,n.ymax+s+t),e}return null}function Ln(o,e,a=null){const t=xo(wo);return o!=null&&(t[0]=o[0],t[1]=o[1],t[2]=o[2],o.length>3&&(t[3]=o[3])),e!=null&&(t[3]=e),a&&bo(t,t,a),t}function kn(o,e,a,t,n,i){for(let s=0;s<3;++s)i[s]=o?.[s]!=null?o[s]:a?.[s]!=null?a[s]:n[s];return i[3]=e??t??n[3],i}function Nn(o=po,e,a,t=1){const n=new Array(3);if(e==null||a==null)n[0]=1,n[1]=1,n[2]=1;else{let i,s=0;for(let l=2;l>=0;l--){const c=o[l],r=c!=null,p=l===0&&!i&&!r,u=a[l];let d;c==="symbol-value"||p?d=u!==0?e[l]/u:1:r&&c!=="proportional"&&isFinite(c)&&(d=u!==0?c/u:1),d!=null&&(n[l]=d,i=d,s=Math.max(s,Math.abs(d)))}for(let l=2;l>=0;l--)n[l]==null?n[l]=i:n[l]===0&&(n[l]=.001*s)}for(let i=2;i>=0;i--)n[i]/=t;return yo(n)}function ka(o){return o.isPrimitive!=null}function Wn(o){return Na(ka(o)?[o.width,o.depth,o.height]:o)?null:"Symbol sizes may not be negative values"}function Na(o){const e=a=>a==null||a>=0;return Array.isArray(o)?o.every(e):e(o)}function Qn(o,e,a,t=Ct()){return o&&$o(t,t,-o/180*Math.PI),e&&Po(t,t,e/180*Math.PI),a&&So(t,t,a/180*Math.PI),t}function Yn(o,e,a){if(a.minDemResolution!=null)return a.minDemResolution;const t=ho(e),n=vo(o)*t,i=go(o)*t,s=mo(o)*(e.isGeographic?1:t);return n===0&&i===0&&s===0?a.minDemResolutionForPoints:.01*Math.max(n,i,s)}function mt(o,e){const a=o[e],t=o[e+1],n=o[e+2];return Math.sqrt(a*a+t*t+n*n)}function Wa(o,e){const a=o[e],t=o[e+1],n=o[e+2],i=1/Math.sqrt(a*a+t*t+n*n);o[e]*=i,o[e+1]*=i,o[e+2]*=i}function xt(o,e,a){o[e]*=a,o[e+1]*=a,o[e+2]*=a}function Qa(o,e,a,t,n,i=e){(n=n||o)[i]=o[e]+a[t],n[i+1]=o[e+1]+a[t+1],n[i+2]=o[e+2]+a[t+2]}function Ya(){return wt??=Xa(),wt}function Xa(){const a=new C([0,0,0,255,255,0,255,255],[0,1,2,3],2,!0);return new ca([["uv0",a]])}let wt=null;const Ie=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]],Za=[0,0,1,-1,0,0,1,0,0,0,-1,0,0,1,0,0,0,-1],Ja=[0,0,1,0,1,1,0,1],Ka=[0,1,2,2,3,0,4,0,3,3,7,4,1,5,6,6,2,1,1,0,4,4,5,1,3,2,6,6,7,3,5,4,7,7,6,5],Nt=new Array(36);for(let o=0;o<6;o++)for(let e=0;e<6;e++)Nt[6*o+e]=o;const se=new Array(36);for(let o=0;o<6;o++)se[6*o]=0,se[6*o+1]=1,se[6*o+2]=2,se[6*o+3]=2,se[6*o+4]=3,se[6*o+5]=0;function Xn(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(24);for(let t=0;t<8;t++)a[3*t]=Ie[t][0]*e[0],a[3*t+1]=Ie[t][1]*e[1],a[3*t+2]=Ie[t][2]*e[2];return new N(o,[["position",new C(a,Ka,3,!0)],["normal",new C(Za,Nt,3)],["uv0",new C(Ja,se,2)]])}const He=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,-.5,0],[0,.5,0]],en=[0,1,-1,1,1,0,0,1,1,-1,1,0,0,-1,-1,1,-1,0,0,-1,1,-1,-1,0],tn=[5,1,0,5,2,1,5,3,2,5,0,3,4,0,1,4,1,2,4,2,3,4,3,0],on=[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7];function Zn(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(18);for(let t=0;t<6;t++)a[3*t]=He[t][0]*e[0],a[3*t+1]=He[t][1]*e[1],a[3*t+2]=He[t][2]*e[2];return new N(o,[["position",new C(a,tn,3,!0)],["normal",new C(en,on,3)]])}const Ae=H(-.5,0,-.5),Ce=H(.5,0,-.5),Me=H(0,0,.5),De=H(0,.5,0),ue=Y(),fe=Y(),he=Y(),ve=Y(),ge=Y();Q(ue,Ae,De),Q(fe,Ae,Ce),ae(he,ue,fe),q(he,he),Q(ue,Ce,De),Q(fe,Ce,Me),ae(ve,ue,fe),q(ve,ve),Q(ue,Me,De),Q(fe,Me,Ae),ae(ge,ue,fe),q(ge,ge);const Be=[Ae,Ce,Me,De],an=[0,-1,0,he[0],he[1],he[2],ve[0],ve[1],ve[2],ge[0],ge[1],ge[2]],nn=[0,1,2,3,1,0,3,2,1,3,0,2],sn=[0,0,0,1,1,1,2,2,2,3,3,3];function Jn(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(12);for(let t=0;t<4;t++)a[3*t]=Be[t][0]*e[0],a[3*t+1]=Be[t][1]*e[1],a[3*t+2]=Be[t][2]*e[2];return new N(o,[["position",new C(a,nn,3,!0)],["normal",new C(an,sn,3)]])}function Kn(o,e,a,t,n={uv:!0}){const i=-Math.PI,s=2*Math.PI,l=-Math.PI/2,c=Math.PI,r=Math.max(3,Math.floor(a)),p=Math.max(2,Math.floor(t)),u=(r+1)*(p+1),d=X(3*u),b=X(3*u),y=X(2*u),m=[];let h=0;for(let g=0;g<=p;g++){const A=[],f=g/p,z=l+f*c,O=Math.cos(z);for(let $=0;$<=r;$++){const B=$/r,w=i+B*s,T=Math.cos(w)*O,V=Math.sin(z),Z=-Math.sin(w)*O;d[3*h]=T*e,d[3*h+1]=V*e,d[3*h+2]=Z*e,b[3*h]=T,b[3*h+1]=V,b[3*h+2]=Z,y[2*h]=B,y[2*h+1]=f,A.push(h),++h}m.push(A)}const v=new Array;for(let g=0;g<p;g++)for(let A=0;A<r;A++){const f=m[g][A],z=m[g][A+1],O=m[g+1][A+1],$=m[g+1][A];g===0?(v.push(f),v.push(O),v.push($)):g===p-1?(v.push(f),v.push(z),v.push(O)):(v.push(f),v.push(z),v.push(O),v.push(O),v.push($),v.push(f))}const x=[["position",new C(d,v,3,!0)],["normal",new C(b,v,3,!0)]];return n.uv&&x.push(["uv0",new C(y,v,2,!0)]),n.offset&&(x[0][0]="offset",x.push(["position",new C(Float64Array.from(n.offset),Et(v.length),3,!0)])),new N(o,x)}function es(o,e,a,t){const n=rn(e,a,t);return new N(o,n)}function rn(o,e,a){const t=o;let n,i;if(a)n=[0,-1,0,1,0,0,0,0,1,-1,0,0,0,0,-1,0,1,0],i=[0,1,2,0,2,3,0,3,4,0,4,1,1,5,2,2,5,3,3,5,4,4,5,1];else{const r=t*(1+Math.sqrt(5))/2;n=[-t,r,0,t,r,0,-t,-r,0,t,-r,0,0,-t,r,0,t,r,0,-t,-r,0,t,-r,r,0,-t,r,0,t,-r,0,-t,-r,0,t],i=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1]}for(let r=0;r<n.length;r+=3)xt(n,r,o/mt(n,r));let s={};function l(r,p){r>p&&([r,p]=[p,r]);const u=r.toString()+"."+p.toString();if(s[u])return s[u];let d=n.length;return n.length+=3,Qa(n,3*r,n,3*p,n,d),xt(n,d,o/mt(n,d)),d/=3,s[u]=d,d}for(let r=0;r<e;r++){const p=i.length,u=new Array(4*p);for(let d=0;d<p;d+=3){const b=i[d],y=i[d+1],m=i[d+2],h=l(b,y),v=l(y,m),x=l(m,b),g=4*d;u[g]=b,u[g+1]=h,u[g+2]=x,u[g+3]=y,u[g+4]=v,u[g+5]=h,u[g+6]=m,u[g+7]=x,u[g+8]=v,u[g+9]=h,u[g+10]=v,u[g+11]=x}i=u,s={}}const c=ut(n);for(let r=0;r<c.length;r+=3)Wa(c,r);return[["position",new C(ut(n),i,3,!0)],["normal",new C(c,i,3,!0)]]}function ts(o,{normal:e,position:a,color:t,rotation:n,size:i,centerOffsetAndDistance:s,uvi:l,featureAttribute:c,olidColor:r=null}={}){const p=a?st(a):R(),u=e?st(e):Mt(0,0,1),d=t?[t[0],t[1],t[2],t.length>3?t[3]:255]:[255,255,255,255],b=i!=null&&i.length===2?i:[1,1],y=n!=null?[n]:[0],m=Et(1),h=[["position",new C(p,m,3,!0)],["normal",new C(u,m,3,!0)],["color",new C(d,m,4,!0)],["size",new C(b,m,2)],["rotation",new C(y,m,1,!0)]];if(l&&h.push(["uvi",new C(l,m,l.length)]),s!=null){const v=[s[0],s[1],s[2],s[3]];h.push(["centerOffsetAndDistance",new C(v,m,4)])}if(c){const v=[c[0],c[1],c[2],c[3]];h.push(["featureAttribute",new C(v,m,4)])}return new N(o,h,null,1,r,void 0,Ya())}const ln=[[-1,-1,0],[1,-1,0],[1,1,0],[-1,1,0]];function os(o,e=ln){const a=new Array(12);for(let r=0;r<4;r++)for(let p=0;p<3;p++)a[3*r+p]=e[r][p];const t=[0,1,2,2,3,0],n=[0,0,1],i=[0,0,0,0,0,0],s=[0,0,1,0,1,1,0,1],l=[255,255,255,255],c=[["position",new C(a,t,3,!0)],["normal",new C(n,i,3,!0)],["uv0",new C(s,t,2,!0)],["color",new C(l,i,4,!0)]];return new N(o,c)}function cn(o,e,a,t,n=!0,i=!0){let s=0;const l=e,c=o;let r=H(0,s,0),p=H(0,s+c,0),u=H(0,-1,0),d=H(0,1,0);t&&(s=c,p=H(0,0,0),r=H(0,s,0),u=H(0,1,0),d=H(0,-1,0));const b=[p,r],y=[u,d],m=a+2,h=Math.sqrt(c*c+l*l);if(t)for(let f=a-1;f>=0;f--){const z=f*(2*Math.PI/a),O=H(Math.cos(z)*l,s,Math.sin(z)*l);b.push(O);const $=H(c*Math.cos(z)/h,-l/h,c*Math.sin(z)/h);y.push($)}else for(let f=0;f<a;f++){const z=f*(2*Math.PI/a),O=H(Math.cos(z)*l,s,Math.sin(z)*l);b.push(O);const $=H(c*Math.cos(z)/h,l/h,c*Math.sin(z)/h);y.push($)}const v=new Array,x=new Array;if(n){for(let f=3;f<b.length;f++)v.push(1),v.push(f-1),v.push(f),x.push(0),x.push(0),x.push(0);v.push(b.length-1),v.push(2),v.push(1),x.push(0),x.push(0),x.push(0)}if(i){for(let f=3;f<b.length;f++)v.push(f),v.push(f-1),v.push(0),x.push(f),x.push(f-1),x.push(1);v.push(0),v.push(2),v.push(b.length-1),x.push(1),x.push(2),x.push(y.length-1)}const g=X(3*m);for(let f=0;f<m;f++)g[3*f]=b[f][0],g[3*f+1]=b[f][1],g[3*f+2]=b[f][2];const A=X(3*m);for(let f=0;f<m;f++)A[3*f]=y[f][0],A[3*f+1]=y[f][1],A[3*f+2]=y[f][2];return[["position",new C(g,v,3,!0)],["normal",new C(A,x,3,!0)]]}function as(o,e,a,t,n,i=!0,s=!0){return new N(o,cn(e,a,t,n,i,s))}function ns(o,e,a,t,n,i,s){const l=n?pt(n):H(1,0,0),c=i?pt(i):H(0,0,0);s??=!0;const r=Y();q(r,l);const p=Y();G(p,r,Math.abs(e));const u=Y();G(u,p,-.5),L(u,u,c);const d=H(0,1,0);Math.abs(1-Je(r,d))<.2&&oe(d,0,0,1);const b=Y();ae(b,r,d),q(b,b),ae(d,b,r);const y=2*t+(s?2:0),m=t+(s?2:0),h=X(3*y),v=X(3*m),x=X(2*y),g=new Array(3*t*(s?4:2)),A=new Array(3*t*(s?4:2));s&&(h[3*(y-2)]=u[0],h[3*(y-2)+1]=u[1],h[3*(y-2)+2]=u[2],x[2*(y-2)]=0,x[2*(y-2)+1]=0,h[3*(y-1)]=h[3*(y-2)]+p[0],h[3*(y-1)+1]=h[3*(y-2)+1]+p[1],h[3*(y-1)+2]=h[3*(y-2)+2]+p[2],x[2*(y-1)]=1,x[2*(y-1)+1]=1,v[3*(m-2)]=-r[0],v[3*(m-2)+1]=-r[1],v[3*(m-2)+2]=-r[2],v[3*(m-1)]=r[0],v[3*(m-1)+1]=r[1],v[3*(m-1)+2]=r[2]);const f=(w,T,V)=>{g[w]=T,A[w]=V};let z=0;const O=Y(),$=Y();for(let w=0;w<t;w++){const T=w*(2*Math.PI/t);G(O,d,Math.sin(T)),G($,b,Math.cos(T)),L(O,O,$),v[3*w]=O[0],v[3*w+1]=O[1],v[3*w+2]=O[2],G(O,O,a),L(O,O,u),h[3*w]=O[0],h[3*w+1]=O[1],h[3*w+2]=O[2],x[2*w]=w/t,x[2*w+1]=0,h[3*(w+t)]=h[3*w]+p[0],h[3*(w+t)+1]=h[3*w+1]+p[1],h[3*(w+t)+2]=h[3*w+2]+p[2],x[2*(w+t)]=w/t,x[2*w+1]=1;const V=(w+1)%t;f(z++,w,w),f(z++,w+t,w),f(z++,V,V),f(z++,V,V),f(z++,w+t,w),f(z++,V+t,V)}if(s){for(let w=0;w<t;w++){const T=(w+1)%t;f(z++,y-2,m-2),f(z++,w,m-2),f(z++,T,m-2)}for(let w=0;w<t;w++){const T=(w+1)%t;f(z++,w+t,m-1),f(z++,y-1,m-1),f(z++,T+t,m-1)}}const B=[["position",new C(h,g,3,!0)],["normal",new C(v,A,3,!0)],["uv0",new C(x,g,2,!0)]];return new N(o,B)}function ss(o,e,a,t,n,i){t=t||10,n=n==null||n,Dt(e.length>1);const s=[[0,0,0]],l=[],c=[];for(let r=0;r<t;r++){l.push([0,-r-1,-(r+1)%t-1]);const p=r/t*2*Math.PI;c.push([Math.cos(p)*a,Math.sin(p)*a])}return un(o,c,e,s,l,n,i)}function un(o,e,a,t,n,i,s=H(0,0,0)){const l=e.length,c=X(a.length*l*3+(6*t.length||0)),r=X(a.length*l*3+(t?6:0)),p=new Array,u=new Array;let d=0,b=0;const y=R(),m=R(),h=R(),v=R(),x=R(),g=R(),A=R(),f=R(),z=R(),O=R(),$=R(),B=R(),w=R(),T=Oo();oe(z,0,1,0),Q(m,a[1],a[0]),q(m,m),i?(L(f,a[0],s),q(h,f)):oe(h,0,0,1),bt(m,h,z,z,x,h,yt),k(v,h),k(B,x);for(let S=0;S<t.length;S++)G(g,x,t[S][0]),G(f,h,t[S][2]),L(g,g,f),L(g,g,a[0]),c[d++]=g[0],c[d++]=g[1],c[d++]=g[2];r[b++]=-m[0],r[b++]=-m[1],r[b++]=-m[2];for(let S=0;S<n.length;S++)p.push(n[S][0]>0?n[S][0]:-n[S][0]-1+t.length),p.push(n[S][1]>0?n[S][1]:-n[S][1]-1+t.length),p.push(n[S][2]>0?n[S][2]:-n[S][2]-1+t.length),u.push(0),u.push(0),u.push(0);let V=t.length;const Z=t.length-1;for(let S=0;S<a.length;S++){let xe=!1;S>0&&(k(y,m),S<a.length-1?(Q(m,a[S+1],a[S]),q(m,m)):xe=!0,L(O,y,m),q(O,O),L($,a[S-1],v),Ao(a[S],O,T),Co(T,Mo($,y),f)?(Q(f,f,a[S]),q(h,f),ae(x,O,h),q(x,x)):bt(O,v,B,z,x,h,yt),k(v,h),k(B,x)),i&&(L(f,a[S],s),q(w,f));for(let K=0;K<l;K++)if(G(g,x,e[K][0]),G(f,h,e[K][1]),L(g,g,f),q(A,g),r[b++]=A[0],r[b++]=A[1],r[b++]=A[2],L(g,g,a[S]),c[d++]=g[0],c[d++]=g[1],c[d++]=g[2],!xe){const Re=(K+1)%l;p.push(V+K),p.push(V+l+K),p.push(V+Re),p.push(V+Re),p.push(V+l+K),p.push(V+l+Re);for(let je=0;je<6;je++){const Zt=p.length-6;u.push(p[Zt+je]-Z)}}V+=l}const ce=a[a.length-1];for(let S=0;S<t.length;S++)G(g,x,t[S][0]),G(f,h,t[S][1]),L(g,g,f),L(g,g,ce),c[d++]=g[0],c[d++]=g[1],c[d++]=g[2];const J=b/3;r[b++]=m[0],r[b++]=m[1],r[b++]=m[2];const W=V-l;for(let S=0;S<n.length;S++)p.push(n[S][0]>=0?V+n[S][0]:-n[S][0]-1+W),p.push(n[S][2]>=0?V+n[S][2]:-n[S][2]-1+W),p.push(n[S][1]>=0?V+n[S][1]:-n[S][1]-1+W),u.push(J),u.push(J),u.push(J);const ne=[["position",new C(c,p,3,!0)],["normal",new C(r,u,3,!0)]];return new N(o,ne)}function is(o,e,a,t,n){const i=zo(3*e.length),s=new Array(2*(e.length-1));let l=0,c=0;for(let p=0;p<e.length;p++){for(let u=0;u<3;u++)i[l++]=e[p][u];p>0&&(s[c++]=p-1,s[c++]=p)}const r=[["position",new C(i,s,3,!0)]];if(a&&a.length===e.length&&a[0].length===3){const p=X(3*a.length);let u=0;for(let d=0;d<e.length;d++)for(let b=0;b<3;b++)p[u++]=a[d][b];r.push(["normal",new C(p,s,3,!0)])}return t&&r.push(["color",new C(t,ya(t.length/4),4)]),new N(o,r,null,2)}function rs(o,e,a,t,n,i=0){const s=new Array(18),l=[[-a,i,n/2],[t,i,n/2],[0,e+i,n/2],[-a,i,-n/2],[t,i,-n/2],[0,e+i,-n/2]],c=[0,1,2,3,0,2,2,5,3,1,4,5,5,2,1,1,0,3,3,4,1,4,3,5];for(let r=0;r<6;r++)s[3*r]=l[r][0],s[3*r+1]=l[r][1],s[3*r+2]=l[r][2];return new N(o,[["position",new C(s,c,3,!0)]])}function ls(o,e){const a=o.getMutableAttribute("position").data;for(let t=0;t<a.length;t+=3){const n=a[t],i=a[t+1],s=a[t+2];oe(pe,n,i,s),le(pe,pe,e),a[t]=pe[0],a[t+1]=pe[1],a[t+2]=pe[2]}}function cs(o,e=o){const a=o.attributes,t=a.get("position").data,n=a.get("normal").data;if(n){const i=e.getMutableAttribute("normal").data;for(let s=0;s<n.length;s+=3){const l=n[s+1];i[s+1]=-n[s+2],i[s+2]=l}}if(t){const i=e.getMutableAttribute("position").data;for(let s=0;s<t.length;s+=3){const l=t[s+1];i[s+1]=-t[s+2],i[s+2]=l}}}function Ge(o,e,a,t,n){return!(Math.abs(Je(e,o))>n)&&(ae(a,o,e),q(a,a),ae(t,a,o),q(t,t),!0)}function bt(o,e,a,t,n,i,s){return Ge(o,e,n,i,s)||Ge(o,a,n,i,s)||Ge(o,t,n,i,s)}const yt=.99619469809,pe=R(),ot=128,re=.5,us=qe(re/2,re/2,1-re/2,1-re/2);function fs(o){return o==="cross"||o==="x"}function ps(o,e=ot,a=e*re,t=0){const{data:n,parameters:i}=fn(o,e,a,t);return new ua(n,i)}function fn(o,e=ot,a=e*re,t=0){return{data:pn(o,e,a,t),parameters:{mipmap:!1,wrap:{s:33071,t:33071},width:e,height:e,noUnpackFlip:!0,dataType:Vo.FLOAT,pixelFormat:6403,internalFormat:Do.R16F,reloadable:!0}}}function pn(o,e=ot,a=e*re,t=0){switch(o){case"circle":default:return dn(e,a);case"square":return hn(e,a);case"cross":return gn(e,a,t);case"x":return mn(e,a,t);case"kite":return vn(e,a);case"triangle":return xn(e,a);case"arrow":return wn(e,a)}}function dn(o,e){const a=o/2-.5;return Pe(o,Yt(a,a,e/2))}function hn(o,e){return Wt(o,e,!1)}function vn(o,e){return Wt(o,e,!0)}function gn(o,e,a=0){return Qt(o,e,!1,a)}function mn(o,e,a=0){return Qt(o,e,!0,a)}function xn(o,e){return Pe(o,Xt(o/2,e,e/2))}function wn(o,e){const a=e,t=e/2,n=o/2,i=.8*a,s=Yt(n,(o-e)/2-i,Math.sqrt(i*i+t*t)),l=Xt(n,a,t);return Pe(o,(c,r)=>Math.max(l(c,r),-s(c,r)))}function Wt(o,e,a){return a&&(e/=Math.SQRT2),Pe(o,(t,n)=>{let i=t-.5*o+.25,s=.5*o-n-.75;if(a){const l=(i+s)/Math.SQRT2;s=(s-i)/Math.SQRT2,i=l}return Math.max(Math.abs(i),Math.abs(s))-.5*e})}function Qt(o,e,a,t=0){e-=t,a&&(e*=Math.SQRT2);const n=.5*e;return Pe(o,(i,s)=>{let l,c=i-.5*o,r=.5*o-s-1;if(a){const p=(c+r)/Math.SQRT2;r=(r-c)/Math.SQRT2,c=p}return c=Math.abs(c),r=Math.abs(r),l=c>r?c>n?Math.sqrt((c-n)*(c-n)+r*r):r:r>n?Math.sqrt(c*c+(r-n)*(r-n)):c,l-=t/2,l})}function Yt(o,e,a){return(t,n)=>{const i=t-o,s=n-e;return Math.sqrt(i*i+s*s)-a}}function Xt(o,e,a){const t=Math.sqrt(e*e+a*a);return(n,i)=>{const s=Math.abs(n-o)-a,l=i-o+e/2+.75,c=(e*s+a*l)/t,r=-l;return Math.max(c,r)}}function Pe(o,e){const a=new Float32Array(o*o);for(let t=0;t<o;t++)for(let n=0;n<o;n++)a[n+o*t]=e(n,t)/o;return a}const bn=Object.freeze(Object.defineProperty({__proto__:null,build:It,calculateAnchorPosition:me,fullUV:$e},Symbol.toStringTag,{value:"Module"}));export{rs as A,kn as B,ot as C,Nn as D,Xn as E,Qn as F,Yn as G,bt as H,Na as I,Ma as J,is as M,Zn as Q,Gn as S,qn as U,Wn as Z,ts as a,os as b,ps as c,ns as d,fn as e,as as f,ss as g,Ln as h,Hn as i,rn as j,tt as k,Kn as l,un as m,Oa as n,re as o,cn as p,Ca as q,pn as r,fs as s,_n as t,us as u,cs as v,Bn as w,Jn as x,ls as y,es as z};
//# sourceMappingURL=HUDMaterial.glsl-BM7unRvk.js.map
