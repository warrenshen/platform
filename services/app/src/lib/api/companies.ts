import {
  Companies,
  CompaniesInsertInput,
  CompanyPartnershipInvitations,
  CompanyPartnershipRequests,
  CompanySettings,
  CompanySettingsInsertInput,
  ContractsInsertInput,
  UsersInsertInput,
} from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  companyRoutes,
} from "lib/api";
import { CustomMessageEnum } from "lib/enum";

export type CreateCustomerReq = {
  company: CompaniesInsertInput;
  settings: CompanySettingsInsertInput;
  contract: ContractsInsertInput;
};

export type CreateProspectiveCustomerReq = {
  company: CompaniesInsertInput;
};

export async function createCustomer(
  req: CreateCustomerReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createCustomer, req)
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
          msg: "Could not create company",
        };
      }
    );
}

export async function createProspectiveCustomer(
  req: CreateProspectiveCustomerReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createProspectiveCustomer, req)
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
          msg: "Could not create prospective company",
        };
      }
    );
}

export type UpsertCustomMessagesMutationReq = {
  variables: {
    company_settings_id: CompanySettings["id"];
    custom_messages_payload: { [key in CustomMessageEnum]: boolean | null };
  };
};

export async function upsertCustomMessagesMutation(
  req: UpsertCustomMessagesMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.upsertCustomMessages, req.variables)
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
          msg: "Could not update company custom messages",
        };
      }
    );
}

export type LicenseInfo = {
  license_ids: Array<string>;
};

type CreatePartnershipRequestMutationReq = {
  variables: {
    is_payor: boolean;
    customer_id: Companies["id"];
    company: CompaniesInsertInput;
    user: UsersInsertInput;
    license_info: LicenseInfo;
  };
};

export async function deletePartnershipRequestMutation(req: {
  variables: {
    partnership_request_id: string;
  };
}): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.deletePartnershipRequest, req.variables)
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
          msg: "Could not create partner company",
        };
      }
    );
}

export async function createPartnershipRequestMutation(
  req: CreatePartnershipRequestMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPartnershipRequest, req.variables)
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
          msg: "Could not create partner company",
        };
      }
    );
}

type AddVendorMutationReq = {
  variables: {
    customer_id: Companies["id"];
    email: string;
  };
};

export async function addNewVendorMutation(
  req: AddVendorMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.addVendorNew, req.variables)
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
          msg: "Could not add new vendor",
        };
      }
    );
}

export type LicenseInfoNew = {
  license_ids: Array<string>;
  license_file_id: string;
};

export type CompanyInfo = {
  name: string;
  is_cannabis: boolean;
};

export type PartnershipRequestUserInfo = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
};

export type PartnershipRequestRequestInfo = {
  dba_name: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_type: string;
  bank_account_number: string;
  bank_ach_routing_number: string;
  bank_wire_routing_number: string;
  beneficiary_address: string;
  bank_instructions_attachment_id: string;
};

type CreatePartnershipRequestNewMutationReq = {
  variables: {
    customer_id: Companies["id"];
    company: CompanyInfo;
    user: PartnershipRequestUserInfo;
    license_info: LicenseInfoNew;
    request_info: PartnershipRequestRequestInfo;
  };
};

export async function createPartnershipRequestNewMutation(
  req: CreatePartnershipRequestNewMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPartnershipRequestNew, req.variables)
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
          msg: "Could not create partnership request",
        };
      }
    );
}

type UpdatePartnershipRequestNewMutationReq = {
  variables: {
    partnership_request_id: CompanyPartnershipRequests["id"];
    company: CompanyInfo;
    user: PartnershipRequestUserInfo;
    license_info: LicenseInfoNew;
    request_info: PartnershipRequestRequestInfo;
  };
};

export async function updatePartnershipRequestNewMutation(
  req: UpdatePartnershipRequestNewMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.updatePartnershipRequestNew, req.variables)
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
          msg: "Could not update partnership request",
        };
      }
    );
}

type CreatePartnershipMutationReq = {
  variables: {
    partnership_request_id: CompanyPartnershipRequests["id"];
    should_create_company: boolean;
    partner_company_id: Companies["id"];
    license_info?: LicenseInfo;
  };
};

export async function createPartnershipMutation(
  req: CreatePartnershipMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPartnership, req.variables)
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
          msg: "Could not create partner company",
        };
      }
    );
}

export async function createPartnershipNewMutation(
  req: CreatePartnershipMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPartnershipNew, req.variables)
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
          msg: "Could not create partner company",
        };
      }
    );
}

type ApprovePartnershipMutationReq = {
  variables: {
    partnership_id: Companies["id"];
    is_payor: boolean;
  };
};

export async function approvePartnershipMutation(
  req: ApprovePartnershipMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.approvePartnership, req.variables)
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
          msg: "Could not approve partnership",
        };
      }
    );
}

export type PartnershipInviteCompleteReq = {
  variables: {
    company_partnership_invite_id: CompanyPartnershipInvitations["id"];
  };
};

export async function markPartnershipInvitationAsCompleteMutation(
  req: PartnershipInviteCompleteReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.markPartnershipInviteAsComplete, req.variables)
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
          msg: "Could not mark invite as complete",
        };
      }
    );
}
