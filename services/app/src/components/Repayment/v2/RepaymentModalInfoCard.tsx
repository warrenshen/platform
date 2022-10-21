import CardDivider from "components/Shared/Card/CardDivider";
import CardLine from "components/Shared/Card/CardLine";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { todayAsDateStringClient } from "lib/date";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const CardContainer = styled.div`
  background-color: #f6f5f3;
  border-radius: 4px;
  padding: 32px;
`;

interface Props {
  outstandingPrincipal: number;
  outstandingInterest: number;
  outstandingAccountFees: number;
}

const RepaymentModalInfoCard = ({
  outstandingPrincipal,
  outstandingInterest,
  outstandingAccountFees,
}: Props) => {
  return (
    <CardContainer>
      <Text textVariant={TextVariants.Paragraph}>
        {`As of today, ${todayAsDateStringClient()}`}
      </Text>
      <CardDivider />
      <CardLine
        labelText="Outstanding principal"
        valueText={formatCurrency(outstandingPrincipal)}
        valueTextVariant={TextVariants.SubHeader}
        valueIsBold
      />
      <CardLine
        labelText="Outstanding interest"
        valueText={formatCurrency(outstandingInterest)}
        valueTextVariant={TextVariants.SubHeader}
        valueIsBold
      />
      <CardLine
        labelText="Outstanding account fees"
        valueText={formatCurrency(outstandingAccountFees)}
        valueTextVariant={TextVariants.SubHeader}
        valueIsBold
      />
      <CardDivider />
      <CardLine
        labelText="Total amount"
        valueText={formatCurrency(
          outstandingPrincipal + outstandingInterest + outstandingAccountFees
        )}
        valueTextVariant={TextVariants.SubHeader}
        valueIsBold
      />
    </CardContainer>
  );
};

export default RepaymentModalInfoCard;
