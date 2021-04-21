import {
  Box,
  Checkbox,
  createStyles,
  Drawer,
  FormControlLabel,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import RequestStatusChip from "components/Shared/Chip/RequestStatusChip";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  InvoiceFileTypeEnum,
  Invoices,
  useGetInvoiceByIdQuery,
} from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { useContext, useMemo } from "react";
import InvoiceLoansDataGrid from "./InvoiceLoansDataGrid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 500,
      paddingBottom: theme.spacing(16),
    },
    propertyLabel: {
      flexGrow: 1,
    },
  })
);

interface Props {
  invoiceId: Invoices["id"];
  handleClose: () => void;
}

export default function InvoiceDrawer({ invoiceId, handleClose }: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data } = useGetInvoiceByIdQuery({
    variables: {
      id: invoiceId,
    },
  });

  const invoice = data?.invoices_by_pk;

  const loans = invoice?.loans;

  const invoiceFileIds = useMemo(() => {
    const files = invoice?.invoice_files.filter(
      (f) => f.file_type === InvoiceFileTypeEnum.Invoice
    );
    return files && files.length ? [files[0].file_id] : [];
  }, [invoice]);

  const invoiceCannabisFileIds = useMemo(() => {
    const files = invoice?.invoice_files
      .filter((f) => f.file_type === InvoiceFileTypeEnum.Cannabis)
      .map((f) => f.file_id);
    return files && files.length ? files : [];
  }, [invoice]);

  if (!invoice || !loans) {
    return null;
  }

  return (
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Invoice</Typography>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Platform ID
          </Typography>
          <Typography variant={"body1"}>{invoice.id}</Typography>
        </Box>
        <Box display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Status
            </Typography>
            <RequestStatusChip requestStatus={invoice.status} />
          </Box>
          {isBankUser && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer
              </Typography>
              <Typography variant={"body1"}>{invoice.company?.name}</Typography>
            </Box>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Invoice Number
            </Typography>
            <Typography variant={"body1"}>{invoice.invoice_number}</Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Payor
            </Typography>
            <Typography variant={"body1"}>{invoice.payor?.name}</Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Invoice Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(invoice.invoice_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Due Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(invoice.invoice_due_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Advance Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(invoice.advance_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Subtotal Amount
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(invoice.subtotal_amount)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Taxes
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(invoice.taxes_amount)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Amount
            </Typography>
            <Typography variant={"body1"}>
              {formatCurrency(invoice.total_amount)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Box mb={1}>
              <Typography variant="subtitle2" color="textSecondary">
                Invoice File Attachment
              </Typography>
            </Box>
            <DownloadThumbnail
              fileIds={invoiceFileIds}
              fileType={FileTypeEnum.INVOICE}
            />
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <FormControlLabel
              control={
                <Checkbox disabled={true} checked={!!invoice.is_cannabis} />
              }
              label={"Order includes cannabis or derivatives"}
            />
          </Box>
          {!!invoice.is_cannabis && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Box mb={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Cannabis File Attachments
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Shipping Manifest, Certificate of Analysis
                </Typography>
              </Box>
              <DownloadThumbnail
                fileIds={invoiceCannabisFileIds}
                fileType={FileTypeEnum.INVOICE}
              />
            </Box>
          )}
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Loans
          </Typography>
          <InvoiceLoansDataGrid
            isExcelExport={isBankUser}
            pager={false}
            isMiniTable
            loans={loans}
            isMultiSelectEnabled={check(role, Action.SelectLoan)}
            isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
          />
        </Box>
      </Box>
    </Drawer>
  );
}
