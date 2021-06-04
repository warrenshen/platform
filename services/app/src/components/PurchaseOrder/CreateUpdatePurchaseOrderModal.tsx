import { Box, Button, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import PurchaseOrderForm from "components/PurchaseOrder/PurchaseOrderForm";
import PurchaseOrderFormV2 from "components/PurchaseOrder/PurchaseOrderFormV2";
import { ReactComponent as CloudDownloadIcon } from "components/Shared/Layout/Icons/CloudDownload.svg";
import { ReactComponent as KeyboardIcon } from "components/Shared/Layout/Icons/Keyboard.svg";
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
  useGetArtifactRelationsByCompanyIdQuery,
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
  background-color: rgba(0, 0, 0, 0.07);
`;

const Banner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 8px;

  background-color: rgb(232, 244, 253);
`;

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

  const {
    loading: isExistingPurchaseOrderLoading,
    error: existingPurchaseOrderError,
  } = usePurchaseOrderQuery({
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
          existingPurchaseOrder.purchase_order_metrc_transfers || []
        );
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
      companyId,
    },
  });

  if (selectableVendorsError) {
    console.error({ selectableVendorsError });
    alert(
      `Error in query (details in console): ${selectableVendorsError.message}`
    );
  }

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
  const isMetrcBased = purchaseOrder.is_metrc_based;

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
      is_metrc_based: isMetrcBased,
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
  const isFormValidMetrcBased =
    purchaseOrderMetrcTransfers.length > 0 && !!purchaseOrder.order_number;
  const isFormValidManual =
    !!purchaseOrder.vendor_id && !!purchaseOrder.order_number;
  const isFormValid =
    (isMetrcBased && isFormValidMetrcBased) ||
    (!isMetrcBased && isFormValidManual);

  const isFormLoading =
    isCreateUpdatePurchaseOrderAsDraftLoading ||
    isCreateUpdatePurchaseOrderAndSubmitLoading ||
    isUpdatePurchaseOrderLoading;

  const isSecondaryActionDisabled = !isFormValid || isFormLoading;

  const isPrimaryActionDisabledMetrcBased =
    !purchaseOrder.order_date || !purchaseOrder.amount || !purchaseOrderFile;
  const isPrimaryActionDisabledManual =
    !selectableVendors?.find((vendor) => vendor.id === purchaseOrder.vendor_id)
      ?.company_vendor_partnerships[0].approved_at ||
    !purchaseOrder.order_date ||
    !purchaseOrder.delivery_date ||
    !purchaseOrder.amount ||
    !purchaseOrderFile ||
    (!!purchaseOrder.is_cannabis && purchaseOrderCannabisFiles.length <= 0);
  const isPrimaryActionDisabled = isActionTypeUpdate
    ? isSecondaryActionDisabled
    : isSecondaryActionDisabled ||
      (isMetrcBased && isPrimaryActionDisabledMetrcBased) ||
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
                  <Box mb={0.5}>
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
                  <Box mb={0.5}>
                    <CloudDownloadIcon
                      width={36}
                      height={36}
                      fill={false ? "rgba(203, 166, 121, 1.0)" : "#2c3e50"}
                      stroke={false ? "rgba(203, 166, 121, 1.0)" : "#2c3e50"}
                    />
                  </Box>
                  <Typography variant="body1">
                    Create from Metrc manifest(s)
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
                {isMetrcBased
                  ? '"Create purchase order from Metrc manifest(s)" selected'
                  : '"Create purchase order from scratch" selected'}
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
          <PurchaseOrderFormV2
            companyId={companyId}
            purchaseOrder={purchaseOrder}
            purchaseOrderFile={purchaseOrderFile}
            purchaseOrderCannabisFiles={purchaseOrderCannabisFiles}
            selectableMetrcTransfers={selectableMetrcTransfers}
            selectedMetrcTransfers={selectedMetrcTransfers}
            setPurchaseOrder={setPurchaseOrder}
            setPurchaseOrderFile={setPurchaseOrderFile}
            setPurchaseOrderCannabisFiles={setPurchaseOrderCannabisFiles}
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
        ))
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
