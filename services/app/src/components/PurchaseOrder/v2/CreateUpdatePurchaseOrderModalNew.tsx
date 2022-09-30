import { Box, Button, Typography } from "@material-ui/core";
import PurchaseOrderFormManualNew from "components/PurchaseOrder/v2/PurchaseOrderFormManualNew";
import PurchaseOrderFormMetrcNew from "components/PurchaseOrder/v2/PurchaseOrderFormMetrcNew";
import MetrcLogo from "components/Shared/Images/MetrcLogo.png";
import { ReactComponent as KeyboardIcon } from "components/Shared/Layout/Icons/Keyboard.svg";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  Files,
  GetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrderMetrcTransferFragment,
  PurchaseOrders,
  PurchaseOrdersInsertInput,
  RequestStatusEnum,
  useGetArtifactRelationsByCompanyIdQuery,
  useGetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery,
  useGetPurchaseOrderForCustomerQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { submitPurchaseOrderUpdateMutation } from "lib/api/purchaseOrders";
import { isFeatureFlagEnabled } from "lib/companies";
import { todayMinusXDaysDateStringServer } from "lib/date";
import {
  ActionType,
  FeatureFlagEnum,
  NewPurchaseOrderStatus,
  ProductTypeEnum,
} from "lib/enum";
import { isPurchaseOrderDueDateValid } from "lib/purchaseOrders";
import { isNull, mergeWith, uniqBy } from "lodash";
import { useMemo, useState } from "react";
import styled from "styled-components";

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  height: 128px;
  padding: 8px 0px;
  background-color: rgba(0, 0, 0, 0.07) !important;
`;

const Banner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 8px;

  background-color: rgb(232, 244, 253) !important;
`;

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  purchaseOrderId: PurchaseOrders["id"] | null;
  productType: ProductTypeEnum;
  handleClose: () => void;
}

