import {
  Box,
  Button,
  createStyles,
  Drawer,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { formatDateString } from "lib/date";
import { CompanyLicenseFragment } from "generated/graphql";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileViewer from "components/Shared/File/FileViewer";
import { useState } from "react";
import { FileTypeEnum } from "lib/enum";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 500,
      paddingBottom: theme.spacing(16),
    },
  })
);

interface Props {
  companyLicense: CompanyLicenseFragment;
  handleClose: () => void;
}

export default function CompanyLicenseDrawer({
  companyLicense,
  handleClose,
}: Props) {
  const classes = useStyles();

  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

  return (
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Company License</Typography>

        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            License Number
          </Typography>
          <Typography variant={"body1"}>
            {companyLicense.license_number}
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            US State
          </Typography>
          <Typography variant={"body1"}>{companyLicense.us_state}</Typography>
        </Box>

        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Legal Name
          </Typography>
          <Typography variant={"body1"}>{companyLicense.legal_name}</Typography>
        </Box>

        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            License Category
          </Typography>
          <Typography variant={"body1"}>
            {companyLicense.license_category}
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            License Description
          </Typography>
          <Typography variant={"body1"}>
            {companyLicense.license_description}
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            License Status
          </Typography>
          <Typography variant={"body1"}>
            {companyLicense.license_status}
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Expiration Date
          </Typography>
          <Typography variant={"body1"}>
            {companyLicense.expiration_date
              ? formatDateString(companyLicense.expiration_date)
              : "-"}
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            File Attachments
          </Typography>
          <DownloadThumbnail
            fileIds={[companyLicense.file_id]}
            fileType={FileTypeEnum.CompanyLicense}
          />
          <Button
            style={{ alignSelf: "flex-start" }}
            variant="outlined"
            size="small"
            onClick={() => setIsFileViewerOpen(!isFileViewerOpen)}
          >
            {isFileViewerOpen ? "Hide File(s)" : "Show File(s)"}
          </Button>
          {isFileViewerOpen && (
            <Box mt={1}>
              <FileViewer
                fileIds={[companyLicense.file_id]}
                fileType={FileTypeEnum.EbbaApplication}
              />
            </Box>
          )}
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Actions
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
