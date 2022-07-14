import { Box, Button, Typography } from "@material-ui/core";
import { BlazePreapprovalFragment } from "generated/graphql";
import { formatCurrency } from "lib/number";
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
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border: 1px solid rgba(95, 90, 84, 0.2);
  border-radius: 20px;
`;

const StyledButton = styled(Button)`
  flex: 1;
  padding: 8px 0px;
`;

interface Props {
  blazePreapproval: BlazePreapprovalFragment | null;
}

export default function BlazePreapprovalCard({ blazePreapproval }: Props) {
  return (
    <Container>
      {!!blazePreapproval ? (
        <>
          <Typography variant="h4" align="center">
            You are preapproved for up to{" "}
            <strong>{formatCurrency(blazePreapproval.max_credit_limit)}</strong>{" "}
            to grow your business!
          </Typography>
          <Box display="flex" flexDirection="column" mt={4}>
            <Typography variant="body2" color="textSecondary" align="center">
              <strong>HOW DOES THIS WORK?</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mt={4}>
            <StyledNumber>1</StyledNumber>
            <Typography variant="body1">
              Finance your wholesale purchases
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mt={2}>
            <StyledNumber>2</StyledNumber>
            <Typography variant="body1">
              Improve margins and vendor relations
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mt={2}>
            <StyledNumber>3</StyledNumber>
            <Typography variant="body1">
              Pay off loans in 60 days to avoid late fees
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <StyledButton
              disabled={false}
              variant={"contained"}
              color={"primary"}
              onClick={() =>
                window.open(
                  "https://bespokefinancial.com/retail-financing/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Apply Now
            </StyledButton>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h5" align="center">
            You are not eligible for financing options at this time.
          </Typography>
          <Box display="flex" flexDirection="column" mt={4}>
            <Typography variant="body1" color="primary" align="center">
              <strong>
                This is a beta program, please check back in the future for
                changes in eligibility.
              </strong>
            </Typography>
          </Box>
        </>
      )}
    </Container>
  );
}
