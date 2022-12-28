import {
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import AutocompleteSelectDropdown from "components/BespokeCatalog/AutocompleteSelectDropdown";
import { DEFAULT_AUTOCOMPLETE_MINIMUM_QUERY_LENGTH } from "components/BespokeCatalog/constants";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogBrandFragment,
  ParentCompaniesInsertInput,
  useGetParentCompaniesByNameLazyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createUpdateBespokeCatalogBrandMutation } from "lib/api/bespokeCatalog";
import { debounce } from "lodash";
import { useState } from "react";
import styled from "styled-components";

const StyledButtonContainer = styled.div`
  display: flex;
  margin: 32px;
  padding: 0px;
`;

interface Props {
  bespokeCatalogBrand: BespokeCatalogBrandFragment;
  handleClose: () => void;
  refetchBrands: () => void;
}

const EditBespokeCatalogBrandModal = ({
  bespokeCatalogBrand,
  handleClose,
  refetchBrands,
}: Props) => {
  const snackbar = useSnackbar();

  const [brandName, setBrandName] = useState<string>(
    bespokeCatalogBrand.brand_name
  );
  const [parentCompany, setParentCompany] =
    useState<ParentCompaniesInsertInput>({
      id: bespokeCatalogBrand.parent_company?.id,
      name: bespokeCatalogBrand.parent_company?.name,
    });

  const [clearParentCompanyData, setClearParentCompanyData] = useState(false);

  const [
    loadParentCompanies,
    { data: parentCompaniesData, loading: isParentCompanyDataLoading },
  ] = useGetParentCompaniesByNameLazyQuery({
    fetchPolicy: "network-only",
  });
  const debouncedLoadParentCompanies = debounce(({ variables }) => {
    if (
      variables.search_prefix.length < DEFAULT_AUTOCOMPLETE_MINIMUM_QUERY_LENGTH
    ) {
      setClearParentCompanyData(true);
      return;
    }
    setClearParentCompanyData(false);
    loadParentCompanies({ variables });
  }, 1000);

  const [
    updateBespokeCatalogBrand,
    { loading: isUpdateMetrcToBespokeCatalogBrandLoading },
  ] = useCustomMutation(createUpdateBespokeCatalogBrandMutation);
  const handleClickSubmit = async () => {
    const response = await updateBespokeCatalogBrand({
      variables: {
        id: bespokeCatalogBrand.id,
        brand_name: brandName,
        parent_company_id: parentCompany.id,
      },
    });
    if (response.status === "OK") {
      snackbar.showSuccess(
        `Successfully updated bespoke catalog SKU for ${brandName}`
      );
      refetchBrands();
      handleClose();
    } else {
      snackbar.showError(
        `Failed to update bespoke catalog SKU: ${response.msg}`
      );
    }
  };

  const isSubmitDisabled = !brandName || !bespokeCatalogBrand.id;

  return (
    <ModalDialog
      title="Edit Bespoke Catalog Brand"
      width="680px"
      maxWidth="md"
      handleClose={handleClose}
    >
      <DialogContent>
        <Text textVariant={TextVariants.ParagraphLead}>
          Bespoke Catalog Brand
        </Text>
        <Box mb={2}>
          <FormControl fullWidth>
            <TextField
              value={brandName}
              label={"Brand Name"}
              onChange={({ target: { value } }) => {
                setBrandName(value);
              }}
            />
          </FormControl>
        </Box>
        <Box minHeight={16}>
          {isParentCompanyDataLoading && <LinearProgress />}
        </Box>
        <AutocompleteSelectDropdown
          label="Parent Company"
          getOptionLabel={(option) => {
            if (!!option.name) {
              return option.name;
            } else if (typeof option === "string") {
              return option;
            } else {
              return "";
            }
          }}
          value={parentCompany}
          selectableOptions={
            (!clearParentCompanyData &&
              parentCompaniesData?.parent_companies) ||
            []
          }
          debouncedLoadOptions={debouncedLoadParentCompanies}
          onChange={(_, value) => {
            if (!value) {
              setParentCompany({
                id: null,
                name: null,
              });
              return;
            }
            if (!!value.id) {
              setParentCompany({
                id: value.id,
                name: value.name,
              });
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <StyledButtonContainer>
          <SecondaryButton text={"Cancel"} onClick={handleClose} />
          <PrimaryButton
            isDisabled={
              isSubmitDisabled || isUpdateMetrcToBespokeCatalogBrandLoading
            }
            text={"Submit"}
            onClick={handleClickSubmit}
          />
        </StyledButtonContainer>
      </DialogActions>
    </ModalDialog>
  );
};

export default EditBespokeCatalogBrandModal;
