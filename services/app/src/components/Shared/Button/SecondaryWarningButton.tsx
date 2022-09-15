import ActionButton from "components/Shared/Button/ActionButton";
import {
  DisabledSecondaryBorderColor,
  DisabledSecondaryTextColor,
  Transparent,
  WarningDefaultColor,
  WarningSecondaryActiveColor,
  WarningSecondaryHoverColor,
} from "components/Shared/Colors/GlobalColors";

interface Props {
  isDisabled?: boolean;
  isIconVisible?: boolean;
  text: string;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  onClick: () => void;
}

export default function SecondaryWarningButton({
  isDisabled = false,
  isIconVisible = false,
  text,
  width,
  height,
  margin,
  padding,
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
      backgroundColor={Transparent}
      borderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : WarningDefaultColor
      }
      color={!!isDisabled ? DisabledSecondaryTextColor : WarningDefaultColor}
      hoverBackgroundColor={
        !!isDisabled ? Transparent : WarningSecondaryHoverColor
      }
      hoverBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : WarningDefaultColor
      }
      hoverColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningDefaultColor
      }
      activeBackgroundColor={
        !!isDisabled ? Transparent : WarningSecondaryActiveColor
      }
      activeBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : WarningDefaultColor
      }
      activeColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningDefaultColor
      }
    />
  );
}
