import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateUpdateFinancialReportCertificationModal from "components/EbbaApplication/CreateUpdateFinancialReportCertificationModal";
import DeleteEbbaApplicationModal from "components/EbbaApplication/DeleteEbbaApplicationModal";
import EbbaApplicationCard from "components/EbbaApplication/EbbaApplicationCard";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import UpdateEbbaApplicationBankNoteModal from "components/EbbaApplications/UpdateEbbaApplicationsBankNoteModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import {
  Companies,
  EbbaApplicationFragment,
  EbbaApplications,
  useGetCompanyEbbaApplicationsInfoQuery,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { withinNDaysOfNowOrBefore } from "lib/date";
import {
  ActionType,
  CustomerSurveillanceCategoryEnum,
  ProductTypeEnum,
} from "lib/enum";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum | null;
  isActiveContract: boolean | null;
}

export default function CustomerFinancialCertificationsPageContent({
  companyId,
  productType,
  isActiveContract,
}: Props) {
  const { data, loading, refetch } = useGetCompanyEbbaApplicationsInfoQuery({
    fetchPolicy: "network-only",
    variables: {
      companyId,
    },
  });

  const activeEbbaApplication =
    data?.companies_by_pk?.settings?.active_financial_report;
  const ebbaApplications = useMemo(
    () =>
      data?.companies_by_pk?.ebba_applications.filter(
        (app) =>
          app.category === CustomerSurveillanceCategoryEnum.FinancialReport
      ) || [],
    [data]
  );

  const isActiveApplicationValid = !!activeEbbaApplication;
  const isActiveApplicationExpiringSoon = withinNDaysOfNowOrBefore(
    activeEbbaApplication?.expires_date,
    15
  );

  // State for modal(s).
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

  // State for Bank Note Modal
  const [
    selectedEbbaApplicationIdForBankNote,
    setSelectedEbbaApplicationIdForBankNote,
  ] = useState(null);

  const handleClickEbbaApplicationBankNote = useMemo(
    () => (ebbaApplicationId: EbbaApplicationFragment["id"]) => {
      setSelectedEbbaApplicationIdForBankNote(ebbaApplicationId);
    },
    []
  );

  return !!productType ? (
    <PageContent
      title={`Financial Report Certifications`}
      subtitle={
        "Review your current certification, submit a new certification, and view historical certifications."
      }
    >
      <Can perform={Action.AddBorrowingBase}>
        <Box mt={2}>
          <ModalButton
            dataCy="create-financial-report-certification-button"
            label={`Create Financial Report Certification`}
            isDisabled={!isActiveContract}
            modal={({ handleClose }) => (
              <CreateUpdateFinancialReportCertificationModal
                actionType={ActionType.New}
                companyId={companyId}
                ebbaApplicationId={null}
                handleClose={() => {
                  refetch();
                  handleClose();
                }}
                productType={productType}
              />
            )}
          />
        </Box>
      </Can>
      <Box mt={3}>
        <Box>
          <Box mb={1}>
            <Typography variant="h6">
              {`Active Financial Report Certification`}
            </Typography>
            <Box width="50%">
              <Typography variant="body2">
                Your active financial report certification determines whether
                you are eligible for financing.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={1} mb={2}>
            {!loading &&
              (isActiveApplicationValid ? (
                !isActiveApplicationExpiringSoon ? (
                  <Alert severity="info" style={{ alignSelf: "flex-start" }}>
                    <Box maxWidth={600}>
                      {`Your current financial report certification is up-to-date.
                      You can review its details below.`}
                    </Box>
                  </Alert>
                ) : (
                  <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
                    <Box maxWidth={600}>
                      {`Your current financial report certification is expiring
                      soon. Please submit a new certification.`}
                    </Box>
                  </Alert>
                )
              ) : (
                <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
                  <Box maxWidth={600}>
                    {`You do not have an up-to-date financial report certification.
                    Please submit a new certification for approval, otherwise
                    you will not be able to receive financing.`}
                  </Box>
                </Alert>
              ))}
          </Box>
          {isActiveApplicationValid && activeEbbaApplication && (
            <EbbaApplicationCard ebbaApplication={activeEbbaApplication} />
          )}
        </Box>
        <Box mt={3}>
          <Box mb={1}>
            <Typography variant="h6">
              {`Historical Financial Report Certifications`}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row-reverse" mt={2} mb={2}>
            <Box>
              <ModalButton
                dataCy="edit-certification-button"
                isDisabled={!selectedEbbaApplication || !isActiveContract}
                label={"Edit Certification"}
                modal={({ handleClose }) => (
                  <CreateUpdateFinancialReportCertificationModal
                    actionType={ActionType.Update}
                    companyId={companyId}
                    ebbaApplicationId={selectedEbbaApplication?.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                    productType={productType}
                  />
                )}
              />
            </Box>
            <Box mr={2}>
              <ModalButton
                dataCy="delete-certification-button"
                isDisabled={!selectedEbbaApplication || !isActiveContract}
                label={"Delete Certification"}
                variant={"outlined"}
                modal={({ handleClose }) => (
                  <DeleteEbbaApplicationModal
                    ebbaApplicationId={selectedEbbaApplication?.id}
                    handleClose={() => {
                      refetch();
                      handleClose();
                    }}
                  />
                )}
              />
            </Box>
          </Box>
          {!!selectedEbbaApplicationIdForBankNote && (
            <UpdateEbbaApplicationBankNoteModal
              ebbaApplication={
                !!selectedEbbaApplicationIdForBankNote &&
                ebbaApplications.find(
                  (ebba) => ebba.id === selectedEbbaApplicationIdForBankNote
                )
              }
              handleClose={() => setSelectedEbbaApplicationIdForBankNote(null)}
            />
          )}
          <Box data-cy="financial-report-certifications-table">
            <EbbaApplicationsDataGrid
              isBorrowingBaseFieldsVisible={false}
              isMultiSelectEnabled
              ebbaApplications={ebbaApplications}
              selectedEbbaApplicationIds={selectedEbbaApplicationIds}
              handleSelectEbbaApplications={handleSelectEbbaApplications}
              handleClickBorrowingBaseBankNote={
                handleClickEbbaApplicationBankNote
              }
            />
          </Box>
        </Box>
      </Box>
    </PageContent>
  ) : null;
}
