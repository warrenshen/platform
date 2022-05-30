import { Box, TextField } from "@material-ui/core";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import PageContent from "components/Shared/Page/PageContent";
import {
  Companies,
  useGetPayorPartnershipsByPayorIdQuery,
} from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { filter, sortBy } from "lodash";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
}

export default function BankCustomerPayorPartnershipsSubpage({
  companyId,
}: Props) {
  const { data } = useGetPayorPartnershipsByPayorIdQuery({
    fetchPolicy: "network-only",
    variables: {
      payor_id: companyId,
    },
  });

  const [searchQuery, setSearchQuery] = useState("");

  const payorPartnerships = useMemo(() => {
    const filteredPayorPartnerships = filter(
      data?.company_payor_partnerships || [],
      (payorPartnership) =>
        getCompanyDisplayName(payorPartnership.payor)
          .toLowerCase()
          .indexOf(searchQuery.toLowerCase()) >= 0
    );
    return sortBy(filteredPayorPartnerships, (payorPartnership) =>
      getCompanyDisplayName(payorPartnership.payor)
    );
  }, [searchQuery, data?.company_payor_partnerships]);

  return (
    <PageContent title={"Payor Partnerships"}>
      <Box
        display="flex"
        style={{ marginBottom: "1rem" }}
        justifyContent="space-between"
      >
        <Box display="flex">
          <TextField
            autoFocus
            label="Search"
            value={searchQuery}
            onChange={({ target: { value } }) => setSearchQuery(value)}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <PayorPartnershipsDataGrid
          isRoleBankUser
          payorPartnerships={payorPartnerships}
        />
      </Box>
    </PageContent>
  );
}
