import { addBusinessDays, format, parse } from "date-fns";

const getNextDayOfWeek = (date, weekday) => {
  const offset = (weekday + 7 - date.getDay()) % 7;
  date.setDate(date.getDate() + offset);

  return date;
};

// We are borrowing / modifying this function from date.ts instead of importing it
// Once we figure out the missing configuration piece to have Cypress
// import functions from our main code base, we can just import the function
const DateFormatClient = "MM/dd/yyyy";
const dateAsDateStringClient = (date: Date) => {
  try {
    return format(date, DateFormatClient);
  } catch (error) {
    throw new Error(
      `Could not format the date "${date}". Error message: "${error}".`
    );
  }
};

const DateFormatServer = "yyyy-MM-dd";
const dateAsDateStringServer = (date: Date) => {
  try {
    return format(date, DateFormatServer);
  } catch (error) {
    throw new Error(
      `Could not format the date "${date}". Error message: "${error}".`
    );
  }
};

export const getTestSetupDates = () => {
  // In the original bug that lead to creating this test, the timestamp
  // for requested_at was 2022-05-06T20:14:00.648625+00:00. Here we say
  // get us the nearest Friday and then set the time and timezone to match
  // Europe/London is the appropriate timezone string to use for UTC
  //
  // Additional context: we don't just use the static string because this
  // is more straightforward than getting cypress *and* the api to agree
  // on a fake date for testing purposes

  const now = new Date();

  const orderDate = new Date();
  orderDate.setDate(orderDate.getDate() - 3);
  const orderDateString = dateAsDateStringServer(orderDate);

  const requestedAt = getNextDayOfWeek(now, 5);
  requestedAt.setHours(20, 14, 0);
  const requestedAtString = requestedAt.toLocaleString("en-US", {
    timeZone: "Europe/London",
  });

  const approvedAt = getNextDayOfWeek(now, 5);
  approvedAt.setHours(21, 2, 8);
  const approvedAtString = approvedAt.toLocaleString("en-US", {
    timeZone: "Europe/London",
  });

  return {
    orderDate: orderDateString,
    requestedAt: requestedAtString,
    approvedAt: approvedAtString,
  };
};

interface RequestFinancingProps {
  expectedMuiStatus: string;
  weekday: number;
  isHappyPath: boolean;
}

export const requestFinancing = ({
  expectedMuiStatus,
  weekday,
  isHappyPath = false,
}: RequestFinancingProps) => {
  const now = new Date();

  // The requested date fell on a Saturday, we just grab the next available
  // Saturday for the failure test case. For the happy path, we have to be a
  // little more cautious since any weekday *could* be a holiday. As such,
  // we add a business day for the happy path case to make sure we're always
  // requesting a valid date
  const requestedPaymentDate = isHappyPath
    ? addBusinessDays(getNextDayOfWeek(now, 6), 2)
    : getNextDayOfWeek(now, 6);
  const requestedPaymentDateString =
    dateAsDateStringClient(requestedPaymentDate);

  cy.clock(now, ["Date"]);

  // Go to Customer > Purchase Orders
  cy.dataCy("sidebar-item-purchase-orders").click();
  cy.url().should("include", "purchase-orders");

  cy.persistentClick(
    "[data-cy='ready-to-request-purchase-order-data-grid'] tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );

  cy.dataCy("request-purchase-order-financing-button").click();

  cy.dataCy("artifact-loan-request-payment-date").type(
    requestedPaymentDateString
  );

  cy.dataCy("create-update-artifact-loan-modal-primary-button").click();
  cy.get(expectedMuiStatus).should("exist");
};
