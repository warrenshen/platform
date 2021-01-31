import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from "@material-ui/core";
import { useState } from "react";

// Configuration which defines how to view and edit this contract
export type ContractConfig = {
  product_type: string;
  product_config: object;
  isViewOnly: boolean;
};

interface Props {
  onClose: () => void;
  onSave: (newContractConfig: ContractConfig) => void | null;
  contractConfig: ContractConfig;
}

// NOTE: We should be able to use this modal for both editing and viewing a contract.
function ContractTermsModal(props: Props) {
  const config = props.contractConfig;
  const [productConfigStr, setProductConfigStr] = useState<string>(
    JSON.stringify(config.product_config)
  );
  const [errMsg, setErrMsg] = useState<string>("");
  const viewOnly = props.contractConfig.isViewOnly;

  return (
    <Dialog open onClose={props.onClose} fullWidth>
      <DialogTitle>Contract Terms</DialogTitle>
      <DialogContent style={{ height: 500 }}>
        <Box display="flex" flexDirection="column">
          <FormControl style={{ width: 200 }}></FormControl>
          <Box mt={3}>
            <TextField
              disabled={viewOnly}
              label="Product Config"
              placeholder='{"financing_terms": {"total_limit": 50.0}}'
              value={productConfigStr}
              onChange={({ target: { value } }) => {
                setProductConfigStr(value);
              }}
            ></TextField>
          </Box>
          {errMsg && <Box mt={3}>{errMsg}</Box>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex">
          <Box pr={1}>
            <Button onClick={props.onClose}>Cancel</Button>
            {!config.isViewOnly && (
              <Button
                onClick={() => {
                  try {
                    JSON.parse(productConfigStr);
                    setErrMsg("");
                  } catch (error) {
                    setErrMsg("Product config is not valid JSON");
                    return;
                  }

                  props.onSave({
                    product_type: config.product_type,
                    product_config: JSON.parse(productConfigStr),
                    isViewOnly: config.isViewOnly,
                  });
                }}
                variant="contained"
                color="primary"
              >
                Set
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ContractTermsModal;
