import {
  Box,
  Button,
  createStyles,
  IconButton,
  makeStyles,
  Theme,
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import axios from "axios";
import { FileFragment } from "generated/graphql";
import { authenticatedApi, fileRoutes } from "lib/api";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropzone: {
      border: "1px dotted black",
      textAlign: "center",
      height: 150,
      width: 600,
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
        setMessage(
          `Too many files provided. Only ${maxFilesAllowed} may be uploaded`
        );
        return;
      }
      // Do something with the files
      setMessage("");
      setFiles(acceptedFiles);
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
    } else {
      setMessage(`Uploaded ${files.length} file(s) successfully`);
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
      pt={3}
      alignItems="center"
      justifyContent="center"
      className={classes.dropzone}
    >
      <div {...getRootProps()}>
        <input {...getInputProps()} />

        {files.length === 0 && (
          <div>
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag-and-drop files here, or click here to select</p>
            )}
          </div>
        )}
      </div>

      {message ? message : ""}
      {files.length > 0 && (
        <Box textOverflow="clip">
          {files
            .map((file) => {
              return file.name;
            })
            .join(", ")}
        </Box>
      )}
      {files.length > 0 && (
        <Box>
          <span>{files.length} file(s) attached</span>
          <IconButton onClick={unattachFiles}>
            <ClearIcon></ClearIcon>
          </IconButton>
        </Box>
      )}
      {files.length > 0 && (
        <Button onClick={onFileSubmit} variant="contained" color="default">
          Save Files
        </Button>
      )}
    </Box>
  );
}

export default FileUploadDropzone;
