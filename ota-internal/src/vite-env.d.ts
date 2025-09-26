/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_VERSION: string
  readonly VITE_MIXPANEL_TOKEN?: string
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Service Worker types
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface PushEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
}

interface NotificationEvent extends ExtendableEvent {
  readonly action: string;
  readonly notification: Notification;
}
