import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import FileUploader from "components/Shared/File/FileUploader";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  Companies,
  InvoiceFileFragment,
  InvoiceFileTypeEnum,
  InvoicesInsertInput,
  PayorsByPartnerCompanyQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { FileTypeEnum, ProductTypeEnum } from "lib/enum";
import { isInvoiceFinancingProductType } from "lib/settings";
import { ChangeEvent, useMemo } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  invoice: InvoicesInsertInput;
  invoiceFiles: InvoiceFileFragment[];
  invoiceCannabisFiles: InvoiceFileFragment[];
  payors: PayorsByPartnerCompanyQuery["payors"];
  setInvoice: (invoice: InvoicesInsertInput) => void;
  setInvoiceFiles: (files: InvoiceFileFragment[]) => void;
  setInvoiceCannabisFiles: (files: InvoiceFileFragment[]) => void;
  frozenInvoiceFileIds: string[];
  frozenInvoiceCannabisFileIds: string[];
}

/*
For Invoice Financing, we require:
1) Invoice Attachment
2) COAs
3) Shipping Manifest

---

For Purchase Money Financing, we require:

For purchase order,
1) Purchase Order Attachment
2) COAs
3) Shipping Manifest

For invoice (the borrower submits both purchase orders and invoices for PMF),
1) Invoice Attachment

Note: COAs and Shipping Manifest are NOT required for PMF invoice.
*/
export default function InvoiceForm({
  companyId,
  productType,
  invoice,
  invoiceFiles,
  invoiceCannabisFiles,
  payors,
  setInvoice,
  setInvoiceFiles,
  setInvoiceCannabisFiles,
  frozenInvoiceFileIds,
  frozenInvoiceCannabisFileIds,
}: Props) {
  const invoiceFileIds = useMemo(
    () => invoiceFiles.map((invoiceFile) => invoiceFile.file_id),
    [invoiceFiles]
  );
  const invoiceCannabisFileIds = useMemo(
    () => invoiceCannabisFiles.map((invoiceFile) => invoiceFile.file_id),
    [invoiceCannabisFiles]
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <FormControl>
          <InputLabel id="payor-select-label">Payor</InputLabel>
          <Select
            disabled={!payors.length}
            labelId="payor-select-label"
            id="payor-select"
            value={payors.length > 0 ? invoice.payor_id || "" : ""}
            onChange={({ target: { value } }) =>
              setInvoice({
                ...invoice,
                payor_id: value || null,
              })
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {payors.map((payor) => (
              <MenuItem key={payor.id} value={payor.id}>
                {`${getCompanyDisplayName(payor)} ${
                  !!payor.company_payor_partnerships[0]?.approved_at
                    ? "[Approved]"
                    : "[Not Approved]"
                }`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <TextField
          label="Invoice Number"
          value={invoice.invoice_number || ""}
          onChange={({ target: { value } }) =>
            setInvoice({
              ...invoice,
              invoice_number: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          id="invoice-date-date-picker"
          label="Invoice Date"
          value={invoice.invoice_date}
          onChange={(value) =>
            setInvoice({
              ...invoice,
              invoice_date: value,
            })
          }
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <DateInput
          id="invoice-due-date-date-picker"
          label="Due Date"
          value={invoice.invoice_due_date}
          onChange={(value) =>
            setInvoice({
              ...invoice,
              invoice_due_date: value,
            })
          }
        />
        <Box mt={1}>
          <Typography variant="body2" color="textSecondary">
            This is shown to the Payor as their due date.
          </Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControl fullWidth>
          <CurrencyInput
            label={"Subtotal Amount"}
            value={invoice.subtotal_amount}
            handleChange={(value) =>
              setInvoice({
                ...invoice,
                subtotal_amount: value,
                total_amount: value + (invoice.taxes_amount || 0),
              })
            }
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControl fullWidth>
          <CurrencyInput
            label={"Taxes"}
            value={invoice.taxes_amount}
            handleChange={(value) =>
              setInvoice({
                ...invoice,
                taxes_amount: value,
                total_amount: value + (invoice.subtotal_amount || 0),
              })
            }
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <FormControl fullWidth>
          <CurrencyInput
            label={"Total Amount"}
            value={invoice.total_amount}
            handleChange={(value) =>
              setInvoice({
                ...invoice,
                total_amount: value,
              })
            }
          />
        </FormControl>
      </Box>
      {isInvoiceFinancingProductType(productType) && (
        <Box display="flex" flexDirection="column" mt={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!invoice.is_cannabis}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setInvoice({
                    ...invoice,
                    is_cannabis: event.target.checked,
                  })
                }
                color="primary"
              />
            }
            label={"Does this order include cannabis or derivatives?"}
          />
        </Box>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={1}>
          <Typography variant="subtitle1" color="textSecondary">
            Invoice File Attachment(s)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please upload at least one file showing information about the
            invoice.
          </Typography>
        </Box>
        <FileUploader
          companyId={companyId}
          fileType={FileTypeEnum.INVOICE}
          fileIds={invoiceFileIds}
          frozenFileIds={frozenInvoiceFileIds}
          handleDeleteFileById={(fileId) =>
            setInvoiceFiles(
              invoiceFiles.filter(
                (invoiceFile) => invoiceFile.file_id !== fileId
              )
            )
          }
          handleNewFiles={(files) =>
            setInvoiceFiles([
              ...invoiceFiles,
              ...files.map((file) => ({
                invoice_id: invoice.id,
                file_id: file.id,
                file_type: InvoiceFileTypeEnum.Invoice,
                file: file,
              })),
            ])
          }
        />
        {!!invoice.is_cannabis && (
          <Box display="flex" flexDirection="column" mt={4}>
            <Box mb={1}>
              <Typography variant="subtitle1" color="textSecondary">
                Cannabis File Attachments
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Please upload the following: Shipping Manifest, Certificate of
                Analysis.
              </Typography>
            </Box>
            <FileUploader
              companyId={companyId}
              fileType={FileTypeEnum.INVOICE}
              fileIds={invoiceCannabisFileIds}
              frozenFileIds={frozenInvoiceCannabisFileIds}
              handleDeleteFileById={(fileId) =>
                setInvoiceCannabisFiles(
                  invoiceCannabisFiles.filter(
                    (invoiceCannabisFile) =>
                      invoiceCannabisFile.file_id !== fileId
                  )
                )
              }
              handleNewFiles={(files) =>
                setInvoiceCannabisFiles([
                  ...invoiceCannabisFiles,
                  ...files.map((file) => ({
                    invoice_id: invoice.id,
                    file_id: file.id,
                    file_type: InvoiceFileTypeEnum.Cannabis,
                    file: file,
                  })),
                ])
              }
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
