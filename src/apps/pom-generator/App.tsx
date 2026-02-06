import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Package, Plus, Trash2, Search } from 'lucide-react';

interface Dependency {
  id: string;
  groupId: string;
  artifactId: string;
  version: string;
  scope?: string;
}

interface Plugin {
  id: string;
  groupId: string;
  artifactId: string;
  version: string;
}

const popularDependencies = [
  { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-web', version: '3.2.0' },
  { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-data-jpa', version: '3.2.0' },
  { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-security', version: '3.2.0' },
  { groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-test', version: '3.2.0', scope: 'test' },
  { groupId: 'org.postgresql', artifactId: 'postgresql', version: '42.7.1', scope: 'runtime' },
  { groupId: 'com.mysql', artifactId: 'mysql-connector-j', version: '8.2.0', scope: 'runtime' },
  { groupId: 'org.projectlombok', artifactId: 'lombok', version: '1.18.30', scope: 'provided' },
  { groupId: 'org.mapstruct', artifactId: 'mapstruct', version: '1.5.5.Final' },
  { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-api', version: '0.12.3' },
  { groupId: 'org.springdoc', artifactId: 'springdoc-openapi-starter-webmvc-ui', version: '2.3.0' },
  { groupId: 'com.h2database', artifactId: 'h2', version: '2.2.224', scope: 'test' },
  { groupId: 'org.junit.jupiter', artifactId: 'junit-jupiter', version: '5.10.1', scope: 'test' },
  { groupId: 'org.mockito', artifactId: 'mockito-core', version: '5.8.0', scope: 'test' },
  { groupId: 'com.fasterxml.jackson.core', artifactId: 'jackson-databind', version: '2.16.0' },
  { groupId: 'org.apache.commons', artifactId: 'commons-lang3', version: '3.14.0' },
  { groupId: 'com.google.guava', artifactId: 'guava', version: '32.1.3-jre' },
  { groupId: 'org.slf4j', artifactId: 'slf4j-api', version: '2.0.9' },
  { groupId: 'org.neo4j.driver', artifactId: 'neo4j-java-driver', version: '5.15.0' },
  { groupId: 'co.elastic.clients', artifactId: 'elasticsearch-java', version: '8.11.2' },
  { groupId: 'org.flywaydb', artifactId: 'flyway-core', version: '10.4.1' },
];

export default function PomGenerator() {
  const [groupId, setGroupId] = useState('com.example');
  const [artifactId, setArtifactId] = useState('myapp');
  const [version, setVersion] = useState('1.0.0-SNAPSHOT');
  const [name, setName] = useState('My Application');
  const [description, setDescription] = useState('Demo project for Spring Boot');
  const [javaVersion, setJavaVersion] = useState('17');
  const [packaging, setPackaging] = useState('jar');
  const [parentVersion, setParentVersion] = useState('3.2.0');
  const [dependencies, setDependencies] = useState<Dependency[]>([
    { id: '1', groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-web', version: '' },
    { id: '2', groupId: 'org.projectlombok', artifactId: 'lombok', version: '', scope: 'provided' },
    { id: '3', groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-test', version: '', scope: 'test' },
  ]);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const generatePom = (): string => {
    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<project xmlns="http://maven.apache.org/POM/4.0.0"');
    lines.push('         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
    lines.push('         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0');
    lines.push('         https://maven.apache.org/xsd/maven-4.0.0.xsd">');
    lines.push('    <modelVersion>4.0.0</modelVersion>');
    lines.push('');
    lines.push('    <parent>');
    lines.push('        <groupId>org.springframework.boot</groupId>');
    lines.push('        <artifactId>spring-boot-starter-parent</artifactId>');
    lines.push(`        <version>${parentVersion}</version>`);
    lines.push('        <relativePath/>');
    lines.push('    </parent>');
    lines.push('');
    lines.push(`    <groupId>${groupId}</groupId>`);
    lines.push(`    <artifactId>${artifactId}</artifactId>`);
    lines.push(`    <version>${version}</version>`);
    lines.push(`    <packaging>${packaging}</packaging>`);
    lines.push('');
    lines.push(`    <name>${name}</name>`);
    lines.push(`    <description>${description}</description>`);
    lines.push('');
    lines.push('    <properties>');
    lines.push(`        <java.version>${javaVersion}</java.version>`);
    lines.push('    </properties>');
    lines.push('');
    lines.push('    <dependencies>');

    dependencies.forEach((dep) => {
      lines.push('        <dependency>');
      lines.push(`            <groupId>${dep.groupId}</groupId>`);
      lines.push(`            <artifactId>${dep.artifactId}</artifactId>`);
      if (dep.version) {
        lines.push(`            <version>${dep.version}</version>`);
      }
      if (dep.scope) {
        lines.push(`            <scope>${dep.scope}</scope>`);
      }
      lines.push('        </dependency>');
    });

    lines.push('    </dependencies>');
    lines.push('');
    lines.push('    <build>');
    lines.push('        <plugins>');
    lines.push('            <plugin>');
    lines.push('                <groupId>org.springframework.boot</groupId>');
    lines.push('                <artifactId>spring-boot-maven-plugin</artifactId>');
    lines.push('                <configuration>');
    lines.push('                    <excludes>');
    lines.push('                        <exclude>');
    lines.push('                            <groupId>org.projectlombok</groupId>');
    lines.push('                            <artifactId>lombok</artifactId>');
    lines.push('                        </exclude>');
    lines.push('                    </excludes>');
    lines.push('                </configuration>');
    lines.push('            </plugin>');
    lines.push('        </plugins>');
    lines.push('    </build>');
    lines.push('');
    lines.push('</project>');

    return lines.join('\n');
  };

  const addDependency = (dep?: typeof popularDependencies[0]) => {
    setDependencies([
      ...dependencies,
      {
        id: generateId(),
        groupId: dep?.groupId || '',
        artifactId: dep?.artifactId || '',
        version: dep?.version || '',
        scope: dep?.scope,
      },
    ]);
  };

  const updateDependency = (id: string, updates: Partial<Dependency>) => {
    setDependencies(dependencies.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const removeDependency = (id: string) => {
    setDependencies(dependencies.filter((d) => d.id !== id));
  };

  const filteredDependencies = popularDependencies.filter(
    (d) =>
      d.artifactId.toLowerCase().includes(search.toLowerCase()) ||
      d.groupId.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatePom());
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
              <Package className="w-6 h-6 text-red-400" />
              Maven pom.xml Generator
            </h1>
            <p className="text-gray-400 text-sm">Generate Maven project configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder */}
          <div className="space-y-4">
            {/* Project Info */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Project Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Group ID</label>
                  <input
                    type="text"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Artifact ID</label>
                  <input
                    type="text"
                    value={artifactId}
                    onChange={(e) => setArtifactId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Java Version</label>
                  <select
                    value={javaVersion}
                    onChange={(e) => setJavaVersion(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  >
                    <option value="21">21</option>
                    <option value="17">17</option>
                    <option value="11">11</option>
                    <option value="8">8</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Quick Add Dependencies */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Add Dependencies</h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dependencies..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {filteredDependencies.map((dep) => (
                  <button
                    key={dep.artifactId}
                    onClick={() => addDependency(dep)}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
                    title={`${dep.groupId}:${dep.artifactId}`}
                  >
                    {dep.artifactId}
                  </button>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Dependencies ({dependencies.length})</h3>
                <button
                  onClick={() => addDependency()}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  <Plus className="w-3 h-3" /> Add Custom
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dependencies.map((dep) => (
                  <div key={dep.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                    <input
                      type="text"
                      value={dep.groupId}
                      onChange={(e) => updateDependency(dep.id, { groupId: e.target.value })}
                      className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs"
                      placeholder="groupId"
                    />
                    <input
                      type="text"
                      value={dep.artifactId}
                      onChange={(e) => updateDependency(dep.id, { artifactId: e.target.value })}
                      className="flex-1 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs"
                      placeholder="artifactId"
                    />
                    <select
                      value={dep.scope || ''}
                      onChange={(e) => updateDependency(dep.id, { scope: e.target.value || undefined })}
                      className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs"
                    >
                      <option value="">compile</option>
                      <option value="provided">provided</option>
                      <option value="runtime">runtime</option>
                      <option value="test">test</option>
                    </select>
                    <button
                      onClick={() => removeDependency(dep.id)}
                      className="p-1 hover:bg-gray-700 rounded text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">pom.xml</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 bg-gray-950 rounded-lg text-xs font-mono text-red-400 overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre">
                {generatePom()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
