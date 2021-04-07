import { Box, Typography } from "@material-ui/core";
import EbbaApplicationCard from "components/EbbaApplication/EbbaApplicationCard";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import PageContent from "components/Shared/Page/PageContent";
import { useGetCompanyForCustomerBorrowingBaseQuery } from "generated/graphql";

interface Props {
  companyId: string;
}

function BankCustomerEbbaApplicationsSubpage({ companyId }: Props) {
  const { data } = useGetCompanyForCustomerBorrowingBaseQuery({
    variables: {
      companyId,
    },
  });

  const activeEbbaApplication =
    data?.companies_by_pk?.settings?.active_ebba_application;
  const ebbaApplications = data?.companies_by_pk?.ebba_applications || [];

  return (
    <PageContent title={"Borrowing Base"}>
      <Box>
        <Box mb={1}>
          <Typography variant="h6">Active Borrowing Base</Typography>
        </Box>
        {activeEbbaApplication ? (
          <EbbaApplicationCard ebbaApplication={activeEbbaApplication} />
        ) : (
          <Box>
            <Typography variant="body2">No active borrowing base</Typography>
          </Box>
        )}
      </Box>
      <Box mt={3}>
        <Box mb={1}>
          <Typography variant="h6">Historical Borrowing Base</Typography>
        </Box>
        <EbbaApplicationsDataGrid
          isCompanyVisible={false}
          ebbaApplications={ebbaApplications}
          isExcelExport
        />
      </Box>
    </PageContent>
  );
}

export default BankCustomerEbbaApplicationsSubpage;
