import { Box } from "@material-ui/core";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CalendarIcon } from "icons";
import { formatDateString } from "lib/date";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 16px 0px;
  background-color: #fcf6ea;
  border-radius: 4px;
`;

interface Props {
  dateString: string | null;
}

const ExpectedDatePreview = ({ dateString }: Props) => {
  const date = (dateString && formatDateString(dateString)) || "TBD";

  return (
    <Container>
      <CalendarIcon />
      <Box mt={2}>
        <Text
          textVariant={TextVariants.Label}
          isBold={true}
          color={SecondaryTextColor}
        >
          {date}
        </Text>
      </Box>
    </Container>
  );
};

export default ExpectedDatePreview;
