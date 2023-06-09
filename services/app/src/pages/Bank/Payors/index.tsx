import { Box, TextField } from "@material-ui/core";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { useGetPayorPartnershipsForBankQuery } from "generated/graphql";
import { getCompanyDisplayName } from "lib/companies";
import { filter, sortBy } from "lodash";
import { useMemo, useState } from "react";

export default function BankPayorsPage() {
  const { data } = useGetPayorPartnershipsForBankQuery({
    fetchPolicy: "network-only",
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
    <Page appBarTitle="Payors">
      <PageContent title={"Payors"}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex">
            <TextField
              autoFocus
              label="Search by payor name"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              style={{ width: 300 }}
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
    </Page>
  );
}
