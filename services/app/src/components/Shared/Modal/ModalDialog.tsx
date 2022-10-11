import { Dialog, DialogTitle } from "@material-ui/core";
import { SecondaryHoverColor } from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { isMobile } from "react-device-detect";
import styled from "styled-components";

interface Props {
  title: string;
  handleClose: () => void;
  children?: JSX.Element | JSX.Element[];
}

const StyledModalDialog = styled(Dialog)`
  width: ${() => (isMobile ? "100%" : "600px")};
  margin: ${() => (isMobile ? "0" : "0 auto")};
`;

const StyledDialogTitle = styled(DialogTitle)`
  border-bottom: ${SecondaryHoverColor} 1px solid;
  margin-bottom: ${() => (isMobile ? "16px" : "32px")};
`;

export default function ModalDialog({ title, handleClose, children }: Props) {
  return (
    <StyledModalDialog open onClose={handleClose}>
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
