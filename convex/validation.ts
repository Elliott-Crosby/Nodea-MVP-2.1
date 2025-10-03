import { v } from "convex/values";

/**
 * Input validation utilities for security
 */

// Maximum lengths for different content types
export const MAX_LENGTHS = {
  NODE_CONTENT: 50000, // 50KB max for node content
  BOARD_TITLE: 200,
  BOARD_DESCRIPTION: 1000,
  API_KEY_NICKNAME: 100,
  USER_EMAIL: 254,
  SHARE_TOKEN: 32,
} as const;

// Allowed HTML tags for rich content (very restrictive)
export const ALLOWED_HTML_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre'
] as const;

// Dangerous patterns to block
export const DANGEROUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>.*?<\/embed>/gi,
  /<form[^>]*>.*?<\/form>/gi,
  /<input[^>]*>.*?<\/input>/gi,
  /<textarea[^>]*>.*?<\/textarea>/gi,
  /<select[^>]*>.*?<\/select>/gi,
  /<button[^>]*>.*?<\/button>/gi,
  /javascript:/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /onload=/gi,
  /onerror=/gi,
  /onclick=/gi,
  /onmouseover=/gi,
  /onfocus=/gi,
  /onblur=/gi,
  /onchange=/gi,
  /onsubmit=/gi,
] as const;

/**
 * Validate and sanitize text content
 */
export function validateAndSanitizeText(content: string, maxLength: number = MAX_LENGTHS.NODE_CONTENT): string {
  if (typeof content !== 'string') {
    throw new Error("Content must be a string");
  }

  // Check length
  if (content.length > maxLength) {
    throw new Error(`Content exceeds maximum length of ${maxLength} characters`);
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(content)) {
      throw new Error("Content contains potentially dangerous patterns");
    }
  }

  // Basic HTML sanitization (remove dangerous tags and attributes)
  let sanitized = content
    // Remove script tags and their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    // Remove object tags
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
    // Remove embed tags
    .replace(/<embed[^>]*>/gi, '')
    // Remove form tags
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
    // Remove dangerous attributes
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*javascript\s*:/gi, '')
    .replace(/\s*vbscript\s*:/gi, '');

  return sanitized.trim();
}

/**
 * Validate board title
 */
export function validateBoardTitle(title: string): string {
  if (typeof title !== 'string') {
    throw new Error("Board title must be a string");
  }

  const sanitized = validateAndSanitizeText(title, MAX_LENGTHS.BOARD_TITLE);
  
  if (sanitized.length === 0) {
    throw new Error("Board title cannot be empty");
  }

  return sanitized;
}

/**
 * Validate board description
 */
export function validateBoardDescription(description: string | undefined): string | undefined {
  if (description === undefined || description === null) {
    return undefined;
  }

  if (typeof description !== 'string') {
    throw new Error("Board description must be a string");
  }

  return validateAndSanitizeText(description, MAX_LENGTHS.BOARD_DESCRIPTION);
}

/**
 * Validate node content
 */
export function validateNodeContent(content: string): string {
  if (typeof content !== 'string') {
    throw new Error("Node content must be a string");
  }

  return validateAndSanitizeText(content, MAX_LENGTHS.NODE_CONTENT);
}

/**
 * Validate API key nickname
 */
export function validateApiKeyNickname(nickname: string): string {
  if (typeof nickname !== 'string') {
    throw new Error("API key nickname must be a string");
  }

  const sanitized = validateAndSanitizeText(nickname, MAX_LENGTHS.API_KEY_NICKNAME);
  
  if (sanitized.length === 0) {
    throw new Error("API key nickname cannot be empty");
  }

  return sanitized;
}

/**
 * Validate share token
 */
export function validateShareToken(token: string): string {
  if (typeof token !== 'string') {
    throw new Error("Share token must be a string");
  }

  if (token.length !== MAX_LENGTHS.SHARE_TOKEN) {
    throw new Error("Invalid share token format");
  }

  // Only allow alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(token)) {
    throw new Error("Share token contains invalid characters");
  }

  return token;
}

/**
 * Validate position coordinates
 */
export function validatePosition(position: { x: number; y: number }): { x: number; y: number } {
  if (typeof position.x !== 'number' || typeof position.y !== 'number') {
    throw new Error("Position coordinates must be numbers");
  }

  // Prevent extreme values that could cause issues
  const MAX_COORDINATE = 1000000;
  const MIN_COORDINATE = -1000000;

  if (position.x < MIN_COORDINATE || position.x > MAX_COORDINATE) {
    throw new Error("X coordinate out of valid range");
  }

  if (position.y < MIN_COORDINATE || position.y > MAX_COORDINATE) {
    throw new Error("Y coordinate out of valid range");
  }

  return {
    x: Math.round(position.x),
    y: Math.round(position.y)
  };
}

/**
 * Validate model name
 */
export function validateModelName(model: string): string {
  if (typeof model !== 'string') {
    throw new Error("Model name must be a string");
  }

  // Only allow alphanumeric, hyphens, underscores, and dots
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) {
    throw new Error("Model name contains invalid characters");
  }

  if (model.length > 100) {
    throw new Error("Model name too long");
  }

  return model;
}

/**
 * Validate provider name
 */
export function validateProviderName(provider: string): string {
  if (typeof provider !== 'string') {
    throw new Error("Provider name must be a string");
  }

  // Only allow lowercase alphanumeric characters
  if (!/^[a-z0-9]+$/.test(provider)) {
    throw new Error("Provider name contains invalid characters");
  }

  if (provider.length > 50) {
    throw new Error("Provider name too long");
  }

  return provider;
}

/**
 * Validate temperature value
 */
export function validateTemperature(temperature: number | undefined): number {
  if (temperature === undefined) {
    return 0.7; // Default value
  }

  if (typeof temperature !== 'number') {
    throw new Error("Temperature must be a number");
  }

  if (temperature < 0 || temperature > 2) {
    throw new Error("Temperature must be between 0 and 2");
  }

  return Math.round(temperature * 100) / 100; // Round to 2 decimal places
}

/**
 * Validate max tokens value
 */
export function validateMaxTokens(maxTokens: number | undefined): number {
  if (maxTokens === undefined) {
    return 4000; // Default value
  }

  if (typeof maxTokens !== 'number') {
    throw new Error("Max tokens must be a number");
  }

  if (maxTokens < 1 || maxTokens > 100000) {
    throw new Error("Max tokens must be between 1 and 100,000");
  }

  return Math.round(maxTokens);
}
