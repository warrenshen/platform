import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PurchaseOrderForm from "components/PurchaseOrders/PurchaseOrderForm";
import Modal from "components/Shared/Modal/Modal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrders,
  PurchaseOrdersInsertInput,
  RequestStatusEnum,
  usePurchaseOrderQuery,
  UserRolesEnum,
  useVendorsByPartnerCompanyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  createUpdatePurchaseOrderAndSubmitMutation,
  createUpdatePurchaseOrderAsDraftMutation,
} from "lib/api/purchaseOrders";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

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

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = role === UserRolesEnum.BankAdmin;

  // Default PurchaseOrder for CREATE case.
  const newPurchaseOrder = {
    vendor_id: null,
    order_number: "",
    order_date: null,
    delivery_date: null,
    amount: null,
    is_cannabis: true,
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
  ] = useState<PurchaseOrderFileFragment>();
  const [purchaseOrderCannabisFiles, setPurchaseOrderCannabisFiles] = useState<
    PurchaseOrderFileFragment[]
  >([]);

  const { loading: isExistingPurchaseOrderLoading } = usePurchaseOrderQuery({
    skip: actionType === ActionType.New,
    fetchPolicy: "network-only",
    variables: {
      id: purchaseOrderId,
    },
    onCompleted: (data) => {
      const existingPurchaseOrder = data?.purchase_orders_by_pk;
      if (actionType === ActionType.Update && existingPurchaseOrder) {
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
      }
    },
  });

  const {
    data,
    loading: isSelectableVendorsLoading,
  } = useVendorsByPartnerCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });
  const vendors = data?.vendors || [];

  const [
    createUpdatePurchaseOrderAsDraft,
    { loading: isCreateUpdatePurchaseOrderAsDraftLoading },
  ] = useCustomMutation(createUpdatePurchaseOrderAsDraftMutation);

  const [
    createUpdatePurchaseOrderAndSubmit,
    { loading: isCreateUpdatePurchaseOrderAndSubmitLoading },
  ] = useCustomMutation(createUpdatePurchaseOrderAndSubmitMutation);

  const preparePurchaseOrderFiles = () => {
    const purchaseOrderFileData = purchaseOrderFile && {
      purchase_order_id: purchaseOrderFile.purchase_order_id,
      file_id: purchaseOrderFile.file_id,
      file_type: purchaseOrderFile.file_type,
    };
    const cannabisPurchaseOrderFilesData =
      purchaseOrderCannabisFiles &&
      purchaseOrderCannabisFiles.map((purchaseOrderFile) => ({
        purchase_order_id: purchaseOrderFile.purchase_order_id,
        file_id: purchaseOrderFile.file_id,
        file_type: purchaseOrderFile.file_type,
      }));
    const purchaseOrderFilesData = [
      ...(purchaseOrderFileData ? [purchaseOrderFileData] : []),
      ...(cannabisPurchaseOrderFilesData || []),
    ];
    return purchaseOrderFilesData;
  };

  const handleClickSaveDraft = async () => {
    const purchaseOrderFilesData = preparePurchaseOrderFiles();

    const response = await createUpdatePurchaseOrderAsDraft({
      variables: {
        purchase_order: {
          id: actionType === ActionType.Update ? purchaseOrderId : null,
          company_id: companyId,
          vendor_id: purchaseOrder.vendor_id,
          order_number: purchaseOrder.order_number || null,
          order_date: purchaseOrder.order_date || null,
          delivery_date: purchaseOrder.delivery_date || null,
          amount: purchaseOrder.amount || null,
          is_cannabis: purchaseOrder.is_cannabis,
          status: RequestStatusEnum.Drafted,
        },
        purchase_order_files: purchaseOrderFilesData,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not save purchase order as draft. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Purchase order saved as draft.");
      handleClose();
    }
  };

  const handleClickSaveSubmit = async () => {
    const purchaseOrderFilesData = preparePurchaseOrderFiles();

    const response = await createUpdatePurchaseOrderAndSubmit({
      variables: {
        purchase_order: {
          id: actionType === ActionType.Update ? purchaseOrderId : null,
          company_id: companyId,
          vendor_id: purchaseOrder.vendor_id,
          order_number: purchaseOrder.order_number || null,
          order_date: purchaseOrder.order_date || null,
          delivery_date: purchaseOrder.delivery_date || null,
          amount: purchaseOrder.amount || null,
          is_cannabis: purchaseOrder.is_cannabis,
          status: RequestStatusEnum.Drafted,
        },
        purchase_order_files: purchaseOrderFilesData,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not save and submit purchase order. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Purchase order saved and submitted to vendor.");
      handleClose();
    }
  };

  const isDialogReady =
    !isExistingPurchaseOrderLoading && !isSelectableVendorsLoading;
  const isFormValid = !!purchaseOrder.vendor_id;
  const isFormLoading =
    isCreateUpdatePurchaseOrderAsDraftLoading ||
    isCreateUpdatePurchaseOrderAndSubmitLoading;
  const isSaveDraftDisabled =
    !isFormValid || isFormLoading || !purchaseOrder.order_number;
  const isSaveSubmitDisabled =
    isSaveDraftDisabled ||
    !vendors?.find((vendor) => vendor.id === purchaseOrder.vendor_id)
      ?.company_vendor_partnerships[0].approved_at ||
    !purchaseOrder.order_date ||
    !purchaseOrder.delivery_date ||
    !purchaseOrder.amount ||
    !purchaseOrderFile ||
    (!!purchaseOrder.is_cannabis && purchaseOrderCannabisFiles.length <= 0);

  return isDialogReady ? (
    <Modal
      isPrimaryActionDisabled={isSaveSubmitDisabled}
      isSecondaryActionDisabled={isSaveDraftDisabled}
      title={`${
        actionType === ActionType.Update ? "Edit" : "Create"
      } Purchase Order`}
      primaryActionText={"Save and Submit"}
      secondaryActionText={"Save as Draft"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSaveSubmit}
      handleSecondaryAction={handleClickSaveDraft}
    >
      <>
        {isBankUser && (
          <Box mt={2} mb={3}>
            <Alert severity="warning">
              <Typography variant="body1">
                {`Warning: you are ${
                  actionType === ActionType.Update ? "editing" : "creating"
                } a purchase order on behalf of this
                customer (only bank admins can do this).`}
              </Typography>
            </Alert>
          </Box>
        )}
        <PurchaseOrderForm
          companyId={companyId}
          purchaseOrder={purchaseOrder}
          purchaseOrderFile={purchaseOrderFile}
          purchaseOrderCannabisFiles={purchaseOrderCannabisFiles}
          vendors={data?.vendors || []}
          setPurchaseOrder={setPurchaseOrder}
          setPurchaseOrderFile={setPurchaseOrderFile}
          setPurchaseOrderCannabisFiles={setPurchaseOrderCannabisFiles}
        />
      </>
    </Modal>
  ) : null;
}
