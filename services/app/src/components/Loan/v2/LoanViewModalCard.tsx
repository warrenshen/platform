import { Box } from "@material-ui/core";
import CardContainer from "components/Shared/Card/CardContainer";
import CardLine from "components/Shared/Card/CardLine";
import LoanStatusChip from "components/Shared/Chip/LoanStatusChip";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { LoanFragment, LoanTypeEnum } from "generated/graphql";
import { LoanStatusEnum, LoanTypeToLabel } from "lib/enum";
import { createLoanCustomerIdentifier } from "lib/loans";
import { formatCurrency } from "lib/number";

interface Props {
  loan: LoanFragment;
}

export default function LoanViewModalCard({ loan }: Props) {
  const loanStatus = !!loan?.status ? loan.status : null;
  const isLoan = !!loan?.funded_at;
  const customer_identifier = createLoanCustomerIdentifier(loan);

  const loanType = !!loan.loan_type ? loan.loan_type : "";
  const customerName = !!loan?.company?.name ? loan.company.name : "";
  const requestedPaymentDate = !!loan.requested_payment_date
    ? loan.requested_payment_date
    : "";
  const originationDate = !!loan.origination_date ? loan.origination_date : "";
  const maturityDate = !!loan.maturity_date ? loan.maturity_date : "";
  const outstandingPrincipalBalance = !!loan.outstanding_principal_balance
    ? loan.outstanding_principal_balance
    : 0;
  const outstandingInterest = !!loan.outstanding_interest
    ? loan.outstanding_interest
    : 0;
  const outstandingLateFees = !!loan.outstanding_fees
    ? loan.outstanding_fees
    : 0;
  const customerUserName = !!loan?.requested_by_user?.full_name
    ? loan.requested_by_user.full_name
    : "";

  return (
    <CardContainer>
      <Text
        materialVariant="h3"
        isBold
        textVariant={TextVariants.SubHeader}
        bottomMargin={22}
      >
        {`${customer_identifier}`}
      </Text>
      <>
        {!!loanStatus && (
          <Box mb={"22px"}>
            <LoanStatusChip loanStatus={loanStatus as LoanStatusEnum} />
          </Box>
        )}
      </>
      <CardLine
        labelText={"Loan type"}
        valueText={LoanTypeToLabel[loanType as LoanTypeEnum]}
      />
      <CardLine labelText={"Customer name"} valueText={customerName} />
      <CardLine
        labelText={"Requested payment date"}
        valueText={requestedPaymentDate}
      />
      <>
        {!!isLoan && (
          <CardLine
            labelText={"Origination date"}
            valueText={originationDate}
          />
        )}
        {!!isLoan && (
          <CardLine labelText={"Maturity date"} valueText={maturityDate} />
        )}
        {!!isLoan && (
          <CardLine
            labelText={"Outstanding principal balance"}
            valueText={formatCurrency(outstandingPrincipalBalance)}
          />
        )}
        {!!isLoan && (
          <CardLine
            labelText={"Outstanding interest"}
            valueText={formatCurrency(outstandingInterest)}
          />
        )}
        {!!isLoan && (
          <CardLine
            labelText={"Outstanding late fee"}
            valueText={formatCurrency(outstandingLateFees)}
          />
        )}
        {!isLoan && (
          <CardLine
            labelText={"Requested by user"}
            valueText={customerUserName}
          />
        )}
      </>
    </CardContainer>
  );
}
