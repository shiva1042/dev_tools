import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Configure Monaco to use local bundled version instead of CDN
// This enables offline support
loader.config({ monaco });

export { monaco };
