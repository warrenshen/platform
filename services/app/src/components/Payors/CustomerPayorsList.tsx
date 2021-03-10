import { CurrentUserContext } from "contexts/CurrentUserContext";
import { useListPayorPartnershipsByCompanyIdQuery } from "generated/graphql";
import { sortBy } from "lodash";
import { useContext } from "react";
import PayorPartnershipsDataGrid from "./PayorPartnershipsDataGrid";

export default function PayorsList() {
  const {
    user: { companyId },
  } = useContext(CurrentUserContext);

  const { data } = useListPayorPartnershipsByCompanyIdQuery({
    variables: { companyId },
  });

  const partnerships = data?.company_payor_partnerships || [];

  const payors = sortBy(partnerships, (item) => item.payor_limited?.name);

  return <PayorPartnershipsDataGrid data={payors} />;
}
