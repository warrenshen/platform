import { Box } from "@material-ui/core";
import VerticalValueAndLabel from "components/Repayment/v2/VerticalValueAndLabel";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { ArrowRightIcon } from "icons";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface Props {
  payableAmountPrincipal: number;
  payableAmountInterest: number;
  payableAmountAccountFee: number;
  principalAmountCovered: number;
  interestAmountCovered: number;
  accountFeeAmountCovered: number;
}

const BeforeAfterRepaymentDetails = ({
  payableAmountPrincipal,
  payableAmountInterest,
  payableAmountAccountFee,
  principalAmountCovered,
  interestAmountCovered,
  accountFeeAmountCovered,
}: Props) => {
  return (
    <Container>
      <Box mt={8} />
      <ColumnContainer>
        <Text textVariant={TextVariants.ParagraphLead}>Before Repayment</Text>
        <VerticalValueAndLabel
          value={formatCurrency(payableAmountPrincipal)}
          label="Principal amount"
        />
        <VerticalValueAndLabel
          value={formatCurrency(payableAmountInterest)}
          label="Interest amount"
        />
        <VerticalValueAndLabel
          value={formatCurrency(payableAmountAccountFee)}
          label="Account fees amount"
        />
      </ColumnContainer>
      <ColumnContainer>
        <Box mt={7} />
        <ArrowRightIcon />
        <Box mt={7} />
        <ArrowRightIcon />
        <Box mt={7} />
        <ArrowRightIcon />
      </ColumnContainer>
      <ColumnContainer>
        <Text textVariant={TextVariants.ParagraphLead}>After Repayment</Text>
        <VerticalValueAndLabel
          value={formatCurrency(
            payableAmountPrincipal - principalAmountCovered
          )}
          label="Principal amount"
        />
        <VerticalValueAndLabel
          value={formatCurrency(payableAmountInterest - interestAmountCovered)}
          label="Interest amount"
        />
        <VerticalValueAndLabel
          value={formatCurrency(
            payableAmountAccountFee - accountFeeAmountCovered
          )}
          label="Account fees amount"
        />
      </ColumnContainer>
    </Container>
  );
};

export default BeforeAfterRepaymentDetails;
