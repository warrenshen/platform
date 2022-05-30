import { Box, TextField, Typography } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import {
  FeatureFlagEnum,
  ReportingRequirementsCategories,
  ReportingRequirementsCategoryEnum,
  ReportingRequirementsCategoryToDescription,
  ReportingRequirementsCategoryToLabel,
} from "lib/enum";

interface Props {
  featureFlagsJson: Record<string, string | boolean | null>;
  setFeatureFlagsJson: (
    option: Record<string, string | boolean | null>
  ) => void;
}

function AutocompleteReportingRequirements({
  featureFlagsJson,
  setFeatureFlagsJson,
}: Props) {
  return (
    <Box mt={4}>
      <Autocomplete
        autoHighlight
        blurOnSelect
        value={
          featureFlagsJson[
            FeatureFlagEnum.ReportingRequirementsCategory
          ] as ReportingRequirementsCategoryEnum
        }
        options={ReportingRequirementsCategories}
        getOptionLabel={(option) =>
          ReportingRequirementsCategoryToLabel[option]
        }
        renderInput={(params: any) => (
          <TextField
            {...params}
            label="Reporting Requirements Category"
            variant="outlined"
          />
        )}
        renderOption={(option) => (
          <Box key={option}>
            <Typography>
              {ReportingRequirementsCategoryToLabel[option]}
            </Typography>
            {ReportingRequirementsCategoryToDescription[option]}
          </Box>
        )}
        onChange={(_event, option) => {
          setFeatureFlagsJson({
            ...featureFlagsJson,
            [FeatureFlagEnum.ReportingRequirementsCategory]:
              option || ReportingRequirementsCategoryEnum.None,
          });
        }}
      />
    </Box>
  );
}

export default AutocompleteReportingRequirements;
