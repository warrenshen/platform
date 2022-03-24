import {
  authenticatedApi,
  debtFacilityRoutes,
  CustomMutationResponse,
} from "lib/api";

export type UpdateDebtFacilityCapacityReq = {
  variables: {
    newCapacity: number;
    debtFacilityId: string;
    statusChangeComment: string;
  };
};

export async function updateDebtFacilityCapacity(
  req: UpdateDebtFacilityCapacityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.updateCapacity, req)
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
          msg: "Could not update the debt facility capacity",
        };
      }
    );
}

export type CreateUpdateDebtFacilityReq = {
  variables: {
    isUpdate: boolean;
    name: string;
    id: string;
    supported: string[];
  };
};

export async function createUpdateDebtFacility(
  req: CreateUpdateDebtFacilityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.createUpdateFacility, req)
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
  };
};

export async function updateCompanyDebtFacilityStatus(
  req: UpdateCompanyDebtFacilityStatusReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.updateCompanyStatus, req)
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
  };
};

export async function moveLoansForDebtFacility(
  req: MoveLoansForDebtFacilityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.moveLoans, req)
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
    facilityId: string;
    resolveNote: string;
    resolveStatus: string;
  };
};

export async function resolveLoansForDebtFacility(
  req: ResolveLoansForDebtFacilityReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(debtFacilityRoutes.resolveLoans, req)
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
          msg:
            "Could not resolve the debt facility action required for this loan",
        };
      }
    );
}
