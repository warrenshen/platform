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
  ListPurchaseOrdersDocument,
  PurchaseOrderFragment,
  RequestStatusEnum,
  useAddPurchaseOrderMutation,
  usePurchaseOrderQuery,
  useUpdatePurchaseOrderMutation,
} from "generated/graphql";
import { ActionType } from "lib/ActionType";
import { isNull, mergeWith } from "lodash";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: "500px",
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

type FileInDB = {
  id: string;
  path: string;
};

interface Props {
  actionType: ActionType;
  purchaseOrderId?: string;
  handleClose: () => void;
}

function CreateUpdatePurchaseOrderModal({
  actionType,
  purchaseOrderId,
  handleClose,
}: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  // Default PurchaseOrder for CREATE case.
  const newPurchaseOrder = {
    company_id: companyId,
    vendor_id: "",
    order_number: "",
    order_date: null,
    delivery_date: null,
    amount: "",
    is_cannabis: false,
    status: RequestStatusEnum.Drafted,
  } as PurchaseOrderFragment;

  const [purchaseOrder, setPurchaseOrder] = useState(newPurchaseOrder);
  const [
    purchaseOrderPrimaryFile,
    setPurchaseOrderPrimaryFile,
  ] = useState<null | FileInDB>(null);
  const [
    purchaseOrderSecondaryFiles,
    setPurchaseOrderSecondaryFiles,
  ] = useState<FileInDB[]>([]);

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
        setPurchaseOrderPrimaryFile(
          existingPurchaseOrder.purchase_order_files[0]?.file
        );
      }
    },
  });

  const [
    addPurchaseOrder,
    { loading: isAddPurchaseOrderLoading },
  ] = useAddPurchaseOrderMutation();

  const [
    updatePurchaseOrder,
    { loading: isUpdatePurchaseOrderLoading },
  ] = useUpdatePurchaseOrderMutation();

  const isDialogReady = !isExistingPurchaseOrderLoading;
  const isFormValid = !!purchaseOrder.vendor_id;
  const isFormLoading =
    isAddPurchaseOrderLoading || isUpdatePurchaseOrderLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;
  const isSaveSubmitDisabled =
    !isFormValid ||
    isFormLoading ||
    !purchaseOrder.delivery_date ||
    !purchaseOrder.order_date ||
    !purchaseOrder.order_number ||
    !purchaseOrder.amount;

  const upsertPurchaseOrderWithStatus = async (status: RequestStatusEnum) => {
    const primaryPurchaseOrderFileData = purchaseOrderPrimaryFile && {
      purchase_order_id: purchaseOrder.id,
      file_id: purchaseOrderPrimaryFile.id,
    };
    const secondaryPurchaseOrderFilesData =
      purchaseOrderSecondaryFiles &&
      purchaseOrderSecondaryFiles.map((purchaseOrderSecondaryFile) => ({
        purchase_order_id: purchaseOrder.id,
        file_id: purchaseOrderSecondaryFile.id,
      }));
    const purchaseOrderFilesData = [
      ...(primaryPurchaseOrderFileData ? [primaryPurchaseOrderFileData] : []),
      ...(secondaryPurchaseOrderFilesData || []),
    ];
    if (actionType === ActionType.Update) {
      await updatePurchaseOrder({
        variables: {
          id: purchaseOrder.id,
          purchaseOrder: {
            vendor_id: purchaseOrder.vendor_id,
            order_number: purchaseOrder.order_number,
            order_date: purchaseOrder.order_date || null,
            delivery_date: purchaseOrder.delivery_date || null,
            amount: purchaseOrder.amount || null,
            is_cannabis: purchaseOrder.is_cannabis,
            status: status,
          },
          purchaseOrderFiles: purchaseOrderFilesData,
        },
        refetchQueries: [
          {
            query: ListPurchaseOrdersDocument,
            variables: {
              company_id: companyId,
            },
          },
        ],
      });
    } else {
      await addPurchaseOrder({
        variables: {
          purchase_order: {
            vendor_id: purchaseOrder.vendor_id,
            order_number: purchaseOrder.order_number,
            order_date: purchaseOrder.order_date || null,
            delivery_date: purchaseOrder.delivery_date || null,
            amount: purchaseOrder.amount || null,
            is_cannabis: purchaseOrder.is_cannabis,
            status: status,
            purchase_order_files: {
              data: purchaseOrderFilesData,
            },
          },
        },
        refetchQueries: [
          {
            query: ListPurchaseOrdersDocument,
            variables: {
              company_id: companyId,
            },
          },
        ],
      });
    }
  };

  const handleClickSaveDraft = async () => {
    await upsertPurchaseOrderWithStatus(RequestStatusEnum.Drafted);
    handleClose();
  };

  const handleClickSaveSubmit = async () => {
    await upsertPurchaseOrderWithStatus(RequestStatusEnum.ApprovalRequested);
    handleClose();
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
          purchaseOrder={purchaseOrder}
          purchaseOrderPrimaryFile={purchaseOrderPrimaryFile}
          purchaseOrderSecondaryFiles={purchaseOrderSecondaryFiles}
          setPurchaseOrder={setPurchaseOrder}
          setPurchaseOrderPrimaryFile={setPurchaseOrderPrimaryFile}
          setPurchaseOrderSecondaryFiles={setPurchaseOrderSecondaryFiles}
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
