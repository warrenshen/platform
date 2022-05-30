import { Box } from "@material-ui/core";
import AsyncPipelineDrawer from "components/AsyncPipeline/AsyncPipelineDrawer";
import AsyncPipelinesDataGrid from "components/AsyncPipeline/AsyncPipelinesDataGrid";
import { AsyncPipelines, useGetAsyncPipelinesQuery } from "generated/graphql";
import { useState } from "react";
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

  const [selectedAsyncPipelineId, setSelectedAsyncPipelineId] =
    useState<AsyncPipelines["id"]>(null);

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="column">
          {!!selectedAsyncPipelineId && (
            <AsyncPipelineDrawer
              asyncPipelineId={selectedAsyncPipelineId}
              handleClose={() => setSelectedAsyncPipelineId(null)}
            />
          )}
          <AsyncPipelinesDataGrid
            asyncPipelines={data?.async_pipelines || []}
            handleClickAsyncPipeline={(asyncPipelineId) =>
              setSelectedAsyncPipelineId(asyncPipelineId)
            }
          />
        </Box>
      </Box>
    </Container>
  );
}
