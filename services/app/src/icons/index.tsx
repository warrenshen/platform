import {
  DisabledSecondaryTextColor,
  PlainWhite,
  SecondaryActiveColor,
  SecondaryTextColor,
} from "components/Shared/Colors/GlobalColors";
import styled from "styled-components";

const StyledCheckbox = styled.span<{
  $isChecked: boolean;
  $isDisabled: boolean;
}>`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: ${(props) =>
    props.$isChecked ? DisabledSecondaryTextColor : SecondaryActiveColor};
  border-radius: 3px;
  transition: all 150ms;
  line-height: 16px;
  display: inline-flex;
  vertical-align: top;
  justify-content: center;
  align-items: center;
`;

const StyledSVG = styled.svg<{
  $width2: string;
  $height2: string;
}>`
  width: ${(props) => props.$width2}px;
  height: ${(props) => props.$height2}px;
`;

const StyledPath = styled.path<{
  $fillColor: string;
}>`
  fill: ${(props) => props.$fillColor};
`;

export const Svg = styled.svg.attrs({
  version: "1.1",
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink",
});

type SVGProps = {
  fillColor?: string;
  width?: string;
  height?: string;
  isChecked?: boolean;
  isDisabled?: boolean;
};

export const DateInputIcon = ({
  fillColor = SecondaryTextColor,
  width = "24",
  height = "24",
  isChecked = false,
  isDisabled = false,
}: SVGProps) => (
  <StyledSVG
    width="18"
    height="20"
    viewBox="0 0 18 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    $width2={width}
    $height2={height}
  >
    <StyledPath
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.75 1C13.75 0.585786 13.4142 0.25 13 0.25C12.5858 0.25 12.25 0.585786 12.25 1V2.25H5.75V1C5.75 0.585786 5.41421 0.25 5 0.25C4.58579 0.25 4.25 0.585786 4.25 1V2.25H3C1.48122 2.25 0.25 3.48122 0.25 5V9V17C0.25 18.5188 1.48122 19.75 3 19.75H15C16.5188 19.75 17.75 18.5188 17.75 17V9V5C17.75 3.48122 16.5188 2.25 15 2.25H13.75V1ZM16.25 8.25V5C16.25 4.30964 15.6904 3.75 15 3.75H13.75V5C13.75 5.41421 13.4142 5.75 13 5.75C12.5858 5.75 12.25 5.41421 12.25 5V3.75H5.75V5C5.75 5.41421 5.41421 5.75 5 5.75C4.58579 5.75 4.25 5.41421 4.25 5V3.75H3C2.30964 3.75 1.75 4.30964 1.75 5V8.25H16.25ZM1.75 9.75H16.25V17C16.25 17.6904 15.6904 18.25 15 18.25H3C2.30964 18.25 1.75 17.6904 1.75 17V9.75ZM6.25 14C6.25 13.5858 6.58579 13.25 7 13.25H8.25V12C8.25 11.5858 8.58579 11.25 9 11.25C9.41421 11.25 9.75 11.5858 9.75 12V13.25H11C11.4142 13.25 11.75 13.5858 11.75 14C11.75 14.4142 11.4142 14.75 11 14.75H9.75V16C9.75 16.4142 9.41421 16.75 9 16.75C8.58579 16.75 8.25 16.4142 8.25 16V14.75H7C6.58579 14.75 6.25 14.4142 6.25 14Z"
      $fillColor={fillColor}
    />
  </StyledSVG>
);

export const TrashIcon = ({
  fillColor = SecondaryTextColor,
  width = "24",
  height = "24",
  isChecked = false,
  isDisabled = false,
}: SVGProps) => (
  <StyledSVG
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    $width2={width}
    $height2={height}
  >
    <StyledPath
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.75 6C9.75 5.30964 10.3096 4.75 11 4.75H13C13.6904 4.75 14.25 5.30964 14.25 6V6.25H9.75V6ZM8.25 6.25V6C8.25 4.48122 9.48122 3.25 11 3.25H13C14.5188 3.25 15.75 4.48122 15.75 6V6.25H18.8055H20C20.4142 6.25 20.75 6.58579 20.75 7C20.75 7.41421 20.4142 7.75 20 7.75H18.6983L17.8808 19.1959C17.778 20.635 16.5805 21.75 15.1378 21.75H8.86224C7.41948 21.75 6.22202 20.635 6.11923 19.1959L5.30166 7.75H4C3.58579 7.75 3.25 7.41421 3.25 7C3.25 6.58579 3.58579 6.25 4 6.25H5.19452H8.25ZM15 7.75H9H6.80548L7.61542 19.0891C7.66214 19.7432 8.20644 20.25 8.86224 20.25H15.1378C15.7936 20.25 16.3379 19.7432 16.3846 19.0891L17.1945 7.75H15ZM12.75 11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11ZM9 11.25C9.41421 11.25 9.75 11.5858 9.75 12V15C9.75 15.4142 9.41421 15.75 9 15.75C8.58579 15.75 8.25 15.4142 8.25 15V12C8.25 11.5858 8.58579 11.25 9 11.25ZM15.75 12C15.75 11.5858 15.4142 11.25 15 11.25C14.5858 11.25 14.25 11.5858 14.25 12V15C14.25 15.4142 14.5858 15.75 15 15.75C15.4142 15.75 15.75 15.4142 15.75 15V12Z"
      $fillColor={fillColor}
    />
  </StyledSVG>
);

