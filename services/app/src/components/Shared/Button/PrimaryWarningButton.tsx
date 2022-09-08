import ActionButton from "components/Shared/Button/ActionButton";
import {
  DisabledSecondaryBorderColor,
  DisabledSecondaryTextColor,
  PlainWhite,
  WarningActiveColor,
  WarningDefaultColor,
  WarningHoverColor,
} from "components/Shared/Colors/GlobalColors";

interface Props {
  isDisabled?: boolean;
  isIconVisible?: boolean;
  text: string;
  width: string;
  height: string;
  onClick: () => void;
}

export default function PrimaryWarningButton({
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
      backgroundColor={!!isDisabled ? PlainWhite : WarningDefaultColor}
      borderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : WarningDefaultColor
      }
      color={PlainWhite}
      hoverBackgroundColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningHoverColor
      }
      hoverBorderColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningHoverColor
      }
      hoverColor={PlainWhite}
      activeBackgroundColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningActiveColor
      }
      activeBorderColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningActiveColor
      }
      activeColor={PlainWhite}
    />
  );
}
