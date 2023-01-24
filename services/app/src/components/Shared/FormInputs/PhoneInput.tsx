import MuiPhoneInput from "material-ui-phone-number";

interface Props {
  isRequired?: boolean;
  value: string | null;
  label?: string;
  dataCy?: string;
  handleChange: (value: string | null) => void;
}

export default function PhoneInput({
  isRequired,
  value,
  label = "Phone Number",
  dataCy = "",
  handleChange,
}: Props) {
  return (
    <MuiPhoneInput
      data-cy={dataCy}
      disableAreaCodes
      required={isRequired}
      defaultCountry={"us"}
      regions={["america", "asia", "europe", "oceania"]}
      label={label}
      value={value}
      onChange={(value: string | null, countryData: any) => handleChange(value)}
    />
  );
}
