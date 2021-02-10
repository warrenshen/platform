export function truncateUuid(uuid: string) {
  return uuid.length > 8 ? `${uuid.substring(0, 8)}...` : "Invalid UUID";
}
