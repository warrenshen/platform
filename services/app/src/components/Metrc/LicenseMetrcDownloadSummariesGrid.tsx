import { Box, CircularProgress } from "@material-ui/core";
import MetrcDownloadSummariesGrid from "components/Metrc/MetrcDownloadSummariesGrid";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { useGetMetrcDownloadSummariesByLicenseNumberQuery } from "generated/graphql";
import { useMemo } from "react";

interface Props {
  licenseNumber: string;
}

export default function LicenseMetrcDownloadSummariesGrid({
  licenseNumber,
}: Props) {
  const { data, loading } = useGetMetrcDownloadSummariesByLicenseNumberQuery({
    variables: {
      license_number: licenseNumber,
    },
  });

  const metrcDownloadSummaries = useMemo(
    () => data?.metrc_download_summaries || [],
    [data]
  );

  return (
    <Box display={"flex"} flexDirection="column">
      <Box>
        <Text textVariant={TextVariants.ParagraphLead}>
          {`License number: ${licenseNumber}`}
        </Text>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box mt={2}>
          <MetrcDownloadSummariesGrid
            metrcDownloadSummaries={metrcDownloadSummaries}
          />
        </Box>
      )}
    </Box>
  );
}
