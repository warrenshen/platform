import {
  Box,
  Button,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import axios from "axios";
import { authenticatedApi, fileRoutes } from "lib/api";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropzone: {
      border: "1px solid black",
      textAlign: "center",
    },
  })
);

type GetSignedURLReq = {
  name: string;
  content_type: string;
  company_id: string;
  doc_type: string;
};

type GetSignedURLResponse = {
  status: string;
  msg?: string;
  url?: string;
  path?: string;
  upload_via_server?: boolean;
};

type UploadResponse = {
  status: string;
  msg?: string;
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

type OnUploadCompleteResp = {
  numErrors: number;
  numSucceeded: number;
};

interface Props {
  companyId: string; // which companyID does this document correspond to
  docType: string; // what type of document is this? e.g., purchase_order, etc.
  onUploadComplete: (resp: OnUploadCompleteResp) => void;
}

function FileUploadDropzone(props: Props) {
  const classes = useStyles();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    setFiles(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const uploadFile = (
    file: any,
    url: string,
    path: string,
    uploadViaServer: boolean
  ): Promise<UploadResponse> => {
    const contentType = file.type;

    if (uploadViaServer) {
      const options = {
        headers: {
          "Content-Type": contentType,
          FilePath: path,
          Url: url,
        },
      };
      return authenticatedApi
        .put(fileRoutes.uploadSignedUrl, file, options)
        .then((res) => {
          return { status: "OK" };
        })
        .catch((err) => {
          console.log(err);
          return {
            status: "ERROR",
            msg: "Something went wrong uploading the file",
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
        return { status: "OK" };
      })
      .catch((err) => {
        console.log(err);
        return {
          status: "ERROR",
          msg: "Something went wrong uploading the file",
        };
      });
  };

  const onFileSubmit = useCallback(async () => {
    const processFile = async (file: any): Promise<UploadResponse> => {
      return getPutSignedUrl({
        name: file.name,
        content_type: file.type,
        company_id: props.companyId,
        doc_type: props.docType,
      }).then((resp) => {
        if (resp.status !== "OK") {
          return { status: "ERROR", msg: resp.msg || "" };
        }
        return uploadFile(
          file,
          resp.url || "",
          resp.path || "",
          resp.upload_via_server || false
        ).then((uploadResp) => {
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
    for (let i = 0; i < uploadResps.length; i++) {
      const uploadResp = uploadResps[i];
      if (uploadResp.status !== "OK") {
        numErrors += 1;
        errMsg = uploadResp.msg || "";
      } else {
        numSucceeded += 1;
      }
    }

    if (numErrors > 0) {
      setMessage(errMsg);
    } else {
      setMessage(`Uploaded ${files.length} file(s) successfully`);
    }
    setFiles([]);
    if (props.onUploadComplete) {
      props.onUploadComplete({
        numSucceeded: numSucceeded,
        numErrors: numErrors,
      });
    }
  }, [files, props]);

  return (
    <div>
      <div {...getRootProps()} className={classes.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click here to select</p>
        )}
      </div>

      {message ? message : ""}
      {files.length > 0 && (
        <Box>
          <span>{files.length} file(s) attached</span>
        </Box>
      )}
      {files.length > 0 && (
        <Button onClick={onFileSubmit} variant="contained" color="default">
          Save Files
        </Button>
      )}
    </div>
  );
}

export default FileUploadDropzone;
