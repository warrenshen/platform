import { Box } from "@material-ui/core";
import PolymorphicLoansDataGrid from "components/Loans/PolymorphicLoansDataGrid";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useGetClosedLoansForCompanyQuery } from "generated/graphql";
import { Action, check } from "lib/auth/rbac-rules";
import {
  PlatformModeEnum,
  ProductTypeEnum,
  ProductTypeToLoanType,
} from "lib/enum";
import { useContext } from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface Props {
  companyId: string;
  productType: ProductTypeEnum;
}

function CustomerLoansPageLoansClosedTab({ companyId, productType }: Props) {
  const {
    user: { role, platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const loanType =
    !!productType && productType in ProductTypeToLoanType
      ? ProductTypeToLoanType[productType]
      : null;

  const { data, error } = useGetClosedLoansForCompanyQuery({
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

  const company = data?.companies_by_pk;
  const loans = company?.loans || [];

  return (
    <StyledContainer>
      <Box mb={3} />
      <Text textVariant={TextVariants.ParagraphLead}>Active</Text>
      <Box display="flex" flex={1} flexDirection="column">
        <PolymorphicLoansDataGrid
          isDisbursementIdentifierVisible={isBankUser}
          // We do not show loan outstanding principal, interest, late fees for Line of Credit.
          isMaturityVisible={productType !== ProductTypeEnum.LineOfCredit}
          isMultiSelectEnabled={false}
          isViewNotesEnabled={check(role, Action.ViewLoanInternalNote)}
          productType={productType}
          loans={loans}
        />
      </Box>
    </StyledContainer>
  );
}

export default CustomerLoansPageLoansClosedTab;
