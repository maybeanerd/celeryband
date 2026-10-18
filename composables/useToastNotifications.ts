type ZodErrorResponse = { data?: { fieldErrors?: Record<string, Array<string>>; formErrors?: string[] } } | null;

function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isZodErrorResponse (value: unknown): value is ZodErrorResponse {
  if (!isRecord(value)) return false;
  if (!isRecord(value.data)) return false;
  return Array.isArray(value.data.fieldErrors) || Array.isArray(value.data.formErrors);
}

const unknownError = 'Unknown error occurred.';
function getFirstError (errorResponse: unknown): string {
  if (!isZodErrorResponse(errorResponse)) return unknownError;
  const fieldErrors = errorResponse.data?.fieldErrors;
  if (!fieldErrors) {
    return unknownError;
  }

  const firstError = Object.entries(fieldErrors).pop();

  if (!firstError) {
    return unknownError;
  }

  return `${firstError.at(0)}: ${firstError.at(1)?.at(0) ?? unknownError}`;
}

export function useToastNotifications () {
  const toast = useToast();

  function showErrorToast (error: string, description: string) {
    toast.add({
      title: error,
      description,
      color: 'error',
    });
  }

  function showSuccessToast (title: string, description: string) {
    toast.add({
      title,
      description,
      color: 'success',
    });
  }

  function showZodErrorToast (title: string, error: MaybeRef<unknown>) {
    const errorMessage = getFirstError(unref(error));

    showErrorToast(title, errorMessage);
  }

  return {
    showErrorToast,
    showSuccessToast,
    showZodErrorToast,
  };
}
