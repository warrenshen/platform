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
  const companyVendorPartnership =
    data?.company_vendor_partnerships_by_pk || null;

  const { activeContactUsers, inactiveContactUsers } = useMemo(() => {
    const active = !!companyVendorPartnership?.vendor_contacts
      ? companyVendorPartnership.vendor_contacts
          .filter(
            (contact) =>
              previewData.proposedUsersSelected.indexOf(contact.user.id) > -1
          )
          .map((contact) => contact.user)
      : ([] as UserFragment[]);

    const inactive = !!companyVendorPartnership?.vendor_contacts
      ? companyVendorPartnership.vendor_contacts
          .filter(
            (contact) =>
              previewData.proposedUsersUnselected.indexOf(contact.user.id) > -1
          )
          .map((contact) => contact.user)
      : ([] as UserFragment[]);

    return {
      activeContactUsers: active,
      inactiveContactUsers: inactive,
    };
  }, [
    companyVendorPartnership,
    previewData.proposedUsersSelected,
    previewData.proposedUsersUnselected,
  ]);

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
          users={activeContactUsers}
        />
      </Box>
      <Box mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Inactive Contacts
        </Typography>
        <UsersDataGrid
          isExcelExport={false}
          pager={false}
          users={inactiveContactUsers}
        />
      </Box>
    </Box>
  );
}
