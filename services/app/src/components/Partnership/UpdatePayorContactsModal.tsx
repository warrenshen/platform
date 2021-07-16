import { Box, Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import { ValueFormatterParams } from "@material-ui/data-grid";
import Modal from "components/Shared/Modal/Modal";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  CompanyPayorContactFragment,
  CompanyPayorPartnerships,
  UserFragment,
  useGetPayorPartnershipForContactsQuery,
  Users,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updatePartnershipContactsMutation } from "lib/api/partnerships";
import { ChangeEvent, useMemo, useState } from "react";

interface Props {
  payorPartnershipId: CompanyPayorPartnerships["id"];
  handleClose: () => void;
}

export default function UpdatePayorContactsModal({
  payorPartnershipId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const [selectedUserIds, setSelectedUserIds] = useState<Users["id"]>([]);
  const [shouldUseAllUsers, setShouldUseAllUsers] = useState(true);

  const { data, error } = useGetPayorPartnershipForContactsQuery({
    fetchPolicy: "network-only",
    variables: {
      id: payorPartnershipId,
    },
    onCompleted: (data) => {
      const existingSelectedUserIds = (
        data?.company_payor_partnerships_by_pk?.payor_contacts || []
      ).map(
        (payorContact: CompanyPayorContactFragment) =>
          payorContact.payor_user_id
      );
      setSelectedUserIds(existingSelectedUserIds);
      setShouldUseAllUsers(existingSelectedUserIds.length <= 0);
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const customer = data?.company_payor_partnerships_by_pk?.company;
  const payor = data?.company_payor_partnerships_by_pk?.payor;

  const users: UserFragment[] = useMemo(
    () => data?.company_payor_partnerships_by_pk?.payor?.users || [],
    [data?.company_payor_partnerships_by_pk]
  );

  const selectedContacts = useMemo(
    () => users.filter((user) => selectedUserIds.indexOf(user.id) >= 0),
    [selectedUserIds, users]
  );

  const notSelectedContacts = useMemo(
    () => users.filter((user) => selectedUserIds.indexOf(user.id) < 0),
    [selectedUserIds, users]
  );

  const selectedLoansActionItems = useMemo(
    () => [
      {
        key: "deselect-user",
        label: "Remove",
        handleClick: (params: ValueFormatterParams) =>
          setSelectedUserIds(
            selectedUserIds.filter(
              (userId: Users["id"]) => userId !== params.row.data.id
            )
          ),
      },
    ],
    [selectedUserIds, setSelectedUserIds]
  );

  const notSelectedLoansActionItems = useMemo(
    () => [
      {
        key: "select-user",
        label: "Add",
        handleClick: (params: ValueFormatterParams) =>
          setSelectedUserIds([...selectedUserIds, params.row.data.id]),
      },
    ],
    [selectedUserIds, setSelectedUserIds]
  );

  const handleClickSubmit = async () => {
    const response = await updatePartnershipContacts({
      variables: {
        is_payor: true,
        partnership_id: payorPartnershipId,
        user_ids: selectedUserIds,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not update payor contacts. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Payor contacts updated.");
      handleClose();
    }
  };

  const [
    updatePartnershipContacts,
    { loading: isUpdatePartnershipContactsLoading },
  ] = useCustomMutation(updatePartnershipContactsMutation);

  if (!customer || !payor) {
    return null;
  }

  const isSubmitDisabled =
    isUpdatePartnershipContactsLoading ||
    (!shouldUseAllUsers && selectedUserIds.length === users.length) ||
    (!shouldUseAllUsers && selectedUserIds.length <= 0);

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Select Payor Contacts"}
      subtitle={`${payor.name} <> ${customer.name}`}
      contentWidth={800}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box display="flex" flexDirection="column" mt={4}>
        <Box>
          <Typography variant="subtitle1">
            Specify payor contacts whom will receive notifications for this
            partnership.
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={shouldUseAllUsers}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setShouldUseAllUsers(event.target.checked);
                  if (event.target.checked) {
                    setSelectedUserIds([]);
                  }
                }}
                color="primary"
              />
            }
            label={"Use ALL company users as payor contacts"}
          />
          <Typography variant="subtitle2" color="textSecondary">
            Check this if you want all users of the company to be payor
            contacts.
          </Typography>
        </Box>
        {shouldUseAllUsers ? (
          <Box mt={4}>
            <UsersDataGrid pager={false} users={users} />
          </Box>
        ) : (
          <>
            <Box mt={4}>
              <Typography variant="body2">
                <b>Selected payor contacts</b>
              </Typography>
              <UsersDataGrid
                pager={false}
                users={selectedContacts}
                actionItems={selectedLoansActionItems}
              />
            </Box>
            <Box mt={4}>
              <Typography variant="body2">
                <b>Not selected payor contacts</b>
              </Typography>
              <UsersDataGrid
                pager={false}
                users={notSelectedContacts}
                actionItems={notSelectedLoansActionItems}
              />
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}
