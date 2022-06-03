import { Box, Typography } from "@material-ui/core";
import CertificationMonthDropdown from "components/EbbaApplication/CertificationMonthDropdown";
import FileUploader from "components/Shared/File/FileUploader";
import {
  Companies,
  EbbaApplicationFilesInsertInput,
  EbbaApplicationsInsertInput,
  Files,
} from "generated/graphql";
import { formatDateString } from "lib/date";
import { FileTypeEnum, ProductTypeEnum } from "lib/enum";
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
          isBankUser={isBankUser}
          isDisabled={isActionTypeUpdate}
          companyId={companyId}
          ebbaApplication={ebbaApplication}
          setEbbaApplication={setEbbaApplication}
          bankUserMonthsBack={12}
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
