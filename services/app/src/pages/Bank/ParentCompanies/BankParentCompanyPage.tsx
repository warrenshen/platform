import { Box, Divider, ListItem } from "@material-ui/core";
import List from "@material-ui/core/List";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import { ArrowDropDownOutlined, ArrowDropUpOutlined } from "@material-ui/icons";
import { Collapse, ListItemButton } from "@mui/material";
import CompanyChip from "components/Shared/Chip/CompanyChip";
import { ReactComponent as CompanyIcon } from "components/Shared/Layout/Icons/CompanyGreen.svg";
import { ReactComponent as ParentCompanyIcon } from "components/Shared/Layout/Icons/ParentCompanyGreen.svg";
import Page from "components/Shared/Page";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  ParentCompanies,
  useGetParentCompanyForBankParentCompanyPageQuery,
} from "generated/graphql";
import { BankCompanyLabel, PlatformModeEnum } from "lib/enum";
import {
  BankParentCompanyRouteEnum,
  getBankParentCompanyRoute,
} from "lib/routes";
import { useContext, useState } from "react";
import { Link, matchPath, useLocation, useParams } from "react-router-dom";
import styled from "styled-components";

const DRAWER_WIDTH = 200;

const TitleText = styled.span`
  font-size: 24px;
  font-weight: 500;
`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      display: "flex",
      flexDirection: "column",

      width: DRAWER_WIDTH,
      height: "100%",
      paddingTop: 64,
      marginLeft: 32,
    },
    content: {
      display: "flex",
      flexDirection: "column",

      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      height: "200%",
      backgroundColor: "#F6F5F3",
    },
    list: {
      padding: 0,
    },
    listItemText: {
      fontWeight: 500,
    },
    commonStyle: {
      color: "white",
      padding: "0 0.5rem",
      alignItems: "center",

      "& svg": {
        fill: "white",
      },
    },
    greenBackground: {
      backgroundColor: "rgb(118, 147, 98)",
    },
    yellowBackground: {
      backgroundColor: "rgb(241, 196, 15)",
    },
    orangeBackground: {
      backgroundColor: "rgb(230, 126, 34)",
    },
    greyBackground: {
      backgroundColor: "rgb(189, 195, 199)",
    },
    blueBackground: {
      backgroundColor: "rgb(25, 113, 194)",
    },
  })
);

interface Props {
  children: ({ companyId }: { companyId: string }) => NonNullable<JSX.Element>;
}

