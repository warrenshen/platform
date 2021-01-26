import { Box } from "@material-ui/core";

interface Props {}

function ApprovePurchaseOrderCompletePage(props: Props) {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <Box>
            <h2>Thank you!</h2>
            <p>You may close this page.</p>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ApprovePurchaseOrderCompletePage;
