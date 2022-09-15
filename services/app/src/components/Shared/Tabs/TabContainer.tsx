import { Box } from "@material-ui/core";
import styled from "styled-components";

const Container = styled(Box)<{}>`
  width: 600px;
  margin: 0 auto;
  padding: 25px 0;
`;

interface Props {
  children?: JSX.Element | JSX.Element[] | string;
}

export default function TabContainer({ children }: Props) {
  return <Container>{children}</Container>;
}
