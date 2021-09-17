import { Box } from "@material-ui/core";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankMetrcTransfersTab() {
  return (
    <Container>
      <Box display="flex" flexDirection="column"></Box>
    </Container>
  );
}
