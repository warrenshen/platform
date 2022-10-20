import { Box } from "@material-ui/core";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CheckBoxIcon } from "icons";
import styled from "styled-components";

interface Props {
  label: string;
  isDisabled: boolean;
  isChecked: boolean;
  color?: string;
}

const LabelWrapper = styled.div`
  margin-left: 12px;
  position: relative;
  top: -2px;
`;

const LabeledCheckbox = ({ label, isDisabled, isChecked, color }: Props) => {
  return (
    <Box display="flex" flexDirection="column" mt={2}>
      <Box display="flex" flexDirection="row" mt={2}>
        <CheckBoxIcon isChecked={isChecked} isDisabled={isDisabled} />
        <LabelWrapper>
          <Text
            materialVariant={"span"}
            textVariant={TextVariants.Label}
            color={color}
          >
            {label}
          </Text>
        </LabelWrapper>
      </Box>
    </Box>
  );
};

export default LabeledCheckbox;
