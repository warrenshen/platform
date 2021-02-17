import {
  ListItem,
  ListItemText,
  Collapse,
  Badge,
  Chip,
  ListItemIcon,
} from "@material-ui/core";
import List from "@material-ui/core/List";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import React, { useContext } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  nested: {
    paddingLeft: theme.spacing(3),
  },
  listItemText: {
    fontWeight: 500,
  },
  headerItemText: {
    fontWeight: 500,
    letterSpacing: "0.1em",
  },
  collapseIcon: {
    opacity: 0.6,
  },
  listItemIcon: {
    minWidth: "42px",
  },
  chipCounter: {
    marginLeft: "0.5rem",
    fontWeight: 600,
    marginBottom: "3px",
    letterSpacing: "1px",
    transform: "scale(0.9)",
  },
}));

interface Props {
  item: any;
}

const NestedListItem = ({ item }: Props) => {
  const classes = useStyles();
  const location = useLocation();
  const [open, setOpen] = React.useState(true);

  const headerTypographyProps: any = {
    className: classes.headerItemText,
    variant: "overline",
  };

  const primaryTypographyProps: any = {
    className: classes.listItemText,
    variant: "subtitle1",
  };

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemText primaryTypographyProps={headerTypographyProps}>
          {item.text}
          {item.counter && (
            <Chip
              size="small"
              color="secondary"
              className={classes.chipCounter}
              label={item.counter}
            />
          )}
        </ListItemText>
        <div className={classes.collapseIcon}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </div>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.items.map((nestedItem: any, index: number) => (
            <ListItem
              key={nestedItem.text + nestedItem.index}
              button
              component={Link}
              to={nestedItem.link}
              selected={Boolean(matchPath(location.pathname, nestedItem.link))}
              className={classes.nested}
            >
              {nestedItem.icon && (
                <ListItemIcon className={classes.listItemIcon}>
                  <Badge
                    color="secondary"
                    badgeContent={nestedItem.counter || 0}
                  >
                    {nestedItem.icon}
                  </Badge>
                </ListItemIcon>
              )}
              <ListItemText primaryTypographyProps={primaryTypographyProps}>
                {nestedItem.text}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default NestedListItem;
