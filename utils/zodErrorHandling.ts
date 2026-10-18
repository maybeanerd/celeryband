export type ZodErrorResponse = {
  data?: {
    fieldErrors?: Record<string, Array<string>>;
    formErrors?: string[];
  };
} | null;

function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isZodErrorResponse (value: unknown): value is ZodErrorResponse {
  if (!isRecord(value)) {
    return false;
  }
  if (!isRecord(value.data)) {
    return false;
  }
  return Array.isArray(value.data.fieldErrors) || Array.isArray(value.data.formErrors);
}

const unknownError = 'Unknown error occurred.';
export function getFirstZodError (errorResponse: unknown): string {
  if (!isZodErrorResponse(errorResponse)) {
    return unknownError;
  }
  const fieldErrors = errorResponse.data?.fieldErrors;
  if (!fieldErrors) {
    return unknownError;
  }

  const [lastKey, lastErrors] = [...Object.entries(fieldErrors)].at(-1) ?? [];
  if (!lastKey || !lastErrors?.length) {
    return unknownError;
  }

  return `${lastKey}: ${lastErrors[0]}`;
}
