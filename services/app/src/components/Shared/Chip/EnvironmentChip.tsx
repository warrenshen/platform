import { Typography } from "@material-ui/core";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Chip = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  padding: 8px 0px;
  background-color: #3498db;
  color: white;
`;

function EnvironmentChip() {
  switch (process.env.REACT_APP_BESPOKE_ENVIRONMENT) {
    case "production":
      return null;
    case "staging":
      return (
        <Wrapper>
          <Chip>
            <Typography>STAGING</Typography>
          </Chip>
        </Wrapper>
      );
    case "development":
    default:
      return (
        <Wrapper>
          <Chip>
            <Typography>LOCAL</Typography>
          </Chip>
        </Wrapper>
      );
  }
}

export default EnvironmentChip;
