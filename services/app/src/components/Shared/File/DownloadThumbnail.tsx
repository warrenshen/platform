import { Box, Button, Link, Typography } from "@material-ui/core";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import { ReactComponent as CloseIcon } from "components/Shared/Layout/Icons/Close.svg";
import { authenticatedApi, fileRoutes } from "lib/api";
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

const CloseButton = styled(Button)`
  width: 36px;
  min-width: 36px;
  height: 36px;
`;

type DownloadSignedURLReq = {
  file_type: string;
  file_ids: string[];
};

type FileWithSignedURL = {
  id: string;
  name: string;
  path: string;
  url: string;
};

type DownloadSignedURLResponse = {
  status: string;
  msg?: string;
  files: FileWithSignedURL[];
};

async function downloadFilesWithSignedUrls(
  reqData: DownloadSignedURLReq
): Promise<DownloadSignedURLResponse> {
  return authenticatedApi
    .post(fileRoutes.downloadSignedUrl, reqData)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return { status: "ERROR", msg: "Could not get download url" };
      }
    );
}

interface Props {
  fileIds: string[];
  fileType: string;
  deleteFileId?: (fileId: string) => void;
}

export default function DownloadThumbnail({
  fileIds,
  fileType,
  deleteFileId,
}: Props) {
  const [filesWithSignedUrls, setFilesWithSignedUrls] = useState<
    FileWithSignedURL[]
  >([]);

  useEffect(() => {
    const getFilesWithSignedUrls = async () => {
      if (fileIds.length > 0) {
        const response = await downloadFilesWithSignedUrls({
          file_ids: fileIds,
          file_type: fileType,
        });
        if (response.status !== "OK") {
          console.log({ response });
          alert(response.msg);
        } else {
          setFilesWithSignedUrls(response.files);
        }
      }
    };
    getFilesWithSignedUrls();
  }, [fileIds, fileType, setFilesWithSignedUrls]);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <Box>
          <Typography
            variant={"body2"}
            color={"textSecondary"}
          >{`${fileIds.length} file(s) attached`}</Typography>
        </Box>
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
