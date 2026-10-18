import { isZodErrorResponse, type ZodErrorResponse } from '~/utils/zodErrorHandling';

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
