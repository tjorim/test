/// <reference types="vite/client" />

// Global constants injected by Vite
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_REFERENCE_DATE?: string;
  readonly VITE_REFERENCE_TEAM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
