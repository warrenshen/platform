import { Box, ListItem, ListItemText, Typography } from "@material-ui/core";
import List from "@material-ui/core/List";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import { Color } from "@material-ui/lab/Alert";
import CounterChip from "components/Shared/Chip/CounterChip";
import Page from "components/Shared/Page";
import CurrentCustomerProvider from "contexts/CurrentCustomerProvider";
import { CurrentUserContext } from "contexts/CurrentUserContext";
import {
  Companies,
  GetCompanyForBankCompanyPageQuery,
  useGetCompanyForBankCompanyPageQuery,
  useGetCompanySettingsByCompanyIdForCustomerQuery,
  useGetMostRecentFinancialSummaryAndContractByCompanyIdQuery,
  useGetPurchaseOrdersChangesRequestedCountForCustomerQuery,
} from "generated/graphql";
import {
  FeatureFlagEnum,
  PlatformModeEnum,
  ProductTypeEnum,
  ReportingRequirementsCategoryEnum,
  SurveillanceStatusEnum,
  SurveillanceStatusToLabel,
} from "lib/enum";
import { useGetMissingReportsInfo } from "lib/finance/reports/reports";
import {
  BankCompanyRouteEnum,
  bankRoutes,
  getBankCompanyRoute,
} from "lib/routes";
import { isPayorsTabVisible, isVendorsTabVisible } from "lib/settings";
import { useContext } from "react";
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

export const surveillanceStatusToAlertStatus: {
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
};

const getCustomerPaths = (
  company: GetCompanyForBankCompanyPageQuery["companies_by_pk"],
  missingFinancialReportCount: number,
  isLatestBorrowingBaseMissing: boolean,
  productType: ProductTypeEnum | null,
  isActiveContract: boolean,
  isMetrcBased: boolean,
  isBankUser: boolean,
  purchaseOrdersChangesRequestedCount: number
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
          counter: purchaseOrdersChangesRequestedCount,
          counterColor: "rgb(230, 126, 34)",
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
        },
        {
          visible:
            !!productType &&
            [ProductTypeEnum.LineOfCredit].includes(productType),
          dataCy: "customer-financing-requests",
          label: "Financing Requests",
          path: bankRoutes.company.financingRequests,
        },
        {
          dataCy: "customer-loans",
          label: "Loans",
          path: bankRoutes.company.loans,
        },
        {
          dataCy: "customer-repayments",
          label: "Repayments",
          path: bankRoutes.company.repayments,
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
        },
        {
          dataCy: "financial-certifications",
          label: "Financial Certifications",
          path: bankRoutes.company.financialCertifications,
          counter: isMetrcBased ? 0 : missingFinancialReportCount,
          counterColor:
            missingFinancialReportCount > 1
              ? "rgb(230, 126, 34)"
              : "rgb(241, 196, 15)",
        },
        {
          visible: isVendorsTabVisible(productType),
          dataCy: "customer-vendors",
          label: "Vendors",
          path: bankRoutes.company.vendors,
        },
        {
          visible: isPayorsTabVisible(productType),
          dataCy: "customer-payors",
          label: "Payors",
          path: bankRoutes.company.payors,
        },
        {
          dataCy: "customer-contract",
          label: "Contract",
          path: bankRoutes.company.contract,
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
        },
        {
          visible: false,
          dataCy: "customer-account-fees-credits",
          label: "Account Fees & Credits",
          path: bankRoutes.company.accountFeesCredits,
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
        },
        {
          dataCy: "general-settings",
          label: "Settings",
          path: bankRoutes.company.settings,
        },
      ] as BankCustomerPath[],
    },
  ];
};

interface Props {
  children: ({
    companyId,
    productType,
    isActiveContract,
  }: {
    companyId: string;
    productType: ProductTypeEnum | null;
    isActiveContract: boolean | null;
  }) => NonNullable<JSX.Element>;
}

export default function BankCompanyPage({ children }: Props) {
  const {
    user: { platformMode },
  } = useContext(CurrentUserContext);
  const isRoleBankUser = platformMode === PlatformModeEnum.Bank;
  const { companyId } = useParams<{
    companyId: Companies["id"];
  }>();

  const location = useLocation();
  const classes = useStyles();

  const { data } = useGetCompanyForBankCompanyPageQuery({
    variables: {
      id: companyId,
    },
  });

  const { data: financialSummaryAndContractData } =
    useGetMostRecentFinancialSummaryAndContractByCompanyIdQuery({
      variables: {
        companyId,
      },
    });

  const company = data?.companies_by_pk || null;
  const companyName = company?.name;
  const isActiveContract = !!company?.contract;
  const surveillanceStatus = company?.most_recent_surveillance_result?.[0]
    ?.surveillance_status as SurveillanceStatusEnum;
  const productType =
    (financialSummaryAndContractData?.financial_summaries[0]
      ?.product_type as ProductTypeEnum) ||
    financialSummaryAndContractData?.contracts[0]?.product_type ||
    null;

  const { missingFinancialReportCount, isLatestBorrowingBaseMissing } =
    useGetMissingReportsInfo(companyId);

  const { data: companySettingsData } =
    useGetCompanySettingsByCompanyIdForCustomerQuery({
      variables: {
        company_id: companyId,
      },
    });

  const { data: purchaseOrdersChangesRequestedCountData } =
    useGetPurchaseOrdersChangesRequestedCountForCustomerQuery({
      skip: !companyId,
      variables: {
        company_id: companyId,
      },
    });

  const featureFlags =
    companySettingsData?.company_settings?.[0]?.feature_flags_payload || {};
  const isMetrcBased =
    !!featureFlags &&
    featureFlags.hasOwnProperty(FeatureFlagEnum.ReportingRequirementsCategory)
      ? featureFlags[FeatureFlagEnum.ReportingRequirementsCategory] ===
        ReportingRequirementsCategoryEnum.Four
      : false;
  const purchaseOrdersChangesRequestedCount =
    purchaseOrdersChangesRequestedCountData?.purchase_orders?.length || 0;

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
    <CurrentCustomerProvider companyId={companyId}>
      <Page appBarTitle={companyName || ""}>
        <Box display="flex" alignSelf="stretch">
          <Box className={classes.drawer}>
            <TitleText>{companyName || ""}</TitleText>
            {isRoleBankUser && renderSurveillanceStatus()}
            <List className={classes.list}>
              {getCustomerPaths(
                company,
                missingFinancialReportCount,
                isLatestBorrowingBaseMissing,
                productType,
                isActiveContract,
                isMetrcBased,
                isRoleBankUser,
                purchaseOrdersChangesRequestedCount
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
                            companyPath.visible == null ||
                            !!companyPath?.visible
                        )
                        .map((companyPath) => (
                          <ListItem
                            key={companyPath.path}
                            data-cy={`company-sidebar-item-${companyPath.dataCy}`}
                            button
                            component={Link}
                            to={getBankCompanyRoute(
                              companyId,
                              companyPath.path as BankCompanyRouteEnum
                            )}
                            selected={Boolean(
                              matchPath(
                                location.pathname,
                                getBankCompanyRoute(
                                  companyId,
                                  companyPath.path as BankCompanyRouteEnum
                                )
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
            {!!companyId
              ? children({
                  companyId,
                  productType: productType || null,
                  isActiveContract: isActiveContract || null,
                })
              : null}
          </Box>
        </Box>
      </Page>
    </CurrentCustomerProvider>
  );
}
