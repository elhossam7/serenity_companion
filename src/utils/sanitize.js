// Simple text sanitizer: strips tags and risky patterns without altering normal text.
export function sanitizeText(input = '') {
  if (typeof input !== 'string') return '';
  // Remove any HTML tags
  let out = input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Remove inline event handlers (onX=) patterns
  out = out.replace(/on[a-z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '');
  // Neutralize script-like patterns
  out = out.replace(/javascript:/gi, '').replace(/data:text\/html/gi, '');
  // Normalize whitespace
  out = out.replace(/[\u0000-\u001F\u007F]/g, '');
  return out.trim();
}
