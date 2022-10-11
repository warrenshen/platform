import { ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;

  width: 100vw;
  height: 100vh;

  padding: 10px;
`;

interface Props {
  children: ReactNode;
}

export default function FlexContent({ children }: Props) {
  return <Container>{children}</Container>;
}
