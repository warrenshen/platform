import { Grid, IconButton, Link } from "@material-ui/core";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { authenticatedApi, fileRoutes } from "lib/api";
import { useCallback } from "react";

interface Props {
  fileIds: string[];
  fileUrls: string[];
  setFileUrls: (urls: string[]) => void;
}

type DownloadSignedURLReq = {
  file_ids: string[];
};

type DownloadSignedURLResponse = {
  status: string;
  msg?: string;
  urls: string[];
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

function DownloadThumbnail(props: Props) {
  const downloadItems = useCallback(async () => {
    const resp = await getDownloadSignedUrl({ file_ids: props.fileIds });
    if (resp.status !== "OK") {
      window.console.log(resp.msg);
    }
    props.setFileUrls(resp.urls);
  }, [props]);

  return (
    <>
      <Grid container direction="row" alignItems="center">
        <Grid item>
          <IconButton>
            <AttachFileIcon onClick={downloadItems}></AttachFileIcon>
          </IconButton>
        </Grid>
        {props.fileUrls &&
          props.fileUrls.map((fileUrl) => {
            return (
              <Grid item>
                <Link key={fileUrl} href={fileUrl}>
                  <CloudDownloadIcon></CloudDownloadIcon>
                </Link>
              </Grid>
            );
          })}
      </Grid>
    </>
  );
}

export default DownloadThumbnail;
