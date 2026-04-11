export function toTimestamp(value: string): number {
  return new Date(value).getTime();
}

export function isWithinRange(now: string, start: string, end: string): boolean {
  const current = toTimestamp(now);
  return current >= toTimestamp(start) && current <= toTimestamp(end);
}

export function isBefore(now: string, target: string): boolean {
  return toTimestamp(now) < toTimestamp(target);
}

export function sortByStart<T extends { start: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => toTimestamp(left.start) - toTimestamp(right.start));
}
