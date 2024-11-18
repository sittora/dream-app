import { logger } from '../services/logger';

export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Log the error
    logger.error('API Error occurred', {
      message,
      statusCode,
      code,
      details,
    });
  }

  static fromResponse(response: Response, defaultMessage?: string): Promise<APIError> {
    return response.json().then(
      (data) => {
        return new APIError(
          data.message || defaultMessage || 'An unexpected error occurred',
          response.status,
          data.code,
          data.details
        );
      },
      () => {
        // If JSON parsing fails, create a generic error
        return new APIError(
          defaultMessage || 'An unexpected error occurred',
          response.status,
          'UNKNOWN_ERROR'
        );
      }
    );
  }

  static isAPIError(error: any): error is APIError {
    return error instanceof APIError;
  }
}

export const handleAPIError = async (error: any, defaultMessage?: string): Promise<never> => {
  if (error instanceof APIError) {
    throw error;
  }

  if (error instanceof Response) {
    throw await APIError.fromResponse(error, defaultMessage);
  }

  // For network errors or other unexpected errors
  throw new APIError(
    error.message || defaultMessage || 'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR',
    { originalError: error }
  );
};

export const createAPIErrorHandler = (context: string) => {
  return (error: any) => handleAPIError(error, `Failed to ${context}`);
};

// Common error codes
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// HTTP status codes mapped to user-friendly messages
export const StatusMessages: Record<number, string> = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'You need to be logged in to perform this action.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'The request timed out. Please try again.',
  409: 'There was a conflict with the current state.',
  429: 'Too many requests. Please try again later.',
  500: 'An internal server error occurred. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'The service is unavailable. Please try again later.',
  504: 'The server timed out. Please try again later.',
};
