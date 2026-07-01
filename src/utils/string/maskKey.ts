const VISIBLE_CHARACTERS = 10;

export function maskKey(key: string): string {
  if (key.length <= VISIBLE_CHARACTERS) return key;
  return key.slice(0, VISIBLE_CHARACTERS - 1) + "****";
}
