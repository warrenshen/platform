import {
  Box,
  createStyles,
  Drawer,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import * as Sentry from "@sentry/react";
import ApprovePayor from "components/Payors/ApprovePayor";
import AssignCollectionsBespokeBankAccount from "components/Shared/BespokeBankAssignment/AssignCollectionsBespokeBankAccount";
import Can from "components/Shared/Can";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/FileUploadDropzone";
import ModalButton from "components/Shared/Modal/ModalButton";
import ContactsList from "components/ThirdParties/ContactsList";
import ThirdPartyInfo from "components/ThirdParties/ThirdPartyInfo";
import UpdateCompanyLicensesModal from "components/ThirdParties/UpdateCompanyLicensesModal";
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
import { omit } from "lodash";
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
  partnershipId: string;
  handleClose: () => void;
}

export default function PayorDrawer({ partnershipId, handleClose }: Props) {
  const classes = useStyles();

  const { data, loading, refetch, error } = useGetBankPayorPartnershipQuery({
    fetchPolicy: "network-only",
    variables: {
      id: partnershipId,
    },
  });

  const [updatePayorAgreementId] = useUpdatePayorAgreementIdMutation();
  const [addCompanyPayorAgreement] = useAddCompanyPayorAgreementMutation();

  const agreementFileId =
    data?.company_payor_partnerships_by_pk?.payor_agreement?.file_id;

  const agreementFileIds = useMemo(() => {
    return agreementFileId ? [agreementFileId] : [];
  }, [agreementFileId]);

  if (!data?.company_payor_partnerships_by_pk) {
    if (!loading) {
      let msg = `Error querying for the company_payor_partnership ${partnershipId}. Error: ${error}`;
      window.console.log(msg);
      Sentry.captureMessage(msg);
    }
    return null;
  }

  const customer = data.company_payor_partnerships_by_pk.company!;
  const payor = data.company_payor_partnerships_by_pk.payor!;

  const customerName = customer.name;
  const companyLicenses = payor.licenses || [];

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
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h6">{payor.name}</Typography>
        <Box py={3}>
          <ThirdPartyInfo
            company={omit(payor, ["users"])}
            editAction={Action.EditVendor}
          />{" "}
        </Box>
        <Typography variant="h6">Contacts</Typography>
        <ContactsList
          isPayor
          companyId={payor.id}
          contacts={payor.users}
          handleDataChange={refetch}
        />
        <Typography variant="h6">Bank Information</Typography>
        <Typography variant="subtitle2">
          Specify which Bespoke Financial bank account Payor will send payments
          to:
        </Typography>
        <Box display="flex" mt={1}>
          <AssignCollectionsBespokeBankAccount
            companySettingsId={payor.settings?.id}
            assignedBespokeBankAccount={
              payor.settings?.collections_bespoke_bank_account || undefined
            }
            handleDataChange={refetch}
          />
        </Box>
        <Box display="flex" flexDirection="column">
          <Grid item>
            <Typography variant="h6">Licenses</Typography>
          </Grid>
          <Box mt={1} mb={1}>
            <ModalButton
              label={"Edit Licenses"}
              color="default"
              variant="outlined"
              modal={({ handleClose }) => (
                <UpdateCompanyLicensesModal
                  companyId={payor.id}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
          <Box mt={1} mb={2}>
            {companyLicenses.map((companyLicense) => (
              <Box key={companyLicense.id}>
                <Typography>
                  {companyLicense.license_number || "License Number TBD"}
                </Typography>
                {!!companyLicense.file_id && (
                  <DownloadThumbnail
                    isCountVisible={false}
                    fileIds={[companyLicense.file_id]}
                    fileType={FileTypeEnum.COMPANY_LICENSE}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
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
                    companyPayorPartnershipId: partnershipId,
                    payorAgreementId: payorAgreementId,
                  },
                  refetchQueries: [
                    {
                      query: GetBankPayorPartnershipDocument,
                      variables: {
                        id: partnershipId,
                      },
                    },
                  ],
                });
              }}
            />
          </Box>
        </Box>
        <Typography variant="h6"> Actions </Typography>
        <Can perform={Action.ApprovePayor}>
          <Box mt={1} mb={2}>
            <ApprovePayor
              hasNoCollectionsBankAccount={hasNoCollectionsBankAccount}
              hasNoContactsSetup={hasNoContactsSetup}
              payorId={payor.id}
              payorName={payor?.name || ""}
              customerId={customer.id}
              customerName={customerName}
              payorPartnershipId={partnershipId}
              notifier={notifier}
            />
          </Box>
        </Can>
      </Box>
    </Drawer>
  );
}
