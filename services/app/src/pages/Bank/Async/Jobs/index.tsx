import { Box } from "@material-ui/core";
import { useGetAsyncPipelinesQuery } from "generated/graphql";
import AsyncPipelinesDataGrid from "pages/Bank/Async/Jobs/AsyncPipelinesDataGrid";

export default function AsyncPipelinesPage() {
  const { data, error } = useGetAsyncPipelinesQuery();

  if (error) {
    console.error({ error });
    alert(`Error querying async pipelines: ${error.message}`);
  }

  return (
    <Box display="flex" flexDirection="column">
      <h3>Async Pipelines</h3>
      <AsyncPipelinesDataGrid
        asyncPipelines={data?.async_pipelines || []}
      ></AsyncPipelinesDataGrid>
      <Box mb={2}></Box>
    </Box>
  );
}
