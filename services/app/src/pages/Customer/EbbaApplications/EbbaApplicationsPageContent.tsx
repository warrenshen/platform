import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateUpdateBorrowingBaseCertificationModal from "components/EbbaApplication/CreateUpdateBorrowingBaseCertificationModal";
import CreateUpdateFinancialReportsCertificationModal from "components/EbbaApplication/CreateUpdateFinancialReportsCertificationModal";
import DeleteEbbaApplicationModal from "components/EbbaApplication/DeleteEbbaApplicationModal";
import EbbaApplicationCard from "components/EbbaApplication/EbbaApplicationCard";
import EbbaApplicationsDataGrid from "components/EbbaApplications/EbbaApplicationsDataGrid";
import ModalButton from "components/Shared/Modal/ModalButton";
import PageContent from "components/Shared/Page/PageContent";
import Can from "components/Shared/Can";
import { Action } from "lib/auth/rbac-rules";
import {
  Companies,
  EbbaApplicationFragment,
  EbbaApplications,
  useGetCompanyForCustomerBorrowingBaseQuery,
} from "generated/graphql";
import { withinNDaysOfNowOrBefore } from "lib/date";
import { ActionType, ProductTypeEnum } from "lib/enum";
import { useMemo, useState } from "react";

interface Props {
  companyId: Companies["id"];
  productType: ProductTypeEnum;
}

export default function CustomerEbbaApplicationsPageContent({
  companyId,
  productType,
}: Props) {
  const { data, loading, refetch } = useGetCompanyForCustomerBorrowingBaseQuery(
    {
      fetchPolicy: "network-only",
      variables: {
        companyId,
      },
    }
  );

  const isCategoryBorrowingBase = [ProductTypeEnum.LineOfCredit].includes(
    productType
  );
  const ebbaApplicationDisplayCategory = isCategoryBorrowingBase
    ? "Borrowing Base"
    : "Financial Reports";

  const activeEbbaApplication =
    data?.companies_by_pk?.settings?.active_ebba_application;
  const ebbaApplications = useMemo(
    () => data?.companies_by_pk?.ebba_applications || [],
    [data]
  );

  const isActiveApplicationValid = !!activeEbbaApplication;
  const isActiveApplicationExpiringSoon = withinNDaysOfNowOrBefore(
    activeEbbaApplication?.expires_at,
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

  return (
    <PageContent
      title={`${ebbaApplicationDisplayCategory} Certifications`}
      subtitle={
        "Review your current certification, submit a new certification, and view historical certifications."
      }
    >
      <Can perform={Action.AddBorrowingBase}>
        <Box mt={2}>
          <ModalButton
            label={`Create ${ebbaApplicationDisplayCategory} Certification`}
            modal={({ handleClose }) =>
              isCategoryBorrowingBase ? (
                <CreateUpdateBorrowingBaseCertificationModal
                  actionType={ActionType.New}
                  companyId={companyId}
                  ebbaApplicationId={null}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              ) : (
                <CreateUpdateFinancialReportsCertificationModal
                  actionType={ActionType.New}
                  companyId={companyId}
                  ebbaApplicationId={null}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                  productType={productType}
                />
              )
            }
          />
        </Box>
      </Can>
      <Box mt={3}>
        <Box>
          <Box mb={1}>
            <Typography variant="h6">
              {`Active ${ebbaApplicationDisplayCategory} Certification`}
            </Typography>
            <Box width="50%">
              <Typography variant="body2">
                {isCategoryBorrowingBase
                  ? `Your active borrowing base certification determines your max
                borrowing limit. The financial information you provide is used
                to calculate your max borrowing limit.`
                  : `Your active financial reports certification determines whether you are eligible for financing.`}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" mt={1} mb={2}>
            {!loading &&
              (isActiveApplicationValid ? (
                !isActiveApplicationExpiringSoon ? (
                  <Alert severity="info" style={{ alignSelf: "flex-start" }}>
                    <Box maxWidth={600}>
                      {`Your current ${ebbaApplicationDisplayCategory.toLowerCase()} certification is up-to-date.
                      You can review its details below.`}
                    </Box>
                  </Alert>
                ) : (
                  <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
                    <Box maxWidth={600}>
                      {`Your current ${ebbaApplicationDisplayCategory.toLowerCase()} certification is expiring
                      soon. Please submit a new certification.`}
                    </Box>
                  </Alert>
                )
              ) : (
                <Alert severity="warning" style={{ alignSelf: "flex-start" }}>
                  <Box maxWidth={600}>
                    {`You do not have an up-to-date ${ebbaApplicationDisplayCategory.toLowerCase()} certification.
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
              {`Historical ${ebbaApplicationDisplayCategory} Certifications`}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row-reverse" mt={2} mb={2}>
            <Box>
              <ModalButton
                isDisabled={!selectedEbbaApplication}
                label={"Edit Certification"}
                modal={({ handleClose }) =>
                  isCategoryBorrowingBase ? (
                    <CreateUpdateBorrowingBaseCertificationModal
                      actionType={ActionType.Update}
                      companyId={companyId}
                      ebbaApplicationId={selectedEbbaApplication?.id}
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                    />
                  ) : (
                    <CreateUpdateFinancialReportsCertificationModal
                      actionType={ActionType.Update}
                      companyId={companyId}
                      ebbaApplicationId={selectedEbbaApplication?.id}
                      handleClose={() => {
                        refetch();
                        handleClose();
                      }}
                      productType={productType}
                    />
                  )
                }
              />
            </Box>
            <Box mr={2}>
              <ModalButton
                isDisabled={!selectedEbbaApplication}
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
          <EbbaApplicationsDataGrid
            isBorrowingBaseFieldsVisible={isCategoryBorrowingBase}
            isMultiSelectEnabled
            ebbaApplications={ebbaApplications}
            selectedEbbaApplicationIds={selectedEbbaApplicationIds}
            handleSelectEbbaApplications={handleSelectEbbaApplications}
          />
        </Box>
      </Box>
    </PageContent>
  );
}
