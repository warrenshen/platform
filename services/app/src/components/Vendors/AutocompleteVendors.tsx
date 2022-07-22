import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  GetArtifactRelationsByCompanyIdQuery,
  Vendors,
} from "generated/graphql";

interface Props {
  onChange: (event: any, newValue: any) => void;
  selectableVendors: GetArtifactRelationsByCompanyIdQuery["vendors"];
  selectedVendor?: Vendors | null;
  dataCy: string;
  label: string;
}

function AutocompleteVendors({
  onChange,
  selectableVendors,
  selectedVendor,
  dataCy,
  label,
}: Props) {
  return (
    <Autocomplete
      data-cy={dataCy}
      autoHighlight
      id="auto-complete-vendor"
      value={selectedVendor}
      options={selectableVendors}
      getOptionLabel={(vendor) => {
        return `${vendor.name} ${
          !!vendor.company_vendor_partnerships[0]?.approved_at
            ? "[Approved]"
            : "[Not Approved]"
        }`;
      }}
      renderInput={(params) => {
        return <TextField {...params} label={label} variant="outlined" />;
      }}
      onChange={onChange}
    />
  );
}

export default AutocompleteVendors;
