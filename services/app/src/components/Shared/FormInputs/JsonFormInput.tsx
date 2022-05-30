import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { useEffect, useState } from "react";

const useStyles = makeStyles({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  action: {
    width: 32,
    padding: 0,
    minWidth: "initial",
  },
});

interface Props {
  dataCy?: string;
  name?: string;
  fields: any;
  showValidationResult?: boolean;
  initialValues?: any[][];
  handleChange: (value: any, error: boolean) => void;
}

export default function JsonFormInput({
  dataCy,
  name,
  fields,
  showValidationResult,
  handleChange,
  initialValues,
}: Props) {
  const classes = useStyles();
  const rowTemplate = fields.reduce((result: any, field: any) => {
    result[field.display_name] = "";
    return result;
  }, {});

  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let initialRows: any[] = [];
    if (initialValues) {
      initialRows = initialValues;
    } else {
      initialRows = [rowTemplate];
    }
    setRows(initialRows);
    const initValidationResult = isFieldInvalids(initialRows);
    handleChange(initialRows, initValidationResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChangeInput(value: string, key: string, i: number): void {
    const currentRows = [...rows];
    currentRows[i][key] = value;
    setRows(currentRows);
    const validationResult = isFieldInvalids();
    handleChange(currentRows, validationResult);
  }

  function handleAddInputRow(): void {
    const currentRows = [...rows];
    currentRows.push(rowTemplate);
    setRows(currentRows);
  }

  function handleRemoveInputRow(i: number): void {
    if (rows.length > 1) {
      const currentRows = [...rows];
      currentRows.splice(i, 1);
      setRows(currentRows);
      const validationResult = isFieldInvalids();
      handleChange(currentRows, validationResult);
    }
  }

  function isFieldInvalid(value: string, field: any): boolean {
    let error = false;
    if (!field.nullable) {
      error = !value || !value.length;
    }
    return error;
  }

  function isFieldInvalids(currentRows: any[] = rows): boolean {
    let error = 0;
    currentRows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        const field = fields.find((f: any) => f.display_name === key);
        if (!field.nullable) {
          if (!row[key] || !row[key].length) error += 1;
        }
      });
    });
    return error === 0;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box mb={0.5}>
        <Typography variant="caption">{name}</Typography>
      </Box>
      {rows.map((row, xIndex) => (
        <Box key={xIndex} className={classes.row} mb={1}>
          {Object.keys(row).map((key, yIndex) => {
            const field = fields.find((f: any) => f.display_name === key);

            if (field.options) {
              const idString = `select-${field.display_name
                .toLowerCase()
                .replace(/s/g, "-")}`;

              return (
                <FormControl key={`${idString}-form-control`}>
                  <InputLabel id={`${idString}-input-label`}>{key}</InputLabel>
                  <Select
                    data-cy={
                      !!dataCy ? `${dataCy}-${xIndex}-${yIndex}` : undefined
                    }
                    id={idString}
                    labelId={`${idString}-label`}
                    value={row[key]}
                    style={{ width: 200, marginRight: 6 }}
                    onChange={({ target: { value } }) =>
                      handleChangeInput(value as string, key, xIndex)
                    }
                  >
                    {field.options.map((option: any, zIndex: number) => (
                      <MenuItem
                        data-cy={
                          !!dataCy
                            ? `${dataCy}-${xIndex}-${yIndex}-menu-item-${
                                zIndex + 1
                              }`
                            : undefined
                        }
                        key={option.value}
                        value={option.value}
                      >
                        {option.display_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            } else {
              return (
                <Box key={key + yIndex} mr={1}>
                  <TextField
                    data-cy={
                      !!dataCy ? `${dataCy}-${xIndex}-${yIndex}` : undefined
                    }
                    error={
                      showValidationResult && isFieldInvalid(row[key], field)
                    }
                    label={key}
                    placeholder=""
                    required={!field.nullable}
                    value={row[key]}
                    onChange={({ target: { value } }) =>
                      handleChangeInput(value, key, xIndex)
                    }
                  />
                </Box>
              );
            }
          })}
          <Button
            data-cy={!!dataCy ? `${dataCy}-remove-button` : undefined}
            className={classes.action}
            variant="outlined"
            onClick={() => handleRemoveInputRow(xIndex)}
          >
            –
          </Button>
        </Box>
      ))}
      <Button
        data-cy={!!dataCy ? `${dataCy}-add-button` : undefined}
        className={classes.action}
        variant="outlined"
        onClick={handleAddInputRow}
      >
        +
      </Button>
    </Box>
  );
}
