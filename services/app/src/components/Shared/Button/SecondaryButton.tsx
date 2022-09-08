import ActionButton from "components/Shared/Button/ActionButton";
import {
  DisabledSecondaryBorderColor,
  DisabledSecondaryTextColor,
  PlainWhite,
  SecondaryActiveColor,
  SecondaryBorderColor,
  SecondaryHoverColor,
  SecondaryTextColor,
} from "components/Shared/Colors/GlobalColors";

interface Props {
  isDisabled?: boolean;
  isIconVisible?: boolean;
  text: string;
  width: string;
  height: string;
  onClick: () => void;
}

export default function SecondaryButton({
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
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      color={!!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor}
      hoverBackgroundColor={!!isDisabled ? PlainWhite : SecondaryHoverColor}
      hoverBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      hoverColor={
        !!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor
      }
      activeBackgroundColor={!!isDisabled ? PlainWhite : SecondaryActiveColor}
      activeBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      activeColor={
        !!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor
      }
    />
  );
}
