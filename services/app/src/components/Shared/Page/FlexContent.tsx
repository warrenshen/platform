import { ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  padding: 64px 96px;
`;

interface Props {
  children: ReactNode;
}

export default function FlexContent({ children }: Props) {
  return <Container>{children}</Container>;
}
