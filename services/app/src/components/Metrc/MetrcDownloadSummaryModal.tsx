import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
  Typography,
  Theme,
} from "@material-ui/core";
import RawJsonToggle from "components/Shared/RawJsonToggle";
import {
  MetrcDownloadSummaries,
  useGetMetrcDownloadSummaryQuery,
} from "generated/graphql";
import { formatDateString } from "lib/date";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 600,
      height: 600,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
  })
);

interface Props {
  metrcDownloadSummaryId: MetrcDownloadSummaries["id"];
  handleClose: () => void;
}

export default function MetrcDownloadSummaryModal({
  metrcDownloadSummaryId,
  handleClose,
}: Props) {
  const classes = useStyles();

  const { data, error } = useGetMetrcDownloadSummaryQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcDownloadSummaryId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const metrcDownloadSummary = data?.metrc_download_summaries_by_pk;

  if (!metrcDownloadSummary) {
    return null;
  }

  return (
    <Dialog open classes={{ paper: classes.dialog }} onClose={handleClose}>
      <DialogTitle className={classes.dialogTitle}>
        Metrc Download Summary
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            License Number
          </Typography>
          <Typography variant="body2">
            {metrcDownloadSummary.license_number}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Date
          </Typography>
          <Typography variant="body2">
            {formatDateString(metrcDownloadSummary.date)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Status
          </Typography>
          <Typography variant="body2">{metrcDownloadSummary.status}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Packages Status
          </Typography>
          <Typography variant="body2">
            {metrcDownloadSummary.packages_status}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Transfers Status
          </Typography>
          <Typography variant="body2">
            {metrcDownloadSummary.transfers_status}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Sales Status
          </Typography>
          <Typography variant="body2">
            {metrcDownloadSummary.sales_status}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Plants Status
          </Typography>
          <Typography variant="body2">
            {metrcDownloadSummary.plants_status}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Plant Batches Status
          </Typography>
          <Typography variant="body2">
            {metrcDownloadSummary.plant_batches_status}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Harvests Status
          </Typography>
          <Typography variant="body2">
            {metrcDownloadSummary.harvests_status}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2} mb={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Raw Error Details JSON
          </Typography>
          <RawJsonToggle rawJson={metrcDownloadSummary.err_details} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
