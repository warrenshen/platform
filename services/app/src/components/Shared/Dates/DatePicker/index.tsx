import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

interface Props {
  className: string;
  id: string;
  label: string;
  value: string;
  disablePast: boolean;
  disableNonBankDays: boolean; // disable days where the bank is not open
  onChange: (value: MaterialUiPickersDate) => void;
}

function DatePicker(props: Props) {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={props.className}
        disableToolbar
        disablePast={props.disablePast}
        autoOk
        shouldDisableDate={(date) => {
          if (props.disableNonBankDays) {
            if (date?.getDay() === 0 || date?.getDay() === 6) {
              // disable weekends that are non-bank days
              return true;
            }
            // TODO: we need to disable bank holidays as well
            // if (date is in bankHoliday) {
            //   return true;
            // }
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
