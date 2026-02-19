import { useState, useEffect, useCallback, useRef } from 'react';
import { Code2, Download, Loader2, RefreshCw, Search, Star, History, Keyboard, Layers, ArrowLeftRight, Code, Wand2, Settings2 } from 'lucide-react';
import ModuleSelector from './components/ModuleSelector';
import TemplateTypeSelector from './components/TemplateTypeSelector';
import EntityForm from './components/EntityForm';
import FolderStructure from './components/FolderStructure';
import TemplatePreview from './components/TemplatePreview';
import ThemeToggle from './components/ThemeToggle';
import SearchModal from './components/SearchModal';
import FavoritesPanel from './components/FavoritesPanel';
import HistoryPanel from './components/HistoryPanel';
import CodeEditor from './components/CodeEditor';
import ShortcutsModal from './components/ShortcutsModal';
import CollapsibleSection from './components/CollapsibleSection';
import TagFilter, { MODULE_TAGS } from './components/TagFilter';
import CodeStats from './components/CodeStats';
import QuickActions from './components/QuickActions';
import ProjectPresets, { PRESETS } from './components/ProjectPresets';
import DependencySuggestions from './components/DependencySuggestions';
import SnippetLibrary from './components/SnippetLibrary';
import TemplateCompareModal from './components/TemplateCompareModal';
import MultiModuleSelector from './components/MultiModuleSelector';
import BatchGenerator from './components/BatchGenerator';
import { ToastContainer } from './components/Toast';
import { modules, getTemplateTypes, generateTemplates } from './templates';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardShortcuts, SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { useTheme } from './context/ThemeContext';
import JSZip from 'jszip';

