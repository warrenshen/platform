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
  RequestStatusEnum,
  useGetInvoiceForReviewQuery,
} from "generated/graphql";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { FileTypeEnum } from "lib/enum";
import { anonymousRoutes } from "lib/routes";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import ReviewInvoiceApproveModal from "./ReviewInvoiceApproveModal";
import ReviewInvoiceRejectModal from "./ReviewInvoiceRejectModal";

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
  })
);

export default function ReviewInvoicePage(props: Props) {
  const classes = useStyles();
  const history = useHistory();

  const location: any = props.location;
  const payload = location.state?.payload;
  const linkVal = location.state?.link_val;
  const invoiceId = payload?.invoice_id;

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data, loading: isInvoiceLoading } = useGetInvoiceForReviewQuery({
    variables: {
      id: invoiceId,
    },
  });

  const invoice = data?.invoices_by_pk;

  const invoiceFileIds = useMemo(() => {
    const invoiceFile = invoice?.invoice_files.filter(
      (invoiceFile) => invoiceFile.file_type === InvoiceFileTypeEnum.Invoice
    )[0];
    return invoiceFile ? [invoiceFile.file_id] : [];
  }, [invoice]);

  if (
    invoice &&
    [RequestStatusEnum.Approved, RequestStatusEnum.Rejected].includes(
      invoice?.status
    )
  ) {
    // If the invoice was already reviewed, redirect the user to the complete page.
    // This is so the user cannot re-review an already reviewed invoice.
    history.replace(anonymousRoutes.reviewInvoiceComplete);
  }

  const isDataReady = !isInvoiceLoading;

  return isDataReady && invoice ? (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h5">{`${invoice.payor?.name}, your approval is requested`}</Typography>
          <Box mt={1}>
            <Typography variant="body2">
              The invoice shown below requires your approval. Please review the
              info and press either approve or reject. If you press reject, you
              will be prompted to enter in a reason.
            </Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Issuer
          </Typography>
          <Typography variant={"body1"}>{invoice.company?.name}</Typography>
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
            Invoice File
          </Typography>
          <DownloadThumbnail
            fileIds={invoiceFileIds}
            fileType={FileTypeEnum.INVOICE}
          />
        </Box>
        <Box display="flex" justifyContent="center" mt={4}>
          {isApproveModalOpen && (
            <ReviewInvoiceApproveModal
              invoice={invoice}
              linkVal={linkVal}
              handleClose={() => setIsApproveModalOpen(false)}
              handleApproveSuccess={() => {
                history.push({
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
                history.push({
                  pathname: anonymousRoutes.reviewInvoiceComplete,
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
              onClick={() => setIsApproveModalOpen(true)}
              variant={"contained"}
              color={"primary"}
            >
              Approve
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  ) : null;
}
