import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { useCompanyQuery } from "../../../generated/graphql";
import CompanyInfo from "./CompanyInfo";

export interface CustomerParams {
  companyId: string;
}

function CompanyProfile() {
  const { companyId: companyIdFromParams } = useParams<CustomerParams>();
  const { user } = useContext(CurrentUserContext);

  const companyId = companyIdFromParams ? companyIdFromParams : user.companyId;

  const { data } = useCompanyQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data?.companies_by_pk) {
    return null;
  }

  const company = data?.companies_by_pk;

  return (
    <>
      <CompanyInfo company={company}></CompanyInfo>
    </>
  );
}

export default CompanyProfile;
