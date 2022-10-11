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

export default function SecondaryWarningButton({
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
      height={height}
      margin={margin}
      padding={padding}
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
