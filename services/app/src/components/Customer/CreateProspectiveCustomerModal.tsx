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

export default function CreateProspectiveCustomerModal({ handleClose }: Props) {
  const snackbar = useSnackbar();
  const classes = useStyles();

  const [customer, setCustomer] = useState<CompaniesInsertInput>({
    id: null,
    name: null,
    identifier: null,
    dba_name: null,
  });

  const handleClickCreate = async () => {
    const response = await createProspectiveCustomer({
      company: customer,
    });

    if (response.status !== "OK") {
      snackbar.showError(
        `Could not create prospective customer! Error: ${response.msg}`
      );
    } else {
      snackbar.showSuccess("Prospective customer created.");
      handleClose();
    }
  };

  const hasCustomerFieldsSet =
    customer.id || (customer.name && customer.identifier);

  const isSubmitDisabled = !hasCustomerFieldsSet;

  const companyExists = !!customer.id;

  return (
    <Modal
      dataCy={"create-customer-modal"}
      isPrimaryActionDisabled={isSubmitDisabled}
      title={"Create Prospective Customer"}
      primaryActionText={"Save"}
      handleClose={handleClose}
      handlePrimaryAction={handleClickCreate}
    >
      <Box display="flex" flexDirection="column">
        <Box mb={2}>
          <Typography variant="h6">Company Information</Typography>
        </Box>
        {!companyExists && (
          <>
            <Box mt={2}>
              <TextField
                data-cy={"customer-form-input-name"}
                className={classes.input}
                label="Customer Name"
                placeholder="Distributor Example"
                value={customer.name || ""}
                onChange={({ target: { value } }) =>
                  setCustomer({ ...customer, name: value })
                }
              />
            </Box>
            <Box mt={2}>
              <TextField
                data-cy={"customer-form-input-identifier"}
                className={classes.input}
                label="Company Identifier (Unique Short Name)"
                placeholder="DE"
                value={customer.identifier || ""}
                onChange={({ target: { value } }) =>
                  setCustomer({ ...customer, identifier: value })
                }
              />
            </Box>
            <Box mt={2}>
              <TextField
                data-cy={"customer-form-input-dba"}
                className={classes.input}
                label="DBA"
                placeholder="DBA 1, DBA 2"
                value={customer.dba_name || ""}
                onChange={({ target: { value } }) =>
                  setCustomer({ ...customer, dba_name: value })
                }
              />
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
}
