import{X as i,c8 as a}from"./Expand-EkfAPcFa.js";function s(e){const t="metric";if(e==null)return t;const r=e.map,n=(r&&"portalItem"in r?r.portalItem?.portal:null)??i.getDefault();switch(n.user?.units??n.units){case t:return t;case"english":return"imperial"}return a(e.spatialReference)??t}export{s as e};
//# sourceMappingURL=getDefaultUnitForView-CK3DU_Wh.js.map
