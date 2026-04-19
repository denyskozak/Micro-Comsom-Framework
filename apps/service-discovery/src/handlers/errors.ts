import { ZodError } from 'zod';
import { sendJson } from '../utils/http';
import type { ServerResponse } from 'node:http';

export const sendValidationError = (response: ServerResponse, error: ZodError): void => {
  sendJson(response, 400, {
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request payload.',
      issues: error.flatten()
    }
  });
};

export const sendNotFound = (response: ServerResponse): void => {
  sendJson(response, 404, {
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.'
    }
  });
};

export const sendInternalError = (response: ServerResponse, error: unknown): void => {
  sendJson(response, 500, {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error.',
      issues: error instanceof Error ? error.message : String(error)
    }
  });
};
