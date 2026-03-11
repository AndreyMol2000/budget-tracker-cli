export function escapeCsvValue(value: string | number): string {
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
}