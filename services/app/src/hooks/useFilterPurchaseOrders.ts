import { filter } from "lodash";
import { useMemo } from "react";
import {
  GetPurchaseOrdersByStatusesSubscription,
  PurchaseOrderFragment,
} from "generated/graphql";

export const useFilterPurchaseOrderBySearchQuery = (
  searchQuery: string,
  data: GetPurchaseOrdersByStatusesSubscription | undefined
): PurchaseOrderFragment[] => {
  const doesSearchQueryExistInPurchaseOrderNameOrNumber = ({
    company,
    order_number,
  }: PurchaseOrderFragment) =>
    `${company.name} ${order_number}`
      .toLowerCase()
      .indexOf(searchQuery.toLowerCase()) >= 0;

  return useMemo(
    () =>
      filter(
        data?.purchase_orders || [],
        doesSearchQueryExistInPurchaseOrderNameOrNumber
      ),
    [searchQuery, data?.purchase_orders]
  );
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
