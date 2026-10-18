export type ZodErrorResponse = {
  data?: {
    data?: {
      fieldErrors?: Record<string, Array<string>>;
      formErrors?: string[];
    };
  };
} | null;

type ZodErrorNestedData = NonNullable<NonNullable<ZodErrorResponse>['data']>['data'];

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
  const nestedData = value.data?.data as ZodErrorNestedData | undefined;
  return isRecord(nestedData?.fieldErrors) || Array.isArray(nestedData?.formErrors);
}

const unknownError = 'Unknown error occurred.';
export function getFirstZodError (errorResponse: unknown): string {
  if (!errorResponse || !isZodErrorResponse(errorResponse)) {
    return unknownError;
  }
  if (!errorResponse.data?.data) { return unknownError; }
  const fieldErrors = errorResponse.data.data.fieldErrors;
  if (!fieldErrors) {
    return unknownError;
  }

  const [lastKey, lastErrors] = [...Object.entries(fieldErrors)].at(-1) ?? [];
  if (!lastKey || !lastErrors?.length) {
    return unknownError;
  }

  return `${lastKey}: ${lastErrors[0]}`;
}
