import { IconButton } from "@material-ui/core";
import styled from "styled-components";

const IconButtonContainer = styled.div<{ variant: "outlined" | "filled" }>`
  width: 50px;
  height: 50px;
  border-radius: 8px;

  ${(props) =>
    props.variant === "filled"
      ? `
  background-color: #769362;
    border: 2px solid #769362;
  
  `
      : `border: 2px solid #605F5C;
  `}
`;

interface Props {
  children: React.ReactNode;
  handleClick: any;
  variant: "outlined" | "filled";
}

export default function FloatingIconActionButton({
  children,
  handleClick,
  variant,
}: Props) {
  return (
    <IconButtonContainer variant={variant}>
      <IconButton onClick={handleClick}>{children}</IconButton>
    </IconButtonContainer>
  );
}
