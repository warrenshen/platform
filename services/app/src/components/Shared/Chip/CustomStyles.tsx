import { Typography } from "@material-ui/core";
import styled from "styled-components";

export const Chip = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  width: fit-content;
  height: 30px;
  padding: 6px 8px;
  border-radius: 4px;
  background-color: #f6f5f3;
  color: #2c2a27;
`;

export const Text = styled(Typography)`
  font-size: 14px;
  font-weight: 500;
  line-height: 133.3%;
`;

export const Dot = styled.div<{ $dotColor: string }>`
  width: 10px;
  height: 10px;
  background-color: ${(props) => props.$dotColor};
  border-radius: 24px;
  margin: 0 11px 0 0;
`;