export const EditIcon = ({
  fillColor = SecondaryTextColor,
  width = "24",
  height = "24",
  isChecked = false,
  isDisabled = false,
}: SVGProps) => (
  <StyledSVG
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    $width2={width}
    $height2={height}
  >
    <StyledPath
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.9446 5.94454C16.859 4.85898 15.141 4.85898 14.0555 5.94454L12.6413 7.35876L5.57021 14.4298C5.42955 14.5705 5.35054 14.7612 5.35054 14.9602L5.35053 17.7886C5.35054 18.2028 5.68632 18.5386 6.10054 18.5386L8.92896 18.5386C9.12788 18.5386 9.31864 18.4596 9.45929 18.3189L16.5304 11.2478L17.9446 9.83363C19.0301 8.74807 19.0301 7.0301 17.9446 5.94454ZM16 9.65685L16.8839 8.77297C17.3837 8.2732 17.3837 7.50498 16.8839 7.0052C16.3841 6.50543 15.6159 6.50543 15.1161 7.0052L14.2323 7.88909L16 9.65685ZM13.1716 8.94975L14.9394 10.7175L8.6183 17.0386H6.85054V15.2708L13.1716 8.94975Z"
      $fillColor={fillColor}
    />
  </StyledSVG>
);

export const CloseIcon = ({
  fillColor = SecondaryTextColor,
  width = "24",
  height = "24",
  isChecked = false,
  isDisabled = false,
}: SVGProps) => (
  <StyledSVG
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    $width2={width}
    $height2={height}
  >
    <StyledPath
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.48 7.58123C17.7729 7.28834 17.7729 6.81347 17.48 6.52057C17.1871 6.22768 16.7123 6.22768 16.4194 6.52057L12 10.94L7.58061 6.52057C7.28772 6.22768 6.81285 6.22768 6.51995 6.52057C6.22706 6.81347 6.22706 7.28834 6.51995 7.58123L10.9393 12.0006L6.51987 16.4201C6.22698 16.713 6.22698 17.1878 6.51987 17.4807C6.81276 17.7736 7.28764 17.7736 7.58053 17.4807L12 13.0613L16.4194 17.4807C16.7123 17.7736 17.1872 17.7736 17.4801 17.4807C17.773 17.1878 17.773 16.713 17.4801 16.4201L13.0606 12.0006L17.48 7.58123Z"
      $fillColor={fillColor}
    />
  </StyledSVG>
);

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

