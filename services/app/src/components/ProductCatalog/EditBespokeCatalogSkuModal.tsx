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
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogSkuFragment,
  BespokeCatalogSkuGroupsInsertInput,
  useGetBespokeCatalogSkuGroupsBySkuGroupNameLazyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createUpdateBespokeCatalogSkuMutation } from "lib/api/productCatalog";
import { debounce } from "lodash";
import { useState } from "react";
import styled from "styled-components";

const StyledButtonContainer = styled.div`
  display: flex;
  margin: 32px;
  padding: 0px;
`;

interface Props {
  bespokeCatalogSku: BespokeCatalogSkuFragment;
  handleClose: () => void;
}

const EditBespokeCatalogSkuModal = ({
  bespokeCatalogSku,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();

  const [sku, setSku] = useState<string>(bespokeCatalogSku.sku);
  // Only changing the mapping from:
  // bespoke_catalog_sku.bespoke_catalo_sku_group_id to bespoke_catalog_sku_group.id
  // Purpose of this bespokeCatalogSkuGroup state object is to properly render sku name in the autocomplete dropdown
  const [bespokeCatalogSkuGroup, setBespokeCatalogSkuGroup] =
    useState<BespokeCatalogSkuGroupsInsertInput>({
      id: bespokeCatalogSku.bespoke_catalog_sku_group?.id,
      sku_group_name:
        bespokeCatalogSku.bespoke_catalog_sku_group?.sku_group_name,
    });

  const [clearSkuGroupData, setClearSkuGroupData] = useState(false);

  const [
    loadBespokeCatalogSkuGroups,
    {
      data: bespokeCatalogSkuGroupData,
      loading: isGetBespokeCatalogGroupDataLoading,
    },
  ] = useGetBespokeCatalogSkuGroupsBySkuGroupNameLazyQuery({
    fetchPolicy: "network-only",
  });
  const debouncedLoadBespokeCatalogSkuGroups = debounce(({ variables }) => {
    if (
      variables.search_prefix.length < DEFAULT_AUTOCOMPLETE_MINIMUM_QUERY_LENGTH
    ) {
      setClearSkuGroupData(true);
      return;
    }
    setClearSkuGroupData(false);
    loadBespokeCatalogSkuGroups({ variables });
  }, 1000);

  const [
    updateBespokeCatalogSku,
    { loading: isUpdateMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(createUpdateBespokeCatalogSkuMutation);

  const handleClickSubmit = async () => {
    const response = await updateBespokeCatalogSku({
      variables: {
        id: bespokeCatalogSku.id,
        sku,
        sku_group_id: bespokeCatalogSkuGroup.id,
      },
    });
    if (response.status === "OK") {
      snackbar.showSuccess(
        `Successfully updated bespoke catalog SKU for ${bespokeCatalogSku.sku}`
      );
      handleClose();
    } else {
      snackbar.showError(
        `Failed to update bespoke catalog SKU: ${response.msg}`
      );
    }
  };

  const isSubmitDisabled = !sku || !bespokeCatalogSkuGroup.id;

  return (
    <ModalDialog
      title="Edit Bespoke Catalog SKU"
      width="680px"
      maxWidth="md"
      handleClose={handleClose}
    >
      <DialogContent>
        <Text textVariant={TextVariants.ParagraphLead}>
          Bespoke Catalog Sku
        </Text>
        <Box mb={2}>
          <FormControl fullWidth>
            <TextField
              value={sku}
              label={"SKU Name"}
              onChange={({ target: { value } }) => {
                setSku(value);
              }}
            />
          </FormControl>
          <CardDivider marginBottom="16px" />
        </Box>
        <Box>
          <Box minHeight={16}>
            {isGetBespokeCatalogGroupDataLoading && <LinearProgress />}
          </Box>
          <AutocompleteSelectDropdown
            label="Bespoke Catalog SKU Group"
            getOptionLabel={(option) => {
              if (!!option.sku_group_name) {
                return option.sku_group_name;
              } else if (typeof option === "string") {
                return option;
              } else {
                return "";
              }
            }}
            value={bespokeCatalogSkuGroup}
            renderOption={(option) => {
              return (
                <Box>
                  <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
                    {option.sku_group_name}
                  </Text>
                  <Text
                    textVariant={TextVariants.SmallLabel}
                    color={SecondaryTextColor}
                  >
                    {option.bespoke_catalog_brand.brand_name}
                  </Text>
                </Box>
              );
            }}
            selectableOptions={
              (!clearSkuGroupData &&
                bespokeCatalogSkuGroupData?.bespoke_catalog_sku_groups) ||
              []
            }
            debouncedLoadOptions={debouncedLoadBespokeCatalogSkuGroups}
            onChange={(_, value) => {
              if (!value) {
                setBespokeCatalogSkuGroup({
                  id: "",
                  sku_group_name: "",
                });
                return;
              }
              if (!!value.id) {
                setBespokeCatalogSkuGroup({
                  id: value.id,
                  sku_group_name: value.sku_group_name,
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
              isSubmitDisabled || isUpdateMetrcToBespokeCatalogSkuLoading
            }
            text={"Submit"}
            onClick={handleClickSubmit}
          />
        </StyledButtonContainer>
      </DialogActions>
    </ModalDialog>
  );
};

export default EditBespokeCatalogSkuModal;
