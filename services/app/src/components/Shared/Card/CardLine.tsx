import { Box } from "@material-ui/core";
import {
  DisabledSecondaryTextColor,
  TextColor,
} from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";

interface Props {
  labelText: string;
  valueText: string;
}

export default function CardLine({ labelText, valueText }: Props) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      width={"100%"}
      mb={"16px"}
    >
      <Text
        textVariant={TextVariants.Label}
        color={DisabledSecondaryTextColor}
        bottomMargin={0}
      >
        {labelText}
      </Text>
      <Box maxWidth={"80%"}>
        <Text
          textVariant={TextVariants.Label}
          color={TextColor}
          alignment={"right"}
          bottomMargin={0}
        >
          {valueText}
        </Text>
      </Box>
    </Box>
  );
}
