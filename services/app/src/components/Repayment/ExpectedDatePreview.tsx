import { ReactComponent as CalendarIcon } from "components/Shared/Layout/Icons/Calendar.svg";
import { formatDateString } from "lib/date";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 8px 0px;
  border: 1px solid rgba(95, 90, 84, 0.1);
  border-radius: 3px;
`;

const DateText = styled.span`
  margin-left: 4px;
  font-size: 16px;
  font-weight: 500;
`;

interface Props {
  dateString: string | null;
}

export default function ExpectedDatePreview({ dateString }: Props) {
  return (
    <Container>
      <CalendarIcon />
      <DateText>{dateString ? formatDateString(dateString) : "TBD"}</DateText>
    </Container>
  );
}
