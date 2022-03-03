import { ComponentProps } from "react";
import { render, cleanup, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { Box, Modal, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CreateAdvanceModal from "./CreateAdvanceModal";
import * as GraphQLQueries from "generated/graphql";
import BankAccountInfoCard from "components/BankAccount/BankAccountInfoCard";
import LoansDataGrid from "components/Loans/LoansDataGrid";
import AdvanceForm from "./AdvanceForm";
import { LoanTypeEnum } from "generated/graphql";

//#region Mocks all components imports that are used in AdvanceForm

jest.mock("@material-ui/core", () => {
  const module = jest.requireActual("@material-ui/core");

  return {
    ...module,
    Box: ({ children }: ComponentProps<typeof Box>) => (
      <div test-id="Box">{children}</div>
    ),
    Typography: ({ children }: ComponentProps<typeof Typography>) => (
      <div test-id="Typography">{children}</div>
    ),
  };
});

jest.mock("@material-ui/lab", () => {
  const module = jest.requireActual("@material-ui/lab");

  return {
    ...module,
    Alert: ({ children }: ComponentProps<typeof Alert>) => (
      <div data-testid="Alert">{children}</div>
    ),
  };
});

jest.mock(
  "components/Advance/AdvanceForm",
  () => (props: ComponentProps<typeof AdvanceForm>) => (
    <div data-testid="AdvanceForm" {...props} />
  )
);

jest.mock(
  "components/BankAccount/BankAccountInfoCard",
  () => (props: ComponentProps<typeof BankAccountInfoCard>) => (
    <div data-testid="BankAccountInfoCard" {...props} />
  )
);

jest.mock(
  "components/Loans/LoansDataGrid",
  () => (props: ComponentProps<typeof LoansDataGrid>) => (
    <div data-testid="LoansDataGrid" {...props} />
  )
);

jest.mock(
  "components/Shared/Modal/Modal",
  () => ({ children }: ComponentProps<typeof Modal>) => (
    <div data-testid="Modal">{children}</div>
  )
);

//#endregion

type MockedProps = {
  selectedLoanIds: number[];
  handleClose: () => void;
};

//#region Utility functions

const defaultMockedProps: MockedProps = {
  selectedLoanIds: [1, 2, 3],
  handleClose: jest.fn(),
};

const createMockedProps = (props = {}): MockedProps => ({
  ...defaultMockedProps,
  ...props,
});

const mockQuery = (functionName: any, data = {}, error = null) =>
  jest
    .spyOn(GraphQLQueries, functionName, "get")
    .mockReturnValue({ data, error });

const waitForQueryResponse = async () =>
  await waitFor(() => new Promise((res) => setTimeout(res, 0)));

const renderMockedComponent = (props: MockedProps) =>
  render(
    <MockedProvider mocks={[]} addTypename={false}>
      <CreateAdvanceModal {...props} />
    </MockedProvider>
  );

//#endregion

/*
    Those 4 tests are here to make sure the Alert component shows in the 4 cases we want it to show
    At the same time I make sure that the Advance form doesn't show.
    The logic is pretty much the same across the 4 cases, the only thing that changes is what the loans we
    use to mock the response from the mocked useGetLoansByLoanIdsQuery function
*/

describe("CreateAdvanceModal should render an Alert Tag when", () => {
  afterEach(cleanup);

  test("useGetLoansByLoanIdsQuery returns more than one Purchase Order with different vendor_id values", async () => {
    const loans = [
      {
        id: 1,
        loan_type: LoanTypeEnum.PurchaseOrder,
        purchase_order: {
          vendor_id: 1,
        },
      },
      {
        id: 2,
        loan_type: LoanTypeEnum.PurchaseOrder,
        purchase_order: {
          vendor_id: 3,
        },
      },
    ];
    // Mocks both Apollo Queries using the mockQuery utility function I created above (line 87)
    mockQuery("useGetLoansByLoanIdsQuery", { loans });
    mockQuery("useGetAdvancesBankAccountsForCustomerQuery");

    // Creates a mockedProps object and renders the component
    const props = createMockedProps();
    renderMockedComponent(props);

    // Waits for the query to return, which is pretty much instantaneous but we still need to wait for the component to rerender
    await waitForQueryResponse();

    // Checks to see if the useGetLoansByLoanIdsQuery query was called with the correct variables
    expect(GraphQLQueries.useGetLoansByLoanIdsQuery).toBeCalledWith(
      expect.objectContaining({
        variables: { loan_ids: props.selectedLoanIds },
      })
    );
    // Checks if the AdvanceForm component wasn't rendered
    expect(() => screen.getByTestId("AdvanceForm")).toThrow();
    // Checks if the Alert component was rendered
    expect(screen.getByTestId("Alert")).not.toBeNull();
  });

  test("useGetLoansByLoanIdsQuery returns more than one LineOfCredit with different recipient_vendor_id values", async () => {
    const loans = [
      {
        id: 1,
        loan_type: LoanTypeEnum.LineOfCredit,
        line_of_credit: {
          recipient_vendor_id: 1,
        },
      },
      {
        id: 2,
        loan_type: LoanTypeEnum.LineOfCredit,
        line_of_credit: {
          recipient_vendor_id: 3,
        },
      },
    ];
    mockQuery("useGetLoansByLoanIdsQuery", { loans });
    mockQuery("useGetAdvancesBankAccountsForCustomerQuery");

    const props = createMockedProps();
    renderMockedComponent(props);

    await waitForQueryResponse();
    expect(GraphQLQueries.useGetLoansByLoanIdsQuery).toBeCalledWith(
      expect.objectContaining({
        variables: { loan_ids: props.selectedLoanIds },
      })
    );
    expect(() => screen.getByTestId("AdvanceForm")).toThrow();
    expect(screen.getByTestId("Alert")).not.toBeNull();
  });

  test("useGetLoansByLoanIdsQuery returns more than one LineOfCredit with different company_id values", async () => {
    const loans = [
      {
        id: 1,
        loan_type: LoanTypeEnum.LineOfCredit,
        company_id: 1,
      },
      {
        id: 2,
        loan_type: LoanTypeEnum.LineOfCredit,
        company_id: 2,
      },
    ];
    mockQuery("useGetLoansByLoanIdsQuery", { loans });
    mockQuery("useGetAdvancesBankAccountsForCustomerQuery");

    const props = createMockedProps();
    renderMockedComponent(props);

    await waitForQueryResponse();
    expect(GraphQLQueries.useGetLoansByLoanIdsQuery).toBeCalledWith(
      expect.objectContaining({
        variables: { loan_ids: props.selectedLoanIds },
      })
    );
    expect(() => screen.getByTestId("AdvanceForm")).toThrow();
    expect(screen.getByTestId("Alert")).not.toBeNull();
  });

  test("useGetLoansByLoanIdsQuery returns more than one LineOfCredit with different company_id and recipient_vendor_id values", async () => {
    const expectedVendorId = 1;

    const loans = [
      {
        id: 1,
        loan_type: LoanTypeEnum.LineOfCredit,
        company_id: expectedVendorId,
      },
      {
        id: 2,
        loan_type: LoanTypeEnum.LineOfCredit,
        line_of_credit: {
          recipient_vendor_id: 3,
        },
      },
    ];
    mockQuery("useGetLoansByLoanIdsQuery", { loans });
    mockQuery("useGetAdvancesBankAccountsForCustomerQuery");

    const props = createMockedProps();
    renderMockedComponent(props);

    await waitForQueryResponse();
    expect(GraphQLQueries.useGetLoansByLoanIdsQuery).toBeCalledWith(
      expect.objectContaining({
        variables: { loan_ids: props.selectedLoanIds },
      })
    );
    expect(
      GraphQLQueries.useGetAdvancesBankAccountsForCustomerQuery
    ).toBeCalledWith({
      skip: true,
      variables: {
        customerId: null,
        vendorId: null,
      },
    });
    expect(() => screen.getByTestId("AdvanceForm")).toThrow();
    expect(screen.getByTestId("Alert")).not.toBeNull();
  });
});

/*
    Those 4 tests are here to make sure the Advance component shows in the 4 cases we want it to show
    At the same time I make sure that the Alert form doesn't show.
    The logic is pretty much the same across the 4 cases, the only thing that changes is what the loans we
    use to mock the response from the mocked useGetLoansByLoanIdsQuery function

    These tests are structurally very similar to the ones above.
    But for this set of tests I didn't test all the use cases because JR told me that this was just meant to be a demo for the moment.
*/

describe("CreateAdvanceModal should render an AdvanceForm Tag when", () => {
  afterEach(cleanup);

  test("useGetLoansByLoanIdsQuery returns more than one Purchase Order with same vendor_id values", async () => {
    const expectedVendorId = 1;
    const loans = [
      {
        id: 1,
        loan_type: LoanTypeEnum.PurchaseOrder,
        purchase_order: {
          vendor_id: expectedVendorId,
        },
      },
      {
        id: 2,
        loan_type: LoanTypeEnum.PurchaseOrder,
        purchase_order: {
          vendor_id: expectedVendorId,
        },
      },
    ];
    mockQuery("useGetLoansByLoanIdsQuery", { loans });
    mockQuery("useGetAdvancesBankAccountsForCustomerQuery");

    const props = createMockedProps();
    renderMockedComponent(props);

    await waitForQueryResponse();
    expect(GraphQLQueries.useGetLoansByLoanIdsQuery).toBeCalledWith(
      expect.objectContaining({
        variables: { loan_ids: props.selectedLoanIds },
      })
    );
    expect(
      GraphQLQueries.useGetAdvancesBankAccountsForCustomerQuery
    ).toBeCalledWith({
      skip: false,
      variables: {
        customerId: undefined,
        vendorId: expectedVendorId,
      },
    });
    expect(screen.getByTestId("AdvanceForm")).not.toBeNull();
    expect(() => screen.getByTestId("Alert")).toThrow();
  });

  test("useGetLoansByLoanIdsQuery returns more than one LineOfCredit with same recipient_vendor_id values", async () => {
    const expectedVendorId = 2;
    const loans = [
      {
        id: 1,
        loan_type: LoanTypeEnum.LineOfCredit,
        line_of_credit: {
          recipient_vendor_id: expectedVendorId,
        },
      },
      {
        id: 2,
        loan_type: LoanTypeEnum.LineOfCredit,
        line_of_credit: {
          recipient_vendor_id: expectedVendorId,
        },
      },
    ];
    mockQuery("useGetLoansByLoanIdsQuery", { loans });
    mockQuery("useGetAdvancesBankAccountsForCustomerQuery");

    const props = createMockedProps();
    renderMockedComponent(props);

    await waitForQueryResponse();
    expect(GraphQLQueries.useGetLoansByLoanIdsQuery).toBeCalledWith(
      expect.objectContaining({
        variables: { loan_ids: props.selectedLoanIds },
      })
    );
    expect(
      GraphQLQueries.useGetAdvancesBankAccountsForCustomerQuery
    ).toBeCalledWith({
      skip: false,
      variables: {
        customerId: undefined,
        vendorId: expectedVendorId,
      },
    });
    expect(screen.getByTestId("AdvanceForm")).not.toBeNull();
    expect(() => screen.getByTestId("Alert")).toThrow();
  });

  test("useGetLoansByLoanIdsQuery returns more than one LineOfCredit with same company_id values", async () => {
    const expectedVendorId = 1;
    const loans = [
      {
        id: 1,
        loan_type: LoanTypeEnum.LineOfCredit,
        company_id: expectedVendorId,
      },
      {
        id: 2,
        loan_type: LoanTypeEnum.LineOfCredit,
        company_id: expectedVendorId,
      },
    ];
    mockQuery("useGetLoansByLoanIdsQuery", { loans });
    mockQuery("useGetAdvancesBankAccountsForCustomerQuery");

    const props = createMockedProps();
    renderMockedComponent(props);

    await waitForQueryResponse();
    expect(GraphQLQueries.useGetLoansByLoanIdsQuery).toBeCalledWith(
      expect.objectContaining({
        variables: { loan_ids: props.selectedLoanIds },
      })
    );
    expect(
      GraphQLQueries.useGetAdvancesBankAccountsForCustomerQuery
    ).toBeCalledWith({
      skip: false,
      variables: {
        customerId: expectedVendorId,
        vendorId: null,
      },
    });
    expect(screen.getByTestId("AdvanceForm")).not.toBeNull();
    expect(() => screen.getByTestId("Alert")).toThrow();
  });

  test("useGetLoansByLoanIdsQuery returns more than one LineOfCredit with same company_id and recipient_vendor_id values", async () => {
    const expectedVendorId = 1;
    const loans = [
      {
        id: 1,
        loan_type: LoanTypeEnum.LineOfCredit,
        company_id: expectedVendorId,
      },
      {
        id: 2,
        loan_type: LoanTypeEnum.LineOfCredit,
        line_of_credit: {
          recipient_vendor_id: expectedVendorId,
        },
      },
    ];
    mockQuery("useGetLoansByLoanIdsQuery", { loans });
    mockQuery("useGetAdvancesBankAccountsForCustomerQuery");

    const props = createMockedProps();
    renderMockedComponent(props);

    await waitForQueryResponse();
    expect(GraphQLQueries.useGetLoansByLoanIdsQuery).toBeCalledWith(
      expect.objectContaining({
        variables: { loan_ids: props.selectedLoanIds },
      })
    );

    expect(
      GraphQLQueries.useGetAdvancesBankAccountsForCustomerQuery
    ).toBeCalledWith({
      skip: false,
      variables: {
        customerId: null,
        vendorId: expectedVendorId,
      },
    });

    expect(screen.getByTestId("AdvanceForm")).not.toBeNull();
    expect(() => screen.getByTestId("Alert")).toThrow();
  });
});
