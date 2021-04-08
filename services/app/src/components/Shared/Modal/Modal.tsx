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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: "100%",
    },
  })
);

const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100vw;
  height: 100vh;
`;

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
  align-items: center;

  flex: 1;

  overflow: scroll;
`;

const Content = styled.div<{ $width: number; $padding?: number }>`
  width: ${(props) => props.$width}px;
  padding: ${(props) => props.$padding}px 0px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;

  align-self: stretch;

  padding: 24px;
  box-shadow: 0px -1px 0px rgba(44, 42, 39, 0.05);
`;

const Buttons = styled.div`
  display: flex;
`;

const StyledButton = styled(Button)`
  flex: 1;
`;

const ButtonSpace = styled.div`
  width: 12px;
`;

interface Props {
  isPrimaryActionDisabled?: boolean;
  isSecondaryActionDisabled?: boolean;
  title: string;
  contentWidth?: number;
  primaryActionText: string;
  secondaryActionText?: string;
  handleClose: () => void;
  handlePrimaryAction: () => void;
  handleSecondaryAction?: () => void;
  children: ReactNode;
}

export default function Modal({
  isPrimaryActionDisabled = false,
  isSecondaryActionDisabled = false,
  title,
  contentWidth = 500,
  primaryActionText,
  secondaryActionText,
  handleClose,
  handlePrimaryAction,
  handleSecondaryAction,
  children,
}: Props) {
  const classes = useStyles();

  return (
    <Dialog
      fullScreen
      open
      onClose={handleClose}
      classes={{ paper: classes.dialog }}
    >
      <Container>
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
          <Content $width={contentWidth} $padding={64}>
            {children}
          </Content>
        </Body>
        <Footer>
          <Content $width={contentWidth}>
            <Buttons>
              {!!secondaryActionText && handleSecondaryAction && (
                <StyledButton
                  disabled={isSecondaryActionDisabled}
                  onClick={handleSecondaryAction}
                  variant={"outlined"}
                  color={"default"}
                >
                  {secondaryActionText}
                </StyledButton>
              )}
              {!!secondaryActionText && <ButtonSpace />}
              <StyledButton
                disabled={isPrimaryActionDisabled}
                onClick={handlePrimaryAction}
                variant={"contained"}
                color={"primary"}
              >
                {primaryActionText}
              </StyledButton>
            </Buttons>
          </Content>
        </Footer>
      </Container>
    </Dialog>
  );
}