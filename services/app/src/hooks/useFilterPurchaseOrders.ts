import {
  GetConfirmedPurchaseOrdersSubscription,
  GetPurchaseOrdersSubscription,
  PurchaseOrderFragment,
} from "generated/graphql";
import { filter } from "lodash";
import { useMemo } from "react";

export const useFilterConfirmedPurchaseOrders = (
  searchQuery: string,
  data: GetConfirmedPurchaseOrdersSubscription | undefined
): PurchaseOrderFragment[] => {
  return useMemo(() => {
    const doesSearchQueryExistInConfirmedPurchaseOrder = ({
      company,
      order_number,
    }: PurchaseOrderFragment) =>
      `${company.name} ${order_number}`
        .toLowerCase()
        .indexOf(searchQuery.toLowerCase()) >= 0;

    return filter(
      data?.purchase_orders || [],
      doesSearchQueryExistInConfirmedPurchaseOrder
    );
  }, [searchQuery, data?.purchase_orders]);
};

export const useFilterPurchaseOrders = (
  searchQuery: string,
  data: GetPurchaseOrdersSubscription | undefined
): PurchaseOrderFragment[] => {
  return useMemo(() => {
    const doesSearchQueryExistInPurchaseOrder = ({
      company,
      order_number,
      vendor,
    }: PurchaseOrderFragment) =>
      `${company.name} ${order_number} ${vendor?.name}`
        .toLowerCase()
        .indexOf(searchQuery.toLowerCase()) >= 0;

    return filter(
      data?.purchase_orders || [],
      doesSearchQueryExistInPurchaseOrder
    );
  }, [searchQuery, data?.purchase_orders]);
};

export const useFilterPurchaseOrdersBySelectedIds = (
  purchaseOrders: PurchaseOrderFragment[],
  selectedPurchaseOrderIds: number[]
) =>
  useMemo(
    () =>
      selectedPurchaseOrderIds.length === 1
        ? purchaseOrders.find(
            (purchaseOrder) => purchaseOrder.id === selectedPurchaseOrderIds[0]
          )
        : null,
    [purchaseOrders, selectedPurchaseOrderIds]
  );
