import {
  Box,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import CurrencyInput from "components/Shared/FormInputs/CurrencyInput";
import DatePicker from "components/Shared/FormInputs/DatePicker";
import {
  InvoiceFileFragment,
  InvoiceFileTypeEnum,
  InvoicesInsertInput,
  PayorsByPartnerCompanyQuery,
} from "generated/graphql";
import { useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

interface Props {
  isInvoiceForLoan: boolean;
  companyId: string;
  invoice: InvoicesInsertInput;
  invoiceFile?: InvoiceFileFragment;
  payors: PayorsByPartnerCompanyQuery["payors"];
  setInvoice: (invoice: InvoicesInsertInput) => void;
  setInvoiceFile: (file: InvoiceFileFragment) => void;
}

export default function InvoiceForm({
  isInvoiceForLoan,
  companyId,
  invoice,
  invoiceFile,
  payors,
  setInvoice,
  setInvoiceFile,
}: Props) {
  const classes = useStyles();

  const invoiceFileIds = useMemo(
    () => (invoiceFile ? [invoiceFile.file_id] : []),
    [invoiceFile]
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row">
        <FormControl className={classes.inputField}>
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
                {`${payor.name} ${
                  payor.company_payor_partnerships[0]?.approved_at
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
          className={classes.inputField}
          label="Invoice Number"
          value={invoice.invoice_number}
          onChange={({ target: { value } }) =>
            setInvoice({
              ...invoice,
              invoice_number: value,
            })
          }
        />
      </Box>
      <Box mt={2}>
        <DatePicker
          className={classes.inputField}
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
      <Box mt={2}>
        <DatePicker
          className={classes.inputField}
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
      {isInvoiceForLoan && (
        <Box mt={2}>
          <DatePicker
            className={classes.inputField}
            id="invoice-advance-date-date-picker"
            label="Advance Date"
            disablePast
            value={invoice.advance_date}
            onChange={(value) =>
              setInvoice({
                ...invoice,
                advance_date: value,
              })
            }
          />
        </Box>
      )}
      <Box mt={2}>
        <FormControl fullWidth className={classes.inputField}>
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
      <Box mt={3}>
        <FormControl fullWidth className={classes.inputField}>
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
      <Box mt={2}>
        <FormControl fullWidth className={classes.inputField}>
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
      <Box mt={3}>
        <Box mb={1}>
          <Typography variant="subtitle1" color="textSecondary">
            Invoice File Attachment
          </Typography>
        </Box>
        {invoiceFile && <DownloadThumbnail fileIds={invoiceFileIds} />}
        <Box mt={1}>
          <FileUploadDropzone
            companyId={companyId}
            docType="invoice"
            maxFilesAllowed={1}
            onUploadComplete={async (response) => {
              if (!response.succeeded) {
                return;
              }
              const file = response.files_in_db[0];
              setInvoiceFile({
                invoice_id: invoice.id,
                file_id: file.id,
                file_type: InvoiceFileTypeEnum.Invoice,
                file: file,
              });
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
