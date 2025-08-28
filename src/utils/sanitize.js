// Simple text sanitizer for textarea content:
// - Keeps spaces and newlines intact (no trimming)
// - Neutralizes potentially dangerous sequences
// - Removes only non-printable control chars except tab/newline/carriage return
export function sanitizeText(input = '') {
  if (typeof input !== 'string') return '';
  let out = input;
  // Neutralize angle brackets to avoid accidental HTML interpretation when rendered elsewhere
  out = out.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Remove inline event handler-like patterns
  out = out.replace(/on[a-z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '');
  // Neutralize script/data URLs
  out = out.replace(/javascript:/gi, '').replace(/data:text\/html/gi, '');
  // Strip control characters except tab (\t), newline (\n), carriage return (\r)
  out = out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  // Normalize CRLF to LF
  out = out.replace(/\r\n/g, '\n');
  return out;
}
