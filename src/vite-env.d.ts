/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public URL of the deployed site, no trailing slash. */
  readonly VITE_SITE_URL: string;
  /** YYYY-MM-DD the tax rates were last checked. */
  readonly VITE_RATES_CHECKED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
