import { useListBankPayorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";
import PayorPartnershipsDataGrid from "./PayorPartnershipsDataGrid";

export default function PayorsList() {
  const { data } = useListBankPayorPartnershipsQuery();

  const partnerships = data?.company_payor_partnerships || [];

  const payors = sortBy(partnerships, (item) => item.payor?.name);

  return <PayorPartnershipsDataGrid data={payors} isBankAccount />;
}
