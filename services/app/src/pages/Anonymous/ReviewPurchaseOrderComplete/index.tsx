import { Box, Theme, createStyles, makeStyles } from "@material-ui/core";
import PurchaseOrderVendorReviewCard from "components/PurchaseOrder/PurchaseOrderVendorReviewCard";
import { ApproveBlue } from "components/Shared/Colors/GlobalColors";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { useGetVendorReviewablePurchaseOrdersQuery } from "generated/graphql";
import { CheckIcon } from "icons";
import { anonymousRoutes } from "lib/routes";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100vw",
      height: "100vh",
      overflow: "scroll",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 500,
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(8),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  })
);

function ReviewPurchaseOrderCompletePage(props: any) {
  const classes = useStyles();
  const history = useHistory();
  const vendorId = !!props?.history?.location?.state?.vendor_id
    ? props.history.location.state.vendor_id
    : null;
  const linkVal = !!props?.history?.location?.state?.link_val
    ? props.history.location.state.link_val
    : null;

  const { data, error } = useGetVendorReviewablePurchaseOrdersQuery({
    skip: !vendorId,
    fetchPolicy: "network-only",
    variables: {
      vendor_id: vendorId,
    },
  });

  if (error) {
    console.error({ error });
  }

  const purchaseOrders = data?.purchase_orders || [];
  const successMessage =
    purchaseOrders.length > 0
      ? "Your response was saved successfully. You can view other POs waiting for your review below"
      : "Your response was saved successfully. You may now close this page.";

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.container}>
        <Box display="flex" flexDirection="column">
          <CheckIcon fillColor={ApproveBlue} width={"56"} height={"56"} />
          <Text
            textVariant={TextVariants.Header}
            color={ApproveBlue}
            bottomMargin={16}
          >
            Success
          </Text>
          <Text textVariant={TextVariants.ParagraphLead} materialVariant="h5">
            Thank you!
          </Text>
          <Text
            textVariant={TextVariants.Paragraph}
            materialVariant="body2"
            bottomMargin={40}
          >
            {successMessage}
          </Text>

          {purchaseOrders.length > 0 && (
            <>
              <Text textVariant={TextVariants.ParagraphLead}>
                Waiting For Review
              </Text>
              {purchaseOrders.map((purchaseOrder) => (
                <PurchaseOrderVendorReviewCard
                  purchaseOrder={purchaseOrder}
                  handleClick={() => {
                    history.push({
                      pathname: anonymousRoutes.reviewPurchaseOrderNew,
                      state: {
                        payload: {
                          purchase_order_id: purchaseOrder.id,
                        },
                        link_val: linkVal,
                      },
                    });
                  }}
                />
              ))}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ReviewPurchaseOrderCompletePage;
