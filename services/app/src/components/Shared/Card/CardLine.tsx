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
  valueAlignment?: string;
  isValueObfuscated?: boolean;
}

export default function CardLine({
  labelText,
  valueText,
  valueAlignment = "right",
  isValueObfuscated = false,
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
      justifyContent="space-between"
      width={"100%"}
      mb={"16px"}
    >
      <Box width={"40%"}>
        <Text
          textVariant={TextVariants.Label}
          color={DisabledSecondaryTextColor}
          bottomMargin={0}
        >
          {labelText}
        </Text>
      </Box>
      <Box width={"60%"}>
        <Text
          textVariant={TextVariants.Label}
          color={TextColor}
          alignment={valueAlignment}
          bottomMargin={0}
        >
          <>
            {displayValue}
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
          </>
        </Text>
      </Box>
    </Box>
  );
}
