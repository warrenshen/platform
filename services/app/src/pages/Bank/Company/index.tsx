import { Box, ListItem, ListItemText, Typography } from "@material-ui/core";
import List from "@material-ui/core/List";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import { Color } from "@material-ui/lab/Alert";
import CounterChip from "components/Shared/Chip/CounterChip";
import Page from "components/Shared/Page";
import PrivateRoute from "components/Shared/PrivateRoute";
import {
  CurrentUserContext,
  isRoleBankUser,
} from "contexts/CurrentUserContext";
import {
  Companies,
  GetCompanyForBankCompanyPageQuery,
  UserRolesEnum,
  useGetCompanyForBankCompanyPageQuery,
} from "generated/graphql";
import {
  ProductTypeEnum,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import { useGetMissingReportsInfo } from "lib/finance/reports/reports";
import { bankRoutes } from "lib/routes";
import { isPayorsTabVisible, isVendorsTabVisible } from "lib/settings";
import { flatten } from "lodash";
import BankCustomerContractPage from "pages/Bank/Company/Contract";
import { useContext } from "react";
import {
  Link,
  matchPath,
  useLocation,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import styled from "styled-components";

import BankCustomerAccountFeesCreditsSubpage from "./AccountFeesCredits";
import BankCustomerBorrowingBaseSubpage from "./BorrowingBase";
import BankCustomerFinancialCertificationsSubpage from "./FinancialCertifications";
import BankCustomerInvoicesSubpage from "./Invoices";
import BankCustomerLoansSubpage from "./Loans";
import BankCustomerMetrcSubpage from "./Metrc";
import BankCustomerOverviewSubpage from "./Overview";
import BankCompanyPayorPartnershipsSubpage from "./PayorPartnerships";
import BankCustomerPayorsSubpage from "./Payors";
import BankCustomerPurchaseOrdersSubpage from "./PurchaseOrders";
import BankCustomerPaymentsSubpage from "./Repayments";
import BankCustomerReportsSubpage from "./Reports";
import BankCustomerSettingsSubpage from "./Settings";
import BankCompanyVendorPartnershipsSubpage from "./VendorPartnerships";
import BankCustomerVendorsSubpage from "./Vendors";

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
      height: "100%",
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

type ClassName =
  | "greenBackground"
  | "yellowBackground"
  | "greyBackground"
  | "blueBackground"
  | "orangeBackground";

type AlertStyle = { theme: ClassName; severity: Color };

const surveillanceStatusToAlertStatus: {
  [key in SurveillanceStatusEnum]: AlertStyle;
} = {
  [SurveillanceStatusEnum.GoodStanding]: {
    theme: "greenBackground",
    severity: "success",
  },
  [SurveillanceStatusEnum.Defaulted]: {
    theme: "orangeBackground",
    severity: "error",
  },
  [SurveillanceStatusEnum.OnPause]: {
    theme: "orangeBackground",
    severity: "warning",
  },
  [SurveillanceStatusEnum.OnProbation]: {
    theme: "yellowBackground",
    severity: "warning",
  },
  [SurveillanceStatusEnum.InReview]: {
    theme: "yellowBackground",
    severity: "warning",
  },
  [SurveillanceStatusEnum.Inactive]: {
    theme: "greyBackground",
    severity: "info",
  },
  [SurveillanceStatusEnum.Onboarding]: {
    theme: "blueBackground",
    severity: "info",
  },
};

type BankCustomerPath = {
  visible?: boolean;
  dataCy: string;
  label: string;
  path: string;
  counter?: number;
  counterColor?: string;
  component: NonNullable<
    React.FunctionComponent<{
      companyId: Companies["id"];
      productType: ProductTypeEnum | null;
    }>
  >;
};

const getCustomerPaths = (
  company: GetCompanyForBankCompanyPageQuery["companies_by_pk"],
  missingFinancialReportCount: number,
  isLatestBorrowingBaseMissing: boolean,
  productType: ProductTypeEnum | null
) => {
  return [
    {
      visible: !!company?.is_customer,
      label: "Customer",
      paths: [
        {
          dataCy: "customer-overview",
          label: "Overview",
          path: bankRoutes.company.overview,
          component: BankCustomerOverviewSubpage,
        },
        {
          visible:
            !!productType &&
            [
              ProductTypeEnum.DispensaryFinancing,
              ProductTypeEnum.InventoryFinancing,
              ProductTypeEnum.PurchaseMoneyFinancing,
            ].includes(productType),
          dataCy: "customer-purchase-orders",
          label: "Purchase Orders",
          path: bankRoutes.company.purchaseOrders,
          component: BankCustomerPurchaseOrdersSubpage,
        },
        {
          visible:
            !!productType &&
            [
              ProductTypeEnum.InvoiceFinancing,
              ProductTypeEnum.PurchaseMoneyFinancing,
            ].includes(productType),
          dataCy: "customer-invoices",
          label: "Invoices",
          path: bankRoutes.company.invoices,
          component: BankCustomerInvoicesSubpage,
        },
        {
          dataCy: "customer-loans",
          label: "Loans",
          path: bankRoutes.company.loans,
          component: BankCustomerLoansSubpage,
        },
        {
          dataCy: "customer-repayments",
          label: "Repayments",
          path: bankRoutes.company.payments,
          component: BankCustomerPaymentsSubpage,
        },
        {
          dataCy: "borrowing-base",
          visible:
            !!productType &&
            [ProductTypeEnum.LineOfCredit].includes(productType),
          label: "Borrowing Base",
          path: bankRoutes.company.borrowingBase,
          counter: isLatestBorrowingBaseMissing ? 1 : 0,
          counterColor: "rgb(230, 126, 34)",
          component: BankCustomerBorrowingBaseSubpage,
        },
        {
          dataCy: "financial-certifications",
          label: "Financial Certifications",
          path: bankRoutes.company.financialCertifications,
          counter: missingFinancialReportCount,
          counterColor:
            missingFinancialReportCount > 1
              ? "rgb(230, 126, 34)"
              : "rgb(241, 196, 15)",
          component: BankCustomerFinancialCertificationsSubpage,
        },
        {
          visible: isVendorsTabVisible(productType),
          dataCy: "customer-vendors",
          label: "Vendors",
          path: bankRoutes.company.vendors,
          component: BankCustomerVendorsSubpage,
        },
        {
          visible: isPayorsTabVisible(productType),
          dataCy: "customer-payors",
          label: "Payors",
          path: bankRoutes.company.payors,
          component: BankCustomerPayorsSubpage,
        },
        {
          dataCy: "customer-contract",
          label: "Contract",
          path: bankRoutes.company.contract,
          component: BankCustomerContractPage,
        },
        {
          visible:
            !!productType &&
            [
              ProductTypeEnum.InventoryFinancing,
              ProductTypeEnum.InvoiceFinancing,
              ProductTypeEnum.PurchaseMoneyFinancing,
              ProductTypeEnum.DispensaryFinancing,
            ].includes(productType),
          dataCy: "customer-reports",
          label: "Reports",
          path: bankRoutes.company.reports,
          component: BankCustomerReportsSubpage,
        },
        {
          visible: false,
          dataCy: "customer-account-fees-credits",
          label: "Account Fees & Credits",
          path: bankRoutes.company.accountFeesCredits,
          component: BankCustomerAccountFeesCreditsSubpage,
        },
      ] as BankCustomerPath[],
    },
    {
      visible: !!company?.is_payor,
      label: "Payor",
      paths: [
        {
          dataCy: "payor-partnerships",
          label: "Partnerships",
          path: bankRoutes.company.payorPartnerships,
          component: BankCompanyPayorPartnershipsSubpage,
        },
      ] as BankCustomerPath[],
    },
    {
      visible: !!company?.is_vendor,
      label: "Vendor",
      paths: [
        {
          dataCy: "vendor-partnerships",
          label: "Partnerships",
          path: bankRoutes.company.vendorPartnerships,
          component: BankCompanyVendorPartnershipsSubpage,
        },
      ] as BankCustomerPath[],
    },
    {
      visible: true,
      label: "General",
      paths: [
        {
          dataCy: "general-metrc",
          label: "Metrc",
          path: bankRoutes.company.metrc,
          component: BankCustomerMetrcSubpage,
        },
        {
          dataCy: "general-settings",
          label: "Settings",
          path: bankRoutes.company.settings,
          component: BankCustomerSettingsSubpage,
        },
      ] as BankCustomerPath[],
    },
  ];
};
export default function BankCompanyPage() {
  const {
    user: { role },
  } = useContext(CurrentUserContext);
  const { companyId } = useParams<{
    companyId: Companies["id"];
  }>();
  const { url, path } = useRouteMatch();
  const location = useLocation();
  const classes = useStyles();

  const { data } = useGetCompanyForBankCompanyPageQuery({
    variables: {
      id: companyId,
    },
  });

  const company = data?.companies_by_pk || null;
  const companyName = company?.name;
  const contract = company?.contract || null;
  const surveillanceStatus = company?.most_recent_surveillance_result?.[0]
    ?.surveillance_status as SurveillanceStatusEnum;
  const productType = (contract?.product_type as ProductTypeEnum) || null;

  const { missingFinancialReportCount, isLatestBorrowingBaseMissing } =
    useGetMissingReportsInfo(companyId);

  const renderSurveillanceStatus = () => {
    if (!surveillanceStatus) {
      return null;
    }
    const { theme, severity } =
      surveillanceStatusToAlertStatus[surveillanceStatus];

    return (
      <Box display="flex" mt={3} mb={2}>
        <Alert
          severity={severity}
          className={[classes[theme], classes.commonStyle].join(" ")}
        >
          <Typography>
            {SurveillanceStatusToLabel[surveillanceStatus]}
          </Typography>
        </Alert>
      </Box>
    );
  };
  return (
    <Page appBarTitle={companyName || ""}>
      <Box display="flex" width="100%">
        <Box className={classes.drawer}>
          <TitleText>{companyName || ""}</TitleText>
          {isRoleBankUser(role) && renderSurveillanceStatus()}

          <List className={classes.list}>
            {getCustomerPaths(
              company,
              missingFinancialReportCount,
              isLatestBorrowingBaseMissing,
              productType
            )
              .filter(
                (section) => section.visible == null || !!section?.visible
              )
              .map((section) => (
                <Box
                  key={section.label}
                  display="flex"
                  flexDirection="column"
                  mt={2}
                >
                  <Box mb={1}>
                    <Typography variant="subtitle2" color="textSecondary">
                      <strong>{section.label.toUpperCase()}</strong>
                    </Typography>
                  </Box>
                  <List>
                    {section.paths
                      .filter(
                        (companyPath) =>
                          companyPath.visible == null || !!companyPath?.visible
                      )
                      .map((companyPath) => (
                        <ListItem
                          key={companyPath.path}
                          data-cy={`company-sidebar-item-${companyPath.dataCy}`}
                          button
                          component={Link}
                          to={`${url}${companyPath.path}`}
                          selected={Boolean(
                            matchPath(
                              location.pathname,
                              `/companies/:companyId${companyPath.path}`
                            )
                          )}
                        >
                          <ListItemText
                            primaryTypographyProps={{
                              className: classes.listItemText,
                              variant: "subtitle1",
                            }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <span>{companyPath.label}</span>
                              {!!companyPath.counter && (
                                <CounterChip
                                  chipCount={
                                    companyPath.counter > 5
                                      ? "5+"
                                      : companyPath.counter.toString()
                                  }
                                  chipColor={companyPath.counterColor}
                                />
                              )}
                            </Box>
                          </ListItemText>
                        </ListItem>
                      ))}
                  </List>
                </Box>
              ))}
          </List>
        </Box>
        <Box className={classes.content}>
          {flatten(
            getCustomerPaths(
              company,
              missingFinancialReportCount,
              isLatestBorrowingBaseMissing,
              productType
            ).map((section) => section.paths)
          ).map((companyPath) => (
            <PrivateRoute
              key={companyPath.path}
              exact
              path={`${path}${companyPath.path}`}
              requiredRoles={[
                UserRolesEnum.BankAdmin,
                UserRolesEnum.BankReadOnly,
              ]}
            >
              {companyPath.component({ companyId, productType })}
            </PrivateRoute>
          ))}
        </Box>
      </Box>
    </Page>
  );
}
