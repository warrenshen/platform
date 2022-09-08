import { Box, Card, CardContent } from "@material-ui/core";
import {
  DisabledSecondaryTextColor,
  TextColor,
} from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { PurchaseOrderLimitedFragment } from "generated/graphql";
import {
  dateAsDateStringClient,
  dateStringPlusXDaysDate,
  formatDateString,
  formatDatetimeString,
  parseDateStringServer,
} from "lib/date";
import { formatCurrency } from "lib/number";
import styled from "styled-components";

const StyledCard = styled(Card)<{}>`
  width: 100%;
  box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-bottom: 16px;
`;

const StyledCardContent = styled(CardContent)<{}>`
  margin-top: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-left: 0px;
  padding-top: 32px;
  padding-right: 32px;
  padding-bottom: 32px;
  padding-left: 32px;
`;

interface CardLineProps {
  labelText: string;
  valueText: string;
}

function CardLine({ labelText, valueText }: CardLineProps) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      width={"100%"}
      mb={"16px"}
    >
      <Text
        textVariant={TextVariants.Label}
        color={DisabledSecondaryTextColor}
        bottomMargin={0}
      >
        {labelText}
      </Text>
      <Text textVariant={TextVariants.Label} color={TextColor} bottomMargin={0}>
        {valueText}
      </Text>
    </Box>
  );
}

interface Props {
  purchaseOrder: PurchaseOrderLimitedFragment;
  handleClick: () => void;
}

export default function PurchaseOrderVendorReviewCard({
  purchaseOrder,
  handleClick,
}: Props) {
  const dueDate = !!purchaseOrder?.net_terms
    ? dateStringPlusXDaysDate(purchaseOrder.order_date, purchaseOrder.net_terms)
    : parseDateStringServer(purchaseOrder.order_date);

  const orderDate = !!purchaseOrder?.order_date
    ? formatDateString(purchaseOrder.order_date)
    : "";

  const requestedAt = !!purchaseOrder?.requested_at
    ? formatDatetimeString(
        purchaseOrder.requested_at,
        true,
        "Not Yet Requested",
        true
      )
    : "";

  return (
    <StyledCard>
      <StyledCardContent>
        <Text
          materialVariant="h3"
          isBold
          textVariant={TextVariants.SubHeader}
          handleClick={handleClick}
        >
          {`PO ${purchaseOrder.order_number}`}
        </Text>
        <CardLine labelText={"Buyer"} valueText={purchaseOrder.company.name} />
        <CardLine
          labelText={"Amount"}
          valueText={formatCurrency(purchaseOrder.amount)}
        />
        <CardLine labelText={"PO date"} valueText={orderDate || ""} />
        <CardLine
          labelText={"Due date"}
          valueText={!!dueDate ? dateAsDateStringClient(dueDate) : ""}
        />
        <CardLine
          labelText={"Approval requested at"}
          valueText={requestedAt || ""}
        />
      </StyledCardContent>
    </StyledCard>
  );
}
