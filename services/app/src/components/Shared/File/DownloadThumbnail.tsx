import { Box, Button, Link, Typography } from "@material-ui/core";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import { ReactComponent as CloseIcon } from "components/Shared/Layout/Icons/Close.svg";
import { Files } from "generated/graphql";
import { FileWithSignedURL, downloadFilesWithSignedUrls } from "lib/api/files";
import { formatDatetimeString } from "lib/date";
import { useEffect, useState } from "react";
import styled from "styled-components";

const File = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 36px;
  margin-bottom: 8px;
  border: 1px solid rgba(95, 90, 84, 0.2);
  border-radius: 3px;
`;

const FileLink = styled(Link)`
  display: flex;
  align-items: center;

  flex: 1;

  height: 36px;
  padding: 0px 8px;
  overflow: hidden;
`;

const FileLinkText = styled.span`
  width: 100%;
  height: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const FileRightSection = styled.div`
  display: flex;
  align-items: center;
`;

const CloseButton = styled(Button)`
  width: 36px;
  min-width: 36px;
  height: 36px;
`;

interface Props {
  isCountVisible?: boolean;
  fileType: string;
  fileIds: Files["id"][];
  frozenFileIds?: Files["id"][];
  deleteFileId?: (fileId: Files["id"]) => void;
}

function FileDownloadThumnail({
  frozenFileIds,
  fileWithSignedUrl,
  deleteFileId,
}: {
  frozenFileIds?: Files["id"][];
  fileWithSignedUrl: FileWithSignedURL;
  deleteFileId?: (fileId: Files["id"]) => void;
}) {
  // If no frozenFileIds array is provided, assume all files are frozen.
  const isFileFrozen =
    !frozenFileIds || frozenFileIds.includes(fileWithSignedUrl.id);

  return (
    <File key={fileWithSignedUrl.id}>
      <FileLink
        key={fileWithSignedUrl.id}
        href={fileWithSignedUrl.url}
        target={"_blank"}
      >
        <Box mr={1}>
          <InsertDriveFileIcon />
        </Box>
        <FileLinkText>{fileWithSignedUrl.name}</FileLinkText>
      </FileLink>
      <FileRightSection>
        {isFileFrozen && (
          <Box mr={1}>
            <Typography variant="subtitle2" color="textSecondary">
              {`Uploaded ${formatDatetimeString(fileWithSignedUrl.created_at)}`}
            </Typography>
          </Box>
        )}
        {!isFileFrozen && deleteFileId && (
          <CloseButton
            onClick={() => deleteFileId && deleteFileId(fileWithSignedUrl.id)}
          >
            <CloseIcon />
          </CloseButton>
        )}
      </FileRightSection>
    </File>
  );
}

export default function DownloadThumbnail({
  isCountVisible = true,
  fileType,
  fileIds,
  frozenFileIds,
  deleteFileId,
}: Props) {
  const [filesWithSignedUrls, setFilesWithSignedUrls] = useState<
    FileWithSignedURL[]
  >([]);

  useEffect(() => {
    downloadFilesWithSignedUrls(
      fileType,
      fileIds,
      (files) => setFilesWithSignedUrls(files),
      (response) => alert(response.msg)
    );
  }, [fileIds, fileType, setFilesWithSignedUrls]);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        {isCountVisible && (
          <Box>
            <Typography variant={"body2"} color={"textSecondary"}>
              {`${fileIds.length} file(s) attached`}
            </Typography>
          </Box>
        )}
        {filesWithSignedUrls.length > 0 && (
          <Box display="flex" flexDirection="column" mt={1}>
            {filesWithSignedUrls.map((fileWithSignedUrl) => (
              <FileDownloadThumnail
                key={fileWithSignedUrl.id}
                frozenFileIds={frozenFileIds}
                fileWithSignedUrl={fileWithSignedUrl}
                deleteFileId={deleteFileId}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
