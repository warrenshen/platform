import { Box, Grid, IconButton, Link } from "@material-ui/core";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { authenticatedApi, fileRoutes } from "lib/api";
import { useCallback, useEffect, useState } from "react";

interface Props {
  fileIds: string[];
}

type DownloadSignedURLReq = {
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
  urls: string[];
  files: FileWithSignedURL[];
};

async function getDownloadSignedUrl(
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

function DownloadThumbnail({ fileIds }: Props) {
  const [filesWithSignedUrls, setFilesWithSignedUrls] = useState<
    FileWithSignedURL[]
  >([]);

  useEffect(() => {
    setFilesWithSignedUrls([]);
  }, [fileIds]);

  const downloadItems = useCallback(async () => {
    const response = await getDownloadSignedUrl({ file_ids: fileIds });
    if (response.status !== "OK") {
      alert(response.msg);
    } else {
      setFilesWithSignedUrls(response.files);
    }
  }, [fileIds]);

  return (
    <Box display="flex" flexDirection="column">
      <Grid item>
        <IconButton onClick={downloadItems}>
          <span>{`View files (${fileIds.length})`}</span>
          <AttachFileIcon></AttachFileIcon>
        </IconButton>
      </Grid>
      <Box display="flex" flexDirection="column">
        {filesWithSignedUrls.map((fileWithSignedUrl) => {
          return (
            <Box key={fileWithSignedUrl.id} display="flex">
              <Link href={fileWithSignedUrl.url}>
                <CloudDownloadIcon></CloudDownloadIcon>
              </Link>
              <span>{fileWithSignedUrl.name}</span>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default DownloadThumbnail;
