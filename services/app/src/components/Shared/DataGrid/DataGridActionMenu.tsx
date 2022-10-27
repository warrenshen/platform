import { Box, IconButton, Menu, MenuItem } from "@material-ui/core";
import { GridValueFormatterParams } from "@material-ui/data-grid";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { useState } from "react";

export type DataGridActionItem = {
  key: string;
  label: string;
  handleClick: (params: GridValueFormatterParams) => void;
};

interface Props {
  params: GridValueFormatterParams;
  actionItems?: DataGridActionItem[];
}

function DataGridActionMenu({ params, actionItems }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {!!actionItems &&
          actionItems.map((actionItem) => (
            <MenuItem
              key={actionItem.key}
              onClick={() => {
                actionItem.handleClick(params);
                handleClose();
              }}
            >
              {actionItem.label}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
}

export default DataGridActionMenu;
