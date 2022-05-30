import { Files } from "generated/graphql";
import { authenticatedApi, fileRoutes } from "lib/api";

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
  isAnonymousUser: boolean,
  handleSuccess: (files: FileWithSignedURL[]) => void,
  handleError: (response: DownloadSignedURLResponse) => void
): void {
  const params = {
    file_type: fileType,
    file_ids: fileIds,
  };
  const downloadUrl = isAnonymousUser
    ? fileRoutes.anonymousDownloadSignedUrl
    : fileRoutes.downloadSignedUrl;
  authenticatedApi
    .post(downloadUrl, params)
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
