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
  width: 32px;
  height: 32px;
  margin-right: 12px;
  border: 1px solid rgba(95, 90, 84, 0.2);
  border-radius: 160px;
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
            You are pre-approved for financing with a credit limit of up to{" "}
            <strong>
              {formatCurrency(blazePreapproval.max_credit_limit / 2)}
            </strong>
            !
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
          <Box display="flex" alignItems="center" mt={4}>
            <Typography variant="h6" align="center">
              Based on repayment history, you may be eligible for a credit limit
              of up to{" "}
              <strong>
                {formatCurrency(blazePreapproval.max_credit_limit)}
              </strong>{" "}
              in the future.
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <StyledButton
              disabled={false}
              variant={"contained"}
              color={"primary"}
              onClick={() =>
                window.open(
                  "https://bespokefinancial.com/blaze-pre-approved/",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              View Offer
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
