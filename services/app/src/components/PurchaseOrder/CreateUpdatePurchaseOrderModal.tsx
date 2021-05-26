import { Box, Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PurchaseOrderForm from "components/PurchaseOrder/PurchaseOrderForm";
import PurchaseOrderFormV2 from "components/PurchaseOrder/PurchaseOrderFormV2";
import Modal from "components/Shared/Modal/Modal";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  MetrcTransferFragment,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrderMetrcTransferFragment,
  PurchaseOrders,
  PurchaseOrdersInsertInput,
  RequestStatusEnum,
  useGetVendorsByPartnerCompanyQuery,
  usePurchaseOrderQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createUpdatePurchaseOrderAndSubmitMutation,
  createUpdatePurchaseOrderAsDraftMutation,
  updatePurchaseOrderMutation,
} from "lib/api/purchaseOrders";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useMemo, useState } from "react";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  purchaseOrderId: PurchaseOrders["id"] | null;
  handleClose: () => void;
}

export default function CreateUpdatePurchaseOrderModal({
  actionType,
  companyId,
  purchaseOrderId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const isActionTypeUpdate = actionType === ActionType.Update;

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  // Default PurchaseOrder for CREATE case.
  const newPurchaseOrder = {
    vendor_id: null,
    order_number: "",
    order_date: null,
    delivery_date: null,
    amount: null,
    is_cannabis: true,
    is_metrc_based: null, // null = not known yet
    status: RequestStatusEnum.Drafted,
  } as PurchaseOrdersInsertInput;

  const [purchaseOrder, setPurchaseOrder] = useState(newPurchaseOrder);

  /*
  There are different types of files related to a Purchase Order.
  Purchase order file: exactly one file attachment that is required to be present to submit a PO for approval.
  Purchase order cannabis file(s): one or more file attachments present if PO contains cannabis or other derivatives.
  */
  const [
    purchaseOrderFile,
    setPurchaseOrderFile,
  ] = useState<PurchaseOrderFileFragment | null>(null);
  const [purchaseOrderCannabisFiles, setPurchaseOrderCannabisFiles] = useState<
    PurchaseOrderFileFragment[]
  >([]);
  const [
    purchaseOrderMetrcTransfers,
    setPurchaseOrderMetrcTransfers,
  ] = useState<PurchaseOrderMetrcTransferFragment[]>([]);

  const { loading: isExistingPurchaseOrderLoading } = usePurchaseOrderQuery({
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
        setPurchaseOrderFile(
          existingPurchaseOrder.purchase_order_files.filter(
            (purchaseOrderFile) =>
              purchaseOrderFile.file_type ===
              PurchaseOrderFileTypeEnum.PurchaseOrder
          )[0]
        );
        setPurchaseOrderCannabisFiles(
          existingPurchaseOrder.purchase_order_files.filter(
            (purchaseOrderFile) =>
              purchaseOrderFile.file_type === PurchaseOrderFileTypeEnum.Cannabis
          )
        );
        setPurchaseOrderMetrcTransfers(
          existingPurchaseOrder.purchase_order_metrc_transfers
        );
      }
    },
  });

  const {
    data,
    loading: isSelectableVendorsLoading,
  } = useGetVendorsByPartnerCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });
  const selectableVendors = data?.vendors || [];
  const allMetrcTransfers = useMemo(
    () => data?.companies_by_pk?.metrc_transfers || [],
    [data?.companies_by_pk]
  );
  const selectedMetrcTransfers = useMemo(
    () =>
      purchaseOrderMetrcTransfers
        .map((purchaseOrderMetrcTransfer) =>
          allMetrcTransfers.find(
            (metrcTransfer) =>
              metrcTransfer.id === purchaseOrderMetrcTransfer.metrc_transfer_id
          )
        )
        .filter((selectedMetrcTransfer) => !!selectedMetrcTransfer),
    [allMetrcTransfers, purchaseOrderMetrcTransfers]
  ) as MetrcTransferFragment[];
  const selectableMetrcTransfers = useMemo(
    () =>
      allMetrcTransfers.filter(
        (metrcTransfer) =>
          !selectedMetrcTransfers.find(
            (selectedMetrcTransfer) =>
              selectedMetrcTransfer.id === metrcTransfer.id
          )
      ),
    [allMetrcTransfers, selectedMetrcTransfers]
  );
  const metrcApiKeys = data?.companies_by_pk?.metrc_api_keys || [];

  const isMetrcEnabled = metrcApiKeys.length > 0;

  const [
    createUpdatePurchaseOrderAsDraft,
    { loading: isCreateUpdatePurchaseOrderAsDraftLoading },
  ] = useCustomMutation(createUpdatePurchaseOrderAsDraftMutation);

  const [
    createUpdatePurchaseOrderAndSubmit,
    { loading: isCreateUpdatePurchaseOrderAndSubmitLoading },
  ] = useCustomMutation(createUpdatePurchaseOrderAndSubmitMutation);

  const [
    updatePurchaseOrder,
    { loading: isUpdatePurchaseOrderLoading },
  ] = useCustomMutation(updatePurchaseOrderMutation);

  const preparePurchaseOrder = () => {
    return {
      id: isActionTypeUpdate ? purchaseOrderId : null,
      company_id: companyId,
      vendor_id: purchaseOrder.vendor_id,
      order_number: purchaseOrder.order_number,
      order_date: purchaseOrder.order_date,
      delivery_date: purchaseOrder.delivery_date,
      amount: purchaseOrder.amount,
      is_cannabis: purchaseOrder.is_cannabis,
      is_metrc_based: purchaseOrder.is_metrc_based,
      status: RequestStatusEnum.Drafted,
    };
  };

  const preparePurchaseOrderFiles = () => {
    const purchaseOrderFileData = purchaseOrderFile && {
      purchase_order_id: purchaseOrderFile.purchase_order_id,
      file_id: purchaseOrderFile.file_id,
      file_type: purchaseOrderFile.file_type,
    };
    const purchaseOrderCannabisFilesData = purchaseOrderCannabisFiles.map(
      (purchaseOrderFile) => ({
        purchase_order_id: purchaseOrderFile.purchase_order_id,
        file_id: purchaseOrderFile.file_id,
        file_type: purchaseOrderFile.file_type,
      })
    );
    const purchaseOrderFilesData = [
      ...(purchaseOrderFileData ? [purchaseOrderFileData] : []),
      ...purchaseOrderCannabisFilesData,
    ];
    return purchaseOrderFilesData;
  };

  const preparePurchaseOrderMetrcTransfers = () => {
    return selectedMetrcTransfers.map((selectedMetrcTransfer) => ({
      purchase_order_id: purchaseOrder.id,
      metrc_transfer_id: selectedMetrcTransfer.id,
    }));
  };

  const prepareMutationVariables = () => {
    return {
      purchase_order: preparePurchaseOrder(),
      purchase_order_files: preparePurchaseOrderFiles(),
      purchase_order_metrc_transfers: preparePurchaseOrderMetrcTransfers(),
    };
  };
  const handleClickSaveDraft = async () => {
    const response = await createUpdatePurchaseOrderAsDraft({
      variables: prepareMutationVariables(),
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
    const response = await createUpdatePurchaseOrderAndSubmit({
      variables: prepareMutationVariables(),
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
    const response = await updatePurchaseOrder({
      variables: prepareMutationVariables(),
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
  // If Metrc based: Metrc manifest(s) and order number
  // If not Metrc based: vendor and order number
  const isFormValid =
    (purchaseOrder.is_metrc_based && !!purchaseOrder.order_number) ||
    (!purchaseOrder.is_metrc_based &&
      !!purchaseOrder.vendor_id &&
      !!purchaseOrder.order_number);
  const isFormLoading =
    isCreateUpdatePurchaseOrderAsDraftLoading ||
    isCreateUpdatePurchaseOrderAndSubmitLoading ||
    isUpdatePurchaseOrderLoading;
  const isSecondaryActionDisabled =
    !isFormValid || isFormLoading || !purchaseOrder.order_number;
  const isPrimaryActionDisabled = isActionTypeUpdate
    ? isSecondaryActionDisabled
    : isSecondaryActionDisabled ||
      !selectableVendors?.find(
        (vendor) => vendor.id === purchaseOrder.vendor_id
      )?.company_vendor_partnerships[0].approved_at ||
      !purchaseOrder.order_date ||
      !purchaseOrder.delivery_date ||
      !purchaseOrder.amount ||
      !purchaseOrderFile ||
      (!!purchaseOrder.is_cannabis && purchaseOrderCannabisFiles.length <= 0);

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      dataCy={"create-purchase-order-modal"}
      isPrimaryActionDisabled={isPrimaryActionDisabled}
      isSecondaryActionDisabled={isSecondaryActionDisabled}
      title={`${isActionTypeUpdate ? "Edit" : "Create"} Purchase Order`}
      primaryActionText={isActionTypeUpdate ? "Save" : "Save and Submit"}
      secondaryActionText={!isActionTypeUpdate ? "Save as Draft" : null}
      handleClose={handleClose}
      handlePrimaryAction={
        isActionTypeUpdate ? handleClickUpdate : handleClickSaveSubmit
      }
      handleSecondaryAction={!isActionTypeUpdate ? handleClickSaveDraft : null}
    >
      {isBankUser && (
        <Box mt={2} mb={6}>
          <Alert severity="warning">
            <Typography variant="body1">
              {`Warning: you are ${
                isActionTypeUpdate ? "editing" : "creating"
              } a purchase order on behalf of this
                customer (only bank admins can do this).`}
            </Typography>
          </Alert>
        </Box>
      )}
      {isMetrcEnabled && (
        <Box display="flex" flexDirection="column" mb={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!purchaseOrder.is_metrc_based}
                onChange={(event) =>
                  setPurchaseOrder({
                    ...purchaseOrder,
                    is_metrc_based: event.target.checked,
                  })
                }
                color="primary"
              />
            }
            label={"Create purchase order from Metrc manifest(s)?"}
          />
        </Box>
      )}
      {!!purchaseOrder.is_metrc_based ? (
        <PurchaseOrderFormV2
          purchaseOrder={purchaseOrder}
          selectableMetrcTransfers={selectableMetrcTransfers}
          selectableVendors={selectableVendors}
          selectedMetrcTransfers={selectedMetrcTransfers}
          setPurchaseOrder={setPurchaseOrder}
          setPurchaseOrderMetrcTransfers={setPurchaseOrderMetrcTransfers}
        />
      ) : (
        <PurchaseOrderForm
          companyId={companyId}
          purchaseOrder={purchaseOrder}
          purchaseOrderFile={purchaseOrderFile}
          purchaseOrderCannabisFiles={purchaseOrderCannabisFiles}
          selectableVendors={selectableVendors}
          setPurchaseOrder={setPurchaseOrder}
          setPurchaseOrderFile={setPurchaseOrderFile}
          setPurchaseOrderCannabisFiles={setPurchaseOrderCannabisFiles}
        />
      )}
    </Modal>
  );
}