import { addBusinessDays, format } from "date-fns";

const getNextDayOfWeek = (date: Date, weekday: number) => {
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

export const getFuturePaymentDate = () => {
  const now = new Date();
  const paymentDate = getNextDayOfWeek(now, 3);

  return {
    paymentDate: dateAsDateStringClient(paymentDate),
  };
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

  const maturityDate = new Date(
    now.getFullYear() + 1,
    now.getMonth(),
    now.getDate()
  );

  return {
    orderDate: orderDateString,
    requestedAt: requestedAtString,
    approvedAt: approvedAtString,
    maturityDate,
  };
};

interface RequestFinancingProps {
  expectedMuiStatus: string;
  weekday: number;
  isHappyPath: boolean;
}

export const requestFinancing = ({
  expectedMuiStatus = "",
  weekday,
  isHappyPath = false,
}: Partial<RequestFinancingProps>) => {
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

  cy.dataCy("request-financing-button").click();

  cy.dataCy("requested-payment-date-date-picker").type(
    requestedPaymentDateString
  );
  cy.dataCy("financing-request-amount-input").type(Number(440.0).toString());

  cy.dataCy("create-financing-requests-modal-primary-button").click();
  cy.get(expectedMuiStatus).should("exist");
};

export const inactiveCustomerLoansCheckButtonsDisabledFlow = () => {
  // Go to Customer > Loans
  cy.dataCy("sidebar-item-loans").click();
  cy.url().should("include", "loans");

  // Verify that the buttons are disabled
  // (Not Funded Loans)
  cy.persistentClick(
    "[data-cy='not-funded-loans-datagrid'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("create-loan-button").should("be.disabled");
  cy.dataCy("edit-loan-button").should("be.disabled");
  cy.dataCy("delete-loan-button").should("be.disabled");

  // (Funded Loans)
  cy.persistentClick(
    "[data-cy='funded-loans-data-grid-container'] table tr[aria-rowindex='1'] td[aria-colindex='1'] .dx-select-checkbox"
  );
  cy.dataCy("repay-loans-button").should("be.disabled");
};
