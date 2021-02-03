import { Box } from "@material-ui/core";

function ReviewPurchaseOrderCompletePage() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100vw"
      height="100vh"
    >
      <Box display="flex" flexDirection="column" width="400px">
        <Box display="flex" flexDirection="column">
          <Box>
            <h2>Thank you!</h2>
            <p>
              Your decision to approve or reject the purchase order was saved
              successfully. If we need any further information from you, we will
              contact you directly. You may now close this page.
            </p>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ReviewPurchaseOrderCompletePage;
