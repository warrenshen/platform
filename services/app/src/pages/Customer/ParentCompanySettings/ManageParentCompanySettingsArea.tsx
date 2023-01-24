import { Box } from "@material-ui/core";
import PrimaryButton from "components/Shared/Button/PrimaryButton";
import Can from "components/Shared/Can";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { ParentCompanies } from "generated/graphql";
import { Action } from "lib/auth/rbac-rules";
import { useState } from "react";

import ChangeParentCompanyDummyAccountStatusModal from "./ChangeParentCompanyDummyAccountStatusModal";

interface Props {
  parentCompanyId: ParentCompanies["id"];
}

export default function ManageParentCompanyUsersArea({
  parentCompanyId,
}: Props) {
  const [
    isChangeParentCompanyDummyAccountStatusModalOpen,
    setIsChangeParentCompanyDummyAccountStatusModalOpen,
  ] = useState(false);

  return (
    <Box mt={4}>
      <Box>
        {isChangeParentCompanyDummyAccountStatusModalOpen && (
          <ChangeParentCompanyDummyAccountStatusModal
            parentCompanyId={parentCompanyId}
            handleClose={() =>
              setIsChangeParentCompanyDummyAccountStatusModalOpen(false)
            }
          />
        )}
      </Box>
      <Box display={"flex"}>
        <Text textVariant={TextVariants.ParagraphLead}>
          Is Dummy Parent Company
        </Text>
      </Box>
      <Box display={"flex"} flexDirection={"row-reverse"} mt={-6}>
        <Can perform={Action.ManipulateUser}>
          <PrimaryButton
            dataCy={"change-dummy-account-status-button"}
            text={"Change Dummy Account Status"}
            onClick={() =>
              setIsChangeParentCompanyDummyAccountStatusModalOpen(true)
            }
          />
        </Can>
      </Box>
      <Box mt={6}>
        <Text textVariant={TextVariants.Label}>
          Enabling "Is Dummy Parent Company" excludes this Parent Company and
          all companies inside from all financial calculations.
        </Text>
      </Box>
    </Box>
  );
}
