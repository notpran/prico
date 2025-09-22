// src/lib/validation.ts - Input validation utilities

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  // Alphanumeric, underscore, dash, 3-20 chars
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

export function validatePassword(password: string): boolean {
  // At least 8 chars, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateChannelName(name: string): boolean {
  return name.length >= 1 && name.length <= 100 && !/[<>]/.test(name);
}

export function validateMessageContent(content: string): boolean {
  return content.length >= 1 && content.length <= 2000;
}

export function validateProjectName(name: string): boolean {
  return name.length >= 1 && name.length <= 100 && /^[a-zA-Z0-9-_ ]+$/.test(name);
}

export function validateCodeInput(code: string, language: string): boolean {
  const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'go', 'rust'];
  if (!supportedLanguages.includes(language)) return false;

  // Basic length check
  return code.length > 0 && code.length <= 10000;
}