import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Image,
  DotGroup,
} from "pure-react-carousel";
import { Box, Typography } from "@material-ui/core";
import { Files } from "generated/graphql";
import "pure-react-carousel/dist/react-carousel.es.css";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileWithSignedURL, downloadFilesWithSignedUrls } from "lib/api/files";
import styled from "styled-components";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/scripts/pdf.worker.js`;

const Container = styled.div`
  background-color: rgb(246, 245, 243);
`;

const PDFDocumentWrapper = styled.div`
  canvas {
    width: 100% !important;
    height: auto !important;
  }
`;

interface Props {
  fileIds: Files["id"][];
  fileType: string;
}

export default function FilesViewer({ fileIds, fileType }: Props) {
  const [filesWithSignedUrls, setFilesWithSignedUrls] = useState<
    FileWithSignedURL[]
  >([]);

  useEffect(() => {
    const getFilesWithSignedUrls = async () => {
      if (fileIds.length > 0) {
        const response = await downloadFilesWithSignedUrls({
          file_ids: fileIds,
          file_type: fileType,
        });
        if (response.status !== "OK") {
          console.log({ response });
          alert(response.msg);
        } else {
          setFilesWithSignedUrls(response.files);
        }
      }
    };
    getFilesWithSignedUrls();
  }, [fileIds, fileType, setFilesWithSignedUrls]);

  return (
    <Container>
      <CarouselProvider
        dragEnabled={false}
        naturalSlideWidth={64}
        naturalSlideHeight={72}
        totalSlides={filesWithSignedUrls.length}
      >
        <ButtonBack>Previous File</ButtonBack>
        <ButtonNext>Next File</ButtonNext>
        <DotGroup />
        {filesWithSignedUrls.length > 0 && (
          <Slider>
            {filesWithSignedUrls.map((fileWithSignedUrl, index) => (
              <Slide key={fileWithSignedUrl.id} index={index}>
                <Box display="flex" justifyContent="center" mb={1}>
                  <Typography>{fileWithSignedUrl.name}</Typography>
                </Box>
                {fileWithSignedUrl.path.indexOf("pdf") < 0 ? (
                  <Image
                    hasMasterSpinner={false}
                    src={fileWithSignedUrl.url}
                    style={{ height: "auto" }}
                  />
                ) : (
                  <PDFDocumentWrapper>
                    <Document
                      file={fileWithSignedUrl.url}
                      onLoadError={(error) => console.error({ error })}
                      onLoadSuccess={() => console.log("success")}
                    >
                      <Page pageNumber={1} />
                    </Document>
                  </PDFDocumentWrapper>
                )}
              </Slide>
            ))}
          </Slider>
        )}
      </CarouselProvider>
    </Container>
  );
}
