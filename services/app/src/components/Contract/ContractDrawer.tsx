import {
  Box,
  createStyles,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import JsonContractTerm from "components/Contract/JsonContractTerm";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { Contracts, useGetContractQuery } from "generated/graphql";
import {
  ContractTermNames,
  createProductConfigFieldsFromContract,
  getContractTermCustomerDescription,
  getContractTermIsHiddenIfNull,
} from "lib/contracts";
import { formatCurrency } from "lib/currency";
import { formatDateString } from "lib/date";
import { ProductTypeEnum, ProductTypeToLabel } from "lib/enum";
import { groupBy } from "lodash";
import { useContext } from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerContent: {
      width: 500,
      paddingBottom: theme.spacing(16),
    },
    propertyLabel: {
      flexGrow: 1,
    },
  })
);

interface Props {
  contractId: Contracts["id"];
  handleClose: () => void;
}

// TODO: Refactor this contract render logic with ContractModal?
const renderSwitchHelper = (item: any) => {
  if (item.type === "date") {
    return item.value ? formatDateString(item.value as string) : "-";
  } else if (item.type === "float") {
    if (item.format === "percentage") {
      return `${item.value}%`;
    } else if (item.format === "currency") {
      return formatCurrency(item.value);
    } else {
      return item.value;
    }
  } else if (item.type === "boolean") {
    return item.value ? "Yes" : "No";
  } else {
    return item.value;
  }
};

const renderSwitch = (item: any) => {
  if (item.type === "json") {
    return <JsonContractTerm fields={item.fields} value={item.value} />;
  } else {
    return (
      <Typography variant={"body1"}>{renderSwitchHelper(item)}</Typography>
    );
  }
};

function ContractDrawer({ contractId, handleClose }: Props) {
  const classes = useStyles();

  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data } = useGetContractQuery({
    variables: {
      id: contractId,
    },
  });

  const contract = data?.contracts_by_pk;
  const currentJSONConfig = contract
    ? createProductConfigFieldsFromContract(contract)
    : [];
  const sections = groupBy(currentJSONConfig, (d) => d.section);

  return contract ? (
    <Drawer open anchor="right" onClose={handleClose}>
      <Box className={classes.drawerContent} p={4}>
        <Typography variant="h5">Contract</Typography>
        <Box display="flex" flexDirection="column">
          {isBankUser && (
            <Box display="flex" flexDirection="column" mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer
              </Typography>
              <Typography variant={"body1"}>
                {contract.company?.name}
              </Typography>
            </Box>
          )}
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Product Type
            </Typography>
            <Typography variant={"body1"}>
              {ProductTypeToLabel[contract.product_type as ProductTypeEnum]}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Start Date
            </Typography>
            <Typography variant={"body1"}>
              {formatDateString(contract.start_date)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Expected End Date
            </Typography>
            <Typography variant={"body1"}>
              {contract.end_date ? formatDateString(contract.end_date) : "-"}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Typography variant="subtitle2" color="textSecondary">
              Termination Date
            </Typography>
            <Typography variant={"body1"}>
              {!!contract.terminated_at
                ? formatDateString(contract.adjusted_end_date)
                : "TBD"}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={2}>
            <Box mb={2}>
              <Divider light />
            </Box>
            <Typography variant="h5">Contract Details</Typography>
            {Object.entries(sections).map(([sectionName, content]) => (
              <Box key={sectionName} mt={2}>
                <Typography variant="h6">{sectionName}</Typography>
                {content.map((item) =>
                  !(
                    (getContractTermIsHiddenIfNull(
                      item.internal_name as ContractTermNames
                    ) &&
                      item.value === null) ||
                    item.is_hidden
                  ) ? (
                    <Box key={item.internal_name} mt={2}>
                      <FormControl fullWidth>
                        <Typography variant="subtitle2" color="textSecondary">
                          {item.display_name}
                        </Typography>
                        {renderSwitch(item)}
                        <FormHelperText id={item.display_name}>
                          {getContractTermCustomerDescription(
                            item.internal_name as ContractTermNames
                          )}
                        </FormHelperText>
                      </FormControl>
                    </Box>
                  ) : null
                )}
              </Box>
            ))}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            mt={2}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Platform ID
            </Typography>
            <Typography variant={"body1"}>{contract.id}</Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  ) : null;
}

export default ContractDrawer;
