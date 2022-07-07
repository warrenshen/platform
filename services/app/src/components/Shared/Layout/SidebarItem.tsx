import CounterChip from "components/Shared/Chip/CounterChip";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div<{ isNested: boolean }>`
  width: 100%;
  padding-left: ${(props) => (props.isNested ? "16px" : "0px")};
  margin-top: 8px;
`;

const Container = styled(Link)<{ $isSelected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  height: 40px;
  padding: 0px 16px;
  margin: 0px 12px;
  color: ${(props) =>
    props.$isSelected ? "rgba(203, 166, 121, 1.0)" : "rgba(44, 42, 39, 0.8)"};
  background-color: ${(props) =>
    props.$isSelected ? "rgba(203, 166, 121, 0.15)" : "none"};
  border-radius: 6px;
  text-decoration: none;

  &:hover {
    background-color: ${(props) =>
      props.$isSelected ? "rgba(203, 166, 121, 0.15)" : "#fafafa"};
    cursor: pointer;
  }
`;

const PrimaryContent = styled.div`
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div`
  padding-top: 4px;
  margin-right: 8px;
`;

const PrimaryText = styled.span<{ isNested: boolean }>`
  font-size: 16px;
  font-weight: ${(props) => (props.isNested ? "300" : "500")};
`;

interface Props {
  dataCy: string;
  isNested?: boolean;
  isSelected: boolean;
  chipCount?: number | null;
  chipColor?: string;
  IconNode: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | null;
  label: string;
  to: string;
}

export default function SidebarItem({
  dataCy,
  isNested = false,
  isSelected,
  chipCount,
  chipColor,
  IconNode,
  label,
  to,
}: Props) {
  return (
    <Wrapper isNested={isNested} data-cy={`sidebar-item-${dataCy}`}>
      <Container $isSelected={isSelected} to={to}>
        <PrimaryContent>
          {IconNode && (
            <IconWrapper>
              <IconNode
                fill={isSelected ? "rgba(203, 166, 121, 1.0)" : "#2c3e50"}
                stroke={isSelected ? "rgba(203, 166, 121, 1.0)" : "#2c3e50"}
              />
            </IconWrapper>
          )}
          <PrimaryText isNested={isNested}>{label}</PrimaryText>
        </PrimaryContent>
        {!!chipCount && (
          <CounterChip
            chipColor={chipColor}
            chipCount={chipCount > 5 ? "5+" : chipCount.toString()}
          />
        )}
      </Container>
    </Wrapper>
  );
}
