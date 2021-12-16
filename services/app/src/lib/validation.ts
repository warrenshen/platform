export function isEmailValid(email: string | null | undefined): boolean {
  return (
    !!email && email.length > 0 && !!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/gi)
  );
}
