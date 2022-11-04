import { mapValues } from "lodash";

export const ColumnWidths = {
  // Fixed width columns.
  Checkbox: 120,
  Comment: 250,
  Count: 140,
  Currency: 130,
  Date: 150,
  Datetime: 220,
  DateContract: 220,
  FileAttachment: 600,
  Identifier: 110,
  LongIdentifier: 220,
  License: 180,
  Open: 90,
  PhoneNumber: 150,
  ProductType: 180,
  MetrcId: 140,
  Status: 210,
  StatusChip: 300,
  Type: 160,
  UsState: 90,
  UserName: 130,
  UserRole: 200,

  Actions: 75,
  IconButton: 50,

  // Variable width columns (customer name, purchase order number, etc).
  MinWidth: 160,
};

// Truncates given string to given character length (count).
export function truncateString(value: string, count: number = 64) {
  return value.length > count ? `${value.substring(0, count)}...` : value;
}

// Replaces every null value in given RowModel (an object) with the undefined value.
// This is desired since a null value will break the export fucntionality of data grids.
export function formatRowModel(rowModel: object) {
  return mapValues(rowModel, (value: any) =>
    value !== null ? value : undefined
  );
}
