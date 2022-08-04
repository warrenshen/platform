import { Typography, useTheme } from "@material-ui/core";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Chip = styled.div<{ $backgroundColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  padding: 8px 0px;
  background-color: ${(props) => props.$backgroundColor};
  color: white;
`;

function EnvironmentChip() {
  const theme = useTheme();
  const environment = process.env.REACT_APP_BESPOKE_ENVIRONMENT;
  return environment !== "production" ? (
    <Wrapper>
      <Chip $backgroundColor={theme.palette.primary.main}>
        <Typography>
          {environment === "staging" ? "Staging" : "Development"}
        </Typography>
      </Chip>
    </Wrapper>
  ) : null;
}

export default EnvironmentChip;
