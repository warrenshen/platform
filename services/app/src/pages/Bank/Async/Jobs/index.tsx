import { Box, createStyles, makeStyles, Theme } from "@material-ui/core";
import { useGetAsyncPipelinesQuery } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import AsyncPipelinesDataGrid from "pages/Bank/Async/Jobs/AsyncPipelinesDataGrid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: 200,
    },
  })
);

export default function AsyncPipelinesPage() {
  const classes = useStyles();
  const snackbar = useSnackbar();

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
