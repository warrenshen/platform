import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { format, parse } from "date-fns";
import { DateFormatServer } from "lib/date";
import { addYearToBankHolidays, bankHolidays } from "lib/holidays";
interface Props {
  className?: string;
  id: string;
  label: string;
  value: string | null;
  error?: boolean;
  disabled?: boolean;
  disableFuture?: boolean;
  disableNonBankDays?: boolean; // disable days where the bank is not open
  disablePast?: boolean;
  required?: boolean;
  onChange?: (value: string | null) => void;
}

function DatePicker(props: Props) {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={props.className || ""}
        disableToolbar
        disableFuture={props.disableFuture}
        disablePast={props.disablePast || props.disableNonBankDays}
        autoOk
        error={props.error}
        required={props.required}
        disabled={props.disabled}
        shouldDisableDate={(date) => {
          if (date && props.disableNonBankDays) {
            // Disable weekends.
            if (date?.getDay() === 0 || date?.getDay() === 6) {
              return true;
            }
            // Disable bank holidays.
            const year = date.getFullYear();
            if (!bankHolidays.has(year)) {
              addYearToBankHolidays(year, bankHolidays);
            }
            const holidays = bankHolidays.get(year);
            return holidays.has(format(date, "MM/dd/yyyy"));
          } else {
            return false;
          }
        }}
        variant="inline"
        format="MM/dd/yyyy"
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
      />
    </MuiPickersUtilsProvider>
  );
}

export default DatePicker;
