import { IconButton, Menu, MenuItem } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { useState } from "react";

interface Props {
  purchaseOrderId: string;
  createPurchaseOrderReplica: (arg0: string) => void;
}

function ActionMenu({ purchaseOrderId, createPurchaseOrderReplica }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon></ArrowDropDownIcon>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            createPurchaseOrderReplica(purchaseOrderId);
            handleClose();
          }}
        >
          Replicate
        </MenuItem>
        <MenuItem
          onClick={() => {
            // currentUser.setRole(UserRole.Customer);
            handleClose();
          }}
        >
          Attachments
        </MenuItem>
        <MenuItem
          onClick={() => {
            // currentUser.setRole(UserRole.Customer);
            handleClose();
          }}
        >
          Print
        </MenuItem>
        <MenuItem
          onClick={() => {
            // currentUser.setRole(UserRole.Customer);
            handleClose();
          }}
        >
          Chat
        </MenuItem>
      </Menu>
    </>
  );
}

export default ActionMenu;
