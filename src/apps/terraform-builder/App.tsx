import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Cloud, Plus, Trash2 } from 'lucide-react';

type Provider = 'aws' | 'azure' | 'gcp' | 'kubernetes';
type ResourceType = 'instance' | 'bucket' | 'database' | 'vpc' | 'security_group' | 'load_balancer';

interface Variable {
  name: string;
  type: string;
  default?: string;
  description?: string;
}

interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  config: Record<string, string>;
}

const resourceTemplates: Record<Provider, Record<ResourceType, { label: string; config: Record<string, string> }>> = {
  aws: {
    instance: { label: 'EC2 Instance', config: { ami: 'ami-0c55b159cbfafe1f0', instance_type: 't2.micro' } },
    bucket: { label: 'S3 Bucket', config: { bucket: 'my-bucket', acl: 'private' } },
    database: { label: 'RDS Instance', config: { engine: 'postgres', instance_class: 'db.t3.micro' } },
    vpc: { label: 'VPC', config: { cidr_block: '10.0.0.0/16' } },
    security_group: { label: 'Security Group', config: { name: 'allow_ssh' } },
    load_balancer: { label: 'ALB', config: { name: 'my-alb', internal: 'false' } },
  },
  azure: {
    instance: { label: 'Virtual Machine', config: { vm_size: 'Standard_DS1_v2' } },
    bucket: { label: 'Storage Account', config: { account_tier: 'Standard' } },
    database: { label: 'SQL Database', config: { edition: 'Basic' } },
    vpc: { label: 'Virtual Network', config: { address_space: '["10.0.0.0/16"]' } },
    security_group: { label: 'Network Security Group', config: { name: 'my-nsg' } },
    load_balancer: { label: 'Load Balancer', config: { name: 'my-lb' } },
  },
  gcp: {
    instance: { label: 'Compute Instance', config: { machine_type: 'e2-micro', zone: 'us-central1-a' } },
    bucket: { label: 'Storage Bucket', config: { location: 'US' } },
    database: { label: 'Cloud SQL', config: { database_version: 'POSTGRES_14', tier: 'db-f1-micro' } },
    vpc: { label: 'VPC Network', config: { auto_create_subnetworks: 'true' } },
    security_group: { label: 'Firewall Rule', config: { direction: 'INGRESS' } },
    load_balancer: { label: 'Load Balancer', config: { name: 'my-lb' } },
  },
  kubernetes: {
    instance: { label: 'Deployment', config: { replicas: '3' } },
    bucket: { label: 'PersistentVolumeClaim', config: { storage: '10Gi' } },
    database: { label: 'StatefulSet', config: { replicas: '1' } },
    vpc: { label: 'Namespace', config: {} },
    security_group: { label: 'NetworkPolicy', config: {} },
    load_balancer: { label: 'Service (LoadBalancer)', config: { type: 'LoadBalancer' } },
  },
};

