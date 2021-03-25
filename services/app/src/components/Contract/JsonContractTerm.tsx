import { Box, Typography } from "@material-ui/core";
import { ProductConfigField } from "lib/contracts";

interface Props {
  fields: ProductConfigField[];
  value: any;
}

function JsonContractTerm({ fields, value }: Props) {
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex">
        {fields.map((field, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent="flex-start"
            width={150}
          >
            <Typography key={field.display_name}>
              {field.display_name}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex" flexDirection="column">
        {Object.keys(value).map((key) => (
          <Box key={key} display="flex">
            <Box display="flex" justifyContent="flex-start" width={150}>
              <Typography>{key}</Typography>
            </Box>
            <Box display="flex" justifyContent="flex-start" width={150}>
              <Typography>{`${value[key]}${
                fields[1]?.format === "percentage" ? "%" : ""
              }`}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default JsonContractTerm;
