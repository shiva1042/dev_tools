import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// Lazy load the apps for better performance
const ArcGISMapApp = lazy(() => import('./apps/arcgis-map/App'));
const ESQueryApp = lazy(() => import('./apps/es-query/App'));
const IconsGeneratorApp = lazy(() => import('./apps/icons-generator/App'));
const VisualBuilderApp = lazy(() => import('./apps/visual-builder/App'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-400 text-lg">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/arcgis-map/*" element={<ArcGISMapApp />} />
        <Route path="/es-query/*" element={<ESQueryApp />} />
        <Route path="/icons-generator/*" element={<IconsGeneratorApp />} />
        <Route path="/visual-builder/*" element={<VisualBuilderApp />} />
      </Routes>
    </Suspense>
  );
}

export default App;
