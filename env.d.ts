/// <reference types="@cloudflare/workers-types" />

declare interface CacheStorage {
  open(cacheName: string): Promise<Cache>;
  readonly default: Cache;
}

declare const AIRTABLE_BASE: readonly string;
declare const AIRTABLE_KEY: readonly string;
declare const DEFAULT_REDIRECT: readonly string;
declare const TABLE_NAME: readonly string;
