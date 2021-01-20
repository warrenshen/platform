import { Box, Drawer, Grid, makeStyles, Typography } from "@material-ui/core";
import * as Sentry from "@sentry/react";
import AdvancesBank from "components/Shared/BespokeBankAssignment/AdvancesBank";
import CollectionsBank from "components/Shared/BespokeBankAssignment/CollectionsBank";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileUploadDropzone from "components/Shared/File/UploadDropzone";
import BankAccount from "components/Vendors/Bank/VendorDrawer/BankAccount";
import Contacts from "components/Vendors/Bank/VendorDrawer/Contacts";
import VendorInfo from "components/Vendors/Bank/VendorDrawer/VendorInfo";
import {
  CompanyAgreementsInsertInput,
  CompanyVendorPartnerships,
  useAddCompanyVendorAgreementMutation,
  useBankVendorPartnershipQuery,
  useUpdateVendorAgreementIdMutation,
} from "generated/graphql";
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

  const [agreementFileUrls, setAgreementFileUrls] = useState<string[]>([]);

  const [updateVendorAgreementId] = useUpdateVendorAgreementIdMutation();
  const [addCompanyVendorAgreement] = useAddCompanyVendorAgreementMutation();

  if (!data?.company_vendor_partnerships_by_pk) {
    let msg = `Error querying for the bank vendor partner ${props.vendorPartnershipId}. Error: ${error}`;
    window.console.log(msg);
    Sentry.captureMessage(msg);
    return null;
  }

  const vendor = data.company_vendor_partnerships_by_pk.vendor;
  const companyId = data.company_vendor_partnerships_by_pk.company_id;

  const agreementFileId =
    data.company_vendor_partnerships_by_pk.company_agreement?.file_id;

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
            companyId={data.company_vendor_partnerships_by_pk.vendor.id}
            assignedBespokeBankAccount={
              data.company_vendor_partnerships_by_pk.vendor
                .advances_bespoke_bank_account || undefined
            }
          ></AdvancesBank>
          <CollectionsBank
            companyId={data.company_vendor_partnerships_by_pk.vendor.id}
            assignedBespokeBankAccount={
              data.company_vendor_partnerships_by_pk.vendor
                .collections_bespoke_bank_account || undefined
            }
          ></CollectionsBank>
        </Box>
        <Typography variant="h6"> Licenses </Typography>
        <Box
          mt={1}
          mb={2}
          className={classes.fileDropbox}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box>Upload</Box>
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
          <SendVendorAgreements contacts={vendor.users}></SendVendorAgreements>
        </Box>

        <Typography variant="h6"> Customers </Typography>
      </Box>
    </Drawer>
  );
}

export default VendorDrawer;
