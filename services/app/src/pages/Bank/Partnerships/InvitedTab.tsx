import { Box, Button } from "@material-ui/core";
import PartnershipInvitationsDataGrid from "components/Partnerships/PartnershipInvitationsDataGrid";
import {
  CompanyPartnershipInvitations,
  PartnershipInvitationFragment,
  useGetPartnershipInvitationsForBankSubscription,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  markPartnershipInvitationAsCompleteMutation,
  moveToActionRequiredMutation,
} from "lib/api/companies";
import { useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

const ActionButton = styled(Button)`
  margin: 2px;
`;

function InvitedTab() {
  const snackbar = useSnackbar();

  const [markInviteAsComplete, { loading: isMarkInviteLoading }] =
    useCustomMutation(markPartnershipInvitationAsCompleteMutation);

  const [moveToActionRequired, { loading: moveToActionRequiredLoading }] =
    useCustomMutation(moveToActionRequiredMutation);

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

  const handleMoveToActionRequired = async () => {
    try {
      await moveToActionRequired({
        variables: {
          company_partnership_invite_id: selectedInvitation?.id,
        },
      });
      snackbar.showSuccess(
        "Created partnership request. Invite will remain open until request has been triaged."
      );
    } catch (err) {
      snackbar.showError(`${err}`);
      console.error(err);
    }
  };

  return (
    <Container>
      <Box display="flex" flexDirection="row-reverse" my={3}>
        <ActionButton
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
        </ActionButton>
        <Box mr={2}>
          <ActionButton
            data-cy="move-to-action-required"
            size="small"
            variant="contained"
            color="primary"
            disabled={
              !selectedInvitation ||
              selectedInvitation.closed_at ||
              moveToActionRequiredLoading
            }
            onClick={handleMoveToActionRequired}
          >
            Create Partnership Request
          </ActionButton>
        </Box>
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
