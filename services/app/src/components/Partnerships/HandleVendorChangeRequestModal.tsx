import {
  Box,
  DialogContentText,
  Divider,
  List,
  ListItem,
  ListItemText,
  Theme,
  Typography,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import VendorContactChangePreview from "components/Partnerships/VendorContactChangePreview";
import VendorEditContactPreview from "components/Partnerships/VendorEditContactPreview";
import Modal from "components/Shared/Modal/Modal";
import {
  GetPartnershipChangeRequestsForBankSubscription,
  Users,
  useGetPartnershipChangeDetailsByIdQuery,
} from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { approveVendorContactChangeMutation } from "lib/api/companies";
import { VendorChangeRequestsCategoryEnum } from "lib/enum";
import { useMemo } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItem: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "row",
      paddingLeft: "0px",
    },
    listItemText: {
      fontSize: "18px",
    },
    listItemTextSecondary: {
      textAlign: "right",
    },
  })
);

export interface EditContactPreviewInformation {
  newFirstName: string;
  newLastName: string;
  newEmail: string;
  newPhoneNumber: string;
  previousFirstName: string;
  previousLastName: string;
  previousEmail: string;
  previousPhoneNumber: string;
}

export interface ChangeContactPreviewInformation {
  vendorPartnershipId: string;
  proposedUsersSelected: Users[];
  proposedUsersUnselected: Users[];
}

interface Props {
  partnerRequest: GetPartnershipChangeRequestsForBankSubscription["vendor_change_requests"][0];
  handleClose: () => void;
}

export default function HandleVendorChangeRequestModal({
  partnerRequest,
  handleClose,
}: Props) {
  const classes = useStyles();
  const snackbar = useSnackbar();
  const { data, error } = useGetPartnershipChangeDetailsByIdQuery({
    variables: {
      requestId: partnerRequest.id,
    },
  });
  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const requestData = useMemo(
    () => data?.vendor_change_requests_by_pk || null,
    [data]
  );
  const users = requestData?.requested_vendor?.users || [];
  const requestInfo = requestData?.request_info || null;
  const currentUser = users.find((user) => user.id === requestInfo.user_id);
  const editContactPreviewData = {
    newFirstName: requestInfo?.first_name || "",
    newLastName: requestInfo?.last_name || "",
    newEmail: requestInfo?.email || "",
    newPhoneNumber: requestInfo?.phone_number || "",
    previousFirstName: currentUser?.first_name || "",
    previousLastName: currentUser?.last_name || "",
    previousEmail: currentUser?.email || "",
    previousPhoneNumber: currentUser?.phone_number || "",
  } as EditContactPreviewInformation;

  const isSubmitDisabled = false;

  const isVendorEditContact =
    partnerRequest.category ===
    VendorChangeRequestsCategoryEnum.ContactInfoChange;

  const handleSubmit = async () => {
    const response = await approveVendorContactChangeMutation({
      variables: {
        vendor_change_request_id: partnerRequest.id,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Could not update vendor. Reason: ${response.msg}`);
    } else {
      snackbar.showSuccess(
        "Vendor change completed and email sent to the customer and partner"
      );
      handleClose();
    }
  };

  const companiesToBeAffected = requestData?.requested_vendor
    ?.company_vendor_partnerships_by_vendor
    ? requestData.requested_vendor.company_vendor_partnerships_by_vendor
    : [];

  const companyVendorPartnerships =
    requestData?.requested_vendor?.company_vendor_partnerships_by_vendor || [];

  const requestingCompanyId = requestData?.requesting_company?.id || "";
  const vendorPartnership = companyVendorPartnerships.find(
    (partnership) => partnership.company.id === requestingCompanyId
  );

  const changeContactPreviewData = useMemo(
    /*
      Please note that we switched from
        new_users -> active_user_ids
        delete_users -> inactive_users_ids
      as part of a paradigm shift away from deleting a db entry to setting a flag

      We are currently keeping both since there are open requests in prod with the old
      TODO(JR): cleanup once the old style requests are done
    */
    () =>
      ({
        vendorPartnershipId: vendorPartnership?.id || "",
        proposedUsersSelected:
          requestInfo?.new_users || requestInfo?.active_user_ids || [],
        proposedUsersUnselected:
          requestInfo?.delete_users || requestInfo?.inactive_user_ids || [],
      } as ChangeContactPreviewInformation),
    [
      vendorPartnership,
      requestInfo?.new_users,
      requestInfo?.delete_users,
      requestInfo?.active_user_ids,
      requestInfo?.inactive_user_ids,
    ]
  );

  return (
    <Modal
      dataCy={"triage-partnership-request-modal"}
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Triage Partnership Request"}
      primaryActionText={"Submit"}
      contentWidth={800}
      handleClose={handleClose}
      handlePrimaryAction={handleSubmit}
    >
      {isVendorEditContact && (
        <DialogContentText>
          Please review the following vendor contact change request. A customer
          requests to change their vendor contact. If the vendor company already
          exists, please be aware this change, once approved, will affect{" "}
          <strong>ALL</strong>
          customers.
        </DialogContentText>
      )}
      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Requesting User
        </Typography>
        <Typography variant={"body1"}>
          {partnerRequest.requesting_user.full_name}
        </Typography>
      </Box>
      <Box mb={4} mt={4}>
        <Divider />
      </Box>

      <Box display="flex" flexDirection="column" mt={4}>
        <Typography variant="subtitle2" color="textSecondary">
          Vendor
        </Typography>
        <Typography variant={"body1"}>
          {partnerRequest.requested_vendor.name}
        </Typography>
      </Box>
      {/* load the type of preview needed*/}
      <Box mb={4} mt={4}>
        <Divider />
      </Box>
      <Box>
        {isVendorEditContact ? (
          <VendorEditContactPreview previewData={editContactPreviewData} />
        ) : (
          <VendorContactChangePreview previewData={changeContactPreviewData} />
        )}
      </Box>
      {companiesToBeAffected.length > 1 && isVendorEditContact && (
        <Box display="flex" flexDirection="column">
          <Box mb={4} mt={4}>
            <Divider />
          </Box>
          <Typography variant={"body1"}>
            This vendor change will affect <strong>MULTIPLE</strong> companies.
            Please check that the change is correct as it will affect{" "}
            <strong>ALL</strong> companies listed below:
          </Typography>
          <List dense>
            {companiesToBeAffected.map((partner) => (
              <ListItem className={classes.listItem}>
                <ListItemText
                  primaryTypographyProps={{
                    className: classes.listItemText,
                  }}
                  primary={partner.company.name}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Modal>
  );
}
