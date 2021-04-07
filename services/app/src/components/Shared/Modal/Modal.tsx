import {
  Button,
  createStyles,
  Dialog,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { ReactComponent as CloseIcon } from "components/Shared/Layout/Icons/Close.svg";
import { ReactNode } from "react";
import styled from "styled-components";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  align-self: stretch;

  padding: 12px;
`;

const CloseButton = styled(Button)`
  width: 48px;
  min-width: 48px;
  height: 48px;
  border: 1px solid #c7c7c7;
  border-radius: 24px;
`;

const CloseButtonContainer = styled.div`
  width: 100px;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  padding-top: 64px;
`;

const Content = styled.div<{ $width: number }>`
  width: ${(props) => props.$width}px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;

  align-self: stretch;

  padding: 24px;
  box-shadow: 0px -1px 0px rgba(44, 42, 39, 0.05);
`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  })
);

interface Props {
  title: string;
  contentWidth?: number;
  handleClose: () => void;
  children: ReactNode;
  actions: ReactNode;
}

export default function Modal({
  title,
  contentWidth = 500,
  handleClose,
  children,
  actions,
}: Props) {
  const classes = useStyles();

  return (
    <Dialog
      fullScreen
      open
      onClose={handleClose}
      classes={{ paper: classes.dialog }}
    >
      <Header>
        <CloseButtonContainer>
          <CloseButton onClick={handleClose}>
            <CloseIcon />
          </CloseButton>
        </CloseButtonContainer>
        <Typography variant={"h5"}>{title}</Typography>
        <CloseButtonContainer />
      </Header>
      <Body>
        <Content $width={contentWidth}>{children}</Content>
      </Body>
      <Footer>
        <Content $width={contentWidth}>{actions}</Content>
      </Footer>
    </Dialog>
  );
}
