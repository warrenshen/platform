import { Box, TextField } from "@material-ui/core";
import PayorPartnershipsDataGrid from "components/Payors/PayorPartnershipsDataGrid";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { useGetPayorPartnershipsForBankQuery } from "generated/graphql";
import { filter, sortBy } from "lodash";
import { useMemo, useState } from "react";

export default function BankPayorsPage() {
  const { data } = useGetPayorPartnershipsForBankQuery();

  const [searchQuery, setSearchQuery] = useState("");

  const payorPartnerships = useMemo(() => {
    const filteredPayorPartnerships = filter(
      data?.company_payor_partnerships || [],
      (payorPartnership) =>
        payorPartnership.payor
          ? payorPartnership.payor.name
              .toLowerCase()
              .indexOf(searchQuery.toLowerCase()) >= 0
          : false
    );
    return sortBy(filteredPayorPartnerships, (payorPartnership) =>
      payorPartnership.payor ? payorPartnership.payor.name : null
    );
  }, [searchQuery, data?.company_payor_partnerships]);

  return (
    <Page appBarTitle="Payors">
      <PageContent title={"Payors"}>
        <Box
          display="flex"
          style={{ marginBottom: "1rem" }}
          justifyContent="space-between"
        >
          <Box display="flex">
            <TextField
              label="Search"
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
            />
          </Box>
        </Box>
        <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
          <PayorPartnershipsDataGrid
            isBankAccount
            isExcelExport
            data={payorPartnerships}
          />
        </Box>
      </PageContent>
    </Page>
  );
}
