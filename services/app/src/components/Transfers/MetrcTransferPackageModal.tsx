import { Box, Typography } from "@material-ui/core";
import Modal from "components/Shared/Modal/Modal";
import RawJsonToggle from "components/Shared/RawJsonToggle";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  MetrcTransferPackages,
  useGetMetrcTransferPackageQuery,
} from "generated/graphql";
import { PlatformModeEnum } from "lib/enum";
import { useContext } from "react";

interface Props {
  metrcPackageId: MetrcTransferPackages["id"];
  handleClose: () => void;
}

export default function MetrcTransferPackageModal({
  metrcPackageId,
  handleClose,
}: Props) {
  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isBankUser = platformMode === PlatformModeEnum.Bank;

  const { data } = useGetMetrcTransferPackageQuery({
    fetchPolicy: "network-only",
    variables: {
      id: metrcPackageId,
    },
  });

  const metrcPackage = data?.metrc_transfer_packages_by_pk;

  if (!metrcPackage) {
    return null;
  }

  const packagePayload = metrcPackage.package_payload;

  return (
    <Modal
      title={"Metrc Transfer Package"}
      subtitle={metrcPackage.package_label}
      contentWidth={1000}
      handleClose={handleClose}
    >
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Package ID (Metrc)
        </Typography>
        <Typography variant="body1">{metrcPackage.package_id}</Typography>
      </Box>
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Package Label
        </Typography>
        <Typography variant="body1">{metrcPackage.package_label}</Typography>
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
