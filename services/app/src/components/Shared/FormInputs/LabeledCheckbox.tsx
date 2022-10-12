import { Box } from "@material-ui/core";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CheckBoxIcon } from "icons";

interface Props {
  label: string;
  isDisabled: boolean;
  isChecked: boolean;
  color?: string;
}

const LabeledCheckbox = ({ label, isDisabled, isChecked, color }: Props) => {
  return (
    <Box display="flex" flexDirection="column" mt={2}>
      <Box display="flex" flexDirection="row" mt={2}>
        <CheckBoxIcon isChecked={isChecked} isDisabled={isDisabled} />
        <Box ml={"12px"}>
          <Text
            materialVariant={"body2"}
            textVariant={TextVariants.Label}
            color={color}
          >
            {label}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default LabeledCheckbox;
