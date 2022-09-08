import { Button } from "@material-ui/core";
import styled from "styled-components";

const StyledActionButton = styled(Button)<{
  $width: string;
  $height: string;
  $borderColor: string;
  $backgroundColor: string;
  $color: string;
  $hoverBorderColor: string;
  $hoverBackgroundColor: string;
  $hoverColor: string;
  $activeBorderColor: string;
  $activeBackgroundColor: string;
  $activeColor: string;
  $boxShadow: string;
}>`
  background-color: ${(props) => props.$backgroundColor};
  border: ${(props) => props.$borderColor} 2px solid;
  border-radius: 8px;
  color: ${(props) => props.$color};

  font-weight: 500;
  font-size: 16px;

  margin: 0 5px;
  padding: 14px 24px;

  width: ${(props) => props.$width};
  height: ${(props) => props.$height};

  box-shadow: ${(props) => props.$boxShadow};

  :hover {
    background-color: ${(props) => props.$hoverBackgroundColor};
    color: ${(props) => props.$hoverColor};
    border: ${(props) => props.$hoverBorderColor} 2px solid;
  }

  :active {
    background-color: ${(props) => props.$activeBackgroundColor};
    color: ${(props) => props.$activeColor};
    border: ${(props) => props.$activeBorderColor} 2px solid;
  }
`;

interface Props {
  text: string;
  isDisabled?: boolean;
  variant?: any;
  onClick: () => void;
  width: string;
  height: string;

  // base colors
  backgroundColor: string;
  borderColor: string;
  color: string;

  // hover colors
  hoverBackgroundColor: string;
  hoverBorderColor: string;
  hoverColor: string;

  // active colors
  activeBackgroundColor: string;
  activeBorderColor: string;
  activeColor: string;

  // box shadow
  boxShadowXOffset?: string | null;
  boxShadowYOffset?: string | null;
  boxShadowBlurRadius?: string | null;
  boxShadowSpreadRadius?: string | null;
  boxShadowColor?: string | null;
}

export default function ActionButton({
  text,
  isDisabled = false,
  variant = "contained",
  onClick,
  width,
  height,
  backgroundColor,
  borderColor,
  color,
  hoverBackgroundColor,
  hoverBorderColor,
  hoverColor,
  activeBackgroundColor,
  activeBorderColor,
  activeColor,
  boxShadowXOffset = null,
  boxShadowYOffset = null,
  boxShadowBlurRadius = null,
  boxShadowSpreadRadius = null,
  boxShadowColor = null,
}: Props) {
  /*
		It might seem odd that we're defining the box-shadow value here instead of directly in the styled component
		However, pulling it directly from props was causing it to misbehave and broke the hover behavior.
		Unfortunately, css tends to silently fail in its native implementation, but since this workaround fully
		addresses this issue we stopped investigating the root cause.
	*/
  const boxShadow =
    !!boxShadowXOffset &&
    !!boxShadowYOffset &&
    !!boxShadowBlurRadius &&
    !!boxShadowSpreadRadius &&
    !!boxShadowColor
      ? `${boxShadowXOffset} ${boxShadowYOffset} ${boxShadowBlurRadius} ${boxShadowSpreadRadius} ${boxShadowColor}`
      : "none";

  return (
    <StyledActionButton
      className={"action-button"}
      disabled={isDisabled}
      variant={variant}
      onClick={onClick}
      $backgroundColor={backgroundColor}
      $borderColor={borderColor}
      $color={color}
      $hoverBackgroundColor={hoverBackgroundColor}
      $hoverBorderColor={hoverBorderColor}
      $hoverColor={hoverColor}
      $activeBackgroundColor={activeBackgroundColor}
      $activeBorderColor={activeBorderColor}
      $activeColor={activeColor}
      $boxShadow={boxShadow}
      $width={width}
      $height={height}
    >
      {text}
    </StyledActionButton>
  );
}