export default function CreateUpdatePurchaseOrderModalNew({
  actionType,
  companyId,
  purchaseOrderId,
  productType,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const isActionTypeUpdate = actionType === ActionType.Update;

  // Default PurchaseOrder for CREATE case.
  const newPurchaseOrder: PurchaseOrdersInsertInput = {
    vendor_id: null,
    order_number: null,
    order_date: null,
    net_terms: null,
    amount: null,
    is_cannabis: true,
    is_metrc_based: null, // null = not known yet
    customer_note: null,
    status: RequestStatusEnum.Drafted,
    new_purchase_order_status: NewPurchaseOrderStatus.Draft,
  };

  const [purchaseOrder, setPurchaseOrder] = useState(newPurchaseOrder);

  /*
  There are different types of files related to a Purchase Order.
  Purchase order file(s): one or more file attachments that are required to be present to submit a PO for approval.
  Purchase order cannabis file(s): one or more file attachments present if PO contains cannabis or other derivatives.
  */
  const [purchaseOrderFiles, setPurchaseOrderFiles] = useState<
    PurchaseOrderFileFragment[]
  >([]);
  const [purchaseOrderCannabisFiles, setPurchaseOrderCannabisFiles] = useState<
    PurchaseOrderFileFragment[]
  >([]);
  const [purchaseOrderMetrcTransfers, setPurchaseOrderMetrcTransfers] =
    useState<PurchaseOrderMetrcTransferFragment[]>([]);

  const [frozenPurchaseOrderFileIds, setFrozenPurchaseOrderFileIds] = useState<
    Files["id"][]
  >([]);
  const [
    frozenPurchaseOrderCannabisFileIds,
    setFrozenPurchaseOrderCannabisFileIds,
  ] = useState<Files["id"][]>([]);

  const {
    loading: isExistingPurchaseOrderLoading,
    error: existingPurchaseOrderError,
  } = useGetPurchaseOrderForCustomerQuery({
    skip: actionType === ActionType.New,
    fetchPolicy: "network-only",
    variables: {
      id: purchaseOrderId,
    },
    onCompleted: (data) => {
      const existingPurchaseOrder = data?.purchase_orders_by_pk;
      if (isActionTypeUpdate && existingPurchaseOrder) {
        setPurchaseOrder(
          mergeWith(newPurchaseOrder, existingPurchaseOrder, (a, b) =>
            isNull(b) ? a : b
          )
        );
        setPurchaseOrderFiles(
          existingPurchaseOrder.purchase_order_files.filter(
            (purchaseOrderFile) =>
              purchaseOrderFile.file_type ===
              PurchaseOrderFileTypeEnum.PurchaseOrder
          )
        );
        setPurchaseOrderCannabisFiles(
          existingPurchaseOrder.purchase_order_files.filter(
            (purchaseOrderFile) =>
              purchaseOrderFile.file_type === PurchaseOrderFileTypeEnum.Cannabis
          )
        );
        setPurchaseOrderMetrcTransfers(
          existingPurchaseOrder.purchase_order_metrc_transfers || []
        );

        // This must live here as to not freeze new files before submitting
        // Otherwise, it freezes new files on rerender
        let purchaseOrderFileIds: Files["id"] = [];
        let purchaseOrderCannabisFileIds: Files["id"] = [];
        existingPurchaseOrder.purchase_order_files.forEach((pof) => {
          if (pof.file_type === PurchaseOrderFileTypeEnum.Cannabis) {
            purchaseOrderCannabisFileIds.push(pof.file_id);
          } else {
            purchaseOrderFileIds.push(pof.file_id);
          }
        });
        setFrozenPurchaseOrderFileIds(purchaseOrderFileIds);
        setFrozenPurchaseOrderCannabisFileIds(purchaseOrderCannabisFileIds);
      }
    },
  });

  if (existingPurchaseOrderError) {
    console.error({ existingPurchaseOrderError });
    alert(
      `Error in query (details in console): ${existingPurchaseOrderError.message}`
    );
  }

  const {
    data,
    loading: isSelectableVendorsLoading,
    error: selectableVendorsError,
  } = useGetArtifactRelationsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
    },
    onCompleted: (data) => {
      if (!isActionTypeUpdate) {
        /**
         * If product type is Dispensary Financing and Metrc key(s) are configured,
         * then default to the "create purchase order from Metrc transfers" flow.
         */
        if (productType === ProductTypeEnum.DispensaryFinancing) {
          const metrcApiKeys = data?.companies_by_pk?.metrc_api_keys || [];
          if (metrcApiKeys.length > 0) {
            setPurchaseOrder({
              ...purchaseOrder,
              is_metrc_based: true,
            });
          }
        }
      }
    },
  });

  if (selectableVendorsError) {
    console.error({ selectableVendorsError });
    alert(
      `Error in query (details in console): ${selectableVendorsError.message}`
    );
  }

  const companySettings = data?.companies_by_pk?.settings;
  const selectableVendors = data?.vendors || [];

  const metrcApiKeys = data?.companies_by_pk?.metrc_api_keys || [];
  /**
   * Flow "create purchase order from Metrc transfers" is enabled if:
   * 1. Metrc key(s) are configured.
   * 2. Product type is Dispensary Financing OR appropriate feature flag is enabled.
   */
  const isMetrcEnabled =
    metrcApiKeys.length > 0 &&
    (productType === ProductTypeEnum.DispensaryFinancing ||
      (companySettings &&
        isFeatureFlagEnabled(
          companySettings,
          FeatureFlagEnum.CreatePurchaseOrderFromMetrcTransfers
        )));
  const isMetrcBased = purchaseOrder.is_metrc_based;
  const selectedMetrcTransferRowIds = purchaseOrderMetrcTransfers.map(
    (purchaseOrderMetrcTransfer) => purchaseOrderMetrcTransfer.metrc_transfer_id
  );

  const { data: companyDeliveriesData, error: companyDeliveriesError } =
    useGetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery({
      // Wait until existing purchase order is loaded in update purchase order case.
      skip: isActionTypeUpdate && isExistingPurchaseOrderLoading,
      fetchPolicy: "network-only",
      variables: {
        company_id: companyId,
        // Fetch incoming company deliveries with transfer created in the last 120 days.
        start_created_date: todayMinusXDaysDateStringServer(120),
        transfer_row_ids: selectedMetrcTransferRowIds,
      },
    });

  if (companyDeliveriesError) {
    console.error({ companyDeliveriesError });
    alert(
      `Error in query (details in console): ${companyDeliveriesError.message}`
    );
  }

  const allCompanyDeliveries = useMemo(
    () =>
      uniqBy(
        companyDeliveriesData?.company_deliveries || [],
        (companyDelivery) => companyDelivery.metrc_transfer.manifest_number
      ),
    [companyDeliveriesData?.company_deliveries]
  );

  const selectedCompanyDeliveries = useMemo(
    () =>
      purchaseOrderMetrcTransfers
        .map((purchaseOrderMetrcTransfer) =>
          allCompanyDeliveries.find(
            (companyDelivery) =>
              companyDelivery.metrc_transfer.id ===
              purchaseOrderMetrcTransfer.metrc_transfer_id
          )
        )
        .filter((selectedCompanyDelivery) => !!selectedCompanyDelivery),
    [allCompanyDeliveries, purchaseOrderMetrcTransfers]
  ) as GetIncomingFromVendorCompanyDeliveriesByCompanyIdQuery["company_deliveries"];

  /**
   * Company deliveries which are selectable are those where:
   * 1. Company delivery is not selected already.
   * 2. If there are company deliveries already selected, company delivery's
   *    vendor ID is the same as the vendor ID of the selected company deliveries.
   *    This is because each PO can correspond with only one vendor, so all
   *    company deliveries for a PO must be for the same vendor.
   */
  const selectableCompanyDeliveries = useMemo(() => {
    const selectedVendorId =
      selectedCompanyDeliveries.length > 0
        ? selectedCompanyDeliveries[0].vendor_id
        : null;
    const notSelectedCompanyDeliveries = allCompanyDeliveries.filter(
      (companyDelivery) =>
        !selectedCompanyDeliveries.find(
          (selectedCompanyDelivery) =>
            selectedCompanyDelivery.id === companyDelivery.id
        )
    );
    if (selectedVendorId) {
      return notSelectedCompanyDeliveries.filter(
        (companyDelivery) => companyDelivery.vendor_id === selectedVendorId
      );
    } else {
      return notSelectedCompanyDeliveries;
    }
  }, [allCompanyDeliveries, selectedCompanyDeliveries]);

  const [
    submitPurchaseOrderUpdate,
    { loading: isSubmitPurchaseOrderUpdateLoading },
  ] = useCustomMutation(submitPurchaseOrderUpdateMutation);

  const preparePurchaseOrder = () => {
    return {
      id: isActionTypeUpdate ? purchaseOrderId : null,
      company_id: companyId,
      vendor_id: purchaseOrder.vendor_id,
      order_number: purchaseOrder.order_number,
      order_date: purchaseOrder.order_date,
      net_terms: purchaseOrder.net_terms,
      amount: purchaseOrder.amount,
      is_cannabis: purchaseOrder.is_cannabis,
      is_metrc_based: isMetrcBased,
      customer_note: purchaseOrder.customer_note,
      status: RequestStatusEnum.Drafted,
      new_purchase_order_status: NewPurchaseOrderStatus.Draft,
    };
  };

  const preparePurchaseOrderFiles = () => {
    const purchaseOrderFileData = purchaseOrderFiles.map(
      (purchaseOrderFile) => ({
        purchase_order_id: purchaseOrderFile.purchase_order_id,
        file_id: purchaseOrderFile.file_id,
        file_type: purchaseOrderFile.file_type,
      })
    );
    const purchaseOrderCannabisFilesData = purchaseOrderCannabisFiles.map(
      (purchaseOrderFile) => ({
        purchase_order_id: purchaseOrderFile.purchase_order_id,
        file_id: purchaseOrderFile.file_id,
        file_type: purchaseOrderFile.file_type,
      })
    );
    const purchaseOrderFilesData = [
      ...purchaseOrderFileData,
      ...purchaseOrderCannabisFilesData,
    ];
    return purchaseOrderFilesData;
  };

  const preparePurchaseOrderMetrcTransfers = () => {
    return selectedCompanyDeliveries.map((selectedCompanyDelivery) => ({
      purchase_order_id: purchaseOrder.id,
      metrc_transfer_id: selectedCompanyDelivery.metrc_transfer.id,
    }));
  };

  const handleClickSaveDraft = async () => {
    const response = await submitPurchaseOrderUpdate({
      variables: {
        purchase_order: preparePurchaseOrder(),
        purchase_order_files: preparePurchaseOrderFiles(),
        purchase_order_metrc_transfers: preparePurchaseOrderMetrcTransfers(),
        action: "draft",
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not save purchase order as draft. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        `Purchase order ${purchaseOrder.order_number} saved as draft.`
      );
      handleClose();
    }
  };

  const handleClickSaveSubmit = async () => {
    const response = await submitPurchaseOrderUpdate({
      variables: {
        purchase_order: preparePurchaseOrder(),
        purchase_order_files: preparePurchaseOrderFiles(),
        purchase_order_metrc_transfers: preparePurchaseOrderMetrcTransfers(),
        action: "submit",
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not save and submit purchase order. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        `Purchase order ${purchaseOrder.order_number} saved and submitted to vendor for review.`
      );
      handleClose();
    }
  };

  const handleClickUpdate = async () => {
    const response = await submitPurchaseOrderUpdate({
      variables: {
        purchase_order: preparePurchaseOrder(),
        purchase_order_files: preparePurchaseOrderFiles(),
        purchase_order_metrc_transfers: preparePurchaseOrderMetrcTransfers(),
        action: "submit",
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not update purchase order. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(
        `Purchase order ${purchaseOrder.order_number} saved.`
      );
      handleClose();
    }
  };

  const isDialogReady =
    !isExistingPurchaseOrderLoading && !isSelectableVendorsLoading;
  // The minimum amount of information to save as draft is:
  // If Metrc based: Metrc manifest and order number
  // If not Metrc based: vendor and order number
  const isFormValidMetrcBased =
    purchaseOrderMetrcTransfers.length > 0 && !!purchaseOrder.order_number;
  const isFormValidManual =
    !!purchaseOrder.vendor_id && !!purchaseOrder.order_number;
  const isFormValid =
    (isMetrcBased && isFormValidMetrcBased) ||
    (!isMetrcBased && isFormValidManual);

  const isFormLoading = isSubmitPurchaseOrderUpdateLoading;

  const isSecondaryActionDisabled = !isFormValid || isFormLoading;

  const { isDueDateValid } = isPurchaseOrderDueDateValid(
    purchaseOrder.order_date,
    purchaseOrder.net_terms
  );

  const isPrimaryActionDisabledMetrc =
    !purchaseOrder.order_date ||
    !isDueDateValid ||
    !purchaseOrder.amount ||
    !purchaseOrderFiles;
  const isPrimaryActionDisabledManual =
    !selectableVendors?.find((vendor) => vendor.id === purchaseOrder.vendor_id)
      ?.company_vendor_partnerships[0].approved_at ||
    !purchaseOrder.order_date ||
    !isDueDateValid ||
    purchaseOrder.net_terms == null ||
    !purchaseOrder.amount ||
    !purchaseOrderFiles ||
    (!!purchaseOrder.is_cannabis && purchaseOrderCannabisFiles.length <= 0);
  const isPrimaryActionDisabled = isActionTypeUpdate
    ? isSecondaryActionDisabled
    : isSecondaryActionDisabled ||
      (isMetrcBased && isPrimaryActionDisabledMetrc) ||
      (!isMetrcBased && isPrimaryActionDisabledManual);

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      dataCy={"create-purchase-order-modal"}
      isPrimaryActionDisabled={isPrimaryActionDisabled}
      isSecondaryActionDisabled={isSecondaryActionDisabled}
      title={`${isActionTypeUpdate ? "Edit" : "Create"} Purchase Order`}
      contentWidth={600}
      primaryActionText={"Save and Submit"}
      secondaryActionText={"Save as Draft"}
      handleClose={handleClose}
      handlePrimaryAction={
        isActionTypeUpdate ? handleClickUpdate : handleClickSaveSubmit
      }
      handleSecondaryAction={handleClickSaveDraft}
    >
      {isMetrcEnabled &&
        (isMetrcBased === null ? (
          <Box display="flex" flexDirection="column" mb={4}>
            <Box mb={2}>
              <Typography variant="body1" color="textSecondary">
                How would you like to enter in purchase order information?
              </Typography>
            </Box>
            <Buttons>
              <StyledButton
                onClick={() =>
                  setPurchaseOrder({ ...purchaseOrder, is_metrc_based: false })
                }
              >
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box height={40} mb={0.5}>
                    <KeyboardIcon
                      width={36}
                      height={36}
                      fill={false ? "rgba(203, 166, 121, 1.0)" : "#2c3e50"}
                      stroke={false ? "rgba(203, 166, 121, 1.0)" : "#2c3e50"}
                    />
                  </Box>
                  <Typography variant="body1">Create from scratch</Typography>
                  <Typography variant="body2" color="textPrimary">
                    (slower, more data entry)
                  </Typography>
                </Box>
              </StyledButton>
              <Box mr={2} />
              <StyledButton
                onClick={() =>
                  setPurchaseOrder({ ...purchaseOrder, is_metrc_based: true })
                }
              >
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box height={40} mb={0.5}>
                    <img
                      src={MetrcLogo}
                      alt="Metrc Logo"
                      width={40}
                      height={40}
                    />
                  </Box>
                  <Typography variant="body1">
                    Create from Metrc manifest
                  </Typography>
                  <Typography variant="body2" color="textPrimary">
                    (faster, recommended)
                  </Typography>
                </Box>
              </StyledButton>
            </Buttons>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" mb={4}>
            <Banner>
              <Typography variant="body2" color="textSecondary">
                {isMetrcBased ? (
                  <strong>Create purchase order from Metrc manifest</strong>
                ) : (
                  <strong>Create purchase order from scratch</strong>
                )}
                {" selected"}
              </Typography>
              <Button onClick={() => setPurchaseOrder({ ...newPurchaseOrder })}>
                Change
              </Button>
            </Banner>
          </Box>
        ))}
      {isMetrcEnabled ? (
        isMetrcBased !== null &&
        (!!isMetrcBased ? (
          <PurchaseOrderFormMetrcNew
            companyId={companyId}
            purchaseOrder={purchaseOrder}
            purchaseOrderFiles={purchaseOrderFiles}
            purchaseOrderCannabisFiles={purchaseOrderCannabisFiles}
            selectableCompanyDeliveries={selectableCompanyDeliveries}
            selectedCompanyDeliveries={selectedCompanyDeliveries}
            setPurchaseOrder={setPurchaseOrder}
            setPurchaseOrderFiles={setPurchaseOrderFiles}
            setPurchaseOrderCannabisFiles={setPurchaseOrderCannabisFiles}
            setPurchaseOrderMetrcTransfers={setPurchaseOrderMetrcTransfers}
            frozenPurchaseOrderFileIds={frozenPurchaseOrderFileIds}
            frozenPurchaseOrderCannabisFileIds={
              frozenPurchaseOrderCannabisFileIds
            }
          />
        ) : (
          <PurchaseOrderFormManualNew
            companyId={companyId}
            purchaseOrder={purchaseOrder}
            purchaseOrderFiles={purchaseOrderFiles}
            purchaseOrderCannabisFiles={purchaseOrderCannabisFiles}
            selectableVendors={selectableVendors}
            setPurchaseOrder={setPurchaseOrder}
            setPurchaseOrderFiles={setPurchaseOrderFiles}
            setPurchaseOrderCannabisFiles={setPurchaseOrderCannabisFiles}
            frozenPurchaseOrderFileIds={frozenPurchaseOrderFileIds}
            frozenPurchaseOrderCannabisFileIds={
              frozenPurchaseOrderCannabisFileIds
            }
          />
        ))
      ) : (
        <PurchaseOrderFormManualNew
          companyId={companyId}
          purchaseOrder={purchaseOrder}
          purchaseOrderFiles={purchaseOrderFiles}
          purchaseOrderCannabisFiles={purchaseOrderCannabisFiles}
          selectableVendors={selectableVendors}
          setPurchaseOrder={setPurchaseOrder}
          setPurchaseOrderFiles={setPurchaseOrderFiles}
          setPurchaseOrderCannabisFiles={setPurchaseOrderCannabisFiles}
          frozenPurchaseOrderFileIds={frozenPurchaseOrderFileIds}
          frozenPurchaseOrderCannabisFileIds={
            frozenPurchaseOrderCannabisFileIds
          }
        />
      )}
    </Modal>
  );
}
