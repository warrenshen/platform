import { Box, Button, makeStyles, TextField } from "@material-ui/core";
import Can from "components/Shared/Can";
import PhoneInput from "components/Shared/FormInputs/PhoneInput";
import {
  ThirdPartyFragment,
  useUpdateCompanyInfoMutation,
} from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";

interface Props {
  company: ThirdPartyFragment;
  editAction: Action;
}

const useStyles = makeStyles({
  form: {
    width: 600,
  },
  baseInput: {
    width: 280,
  },
  subInput: {
    width: 140,
  },
});

export default function ThirdPartyInfo({ company, editAction }: Props) {
  const classes = useStyles();
  const [editing, setEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<ThirdPartyFragment>(
    company
  );
  const [updateCompanyInfo] = useUpdateCompanyInfoMutation();

  return editing ? (
    <>
      <Box className={classes.form}>
        <Box display="flex" justifyContent="space-between">
          <TextField
            label="Name"
            className={classes.baseInput}
            value={editedCompany?.name}
            onChange={({ target: { value } }) => {
              setEditedCompany({ ...editedCompany, name: value });
            }}
          />
          <PhoneInput
            isRequired
            value={editedCompany?.phone_number || null}
            handleChange={(value) =>
              setEditedCompany({ ...editedCompany, phone_number: value })
            }
          />
        </Box>
        <Box display="flex" flexDirection="column" my={3}>
          <TextField
            label="Address"
            value={editedCompany?.address}
            onChange={({ target: { value } }) => {
              setEditedCompany({ ...editedCompany, address: value });
            }}
          />
          <Box display="flex" justifyContent="space-between" pt={1}>
            <TextField
              label="Country"
              className={classes.subInput}
              value={editedCompany?.country}
              onChange={({ target: { value } }) => {
                setEditedCompany({ ...editedCompany, country: value });
              }}
            />
            <TextField
              label="State"
              className={classes.subInput}
              value={editedCompany?.state}
              onChange={({ target: { value } }) => {
                setEditedCompany({ ...editedCompany, state: value });
              }}
            />
            <TextField
              label="City"
              className={classes.subInput}
              value={editedCompany?.city}
              onChange={({ target: { value } }) => {
                setEditedCompany({ ...editedCompany, city: value });
              }}
            />
            <TextField
              label="Zip Code"
              className={classes.subInput}
              value={editedCompany?.zip_code}
              onChange={({ target: { value } }) => {
                setEditedCompany({ ...editedCompany, zip_code: value });
              }}
            />
          </Box>
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={async () => {
              await updateCompanyInfo({
                variables: {
                  id: editedCompany.id,
                  company: {
                    address: editedCompany.address,
                    city: editedCompany.city,
                    country: editedCompany.country,
                    name: editedCompany.name,
                    phone_number: editedCompany.phone_number,
                    state: editedCompany.state,
                    zip_code: editedCompany.zip_code,
                  },
                },
                optimisticResponse: {
                  update_companies_by_pk: {
                    ...editedCompany,
                  },
                },
              });
              setEditing(false);
            }}
          >
            Save
          </Button>
          <Box mr={1}>
            <Button
              size="small"
              onClick={() => {
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  ) : (
    <Box>
      {company.phone_number ? <Box>{company.phone_number}</Box> : null}
      {company.address && (
        <Box py={1}>
          <Box>
            <Box>{company.address}</Box>
            <Box>
              {company.city}, {company.state} {company.country}{" "}
              {company.zip_code}
            </Box>
          </Box>
        </Box>
      )}
      <Can perform={editAction}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
      </Can>
    </Box>
  );
}
