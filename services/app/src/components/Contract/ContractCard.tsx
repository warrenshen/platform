import {
  Box,
  Button,
  Card,
  CardContent,
  createStyles,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import ContractDrawerLauncher from "components/Contract/ContractDrawerLauncher";
import CreateUpdateContractModal from "components/Contract/CreateUpdateContractModal";
import TerminateContractModal from "components/Contract/TerminateContractModal";
import Can from "components/Shared/Can";
import ModalButton from "components/Shared/Modal/ModalButton";
import { ContractFragment } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { formatDateString } from "lib/date";
import { ActionType, ProductTypeToLabel } from "lib/enum";

interface Props {
  contract: ContractFragment;
  handleDataChange?: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 420,
      minHeight: 100,
    },
    label: {
      width: 200,
      color: grey[600],
    },
  })
);

function ContractCard({ contract, handleDataChange }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Product Type</Box>
            <Box>{ProductTypeToLabel[contract.product_type]}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Contract Start Date</Box>
            <Box>
              {contract.start_date
                ? formatDateString(contract.start_date)
                : null}
            </Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Contract Expected End Date</Box>
            <Box>
              {contract.end_date ? formatDateString(contract.end_date) : "-"}
            </Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Contract Termination Date</Box>
            <Box>
              {!!contract.terminated_at
                ? formatDateString(contract.adjusted_end_date)
                : "TBD"}
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" pb={0.25}>
            <Box className={classes.label}>
              <Typography variant="body2">Contract Terms</Typography>
            </Box>
            <Box display="flex" mt={1}>
              <ContractDrawerLauncher contractId={contract.id}>
                {(handleClick) => (
                  <Button size="small" variant="outlined" onClick={handleClick}>
                    View
                  </Button>
                )}
              </ContractDrawerLauncher>
              <Can perform={Action.EditTerms}>
                <Box ml={1}>
                  <ModalButton
                    label={"Edit"}
                    color="default"
                    size="small"
                    variant="outlined"
                    modal={({ handleClose }) => (
                      <CreateUpdateContractModal
                        actionType={ActionType.Update}
                        contractId={contract.id}
                        companyId={contract.company_id}
                        handleClose={() => {
                          if (handleDataChange) {
                            handleDataChange();
                          }
                          handleClose();
                        }}
                      />
                    )}
                  />
                </Box>
              </Can>
              <Can perform={Action.TerminateContract}>
                <Box ml={1}>
                  <ModalButton
                    label={"Terminate"}
                    color="default"
                    size="small"
                    variant="outlined"
                    modal={({ handleClose }) => (
                      <TerminateContractModal
                        contractId={contract.id}
                        handleClose={() => {
                          if (handleDataChange) {
                            handleDataChange();
                          }
                          handleClose();
                        }}
                      />
                    )}
                  />
                </Box>
              </Can>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ContractCard;
