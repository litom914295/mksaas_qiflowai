export function invalidClass(isInvalid: boolean): string {
  return isInvalid
    ? 'aria-invalid aria-invalid:border-destructive aria-invalid:ring-destructive/20'
    : '';
}
