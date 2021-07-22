import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import RawJsonToggle from "components/Shared/RawJsonToggle";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import { MetrcPackages, useGetMetrcPackageQuery } from "generated/graphql";
import { useContext } from "react";

interface Props {
  metrcPackageId: MetrcPackages["id"];
  handleClose: () => void;
}

export default function MetrcPackageModal({
  metrcPackageId,
  handleClose,
}: Props) {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const isBankUser = isRoleBankUser(role);

  const { data } = useGetMetrcPackageQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcPackageId,
    },
  });

  const metrcPackage = data?.metrc_packages_by_pk;

  if (!metrcPackage) {
    return null;
  }

  const packagePayload = metrcPackage.package_payload;

  return (
    <Modal
      title={"Metrc Package"}
      subtitle={metrcPackage.label}
      contentWidth={1000}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Metrc ID
        </Typography>
        <Typography variant="body1">{metrcPackage.package_id}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Label
        </Typography>
        <Typography variant="body1">{metrcPackage.label}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Product Name
        </Typography>
        <Typography variant="body1">{packagePayload.ProductName}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Product Category
        </Typography>
        <Typography variant="body1">
          {packagePayload.ProductCategoryName}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Shipped Quantity
        </Typography>
        <Typography variant="body1">{`${packagePayload.ShippedQuantity} (${packagePayload.ShippedUnitOfMeasureName})`}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Received Quantity
        </Typography>
        <Typography variant="body1">{`${packagePayload.ReceivedQuantity} (${packagePayload.ReceivedUnitOfMeasureName})`}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Raw Package JSON
        </Typography>
        <RawJsonToggle rawJson={packagePayload} />
      </Box>
      {isBankUser && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          mt={2}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Platform ID
          </Typography>
          <Typography variant={"body1"}>{metrcPackage.id}</Typography>
        </Box>
      )}
    </Modal>
  );
}
