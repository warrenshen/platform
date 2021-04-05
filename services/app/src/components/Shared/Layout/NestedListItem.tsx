import { Chip, Collapse, ListItem, ListItemText } from "@material-ui/core";
import List from "@material-ui/core/List";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import SidebarItem from "components/Shared/Layout/SidebarItem";
import { useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  margin-top: 8px;
  margin-bottom: 8px;
`;

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
  const isOpenLocalStorage = localStorage.getItem(`nav-${item.text}`);
  const classes = useStyles();
  const location = useLocation();
  const [isOpen, isSetOpen] = useState<boolean>(
    isOpenLocalStorage ? JSON.parse(isOpenLocalStorage) : false
  );

  const headerTypographyProps: any = {
    className: classes.headerItemText,
    variant: "overline",
  };

  const handleNestedListItemClick = (id: string): void => {
    localStorage.setItem(`nav-${id}`, JSON.stringify(!isOpen));
    isSetOpen(!isOpen);
  };

  return (
    <Wrapper>
      <ListItem button onClick={() => handleNestedListItemClick(item.text)}>
        <ListItemText primaryTypographyProps={headerTypographyProps}>
          {item.text}
          {!!item.counter && (
            <Chip
              size="small"
              color="secondary"
              className={classes.chipCounter}
              label={item.counter}
            />
          )}
        </ListItemText>
        <div className={classes.collapseIcon}>
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </div>
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.items.map((nestedItem: any, index: number) => (
            <SidebarItem
              key={index}
              isNested={true}
              isSelected={Boolean(
                matchPath(location.pathname, nestedItem.link)
              )}
              chipCount={nestedItem.count}
              IconNode={null}
              label={nestedItem.text}
              to={nestedItem.link}
            />
          ))}
        </List>
      </Collapse>
    </Wrapper>
  );
};

export default NestedListItem;
