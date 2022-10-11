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

export default function PrimaryWarningButton({
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
      dataCy={dataCy}
      isDisabled={isDisabled}
      isSmallIcon={isSmallIcon}
      isBorderHidden={isBorderHidden}
      variant={"outlined"}
      text={text}
      onClick={onClick}
      width={width}
      margin={margin}
      height={height}
      padding={padding}
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
