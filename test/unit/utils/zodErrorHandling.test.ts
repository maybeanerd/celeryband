import { describe, it, expect } from 'vitest';
import { isZodErrorResponse, getFirstZodError } from '../../../utils/zodErrorHandling';

describe('isZodErrorResponse', () => {
  it('should return true for a valid Zod error response object', () => {
    const response = {
      data: {
        data: {
          fieldErrors: {
            email: ['Invalid email'],
          },
        },
      },
    };
    expect(isZodErrorResponse(response)).toBe(true);
  });

  it('should return true when formErrors are present', () => {
    const response = {
      data: {
        data: {
          formErrors: ['Something went wrong'],
        },
      },
    };
    expect(isZodErrorResponse(response)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isZodErrorResponse(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isZodErrorResponse(undefined)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isZodErrorResponse('error')).toBe(false);
  });

  it('should return false for an array', () => {
    expect(isZodErrorResponse(['error'])).toBe(false);
  });

  it('should return false when data is missing', () => {
    expect(isZodErrorResponse({})).toBe(false);
  });

  it('should return false when data.data is missing', () => {
    const response = {
      data: {},
    };
    expect(isZodErrorResponse(response)).toBe(false);
  });

  it('should return false when data.data.fieldErrors is not an array', () => {
    const response = {
      data: {
        data: {
          fieldErrors: 'not an array',
        },
      },
    };
    expect(isZodErrorResponse(response)).toBe(false);
  });
});

describe('getFirstZodError', () => {
  it('should return the last field error message', () => {
    const response = {
      data: {
        data: {
          fieldErrors: {
            email: ['Invalid email'],
            password: ['Too short'],
          },
        },
      },
    };
    expect(getFirstZodError(response)).toBe('password: Too short');
  });

  it('should handle single field error', () => {
    const response = {
      data: {
        data: {
          fieldErrors: {
            email: ['Please enter a valid email'],
          },
        },
      },
    };
    expect(getFirstZodError(response)).toBe('email: Please enter a valid email');
  });

  it('should return unknown error for non-Zod error response', () => {
    expect(getFirstZodError(null)).toBe('Unknown error occurred.');
    expect(getFirstZodError('error')).toBe('Unknown error occurred.');
    expect(getFirstZodError({})).toBe('Unknown error occurred.');
  });

  it('should return unknown error when fieldErrors is missing', () => {
    const response = {
      data: {
        data: {},
      },
    };
    expect(getFirstZodError(response)).toBe('Unknown error occurred.');
  });

  it('should return unknown error when fieldErrors is empty', () => {
    const response = {
      data: {
        data: {
          fieldErrors: {},
        },
      },
    };
    expect(getFirstZodError(response)).toBe('Unknown error occurred.');
  });

  it('should return unknown error when field errors array is empty', () => {
    const response = {
      data: {
        data: {
          fieldErrors: {
            email: [],
          },
        },
      },
    };
    expect(getFirstZodError(response)).toBe('Unknown error occurred.');
  });
});
