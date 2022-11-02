import { Box, Button, Typography } from "@material-ui/core";
import { PurchaseOrderViewModalProps } from "components/PurchaseOrder/v2/BankPurchaseOrderDrawer";
import PurchaseOrderMetrcViewModalCard from "components/PurchaseOrder/v2/PurchaseOrderMetrcViewModalCard";
import PurchaseOrderViewModalCard from "components/PurchaseOrder/v2/PurchaseOrderViewModalCard";
import { DisabledSecondaryTextColor } from "components/Shared/Colors/GlobalColors";
import DownloadThumbnail from "components/Shared/File/DownloadThumbnail";
import FileViewer from "components/Shared/File/FileViewer";
import LabeledCheckbox from "components/Shared/FormInputs/LabeledCheckbox";
import TabContainer from "components/Shared/Tabs/TabContainer";
import Text, { TextVariants } from "components/Shared/Text/Text";
import { PurchaseOrderFileTypeEnum } from "generated/graphql";
import { FileTypeEnum } from "lib/enum";
import { getPurchaseOrderFilesOfType } from "lib/purchaseOrders";
import { useMemo, useState } from "react";

const BankPurchaseOrderGeneralInformationDrawerTab = ({
  purchaseOrder,
}: PurchaseOrderViewModalProps) => {
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [isCannabisFileViewerOpen, setIsCannabisFileViewerOpen] =
    useState(false);

  const purchaseOrderFileIds = useMemo(() => {
    return getPurchaseOrderFilesOfType(
      purchaseOrder,
      PurchaseOrderFileTypeEnum.PurchaseOrder
    );
  }, [purchaseOrder]);
  const purchaseOrderCannabisFileIds = useMemo(() => {
    return getPurchaseOrderFilesOfType(
      purchaseOrder,
      PurchaseOrderFileTypeEnum.Cannabis
    );
  }, [purchaseOrder]);

  if (!purchaseOrder) {
    return <></>;
  }

  const isMetrcBased = !!purchaseOrder.is_metrc_based;
  const isCannabis = !!purchaseOrder?.is_cannabis
    ? purchaseOrder.is_cannabis
    : false;

  const metrcTransfers = !!purchaseOrder?.purchase_order_metrc_transfers
    ? purchaseOrder.purchase_order_metrc_transfers
    : [];

  return (
    <TabContainer>
      <Box mb={2}>
        <PurchaseOrderViewModalCard purchaseOrder={purchaseOrder} />
      </Box>
      <Box mb={2}>
        <LabeledCheckbox
          isDisabled={true}
          isChecked={isMetrcBased}
          label={"Order based on Metrc manifest?"}
          color={DisabledSecondaryTextColor}
        />
      </Box>
      <>
        {isMetrcBased &&
          metrcTransfers.map((transfer) => (
            <Box mb={2}>
              <Box mb={2}>
                <Text
                  materialVariant={"p"}
                  textVariant={TextVariants.Paragraph}
                >
                  Metrc Manifest
                </Text>
              </Box>
              <PurchaseOrderMetrcViewModalCard
                companyId={purchaseOrder.company_id}
                metrcTransfer={transfer}
              />
            </Box>
          ))}
      </>
      <Box display="flex" flexDirection="column" mt={2}>
        <Box mb={1}>
          <Typography variant="subtitle2" color="textSecondary">
            Purchase Order File Attachment(s)
          </Typography>
        </Box>
        <DownloadThumbnail
          fileIds={purchaseOrderFileIds}
          fileType={FileTypeEnum.PurchaseOrder}
        />
        <Button
          style={{ alignSelf: "flex-start" }}
          variant="outlined"
          size="small"
          onClick={() => setIsFileViewerOpen(!isFileViewerOpen)}
        >
          {isFileViewerOpen ? "Hide File(s)" : "Show File(s)"}
        </Button>
        {isFileViewerOpen && (
          <Box mt={1}>
            <FileViewer
              fileIds={purchaseOrderCannabisFileIds}
              fileType={FileTypeEnum.PurchaseOrder}
            />
          </Box>
        )}
      </Box>
      <>
        {!isMetrcBased && (
          <>
            <LabeledCheckbox
              isDisabled={true}
              isChecked={!!purchaseOrder.is_cannabis}
              label={"Order includes cannabis or derivatives?"}
              color={DisabledSecondaryTextColor}
            />
            {isCannabis && (
              <Box display="flex" flexDirection="column" mt={2}>
                <Box mb={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Cannabis File Attachments (Shipping Manifest, Certificate of
                    Analysis)
                  </Typography>
                </Box>
                <DownloadThumbnail
                  fileIds={purchaseOrderCannabisFileIds}
                  fileType={FileTypeEnum.PurchaseOrder}
                />
                <Button
                  style={{ alignSelf: "flex-start" }}
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setIsCannabisFileViewerOpen(!isCannabisFileViewerOpen)
                  }
                >
                  {isFileViewerOpen ? "Hide File(s)" : "Show File(s)"}
                </Button>
                {isCannabisFileViewerOpen && (
                  <Box mt={1}>
                    <FileViewer
                      fileIds={purchaseOrderCannabisFileIds}
                      fileType={FileTypeEnum.PurchaseOrder}
                    />
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </>
      <>
        {isMetrcBased && (
          <>
            <Box display="flex" flexDirection="column" mt={2}>
              <Box mb={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Cannabis File Attachments (Shipping Manifest, Certificate of
                  Analysis)
                </Typography>
              </Box>
              <Text materialVariant={"p"} textVariant={TextVariants.Paragraph}>
                No cannabis file attachments because the purchase order is Metrc
                based on a Metrc manifest.
              </Text>
            </Box>
          </>
        )}
      </>
    </TabContainer>
  );
};

export default BankPurchaseOrderGeneralInformationDrawerTab;
