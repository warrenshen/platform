export const ColumnWidths = {
  // Fixed width columns.
  Comment: 250,
  Count: 140,
  Currency: 130,
  Date: 130,
  Datetime: 220,
  DateContract: 220,
  Identifier: 110,
  Open: 90,
  PhoneNumber: 150,
  MetrcId: 140,
  Status: 170,
  Type: 160,
  UserName: 130,
  UserRole: 200,

  Actions: 75,

  // Variable width columns (customer name, purchase order number, etc).
  MinWidth: 160,
};

// Truncates given string to given character length (count).
export function truncateString(value: string, count: number = 64) {
  return value.length > count ? `${value.substring(0, count)}...` : value;
}
