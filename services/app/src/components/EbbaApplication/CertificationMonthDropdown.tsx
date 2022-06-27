import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { formatDateString, formatDateStringAsMonth } from "lib/date";

export interface CertificationOption {
  certificationDate: string;
  isOptionDisabled: boolean;
}

interface Props {
  isAnnotationDisplayed?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isNoneTheDefault?: boolean;
  certificationDateOptions: CertificationOption[];
  initialValue: string;
  onChange: (event: any, newValue: any) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputField: {
      width: "100%",
      minWidth: "300px",
    },
  })
);

export const NoneOption: CertificationOption = {
  certificationDate: "None",
  isOptionDisabled: false,
};

export default function CertificationMonthDropdown({
  isAnnotationDisplayed = false,
  isDisabled = false,
  isRequired = true,
  isNoneTheDefault = false,
  certificationDateOptions,
  initialValue,
  onChange,
}: Props) {
  const classes = useStyles();

  const finalOptions = !!isNoneTheDefault
    ? [NoneOption, ...certificationDateOptions]
    : certificationDateOptions;

  return (
    <Box>
      <FormControl className={classes.inputField}>
        <InputLabel id="select-certification-date-label" required={isRequired}>
          Certification Month
        </InputLabel>
        <Select
          id="select-certification-date"
          labelId="select-certification-date-label"
          disabled={isDisabled}
          value={initialValue}
          onChange={onChange}
        >
          {finalOptions.map(({ certificationDate, isOptionDisabled }) => (
            <MenuItem
              key={certificationDate}
              disabled={isOptionDisabled}
              value={certificationDate}
            >
              {certificationDate === NoneOption.certificationDate
                ? certificationDate
                : !!isAnnotationDisplayed
                ? `${formatDateStringAsMonth(
                    certificationDate
                  )}: submit financial report as of ${formatDateString(
                    certificationDate
                  )}`
                : `${formatDateStringAsMonth(certificationDate)}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
