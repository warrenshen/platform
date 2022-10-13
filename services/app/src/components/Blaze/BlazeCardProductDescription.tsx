import { Box, Typography } from "@material-ui/core";
import styled from "styled-components";

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

export default function BlazeCardProductDescription() {
  return (
    <>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="body2" color="textSecondary" align="center">
          <strong>
            GROW YOUR BUSINESS WITH FINANCING... HOW WILL THIS WORK?
          </strong>
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <StyledNumber>
          <Typography variant="body2">1</Typography>
        </StyledNumber>
        <Typography variant="body1">
          Easy access to financing with no application fees
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <StyledNumber>
          <Typography variant="body2">2</Typography>
        </StyledNumber>
        <Typography variant="body1">
          Up to 60 days of financing for your inventory purchases
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <StyledNumber>
          <Typography variant="body2">3</Typography>
        </StyledNumber>
        <Typography variant="body1">
          COD and bulk inventory purchases unlock vendor discounts
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <StyledNumber>
          <Typography variant="body2">4</Typography>
        </StyledNumber>
        <Typography variant="body1">
          No hidden fees or prepayment penalties
        </Typography>
      </Box>
    </>
  );
}
