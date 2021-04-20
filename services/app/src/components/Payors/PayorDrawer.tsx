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
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import Can from "components/Shared/Can";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import ContactsList from "components/ThirdParties/ContactsList";
import ThirdPartyInfo from "components/ThirdParties/ThirdPartyInfo";
import {
  CompanyAgreementsInsertInput,
  CompanyLicensesInsertInput,
  GetBankPayorPartnershipDocument,
  useAddCompanyPayorAgreementMutation,
  useAddCompanyPayorLicenseMutation,
  useGetBankPayorPartnershipQuery,
  useUpdatePayorAgreementIdMutation,
  useUpdatePayorLicenseIdMutation,
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

function PayorDrawer({ partnershipId, handleClose }: Props) {
  const classes = useStyles();

  const { data, loading, refetch, error } = useGetBankPayorPartnershipQuery({
    variables: {
      id: partnershipId,
    },
  });

  const [updatePayorAgreementId] = useUpdatePayorAgreementIdMutation();
  const [addCompanyPayorAgreement] = useAddCompanyPayorAgreementMutation();

  const [updatePayorLicenseId] = useUpdatePayorLicenseIdMutation();
  const [addPayorLicense] = useAddCompanyPayorLicenseMutation();

  const agreementFileId =
    data?.company_payor_partnerships_by_pk?.payor_agreement?.file_id;
  const licenseFileId =
    data?.company_payor_partnerships_by_pk?.payor_license?.file_id;

  const agreementFileIds = useMemo(() => {
    return agreementFileId ? [agreementFileId] : [];
  }, [agreementFileId]);
  const licenseFileIds = useMemo(() => {
    return licenseFileId ? [licenseFileId] : [];
  }, [licenseFileId]);

  if (!data?.company_payor_partnerships_by_pk) {
    if (!loading) {
      let msg = `Error querying for the company_payor_partnership ${partnershipId}. Error: ${error}`;
      window.console.log(msg);
      Sentry.captureMessage(msg);
    }
    return null;
  }

  const payor = data.company_payor_partnerships_by_pk.payor!;
  const customer = data.company_payor_partnerships_by_pk.company!;

  const customerName = customer.name;

  const notifier = new InventoryNotifier();
  const hasNoContactsSetup = !payor || !payor.users || !customer?.users;

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
        <Typography variant="h6"> Bank Information </Typography>
        <Box display="flex" mt={1}>
          <CollectionsBank
            companySettingsId={payor.settings?.id}
            assignedBespokeBankAccount={
              payor.settings?.collections_bespoke_bank_account || undefined
            }
          />
        </Box>
        <Grid container direction="column">
          <Grid item>
            <Typography variant="h6" display="inline">
              {" "}
              Licenses{" "}
            </Typography>
          </Grid>
          {licenseFileId && (
            <Grid item>
              <DownloadThumbnail
                fileIds={licenseFileIds}
                fileType={FileTypeEnum.COMPANY_LICENSE}
              />
            </Grid>
          )}
        </Grid>
        <Box
          mt={1}
          mb={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box mt={1} mb={2}>
            <FileUploadDropzone
              companyId={payor.id}
              docType="payor_license"
              maxFilesAllowed={1}
              onUploadComplete={async (resp) => {
                if (!resp.succeeded) {
                  return;
                }
                const fileId = resp.files_in_db[0].id;

                const license: CompanyLicensesInsertInput = {
                  file_id: fileId,
                  company_id: payor.id,
                };

                const payorLicense = await addPayorLicense({
                  variables: {
                    payorLicense: license,
                  },
                });

                const payorLicenseId =
                  payorLicense.data?.insert_company_licenses_one?.id;

                await updatePayorLicenseId({
                  variables: {
                    companyPayorPartnershipId: partnershipId,
                    payorLicenseId: payorLicenseId,
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
        <Grid container direction="column">
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
        </Grid>
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

        <Typography variant="h6"> Actions </Typography>
        <Can perform={Action.ApprovePayor}>
          <Box mt={1} mb={2}>
            <ApprovePayor
              hasNoContactsSetup={hasNoContactsSetup}
              payorId={payor.id}
              payorName={payor.name}
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

export default PayorDrawer;
