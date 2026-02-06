import { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, Button, IconButton, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Tabs, Tab,
  Accordion, AccordionSummary, AccordionDetails, Switch, FormControlLabel,
  Chip, Divider,
} from '@mui/material';
import {
  ContentCopy, Home, Add, Delete, Download, ExpandMore, Security,
  Storage, NetworkCheck, Schedule, Settings,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// ============== TYPES ==============
type ResourceType =
  | 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'Job' | 'CronJob'
  | 'Service' | 'Ingress' | 'ConfigMap' | 'Secret' | 'PVC'
  | 'HPA' | 'NetworkPolicy' | 'ServiceAccount' | 'Namespace' | 'PodDisruptionBudget';

interface Probe {
  enabled: boolean;
  type: 'httpGet' | 'tcpSocket' | 'exec';
  path: string;
  port: number;
  command: string;
  initialDelaySeconds: number;
  periodSeconds: number;
  timeoutSeconds: number;
  failureThreshold: number;
}

interface VolumeMount {
  name: string;
  mountPath: string;
  subPath: string;
  readOnly: boolean;
}

interface Volume {
  name: string;
  type: 'emptyDir' | 'configMap' | 'secret' | 'persistentVolumeClaim' | 'hostPath';
  source: string;
}

interface SecurityContext {
  runAsNonRoot: boolean;
  runAsUser: number;
  runAsGroup: number;
  fsGroup: number;
  readOnlyRootFilesystem: boolean;
  allowPrivilegeEscalation: boolean;
}

interface Container {
  name: string;
  image: string;
  imagePullPolicy: 'Always' | 'IfNotPresent' | 'Never';
  ports: { containerPort: number; name: string; protocol: string }[];
  resources: {
    requests: { cpu: string; memory: string };
    limits: { cpu: string; memory: string };
  };
  env: { name: string; value: string; valueFrom?: string }[];
  envFrom: { type: 'configMap' | 'secret'; name: string }[];
  volumeMounts: VolumeMount[];
  livenessProbe: Probe;
  readinessProbe: Probe;
  startupProbe: Probe;
  command: string[];
  args: string[];
}

interface DeploymentConfig {
  name: string;
  namespace: string;
  replicas: number;
  strategy: 'RollingUpdate' | 'Recreate';
  maxSurge: string;
  maxUnavailable: string;
  containers: Container[];
  initContainers: Container[];
  volumes: Volume[];
  labels: { key: string; value: string }[];
  annotations: { key: string; value: string }[];
  nodeSelector: { key: string; value: string }[];
  tolerations: { key: string; operator: string; value: string; effect: string }[];
  securityContext: SecurityContext;
  serviceAccountName: string;
  restartPolicy: 'Always' | 'OnFailure' | 'Never';
  terminationGracePeriodSeconds: number;
}

interface ServiceConfig {
  name: string;
  namespace: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
  ports: { name: string; port: number; targetPort: number; nodePort?: number; protocol: string }[];
  selector: { key: string; value: string }[];
  externalTrafficPolicy: 'Cluster' | 'Local';
  sessionAffinity: 'None' | 'ClientIP';
  externalName: string;
  loadBalancerIP: string;
  annotations: { key: string; value: string }[];
}

interface IngressConfig {
  name: string;
  namespace: string;
  ingressClassName: string;
  rules: { host: string; paths: { path: string; pathType: string; serviceName: string; servicePort: number }[] }[];
  tls: { hosts: string[]; secretName: string }[];
  annotations: { key: string; value: string }[];
}

interface ConfigMapConfig {
  name: string;
  namespace: string;
  data: { key: string; value: string }[];
  binaryData: { key: string; value: string }[];
  immutable: boolean;
}

interface SecretConfig {
  name: string;
  namespace: string;
  type: 'Opaque' | 'kubernetes.io/tls' | 'kubernetes.io/dockerconfigjson' | 'kubernetes.io/basic-auth';
  data: { key: string; value: string }[];
  stringData: { key: string; value: string }[];
  immutable: boolean;
}

interface PVCConfig {
  name: string;
  namespace: string;
  accessModes: string[];
  storageClassName: string;
  storage: string;
  volumeMode: 'Filesystem' | 'Block';
  selector: { key: string; value: string }[];
}

interface HPAConfig {
  name: string;
  namespace: string;
  targetRef: { kind: string; name: string };
  minReplicas: number;
  maxReplicas: number;
  metrics: { type: string; name: string; target: number }[];
  scaleDownStabilization: number;
  scaleUpStabilization: number;
}

interface JobConfig {
  name: string;
  namespace: string;
  completions: number;
  parallelism: number;
  backoffLimit: number;
  activeDeadlineSeconds: number;
  ttlSecondsAfterFinished: number;
  restartPolicy: 'OnFailure' | 'Never';
  containers: Container[];
}

interface CronJobConfig {
  name: string;
  namespace: string;
  schedule: string;
  concurrencyPolicy: 'Allow' | 'Forbid' | 'Replace';
  successfulJobsHistoryLimit: number;
  failedJobsHistoryLimit: number;
  suspend: boolean;
  jobTemplate: JobConfig;
}

interface NetworkPolicyConfig {
  name: string;
  namespace: string;
  podSelector: { key: string; value: string }[];
  policyTypes: string[];
  ingress: { from: { podSelector?: object; namespaceSelector?: object; ipBlock?: string }[]; ports: { protocol: string; port: number }[] }[];
  egress: { to: { podSelector?: object; namespaceSelector?: object; ipBlock?: string }[]; ports: { protocol: string; port: number }[] }[];
}

interface PDBConfig {
  name: string;
  namespace: string;
  selector: { key: string; value: string }[];
  minAvailable: string;
  maxUnavailable: string;
  useMinAvailable: boolean;
}

interface StatefulSetConfig extends DeploymentConfig {
  serviceName: string;
  podManagementPolicy: 'OrderedReady' | 'Parallel';
  volumeClaimTemplates: PVCConfig[];
}

// ============== DEFAULT VALUES ==============
const defaultProbe: Probe = {
  enabled: false,
  type: 'httpGet',
  path: '/health',
  port: 8080,
  command: '',
  initialDelaySeconds: 10,
  periodSeconds: 10,
  timeoutSeconds: 5,
  failureThreshold: 3,
};

const defaultContainer: Container = {
  name: 'app',
  image: 'nginx:latest',
  imagePullPolicy: 'IfNotPresent',
  ports: [{ containerPort: 80, name: 'http', protocol: 'TCP' }],
  resources: {
    requests: { cpu: '100m', memory: '128Mi' },
    limits: { cpu: '500m', memory: '512Mi' },
  },
  env: [],
  envFrom: [],
  volumeMounts: [],
  livenessProbe: { ...defaultProbe },
  readinessProbe: { ...defaultProbe },
  startupProbe: { ...defaultProbe },
  command: [],
  args: [],
};

const defaultSecurityContext: SecurityContext = {
  runAsNonRoot: true,
  runAsUser: 1000,
  runAsGroup: 1000,
  fsGroup: 1000,
  readOnlyRootFilesystem: false,
  allowPrivilegeEscalation: false,
};

// ============== YAML GENERATORS ==============
const generateProbeYaml = (probe: Probe, indent: string): string => {
  if (!probe.enabled) return '';
  let yaml = '';
  if (probe.type === 'httpGet') {
    yaml = `${indent}httpGet:\n${indent}  path: ${probe.path}\n${indent}  port: ${probe.port}`;
  } else if (probe.type === 'tcpSocket') {
    yaml = `${indent}tcpSocket:\n${indent}  port: ${probe.port}`;
  } else {
    yaml = `${indent}exec:\n${indent}  command:\n${probe.command.split(' ').map(c => `${indent}    - ${c}`).join('\n')}`;
  }
  yaml += `\n${indent}initialDelaySeconds: ${probe.initialDelaySeconds}`;
  yaml += `\n${indent}periodSeconds: ${probe.periodSeconds}`;
  yaml += `\n${indent}timeoutSeconds: ${probe.timeoutSeconds}`;
  yaml += `\n${indent}failureThreshold: ${probe.failureThreshold}`;
  return yaml;
};

const generateContainerYaml = (container: Container, indent: string): string => {
  let yaml = `${indent}- name: ${container.name}
${indent}  image: ${container.image}
${indent}  imagePullPolicy: ${container.imagePullPolicy}`;

  if (container.ports.length > 0) {
    yaml += `\n${indent}  ports:`;
    container.ports.forEach(p => {
      yaml += `\n${indent}    - containerPort: ${p.containerPort}`;
      if (p.name) yaml += `\n${indent}      name: ${p.name}`;
      yaml += `\n${indent}      protocol: ${p.protocol}`;
    });
  }

  yaml += `\n${indent}  resources:
${indent}    requests:
${indent}      cpu: "${container.resources.requests.cpu}"
${indent}      memory: "${container.resources.requests.memory}"
${indent}    limits:
${indent}      cpu: "${container.resources.limits.cpu}"
${indent}      memory: "${container.resources.limits.memory}"`;

  if (container.env.length > 0) {
    yaml += `\n${indent}  env:`;
    container.env.forEach(e => {
      yaml += `\n${indent}    - name: ${e.name}\n${indent}      value: "${e.value}"`;
    });
  }

  if (container.envFrom.length > 0) {
    yaml += `\n${indent}  envFrom:`;
    container.envFrom.forEach(e => {
      yaml += `\n${indent}    - ${e.type === 'configMap' ? 'configMapRef' : 'secretRef'}:\n${indent}        name: ${e.name}`;
    });
  }

  if (container.volumeMounts.length > 0) {
    yaml += `\n${indent}  volumeMounts:`;
    container.volumeMounts.forEach(v => {
      yaml += `\n${indent}    - name: ${v.name}\n${indent}      mountPath: ${v.mountPath}`;
      if (v.subPath) yaml += `\n${indent}      subPath: ${v.subPath}`;
      if (v.readOnly) yaml += `\n${indent}      readOnly: true`;
    });
  }

  if (container.livenessProbe.enabled) {
    yaml += `\n${indent}  livenessProbe:\n${generateProbeYaml(container.livenessProbe, indent + '    ')}`;
  }
  if (container.readinessProbe.enabled) {
    yaml += `\n${indent}  readinessProbe:\n${generateProbeYaml(container.readinessProbe, indent + '    ')}`;
  }
  if (container.startupProbe.enabled) {
    yaml += `\n${indent}  startupProbe:\n${generateProbeYaml(container.startupProbe, indent + '    ')}`;
  }

  if (container.command.length > 0) {
    yaml += `\n${indent}  command:`;
    container.command.forEach(c => { yaml += `\n${indent}    - "${c}"`; });
  }
  if (container.args.length > 0) {
    yaml += `\n${indent}  args:`;
    container.args.forEach(a => { yaml += `\n${indent}    - "${a}"`; });
  }

  return yaml;
};

const generateVolumeYaml = (volume: Volume, indent: string): string => {
  let yaml = `${indent}- name: ${volume.name}`;
  switch (volume.type) {
    case 'emptyDir': yaml += `\n${indent}  emptyDir: {}`; break;
    case 'configMap': yaml += `\n${indent}  configMap:\n${indent}    name: ${volume.source}`; break;
    case 'secret': yaml += `\n${indent}  secret:\n${indent}    secretName: ${volume.source}`; break;
    case 'persistentVolumeClaim': yaml += `\n${indent}  persistentVolumeClaim:\n${indent}    claimName: ${volume.source}`; break;
    case 'hostPath': yaml += `\n${indent}  hostPath:\n${indent}    path: ${volume.source}`; break;
  }
  return yaml;
};

// ============== MAIN COMPONENT ==============
export default function K8sBuilder() {
  const [resourceType, setResourceType] = useState<ResourceType>('Deployment');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Deployment state
  const [deployment, setDeployment] = useState<DeploymentConfig>({
    name: 'my-app',
    namespace: 'default',
    replicas: 3,
    strategy: 'RollingUpdate',
    maxSurge: '25%',
    maxUnavailable: '25%',
    containers: [{ ...defaultContainer }],
    initContainers: [],
    volumes: [],
    labels: [{ key: 'app', value: 'my-app' }],
    annotations: [],
    nodeSelector: [],
    tolerations: [],
    securityContext: { ...defaultSecurityContext },
    serviceAccountName: '',
    restartPolicy: 'Always',
    terminationGracePeriodSeconds: 30,
  });

  // Service state
  const [service, setService] = useState<ServiceConfig>({
    name: 'my-app-svc',
    namespace: 'default',
    type: 'ClusterIP',
    ports: [{ name: 'http', port: 80, targetPort: 80, protocol: 'TCP' }],
    selector: [{ key: 'app', value: 'my-app' }],
    externalTrafficPolicy: 'Cluster',
    sessionAffinity: 'None',
    externalName: '',
    loadBalancerIP: '',
    annotations: [],
  });

  // Ingress state
  const [ingress, setIngress] = useState<IngressConfig>({
    name: 'my-app-ingress',
    namespace: 'default',
    ingressClassName: 'nginx',
    rules: [{ host: 'example.com', paths: [{ path: '/', pathType: 'Prefix', serviceName: 'my-app-svc', servicePort: 80 }] }],
    tls: [],
    annotations: [{ key: 'nginx.ingress.kubernetes.io/rewrite-target', value: '/' }],
  });

  // ConfigMap state
  const [configMap, setConfigMap] = useState<ConfigMapConfig>({
    name: 'my-config',
    namespace: 'default',
    data: [{ key: 'APP_ENV', value: 'production' }, { key: 'LOG_LEVEL', value: 'info' }],
    binaryData: [],
    immutable: false,
  });

  // Secret state
  const [secret, setSecret] = useState<SecretConfig>({
    name: 'my-secret',
    namespace: 'default',
    type: 'Opaque',
    data: [],
    stringData: [{ key: 'username', value: 'admin' }, { key: 'password', value: 'changeme' }],
    immutable: false,
  });

  // PVC state
  const [pvc, setPvc] = useState<PVCConfig>({
    name: 'my-pvc',
    namespace: 'default',
    accessModes: ['ReadWriteOnce'],
    storageClassName: 'standard',
    storage: '10Gi',
    volumeMode: 'Filesystem',
    selector: [],
  });

  // HPA state
  const [hpa, setHpa] = useState<HPAConfig>({
    name: 'my-app-hpa',
    namespace: 'default',
    targetRef: { kind: 'Deployment', name: 'my-app' },
    minReplicas: 2,
    maxReplicas: 10,
    metrics: [{ type: 'cpu', name: 'cpu', target: 80 }, { type: 'memory', name: 'memory', target: 80 }],
    scaleDownStabilization: 300,
    scaleUpStabilization: 0,
  });

  // Job state
  const [job, setJob] = useState<JobConfig>({
    name: 'my-job',
    namespace: 'default',
    completions: 1,
    parallelism: 1,
    backoffLimit: 6,
    activeDeadlineSeconds: 0,
    ttlSecondsAfterFinished: 100,
    restartPolicy: 'OnFailure',
    containers: [{ ...defaultContainer, name: 'job' }],
  });

  // CronJob state
  const [cronJob, setCronJob] = useState<CronJobConfig>({
    name: 'my-cronjob',
    namespace: 'default',
    schedule: '*/5 * * * *',
    concurrencyPolicy: 'Allow',
    successfulJobsHistoryLimit: 3,
    failedJobsHistoryLimit: 1,
    suspend: false,
    jobTemplate: { ...job },
  });

  // NetworkPolicy state
  const [networkPolicy, setNetworkPolicy] = useState<NetworkPolicyConfig>({
    name: 'my-network-policy',
    namespace: 'default',
    podSelector: [{ key: 'app', value: 'my-app' }],
    policyTypes: ['Ingress', 'Egress'],
    ingress: [{ from: [], ports: [{ protocol: 'TCP', port: 80 }] }],
    egress: [{ to: [], ports: [{ protocol: 'TCP', port: 443 }] }],
  });

  // PDB state
  const [pdb, setPdb] = useState<PDBConfig>({
    name: 'my-pdb',
    namespace: 'default',
    selector: [{ key: 'app', value: 'my-app' }],
    minAvailable: '50%',
    maxUnavailable: '1',
    useMinAvailable: true,
  });

  // StatefulSet state
  const [statefulSet, setStatefulSet] = useState<StatefulSetConfig>({
    ...deployment,
    name: 'my-statefulset',
    serviceName: 'my-statefulset-headless',
    podManagementPolicy: 'OrderedReady',
    volumeClaimTemplates: [{ ...pvc, name: 'data' }],
  });

  // Generate YAML
  const yaml = useMemo(() => {
    switch (resourceType) {
      case 'Deployment': {
        let y = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${deployment.name}
  namespace: ${deployment.namespace}
  labels:
${deployment.labels.map(l => `    ${l.key}: "${l.value}"`).join('\n')}`;
        if (deployment.annotations.length > 0) {
          y += `\n  annotations:\n${deployment.annotations.map(a => `    ${a.key}: "${a.value}"`).join('\n')}`;
        }
        y += `
spec:
  replicas: ${deployment.replicas}
  strategy:
    type: ${deployment.strategy}`;
        if (deployment.strategy === 'RollingUpdate') {
          y += `
    rollingUpdate:
      maxSurge: ${deployment.maxSurge}
      maxUnavailable: ${deployment.maxUnavailable}`;
        }
        y += `
  selector:
    matchLabels:
${deployment.labels.map(l => `      ${l.key}: "${l.value}"`).join('\n')}
  template:
    metadata:
      labels:
${deployment.labels.map(l => `        ${l.key}: "${l.value}"`).join('\n')}
    spec:
      terminationGracePeriodSeconds: ${deployment.terminationGracePeriodSeconds}`;
        if (deployment.serviceAccountName) {
          y += `\n      serviceAccountName: ${deployment.serviceAccountName}`;
        }
        y += `
      securityContext:
        runAsNonRoot: ${deployment.securityContext.runAsNonRoot}
        runAsUser: ${deployment.securityContext.runAsUser}
        runAsGroup: ${deployment.securityContext.runAsGroup}
        fsGroup: ${deployment.securityContext.fsGroup}`;
        if (deployment.nodeSelector.length > 0) {
          y += `\n      nodeSelector:\n${deployment.nodeSelector.map(n => `        ${n.key}: "${n.value}"`).join('\n')}`;
        }
        if (deployment.tolerations.length > 0) {
          y += `\n      tolerations:`;
          deployment.tolerations.forEach(t => {
            y += `\n        - key: "${t.key}"\n          operator: "${t.operator}"`;
            if (t.value) y += `\n          value: "${t.value}"`;
            y += `\n          effect: "${t.effect}"`;
          });
        }
        if (deployment.initContainers.length > 0) {
          y += `\n      initContainers:\n${deployment.initContainers.map(c => generateContainerYaml(c, '      ')).join('\n')}`;
        }
        y += `\n      containers:\n${deployment.containers.map(c => generateContainerYaml(c, '      ')).join('\n')}`;
        if (deployment.volumes.length > 0) {
          y += `\n      volumes:\n${deployment.volumes.map(v => generateVolumeYaml(v, '      ')).join('\n')}`;
        }
        return y;
      }

      case 'StatefulSet': {
        let y = `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${statefulSet.name}
  namespace: ${statefulSet.namespace}
  labels:
${statefulSet.labels.map(l => `    ${l.key}: "${l.value}"`).join('\n')}
spec:
  serviceName: ${statefulSet.serviceName}
  replicas: ${statefulSet.replicas}
  podManagementPolicy: ${statefulSet.podManagementPolicy}
  selector:
    matchLabels:
${statefulSet.labels.map(l => `      ${l.key}: "${l.value}"`).join('\n')}
  template:
    metadata:
      labels:
${statefulSet.labels.map(l => `        ${l.key}: "${l.value}"`).join('\n')}
    spec:
      terminationGracePeriodSeconds: ${statefulSet.terminationGracePeriodSeconds}
      containers:
${statefulSet.containers.map(c => generateContainerYaml(c, '      ')).join('\n')}`;
        if (statefulSet.volumeClaimTemplates.length > 0) {
          y += `\n  volumeClaimTemplates:`;
          statefulSet.volumeClaimTemplates.forEach(v => {
            y += `\n    - metadata:\n        name: ${v.name}\n      spec:\n        accessModes:\n${v.accessModes.map(a => `          - ${a}`).join('\n')}\n        storageClassName: ${v.storageClassName}\n        resources:\n          requests:\n            storage: ${v.storage}`;
          });
        }
        return y;
      }

      case 'DaemonSet': {
        return `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ${deployment.name}-ds
  namespace: ${deployment.namespace}
  labels:
${deployment.labels.map(l => `    ${l.key}: "${l.value}"`).join('\n')}
spec:
  selector:
    matchLabels:
${deployment.labels.map(l => `      ${l.key}: "${l.value}"`).join('\n')}
  template:
    metadata:
      labels:
${deployment.labels.map(l => `        ${l.key}: "${l.value}"`).join('\n')}
    spec:
      tolerations:
        - key: node-role.kubernetes.io/control-plane
          operator: Exists
          effect: NoSchedule
      containers:
${deployment.containers.map(c => generateContainerYaml(c, '      ')).join('\n')}`;
      }

      case 'Job': {
        return `apiVersion: batch/v1
kind: Job
metadata:
  name: ${job.name}
  namespace: ${job.namespace}
spec:
  completions: ${job.completions}
  parallelism: ${job.parallelism}
  backoffLimit: ${job.backoffLimit}${job.activeDeadlineSeconds > 0 ? `\n  activeDeadlineSeconds: ${job.activeDeadlineSeconds}` : ''}
  ttlSecondsAfterFinished: ${job.ttlSecondsAfterFinished}
  template:
    spec:
      restartPolicy: ${job.restartPolicy}
      containers:
${job.containers.map(c => generateContainerYaml(c, '      ')).join('\n')}`;
      }

      case 'CronJob': {
        return `apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${cronJob.name}
  namespace: ${cronJob.namespace}
spec:
  schedule: "${cronJob.schedule}"
  concurrencyPolicy: ${cronJob.concurrencyPolicy}
  successfulJobsHistoryLimit: ${cronJob.successfulJobsHistoryLimit}
  failedJobsHistoryLimit: ${cronJob.failedJobsHistoryLimit}
  suspend: ${cronJob.suspend}
  jobTemplate:
    spec:
      completions: ${cronJob.jobTemplate.completions}
      parallelism: ${cronJob.jobTemplate.parallelism}
      backoffLimit: ${cronJob.jobTemplate.backoffLimit}
      template:
        spec:
          restartPolicy: ${cronJob.jobTemplate.restartPolicy}
          containers:
${cronJob.jobTemplate.containers.map(c => generateContainerYaml(c, '          ')).join('\n')}`;
      }

      case 'Service': {
        let y = `apiVersion: v1
kind: Service
metadata:
  name: ${service.name}
  namespace: ${service.namespace}`;
        if (service.annotations.length > 0) {
          y += `\n  annotations:\n${service.annotations.map(a => `    ${a.key}: "${a.value}"`).join('\n')}`;
        }
        y += `
spec:
  type: ${service.type}`;
        if (service.type === 'ExternalName') {
          y += `\n  externalName: ${service.externalName}`;
        } else {
          if (service.type === 'LoadBalancer' && service.loadBalancerIP) {
            y += `\n  loadBalancerIP: ${service.loadBalancerIP}`;
          }
          if (service.type !== 'ClusterIP') {
            y += `\n  externalTrafficPolicy: ${service.externalTrafficPolicy}`;
          }
          y += `\n  sessionAffinity: ${service.sessionAffinity}
  ports:`;
          service.ports.forEach(p => {
            y += `\n    - name: ${p.name}\n      port: ${p.port}\n      targetPort: ${p.targetPort}\n      protocol: ${p.protocol}`;
            if (service.type === 'NodePort' && p.nodePort) {
              y += `\n      nodePort: ${p.nodePort}`;
            }
          });
          y += `\n  selector:\n${service.selector.map(s => `    ${s.key}: "${s.value}"`).join('\n')}`;
        }
        return y;
      }

      case 'Ingress': {
        let y = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${ingress.name}
  namespace: ${ingress.namespace}`;
        if (ingress.annotations.length > 0) {
          y += `\n  annotations:\n${ingress.annotations.map(a => `    ${a.key}: "${a.value}"`).join('\n')}`;
        }
        y += `
spec:
  ingressClassName: ${ingress.ingressClassName}`;
        if (ingress.tls.length > 0) {
          y += `\n  tls:`;
          ingress.tls.forEach(t => {
            y += `\n    - hosts:\n${t.hosts.map(h => `        - ${h}`).join('\n')}\n      secretName: ${t.secretName}`;
          });
        }
        y += `\n  rules:`;
        ingress.rules.forEach(r => {
          y += `\n    - host: ${r.host}\n      http:\n        paths:`;
          r.paths.forEach(p => {
            y += `\n          - path: ${p.path}\n            pathType: ${p.pathType}\n            backend:\n              service:\n                name: ${p.serviceName}\n                port:\n                  number: ${p.servicePort}`;
          });
        });
        return y;
      }

      case 'ConfigMap': {
        let y = `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${configMap.name}
  namespace: ${configMap.namespace}`;
        if (configMap.immutable) y += `\nimmutable: true`;
        if (configMap.data.length > 0) {
          y += `\ndata:`;
          configMap.data.forEach(d => {
            if (d.value.includes('\n')) {
              y += `\n  ${d.key}: |\n${d.value.split('\n').map(l => `    ${l}`).join('\n')}`;
            } else {
              y += `\n  ${d.key}: "${d.value}"`;
            }
          });
        }
        return y;
      }

      case 'Secret': {
        let y = `apiVersion: v1
kind: Secret
metadata:
  name: ${secret.name}
  namespace: ${secret.namespace}
type: ${secret.type}`;
        if (secret.immutable) y += `\nimmutable: true`;
        if (secret.stringData.length > 0) {
          y += `\nstringData:`;
          secret.stringData.forEach(d => {
            y += `\n  ${d.key}: "${d.value}"`;
          });
        }
        if (secret.data.length > 0) {
          y += `\ndata:`;
          secret.data.forEach(d => {
            y += `\n  ${d.key}: ${btoa(d.value)}`;
          });
        }
        return y;
      }

      case 'PVC': {
        let y = `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${pvc.name}
  namespace: ${pvc.namespace}
spec:
  accessModes:
${pvc.accessModes.map(a => `    - ${a}`).join('\n')}
  storageClassName: ${pvc.storageClassName}
  volumeMode: ${pvc.volumeMode}
  resources:
    requests:
      storage: ${pvc.storage}`;
        if (pvc.selector.length > 0) {
          y += `\n  selector:\n    matchLabels:\n${pvc.selector.map(s => `      ${s.key}: "${s.value}"`).join('\n')}`;
        }
        return y;
      }

      case 'HPA': {
        return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${hpa.name}
  namespace: ${hpa.namespace}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: ${hpa.targetRef.kind}
    name: ${hpa.targetRef.name}
  minReplicas: ${hpa.minReplicas}
  maxReplicas: ${hpa.maxReplicas}
  metrics:
${hpa.metrics.map(m => `    - type: Resource
      resource:
        name: ${m.name}
        target:
          type: Utilization
          averageUtilization: ${m.target}`).join('\n')}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: ${hpa.scaleDownStabilization}
    scaleUp:
      stabilizationWindowSeconds: ${hpa.scaleUpStabilization}`;
      }

      case 'NetworkPolicy': {
        let y = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${networkPolicy.name}
  namespace: ${networkPolicy.namespace}
spec:
  podSelector:
    matchLabels:
${networkPolicy.podSelector.map(s => `      ${s.key}: "${s.value}"`).join('\n')}
  policyTypes:
${networkPolicy.policyTypes.map(p => `    - ${p}`).join('\n')}`;
        if (networkPolicy.policyTypes.includes('Ingress') && networkPolicy.ingress.length > 0) {
          y += `\n  ingress:`;
          networkPolicy.ingress.forEach(i => {
            y += `\n    - ports:`;
            i.ports.forEach(p => {
              y += `\n        - protocol: ${p.protocol}\n          port: ${p.port}`;
            });
            if (i.from.length > 0) {
              y += `\n      from:`;
              i.from.forEach(() => {
                y += `\n        - podSelector: {}`;
              });
            }
          });
        }
        if (networkPolicy.policyTypes.includes('Egress') && networkPolicy.egress.length > 0) {
          y += `\n  egress:`;
          networkPolicy.egress.forEach(e => {
            y += `\n    - ports:`;
            e.ports.forEach(p => {
              y += `\n        - protocol: ${p.protocol}\n          port: ${p.port}`;
            });
          });
        }
        return y;
      }

      case 'PodDisruptionBudget': {
        return `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: ${pdb.name}
  namespace: ${pdb.namespace}
spec:
  ${pdb.useMinAvailable ? 'minAvailable' : 'maxUnavailable'}: ${pdb.useMinAvailable ? pdb.minAvailable : pdb.maxUnavailable}
  selector:
    matchLabels:
${pdb.selector.map(s => `      ${s.key}: "${s.value}"`).join('\n')}`;
      }

      case 'ServiceAccount': {
        return `apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${deployment.serviceAccountName || 'my-service-account'}
  namespace: ${deployment.namespace}
automountServiceAccountToken: true`;
      }

      case 'Namespace': {
        return `apiVersion: v1
kind: Namespace
metadata:
  name: ${deployment.namespace}
  labels:
    name: ${deployment.namespace}`;
      }

      default:
        return '';
    }
  }, [resourceType, deployment, statefulSet, service, ingress, configMap, secret, pvc, hpa, job, cronJob, networkPolicy, pdb]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yaml);
    setSnackbar({ open: true, message: 'Copied to clipboard!' });
  };

  const handleDownload = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resourceType.toLowerCase()}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateContainer = (index: number, field: string, value: unknown, isInit = false) => {
    const containers = isInit ? [...deployment.initContainers] : [...deployment.containers];
    const parts = field.split('.');
    let obj: any = containers[index];
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = value;
    if (isInit) {
      setDeployment({ ...deployment, initContainers: containers });
    } else {
      setDeployment({ ...deployment, containers: containers });
    }
  };

  const addItem = (arr: any[], setter: (v: any) => void, item: any) => setter([...arr, item]);
  const removeItem = (arr: any[], setter: (v: any) => void, index: number) => setter(arr.filter((_, i) => i !== index));

  const textFieldSx = { '& .MuiInputBase-root': { color: 'grey.300' }, '& .MuiInputLabel-root': { color: 'grey.500' } };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ bgcolor: '#111', borderBottom: '1px solid #222', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>Kubernetes YAML Builder</Typography>
            <Chip label="Advanced" size="small" color="primary" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download YAML"><IconButton onClick={handleDownload} sx={{ color: 'grey.500' }}><Download /></IconButton></Tooltip>
            <Tooltip title="Copy to Clipboard"><IconButton onClick={handleCopy} sx={{ color: 'grey.500' }}><ContentCopy /></IconButton></Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Resource Type Tabs */}
      <Paper sx={{ bgcolor: '#0d0d0d', borderBottom: '1px solid #222' }}>
        <Tabs
          value={resourceType}
          onChange={(_, v) => setResourceType(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { color: 'grey.500', minWidth: 100 }, '& .Mui-selected': { color: '#90caf9' } }}
        >
          <Tab icon={<Settings />} iconPosition="start" label="Deployment" value="Deployment" />
          <Tab label="StatefulSet" value="StatefulSet" />
          <Tab label="DaemonSet" value="DaemonSet" />
          <Tab icon={<Schedule />} iconPosition="start" label="Job" value="Job" />
          <Tab label="CronJob" value="CronJob" />
          <Tab icon={<NetworkCheck />} iconPosition="start" label="Service" value="Service" />
          <Tab label="Ingress" value="Ingress" />
          <Tab icon={<Storage />} iconPosition="start" label="ConfigMap" value="ConfigMap" />
          <Tab label="Secret" value="Secret" />
          <Tab label="PVC" value="PVC" />
          <Tab label="HPA" value="HPA" />
          <Tab icon={<Security />} iconPosition="start" label="NetworkPolicy" value="NetworkPolicy" />
          <Tab label="PDB" value="PodDisruptionBudget" />
          <Tab label="ServiceAccount" value="ServiceAccount" />
          <Tab label="Namespace" value="Namespace" />
        </Tabs>
      </Paper>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 130px)' }}>
        {/* Builder Panel */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          {/* DEPLOYMENT */}
          {resourceType === 'Deployment' && (
            <>
              <Accordion defaultExpanded sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                  <Typography sx={{ color: 'grey.300' }}>Metadata & Replicas</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField size="small" label="Name" value={deployment.name} onChange={(e) => setDeployment({ ...deployment, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                    <TextField size="small" label="Namespace" value={deployment.namespace} onChange={(e) => setDeployment({ ...deployment, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                    <TextField size="small" label="Replicas" type="number" value={deployment.replicas} onChange={(e) => setDeployment({ ...deployment, replicas: parseInt(e.target.value) || 1 })} sx={{ width: 100, ...textFieldSx }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel sx={{ color: 'grey.500' }}>Strategy</InputLabel>
                      <Select value={deployment.strategy} label="Strategy" onChange={(e) => setDeployment({ ...deployment, strategy: e.target.value as any })} sx={{ color: 'grey.300' }}>
                        <MenuItem value="RollingUpdate">RollingUpdate</MenuItem>
                        <MenuItem value="Recreate">Recreate</MenuItem>
                      </Select>
                    </FormControl>
                    {deployment.strategy === 'RollingUpdate' && (
                      <>
                        <TextField size="small" label="Max Surge" value={deployment.maxSurge} onChange={(e) => setDeployment({ ...deployment, maxSurge: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                        <TextField size="small" label="Max Unavailable" value={deployment.maxUnavailable} onChange={(e) => setDeployment({ ...deployment, maxUnavailable: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                      </>
                    )}
                  </Box>
                  <TextField size="small" label="Service Account Name" value={deployment.serviceAccountName} onChange={(e) => setDeployment({ ...deployment, serviceAccountName: e.target.value })} sx={{ width: '100%', mb: 2, ...textFieldSx }} />
                  <TextField size="small" label="Termination Grace Period (seconds)" type="number" value={deployment.terminationGracePeriodSeconds} onChange={(e) => setDeployment({ ...deployment, terminationGracePeriodSeconds: parseInt(e.target.value) || 30 })} sx={{ width: 250, ...textFieldSx }} />
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                  <Typography sx={{ color: 'grey.300' }}>Labels & Annotations</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>Labels</Typography>
                  {deployment.labels.map((l, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" label="Key" value={l.key} onChange={(e) => { const n = [...deployment.labels]; n[i].key = e.target.value; setDeployment({ ...deployment, labels: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <TextField size="small" label="Value" value={l.value} onChange={(e) => { const n = [...deployment.labels]; n[i].value = e.target.value; setDeployment({ ...deployment, labels: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <IconButton size="small" onClick={() => removeItem(deployment.labels, (v) => setDeployment({ ...deployment, labels: v }), i)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => addItem(deployment.labels, (v) => setDeployment({ ...deployment, labels: v }), { key: '', value: '' })}>Add Label</Button>
                  <Divider sx={{ my: 2, borderColor: '#333' }} />
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>Annotations</Typography>
                  {deployment.annotations.map((a, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" label="Key" value={a.key} onChange={(e) => { const n = [...deployment.annotations]; n[i].key = e.target.value; setDeployment({ ...deployment, annotations: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <TextField size="small" label="Value" value={a.value} onChange={(e) => { const n = [...deployment.annotations]; n[i].value = e.target.value; setDeployment({ ...deployment, annotations: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <IconButton size="small" onClick={() => removeItem(deployment.annotations, (v) => setDeployment({ ...deployment, annotations: v }), i)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => addItem(deployment.annotations, (v) => setDeployment({ ...deployment, annotations: v }), { key: '', value: '' })}>Add Annotation</Button>
                </AccordionDetails>
              </Accordion>

              <Accordion defaultExpanded sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                  <Typography sx={{ color: 'grey.300' }}>Containers ({deployment.containers.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {deployment.containers.map((c, idx) => (
                    <Paper key={idx} sx={{ bgcolor: '#0a0a0a', p: 2, mb: 2, border: '1px solid #333' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>Container #{idx + 1}</Typography>
                        {deployment.containers.length > 1 && <IconButton size="small" onClick={() => removeItem(deployment.containers, (v) => setDeployment({ ...deployment, containers: v }), idx)} sx={{ color: 'error.main' }}><Delete /></IconButton>}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField size="small" label="Name" value={c.name} onChange={(e) => updateContainer(idx, 'name', e.target.value)} sx={{ flex: 1, ...textFieldSx }} />
                        <TextField size="small" label="Image" value={c.image} onChange={(e) => updateContainer(idx, 'image', e.target.value)} sx={{ flex: 2, ...textFieldSx }} />
                        <FormControl size="small" sx={{ width: 140 }}>
                          <InputLabel sx={{ color: 'grey.500' }}>Pull Policy</InputLabel>
                          <Select value={c.imagePullPolicy} label="Pull Policy" onChange={(e) => updateContainer(idx, 'imagePullPolicy', e.target.value)} sx={{ color: 'grey.300' }}>
                            <MenuItem value="Always">Always</MenuItem>
                            <MenuItem value="IfNotPresent">IfNotPresent</MenuItem>
                            <MenuItem value="Never">Never</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>Resources</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField size="small" label="CPU Request" value={c.resources.requests.cpu} onChange={(e) => updateContainer(idx, 'resources.requests.cpu', e.target.value)} sx={{ flex: 1, ...textFieldSx }} />
                        <TextField size="small" label="Memory Request" value={c.resources.requests.memory} onChange={(e) => updateContainer(idx, 'resources.requests.memory', e.target.value)} sx={{ flex: 1, ...textFieldSx }} />
                        <TextField size="small" label="CPU Limit" value={c.resources.limits.cpu} onChange={(e) => updateContainer(idx, 'resources.limits.cpu', e.target.value)} sx={{ flex: 1, ...textFieldSx }} />
                        <TextField size="small" label="Memory Limit" value={c.resources.limits.memory} onChange={(e) => updateContainer(idx, 'resources.limits.memory', e.target.value)} sx={{ flex: 1, ...textFieldSx }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>Health Probes</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <FormControlLabel control={<Switch checked={c.livenessProbe.enabled} onChange={(e) => updateContainer(idx, 'livenessProbe.enabled', e.target.checked)} size="small" />} label="Liveness" sx={{ color: 'grey.400' }} />
                        <FormControlLabel control={<Switch checked={c.readinessProbe.enabled} onChange={(e) => updateContainer(idx, 'readinessProbe.enabled', e.target.checked)} size="small" />} label="Readiness" sx={{ color: 'grey.400' }} />
                        <FormControlLabel control={<Switch checked={c.startupProbe.enabled} onChange={(e) => updateContainer(idx, 'startupProbe.enabled', e.target.checked)} size="small" />} label="Startup" sx={{ color: 'grey.400' }} />
                      </Box>
                      {(c.livenessProbe.enabled || c.readinessProbe.enabled || c.startupProbe.enabled) && (
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <TextField size="small" label="Probe Path" value={c.livenessProbe.path} onChange={(e) => { updateContainer(idx, 'livenessProbe.path', e.target.value); updateContainer(idx, 'readinessProbe.path', e.target.value); updateContainer(idx, 'startupProbe.path', e.target.value); }} sx={{ flex: 1, ...textFieldSx }} />
                          <TextField size="small" label="Probe Port" type="number" value={c.livenessProbe.port} onChange={(e) => { const v = parseInt(e.target.value) || 8080; updateContainer(idx, 'livenessProbe.port', v); updateContainer(idx, 'readinessProbe.port', v); updateContainer(idx, 'startupProbe.port', v); }} sx={{ width: 120, ...textFieldSx }} />
                        </Box>
                      )}
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>Environment Variables</Typography>
                      {c.env.map((e, ei) => (
                        <Box key={ei} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <TextField size="small" label="Name" value={e.name} onChange={(ev) => { const n = [...c.env]; n[ei].name = ev.target.value; updateContainer(idx, 'env', n); }} sx={{ flex: 1, ...textFieldSx }} />
                          <TextField size="small" label="Value" value={e.value} onChange={(ev) => { const n = [...c.env]; n[ei].value = ev.target.value; updateContainer(idx, 'env', n); }} sx={{ flex: 1, ...textFieldSx }} />
                          <IconButton size="small" onClick={() => updateContainer(idx, 'env', c.env.filter((_, i) => i !== ei))} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                        </Box>
                      ))}
                      <Button size="small" startIcon={<Add />} onClick={() => updateContainer(idx, 'env', [...c.env, { name: '', value: '' }])}>Add Env</Button>
                    </Paper>
                  ))}
                  <Button startIcon={<Add />} onClick={() => addItem(deployment.containers, (v) => setDeployment({ ...deployment, containers: v }), { ...defaultContainer, name: `container-${deployment.containers.length + 1}` })}>Add Container</Button>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                  <Typography sx={{ color: 'grey.300' }}>Security Context</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <FormControlLabel control={<Switch checked={deployment.securityContext.runAsNonRoot} onChange={(e) => setDeployment({ ...deployment, securityContext: { ...deployment.securityContext, runAsNonRoot: e.target.checked } })} />} label="Run as Non-Root" sx={{ color: 'grey.400' }} />
                    <TextField size="small" label="Run as User" type="number" value={deployment.securityContext.runAsUser} onChange={(e) => setDeployment({ ...deployment, securityContext: { ...deployment.securityContext, runAsUser: parseInt(e.target.value) || 1000 } })} sx={{ width: 120, ...textFieldSx }} />
                    <TextField size="small" label="Run as Group" type="number" value={deployment.securityContext.runAsGroup} onChange={(e) => setDeployment({ ...deployment, securityContext: { ...deployment.securityContext, runAsGroup: parseInt(e.target.value) || 1000 } })} sx={{ width: 120, ...textFieldSx }} />
                    <TextField size="small" label="FS Group" type="number" value={deployment.securityContext.fsGroup} onChange={(e) => setDeployment({ ...deployment, securityContext: { ...deployment.securityContext, fsGroup: parseInt(e.target.value) || 1000 } })} sx={{ width: 120, ...textFieldSx }} />
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                  <Typography sx={{ color: 'grey.300' }}>Volumes ({deployment.volumes.length})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {deployment.volumes.map((v, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" label="Name" value={v.name} onChange={(e) => { const n = [...deployment.volumes]; n[i].name = e.target.value; setDeployment({ ...deployment, volumes: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <FormControl size="small" sx={{ width: 180 }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                        <Select value={v.type} label="Type" onChange={(e) => { const n = [...deployment.volumes]; n[i].type = e.target.value as any; setDeployment({ ...deployment, volumes: n }); }} sx={{ color: 'grey.300' }}>
                          <MenuItem value="emptyDir">emptyDir</MenuItem>
                          <MenuItem value="configMap">ConfigMap</MenuItem>
                          <MenuItem value="secret">Secret</MenuItem>
                          <MenuItem value="persistentVolumeClaim">PVC</MenuItem>
                          <MenuItem value="hostPath">hostPath</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Source" value={v.source} onChange={(e) => { const n = [...deployment.volumes]; n[i].source = e.target.value; setDeployment({ ...deployment, volumes: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <IconButton size="small" onClick={() => removeItem(deployment.volumes, (v) => setDeployment({ ...deployment, volumes: v }), i)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => addItem(deployment.volumes, (v) => setDeployment({ ...deployment, volumes: v }), { name: '', type: 'emptyDir', source: '' })}>Add Volume</Button>
                </AccordionDetails>
              </Accordion>

              <Accordion sx={{ bgcolor: '#111', border: '1px solid #222', mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'grey.500' }} />}>
                  <Typography sx={{ color: 'grey.300' }}>Node Selector & Tolerations</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>Node Selector</Typography>
                  {deployment.nodeSelector.map((n, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" label="Key" value={n.key} onChange={(e) => { const ns = [...deployment.nodeSelector]; ns[i].key = e.target.value; setDeployment({ ...deployment, nodeSelector: ns }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <TextField size="small" label="Value" value={n.value} onChange={(e) => { const ns = [...deployment.nodeSelector]; ns[i].value = e.target.value; setDeployment({ ...deployment, nodeSelector: ns }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <IconButton size="small" onClick={() => removeItem(deployment.nodeSelector, (v) => setDeployment({ ...deployment, nodeSelector: v }), i)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => addItem(deployment.nodeSelector, (v) => setDeployment({ ...deployment, nodeSelector: v }), { key: '', value: '' })}>Add Node Selector</Button>
                  <Divider sx={{ my: 2, borderColor: '#333' }} />
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>Tolerations</Typography>
                  {deployment.tolerations.map((t, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" label="Key" value={t.key} onChange={(e) => { const ts = [...deployment.tolerations]; ts[i].key = e.target.value; setDeployment({ ...deployment, tolerations: ts }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <FormControl size="small" sx={{ width: 120 }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Operator</InputLabel>
                        <Select value={t.operator} label="Operator" onChange={(e) => { const ts = [...deployment.tolerations]; ts[i].operator = e.target.value; setDeployment({ ...deployment, tolerations: ts }); }} sx={{ color: 'grey.300' }}>
                          <MenuItem value="Equal">Equal</MenuItem>
                          <MenuItem value="Exists">Exists</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Value" value={t.value} onChange={(e) => { const ts = [...deployment.tolerations]; ts[i].value = e.target.value; setDeployment({ ...deployment, tolerations: ts }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <FormControl size="small" sx={{ width: 140 }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Effect</InputLabel>
                        <Select value={t.effect} label="Effect" onChange={(e) => { const ts = [...deployment.tolerations]; ts[i].effect = e.target.value; setDeployment({ ...deployment, tolerations: ts }); }} sx={{ color: 'grey.300' }}>
                          <MenuItem value="NoSchedule">NoSchedule</MenuItem>
                          <MenuItem value="PreferNoSchedule">PreferNoSchedule</MenuItem>
                          <MenuItem value="NoExecute">NoExecute</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small" onClick={() => removeItem(deployment.tolerations, (v) => setDeployment({ ...deployment, tolerations: v }), i)} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => addItem(deployment.tolerations, (v) => setDeployment({ ...deployment, tolerations: v }), { key: '', operator: 'Equal', value: '', effect: 'NoSchedule' })}>Add Toleration</Button>
                </AccordionDetails>
              </Accordion>
            </>
          )}

          {/* SERVICE */}
          {resourceType === 'Service' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Service Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={service.name} onChange={(e) => setService({ ...service, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={service.namespace} onChange={(e) => setService({ ...service, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <FormControl size="small" sx={{ width: 160 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                  <Select value={service.type} label="Type" onChange={(e) => setService({ ...service, type: e.target.value as any })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="ClusterIP">ClusterIP</MenuItem>
                    <MenuItem value="NodePort">NodePort</MenuItem>
                    <MenuItem value="LoadBalancer">LoadBalancer</MenuItem>
                    <MenuItem value="ExternalName">ExternalName</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {service.type === 'ExternalName' ? (
                <TextField size="small" label="External Name" value={service.externalName} onChange={(e) => setService({ ...service, externalName: e.target.value })} fullWidth sx={{ mb: 2, ...textFieldSx }} />
              ) : (
                <>
                  {service.type === 'LoadBalancer' && (
                    <TextField size="small" label="Load Balancer IP (optional)" value={service.loadBalancerIP} onChange={(e) => setService({ ...service, loadBalancerIP: e.target.value })} fullWidth sx={{ mb: 2, ...textFieldSx }} />
                  )}
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>Ports</Typography>
                  {service.ports.map((p, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" label="Name" value={p.name} onChange={(e) => { const n = [...service.ports]; n[i].name = e.target.value; setService({ ...service, ports: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <TextField size="small" label="Port" type="number" value={p.port} onChange={(e) => { const n = [...service.ports]; n[i].port = parseInt(e.target.value) || 80; setService({ ...service, ports: n }); }} sx={{ width: 100, ...textFieldSx }} />
                      <TextField size="small" label="Target Port" type="number" value={p.targetPort} onChange={(e) => { const n = [...service.ports]; n[i].targetPort = parseInt(e.target.value) || 80; setService({ ...service, ports: n }); }} sx={{ width: 100, ...textFieldSx }} />
                      {service.type === 'NodePort' && (
                        <TextField size="small" label="Node Port" type="number" value={p.nodePort || ''} onChange={(e) => { const n = [...service.ports]; n[i].nodePort = parseInt(e.target.value) || undefined; setService({ ...service, ports: n }); }} sx={{ width: 100, ...textFieldSx }} />
                      )}
                      <IconButton size="small" onClick={() => setService({ ...service, ports: service.ports.filter((_, idx) => idx !== i) })} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => setService({ ...service, ports: [...service.ports, { name: '', port: 80, targetPort: 80, protocol: 'TCP' }] })} sx={{ mb: 2 }}>Add Port</Button>
                  <Typography variant="caption" sx={{ color: 'grey.500', display: 'block' }}>Selector</Typography>
                  {service.selector.map((s, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" label="Key" value={s.key} onChange={(e) => { const n = [...service.selector]; n[i].key = e.target.value; setService({ ...service, selector: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <TextField size="small" label="Value" value={s.value} onChange={(e) => { const n = [...service.selector]; n[i].value = e.target.value; setService({ ...service, selector: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <IconButton size="small" onClick={() => setService({ ...service, selector: service.selector.filter((_, idx) => idx !== i) })} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => setService({ ...service, selector: [...service.selector, { key: '', value: '' }] })}>Add Selector</Button>
                </>
              )}
            </Paper>
          )}

          {/* INGRESS */}
          {resourceType === 'Ingress' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Ingress Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={ingress.name} onChange={(e) => setIngress({ ...ingress, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={ingress.namespace} onChange={(e) => setIngress({ ...ingress, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Ingress Class" value={ingress.ingressClassName} onChange={(e) => setIngress({ ...ingress, ingressClassName: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Annotations</Typography>
              {ingress.annotations.map((a, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" label="Key" value={a.key} onChange={(e) => { const n = [...ingress.annotations]; n[i].key = e.target.value; setIngress({ ...ingress, annotations: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                  <TextField size="small" label="Value" value={a.value} onChange={(e) => { const n = [...ingress.annotations]; n[i].value = e.target.value; setIngress({ ...ingress, annotations: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                  <IconButton size="small" onClick={() => setIngress({ ...ingress, annotations: ingress.annotations.filter((_, idx) => idx !== i) })} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => setIngress({ ...ingress, annotations: [...ingress.annotations, { key: '', value: '' }] })} sx={{ mb: 2 }}>Add Annotation</Button>
              <Divider sx={{ my: 2, borderColor: '#333' }} />
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Rules</Typography>
              {ingress.rules.map((r, ri) => (
                <Paper key={ri} sx={{ bgcolor: '#0a0a0a', p: 2, mb: 2, border: '1px solid #333' }}>
                  <TextField size="small" label="Host" value={r.host} onChange={(e) => { const n = [...ingress.rules]; n[ri].host = e.target.value; setIngress({ ...ingress, rules: n }); }} fullWidth sx={{ mb: 2, ...textFieldSx }} />
                  {r.paths.map((p, pi) => (
                    <Box key={pi} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField size="small" label="Path" value={p.path} onChange={(e) => { const n = [...ingress.rules]; n[ri].paths[pi].path = e.target.value; setIngress({ ...ingress, rules: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <FormControl size="small" sx={{ width: 140 }}>
                        <InputLabel sx={{ color: 'grey.500' }}>Path Type</InputLabel>
                        <Select value={p.pathType} label="Path Type" onChange={(e) => { const n = [...ingress.rules]; n[ri].paths[pi].pathType = e.target.value; setIngress({ ...ingress, rules: n }); }} sx={{ color: 'grey.300' }}>
                          <MenuItem value="Prefix">Prefix</MenuItem>
                          <MenuItem value="Exact">Exact</MenuItem>
                          <MenuItem value="ImplementationSpecific">ImplementationSpecific</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Service" value={p.serviceName} onChange={(e) => { const n = [...ingress.rules]; n[ri].paths[pi].serviceName = e.target.value; setIngress({ ...ingress, rules: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                      <TextField size="small" label="Port" type="number" value={p.servicePort} onChange={(e) => { const n = [...ingress.rules]; n[ri].paths[pi].servicePort = parseInt(e.target.value) || 80; setIngress({ ...ingress, rules: n }); }} sx={{ width: 80, ...textFieldSx }} />
                    </Box>
                  ))}
                  <Button size="small" startIcon={<Add />} onClick={() => { const n = [...ingress.rules]; n[ri].paths.push({ path: '/', pathType: 'Prefix', serviceName: '', servicePort: 80 }); setIngress({ ...ingress, rules: n }); }}>Add Path</Button>
                </Paper>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => setIngress({ ...ingress, rules: [...ingress.rules, { host: '', paths: [{ path: '/', pathType: 'Prefix', serviceName: '', servicePort: 80 }] }] })}>Add Rule</Button>
            </Paper>
          )}

          {/* CONFIGMAP */}
          {resourceType === 'ConfigMap' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>ConfigMap Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={configMap.name} onChange={(e) => setConfigMap({ ...configMap, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={configMap.namespace} onChange={(e) => setConfigMap({ ...configMap, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <FormControlLabel control={<Switch checked={configMap.immutable} onChange={(e) => setConfigMap({ ...configMap, immutable: e.target.checked })} />} label="Immutable" sx={{ color: 'grey.400' }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Data</Typography>
              {configMap.data.map((d, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" label="Key" value={d.key} onChange={(e) => { const n = [...configMap.data]; n[i].key = e.target.value; setConfigMap({ ...configMap, data: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                  <TextField size="small" label="Value" value={d.value} onChange={(e) => { const n = [...configMap.data]; n[i].value = e.target.value; setConfigMap({ ...configMap, data: n }); }} sx={{ flex: 2, ...textFieldSx }} multiline />
                  <IconButton size="small" onClick={() => setConfigMap({ ...configMap, data: configMap.data.filter((_, idx) => idx !== i) })} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => setConfigMap({ ...configMap, data: [...configMap.data, { key: '', value: '' }] })}>Add Data</Button>
            </Paper>
          )}

          {/* SECRET */}
          {resourceType === 'Secret' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Secret Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={secret.name} onChange={(e) => setSecret({ ...secret, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={secret.namespace} onChange={(e) => setSecret({ ...secret, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <FormControl size="small" sx={{ width: 220 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                  <Select value={secret.type} label="Type" onChange={(e) => setSecret({ ...secret, type: e.target.value as any })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="Opaque">Opaque</MenuItem>
                    <MenuItem value="kubernetes.io/tls">TLS</MenuItem>
                    <MenuItem value="kubernetes.io/dockerconfigjson">Docker Config</MenuItem>
                    <MenuItem value="kubernetes.io/basic-auth">Basic Auth</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>String Data (plain text - will be encoded)</Typography>
              {secret.stringData.map((d, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" label="Key" value={d.key} onChange={(e) => { const n = [...secret.stringData]; n[i].key = e.target.value; setSecret({ ...secret, stringData: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                  <TextField size="small" label="Value" type="password" value={d.value} onChange={(e) => { const n = [...secret.stringData]; n[i].value = e.target.value; setSecret({ ...secret, stringData: n }); }} sx={{ flex: 2, ...textFieldSx }} />
                  <IconButton size="small" onClick={() => setSecret({ ...secret, stringData: secret.stringData.filter((_, idx) => idx !== i) })} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => setSecret({ ...secret, stringData: [...secret.stringData, { key: '', value: '' }] })}>Add Secret</Button>
            </Paper>
          )}

          {/* PVC */}
          {resourceType === 'PVC' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Persistent Volume Claim</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={pvc.name} onChange={(e) => setPvc({ ...pvc, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={pvc.namespace} onChange={(e) => setPvc({ ...pvc, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Storage Class" value={pvc.storageClassName} onChange={(e) => setPvc({ ...pvc, storageClassName: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Storage Size" value={pvc.storage} onChange={(e) => setPvc({ ...pvc, storage: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <FormControl size="small" sx={{ width: 140 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Volume Mode</InputLabel>
                  <Select value={pvc.volumeMode} label="Volume Mode" onChange={(e) => setPvc({ ...pvc, volumeMode: e.target.value as any })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="Filesystem">Filesystem</MenuItem>
                    <MenuItem value="Block">Block</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Access Modes</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                {['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany'].map(mode => (
                  <FormControlLabel key={mode} control={<Switch checked={pvc.accessModes.includes(mode)} onChange={(e) => setPvc({ ...pvc, accessModes: e.target.checked ? [...pvc.accessModes, mode] : pvc.accessModes.filter(m => m !== mode) })} />} label={mode} sx={{ color: 'grey.400' }} />
                ))}
              </Box>
            </Paper>
          )}

          {/* HPA */}
          {resourceType === 'HPA' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Horizontal Pod Autoscaler</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={hpa.name} onChange={(e) => setHpa({ ...hpa, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={hpa.namespace} onChange={(e) => setHpa({ ...hpa, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small" sx={{ width: 140 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Target Kind</InputLabel>
                  <Select value={hpa.targetRef.kind} label="Target Kind" onChange={(e) => setHpa({ ...hpa, targetRef: { ...hpa.targetRef, kind: e.target.value } })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="Deployment">Deployment</MenuItem>
                    <MenuItem value="StatefulSet">StatefulSet</MenuItem>
                    <MenuItem value="ReplicaSet">ReplicaSet</MenuItem>
                  </Select>
                </FormControl>
                <TextField size="small" label="Target Name" value={hpa.targetRef.name} onChange={(e) => setHpa({ ...hpa, targetRef: { ...hpa.targetRef, name: e.target.value } })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Min Replicas" type="number" value={hpa.minReplicas} onChange={(e) => setHpa({ ...hpa, minReplicas: parseInt(e.target.value) || 1 })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Max Replicas" type="number" value={hpa.maxReplicas} onChange={(e) => setHpa({ ...hpa, maxReplicas: parseInt(e.target.value) || 10 })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Metrics</Typography>
              {hpa.metrics.map((m, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <FormControl size="small" sx={{ width: 140 }}>
                    <InputLabel sx={{ color: 'grey.500' }}>Type</InputLabel>
                    <Select value={m.type} label="Type" onChange={(e) => { const n = [...hpa.metrics]; n[i].type = e.target.value; n[i].name = e.target.value; setHpa({ ...hpa, metrics: n }); }} sx={{ color: 'grey.300' }}>
                      <MenuItem value="cpu">CPU</MenuItem>
                      <MenuItem value="memory">Memory</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField size="small" label="Target %" type="number" value={m.target} onChange={(e) => { const n = [...hpa.metrics]; n[i].target = parseInt(e.target.value) || 80; setHpa({ ...hpa, metrics: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                  <IconButton size="small" onClick={() => setHpa({ ...hpa, metrics: hpa.metrics.filter((_, idx) => idx !== i) })} sx={{ color: 'grey.500' }}><Delete /></IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => setHpa({ ...hpa, metrics: [...hpa.metrics, { type: 'cpu', name: 'cpu', target: 80 }] })} sx={{ mb: 2 }}>Add Metric</Button>
              <Divider sx={{ my: 2, borderColor: '#333' }} />
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Scaling Behavior</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField size="small" label="Scale Down Stabilization (s)" type="number" value={hpa.scaleDownStabilization} onChange={(e) => setHpa({ ...hpa, scaleDownStabilization: parseInt(e.target.value) || 300 })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Scale Up Stabilization (s)" type="number" value={hpa.scaleUpStabilization} onChange={(e) => setHpa({ ...hpa, scaleUpStabilization: parseInt(e.target.value) || 0 })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
            </Paper>
          )}

          {/* JOB */}
          {resourceType === 'Job' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Job Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={job.name} onChange={(e) => setJob({ ...job, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={job.namespace} onChange={(e) => setJob({ ...job, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Completions" type="number" value={job.completions} onChange={(e) => setJob({ ...job, completions: parseInt(e.target.value) || 1 })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Parallelism" type="number" value={job.parallelism} onChange={(e) => setJob({ ...job, parallelism: parseInt(e.target.value) || 1 })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Backoff Limit" type="number" value={job.backoffLimit} onChange={(e) => setJob({ ...job, backoffLimit: parseInt(e.target.value) || 6 })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="TTL After Finished (s)" type="number" value={job.ttlSecondsAfterFinished} onChange={(e) => setJob({ ...job, ttlSecondsAfterFinished: parseInt(e.target.value) || 100 })} sx={{ flex: 1, ...textFieldSx }} />
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Restart Policy</InputLabel>
                  <Select value={job.restartPolicy} label="Restart Policy" onChange={(e) => setJob({ ...job, restartPolicy: e.target.value as any })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="OnFailure">OnFailure</MenuItem>
                    <MenuItem value="Never">Never</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Container</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField size="small" label="Image" value={job.containers[0]?.image || ''} onChange={(e) => { const c = [...job.containers]; c[0] = { ...c[0], image: e.target.value }; setJob({ ...job, containers: c }); }} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
            </Paper>
          )}

          {/* CRONJOB */}
          {resourceType === 'CronJob' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>CronJob Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={cronJob.name} onChange={(e) => setCronJob({ ...cronJob, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={cronJob.namespace} onChange={(e) => setCronJob({ ...cronJob, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <TextField size="small" label="Schedule (cron format)" value={cronJob.schedule} onChange={(e) => setCronJob({ ...cronJob, schedule: e.target.value })} fullWidth sx={{ mb: 2, ...textFieldSx }} helperText="Example: */5 * * * * (every 5 minutes)" />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Concurrency Policy</InputLabel>
                  <Select value={cronJob.concurrencyPolicy} label="Concurrency Policy" onChange={(e) => setCronJob({ ...cronJob, concurrencyPolicy: e.target.value as any })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="Allow">Allow</MenuItem>
                    <MenuItem value="Forbid">Forbid</MenuItem>
                    <MenuItem value="Replace">Replace</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel control={<Switch checked={cronJob.suspend} onChange={(e) => setCronJob({ ...cronJob, suspend: e.target.checked })} />} label="Suspend" sx={{ color: 'grey.400' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Success History Limit" type="number" value={cronJob.successfulJobsHistoryLimit} onChange={(e) => setCronJob({ ...cronJob, successfulJobsHistoryLimit: parseInt(e.target.value) || 3 })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Failed History Limit" type="number" value={cronJob.failedJobsHistoryLimit} onChange={(e) => setCronJob({ ...cronJob, failedJobsHistoryLimit: parseInt(e.target.value) || 1 })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Container</Typography>
              <TextField size="small" label="Image" value={cronJob.jobTemplate.containers[0]?.image || ''} onChange={(e) => { const c = [...cronJob.jobTemplate.containers]; c[0] = { ...c[0], image: e.target.value }; setCronJob({ ...cronJob, jobTemplate: { ...cronJob.jobTemplate, containers: c } }); }} fullWidth sx={{ ...textFieldSx }} />
            </Paper>
          )}

          {/* NETWORK POLICY */}
          {resourceType === 'NetworkPolicy' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Network Policy</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={networkPolicy.name} onChange={(e) => setNetworkPolicy({ ...networkPolicy, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={networkPolicy.namespace} onChange={(e) => setNetworkPolicy({ ...networkPolicy, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Pod Selector</Typography>
              {networkPolicy.podSelector.map((s, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" label="Key" value={s.key} onChange={(e) => { const n = [...networkPolicy.podSelector]; n[i].key = e.target.value; setNetworkPolicy({ ...networkPolicy, podSelector: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                  <TextField size="small" label="Value" value={s.value} onChange={(e) => { const n = [...networkPolicy.podSelector]; n[i].value = e.target.value; setNetworkPolicy({ ...networkPolicy, podSelector: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                </Box>
              ))}
              <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mt: 2 }}>Policy Types</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControlLabel control={<Switch checked={networkPolicy.policyTypes.includes('Ingress')} onChange={(e) => setNetworkPolicy({ ...networkPolicy, policyTypes: e.target.checked ? [...networkPolicy.policyTypes, 'Ingress'] : networkPolicy.policyTypes.filter(p => p !== 'Ingress') })} />} label="Ingress" sx={{ color: 'grey.400' }} />
                <FormControlLabel control={<Switch checked={networkPolicy.policyTypes.includes('Egress')} onChange={(e) => setNetworkPolicy({ ...networkPolicy, policyTypes: e.target.checked ? [...networkPolicy.policyTypes, 'Egress'] : networkPolicy.policyTypes.filter(p => p !== 'Egress') })} />} label="Egress" sx={{ color: 'grey.400' }} />
              </Box>
            </Paper>
          )}

          {/* PDB */}
          {resourceType === 'PodDisruptionBudget' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>Pod Disruption Budget</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={pdb.name} onChange={(e) => setPdb({ ...pdb, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={pdb.namespace} onChange={(e) => setPdb({ ...pdb, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControlLabel control={<Switch checked={pdb.useMinAvailable} onChange={(e) => setPdb({ ...pdb, useMinAvailable: e.target.checked })} />} label="Use minAvailable" sx={{ color: 'grey.400' }} />
                {pdb.useMinAvailable ? (
                  <TextField size="small" label="Min Available" value={pdb.minAvailable} onChange={(e) => setPdb({ ...pdb, minAvailable: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                ) : (
                  <TextField size="small" label="Max Unavailable" value={pdb.maxUnavailable} onChange={(e) => setPdb({ ...pdb, maxUnavailable: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Selector</Typography>
              {pdb.selector.map((s, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField size="small" label="Key" value={s.key} onChange={(e) => { const n = [...pdb.selector]; n[i].key = e.target.value; setPdb({ ...pdb, selector: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                  <TextField size="small" label="Value" value={s.value} onChange={(e) => { const n = [...pdb.selector]; n[i].value = e.target.value; setPdb({ ...pdb, selector: n }); }} sx={{ flex: 1, ...textFieldSx }} />
                </Box>
              ))}
            </Paper>
          )}

          {/* STATEFULSET */}
          {resourceType === 'StatefulSet' && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>StatefulSet Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Name" value={statefulSet.name} onChange={(e) => setStatefulSet({ ...statefulSet, name: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Namespace" value={statefulSet.namespace} onChange={(e) => setStatefulSet({ ...statefulSet, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <TextField size="small" label="Replicas" type="number" value={statefulSet.replicas} onChange={(e) => setStatefulSet({ ...statefulSet, replicas: parseInt(e.target.value) || 1 })} sx={{ width: 100, ...textFieldSx }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField size="small" label="Service Name (headless)" value={statefulSet.serviceName} onChange={(e) => setStatefulSet({ ...statefulSet, serviceName: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                <FormControl size="small" sx={{ width: 180 }}>
                  <InputLabel sx={{ color: 'grey.500' }}>Pod Management</InputLabel>
                  <Select value={statefulSet.podManagementPolicy} label="Pod Management" onChange={(e) => setStatefulSet({ ...statefulSet, podManagementPolicy: e.target.value as any })} sx={{ color: 'grey.300' }}>
                    <MenuItem value="OrderedReady">OrderedReady</MenuItem>
                    <MenuItem value="Parallel">Parallel</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>Container</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField size="small" label="Image" value={statefulSet.containers[0]?.image || ''} onChange={(e) => { const c = [...statefulSet.containers]; c[0] = { ...c[0], image: e.target.value }; setStatefulSet({ ...statefulSet, containers: c }); }} sx={{ flex: 1, ...textFieldSx }} />
              </Box>
            </Paper>
          )}

          {/* SIMPLE RESOURCES */}
          {(resourceType === 'ServiceAccount' || resourceType === 'Namespace' || resourceType === 'DaemonSet') && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.400', mb: 2 }}>{resourceType} Configuration</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField size="small" label="Name" value={resourceType === 'Namespace' ? deployment.namespace : (deployment.serviceAccountName || 'my-service-account')} onChange={(e) => setDeployment({ ...deployment, [resourceType === 'Namespace' ? 'namespace' : 'serviceAccountName']: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                {resourceType !== 'Namespace' && (
                  <TextField size="small" label="Namespace" value={deployment.namespace} onChange={(e) => setDeployment({ ...deployment, namespace: e.target.value })} sx={{ flex: 1, ...textFieldSx }} />
                )}
              </Box>
            </Paper>
          )}
        </Box>

        {/* YAML Output Panel */}
        <Box sx={{ width: 550, borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #222' }}>
            <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>{resourceType.toLowerCase()}.yaml</Typography>
            <Chip label={`${yaml.split('\n').length} lines`} size="small" sx={{ bgcolor: '#222' }} />
          </Box>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <Paper sx={{ bgcolor: '#0a0a0a', p: 2, border: '1px solid #333', height: '100%', overflow: 'auto' }}>
              <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: 11, color: '#d4d4d4', m: 0, whiteSpace: 'pre' }}>
                {yaml}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2000} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} />
    </Box>
  );
}
