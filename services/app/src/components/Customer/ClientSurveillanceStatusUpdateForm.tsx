import { Box, Typography, FormControl, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  BankStatusEnum,
  BankStatuses,
  BankStatusToLabel,
  QualifyForEnum,
  QualifyForToLabel,
  QualifyingForValues,
} from "lib/enum";
import { Dispatch, SetStateAction } from "react";

interface Props {
  name: string;
  bankStatus: BankStatusEnum;
  bankStatusNote: string;
  qualifyFor: QualifyForEnum;
  setBankStatus: Dispatch<SetStateAction<BankStatusEnum>>;
  setBankStatusNote: Dispatch<SetStateAction<string>>;
  qualifyingDate: string;
  handleQualifyingDateChange: (value: string | null) => void;
  setQualifyFor: Dispatch<SetStateAction<QualifyForEnum>>;
}

const ClientSurveillanceStatusUpdateForm = ({
  name,
  bankStatus,
  bankStatusNote,
  qualifyFor,
  setBankStatus,
  setBankStatusNote,
  qualifyingDate,
  handleQualifyingDateChange,
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
            value={bankStatus}
            options={BankStatuses}
            getOptionLabel={(option: BankStatusEnum) =>
              BankStatusToLabel[option]
            }
            renderInput={(params: any) => (
              <TextField
                {...params}
                label="Surveillance Status"
                variant="outlined"
              />
            )}
            onChange={(_, bankStatusLabel: BankStatusEnum | null) => {
              if (!!bankStatusLabel) {
                setBankStatus(bankStatusLabel);
              }
            }}
          />
        </Box>
        <Autocomplete
          autoHighlight
          blurOnSelect
          value={qualifyFor}
          options={QualifyingForValues}
          getOptionLabel={(option: QualifyForEnum) => QualifyForToLabel[option]}
          renderInput={(params: any) => (
            <TextField {...params} label="Qualifying For" variant="outlined" />
          )}
          onChange={(_, qualifyForLabel: QualifyForEnum | null) => {
            if (!!qualifyForLabel) {
              setQualifyFor(qualifyForLabel);
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
        <Box mt={2}>
          <DateInput
            id="qualify-date-date-picker"
            label="Qualifying Date"
            disableFuture
            value={qualifyingDate}
            onChange={handleQualifyingDateChange}
          />
        </Box>
      </FormControl>
    </Box>
  </Box>
);

export default ClientSurveillanceStatusUpdateForm;
