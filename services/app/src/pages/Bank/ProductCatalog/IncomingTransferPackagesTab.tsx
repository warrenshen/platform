import { Box } from "@material-ui/core";
import CreateUpdateBespokeCatalogEntryCompleteModal from "components/ProductCatalog/CreateUpdateBespokeCatalogEntryCompleteModal";
import MetrcTransferPackagesDataGrid from "components/ProductCatalog/MetrcTransferPackageDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { MetrcTransferPackageFragment } from "generated/graphql";
import { getIncomingTransferPackageData } from "lib/api/productCatalog";
import { Action } from "lib/auth/rbac-rules";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-height: 1000px;
  margin-top: 36px;
`;

const IncomingTransferPackagesTab = () => {
  const [metrcTransferPackages, setMetrcTransferPackages] = useState<
    MetrcTransferPackageFragment[]
  >([]);
  const [selectedMetrcTransferPackages, setSelectedMetrcTransferPackages] =
    useState<string[]>([]);
  const [matchedProductNames, setMatchedProductNames] = useState<Set<string>>(
    new Set()
  );
  const [
    isCreateUpdateBespokeCatalogEntryModalOpen,
    setIsCreateUpdateBespokeCatalogEntryModalOpen,
  ] = useState<boolean>(false);

  useEffect(() => {
    getIncomingTransferPackageData({}).then((data) => {
      setMetrcTransferPackages(data.data);
    });
  }, []);

  const handleSelectTransferPackages = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedMetrcTransferPackages(selectedRowKeys);
      },
    [setSelectedMetrcTransferPackages]
  );

  const unmatchedTransferPackages = useMemo(
    () =>
      metrcTransferPackages.filter(
        (transferPackage) =>
          !matchedProductNames.has(transferPackage.product_name as string)
      ),
    [metrcTransferPackages, matchedProductNames]
  );

  const selectedMetrcTransferPackage = useMemo(
    () =>
      selectedMetrcTransferPackages.length === 1
        ? metrcTransferPackages.find(
            (salesTransaction: MetrcTransferPackageFragment) =>
              salesTransaction.id === selectedMetrcTransferPackages[0]
          )
        : null,
    [selectedMetrcTransferPackages, metrcTransferPackages]
  );

  return (
    <Container>
      {isCreateUpdateBespokeCatalogEntryModalOpen && (
        <CreateUpdateBespokeCatalogEntryCompleteModal
          productName={selectedMetrcTransferPackage?.product_name}
          productCategoryName={
            selectedMetrcTransferPackage?.product_category_name
          }
          matchedProductNames={matchedProductNames}
          handleClose={() => {
            setSelectedMetrcTransferPackages([]);
            setIsCreateUpdateBespokeCatalogEntryModalOpen(false);
          }}
          setMatchedProductNames={setMatchedProductNames}
        />
      )}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Incoming Transfer Packages
        </Text>
        <Can perform={Action.UnarchiveLoan}>
          <PrimaryButton
            isDisabled={!selectedMetrcTransferPackage}
            text={"Create Sku"}
            onClick={() => setIsCreateUpdateBespokeCatalogEntryModalOpen(true)}
          />
        </Can>
      </Box>
      <MetrcTransferPackagesDataGrid
        selectedTransferPackageIds={selectedMetrcTransferPackages}
        metrcTransferPackages={unmatchedTransferPackages}
        onSelectionChanged={handleSelectTransferPackages}
      />
    </Container>
  );
};

export default IncomingTransferPackagesTab;
