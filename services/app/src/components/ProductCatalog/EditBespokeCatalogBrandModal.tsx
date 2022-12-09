import {
  Box,
  DialogActions,
  DialogContent,
  FormControl,
  TextField,
} from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import SecondaryButton from "components/Shared/Button/SecondaryButton";
import CardDivider from "components/Shared/Card/CardDivider";
import ModalDialog from "components/Shared/Modal/ModalDialog";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { BespokeCatalogBrandFragment } from "generated/graphql";
import useCustomMutation from "hooks/useCustomMutation";
import useSnackbar from "hooks/useSnackbar";
import { createUpdateBespokeCatalogBrandMutation } from "lib/api/productCatalog";
import { useState } from "react";
import styled from "styled-components";

const StyledButtonContainer = styled.div`
  display: flex;
  margin: 32px;
  padding: 0px;
`;

interface Props {
  bespokeCatalogBrand: BespokeCatalogBrandFragment;
  handleClose: () => void;
}

const EditBespokeCatalogBrandModal = ({
  bespokeCatalogBrand,
  handleClose,
}: Props) => {
  const snackbar = useSnackbar();

  const [brandName, setBrandName] = useState<string>(
    bespokeCatalogBrand.brand_name
  );

  const [
    updateBespokeCatalogBrand,
    { loading: isUpdateMetrcToBespokeCatalogBrandLoading },
  ] = useCustomMutation(createUpdateBespokeCatalogBrandMutation);

  const handleClickSubmit = async () => {
    const response = await updateBespokeCatalogBrand({
      variables: {
        id: bespokeCatalogBrand.id,
        brand_name: brandName,
      },
    });
    if (response.status === "OK") {
      snackbar.showSuccess(
        `Successfully updated bespoke catalog SKU for ${brandName}`
      );
      handleClose();
    } else {
      snackbar.showError(
        `Failed to update bespoke catalog SKU: ${response.msg}`
      );
    }
  };

  const isSubmitDisabled = !brandName || !bespokeCatalogBrand.id;

  return (
    <ModalDialog
      title="Edit Bespoke Catalog Brand"
      width="680px"
      maxWidth="md"
      handleClose={handleClose}
    >
      <DialogContent>
        <Text textVariant={TextVariants.ParagraphLead}>
          Bespoke Catalog Brand
        </Text>
        <Box mb={2}>
          <FormControl fullWidth>
            <TextField
              value={brandName}
              label={"Brand Name"}
              onChange={({ target: { value } }) => {
                setBrandName(value);
              }}
            />
          </FormControl>
          <CardDivider marginBottom="16px" />
        </Box>
      </DialogContent>
      <DialogActions>
        <StyledButtonContainer>
          <SecondaryButton text={"Cancel"} onClick={handleClose} />
          <PrimaryButton
            isDisabled={
              isSubmitDisabled || isUpdateMetrcToBespokeCatalogBrandLoading
            }
            text={"Submit"}
            onClick={handleClickSubmit}
          />
        </StyledButtonContainer>
      </DialogActions>
    </ModalDialog>
  );
};

export default EditBespokeCatalogBrandModal;
