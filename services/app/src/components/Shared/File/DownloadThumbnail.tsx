import { Box, Button, Link, Typography } from "@material-ui/core";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import { ReactComponent as CloseIcon } from "components/Shared/Layout/Icons/Close.svg";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { FileWithSignedURL, downloadFilesWithSignedUrls } from "lib/api/files";

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

const CloseButton = styled(Button)`
  width: 36px;
  min-width: 36px;
  height: 36px;
`;

interface Props {
  isCountVisible?: boolean;
  fileIds: string[];
  fileType: string;
  deleteFileId?: (fileId: string) => void;
}

export default function DownloadThumbnail({
  isCountVisible = true,
  fileIds,
  fileType,
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
                {deleteFileId && (
                  <CloseButton
                    onClick={() =>
                      deleteFileId && deleteFileId(fileWithSignedUrl.id)
                    }
                  >
                    <CloseIcon />
                  </CloseButton>
                )}
              </File>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
