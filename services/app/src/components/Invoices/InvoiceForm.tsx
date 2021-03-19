import {
  Box,
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
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
import { ChangeEvent, useMemo } from "react";

interface Props {
  companyId: string;
  invoice: InvoicesInsertInput;
  invoiceFile?: InvoiceFileFragment;
  invoiceCannabisFiles: InvoiceFileFragment[];
  payors: PayorsByPartnerCompanyQuery["payors"];
  setInvoice: (invoice: InvoicesInsertInput) => void;
  setInvoiceFile: (file: InvoiceFileFragment) => void;
  setInvoiceCannabisFiles: (files: InvoiceFileFragment[]) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 300,
    },
  })
);

export default function InvoiceForm({
  companyId,
  invoice,
  invoiceFile,
  invoiceCannabisFiles,
  payors,
  setInvoice,
  setInvoiceFile,
  setInvoiceCannabisFiles,
}: Props) {
  const classes = useStyles();

  const invoiceFileIds = useMemo(
    () => (invoiceFile ? [invoiceFile.file_id] : []),
    [invoiceFile]
  );

  const invoiceCannabisFileIds = useMemo(
    () => invoiceCannabisFiles.map((f) => f.file_id),
    [invoiceCannabisFiles]
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
            value={!payors.length ? "" : invoice.payor_id}
            onChange={({ target: { value } }) =>
              setInvoice({
                ...invoice,
                payor_id: value as string,
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
      </Box>
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
      <Box mt={2}>
        <FormControl fullWidth className={classes.inputField}>
          <CurrencyInput
            label={"Subtotal Amount"}
            value={invoice.subtotal_amount}
            handleChange={(value: number) =>
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
            handleChange={(value: number) =>
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
            handleChange={(value: number) =>
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
        <Box mt={2}>
          <FormControlLabel
            label="Invoice includes cannabis or derivatives"
            control={
              <Checkbox
                checked={!!invoice.is_cannabis}
                color="primary"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setInvoice({
                    ...invoice,
                    is_cannabis: event.target.checked,
                  })
                }
              />
            }
          />
        </Box>
        {!!invoice.is_cannabis && (
          <Box mt={2}>
            <Box mb={1}>
              <Typography variant="subtitle1" color="textSecondary">
                Cannabis File Attachments
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Please upload the following: Shipping Manifest, Certificate of
                Analysis.
              </Typography>
            </Box>
            {invoiceCannabisFiles.length > 0 && (
              <DownloadThumbnail fileIds={invoiceCannabisFileIds} />
            )}
            <Box mt={1}>
              <FileUploadDropzone
                companyId={companyId}
                docType="invoice"
                onUploadComplete={async (response) => {
                  if (!response.succeeded) {
                    return;
                  }
                  const { files_in_db: files } = response;
                  setInvoiceCannabisFiles(
                    files.map((file) => ({
                      invoice_id: invoice.id,
                      file_id: file.id,
                      file_type: InvoiceFileTypeEnum.Cannabis,
                      file: file,
                    }))
                  );
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
