import { Box, Tooltip as TooltipComponent } from "@material-ui/core";
import * as React from "react";

interface Props {
  text: string;
  children: React.ReactElement;
}

export default function Tooltip({ text, children }: Props) {
  return (
    <TooltipComponent title={text} arrow placement="top">
      <Box>{children}</Box>
    </TooltipComponent>
  );
}
