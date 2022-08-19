import styled from "styled-components";

export const CustomCheckboxUnchecked = styled.span`
  border: 1px solid #d5d3d0;
  border-radius: 4px;
  height: 16px;
  width: 16px;
`;

export const CustomCheckboxChecked = styled(CustomCheckboxUnchecked)`
  border: 1px solid #8eab79;
  background-color: #8eab79;
  background-image: url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\");
`;

export const Svg = styled.svg.attrs({
  version: "1.1",
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink",
});

export const DateInputIcon = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.75 1C13.75 0.585786 13.4142 0.25 13 0.25C12.5858 0.25 12.25 0.585786 12.25 1V2.25H5.75V1C5.75 0.585786 5.41421 0.25 5 0.25C4.58579 0.25 4.25 0.585786 4.25 1V2.25H3C1.48122 2.25 0.25 3.48122 0.25 5V9V17C0.25 18.5188 1.48122 19.75 3 19.75H15C16.5188 19.75 17.75 18.5188 17.75 17V9V5C17.75 3.48122 16.5188 2.25 15 2.25H13.75V1ZM16.25 8.25V5C16.25 4.30964 15.6904 3.75 15 3.75H13.75V5C13.75 5.41421 13.4142 5.75 13 5.75C12.5858 5.75 12.25 5.41421 12.25 5V3.75H5.75V5C5.75 5.41421 5.41421 5.75 5 5.75C4.58579 5.75 4.25 5.41421 4.25 5V3.75H3C2.30964 3.75 1.75 4.30964 1.75 5V8.25H16.25ZM1.75 9.75H16.25V17C16.25 17.6904 15.6904 18.25 15 18.25H3C2.30964 18.25 1.75 17.6904 1.75 17V9.75ZM6.25 14C6.25 13.5858 6.58579 13.25 7 13.25H8.25V12C8.25 11.5858 8.58579 11.25 9 11.25C9.41421 11.25 9.75 11.5858 9.75 12V13.25H11C11.4142 13.25 11.75 13.5858 11.75 14C11.75 14.4142 11.4142 14.75 11 14.75H9.75V16C9.75 16.4142 9.41421 16.75 9 16.75C8.58579 16.75 8.25 16.4142 8.25 16V14.75H7C6.58579 14.75 6.25 14.4142 6.25 14Z"
      fill="#605F5C"
    />
  </svg>
);
