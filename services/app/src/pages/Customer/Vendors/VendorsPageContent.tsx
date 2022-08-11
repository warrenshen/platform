import { Box, Typography } from "@material-ui/core";
import PartnershipsAwaitingApprovalDataGrid from "components/Partnerships/PartnershipsAwaitingApprovalDataGrid";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import AddVendorButton from "components/Vendors/AddVendorButton";
import EditVendorModal from "components/Vendors/EditVendorModal";
import VendorPartnershipsDataGrid from "components/Vendors/VendorPartnershipsDataGrid";
import {
  Companies,
  VendorPartnershipLimitedFragment,
  useGetPartnershipRequestsAndInvitesByRequestingCompanyIdQuery,
  useGetVendorPartnershipsByCompanyIdQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { getCompanyDisplayName } from "lib/companies";
import { formatDatetimeString } from "lib/date";
import { ProductTypeEnum } from "lib/enum";
import { isVendorAgreementProductType } from "lib/settings";
import { sortBy } from "lodash";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export type PartnershipAwatingApproval = {
  id: string;
  vendor_name: string;
  submitted_by: string;
  submitted_at: string | null;
  email: string;
  license_numbers: string;
  category: string;
};

export enum PartnershipAwatingApprovalCategory {
  VendorInvite = "Vendor Invite",
  PendingPartnership = "Pending Partnership",
}

export default function CustomerVendorsPageContent({
  companyId,
  productType,
}: Props) {
  const { data, refetch, error } = useGetVendorPartnershipsByCompanyIdQuery({
    variables: {
      companyId,
    },
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const vendorPartnerships = sortBy(
    data?.company_vendor_partnerships || [],
    (companyVendorPartnership) =>
      getCompanyDisplayName(companyVendorPartnership.vendor)
  );

  const {
    data: awaitingPartnershipsAndInvitationsData,
    error: awaitingPartnershipsAndInvitationsError,
  } = useGetPartnershipRequestsAndInvitesByRequestingCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      requesting_company_id: companyId,
    },
  });

  if (awaitingPartnershipsAndInvitationsError) {
    console.error({ error });
    alert(
      `Error in query (details in console): ${awaitingPartnershipsAndInvitationsError.message}`
    );
  }

  const [selectedVendorIds, setSelectedVendorIds] = useState<
    VendorPartnershipLimitedFragment[]
  >([]);

  const selectedVendor = useMemo(
    () =>
      selectedVendorIds.length === 1
        ? vendorPartnerships.find(
            (vendorPartnership) =>
              vendorPartnership.id === selectedVendorIds[0].id
          )
        : null,
    [vendorPartnerships, selectedVendorIds]
  );

  const selectedVendorId = useMemo(
    () => (!!selectedVendor?.id ? selectedVendor.id : null),
    [selectedVendor]
  );

  const awaitingInvitations: PartnershipAwatingApproval[] =
    awaitingPartnershipsAndInvitationsData &&
    awaitingPartnershipsAndInvitationsData?.company_partnership_invitations
      ?.length
      ? awaitingPartnershipsAndInvitationsData?.company_partnership_invitations.map(
          (awaitingInvitation) => ({
            id: awaitingInvitation.id,
            vendor_name: awaitingInvitation?.metadata_info?.name
              ? awaitingInvitation.metadata_info.name
              : "-",
            submitted_by: awaitingInvitation.submitted_by_user
              ? awaitingInvitation.submitted_by_user.full_name
              : "-",
            submitted_at: awaitingInvitation.requested_at
              ? formatDatetimeString(awaitingInvitation.requested_at, false)
              : "-",
            email: awaitingInvitation.email,
            license_numbers: "-",
            category: PartnershipAwatingApprovalCategory.VendorInvite,
          })
        )
      : [];

  const awaitingPartnerships: PartnershipAwatingApproval[] =
    awaitingPartnershipsAndInvitationsData &&
    awaitingPartnershipsAndInvitationsData?.company_partnership_requests?.length
      ? awaitingPartnershipsAndInvitationsData?.company_partnership_requests.map(
          (awaitingPartnership) => ({
            id: awaitingPartnership.id,
            vendor_name: awaitingPartnership.company_name,
            submitted_by: awaitingPartnership.requested_by_user
              ? awaitingPartnership.requested_by_user.full_name
              : "-",
            submitted_at: awaitingPartnership.created_at
              ? formatDatetimeString(awaitingPartnership.created_at, false)
              : "-",
            email: awaitingPartnership?.user_info
              ? awaitingPartnership?.user_info?.email
              : "-",
            license_numbers: awaitingPartnership.license_info
              ? awaitingPartnership.license_info.license_ids.join(", ")
              : "-",
            category: PartnershipAwatingApprovalCategory.PendingPartnership,
          })
        )
      : [];

  const partnershipAwatingApprovals = [
    ...awaitingInvitations,
    ...awaitingPartnerships,
  ];
  return (
    <PageContent title={"Vendors"}>
      <Box mb={2}>
        <Typography variant="h6">
          <strong>Awaiting Approval</strong>
        </Typography>
      </Box>
      <Can perform={Action.AddVendor}>
        <Box display="flex" flexDirection="row-reverse" mb={2}>
          <AddVendorButton customerId={companyId} handleDataChange={refetch} />
        </Box>
      </Can>
      <Box display="flex" flexDirection="column">
        <PartnershipsAwaitingApprovalDataGrid
          partnershipsAwaitingApproval={partnershipAwatingApprovals}
        />
      </Box>
      <h2>Approved</h2>
      {/* edit vendor here pass in multi select*/}
      <Can perform={Action.EditVendor}>
        <Box mb={2} display="flex" flexDirection="row-reverse">
          <ModalButton
            isDisabled={selectedVendorIds.length !== 1}
            label={"Edit Vendors"}
            modal={({ handleClose }) => (
              <EditVendorModal
                vendorPartnershipId={selectedVendorId}
                handleClose={() => {
                  refetch();
                  setSelectedVendorIds([]);
                  handleClose();
                }}
              />
            )}
          />
        </Box>
      </Can>
      <Box display="flex">
        <VendorPartnershipsDataGrid
          isMultiSelectEnabled={true}
          isVendorAgreementVisible={isVendorAgreementProductType(productType)}
          vendorPartnerships={vendorPartnerships}
          setSelectedVendorIds={setSelectedVendorIds}
        />
      </Box>
    </PageContent>
  );
}
