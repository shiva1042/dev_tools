import { Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import JavaApp from './JavaApp';
import './index.css';

export default function JavaCodeGenerator() {
  return (
    <ThemeProvider>
      <div className="relative">
        {/* Home navigation */}
        <Link
          to="/"
          className="fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium backdrop-blur-sm border border-gray-700/50 transition-all shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </Link>
        <JavaApp />
      </div>
    </ThemeProvider>
  );
}
