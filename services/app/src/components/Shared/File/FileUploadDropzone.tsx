import {
  Box,
  Button,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import * as Sentry from "@sentry/react";
import axios from "axios";
import { FileFragment } from "generated/graphql";
import { authenticatedApi, fileRoutes } from "lib/api";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: "100%",
      minWidth: 450,
      border: "1px dotted #D4D3D0",
      borderRadius: "4px",
    },
    dropzone: {
      "&:hover": {
        cursor: "pointer",
      },
      backgroundColor: "#F6F5F3",
    },
  })
);

type FileInfo = {
  name: string;
  size: number;
  content_type: string;
};

type GetSignedURLReq = {
  file_info: FileInfo;
  company_id: string;
  doc_type: string;
};

type GetSignedURLResponse = {
  status: string;
  msg?: string;
  file_in_db: FileFragment;
  url?: string;
  upload_via_server?: boolean;
};

type UploadResponse = {
  status: string;
  msg?: string;
  file_in_db: FileFragment | null;
};

type OnUploadCompleteResp = {
  numErrors: number;
  numSucceeded: number;
  succeeded: boolean;
  msg: string;
  files_in_db: FileFragment[];
};

async function getPutSignedUrl(
  reqData: GetSignedURLReq,
  isAnonymousUser: boolean
): Promise<GetSignedURLResponse> {
  const putUrl = isAnonymousUser
    ? fileRoutes.anonymousPutSignedUrl
    : fileRoutes.putSignedUrl;

  return authenticatedApi
    .post(putUrl, reqData)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return { status: "ERROR", msg: "Could not get upload url" };
      }
    );
}

const uploadFile = async (
  file: any,
  isAnonymousUser: boolean,
  getSignedURLResp: GetSignedURLResponse
): Promise<UploadResponse> => {
  const contentType = file.type;

  const url = getSignedURLResp.url || "";
  const path = getSignedURLResp.file_in_db?.path || "";
  const uploadViaServer = getSignedURLResp.upload_via_server || false;
  const fileInDB = getSignedURLResp.file_in_db;

  if (uploadViaServer) {
    const options = {
      headers: {
        "X-Bespoke-Content-Type": contentType,
        "X-Bespoke-FilePath": path,
        "X-Bespoke-Url": url,
        "Content-Type": "multipart/form-data",
      },
    };
    const formData = new FormData();
    formData.append("file", file);

    const uploadUrl = isAnonymousUser
      ? fileRoutes.anonymousUploadSignedUrl
      : fileRoutes.uploadSignedUrl;

    return authenticatedApi
      .put(uploadUrl, formData, options)
      .then((res) => {
        return { status: "OK", file_in_db: fileInDB };
      })
      .catch((e) => {
        Sentry.captureException(e);

        return {
          status: "ERROR",
          msg: "Something went wrong uploading the file",
          file_in_db: null,
        };
      });
  }

  // This method is needed in prod because we upload directly to the S3 URL.
  // In local we can't do this directly because of CORS.
  const putURL = url;
  const options = {
    params: {
      Key: path,
      ContentType: contentType,
    },
    headers: {
      "Content-Type": contentType,
    },
  };

  return axios
    .put(putURL, file, options)
    .then((res) => {
      return { status: "OK", file_in_db: fileInDB };
    })
    .catch((e) => {
      Sentry.captureException(e);

      return {
        status: "ERROR",
        msg: "Something went wrong uploading the file",
        file_in_db: null,
      };
    });
};

interface Props {
  isSaveAutomatic?: boolean;
  companyId: string; // which companyID does this document correspond to
  docType: string; // what type of document is this? e.g., purchase_order, etc. This is used for the S3 path, not tied to a DB table
  maxFilesAllowed?: number; // maximum number of files a user may upload, 10 is the default
  isAnonymousUser?: boolean;
  onUploadComplete: (resp: OnUploadCompleteResp) => void;
}

