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

export default function SecondaryButton({
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
      icon={icon}
      backgroundColor={Transparent}
      borderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      color={!!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor}
      hoverBackgroundColor={
        !!isSmallIcon
          ? "none"
          : !!isDisabled
          ? Transparent
          : SecondaryHoverColor
      }
      hoverBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      hoverColor={
        !!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor
      }
      activeBackgroundColor={
        !!isSmallIcon
          ? "none"
          : !!isDisabled
          ? Transparent
          : SecondaryActiveColor
      }
      activeBorderColor={
        !!isDisabled ? DisabledSecondaryBorderColor : SecondaryBorderColor
      }
      activeColor={
        !!isDisabled ? DisabledSecondaryTextColor : SecondaryTextColor
      }
    />
  );
}
