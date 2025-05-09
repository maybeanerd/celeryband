export function capitalizeFirstCharacterOfWords (text: string | undefined | null): string {
  if (!text) {
    return '';
  }
  return text.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
