import DOMPurify from 'dompurify';

/**
 * Frontend sanitization utilities using DOMPurify
 */

// Configure DOMPurify for maximum security
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div'
  ],
  ALLOWED_ATTR: ['class', 'id'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  FORBID_TAGS: [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 
    'select', 'button', 'link', 'meta', 'style'
  ],
  FORBID_ATTR: [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress',
    'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout',
    'oncontextmenu', 'ondblclick', 'onscroll', 'onresize'
  ]
};

/**
 * Sanitize HTML content for safe display
 */
export function sanitizeHtml(content: string): string {
  if (typeof content !== 'string') {
    return '';
  }

  try {
    return DOMPurify.sanitize(content, PURIFY_CONFIG);
  } catch (error) {
    console.error('Sanitization error:', error);
    // Return plain text if sanitization fails
    return content.replace(/<[^>]*>/g, '');
  }
}

/**
 * Sanitize text content (remove all HTML)
 */
export function sanitizeText(content: string): string {
  if (typeof content !== 'string') {
    return '';
  }

  try {
    return DOMPurify.sanitize(content, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true 
    });
  } catch (error) {
    console.error('Text sanitization error:', error);
    return content.replace(/<[^>]*>/g, '');
  }
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitizeInput(input: string, maxLength: number = 50000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<form[^>]*>.*?<\/form>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onerror=/gi,
    /onclick=/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      throw new Error('Input contains potentially dangerous content');
    }
  }

  return sanitizeText(input);
}

/**
 * Sanitize content for display in React components
 */
export function sanitizeForDisplay(content: string): string {
  return sanitizeHtml(content);
}

/**
 * Sanitize content for storage (remove all HTML)
 */
export function sanitizeForStorage(content: string): string {
  return sanitizeText(content);
}
