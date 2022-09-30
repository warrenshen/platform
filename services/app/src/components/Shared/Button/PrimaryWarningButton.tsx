import ActionButton from "components/Shared/Button/ActionButton";
import {
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
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  dataCy?: string;
  onClick: () => void;
}

export default function PrimaryWarningButton({
  isDisabled = false,
  isIconVisible = false,
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
      dataCy={dataCy}
      isDisabled={isDisabled}
      variant={"outlined"}
      text={text}
      onClick={onClick}
      width={width}
      height={height}
      backgroundColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningDefaultColor
      }
      borderColor={
        !!isDisabled ? DisabledSecondaryTextColor : WarningDefaultColor
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
