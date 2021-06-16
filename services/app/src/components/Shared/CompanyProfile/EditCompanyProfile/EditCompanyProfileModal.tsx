import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
  TextField,
  Theme,
} from "@material-ui/core";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  CompanyFragment,
  useUpdateCompanyProfileMutation,
} from "generated/graphql";
import { useContext, useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogActions: {
      width: 500,
      margin: theme.spacing(2),
    },
  })
);

interface Props {
  company: CompanyFragment;
  handleClose: () => void;
}

export default function EditCompanyProfileModal({
  company: companyToEdit,
  handleClose,
}: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const [company, setCompany] = useState(companyToEdit);

  const [
    updateCompany,
    { loading: updateCompanyLoading },
  ] = useUpdateCompanyProfileMutation();

  return (
    <Dialog open onClose={handleClose} maxWidth="md">
      <DialogTitle>Edit Company</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please provide details about company.
        </DialogContentText>
        <Box display="flex" flexDirection="column" mt={4}>
          <TextField
            disabled={!isBankUser}
            label="Identifier (Unique Short Code)"
            required
            value={company.identifier || ""}
            onChange={({ target: { value } }) =>
              setCompany({
                ...company,
                identifier: value,
              })
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <TextField
            disabled={!isBankUser}
            label="Name"
            required
            value={company.name || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, name: value })
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <TextField
            disabled={!isBankUser}
            label="Contract Name"
            required
            value={company.contract_name || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, contract_name: value })
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <TextField
            disabled={!isBankUser}
            label="DBA"
            value={company.dba_name || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, dba_name: value })
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <TextField
            label="Address"
            value={company.address || ""}
            onChange={({ target: { value } }) =>
              setCompany({ ...company, address: value })
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <PhoneInput
            value={company.phone_number || null}
            handleChange={(value) =>
              setCompany({
                ...company,
                phone_number: value,
              })
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={4}>
          <TextField
            label="EIN"
            value={company.employer_identification_number || ""}
            onChange={({ target: { value } }) =>
              setCompany({
                ...company,
                employer_identification_number: value,
              })
            }
          />
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Box display="flex">
          <Box mr={2}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={updateCompanyLoading}
            onClick={async () => {
              await updateCompany({
                variables: {
                  id: company.id,
                  company: {
                    identifier: isBankUser ? company.identifier : undefined,
                    name: isBankUser ? company.name : undefined,
                    contract_name: isBankUser
                      ? company.contract_name
                      : undefined,
                    dba_name: isBankUser ? company.dba_name : undefined,
                    address: company.address,
                    phone_number: company.phone_number,
                    employer_identification_number:
                      company.employer_identification_number,
                  },
                },
              });
              handleClose();
            }}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
