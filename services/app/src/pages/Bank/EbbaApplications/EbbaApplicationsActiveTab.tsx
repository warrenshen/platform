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
  // Note: we use the fetchPolicy "no-cache" here.
  //
  // The following component tree is rendered.
  // EbbaApplicationsDataGrid >
  // EbbaApplicationDrawerLauncher >
  // EbbaApplicationDrawer >
  // CreateUpdateEbbaApplicationModal
  //
  // When the user updates an EbbaApplication, this updates the Apollo cache
  // and causes ebbaApplications in this component to update. This passes down
  // updated ebbaApplications to the child data grid. Finally, the
  // ControlledDataGrid component currently ALWAYS re-renders on data change,
  // which causes the whole grid to re-render and forcefully close any
  // EbbaApplicationDrawer that is open.

  const { data, error, refetch } = useGetOpenEbbaApplicationsQuery({
    fetchPolicy: "no-cache",
  });

  if (error) {
    alert(`Error in query: ${error.message}`);
    console.log({ error });
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
      <Box flex={1} display="flex" flexDirection="column" overflow="scroll">
        <EbbaApplicationsDataGrid
          isExcelExport
          isMultiSelectEnabled
          ebbaApplications={ebbaApplications}
          selectedEbbaApplicationIds={selectedEbbaApplicationIds}
          handleSelectEbbaApplications={handleSelectEbbaApplications}
        />
      </Box>
    </Box>
  );
}
