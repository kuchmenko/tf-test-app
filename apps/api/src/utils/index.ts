export const nanoToHuman = (nano: bigint) => {
  const seconds = nano / 1000000000n;
  const milliseconds = (nano % 1000000000n) / 1000000n;
  const microseconds = (nano % 1000000n) / 1000n;
  const nanoseconds = nano % 1000n;

  return `${seconds}s ${milliseconds}ms ${microseconds}µs ${nanoseconds}ns`;
};