export default function FileUploadDropzone({
  isSaveAutomatic = true,
  companyId,
  docType,
  maxFilesAllowed = 25,
  isAnonymousUser = false,
  onUploadComplete,
}: Props) {
  const classes = useStyles();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveFiles = useCallback(async () => {
    const processFile = async (file: any): Promise<UploadResponse> => {
      return getPutSignedUrl(
        {
          file_info: {
            name: file.name,
            content_type: file.type,
            size: file.size,
          },
          company_id: companyId,
          doc_type: docType,
        },
        isAnonymousUser
      ).then((resp) => {
        if (resp.status !== "OK") {
          return { status: "ERROR", msg: resp.msg || "", file_in_db: null };
        }
        return uploadFile(file, isAnonymousUser, resp).then((uploadResp) => {
          if (uploadResp.status === "OK") {
            return uploadResp;
          }
          // Try to upload the file again but turn on the upload_via_server flag
          // in the case that S3 caused the issue with a user's browser
          resp.upload_via_server = true;
          return uploadFile(file, isAnonymousUser, resp).then((uploadResp2) => {
            return uploadResp2;
          });
        });
      });
    };

    setIsLoading(true);

    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) {
        continue;
      }
      uploadPromises.push(processFile(file));
    }

    const uploadResps = await Promise.all(uploadPromises);
    let numErrors = 0;
    let numSucceeded = 0;
    let errMsg = "";
    const filesInDB = [];
    for (let i = 0; i < uploadResps.length; i++) {
      const uploadResp = uploadResps[i];
      if (uploadResp.status !== "OK" || !uploadResp.file_in_db) {
        numErrors += 1;
        errMsg = uploadResp.msg || "";
      } else {
        numSucceeded += 1;
        filesInDB.push(uploadResp.file_in_db);
      }
    }

    if (numErrors > 0) {
      setMessage(errMsg);
    }

    setFiles([]);
    setIsLoading(false);

    if (onUploadComplete) {
      onUploadComplete({
        numSucceeded: numSucceeded,
        numErrors: numErrors,
        succeeded: numErrors === 0,
        msg: errMsg,
        files_in_db: filesInDB,
      });
    }
  }, [companyId, docType, files, onUploadComplete, isAnonymousUser]);

  const handleClearFiles = useCallback(() => {
    setFiles([]);
    setMessage("");
  }, []);

  const handleDropFiles = useCallback(
    (acceptedFiles) => {
      if (maxFilesAllowed !== null && acceptedFiles.length > maxFilesAllowed) {
        setMessage(`Only ${maxFilesAllowed} file(s) may be uploaded!`);
      } else {
        setMessage("");
        if (isSaveAutomatic && acceptedFiles.length > 0) {
          setIsLoading(true);
        }
        setFiles(acceptedFiles);
      }
    },
    [isSaveAutomatic, maxFilesAllowed]
  );

  useEffect(() => {
    if (isSaveAutomatic && files.length > 0) {
      handleSaveFiles();
    }
  }, [isSaveAutomatic, files, handleSaveFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDropFiles,
  });

  return (
    <Box className={classes.container}>
      {isLoading ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight={100}
          py={2}
        >
          Loading...
        </Box>
      ) : files.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          minHeight={100}
          className={classes.dropzone}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Typography color="secondary" align="center">
              {message}
            </Typography>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" mr={1}>
                <AddIcon style={{ color: "#ABAAA9" }} />
              </Box>
              <Typography color="textSecondary">
                {isDragActive
                  ? "Drop the files here ..."
                  : `Drag-and-drop file${
                      maxFilesAllowed > 1 ? "(s)" : ""
                    } or press to select`}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight={100}
          py={2}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
            <Typography color="secondary" align="center">
              {message}
            </Typography>
            <Typography align="center">
              {files.map((file) => file.name).join(", ")}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Box display="flex" justifyContent="space-between" width={260}>
              <Button
                onClick={handleClearFiles}
                variant="outlined"
                color="secondary"
              >
                Clear Files
              </Button>
              <Button
                onClick={handleSaveFiles}
                variant="contained"
                color="primary"
              >
                {`Save Files (${files.length})`}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
