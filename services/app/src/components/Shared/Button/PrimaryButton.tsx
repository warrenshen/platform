import ActionButton from "components/Shared/Button/ActionButton";
import {
  DisabledSecondaryBorderColor,
  DisabledSecondaryTextColor,
  PlainWhite,
  PrimaryActiveColor,
  PrimaryBoxShadowBlurRadius,
  PrimaryBoxShadowColor,
  PrimaryBoxShadowSpreadRadius,
  PrimaryBoxShadowXOffset,
  PrimaryBoxShadowYOffset,
  PrimaryDefaultColor,
  PrimaryHoverColor,
} from "components/Shared/Colors/GlobalColors";

interface Props {
  isDisabled?: boolean;
  isIconVisible?: boolean;
  text: string;
  width: string;
  height: string;
  onClick: () => void;
}

export default function PrimaryButton({
  isDisabled = false,
  isIconVisible = false,
  text,
  width,
  height,
  onClick,
}: Props) {
  return (
    <ActionButton
      isDisabled={isDisabled}
      variant={"outlined"}
      text={text}
      onClick={onClick}
      width={width}
      height={height}
      boxShadowXOffset={PrimaryBoxShadowXOffset}
      boxShadowYOffset={PrimaryBoxShadowYOffset}
      boxShadowBlurRadius={PrimaryBoxShadowBlurRadius}
      boxShadowSpreadRadius={PrimaryBoxShadowSpreadRadius}
      boxShadowColor={!!isDisabled ? PlainWhite : PrimaryBoxShadowColor}
      backgroundColor={!!isDisabled ? PlainWhite : PrimaryDefaultColor}
      borderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : PrimaryDefaultColor
      }
      color={!!isDisabled ? DisabledSecondaryTextColor : PlainWhite}
      hoverBackgroundColor={!!isDisabled ? PlainWhite : PrimaryHoverColor}
      hoverBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : PrimaryHoverColor
      }
      hoverColor={!!isDisabled ? DisabledSecondaryTextColor : PlainWhite}
      activeBackgroundColor={!!isDisabled ? PlainWhite : PrimaryActiveColor}
      activeBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : PrimaryActiveColor
      }
      activeColor={!!isDisabled ? DisabledSecondaryTextColor : PlainWhite}
    />
  );
}
