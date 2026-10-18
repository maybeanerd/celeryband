import { type ZodErrorResponse } from '~/utils/zodErrorHandling';

const unknownError = 'Unknown error occurred.';
function getFirstZodErrorMessage (errorResponse: ZodErrorResponse): string {
  const fieldErrors = errorResponse.data?.data?.fieldErrors;
  if (!fieldErrors) {
    return unknownError;
  }

  const [lastKey, lastErrors] = [...Object.entries(fieldErrors)].at(-1) ?? [];
  if (!lastKey || !lastErrors?.length) {
    return unknownError;
  }

  return `${lastKey}: ${lastErrors[0]}`;
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

  function showZodErrorToast (title: string, error: MaybeRef<ZodErrorResponse>) {
    const errorMessage = getFirstZodErrorMessage(unref(error));

    showErrorToast(title, errorMessage);
  }

  return {
    showErrorToast,
    showSuccessToast,
    showZodErrorToast,
  };
}
