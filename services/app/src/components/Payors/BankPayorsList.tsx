import { useListBankPayorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";
import PayorPartnershipsDataGrid from "./PayorPartnershipsDataGrid";

interface Props {
  isExcelExport?: boolean;
}

export default function PayorsList({ isExcelExport = false }: Props) {
  const { data } = useListBankPayorPartnershipsQuery();

  const partnerships = data?.company_payor_partnerships || [];

  const payors = sortBy(partnerships, (item) => item.payor?.name);

  return (
    <PayorPartnershipsDataGrid
      data={payors}
      isExcelExport={isExcelExport}
      isBankAccount
    />
  );
}
