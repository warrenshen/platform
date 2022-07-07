import { Box } from "@material-ui/core";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/FileUploadDropzone";
import { Companies, FileFragment, Files } from "generated/graphql";
import { FileTypeEnum } from "lib/enum";

interface Props {
  dataCy?: string;
  isCountVisible?: boolean;
  companyId: Companies["id"];
  fileType: FileTypeEnum; // what type of document is this? e.g., purchase_order, etc. This is used for the S3 path, not tied to a DB table
  maxFilesAllowed?: number; // maximum number of files a user may upload, 10 is the default
  fileIds?: Files["id"][];
  frozenFileIds?: Files["id"][];
  isAnonymousUser?: boolean;
  handleDeleteFileById?: (fileId: Files["id"]) => void;
  handleNewFiles: (files: FileFragment[]) => void;
  disabled?: boolean;
}

export default function FileUploader({
  dataCy,
  isCountVisible = true,
  companyId,
  fileType,
  maxFilesAllowed,
  fileIds,
  frozenFileIds,
  isAnonymousUser = false,
  handleDeleteFileById,
  handleNewFiles,
  disabled = false,
}: Props) {
  const isDropzoneVisible =
    !(maxFilesAllowed === 1 && fileIds && fileIds.length > 0) && !disabled;

  return (
    <Box>
      {!!fileIds && fileIds.length > 0 && (
        <Box mb={1}>
          <DownloadThumbnail
            isCountVisible={isCountVisible}
            fileType={fileType}
            fileIds={fileIds}
            frozenFileIds={frozenFileIds}
            isAnonymousUser={isAnonymousUser}
            deleteFileId={handleDeleteFileById}
          />
        </Box>
      )}
      {isDropzoneVisible && (
        <Box data-cy={dataCy}>
          <FileUploadDropzone
            companyId={companyId}
            docType={fileType}
            maxFilesAllowed={maxFilesAllowed}
            isAnonymousUser={isAnonymousUser}
            onUploadComplete={async (response) => {
              if (!response.succeeded) {
                return;
              }
              const { files_in_db: files } = response;
              handleNewFiles(files);
            }}
          />
        </Box>
      )}
    </Box>
  );
}
