export function nowStr(): string {
  const date = new Date();
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}
