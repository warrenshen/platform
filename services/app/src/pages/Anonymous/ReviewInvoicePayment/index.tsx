import {
  Box,
  Button,
  Checkbox,
  createStyles,
  FormControlLabel,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  InvoiceFileTypeEnum,
  useGetInvoiceForReviewQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { anonymousRoutes } from "lib/routes";
import ReviewInvoicePaymentConfirmModal from "pages/Anonymous/ReviewInvoicePayment/ReviewInvoicePaymentConfirmModal";
import ReviewInvoicePaymentRejectModal from "pages/Anonymous/ReviewInvoicePayment/ReviewInvoicePaymentRejectModal";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

interface Props {
  location: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      overflow: "scroll",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 500,
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    buttonClass: {
      marginLeft: theme.spacing(1),
    },
    propertyLabel: {
      flexGrow: 1,
    },
    constLabels: {
      minWidth: 150,
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    paymentInfo: {
      marginTop: theme.spacing(3),
    },
  })
);

export default function ReviewInvoicePaymentPage(props: Props) {
  const classes = useStyles();

  const location: any = props.location;
  const payload = location.state?.payload;
  const linkVal = location.state?.link_val;
  const invoiceId = payload?.invoice_id;

  const history = useHistory();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data, loading: isInvoiceLoading } = useGetInvoiceForReviewQuery({
    variables: {
      id: invoiceId,
    },
  });

  const invoice = data?.invoices_by_pk;

  const collectionsAccount =
    invoice && invoice.payor?.settings?.collections_bespoke_bank_account;

  const invoiceFileIds = useMemo(() => {
    const invoiceFile = invoice?.invoice_files.filter(
      (invoiceFile) => invoiceFile.file_type === InvoiceFileTypeEnum.Invoice
    )[0];
    return invoiceFile ? [invoiceFile.file_id] : [];
  }, [invoice]);

  const invoiceCannabisFileIds = useMemo(() => {
    return (
      invoice?.invoice_files
        .filter(
          (invoiceFile) =>
            invoiceFile.file_type === InvoiceFileTypeEnum.Cannabis
        )
        .map((invoiceFile) => invoiceFile.file_id) || []
    );
  }, [invoice]);

  // If we've already confirmed this invoice, redirect to the complete page
  if (
    invoice &&
    (invoice.payment_confirmed_at || invoice.payment_rejected_at)
  ) {
    history.replace(anonymousRoutes.reviewInvoicePaymentComplete);
  }

  const isDataReady = !isInvoiceLoading;

  return isDataReady && invoice ? (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h5">{`${invoice.payor?.name}, your payment is requested`}</Typography>
          <Box mt={1}>
            <Typography variant="body2">
              The invoice listed below requires payment. Please review the info
              and press either approve or reject. If you press reject, you will
              be prompted to enter in a reason.
            </Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Number
          </Typography>
          <Typography variant={"body1"}>{invoice.invoice_number}</Typography>
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
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Date
          </Typography>
          <Typography variant={"body1"}>
            {formatDateString(invoice.invoice_date)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice Due Date
          </Typography>
          <Typography variant={"body1"}>
            {formatDateString(invoice.invoice_due_date)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Issuer
          </Typography>
          <Typography variant={"body1"}>{invoice.company?.name}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Invoice File
          </Typography>
          <DownloadThumbnail fileIds={invoiceFileIds} />
        </Box>
        <Box mt={2}>
          <FormControlLabel
            control={
              <Checkbox disabled={true} checked={!!invoice?.is_cannabis} />
            }
            label={"Invoice includes cannabis or derivatives"}
          />
        </Box>
        {invoice?.is_cannabis && (
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Cannabis or Derivatives File(s)
            </Typography>
            <DownloadThumbnail fileIds={invoiceCannabisFileIds} />
          </Box>
        )}
        {collectionsAccount && (
          <Box mr={3} className={classes.paymentInfo}>
            <Typography variant="subtitle1">Payment Information</Typography>
            <Typography variant="body2">
              Please make your payment to this Bank Account
            </Typography>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Bank Name
              </Typography>
              <Typography variant={"body1"}>
                {collectionsAccount.bank_name}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Bank Address
              </Typography>
              <Typography variant={"body1"}>
                {collectionsAccount.bank_address || "Unknown"}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Routing Number
              </Typography>
              <Typography variant={"body1"}>
                {collectionsAccount.routing_number}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Account Number
              </Typography>
              <Typography variant={"body1"}>
                {collectionsAccount.account_number}
              </Typography>
            </Box>
          </Box>
        )}
        <Box display="flex" justifyContent="center" mt={4}>
          {isConfirmModalOpen && (
            <ReviewInvoicePaymentConfirmModal
              invoice={invoice}
              linkVal={linkVal}
              handleClose={() => setIsConfirmModalOpen(false)}
              handleConfirmSuccess={() => {
                history.push({
                  pathname: anonymousRoutes.reviewInvoicePaymentComplete,
                });
              }}
            />
          )}
          {isRejectModalOpen && (
            <ReviewInvoicePaymentRejectModal
              invoice={invoice}
              linkVal={linkVal}
              handleClose={() => setIsRejectModalOpen(false)}
              handleRejectSuccess={() =>
                history.push({
                  pathname: anonymousRoutes.reviewInvoicePaymentComplete,
                })
              }
            />
          )}
          <Box mr={2}>
            <Button
              disabled={false}
              onClick={() => setIsRejectModalOpen(true)}
              variant={"contained"}
              color={"default"}
            >
              Reject
            </Button>
          </Box>
          <Box>
            <Button
              disabled={false}
              onClick={() => setIsConfirmModalOpen(true)}
              variant={"contained"}
              color={"primary"}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  ) : null;
}
