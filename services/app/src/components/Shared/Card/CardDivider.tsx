import { SecondaryHoverColor } from "components/Shared/Colors/GlobalColors";
import styled from "styled-components";

const Divider = styled.hr<{ $marginBottom: string }>`
  width: 100%;
  display: block;
  height: 1px;
  border: 0;
  border-top: 1px solid ${SecondaryHoverColor};
  margin: 10px 0 21px 0;
  margin-bottom: ${({ $marginBottom }) => $marginBottom};
`;

interface Props {
  marginBottom?: string;
}

export default function CardDivider({ marginBottom = "21px" }: Props) {
  return <Divider $marginBottom={marginBottom} />;
}
