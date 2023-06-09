import {
  Companies,
  CompaniesInsertInput,
  CompanyPartnershipInvitations,
  CompanyPartnershipRequests,
  CompanySettings,
  CompanySettingsInsertInput,
  ContractsInsertInput,
  ParentCompaniesInsertInput,
  UsersInsertInput,
  VendorChangeRequests,
} from "generated/graphql";
import {
  CustomMutationResponse,
  authenticatedApi,
  companyRoutes,
} from "lib/api";
import { CustomMessageEnum, PartnershipRequestType } from "lib/enum";

export type CreateCustomerReq = {
  company_id: string;
  settings: CompanySettingsInsertInput;
  contract: ContractsInsertInput;
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
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not create company",
        };
      }
    );
}

export type CreateProspectiveCustomerReq = {
  company: CompaniesInsertInput;
};

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
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not create prospective company",
        };
      }
    );
}

export type EditParentCompanyReq = {
  parentCompany: ParentCompaniesInsertInput;
};

export async function editParentCompany(
  req: EditParentCompanyReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.editParentCompany, req)
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
          msg: "Could not edit parent company",
        };
      }
    );
}

export type EditChildCompanyReq = {
  company: CompaniesInsertInput;
};

export async function editChildCompany(
  req: EditChildCompanyReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.editChildCompany, req)
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
          msg: "Could not edit child company",
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
        console.error({ error });
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
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not create partner company",
        };
      }
    );
}

export async function createPartnershipRequestPayorMutation(
  req: CreatePartnershipRequestMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPartnershipRequestPayor, req.variables)
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
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not add new vendor",
        };
      }
    );
}

export type LicenseInfoNew = {
  license_ids: Array<string>;
};

export type CompanyInfo = {
  name: string;
  is_cannabis: boolean;
  us_state: string;
  timezone: string;
  metrc_api_key?: string;
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
  type: PartnershipRequestType;
};

type CreatePartnershipRequestVendorMutationReq = {
  variables: {
    customer_id: Companies["id"];
    company: CompanyInfo;
    user: PartnershipRequestUserInfo;
    license_info: LicenseInfoNew;
    request_info: PartnershipRequestRequestInfo;
  };
};

export async function createPartnershipRequestVendorMutation(
  req: CreatePartnershipRequestVendorMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPartnershipRequestVendor, req.variables)
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
          msg: "Could not create partnership request",
        };
      }
    );
}

type UpdatePartnershipRequestVendorMutationReq = {
  variables: {
    partnership_request_id: CompanyPartnershipRequests["id"];
    company: CompanyInfo;
    user: PartnershipRequestUserInfo;
    license_info: LicenseInfoNew;
    request_info: PartnershipRequestRequestInfo;
  };
};

export async function updatePartnershipRequestNewMutation(
  req: UpdatePartnershipRequestVendorMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.updatePartnershipRequestVendor, req.variables)
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
    company_identifier?: string;
  };
};

export async function createPartnershipPayorMutation(
  req: CreatePartnershipMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPartnershipPayor, req.variables)
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
          msg: "Could not create partner company",
        };
      }
    );
}

export async function createPartnershipVendorMutation(
  req: CreatePartnershipMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createPartnershipVendor, req.variables)
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
        console.error({ error });
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
        console.error({ error });
        return {
          status: "ERROR",
          msg: "Could not mark invite as complete",
        };
      }
    );
}

export async function moveToActionRequiredMutation(
  req: PartnershipInviteCompleteReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.moveToActionRequired, req.variables)
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
          msg: "Could not move to action required",
        };
      }
    );
}

type ApproveVendorContactChangeMutationReq = {
  variables: {
    vendor_change_request_id: VendorChangeRequests["id"];
  };
};

export async function approveVendorContactChangeMutation(
  req: ApproveVendorContactChangeMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.approveVendorChange, req.variables)
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
          msg: "Could not change vendor contact",
        };
      }
    );
}

type DeleteVendorChangeRequestMutationReq = {
  variables: {
    vendor_change_request_id: VendorChangeRequests["id"];
  };
};

export async function deleteVendorChangeRequestMutation(
  req: DeleteVendorChangeRequestMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.deleteVendorChange, req.variables)
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
          msg: "Could not create delete vendor change request",
        };
      }
    );
}

export type CreateEditVendorContactsRequestMutationReq = {
  variables: {
    requested_vendor_id: string;
    vendor_user_id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    requesting_company_id: Companies["id"];
  };
};

export async function createEditVendorContactsRequestMutation(
  req: CreateEditVendorContactsRequestMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createEditVendorContacts, req.variables)
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
          msg: "Could not create a request to edit vendor contact information",
        };
      }
    );
}

export type CreateChangeVendorContactsRequestMutationReq = {
  variables: {
    requested_vendor_id: string;
    requesting_company_id: Companies["id"];
    active_user_ids: string[];
    inactive_user_ids: string[];
  };
};

export async function createChangeVendorContactsRequestMutation(
  req: CreateChangeVendorContactsRequestMutationReq
): Promise<CustomMutationResponse> {
  return authenticatedApi
    .post(companyRoutes.createChangeVendorContacts, req.variables)
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
          msg: "Could not create a request to change vendor contacts",
        };
      }
    );
}
