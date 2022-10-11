import {
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@material-ui/core";
import FileUploader from "components/Shared/File/FileUploader";
import AutocompleteInput from "components/Shared/FormInputs/AutocompleteInput";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  Companies,
  PurchaseOrderFileFragment,
  PurchaseOrderFileTypeEnum,
  PurchaseOrdersInsertInput,
} from "generated/graphql";
import {
  CustomCheckboxChecked,
  CustomCheckboxUnchecked,
  DateInputIcon,
} from "icons/index";
import { dateAsDateStringClient } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { isPurchaseOrderDueDateValid } from "lib/purchaseOrders";
import { useMemo } from "react";

const NetTermsDropdownOptions = ["7", "14", "15", "28", "30", "45", "60"];

interface Props {
  companyId: Companies["id"];
  purchaseOrder: PurchaseOrdersInsertInput;
  purchaseOrderFiles: PurchaseOrderFileFragment[];
  setPurchaseOrder: (purchaseOrder: PurchaseOrdersInsertInput) => void;
  setPurchaseOrderFiles: (file: PurchaseOrderFileFragment[]) => void;
  frozenPurchaseOrderFileIds: string[];
}

export default function PurchaseOrderForm({
  companyId,
  purchaseOrder,
  purchaseOrderFiles,
  setPurchaseOrder,
  setPurchaseOrderFiles,
  frozenPurchaseOrderFileIds,
}: Props) {
  const purchaseOrderFileIds = useMemo(
    () =>
      purchaseOrderFiles.map((purchaseOrderFile) => purchaseOrderFile.file_id),
    [purchaseOrderFiles]
  );

  const isNetTermsVisible = purchaseOrder.net_terms !== 0;
  const isDueDateVisible =
    !!purchaseOrder.order_date && purchaseOrder.net_terms != null;
  const { isDueDateValid, dueDateDate } = isPurchaseOrderDueDateValid(
    purchaseOrder.order_date,
    purchaseOrder.net_terms
  );

  return (
    <>
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          data-cy={"purchase-order-form-input-order-number"}
          label="PO Number"
          value={purchaseOrder.order_number || ""}
          onChange={({ target: { value } }) =>
            setPurchaseOrder({
              ...purchaseOrder,
              order_number: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <DateInput
          dataCy={"purchase-order-form-input-order-date"}
          id="order-date-date-picker"
          label="PO Date"
          value={purchaseOrder.order_date}
          onChange={(value) =>
            setPurchaseOrder({
              ...purchaseOrder,
              order_date: value,
            })
          }
          keyboardIcon={<DateInputIcon width="16px" height="16px" />}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={3}>
        <FormControlLabel
          control={
            <Checkbox
              data-cy={"purchase-order-form-input-is-cod"}
              checked={purchaseOrder.net_terms === 0}
              onChange={(event) =>
                setPurchaseOrder({
                  ...purchaseOrder,
                  net_terms: event.target.checked ? 0 : null,
                })
              }
              color="primary"
              icon={<CustomCheckboxUnchecked />}
              checkedIcon={<CustomCheckboxChecked />}
            />
          }
          label={"Is payment due on receipt (COD)?"}
        />
      </Box>
      {isNetTermsVisible && (
        <Box display="flex" flexDirection="column" mt={2}>
          <AutocompleteInput
            dataCy={"purchase-order-form-input-net-terms"}
            id={"net-terms"}
            label={"Net Terms (# Days)"}
            value={
              !!purchaseOrder.net_terms
                ? purchaseOrder.net_terms.toString()
                : ""
            }
            options={NetTermsDropdownOptions}
            setValue={(value) =>
              setPurchaseOrder({
                ...purchaseOrder,
                net_terms: !!value ? parseInt(value) : null,
              })
            }
          />
        </Box>
      )}
      {isDueDateVisible && (
        <Box mt={0.5} ml={3}>
          <Typography variant="subtitle1" color="textPrimary">
            <strong>{`PO Due Date: ${dateAsDateStringClient(
              dueDateDate as Date
            )}`}</strong>
          </Typography>
          {!isDueDateValid && (
            <Typography variant="subtitle1" color="secondary">
              <strong>
                {
                  "This purchase order is too old and does not qualify for financing. Please select a purchase order that is less than 60 days past due."
                }
              </strong>
            </Typography>
          )}
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={3}>
        <CurrencyInput
          dataCy={"purchase-order-form-input-amount"}
          label="Amount"
          value={purchaseOrder.amount}
          handleChange={(value) =>
            setPurchaseOrder({
              ...purchaseOrder,
              amount: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <TextField
          data-cy={"purchase-order-form-input-customer-note"}
          multiline
          label={"Comments"}
          helperText={"Any comments about this purchase order"}
          value={purchaseOrder.customer_note || ""}
          onChange={({ target: { value } }) =>
            setPurchaseOrder({
              ...purchaseOrder,
              customer_note: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Box mb={1}>
          <Typography variant="subtitle1" color="textPrimary">
            Purchase Order File Attachment(s)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please upload at least one file showing information about the
            purchase order.
          </Typography>
        </Box>
        <FileUploader
          dataCy={"purchase-order-form-file-uploader-purchase-order-file"}
          companyId={companyId}
          fileType={FileTypeEnum.PurchaseOrder}
          fileIds={purchaseOrderFileIds}
          frozenFileIds={frozenPurchaseOrderFileIds}
          handleDeleteFileById={(fileId) =>
            setPurchaseOrderFiles(
              purchaseOrderFiles.filter(
                (purchaseOrderFile) => purchaseOrderFile.file_id !== fileId
              )
            )
          }
          handleNewFiles={(files) =>
            setPurchaseOrderFiles([
              ...purchaseOrderFiles,
              ...files.map((file) => ({
                purchase_order_id: purchaseOrder.id,
                file_id: file.id,
                file_type: PurchaseOrderFileTypeEnum.PurchaseOrder,
                file: file,
              })),
            ])
          }
        />
      </Box>
    </>
  );
}
