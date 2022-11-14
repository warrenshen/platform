import { Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import styled from "styled-components";

import Text, { TextVariants } from "../Text/Text";

const StyledAlert = styled(Alert)`
  justify-content: center;
  align-items: center;
  height: 72px;
`;

interface Props {
  children: string | JSX.Element | JSX.Element[] | undefined;
  severity: "error" | "warning" | "info" | "success";
}

const FullWidthAlert = ({ children, severity }: Props) => {
  return (
    <Box
      mt={2}
      overflow="auto"
      width="100vw"
      position="absolute"
      bottom={84}
      left="50%"
      right="50%"
      ml="-50vw"
      mr="-50vw"
      justifyContent="center"
      alignItems="center"
    >
      <StyledAlert severity={severity}>
        <Text textVariant={TextVariants.Label}>{children}</Text>
      </StyledAlert>
    </Box>
  );
};

export default FullWidthAlert;
