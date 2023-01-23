import { Box } from "@material-ui/core";
import { ReactComponent as EditIcon } from "components/Shared/Layout/Icons/EditPencil.svg";
import Text, { TextVariants } from "components/Shared/Text/Text";

import CardContainer from "../Shared/Card/CardContainer";
import ModalButton from "../Shared/Modal/ModalButton";
import EditParentCompanyModal from "./EditParentCompanyModal";

interface Props {
  companyId: string;
  companyName: string;
  refetch: () => void;
}

export default function ParentCompanyDetailsViewCard({
  companyId,
  companyName,
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
              {`${companyName}`}
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
                  companyId={companyId}
                  companyName={companyName}
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
