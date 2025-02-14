interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  // Diğer çevre değişkenleri buraya ekleyin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 