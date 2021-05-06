import { Box } from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/FileUploadDropzone";
import { Companies, FileFragment, Files } from "generated/graphql";
import { FileTypeEnum } from "lib/enum";

interface Props {
  "data-cy"?: string;
  companyId: Companies["id"];
  fileType: FileTypeEnum; // what type of document is this? e.g., purchase_order, etc. This is used for the S3 path, not tied to a DB table
  maxFilesAllowed?: number; // maximum number of files a user may upload, 10 is the default
  fileIds: Files["id"][];
  handleDeleteFileById: (fileId: Files["id"]) => void;
  handleNewFiles: (files: FileFragment[]) => void;
}

export default function FileUploader({
  "data-cy": dataCy,
  companyId,
  fileType,
  maxFilesAllowed,
  fileIds,
  handleDeleteFileById,
  handleNewFiles,
}: Props) {
  return (
    <Box>
      {fileIds.length > 0 && (
        <Box mb={1}>
          <DownloadThumbnail
            fileIds={fileIds}
            fileType={fileType}
            deleteFileId={handleDeleteFileById}
          />
        </Box>
      )}
      <Box data-cy={dataCy}>
        <FileUploadDropzone
          companyId={companyId}
          docType={fileType}
          maxFilesAllowed={maxFilesAllowed}
          onUploadComplete={async (response) => {
            if (!response.succeeded) {
              return;
            }
            const { files_in_db: files } = response;
            handleNewFiles(files);
          }}
        />
      </Box>
    </Box>
  );
}
