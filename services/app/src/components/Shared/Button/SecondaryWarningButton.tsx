import ActionButton from "components/Shared/Button/ActionButton";
import {
  DisabledSecondaryBorderColor,
  DisabledSecondaryTextColor,
  PlainWhite,
  WarningDefaultColor,
  WarningSecondaryActiveColor,
  WarningSecondaryHoverColor,
} from "components/Shared/Colors/GlobalColors";

interface Props {
  isDisabled?: boolean;
  isIconVisible?: boolean;
  text: string;
  width: string;
  height: string;
  onClick: () => void;
}

export default function SecondaryWarningButton({
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
      backgroundColor={PlainWhite}
      borderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : WarningDefaultColor
      }
      color={!!isDisabled ? DisabledSecondaryTextColor : WarningDefaultColor}
      hoverBackgroundColor={
        !!isDisabled ? PlainWhite : WarningSecondaryHoverColor
      }
      hoverBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : WarningDefaultColor
      }
      hoverColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningDefaultColor
      }
      activeBackgroundColor={
        !!isDisabled ? PlainWhite : WarningSecondaryActiveColor
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
