import { TextFieldProps } from "@mui/material/TextField";
import { StaticDateRangePicker as MuiStaticDateRangePicker } from "@mui/x-date-pickers-pro/StaticDateRangePicker";
import { SuggestedRecomputeDatesSalmon } from "components/Shared/Colors/GlobalColors";
import { JSXElementConstructor, ReactElement } from "react";
import styled from "styled-components";

const StyledStaticDateRangePicker = styled(MuiStaticDateRangePicker)<{
  $rangeHighlightColor: string;
  $selectedDateColor: string;
}>`
  .MuiPickerStaticWrapper-content {
    box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  .MuiDateRangePickerViewDesktop-container {
    width: 100%;
  }
  .PrivatePickersSlideTransition-root {
    min-height: 228px;
  }
  .MuiDayPicker-slideTransition {
    min-height: 228px;
  }
  .MuiDateRangePickerDay-rangeIntervalDayHighlight {
    background-color: ${(props) => props.$rangeHighlightColor};
  }
  .Mui-selected.Mui-disabled {
    background-color: ${(props) => props.$selectedDateColor};
  }
`;

interface Props {
  displayStaticWrapperAs?: "desktop" | "mobile";
  value: [string | Date | null, string | Date | null];
  calendars?: 2 | 1 | 3 | undefined;
  disabled?: boolean;
  onChange: () => void;
  renderInput: (
    startProps: TextFieldProps,
    endProps: TextFieldProps
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
  rangeHighlightColor?: string;
  selectedDateColor?: string;
}

const StaticDateRangePicker = ({
  displayStaticWrapperAs = "desktop",
  value,
  calendars = 2,
  disabled = false,
  onChange,
  renderInput,
  rangeHighlightColor = SuggestedRecomputeDatesSalmon,
  selectedDateColor = SuggestedRecomputeDatesSalmon,
}: Props) => {
  return (
    <StyledStaticDateRangePicker
      displayStaticWrapperAs={displayStaticWrapperAs}
      value={value}
      calendars={calendars}
      disabled={disabled}
      onChange={onChange}
      renderInput={renderInput}
      $rangeHighlightColor={rangeHighlightColor}
      $selectedDateColor={selectedDateColor}
    />
  );
};

export default StaticDateRangePicker;
