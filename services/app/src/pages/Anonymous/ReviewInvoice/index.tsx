import {
  Box,
  Button,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import {
  InvoiceFileTypeEnum,
  RequestStatusEnum,
  useGetInvoiceForReviewQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { formatDateString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { formatCurrency } from "lib/number";
import { anonymousRoutes } from "lib/routes";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import ReviewInvoiceApproveModal from "./ReviewInvoiceApproveModal";
import ReviewInvoiceRejectModal from "./ReviewInvoiceRejectModal";

const Buttons = styled.div`
  display: flex;

  width: 100%;
`;

const StyledButton = styled(Button)`
  flex: 1;

  padding: 8px 0px;
`;

const ButtonSpace = styled.div`
  width: 12px;
`;

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
  })
);

export default function ReviewInvoicePage() {
  const classes = useStyles();
  const navigate = useNavigate();

  const { state } = useLocation();
  const { invoice_id: invoiceId, link_val: linkVal } = state;

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
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

  if (
    invoice &&
    [RequestStatusEnum.Approved, RequestStatusEnum.Rejected].includes(
      invoice?.status
    )
  ) {
    // If the invoice was already reviewed, redirect the user to the complete page.
    // This is so the user cannot re-review an already reviewed invoice.
    navigate(anonymousRoutes.reviewInvoiceComplete, { replace: true });
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
              <Typography variant="h5">{`Approval requested for Invoice ${invoice.invoice_number}`}</Typography>
              <Box mt={1}>
                <Typography variant="body2">
                  The invoice shown below requires your approval. Please review
                  the info and press either approve or reject. If you press
                  reject, you will be prompted to enter in a reason.
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
            <Box display="flex" justifyContent="center" mt={6}>
              {isApproveModalOpen && (
                <ReviewInvoiceApproveModal
                  invoice={invoice}
                  linkVal={linkVal}
                  handleClose={() => setIsApproveModalOpen(false)}
                  handleApproveSuccess={() => {
                    navigate({
                      pathname: anonymousRoutes.reviewInvoiceComplete,
                    });
                  }}
                />
              )}
              {isRejectModalOpen && (
                <ReviewInvoiceRejectModal
                  invoiceId={invoice?.id}
                  linkVal={linkVal}
                  handleClose={() => setIsRejectModalOpen(false)}
                  handleRejectSuccess={() =>
                    navigate({
                      pathname: anonymousRoutes.reviewInvoiceComplete,
                    })
                  }
                />
              )}
              <Buttons>
                <StyledButton
                  disabled={false}
                  variant={"outlined"}
                  color={"default"}
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Reject
                </StyledButton>
                <ButtonSpace />
                <StyledButton
                  disabled={false}
                  variant={"contained"}
                  color={"primary"}
                  onClick={() => setIsApproveModalOpen(true)}
                >
                  Approve
                </StyledButton>
              </Buttons>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
