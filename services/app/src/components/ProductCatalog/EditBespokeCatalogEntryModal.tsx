import { Box, DialogActions, DialogContent } from "@material-ui/core";
import AutocompleteSelectDropdown from "components/ProductCatalog/AutocompleteSelectDropdown";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import CardDivider from "components/Shared/Card/CardDivider";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import SelectDropdown from "components/Shared/FormInputs/SelectDropdown";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogSkusInsertInput,
  MetrcToBespokeCatalogSkuFragment,
  useGetBespokeCatalogSkusBySkuNameLazyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { updateMetrcToBespokeCatalogSkuMutation } from "lib/api/productCatalog";
import {
  MetrcToBespokeCatalogSkuConfidenceLabel,
  MetrcToBespokeCatalogSkuConfidenceLabels,
} from "lib/enum";
import { debounce } from "lodash";
import { useState } from "react";
import styled from "styled-components";

const StyledButtonContainer = styled.div`
  display: flex;
  margin: 32px;
  padding: 0px;
`;

interface Props {
  bespokeCatalogEntry: MetrcToBespokeCatalogSkuFragment;
  handleClose: () => void;
}

const EditBespokeCatalogEntryModal = ({
  bespokeCatalogEntry,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();

  const [skuConfidence, setSkuConfidence] = useState(
    bespokeCatalogEntry.sku_confidence.charAt(0).toUpperCase() +
      bespokeCatalogEntry.sku_confidence.slice(1)
  );
  // Only changing the mapping from:
  // metrc_to_bespoke_catalog_sku.bespoke_catalog_sku_id to bespoke_catalog_sku.id
  // Purpose of this bespokeCatalogSku state object is to properly render sku name in the autocomplete dropdown
  const [bespokeCatalogSku, setBespokeCatalogSku] =
    useState<BespokeCatalogSkusInsertInput>({
      id: bespokeCatalogEntry.bespoke_catalog_sku?.id || null,
      sku: bespokeCatalogEntry.bespoke_catalog_sku?.sku,
    });

  const [loadBespokeCatalogSkus, { data: bespokeCatalogSkuData }] =
    useGetBespokeCatalogSkusBySkuNameLazyQuery({
      fetchPolicy: "network-only",
    });
  const debouncedLoadBespokeCatalogSkus = debounce(
    loadBespokeCatalogSkus,
    1000
  );

  const [
    updateMetrcToBespokeCatalogSku,
    { loading: isUpdateMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(updateMetrcToBespokeCatalogSkuMutation);

  const handleClickSubmit = async () => {
    const response = await updateMetrcToBespokeCatalogSku({
      variables: {
        id: bespokeCatalogEntry.id,
        bespoke_catalog_sku_id:
          skuConfidence === MetrcToBespokeCatalogSkuConfidenceLabel.Invalid
            ? null
            : bespokeCatalogSku.id,
        sku_confidence: skuConfidence,
      },
    });
    if (response.status === "OK") {
      snackbar.showSuccess(
        `Successfully updated bespoke catalog entry for ${bespokeCatalogEntry.product_name}`
      );
      handleClose();
    } else {
      snackbar.showError(
        `Failed to create bespoke catalog entry: ${response.msg}`
      );
    }
  };

  const isSubmitDisabled =
    skuConfidence !== MetrcToBespokeCatalogSkuConfidenceLabel.Invalid &&
    !bespokeCatalogSku.id;

  return (
    <ModalDialog
      title="Edit Bespoke Catalog Entry"
      width="680px"
      maxWidth="md"
      handleClose={handleClose}
    >
      <DialogContent>
        <Text textVariant={TextVariants.ParagraphLead}>
          Bespoke Catalog Entry
        </Text>
        <Box mb={2}>
          <Text
            textVariant={TextVariants.SmallLabel}
            color={SecondaryTextColor}
          >
            Product Name
          </Text>
          <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
            {bespokeCatalogEntry.product_name}
          </Text>
          <CardDivider marginBottom="8px" />
        </Box>
        <Box mb={2}>
          <Text
            textVariant={TextVariants.SmallLabel}
            color={SecondaryTextColor}
          >
            Product Category Name
          </Text>
          <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
            {bespokeCatalogEntry.product_category_name}
          </Text>
          <CardDivider marginBottom="16px" />
        </Box>
        <Box mb={3}>
          <SelectDropdown
            value={skuConfidence}
            label="SKU Mapping Confidence"
            options={MetrcToBespokeCatalogSkuConfidenceLabels}
            id="sku-confidence-dropdown"
            setValue={(value) => setSkuConfidence(value)}
          />
        </Box>
        <Box>
          {skuConfidence !==
            MetrcToBespokeCatalogSkuConfidenceLabel.Invalid && (
            <AutocompleteSelectDropdown
              label="Bespoke Catalog Sku"
              getOptionLabel={(option) => {
                if (!!option.sku) {
                  return option.sku;
                } else if (typeof option === "string") {
                  return option;
                } else {
                  return "";
                }
              }}
              value={bespokeCatalogSku}
              renderOption={(option) => {
                return (
                  <Box>
                    <Text textVariant={TextVariants.Paragraph} bottomMargin={0}>
                      {option.sku}
                    </Text>
                    <Box display="flex">
                      <Text
                        textVariant={TextVariants.SmallLabel}
                        color={SecondaryTextColor}
                      >
                        {`${option.bespoke_catalog_sku_group.sku_group_name} | ${option.bespoke_catalog_sku_group.bespoke_catalog_brand.brand_name}`}
                      </Text>
                    </Box>
                  </Box>
                );
              }}
              selectableOptions={
                bespokeCatalogSkuData?.bespoke_catalog_skus || []
              }
              debouncedLoadOptions={debouncedLoadBespokeCatalogSkus}
              onChange={(_, value) => {
                if (!value) {
                  setBespokeCatalogSku({
                    id: "",
                    sku: "",
                  });
                  return;
                }
                if (!!value.id) {
                  setBespokeCatalogSku({
                    id: value.id,
                    sku: value.sku,
                  });
                }
              }}
            />
          )}
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

export default EditBespokeCatalogEntryModal;
