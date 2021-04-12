import MuiPhoneInput from "material-ui-phone-number";

interface Props {
  isRequired?: boolean;
  value: string | null;
  handleChange: (value: string | null) => void;
}

export default function PhoneInput({ isRequired, value, handleChange }: Props) {
  return (
    <MuiPhoneInput
      disableAreaCodes
      required={isRequired}
      defaultCountry={"us"}
      regions={["america", "europe"]}
      label={"Phone Number"}
      value={value}
      onChange={(value: string | null, countryData: any) => handleChange(value)}
    />
  );
}
