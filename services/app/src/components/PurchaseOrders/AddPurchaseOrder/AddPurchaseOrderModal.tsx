import DateFnsUtils from "@date-io/date-fns";
import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextareaAutosize,
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
  useAddPurchaseOrderMutation,
  useListPurchaseOrderVendorsQuery,
  useUpdatePurchaseOrderMutation,
} from "generated/graphql";
import { Maybe } from "graphql/jsutils/Maybe";
import { ActionType } from "lib/ActionType";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogTitle: {
      paddingLeft: theme.spacing(4),
      borderBottom: "1px solid #c7c7c7",
    },
    purchaseOrderInput: {
      width: "100%",
    },
    formControlLeft: {
      flexDirection: "column",
      margin: theme.spacing(1),
      flexGrow: 1,
    },
    formControlRight: {
      flexDirection: "column",
      margin: theme.spacing(1),
      width: "50%",
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
    loading: getVendorsLoading,
  } = useListPurchaseOrderVendorsQuery();
  const vendors = vendorsData?.companies.filter((v) => v.id !== companyId);

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderFragment>(
    actionType === ActionType.Update && originalPurchaseOrder
      ? originalPurchaseOrder
      : ({
          company_id: companyId,
          vendor_id: "",
          currency: "USD",
        } as PurchaseOrderFragment)
  );
  const [
    addPurchaseOrder,
    { loading: addPurchaseOrderLoading },
  ] = useAddPurchaseOrderMutation();

  const [
    updatePurchaseOrder,
    { loading: updatePurchaseOrderLoading },
  ] = useUpdatePurchaseOrderMutation();

  const isFormValid = !!purchaseOrder.vendor_id;

  return (
    <Dialog open onClose={handleClose} maxWidth="xl">
      <DialogTitle className={classes.dialogTitle}>
        {`${
          actionType === ActionType.Update ? "Edit" : "Create"
        } Purchase Order`}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexDirection="row">
            <FormControl className={classes.formControlRight}>
              <InputLabel id="vendor-select-label">Vendor</InputLabel>
              <Select
                disabled={getVendorsLoading}
                className={classes.purchaseOrderInput}
                labelId="vendor-select-label"
                id="vendor-select"
                value={purchaseOrder.vendor_id}
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
                {vendors?.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" flexDirection="row">
            <FormControl className={classes.formControlRight}>
              <InputLabel id="currency-select-label">Currency</InputLabel>
              <Select
                className={classes.purchaseOrderInput}
                labelId="currency-select-label"
                id="currency-select"
                value={purchaseOrder.currency ? purchaseOrder.currency : "USD"}
                onChange={({ target: { value } }) => {
                  setPurchaseOrder({
                    ...purchaseOrder,
                    currency: value as string,
                  });
                }}
              >
                {[{ value: "USD" }].map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" flexDirection="row">
            <Box flexDirection="column" m={1} flexGrow={1}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className={classes.purchaseOrderInput}
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="created-at-date-picker"
                  label="PO Date"
                  value={purchaseOrder.created_at}
                  onChange={(value: MaterialUiPickersDate) => {
                    setPurchaseOrder({
                      ...purchaseOrder,
                      created_at: value ? value : new Date(),
                    });
                  }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider>
            </Box>
            <Box flexDirection="column" m={1} width="50%">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  className={classes.purchaseOrderInput}
                  disableToolbar
                  variant="inline"
                  format="MM/dd/yyyy"
                  margin="normal"
                  id="delivery-date-date-picker"
                  label="Delivery date"
                  value={purchaseOrder.delivery_date}
                  onChange={(value: MaterialUiPickersDate) => {
                    setPurchaseOrder({
                      ...purchaseOrder,
                      delivery_date: value ? value : new Date(),
                    });
                  }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider>
            </Box>
          </Box>
          <Box display="flex" m={1} flexDirection="row">
            <TextareaAutosize
              id="remarks-text-area"
              className={classes.purchaseOrderInput}
              aria-label="Remarks"
              placeholder="Remarks If any"
              rowsMin={5}
              onChange={({ target: { value } }) => {
                setPurchaseOrder({
                  ...purchaseOrder,
                  remarks: value,
                });
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            className={classes.submitButton}
            disabled={
              !isFormValid ||
              addPurchaseOrderLoading ||
              updatePurchaseOrderLoading
            }
            onClick={async () => {
              if (actionType === ActionType.Update) {
                await updatePurchaseOrder({
                  variables: {
                    id: purchaseOrder.id,
                    purchaseOrder: {
                      currency: purchaseOrder.currency,
                      delivery_date: purchaseOrder.delivery_date,
                      remarks: purchaseOrder.remarks,
                      status: purchaseOrder.status,
                      vendor_id: purchaseOrder.vendor_id,
                      amount: 0,
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
                    purhcase_order: {
                      currency: purchaseOrder.currency,
                      delivery_date: purchaseOrder.delivery_date,
                      remarks: purchaseOrder.remarks,
                      status: purchaseOrder.status,
                      vendor_id: purchaseOrder.vendor_id,
                      amount: 0,
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
              handleClose();
            }}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default AddPurchaseOrderModal;
