import {
  CustomersWithMetadataFragment,
  EbbaApplicationFilesInsertInput,
  EbbaApplications,
} from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  ebbaApplicationsRoutes,
  emailAlertRoutes,
} from "lib/api";

export type SubmitEbbaApplicationReq = {
  variables: {
    ebba_application_id: EbbaApplications["id"];
  };
};

export async function submitEbbaApplicationMutation(
  req: SubmitEbbaApplicationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.submitForApproval, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not submit ebba application",
        };
      }
    );
}

export type DeleteEbbaApplicationReq = {
  variables: {
    ebba_application_id: EbbaApplications["id"];
  };
};

export async function deleteEbbaApplicationMutation(
  req: DeleteEbbaApplicationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.delete, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not delete borrowing base",
        };
      }
    );
}

export type AddFinancialReportReq = {
  variables: {
    company_id: string;
    application_date: string;
    expires_date: string;
    ebba_application_files: EbbaApplicationFilesInsertInput[];
  };
};

export async function addFinancialReportMutation(
  req: AddFinancialReportReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.addFinancialReport, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not add financial report",
        };
      }
    );
}

export type UpdateFinancialReportReq = {
  variables: {
    company_id: string;
    ebba_application_id: string;
    application_date: string;
    expires_date: string;
    ebba_application_files: EbbaApplicationFilesInsertInput[];
  };
};

export async function updateFinancialReportMutation(
  req: UpdateFinancialReportReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.updateFinancialReport, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not update financial report",
        };
      }
    );
}

export type AddBorrowingBaseReq = {
  variables: {
    company_id: string;
    application_date: string;
    monthly_accounts_receivable: number;
    monthly_inventory: number;
    monthly_cash: number;
    amount_cash_in_daca: number;
    amount_custom: number;
    amount_custom_note: string;
    bank_note: string;
    calculated_borrowing_base: number;
    expires_date: string;
    ebba_application_files: EbbaApplicationFilesInsertInput[];
  };
};

export async function addBorrowingBaseMutation(
  req: AddBorrowingBaseReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.addBorrowingBase, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not add borrowing base",
        };
      }
    );
}

export type UpdateBorrowingBaseReq = {
  variables: {
    ebba_application_id: string;
    company_id: string;
    application_date: string;
    monthly_accounts_receivable: number;
    monthly_inventory: number;
    monthly_cash: number;
    amount_cash_in_daca: number;
    amount_custom: number;
    amount_custom_note: string;
    bank_note: string;
    calculated_borrowing_base: number;
    expires_date: string;
    ebbaApplicationFiles: EbbaApplicationFilesInsertInput[];
  };
};

export async function updateBorrowingBaseMutation(
  req: UpdateBorrowingBaseReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.updateBorrowingBase, req.variables)
    .then((res) => res.data)
    .then(
      (res) => res,
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not update borrowing base",
        };
      }
    );
}

export type UpdateBorrowingBaseBankNoteReq = {
  variables: {
    companyId: string;
    ebbaApplicationId: string;
    bankNote: string;
  };
};

export async function updateBorrowingBaseBankNoteMutation(
  req: UpdateBorrowingBaseBankNoteReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(ebbaApplicationsRoutes.updateBorrowingBaseBankNote, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not edit repayment bank note for the loan",
        };
      }
    );
}

export type SendFinancialStatementAlertReq = {
  variables: {
    isTest: boolean;
    email: String;
    companies: CustomersWithMetadataFragment["id"][];
  };
};

export async function sendFinancialStatementAlert(
  req: SendFinancialStatementAlertReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(emailAlertRoutes.sendFinancialStatementAlert, req)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.error(error);
        return {
          status: "ERROR",
          msg: "Could not send off financial statement alert emails",
        };
      }
    );
}
