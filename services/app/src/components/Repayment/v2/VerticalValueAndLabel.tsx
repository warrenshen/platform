import { Box } from "@material-ui/core";
import Text, { TextVariants } from "components/Shared/Text/Text";

interface Props {
  value: string;
  label: string;
  valueTextVariant?: TextVariants;
}

const VerticalValueAndLabel = ({
  value,
  label,
  valueTextVariant = TextVariants.SubHeader,
}: Props) => {
  return (
    <Box display="flex" flexDirection="column">
      <Text textVariant={valueTextVariant} bottomMargin={4}>
        {value}
      </Text>
      <Text textVariant={TextVariants.Label} bottomMargin={24}>
        {label}
      </Text>
    </Box>
  );
};

export default VerticalValueAndLabel;
