import {
  Button,
  Dialog,
  Theme,
  Typography,
  createStyles,
  makeStyles,
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

  align-self: stretch;

  padding: 24px;
`;

const CloseButtonContainer = styled.div`
  width: 100px;
`;

const CloseButton = styled(Button)`
  width: 48px;
  min-width: 48px !important;
  height: 48px;
  border: 1px solid #c7c7c7 !important;
  border-radius: 24px !important;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SubtitleText = styled.span`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
  color: gray;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  flex: 1;

  overflow-y: scroll;
`;

const Content = styled.div<{
  $width: number;
  $paddingTop?: number;
  $paddingBottom?: number;
}>`
  width: ${(props) => props.$width}px;
  padding-top: ${(props) => props.$paddingTop || 0}px;
  padding-bottom: ${(props) => props.$paddingBottom || 0}px;
  justify-content: center;
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

  padding: 8px 0px;
`;

const ButtonSpace = styled.div`
  width: 12px;
`;

interface Props {
  dataCy?: string;
  isPrimaryActionDisabled?: boolean;
  isSecondaryActionDisabled?: boolean;
  title: string;
  subtitle?: string;
  contentWidth?: number;
  primaryActionText?: string;
  secondaryActionText?: string | null; // null = do not show secondary button.
  handleClose: () => void;
  handlePrimaryAction?: () => void;
  handleSecondaryAction?: (() => void) | null;
  children: ReactNode;
}

export default function Modal({
  dataCy,
  isPrimaryActionDisabled = false,
  isSecondaryActionDisabled = false,
  title,
  subtitle,
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
      <Container data-cy={dataCy}>
        <Header>
          <CloseButtonContainer>
            <CloseButton onClick={handleClose}>
              <CloseIcon />
            </CloseButton>
          </CloseButtonContainer>
          <HeaderContent>
            <Typography variant={"h5"}>{title}</Typography>
            {!!subtitle && <SubtitleText>{subtitle}</SubtitleText>}
          </HeaderContent>
          <CloseButtonContainer />
        </Header>
        <Body>
          <Content $width={contentWidth} $paddingTop={64} $paddingBottom={128}>
            {children}
          </Content>
        </Body>
        {!!primaryActionText && !!handlePrimaryAction && (
          <Footer>
            <Content $width={contentWidth}>
              <Buttons>
                {!!secondaryActionText && handleSecondaryAction && (
                  <>
                    <StyledButton
                      data-cy={
                        !!dataCy ? `${dataCy}-secondary-button` : undefined
                      }
                      disabled={isSecondaryActionDisabled}
                      onClick={handleSecondaryAction}
                      variant={"outlined"}
                      color={"default"}
                    >
                      {secondaryActionText}
                    </StyledButton>
                    <ButtonSpace />
                  </>
                )}
                <StyledButton
                  data-cy={!!dataCy ? `${dataCy}-primary-button` : undefined}
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
        )}
      </Container>
    </Dialog>
  );
}
