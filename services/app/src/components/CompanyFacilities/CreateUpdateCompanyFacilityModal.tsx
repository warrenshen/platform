import { Box, FormControl, TextField } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import {
  Companies,
  CompanyFacilities,
  CompanyFacilitiesInsertInput,
  useGetCompanyFacilityQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createUpdateCompanyFacilityMutation } from "lib/api/companyFacilities";
import { ActionType } from "lib/enum";
import { isNull, mergeWith } from "lodash";
import { useState } from "react";

interface Props {
  actionType: ActionType;
  companyId: Companies["id"];
  companyFacilityId: CompanyFacilities["id"] | null;
  handleClose: () => void;
}

export default function CreateUpdateCompanyFacilityModal({
  actionType,
  companyId,
  companyFacilityId,
  handleClose,
}: Props) {
  const snackbar = useSnackbar();

  const isActionTypeUpdate = actionType === ActionType.Update;

  // Default CompanyFacility for CREATE case.
  const newCompanyFacility: CompanyFacilitiesInsertInput = {
    company_id: companyId,
    name: "",
    address: "",
  };

  const [companyFacility, setCompanyFacility] = useState(newCompanyFacility);

  const {
    loading: isGetCompanyFacilityLoading,
    error: getCompanyFacilityError,
  } = useGetCompanyFacilityQuery({
    skip: actionType === ActionType.New,
    fetchPolicy: "network-only",
    variables: {
      id: companyFacilityId,
    },
    onCompleted: (data) => {
      const existingCompanyFacility = data?.company_facilities_by_pk;
      if (isActionTypeUpdate && existingCompanyFacility) {
        setCompanyFacility(
          mergeWith(newCompanyFacility, existingCompanyFacility, (a, b) =>
            isNull(b) ? a : b
          )
        );
      }
    },
  });

  if (getCompanyFacilityError) {
    alert(`Error in query: ${getCompanyFacilityError.message}`);
    console.error({ error: getCompanyFacilityError });
  }

  const [
    createUpdateCompanyFacility,
    { loading: isCreateUpdateCompanyFacility },
  ] = useCustomMutation(createUpdateCompanyFacilityMutation);

  const handleClickSubmit = async () => {
    const response = await createUpdateCompanyFacility({
      variables: {
        id: isActionTypeUpdate ? companyFacilityId : null,
        company_id: companyFacility.company_id,
        name: companyFacility.name,
        address: companyFacility.address,
      },
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not save company facility. Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess(`Company facility saved successfully.`);
      handleClose();
    }
  };

  const isFormLoading =
    isGetCompanyFacilityLoading || isCreateUpdateCompanyFacility;

  return (
    <Modal
      dataCy={"update-debt-facility-capacity-modal"}
      isPrimaryActionDisabled={isFormLoading}
      title={
        isActionTypeUpdate
          ? "Update Company Facility"
          : "Create Company Facility"
      }
      contentWidth={600}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickSubmit}
    >
      <Box display="flex" flexDirection="column" mt={2}>
        <FormControl>
          <TextField
            autoFocus
            required
            label={"Facility Name"}
            value={companyFacility.name}
            onChange={({ target: { value } }) =>
              setCompanyFacility({
                ...companyFacility,
                name: value,
              })
            }
          />
        </FormControl>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <FormControl>
          <TextField
            label={"Facility Address"}
            value={companyFacility.address}
            onChange={({ target: { value } }) =>
              setCompanyFacility({
                ...companyFacility,
                address: value,
              })
            }
          />
        </FormControl>
      </Box>
    </Modal>
  );
}
