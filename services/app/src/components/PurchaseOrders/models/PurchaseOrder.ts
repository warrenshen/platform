import { PurchaseOrderItem } from "./PurchaseOrderItem";

export interface PurchaseOrder {
  id: string;
  vendor_id: string;
  currency: string;
  delivery_date: Date;
  created_at: Date;
  updated_at: Date;
  address: string;
  country: string;
  city: string;
  zip_code: string;
  purchase_order_number: string;
  parent_purchase_order_id: string;
  parent_amount: number;
  amount_invoiced: number;
  amount: number;
  status: string;
  remarks: string;
  debtor: string;
  items: PurchaseOrderItem[];
  associatedPurchaseOrderIds: string[];
}

export const PURCHASE_ORDER_EMPTY: PurchaseOrder = {
  parent_purchase_order_id: "",
  purchase_order_number: "",
  associatedPurchaseOrderIds: [],
  id: "",
  vendor_id: "",
  parent_amount: 0,
  debtor: "",
  amount: 0,
  amount_invoiced: 0,
  status: "",
  currency: "USD",
  delivery_date: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  address: "",
  remarks: "",
  items: [],
  country: "",
  zip_code: "",
  city: "",
};
