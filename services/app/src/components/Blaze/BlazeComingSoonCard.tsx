import { Box, Typography } from "@material-ui/core";
import BlazeCardProductDescription from "components/Blaze/BlazeCardProductDescription";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  background-color: white;
  padding: 48px;
  border-radius: 3px;
`;

export default function BlazeComingSoonCard() {
  return (
    <Container>
      <Typography variant="h4" align="center">
        <strong>BLAZE Capital is coming soon!</strong>
      </Typography>
      <BlazeCardProductDescription />
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h5" color="primary" align="center">
          Please check back in the future for information about whether you're
          eligible for financing.
        </Typography>
      </Box>
    </Container>
  );
}
