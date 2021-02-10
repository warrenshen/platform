import DateFnsUtils from "@date-io/date-fns";
import { format } from "date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { bankHolidays, addYearToBankHolidays } from "lib/holidays";

interface Props {
  className?: string;
  id: string;
  label: string;
  value: string;
  error?: boolean;
  disablePast?: boolean;
  disabled?: boolean;
  required?: boolean;
  disableNonBankDays?: boolean; // disable days where the bank is not open
  disableBankHolidays?: boolean;
  onChange: (value: MaterialUiPickersDate) => void;
}

function DatePicker(props: Props) {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={props.className || ""}
        disableToolbar
        disablePast={props.disablePast}
        autoOk
        error={props.error}
        required={props.required}
        disabled={props.disabled}
        shouldDisableDate={(date) => {
          if (props.disableNonBankDays) {
            if (date?.getDay() === 0 || date?.getDay() === 6) {
              // disable weekends that are non-bank days
              return true;
            }
            if (date && props.disableBankHolidays) {
              // disable bank holidays
              const year = date.getFullYear();
              if (!bankHolidays.has(year)) {
                addYearToBankHolidays(year, bankHolidays);
              }
              const holidays = bankHolidays.get(year);
              return holidays.has(format(date, "MM/dd/yyyy"));
            }
          }
          return false;
        }}
        variant="inline"
        format="MM/dd/yyyy"
        margin="normal"
        id={props.id}
        label={props.label}
        value={props.value}
        onChange={(value: MaterialUiPickersDate) => {
          props.onChange(value);
        }}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
      />
    </MuiPickersUtilsProvider>
  );
}

export default DatePicker;
