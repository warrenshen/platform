import { Box } from "@material-ui/core";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import {
  DisabledSecondaryTextColor,
  TextColor,
} from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { EyeClosedIcon, EyeOpenIcon } from "icons";
import { obfuscateBankNumbers } from "lib/privacy";
import { useState } from "react";

interface Props {
  labelText: string;
  valueText: string;
  valueTextVariant?: TextVariants;
  valueIsBold?: boolean;
  labelWidth?: string;
  valueAlignment?: string;
  isValueObfuscated?: boolean;
  dataCy?: string;
}

export default function CardLine({
  labelText,
  valueText,
  valueTextVariant = TextVariants.Label,
  valueIsBold = false,
  labelWidth,
  valueAlignment = "right",
  isValueObfuscated = false,
  dataCy = "",
}: Props) {
  const [currentlyObfuscated, setCurrentlyObfuscated] =
    useState<boolean>(isValueObfuscated);

  const displayValue =
    isValueObfuscated && currentlyObfuscated
      ? obfuscateBankNumbers(valueText)
      : valueText;

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent={labelWidth ? "flex-start" : "space-between"}
      width={"100%"}
      mb={"16px"}
    >
      <Box width={"40%"}>
        <Text
          dataCy={dataCy}
          materialVariant={"p"}
          textVariant={TextVariants.Label}
          color={DisabledSecondaryTextColor}
          bottomMargin={0}
          width={labelWidth}
        >
          {labelText}
        </Text>
      </Box>
      <Box
        width={"60%"}
        display="flex"
        flexDirection="row"
        justifyContent={valueAlignment === "right" ? "flex-end" : "flex-start"}
      >
        <Text
          dataCy={dataCy}
          materialVariant={"p"}
          textVariant={valueTextVariant}
          isBold={valueIsBold}
          color={TextColor}
          alignment={valueAlignment}
          bottomMargin={0}
        >
          {displayValue}
        </Text>
        {isValueObfuscated && currentlyObfuscated && (
          <SecondaryButton
            isBorderHidden
            isSmallIcon
            width={"24px"}
            height={"24px"}
            text={""}
            icon={<EyeClosedIcon />}
            padding={"0"}
            onClick={() => setCurrentlyObfuscated(false)}
          />
        )}
        {isValueObfuscated && !currentlyObfuscated && (
          <SecondaryButton
            isBorderHidden
            isSmallIcon
            width={"24px"}
            height={"24px"}
            text={""}
            icon={<EyeOpenIcon />}
            padding={"0"}
            onClick={() => setCurrentlyObfuscated(true)}
          />
        )}
      </Box>
    </Box>
  );
}
