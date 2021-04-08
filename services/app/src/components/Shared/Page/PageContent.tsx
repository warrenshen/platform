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

const Copy = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;
`;

const Title = styled.span`
  font-size: 24px;
  font-weight: 400;
`;

const Subtitle = styled.span`
  font-size: 16px;
  font-weight: 400;
  margin-top: 12px;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: row-reverse;

  flex: 1;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  padding-bottom: 128px;
`;

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

function PageContent({ title, subtitle, actions = null, children }: Props) {
  return (
    <Container>
      <Header>
        <Copy>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </Copy>
        <Actions>{actions}</Actions>
      </Header>
      <Content>{children}</Content>
    </Container>
  );
}

export default PageContent;
