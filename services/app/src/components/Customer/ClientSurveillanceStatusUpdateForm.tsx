import { Box, Typography, FormControl, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import {
  BankStatusEnum,
  BankStatusLabelEnum,
  BankStatusLabels,
  BankStatusToLabel,
  LabelToBankStatus,
  LabelToQualifyFor,
  QualifyForEnum,
  QualifyForLabelEnum,
  QualifyForToLabel,
  QualifyForLabels,
} from "lib/enum";
import { Dispatch, SetStateAction } from "react";

interface Props {
  name: string;
  bankStatus: BankStatusEnum;
  bankStatusNote: string;
  qualifyFor: QualifyForEnum;
  setBankStatus: Dispatch<SetStateAction<BankStatusEnum>>;
  setBankStatusNote: Dispatch<SetStateAction<string>>;
  setQualifyFor: Dispatch<SetStateAction<QualifyForEnum>>;
}

const ClientSurveillanceStatusUpdateForm = ({
  name,
  bankStatus,
  bankStatusNote,
  qualifyFor,
  setBankStatus,
  setBankStatusNote,
  setQualifyFor,
}: Props) => (
  <Box mt={4} key={name}>
    <Box display="flex" flexDirection="column" width={400} mr={2}>
      <Box mb={2}>
        <Typography variant="h6">{name}</Typography>
      </Box>
      <FormControl>
        <Box mb={2}>
          <Autocomplete
            autoHighlight
            blurOnSelect
            value={BankStatusToLabel[bankStatus]}
            options={BankStatusLabels}
            getOptionLabel={(option: string) => option}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label="Surveillance Status"
                variant="outlined"
              />
            )}
            onChange={(_, bankStatusLabel: BankStatusLabelEnum | null) => {
              if (!!bankStatusLabel) {
                setBankStatus(LabelToBankStatus[bankStatusLabel]);
              }
            }}
          />
        </Box>
        <Autocomplete
          autoHighlight
          blurOnSelect
          value={QualifyForToLabel[qualifyFor]}
          options={QualifyForLabels}
          getOptionLabel={(option: string) => option}
          renderInput={(params: any) => (
            <TextField {...params} label="Qualifying For" variant="outlined" />
          )}
          onChange={(_, qualifyForLabel: QualifyForLabelEnum | null) => {
            if (!!qualifyForLabel) {
              setQualifyFor(LabelToQualifyFor[qualifyForLabel]);
            }
          }}
        />
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            label="Bank Note"
            value={bankStatusNote}
            onChange={({ target: { value } }) => setBankStatusNote(value)}
          />
        </Box>
      </FormControl>
    </Box>
  </Box>
);

export default ClientSurveillanceStatusUpdateForm;
