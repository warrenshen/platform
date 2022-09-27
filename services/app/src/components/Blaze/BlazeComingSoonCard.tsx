import { Box, Typography } from "@material-ui/core";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
  background-color: white;
  padding: 48px;
  border-radius: 3px;
`;

const StyledNumber = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border: 1px solid rgba(95, 90, 84, 0.2);
  border-radius: 160px;
`;

export default function BlazeComingSoonCard() {
  return (
    <Container>
      <Typography variant="h4" align="center">
        <strong>BLAZE Capital is coming soon!</strong>
      </Typography>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="body2" color="textSecondary" align="center">
          <strong>
            GROW YOUR BUSINESS WITH FINANCING... HOW DOES THIS WORK?
          </strong>
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <StyledNumber>
          <Typography variant="body2">1</Typography>
        </StyledNumber>
        <Typography variant="body1">
          Buy in bulk and improve your margins
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <StyledNumber>
          <Typography variant="body2">2</Typography>
        </StyledNumber>
        <Typography variant="body1">
          Pay COD and improve your vendor relations
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <StyledNumber>
          <Typography variant="body2">3</Typography>
        </StyledNumber>
        <Typography variant="body1">
          Finance purchases from any of your vendors
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <StyledNumber>
          <Typography variant="body2">4</Typography>
        </StyledNumber>
        <Typography variant="body1">
          Pay off loans within 60 days with no prepayment penalties
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h5" color="primary" align="center">
          Please check back in the future for information about whether you're
          eligible for financing.
        </Typography>
      </Box>
    </Container>
  );
}
