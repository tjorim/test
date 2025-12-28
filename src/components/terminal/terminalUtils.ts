/**
 * Map a shift code to a terminal color name.
 *
 * @param shiftCode - Shift identifier: 'M' for morning, 'E' for evening, 'N' for night
 * @returns The terminal color name: `yellow` for 'M', `magenta` for 'E', `blue` for 'N', `gray` otherwise
 */
export function getShiftColor(shiftCode: string): string {
  if (shiftCode === 'M') return 'yellow';
  if (shiftCode === 'E') return 'magenta';
  if (shiftCode === 'N') return 'blue';
  return 'gray';
}

/**
 * Maps a shift code to a representative emoji.
 *
 * @param shiftCode - Shift identifier: 'M' for morning, 'E' for evening, 'N' for night; other values use a default.
 * @returns The emoji for the specified shift: '🌅' for morning, '🌆' for evening, '🌙' for night, '🏠' otherwise.
 */
export function getShiftEmoji(shiftCode: string): string {
  if (shiftCode === 'M') return '🌅';
  if (shiftCode === 'E') return '🌆';
  if (shiftCode === 'N') return '🌙';
  return '🏠';
}
