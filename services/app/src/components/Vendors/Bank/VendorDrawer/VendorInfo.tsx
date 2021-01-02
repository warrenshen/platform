import { Box, Button, makeStyles, TextField } from "@material-ui/core";
import { useUpdateVendorInfoMutation, VendorFragment } from "generated/graphql";
import { useState } from "react";

interface Props {
  vendor: VendorFragment;
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

function VendorInfo(props: Props) {
  const classes = useStyles();
  const [editing, setEditing] = useState(false);
  const [editedVendor, setEditedVendor] = useState<VendorFragment>(
    props.vendor || {}
  );
  const [updateVendorContactInfo] = useUpdateVendorInfoMutation();

  const vendor = props.vendor;

  return editing ? (
    <>
      <Box className={classes.form}>
        <Box display="flex" justifyContent="space-between">
          <TextField
            label="Name"
            className={classes.baseInput}
            value={editedVendor?.name}
            onChange={({ target: { value } }) => {
              setEditedVendor({ ...editedVendor, name: value });
            }}
          ></TextField>
          <TextField
            label="Phone number"
            className={classes.baseInput}
            value={editedVendor?.phone_number}
            onChange={({ target: { value } }) => {
              setEditedVendor({ ...editedVendor, phone_number: value });
            }}
          ></TextField>
        </Box>

        <Box display="flex" flexDirection="column" my={3}>
          <TextField
            label="Address"
            value={editedVendor?.address}
            onChange={({ target: { value } }) => {
              setEditedVendor({ ...editedVendor, address: value });
            }}
          ></TextField>
          <Box display="flex" justifyContent="space-between" pt={1}>
            <TextField
              label="Country"
              className={classes.subInput}
              value={editedVendor?.country}
              onChange={({ target: { value } }) => {
                setEditedVendor({ ...editedVendor, country: value });
              }}
            ></TextField>
            <TextField
              label="State"
              className={classes.subInput}
              value={editedVendor?.state}
              onChange={({ target: { value } }) => {
                setEditedVendor({ ...editedVendor, state: value });
              }}
            ></TextField>
            <TextField
              label="City"
              className={classes.subInput}
              value={editedVendor?.city}
              onChange={({ target: { value } }) => {
                setEditedVendor({ ...editedVendor, city: value });
              }}
            ></TextField>
            <TextField
              label="Zip Code"
              className={classes.subInput}
              value={editedVendor?.zip_code}
              onChange={({ target: { value } }) => {
                setEditedVendor({ ...editedVendor, zip_code: value });
              }}
            ></TextField>
          </Box>
        </Box>
        <Box display="flex" flexDirection="row-reverse">
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={async () => {
              await updateVendorContactInfo({
                variables: {
                  id: editedVendor.id,
                  company: {
                    address: editedVendor.address,
                    city: editedVendor.city,
                    country: editedVendor.country,
                    name: editedVendor.name,
                    phone_number: editedVendor.phone_number,
                    state: editedVendor.state,
                    zip_code: editedVendor.zip_code,
                  },
                },
                optimisticResponse: {
                  update_companies_by_pk: {
                    ...editedVendor,
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
      {vendor.phone_number ? <Box>{vendor.phone_number}</Box> : null}
      {vendor.address && (
        <Box py={1}>
          <Box>
            <Box>{vendor.address}</Box>
            <Box>
              {vendor.city}, {vendor.state} {vendor.country} {vendor.zip_code}
            </Box>
          </Box>
        </Box>
      )}
      <Button variant="outlined" size="small" onClick={() => setEditing(true)}>
        Edit
      </Button>
    </Box>
  );
}

export default VendorInfo;
