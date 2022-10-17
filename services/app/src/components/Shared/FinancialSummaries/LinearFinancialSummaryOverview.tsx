import { Box, Divider } from "@material-ui/core";
import LinearProgressBar from "components/Shared/ProgressBar/LinearProgressBar";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { FinancialSummaryFragment } from "generated/graphql";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 24px;
  box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 32px;
`;

const StyledDivider = styled(Divider)`
  height: 50px;
`;

const FinancialSummariesOverview = ({
  adjusted_total_limit,
  available_limit,
}: FinancialSummaryFragment) => {
  return (
    <Container>
      <Box display="flex" overflow="scroll">
        <Box mr={8}>
          <Text textVariant={TextVariants.SubHeader} isBold bottomMargin={4}>
            {formatCurrency(available_limit)}
          </Text>
          <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
            Left to borrow
          </Text>
        </Box>
        <StyledDivider orientation="vertical" />
        <Box ml={8} mr={8}>
          <Text textVariant={TextVariants.SubHeader} isBold bottomMargin={4}>
            {formatCurrency(adjusted_total_limit)}
          </Text>
          <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
            Borrowing limit
          </Text>
        </Box>
        <Box mb={2}>
          <Text textVariant={TextVariants.SubHeader} isBold bottomMargin={4}>
            {formatCurrency(adjusted_total_limit - available_limit)}
          </Text>
          <Text textVariant={TextVariants.Paragraph} isBold bottomMargin={0}>
            Borrowed
          </Text>
        </Box>
      </Box>
      <LinearProgressBar
        value={
          ((adjusted_total_limit - available_limit) / adjusted_total_limit) *
          100
        }
      />
    </Container>
  );
};

export default FinancialSummariesOverview;
