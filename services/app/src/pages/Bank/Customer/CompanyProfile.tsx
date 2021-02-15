import CompanyInfo from "components/Shared/CompanyProfile/CompanyInfo";
import { useCompanyForCustomerQuery } from "generated/graphql";

interface Props {
  companyId: string;
}

function BankCustomerCompanyProfileSubpage({ companyId }: Props) {
  // We are only rendering information that a customer user would be
  // able to see, so we use the customer user query for a Company
  // (even though we are a bank user here).
  const { data } = useCompanyForCustomerQuery({
    variables: {
      companyId,
    },
  });

  const company = data?.companies_by_pk;

  return company ? <CompanyInfo company={company}></CompanyInfo> : null;
}

export default BankCustomerCompanyProfileSubpage;
