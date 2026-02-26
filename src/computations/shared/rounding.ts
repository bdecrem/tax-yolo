/**
 * Round to the nearest dollar (standard IRS rounding).
 */
export function roundDollars(amount: number): number {
  return Math.round(amount);
}

/**
 * Round down to the nearest dollar (used in some computations).
 */
export function floorDollars(amount: number): number {
  return Math.floor(amount);
}
