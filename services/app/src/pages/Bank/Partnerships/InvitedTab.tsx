import { Box, Button } from "@material-ui/core";
import PartnershipInvitationsDataGrid from "components/Partnerships/PartnershipInvitationsDataGrid";
import {
  useGetPartnershipInvitationsForBankSubscription,
  CompanyPartnershipInvitations,
  PartnershipInvitationFragment,
} from "generated/graphql";
import { markPartnershipInvitationAsCompleteMutation } from "lib/api/companies";
import styled from "styled-components";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { useMemo, useState } from "react";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

function InvitedTab() {
  const snackbar = useSnackbar();

  const [
    markInviteAsComplete,
    { loading: isMarkInviteLoading },
  ] = useCustomMutation(markPartnershipInvitationAsCompleteMutation);

  const { data, error } = useGetPartnershipInvitationsForBankSubscription();

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const partnershipInvitations = useMemo(
    () => data?.company_partnership_invitations || [],
    [data?.company_partnership_invitations]
  );

  const [selectedInvitationIds, setSelectedInvitationIds] = useState<
    CompanyPartnershipInvitations["id"]
  >([]);

  const selectedInvitation = useMemo(
    () =>
      selectedInvitationIds.length === 1
        ? partnershipInvitations.find(
            (invitation) => invitation.id === selectedInvitationIds[0]
          )
        : null,
    [partnershipInvitations, selectedInvitationIds]
  );

  const handleSelectPartnershipInvitations = useMemo(
    () => (invitations: PartnershipInvitationFragment[]) => {
      setSelectedInvitationIds(invitations.map((invitation) => invitation.id));
    },
    [setSelectedInvitationIds]
  );

  const handleSubmit = async () => {
    try {
      await markInviteAsComplete({
        variables: {
          company_partnership_invite_id: selectedInvitation?.id,
        },
      });
      snackbar.showSuccess("Vendor invitation(s) marked as closed");
    } catch (err) {
      snackbar.showError(`${err}`);
      console.error(err);
    }
  };

  return (
    <Container>
      <Box display="flex" flexDirection="row-reverse" my={3}>
        <Button
          data-cy="create-update-bank-account-modal-add-button"
          size="small"
          variant="contained"
          color="primary"
          disabled={
            !selectedInvitation ||
            selectedInvitation.closed_at ||
            isMarkInviteLoading
          }
          onClick={handleSubmit}
        >
          Mark as Closed
        </Button>
      </Box>
      <Box display="flex" flexDirection="column">
        <PartnershipInvitationsDataGrid
          partnershipInvitations={partnershipInvitations}
          selectedRequestIds={selectedInvitationIds}
          handleSelectRequests={handleSelectPartnershipInvitations}
        />
      </Box>
    </Container>
  );
}

export default InvitedTab;
