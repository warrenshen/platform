import {
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import AutocompleteSelectDropdown from "components/ProductCatalog/AutocompleteSelectDropdown";
import { DEFAULT_AUTOCOMPLETE_MINIMUM_QUERY_LENGTH } from "components/ProductCatalog/constants";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import CardDivider from "components/Shared/Card/CardDivider";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogBrandsInsertInput,
  BespokeCatalogSkuGroupFragment,
  useGetBespokeCatalogBrandsByBrandNameLazyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createUpdateBespokeCatalogSkuGroupMutation } from "lib/api/productCatalog";
import { debounce } from "lodash";
import { useState } from "react";
import styled from "styled-components";

const StyledButtonContainer = styled.div`
  display: flex;
  margin: 32px;
  padding: 0px;
`;

interface Props {
  bespokeCatalogSkuGroup: BespokeCatalogSkuGroupFragment;
  handleClose: () => void;
}

const EditBespokeCatalogSkuGroupModal = ({
  bespokeCatalogSkuGroup,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();

  const [skuGroupName, setSkuGroupName] = useState<string>(
    bespokeCatalogSkuGroup.sku_group_name
  );
  // Only changing the mapping from:
  // bespoke_catalog_sku_group.bespoke_catalog_brand to bespoke_catalog_brand.id
  // Purpose of this bespokeCatalogBrand state object is to properly render brand name in the autocomplete dropdown
  const [bespokeCatalogBrand, setBespokeCatalogBrand] =
    useState<BespokeCatalogBrandsInsertInput>({
      id: bespokeCatalogSkuGroup.bespoke_catalog_brand?.id,
      brand_name: bespokeCatalogSkuGroup.bespoke_catalog_brand?.brand_name,
    });

  const [clearBrandData, setClearBrandData] = useState(false);

  const [
    loadBespokeCatalogBrands,
    {
      data: bespokeCatalogBrandData,
      loading: isGetBespokeCatalogBrandDataLoading,
    },
  ] = useGetBespokeCatalogBrandsByBrandNameLazyQuery({
    fetchPolicy: "network-only",
  });
  const debouncedLoadBespokeCatalogBrands = debounce(({ variables }) => {
    if (
      variables.search_prefix.length < DEFAULT_AUTOCOMPLETE_MINIMUM_QUERY_LENGTH
    ) {
      setClearBrandData(true);
      return;
    }
    setClearBrandData(false);
    loadBespokeCatalogBrands({ variables });
  }, 1000);

  const [
    updateBespokeCatalogSkuGroup,
    { loading: isUpdateMetrcToBespokeCatalogSkuGroupLoading },
  ] = useCustomMutation(createUpdateBespokeCatalogSkuGroupMutation);

  const handleClickSubmit = async () => {
    const response = await updateBespokeCatalogSkuGroup({
      variables: {
        id: bespokeCatalogSkuGroup.id,
        sku_group_name: skuGroupName,
        brand_id: bespokeCatalogBrand.id,
      },
    });
    if (response.status === "OK") {
      snackbar.showSuccess(
        `Successfully updated bespoke catalog SKU for ${bespokeCatalogSkuGroup.sku_group_name}`
      );
      handleClose();
    } else {
      snackbar.showError(
        `Failed to update bespoke catalog SKU: ${response.msg}`
      );
    }
  };

  const isSubmitDisabled = !skuGroupName || !bespokeCatalogBrand.id;

  console.log({ skuGroupName, bespokeCatalogBrand, bespokeCatalogSkuGroup });
  return (
    <ModalDialog
      title="Edit Bespoke Catalog SKU Group"
      width="680px"
      maxWidth="md"
      handleClose={handleClose}
    >
      <DialogContent>
        <Text textVariant={TextVariants.ParagraphLead}>
          Bespoke Catalog SKU Group
        </Text>
        <Box mb={2}>
          <FormControl fullWidth>
            <TextField
              value={skuGroupName}
              label={"SKU Group Name"}
              onChange={({ target: { value } }) => {
                setSkuGroupName(value);
              }}
            />
          </FormControl>
          <CardDivider marginBottom="16px" />
        </Box>
        <Box>
          <Box minHeight={16}>
            {isGetBespokeCatalogBrandDataLoading && <LinearProgress />}
          </Box>
          <AutocompleteSelectDropdown
            label="Bespoke Catalog Brand"
            getOptionLabel={(option) => {
              if (!!option.brand_name) {
                return option.brand_name;
              } else if (typeof option === "string") {
                return option;
              } else {
                return "";
              }
            }}
            value={bespokeCatalogBrand}
            renderOption={(option) => {
              return (
                <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
                  {option.brand_name}
                </Text>
              );
            }}
            selectableOptions={
              (!clearBrandData &&
                bespokeCatalogBrandData?.bespoke_catalog_brands) ||
              []
            }
            debouncedLoadOptions={debouncedLoadBespokeCatalogBrands}
            onChange={(_, value) => {
              if (!value) {
                setBespokeCatalogBrand({
                  id: "",
                  brand_name: "",
                });
                return;
              }
              if (!!value.id) {
                setBespokeCatalogBrand({
                  id: value.id,
                  brand_name: value.brand_name,
                });
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <StyledButtonContainer>
          <SecondaryButton text={"Cancel"} onClick={handleClose} />
          <PrimaryButton
            isDisabled={
              isSubmitDisabled || isUpdateMetrcToBespokeCatalogSkuGroupLoading
            }
            text={"Submit"}
            onClick={handleClickSubmit}
          />
        </StyledButtonContainer>
      </DialogActions>
    </ModalDialog>
  );
};

export default EditBespokeCatalogSkuGroupModal;
