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
import TerminateContractModal from "components/Contract/TerminateContractModal";
import UpdateContractTermsModal from "components/Contract/UpdateContractModal";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import { ContractFragment, UserRolesEnum } from "generated/graphql";
import { formatDateString } from "lib/date";
import { ProductTypeToLabel } from "lib/enum";
import { useContext, useState } from "react";

interface Props {
  contract: ContractFragment;
  handleDataChange?: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 300,
      minHeight: 100,
    },
    label: {
      width: 130,
      color: grey[600],
    },
  })
);

function ContractCard({ contract, handleDataChange }: Props) {
  const classes = useStyles();
  const {
    user: { role },
  } = useContext(CurrentUserContext);

  const isBankUser = role === UserRolesEnum.BankAdmin;

  const [
    isEditContractTermsModalOpen,
    setIsEditContractTermsModalOpen,
  ] = useState(false);
  const [
    isTerminateContractModalOpen,
    setIsTerminateContractModalOpen,
  ] = useState(false);

  return (
    <Card className={classes.card}>
      {isEditContractTermsModalOpen && (
        <UpdateContractTermsModal
          contractId={contract.id}
          handleClose={() => {
            if (handleDataChange) {
              handleDataChange();
            }
            setIsEditContractTermsModalOpen(false);
          }}
        />
      )}
      {isTerminateContractModalOpen && (
        <TerminateContractModal
          contractId={contract.id}
          handleClose={() => {
            if (handleDataChange) {
              handleDataChange();
            }
            setIsTerminateContractModalOpen(false);
          }}
        />
      )}
      <CardContent>
        <Box display="flex" flexDirection="column">
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Product Type</Box>
            <Box>{ProductTypeToLabel[contract.product_type]}</Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>Start Date</Box>
            <Box>
              {contract.start_date
                ? formatDateString(contract.start_date)
                : null}
            </Box>
          </Box>
          <Box display="flex" pb={0.25}>
            <Box className={classes.label}>End Date</Box>
            <Box>
              {contract.end_date ? formatDateString(contract.end_date) : "-"}
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
              {isBankUser && (
                <Box ml={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setIsEditContractTermsModalOpen(true)}
                  >
                    Edit
                  </Button>
                </Box>
              )}
              {isBankUser && (
                <Box ml={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setIsTerminateContractModalOpen(true)}
                  >
                    Terminate
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ContractCard;
