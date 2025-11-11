const colorPalette = [
  'var(--ui-color-primary-500)',
  'var(--ui-color-success-500)',
  'var(--ui-color-info-500)',
  'var(--ui-color-warning-500)',
  'var(--ui-color-error-500)',
  'var(--ui-color-secondary-500)',
  'var(--ui-color-primary-600)',
  'var(--ui-color-success-600)',
  'var(--ui-color-info-600)',
  'var(--ui-color-warning-600)',
  'var(--ui-color-error-600)',
  'var(--ui-color-secondary-600)',
  'var(--ui-color-primary-400)',
  'var(--ui-color-success-400)',
  'var(--ui-color-info-400)',
  'var(--ui-color-warning-400)',
  'var(--ui-color-error-400)',
  'var(--ui-color-secondary-400)',
]

export function getColorForPackage(index: number): string {
  return colorPalette[index % colorPalette.length]
}
