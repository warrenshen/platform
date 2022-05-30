import {
  CustomMutationResponse,
  authenticatedApi,
  debtFacilityRoutes,
} from "lib/api";

export type CreateUpdateDebtFacilityReq = {
  variables: {
    isUpdate: boolean;
    name: string;
    id: string;
    supported: string[];
    newMaximumCapacity: number;
    newDrawnCapacity: number;
  };
};

export async function createUpdateDebtFacility(
  req: CreateUpdateDebtFacilityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.createUpdateFacility, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not create/update the debt facility",
        };
      }
    );
}

export type UpdateCompanyDebtFacilityStatusReq = {
  variables: {
    companyId: string;
    debtFacilityStatus: string;
    statusChangeComment: string;
    waiverDate: string;
    waiverExpirationDate: string;
  };
};

export async function updateCompanyDebtFacilityStatus(
  req: UpdateCompanyDebtFacilityStatusReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.updateCompanyStatus, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not update the company's debt facility status",
        };
      }
    );
}

export type MoveLoansForDebtFacilityReq = {
  variables: {
    loanIds: string;
    facilityId: string;
    isMovingToFacility: boolean;
    moveComments: string;
    moveDate: string;
  };
};

export async function moveLoansForDebtFacility(
  req: MoveLoansForDebtFacilityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.moveLoans, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not move the loans for the debt facility",
        };
      }
    );
}

export type ResolveLoansForDebtFacilityReq = {
  variables: {
    loanId: string;
    resolveNote: string;
    resolveStatus: string;
    waiverDate: string;
    waiverExpirationDate: string;
  };
};

export async function resolveLoansForDebtFacility(
  req: ResolveLoansForDebtFacilityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.resolveLoans, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not resolve the debt facility action required for this loan",
        };
      }
    );
}

export type UpdateDebtFacilityAssignedDateReq = {
  variables: {
    newAssignedDate: string;
    loanIds: string[];
  };
};

export async function updateDebtFacilityAssignedDate(
  req: UpdateDebtFacilityAssignedDateReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.updateAssignedDate, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not resolve the debt facility action required for this loan",
        };
      }
    );
}

export type CheckForDebtFacilityPastDueLoansReq = {
  variables: {};
};

export async function checkForDebtFacilityPastDueLoans(
  req: CheckForDebtFacilityPastDueLoansReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.checkPastDue, req.variables)
    .then((res) => {
      return res.data;
    })
    .then(
      (response) => {
        return response;
      },
      (error) => {
        console.log("error", error);
        return {
          status: "ERROR",
          msg: "Could not check for past due loans in the debt facility",
        };
      }
    );
}
