import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import axios from "axios";
import { FileFragment } from "generated/graphql";
import { authenticatedApi, fileRoutes } from "lib/api";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: "100%",
      minWidth: 450,
      border: "1px dotted black",
    },
    dropzone: {
      "&:hover": {
        cursor: "pointer",
      },
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
  reqData: GetSignedURLReq
): Promise<GetSignedURLResponse> {
  return authenticatedApi
    .post(fileRoutes.putSignedUrl, reqData)
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

interface Props {
  companyId: string; // which companyID does this document correspond to
  docType: string; // what type of document is this? e.g., purchase_order, etc. This is used for the S3 path, not tied to a DB table
  maxFilesAllowed?: number; // maximum number of files a user may upload, 10 is the default
  onUploadComplete: (resp: OnUploadCompleteResp) => void;
}

function FileUploadDropzone({
  companyId,
  docType,
  maxFilesAllowed = 10,
  onUploadComplete,
}: Props) {
  const classes = useStyles();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  const unattachFiles = useCallback(() => {
    setFiles([]);
    setMessage("");
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (maxFilesAllowed !== null && acceptedFiles.length > maxFilesAllowed) {
        setMessage(`Only ${maxFilesAllowed} file(s) may be uploaded!`);
      } else {
        setMessage("");
        setFiles(acceptedFiles);
      }
    },
    [maxFilesAllowed]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const uploadFile = async (
    file: any,
    getSignedURLResp: GetSignedURLResponse
  ): Promise<UploadResponse> => {
    const contentType = file.type;

    const url = getSignedURLResp.url || "";
    const path = getSignedURLResp.file_in_db?.path || "";
    const uploadViaServer = getSignedURLResp.upload_via_server || false;
    const fileInDB = getSignedURLResp.file_in_db;

    if (uploadViaServer) {
      let options = {
        headers: {
          "X-Bespoke-Content-Type": contentType,
          "X-Bespoke-FilePath": path,
          "X-Bespoke-Url": url,
          "Content-Type": "multipart/form-data",
        },
      };
      var formData = new FormData();
      formData.append("file", file);
      return authenticatedApi
        .put(fileRoutes.uploadSignedUrl, formData, options)
        .then((res) => {
          return { status: "OK", file_in_db: fileInDB };
        })
        .catch((err) => {
          console.log(err);
          return {
            status: "ERROR",
            msg: "Something went wrong uploading the file",
            file_in_db: null,
          };
        });
    }

    // This method is needed in prod because we upload directly to the S3 URL. In local
    // we can't do this directly because of CORS.
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
      .catch((err) => {
        console.log(err);
        return {
          status: "ERROR",
          msg: "Something went wrong uploading the file",
          file_in_db: null,
        };
      });
  };

  const onFileSubmit = useCallback(async () => {
    const processFile = async (file: any): Promise<UploadResponse> => {
      return getPutSignedUrl({
        file_info: {
          name: file.name,
          content_type: file.type,
          size: file.size,
        },
        company_id: companyId,
        doc_type: docType,
      }).then((resp) => {
        if (resp.status !== "OK") {
          return { status: "ERROR", msg: resp.msg || "", file_in_db: null };
        }
        return uploadFile(file, resp).then((uploadResp) => {
          return uploadResp;
        });
      });
    };

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

    if (onUploadComplete) {
      onUploadComplete({
        numSucceeded: numSucceeded,
        numErrors: numErrors,
        succeeded: numErrors === 0,
        msg: errMsg,
        files_in_db: filesInDB,
      });
    }
  }, [companyId, docType, files, onUploadComplete]);

  return (
    <Box
      mt={1}
      mb={2}
      justifyContent="center"
      alignItems="center"
      className={classes.container}
    >
      {files.length === 0 ? (
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
            <Box display="flex" alignItems="center">
              <Box display="flex" mr={1}>
                <CloudUploadIcon></CloudUploadIcon>
              </Box>
              <Typography color="textPrimary">
                {isDragActive
                  ? "Drop the files here ..."
                  : "Drag-and-drop files here, or click here to select"}
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
                onClick={unattachFiles}
                variant="outlined"
                color="secondary"
              >
                Clear Files
              </Button>
              <Button
                onClick={onFileSubmit}
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

export default FileUploadDropzone;
