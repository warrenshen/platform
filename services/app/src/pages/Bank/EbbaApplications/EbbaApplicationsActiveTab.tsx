import { Box } from "@material-ui/core";
import DeleteEbbaApplicationModal from "components/EbbaApplication/DeleteEbbaApplicationModal";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import {
  EbbaApplicationFragment,
  EbbaApplications,
  useGetOpenEbbaApplicationsQuery,
} from "generated/graphql";
import { useMemo, useState } from "react";

export default function EbbaApplicationsActiveTab() {
  const { data, error, refetch } = useGetOpenEbbaApplicationsQuery({
    fetchPolicy: "network-only",
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.error({ error });
  }

  const ebbaApplications = useMemo(() => data?.ebba_applications || [], [data]);

  const [selectedEbbaApplicationIds, setSelectedEbbaApplicationIds] = useState<
    EbbaApplications["id"][]
  >([]);

  const selectedEbbaApplication = useMemo(
    () =>
      selectedEbbaApplicationIds.length === 1
        ? ebbaApplications.find(
            (ebbaApplication) =>
              ebbaApplication.id === selectedEbbaApplicationIds[0]
          )
        : null,
    [ebbaApplications, selectedEbbaApplicationIds]
  );

  const handleSelectEbbaApplications = useMemo(
    () => (ebbaApplications: EbbaApplicationFragment[]) =>
      setSelectedEbbaApplicationIds(
        ebbaApplications.map((ebbaApplication) => ebbaApplication.id)
      ),
    [setSelectedEbbaApplicationIds]
  );

  return (
    <Box>
      <Box display="flex" flexDirection="row-reverse" mb={4}>
        {!!selectedEbbaApplication && (
          <ModalButton
            label={"Delete Certification"}
            modal={({ handleClose }) => (
              <DeleteEbbaApplicationModal
                ebbaApplicationId={selectedEbbaApplication.id}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
              />
            )}
          />
        )}
      </Box>
      <Box display="flex" flexDirection="column">
        <EbbaApplicationsDataGrid
          isCompanyVisible
          isMultiSelectEnabled
          ebbaApplications={ebbaApplications}
          selectedEbbaApplicationIds={selectedEbbaApplicationIds}
          handleSelectEbbaApplications={handleSelectEbbaApplications}
        />
      </Box>
    </Box>
  );
}
