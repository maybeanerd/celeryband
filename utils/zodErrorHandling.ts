export type ZodErrorResponse = {
  data?: {
    fieldErrors?: Record<string, Array<string>>;
    formErrors?: string[];
  };
} | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isZodErrorResponse(value: unknown): value is ZodErrorResponse {
  if (!isRecord(value)) return false;
  if (!isRecord(value.data)) return false;
  return Array.isArray(value.data.fieldErrors) || Array.isArray(value.data.formErrors);
}
