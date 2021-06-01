import { Box, Button, Typography } from "@material-ui/core";
import { Document, Page, pdfjs } from "react-pdf";
import styled from "styled-components";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/scripts/pdf.worker.js`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  canvas {
    width: 100% !important;
    height: auto !important;
  }
`;

const StyledButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 32px;
  min-width: initial;
  height: 32px;
  padding: 8px 0px;
`;

interface Props {
  fileUrl: string;
}

export default function PdfViewer({ fileUrl }: Props) {
  const [pagesCount, setPagesCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(0);

  return (
    <Wrapper>
      <Box display="flex" alignItems="center" mb={2}>
        <StyledButton
          disabled={pageNumber - 1 < 1}
          variant="outlined"
          size="small"
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          {"<"}
        </StyledButton>
        <Box mx={2}>
          <Typography variant="body2">
            Page {pageNumber} of {pagesCount}
          </Typography>
        </Box>
        <StyledButton
          disabled={pageNumber + 1 > pagesCount}
          variant="outlined"
          size="small"
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          {">"}
        </StyledButton>
      </Box>
      <Document
        file={fileUrl}
        onLoadError={(error) => console.error({ error })}
        onLoadSuccess={({ numPages }) => {
          setPagesCount(numPages);
          setPageNumber(1);
        }}
      >
        <Page pageNumber={pageNumber} />
      </Document>
    </Wrapper>
  );
}
