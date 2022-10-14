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
  [TextVariants.ParagraphLead]: "16",
  [TextVariants.Paragraph]: "16",
  [TextVariants.Label]: "8",
  [TextVariants.SmallLabel]: "8",
};

const VariantLineHeightDefault = {
  [TextVariants.Header]: "50px",
  [TextVariants.SubHeader]: "34px",
  [TextVariants.ParagraphLead]: "26px",
  [TextVariants.Paragraph]: "22px",
  [TextVariants.Label]: "19px",
  [TextVariants.SmallLabel]: "16px",
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

const StyledText = styled.span<{
  $textVariant: TextVariants;
  $color: string;
  $textAlignment: string;
  $bottomMargin: Maybe<number>;
  $lineHeight: Maybe<string>;
  $width: string;
  $isBold: Maybe<boolean>;
  $isDatagridCheckboxSelected: Maybe<boolean>;
  $isClickable: Maybe<boolean>;
}>`
  h1,
  h3,
  h5,
  p {
    color: ${(props) =>
      props.$isClickable ? PrimaryDefaultColor : props.$color};
    font-style: normal;
    font-weight: ${(props) =>
      props.$isBold
        ? VariantSemiBoldFontWeightDefault[props.$textVariant]
        : VariantFontWeightDefault[props.$textVariant]};
    font-size: ${(props) => VariantFontSizeDefault[props.$textVariant]}px;
    line-height: ${(props) =>
      !!props.$lineHeight
        ? props.$lineHeight
        : VariantLineHeightDefault[props.$textVariant]};
    margin: 0 0 0 0;
    margin-top: ${(props) => (!!props.$isDatagridCheckboxSelected ? 16 : 0)}px;
    margin-bottom: ${(props) =>
      !!props.$bottomMargin || props.$bottomMargin === 0
        ? props.$bottomMargin
        : VariantBottomMarginDefault[props.$textVariant]}px;
    text-align: ${(props) => props.$textAlignment};
    width: ${(props) => props.$width};

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
  }
`;

interface Props {
  textVariant: TextVariants;
  materialVariant?: any;
  dataCy?: string;
  isBold?: Maybe<boolean>;
  isDatagridCheckboxSelected?: Maybe<boolean>;
  color?: string;
  alignment?: string;
  bottomMargin?: Maybe<number>;
  lineHeight?: Maybe<string>;
  width?: string;
  children?: JSX.Element | JSX.Element[] | string;
  handleClick?: () => void;
}

export default function Text({
  textVariant,
  materialVariant = "h5",
  dataCy = "",
  isBold = false,
  isDatagridCheckboxSelected = false,
  color = TextColor,
  alignment = "left",
  bottomMargin = null,
  lineHeight = null,
  width = "auto",
  children,
  handleClick,
}: Props) {
  return (
    <StyledText
      data-cy={dataCy}
      onClick={handleClick}
      $color={color}
      $isBold={isBold}
      $isDatagridCheckboxSelected={isDatagridCheckboxSelected}
      $textAlignment={alignment}
      $bottomMargin={bottomMargin}
      $lineHeight={lineHeight}
      $width={width}
      $textVariant={textVariant}
      $isClickable={!!handleClick}
    >
      {materialVariant === "h1" && <h1>{children}</h1>}
      {materialVariant === "h3" && <h3>{children}</h3>}
      {materialVariant === "h5" && <h5>{children}</h5>}
      {materialVariant === "p" && <p>{children}</p>}
    </StyledText>
  );
}
