import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { UserRolesEnum } from "generated/graphql";
import { ReactNode, useContext } from "react";
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
  bankActions?: ReactNode;
  customerActions?: ReactNode;
  children: ReactNode;
}

function PageContent({
  title,
  subtitle,
  bankActions = null,
  customerActions = null,
  children,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = role === UserRolesEnum.BankAdmin;

  return (
    <Container>
      {isBankUser && !!bankActions && (
        <Box mb={4}>
          <Alert severity="info">
            <Box display="flex" flexDirection="column">
              <Box mb={1}>
                <Typography variant="h6">Bank admin actions</Typography>
              </Box>
              <Actions>{bankActions}</Actions>
            </Box>
          </Alert>
        </Box>
      )}
      <Header>
        <Copy>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </Copy>
        <Actions>{customerActions}</Actions>
      </Header>
      <Content>{children}</Content>
    </Container>
  );
}

export default PageContent;
