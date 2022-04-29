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
import { FileWithSignedURL, downloadFilesWithSignedUrls } from "lib/api/files";
import styled from "styled-components";
import PdfViewer from "components/Shared/File/PdfViewer";

const Container = styled.div`
  background-color: rgb(246, 245, 243);
`;

interface Props {
  fileIds: Files["id"][];
  fileType: string;
}

export default function FileViewer({ fileIds, fileType }: Props) {
  const [filesWithSignedUrls, setFilesWithSignedUrls] = useState<
    FileWithSignedURL[]
  >([]);

  useEffect(() => {
    downloadFilesWithSignedUrls(
      fileType,
      fileIds,
      false,
      (files) => setFilesWithSignedUrls(files),
      (response) => alert(response.msg)
    );
  }, [fileIds, fileType, setFilesWithSignedUrls]);

  return (
    <Container>
      <CarouselProvider
        dragEnabled={false}
        naturalSlideWidth={64}
        naturalSlideHeight={96}
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
                  <PdfViewer fileUrl={fileWithSignedUrl.url} />
                )}
              </Slide>
            ))}
          </Slider>
        )}
      </CarouselProvider>
    </Container>
  );
}
