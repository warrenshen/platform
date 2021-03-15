import { Box } from "@material-ui/core";
import AddPayorButton from "components/Payors/AddPayorButton";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import { useBankCustomerListPayorPartnershipsQuery } from "generated/graphql";
import { sortBy } from "lodash";

interface Props {
  companyId: string;
}

export default function BankCustomerPayors({ companyId }: Props) {
  const { data } = useBankCustomerListPayorPartnershipsQuery({
    variables: {
      companyId,
    },
  });

  if (!data || !data.company_payor_partnerships) {
    return null;
  }

  const vendorPartnerships = sortBy(
    data.company_payor_partnerships,
    (item) => item.payor?.name
  );

  return (
    <Box>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        flexDirection="row-reverse"
      >
        <AddPayorButton />
      </Box>
      <Box display="flex" flexWrap="wrap">
        <PayorPartnershipsDataGrid
          isDrilldownByCustomer
          data={vendorPartnerships}
          isBankAccount
        />
      </Box>
    </Box>
  );
}
