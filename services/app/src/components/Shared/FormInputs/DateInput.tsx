import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { format, parse } from "date-fns";
import { DateFormatClient, DateFormatServer, isBankHoliday } from "lib/date";

interface Props {
  dataCy?: string;
  className?: string;
  id: string;
  label: string;
  value: string | null;
  autoFocus?: boolean;
  error?: boolean;
  disabled?: boolean;
  disableFuture?: boolean;
  disableNonBankDays?: boolean; // Disable days where the bank is not open.
  disablePast?: boolean;
  disabledBefore?: string; // Disable days before this date.
  required?: boolean;
  keyboardIcon?: React.ReactNode;
  onChange?: (value: string | null) => void;
  onBlur?: () => void;
}

export default function DateInput(props: Props) {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        data-cy={props.dataCy}
        className={props.className || ""}
        autoFocus={!!props.autoFocus}
        autoOk
        disableToolbar
        disableFuture={props.disableFuture}
        disablePast={props.disablePast}
        error={props.error}
        required={props.required}
        disabled={props.disabled}
        onBlur={props.onBlur}
        shouldDisableDate={(date) => {
          if (date) {
            if (props.disabledBefore) {
              const disabledBeforeDate = parse(
                props.disabledBefore,
                DateFormatServer,
                new Date()
              );
              if (date < disabledBeforeDate) {
                return true;
              }
            }
            if (props.disableNonBankDays) {
              // Disable weekends.
              if (date?.getDay() === 0 || date?.getDay() === 6) {
                return true;
              }
              // Disable bank holidays.
              return isBankHoliday(date);
            }
          } else {
            return false;
          }
        }}
        variant="inline"
        format={DateFormatClient}
        margin="none"
        id={props.id}
        label={props.label}
        value={
          props.value ? parse(props.value, DateFormatServer, new Date()) : null
        }
        onChange={(value: MaterialUiPickersDate) =>
          props.onChange &&
          props.onChange(
            value !== null && String(value) !== "Invalid Date"
              ? format(value, DateFormatServer)
              : null
          )
        }
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
        keyboardIcon={props.keyboardIcon}
      />
    </MuiPickersUtilsProvider>
  );
}
