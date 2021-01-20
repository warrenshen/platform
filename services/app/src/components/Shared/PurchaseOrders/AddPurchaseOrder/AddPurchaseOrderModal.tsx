import DateFnsUtils from "@date-io/date-fns";
import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Input,
  InputAdornment,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ListPurchaseOrdersDocument,
  PurchaseOrderFragment,
  PurchaseOrdersInsertInput,
  RequestStatusEnum,
  useAddPurchaseOrderMutation,
  useListVendorsByCompanyQuery,
  useUpdatePurchaseOrderMutation,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ActionType } from "lib/ActionType";
import { ChangeEvent, useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      minWidth: "500px",
    },
    dialogTitle: {
      paddingLeft: theme.spacing(4),
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
  originalPurchaseOrder: Maybe<PurchaseOrderFragment>;
  handleClose: () => void;
}

function AddPurchaseOrderModal({
  actionType,
  originalPurchaseOrder,
  handleClose,
}: Props) {
  const classes = useStyles();
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);
  const {
    data: vendorsData,
    loading: isSelectableVendorsLoading,
  } = useListVendorsByCompanyQuery({
    variables: {
      companyId,
    },
  });
  const selectableVendors = vendorsData?.vendors;

  // Default PurchaseOrder for CREATE case.
  const purchaseOrderForm = {
    company_id: companyId,
    vendor_id: "",
    order_date: "",
    delivery_date: "",
    order_number: "",
    amount: "",
    status: RequestStatusEnum.Drafted,
  } as PurchaseOrderFragment;
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderFragment>({
    ...purchaseOrderForm,
    ...(originalPurchaseOrder || {}),
  });

  const [
    addPurchaseOrder,
    { loading: addPurchaseOrderLoading },
  ] = useAddPurchaseOrderMutation();

  const [
    updatePurchaseOrder,
    { loading: updatePurchaseOrderLoading },
  ] = useUpdatePurchaseOrderMutation();

  const isFormValid = !!purchaseOrder.vendor_id;
  const isFormLoading = addPurchaseOrderLoading || updatePurchaseOrderLoading;
  const isSaveDraftDisabled = !isFormValid || isFormLoading;
  const isSaveSubmitDisabled =
    !isFormValid ||
    isFormLoading ||
    !purchaseOrder.delivery_date ||
    !purchaseOrder.order_date ||
    !purchaseOrder.order_number ||
    !purchaseOrder.amount;

  const upsertPurchaseOrderWithStatus = async (status: RequestStatusEnum) => {
    if (actionType === ActionType.Update) {
      await updatePurchaseOrder({
        variables: {
          id: purchaseOrder.id,
          purchaseOrder: {
            vendor_id: purchaseOrder.vendor_id,
            delivery_date: purchaseOrder.delivery_date || null,
            order_date: purchaseOrder.order_date || null,
            order_number: purchaseOrder.order_number,
            amount: purchaseOrder.amount || null,
            status: status,
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
    } else {
      await addPurchaseOrder({
        variables: {
          purchase_order: {
            vendor_id: purchaseOrder.vendor_id,
            delivery_date: purchaseOrder.delivery_date || null,
            order_date: purchaseOrder.order_date || null,
            order_number: purchaseOrder.order_number,
            amount: purchaseOrder.amount || null,
            status: status,
          } as PurchaseOrdersInsertInput,
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

  return (
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
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row">
            <FormControl className={classes.purchaseOrderInput}>
              <InputLabel id="vendor-select-label">Vendor</InputLabel>
              <Select
                disabled={isSelectableVendorsLoading}
                labelId="vendor-select-label"
                id="vendor-select"
                value={
                  isSelectableVendorsLoading ? "" : purchaseOrder.vendor_id
                }
                onChange={({ target: { value } }) => {
                  setPurchaseOrder({
                    ...purchaseOrder,
                    vendor_id: value as string,
                  });
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {selectableVendors?.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {`${vendor.name} ${
                      vendor.company_vendor_partnerships[0]?.verified_at
                        ? "(Approved)"
                        : "(Not approved)"
                    }`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mt={2}>
            <TextField
              label="Order Number"
              value={purchaseOrder.order_number}
              onChange={({ target: { value } }) => {
                setPurchaseOrder({
                  ...purchaseOrder,
                  order_number: value,
                });
              }}
            ></TextField>
          </Box>
          <Box>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                className={classes.purchaseOrderInput}
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="order-date-date-picker"
                label="Order Date"
                value={purchaseOrder.order_date || null}
                onChange={(value: MaterialUiPickersDate) => {
                  setPurchaseOrder({
                    ...purchaseOrder,
                    order_date: value ? value : new Date().getUTCDate(),
                  });
                }}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </MuiPickersUtilsProvider>
          </Box>
          <Box>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                className={classes.purchaseOrderInput}
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="delivery-date-date-picker"
                label="Delivery date"
                value={purchaseOrder.delivery_date || null}
                onChange={(value: MaterialUiPickersDate) => {
                  setPurchaseOrder({
                    ...purchaseOrder,
                    delivery_date: value ? value : new Date().getUTCDate(),
                  });
                }}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </MuiPickersUtilsProvider>
          </Box>
          <Box mt={3}>
            <FormControl fullWidth className={classes.purchaseOrderInput}>
              <InputLabel htmlFor="standard-adornment-amount">
                Amount
              </InputLabel>
              <Input
                id="standard-adornment-amount"
                value={purchaseOrder.amount}
                type="number"
                onChange={({ target: { value } }) => {
                  setPurchaseOrder({
                    ...purchaseOrder,
                    amount: Number(value),
                  });
                }}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </FormControl>
          </Box>
          <Box mt={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={true}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {}}
                  color="primary"
                />
              }
              label={"Order includes cannabis or derivatives"}
            />
          </Box>
        </Box>
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
  );
}

export default AddPurchaseOrderModal;
