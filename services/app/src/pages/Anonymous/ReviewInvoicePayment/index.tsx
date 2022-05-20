import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  InvoiceFileTypeEnum,
  useGetInvoiceForReviewQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { formatCurrency } from "lib/number";
import { formatDateString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { anonymousRoutes } from "lib/routes";
import ReviewInvoicePaymentConfirmModal from "pages/Anonymous/ReviewInvoicePayment/ReviewInvoicePaymentConfirmModal";
import ReviewInvoicePaymentRejectModal from "pages/Anonymous/ReviewInvoicePayment/ReviewInvoicePaymentRejectModal";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Buttons = styled.div`
  display: flex;

  width: 100%;
`;

const StyledButton = styled(Button)`
  flex: 1;

  padding: 8px 0px;
`;

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

  const {
    data,
    loading: isInvoiceLoading,
    error,
    refetch,
  } = useGetInvoiceForReviewQuery({
    fetchPolicy: "network-only",
    variables: {
      id: invoiceId,
    },
  });

  if (error) {
    console.error({ error });
  }

  const invoice = data?.invoices_by_pk;

  const collectionsAccount =
    invoice && invoice.payor?.settings?.collections_bespoke_bank_account;

  const invoiceFileIds = useMemo(() => {
    const invoiceFile = invoice?.invoice_files.filter(
      (invoiceFile) => invoiceFile.file_type === InvoiceFileTypeEnum.Invoice
    )[0];
    return invoiceFile ? [invoiceFile.file_id] : [];
  }, [invoice]);
  const invoiceCannabisFileIds = useMemo(
    () =>
      invoice?.invoice_files
        .filter(
          (invoiceFile) =>
            invoiceFile.file_type === InvoiceFileTypeEnum.Cannabis
        )
        .map((invoiceFile) => invoiceFile.file_id) || [],
    [invoice]
  );

  // If we've already paid off this invoice, redirect to the complete page
  if (
    invoice &&
    (invoice.payment_confirmed_at || invoice.payment_rejected_at)
  ) {
    history.replace(anonymousRoutes.reviewInvoicePaymentComplete);
  }

  const isDataReady = !isInvoiceLoading && !error;

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        {!isDataReady ? (
          <Box display="flex" flexDirection="column">
            {!!error ? (
              <>
                <Typography variant="h5">
                  A network error occurred. Please check your network connection
                  and try again.
                </Typography>
                <Box display="flex" flexDirection="column" mt={2}>
                  <StyledButton
                    variant={"contained"}
                    color={"primary"}
                    onClick={() => refetch()}
                  >
                    Retry
                  </StyledButton>
                </Box>
              </>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mt={2}
              >
                <Typography variant="h5">Loading...</Typography>
              </Box>
            )}
          </Box>
        ) : !invoice ? (
          <Box display="flex" flexDirection="column">
            <Typography variant="h5">Invoice does not exist</Typography>
          </Box>
        ) : (
          <>
            <Box display="flex" flexDirection="column">
              <Typography variant="h5">{`Payment is requested for Invoice ${invoice.invoice_number}`}</Typography>
              <Box mt={1}>
                <Typography variant="body2">
                  The invoice shown below requires payment. Please review the
                  info and press either approve or reject. If you press reject,
                  you will be prompted to enter in a reason.
                </Typography>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Issuer
              </Typography>
              <Typography variant={"body1"}>
                {getCompanyDisplayName(invoice.company)}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Invoice Number
              </Typography>
              <Typography variant={"body1"}>
                {invoice.invoice_number}
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
                Invoice File
              </Typography>
              <DownloadThumbnail
                fileIds={invoiceFileIds}
                fileType={FileTypeEnum.Invoice}
              />
            </Box>
            {invoice?.is_cannabis && (
              <Box display="flex" flexDirection="column" mt={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Cannabis or Derivatives File(s)
                </Typography>
                <DownloadThumbnail
                  fileIds={invoiceCannabisFileIds}
                  fileType={FileTypeEnum.Invoice}
                />
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
              <Buttons>
                <StyledButton
                  disabled={false}
                  variant={"contained"}
                  color={"primary"}
                  onClick={() => setIsConfirmModalOpen(true)}
                >
                  Notify Bespoke Financial of Payment
                </StyledButton>
              </Buttons>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
