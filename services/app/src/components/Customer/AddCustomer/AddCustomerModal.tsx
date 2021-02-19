import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from "@material-ui/core";
import {
  CompaniesInsertInput,
  CompanySettingsInsertInput,
  ContractsInsertInput,
  CustomersForBankDocument,
  ProductTypeEnum,
  useAddCustomerMutation,
} from "generated/graphql";
import { AllProductTypes, ProductTypeToLabel } from "lib/enum";
import { useState } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialog: {
      width: 400,
    },
    dialogTitle: {
      paddingLeft: theme.spacing(3),
      borderBottom: "1px solid #c7c7c7",
    },
    dialogActions: {
      margin: theme.spacing(4),
      marginTop: 0,
      marginBottom: 15,
    },
    input: {
      width: "100%",
    },
  })
);

interface Props {
  handleClose: () => void;
}

function AddCustomerModal({ handleClose }: Props) {
  const classes = useStyles();

  const [customer, setCustomer] = useState<CompaniesInsertInput>({});
  const [contract, setContract] = useState<ContractsInsertInput>({
    start_date: new Date(),
  });
  const [companySetting] = useState<CompanySettingsInsertInput>({});

  const [
    addCustomer,
    { loading: addCustomerLoading },
  ] = useAddCustomerMutation();

  const handleClickCreate = async () => {
    const response = await addCustomer({
      variables: {
        customer: {
          ...customer,
          settings: {
            data: {
              ...companySetting,
            },
          },
          contract: {
            data: {
              ...contract,
            },
          },
        },
      },
      refetchQueries: [
        {
          query: CustomersForBankDocument,
        },
      ],
    });

    if (!response.data) {
      alert("Error: could not create customer!");
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open onClose={handleClose} classes={{ paper: classes.dialog }}>
      <DialogTitle className={classes.dialogTitle}>Create Customer</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" mb={2}>
          <Box>
            <TextField
              className={classes.input}
              label="Company Name"
              placeholder="Distributor Example, Inc."
              value={customer.name || ""}
              onChange={({ target: { value } }) => {
                setCustomer({ ...customer, name: value });
              }}
            />
          </Box>
          <Box mt={3}>
            <TextField
              className={classes.input}
              label="Company Identifier (Unique Short Name)"
              placeholder="DEI"
              value={customer.identifier || ""}
              onChange={({ target: { value } }) => {
                setCustomer({ ...customer, identifier: value });
              }}
            />
          </Box>
          <Box mt={4}>
            <InputLabel id="select-product-type-label" required>
              Product Type
            </InputLabel>
            <Select
              className={classes.input}
              value={contract.product_type || ""}
              onChange={({ target: { value } }) => {
                setContract({
                  ...contract,
                  product_type: value as ProductTypeEnum,
                  product_config: {},
                });
              }}
              style={{ width: 200 }}
            >
              {AllProductTypes.map((productType) => {
                return (
                  <MenuItem key={productType} value={productType}>
                    {ProductTypeToLabel[productType as ProductTypeEnum]}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={addCustomerLoading}
          variant="contained"
          color="primary"
          onClick={handleClickCreate}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddCustomerModal;
