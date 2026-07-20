/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WHATSAPP_NUMBER: string;
  readonly PUBLIC_GUESTY_BOOKING_URL: string;
  readonly PUBLIC_GA4_ID: string;
  readonly PUBLIC_META_PIXEL_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
