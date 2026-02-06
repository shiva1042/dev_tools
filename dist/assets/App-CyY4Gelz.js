import{j as e,r as w,L as ye}from"./index-BkyuEPT-.js";import{c as ge,B as m,P as I,I as T,H as be,T as p}from"./Paper-DfaW9WtE.js";import{C as ue}from"./Chip-B2vQh-SX.js";import{T as de}from"./Tooltip-BhxRvP2v.js";import{D as je}from"./Download-BrcJzUip.js";import{C as fe}from"./ContentCopy-Bbf9qDpY.js";import{T as Ce,a as R}from"./Tab-uMaspo5w.js";import{S as $e}from"./Settings-DYZn9XS3.js";import{S as Pe}from"./Schedule-DWOef-Lo.js";import{S as Se}from"./Storage-CdjmQ0F-.js";import{A as ae,a as se,E as le,b as te}from"./ExpandMore-DX39dUZK.js";import{T as n,F as V,I as U,S as B}from"./TextField-CKUhk3op.js";import{M as g}from"./MenuItem-KaSofiBm.js";import{D as F}from"./Delete-DJrvTfeZ.js";import{B as D}from"./Button-BaUHX52Q.js";import{A as E}from"./Add-Xpg_St2a.js";import{D as ne}from"./Divider-D8e0OBqr.js";import{F as G}from"./FormControlLabel-DgI77G4w.js";import{S as J}from"./Switch-DNMKYfpx.js";import{S as ke}from"./Snackbar-C3pDCdOy.js";import"./Modal-BG9ZP5_0.js";import"./index-BTYDg4gW.js";import"./listItemIconClasses-DiMy5ZeU.js";import"./listItemTextClasses-C6vt__np.js";import"./dividerClasses-BchBYyiZ.js";import"./SwitchBase-BzCKRfcR.js";const ze=ge(e.jsx("path",{d:"M15.9 5c-.17 0-.32.09-.41.23l-.07.15-5.18 11.65c-.16.29-.26.61-.26.96 0 1.11.9 2.01 2.01 2.01.96 0 1.77-.68 1.96-1.59l.01-.03L16.4 5.5c0-.28-.22-.5-.5-.5M1 9l2 2c2.88-2.88 6.79-4.08 10.53-3.62l1.19-2.68C9.89 3.84 4.74 5.27 1 9m20 2 2-2c-1.64-1.64-3.55-2.82-5.59-3.57l-.53 2.82c1.5.62 2.9 1.53 4.12 2.75m-4 4 2-2c-.8-.8-1.7-1.42-2.66-1.89l-.55 2.92c.42.27.83.59 1.21.97M5 13l2 2c1.13-1.13 2.56-1.79 4.03-2l1.28-2.88c-2.63-.08-5.3.87-7.31 2.88"})),Ne=ge(e.jsx("path",{d:"M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11z"})),me={enabled:!1,type:"httpGet",path:"/health",port:8080,command:"",initialDelaySeconds:10,periodSeconds:10,timeoutSeconds:5,failureThreshold:3},xe={name:"app",image:"nginx:latest",imagePullPolicy:"IfNotPresent",ports:[{containerPort:80,name:"http",protocol:"TCP"}],resources:{requests:{cpu:"100m",memory:"128Mi"},limits:{cpu:"500m",memory:"512Mi"}},env:[],envFrom:[],volumeMounts:[],livenessProbe:{...me},readinessProbe:{...me},startupProbe:{...me},command:[],args:[]},Ae={runAsNonRoot:!0,runAsUser:1e3,runAsGroup:1e3,fsGroup:1e3,readOnlyRootFilesystem:!1,allowPrivilegeEscalation:!1},pe=(i,c)=>{if(!i.enabled)return"";let u="";return i.type==="httpGet"?u=`${c}httpGet:
${c}  path: ${i.path}
${c}  port: ${i.port}`:i.type==="tcpSocket"?u=`${c}tcpSocket:
${c}  port: ${i.port}`:u=`${c}exec:
${c}  command:
${i.command.split(" ").map(C=>`${c}    - ${C}`).join(`
`)}`,u+=`
${c}initialDelaySeconds: ${i.initialDelaySeconds}`,u+=`
${c}periodSeconds: ${i.periodSeconds}`,u+=`
${c}timeoutSeconds: ${i.timeoutSeconds}`,u+=`
${c}failureThreshold: ${i.failureThreshold}`,u},oe=(i,c)=>{let u=`${c}- name: ${i.name}
${c}  image: ${i.image}
${c}  imagePullPolicy: ${i.imagePullPolicy}`;return i.ports.length>0&&(u+=`
${c}  ports:`,i.ports.forEach(C=>{u+=`
${c}    - containerPort: ${C.containerPort}`,C.name&&(u+=`
${c}      name: ${C.name}`),u+=`
${c}      protocol: ${C.protocol}`})),u+=`
${c}  resources:
${c}    requests:
${c}      cpu: "${i.resources.requests.cpu}"
${c}      memory: "${i.resources.requests.memory}"
${c}    limits:
${c}      cpu: "${i.resources.limits.cpu}"
${c}      memory: "${i.resources.limits.memory}"`,i.env.length>0&&(u+=`
${c}  env:`,i.env.forEach(C=>{u+=`
${c}    - name: ${C.name}
${c}      value: "${C.value}"`})),i.envFrom.length>0&&(u+=`
${c}  envFrom:`,i.envFrom.forEach(C=>{u+=`
${c}    - ${C.type==="configMap"?"configMapRef":"secretRef"}:
${c}        name: ${C.name}`})),i.volumeMounts.length>0&&(u+=`
${c}  volumeMounts:`,i.volumeMounts.forEach(C=>{u+=`
${c}    - name: ${C.name}
${c}      mountPath: ${C.mountPath}`,C.subPath&&(u+=`
${c}      subPath: ${C.subPath}`),C.readOnly&&(u+=`
${c}      readOnly: true`)})),i.livenessProbe.enabled&&(u+=`
${c}  livenessProbe:
${pe(i.livenessProbe,c+"    ")}`),i.readinessProbe.enabled&&(u+=`
${c}  readinessProbe:
${pe(i.readinessProbe,c+"    ")}`),i.startupProbe.enabled&&(u+=`
${c}  startupProbe:
${pe(i.startupProbe,c+"    ")}`),i.command.length>0&&(u+=`
${c}  command:`,i.command.forEach(C=>{u+=`
${c}    - "${C}"`})),i.args.length>0&&(u+=`
${c}  args:`,i.args.forEach(C=>{u+=`
${c}    - "${C}"`})),u},Ie=(i,c)=>{let u=`${c}- name: ${i.name}`;switch(i.type){case"emptyDir":u+=`
${c}  emptyDir: {}`;break;case"configMap":u+=`
${c}  configMap:
${c}    name: ${i.source}`;break;case"secret":u+=`
${c}  secret:
${c}    secretName: ${i.source}`;break;case"persistentVolumeClaim":u+=`
${c}  persistentVolumeClaim:
${c}    claimName: ${i.source}`;break;case"hostPath":u+=`
${c}  hostPath:
${c}    path: ${i.source}`;break}return u};function la(){const[i,c]=w.useState("Deployment"),[u,C]=w.useState({open:!1,message:""}),[t,d]=w.useState({name:"my-app",namespace:"default",replicas:3,strategy:"RollingUpdate",maxSurge:"25%",maxUnavailable:"25%",containers:[{...xe}],initContainers:[],volumes:[],labels:[{key:"app",value:"my-app"}],annotations:[],nodeSelector:[],tolerations:[],securityContext:{...Ae},serviceAccountName:"",restartPolicy:"Always",terminationGracePeriodSeconds:30}),[x,M]=w.useState({name:"my-app-svc",namespace:"default",type:"ClusterIP",ports:[{name:"http",port:80,targetPort:80,protocol:"TCP"}],selector:[{key:"app",value:"my-app"}],externalTrafficPolicy:"Cluster",sessionAffinity:"None",externalName:"",loadBalancerIP:"",annotations:[]}),[h,L]=w.useState({name:"my-app-ingress",namespace:"default",ingressClassName:"nginx",rules:[{host:"example.com",paths:[{path:"/",pathType:"Prefix",serviceName:"my-app-svc",servicePort:80}]}],tls:[],annotations:[{key:"nginx.ingress.kubernetes.io/rewrite-target",value:"/"}]}),[z,K]=w.useState({name:"my-config",namespace:"default",data:[{key:"APP_ENV",value:"production"},{key:"LOG_LEVEL",value:"info"}],binaryData:[],immutable:!1}),[$,W]=w.useState({name:"my-secret",namespace:"default",type:"Opaque",data:[],stringData:[{key:"username",value:"admin"},{key:"password",value:"changeme"}],immutable:!1}),[P,Y]=w.useState({name:"my-pvc",namespace:"default",accessModes:["ReadWriteOnce"],storageClassName:"standard",storage:"10Gi",volumeMode:"Filesystem",selector:[]}),[v,H]=w.useState({name:"my-app-hpa",namespace:"default",targetRef:{kind:"Deployment",name:"my-app"},minReplicas:2,maxReplicas:10,metrics:[{type:"cpu",name:"cpu",target:80},{type:"memory",name:"memory",target:80}],scaleDownStabilization:300,scaleUpStabilization:0}),[b,O]=w.useState({name:"my-job",namespace:"default",completions:1,parallelism:1,backoffLimit:6,activeDeadlineSeconds:0,ttlSecondsAfterFinished:100,restartPolicy:"OnFailure",containers:[{...xe,name:"job"}]}),[y,q]=w.useState({name:"my-cronjob",namespace:"default",schedule:"*/5 * * * *",concurrencyPolicy:"Allow",successfulJobsHistoryLimit:3,failedJobsHistoryLimit:1,suspend:!1,jobTemplate:{...b}}),[j,Q]=w.useState({name:"my-network-policy",namespace:"default",podSelector:[{key:"app",value:"my-app"}],policyTypes:["Ingress","Egress"],ingress:[{from:[],ports:[{protocol:"TCP",port:80}]}],egress:[{to:[],ports:[{protocol:"TCP",port:443}]}]}),[S,_]=w.useState({name:"my-pdb",namespace:"default",selector:[{key:"app",value:"my-app"}],minAvailable:"50%",maxUnavailable:"1",useMinAvailable:!0}),[f,X]=w.useState({...t,name:"my-statefulset",serviceName:"my-statefulset-headless",podManagementPolicy:"OrderedReady",volumeClaimTemplates:[{...P,name:"data"}]}),re=w.useMemo(()=>{switch(i){case"Deployment":{let a=`apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${t.name}
  namespace: ${t.namespace}
  labels:
${t.labels.map(s=>`    ${s.key}: "${s.value}"`).join(`
`)}`;return t.annotations.length>0&&(a+=`
  annotations:
${t.annotations.map(s=>`    ${s.key}: "${s.value}"`).join(`
`)}`),a+=`
spec:
  replicas: ${t.replicas}
  strategy:
    type: ${t.strategy}`,t.strategy==="RollingUpdate"&&(a+=`
    rollingUpdate:
      maxSurge: ${t.maxSurge}
      maxUnavailable: ${t.maxUnavailable}`),a+=`
  selector:
    matchLabels:
${t.labels.map(s=>`      ${s.key}: "${s.value}"`).join(`
`)}
  template:
    metadata:
      labels:
${t.labels.map(s=>`        ${s.key}: "${s.value}"`).join(`
`)}
    spec:
      terminationGracePeriodSeconds: ${t.terminationGracePeriodSeconds}`,t.serviceAccountName&&(a+=`
      serviceAccountName: ${t.serviceAccountName}`),a+=`
      securityContext:
        runAsNonRoot: ${t.securityContext.runAsNonRoot}
        runAsUser: ${t.securityContext.runAsUser}
        runAsGroup: ${t.securityContext.runAsGroup}
        fsGroup: ${t.securityContext.fsGroup}`,t.nodeSelector.length>0&&(a+=`
      nodeSelector:
${t.nodeSelector.map(s=>`        ${s.key}: "${s.value}"`).join(`
`)}`),t.tolerations.length>0&&(a+=`
      tolerations:`,t.tolerations.forEach(s=>{a+=`
        - key: "${s.key}"
          operator: "${s.operator}"`,s.value&&(a+=`
          value: "${s.value}"`),a+=`
          effect: "${s.effect}"`})),t.initContainers.length>0&&(a+=`
      initContainers:
${t.initContainers.map(s=>oe(s,"      ")).join(`
`)}`),a+=`
      containers:
${t.containers.map(s=>oe(s,"      ")).join(`
`)}`,t.volumes.length>0&&(a+=`
      volumes:
${t.volumes.map(s=>Ie(s,"      ")).join(`
`)}`),a}case"StatefulSet":{let a=`apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${f.name}
  namespace: ${f.namespace}
  labels:
${f.labels.map(s=>`    ${s.key}: "${s.value}"`).join(`
`)}
spec:
  serviceName: ${f.serviceName}
  replicas: ${f.replicas}
  podManagementPolicy: ${f.podManagementPolicy}
  selector:
    matchLabels:
${f.labels.map(s=>`      ${s.key}: "${s.value}"`).join(`
`)}
  template:
    metadata:
      labels:
${f.labels.map(s=>`        ${s.key}: "${s.value}"`).join(`
`)}
    spec:
      terminationGracePeriodSeconds: ${f.terminationGracePeriodSeconds}
      containers:
${f.containers.map(s=>oe(s,"      ")).join(`
`)}`;return f.volumeClaimTemplates.length>0&&(a+=`
  volumeClaimTemplates:`,f.volumeClaimTemplates.forEach(s=>{a+=`
    - metadata:
        name: ${s.name}
      spec:
        accessModes:
${s.accessModes.map(l=>`          - ${l}`).join(`
`)}
        storageClassName: ${s.storageClassName}
        resources:
          requests:
            storage: ${s.storage}`})),a}case"DaemonSet":return`apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ${t.name}-ds
  namespace: ${t.namespace}
  labels:
${t.labels.map(a=>`    ${a.key}: "${a.value}"`).join(`
`)}
spec:
  selector:
    matchLabels:
${t.labels.map(a=>`      ${a.key}: "${a.value}"`).join(`
`)}
  template:
    metadata:
      labels:
${t.labels.map(a=>`        ${a.key}: "${a.value}"`).join(`
`)}
    spec:
      tolerations:
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
          effect: NoSchedule
      containers:
${t.containers.map(a=>oe(a,"      ")).join(`
`)}`;case"Job":return`apiVersion: batch/v1
kind: Job
metadata:
  name: ${b.name}
  namespace: ${b.namespace}
spec:
  completions: ${b.completions}
  parallelism: ${b.parallelism}
  backoffLimit: ${b.backoffLimit}${b.activeDeadlineSeconds>0?`
  activeDeadlineSeconds: ${b.activeDeadlineSeconds}`:""}
  ttlSecondsAfterFinished: ${b.ttlSecondsAfterFinished}
  template:
    spec:
      restartPolicy: ${b.restartPolicy}
      containers:
${b.containers.map(a=>oe(a,"      ")).join(`
`)}`;case"CronJob":return`apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${y.name}
  namespace: ${y.namespace}
spec:
  schedule: "${y.schedule}"
  concurrencyPolicy: ${y.concurrencyPolicy}
  successfulJobsHistoryLimit: ${y.successfulJobsHistoryLimit}
  failedJobsHistoryLimit: ${y.failedJobsHistoryLimit}
  suspend: ${y.suspend}
  jobTemplate:
    spec:
      completions: ${y.jobTemplate.completions}
      parallelism: ${y.jobTemplate.parallelism}
      backoffLimit: ${y.jobTemplate.backoffLimit}
      template:
        spec:
          restartPolicy: ${y.jobTemplate.restartPolicy}
          containers:
${y.jobTemplate.containers.map(a=>oe(a,"          ")).join(`
`)}`;case"Service":{let a=`apiVersion: v1
kind: Service
metadata:
  name: ${x.name}
  namespace: ${x.namespace}`;return x.annotations.length>0&&(a+=`
  annotations:
${x.annotations.map(s=>`    ${s.key}: "${s.value}"`).join(`
`)}`),a+=`
spec:
  type: ${x.type}`,x.type==="ExternalName"?a+=`
  externalName: ${x.externalName}`:(x.type==="LoadBalancer"&&x.loadBalancerIP&&(a+=`
  loadBalancerIP: ${x.loadBalancerIP}`),x.type!=="ClusterIP"&&(a+=`
  externalTrafficPolicy: ${x.externalTrafficPolicy}`),a+=`
  sessionAffinity: ${x.sessionAffinity}
  ports:`,x.ports.forEach(s=>{a+=`
    - name: ${s.name}
      port: ${s.port}
      targetPort: ${s.targetPort}
      protocol: ${s.protocol}`,x.type==="NodePort"&&s.nodePort&&(a+=`
      nodePort: ${s.nodePort}`)}),a+=`
  selector:
${x.selector.map(s=>`    ${s.key}: "${s.value}"`).join(`
`)}`),a}case"Ingress":{let a=`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${h.name}
  namespace: ${h.namespace}`;return h.annotations.length>0&&(a+=`
  annotations:
${h.annotations.map(s=>`    ${s.key}: "${s.value}"`).join(`
`)}`),a+=`
spec:
  ingressClassName: ${h.ingressClassName}`,h.tls.length>0&&(a+=`
  tls:`,h.tls.forEach(s=>{a+=`
    - hosts:
${s.hosts.map(l=>`        - ${l}`).join(`
`)}
      secretName: ${s.secretName}`})),a+=`
  rules:`,h.rules.forEach(s=>{a+=`
    - host: ${s.host}
      http:
        paths:`,s.paths.forEach(l=>{a+=`
          - path: ${l.path}
            pathType: ${l.pathType}
            backend:
              service:
                name: ${l.serviceName}
                port:
                  number: ${l.servicePort}`})}),a}case"ConfigMap":{let a=`apiVersion: v1
kind: ConfigMap
metadata:
  name: ${z.name}
  namespace: ${z.namespace}`;return z.immutable&&(a+=`
immutable: true`),z.data.length>0&&(a+=`
data:`,z.data.forEach(s=>{s.value.includes(`
`)?a+=`
  ${s.key}: |
${s.value.split(`
`).map(l=>`    ${l}`).join(`
`)}`:a+=`
  ${s.key}: "${s.value}"`})),a}case"Secret":{let a=`apiVersion: v1
kind: Secret
metadata:
  name: ${$.name}
  namespace: ${$.namespace}
type: ${$.type}`;return $.immutable&&(a+=`
immutable: true`),$.stringData.length>0&&(a+=`
stringData:`,$.stringData.forEach(s=>{a+=`
  ${s.key}: "${s.value}"`})),$.data.length>0&&(a+=`
data:`,$.data.forEach(s=>{a+=`
  ${s.key}: ${btoa(s.value)}`})),a}case"PVC":{let a=`apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${P.name}
  namespace: ${P.namespace}
spec:
  accessModes:
${P.accessModes.map(s=>`    - ${s}`).join(`
`)}
  storageClassName: ${P.storageClassName}
  volumeMode: ${P.volumeMode}
  resources:
    requests:
      storage: ${P.storage}`;return P.selector.length>0&&(a+=`
  selector:
    matchLabels:
${P.selector.map(s=>`      ${s.key}: "${s.value}"`).join(`
`)}`),a}case"HPA":return`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${v.name}
  namespace: ${v.namespace}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: ${v.targetRef.kind}
    name: ${v.targetRef.name}
  minReplicas: ${v.minReplicas}
  maxReplicas: ${v.maxReplicas}
  metrics:
${v.metrics.map(a=>`    - type: Resource
      resource:
        name: ${a.name}
        target:
          type: Utilization
          averageUtilization: ${a.target}`).join(`
`)}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: ${v.scaleDownStabilization}
    scaleUp:
      stabilizationWindowSeconds: ${v.scaleUpStabilization}`;case"NetworkPolicy":{let a=`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${j.name}
  namespace: ${j.namespace}
spec:
  podSelector:
    matchLabels:
${j.podSelector.map(s=>`      ${s.key}: "${s.value}"`).join(`
`)}
  policyTypes:
${j.policyTypes.map(s=>`    - ${s}`).join(`
`)}`;return j.policyTypes.includes("Ingress")&&j.ingress.length>0&&(a+=`
  ingress:`,j.ingress.forEach(s=>{a+=`
    - ports:`,s.ports.forEach(l=>{a+=`
        - protocol: ${l.protocol}
          port: ${l.port}`}),s.from.length>0&&(a+=`
      from:`,s.from.forEach(()=>{a+=`
        - podSelector: {}`}))})),j.policyTypes.includes("Egress")&&j.egress.length>0&&(a+=`
  egress:`,j.egress.forEach(s=>{a+=`
    - ports:`,s.ports.forEach(l=>{a+=`
        - protocol: ${l.protocol}
          port: ${l.port}`})})),a}case"PodDisruptionBudget":return`apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ${S.name}
  namespace: ${S.namespace}
spec:
  ${S.useMinAvailable?"minAvailable":"maxUnavailable"}: ${S.useMinAvailable?S.minAvailable:S.maxUnavailable}
  selector:
    matchLabels:
${S.selector.map(a=>`      ${a.key}: "${a.value}"`).join(`
`)}`;case"ServiceAccount":return`apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${t.serviceAccountName||"my-service-account"}
  namespace: ${t.namespace}
automountServiceAccountToken: true`;case"Namespace":return`apiVersion: v1
kind: Namespace
metadata:
  name: ${t.namespace}
  labels:
    name: ${t.namespace}`;default:return""}},[i,t,f,x,h,z,$,P,v,b,y,j,S]),he=async()=>{await navigator.clipboard.writeText(re),C({open:!0,message:"Copied to clipboard!"})},ve=()=>{const a=new Blob([re],{type:"text/yaml"}),s=URL.createObjectURL(a),l=document.createElement("a");l.href=s,l.download=`${i.toLowerCase()}.yaml`,l.click(),URL.revokeObjectURL(s)},N=(a,s,l,o=!1)=>{const A=o?[...t.initContainers]:[...t.containers],k=s.split(".");let ie=A[a];for(let ce=0;ce<k.length-1;ce++)ie=ie[k[ce]];ie[k[k.length-1]]=l,d(o?{...t,initContainers:A}:{...t,containers:A})},Z=(a,s,l)=>s([...a,l]),ee=(a,s,l)=>s(a.filter((o,A)=>A!==l)),r={"& .MuiInputBase-root":{color:"grey.300"},"& .MuiInputLabel-root":{color:"grey.500"}};return e.jsxs(m,{sx:{minHeight:"100vh",bgcolor:"#0a0a0a"},children:[e.jsx(I,{elevation:0,sx:{bgcolor:"#111",borderBottom:"1px solid #222",px:3,py:2},children:e.jsxs(m,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[e.jsxs(m,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(ye,{to:"/",children:e.jsx(T,{size:"small",sx:{color:"grey.500"},children:e.jsx(be,{})})}),e.jsx(p,{variant:"h5",sx:{color:"white",fontWeight:600},children:"Kubernetes YAML Builder"}),e.jsx(ue,{label:"Advanced",size:"small",color:"primary"})]}),e.jsxs(m,{sx:{display:"flex",gap:1},children:[e.jsx(de,{title:"Download YAML",children:e.jsx(T,{onClick:ve,sx:{color:"grey.500"},children:e.jsx(je,{})})}),e.jsx(de,{title:"Copy to Clipboard",children:e.jsx(T,{onClick:he,sx:{color:"grey.500"},children:e.jsx(fe,{})})})]})]})}),e.jsx(I,{sx:{bgcolor:"#0d0d0d",borderBottom:"1px solid #222"},children:e.jsxs(Ce,{value:i,onChange:(a,s)=>c(s),variant:"scrollable",scrollButtons:"auto",sx:{"& .MuiTab-root":{color:"grey.500",minWidth:100},"& .Mui-selected":{color:"#90caf9"}},children:[e.jsx(R,{icon:e.jsx($e,{}),iconPosition:"start",label:"Deployment",value:"Deployment"}),e.jsx(R,{label:"StatefulSet",value:"StatefulSet"}),e.jsx(R,{label:"DaemonSet",value:"DaemonSet"}),e.jsx(R,{icon:e.jsx(Pe,{}),iconPosition:"start",label:"Job",value:"Job"}),e.jsx(R,{label:"CronJob",value:"CronJob"}),e.jsx(R,{icon:e.jsx(ze,{}),iconPosition:"start",label:"Service",value:"Service"}),e.jsx(R,{label:"Ingress",value:"Ingress"}),e.jsx(R,{icon:e.jsx(Se,{}),iconPosition:"start",label:"ConfigMap",value:"ConfigMap"}),e.jsx(R,{label:"Secret",value:"Secret"}),e.jsx(R,{label:"PVC",value:"PVC"}),e.jsx(R,{label:"HPA",value:"HPA"}),e.jsx(R,{icon:e.jsx(Ne,{}),iconPosition:"start",label:"NetworkPolicy",value:"NetworkPolicy"}),e.jsx(R,{label:"PDB",value:"PodDisruptionBudget"}),e.jsx(R,{label:"ServiceAccount",value:"ServiceAccount"}),e.jsx(R,{label:"Namespace",value:"Namespace"})]})}),e.jsxs(m,{sx:{display:"flex",height:"calc(100vh - 130px)"},children:[e.jsxs(m,{sx:{flex:1,p:2,overflow:"auto"},children:[i==="Deployment"&&e.jsxs(e.Fragment,{children:[e.jsxs(ae,{defaultExpanded:!0,sx:{bgcolor:"#111",border:"1px solid #222",mb:1},children:[e.jsx(se,{expandIcon:e.jsx(le,{sx:{color:"grey.500"}}),children:e.jsx(p,{sx:{color:"grey.300"},children:"Metadata & Replicas"})}),e.jsxs(te,{children:[e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:t.name,onChange:a=>d({...t,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:t.namespace,onChange:a=>d({...t,namespace:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Replicas",type:"number",value:t.replicas,onChange:a=>d({...t,replicas:parseInt(a.target.value)||1}),sx:{width:100,...r}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsxs(V,{size:"small",sx:{flex:1},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Strategy"}),e.jsxs(B,{value:t.strategy,label:"Strategy",onChange:a=>d({...t,strategy:a.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"RollingUpdate",children:"RollingUpdate"}),e.jsx(g,{value:"Recreate",children:"Recreate"})]})]}),t.strategy==="RollingUpdate"&&e.jsxs(e.Fragment,{children:[e.jsx(n,{size:"small",label:"Max Surge",value:t.maxSurge,onChange:a=>d({...t,maxSurge:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Max Unavailable",value:t.maxUnavailable,onChange:a=>d({...t,maxUnavailable:a.target.value}),sx:{flex:1,...r}})]})]}),e.jsx(n,{size:"small",label:"Service Account Name",value:t.serviceAccountName,onChange:a=>d({...t,serviceAccountName:a.target.value}),sx:{width:"100%",mb:2,...r}}),e.jsx(n,{size:"small",label:"Termination Grace Period (seconds)",type:"number",value:t.terminationGracePeriodSeconds,onChange:a=>d({...t,terminationGracePeriodSeconds:parseInt(a.target.value)||30}),sx:{width:250,...r}})]})]}),e.jsxs(ae,{sx:{bgcolor:"#111",border:"1px solid #222",mb:1},children:[e.jsx(se,{expandIcon:e.jsx(le,{sx:{color:"grey.500"}}),children:e.jsx(p,{sx:{color:"grey.300"},children:"Labels & Annotations"})}),e.jsxs(te,{children:[e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Labels"}),t.labels.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...t.labels];o[s].key=l.target.value,d({...t,labels:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...t.labels];o[s].value=l.target.value,d({...t,labels:o})},sx:{flex:1,...r}}),e.jsx(T,{size:"small",onClick:()=>ee(t.labels,l=>d({...t,labels:l}),s),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>Z(t.labels,a=>d({...t,labels:a}),{key:"",value:""}),children:"Add Label"}),e.jsx(ne,{sx:{my:2,borderColor:"#333"}}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Annotations"}),t.annotations.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...t.annotations];o[s].key=l.target.value,d({...t,annotations:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...t.annotations];o[s].value=l.target.value,d({...t,annotations:o})},sx:{flex:1,...r}}),e.jsx(T,{size:"small",onClick:()=>ee(t.annotations,l=>d({...t,annotations:l}),s),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>Z(t.annotations,a=>d({...t,annotations:a}),{key:"",value:""}),children:"Add Annotation"})]})]}),e.jsxs(ae,{defaultExpanded:!0,sx:{bgcolor:"#111",border:"1px solid #222",mb:1},children:[e.jsx(se,{expandIcon:e.jsx(le,{sx:{color:"grey.500"}}),children:e.jsxs(p,{sx:{color:"grey.300"},children:["Containers (",t.containers.length,")"]})}),e.jsxs(te,{children:[t.containers.map((a,s)=>e.jsxs(I,{sx:{bgcolor:"#0a0a0a",p:2,mb:2,border:"1px solid #333"},children:[e.jsxs(m,{sx:{display:"flex",justifyContent:"space-between",mb:2},children:[e.jsxs(p,{variant:"subtitle2",sx:{color:"grey.400"},children:["Container #",s+1]}),t.containers.length>1&&e.jsx(T,{size:"small",onClick:()=>ee(t.containers,l=>d({...t,containers:l}),s),sx:{color:"error.main"},children:e.jsx(F,{})})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:a.name,onChange:l=>N(s,"name",l.target.value),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Image",value:a.image,onChange:l=>N(s,"image",l.target.value),sx:{flex:2,...r}}),e.jsxs(V,{size:"small",sx:{width:140},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Pull Policy"}),e.jsxs(B,{value:a.imagePullPolicy,label:"Pull Policy",onChange:l=>N(s,"imagePullPolicy",l.target.value),sx:{color:"grey.300"},children:[e.jsx(g,{value:"Always",children:"Always"}),e.jsx(g,{value:"IfNotPresent",children:"IfNotPresent"}),e.jsx(g,{value:"Never",children:"Never"})]})]})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Resources"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"CPU Request",value:a.resources.requests.cpu,onChange:l=>N(s,"resources.requests.cpu",l.target.value),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Memory Request",value:a.resources.requests.memory,onChange:l=>N(s,"resources.requests.memory",l.target.value),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"CPU Limit",value:a.resources.limits.cpu,onChange:l=>N(s,"resources.limits.cpu",l.target.value),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Memory Limit",value:a.resources.limits.memory,onChange:l=>N(s,"resources.limits.memory",l.target.value),sx:{flex:1,...r}})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Health Probes"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(G,{control:e.jsx(J,{checked:a.livenessProbe.enabled,onChange:l=>N(s,"livenessProbe.enabled",l.target.checked),size:"small"}),label:"Liveness",sx:{color:"grey.400"}}),e.jsx(G,{control:e.jsx(J,{checked:a.readinessProbe.enabled,onChange:l=>N(s,"readinessProbe.enabled",l.target.checked),size:"small"}),label:"Readiness",sx:{color:"grey.400"}}),e.jsx(G,{control:e.jsx(J,{checked:a.startupProbe.enabled,onChange:l=>N(s,"startupProbe.enabled",l.target.checked),size:"small"}),label:"Startup",sx:{color:"grey.400"}})]}),(a.livenessProbe.enabled||a.readinessProbe.enabled||a.startupProbe.enabled)&&e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Probe Path",value:a.livenessProbe.path,onChange:l=>{N(s,"livenessProbe.path",l.target.value),N(s,"readinessProbe.path",l.target.value),N(s,"startupProbe.path",l.target.value)},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Probe Port",type:"number",value:a.livenessProbe.port,onChange:l=>{const o=parseInt(l.target.value)||8080;N(s,"livenessProbe.port",o),N(s,"readinessProbe.port",o),N(s,"startupProbe.port",o)},sx:{width:120,...r}})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Environment Variables"}),a.env.map((l,o)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Name",value:l.name,onChange:A=>{const k=[...a.env];k[o].name=A.target.value,N(s,"env",k)},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:l.value,onChange:A=>{const k=[...a.env];k[o].value=A.target.value,N(s,"env",k)},sx:{flex:1,...r}}),e.jsx(T,{size:"small",onClick:()=>N(s,"env",a.env.filter((A,k)=>k!==o)),sx:{color:"grey.500"},children:e.jsx(F,{})})]},o)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>N(s,"env",[...a.env,{name:"",value:""}]),children:"Add Env"})]},s)),e.jsx(D,{startIcon:e.jsx(E,{}),onClick:()=>Z(t.containers,a=>d({...t,containers:a}),{...xe,name:`container-${t.containers.length+1}`}),children:"Add Container"})]})]}),e.jsxs(ae,{sx:{bgcolor:"#111",border:"1px solid #222",mb:1},children:[e.jsx(se,{expandIcon:e.jsx(le,{sx:{color:"grey.500"}}),children:e.jsx(p,{sx:{color:"grey.300"},children:"Security Context"})}),e.jsx(te,{children:e.jsxs(m,{sx:{display:"flex",flexWrap:"wrap",gap:2},children:[e.jsx(G,{control:e.jsx(J,{checked:t.securityContext.runAsNonRoot,onChange:a=>d({...t,securityContext:{...t.securityContext,runAsNonRoot:a.target.checked}})}),label:"Run as Non-Root",sx:{color:"grey.400"}}),e.jsx(n,{size:"small",label:"Run as User",type:"number",value:t.securityContext.runAsUser,onChange:a=>d({...t,securityContext:{...t.securityContext,runAsUser:parseInt(a.target.value)||1e3}}),sx:{width:120,...r}}),e.jsx(n,{size:"small",label:"Run as Group",type:"number",value:t.securityContext.runAsGroup,onChange:a=>d({...t,securityContext:{...t.securityContext,runAsGroup:parseInt(a.target.value)||1e3}}),sx:{width:120,...r}}),e.jsx(n,{size:"small",label:"FS Group",type:"number",value:t.securityContext.fsGroup,onChange:a=>d({...t,securityContext:{...t.securityContext,fsGroup:parseInt(a.target.value)||1e3}}),sx:{width:120,...r}})]})})]}),e.jsxs(ae,{sx:{bgcolor:"#111",border:"1px solid #222",mb:1},children:[e.jsx(se,{expandIcon:e.jsx(le,{sx:{color:"grey.500"}}),children:e.jsxs(p,{sx:{color:"grey.300"},children:["Volumes (",t.volumes.length,")"]})}),e.jsxs(te,{children:[t.volumes.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Name",value:a.name,onChange:l=>{const o=[...t.volumes];o[s].name=l.target.value,d({...t,volumes:o})},sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{width:180},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Type"}),e.jsxs(B,{value:a.type,label:"Type",onChange:l=>{const o=[...t.volumes];o[s].type=l.target.value,d({...t,volumes:o})},sx:{color:"grey.300"},children:[e.jsx(g,{value:"emptyDir",children:"emptyDir"}),e.jsx(g,{value:"configMap",children:"ConfigMap"}),e.jsx(g,{value:"secret",children:"Secret"}),e.jsx(g,{value:"persistentVolumeClaim",children:"PVC"}),e.jsx(g,{value:"hostPath",children:"hostPath"})]})]}),e.jsx(n,{size:"small",label:"Source",value:a.source,onChange:l=>{const o=[...t.volumes];o[s].source=l.target.value,d({...t,volumes:o})},sx:{flex:1,...r}}),e.jsx(T,{size:"small",onClick:()=>ee(t.volumes,l=>d({...t,volumes:l}),s),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>Z(t.volumes,a=>d({...t,volumes:a}),{name:"",type:"emptyDir",source:""}),children:"Add Volume"})]})]}),e.jsxs(ae,{sx:{bgcolor:"#111",border:"1px solid #222",mb:1},children:[e.jsx(se,{expandIcon:e.jsx(le,{sx:{color:"grey.500"}}),children:e.jsx(p,{sx:{color:"grey.300"},children:"Node Selector & Tolerations"})}),e.jsxs(te,{children:[e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Node Selector"}),t.nodeSelector.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...t.nodeSelector];o[s].key=l.target.value,d({...t,nodeSelector:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...t.nodeSelector];o[s].value=l.target.value,d({...t,nodeSelector:o})},sx:{flex:1,...r}}),e.jsx(T,{size:"small",onClick:()=>ee(t.nodeSelector,l=>d({...t,nodeSelector:l}),s),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>Z(t.nodeSelector,a=>d({...t,nodeSelector:a}),{key:"",value:""}),children:"Add Node Selector"}),e.jsx(ne,{sx:{my:2,borderColor:"#333"}}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Tolerations"}),t.tolerations.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...t.tolerations];o[s].key=l.target.value,d({...t,tolerations:o})},sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{width:120},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Operator"}),e.jsxs(B,{value:a.operator,label:"Operator",onChange:l=>{const o=[...t.tolerations];o[s].operator=l.target.value,d({...t,tolerations:o})},sx:{color:"grey.300"},children:[e.jsx(g,{value:"Equal",children:"Equal"}),e.jsx(g,{value:"Exists",children:"Exists"})]})]}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...t.tolerations];o[s].value=l.target.value,d({...t,tolerations:o})},sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{width:140},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Effect"}),e.jsxs(B,{value:a.effect,label:"Effect",onChange:l=>{const o=[...t.tolerations];o[s].effect=l.target.value,d({...t,tolerations:o})},sx:{color:"grey.300"},children:[e.jsx(g,{value:"NoSchedule",children:"NoSchedule"}),e.jsx(g,{value:"PreferNoSchedule",children:"PreferNoSchedule"}),e.jsx(g,{value:"NoExecute",children:"NoExecute"})]})]}),e.jsx(T,{size:"small",onClick:()=>ee(t.tolerations,l=>d({...t,tolerations:l}),s),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>Z(t.tolerations,a=>d({...t,tolerations:a}),{key:"",operator:"Equal",value:"",effect:"NoSchedule"}),children:"Add Toleration"})]})]})]}),i==="Service"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Service Configuration"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:x.name,onChange:a=>M({...x,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:x.namespace,onChange:a=>M({...x,namespace:a.target.value}),sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{width:160},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Type"}),e.jsxs(B,{value:x.type,label:"Type",onChange:a=>M({...x,type:a.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"ClusterIP",children:"ClusterIP"}),e.jsx(g,{value:"NodePort",children:"NodePort"}),e.jsx(g,{value:"LoadBalancer",children:"LoadBalancer"}),e.jsx(g,{value:"ExternalName",children:"ExternalName"})]})]})]}),x.type==="ExternalName"?e.jsx(n,{size:"small",label:"External Name",value:x.externalName,onChange:a=>M({...x,externalName:a.target.value}),fullWidth:!0,sx:{mb:2,...r}}):e.jsxs(e.Fragment,{children:[x.type==="LoadBalancer"&&e.jsx(n,{size:"small",label:"Load Balancer IP (optional)",value:x.loadBalancerIP,onChange:a=>M({...x,loadBalancerIP:a.target.value}),fullWidth:!0,sx:{mb:2,...r}}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Ports"}),x.ports.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Name",value:a.name,onChange:l=>{const o=[...x.ports];o[s].name=l.target.value,M({...x,ports:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Port",type:"number",value:a.port,onChange:l=>{const o=[...x.ports];o[s].port=parseInt(l.target.value)||80,M({...x,ports:o})},sx:{width:100,...r}}),e.jsx(n,{size:"small",label:"Target Port",type:"number",value:a.targetPort,onChange:l=>{const o=[...x.ports];o[s].targetPort=parseInt(l.target.value)||80,M({...x,ports:o})},sx:{width:100,...r}}),x.type==="NodePort"&&e.jsx(n,{size:"small",label:"Node Port",type:"number",value:a.nodePort||"",onChange:l=>{const o=[...x.ports];o[s].nodePort=parseInt(l.target.value)||void 0,M({...x,ports:o})},sx:{width:100,...r}}),e.jsx(T,{size:"small",onClick:()=>M({...x,ports:x.ports.filter((l,o)=>o!==s)}),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>M({...x,ports:[...x.ports,{name:"",port:80,targetPort:80,protocol:"TCP"}]}),sx:{mb:2},children:"Add Port"}),e.jsx(p,{variant:"caption",sx:{color:"grey.500",display:"block"},children:"Selector"}),x.selector.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...x.selector];o[s].key=l.target.value,M({...x,selector:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...x.selector];o[s].value=l.target.value,M({...x,selector:o})},sx:{flex:1,...r}}),e.jsx(T,{size:"small",onClick:()=>M({...x,selector:x.selector.filter((l,o)=>o!==s)}),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>M({...x,selector:[...x.selector,{key:"",value:""}]}),children:"Add Selector"})]})]}),i==="Ingress"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Ingress Configuration"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:h.name,onChange:a=>L({...h,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:h.namespace,onChange:a=>L({...h,namespace:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Ingress Class",value:h.ingressClassName,onChange:a=>L({...h,ingressClassName:a.target.value}),sx:{flex:1,...r}})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Annotations"}),h.annotations.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...h.annotations];o[s].key=l.target.value,L({...h,annotations:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...h.annotations];o[s].value=l.target.value,L({...h,annotations:o})},sx:{flex:1,...r}}),e.jsx(T,{size:"small",onClick:()=>L({...h,annotations:h.annotations.filter((l,o)=>o!==s)}),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>L({...h,annotations:[...h.annotations,{key:"",value:""}]}),sx:{mb:2},children:"Add Annotation"}),e.jsx(ne,{sx:{my:2,borderColor:"#333"}}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Rules"}),h.rules.map((a,s)=>e.jsxs(I,{sx:{bgcolor:"#0a0a0a",p:2,mb:2,border:"1px solid #333"},children:[e.jsx(n,{size:"small",label:"Host",value:a.host,onChange:l=>{const o=[...h.rules];o[s].host=l.target.value,L({...h,rules:o})},fullWidth:!0,sx:{mb:2,...r}}),a.paths.map((l,o)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Path",value:l.path,onChange:A=>{const k=[...h.rules];k[s].paths[o].path=A.target.value,L({...h,rules:k})},sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{width:140},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Path Type"}),e.jsxs(B,{value:l.pathType,label:"Path Type",onChange:A=>{const k=[...h.rules];k[s].paths[o].pathType=A.target.value,L({...h,rules:k})},sx:{color:"grey.300"},children:[e.jsx(g,{value:"Prefix",children:"Prefix"}),e.jsx(g,{value:"Exact",children:"Exact"}),e.jsx(g,{value:"ImplementationSpecific",children:"ImplementationSpecific"})]})]}),e.jsx(n,{size:"small",label:"Service",value:l.serviceName,onChange:A=>{const k=[...h.rules];k[s].paths[o].serviceName=A.target.value,L({...h,rules:k})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Port",type:"number",value:l.servicePort,onChange:A=>{const k=[...h.rules];k[s].paths[o].servicePort=parseInt(A.target.value)||80,L({...h,rules:k})},sx:{width:80,...r}})]},o)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>{const l=[...h.rules];l[s].paths.push({path:"/",pathType:"Prefix",serviceName:"",servicePort:80}),L({...h,rules:l})},children:"Add Path"})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>L({...h,rules:[...h.rules,{host:"",paths:[{path:"/",pathType:"Prefix",serviceName:"",servicePort:80}]}]}),children:"Add Rule"})]}),i==="ConfigMap"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"ConfigMap Configuration"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:z.name,onChange:a=>K({...z,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:z.namespace,onChange:a=>K({...z,namespace:a.target.value}),sx:{flex:1,...r}}),e.jsx(G,{control:e.jsx(J,{checked:z.immutable,onChange:a=>K({...z,immutable:a.target.checked})}),label:"Immutable",sx:{color:"grey.400"}})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Data"}),z.data.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...z.data];o[s].key=l.target.value,K({...z,data:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...z.data];o[s].value=l.target.value,K({...z,data:o})},sx:{flex:2,...r},multiline:!0}),e.jsx(T,{size:"small",onClick:()=>K({...z,data:z.data.filter((l,o)=>o!==s)}),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>K({...z,data:[...z.data,{key:"",value:""}]}),children:"Add Data"})]}),i==="Secret"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Secret Configuration"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:$.name,onChange:a=>W({...$,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:$.namespace,onChange:a=>W({...$,namespace:a.target.value}),sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{width:220},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Type"}),e.jsxs(B,{value:$.type,label:"Type",onChange:a=>W({...$,type:a.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"Opaque",children:"Opaque"}),e.jsx(g,{value:"kubernetes.io/tls",children:"TLS"}),e.jsx(g,{value:"kubernetes.io/dockerconfigjson",children:"Docker Config"}),e.jsx(g,{value:"kubernetes.io/basic-auth",children:"Basic Auth"})]})]})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"String Data (plain text - will be encoded)"}),$.stringData.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...$.stringData];o[s].key=l.target.value,W({...$,stringData:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",type:"password",value:a.value,onChange:l=>{const o=[...$.stringData];o[s].value=l.target.value,W({...$,stringData:o})},sx:{flex:2,...r}}),e.jsx(T,{size:"small",onClick:()=>W({...$,stringData:$.stringData.filter((l,o)=>o!==s)}),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>W({...$,stringData:[...$.stringData,{key:"",value:""}]}),children:"Add Secret"})]}),i==="PVC"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Persistent Volume Claim"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:P.name,onChange:a=>Y({...P,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:P.namespace,onChange:a=>Y({...P,namespace:a.target.value}),sx:{flex:1,...r}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Storage Class",value:P.storageClassName,onChange:a=>Y({...P,storageClassName:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Storage Size",value:P.storage,onChange:a=>Y({...P,storage:a.target.value}),sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{width:140},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Volume Mode"}),e.jsxs(B,{value:P.volumeMode,label:"Volume Mode",onChange:a=>Y({...P,volumeMode:a.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"Filesystem",children:"Filesystem"}),e.jsx(g,{value:"Block",children:"Block"})]})]})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Access Modes"}),e.jsx(m,{sx:{display:"flex",gap:2,mb:2},children:["ReadWriteOnce","ReadOnlyMany","ReadWriteMany"].map(a=>e.jsx(G,{control:e.jsx(J,{checked:P.accessModes.includes(a),onChange:s=>Y({...P,accessModes:s.target.checked?[...P.accessModes,a]:P.accessModes.filter(l=>l!==a)})}),label:a,sx:{color:"grey.400"}},a))})]}),i==="HPA"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Horizontal Pod Autoscaler"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:v.name,onChange:a=>H({...v,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:v.namespace,onChange:a=>H({...v,namespace:a.target.value}),sx:{flex:1,...r}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsxs(V,{size:"small",sx:{width:140},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Target Kind"}),e.jsxs(B,{value:v.targetRef.kind,label:"Target Kind",onChange:a=>H({...v,targetRef:{...v.targetRef,kind:a.target.value}}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"Deployment",children:"Deployment"}),e.jsx(g,{value:"StatefulSet",children:"StatefulSet"}),e.jsx(g,{value:"ReplicaSet",children:"ReplicaSet"})]})]}),e.jsx(n,{size:"small",label:"Target Name",value:v.targetRef.name,onChange:a=>H({...v,targetRef:{...v.targetRef,name:a.target.value}}),sx:{flex:1,...r}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Min Replicas",type:"number",value:v.minReplicas,onChange:a=>H({...v,minReplicas:parseInt(a.target.value)||1}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Max Replicas",type:"number",value:v.maxReplicas,onChange:a=>H({...v,maxReplicas:parseInt(a.target.value)||10}),sx:{flex:1,...r}})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Metrics"}),v.metrics.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsxs(V,{size:"small",sx:{width:140},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Type"}),e.jsxs(B,{value:a.type,label:"Type",onChange:l=>{const o=[...v.metrics];o[s].type=l.target.value,o[s].name=l.target.value,H({...v,metrics:o})},sx:{color:"grey.300"},children:[e.jsx(g,{value:"cpu",children:"CPU"}),e.jsx(g,{value:"memory",children:"Memory"})]})]}),e.jsx(n,{size:"small",label:"Target %",type:"number",value:a.target,onChange:l=>{const o=[...v.metrics];o[s].target=parseInt(l.target.value)||80,H({...v,metrics:o})},sx:{flex:1,...r}}),e.jsx(T,{size:"small",onClick:()=>H({...v,metrics:v.metrics.filter((l,o)=>o!==s)}),sx:{color:"grey.500"},children:e.jsx(F,{})})]},s)),e.jsx(D,{size:"small",startIcon:e.jsx(E,{}),onClick:()=>H({...v,metrics:[...v.metrics,{type:"cpu",name:"cpu",target:80}]}),sx:{mb:2},children:"Add Metric"}),e.jsx(ne,{sx:{my:2,borderColor:"#333"}}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Scaling Behavior"}),e.jsxs(m,{sx:{display:"flex",gap:2},children:[e.jsx(n,{size:"small",label:"Scale Down Stabilization (s)",type:"number",value:v.scaleDownStabilization,onChange:a=>H({...v,scaleDownStabilization:parseInt(a.target.value)||300}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Scale Up Stabilization (s)",type:"number",value:v.scaleUpStabilization,onChange:a=>H({...v,scaleUpStabilization:parseInt(a.target.value)||0}),sx:{flex:1,...r}})]})]}),i==="Job"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Job Configuration"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:b.name,onChange:a=>O({...b,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:b.namespace,onChange:a=>O({...b,namespace:a.target.value}),sx:{flex:1,...r}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Completions",type:"number",value:b.completions,onChange:a=>O({...b,completions:parseInt(a.target.value)||1}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Parallelism",type:"number",value:b.parallelism,onChange:a=>O({...b,parallelism:parseInt(a.target.value)||1}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Backoff Limit",type:"number",value:b.backoffLimit,onChange:a=>O({...b,backoffLimit:parseInt(a.target.value)||6}),sx:{flex:1,...r}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"TTL After Finished (s)",type:"number",value:b.ttlSecondsAfterFinished,onChange:a=>O({...b,ttlSecondsAfterFinished:parseInt(a.target.value)||100}),sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{flex:1},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Restart Policy"}),e.jsxs(B,{value:b.restartPolicy,label:"Restart Policy",onChange:a=>O({...b,restartPolicy:a.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"OnFailure",children:"OnFailure"}),e.jsx(g,{value:"Never",children:"Never"})]})]})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Container"}),e.jsx(m,{sx:{display:"flex",gap:2},children:e.jsx(n,{size:"small",label:"Image",value:b.containers[0]?.image||"",onChange:a=>{const s=[...b.containers];s[0]={...s[0],image:a.target.value},O({...b,containers:s})},sx:{flex:1,...r}})})]}),i==="CronJob"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"CronJob Configuration"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:y.name,onChange:a=>q({...y,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:y.namespace,onChange:a=>q({...y,namespace:a.target.value}),sx:{flex:1,...r}})]}),e.jsx(n,{size:"small",label:"Schedule (cron format)",value:y.schedule,onChange:a=>q({...y,schedule:a.target.value}),fullWidth:!0,sx:{mb:2,...r},helperText:"Example: */5 * * * * (every 5 minutes)"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsxs(V,{size:"small",sx:{flex:1},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Concurrency Policy"}),e.jsxs(B,{value:y.concurrencyPolicy,label:"Concurrency Policy",onChange:a=>q({...y,concurrencyPolicy:a.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"Allow",children:"Allow"}),e.jsx(g,{value:"Forbid",children:"Forbid"}),e.jsx(g,{value:"Replace",children:"Replace"})]})]}),e.jsx(G,{control:e.jsx(J,{checked:y.suspend,onChange:a=>q({...y,suspend:a.target.checked})}),label:"Suspend",sx:{color:"grey.400"}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Success History Limit",type:"number",value:y.successfulJobsHistoryLimit,onChange:a=>q({...y,successfulJobsHistoryLimit:parseInt(a.target.value)||3}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Failed History Limit",type:"number",value:y.failedJobsHistoryLimit,onChange:a=>q({...y,failedJobsHistoryLimit:parseInt(a.target.value)||1}),sx:{flex:1,...r}})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Container"}),e.jsx(n,{size:"small",label:"Image",value:y.jobTemplate.containers[0]?.image||"",onChange:a=>{const s=[...y.jobTemplate.containers];s[0]={...s[0],image:a.target.value},q({...y,jobTemplate:{...y.jobTemplate,containers:s}})},fullWidth:!0,sx:{...r}})]}),i==="NetworkPolicy"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Network Policy"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:j.name,onChange:a=>Q({...j,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:j.namespace,onChange:a=>Q({...j,namespace:a.target.value}),sx:{flex:1,...r}})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Pod Selector"}),j.podSelector.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...j.podSelector];o[s].key=l.target.value,Q({...j,podSelector:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...j.podSelector];o[s].value=l.target.value,Q({...j,podSelector:o})},sx:{flex:1,...r}})]},s)),e.jsx(p,{variant:"caption",sx:{color:"grey.500",display:"block",mt:2},children:"Policy Types"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(G,{control:e.jsx(J,{checked:j.policyTypes.includes("Ingress"),onChange:a=>Q({...j,policyTypes:a.target.checked?[...j.policyTypes,"Ingress"]:j.policyTypes.filter(s=>s!=="Ingress")})}),label:"Ingress",sx:{color:"grey.400"}}),e.jsx(G,{control:e.jsx(J,{checked:j.policyTypes.includes("Egress"),onChange:a=>Q({...j,policyTypes:a.target.checked?[...j.policyTypes,"Egress"]:j.policyTypes.filter(s=>s!=="Egress")})}),label:"Egress",sx:{color:"grey.400"}})]})]}),i==="PodDisruptionBudget"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"Pod Disruption Budget"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:S.name,onChange:a=>_({...S,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:S.namespace,onChange:a=>_({...S,namespace:a.target.value}),sx:{flex:1,...r}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(G,{control:e.jsx(J,{checked:S.useMinAvailable,onChange:a=>_({...S,useMinAvailable:a.target.checked})}),label:"Use minAvailable",sx:{color:"grey.400"}}),S.useMinAvailable?e.jsx(n,{size:"small",label:"Min Available",value:S.minAvailable,onChange:a=>_({...S,minAvailable:a.target.value}),sx:{flex:1,...r}}):e.jsx(n,{size:"small",label:"Max Unavailable",value:S.maxUnavailable,onChange:a=>_({...S,maxUnavailable:a.target.value}),sx:{flex:1,...r}})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Selector"}),S.selector.map((a,s)=>e.jsxs(m,{sx:{display:"flex",gap:1,mb:1},children:[e.jsx(n,{size:"small",label:"Key",value:a.key,onChange:l=>{const o=[...S.selector];o[s].key=l.target.value,_({...S,selector:o})},sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Value",value:a.value,onChange:l=>{const o=[...S.selector];o[s].value=l.target.value,_({...S,selector:o})},sx:{flex:1,...r}})]},s))]}),i==="StatefulSet"&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsx(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:"StatefulSet Configuration"}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Name",value:f.name,onChange:a=>X({...f,name:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Namespace",value:f.namespace,onChange:a=>X({...f,namespace:a.target.value}),sx:{flex:1,...r}}),e.jsx(n,{size:"small",label:"Replicas",type:"number",value:f.replicas,onChange:a=>X({...f,replicas:parseInt(a.target.value)||1}),sx:{width:100,...r}})]}),e.jsxs(m,{sx:{display:"flex",gap:2,mb:2},children:[e.jsx(n,{size:"small",label:"Service Name (headless)",value:f.serviceName,onChange:a=>X({...f,serviceName:a.target.value}),sx:{flex:1,...r}}),e.jsxs(V,{size:"small",sx:{width:180},children:[e.jsx(U,{sx:{color:"grey.500"},children:"Pod Management"}),e.jsxs(B,{value:f.podManagementPolicy,label:"Pod Management",onChange:a=>X({...f,podManagementPolicy:a.target.value}),sx:{color:"grey.300"},children:[e.jsx(g,{value:"OrderedReady",children:"OrderedReady"}),e.jsx(g,{value:"Parallel",children:"Parallel"})]})]})]}),e.jsx(p,{variant:"caption",sx:{color:"grey.500"},children:"Container"}),e.jsx(m,{sx:{display:"flex",gap:2},children:e.jsx(n,{size:"small",label:"Image",value:f.containers[0]?.image||"",onChange:a=>{const s=[...f.containers];s[0]={...s[0],image:a.target.value},X({...f,containers:s})},sx:{flex:1,...r}})})]}),(i==="ServiceAccount"||i==="Namespace"||i==="DaemonSet")&&e.jsxs(I,{sx:{bgcolor:"#111",border:"1px solid #222",p:2},children:[e.jsxs(p,{variant:"subtitle2",sx:{color:"grey.400",mb:2},children:[i," Configuration"]}),e.jsxs(m,{sx:{display:"flex",gap:2},children:[e.jsx(n,{size:"small",label:"Name",value:i==="Namespace"?t.namespace:t.serviceAccountName||"my-service-account",onChange:a=>d({...t,[i==="Namespace"?"namespace":"serviceAccountName"]:a.target.value}),sx:{flex:1,...r}}),i!=="Namespace"&&e.jsx(n,{size:"small",label:"Namespace",value:t.namespace,onChange:a=>d({...t,namespace:a.target.value}),sx:{flex:1,...r}})]})]})]}),e.jsxs(m,{sx:{width:550,borderLeft:"1px solid #222",display:"flex",flexDirection:"column"},children:[e.jsxs(m,{sx:{display:"flex",alignItems:"center",justifyContent:"space-between",p:2,borderBottom:"1px solid #222"},children:[e.jsxs(p,{variant:"subtitle2",sx:{color:"grey.400"},children:[i.toLowerCase(),".yaml"]}),e.jsx(ue,{label:`${re.split(`
`).length} lines`,size:"small",sx:{bgcolor:"#222"}})]}),e.jsx(m,{sx:{flex:1,p:2,overflow:"auto"},children:e.jsx(I,{sx:{bgcolor:"#0a0a0a",p:2,border:"1px solid #333",height:"100%",overflow:"auto"},children:e.jsx(p,{component:"pre",sx:{fontFamily:"monospace",fontSize:11,color:"#d4d4d4",m:0,whiteSpace:"pre"},children:re})})})]})]}),e.jsx(ke,{open:u.open,autoHideDuration:2e3,onClose:()=>C({...u,open:!1}),message:u.message})]})}export{la as default};
//# sourceMappingURL=App-CyY4Gelz.js.map
