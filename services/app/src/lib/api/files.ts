import { authenticatedApi, fileRoutes } from "lib/api";
import { Files } from "generated/graphql";

export type FileWithSignedURL = {
  id: string;
  name: string;
  path: string;
  url: string;
  created_at: string;
};

type DownloadSignedURLResponse = {
  status: string;
  msg?: string;
  files: FileWithSignedURL[];
};

export function downloadFilesWithSignedUrls(
  fileType: string,
  fileIds: Files["id"][],
  handleSuccess: (files: FileWithSignedURL[]) => void,
  handleError: (response: DownloadSignedURLResponse) => void
): void {
  const params = {
    file_type: fileType,
    file_ids: fileIds,
  };
  authenticatedApi
    .post(fileRoutes.downloadSignedUrl, params)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => handleSuccess(response.files || []),
      (error) => {
        console.error({ error });
        handleError({
          status: "ERROR",
          msg: "Could not download files",
          files: [],
        });
      }
    );
}
