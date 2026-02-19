import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(shortcuts, deps = []) {
  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target;
    const isInput = target.tagName === 'INPUT' ||
                   target.tagName === 'TEXTAREA' ||
                   target.isContentEditable;

    for (const shortcut of shortcuts) {
      const { key, ctrl = false, shift = false, alt = false, action, allowInInput = false } = shortcut;

      // Skip if in input and not allowed
      if (isInput && !allowInInput) continue;

      const keyMatch = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrl === (event.ctrlKey || event.metaKey);
      const shiftMatch = shift === event.shiftKey;
      const altMatch = alt === event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        action(event);
        return;
      }
    }
  }, [shortcuts, ...deps]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Shortcut definitions for display
export const SHORTCUTS = {
  GENERATE: { key: 'g', ctrl: true, label: 'Ctrl+G', description: 'Generate templates' },
  EXPORT: { key: 'e', ctrl: true, label: 'Ctrl+E', description: 'Export as ZIP' },
  SEARCH: { key: 'k', ctrl: true, label: 'Ctrl+K', description: 'Search templates' },
  TOGGLE_THEME: { key: '\\', ctrl: true, label: 'Ctrl+\\', description: 'Toggle theme' },
  HELP: { key: '/', ctrl: true, label: 'Ctrl+/', description: 'Show shortcuts' },
  ESCAPE: { key: 'Escape', label: 'Esc', description: 'Close dialogs' },
};

export default useKeyboardShortcuts;
