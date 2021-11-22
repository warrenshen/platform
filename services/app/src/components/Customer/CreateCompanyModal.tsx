import {
  Box,
  createStyles,
  makeStyles,
  TextField,
  Theme,
  Typography,
} from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import { CompaniesInsertInput } from "generated/graphql";
import useSnackbar from "hooks/useSnackbar";
import { createProspectiveCustomer } from "lib/api/companies";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 500,
    },
    dialogTitle: {
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(2),
    },
    input: {
      width: "100%",
    },
  })
);

interface Props {
  handleClose: () => void;
}

export default function CreateCompanyModal({ handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [company, setCompany] = useState<CompaniesInsertInput>({
    id: null,
    name: null,
    identifier: null,
    dba_name: null,
  });

  const handleClickCreate = async () => {
    const response = await createProspectiveCustomer({
      company: company,
    });

    if (response.status !== "OK") {
      snackbar.showError(`Could not create company! Error: ${response.msg}`);
    } else {
      snackbar.showSuccess("Company created.");
      handleClose();
    }
  };

  const isSubmitDisabled = !company.name || !company.identifier;

  return (
    <Modal
      dataCy={"create-company-modal"}
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Company"}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickCreate}
    >
      <Box display="flex" flexDirection="column">
        <Box mb={2}>
          <Typography variant="h6">Company Information</Typography>
        </Box>
        <Box mt={2}>
          <TextField
            data-cy={"company-form-input-name"}
            autoFocus
            className={classes.input}
            label="Company Name"
            placeholder="Distributor Example"
            value={company.name || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, name: value })
            }
          />
        </Box>
        <Box mt={2}>
          <TextField
            data-cy={"customer-form-input-identifier"}
            className={classes.input}
            label="Company Identifier (Unique Short Name)"
            placeholder="DE"
            value={company.identifier || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, identifier: value })
            }
          />
        </Box>
        <Box mt={2}>
          <TextField
            data-cy={"customer-form-input-dba"}
            className={classes.input}
            label="DBA"
            placeholder="DBA 1, DBA 2"
            value={company.dba_name || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, dba_name: value })
            }
          />
        </Box>
      </Box>
    </Modal>
  );
}
