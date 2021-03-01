import { useState, useEffect } from "react";
import { TextField, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  input: {
    marginRight: "1rem",
  },
  action: {
    marginRight: "1rem",
    "&:hover": {
      cursor: "pointer",
    },
  },
  sectionName: {},
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
    const initValidationResult = validateFields(initialRows);
    handleChange(initialRows, initValidationResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChangeInput(value: string, key: string, i: number): void {
    const currentRows = [...rows];
    currentRows[i][key] = value;
    setRows(currentRows);
    const validationResult = validateFields();
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
      const validationResult = validateFields();
      handleChange(currentRows, validationResult);
    }
  }

  function validateField(value: string, field: any): boolean {
    let error = false;
    if (!field.nullable) {
      error = !value || !value.length;
    }
    return error;
  }

  function validateFields(currentRows: any[] = rows): boolean {
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
    <div>
      <Typography variant="caption" className={classes.sectionName}>
        {name}
      </Typography>
      {rows.map((row, i) => (
        <div key={i} className={classes.row}>
          {Object.keys(row).map((key) => {
            const field = fields.find((f: any) => f.display_name === key);
            return (
              <div key={key + i}>
                <TextField
                  className={classes.input}
                  error={showValidationResult && validateField(row[key], field)}
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
          {i !== 0 ? (
            <div
              className={classes.action}
              onClick={() => handleRemoveInputRow(i)}
            >
              –
            </div>
          ) : (
            <div className={classes.action} onClick={handleAddInputRow}>
              +
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DynamicFormInput;
