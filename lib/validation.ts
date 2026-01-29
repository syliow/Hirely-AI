/**
 * Request Validation Utilities
 * Validates and sanitizes incoming API requests
 */

// Maximum payload sizes
const MAX_PAYLOAD_SIZE = 15 * 1024 * 1024; // 15MB total payload
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB file
const MAX_JD_LENGTH = 50000; // 50k characters for job description
const MAX_MESSAGE_LENGTH = 5000; // 5k characters per chat message
const MAX_MESSAGES = 50; // Maximum messages in chat history

// Allowed MIME types for file upload
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Allowed actions
const ALLOWED_ACTIONS = ['audit', 'refactor', 'chat'] as const;
type AllowedAction = typeof ALLOWED_ACTIONS[number];

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Validate the action type
 */
export function validateAction(action: unknown): ValidationResult {
  if (!action || typeof action !== 'string') {
    return { valid: false, error: 'Action is required', errorCode: 'MISSING_ACTION' };
  }

  if (!ALLOWED_ACTIONS.includes(action as AllowedAction)) {
    return { valid: false, error: 'Invalid action type', errorCode: 'INVALID_ACTION' };
  }

  return { valid: true };
}

/**
 * Validate file data
 */
export function validateFileData(file: unknown): ValidationResult {
  if (!file || typeof file !== 'object') {
    return { valid: false, error: 'File data is required', errorCode: 'MISSING_FILE' };
  }

  const fileObj = file as Record<string, unknown>;

  if (!fileObj.data || typeof fileObj.data !== 'string') {
    return { valid: false, error: 'Invalid file data format', errorCode: 'INVALID_FILE_DATA' };
  }

  if (!fileObj.mimeType || typeof fileObj.mimeType !== 'string') {
    return { valid: false, error: 'File MIME type is required', errorCode: 'MISSING_MIME_TYPE' };
  }

  if (!ALLOWED_MIME_TYPES.includes(fileObj.mimeType)) {
    return { 
      valid: false, 
      error: 'Only PDF and DOCX files are allowed', 
      errorCode: 'INVALID_FILE_TYPE' 
    };
  }

  // Estimate base64 size (base64 is ~4/3 of original size)
  const estimatedSize = (fileObj.data.length * 3) / 4;
  if (estimatedSize > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: 'File size exceeds 10MB limit', 
      errorCode: 'FILE_TOO_LARGE' 
    };
  }

  return { valid: true };
}

/**
 * Validate job description text
 */
export function validateJDText(jdText: unknown): ValidationResult {
  if (jdText === undefined || jdText === null || jdText === '') {
    return { valid: true }; // JD is optional
  }

  if (typeof jdText !== 'string') {
    return { valid: false, error: 'Job description must be a string', errorCode: 'INVALID_JD_TYPE' };
  }

  if (jdText.length > MAX_JD_LENGTH) {
    return { 
      valid: false, 
      error: 'Job description exceeds maximum length', 
      errorCode: 'JD_TOO_LONG' 
    };
  }

  return { valid: true };
}

/**
 * Validate refactor options
 */
export function validateRefactorOptions(options: unknown): ValidationResult {
  if (!options || typeof options !== 'object') {
    return { valid: false, error: 'Refactor options are required', errorCode: 'MISSING_OPTIONS' };
  }

  const opts = options as Record<string, unknown>;
  const validLevels = ['junior', 'mid', 'senior', 'staff'];

  if (!opts.level || !validLevels.includes(opts.level as string)) {
    return { valid: false, error: 'Invalid career level', errorCode: 'INVALID_LEVEL' };
  }

  if (typeof opts.jdAlignment !== 'number' || opts.jdAlignment < 0 || opts.jdAlignment > 100) {
    return { valid: false, error: 'JD alignment must be between 0 and 100', errorCode: 'INVALID_ALIGNMENT' };
  }

  return { valid: true };
}

/**
 * Validate chat messages
 */
export function validateMessages(messages: unknown): ValidationResult {
  if (!messages || !Array.isArray(messages)) {
    return { valid: false, error: 'Messages array is required', errorCode: 'MISSING_MESSAGES' };
  }

  if (messages.length === 0) {
    return { valid: false, error: 'At least one message is required', errorCode: 'EMPTY_MESSAGES' };
  }

  if (messages.length > MAX_MESSAGES) {
    return { 
      valid: false, 
      error: 'Too many messages in conversation', 
      errorCode: 'TOO_MANY_MESSAGES' 
    };
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: `Invalid message at index ${i}`, errorCode: 'INVALID_MESSAGE' };
    }
    
    const msgObj = msg as Record<string, unknown>;
    if (!msgObj.role || !['user', 'model'].includes(msgObj.role as string)) {
      return { valid: false, error: `Invalid role at message ${i}`, errorCode: 'INVALID_ROLE' };
    }

    if (!msgObj.text || typeof msgObj.text !== 'string') {
      return { valid: false, error: `Invalid text at message ${i}`, errorCode: 'INVALID_TEXT' };
    }

    if (msgObj.text.length > MAX_MESSAGE_LENGTH) {
      return { 
        valid: false, 
        error: `Message ${i} exceeds maximum length`, 
        errorCode: 'MESSAGE_TOO_LONG' 
      };
    }
  }

  return { valid: true };
}

/**
 * Validate entire request payload
 */
export function validateRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required', errorCode: 'MISSING_BODY' };
  }

  const payload = body as Record<string, unknown>;

  // Validate action
  const actionResult = validateAction(payload.action);
  if (!actionResult.valid) return actionResult;

  const action = payload.action as AllowedAction;
  const innerPayload = payload.payload as Record<string, unknown>;

  if (!innerPayload || typeof innerPayload !== 'object') {
    return { valid: false, error: 'Payload is required', errorCode: 'MISSING_PAYLOAD' };
  }

  // Validate based on action type
  switch (action) {
    case 'audit': {
      const fileResult = validateFileData(innerPayload.file);
      if (!fileResult.valid) return fileResult;
      
      const jdResult = validateJDText(innerPayload.jdText);
      if (!jdResult.valid) return jdResult;
      
      break;
    }
    case 'refactor': {
      const fileResult = validateFileData(innerPayload.file);
      if (!fileResult.valid) return fileResult;
      
      const jdResult = validateJDText(innerPayload.jdText);
      if (!jdResult.valid) return jdResult;
      
      const optionsResult = validateRefactorOptions(innerPayload.options);
      if (!optionsResult.valid) return optionsResult;
      
      break;
    }
    case 'chat': {
      const messagesResult = validateMessages(innerPayload.messages);
      if (!messagesResult.valid) return messagesResult;
      
      break;
    }
  }

  return { valid: true };
}

/**
 * Check content-length header
 */
export function validateContentLength(contentLength: string | null): ValidationResult {
  if (!contentLength) {
    return { valid: true }; // Let it pass, will be validated by body parsing
  }

  const size = parseInt(contentLength, 10);
  if (isNaN(size)) {
    return { valid: false, error: 'Invalid content length', errorCode: 'INVALID_CONTENT_LENGTH' };
  }

  if (size > MAX_PAYLOAD_SIZE) {
    return { 
      valid: false, 
      error: 'Request payload too large', 
      errorCode: 'PAYLOAD_TOO_LARGE' 
    };
  }

  return { valid: true };
}
