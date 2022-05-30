import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
} from "@material-ui/core";
import UpdatePayorContactsModal from "components/Partnership/UpdatePayorContactsModal";
import ApprovePayor from "components/Payors/ApprovePayor";
import AssignCollectionsBespokeBankAccount from "components/Shared/BankAssignment/AssignCollectionsBespokeBankAccount";
import Can from "components/Shared/Can";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/FileUploadDropzone";
import Modal from "components/Shared/Modal/Modal";
import ModalButton from "components/Shared/Modal/ModalButton";
import UsersDataGrid from "components/Users/UsersDataGrid";
import {
  CompanyAgreementsInsertInput,
  GetBankPayorPartnershipDocument,
  useAddCompanyPayorAgreementMutation,
  useGetBankPayorPartnershipQuery,
  useUpdatePayorAgreementIdMutation,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { FileTypeEnum } from "lib/enum";
import { InventoryNotifier } from "lib/notifications/inventory";
import { consolidateCompanyUsers } from "lib/users";
import { useMemo } from "react";

interface Props {
  payorPartnershipId: string;
  handleClose: () => void;
}

export default function PayorPartnershipDrawer({
  payorPartnershipId,
  handleClose,
}: Props) {
  const { data, refetch, error } = useGetBankPayorPartnershipQuery({
    fetchPolicy: "network-only",
    variables: {
      id: payorPartnershipId,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const [updatePayorAgreementId] = useUpdatePayorAgreementIdMutation();
  const [addCompanyPayorAgreement] = useAddCompanyPayorAgreementMutation();

  const companyPayorPartnership = data?.company_payor_partnerships_by_pk;
  const customer = companyPayorPartnership?.company;
  const customerUsers = consolidateCompanyUsers(
    customer?.users || [],
    customer?.parent_company?.users || []
  );
  const payor = companyPayorPartnership?.payor;
  const agreementFileId = companyPayorPartnership?.payor_agreement?.file_id;

  const agreementFileIds = useMemo(() => {
    return agreementFileId ? [agreementFileId] : [];
  }, [agreementFileId]);

  const payorContacts = useMemo(
    () =>
      (companyPayorPartnership?.payor_contacts || []).length > 0
        ? companyPayorPartnership?.payor_contacts.map(
            (payorContact) => payorContact.user
          ) || []
        : payor?.users || [],
    [companyPayorPartnership, payor]
  );

  if (!companyPayorPartnership || !customer || !payor) {
    return null;
  }

  const shouldUseAllUsers = payorContacts.length === payor.users.length;
  const customerName = customer.name;

  const notifier = new InventoryNotifier();
  const hasNoContactsSetup =
    !payor ||
    !payor.users ||
    payor.users.length === 0 ||
    customerUsers.length === 0;
  const hasNoCollectionsBankAccount =
    !payor.settings?.collections_bespoke_bank_account;

  return (
    <Modal
      title={`${payor.name} <> ${customer.name}`}
      subtitle={"Payor <> Customer"}
      contentWidth={800}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">Payor Contacts</Typography>
        <Typography variant="subtitle2">
          Specify which payor contacts will receive notifications for this
          partnership.
        </Typography>
        <Box mt={2}>
          <ModalButton
            label={"Edit Payor Contacts"}
            color="default"
            size="small"
            variant="outlined"
            modal={({ handleClose }) => (
              <UpdatePayorContactsModal
                payorPartnershipId={payorPartnershipId}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        </Box>
        <Box mt={2}>
          <FormControlLabel
            control={
              <Checkbox disabled checked={shouldUseAllUsers} color="primary" />
            }
            label={"Use ALL company users as payor contacts"}
          />
        </Box>
        <UsersDataGrid users={payorContacts} />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">Bank Information</Typography>
        <Typography variant="subtitle2">
          Specify which Bespoke Financial bank account Payor will send payments
          to:
        </Typography>
        {hasNoCollectionsBankAccount && (
          <Typography variant="body2" color="secondary">
            Warning: BF bank account for payor to send payments to NOT assigned
            yet.
          </Typography>
        )}
        <Box display="flex" mt={1}>
          <AssignCollectionsBespokeBankAccount
            companySettingsId={payor.settings?.id}
            assignedBespokeBankAccount={
              payor.settings?.collections_bespoke_bank_account || null
            }
            handleDataChange={refetch}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Grid item>
          <Typography variant="h6" display="inline">
            Payor Agreement
          </Typography>
        </Grid>
        {agreementFileId && (
          <Grid item>
            <DownloadThumbnail
              fileIds={agreementFileIds}
              fileType={FileTypeEnum.CompnayAgreement}
            />
          </Grid>
        )}
        <Box mt={1} mb={2}>
          <FileUploadDropzone
            companyId={payor.id}
            docType="payor_agreement"
            maxFilesAllowed={1}
            onUploadComplete={async (resp) => {
              if (!resp.succeeded) {
                return;
              }
              const fileId = resp.files_in_db[0].id;

              const agreement: CompanyAgreementsInsertInput = {
                file_id: fileId,
                company_id: payor.id,
              };

              const companyAgreement = await addCompanyPayorAgreement({
                variables: {
                  payorAgreement: agreement,
                },
              });

              const payorAgreementId =
                companyAgreement.data?.insert_company_agreements_one?.id;

              await updatePayorAgreementId({
                variables: {
                  companyPayorPartnershipId: payorPartnershipId,
                  payorAgreementId: payorAgreementId,
                },
                refetchQueries: [
                  {
                    query: GetBankPayorPartnershipDocument,
                    variables: {
                      id: payorPartnershipId,
                    },
                  },
                ],
              });
            }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="h6">Actions</Typography>
        <Can perform={Action.ApprovePayor}>
          <Box mt={1} mb={2}>
            <ApprovePayor
              hasNoCollectionsBankAccount={hasNoCollectionsBankAccount}
              hasNoContactsSetup={hasNoContactsSetup}
              payorId={payor.id}
              payorName={payor?.name || ""}
              customerId={customer.id}
              customerName={customerName}
              payorPartnershipId={payorPartnershipId}
              notifier={notifier}
            />
          </Box>
        </Can>
      </Box>
    </Modal>
  );
}
