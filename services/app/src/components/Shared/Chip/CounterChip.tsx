import { Typography } from "@material-ui/core";
import styled from "styled-components";

const Chip = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 24px;
  min-width: 24px;
  padding: 0px 6p;
  margin-left: 8px;
  margin-bottom: 2px;

  color: white;
  background-color: ${(props: { background?: string }) =>
    props.background || "rgba(203, 166, 121, 0.75)"};
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 1px;
`;

interface Props {
  chipCount: string;
  chipColor?: string;
}

const CounterChip = ({ chipCount, chipColor }: Props) => (
  <Chip background={chipColor}>
    <Typography variant="body2">{chipCount}</Typography>
  </Chip>
);

export default CounterChip;
