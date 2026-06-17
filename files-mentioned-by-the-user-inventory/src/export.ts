import type { InventoryItem } from './types';

const columns: Array<[keyof InventoryItem, string]> = [
  ['id', 'id'],
  ['item_name', 'item_name'],
  ['category', 'category'],
  ['description', 'description'],
  ['quantity', 'quantity'],
  ['unit', 'unit'],
  ['location', 'location'],
  ['supplier_name', 'supplier_name'],
  ['supplier_contact', 'supplier_contact'],
  ['supplier_website', 'supplier_website'],
  ['purchase_date', 'purchase_date'],
  ['cost', 'cost'],
  ['notes', 'notes'],
  ['created_at', 'created_at'],
  ['updated_at', 'updated_at'],
  ['created_by', 'created_by']
];

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function buildCsv(items: InventoryItem[], excelCompatible = false) {
  const header = columns.map(([, label]) => label).join(',');
  const rows = items.map((item) => columns.map(([key]) => csvEscape(item[key])).join(','));
  const body = [header, ...rows].join('\r\n');
  return excelCompatible ? `\ufeff${body}` : body;
}

export function downloadCsv(items: InventoryItem[], excelCompatible = false) {
  const csv = buildCsv(items, excelCompatible);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = excelCompatible
    ? `inventory-excel-${date}.csv`
    : `inventory-${date}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
