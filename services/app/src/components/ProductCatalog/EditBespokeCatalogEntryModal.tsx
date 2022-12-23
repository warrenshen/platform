import {
  Box,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  TextField,
} from "@material-ui/core";
import AutocompleteSelectDropdown from "components/ProductCatalog/AutocompleteSelectDropdown";
import { DEFAULT_AUTOCOMPLETE_MINIMUM_QUERY_LENGTH } from "components/ProductCatalog/constants";
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
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
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

  const [isSample, setIsSample] = useState(bespokeCatalogEntry.is_sample);
  const [skuConfidence, setSkuConfidence] = useState(
    bespokeCatalogEntry.sku_confidence.charAt(0).toUpperCase() +
      bespokeCatalogEntry.sku_confidence.slice(1)
  );
  const [wholesaleQuantity, setWholesaleQuantity] = useState(
    bespokeCatalogEntry.wholesale_quantity
  );
  // Only changing the mapping from:
  // metrc_to_bespoke_catalog_sku.bespoke_catalog_sku_id to bespoke_catalog_sku.id
  // Purpose of this bespokeCatalogSku state object is to properly render sku name in the autocomplete dropdown
  const [bespokeCatalogSku, setBespokeCatalogSku] =
    useState<BespokeCatalogSkusInsertInput>({
      id: bespokeCatalogEntry.bespoke_catalog_sku?.id || null,
      sku: bespokeCatalogEntry.bespoke_catalog_sku?.sku,
    });

  const [clearSkuData, setClearSkuData] = useState(false);

  const [loadBespokeCatalogSkus, { data: bespokeCatalogSkuData }] =
    useGetBespokeCatalogSkusBySkuNameLazyQuery({
      fetchPolicy: "network-only",
    });
  const debouncedLoadBespokeCatalogSkus = debounce(({ variables }) => {
    if (
      variables.search_prefix.length < DEFAULT_AUTOCOMPLETE_MINIMUM_QUERY_LENGTH
    ) {
      setClearSkuData(true);
      return;
    }
    setClearSkuData(false);
    loadBespokeCatalogSkus({ variables });
  }, 1000);

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
        wholesale_quantity: wholesaleQuantity,
        sku_confidence: skuConfidence,
        is_sample: isSample,
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
    !isSample &&
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
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSample}
                onChange={(event) => {
                  setIsSample(event.target.checked);
                }}
                color="primary"
                icon={<CustomCheckboxUnchecked />}
                checkedIcon={<CustomCheckboxChecked />}
              />
            }
            label={"Is this product a sample?"}
          />
        </Box>
        <Box mb={2}>
          <SelectDropdown
            value={skuConfidence}
            label="SKU Mapping Confidence"
            options={MetrcToBespokeCatalogSkuConfidenceLabels}
            id="sku-confidence-dropdown"
            setValue={(value) => setSkuConfidence(value)}
          />
        </Box>
        <Box>
          {skuConfidence !== MetrcToBespokeCatalogSkuConfidenceLabel.Invalid &&
            !isSample && (
              <>
                <Box mb={3}>
                  <FormControl fullWidth>
                    <TextField
                      value={wholesaleQuantity}
                      label={"Wholesale Quantity"}
                      type={"number"}
                      onChange={({ target: { value } }) => {
                        setWholesaleQuantity(value ? Number(value) : null);
                      }}
                    />
                  </FormControl>
                </Box>
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
                        <Text
                          textVariant={TextVariants.Paragraph}
                          bottomMargin={0}
                        >
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
                    (!clearSkuData &&
                      bespokeCatalogSkuData?.bespoke_catalog_skus) ||
                    []
                  }
                  debouncedLoadOptions={debouncedLoadBespokeCatalogSkus}
                  onChange={(_, value) => {
                    if (!value) {
                      setBespokeCatalogSku({
                        id: null,
                        sku: null,
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
              </>
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