export default function App() {
  // Core state
  const [selectedModule, setSelectedModule] = useState(null);
  const [templateTypes, setTemplateTypes] = useState([]);
  const [selectedTemplateTypes, setSelectedTemplateTypes] = useState([]);
  const [className, setClassName] = useState('Example');
  const [packageName, setPackageName] = useState('com.example');
  const [generatedResponse, setGeneratedResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced features state
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [history, setHistory] = useLocalStorage('generationHistory', []);
  const [snippets, setSnippets] = useLocalStorage('snippets', []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [multiModuleMode, setMultiModuleMode] = useState(false);
  const [multiModuleSelection, setMultiModuleSelection] = useState({});

  // Modal states
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [snippetLibraryOpen, setSnippetLibraryOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Theme
  const { toggleTheme } = useTheme();

  // Toast helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initialize default module
  useEffect(() => {
    if (modules.length > 0) {
      const chatbotModule = modules.find(m => m.module === 'CHATBOT');
      setSelectedModule(chatbotModule ? 'CHATBOT' : modules[0].module);
    }
  }, []);

  // Update template types when module changes
  useEffect(() => {
    if (selectedModule) {
      const types = getTemplateTypes(selectedModule);
      setTemplateTypes(types);
      if (types.length > 0) {
        setSelectedTemplateTypes([types[0].type]);
      }
    }
  }, [selectedModule]);

  // Filter modules by tags
  const filteredModules = selectedTags.length > 0
    ? modules.filter(mod => {
        const moduleTags = MODULE_TAGS[mod.module] || [];
        return selectedTags.some(tag => moduleTags.includes(tag));
      })
    : modules;

  // Handlers
  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedTemplateTypes([]);
    setGeneratedResponse(null);
  };

  const handleTemplateTypeToggle = (type) => {
    setSelectedTemplateTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleGenerate = useCallback(() => {
    if (multiModuleMode) {
      // Multi-module generation
      const allTemplates = [];
      const allFolderStructure = {};

      Object.entries(multiModuleSelection).forEach(([moduleName, types]) => {
        if (types.length > 0) {
          const response = generateTemplates(moduleName, types, className, packageName);
          allTemplates.push(...response.templates);
          Object.assign(allFolderStructure, response.folderStructure);
        }
      });

      if (allTemplates.length === 0) {
        setError('Please select at least one template');
        return;
      }

      setGeneratedResponse({
        module: 'MULTI',
        className,
        packageName,
        templates: allTemplates,
        folderStructure: allFolderStructure
      });

      showToast(`Generated ${allTemplates.length} template(s) from multiple modules`, 'success');
    } else {
      // Single module generation
      if (!selectedModule || !className || selectedTemplateTypes.length === 0) {
        setError('Please select at least one template type');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = generateTemplates(
          selectedModule,
          selectedTemplateTypes,
          className,
          packageName
        );
        setGeneratedResponse(response);

        // Add to history
        const historyItem = {
          id: Date.now(),
          module: selectedModule,
          templateTypes: selectedTemplateTypes,
          className,
          packageName,
          templateCount: response.templates.length,
          timestamp: Date.now()
        };
        setHistory(prev => [historyItem, ...prev.slice(0, 19)]);

        showToast(`Generated ${response.templates.length} template(s)`, 'success');
      } catch (err) {
        setError('Failed to generate templates: ' + err.message);
        showToast('Failed to generate templates', 'error');
      } finally {
        setLoading(false);
      }
    }
  }, [selectedModule, selectedTemplateTypes, className, packageName, multiModuleMode, multiModuleSelection, setHistory, showToast]);

  const handleExport = async () => {
    if (!generatedResponse || !generatedResponse.templates) return;

    setExporting(true);
    try {
      const zip = new JSZip();
      const baseFolder = packageName.replace(/\./g, '/');

      generatedResponse.templates.forEach((template) => {
        const folderPath = template.packagePath
          ? template.packagePath.replace(/\./g, '/')
          : baseFolder;
        const filePath = `${folderPath}/${template.fileName}`;
        zip.file(filePath, template.code);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${className}-templates.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Templates exported successfully', 'success');
    } catch (err) {
      setError('Failed to export templates: ' + err.message);
      showToast('Failed to export templates', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Favorites handlers
  const handleToggleFavorite = useCallback((templateId) => {
    setFavorites(prev => {
      if (prev.includes(templateId)) {
        showToast('Removed from favorites', 'info');
        return prev.filter(id => id !== templateId);
      } else {
        showToast('Added to favorites', 'success');
        return [...prev, templateId];
      }
    });
  }, [setFavorites, showToast]);

  // History handlers
  const handleRestoreHistory = useCallback((item) => {
    setSelectedModule(item.module);
    setClassName(item.className);
    setPackageName(item.packageName);
    setTimeout(() => {
      setSelectedTemplateTypes(item.templateTypes);
    }, 100);
    showToast('Configuration restored', 'success');
  }, [showToast]);

  const handleDeleteHistory = useCallback((id) => {
    setHistory(prev => prev.filter((item, index) => (item.id || index) !== id));
    showToast('History item deleted', 'info');
  }, [setHistory, showToast]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    showToast('History cleared', 'info');
  }, [setHistory, showToast]);

  // Search handler
  const handleSelectFromSearch = useCallback((module, type) => {
    setSelectedModule(module);
    setTimeout(() => {
      setSelectedTemplateTypes([type]);
    }, 100);
  }, []);

  // Code editor handlers
  const handleEditTemplate = useCallback((template) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  }, []);

  const handleSaveTemplate = useCallback((updatedTemplate) => {
    if (!generatedResponse) return;
    setGeneratedResponse(prev => ({
      ...prev,
      templates: prev.templates.map(t =>
        t.fileName === updatedTemplate.fileName ? updatedTemplate : t
      )
    }));
    showToast('Template updated', 'success');
  }, [generatedResponse, showToast]);

  // Tag handlers
  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Preset handler
  const handleSelectPreset = useCallback((preset) => {
    setMultiModuleMode(true);
    setMultiModuleSelection(preset.config.templates);
    showToast(`Loaded "${preset.name}" preset`, 'success');
  }, [showToast]);

  // Add suggested template
  const handleAddSuggestedTemplate = useCallback((module, type) => {
    if (module === selectedModule) {
      if (!selectedTemplateTypes.includes(type)) {
        setSelectedTemplateTypes(prev => [...prev, type]);
        showToast('Template added', 'success');
      }
    } else {
      setSelectedModule(module);
      setTimeout(() => {
        setSelectedTemplateTypes([type]);
      }, 100);
      showToast('Switched module and added template', 'success');
    }
  }, [selectedModule, selectedTemplateTypes, showToast]);

  // Snippet handlers
  const handleSaveSnippet = useCallback((snippet) => {
    setSnippets(prev => [...prev, snippet]);
    showToast('Snippet saved', 'success');
  }, [setSnippets, showToast]);

  const handleDeleteSnippet = useCallback((id) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
    showToast('Snippet deleted', 'info');
  }, [setSnippets, showToast]);

  // Export/Import settings
  const handleExportSettings = useCallback(() => {
    const settings = {
      selectedModule,
      selectedTemplateTypes,
      className,
      packageName,
      favorites,
      multiModuleSelection,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `java-generator-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Configuration exported', 'success');
  }, [selectedModule, selectedTemplateTypes, className, packageName, favorites, multiModuleSelection, showToast]);

  const handleImportSettings = useCallback((settings) => {
    if (settings.selectedModule) setSelectedModule(settings.selectedModule);
    if (settings.className) setClassName(settings.className);
    if (settings.packageName) setPackageName(settings.packageName);
    if (settings.favorites) setFavorites(settings.favorites);
    if (settings.multiModuleSelection) {
      setMultiModuleSelection(settings.multiModuleSelection);
      setMultiModuleMode(true);
    }
    setTimeout(() => {
      if (settings.selectedTemplateTypes) setSelectedTemplateTypes(settings.selectedTemplateTypes);
    }, 100);
    showToast('Configuration imported', 'success');
  }, [setFavorites, showToast]);

  // Batch generation
  const handleBatchGenerate = useCallback((entities) => {
    const allTemplates = [];
    const allFolderStructure = {};

    entities.forEach(entity => {
      const response = generateTemplates(
        selectedModule,
        selectedTemplateTypes,
        entity.className,
        entity.packageName
      );
      allTemplates.push(...response.templates);
      Object.assign(allFolderStructure, response.folderStructure);
    });

    setGeneratedResponse({
      module: selectedModule,
      className: 'Batch',
      packageName,
      templates: allTemplates,
      folderStructure: allFolderStructure
    });

    showToast(`Generated ${allTemplates.length} templates for ${entities.length} entities`, 'success');
  }, [selectedModule, selectedTemplateTypes, packageName, showToast]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { ...SHORTCUTS.GENERATE, action: () => { if (!loading) handleGenerate(); } },
    { ...SHORTCUTS.EXPORT, action: () => { if (!exporting && generatedResponse) handleExport(); } },
    { ...SHORTCUTS.SEARCH, action: () => setSearchOpen(true) },
    { ...SHORTCUTS.TOGGLE_THEME, action: toggleTheme },
    { ...SHORTCUTS.HELP, action: () => setShortcutsOpen(true) },
    { ...SHORTCUTS.ESCAPE, action: () => {
      setSearchOpen(false); setFavoritesOpen(false); setHistoryOpen(false);
      setShortcutsOpen(false); setEditorOpen(false); setSnippetLibraryOpen(false);
      setCompareOpen(false); setBatchOpen(false);
    }}
  ], [loading, exporting, generatedResponse, handleGenerate, toggleTheme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Java Code Generator
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Java 21 + Spring Boot 3.5.4
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200
                         dark:hover:bg-slate-600 transition-colors"
                title="Search (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden md:inline kbd text-xs">Ctrl+K</kbd>
              </button>

              {/* Compare */}
              <button
                onClick={() => setCompareOpen(true)}
                className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                         rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title="Compare Templates"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>

              {/* Snippets */}
              <button
                onClick={() => setSnippetLibraryOpen(true)}
                className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                         rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title="Snippet Library"
              >
                <Code className="w-5 h-5" />
              </button>

              {/* Favorites */}
              <button
                onClick={() => setFavoritesOpen(true)}
                className="relative p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                         rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title="Favorites"
              >
                <Star className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white
                                 text-xs rounded-full flex items-center justify-center">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </button>

              {/* History */}
              <button
                onClick={() => setHistoryOpen(true)}
                className="relative p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                         rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title="History"
              >
                <History className="w-5 h-5" />
                {history.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white
                                 text-xs rounded-full flex items-center justify-center">
                    {history.length > 9 ? '9+' : history.length}
                  </span>
                )}
              </button>

              {/* Shortcuts */}
              <button
                onClick={() => setShortcutsOpen(true)}
                className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                         rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                title="Shortcuts (Ctrl+/)"
              >
                <Keyboard className="w-5 h-5" />
              </button>

              {/* Theme */}
              <ThemeToggle />

              {/* Batch */}
              <button
                onClick={() => setBatchOpen(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white
                         rounded-lg hover:bg-purple-700 transition-colors"
                title="Batch Generation"
              >
                <Wand2 className="w-4 h-4" />
                <span className="hidden sm:inline">Batch</span>
              </button>

              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                         hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
                title="Generate (Ctrl+G)"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Generate
              </button>

              {/* Export */}
              {generatedResponse && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg
                           hover:bg-green-700 disabled:opacity-50 transition-colors"
                  title="Export (Ctrl+E)"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Export
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800
                        text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-xl">&times;</button>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <QuickActions
            templates={generatedResponse?.templates}
            onCopyAll={() => showToast('All code copied to clipboard', 'success')}
            onExportSettings={handleExportSettings}
            onImportSettings={handleImportSettings}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Configuration */}
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMultiModuleMode(false)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    !multiModuleMode
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Single Module
                </button>
                <button
                  onClick={() => setMultiModuleMode(true)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    multiModuleMode
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Multi-Module
                </button>
              </div>
            </div>

            {/* Project Presets */}
            <CollapsibleSection title="Quick Start Presets" icon={Layers} defaultOpen={false}>
              <ProjectPresets onSelectPreset={handleSelectPreset} />
            </CollapsibleSection>

            {/* Tag Filter */}
            <CollapsibleSection title="Filter by Tags" defaultOpen={false}>
              <TagFilter
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearTags={() => setSelectedTags([])}
              />
            </CollapsibleSection>

            {/* Configuration */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Configuration
              </h2>

              <div className="space-y-6">
                {multiModuleMode ? (
                  <MultiModuleSelector
                    selectedTemplates={multiModuleSelection}
                    onSelectionChange={setMultiModuleSelection}
                  />
                ) : (
                  <>
                    <ModuleSelector
                      modules={filteredModules}
                      selected={selectedModule}
                      onSelect={handleModuleSelect}
                    />

                    <TemplateTypeSelector
                      templateTypes={templateTypes}
                      selected={selectedTemplateTypes}
                      onToggle={handleTemplateTypeToggle}
                      selectedModule={selectedModule}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </>
                )}

                <EntityForm
                  entityName={className}
                  packageName={packageName}
                  onEntityChange={setClassName}
                  onPackageChange={setPackageName}
                />
              </div>
            </div>

            {/* Dependency Suggestions */}
            {!multiModuleMode && selectedTemplateTypes.length > 0 && (
              <DependencySuggestions
                selectedModule={selectedModule}
                selectedTemplateTypes={selectedTemplateTypes}
                onAddTemplate={handleAddSuggestedTemplate}
              />
            )}

            {/* Code Statistics */}
            {generatedResponse?.templates && (
              <CodeStats templates={generatedResponse.templates} />
            )}

            {/* Folder structure */}
            {generatedResponse && (
              <FolderStructure structure={generatedResponse.folderStructure} />
            )}
          </div>

          {/* Right panel - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200
                          dark:border-slate-700 p-4 min-h-[600px] transition-colors">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Template Preview
              </h2>
              <TemplatePreview
                templates={generatedResponse?.templates}
                onEditTemplate={handleEditTemplate}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                selectedModule={selectedModule}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Java Code Generator - Production-ready Java 21 + Spring Boot 3.5.4 templates
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
              <span>{modules.length} modules</span>
              <span>•</span>
              <span>60+ templates</span>
              <span>•</span>
              <span>Press <kbd className="kbd">Ctrl+/</kbd> for shortcuts</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTemplate={handleSelectFromSearch}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />

      <FavoritesPanel
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleToggleFavorite}
        onSelectFavorite={handleSelectFromSearch}
      />

      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onRestoreHistory={handleRestoreHistory}
        onDeleteHistory={handleDeleteHistory}
        onClearHistory={handleClearHistory}
      />

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <CodeEditor
        isOpen={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingTemplate(null); }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />

      <SnippetLibrary
        isOpen={snippetLibraryOpen}
        onClose={() => setSnippetLibraryOpen(false)}
        snippets={snippets}
        onSaveSnippet={handleSaveSnippet}
        onDeleteSnippet={handleDeleteSnippet}
      />

      <TemplateCompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
      />

      <BatchGenerator
        isOpen={batchOpen}
        onClose={() => setBatchOpen(false)}
        onGenerate={handleBatchGenerate}
        selectedModule={selectedModule}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
