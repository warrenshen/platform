import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AchAdvancesDataGrid from "components/Advances/AchAdvancesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import SelectDropdown from "components/Shared/FormInputs/SelectDropdown";
import { useGetRepaymentsByMethodAndPaymentDateQuery } from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import {
  DebtFacilityCompanyStatusEnum,
  ProductTypeEnum,
  RepaymentMethodEnum,
  TPExportCategoryEnum,
  TPExportCategoryEnumToLabel,
  TPExportCategoryEnums,
} from "lib/enum";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

export default function BankRepaymentsExportAchsTab() {
  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());
  const [selectedCategory, setSelectedCategory] = useState<string>(
    TPExportCategoryEnum.All
  );

  const { data, error } = useGetRepaymentsByMethodAndPaymentDateQuery({
    fetchPolicy: "network-only",
    variables: {
      method: RepaymentMethodEnum.ReverseDraftACH,
      date: selectedDate,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const payments = data?.payments || [];

  const selectedPayments =
    payments.filter(({ company }) => {
      const mostRecentFinancialSummary =
        company?.most_recent_financial_summary?.[0];
      if (selectedCategory === TPExportCategoryEnum.Ineligible) {
        return (
          company?.debt_facility_status ===
          DebtFacilityCompanyStatusEnum.Ineligible
        );
      } else if (selectedCategory === TPExportCategoryEnum.EligibleDispensary) {
        return (
          mostRecentFinancialSummary.product_type ===
            ProductTypeEnum.DispensaryFinancing &&
          (company?.debt_facility_status ===
            DebtFacilityCompanyStatusEnum.Eligible ||
            company?.debt_facility_status ===
              DebtFacilityCompanyStatusEnum.Waiver)
        );
      } else if (selectedCategory === TPExportCategoryEnum.EligibleCore) {
        return (
          mostRecentFinancialSummary?.product_type !==
            ProductTypeEnum.DispensaryFinancing &&
          (company?.debt_facility_status ===
            DebtFacilityCompanyStatusEnum.Eligible ||
            company?.debt_facility_status ===
              DebtFacilityCompanyStatusEnum.Waiver)
        );
      } else {
        return true;
      }
    }) || [];

  return (
    <Container>
      <Box display="flex" mb={2}>
        <DateInput
          id="payment-date-date-picker"
          label="Payment Date"
          value={selectedDate}
          onChange={(value) =>
            setSelectedDate(value || todayAsDateStringServer())
          }
        />
        <Box ml={2} width={300}>
          <SelectDropdown
            id="category-dropdown"
            value={selectedCategory}
            label="Category"
            options={TPExportCategoryEnums}
            optionDisplayMapper={TPExportCategoryEnumToLabel}
            variant="standard"
            setValue={(value) => {
              setSelectedCategory(value);
            }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <Box mb={2}>
          <Alert severity="info">
            <Typography variant="body1">
              Note the default Payment Date is today. Press the export button /
              icon at the top right of the table to export rows (non-header
              rows) in CSV file format.
            </Typography>
          </Alert>
        </Box>
        <AchAdvancesDataGrid payments={selectedPayments} isRepayment />
      </Box>
    </Container>
  );
}
