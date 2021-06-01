import { authenticatedApi, fileRoutes } from "lib/api";

type DownloadSignedURLReq = {
  file_type: string;
  file_ids: string[];
};

export type FileWithSignedURL = {
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

export async function downloadFilesWithSignedUrls(
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
