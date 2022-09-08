import { Dialog, DialogTitle } from "@material-ui/core";
import { SecondaryHoverColor } from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import styled from "styled-components";

interface Props {
  title: string;
  handleClose: () => void;
  children?: JSX.Element | JSX.Element[];
}

const StyledModalDialog = styled(Dialog)`
  width: 500px;
  margin: 0 auto;
`;

const StyledDialogTitle = styled(DialogTitle)`
  border-bottom: ${SecondaryHoverColor} 1px solid;
  margin-bottom: 32px;
`;

export default function ModalDialog({ title, handleClose, children }: Props) {
  return (
    <StyledModalDialog open onClose={handleClose}>
      <StyledDialogTitle>
        <Text textVariant={TextVariants.Header} bottomMargin={0}>
          {title}
        </Text>
      </StyledDialogTitle>
      {children}
    </StyledModalDialog>
  );
}
