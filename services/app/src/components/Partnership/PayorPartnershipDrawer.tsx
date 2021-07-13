import {
  Box,
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import ApprovePayor from "components/Payors/ApprovePayor";
import AssignCollectionsBespokeBankAccount from "components/Shared/BankAssignment/AssignCollectionsBespokeBankAccount";
import Can from "components/Shared/Can";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/FileUploadDropzone";
import Modal from "components/Shared/Modal/Modal";
import ContactsList from "components/ThirdParties/ContactsList";
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
import { useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 700,
      paddingBottom: theme.spacing(16),
    },
    propertyLabel: {
      flexGrow: 1,
    },
  })
);

interface Props {
  payorPartnershipId: string;
  handleClose: () => void;
}

export default function PayorPartnershipDrawer({
  payorPartnershipId,
  handleClose,
}: Props) {
  const classes = useStyles();

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

  const agreementFileId =
    data?.company_payor_partnerships_by_pk?.payor_agreement?.file_id;

  const agreementFileIds = useMemo(() => {
    return agreementFileId ? [agreementFileId] : [];
  }, [agreementFileId]);

  if (!data?.company_payor_partnerships_by_pk) {
    return null;
  }

  const customer = data.company_payor_partnerships_by_pk.company!;
  const payor = data.company_payor_partnerships_by_pk.payor!;

  const customerName = customer.name;

  const notifier = new InventoryNotifier();
  const hasNoContactsSetup =
    !payor ||
    !payor.users ||
    payor.users.length === 0 ||
    !customer?.users ||
    customer.users.length === 0;

  const hasNoCollectionsBankAccount = !payor.settings
    ?.collections_bespoke_bank_account;

  return (
    <Modal
      title={`${payor.name} <> ${customer.name}`}
      subtitle={"Payor <> Customer"}
      contentWidth={800}
      handleClose={handleClose}
    >
      <Box className={classes.drawerContent} p={4}>
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="h6">Payor Contacts</Typography>
          <ContactsList
            isPayor
            companyId={payor.id}
            contacts={payor.users}
            handleDataChange={refetch}
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <Typography variant="h6">Bank Information</Typography>
          <Typography variant="subtitle2">
            Specify which Bespoke Financial bank account Payor will send
            payments to:
          </Typography>
          {hasNoCollectionsBankAccount && (
            <Typography variant="body2" color="secondary">
              Warning: BF bank account for payor to send payments to NOT
              assigned yet.
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
                fileType={FileTypeEnum.COMPANY_AGREEMENT}
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
      </Box>
    </Modal>
  );
}
