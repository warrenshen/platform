import { Box } from "@material-ui/core";
import BorrowersEndDatesDataGrid from "components/Customer/BorrowersEndDatesDataGrid";
import EditEndDatesModal from "components/Settings/Bank/EditEndDatesModal";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Text, { TextVariants } from "components/Shared/Text/Text";
import {
  Companies,
  CompanySettings,
  CustomersWithMetadataFragment,
  useGetCustomersWithMetadataQuery,
} from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
  margin-top: 48px;
`;

export default function BorrowersEndDatesTab() {
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Companies["id"]>(
    []
  );
  const [selectedCompanySettingsId, setSelectedCompanySettingsId] = useState<
    CompanySettings["id"]
  >([]);
  const [isEditEndDatesModalOpen, setIsEditEndDatesModalOpen] =
    useState<boolean>(false);

  const { data, error } = useGetCustomersWithMetadataQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  const customers = data?.customers || ([] as CustomersWithMetadataFragment[]);

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  return (
    <Container>
      {isEditEndDatesModalOpen && (
        <EditEndDatesModal
          companySettingsId={selectedCompanySettingsId}
          handleClose={() => {
            setIsEditEndDatesModalOpen(false);
            setSelectedCompanyIds([]);
          }}
        />
      )}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Text textVariant={TextVariants.ParagraphLead}>
          Borrowers - End Dates
        </Text>
        <PrimaryButton
          isDisabled={selectedCompanyIds.length !== 1}
          dataCy={"edit-end-dates-button"}
          text={"Edit End Dates"}
          height={"40px"}
          margin={"0"}
          onClick={() => setIsEditEndDatesModalOpen(true)}
        />
      </Box>
      <BorrowersEndDatesDataGrid
        customers={customers}
        selectedCompanyIds={selectedCompanyIds}
        setSelectedCompanyIds={setSelectedCompanyIds}
        setSelectedCompanySettingsId={setSelectedCompanySettingsId}
      />
    </Container>
  );
}
