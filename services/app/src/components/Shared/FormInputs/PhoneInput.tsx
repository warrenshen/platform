import MuiPhoneInput from "material-ui-phone-number";

interface Props {
  isRequired?: boolean;
  value: string | null;
  label?: string;
  handleChange: (value: string | null) => void;
}

export default function PhoneInput({
  isRequired,
  value,
  label = "Phone Number",
  handleChange,
}: Props) {
  return (
    <MuiPhoneInput
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
