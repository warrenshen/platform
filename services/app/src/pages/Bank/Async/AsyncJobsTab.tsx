import { Box } from "@material-ui/core";
import { useGetAsyncPipelinesQuery } from "generated/graphql";
import AsyncPipelinesDataGrid from "pages/Bank/Async/AsyncPipelinesDataGrid";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function AsyncJobsTab() {
  const { data, error } = useGetAsyncPipelinesQuery();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          <h3>Async Pipelines</h3>
          <AsyncPipelinesDataGrid
            asyncPipelines={data?.async_pipelines || []}
          />
        </Box>
      </Box>
    </Container>
  );
}
