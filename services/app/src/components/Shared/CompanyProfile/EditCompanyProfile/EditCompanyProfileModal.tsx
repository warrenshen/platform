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
  CompanyDocument,
  CompanyFragment,
  useUpdateCompanyProfileMutation,
} from "generated/graphql";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nameInput: {
      width: 400,
    },
    addressForm: {
      width: 600,
    },
    addressSubForm: {
      width: 140,
    },
  })
);

interface Props {
  company: CompanyFragment;
  handleClose: () => void;
}

function EditCompanyProfileModal({
  company: companyToEdit,
  handleClose,
}: Props) {
  const classes = useStyles();
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
        <Box pb={3} pt={2}>
          <TextField
            label="Name"
            required
            className={classes.nameInput}
            value={company?.name || ""}
            onChange={({ target: { value } }) => {
              setCompany({ ...company, name: value });
            }}
          />
        </Box>
        <Box pb={3} pt={2}>
          <TextField
            label="Identifier (Unique Short Code)"
            required
            className={classes.nameInput}
            value={company?.identifier || ""}
            onChange={({ target: { value } }) => {
              setCompany({
                ...company,
                identifier: value,
              } as CompanyFragment);
            }}
          />
        </Box>
        <Box pb={3} pt={2}>
          <TextField
            label="Address"
            className={classes.nameInput}
            value={company?.address || ""}
            onChange={({ target: { value } }) => {
              setCompany({ ...company, address: value });
            }}
          />
        </Box>
        <Box pb={3} pt={2}>
          <PhoneInput
            value={company?.phone_number || null}
            handleChange={(value) =>
              setCompany({
                ...company,
                phone_number: value,
              })
            }
          />
        </Box>
        <Box pb={3} pt={2}>
          <TextField
            label="DBA"
            className={classes.nameInput}
            value={company?.dba_name || ""}
            onChange={({ target: { value } }) => {
              setCompany({ ...company, dba_name: value });
            }}
          />
        </Box>
        <Box pb={3} pt={2}>
          <TextField
            label="EIN"
            className={classes.nameInput}
            value={company?.employer_identification_number || ""}
            onChange={({ target: { value } }) => {
              setCompany({
                ...company,
                employer_identification_number: value,
              } as CompanyFragment);
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={handleClose}>Cancel</Button>
          </Box>
          <Button
            disabled={updateCompanyLoading}
            onClick={async () => {
              await updateCompany({
                variables: {
                  id: company?.id,
                  company: {
                    identifier: company?.identifier,
                    address: company?.address,
                    phone_number: company?.phone_number,
                    employer_identification_number:
                      company?.employer_identification_number,
                    dba_name: company?.dba_name,
                    name: company?.name,
                  },
                },
                refetchQueries: [
                  {
                    query: CompanyDocument,
                    variables: {
                      companyId: company?.id,
                    },
                  },
                ],
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

export default EditCompanyProfileModal;
