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
import { calculateBrand } from "components/ProductCatalog/utils";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import CardDivider from "components/Shared/Card/CardDivider";
import { SecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import SelectDropdown from "components/Shared/FormInputs/SelectDropdown";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogBrandsInsertInput,
  BespokeCatalogSkuGroupsInsertInput,
  BespokeCatalogSkusInsertInput,
  Maybe,
  MetrcToBespokeCatalogSkusInsertInput,
  useGetBespokeCatalogBrandsByBrandNameLazyQuery,
  useGetBespokeCatalogSkuGroupsBySkuGroupNameLazyQuery,
  useGetBespokeCatalogSkusBySkuNameLazyQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { CustomCheckboxChecked, CustomCheckboxUnchecked } from "icons";
import { createUpdateMetrcToBespokeCatalogSkuMutation } from "lib/api/productCatalog";
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
  productName: string | Maybe<string> | undefined;
  productCategoryName: string | Maybe<string> | undefined;
  matchedProductNames: Set<string>;
  handleClose: () => void;
  setMatchedProductNames: (matchedProductNames: Set<string>) => void;
}

const CreateUpdateBespokeCatalogEntryCompleteModal = ({
  productName,
  productCategoryName,
  matchedProductNames,
  handleClose,
  setMatchedProductNames,
}: Props) => {
  const snackbar = useSnackbar();

  const [loadBespokeCatalogSkus, { data: bespokeCatalogSkuData }] =
    useGetBespokeCatalogSkusBySkuNameLazyQuery({
      fetchPolicy: "network-only",
    });
  const [loadBespokeCatalogSkuGroups, { data: bespokeCatalogSkuGroupData }] =
    useGetBespokeCatalogSkuGroupsBySkuGroupNameLazyQuery({
      fetchPolicy: "network-only",
    });
  const [loadBespokeCatalogBrands, { data: bespokeCatalogBrandData }] =
    useGetBespokeCatalogBrandsByBrandNameLazyQuery({
      fetchPolicy: "network-only",
    });

  const debouncedLoadBespokeCatalogSkus = debounce(
    loadBespokeCatalogSkus,
    1000
  );
  const debouncedLoadBespokeCatalogSkuGroups = debounce(
    loadBespokeCatalogSkuGroups,
    1000
  );
  const debouncedLoadBespokeCatalogBrands = debounce(
    loadBespokeCatalogBrands,
    1000
  );

  const defaultBespokeCatalogEntry: MetrcToBespokeCatalogSkusInsertInput = {
    id: null,
    product_name: productName,
    product_category_name: productCategoryName,
    sku_confidence: MetrcToBespokeCatalogSkuConfidenceLabel.High,
    bespoke_catalog_sku_id: null,
  };

  const defaultBespokeCatalogSku: BespokeCatalogSkusInsertInput = {
    id: null,
    sku: "",
    bespoke_catalog_sku_group_id: null,
  };

  const defaultBespokeCatalogSkuGroup: BespokeCatalogSkuGroupsInsertInput = {
    id: null,
    sku_group_name: "",
    bespoke_catalog_brand_id: null,
  };

  const defaultBespokeCatalogBrand: BespokeCatalogBrandsInsertInput = {
    id: null,
    brand_name: "",
  };

  const [bespokeCatalogEntry, setBespokeCatalogEntry] =
    useState<MetrcToBespokeCatalogSkusInsertInput>(defaultBespokeCatalogEntry);

  const [bespokeCatalogSku, setBespokeCatalogSku] =
    useState<BespokeCatalogSkusInsertInput>(defaultBespokeCatalogSku);

  const [bespokeCatalogSkuGroup, setBespokeCatalogSkuGroup] =
    useState<BespokeCatalogSkuGroupsInsertInput>(defaultBespokeCatalogSkuGroup);

  const [bespokeCatalogBrand, setBespokeCatalogBrand] =
    useState<BespokeCatalogBrandsInsertInput>(defaultBespokeCatalogBrand);

  const [isAddNewSkuChecked, setIsAddNewSkuChecked] = useState<boolean>(false);
  const [isAddNewSkuGroupChecked, setIsAddNewSkuGroupChecked] =
    useState<boolean>(false);
  const [isAddNewBrandChecked, setIsAddNewBrandChecked] =
    useState<boolean>(false);

  const [
    createUpdateMetrcToBespokeCatalogSku,
    { loading: isCreateUpdateMetrcToBespokeCatalogSkuLoading },
  ] = useCustomMutation(createUpdateMetrcToBespokeCatalogSkuMutation);

  const handleClickSubmit = async () => {
    const response = await createUpdateMetrcToBespokeCatalogSku({
      variables: {
        ...bespokeCatalogEntry,
        sku_confidence: bespokeCatalogEntry.sku_confidence,
        bespoke_catalog_sku: {
          bespoke_catalog_sku_group_id: null,
          ...bespokeCatalogSku,
          bespoke_catalog_sku_group: {
            bespoke_catalog_brand_id: null,
            ...bespokeCatalogSkuGroup,
            bespoke_catalog_brand: bespokeCatalogBrand,
          },
        },
      },
    });

    if (response.status === "OK") {
      const newMatchedProductNames = new Set<string>(matchedProductNames);
      newMatchedProductNames.add(productName as string);
      setMatchedProductNames(newMatchedProductNames);
      snackbar.showSuccess(
        `Successfully created bespoke catalog entry for ${productName}`
      );
      handleClose();
    } else {
      snackbar.showError(
        `Failed to create bespoke catalog entry: ${response.msg}`
      );
    }
  };

  const isBrandValid =
    !!bespokeCatalogSkuGroup.bespoke_catalog_brand_id ||
    !!bespokeCatalogBrand.brand_name;
  const isSkuGroupValid =
    !!bespokeCatalogSku.bespoke_catalog_sku_group_id ||
    (!!bespokeCatalogSkuGroup.sku_group_name && isBrandValid);
  const isSkuValid =
    !!bespokeCatalogEntry.bespoke_catalog_sku_id ||
    (!!bespokeCatalogSku.sku && isSkuGroupValid);

  const isSubmitDisabled =
    !isSkuValid &&
    bespokeCatalogEntry.sku_confidence !==
      MetrcToBespokeCatalogSkuConfidenceLabel.Invalid;

  return (
    <ModalDialog
      title="Create Bespoke Catalog Entry"
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
            {bespokeCatalogEntry.product_name as string}
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
            {bespokeCatalogEntry.product_category_name as string}
          </Text>
          <CardDivider marginBottom="16px" />
        </Box>
        <Box mb={3}>
          <SelectDropdown
            value={bespokeCatalogEntry.sku_confidence}
            label="SKU Mapping Confidence"
            options={MetrcToBespokeCatalogSkuConfidenceLabels}
            id="sku-confidence-dropdown"
            setValue={(value) =>
              setBespokeCatalogEntry({
                ...bespokeCatalogEntry,
                sku_confidence: value,
              })
            }
          />
        </Box>
        {bespokeCatalogEntry.sku_confidence !==
          MetrcToBespokeCatalogSkuConfidenceLabel.Invalid && (
          <>
            {!isAddNewSkuChecked &&
              !bespokeCatalogEntry.bespoke_catalog_sku_id && (
                <Text textVariant={TextVariants.Paragraph}>
                  Two options to add a SKU to this catalog entry
                </Text>
              )}
            {!isAddNewSkuChecked && (
              <Box mb={2}>
                <Text
                  textVariant={TextVariants.Paragraph}
                  color={SecondaryTextColor}
                >
                  Option 1: Search for an existing SKU
                </Text>
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
                    bespokeCatalogSkuData?.bespoke_catalog_skus || []
                  }
                  debouncedLoadOptions={debouncedLoadBespokeCatalogSkus}
                  onChange={(_, value) => {
                    if (!value) {
                      setBespokeCatalogEntry({
                        ...bespokeCatalogEntry,
                        bespoke_catalog_sku_id: null,
                      });
                      return;
                    }
                    if (!!value.id) {
                      setBespokeCatalogEntry({
                        ...bespokeCatalogEntry,
                        bespoke_catalog_sku_id: value.id,
                      });
                    }
                  }}
                />
              </Box>
            )}
            {!isAddNewSkuChecked &&
              !bespokeCatalogEntry.bespoke_catalog_sku_id && (
                <Text
                  textVariant={TextVariants.Paragraph}
                  color={SecondaryTextColor}
                  isBold
                  bottomMargin={8}
                >
                  OR
                </Text>
              )}
            {!bespokeCatalogEntry.bespoke_catalog_sku_id && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAddNewSkuChecked}
                    onChange={(event) => {
                      setIsAddNewSkuChecked(event.target.checked);
                      if (event.target.checked) {
                        setBespokeCatalogSku({
                          ...bespokeCatalogSku,
                          sku: productName,
                        });
                      } else {
                        setBespokeCatalogSku({
                          ...bespokeCatalogSku,
                          sku: "",
                        });
                      }
                    }}
                    color="primary"
                    icon={<CustomCheckboxUnchecked />}
                    checkedIcon={<CustomCheckboxChecked />}
                  />
                }
                label={"Option 2: Submit a new SKU that does not exist"}
                style={{ color: SecondaryTextColor }}
              />
            )}
            {/* Add new SKU form section */}
            {isAddNewSkuChecked && (
              <>
                <CardDivider marginBottom="36px" />
                <Box mb={2}>
                  <FormControl fullWidth>
                    <TextField
                      value={bespokeCatalogSku.sku}
                      label={"Sku Name"}
                      onChange={({ target: { value } }) => {
                        setBespokeCatalogSku({
                          ...bespokeCatalogSku,
                          sku: value,
                        });
                      }}
                    />
                  </FormControl>
                </Box>
                {!isAddNewSkuGroupChecked &&
                  !bespokeCatalogSku.bespoke_catalog_sku_group_id && (
                    <Text textVariant={TextVariants.Paragraph}>
                      Two options to add a SKU group to this SKU
                    </Text>
                  )}
                {!isAddNewSkuGroupChecked && (
                  <Box mb={2}>
                    <Text
                      textVariant={TextVariants.Paragraph}
                      color={SecondaryTextColor}
                    >
                      Option 1: Search for an existing SKU Group
                    </Text>
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
                      renderOption={(option) => {
                        return (
                          <Box>
                            <Text
                              textVariant={TextVariants.Paragraph}
                              bottomMargin={0}
                            >
                              {option.sku_group_name}
                            </Text>
                            <Box display="flex">
                              <Text
                                textVariant={TextVariants.SmallLabel}
                                color={SecondaryTextColor}
                              >
                                {option.bespoke_catalog_brand.brand_name}
                              </Text>
                            </Box>
                          </Box>
                        );
                      }}
                      selectableOptions={
                        bespokeCatalogSkuGroupData?.bespoke_catalog_sku_groups ||
                        []
                      }
                      debouncedLoadOptions={
                        debouncedLoadBespokeCatalogSkuGroups
                      }
                      onChange={(_, value) => {
                        if (!value) {
                          setBespokeCatalogSku({
                            ...bespokeCatalogSku,
                            bespoke_catalog_sku_group_id: null,
                          });
                          return;
                        }
                        if (!!value.id) {
                          setBespokeCatalogSku({
                            ...bespokeCatalogSku,
                            bespoke_catalog_sku_group_id: value.id,
                          });
                        }
                      }}
                    />
                  </Box>
                )}
                {!isAddNewSkuGroupChecked &&
                  !bespokeCatalogSku.bespoke_catalog_sku_group_id && (
                    <Text
                      textVariant={TextVariants.Paragraph}
                      color={SecondaryTextColor}
                      isBold
                      bottomMargin={8}
                    >
                      OR
                    </Text>
                  )}
                {!bespokeCatalogSku.bespoke_catalog_sku_group_id && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAddNewSkuGroupChecked}
                        onChange={(event) => {
                          setIsAddNewSkuGroupChecked(event.target.checked);
                          if (event.target.checked) {
                            setBespokeCatalogSkuGroup({
                              ...bespokeCatalogSkuGroup,
                              sku_group_name: productName,
                            });
                          } else {
                            setBespokeCatalogSkuGroup({
                              ...bespokeCatalogSkuGroup,
                              sku_group_name: "",
                            });
                          }
                        }}
                        color="primary"
                        icon={<CustomCheckboxUnchecked />}
                        checkedIcon={<CustomCheckboxChecked />}
                      />
                    }
                    label={
                      "Option 2: Submit a new SKU Group that does not exist"
                    }
                    style={{ color: SecondaryTextColor }}
                  />
                )}
                {/* Add new SKU group form section */}
                {isAddNewSkuGroupChecked && (
                  <>
                    <CardDivider marginBottom="36px" />
                    <Box mb={2}>
                      <FormControl fullWidth>
                        <TextField
                          value={bespokeCatalogSkuGroup.sku_group_name}
                          label={"Sku Group Name"}
                          onChange={({ target: { value } }) => {
                            setBespokeCatalogSkuGroup({
                              ...bespokeCatalogSku,
                              sku_group_name: value,
                            });
                          }}
                        />
                      </FormControl>
                    </Box>
                    {!isAddNewBrandChecked &&
                      !bespokeCatalogSkuGroup.bespoke_catalog_brand_id && (
                        <Text textVariant={TextVariants.Paragraph}>
                          Two options to add a Brand to this SKU Group
                        </Text>
                      )}
                    {!isAddNewBrandChecked && (
                      <Box mb={2}>
                        <Text
                          textVariant={TextVariants.Paragraph}
                          color={SecondaryTextColor}
                        >
                          Option 1: Search for an existing Brand
                        </Text>
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
                          selectableOptions={
                            bespokeCatalogBrandData?.bespoke_catalog_brands ||
                            []
                          }
                          debouncedLoadOptions={
                            debouncedLoadBespokeCatalogBrands
                          }
                          onChange={(_, value) => {
                            if (!value) {
                              setBespokeCatalogSkuGroup({
                                ...bespokeCatalogSkuGroup,
                                bespoke_catalog_brand_id: null,
                              });
                              return;
                            }
                            if (!!value.id) {
                              setBespokeCatalogSkuGroup({
                                ...bespokeCatalogSkuGroup,
                                bespoke_catalog_brand_id: value.id,
                              });
                            }
                          }}
                        />
                      </Box>
                    )}
                    {!isAddNewSkuGroupChecked &&
                      !bespokeCatalogSkuGroup.bespoke_catalog_brand_id && (
                        <Text
                          textVariant={TextVariants.Paragraph}
                          color={SecondaryTextColor}
                          isBold
                          bottomMargin={8}
                        >
                          OR
                        </Text>
                      )}
                    {!bespokeCatalogSkuGroup.bespoke_catalog_brand_id && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isAddNewBrandChecked}
                            onChange={(event) => {
                              setIsAddNewBrandChecked(event.target.checked);
                              if (event.target.checked) {
                                setBespokeCatalogBrand({
                                  ...bespokeCatalogBrand,
                                  brand_name: calculateBrand(
                                    productName as string
                                  ),
                                });
                              } else {
                                setBespokeCatalogBrand({
                                  ...bespokeCatalogBrand,
                                  brand_name: "",
                                });
                              }
                            }}
                            color="primary"
                            icon={<CustomCheckboxUnchecked />}
                            checkedIcon={<CustomCheckboxChecked />}
                          />
                        }
                        label={
                          "Option 2: Submit a new Brand that does not exist"
                        }
                        style={{ color: SecondaryTextColor }}
                      />
                    )}
                    {/* Add new Brand form section */}
                    {isAddNewBrandChecked && (
                      <>
                        <CardDivider marginBottom="36px" />
                        <Box mb={2}>
                          <FormControl fullWidth>
                            <TextField
                              value={bespokeCatalogBrand.brand_name}
                              label={"Brand Name"}
                              onChange={({ target: { value } }) => {
                                setBespokeCatalogBrand({
                                  ...bespokeCatalogBrand,
                                  brand_name: value,
                                });
                              }}
                            />
                          </FormControl>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <StyledButtonContainer>
          <SecondaryButton text={"Cancel"} onClick={handleClose} />
          <PrimaryButton
            isDisabled={
              isSubmitDisabled || isCreateUpdateMetrcToBespokeCatalogSkuLoading
            }
            text={"Submit"}
            onClick={handleClickSubmit}
          />
        </StyledButtonContainer>
      </DialogActions>
    </ModalDialog>
  );
};

export default CreateUpdateBespokeCatalogEntryCompleteModal;
