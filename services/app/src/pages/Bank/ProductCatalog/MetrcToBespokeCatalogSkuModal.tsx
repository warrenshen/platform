import { Box, DialogActions, DialogContent } from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import SelectDropdown from "components/Shared/FormInputs/SelectDropdown";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import { MetrcToBespokeCatalogSkuConfidenceLabels } from "lib/enum";

interface Props {
  skuConfidence: string;
  setSkuConfidence: (confidence: string) => void;
  handleClose: () => void;
  handleClickConfirm: () => void;
  children?: JSX.Element | JSX.Element[];
}

const MetrcToBespokeCatalogSkuModal = ({
  skuConfidence,
  setSkuConfidence,
  handleClose,
  handleClickConfirm,
}: Props) => {
  return (
    <ModalDialog title="Metrc to Bespoke Catalog SKU" handleClose={handleClose}>
      <DialogContent>
        <SelectDropdown
          value={skuConfidence}
          label="SKU Confidence"
          options={MetrcToBespokeCatalogSkuConfidenceLabels}
          id="sku-confidence-dropdown"
          setValue={setSkuConfidence}
        />
      </DialogContent>
      <DialogActions>
        <Box display="flex" style={{ margin: 32, padding: 0 }}>
          <SecondaryButton text={"Cancel"} onClick={handleClose} />
          <PrimaryButton
            isDisabled={false}
            text={"Confirm"}
            onClick={handleClickConfirm}
          />
        </Box>
      </DialogActions>
    </ModalDialog>
  );
};

export default MetrcToBespokeCatalogSkuModal;
