import { Box, Typography } from "@material-ui/core";
import CertificationMonthDropdown from "components/EbbaApplication/CertificationMonthDropdown";
import { CertificationOption } from "components/EbbaApplication/CertificationMonthDropdown";
import FileUploader from "components/Shared/File/FileUploader";
import {
  Companies,
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  Files,
  useGetEbbaApplicationsByCompanyIdQuery,
} from "generated/graphql";
import { formatDateString, previousXMonthsCertificationDates } from "lib/date";
import {
  CustomerSurveillanceCategoryEnum,
  FileTypeEnum,
  ProductTypeEnum,
} from "lib/enum";
import { isDispensaryFinancingProductType } from "lib/settings";
import { useMemo } from "react";

interface Props {
  isActionTypeUpdate: boolean;
  isBankUser: boolean;
  companyId: Companies["id"];
  frozenFileIds?: Files["id"][];
  ebbaApplication: EbbaApplicationsInsertInput;
  ebbaApplicationFiles: EbbaApplicationFilesInsertInput[];
  setEbbaApplication: (ebbaApplication: EbbaApplicationsInsertInput) => void;
  setEbbaApplicationFiles: (
    ebbaApplicationFiles: EbbaApplicationFilesInsertInput[]
  ) => void;
  productType: ProductTypeEnum;
}

export default function EbbaApplicationFinancialReportsForm({
  isActionTypeUpdate,
  isBankUser,
  companyId,
  frozenFileIds,
  ebbaApplication,
  ebbaApplicationFiles,
  setEbbaApplication,
  setEbbaApplicationFiles,
  productType,
}: Props) {
  const ebbaApplicationFileIds = useMemo(
    () =>
      ebbaApplicationFiles.map(
        (ebbaApplicationFile) => ebbaApplicationFile.file_id
      ),
    [ebbaApplicationFiles]
  );

  const selectedCertificationDate = ebbaApplication.application_date
    ? formatDateString(ebbaApplication.application_date)
    : "";

  const { data, error } = useGetEbbaApplicationsByCompanyIdQuery({
    fetchPolicy: "network-only",
    variables: {
      company_id: companyId,
      category: CustomerSurveillanceCategoryEnum.FinancialReport,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const certificationDateOptions: CertificationOption[] = useMemo(() => {
    const existingEbbaApplications = data?.ebba_applications || [];
    const existingEbbaApplicationDates = existingEbbaApplications.map(
      (ebbaApplication) => ebbaApplication.application_date
    );
    // 1. Allow bank user to select months up to 12 months back (configurable for CS dashboard)
    // 2. Allow customer user to selects months up to 4 months back (configurable, but defaulting to 4)
    return previousXMonthsCertificationDates(isBankUser ? 12 : 4).map(
      (certificationDate) => ({
        certificationDate,
        isOptionDisabled:
          existingEbbaApplicationDates.indexOf(certificationDate) >= 0,
      })
    );
  }, [isBankUser, data?.ebba_applications]);

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mt={4}>
        {!isActionTypeUpdate && (
          <Box mb={1}>
            <Typography variant="subtitle2">
              What month would you like to submit your financial report for?
            </Typography>
          </Box>
        )}
        <CertificationMonthDropdown
          isAnnotationDisplayed
          isDisabled={isActionTypeUpdate}
          initialValue={ebbaApplication.application_date}
          onChange={({ target: { value } }) =>
            setEbbaApplication({
              ...ebbaApplication,
              application_date: value,
            })
          }
          certificationDateOptions={certificationDateOptions}
        />
      </Box>
      <Box display="flex" flexDirection="column" mt={4}>
        <Box mb={2}>
          <Box>
            <Typography variant="subtitle1" color="textSecondary">
              Please upload the following required documents:
            </Typography>
          </Box>
          {productType &&
          isDispensaryFinancingProductType(productType as ProductTypeEnum) ? (
            <>
              <Box mt={0.5}>
                <Typography variant="body1">
                  {`POS Data as of: ${selectedCertificationDate}`}
                </Typography>
              </Box>
              <Box mt={0.5}>
                <Typography variant="body1">
                  {`Inventory Report as of: ${selectedCertificationDate}`}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Box mt={0.5}>
                <Typography variant="body1">
                  {`Balance Sheet as of: ${selectedCertificationDate}`}
                </Typography>
              </Box>
              <Box mt={0.5}>
                <Typography variant="body1">
                  {`Monthly Income Statement as of: ${selectedCertificationDate}`}
                </Typography>
              </Box>
              <Box mt={0.5}>
                <Typography variant="body1">
                  {`A/R Aging Summary Report as of: ${selectedCertificationDate}`}
                </Typography>
              </Box>
              <Box mt={0.5}>
                <Typography variant="body1">
                  {`A/P Aging Summary Report as of: ${selectedCertificationDate}`}
                </Typography>
              </Box>
            </>
          )}
        </Box>
        <FileUploader
          companyId={companyId}
          fileType={FileTypeEnum.EbbaApplication}
          fileIds={ebbaApplicationFileIds}
          frozenFileIds={frozenFileIds}
          handleDeleteFileById={(fileId) =>
            setEbbaApplicationFiles(
              ebbaApplicationFiles.filter(
                (ebbaApplicationFile) => ebbaApplicationFile.file_id !== fileId
              )
            )
          }
          handleNewFiles={(files) =>
            setEbbaApplicationFiles([
              ...ebbaApplicationFiles,
              ...files.map((file) => ({
                ebba_application_id: ebbaApplication.id,
                file_id: file.id,
              })),
            ])
          }
        />
      </Box>
    </Box>
  );
}
