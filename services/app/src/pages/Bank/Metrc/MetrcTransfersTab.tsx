import { Box, TextField } from "@material-ui/core";
import MetrcTransfersDataGridV2 from "components/Transfers/MetrcTransfersDataGridV2";
import { useGetMetrcTransfersByUsStateManifestNumberQuery } from "generated/graphql";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankMetrcTransfersTab() {
  const [usState] = useState("CA");
  const [manifestNumber, setManifestNumber] = useState("");

  const { data, error } = useGetMetrcTransfersByUsStateManifestNumberQuery({
    fetchPolicy: "network-only",
    variables: {
      us_state: usState,
      manifest_number: manifestNumber,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const metrcTransfers = data?.metrc_transfers || [];

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex">
          <TextField
            label="Manifest Number"
            value={manifestNumber}
            onChange={({ target: { value } }) => setManifestNumber(value)}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <MetrcTransfersDataGridV2 metrcTransfers={metrcTransfers} />
      </Box>
    </Container>
  );
}
