import { Typography } from "@material-ui/core";
import {
  PrimaryActiveColor,
  PrimaryDefaultColor,
  PrimaryHoverColor,
  TextColor,
} from "components/Shared/Colors/GlobalColors";
import { Maybe } from "generated/graphql";
import styled from "styled-components";

export enum TextVariants {
  Header = "header",
  SubHeader = "sub_header",
  ParagraphLead = "paragraph_lead",
  Paragraph = "paragraph",
  Label = "label",
  SmallLabel = "small_label",
}

const VariantBottomMarginDefault = {
  [TextVariants.Header]: "32",
  [TextVariants.SubHeader]: "32",
  [TextVariants.ParagraphLead]: "24",
  [TextVariants.Paragraph]: "24",
  [TextVariants.Label]: "8",
  [TextVariants.SmallLabel]: "8",
};

const VariantLineHeightDefault = {
  [TextVariants.Header]: "137%",
  [TextVariants.SubHeader]: "27px",
  [TextVariants.ParagraphLead]: "145%",
  [TextVariants.Paragraph]: "145%",
  [TextVariants.Label]: "133%",
  [TextVariants.SmallLabel]: "133%",
};

const VariantFontWeightDefault = {
  [TextVariants.Header]: "400",
  [TextVariants.SubHeader]: "400",
  [TextVariants.ParagraphLead]: "500",
  [TextVariants.Paragraph]: "500",
  [TextVariants.Label]: "500",
  [TextVariants.SmallLabel]: "500",
};

const VariantSemiBoldFontWeightDefault = {
  [TextVariants.Header]: "400",
  [TextVariants.SubHeader]: "600",
  [TextVariants.ParagraphLead]: "500",
  [TextVariants.Paragraph]: "500",
  [TextVariants.Label]: "700",
  [TextVariants.SmallLabel]: "500",
};

const VariantFontSizeDefault = {
  [TextVariants.Header]: "32",
  [TextVariants.SubHeader]: "24",
  [TextVariants.ParagraphLead]: "18",
  [TextVariants.Paragraph]: "16",
  [TextVariants.Label]: "14",
  [TextVariants.SmallLabel]: "12",
};

const StyledText = styled(Typography)<{
  $textVariant: TextVariants;
  $color: string;
  $bottomMargin: Maybe<number>;
  $isBold: Maybe<boolean>;
  $isClickable: Maybe<boolean>;
}>`
  color: ${(props) =>
    props.$isClickable ? PrimaryDefaultColor : props.$color};
  font-style: normal;
  font-weight: ${(props) =>
    props.$isBold
      ? VariantSemiBoldFontWeightDefault[props.$textVariant]
      : VariantFontWeightDefault[props.$textVariant]};
  font-size: ${(props) => VariantFontSizeDefault[props.$textVariant]}px;
  line-height: ${(props) => VariantLineHeightDefault[props.$textVariant]}px;
  margin: 0 0 0 0;
  margin-bottom: ${(props) =>
    !!props.$bottomMargin || props.$bottomMargin === 0
      ? props.$bottomMargin
      : VariantBottomMarginDefault[props.$textVariant]}px;

  :hover {
    cursor: ${(props) => (props.$isClickable ? "pointer" : "default")};
    color: ${(props) =>
      props.$isClickable ? PrimaryHoverColor : props.$color};
  }

  :active {
    cursor: ${(props) => (props.$isClickable ? "pointer" : "default")};
    color: ${(props) =>
      props.$isClickable ? PrimaryActiveColor : props.$color};
  }
`;

interface Props {
  textVariant: TextVariants;
  materialVariant?: any;
  isBold?: Maybe<boolean>;
  color?: string;
  bottomMargin?: Maybe<number>;
  children?: JSX.Element | JSX.Element[] | string;
  handleClick?: () => void;
}

export default function Text({
  textVariant,
  materialVariant = "h5",
  isBold = false,
  color = TextColor,
  bottomMargin = null,
  children,
  handleClick,
}: Props) {
  return (
    <StyledText
      variant={materialVariant}
      onClick={handleClick}
      $color={color}
      $isBold={isBold}
      $bottomMargin={bottomMargin}
      $textVariant={textVariant}
      $isClickable={!!handleClick}
    >
      {children}
    </StyledText>
  );
}
