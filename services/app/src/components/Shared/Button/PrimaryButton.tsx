import ActionButton from "components/Shared/Button/ActionButton";
import {
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
  isSmallIcon?: boolean;
  isBorderHidden?: boolean;
  icon?: React.ReactNode;
  text: string;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  dataCy?: string;
  onClick: () => void;
}

export default function PrimaryButton({
  isDisabled = false,
  isSmallIcon = false,
  isBorderHidden = false,
  icon = null,
  text,
  width,
  height,
  margin,
  padding,
  dataCy,
  onClick,
}: Props) {
  return (
    <ActionButton
      isDisabled={isDisabled}
      isSmallIcon={isSmallIcon}
      isBorderHidden={isBorderHidden}
      variant={"outlined"}
      text={text}
      onClick={onClick}
      width={width}
      height={height}
      margin={margin}
      padding={padding}
      dataCy={dataCy}
      icon={icon}
      boxShadowXOffset={PrimaryBoxShadowXOffset}
      boxShadowYOffset={PrimaryBoxShadowYOffset}
      boxShadowBlurRadius={PrimaryBoxShadowBlurRadius}
      boxShadowSpreadRadius={PrimaryBoxShadowSpreadRadius}
      boxShadowColor={!!isDisabled ? PlainWhite : PrimaryBoxShadowColor}
      backgroundColor={
        !!isDisabled ? DisabledSecondaryTextColor : PrimaryDefaultColor
      }
      borderColor={
        !!isDisabled ? DisabledSecondaryTextColor : PrimaryDefaultColor
      }
      color={PlainWhite}
      hoverBackgroundColor={
        !!isDisabled ? DisabledSecondaryTextColor : PrimaryHoverColor
      }
      hoverBorderColor={
        !!isDisabled ? DisabledSecondaryTextColor : PrimaryHoverColor
      }
      hoverColor={PlainWhite}
      activeBackgroundColor={
        !!isDisabled ? DisabledSecondaryTextColor : PrimaryActiveColor
      }
      activeBorderColor={
        !!isDisabled ? DisabledSecondaryTextColor : PrimaryActiveColor
      }
      activeColor={PlainWhite}
    />
  );
}
