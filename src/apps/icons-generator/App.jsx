import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Icons, { ICON_LIBRARIES, getTotalIconCount } from "./icons.jsx";
import IconRenderer from "./IconRenderer.jsx";
import { SHAPES, SHAPE_NAMES, GRADIENT_PRESETS } from "./BackgroundShapes.jsx";
import { toPng, toSvg } from "html-to-image";
import JSZip from "jszip";
import { createRoot } from "react-dom/client";
import "./styles.css";

// Pagination config
const ICONS_PER_PAGE = 100;
const MAX_VARIANTS = 50;

// Color palette presets for quick variant generation
const COLOR_PRESETS = {
  rainbow: { name: "Rainbow", colors: ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"] },
  pastel: { name: "Pastel", colors: ["#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#e0bbff"] },
  ocean: { name: "Ocean Blues", colors: ["#03045e", "#023e8a", "#0077b6", "#0096c7", "#00b4d8", "#48cae4", "#90e0ef"] },
  forest: { name: "Forest", colors: ["#1b4332", "#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2"] },
  sunset: { name: "Sunset", colors: ["#03071e", "#370617", "#6a040f", "#9d0208", "#d00000", "#dc2f02", "#e85d04", "#f48c06", "#faa307", "#ffba08"] },
  monochrome: { name: "Monochrome", colors: ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff"] },
  neon: { name: "Neon", colors: ["#ff00ff", "#00ffff", "#ff00aa", "#00ff00", "#ffff00", "#ff6600"] },
  earth: { name: "Earth Tones", colors: ["#582f0e", "#7f4f24", "#936639", "#a68a64", "#b6ad90", "#c2c5aa"] },
  berry: { name: "Berry", colors: ["#4a0a77", "#6818a5", "#8b2fc9", "#ab51e3", "#c879f9", "#e0a8ff"] },
  fire: { name: "Fire", colors: ["#7b2d26", "#a13d2d", "#c74e31", "#e86a3f", "#f7934c", "#ffc15e"] },
  ice: { name: "Ice", colors: ["#caf0f8", "#90e0ef", "#00b4d8", "#0077b6", "#03045e"] },
  candy: { name: "Candy", colors: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd"] },
  vintage: { name: "Vintage", colors: ["#463730", "#8b7355", "#c4a77d", "#d4c5a9", "#e3d5ca", "#f5ebe0"] },
  cyberpunk: { name: "Cyberpunk", colors: ["#0d0221", "#0f084b", "#26408b", "#3d6cb9", "#86bbd8", "#f72585", "#b5179e"] },
  brand: { name: "Brand Colors", colors: ["#1877f2", "#1da1f2", "#ff0000", "#ff4500", "#0077b5", "#25d366", "#7289da"] },
};

// Quick style templates
const STYLE_TEMPLATES = [
  { name: "iOS App Icon", shape: "roundedSquare", gradient: "None", shapeColor: "#007aff", iconColor: "#ffffff", padding: 25 },
  { name: "Android Icon", shape: "circle", gradient: "None", shapeColor: "#4caf50", iconColor: "#ffffff", padding: 22 },
  { name: "Badge", shape: "circle", gradient: "Sunset", shapeColor: "#ff6b6b", iconColor: "#ffffff", padding: 20 },
  { name: "Shield", shape: "shield", gradient: "Ocean", shapeColor: "#0077b6", iconColor: "#ffffff", padding: 25 },
  { name: "Hexagon Tech", shape: "hexagon", gradient: "Cyberpunk", shapeColor: "#7209b7", iconColor: "#00ffff", padding: 22 },
  { name: "Star Badge", shape: "star", gradient: "Gold", shapeColor: "#ffd700", iconColor: "#1a1a1a", padding: 30 },
  { name: "Minimalist", shape: "none", gradient: "None", shapeColor: "#ffffff", iconColor: "#1a1a1a", padding: 20 },
  { name: "Neon Glow", shape: "circle", gradient: "Neon", shapeColor: "#ff00ff", iconColor: "#00ffff", padding: 20, shadow: 15 },
  { name: "Glass", shape: "roundedSquare", gradient: "Ice", shapeColor: "#90e0ef", iconColor: "#03045e", padding: 22, opacity: 0.8 },
  { name: "Discord Style", shape: "squircle", gradient: "None", shapeColor: "#5865f2", iconColor: "#ffffff", padding: 24 },
];

export default function App() {
  // Theme
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("icongen-theme") || "dark"
  );

  // Search and filter
  const [query, setQuery] = useState("");
  const [libraryFilter, setLibraryFilter] = useState("All Libraries");
  const [page, setPage] = useState(0);

  // Selected icon
  const [activeIcon, setActiveIcon] = useState(null);

  // Icon customization
  const [size, setSize] = useState(128);
  const [weight, setWeight] = useState("regular");

  // Color system - increased max to 50
  const [colorCount, setColorCount] = useState(1);
  const [colors, setColors] = useState(["#ffffff"]);
  const [colorPreset, setColorPreset] = useState("");

  // Icon effects
  const [iconGlow, setIconGlow] = useState(0);
  const [iconGlowColor, setIconGlowColor] = useState("#ffffff");
  const [iconOpacity, setIconOpacity] = useState(1);

  // Background shape
  const [shape, setShape] = useState("none");
  const [shapeColor, setShapeColor] = useState("#3b82f6");
  const [shapeGradientPreset, setShapeGradientPreset] = useState("None");
  const [shapeGradientDirection, setShapeGradientDirection] = useState("to bottom");
  const [shapeBorderColor, setShapeBorderColor] = useState("#1e40af");
  const [shapeBorderWidth, setShapeBorderWidth] = useState(0);
  const [shapeShadowColor, setShapeShadowColor] = useState("#000000");
  const [shapeShadowBlur, setShapeShadowBlur] = useState(0);
  const [shapeRotation, setShapeRotation] = useState(0);
  const [shapeOpacity, setShapeOpacity] = useState(1);

  // Icon adjustments
  const [iconPadding, setIconPadding] = useState(20);
  const [iconRotation, setIconRotation] = useState(0);

  // Preview background
  const [previewBg, setPreviewBg] = useState("transparent");

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("icongen-favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);

  // Recent icons
  const [recentIcons, setRecentIcons] = useState(() => {
    const saved = localStorage.getItem("icongen-recent");
    return saved ? JSON.parse(saved) : [];
  });
  const [showRecent, setShowRecent] = useState(false);

  // Export progress
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Toast notification
  const [toast, setToast] = useState(null);

  // Refs
  const iconRef = useRef(null);
  const previewRef = useRef(null);
  const searchInputRef = useRef(null);

  // Show toast
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("icongen-theme", theme);
    document.body.className = theme;
  }, [theme]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem("icongen-favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Save recent icons
  useEffect(() => {
    localStorage.setItem("icongen-recent", JSON.stringify(recentIcons));
  }, [recentIcons]);

  // Add to recent when icon is selected
  useEffect(() => {
    if (activeIcon) {
      setRecentIcons(prev => {
        const filtered = prev.filter(i => i !== activeIcon);
        return [activeIcon, ...filtered].slice(0, 20);
      });
    }
  }, [activeIcon]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K = Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl/Cmd + D = Download PNG
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && activeIcon) {
        e.preventDefault();
        downloadSingle("png");
      }
      // Ctrl/Cmd + Shift + D = Download SVG
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D" && activeIcon) {
        e.preventDefault();
        downloadSingle("svg");
      }
      // Ctrl/Cmd + C = Copy to clipboard
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && activeIcon && !window.getSelection()?.toString()) {
        e.preventDefault();
        copyToClipboard();
      }
      // R = Random icon
      if (e.key === "r" && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        selectRandomIcon();
      }
      // Arrow keys for navigation
      if (e.key === "ArrowLeft" && page > 0) {
        setPage(p => p - 1);
      }
      if (e.key === "ArrowRight" && page < totalPages - 1) {
        setPage(p => p + 1);
      }
      // Escape = Clear search
      if (e.key === "Escape") {
        setQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIcon, page]);

  // Get gradient colors from preset
  const shapeGradient = useMemo(() => {
    const preset = GRADIENT_PRESETS.find(p => p.name === shapeGradientPreset);
    return preset?.colors || null;
  }, [shapeGradientPreset]);

  // Filter icons
  const filteredIcons = useMemo(() => {
    let iconEntries = Object.entries(Icons);

    // Filter by library
    if (libraryFilter !== "All Libraries") {
      iconEntries = iconEntries.filter(([_, icon]) =>
        icon.library === libraryFilter
      );
    }

    // Filter by favorites
    if (showFavorites) {
      iconEntries = iconEntries.filter(([name]) => favorites.includes(name));
    }

    // Filter by recent
    if (showRecent) {
      iconEntries = iconEntries.filter(([name]) => recentIcons.includes(name));
      // Sort by recent order
      iconEntries.sort((a, b) => recentIcons.indexOf(a[0]) - recentIcons.indexOf(b[0]));
    }

    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      iconEntries = iconEntries.filter(([name, icon]) =>
        name.toLowerCase().includes(q) ||
        (icon.originalName && icon.originalName.toLowerCase().includes(q))
      );
    }

    return iconEntries.map(([name]) => name);
  }, [query, libraryFilter, showFavorites, showRecent, favorites, recentIcons]);

  // Paginated icons
  const paginatedIcons = useMemo(() => {
    const start = page * ICONS_PER_PAGE;
    return filteredIcons.slice(start, start + ICONS_PER_PAGE);
  }, [filteredIcons, page]);

  const totalPages = Math.ceil(filteredIcons.length / ICONS_PER_PAGE);

  const Icon = activeIcon ? Icons[activeIcon] : null;

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [query, libraryFilter, showFavorites, showRecent]);

  // Toggle favorite
  const toggleFavorite = useCallback((name, e) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(name);
      showToast(isFav ? "Removed from favorites" : "Added to favorites");
      return isFav ? prev.filter(f => f !== name) : [...prev, name];
    });
  }, [showToast]);

  // Select random icon
  const selectRandomIcon = useCallback(() => {
    const iconNames = Object.keys(Icons);
    const randomIndex = Math.floor(Math.random() * iconNames.length);
    setActiveIcon(iconNames[randomIndex]);
    showToast("Random icon selected!");
  }, [showToast]);

  // Color helpers
  const generateColors = useCallback((count, preset = null) => {
    if (preset && COLOR_PRESETS[preset]) {
      const presetColors = COLOR_PRESETS[preset].colors;
      // Repeat or slice to match count
      const palette = [];
      for (let i = 0; i < count; i++) {
        palette.push(presetColors[i % presetColors.length]);
      }
      setColors(palette);
    } else {
      const palette = [];
      for (let i = 0; i < count; i++) {
        const hue = Math.floor((360 / count) * i);
        palette.push(`hsl(${hue}, 70%, 50%)`);
      }
      setColors(palette);
    }
  }, []);

  const updateColor = useCallback((index, value) => {
    setColors(prev => {
      const newColors = [...prev];
      newColors[index] = value;
      return newColors;
    });
  }, []);

  const addColor = useCallback(() => {
    if (colors.length < MAX_VARIANTS) {
      const hue = Math.floor(Math.random() * 360);
      setColors(prev => [...prev, `hsl(${hue}, 70%, 50%)`]);
      setColorCount(prev => prev + 1);
    }
  }, [colors.length]);

  const removeColor = useCallback((index) => {
    if (colors.length > 1) {
      setColors(prev => prev.filter((_, i) => i !== index));
      setColorCount(prev => prev - 1);
    }
  }, [colors.length]);

  // Apply style template
  const applyTemplate = useCallback((template) => {
    setShape(template.shape);
    setShapeColor(template.shapeColor);
    setShapeGradientPreset(template.gradient);
    setColors([template.iconColor]);
    setColorCount(1);
    setIconPadding(template.padding);
    if (template.shadow) setShapeShadowBlur(template.shadow);
    if (template.opacity) setShapeOpacity(template.opacity);
    showToast(`Applied "${template.name}" template`);
  }, [showToast]);

  // Build common props for IconRenderer
  const getIconProps = useCallback((color) => ({
    Icon,
    size,
    color,
    weight,
    shape,
    shapeColor,
    shapeGradient,
    shapeGradientDirection,
    shapeBorderColor,
    shapeBorderWidth,
    shapeShadowColor,
    shapeShadowBlur,
    shapeRotation,
    shapeOpacity,
    iconPadding,
    iconRotation,
    iconGlow,
    iconGlowColor,
    iconOpacity,
    previewBackground: previewBg,
  }), [Icon, size, weight, shape, shapeColor, shapeGradient, shapeGradientDirection,
      shapeBorderColor, shapeBorderWidth, shapeShadowColor, shapeShadowBlur,
      shapeRotation, shapeOpacity, iconPadding, iconRotation, iconGlow, iconGlowColor,
      iconOpacity, previewBg]);

  // Download functions
  const downloadSingle = async (format = "png") => {
    if (!previewRef.current || !activeIcon) return;

    try {
      const options = {
        backgroundColor: previewBg === "transparent" || previewBg === "checkered" ? null : previewBg,
        pixelRatio: 2,
      };

      const dataUrl = format === "svg"
        ? await toSvg(previewRef.current, options)
        : await toPng(previewRef.current, options);

      const link = document.createElement("a");
      link.download = `${activeIcon}.${format}`;
      link.href = dataUrl;
      link.click();
      showToast(`Downloaded ${activeIcon}.${format}`);
    } catch (err) {
      console.error("Download failed:", err);
      showToast("Download failed", "error");
    }
  };

  const copyToClipboard = async () => {
    if (!previewRef.current || !activeIcon) return;

    try {
      const dataUrl = await toPng(previewRef.current, {
        backgroundColor: null,
        pixelRatio: 2,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);

      showToast("Copied to clipboard!");
    } catch (err) {
      console.error("Copy failed:", err);
      showToast("Failed to copy", "error");
    }
  };

  const downloadColorVariants = async (format = "png") => {
    if (!Icon || exporting) return;

    setExporting(true);
    setExportProgress(0);

    const zip = new JSZip();

    try {
      for (let index = 0; index < colors.length; index++) {
        const c = colors[index];

        const node = document.createElement("div");
        node.style.position = "absolute";
        node.style.left = "-9999px";
        document.body.appendChild(node);

        const root = createRoot(node);
        root.render(
          <IconRenderer {...getIconProps(c)} previewBackground="transparent" />
        );

        await new Promise(r => setTimeout(r, 80));

        const options = { backgroundColor: null, pixelRatio: 2 };
        const data = format === "svg"
          ? await toSvg(node.firstChild, options)
          : await toPng(node.firstChild, options);

        const fileName = `${activeIcon}-variant-${index + 1}.${format}`;
        zip.file(fileName, data.split(",")[1], { base64: true });

        root.unmount();
        node.remove();

        setExportProgress(Math.round(((index + 1) / colors.length) * 100));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${activeIcon}-${colors.length}-variants.zip`;
      link.click();
      showToast(`Downloaded ${colors.length} variants!`);
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Export failed", "error");
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  // Reset all settings
  const resetSettings = useCallback(() => {
    setSize(128);
    setWeight("regular");
    setColorCount(1);
    setColors(["#ffffff"]);
    setColorPreset("");
    setIconGlow(0);
    setIconOpacity(1);
    setShape("none");
    setShapeColor("#3b82f6");
    setShapeGradientPreset("None");
    setShapeBorderWidth(0);
    setShapeShadowBlur(0);
    setShapeRotation(0);
    setShapeOpacity(1);
    setIconPadding(20);
    setIconRotation(0);
    showToast("Settings reset");
  }, [showToast]);

  return (
    <div className={`app ${theme}`}>
      {/* Toast notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <header className="header">
        <div className="header-left">
          <Link to="/" className="home-btn" title="Back to Home">
            🏠
          </Link>
          <h1>Icon Generator Pro</h1>
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={selectRandomIcon} title="Random icon (R)">
            🎲
          </button>
          <button className="header-btn" onClick={resetSettings} title="Reset settings">
            ↺
          </button>
          <span className="icon-count">{getTotalIconCount().toLocaleString()} icons</span>
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="main-layout">
        {/* Left Panel - Icon Browser */}
        <div className="browser-panel">
          <div className="search-bar">
            <input
              ref={searchInputRef}
              className="search-input"
              placeholder="Search icons... (Ctrl+K)"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <select
              className="library-select"
              value={libraryFilter}
              onChange={e => setLibraryFilter(e.target.value)}
            >
              {ICON_LIBRARIES.map(lib => (
                <option key={lib} value={lib}>{lib}</option>
              ))}
            </select>
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${!showFavorites && !showRecent ? "active" : ""}`}
              onClick={() => { setShowFavorites(false); setShowRecent(false); }}
            >
              All
            </button>
            <button
              className={`filter-btn ${showFavorites ? "active" : ""}`}
              onClick={() => { setShowFavorites(true); setShowRecent(false); }}
            >
              ★ Favorites ({favorites.length})
            </button>
            <button
              className={`filter-btn ${showRecent ? "active" : ""}`}
              onClick={() => { setShowRecent(true); setShowFavorites(false); }}
            >
              ⏱ Recent ({recentIcons.length})
            </button>
          </div>

          <div className="results-info">
            Showing {paginatedIcons.length} of {filteredIcons.length} icons
            {totalPages > 1 && ` • Page ${page + 1}/${totalPages}`}
          </div>

          <div className="icon-grid">
            {paginatedIcons.map(name => {
              const IconComp = Icons[name];
              if (!IconComp) return null;
              const isFav = favorites.includes(name);

              return (
                <div
                  key={name}
                  className={`icon-item ${activeIcon === name ? "selected" : ""}`}
                  onClick={() => setActiveIcon(name)}
                >
                  <button
                    className={`fav-star ${isFav ? "active" : ""}`}
                    onClick={(e) => toggleFavorite(name, e)}
                  >
                    {isFav ? "★" : "☆"}
                  </button>
                  <div className="icon-preview">
                    <IconComp size={28} color={theme === "dark" ? "#e2e8f0" : "#1e293b"} />
                  </div>
                  <span className="icon-name" title={name}>
                    {Icons[name]?.originalName || name.split("_").pop()}
                  </span>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 0} onClick={() => setPage(0)}>⟨⟨</button>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button>
              <span>{page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>→</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>⟩⟩</button>
            </div>
          )}
        </div>

        {/* Right Panel - Customization */}
        <div className="customize-panel">
          {/* Preview Area */}
          <div className="preview-section">
            <div className="section-header">
              <h2>Preview</h2>
              {activeIcon && <span className="active-icon-name">{Icons[activeIcon]?.originalName || activeIcon}</span>}
            </div>

            <div className="preview-bg-options">
              {["transparent", "#ffffff", "#000000", "#1e293b", "checkered"].map(bg => (
                <button
                  key={bg}
                  className={previewBg === bg ? "active" : ""}
                  onClick={() => setPreviewBg(bg)}
                  style={bg !== "transparent" && bg !== "checkered" ? { backgroundColor: bg } : {}}
                >
                  {bg === "transparent" ? "◻" : bg === "checkered" ? "▦" : ""}
                </button>
              ))}
            </div>

            <div
              className={`preview-container ${previewBg === "checkered" ? "checkered" : ""}`}
              style={{ backgroundColor: previewBg === "checkered" || previewBg === "transparent" ? undefined : previewBg }}
              ref={iconRef}
            >
              {Icon ? (
                <div ref={previewRef}>
                  <IconRenderer {...getIconProps(colors[0])} />
                </div>
              ) : (
                <p className="placeholder">Select an icon to start</p>
              )}
            </div>

            {colors.length > 1 && Icon && (
              <div className="variant-preview">
                <h3>Color Variants ({colors.length})</h3>
                <div className="variant-grid">
                  {colors.map((c, i) => (
                    <div key={i} className="variant-item" title={c}>
                      <IconRenderer {...getIconProps(c)} size={48} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Templates */}
          <div className="templates-section">
            <h3>Quick Templates</h3>
            <div className="templates-grid">
              {STYLE_TEMPLATES.map(template => (
                <button
                  key={template.name}
                  className="template-btn"
                  onClick={() => applyTemplate(template)}
                  title={template.name}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="controls-section">
            <div className="control-group">
              <h3>Icon Settings</h3>

              <label className="control-row">
                <span>Size: {size}px</span>
                <input
                  type="range"
                  min="16"
                  max="512"
                  value={size}
                  onChange={e => setSize(+e.target.value)}
                />
              </label>

              <label className="control-row">
                <span>Weight</span>
                <select value={weight} onChange={e => setWeight(e.target.value)}>
                  <option value="thin">Thin</option>
                  <option value="light">Light</option>
                  <option value="regular">Regular</option>
                  <option value="bold">Bold</option>
                  <option value="fill">Fill</option>
                  <option value="duotone">Duotone</option>
                </select>
              </label>

              <label className="control-row">
                <span>Icon Rotation: {iconRotation}°</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={iconRotation}
                  onChange={e => setIconRotation(+e.target.value)}
                />
              </label>

              <label className="control-row">
                <span>Icon Opacity: {Math.round(iconOpacity * 100)}%</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={iconOpacity * 100}
                  onChange={e => setIconOpacity(+e.target.value / 100)}
                />
              </label>

              <label className="control-row">
                <span>Icon Glow: {iconGlow}px</span>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={iconGlow}
                  onChange={e => setIconGlow(+e.target.value)}
                />
              </label>

              {iconGlow > 0 && (
                <label className="control-row">
                  <span>Glow Color</span>
                  <input
                    type="color"
                    value={iconGlowColor}
                    onChange={e => setIconGlowColor(e.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="control-group">
              <div className="section-header">
                <h3>Color Variants</h3>
                <span className="variant-count">{colors.length} / {MAX_VARIANTS}</span>
              </div>

              <label className="control-row">
                <span>Number of Variants: {colorCount}</span>
                <input
                  type="range"
                  min="1"
                  max={MAX_VARIANTS}
                  value={colorCount}
                  onChange={e => {
                    const c = +e.target.value;
                    setColorCount(c);
                    generateColors(c, colorPreset);
                  }}
                />
              </label>

              <label className="control-row">
                <span>Color Preset</span>
                <select
                  value={colorPreset}
                  onChange={e => {
                    setColorPreset(e.target.value);
                    generateColors(colorCount, e.target.value);
                  }}
                >
                  <option value="">Custom / Rainbow</option>
                  {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.name}</option>
                  ))}
                </select>
              </label>

              <div className="color-palette-header">
                <span>Colors</span>
                <button
                  className="add-color-btn"
                  onClick={addColor}
                  disabled={colors.length >= MAX_VARIANTS}
                  title="Add color"
                >
                  +
                </button>
              </div>

              <div className="color-palette">
                {colors.map((c, i) => (
                  <div key={i} className="color-item">
                    <input
                      type="color"
                      value={c.startsWith("hsl") ? "#000000" : c}
                      onChange={e => updateColor(i, e.target.value)}
                      title={`Color ${i + 1}: ${c}`}
                    />
                    {colors.length > 1 && (
                      <button
                        className="remove-color-btn"
                        onClick={() => removeColor(i)}
                        title="Remove color"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="control-group">
              <h3>Background Shape</h3>

              <label className="control-row">
                <span>Shape</span>
                <select value={shape} onChange={e => setShape(e.target.value)}>
                  {SHAPE_NAMES.map(s => (
                    <option key={s} value={s}>{SHAPES[s].name}</option>
                  ))}
                </select>
              </label>

              {shape !== "none" && (
                <>
                  <label className="control-row">
                    <span>Shape Color</span>
                    <input
                      type="color"
                      value={shapeColor}
                      onChange={e => setShapeColor(e.target.value)}
                    />
                  </label>

                  <label className="control-row">
                    <span>Gradient Preset</span>
                    <select
                      value={shapeGradientPreset}
                      onChange={e => setShapeGradientPreset(e.target.value)}
                    >
                      {GRADIENT_PRESETS.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </label>

                  {shapeGradient && (
                    <label className="control-row">
                      <span>Gradient Direction</span>
                      <select
                        value={shapeGradientDirection}
                        onChange={e => setShapeGradientDirection(e.target.value)}
                      >
                        <option value="to bottom">↓ Top to Bottom</option>
                        <option value="to top">↑ Bottom to Top</option>
                        <option value="to right">→ Left to Right</option>
                        <option value="to left">← Right to Left</option>
                        <option value="to bottom right">↘ Diagonal</option>
                        <option value="to bottom left">↙ Diagonal</option>
                        <option value="to top right">↗ Diagonal</option>
                        <option value="to top left">↖ Diagonal</option>
                      </select>
                    </label>
                  )}

                  <label className="control-row">
                    <span>Icon Padding: {iconPadding}%</span>
                    <input
                      type="range"
                      min="5"
                      max="45"
                      value={iconPadding}
                      onChange={e => setIconPadding(+e.target.value)}
                    />
                  </label>

                  <label className="control-row">
                    <span>Border Width: {shapeBorderWidth}px</span>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={shapeBorderWidth}
                      onChange={e => setShapeBorderWidth(+e.target.value)}
                    />
                  </label>

                  {shapeBorderWidth > 0 && (
                    <label className="control-row">
                      <span>Border Color</span>
                      <input
                        type="color"
                        value={shapeBorderColor}
                        onChange={e => setShapeBorderColor(e.target.value)}
                      />
                    </label>
                  )}

                  <label className="control-row">
                    <span>Shadow Blur: {shapeShadowBlur}px</span>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={shapeShadowBlur}
                      onChange={e => setShapeShadowBlur(+e.target.value)}
                    />
                  </label>

                  {shapeShadowBlur > 0 && (
                    <label className="control-row">
                      <span>Shadow Color</span>
                      <input
                        type="color"
                        value={shapeShadowColor}
                        onChange={e => setShapeShadowColor(e.target.value)}
                      />
                    </label>
                  )}

                  <label className="control-row">
                    <span>Shape Rotation: {shapeRotation}°</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={shapeRotation}
                      onChange={e => setShapeRotation(+e.target.value)}
                    />
                  </label>

                  <label className="control-row">
                    <span>Shape Opacity: {Math.round(shapeOpacity * 100)}%</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={shapeOpacity * 100}
                      onChange={e => setShapeOpacity(+e.target.value / 100)}
                    />
                  </label>
                </>
              )}
            </div>

            {/* Export Actions */}
            <div className="export-section">
              <h3>Export</h3>
              <div className="export-buttons">
                <button
                  className="btn-primary"
                  onClick={() => downloadSingle("png")}
                  disabled={!activeIcon}
                  title="Ctrl+D"
                >
                  PNG
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => downloadSingle("svg")}
                  disabled={!activeIcon}
                  title="Ctrl+Shift+D"
                >
                  SVG
                </button>
                <button
                  className="btn-secondary"
                  onClick={copyToClipboard}
                  disabled={!activeIcon}
                  title="Ctrl+C"
                >
                  Copy
                </button>
              </div>

              {colors.length > 1 && Icon && (
                <div className="export-buttons" style={{ marginTop: 10 }}>
                  <button
                    className="btn-accent"
                    onClick={() => downloadColorVariants("png")}
                    disabled={exporting}
                  >
                    {exporting ? `Exporting... ${exportProgress}%` : `Download ${colors.length} Variants (ZIP)`}
                  </button>
                </div>
              )}

              {exporting && (
                <div className="export-progress">
                  <div className="progress-bar" style={{ width: `${exportProgress}%` }} />
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="shortcuts-section">
              <h3>Keyboard Shortcuts</h3>
              <div className="shortcuts-list">
                <div><kbd>Ctrl</kbd>+<kbd>K</kbd> Search</div>
                <div><kbd>Ctrl</kbd>+<kbd>D</kbd> Download PNG</div>
                <div><kbd>Ctrl</kbd>+<kbd>C</kbd> Copy</div>
                <div><kbd>R</kbd> Random icon</div>
                <div><kbd>←</kbd><kbd>→</kbd> Navigate pages</div>
                <div><kbd>Esc</kbd> Clear search</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}