export default function BankParentCompanyPage({ children }: Props) {
  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isRoleBankUser = platformMode === PlatformModeEnum.Bank;
  const { parentCompanyId: companyId } = useParams<{
    parentCompanyId: ParentCompanies["id"];
  }>();

  const [parentCompanyOpen, setParentCompanyOpen] = useState(true);
  const [childCompaniesOpen, setChildCompaniesOpen] = useState(true);

  const handleParentCompanyClick = () => {
    setParentCompanyOpen(!parentCompanyOpen);
  };

  const handleChildCompaniesClick = () => {
    setChildCompaniesOpen(!childCompaniesOpen);
  };

  const location = useLocation();
  const classes = useStyles();

  const { data } = useGetParentCompanyForBankParentCompanyPageQuery({
    variables: {
      id: companyId,
    },
  });

  const company = data?.parent_companies_by_pk || null;
  const companyName = company?.name;

  return (
    <Page appBarTitle={companyName || ""} backgroundColor="#e8e6e2">
      <Box display="flex" alignSelf="stretch">
        <Box className={classes.drawer}>
          <TitleText>{companyName || ""}</TitleText>
          {isRoleBankUser}
          <Box mt={1} mb={1}>
            <CompanyChip companyType={BankCompanyLabel.ParentCompany} />
          </Box>
          <Divider></Divider>
          <List>
            <ListItemButton onClick={handleParentCompanyClick} disableRipple>
              <Box display="flex" flexDirection="row-reverse">
                <Box mt={"3px"}>
                  {parentCompanyOpen ? (
                    <ArrowDropUpOutlined />
                  ) : (
                    <ArrowDropDownOutlined />
                  )}
                </Box>
                <Box ml={1} mr={1} mt={"3px"}>
                  <Text textVariant={TextVariants.Label}>Parent Company</Text>
                </Box>
                <Box ml={-2}>
                  <ParentCompanyIcon />
                </Box>
              </Box>
            </ListItemButton>
            <Collapse in={parentCompanyOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  key={"Details"}
                  data-cy={`company-sidebar-item-details`}
                  button
                  component={Link}
                  disableRipple
                  to={getBankParentCompanyRoute(
                    companyId,
                    BankParentCompanyRouteEnum.Details
                  )}
                  selected={Boolean(
                    matchPath(
                      location.pathname,
                      getBankParentCompanyRoute(
                        companyId,
                        BankParentCompanyRouteEnum.Details
                      )
                    )
                  )}
                >
                  <Box ml={2}>
                    <Text textVariant={TextVariants.Label}>Details</Text>
                  </Box>
                </ListItem>
                <ListItem
                  key={"Users"}
                  data-cy={`company-sidebar-item-users`}
                  button
                  component={Link}
                  disableRipple
                  to={getBankParentCompanyRoute(
                    companyId,
                    BankParentCompanyRouteEnum.Users
                  )}
                  selected={Boolean(
                    matchPath(
                      location.pathname,
                      getBankParentCompanyRoute(
                        companyId,
                        BankParentCompanyRouteEnum.Users
                      )
                    )
                  )}
                >
                  <Box ml={2}>
                    <Text textVariant={TextVariants.Label}>Users</Text>
                  </Box>
                </ListItem>
                <ListItem
                  key={"Settings"}
                  data-cy={`company-sidebar-item-settings`}
                  button
                  component={Link}
                  disableRipple
                  to={getBankParentCompanyRoute(
                    companyId,
                    BankParentCompanyRouteEnum.Settings
                  )}
                  selected={Boolean(
                    matchPath(
                      location.pathname,
                      getBankParentCompanyRoute(
                        companyId,
                        BankParentCompanyRouteEnum.Settings
                      )
                    )
                  )}
                >
                  <Box ml={2}>
                    <Text textVariant={TextVariants.Label}>Settings</Text>
                  </Box>
                </ListItem>
              </List>
            </Collapse>
            <ListItemButton onClick={handleChildCompaniesClick}>
              <Box display="flex" flexDirection="row-reverse">
                <Box mt={"3px"}>
                  {childCompaniesOpen ? (
                    <ArrowDropUpOutlined />
                  ) : (
                    <ArrowDropDownOutlined />
                  )}
                </Box>
                <Box ml={1} mr={7} mt={"3px"}>
                  <Text textVariant={TextVariants.Label}>Company</Text>
                </Box>
                <Box ml={-2}>
                  <CompanyIcon />
                </Box>
              </Box>
            </ListItemButton>
            <Collapse in={childCompaniesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  key={"Details"}
                  data-cy={`company-sidebar-item-company-details`}
                  button
                  component={Link}
                  disableRipple
                  to={getBankParentCompanyRoute(
                    companyId,
                    BankParentCompanyRouteEnum.CompanyDetails
                  )}
                  selected={Boolean(
                    matchPath(
                      location.pathname,
                      getBankParentCompanyRoute(
                        companyId,
                        BankParentCompanyRouteEnum.CompanyDetails
                      )
                    )
                  )}
                >
                  <Box ml={2}>
                    <Text textVariant={TextVariants.Label}>Details</Text>
                  </Box>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Box>
        <Box ml={2} className={classes.content}>
          {!!companyId
            ? children({
                companyId,
              })
            : null}
        </Box>
      </Box>
    </Page>
  );
}
