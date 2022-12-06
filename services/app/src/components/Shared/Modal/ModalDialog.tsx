import { Dialog, DialogTitle } from "@material-ui/core";
import { SecondaryHoverColor } from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { isMobile } from "react-device-detect";
import styled from "styled-components";

interface Props {
  title: string;
  width?: string;
  maxWidth?: false | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
  handleClose: () => void;
  children?: JSX.Element | JSX.Element[];
}

const StyledModalDialog = styled(Dialog)<{ $width: string }>`
  .MuiDialog-root {
    margin: ${() => (isMobile ? "0" : "0 auto")};
  }
  .MuiPaper-root.MuiDialog-paper.MuiDialog-paperScrollPaper {
    width: ${({ $width }) => (isMobile ? "100%" : $width)};
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  border-bottom: ${SecondaryHoverColor} 1px solid;
  margin-bottom: ${() => (isMobile ? "16px" : "32px")};
`;

export default function ModalDialog({
  title,
  width = "600px",
  maxWidth = "sm",
  handleClose,
  children,
}: Props) {
  return (
    <StyledModalDialog
      open
      onClose={handleClose}
      maxWidth={maxWidth}
      $width={width}
    >
      <StyledDialogTitle>
        <Text
          textVariant={
            isMobile ? TextVariants.ParagraphLead : TextVariants.Header
          }
          bottomMargin={0}
        >
          {title}
        </Text>
      </StyledDialogTitle>
      {children}
    </StyledModalDialog>
  );
}
