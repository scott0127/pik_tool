import { defineEventHandler, getRequestURL, sendRedirect } from 'h3';

const LEGACY_RENDER_HOST = 'pik-tool.onrender.com';
const TARGET_ORIGIN = 'https://pik-min.app';

// Keep the old Render address discoverable while the main site lives on Pages.
export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event);
  if (requestUrl.hostname !== LEGACY_RENDER_HOST) return;

  const targetUrl = new URL(TARGET_ORIGIN);
  targetUrl.pathname = requestUrl.pathname;
  targetUrl.search = requestUrl.search;

  return sendRedirect(event, targetUrl.toString(), 302);
});
