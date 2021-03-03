import {
  Box,
  Button,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useEffect, useState } from "react";

const useStyles = makeStyles({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    marginRight: "1rem",
  },
  action: {
    width: 32,
    padding: 0,
    minWidth: "initial",
  },
});

interface Props {
  name?: string;
  fields: any;
  showValidationResult?: boolean;
  initialValues?: any[][];
  handleChange: (value: any, error: boolean) => void;
}

function DynamicFormInput({
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
      {rows.map((row, i) => (
        <Box key={i} className={classes.row} mb={1}>
          {Object.keys(row).map((key) => {
            const field = fields.find((f: any) => f.display_name === key);
            return (
              <div key={key + i}>
                <TextField
                  className={classes.input}
                  error={
                    showValidationResult && isFieldInvalid(row[key], field)
                  }
                  label={key}
                  placeholder=""
                  required={!field.nullable}
                  value={row[key]}
                  onChange={({ target: { value } }) => {
                    handleChangeInput(value, key, i);
                  }}
                />
              </div>
            );
          })}
          <Button
            className={classes.action}
            variant="outlined"
            onClick={() => handleRemoveInputRow(i)}
          >
            –
          </Button>
        </Box>
      ))}
      <Button
        className={classes.action}
        variant="outlined"
        onClick={handleAddInputRow}
      >
        +
      </Button>
    </Box>
  );
}

export default DynamicFormInput;
