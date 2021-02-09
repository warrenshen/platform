import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Theme,
} from "@material-ui/core";
import PurchaseOrderForm from "components/Shared/PurchaseOrders/PurchaseOrderForm";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrdersInsertInput,
  RequestStatusEnum,
  useAddPurchaseOrderMutation,
  usePurchaseOrderQuery,
  useUpdatePurchaseOrderMutation,
  useVendorsByPartnerCompanyQuery,
} from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { authenticatedApi, purchaseOrdersRoutes } from "lib/api";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      paddingLeft: theme.spacing(3),
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: "200px",
    },
    dialogActions: {
      margin: theme.spacing(4),
      marginTop: 0,
      marginBottom: 15,
    },
    submitButton: {
      marginLeft: theme.spacing(1),
    },
  })
);

interface Props {
  actionType: ActionType;
  purchaseOrderId: string | null;
  handleClose: () => void;
}

function CreateUpdatePurchaseOrderModal({
  actionType,
  purchaseOrderId = null,
  handleClose,
}: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  // Default PurchaseOrder for CREATE case.
  const newPurchaseOrder = {
    vendor_id: "",
    order_number: "",
    order_date: null,
    delivery_date: null,
    amount: "",
    is_cannabis: false,
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
    addPurchaseOrder,
    { loading: isAddPurchaseOrderLoading },
  ] = useAddPurchaseOrderMutation();

  const [
    updatePurchaseOrder,
    { loading: isUpdatePurchaseOrderLoading },
  ] = useUpdatePurchaseOrderMutation();

  const isDialogReady =
    !isExistingPurchaseOrderLoading && !isSelectableVendorsLoading;
  const isFormValid = !!purchaseOrder.vendor_id;
  const isFormLoading =
    isAddPurchaseOrderLoading || isUpdatePurchaseOrderLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;
  const isSaveSubmitDisabled =
    isSaveDraftDisabled ||
    !vendors?.find((vendor) => vendor.id === purchaseOrder.vendor_id)
      ?.company_vendor_partnerships[0].approved_at ||
    !purchaseOrder.order_number ||
    !purchaseOrder.order_date ||
    !purchaseOrder.delivery_date ||
    !purchaseOrder.amount ||
    !purchaseOrderFile;

  const upsertPurchaseOrder = async () => {
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
    if (actionType === ActionType.Update) {
      const response = await updatePurchaseOrder({
        variables: {
          id: purchaseOrder.id,
          purchaseOrder: {
            vendor_id: purchaseOrder.vendor_id,
            order_number: purchaseOrder.order_number,
            order_date: purchaseOrder.order_date || null,
            delivery_date: purchaseOrder.delivery_date || null,
            amount: purchaseOrder.amount || null,
            is_cannabis: purchaseOrder.is_cannabis,
            status: RequestStatusEnum.Drafted,
          },
          purchaseOrderFiles: purchaseOrderFilesData,
        },
      });
      return response.data?.update_purchase_orders_by_pk;
    } else {
      const response = await addPurchaseOrder({
        variables: {
          purchase_order: {
            vendor_id: purchaseOrder.vendor_id,
            order_number: purchaseOrder.order_number,
            order_date: purchaseOrder.order_date || null,
            delivery_date: purchaseOrder.delivery_date || null,
            amount: purchaseOrder.amount || null,
            is_cannabis: purchaseOrder.is_cannabis,
            status: RequestStatusEnum.Drafted,
            purchase_order_files: {
              data: purchaseOrderFilesData,
            },
          },
        },
      });
      return response.data?.insert_purchase_orders_one;
    }
  };

  const handleClickSaveDraft = async () => {
    const savedPurchaseOrder = await upsertPurchaseOrder();
    if (!savedPurchaseOrder) {
      alert("Could not upsert purchase order");
    }
    handleClose();
  };

  const handleClickSaveSubmit = async () => {
    const savedPurchaseOrder = await upsertPurchaseOrder();
    if (!savedPurchaseOrder) {
      alert("Could not upsert purchase order");
    } else {
      // Since this is a SAVE AND SUBMIT action,
      // hit the PurchaseOrders.SubmitForApproval endpoint.
      const response = await authenticatedApi.post(
        purchaseOrdersRoutes.submitForApproval,
        {
          purchase_order_id: savedPurchaseOrder.id,
        }
      );
      if (response.data?.status === "ERROR") {
        alert(response.data?.msg);
      } else {
        handleClose();
      }
    }
  };

  return isDialogReady ? (
    <Dialog
      open
      onClose={handleClose}
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogTitle className={classes.dialogTitle}>
        {`${
          actionType === ActionType.Update ? "Edit" : "Create"
        } Purchase Order`}
      </DialogTitle>
      <DialogContent>
        <PurchaseOrderForm
          companyId={companyId}
          purchaseOrder={purchaseOrder}
          purchaseOrderFile={purchaseOrderFile}
          purchaseOrderCannabisFiles={purchaseOrderCannabisFiles}
          vendors={data?.vendors || []}
          setPurchaseOrder={setPurchaseOrder}
          setPurchaseOrderFile={setPurchaseOrderFile}
          setPurchaseOrderCannabisFiles={setPurchaseOrderCannabisFiles}
        ></PurchaseOrderForm>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={isSaveDraftDisabled}
          onClick={handleClickSaveDraft}
          variant={"contained"}
          color={"secondary"}
        >
          Save as Draft
        </Button>
        <Button
          className={classes.submitButton}
          disabled={isSaveSubmitDisabled}
          onClick={handleClickSaveSubmit}
          variant={"contained"}
          color={"primary"}
        >
          Save and Submit
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;
}

export default CreateUpdatePurchaseOrderModal;
