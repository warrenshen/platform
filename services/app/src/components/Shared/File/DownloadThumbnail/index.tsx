import { Box, Link, Typography } from "@material-ui/core";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import { authenticatedApi, fileRoutes } from "lib/api";
import { useState } from "react";
import { useDeepCompareEffect } from "react-use";

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
}

function DownloadThumbnail({ fileIds }: Props) {
  const [filesWithSignedUrls, setFilesWithSignedUrls] = useState<
    FileWithSignedURL[]
  >([]);

  useDeepCompareEffect(() => {
    setFilesWithSignedUrls([]);
  }, [fileIds]);

  useDeepCompareEffect(() => {
    const getFilesWithSignedUrls = async () => {
      if (fileIds.length > 0) {
        const response = await downloadFilesWithSignedUrls({
          file_ids: fileIds,
        });
        if (response.status !== "OK") {
          alert(response.msg);
        } else {
          setFilesWithSignedUrls(response.files);
        }
      }
    };
    getFilesWithSignedUrls();
  }, [fileIds, setFilesWithSignedUrls]);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column">
        <Box>
          <Typography
            variant={"body2"}
            color={"textSecondary"}
          >{`${filesWithSignedUrls.length} file(s) attached`}</Typography>
        </Box>
        {filesWithSignedUrls.length > 0 && (
          <Box display="flex" flexDirection="column" mt={1}>
            {filesWithSignedUrls.map((fileWithSignedUrl) => (
              <Link key={fileWithSignedUrl.id} href={fileWithSignedUrl.url}>
                <Box display="flex" alignItems="center">
                  <InsertDriveFileIcon></InsertDriveFileIcon>
                  <Box ml={1}>
                    <Typography variant={"body2"} color={"primary"}>
                      {fileWithSignedUrl.name}
                    </Typography>
                  </Box>
                </Box>
              </Link>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default DownloadThumbnail;
