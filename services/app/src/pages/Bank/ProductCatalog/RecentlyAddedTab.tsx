import { Box } from "@material-ui/core";
import EditBespokeCatalogEntryModal from "components/ProductCatalog/EditBespokeCatalogEntryModal";
import MetrcToBespokeCatalogSkusDataGrid from "components/ProductCatalog/MetrcToBespokeCatalogSkusDataGrid";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  MetrcToBespokeCatalogSkuFragment,
  useGetMetrcToBespokeCatalogSkusSubscription,
} from "generated/graphql";
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

const RecentlyAddedTab = () => {
  const { data } = useGetMetrcToBespokeCatalogSkusSubscription();
  const metrcToBespokeCatalogSkus = useMemo(
    () => data?.metrc_to_bespoke_catalog_skus || [],
    [data]
  );
  const [selectedEntryIds, setSelectedEntries] = useState<string[]>([]);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] =
    useState<boolean>(false);

  const handleSelectEntries = useMemo(
    () =>
      ({ selectedRowKeys }: { selectedRowKeys: string[] }) => {
        setSelectedEntries(selectedRowKeys);
      },
    [setSelectedEntries]
  );
  const selectedEntry = useMemo(
    () =>
      selectedEntryIds.length === 1
        ? metrcToBespokeCatalogSkus.find(
            (entry: MetrcToBespokeCatalogSkuFragment) =>
              entry.id === selectedEntryIds[0]
          )
        : null,
    [selectedEntryIds, metrcToBespokeCatalogSkus]
  );

  return (
    <Container>
      {selectedEntry && isEditEntryModalOpen && (
        <EditBespokeCatalogEntryModal
          bespokeCatalogEntry={selectedEntry}
          handleClose={() => {
            setSelectedEntries([]);
            setIsEditEntryModalOpen(false);
          }}
        />
      )}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Bespoke Catalog Entries
        </Text>
        <Can perform={Action.EditBespokeCatalog}>
          <PrimaryButton
            isDisabled={!selectedEntry}
            text={"Edit Catalog Entry"}
            onClick={() => setIsEditEntryModalOpen(true)}
          />
        </Can>
      </Box>
      <MetrcToBespokeCatalogSkusDataGrid
        metrcToBespokeCatalogSkus={metrcToBespokeCatalogSkus}
        selectedMetricToBespokeCatalogSkuIds={selectedEntryIds}
        onSelectionChanged={handleSelectEntries}
      />
    </Container>
  );
};

export default RecentlyAddedTab;
