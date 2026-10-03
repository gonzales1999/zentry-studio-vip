import { interpolate } from 'remotion';

/**
 * Ensures inputRange is strictly monotonically increasing to prevent Remotion
 * from throwing: "InputRange must be strictly monotonically increasing but got [0, 10, 6, 15]"
 */
export const safeInterpolate = (
  input: number,
  inputRange: readonly number[] | number[],
  outputRange: readonly number[] | number[],
  options?: Parameters<typeof interpolate>[3]
): number => {
  if (!inputRange || inputRange.length < 2) return (outputRange[0] as number) ?? 0;

  const strictlyMonotonic: number[] = [];
  for (let i = 0; i < inputRange.length; i++) {
    const rawVal = inputRange[i];
    const val = Number.isFinite(rawVal) ? rawVal : i;
    if (i === 0) {
      strictlyMonotonic.push(val);
    } else {
      const prev = strictlyMonotonic[i - 1];
      strictlyMonotonic.push(val > prev ? val : prev + 0.01);
    }
  }

  return interpolate(input, strictlyMonotonic, outputRange as number[], options);
};
