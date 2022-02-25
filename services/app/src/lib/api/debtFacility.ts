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
          msg: "Could not create/update the debt facility",
        };
      }
    );
}
