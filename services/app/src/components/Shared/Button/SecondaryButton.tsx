import ActionButton from "components/Shared/Button/ActionButton";
import {
  DisabledSecondaryBorderColor,
  DisabledSecondaryTextColor,
  SecondaryActiveColor,
  SecondaryBorderColor,
  SecondaryHoverColor,
  SecondaryTextColor,
  Transparent,
} from "components/Shared/Colors/GlobalColors";

interface Props {
  isDisabled?: boolean;
  isIconVisible?: boolean;
  text: string;
  width?: string;
  height?: string;
  margin?: string;
  onClick: () => void;
}

export default function SecondaryButton({
  isDisabled = false,
  isIconVisible = false,
  text,
  width,
  height,
  margin,
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
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      color={!!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor}
      hoverBackgroundColor={!!isDisabled ? Transparent : SecondaryHoverColor}
      hoverBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      hoverColor={
        !!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor
      }
      activeBackgroundColor={!!isDisabled ? Transparent : SecondaryActiveColor}
      activeBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      activeColor={
        !!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor
      }
    />
  );
}
