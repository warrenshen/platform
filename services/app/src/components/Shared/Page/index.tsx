import Layout from "components/Shared/Layout";
import { ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  padding: 64px 96px;
  overflow: scroll;
`;

const Title = styled.span`
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 400;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  padding-bottom: 128px;
`;

interface Props {
  appBarTitle: string;
  children: ReactNode;
}

function Page({ appBarTitle, children }: Props) {
  return (
    <Layout appBarTitle={appBarTitle}>
      <Container>
        <Title>{appBarTitle}</Title>
        <Content>{children}</Content>
      </Container>
    </Layout>
  );
}

export default Page;
