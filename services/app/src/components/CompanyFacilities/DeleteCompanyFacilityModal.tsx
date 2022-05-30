import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import {
  CompanyFacilities,
  useGetCompanyFacilityQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { deleteCompanyFacilityMutation } from "lib/api/companyFacilities";

interface Props {
  companyFacilityId: CompanyFacilities["id"];
  handleClose: () => void;
}

export default function DeleteCompanyFacilityModal({
  companyFacilityId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const { data, loading: isExistingCompanyFacilityLoading } =
    useGetCompanyFacilityQuery({
      fetchPolicy: "network-only",
      variables: {
        id: companyFacilityId,
      },
    });

  const companyFacility = data?.company_facilities_by_pk || null;

  const [deleteCompanyFacility, { loading: isDeleteCompanyFacilityLoading }] =
    useCustomMutation(deleteCompanyFacilityMutation);

  const handleClickSubmit = async () => {
    const response = await deleteCompanyFacility({
      variables: {
        company_facility_id: companyFacilityId,
      },
    });
    if (response.status !== "OK") {
      snackbar.showError(`Message: ${response.msg}`);
    } else {
      snackbar.showSuccess("Company facility deleted.");
      handleClose();
    }
  };

  const isDialogReady = !isExistingCompanyFacilityLoading;
  const isFormLoading =
    isExistingCompanyFacilityLoading || isDeleteCompanyFacilityLoading;
  const isSubmitDisabled = !isDialogReady || isFormLoading;

  if (!isDialogReady) {
    return null;
  }

  return (
    <Modal
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Delete Company Facility"}
      primaryActionText={"Confirm"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <>
        <Box mb={2}>
          <Typography variant={"h6"}>
            Are you sure you want to delete the following company facility? You
            CANNOT undo this action.
          </Typography>
        </Box>
        {!!companyFacility && (
          <>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Facility Name
              </Typography>
              <Typography variant={"body1"}>{companyFacility.name}</Typography>
            </Box>
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Facility Address
              </Typography>
              <Typography variant={"body1"}>
                {companyFacility.address}
              </Typography>
            </Box>
          </>
        )}
      </>
    </Modal>
  );
}
