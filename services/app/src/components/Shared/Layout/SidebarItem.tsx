import { Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div<{ isNested: boolean }>`
  width: 100%;
  padding-left: ${(props) => (props.isNested ? "16px" : "0px")};
  margin-top: 8px;
`;

const Container = styled(Link)<{ isSelected: boolean }>`
  display: flex;
  align-items: center;

  height: 40px;
  padding: 0px 16px;
  margin: 0px 12px;
  color: ${(props) =>
    props.isSelected ? "rgba(203, 166, 121, 1.0)" : "rgba(44, 42, 39, 0.8)"};
  background-color: ${(props) =>
    props.isSelected ? "rgba(203, 166, 121, 0.15)" : "none"};
  border-radius: 6px;
  text-decoration: none;

  &:hover {
    background-color: ${(props) =>
      props.isSelected ? "rgba(203, 166, 121, 0.15)" : "#fafafa"};
    cursor: pointer;
  }
`;

const IconWrapper = styled.div`
  padding-top: 4px;
  margin-right: 8px;
`;

const PrimaryText = styled.span<{ isNested: boolean }>`
  font-size: 16px;
  font-weight: ${(props) => (props.isNested ? "300" : "500")};
`;

const Chip = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: red;
  color: white;
  height: 24px;
  min-width: 24px;
  padding: 0px 6p;
  margin-left: 8px;
  margin-bottom: 2px;
  border-radius: 12px;
  font-weight: 600;
  letterspacing: 1px;
`;

interface Props {
  isNested?: boolean;
  isSelected: boolean;
  chipCount?: number | null;
  IconNode: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | null;
  label: string;
  to: string;
}

function SidebarItem({
  isNested = false,
  isSelected,
  chipCount,
  IconNode,
  label,
  to,
}: Props) {
  return (
    <Wrapper isNested={isNested}>
      <Container isSelected={isSelected} to={to}>
        {IconNode && (
          <IconWrapper>
            <IconNode
              fill={isSelected ? "rgba(203, 166, 121, 1.0)" : "#2c3e50"}
              stroke={isSelected ? "rgba(203, 166, 121, 1.0)" : "#2c3e50"}
            />
          </IconWrapper>
        )}
        <PrimaryText isNested={isNested}>{label}</PrimaryText>
        {!!chipCount && (
          <Chip>
            <Typography>{chipCount}</Typography>
          </Chip>
        )}
      </Container>
    </Wrapper>
  );
}

export default SidebarItem;
