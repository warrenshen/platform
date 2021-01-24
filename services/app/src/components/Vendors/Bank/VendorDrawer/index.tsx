import { Box, Drawer, Grid, makeStyles, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/react";
import AdvancesBank from "components/Shared/BespokeBankAssignment/AdvancesBank";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import ApproveVendor from "components/Vendors/Bank/VendorDrawer/Actions/ApproveVendor";
import BankAccount from "components/Vendors/Bank/VendorDrawer/BankAccount";
import Contacts from "components/Vendors/Bank/VendorDrawer/Contacts";
import VendorInfo from "components/Vendors/Bank/VendorDrawer/VendorInfo";
import {
  CompanyAgreementsInsertInput,
  CompanyLicensesInsertInput,
  CompanyVendorPartnerships,
  ContactFragment,
  useAddCompanyVendorAgreementMutation,
  useAddCompanyVendorLicenseMutation,
  useBankVendorPartnershipQuery,
  useUpdateVendorAgreementIdMutation,
  useUpdateVendorLicenseIdMutation,
} from "generated/graphql";
import { InventoryNotifier } from "lib/notifications/inventory";
import { omit } from "lodash";
import React, { useState } from "react";
import SendVendorAgreements from "./Notifications/SendVendorAgreements";

const useStyles = makeStyles({
  drawerContent: {
    width: 700,
  },
  baseInput: {
    width: 300,
  },
  addressForm: {
    width: 600,
  },
  fileDropbox: {},
});

// TODO(dlluncor): Check that time sorting works properly.
// For now, the primary contact is the contact who was created first
function getPrimaryContact(
  contacts: ContactFragment[]
): ContactFragment | null {
  if (!contacts || contacts.length === 0) {
    return null;
  }
  const contactsToSort = [...contacts];
  contactsToSort.sort((c1, c2) => {
    if (c1.created_at < c2.created_at) {
      return 1;
    }
    return -1;
  });
  return contacts[0];
}

function VendorDrawer(props: {
  vendorPartnershipId: CompanyVendorPartnerships["id"];
  onClose: () => void;
}) {
  const classes = useStyles();

  const { data, error } = useBankVendorPartnershipQuery({
    variables: {
      id: props.vendorPartnershipId,
    },
  });

  const [updateVendorAgreementId] = useUpdateVendorAgreementIdMutation();
  const [addCompanyVendorAgreement] = useAddCompanyVendorAgreementMutation();
  const [agreementFileUrls, setAgreementFileUrls] = useState<string[]>([]);

  const [updateVendorLicenseId] = useUpdateVendorLicenseIdMutation();
  const [addVendorLicense] = useAddCompanyVendorLicenseMutation();
  const [licenseFileUrls, setLicenseFileUrls] = useState<string[]>([]);

  if (!data?.company_vendor_partnerships_by_pk) {
    let msg = `Error querying for the bank vendor partner ${props.vendorPartnershipId}. Error: ${error}`;
    window.console.log(msg);
    Sentry.captureMessage(msg);
    return null;
  }

  const vendor = data.company_vendor_partnerships_by_pk.vendor;
  const customer = data.company_vendor_partnerships_by_pk.company;
  const customerSettings =
    data.company_vendor_partnerships_by_pk.company?.settings;

  const agreementFileId =
    data.company_vendor_partnerships_by_pk.company_agreement?.file_id;

  const licenseFileId =
    data.company_vendor_partnerships_by_pk.company_license?.file_id;
  const customerName = customer?.name;

  const docusignLink = customerSettings?.vendor_agreement_docusign_template;

  const primaryVendorContact = getPrimaryContact(vendor.users);
  const primaryCustomerContact = getPrimaryContact(customer?.users);
  const notifier = new InventoryNotifier("email");

  return (
    <Drawer open anchor="right" onClose={props.onClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h6">{vendor.name}</Typography>
        <Box py={3}>
          <VendorInfo vendor={omit(vendor, ["users"])}></VendorInfo>
        </Box>
        <Typography variant="h6"> Contacts </Typography>
        <Contacts
          contacts={vendor.users}
          companyId={vendor.id}
          companyVendorPartnershipId={data.company_vendor_partnerships_by_pk.id}
        ></Contacts>
        <Typography variant="h6"> Bank Information </Typography>
        <BankAccount
          companyId={vendor.id}
          companyVendorPartnershipId={data.company_vendor_partnerships_by_pk.id}
          bankAccount={
            data.company_vendor_partnerships_by_pk.vendor_bank_account
          }
        ></BankAccount>
        <Box display="flex" mt={1}>
          <AdvancesBank
            companySettingsId={
              data.company_vendor_partnerships_by_pk.vendor.settings?.id
            }
            assignedBespokeBankAccount={
              data.company_vendor_partnerships_by_pk.vendor.settings
                ?.advances_bespoke_bank_account || undefined
            }
          ></AdvancesBank>
          <CollectionsBank
            companySettingsId={
              data.company_vendor_partnerships_by_pk.vendor.settings?.id
            }
            assignedBespokeBankAccount={
              data.company_vendor_partnerships_by_pk.vendor.settings
                ?.collections_bespoke_bank_account || undefined
            }
          ></CollectionsBank>
        </Box>

        <Grid container direction="row" alignItems="center">
          <Grid item>
            <Typography variant="h6" display="inline">
              {" "}
              Licenses{" "}
            </Typography>
          </Grid>
          {licenseFileId && (
            <Grid item>
              <DownloadThumbnail
                fileIds={[licenseFileId]}
                fileUrls={licenseFileUrls}
                setFileUrls={setLicenseFileUrls}
              ></DownloadThumbnail>
            </Grid>
          )}
        </Grid>
        <Box
          mt={1}
          mb={2}
          className={classes.fileDropbox}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box mt={1} mb={2}>
            <FileUploadDropzone
              companyId={vendor.id}
              docType="vendor_license"
              maxFilesAllowed={1}
              onUploadComplete={async (resp) => {
                if (!resp.succeeded) {
                  return;
                }
                setLicenseFileUrls([]); // clear any file urls which may be displayed related to this vendor license
                const fileId = resp.files_in_db[0].id;
                // This is an agreement that the vendor signs with Bespoke, therefore
                // company_id is vendor.id
                const license: CompanyLicensesInsertInput = {
                  file_id: fileId,
                  company_id: vendor.id,
                };
                const vendorLicense = await addVendorLicense({
                  variables: {
                    vendorLicense: license,
                  },
                });
                const vendorLicenseId =
                  vendorLicense.data?.insert_company_licenses_one?.id;
                await updateVendorLicenseId({
                  variables: {
                    companyVendorPartnershipId: props.vendorPartnershipId,
                    vendorLicenseId: vendorLicenseId,
                  },
                });
                console.log(resp);
              }}
            ></FileUploadDropzone>
          </Box>
        </Box>

        <Grid container direction="row" alignItems="center">
          <Grid item>
            <Typography variant="h6" display="inline">
              {" "}
              Vendor Agreement{" "}
            </Typography>
          </Grid>
          {agreementFileId && (
            <Grid item>
              <DownloadThumbnail
                fileIds={[agreementFileId]}
                fileUrls={agreementFileUrls}
                setFileUrls={setAgreementFileUrls}
              ></DownloadThumbnail>
            </Grid>
          )}
        </Grid>
        <Box mt={1} mb={2}>
          <FileUploadDropzone
            companyId={vendor.id}
            docType="vendor_agreement"
            maxFilesAllowed={1}
            onUploadComplete={async (resp) => {
              if (!resp.succeeded) {
                return;
              }
              setAgreementFileUrls([]); // clear any file urls which may be displayed related to this vendor agreement
              const fileId = resp.files_in_db[0].id;
              // This is an agreement that the vendor signs with Bespoke, therefore
              // company_id is vendor.id
              const agreement: CompanyAgreementsInsertInput = {
                file_id: fileId,
                company_id: vendor.id,
              };
              const companyAgreement = await addCompanyVendorAgreement({
                variables: {
                  vendorAgreement: agreement,
                },
              });
              const vendorAgreementId =
                companyAgreement.data?.insert_company_agreements_one?.id;
              await updateVendorAgreementId({
                variables: {
                  companyVendorPartnershipId: props.vendorPartnershipId,
                  vendorAgreementId: vendorAgreementId,
                },
              });
              console.log(resp);
            }}
          ></FileUploadDropzone>
        </Box>

        <Typography variant="h6"> Notifications </Typography>
        <Box mt={1} mb={2}>
          <SendVendorAgreements
            vendorContact={primaryVendorContact}
            vendorName={vendor.name}
            customerName={customerName}
            docusignLink={docusignLink || null}
            notifier={notifier}
          ></SendVendorAgreements>
        </Box>

        <Typography variant="h6"> Actions </Typography>
        <Box mt={1} mb={2}>
          <ApproveVendor
            vendorContact={primaryVendorContact}
            customerContact={primaryCustomerContact}
            vendorPartnershipId={props.vendorPartnershipId}
            customerName={customerName}
            vendorName={vendor.name}
            notifier={notifier}
          ></ApproveVendor>
        </Box>

        <Typography variant="h6"> Customers </Typography>
      </Box>
    </Drawer>
  );
}

export default VendorDrawer;
