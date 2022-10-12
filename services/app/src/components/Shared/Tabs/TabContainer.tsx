import { Box } from "@material-ui/core";
import styled from "styled-components";

const Container = styled(Box)<{ $width: number }>`
  width: ${(props) => props.$width}px;
  margin: 0 auto;
  padding: 25px 0;
`;

interface Props {
  children?: JSX.Element | JSX.Element[] | string;
  width?: number;
}

export default function TabContainer({ children, width = 600 }: Props) {
  return <Container $width={width}>{children}</Container>;
}
