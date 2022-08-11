import { Box, Typography } from "@material-ui/core";
import { ChangeContactPreviewInformation } from "components/Partnerships/HandleVendorChangeRequestModal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  UserFragment,
  useGetVendorPartnershipForContactsQuery,
} from "generated/graphql";
import { useMemo } from "react";

interface Props {
  previewData: ChangeContactPreviewInformation;
}

export default function VendorContactChangePreview({ previewData }: Props) {
  const { data, error } = useGetVendorPartnershipForContactsQuery({
    fetchPolicy: "network-only",
    skip: !previewData.vendorPartnershipId,
    variables: {
      id: previewData.vendorPartnershipId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const customer = data?.company_vendor_partnerships_by_pk?.company;
  const vendor = data?.company_vendor_partnerships_by_pk?.vendor;

  const users: UserFragment[] = useMemo(
    () => data?.company_vendor_partnerships_by_pk?.vendor?.users || [],
    [data?.company_vendor_partnerships_by_pk]
  );

  const activeContacts = useMemo(
    () =>
      users.filter(
        (user) => previewData.proposedUsersSelected.indexOf(user.id) >= 0
      ),
    [previewData.proposedUsersSelected, users]
  );

  const inactiveContacts = useMemo(
    () =>
      users.filter(
        (user) => previewData.proposedUsersSelected.indexOf(user.id) < 0
      ),
    [previewData.proposedUsersSelected, users]
  );

  if (!customer || !vendor) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" mt={4}>
      <Typography variant="h6">Requested End State</Typography>
      <Box mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Active Contacts
        </Typography>
        <UsersDataGrid
          isExcelExport={false}
          pager={false}
          users={activeContacts}
        />
      </Box>
      <Box mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Inactive Contacts
        </Typography>
        <UsersDataGrid
          isExcelExport={false}
          pager={false}
          users={inactiveContacts}
        />
      </Box>
    </Box>
  );
}
