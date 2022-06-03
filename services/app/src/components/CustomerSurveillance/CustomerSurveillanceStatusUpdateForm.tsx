import { Box, FormControl, TextField, Typography } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  QualifyForEnum,
  QualifyForToLabel,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import { Dispatch, SetStateAction } from "react";

interface Props {
  name: string;
  surveillanceStatus: SurveillanceStatusEnum;
  surveillanceStatusNote: string;
  qualifyFor: QualifyForEnum;
  setSurveillanceStatus: Dispatch<SetStateAction<SurveillanceStatusEnum>>;
  setSurveillanceStatusNote: Dispatch<SetStateAction<string>>;
  qualifyingDate: string;
  handleQualifyingDateChange: (value: string | null) => void;
  setQualifyFor: Dispatch<SetStateAction<QualifyForEnum>>;
}

const CustomerSurveillanceStatusUpdateForm = ({
  name,
  surveillanceStatus,
  surveillanceStatusNote,
  qualifyFor,
  setSurveillanceStatus,
  setSurveillanceStatusNote,
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
            value={SurveillanceStatusToLabel[surveillanceStatus]}
            options={Object.values(SurveillanceStatusEnum)}
            getOptionLabel={(option: string) => {
              return SurveillanceStatusToLabel[
                option as SurveillanceStatusEnum
              ];
            }}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label="Surveillance Status"
                variant="outlined"
              />
            )}
            onChange={(_event, status) => {
              if (!!status) {
                setSurveillanceStatus(status as SurveillanceStatusEnum);
              }
            }}
          />
        </Box>
        <Autocomplete
          autoHighlight
          blurOnSelect
          value={qualifyFor}
          options={Object.values(QualifyForEnum)}
          getOptionLabel={(option: QualifyForEnum) => QualifyForToLabel[option]}
          renderInput={(params: any) => (
            <TextField {...params} label="Qualifying For" variant="outlined" />
          )}
          onChange={(_event, qualifyingProduct) => {
            if (!!qualifyingProduct) {
              setQualifyFor(qualifyingProduct as QualifyForEnum);
            }
          }}
        />
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            label="Surveillance Note"
            value={surveillanceStatusNote}
            onChange={({ target: { value } }) =>
              setSurveillanceStatusNote(value)
            }
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

export default CustomerSurveillanceStatusUpdateForm;
