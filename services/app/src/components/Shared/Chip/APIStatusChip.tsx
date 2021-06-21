import { Tooltip, Typography } from "@material-ui/core";
import styled from "styled-components";

const Chip = styled.div<{ backgroundColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 1;

  width: 150px;
  padding: 6px 0px;
  border-radius: 18px;
  background-color: ${(props) => props.backgroundColor};
  color: white;
`;

const Text = styled(Typography)`
  font-size: 14px;
  font-weight: 500;
`;

interface Props {
  statusCode: number;
}

const StatusToColor: any = {
  "200": "#3498db", // Blue,
  "-1": "#BEBEBE", // Grey, UNKNOWN
  "401": "#f1c40f", // Yellow, Unauthorized
  "403": "#f1c40f", // Yellow, Forbidden
  "404": "#f1c40f", // Yellow, Not Found
  "400": "#dc143c", // Red, Bad Request
  "429": "#dc143c", // Red, Too Many Requests
  "500": "#dc143c", // Red, Internal Server Error
};

export default function APIStatusChip({ statusCode }: Props) {
  if (!statusCode) {
    statusCode = -1;
  }

  return (
    <Tooltip arrow interactive title={statusCode}>
      <Chip backgroundColor={StatusToColor[statusCode.toString()]}>
        <Text>
          {statusCode === 200
            ? "Success"
            : statusCode === -1
            ? "Unknown"
            : "Failure"}
        </Text>
      </Chip>
    </Tooltip>
  );
}
