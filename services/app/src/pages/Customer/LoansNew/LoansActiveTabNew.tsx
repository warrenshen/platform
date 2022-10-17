import { Box } from "@material-ui/core";
import { Companies, useGetActiveLoansForCompanyQuery } from "generated/graphql";
import { ProductTypeEnum, ProductTypeToLoanType } from "lib/enum";
import styled from "styled-components";

import LoansFundedNew from "./LoansFundedNew";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
  isActiveContract: boolean;
}

function CustomerLoansPageLoansTab({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error, refetch } = useGetActiveLoansForCompanyQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
      loanType,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  return (
    <StyledContainer>
      <Box mb={3} />
      <LoansFundedNew
        companyId={companyId}
        productType={productType}
        isActiveContract={isActiveContract}
        data={data}
        handleDataChange={refetch}
      />
    </StyledContainer>
  );
}

export default CustomerLoansPageLoansTab;
