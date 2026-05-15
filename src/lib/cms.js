import { defaultCmsContent } from '@/lib/cmsDefaults';

export const CMS_SETTING_KEY = 'cms_content';

export function parseCmsContent(settings = {}) {
  if (!settings[CMS_SETTING_KEY]) return defaultCmsContent;
  try {
    return mergeCms(defaultCmsContent, JSON.parse(settings[CMS_SETTING_KEY]));
  } catch {
    return defaultCmsContent;
  }
}

export function serializeCmsContent(content) {
  return JSON.stringify(content || defaultCmsContent);
}

function mergeCms(base, incoming) {
  if (Array.isArray(base)) return Array.isArray(incoming) ? incoming : base;
  if (!base || typeof base !== 'object') return incoming ?? base;
  const next = { ...base };
  if (!incoming || typeof incoming !== 'object') return next;
  for (const key of Object.keys(incoming)) {
    next[key] = key in base ? mergeCms(base[key], incoming[key]) : incoming[key];
  }
  return next;
}
