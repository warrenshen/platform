import { IconButton, Menu, MenuItem } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { ActionType } from "lib/ActionType";
import { useState } from "react";

interface Props {
  purchaseOrderId: string;
  manipulatePurchaseOrder: (
    actionType: ActionType,
    purchaseOrderId: string
  ) => void;
}

function ActionMenu({ purchaseOrderId, manipulatePurchaseOrder }: Props) {
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
            manipulatePurchaseOrder(ActionType.Update, purchaseOrderId);
            handleClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            manipulatePurchaseOrder(ActionType.Copy, purchaseOrderId);
            handleClose();
          }}
        >
          Replicate
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
          }}
        >
          Attachments
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
          }}
        >
          Print
        </MenuItem>
        <MenuItem
          onClick={() => {
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
