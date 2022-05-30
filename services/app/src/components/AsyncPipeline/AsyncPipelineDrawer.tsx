import {
  Box,
  Drawer,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import RawJsonToggle from "components/Shared/RawJsonToggle";
import { AsyncPipelines, useGetAsyncPipelineQuery } from "generated/graphql";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 500,
      paddingBottom: theme.spacing(16),
    },
  })
);

interface Props {
  asyncPipelineId: AsyncPipelines["id"];
  handleClose: () => void;
}

export default function AsyncPipelineDrawer({
  asyncPipelineId,
  handleClose,
}: Props) {
  const classes = useStyles();

  const { data } = useGetAsyncPipelineQuery({
    variables: {
      id: asyncPipelineId,
    },
  });

  const asyncPipeline = data?.async_pipelines_by_pk;

  if (!asyncPipeline) {
    return null;
  }

  return (
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Async Pipeline</Typography>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Name
          </Typography>
          <Typography variant="body1">{asyncPipeline.name}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Status
          </Typography>
          <Typography variant="body1">{asyncPipeline.status}</Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Internal State JSON
          </Typography>
          <RawJsonToggle rawJson={asyncPipeline.internal_state} />
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography variant="subtitle2" color="textSecondary">
            Params JSON
          </Typography>
          <RawJsonToggle rawJson={asyncPipeline.params} />
        </Box>
      </Box>
    </Drawer>
  );
}
