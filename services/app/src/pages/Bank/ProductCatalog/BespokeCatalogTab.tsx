import { Box } from "@material-ui/core";
import BespokeCatalogBrandsDataGrid from "components/ProductCatalog/BespokeCatalogBrandsDataGrid";
import BespokeCatalogSkuGroupsDataGrid from "components/ProductCatalog/BespokeCatalogSkuGroupsDataGrid";
import BespokeCatalogSkusDataGrid from "components/ProductCatalog/BespokeCatalogSkusDataGrid";
import EditBespokeCatalogBrandModal from "components/ProductCatalog/EditBespokeCatalogBrandModal";
import EditBespokeCatalogSkuGroupModal from "components/ProductCatalog/EditBespokeCatalogSkuGroupModal";
import EditBespokeCatalogSkuModal from "components/ProductCatalog/EditBespokeCatalogSkuModal";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import PrimaryWarningButton from "components/Shared/Button/PrimaryWarningButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  BespokeCatalogBrandFragment,
  BespokeCatalogSkuFragment,
  BespokeCatalogSkuGroupFragment,
  useGetBespokeCatalogBrandsQuery,
  useGetBespokeCatalogSkuGroupsQuery,
  useGetBespokeCatalogSkusQuery,
} from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import {
  deleteBespokeCatalogBrandMutation,
  deleteBespokeCatalogSkuGroupMutation,
  deleteBespokeCatalogSkuMutation,
} from "lib/api/productCatalog";
import { Action } from "lib/auth/rbac-rules";
import { useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  margin-top: 36px;
`;

const BespokeCatalogTab = () => {
  const snackbar = useSnackbar();
  const { data: dataSkus, refetch: refetchSkus } =
    useGetBespokeCatalogSkusQuery();
  const { data: dataSkuGroups, refetch: refetchSkuGroups } =
    useGetBespokeCatalogSkuGroupsQuery();
  const { data: dataBrands, refetch: refetchBrands } =
    useGetBespokeCatalogBrandsQuery();
  const skus = useMemo(() => dataSkus?.bespoke_catalog_skus || [], [dataSkus]);
  const skuGroups = useMemo(
    () => dataSkuGroups?.bespoke_catalog_sku_groups || [],
    [dataSkuGroups]
  );
  const brands = useMemo(
    () => dataBrands?.bespoke_catalog_brands || [],
    [dataBrands]
  );

  // SKUs
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>([]);
  const [isEditSkuModalOpen, setIsEditSkuModalOpen] = useState<boolean>(false);
  const handleSelectSkus = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedSkuIds(selectedRowKeys);
      },
    [setSelectedSkuIds]
  );
  const selectedSku = useMemo(
    () =>
      selectedSkuIds.length === 1
        ? skus.find(
            (sku: BespokeCatalogSkuFragment) => sku.id === selectedSkuIds[0]
          )
        : null,
    [selectedSkuIds, skus]
  );
  const [
    deleteBespokeCatalogSku,
    { loading: isDeleteBespokeCatalogSkuLoading },
  ] = useCustomMutation(deleteBespokeCatalogSkuMutation);
  const handleClickDeleteSku = async () => {
    const response = await deleteBespokeCatalogSku({
      variables: {
        id: selectedSku?.id,
      },
    });
    if (response.status === "OK") {
      snackbar.showSuccess(
        `Successfully deleted bespoke catalog SKU: ${selectedSku?.sku}`
      );
      setSelectedSkuIds([]);
    } else {
      snackbar.showError(
        `Failed to delete bespoke catalog SKU: ${response.msg}`
      );
    }
  };

  // SKU Groups
  const [selectedSkuGroupIds, setSelectedSkuGroupIds] = useState<string[]>([]);
  const [isEditSkuGroupModalOpen, setIsEditSkuGroupModalOpen] =
    useState<boolean>(false);
  const handleSelectSkuGroups = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedSkuGroupIds(selectedRowKeys);
      },
    [setSelectedSkuGroupIds]
  );
  const selectedSkuGroup = useMemo(
    () =>
      selectedSkuGroupIds.length === 1
        ? skuGroups.find(
            (skuGroup: BespokeCatalogSkuGroupFragment) =>
              skuGroup.id === selectedSkuGroupIds[0]
          )
        : null,
    [selectedSkuGroupIds, skuGroups]
  );
  const [
    deleteBespokeCatalogSkuGroup,
    { loading: isDeleteBespokeCatalogSkuGroupLoading },
  ] = useCustomMutation(deleteBespokeCatalogSkuGroupMutation);
  const handleClickDeleteSkuGroup = async () => {
    const response = await deleteBespokeCatalogSkuGroup({
      variables: {
        id: selectedSkuGroup?.id,
      },
    });
    if (response.status === "OK") {
      snackbar.showSuccess(
        `Successfully deleted bespoke catalog SKU Group: ${selectedSkuGroup?.sku_group_name}`
      );
      setSelectedSkuIds([]);
    } else {
      snackbar.showError(
        `Failed to delete bespoke catalog SKU Group: ${response.msg}`
      );
    }
  };

  // Brands
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [isEditBrandModalOpen, setIsEditBrandModalOpen] =
    useState<boolean>(false);
  const handleSelectBrands = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedBrandIds(selectedRowKeys);
      },
    [setSelectedBrandIds]
  );
  const selectedBrand = useMemo(
    () =>
      selectedBrandIds.length === 1
        ? brands.find(
            (brands: BespokeCatalogBrandFragment) =>
              brands.id === selectedBrandIds[0]
          )
        : null,
    [selectedBrandIds, brands]
  );
  const [
    deleteBespokeCatalogBrand,
    { loading: isDeleteBespokeCatalogBrandLoading },
  ] = useCustomMutation(deleteBespokeCatalogBrandMutation);
  const handleClickDeleteBrand = async () => {
    const response = await deleteBespokeCatalogBrand({
      variables: {
        id: selectedBrand?.id,
      },
    });
    if (response.status === "OK") {
      snackbar.showSuccess(
        `Successfully deleted bespoke catalog Brand: ${selectedBrand?.brand_name}`
      );
      setSelectedSkuIds([]);
    } else {
      snackbar.showError(
        `Failed to delete bespoke catalog Brand: ${response.msg}`
      );
    }
  };

  return (
    <Container>
      {isEditSkuModalOpen && selectedSku && (
        <EditBespokeCatalogSkuModal
          bespokeCatalogSku={selectedSku}
          handleClose={() => {
            setIsEditSkuModalOpen(false);
            setSelectedSkuIds([]);
          }}
          refetchSkus={refetchSkus}
        />
      )}
      {isEditSkuGroupModalOpen && selectedSkuGroup && (
        <EditBespokeCatalogSkuGroupModal
          bespokeCatalogSkuGroup={selectedSkuGroup}
          handleClose={() => {
            setIsEditSkuGroupModalOpen(false);
            setSelectedSkuGroupIds([]);
          }}
          refetchSkuGroups={refetchSkuGroups}
        />
      )}
      {isEditBrandModalOpen && selectedBrand && (
        <EditBespokeCatalogBrandModal
          bespokeCatalogBrand={selectedBrand}
          handleClose={() => {
            setIsEditBrandModalOpen(false);
            setSelectedBrandIds([]);
          }}
          refetchBrands={refetchBrands}
        />
      )}
      <Box flex={1} display="flex" flexDirection="column" width="100%" mb={4}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Text textVariant={TextVariants.ParagraphLead}>SKUs</Text>
          <Can perform={Action.EditBespokeCatalog}>
            <Box display="flex">
              <PrimaryWarningButton
                isDisabled={!selectedSku || isDeleteBespokeCatalogSkuLoading}
                text={"Delete SKU"}
                onClick={handleClickDeleteSku}
              />
              <PrimaryButton
                isDisabled={!selectedSku}
                text={"Edit SKU"}
                onClick={() => setIsEditSkuModalOpen(true)}
              />
            </Box>
          </Can>
        </Box>
        <BespokeCatalogSkusDataGrid
          bespokeCatalogSkus={skus}
          selectedBespokeCatalogSkuIds={selectedSkuIds}
          onSelectionChanged={handleSelectSkus}
        />
      </Box>
      <Box flex={1} display="flex" flexDirection="column" width="100%" mb={4}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Text textVariant={TextVariants.ParagraphLead}>SKU Groups</Text>
          <Can perform={Action.EditBespokeCatalog}>
            <Box display="flex">
              <PrimaryWarningButton
                isDisabled={
                  !selectedSkuGroup || isDeleteBespokeCatalogSkuGroupLoading
                }
                text={"Delete Group"}
                onClick={handleClickDeleteSkuGroup}
              />
              <PrimaryButton
                isDisabled={!selectedSkuGroup}
                text={"Edit Group"}
                onClick={() => setIsEditSkuGroupModalOpen(true)}
              />
            </Box>
          </Can>
        </Box>
        <BespokeCatalogSkuGroupsDataGrid
          bespokeCatalogSkuGroups={skuGroups}
          selectedBespokeCatalogSkuGroupIds={selectedSkuGroupIds}
          onSelectionChanged={handleSelectSkuGroups}
        />
      </Box>
      <Box flex={1} display="flex" flexDirection="column" width="100%">
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Text textVariant={TextVariants.ParagraphLead}>Brands</Text>
          <Can perform={Action.EditBespokeCatalog}>
            <Box display="flex">
              <PrimaryWarningButton
                isDisabled={
                  !selectedBrand || isDeleteBespokeCatalogBrandLoading
                }
                text={"Delete Brand"}
                onClick={handleClickDeleteBrand}
              />
              <PrimaryButton
                isDisabled={!selectedBrand}
                text={"Edit Brand"}
                onClick={() => setIsEditBrandModalOpen(true)}
              />
            </Box>
          </Can>
        </Box>
        <BespokeCatalogBrandsDataGrid
          bespokeCatalogBrands={brands}
          selectedBespokeCatalogBrandIds={selectedBrandIds}
          onSelectionChanged={handleSelectBrands}
        />
      </Box>
    </Container>
  );
};

export default BespokeCatalogTab;
