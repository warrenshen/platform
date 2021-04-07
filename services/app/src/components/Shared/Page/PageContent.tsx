import { ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  padding: 64px 96px;
  overflow: scroll;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  margin-bottom: 24px;
`;

const Title = styled.span`
  font-size: 24px;
  font-weight: 400;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: row-reverse;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  padding-bottom: 128px;
`;

interface Props {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

function PageContent({ title, actions = null, children }: Props) {
  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        {actions && <Actions>{actions}</Actions>}
      </Header>
      <Content>{children}</Content>
    </Container>
  );
}

export default PageContent;
