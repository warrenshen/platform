import { Box } from "@material-ui/core";
import { ReactComponent as EditIcon } from "components/Shared/Layout/Icons/EditPencil.svg";
import Text, { TextVariants } from "components/Shared/Text/Text";

import CardContainer from "../Shared/Card/CardContainer";
import ModalButton from "../Shared/Modal/ModalButton";
import EditParentCompanyModal from "./EditParentCompanyModal";

interface Props {
  parentCompanyId: string;
  parentCompanyName: string;
  refetch: () => void;
}

export default function ParentCompanyDetailsViewCard({
  parentCompanyId,
  parentCompanyName,
  refetch,
}: Props) {
  return (
    <CardContainer>
      <Box>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex">
            <Text
              materialVariant="h3"
              textVariant={TextVariants.SubHeader}
              dataCy="parent-company-name"
            >
              {`${parentCompanyName}`}
            </Text>
          </Box>
          <Box display="flex">
            <ModalButton
              label={""}
              startIcon={<EditIcon />}
              dataCy="edit-parent-company-button"
              color={undefined}
              variant={"text"}
              modal={({ handleClose }) => (
                <EditParentCompanyModal
                  parentCompanyId={parentCompanyId}
                  parentCompanyName={parentCompanyName}
                  handleClose={() => {
                    refetch();
                    handleClose();
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Box>
    </CardContainer>
  );
}