export default function TerraformBuilder() {
  const [provider, setProvider] = useState<Provider>('aws');
  const [region, setRegion] = useState('us-east-1');
  const [variables, setVariables] = useState<Variable[]>([
    { name: 'environment', type: 'string', default: 'dev', description: 'Environment name' },
  ]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const generateHCL = (): string => {
    const lines: string[] = [];

    // Provider block
    lines.push(`terraform {`);
    lines.push(`  required_providers {`);
    if (provider === 'aws') {
      lines.push(`    aws = {`);
      lines.push(`      source  = "hashicorp/aws"`);
      lines.push(`      version = "~> 5.0"`);
      lines.push(`    }`);
    } else if (provider === 'azure') {
      lines.push(`    azurerm = {`);
      lines.push(`      source  = "hashicorp/azurerm"`);
      lines.push(`      version = "~> 3.0"`);
      lines.push(`    }`);
    } else if (provider === 'gcp') {
      lines.push(`    google = {`);
      lines.push(`      source  = "hashicorp/google"`);
      lines.push(`      version = "~> 5.0"`);
      lines.push(`    }`);
    } else if (provider === 'kubernetes') {
      lines.push(`    kubernetes = {`);
      lines.push(`      source  = "hashicorp/kubernetes"`);
      lines.push(`      version = "~> 2.0"`);
      lines.push(`    }`);
    }
    lines.push(`  }`);
    lines.push(`}`);
    lines.push('');

    // Provider configuration
    if (provider === 'aws') {
      lines.push(`provider "aws" {`);
      lines.push(`  region = "${region}"`);
      lines.push(`}`);
    } else if (provider === 'azure') {
      lines.push(`provider "azurerm" {`);
      lines.push(`  features {}`);
      lines.push(`}`);
    } else if (provider === 'gcp') {
      lines.push(`provider "google" {`);
      lines.push(`  project = var.project_id`);
      lines.push(`  region  = "${region}"`);
      lines.push(`}`);
    } else if (provider === 'kubernetes') {
      lines.push(`provider "kubernetes" {`);
      lines.push(`  config_path = "~/.kube/config"`);
      lines.push(`}`);
    }
    lines.push('');

    // Variables
    if (variables.length > 0) {
      variables.forEach((v) => {
        lines.push(`variable "${v.name}" {`);
        lines.push(`  type        = ${v.type}`);
        if (v.default) lines.push(`  default     = "${v.default}"`);
        if (v.description) lines.push(`  description = "${v.description}"`);
        lines.push(`}`);
        lines.push('');
      });
    }

    // Resources
    resources.forEach((resource) => {
      const resourceType = getResourceTypeName(provider, resource.type);
      lines.push(`resource "${resourceType}" "${resource.name}" {`);
      Object.entries(resource.config).forEach(([key, value]) => {
        if (value.startsWith('[') || value === 'true' || value === 'false' || !isNaN(Number(value))) {
          lines.push(`  ${key} = ${value}`);
        } else {
          lines.push(`  ${key} = "${value}"`);
        }
      });
      lines.push('');
      lines.push('  tags = {');
      lines.push('    Name        = "${var.environment}-' + resource.name + '"');
      lines.push('    Environment = var.environment');
      lines.push('  }');
      lines.push(`}`);
      lines.push('');
    });

    return lines.join('\n');
  };

  const getResourceTypeName = (prov: Provider, type: ResourceType): string => {
    const map: Record<Provider, Record<ResourceType, string>> = {
      aws: {
        instance: 'aws_instance',
        bucket: 'aws_s3_bucket',
        database: 'aws_db_instance',
        vpc: 'aws_vpc',
        security_group: 'aws_security_group',
        load_balancer: 'aws_lb',
      },
      azure: {
        instance: 'azurerm_virtual_machine',
        bucket: 'azurerm_storage_account',
        database: 'azurerm_sql_database',
        vpc: 'azurerm_virtual_network',
        security_group: 'azurerm_network_security_group',
        load_balancer: 'azurerm_lb',
      },
      gcp: {
        instance: 'google_compute_instance',
        bucket: 'google_storage_bucket',
        database: 'google_sql_database_instance',
        vpc: 'google_compute_network',
        security_group: 'google_compute_firewall',
        load_balancer: 'google_compute_global_forwarding_rule',
      },
      kubernetes: {
        instance: 'kubernetes_deployment',
        bucket: 'kubernetes_persistent_volume_claim',
        database: 'kubernetes_stateful_set',
        vpc: 'kubernetes_namespace',
        security_group: 'kubernetes_network_policy',
        load_balancer: 'kubernetes_service',
      },
    };
    return map[prov][type];
  };

  const addResource = (type: ResourceType) => {
    const template = resourceTemplates[provider][type];
    setResources([
      ...resources,
      {
        id: generateId(),
        type,
        name: `my_${type}`,
        config: { ...template.config },
      },
    ]);
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(resources.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateHCL());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cloud className="w-6 h-6 text-purple-400" />
              Terraform HCL Generator
            </h1>
            <p className="text-gray-400 text-sm">Build Terraform configurations visually</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder */}
          <div className="space-y-4">
            {/* Provider Settings */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Provider</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {(['aws', 'azure', 'gcp', 'kubernetes'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setProvider(p);
                      setResources([]);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium uppercase ${
                      provider === p
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {provider !== 'kubernetes' && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>

            {/* Variables */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Variables</h3>
                <button
                  onClick={() =>
                    setVariables([...variables, { name: 'new_var', type: 'string', default: '' }])
                  }
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[i] = { ...newVars[i], name: e.target.value };
                        setVariables(newVars);
                      }}
                      className="w-28 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                      placeholder="Name"
                    />
                    <select
                      value={v.type}
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[i] = { ...newVars[i], type: e.target.value };
                        setVariables(newVars);
                      }}
                      className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="bool">bool</option>
                      <option value="list(string)">list</option>
                      <option value="map(string)">map</option>
                    </select>
                    <input
                      type="text"
                      value={v.default || ''}
                      onChange={(e) => {
                        const newVars = [...variables];
                        newVars[i] = { ...newVars[i], default: e.target.value };
                        setVariables(newVars);
                      }}
                      className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm"
                      placeholder="Default"
                    />
                    <button
                      onClick={() => setVariables(variables.filter((_, idx) => idx !== i))}
                      className="p-1.5 hover:bg-gray-800 rounded text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Resources */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Add Resource</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(resourceTemplates[provider]) as ResourceType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => addResource(type)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm"
                  >
                    {resourceTemplates[provider][type].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources */}
            {resources.map((resource) => (
              <div key={resource.id} className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-400">
                      {resourceTemplates[provider][resource.type].label}
                    </span>
                    <input
                      type="text"
                      value={resource.name}
                      onChange={(e) => updateResource(resource.id, { name: e.target.value })}
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeResource(resource.id)}
                    className="p-1 hover:bg-gray-800 rounded text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(resource.config).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-28">{key}</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          updateResource(resource.id, {
                            config: { ...resource.config, [key]: e.target.value },
                          })
                        }
                        className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">main.tf</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-purple-400 overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre">
                {generateHCL()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