export const CheckBoxIcon = ({
  fillColor = PlainWhite,
  width = "16",
  height = "16",
  isChecked = false,
  isDisabled = false,
}: SVGProps): JSX.Element => {
  return (
    <StyledCheckbox $isChecked={isChecked} $isDisabled={isDisabled}>
      <StyledSVG
        width="16"
        height="16"
        viewBox={`0 0 24 24`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        $width2={width}
        $height2={height}
        visibility={isChecked ? "visible" : "hidden"}
      >
        <StyledPath
          x={0}
          y={0}
          cy={"0%"}
          cx={"0%"}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.5303 6.46967C20.8232 6.76256 20.8232 7.23744 20.5303 7.53033L10.5303 17.5303C10.2374 17.8232 9.76256 17.8232 9.46967 17.5303L4.46967 12.5303C4.17678 12.2374 4.17678 11.7626 4.46967 11.4697C4.76256 11.1768 5.23744 11.1768 5.53033 11.4697L10 15.9393L19.4697 6.46967C19.7626 6.17678 20.2374 6.17678 20.5303 6.46967Z"
          $fillColor={fillColor}
        />
      </StyledSVG>
    </StyledCheckbox>
  );
};

export const CheckIcon = ({
  fillColor = PlainWhite,
  width = "24",
  height = "24",
  isChecked = false,
  isDisabled = false,
}: SVGProps): JSX.Element => (
  <StyledSVG
    width="24"
    height="24"
    viewBox={`0 0 24 24`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    $width2={width}
    $height2={height}
  >
    <StyledPath
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.5303 6.46967C20.8232 6.76256 20.8232 7.23744 20.5303 7.53033L10.5303 17.5303C10.2374 17.8232 9.76256 17.8232 9.46967 17.5303L4.46967 12.5303C4.17678 12.2374 4.17678 11.7626 4.46967 11.4697C4.76256 11.1768 5.23744 11.1768 5.53033 11.4697L10 15.9393L19.4697 6.46967C19.7626 6.17678 20.2374 6.17678 20.5303 6.46967Z"
      $fillColor={fillColor}
    />
  </StyledSVG>
);

export const PlusIcon = ({
  fillColor = SecondaryTextColor,
  width = "24",
  height = "24",
  isChecked = false,
  isDisabled = false,
}: SVGProps): JSX.Element => (
  <StyledSVG
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    $width2={width}
    $height2={height}
  >
    <StyledPath
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 4.77419C13 4.34662 12.6642 4 12.25 4C11.8358 4 11.5 4.34662 11.5 4.77419L11.5 11.2506L5 11.2506C4.58579 11.2506 4.25 11.5864 4.25 12.0006C4.25 12.4148 4.58579 12.7506 5 12.7506L11.5 12.7506L11.5 19.2258C11.5 19.6534 11.8358 20 12.25 20C12.6642 20 13 19.6534 13 19.2258L13 12.7506L19 12.7506C19.4142 12.7506 19.75 12.4148 19.75 12.0006C19.75 11.5864 19.4142 11.2506 19 11.2506L13 11.2506L13 4.77419Z"
      $fillColor={fillColor}
    />
  </StyledSVG>
);

export const ExcelIcon = ({
  fillColor = SecondaryTextColor,
  width = "24",
  height = "24",
  isChecked = false,
  isDisabled = false,
}: SVGProps): JSX.Element => (
  <StyledSVG
    width="24"
    height="24"
    viewBox={`0 0 24 24`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    $width2={width}
    $height2={height}
  >
    <StyledPath
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6.75 4.5C6.05964 4.5 5.5 5.05964 5.5 5.75V13.75C5.5 14.1642 5.16421 14.5 4.75 14.5C4.33579 14.5 4 14.1642 4 13.75V5.75C4 4.23122 5.23122 3 6.75 3H13.75C13.9489 3 14.1397 3.07902 14.2803 3.21967L19.2803 8.21967C19.421 8.36032 19.5 8.55109 19.5 8.75V13.75C19.5 14.1642 19.1642 14.5 18.75 14.5C18.3358 14.5 18 14.1642 18 13.75V10.25H14.5C14.0359 10.25 13.5908 10.0656 13.2626 9.73744C12.9344 9.40925 12.75 8.96413 12.75 8.5V4.5H6.75ZM14.25 5.31066L17.6893 8.75H14.5C14.4337 8.75 14.3701 8.72366 14.3232 8.67678C14.2763 8.62989 14.25 8.5663 14.25 8.5V5.31066ZM17.8971 15.0807C16.4174 14.7847 15.2366 15.3515 14.9434 16.4322C14.8077 16.9324 14.9036 17.4797 15.2443 17.9034C15.5915 18.335 16.1314 18.5661 16.75 18.5661C17.0591 18.5661 17.2213 18.6656 17.2894 18.7327C17.3594 18.8019 17.3525 18.8497 17.3511 18.8569C17.3497 18.8638 17.3449 18.8815 17.3214 18.9083C17.2971 18.9361 17.2451 18.9815 17.1432 19.0252C16.9339 19.115 16.5339 19.1864 15.8733 19.0763C15.4647 19.0082 15.0783 19.2842 15.0102 19.6928C14.9421 20.1014 15.2181 20.4878 15.6267 20.5559C16.4661 20.6958 17.1784 20.6422 17.7343 20.4038C18.302 20.1604 18.7094 19.7154 18.8221 19.1503C19.0578 17.9687 17.9995 17.0661 16.75 17.0661C16.5083 17.0661 16.4304 16.9847 16.4132 16.9632C16.3894 16.9337 16.3741 16.8873 16.391 16.825C16.4063 16.7688 16.4581 16.6715 16.6189 16.5951C16.7838 16.5168 17.0943 16.4498 17.6029 16.5516C18.0091 16.6328 18.4042 16.3694 18.4855 15.9632C18.5667 15.557 18.3033 15.1619 17.8971 15.0807ZM11.25 15.0661C11.6642 15.0661 12 15.4019 12 15.8161V17.8161C12 18.5065 12.5596 19.0661 13.25 19.0661H13.75C14.1642 19.0661 14.5 19.4019 14.5 19.8161C14.5 20.2303 14.1642 20.5661 13.75 20.5661H13.25C11.7312 20.5661 10.5 19.3349 10.5 17.8161V15.8161C10.5 15.4019 10.8358 15.0661 11.25 15.0661ZM9.56468 20.3191C9.91187 20.0932 10.0102 19.6286 9.78429 19.2814L8.83564 17.8234L9.80771 16.381C10.0392 16.0375 9.9484 15.5714 9.6049 15.3399C9.26141 15.1084 8.7953 15.1992 8.56381 15.5427L7.9471 16.4578L7.34529 15.5329C7.11938 15.1857 6.6548 15.0874 6.30761 15.3133C5.96042 15.5392 5.8621 16.0038 6.088 16.3509L7.03661 17.8089L6.06453 19.2513C5.83304 19.5948 5.92384 20.0609 6.26734 20.2924C6.61083 20.5239 7.07694 20.4331 7.30843 20.0896L7.92514 19.1744L8.52701 20.0994C8.75291 20.4466 9.21749 20.545 9.56468 20.3191Z"
      $fillColor={fillColor}
    />
  </StyledSVG>
);

export const DownloadIcon = ({
  fillColor = SecondaryTextColor,
  width = "18",
  height = "19",
  isChecked = false,
  isDisabled = false,
}: SVGProps): JSX.Element => {
  return (
    <StyledSVG
      width="18"
      height="19"
      viewBox={`0 0 18 19`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      $width2={width}
      $height2={height}
    >
      <StyledPath
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.99999 0.25C9.41421 0.25 9.74999 0.585786 9.74999 1L9.75 11.1894L13.4697 7.46969C13.7626 7.1768 14.2374 7.1768 14.5303 7.46969C14.8232 7.76259 14.8232 8.23746 14.5303 8.53035L9.53033 13.5304C9.23744 13.8232 8.76256 13.8232 8.46967 13.5304L3.46967 8.53035C3.17678 8.23746 3.17678 7.76259 3.46967 7.46969C3.76256 7.1768 4.23744 7.1768 4.53033 7.46969L8.25 11.1894L8.24999 1C8.24999 0.585787 8.58578 0.25 8.99999 0.25ZM1 13.25C1.41421 13.25 1.75 13.5858 1.75 14V16C1.75 16.3315 1.8817 16.6495 2.11612 16.8839C2.35054 17.1183 2.66848 17.25 3 17.25H15C15.3315 17.25 15.6495 17.1183 15.8839 16.8839C16.1183 16.6495 16.25 16.3315 16.25 16V14C16.25 13.5858 16.5858 13.25 17 13.25C17.4142 13.25 17.75 13.5858 17.75 14V16C17.75 16.7294 17.4603 17.4288 16.9445 17.9446C16.4288 18.4603 15.7293 18.75 15 18.75H3C2.27065 18.75 1.57118 18.4603 1.05546 17.9446C0.539731 17.4288 0.25 16.7294 0.25 16V14C0.25 13.5858 0.585786 13.25 1 13.25Z"
        $fillColor={fillColor}
      />
    </StyledSVG>
  );
};

export const LeftArrowIcon = ({
  fillColor = SecondaryTextColor,
  width = "14",
  height = "10",
  isChecked = false,
  isDisabled = false,
}: SVGProps): JSX.Element => {
  return (
    <StyledSVG
      width="14"
      height="10"
      viewBox={`0 0 14 10`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      $width2={width}
      $height2={height}
    >
      <StyledPath
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.92016 0.453508C5.22198 0.737193 5.23668 1.21184 4.95299 1.51366L2.38107 4.25H13C13.4142 4.25 13.75 4.58579 13.75 5C13.75 5.41422 13.4142 5.75 13 5.75H2.38107L4.95299 8.48634C5.23668 8.78816 5.22198 9.26281 4.92016 9.5465C4.61834 9.83018 4.14369 9.81548 3.86 9.51366L0.719285 6.17216C0.0935729 5.50645 0.0935705 4.49356 0.719285 3.82784L3.86 0.486345C4.14369 0.184524 4.61834 0.169823 4.92016 0.453508Z"
        $fillColor={fillColor}
      />
    </StyledSVG>
  );
};

export const RightArrowIcon = ({
  fillColor = SecondaryTextColor,
  width = "14",
  height = "10",
  isChecked = false,
  isDisabled = false,
}: SVGProps): JSX.Element => {
  return (
    <StyledSVG
      width="14"
      height="10"
      viewBox={`0 0 14 10`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      $width2={width}
      $height2={height}
    >
      <StyledPath
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M9.07984 0.453508C8.77802 0.737193 8.76332 1.21184 9.04701 1.51366L11.6189 4.25H1C0.585787 4.25 0.25 4.58579 0.25 5C0.25 5.41422 0.585787 5.75 1 5.75H11.6189L9.04701 8.48634C8.76332 8.78816 8.77802 9.26281 9.07984 9.5465C9.38166 9.83018 9.85631 9.81548 10.14 9.51366L13.2807 6.17216C13.9064 5.50645 13.9064 4.49356 13.2807 3.82784L10.14 0.486345C9.85631 0.184524 9.38166 0.169823 9.07984 0.453508Z"
        $fillColor={fillColor}
      />
    </StyledSVG>
  );
};

export const SearchIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.75 10C3.75 6.54822 6.54822 3.75 10 3.75C13.4518 3.75 16.25 6.54822 16.25 10C16.25 13.4518 13.4518 16.25 10 16.25C6.54822 16.25 3.75 13.4518 3.75 10ZM10 2.25C5.71979 2.25 2.25 5.71979 2.25 10C2.25 14.2802 5.71979 17.75 10 17.75C11.87 17.75 13.5853 17.0877 14.9242 15.9848L20.4697 21.5303C20.7626 21.8232 21.2374 21.8232 21.5303 21.5303C21.8232 21.2374 21.8232 20.7626 21.5303 20.4697L15.9848 14.9242C17.0877 13.5853 17.75 11.87 17.75 10C17.75 5.71979 14.2802 2.25 10 2.25Z"
      fill="#605F5C"
    />
  </svg>
);

export const CommentIcon = ({
  fillColor = SecondaryTextColor,
  width = "24",
  height = "24",
}: SVGProps) => (
  <StyledSVG
    width="24"
    height="24"
    viewBox={`0 0 24 24`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    $width2={width}
    $height2={height}
  >
    <rect width="24" height="24" rx="4" fill="#F6F5F3" />
    <g clip-path="url(#clip0_2061_8219)">
      <StyledPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.9445 8.18058C8.57983 8.18058 8.23009 8.32545 7.97223 8.58331C7.71436 8.84117 7.5695 9.19091 7.5695 9.55558V16.3935L9.23152 14.7315C9.31747 14.6455 9.43405 14.5972 9.55561 14.5972H15.0556C15.4203 14.5972 15.77 14.4524 16.0279 14.1945C16.2857 13.9367 16.4306 13.5869 16.4306 13.2222V9.55558C16.4306 9.19091 16.2857 8.84117 16.0279 8.58331C15.77 8.32545 15.4203 8.18058 15.0556 8.18058H8.9445ZM7.32405 7.93513C7.75382 7.50536 8.33671 7.26392 8.9445 7.26392H15.0556C15.6634 7.26392 16.2463 7.50536 16.6761 7.93513C17.1058 8.3649 17.3473 8.94779 17.3473 9.55558V13.2222C17.3473 13.83 17.1058 14.4129 16.6761 14.8427C16.2463 15.2725 15.6634 15.5139 15.0556 15.5139H9.74546L7.43526 17.8241C7.30417 17.9552 7.10704 17.9944 6.93577 17.9235C6.7645 17.8525 6.65283 17.6854 6.65283 17.5V9.55558C6.65283 8.94779 6.89427 8.3649 7.32405 7.93513Z"
        $fillColor={fillColor}
      />
      <StyledPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.09717 10.1666C9.09717 9.91345 9.30237 9.70825 9.5555 9.70825H14.4444C14.6975 9.70825 14.9027 9.91345 14.9027 10.1666C14.9027 10.4197 14.6975 10.6249 14.4444 10.6249H9.5555C9.30237 10.6249 9.09717 10.4197 9.09717 10.1666Z"
        $fillColor={fillColor}
      />
      <StyledPath
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.09717 12.6112C9.09717 12.358 9.30237 12.1528 9.5555 12.1528H13.2222C13.4753 12.1528 13.6805 12.358 13.6805 12.6112C13.6805 12.8643 13.4753 13.0695 13.2222 13.0695H9.5555C9.30237 13.0695 9.09717 12.8643 9.09717 12.6112Z"
        $fillColor={fillColor}
      />
    </g>
    <defs>
      <clipPath id="clip0_2061_8219">
        <rect width="16" height="16" fill="white" transform="translate(4,4)" />
      </clipPath>
    </defs>
  </StyledSVG>
);
