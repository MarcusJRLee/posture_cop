/** Log a latency tick. */
export function logTick(name: string) {
  performance.mark(name);
}
