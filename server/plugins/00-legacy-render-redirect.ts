import { getRequestHeader, getRequestURL, sendRedirect } from 'h3';
import { defineNitroPlugin } from 'nitropack/runtime';

const LEGACY_RENDER_HOST = 'pik-tool.onrender.com';
const TARGET_ORIGIN = 'https://pik-min.app';

function isLegacyHost(host: string | undefined) {
  return host?.split(',').some((value) =>
    value.trim().toLowerCase().replace(/:\d+$/, '') === LEGACY_RENDER_HOST,
  );
}

// The request hook runs before Nitro serves prerendered static files.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const isLegacyRequest = [
      getRequestHeader(event, 'x-forwarded-host'),
      getRequestHeader(event, 'host'),
      getRequestURL(event).host,
    ].some(isLegacyHost);

    if (!isLegacyRequest) return;

    const requestUrl = getRequestURL(event);
    const targetUrl = new URL(TARGET_ORIGIN);
    targetUrl.pathname = requestUrl.pathname;
    targetUrl.search = requestUrl.search;

    return sendRedirect(event, targetUrl.toString(), 302);
  });
});
