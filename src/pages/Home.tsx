import { Link } from 'react-router-dom';
import {
  Map as MapIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  ArrowRight,
  Layers,
  Database,
  Palette,
  Grid3X3,
} from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
  features: string[];
  to: string;
}

const ToolCard = ({ title, description, icon, bgGradient, features, to }: ToolCardProps) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-gray-600/50"
  >
    {/* Gradient background on hover */}
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${bgGradient}`}
    />

    <div className="relative z-10">
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${bgGradient} mb-4`}
      >
        {icon}
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{description}</p>

      {/* Features */}
      <ul className="space-y-1.5 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-500 text-xs">
            <div className="w-1 h-1 rounded-full bg-gray-600" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Launch button */}
      <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
        <span>Launch Tool</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  </Link>
);

const tools: ToolCardProps[] = [
  {
    title: 'ArcGIS Map Builder',
    description:
      'Visual builder for creating ArcGIS mapping applications with layer management, widgets, and code generation.',
    icon: <MapIcon className="w-7 h-7 text-white" />,
    bgGradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    features: [
      'Layer management (Feature, WMS, GeoJSON, Vector Tile)',
      'Widget configuration (Legend, Scale, Compass)',
      'Graphics & drawing tools',
      'Popup template designer',
      'Export generated React code',
    ],
    to: '/arcgis-map',
  },
  {
    title: 'Elasticsearch Query Designer',
    description:
      'Sophisticated visual query builder for Elasticsearch with aggregations, filters, and live results preview.',
    icon: <SearchIcon className="w-7 h-7 text-white" />,
    bgGradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    features: [
      'Visual filter builder with boolean logic',
      'Multiple aggregation types (terms, histogram, geo)',
      'Sub-aggregation support',
      'Geospatial query support',
      'Real-time JSON preview',
    ],
    to: '/es-query',
  },
  {
    title: 'Icon Generator Pro',
    description:
      'Professional icon customization tool supporting 11+ icon libraries with color variants, shapes, and batch exports.',
    icon: <ImageIcon className="w-7 h-7 text-white" />,
    bgGradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
    features: [
      '15,000+ icons from 11+ libraries',
      'Custom shapes (circle, hexagon, shield)',
      'Gradient and glow effects',
      'Up to 50 color variants',
      'Batch export to ZIP',
    ],
    to: '/icons-generator',
  },
  {
    title: 'React Visual Builder',
    description:
      'Drag-and-drop React component builder with Material-UI components and live code generation.',
    icon: <CodeIcon className="w-7 h-7 text-white" />,
    bgGradient: 'bg-gradient-to-br from-orange-500 to-red-600',
    features: [
      'Drag-and-drop MUI components',
      'Hierarchical component nesting',
      'Real-time properties editor',
      'TSX, JSX, and jQuery output',
      'Component tree visualization',
    ],
    to: '/visual-builder',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-400 text-sm mb-6">
            <Grid3X3 className="w-4 h-4" />
            <span>Developer Tools Suite</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Dev Tools{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Hub
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            A collection of powerful visual development tools for building GIS applications,
            designing database queries, customizing icons, and composing React components.
          </p>
        </header>

        {/* Stats */}
        <div className="flex justify-center gap-12 mb-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-bold text-white">4</span>
            </div>
            <span className="text-gray-500 text-sm">Tools</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">15K+</span>
            </div>
            <span className="text-gray-500 text-sm">Icons</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Palette className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">50+</span>
            </div>
            <span className="text-gray-500 text-sm">MUI Components</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CodeIcon className="w-5 h-5 text-orange-400" />
              <span className="text-2xl font-bold text-white">React 19</span>
            </div>
            <span className="text-gray-500 text-sm">Powered</span>
          </div>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.to} {...tool} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>Built with React, TypeScript, Vite, and Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}
