import Text, { TextVariants } from "components/Shared/Text/Text";
import styled from "styled-components";

const IconWrapper = styled.span`
  display: inline-block;
  margin-left: -4px;
  margin-right: 8px;
  position: relative;
  top: 2px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StyledActionButton = styled.button<{
  $width: string;
  $height: string;
  $margin: string;
  $padding: string;
  $borderColor: string;
  $backgroundColor: string;
  $isBorderHidden: boolean;
  $isSmallIcon: boolean;
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
  border: ${(props) =>
    props.$isBorderHidden ? "none" : `${props.$borderColor} 2px solid`};
  border-radius: 8px;
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 500;
  font-size: 16px;

  margin: ${(props) => props.$margin};
  padding: ${(props) => props.$padding};
  text-align: center;

  width: ${(props) => props.$width};
  height: ${(props) => props.$height};

  box-shadow: ${(props) => props.$boxShadow};

  span {
    color: ${(props) => props.$color};
  }

  :disabled {
    background-color: ${(props) => props.$backgroundColor};
    border: ${(props) =>
      props.$isBorderHidden ? "none" : `${props.$borderColor} 2px solid`};
    color: ${(props) => props.$color};
  }

  :hover {
    background-color: ${(props) => props.$hoverBackgroundColor};
    color: ${(props) => props.$hoverColor};
    cursor: pointer;
    border: ${(props) =>
      props.$isBorderHidden ? "none" : `${props.$borderColor} 2px solid`};

    h5 {
      cursor: pointer;
    }
  }

  :active {
    background-color: ${(props) => props.$activeBackgroundColor};
    color: ${(props) => props.$activeColor};
    border: ${(props) =>
      props.$isBorderHidden ? "none" : `${props.$borderColor} 2px solid`};
  }

  ${(props) =>
    props.$isSmallIcon &&
    `
    .MuiButton-startIcon {
      margin-left: 0;
      margin-right: 0;
    }
  `}

  &.MuiButton-root {
    min-width: 0;
  }
`;

interface Props {
  text: string;
  isDisabled?: boolean;
  isSmallIcon?: boolean;
  isBorderHidden?: boolean;
  variant?: any;
  onClick: () => void;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  dataCy?: string;
  icon?: React.ReactNode;

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
  isSmallIcon = false,
  isBorderHidden = false,
  variant = "contained",
  onClick,
  width = "auto",
  height = "40px",
  margin = "0 0 0 16px",
  padding = "11px 24px",
  backgroundColor,
  borderColor,
  color,
  dataCy,
  icon,
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
      data-cy={dataCy}
      disabled={isDisabled}
      onClick={onClick}
      $backgroundColor={backgroundColor}
      $borderColor={borderColor}
      $isBorderHidden={isBorderHidden}
      $isSmallIcon={isSmallIcon}
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
      $margin={margin}
      $padding={padding}
    >
      <>
        {!!icon && <IconWrapper>{icon}</IconWrapper>}
        {text.length > 0 && (
          <Text
            alignment={"center"}
            bottomMargin={0}
            color={color}
            textVariant={TextVariants.Label}
            width={"100%"}
          >
            {text}
          </Text>
        )}
      </>
    </StyledActionButton>
  );
}
