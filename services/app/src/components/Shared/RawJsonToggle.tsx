import { Box, Button, Typography } from "@material-ui/core";
import { useState } from "react";

interface Props {
  rawJson: object;
}

export default function RawJsonToggle({ rawJson }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box display="flex" flexDirection="column">
      <Box mt={1}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Hide JSON" : "View JSON"}
        </Button>
      </Box>
      {isOpen && (
        <Typography variant="body2">
          <pre>{JSON.stringify(rawJson, null, 2)}</pre>
        </Typography>
      )}
    </Box>
  );
}
