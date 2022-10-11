import { Card, CardContent } from "@material-ui/core";
import styled from "styled-components";

const StyledCard = styled(Card)<{}>`
  width: 100%;
  box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 16px;
`;

const StyledCardContent = styled(CardContent)<{}>`
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-left: 0px;
  padding-top: 32px;
  padding-right: 32px;
  padding-bottom: 32px;
  padding-left: 32px;
`;

interface Props {
  children?: JSX.Element | JSX.Element[] | string;
  width?: string;
}

export default function CardContainer({ children }: Props) {
  return (
    <StyledCard>
      <StyledCardContent>{children}</StyledCardContent>
    </StyledCard>
  );
}
