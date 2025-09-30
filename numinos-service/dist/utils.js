import crypto from 'crypto';
export function normalizeText(s) {
    // strip HTML tags, normalize whitespace
    const noHtml = s.replace(/<[^>]*>/g, ' ');
    return noHtml.replace(/\s+/g, ' ').trim();
}
export function redactPII(s) {
    // lightweight regex-based PII redaction
    let out = s;
    // emails
    out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]');
    // phones (simple)
    out = out.replace(/\+?\d[\d\-() ]{7,}\d/g, '[REDACTED_PHONE]');
    // SSN simple pattern
    out = out.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');
    // addresses (very naive: number + street)
    out = out.replace(/\d+\s+([A-Za-z0-9]+\s?){1,5}(street|st|avenue|ave|road|rd|boulevard|blvd)\b/gi, '[REDACTED_ADDRESS]');
    // person names: VERY naive — redact sequences of capitalized words of length 2-3 (e.g., John Doe)
    out = out.replace(/\b([A-Z][a-z]+\s){1,2}[A-Z][a-z]+\b/g, '[REDACTED_NAME]');
    return out;
}
export function mentionsMinorsSexual(s) {
    const lowered = s.toLowerCase();
    const minorTerms = ['child', 'kid', 'teen', 'underage', 'minor'];
    const sexualTerms = ['sex', 'sexual', 'porn', 'molest', 'rape', 'inappropriate'];
    const hasMinor = minorTerms.some(t => lowered.includes(t));
    const hasSex = sexualTerms.some(t => lowered.includes(t));
    return hasMinor && hasSex;
}
export function simpleHash(obj) {
    const json = JSON.stringify(obj);
    return crypto.createHash('sha256').update(json).digest('hex');
}
export function clamp(n, a, b) {
    if (Number.isNaN(n))
        return a;
    return Math.max(a, Math.min(b, n));
}
export function normalizeNodeId(id) {
    // lowercase, strip non-alphanum, convert spaces to underscore, very small lemmatize heuristics
    return id
        .toLowerCase()
        .replace(/[\W_]+/g, ' ')
        .trim()
        .replace(/\s+/g, '_');
}
