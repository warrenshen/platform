import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  bigint: any;
  date: any;
  json: any;
  jsonb: any;
  numeric: any;
  timestamptz: any;
  uuid: any;
};

/** expression to compare columns of type Boolean. All fields are combined with logical 'AND'. */
export type BooleanComparisonExp = {
  _eq?: Maybe<Scalars['Boolean']>;
  _gt?: Maybe<Scalars['Boolean']>;
  _gte?: Maybe<Scalars['Boolean']>;
  _in?: Maybe<Array<Scalars['Boolean']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['Boolean']>;
  _lte?: Maybe<Scalars['Boolean']>;
  _neq?: Maybe<Scalars['Boolean']>;
  _nin?: Maybe<Array<Scalars['Boolean']>>;
};

/** expression to compare columns of type Int. All fields are combined with logical 'AND'. */
export type IntComparisonExp = {
  _eq?: Maybe<Scalars['Int']>;
  _gt?: Maybe<Scalars['Int']>;
  _gte?: Maybe<Scalars['Int']>;
  _in?: Maybe<Array<Scalars['Int']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['Int']>;
  _lte?: Maybe<Scalars['Int']>;
  _neq?: Maybe<Scalars['Int']>;
  _nin?: Maybe<Array<Scalars['Int']>>;
};

/** expression to compare columns of type String. All fields are combined with logical 'AND'. */
export type StringComparisonExp = {
  _eq?: Maybe<Scalars['String']>;
  _gt?: Maybe<Scalars['String']>;
  _gte?: Maybe<Scalars['String']>;
  _ilike?: Maybe<Scalars['String']>;
  _in?: Maybe<Array<Scalars['String']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _like?: Maybe<Scalars['String']>;
  _lt?: Maybe<Scalars['String']>;
  _lte?: Maybe<Scalars['String']>;
  _neq?: Maybe<Scalars['String']>;
  _nilike?: Maybe<Scalars['String']>;
  _nin?: Maybe<Array<Scalars['String']>>;
  _nlike?: Maybe<Scalars['String']>;
  _nsimilar?: Maybe<Scalars['String']>;
  _similar?: Maybe<Scalars['String']>;
};

/** columns and relationships of "bank_accounts" */
export type BankAccounts = {
  account_number: Scalars['String'];
  account_type: Scalars['String'];
  /** An array relationship */
  assigned_companies_for_advances_in_settings: Array<CompanySettings>;
  /** An aggregated array relationship */
  assigned_companies_for_advances_in_settings_aggregate: CompanySettingsAggregate;
  /** An array relationship */
  assigned_companies_for_collection_in_settings: Array<CompanySettings>;
  /** An aggregated array relationship */
  assigned_companies_for_collection_in_settings_aggregate: CompanySettingsAggregate;
  bank_address?: Maybe<Scalars['String']>;
  bank_name: Scalars['String'];
  can_ach: Scalars['Boolean'];
  can_wire: Scalars['Boolean'];
  /** An object relationship */
  company?: Maybe<Companies>;
  company_id?: Maybe<Scalars['uuid']>;
  id: Scalars['uuid'];
  recipient_address?: Maybe<Scalars['String']>;
  recipient_name?: Maybe<Scalars['String']>;
  routing_number: Scalars['String'];
  verified_at?: Maybe<Scalars['timestamptz']>;
};


/** columns and relationships of "bank_accounts" */
export type BankAccountsAssignedCompaniesForAdvancesInSettingsArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};


/** columns and relationships of "bank_accounts" */
export type BankAccountsAssignedCompaniesForAdvancesInSettingsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};


/** columns and relationships of "bank_accounts" */
export type BankAccountsAssignedCompaniesForCollectionInSettingsArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};


/** columns and relationships of "bank_accounts" */
export type BankAccountsAssignedCompaniesForCollectionInSettingsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** aggregated selection of "bank_accounts" */
export type BankAccountsAggregate = {
  aggregate?: Maybe<BankAccountsAggregateFields>;
  nodes: Array<BankAccounts>;
};

/** aggregate fields of "bank_accounts" */
export type BankAccountsAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<BankAccountsMaxFields>;
  min?: Maybe<BankAccountsMinFields>;
};


/** aggregate fields of "bank_accounts" */
export type BankAccountsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<BankAccountsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "bank_accounts" */
export type BankAccountsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<BankAccountsMaxOrderBy>;
  min?: Maybe<BankAccountsMinOrderBy>;
};

/** input type for inserting array relation for remote table "bank_accounts" */
export type BankAccountsArrRelInsertInput = {
  data: Array<BankAccountsInsertInput>;
  on_conflict?: Maybe<BankAccountsOnConflict>;
};

/** Boolean expression to filter rows from the table "bank_accounts". All fields are combined with a logical 'AND'. */
export type BankAccountsBoolExp = {
  _and?: Maybe<Array<Maybe<BankAccountsBoolExp>>>;
  _not?: Maybe<BankAccountsBoolExp>;
  _or?: Maybe<Array<Maybe<BankAccountsBoolExp>>>;
  account_number?: Maybe<StringComparisonExp>;
  account_type?: Maybe<StringComparisonExp>;
  assigned_companies_for_advances_in_settings?: Maybe<CompanySettingsBoolExp>;
  assigned_companies_for_collection_in_settings?: Maybe<CompanySettingsBoolExp>;
  bank_address?: Maybe<StringComparisonExp>;
  bank_name?: Maybe<StringComparisonExp>;
  can_ach?: Maybe<BooleanComparisonExp>;
  can_wire?: Maybe<BooleanComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  recipient_address?: Maybe<StringComparisonExp>;
  recipient_name?: Maybe<StringComparisonExp>;
  routing_number?: Maybe<StringComparisonExp>;
  verified_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "bank_accounts" */
export enum BankAccountsConstraint {
  /** unique or primary key constraint */
  CompanyBanksPkey = 'company_banks_pkey'
}

/** input type for inserting data into table "bank_accounts" */
export type BankAccountsInsertInput = {
  account_number?: Maybe<Scalars['String']>;
  account_type?: Maybe<Scalars['String']>;
  assigned_companies_for_advances_in_settings?: Maybe<CompanySettingsArrRelInsertInput>;
  assigned_companies_for_collection_in_settings?: Maybe<CompanySettingsArrRelInsertInput>;
  bank_address?: Maybe<Scalars['String']>;
  bank_name?: Maybe<Scalars['String']>;
  can_ach?: Maybe<Scalars['Boolean']>;
  can_wire?: Maybe<Scalars['Boolean']>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  recipient_address?: Maybe<Scalars['String']>;
  recipient_name?: Maybe<Scalars['String']>;
  routing_number?: Maybe<Scalars['String']>;
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type BankAccountsMaxFields = {
  account_number?: Maybe<Scalars['String']>;
  account_type?: Maybe<Scalars['String']>;
  bank_address?: Maybe<Scalars['String']>;
  bank_name?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  recipient_address?: Maybe<Scalars['String']>;
  recipient_name?: Maybe<Scalars['String']>;
  routing_number?: Maybe<Scalars['String']>;
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "bank_accounts" */
export type BankAccountsMaxOrderBy = {
  account_number?: Maybe<OrderBy>;
  account_type?: Maybe<OrderBy>;
  bank_address?: Maybe<OrderBy>;
  bank_name?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  recipient_address?: Maybe<OrderBy>;
  recipient_name?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type BankAccountsMinFields = {
  account_number?: Maybe<Scalars['String']>;
  account_type?: Maybe<Scalars['String']>;
  bank_address?: Maybe<Scalars['String']>;
  bank_name?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  recipient_address?: Maybe<Scalars['String']>;
  recipient_name?: Maybe<Scalars['String']>;
  routing_number?: Maybe<Scalars['String']>;
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "bank_accounts" */
export type BankAccountsMinOrderBy = {
  account_number?: Maybe<OrderBy>;
  account_type?: Maybe<OrderBy>;
  bank_address?: Maybe<OrderBy>;
  bank_name?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  recipient_address?: Maybe<OrderBy>;
  recipient_name?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "bank_accounts" */
export type BankAccountsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<BankAccounts>;
};

/** input type for inserting object relation for remote table "bank_accounts" */
export type BankAccountsObjRelInsertInput = {
  data: BankAccountsInsertInput;
  on_conflict?: Maybe<BankAccountsOnConflict>;
};

/** on conflict condition type for table "bank_accounts" */
export type BankAccountsOnConflict = {
  constraint: BankAccountsConstraint;
  update_columns: Array<BankAccountsUpdateColumn>;
  where?: Maybe<BankAccountsBoolExp>;
};

/** ordering options when selecting data from "bank_accounts" */
export type BankAccountsOrderBy = {
  account_number?: Maybe<OrderBy>;
  account_type?: Maybe<OrderBy>;
  assigned_companies_for_advances_in_settings_aggregate?: Maybe<CompanySettingsAggregateOrderBy>;
  assigned_companies_for_collection_in_settings_aggregate?: Maybe<CompanySettingsAggregateOrderBy>;
  bank_address?: Maybe<OrderBy>;
  bank_name?: Maybe<OrderBy>;
  can_ach?: Maybe<OrderBy>;
  can_wire?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  recipient_address?: Maybe<OrderBy>;
  recipient_name?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "bank_accounts" */
export type BankAccountsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "bank_accounts" */
export enum BankAccountsSelectColumn {
  /** column name */
  AccountNumber = 'account_number',
  /** column name */
  AccountType = 'account_type',
  /** column name */
  BankAddress = 'bank_address',
  /** column name */
  BankName = 'bank_name',
  /** column name */
  CanAch = 'can_ach',
  /** column name */
  CanWire = 'can_wire',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  RecipientAddress = 'recipient_address',
  /** column name */
  RecipientName = 'recipient_name',
  /** column name */
  RoutingNumber = 'routing_number',
  /** column name */
  VerifiedAt = 'verified_at'
}

/** input type for updating data in table "bank_accounts" */
export type BankAccountsSetInput = {
  account_number?: Maybe<Scalars['String']>;
  account_type?: Maybe<Scalars['String']>;
  bank_address?: Maybe<Scalars['String']>;
  bank_name?: Maybe<Scalars['String']>;
  can_ach?: Maybe<Scalars['Boolean']>;
  can_wire?: Maybe<Scalars['Boolean']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  recipient_address?: Maybe<Scalars['String']>;
  recipient_name?: Maybe<Scalars['String']>;
  routing_number?: Maybe<Scalars['String']>;
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** update columns of table "bank_accounts" */
export enum BankAccountsUpdateColumn {
  /** column name */
  AccountNumber = 'account_number',
  /** column name */
  AccountType = 'account_type',
  /** column name */
  BankAddress = 'bank_address',
  /** column name */
  BankName = 'bank_name',
  /** column name */
  CanAch = 'can_ach',
  /** column name */
  CanWire = 'can_wire',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  RecipientAddress = 'recipient_address',
  /** column name */
  RecipientName = 'recipient_name',
  /** column name */
  RoutingNumber = 'routing_number',
  /** column name */
  VerifiedAt = 'verified_at'
}


/** expression to compare columns of type bigint. All fields are combined with logical 'AND'. */
export type BigintComparisonExp = {
  _eq?: Maybe<Scalars['bigint']>;
  _gt?: Maybe<Scalars['bigint']>;
  _gte?: Maybe<Scalars['bigint']>;
  _in?: Maybe<Array<Scalars['bigint']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['bigint']>;
  _lte?: Maybe<Scalars['bigint']>;
  _neq?: Maybe<Scalars['bigint']>;
  _nin?: Maybe<Array<Scalars['bigint']>>;
};

/** columns and relationships of "companies" */
export type Companies = {
  address?: Maybe<Scalars['String']>;
  /** An array relationship */
  agreements: Array<CompanyAgreements>;
  /** An aggregated array relationship */
  agreements_aggregate: CompanyAgreementsAggregate;
  /** An array relationship */
  bank_accounts: Array<BankAccounts>;
  /** An aggregated array relationship */
  bank_accounts_aggregate: BankAccountsAggregate;
  city?: Maybe<Scalars['String']>;
  company_settings_id: Scalars['uuid'];
  /** An array relationship */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  /** An array relationship */
  company_vendor_partnerships_by_vendor: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_by_vendor_aggregate: CompanyVendorPartnershipsAggregate;
  country?: Maybe<Scalars['String']>;
  created_at: Scalars['timestamptz'];
  dba_name?: Maybe<Scalars['String']>;
  employer_identification_number?: Maybe<Scalars['String']>;
  id: Scalars['uuid'];
  is_vendor: Scalars['Boolean'];
  /** An array relationship */
  licenses: Array<CompanyLicenses>;
  /** An aggregated array relationship */
  licenses_aggregate: CompanyLicensesAggregate;
  name: Scalars['String'];
  phone_number?: Maybe<Scalars['String']>;
  /** An array relationship */
  purchase_orders: Array<PurchaseOrders>;
  /** An aggregated array relationship */
  purchase_orders_aggregate: PurchaseOrdersAggregate;
  /** An array relationship */
  purchase_orders_by_vendor: Array<PurchaseOrders>;
  /** An aggregated array relationship */
  purchase_orders_by_vendor_aggregate: PurchaseOrdersAggregate;
  /** An object relationship */
  settings: CompanySettings;
  state?: Maybe<Scalars['String']>;
  updated_at: Scalars['timestamptz'];
  /** An array relationship */
  users: Array<Users>;
  /** An aggregated array relationship */
  users_aggregate: UsersAggregate;
  zip_code?: Maybe<Scalars['String']>;
};


/** columns and relationships of "companies" */
export type CompaniesAgreementsArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesAgreementsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesBankAccountsArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesCompanyVendorPartnershipsByVendorArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesCompanyVendorPartnershipsByVendorAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesLicensesArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesLicensesAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesPurchaseOrdersArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesPurchaseOrdersAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesPurchaseOrdersByVendorArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesPurchaseOrdersByVendorAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesUsersArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesUsersAggregateArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};

/** aggregated selection of "companies" */
export type CompaniesAggregate = {
  aggregate?: Maybe<CompaniesAggregateFields>;
  nodes: Array<Companies>;
};

/** aggregate fields of "companies" */
export type CompaniesAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<CompaniesMaxFields>;
  min?: Maybe<CompaniesMinFields>;
};


/** aggregate fields of "companies" */
export type CompaniesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompaniesSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "companies" */
export type CompaniesAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompaniesMaxOrderBy>;
  min?: Maybe<CompaniesMinOrderBy>;
};

/** input type for inserting array relation for remote table "companies" */
export type CompaniesArrRelInsertInput = {
  data: Array<CompaniesInsertInput>;
  on_conflict?: Maybe<CompaniesOnConflict>;
};

/** Boolean expression to filter rows from the table "companies". All fields are combined with a logical 'AND'. */
export type CompaniesBoolExp = {
  _and?: Maybe<Array<Maybe<CompaniesBoolExp>>>;
  _not?: Maybe<CompaniesBoolExp>;
  _or?: Maybe<Array<Maybe<CompaniesBoolExp>>>;
  address?: Maybe<StringComparisonExp>;
  agreements?: Maybe<CompanyAgreementsBoolExp>;
  bank_accounts?: Maybe<BankAccountsBoolExp>;
  city?: Maybe<StringComparisonExp>;
  company_settings_id?: Maybe<UuidComparisonExp>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsBoolExp>;
  company_vendor_partnerships_by_vendor?: Maybe<CompanyVendorPartnershipsBoolExp>;
  country?: Maybe<StringComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  dba_name?: Maybe<StringComparisonExp>;
  employer_identification_number?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  is_vendor?: Maybe<BooleanComparisonExp>;
  licenses?: Maybe<CompanyLicensesBoolExp>;
  name?: Maybe<StringComparisonExp>;
  phone_number?: Maybe<StringComparisonExp>;
  purchase_orders?: Maybe<PurchaseOrdersBoolExp>;
  purchase_orders_by_vendor?: Maybe<PurchaseOrdersBoolExp>;
  settings?: Maybe<CompanySettingsBoolExp>;
  state?: Maybe<StringComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  users?: Maybe<UsersBoolExp>;
  zip_code?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "companies" */
export enum CompaniesConstraint {
  /** unique or primary key constraint */
  CompaniesPkey = 'companies_pkey'
}

/** input type for inserting data into table "companies" */
export type CompaniesInsertInput = {
  address?: Maybe<Scalars['String']>;
  agreements?: Maybe<CompanyAgreementsArrRelInsertInput>;
  bank_accounts?: Maybe<BankAccountsArrRelInsertInput>;
  city?: Maybe<Scalars['String']>;
  company_settings_id?: Maybe<Scalars['uuid']>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  company_vendor_partnerships_by_vendor?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  country?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  dba_name?: Maybe<Scalars['String']>;
  employer_identification_number?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  is_vendor?: Maybe<Scalars['Boolean']>;
  licenses?: Maybe<CompanyLicensesArrRelInsertInput>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
  purchase_orders?: Maybe<PurchaseOrdersArrRelInsertInput>;
  purchase_orders_by_vendor?: Maybe<PurchaseOrdersArrRelInsertInput>;
  settings?: Maybe<CompanySettingsObjRelInsertInput>;
  state?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  users?: Maybe<UsersArrRelInsertInput>;
  zip_code?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type CompaniesMaxFields = {
  address?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  company_settings_id?: Maybe<Scalars['uuid']>;
  country?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  dba_name?: Maybe<Scalars['String']>;
  employer_identification_number?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  zip_code?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "companies" */
export type CompaniesMaxOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
  state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  zip_code?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompaniesMinFields = {
  address?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  company_settings_id?: Maybe<Scalars['uuid']>;
  country?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  dba_name?: Maybe<Scalars['String']>;
  employer_identification_number?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  zip_code?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "companies" */
export type CompaniesMinOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
  state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  zip_code?: Maybe<OrderBy>;
};

/** response of any mutation on the table "companies" */
export type CompaniesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<Companies>;
};

/** input type for inserting object relation for remote table "companies" */
export type CompaniesObjRelInsertInput = {
  data: CompaniesInsertInput;
  on_conflict?: Maybe<CompaniesOnConflict>;
};

/** on conflict condition type for table "companies" */
export type CompaniesOnConflict = {
  constraint: CompaniesConstraint;
  update_columns: Array<CompaniesUpdateColumn>;
  where?: Maybe<CompaniesBoolExp>;
};

/** ordering options when selecting data from "companies" */
export type CompaniesOrderBy = {
  address?: Maybe<OrderBy>;
  agreements_aggregate?: Maybe<CompanyAgreementsAggregateOrderBy>;
  bank_accounts_aggregate?: Maybe<BankAccountsAggregateOrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  company_vendor_partnerships_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  company_vendor_partnerships_by_vendor_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  is_vendor?: Maybe<OrderBy>;
  licenses_aggregate?: Maybe<CompanyLicensesAggregateOrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
  purchase_orders_aggregate?: Maybe<PurchaseOrdersAggregateOrderBy>;
  purchase_orders_by_vendor_aggregate?: Maybe<PurchaseOrdersAggregateOrderBy>;
  settings?: Maybe<CompanySettingsOrderBy>;
  state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  users_aggregate?: Maybe<UsersAggregateOrderBy>;
  zip_code?: Maybe<OrderBy>;
};

/** primary key columns input for table: "companies" */
export type CompaniesPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "companies" */
export enum CompaniesSelectColumn {
  /** column name */
  Address = 'address',
  /** column name */
  City = 'city',
  /** column name */
  CompanySettingsId = 'company_settings_id',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DbaName = 'dba_name',
  /** column name */
  EmployerIdentificationNumber = 'employer_identification_number',
  /** column name */
  Id = 'id',
  /** column name */
  IsVendor = 'is_vendor',
  /** column name */
  Name = 'name',
  /** column name */
  PhoneNumber = 'phone_number',
  /** column name */
  State = 'state',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ZipCode = 'zip_code'
}

/** input type for updating data in table "companies" */
export type CompaniesSetInput = {
  address?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  company_settings_id?: Maybe<Scalars['uuid']>;
  country?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  dba_name?: Maybe<Scalars['String']>;
  employer_identification_number?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  is_vendor?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  zip_code?: Maybe<Scalars['String']>;
};

/** update columns of table "companies" */
export enum CompaniesUpdateColumn {
  /** column name */
  Address = 'address',
  /** column name */
  City = 'city',
  /** column name */
  CompanySettingsId = 'company_settings_id',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DbaName = 'dba_name',
  /** column name */
  EmployerIdentificationNumber = 'employer_identification_number',
  /** column name */
  Id = 'id',
  /** column name */
  IsVendor = 'is_vendor',
  /** column name */
  Name = 'name',
  /** column name */
  PhoneNumber = 'phone_number',
  /** column name */
  State = 'state',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  ZipCode = 'zip_code'
}

/**
 * Agreements that a company signs with Bespoke, this can be for vendors or customers signing agreeements
 * 
 * 
 * columns and relationships of "company_agreements"
 */
export type CompanyAgreements = {
  /** An object relationship */
  company: Companies;
  company_id: Scalars['uuid'];
  /** An array relationship */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  file_id: Scalars['uuid'];
  id: Scalars['uuid'];
};


/**
 * Agreements that a company signs with Bespoke, this can be for vendors or customers signing agreeements
 * 
 * 
 * columns and relationships of "company_agreements"
 */
export type CompanyAgreementsCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/**
 * Agreements that a company signs with Bespoke, this can be for vendors or customers signing agreeements
 * 
 * 
 * columns and relationships of "company_agreements"
 */
export type CompanyAgreementsCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** aggregated selection of "company_agreements" */
export type CompanyAgreementsAggregate = {
  aggregate?: Maybe<CompanyAgreementsAggregateFields>;
  nodes: Array<CompanyAgreements>;
};

/** aggregate fields of "company_agreements" */
export type CompanyAgreementsAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<CompanyAgreementsMaxFields>;
  min?: Maybe<CompanyAgreementsMinFields>;
};


/** aggregate fields of "company_agreements" */
export type CompanyAgreementsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "company_agreements" */
export type CompanyAgreementsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompanyAgreementsMaxOrderBy>;
  min?: Maybe<CompanyAgreementsMinOrderBy>;
};

/** input type for inserting array relation for remote table "company_agreements" */
export type CompanyAgreementsArrRelInsertInput = {
  data: Array<CompanyAgreementsInsertInput>;
  on_conflict?: Maybe<CompanyAgreementsOnConflict>;
};

/** Boolean expression to filter rows from the table "company_agreements". All fields are combined with a logical 'AND'. */
export type CompanyAgreementsBoolExp = {
  _and?: Maybe<Array<Maybe<CompanyAgreementsBoolExp>>>;
  _not?: Maybe<CompanyAgreementsBoolExp>;
  _or?: Maybe<Array<Maybe<CompanyAgreementsBoolExp>>>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsBoolExp>;
  file_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "company_agreements" */
export enum CompanyAgreementsConstraint {
  /** unique or primary key constraint */
  VendorAgreementsPkey = 'vendor_agreements_pkey'
}

/** input type for inserting data into table "company_agreements" */
export type CompanyAgreementsInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  file_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type CompanyAgreementsMaxFields = {
  company_id?: Maybe<Scalars['uuid']>;
  file_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "company_agreements" */
export type CompanyAgreementsMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  file_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyAgreementsMinFields = {
  company_id?: Maybe<Scalars['uuid']>;
  file_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "company_agreements" */
export type CompanyAgreementsMinOrderBy = {
  company_id?: Maybe<OrderBy>;
  file_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "company_agreements" */
export type CompanyAgreementsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<CompanyAgreements>;
};

/** input type for inserting object relation for remote table "company_agreements" */
export type CompanyAgreementsObjRelInsertInput = {
  data: CompanyAgreementsInsertInput;
  on_conflict?: Maybe<CompanyAgreementsOnConflict>;
};

/** on conflict condition type for table "company_agreements" */
export type CompanyAgreementsOnConflict = {
  constraint: CompanyAgreementsConstraint;
  update_columns: Array<CompanyAgreementsUpdateColumn>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};

/** ordering options when selecting data from "company_agreements" */
export type CompanyAgreementsOrderBy = {
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  company_vendor_partnerships_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  file_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_agreements" */
export type CompanyAgreementsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "company_agreements" */
export enum CompanyAgreementsSelectColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  FileId = 'file_id',
  /** column name */
  Id = 'id'
}

/** input type for updating data in table "company_agreements" */
export type CompanyAgreementsSetInput = {
  company_id?: Maybe<Scalars['uuid']>;
  file_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "company_agreements" */
export enum CompanyAgreementsUpdateColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  FileId = 'file_id',
  /** column name */
  Id = 'id'
}

/**
 * Licenses that a company or vendor upload to our system
 * 
 * 
 * columns and relationships of "company_licenses"
 */
export type CompanyLicenses = {
  /** An object relationship */
  company: Companies;
  company_id: Scalars['uuid'];
  /** An object relationship */
  file: Files;
  file_id: Scalars['uuid'];
  id: Scalars['uuid'];
};

/** aggregated selection of "company_licenses" */
export type CompanyLicensesAggregate = {
  aggregate?: Maybe<CompanyLicensesAggregateFields>;
  nodes: Array<CompanyLicenses>;
};

/** aggregate fields of "company_licenses" */
export type CompanyLicensesAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<CompanyLicensesMaxFields>;
  min?: Maybe<CompanyLicensesMinFields>;
};


/** aggregate fields of "company_licenses" */
export type CompanyLicensesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyLicensesSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "company_licenses" */
export type CompanyLicensesAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompanyLicensesMaxOrderBy>;
  min?: Maybe<CompanyLicensesMinOrderBy>;
};

/** input type for inserting array relation for remote table "company_licenses" */
export type CompanyLicensesArrRelInsertInput = {
  data: Array<CompanyLicensesInsertInput>;
  on_conflict?: Maybe<CompanyLicensesOnConflict>;
};

/** Boolean expression to filter rows from the table "company_licenses". All fields are combined with a logical 'AND'. */
export type CompanyLicensesBoolExp = {
  _and?: Maybe<Array<Maybe<CompanyLicensesBoolExp>>>;
  _not?: Maybe<CompanyLicensesBoolExp>;
  _or?: Maybe<Array<Maybe<CompanyLicensesBoolExp>>>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  file?: Maybe<FilesBoolExp>;
  file_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "company_licenses" */
export enum CompanyLicensesConstraint {
  /** unique or primary key constraint */
  CompanyLicensePkey = 'company_license_pkey'
}

/** input type for inserting data into table "company_licenses" */
export type CompanyLicensesInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  file?: Maybe<FilesObjRelInsertInput>;
  file_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type CompanyLicensesMaxFields = {
  company_id?: Maybe<Scalars['uuid']>;
  file_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "company_licenses" */
export type CompanyLicensesMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  file_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyLicensesMinFields = {
  company_id?: Maybe<Scalars['uuid']>;
  file_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "company_licenses" */
export type CompanyLicensesMinOrderBy = {
  company_id?: Maybe<OrderBy>;
  file_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "company_licenses" */
export type CompanyLicensesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<CompanyLicenses>;
};

/** input type for inserting object relation for remote table "company_licenses" */
export type CompanyLicensesObjRelInsertInput = {
  data: CompanyLicensesInsertInput;
  on_conflict?: Maybe<CompanyLicensesOnConflict>;
};

/** on conflict condition type for table "company_licenses" */
export type CompanyLicensesOnConflict = {
  constraint: CompanyLicensesConstraint;
  update_columns: Array<CompanyLicensesUpdateColumn>;
  where?: Maybe<CompanyLicensesBoolExp>;
};

/** ordering options when selecting data from "company_licenses" */
export type CompanyLicensesOrderBy = {
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  file?: Maybe<FilesOrderBy>;
  file_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_licenses" */
export type CompanyLicensesPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "company_licenses" */
export enum CompanyLicensesSelectColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  FileId = 'file_id',
  /** column name */
  Id = 'id'
}

/** input type for updating data in table "company_licenses" */
export type CompanyLicensesSetInput = {
  company_id?: Maybe<Scalars['uuid']>;
  file_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "company_licenses" */
export enum CompanyLicensesUpdateColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  FileId = 'file_id',
  /** column name */
  Id = 'id'
}

/** columns and relationships of "company_settings" */
export type CompanySettings = {
  /** An object relationship */
  advances_bespoke_bank_account?: Maybe<BankAccounts>;
  advances_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  /** An object relationship */
  collections_bespoke_bank_account?: Maybe<BankAccounts>;
  collections_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  /** An object relationship */
  company?: Maybe<Companies>;
  company_id?: Maybe<Scalars['uuid']>;
  id: Scalars['uuid'];
  product_config: Scalars['jsonb'];
  product_type: ProductTypeEnum;
  vendor_agreement_docusign_template?: Maybe<Scalars['String']>;
};


/** columns and relationships of "company_settings" */
export type CompanySettingsProductConfigArgs = {
  path?: Maybe<Scalars['String']>;
};

/** aggregated selection of "company_settings" */
export type CompanySettingsAggregate = {
  aggregate?: Maybe<CompanySettingsAggregateFields>;
  nodes: Array<CompanySettings>;
};

/** aggregate fields of "company_settings" */
export type CompanySettingsAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<CompanySettingsMaxFields>;
  min?: Maybe<CompanySettingsMinFields>;
};


/** aggregate fields of "company_settings" */
export type CompanySettingsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanySettingsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "company_settings" */
export type CompanySettingsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompanySettingsMaxOrderBy>;
  min?: Maybe<CompanySettingsMinOrderBy>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type CompanySettingsAppendInput = {
  product_config?: Maybe<Scalars['jsonb']>;
};

/** input type for inserting array relation for remote table "company_settings" */
export type CompanySettingsArrRelInsertInput = {
  data: Array<CompanySettingsInsertInput>;
  on_conflict?: Maybe<CompanySettingsOnConflict>;
};

/** Boolean expression to filter rows from the table "company_settings". All fields are combined with a logical 'AND'. */
export type CompanySettingsBoolExp = {
  _and?: Maybe<Array<Maybe<CompanySettingsBoolExp>>>;
  _not?: Maybe<CompanySettingsBoolExp>;
  _or?: Maybe<Array<Maybe<CompanySettingsBoolExp>>>;
  advances_bespoke_bank_account?: Maybe<BankAccountsBoolExp>;
  advances_bespoke_bank_account_id?: Maybe<UuidComparisonExp>;
  collections_bespoke_bank_account?: Maybe<BankAccountsBoolExp>;
  collections_bespoke_bank_account_id?: Maybe<UuidComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  product_config?: Maybe<JsonbComparisonExp>;
  product_type?: Maybe<ProductTypeEnumComparisonExp>;
  vendor_agreement_docusign_template?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "company_settings" */
export enum CompanySettingsConstraint {
  /** unique or primary key constraint */
  CompanySettingsPkey = 'company_settings_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type CompanySettingsDeleteAtPathInput = {
  product_config?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type CompanySettingsDeleteElemInput = {
  product_config?: Maybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type CompanySettingsDeleteKeyInput = {
  product_config?: Maybe<Scalars['String']>;
};

/** input type for inserting data into table "company_settings" */
export type CompanySettingsInsertInput = {
  advances_bespoke_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  advances_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  collections_bespoke_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  collections_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  product_config?: Maybe<Scalars['jsonb']>;
  product_type?: Maybe<ProductTypeEnum>;
  vendor_agreement_docusign_template?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type CompanySettingsMaxFields = {
  advances_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  collections_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  vendor_agreement_docusign_template?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "company_settings" */
export type CompanySettingsMaxOrderBy = {
  advances_bespoke_bank_account_id?: Maybe<OrderBy>;
  collections_bespoke_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  vendor_agreement_docusign_template?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanySettingsMinFields = {
  advances_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  collections_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  vendor_agreement_docusign_template?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "company_settings" */
export type CompanySettingsMinOrderBy = {
  advances_bespoke_bank_account_id?: Maybe<OrderBy>;
  collections_bespoke_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  vendor_agreement_docusign_template?: Maybe<OrderBy>;
};

/** response of any mutation on the table "company_settings" */
export type CompanySettingsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<CompanySettings>;
};

/** input type for inserting object relation for remote table "company_settings" */
export type CompanySettingsObjRelInsertInput = {
  data: CompanySettingsInsertInput;
  on_conflict?: Maybe<CompanySettingsOnConflict>;
};

/** on conflict condition type for table "company_settings" */
export type CompanySettingsOnConflict = {
  constraint: CompanySettingsConstraint;
  update_columns: Array<CompanySettingsUpdateColumn>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** ordering options when selecting data from "company_settings" */
export type CompanySettingsOrderBy = {
  advances_bespoke_bank_account?: Maybe<BankAccountsOrderBy>;
  advances_bespoke_bank_account_id?: Maybe<OrderBy>;
  collections_bespoke_bank_account?: Maybe<BankAccountsOrderBy>;
  collections_bespoke_bank_account_id?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  product_config?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  vendor_agreement_docusign_template?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_settings" */
export type CompanySettingsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type CompanySettingsPrependInput = {
  product_config?: Maybe<Scalars['jsonb']>;
};

/** select columns of table "company_settings" */
export enum CompanySettingsSelectColumn {
  /** column name */
  AdvancesBespokeBankAccountId = 'advances_bespoke_bank_account_id',
  /** column name */
  CollectionsBespokeBankAccountId = 'collections_bespoke_bank_account_id',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  ProductConfig = 'product_config',
  /** column name */
  ProductType = 'product_type',
  /** column name */
  VendorAgreementDocusignTemplate = 'vendor_agreement_docusign_template'
}

/** input type for updating data in table "company_settings" */
export type CompanySettingsSetInput = {
  advances_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  collections_bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  product_config?: Maybe<Scalars['jsonb']>;
  product_type?: Maybe<ProductTypeEnum>;
  vendor_agreement_docusign_template?: Maybe<Scalars['String']>;
};

/** update columns of table "company_settings" */
export enum CompanySettingsUpdateColumn {
  /** column name */
  AdvancesBespokeBankAccountId = 'advances_bespoke_bank_account_id',
  /** column name */
  CollectionsBespokeBankAccountId = 'collections_bespoke_bank_account_id',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  ProductConfig = 'product_config',
  /** column name */
  ProductType = 'product_type',
  /** column name */
  VendorAgreementDocusignTemplate = 'vendor_agreement_docusign_template'
}

/** columns and relationships of "company_vendor_partnerships" */
export type CompanyVendorPartnerships = {
  /** Serves dual purpose of telling us when the vendor was approved */
  approved_at?: Maybe<Scalars['timestamptz']>;
  /** An object relationship */
  company: Companies;
  /** An object relationship */
  company_agreement?: Maybe<CompanyAgreements>;
  company_id: Scalars['uuid'];
  /** An object relationship */
  company_license?: Maybe<CompanyLicenses>;
  created_at: Scalars['timestamptz'];
  id: Scalars['uuid'];
  updated_at: Scalars['timestamptz'];
  /** An object relationship */
  vendor: Companies;
  vendor_agreement_id?: Maybe<Scalars['uuid']>;
  /** An object relationship */
  vendor_bank_account?: Maybe<BankAccounts>;
  vendor_bank_id?: Maybe<Scalars['uuid']>;
  vendor_id: Scalars['uuid'];
  vendor_license_id?: Maybe<Scalars['uuid']>;
  /** An object relationship */
  vendor_limited?: Maybe<Vendors>;
};

/** aggregated selection of "company_vendor_partnerships" */
export type CompanyVendorPartnershipsAggregate = {
  aggregate?: Maybe<CompanyVendorPartnershipsAggregateFields>;
  nodes: Array<CompanyVendorPartnerships>;
};

/** aggregate fields of "company_vendor_partnerships" */
export type CompanyVendorPartnershipsAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<CompanyVendorPartnershipsMaxFields>;
  min?: Maybe<CompanyVendorPartnershipsMinFields>;
};


/** aggregate fields of "company_vendor_partnerships" */
export type CompanyVendorPartnershipsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompanyVendorPartnershipsMaxOrderBy>;
  min?: Maybe<CompanyVendorPartnershipsMinOrderBy>;
};

/** input type for inserting array relation for remote table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsArrRelInsertInput = {
  data: Array<CompanyVendorPartnershipsInsertInput>;
  on_conflict?: Maybe<CompanyVendorPartnershipsOnConflict>;
};

/** Boolean expression to filter rows from the table "company_vendor_partnerships". All fields are combined with a logical 'AND'. */
export type CompanyVendorPartnershipsBoolExp = {
  _and?: Maybe<Array<Maybe<CompanyVendorPartnershipsBoolExp>>>;
  _not?: Maybe<CompanyVendorPartnershipsBoolExp>;
  _or?: Maybe<Array<Maybe<CompanyVendorPartnershipsBoolExp>>>;
  approved_at?: Maybe<TimestamptzComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_agreement?: Maybe<CompanyAgreementsBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  company_license?: Maybe<CompanyLicensesBoolExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  vendor?: Maybe<CompaniesBoolExp>;
  vendor_agreement_id?: Maybe<UuidComparisonExp>;
  vendor_bank_account?: Maybe<BankAccountsBoolExp>;
  vendor_bank_id?: Maybe<UuidComparisonExp>;
  vendor_id?: Maybe<UuidComparisonExp>;
  vendor_license_id?: Maybe<UuidComparisonExp>;
  vendor_limited?: Maybe<VendorsBoolExp>;
};

/** unique or primary key constraints on table "company_vendor_partnerships" */
export enum CompanyVendorPartnershipsConstraint {
  /** unique or primary key constraint */
  CompanyVendorPartnershipPkey = 'company_vendor_partnership_pkey'
}

/** input type for inserting data into table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsInsertInput = {
  approved_at?: Maybe<Scalars['timestamptz']>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_agreement?: Maybe<CompanyAgreementsObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  company_license?: Maybe<CompanyLicensesObjRelInsertInput>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor?: Maybe<CompaniesObjRelInsertInput>;
  vendor_agreement_id?: Maybe<Scalars['uuid']>;
  vendor_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  vendor_bank_id?: Maybe<Scalars['uuid']>;
  vendor_id?: Maybe<Scalars['uuid']>;
  vendor_license_id?: Maybe<Scalars['uuid']>;
  vendor_limited?: Maybe<VendorsObjRelInsertInput>;
};

/** aggregate max on columns */
export type CompanyVendorPartnershipsMaxFields = {
  approved_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_agreement_id?: Maybe<Scalars['uuid']>;
  vendor_bank_id?: Maybe<Scalars['uuid']>;
  vendor_id?: Maybe<Scalars['uuid']>;
  vendor_license_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsMaxOrderBy = {
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor_agreement_id?: Maybe<OrderBy>;
  vendor_bank_id?: Maybe<OrderBy>;
  vendor_id?: Maybe<OrderBy>;
  vendor_license_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyVendorPartnershipsMinFields = {
  approved_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_agreement_id?: Maybe<Scalars['uuid']>;
  vendor_bank_id?: Maybe<Scalars['uuid']>;
  vendor_id?: Maybe<Scalars['uuid']>;
  vendor_license_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsMinOrderBy = {
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor_agreement_id?: Maybe<OrderBy>;
  vendor_bank_id?: Maybe<OrderBy>;
  vendor_id?: Maybe<OrderBy>;
  vendor_license_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<CompanyVendorPartnerships>;
};

/** input type for inserting object relation for remote table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsObjRelInsertInput = {
  data: CompanyVendorPartnershipsInsertInput;
  on_conflict?: Maybe<CompanyVendorPartnershipsOnConflict>;
};

/** on conflict condition type for table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsOnConflict = {
  constraint: CompanyVendorPartnershipsConstraint;
  update_columns: Array<CompanyVendorPartnershipsUpdateColumn>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** ordering options when selecting data from "company_vendor_partnerships" */
export type CompanyVendorPartnershipsOrderBy = {
  approved_at?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_agreement?: Maybe<CompanyAgreementsOrderBy>;
  company_id?: Maybe<OrderBy>;
  company_license?: Maybe<CompanyLicensesOrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor?: Maybe<CompaniesOrderBy>;
  vendor_agreement_id?: Maybe<OrderBy>;
  vendor_bank_account?: Maybe<BankAccountsOrderBy>;
  vendor_bank_id?: Maybe<OrderBy>;
  vendor_id?: Maybe<OrderBy>;
  vendor_license_id?: Maybe<OrderBy>;
  vendor_limited?: Maybe<VendorsOrderBy>;
};

/** primary key columns input for table: "company_vendor_partnerships" */
export type CompanyVendorPartnershipsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "company_vendor_partnerships" */
export enum CompanyVendorPartnershipsSelectColumn {
  /** column name */
  ApprovedAt = 'approved_at',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VendorAgreementId = 'vendor_agreement_id',
  /** column name */
  VendorBankId = 'vendor_bank_id',
  /** column name */
  VendorId = 'vendor_id',
  /** column name */
  VendorLicenseId = 'vendor_license_id'
}

/** input type for updating data in table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsSetInput = {
  approved_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_agreement_id?: Maybe<Scalars['uuid']>;
  vendor_bank_id?: Maybe<Scalars['uuid']>;
  vendor_id?: Maybe<Scalars['uuid']>;
  vendor_license_id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "company_vendor_partnerships" */
export enum CompanyVendorPartnershipsUpdateColumn {
  /** column name */
  ApprovedAt = 'approved_at',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VendorAgreementId = 'vendor_agreement_id',
  /** column name */
  VendorBankId = 'vendor_bank_id',
  /** column name */
  VendorId = 'vendor_id',
  /** column name */
  VendorLicenseId = 'vendor_license_id'
}


/** expression to compare columns of type date. All fields are combined with logical 'AND'. */
export type DateComparisonExp = {
  _eq?: Maybe<Scalars['date']>;
  _gt?: Maybe<Scalars['date']>;
  _gte?: Maybe<Scalars['date']>;
  _in?: Maybe<Array<Scalars['date']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['date']>;
  _lte?: Maybe<Scalars['date']>;
  _neq?: Maybe<Scalars['date']>;
  _nin?: Maybe<Array<Scalars['date']>>;
};

/**
 * Table to keep track of files stored on the platform
 * 
 * 
 * columns and relationships of "files"
 */
export type Files = {
  /** An object relationship */
  company: Companies;
  company_id: Scalars['uuid'];
  /** An array relationship */
  company_licenses: Array<CompanyLicenses>;
  /** An aggregated array relationship */
  company_licenses_aggregate: CompanyLicensesAggregate;
  created_at: Scalars['timestamptz'];
  /** An object relationship */
  created_by: Users;
  created_by_user_id: Scalars['uuid'];
  extension: Scalars['String'];
  id: Scalars['uuid'];
  mime_type?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  path: Scalars['String'];
  /** An array relationship */
  purchase_order_files: Array<PurchaseOrderFiles>;
  /** An aggregated array relationship */
  purchase_order_files_aggregate: PurchaseOrderFilesAggregate;
  sequential_id?: Maybe<Scalars['Int']>;
  size: Scalars['bigint'];
  updated_at: Scalars['timestamptz'];
};


/**
 * Table to keep track of files stored on the platform
 * 
 * 
 * columns and relationships of "files"
 */
export type FilesCompanyLicensesArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};


/**
 * Table to keep track of files stored on the platform
 * 
 * 
 * columns and relationships of "files"
 */
export type FilesCompanyLicensesAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};


/**
 * Table to keep track of files stored on the platform
 * 
 * 
 * columns and relationships of "files"
 */
export type FilesPurchaseOrderFilesArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};


/**
 * Table to keep track of files stored on the platform
 * 
 * 
 * columns and relationships of "files"
 */
export type FilesPurchaseOrderFilesAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};

/** aggregated selection of "files" */
export type FilesAggregate = {
  aggregate?: Maybe<FilesAggregateFields>;
  nodes: Array<Files>;
};

/** aggregate fields of "files" */
export type FilesAggregateFields = {
  avg?: Maybe<FilesAvgFields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<FilesMaxFields>;
  min?: Maybe<FilesMinFields>;
  stddev?: Maybe<FilesStddevFields>;
  stddev_pop?: Maybe<FilesStddevPopFields>;
  stddev_samp?: Maybe<FilesStddevSampFields>;
  sum?: Maybe<FilesSumFields>;
  var_pop?: Maybe<FilesVarPopFields>;
  var_samp?: Maybe<FilesVarSampFields>;
  variance?: Maybe<FilesVarianceFields>;
};


/** aggregate fields of "files" */
export type FilesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<FilesSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "files" */
export type FilesAggregateOrderBy = {
  avg?: Maybe<FilesAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<FilesMaxOrderBy>;
  min?: Maybe<FilesMinOrderBy>;
  stddev?: Maybe<FilesStddevOrderBy>;
  stddev_pop?: Maybe<FilesStddevPopOrderBy>;
  stddev_samp?: Maybe<FilesStddevSampOrderBy>;
  sum?: Maybe<FilesSumOrderBy>;
  var_pop?: Maybe<FilesVarPopOrderBy>;
  var_samp?: Maybe<FilesVarSampOrderBy>;
  variance?: Maybe<FilesVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "files" */
export type FilesArrRelInsertInput = {
  data: Array<FilesInsertInput>;
  on_conflict?: Maybe<FilesOnConflict>;
};

/** aggregate avg on columns */
export type FilesAvgFields = {
  sequential_id?: Maybe<Scalars['Float']>;
  size?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "files" */
export type FilesAvgOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "files". All fields are combined with a logical 'AND'. */
export type FilesBoolExp = {
  _and?: Maybe<Array<Maybe<FilesBoolExp>>>;
  _not?: Maybe<FilesBoolExp>;
  _or?: Maybe<Array<Maybe<FilesBoolExp>>>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  company_licenses?: Maybe<CompanyLicensesBoolExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  created_by?: Maybe<UsersBoolExp>;
  created_by_user_id?: Maybe<UuidComparisonExp>;
  extension?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  mime_type?: Maybe<StringComparisonExp>;
  name?: Maybe<StringComparisonExp>;
  path?: Maybe<StringComparisonExp>;
  purchase_order_files?: Maybe<PurchaseOrderFilesBoolExp>;
  sequential_id?: Maybe<IntComparisonExp>;
  size?: Maybe<BigintComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "files" */
export enum FilesConstraint {
  /** unique or primary key constraint */
  FilesPkey = 'files_pkey'
}

/** input type for incrementing integer column in table "files" */
export type FilesIncInput = {
  sequential_id?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['bigint']>;
};

/** input type for inserting data into table "files" */
export type FilesInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  company_licenses?: Maybe<CompanyLicensesArrRelInsertInput>;
  created_at?: Maybe<Scalars['timestamptz']>;
  created_by?: Maybe<UsersObjRelInsertInput>;
  created_by_user_id?: Maybe<Scalars['uuid']>;
  extension?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  mime_type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  purchase_order_files?: Maybe<PurchaseOrderFilesArrRelInsertInput>;
  sequential_id?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['bigint']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type FilesMaxFields = {
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  created_by_user_id?: Maybe<Scalars['uuid']>;
  extension?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  mime_type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  sequential_id?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['bigint']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "files" */
export type FilesMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  created_by_user_id?: Maybe<OrderBy>;
  extension?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  mime_type?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  path?: Maybe<OrderBy>;
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type FilesMinFields = {
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  created_by_user_id?: Maybe<Scalars['uuid']>;
  extension?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  mime_type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  sequential_id?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['bigint']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "files" */
export type FilesMinOrderBy = {
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  created_by_user_id?: Maybe<OrderBy>;
  extension?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  mime_type?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  path?: Maybe<OrderBy>;
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "files" */
export type FilesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<Files>;
};

/** input type for inserting object relation for remote table "files" */
export type FilesObjRelInsertInput = {
  data: FilesInsertInput;
  on_conflict?: Maybe<FilesOnConflict>;
};

/** on conflict condition type for table "files" */
export type FilesOnConflict = {
  constraint: FilesConstraint;
  update_columns: Array<FilesUpdateColumn>;
  where?: Maybe<FilesBoolExp>;
};

/** ordering options when selecting data from "files" */
export type FilesOrderBy = {
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  company_licenses_aggregate?: Maybe<CompanyLicensesAggregateOrderBy>;
  created_at?: Maybe<OrderBy>;
  created_by?: Maybe<UsersOrderBy>;
  created_by_user_id?: Maybe<OrderBy>;
  extension?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  mime_type?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  path?: Maybe<OrderBy>;
  purchase_order_files_aggregate?: Maybe<PurchaseOrderFilesAggregateOrderBy>;
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "files" */
export type FilesPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "files" */
export enum FilesSelectColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedByUserId = 'created_by_user_id',
  /** column name */
  Extension = 'extension',
  /** column name */
  Id = 'id',
  /** column name */
  MimeType = 'mime_type',
  /** column name */
  Name = 'name',
  /** column name */
  Path = 'path',
  /** column name */
  SequentialId = 'sequential_id',
  /** column name */
  Size = 'size',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "files" */
export type FilesSetInput = {
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  created_by_user_id?: Maybe<Scalars['uuid']>;
  extension?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  mime_type?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  sequential_id?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['bigint']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type FilesStddevFields = {
  sequential_id?: Maybe<Scalars['Float']>;
  size?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "files" */
export type FilesStddevOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type FilesStddevPopFields = {
  sequential_id?: Maybe<Scalars['Float']>;
  size?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "files" */
export type FilesStddevPopOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type FilesStddevSampFields = {
  sequential_id?: Maybe<Scalars['Float']>;
  size?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "files" */
export type FilesStddevSampOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type FilesSumFields = {
  sequential_id?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['bigint']>;
};

/** order by sum() on columns of table "files" */
export type FilesSumOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** update columns of table "files" */
export enum FilesUpdateColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedByUserId = 'created_by_user_id',
  /** column name */
  Extension = 'extension',
  /** column name */
  Id = 'id',
  /** column name */
  MimeType = 'mime_type',
  /** column name */
  Name = 'name',
  /** column name */
  Path = 'path',
  /** column name */
  SequentialId = 'sequential_id',
  /** column name */
  Size = 'size',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** aggregate var_pop on columns */
export type FilesVarPopFields = {
  sequential_id?: Maybe<Scalars['Float']>;
  size?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "files" */
export type FilesVarPopOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type FilesVarSampFields = {
  sequential_id?: Maybe<Scalars['Float']>;
  size?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "files" */
export type FilesVarSampOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type FilesVarianceFields = {
  sequential_id?: Maybe<Scalars['Float']>;
  size?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "files" */
export type FilesVarianceOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};


/** expression to compare columns of type json. All fields are combined with logical 'AND'. */
export type JsonComparisonExp = {
  _eq?: Maybe<Scalars['json']>;
  _gt?: Maybe<Scalars['json']>;
  _gte?: Maybe<Scalars['json']>;
  _in?: Maybe<Array<Scalars['json']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['json']>;
  _lte?: Maybe<Scalars['json']>;
  _neq?: Maybe<Scalars['json']>;
  _nin?: Maybe<Array<Scalars['json']>>;
};


/** expression to compare columns of type jsonb. All fields are combined with logical 'AND'. */
export type JsonbComparisonExp = {
  /** is the column contained in the given json value */
  _contained_in?: Maybe<Scalars['jsonb']>;
  /** does the column contain the given json value at the top level */
  _contains?: Maybe<Scalars['jsonb']>;
  _eq?: Maybe<Scalars['jsonb']>;
  _gt?: Maybe<Scalars['jsonb']>;
  _gte?: Maybe<Scalars['jsonb']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: Maybe<Scalars['String']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: Maybe<Array<Scalars['String']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: Maybe<Array<Scalars['String']>>;
  _in?: Maybe<Array<Scalars['jsonb']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['jsonb']>;
  _lte?: Maybe<Scalars['jsonb']>;
  _neq?: Maybe<Scalars['jsonb']>;
  _nin?: Maybe<Array<Scalars['jsonb']>>;
};

/** mutation root */
export type MutationRoot = {
  /** delete data from the table: "bank_accounts" */
  delete_bank_accounts?: Maybe<BankAccountsMutationResponse>;
  /** delete single row from the table: "bank_accounts" */
  delete_bank_accounts_by_pk?: Maybe<BankAccounts>;
  /** delete data from the table: "companies" */
  delete_companies?: Maybe<CompaniesMutationResponse>;
  /** delete single row from the table: "companies" */
  delete_companies_by_pk?: Maybe<Companies>;
  /** delete data from the table: "company_agreements" */
  delete_company_agreements?: Maybe<CompanyAgreementsMutationResponse>;
  /** delete single row from the table: "company_agreements" */
  delete_company_agreements_by_pk?: Maybe<CompanyAgreements>;
  /** delete data from the table: "company_licenses" */
  delete_company_licenses?: Maybe<CompanyLicensesMutationResponse>;
  /** delete single row from the table: "company_licenses" */
  delete_company_licenses_by_pk?: Maybe<CompanyLicenses>;
  /** delete data from the table: "company_settings" */
  delete_company_settings?: Maybe<CompanySettingsMutationResponse>;
  /** delete single row from the table: "company_settings" */
  delete_company_settings_by_pk?: Maybe<CompanySettings>;
  /** delete data from the table: "company_vendor_partnerships" */
  delete_company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsMutationResponse>;
  /** delete single row from the table: "company_vendor_partnerships" */
  delete_company_vendor_partnerships_by_pk?: Maybe<CompanyVendorPartnerships>;
  /** delete data from the table: "files" */
  delete_files?: Maybe<FilesMutationResponse>;
  /** delete single row from the table: "files" */
  delete_files_by_pk?: Maybe<Files>;
  /** delete data from the table: "payments" */
  delete_payments?: Maybe<PaymentsMutationResponse>;
  /** delete single row from the table: "payments" */
  delete_payments_by_pk?: Maybe<Payments>;
  /** delete data from the table: "product_type" */
  delete_product_type?: Maybe<ProductTypeMutationResponse>;
  /** delete single row from the table: "product_type" */
  delete_product_type_by_pk?: Maybe<ProductType>;
  /** delete data from the table: "purchase_order_file_type" */
  delete_purchase_order_file_type?: Maybe<PurchaseOrderFileTypeMutationResponse>;
  /** delete single row from the table: "purchase_order_file_type" */
  delete_purchase_order_file_type_by_pk?: Maybe<PurchaseOrderFileType>;
  /** delete data from the table: "purchase_order_files" */
  delete_purchase_order_files?: Maybe<PurchaseOrderFilesMutationResponse>;
  /** delete single row from the table: "purchase_order_files" */
  delete_purchase_order_files_by_pk?: Maybe<PurchaseOrderFiles>;
  /** delete data from the table: "purchase_order_loan_payments" */
  delete_purchase_order_loan_payments?: Maybe<PurchaseOrderLoanPaymentsMutationResponse>;
  /** delete single row from the table: "purchase_order_loan_payments" */
  delete_purchase_order_loan_payments_by_pk?: Maybe<PurchaseOrderLoanPayments>;
  /** delete data from the table: "purchase_order_loans" */
  delete_purchase_order_loans?: Maybe<PurchaseOrderLoansMutationResponse>;
  /** delete single row from the table: "purchase_order_loans" */
  delete_purchase_order_loans_by_pk?: Maybe<PurchaseOrderLoans>;
  /** delete data from the table: "purchase_orders" */
  delete_purchase_orders?: Maybe<PurchaseOrdersMutationResponse>;
  /** delete single row from the table: "purchase_orders" */
  delete_purchase_orders_by_pk?: Maybe<PurchaseOrders>;
  /** delete data from the table: "request_status" */
  delete_request_status?: Maybe<RequestStatusMutationResponse>;
  /** delete single row from the table: "request_status" */
  delete_request_status_by_pk?: Maybe<RequestStatus>;
  /** delete data from the table: "revoked_tokens" */
  delete_revoked_tokens?: Maybe<RevokedTokensMutationResponse>;
  /** delete single row from the table: "revoked_tokens" */
  delete_revoked_tokens_by_pk?: Maybe<RevokedTokens>;
  /** delete data from the table: "two_factor_links" */
  delete_two_factor_links?: Maybe<TwoFactorLinksMutationResponse>;
  /** delete single row from the table: "two_factor_links" */
  delete_two_factor_links_by_pk?: Maybe<TwoFactorLinks>;
  /** delete data from the table: "user_roles" */
  delete_user_roles?: Maybe<UserRolesMutationResponse>;
  /** delete single row from the table: "user_roles" */
  delete_user_roles_by_pk?: Maybe<UserRoles>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<UsersMutationResponse>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** delete data from the table: "vendors" */
  delete_vendors?: Maybe<VendorsMutationResponse>;
  /** insert data into the table: "bank_accounts" */
  insert_bank_accounts?: Maybe<BankAccountsMutationResponse>;
  /** insert a single row into the table: "bank_accounts" */
  insert_bank_accounts_one?: Maybe<BankAccounts>;
  /** insert data into the table: "companies" */
  insert_companies?: Maybe<CompaniesMutationResponse>;
  /** insert a single row into the table: "companies" */
  insert_companies_one?: Maybe<Companies>;
  /** insert data into the table: "company_agreements" */
  insert_company_agreements?: Maybe<CompanyAgreementsMutationResponse>;
  /** insert a single row into the table: "company_agreements" */
  insert_company_agreements_one?: Maybe<CompanyAgreements>;
  /** insert data into the table: "company_licenses" */
  insert_company_licenses?: Maybe<CompanyLicensesMutationResponse>;
  /** insert a single row into the table: "company_licenses" */
  insert_company_licenses_one?: Maybe<CompanyLicenses>;
  /** insert data into the table: "company_settings" */
  insert_company_settings?: Maybe<CompanySettingsMutationResponse>;
  /** insert a single row into the table: "company_settings" */
  insert_company_settings_one?: Maybe<CompanySettings>;
  /** insert data into the table: "company_vendor_partnerships" */
  insert_company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsMutationResponse>;
  /** insert a single row into the table: "company_vendor_partnerships" */
  insert_company_vendor_partnerships_one?: Maybe<CompanyVendorPartnerships>;
  /** insert data into the table: "files" */
  insert_files?: Maybe<FilesMutationResponse>;
  /** insert a single row into the table: "files" */
  insert_files_one?: Maybe<Files>;
  /** insert data into the table: "payments" */
  insert_payments?: Maybe<PaymentsMutationResponse>;
  /** insert a single row into the table: "payments" */
  insert_payments_one?: Maybe<Payments>;
  /** insert data into the table: "product_type" */
  insert_product_type?: Maybe<ProductTypeMutationResponse>;
  /** insert a single row into the table: "product_type" */
  insert_product_type_one?: Maybe<ProductType>;
  /** insert data into the table: "purchase_order_file_type" */
  insert_purchase_order_file_type?: Maybe<PurchaseOrderFileTypeMutationResponse>;
  /** insert a single row into the table: "purchase_order_file_type" */
  insert_purchase_order_file_type_one?: Maybe<PurchaseOrderFileType>;
  /** insert data into the table: "purchase_order_files" */
  insert_purchase_order_files?: Maybe<PurchaseOrderFilesMutationResponse>;
  /** insert a single row into the table: "purchase_order_files" */
  insert_purchase_order_files_one?: Maybe<PurchaseOrderFiles>;
  /** insert data into the table: "purchase_order_loan_payments" */
  insert_purchase_order_loan_payments?: Maybe<PurchaseOrderLoanPaymentsMutationResponse>;
  /** insert a single row into the table: "purchase_order_loan_payments" */
  insert_purchase_order_loan_payments_one?: Maybe<PurchaseOrderLoanPayments>;
  /** insert data into the table: "purchase_order_loans" */
  insert_purchase_order_loans?: Maybe<PurchaseOrderLoansMutationResponse>;
  /** insert a single row into the table: "purchase_order_loans" */
  insert_purchase_order_loans_one?: Maybe<PurchaseOrderLoans>;
  /** insert data into the table: "purchase_orders" */
  insert_purchase_orders?: Maybe<PurchaseOrdersMutationResponse>;
  /** insert a single row into the table: "purchase_orders" */
  insert_purchase_orders_one?: Maybe<PurchaseOrders>;
  /** insert data into the table: "request_status" */
  insert_request_status?: Maybe<RequestStatusMutationResponse>;
  /** insert a single row into the table: "request_status" */
  insert_request_status_one?: Maybe<RequestStatus>;
  /** insert data into the table: "revoked_tokens" */
  insert_revoked_tokens?: Maybe<RevokedTokensMutationResponse>;
  /** insert a single row into the table: "revoked_tokens" */
  insert_revoked_tokens_one?: Maybe<RevokedTokens>;
  /** insert data into the table: "two_factor_links" */
  insert_two_factor_links?: Maybe<TwoFactorLinksMutationResponse>;
  /** insert a single row into the table: "two_factor_links" */
  insert_two_factor_links_one?: Maybe<TwoFactorLinks>;
  /** insert data into the table: "user_roles" */
  insert_user_roles?: Maybe<UserRolesMutationResponse>;
  /** insert a single row into the table: "user_roles" */
  insert_user_roles_one?: Maybe<UserRoles>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<UsersMutationResponse>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** insert data into the table: "vendors" */
  insert_vendors?: Maybe<VendorsMutationResponse>;
  /** insert a single row into the table: "vendors" */
  insert_vendors_one?: Maybe<Vendors>;
  /** update data of the table: "bank_accounts" */
  update_bank_accounts?: Maybe<BankAccountsMutationResponse>;
  /** update single row of the table: "bank_accounts" */
  update_bank_accounts_by_pk?: Maybe<BankAccounts>;
  /** update data of the table: "companies" */
  update_companies?: Maybe<CompaniesMutationResponse>;
  /** update single row of the table: "companies" */
  update_companies_by_pk?: Maybe<Companies>;
  /** update data of the table: "company_agreements" */
  update_company_agreements?: Maybe<CompanyAgreementsMutationResponse>;
  /** update single row of the table: "company_agreements" */
  update_company_agreements_by_pk?: Maybe<CompanyAgreements>;
  /** update data of the table: "company_licenses" */
  update_company_licenses?: Maybe<CompanyLicensesMutationResponse>;
  /** update single row of the table: "company_licenses" */
  update_company_licenses_by_pk?: Maybe<CompanyLicenses>;
  /** update data of the table: "company_settings" */
  update_company_settings?: Maybe<CompanySettingsMutationResponse>;
  /** update single row of the table: "company_settings" */
  update_company_settings_by_pk?: Maybe<CompanySettings>;
  /** update data of the table: "company_vendor_partnerships" */
  update_company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsMutationResponse>;
  /** update single row of the table: "company_vendor_partnerships" */
  update_company_vendor_partnerships_by_pk?: Maybe<CompanyVendorPartnerships>;
  /** update data of the table: "files" */
  update_files?: Maybe<FilesMutationResponse>;
  /** update single row of the table: "files" */
  update_files_by_pk?: Maybe<Files>;
  /** update data of the table: "payments" */
  update_payments?: Maybe<PaymentsMutationResponse>;
  /** update single row of the table: "payments" */
  update_payments_by_pk?: Maybe<Payments>;
  /** update data of the table: "product_type" */
  update_product_type?: Maybe<ProductTypeMutationResponse>;
  /** update single row of the table: "product_type" */
  update_product_type_by_pk?: Maybe<ProductType>;
  /** update data of the table: "purchase_order_file_type" */
  update_purchase_order_file_type?: Maybe<PurchaseOrderFileTypeMutationResponse>;
  /** update single row of the table: "purchase_order_file_type" */
  update_purchase_order_file_type_by_pk?: Maybe<PurchaseOrderFileType>;
  /** update data of the table: "purchase_order_files" */
  update_purchase_order_files?: Maybe<PurchaseOrderFilesMutationResponse>;
  /** update single row of the table: "purchase_order_files" */
  update_purchase_order_files_by_pk?: Maybe<PurchaseOrderFiles>;
  /** update data of the table: "purchase_order_loan_payments" */
  update_purchase_order_loan_payments?: Maybe<PurchaseOrderLoanPaymentsMutationResponse>;
  /** update single row of the table: "purchase_order_loan_payments" */
  update_purchase_order_loan_payments_by_pk?: Maybe<PurchaseOrderLoanPayments>;
  /** update data of the table: "purchase_order_loans" */
  update_purchase_order_loans?: Maybe<PurchaseOrderLoansMutationResponse>;
  /** update single row of the table: "purchase_order_loans" */
  update_purchase_order_loans_by_pk?: Maybe<PurchaseOrderLoans>;
  /** update data of the table: "purchase_orders" */
  update_purchase_orders?: Maybe<PurchaseOrdersMutationResponse>;
  /** update single row of the table: "purchase_orders" */
  update_purchase_orders_by_pk?: Maybe<PurchaseOrders>;
  /** update data of the table: "request_status" */
  update_request_status?: Maybe<RequestStatusMutationResponse>;
  /** update single row of the table: "request_status" */
  update_request_status_by_pk?: Maybe<RequestStatus>;
  /** update data of the table: "revoked_tokens" */
  update_revoked_tokens?: Maybe<RevokedTokensMutationResponse>;
  /** update single row of the table: "revoked_tokens" */
  update_revoked_tokens_by_pk?: Maybe<RevokedTokens>;
  /** update data of the table: "two_factor_links" */
  update_two_factor_links?: Maybe<TwoFactorLinksMutationResponse>;
  /** update single row of the table: "two_factor_links" */
  update_two_factor_links_by_pk?: Maybe<TwoFactorLinks>;
  /** update data of the table: "user_roles" */
  update_user_roles?: Maybe<UserRolesMutationResponse>;
  /** update single row of the table: "user_roles" */
  update_user_roles_by_pk?: Maybe<UserRoles>;
  /** update data of the table: "users" */
  update_users?: Maybe<UsersMutationResponse>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
  /** update data of the table: "vendors" */
  update_vendors?: Maybe<VendorsMutationResponse>;
};


/** mutation root */
export type MutationRootDeleteBankAccountsArgs = {
  where: BankAccountsBoolExp;
};


/** mutation root */
export type MutationRootDeleteBankAccountsByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteCompaniesArgs = {
  where: CompaniesBoolExp;
};


/** mutation root */
export type MutationRootDeleteCompaniesByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteCompanyAgreementsArgs = {
  where: CompanyAgreementsBoolExp;
};


/** mutation root */
export type MutationRootDeleteCompanyAgreementsByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteCompanyLicensesArgs = {
  where: CompanyLicensesBoolExp;
};


/** mutation root */
export type MutationRootDeleteCompanyLicensesByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteCompanySettingsArgs = {
  where: CompanySettingsBoolExp;
};


/** mutation root */
export type MutationRootDeleteCompanySettingsByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteCompanyVendorPartnershipsArgs = {
  where: CompanyVendorPartnershipsBoolExp;
};


/** mutation root */
export type MutationRootDeleteCompanyVendorPartnershipsByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteFilesArgs = {
  where: FilesBoolExp;
};


/** mutation root */
export type MutationRootDeleteFilesByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeletePaymentsArgs = {
  where: PaymentsBoolExp;
};


/** mutation root */
export type MutationRootDeletePaymentsByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteProductTypeArgs = {
  where: ProductTypeBoolExp;
};


/** mutation root */
export type MutationRootDeleteProductTypeByPkArgs = {
  value: Scalars['String'];
};


/** mutation root */
export type MutationRootDeletePurchaseOrderFileTypeArgs = {
  where: PurchaseOrderFileTypeBoolExp;
};


/** mutation root */
export type MutationRootDeletePurchaseOrderFileTypeByPkArgs = {
  value: Scalars['String'];
};


/** mutation root */
export type MutationRootDeletePurchaseOrderFilesArgs = {
  where: PurchaseOrderFilesBoolExp;
};


/** mutation root */
export type MutationRootDeletePurchaseOrderFilesByPkArgs = {
  file_id: Scalars['uuid'];
  purchase_order_id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeletePurchaseOrderLoanPaymentsArgs = {
  where: PurchaseOrderLoanPaymentsBoolExp;
};


/** mutation root */
export type MutationRootDeletePurchaseOrderLoanPaymentsByPkArgs = {
  payment_id: Scalars['uuid'];
  purchase_order_loan_id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeletePurchaseOrderLoansArgs = {
  where: PurchaseOrderLoansBoolExp;
};


/** mutation root */
export type MutationRootDeletePurchaseOrderLoansByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeletePurchaseOrdersArgs = {
  where: PurchaseOrdersBoolExp;
};


/** mutation root */
export type MutationRootDeletePurchaseOrdersByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteRequestStatusArgs = {
  where: RequestStatusBoolExp;
};


/** mutation root */
export type MutationRootDeleteRequestStatusByPkArgs = {
  value: Scalars['String'];
};


/** mutation root */
export type MutationRootDeleteRevokedTokensArgs = {
  where: RevokedTokensBoolExp;
};


/** mutation root */
export type MutationRootDeleteRevokedTokensByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteTwoFactorLinksArgs = {
  where: TwoFactorLinksBoolExp;
};


/** mutation root */
export type MutationRootDeleteTwoFactorLinksByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteUserRolesArgs = {
  where: UserRolesBoolExp;
};


/** mutation root */
export type MutationRootDeleteUserRolesByPkArgs = {
  value: Scalars['String'];
};


/** mutation root */
export type MutationRootDeleteUsersArgs = {
  where: UsersBoolExp;
};


/** mutation root */
export type MutationRootDeleteUsersByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteVendorsArgs = {
  where: VendorsBoolExp;
};


/** mutation root */
export type MutationRootInsertBankAccountsArgs = {
  objects: Array<BankAccountsInsertInput>;
  on_conflict?: Maybe<BankAccountsOnConflict>;
};


/** mutation root */
export type MutationRootInsertBankAccountsOneArgs = {
  object: BankAccountsInsertInput;
  on_conflict?: Maybe<BankAccountsOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompaniesArgs = {
  objects: Array<CompaniesInsertInput>;
  on_conflict?: Maybe<CompaniesOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompaniesOneArgs = {
  object: CompaniesInsertInput;
  on_conflict?: Maybe<CompaniesOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanyAgreementsArgs = {
  objects: Array<CompanyAgreementsInsertInput>;
  on_conflict?: Maybe<CompanyAgreementsOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanyAgreementsOneArgs = {
  object: CompanyAgreementsInsertInput;
  on_conflict?: Maybe<CompanyAgreementsOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanyLicensesArgs = {
  objects: Array<CompanyLicensesInsertInput>;
  on_conflict?: Maybe<CompanyLicensesOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanyLicensesOneArgs = {
  object: CompanyLicensesInsertInput;
  on_conflict?: Maybe<CompanyLicensesOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanySettingsArgs = {
  objects: Array<CompanySettingsInsertInput>;
  on_conflict?: Maybe<CompanySettingsOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanySettingsOneArgs = {
  object: CompanySettingsInsertInput;
  on_conflict?: Maybe<CompanySettingsOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanyVendorPartnershipsArgs = {
  objects: Array<CompanyVendorPartnershipsInsertInput>;
  on_conflict?: Maybe<CompanyVendorPartnershipsOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanyVendorPartnershipsOneArgs = {
  object: CompanyVendorPartnershipsInsertInput;
  on_conflict?: Maybe<CompanyVendorPartnershipsOnConflict>;
};


/** mutation root */
export type MutationRootInsertFilesArgs = {
  objects: Array<FilesInsertInput>;
  on_conflict?: Maybe<FilesOnConflict>;
};


/** mutation root */
export type MutationRootInsertFilesOneArgs = {
  object: FilesInsertInput;
  on_conflict?: Maybe<FilesOnConflict>;
};


/** mutation root */
export type MutationRootInsertPaymentsArgs = {
  objects: Array<PaymentsInsertInput>;
  on_conflict?: Maybe<PaymentsOnConflict>;
};


/** mutation root */
export type MutationRootInsertPaymentsOneArgs = {
  object: PaymentsInsertInput;
  on_conflict?: Maybe<PaymentsOnConflict>;
};


/** mutation root */
export type MutationRootInsertProductTypeArgs = {
  objects: Array<ProductTypeInsertInput>;
  on_conflict?: Maybe<ProductTypeOnConflict>;
};


/** mutation root */
export type MutationRootInsertProductTypeOneArgs = {
  object: ProductTypeInsertInput;
  on_conflict?: Maybe<ProductTypeOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderFileTypeArgs = {
  objects: Array<PurchaseOrderFileTypeInsertInput>;
  on_conflict?: Maybe<PurchaseOrderFileTypeOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderFileTypeOneArgs = {
  object: PurchaseOrderFileTypeInsertInput;
  on_conflict?: Maybe<PurchaseOrderFileTypeOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderFilesArgs = {
  objects: Array<PurchaseOrderFilesInsertInput>;
  on_conflict?: Maybe<PurchaseOrderFilesOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderFilesOneArgs = {
  object: PurchaseOrderFilesInsertInput;
  on_conflict?: Maybe<PurchaseOrderFilesOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderLoanPaymentsArgs = {
  objects: Array<PurchaseOrderLoanPaymentsInsertInput>;
  on_conflict?: Maybe<PurchaseOrderLoanPaymentsOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderLoanPaymentsOneArgs = {
  object: PurchaseOrderLoanPaymentsInsertInput;
  on_conflict?: Maybe<PurchaseOrderLoanPaymentsOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderLoansArgs = {
  objects: Array<PurchaseOrderLoansInsertInput>;
  on_conflict?: Maybe<PurchaseOrderLoansOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderLoansOneArgs = {
  object: PurchaseOrderLoansInsertInput;
  on_conflict?: Maybe<PurchaseOrderLoansOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrdersArgs = {
  objects: Array<PurchaseOrdersInsertInput>;
  on_conflict?: Maybe<PurchaseOrdersOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrdersOneArgs = {
  object: PurchaseOrdersInsertInput;
  on_conflict?: Maybe<PurchaseOrdersOnConflict>;
};


/** mutation root */
export type MutationRootInsertRequestStatusArgs = {
  objects: Array<RequestStatusInsertInput>;
  on_conflict?: Maybe<RequestStatusOnConflict>;
};


/** mutation root */
export type MutationRootInsertRequestStatusOneArgs = {
  object: RequestStatusInsertInput;
  on_conflict?: Maybe<RequestStatusOnConflict>;
};


/** mutation root */
export type MutationRootInsertRevokedTokensArgs = {
  objects: Array<RevokedTokensInsertInput>;
  on_conflict?: Maybe<RevokedTokensOnConflict>;
};


/** mutation root */
export type MutationRootInsertRevokedTokensOneArgs = {
  object: RevokedTokensInsertInput;
  on_conflict?: Maybe<RevokedTokensOnConflict>;
};


/** mutation root */
export type MutationRootInsertTwoFactorLinksArgs = {
  objects: Array<TwoFactorLinksInsertInput>;
  on_conflict?: Maybe<TwoFactorLinksOnConflict>;
};


/** mutation root */
export type MutationRootInsertTwoFactorLinksOneArgs = {
  object: TwoFactorLinksInsertInput;
  on_conflict?: Maybe<TwoFactorLinksOnConflict>;
};


/** mutation root */
export type MutationRootInsertUserRolesArgs = {
  objects: Array<UserRolesInsertInput>;
  on_conflict?: Maybe<UserRolesOnConflict>;
};


/** mutation root */
export type MutationRootInsertUserRolesOneArgs = {
  object: UserRolesInsertInput;
  on_conflict?: Maybe<UserRolesOnConflict>;
};


/** mutation root */
export type MutationRootInsertUsersArgs = {
  objects: Array<UsersInsertInput>;
  on_conflict?: Maybe<UsersOnConflict>;
};


/** mutation root */
export type MutationRootInsertUsersOneArgs = {
  object: UsersInsertInput;
  on_conflict?: Maybe<UsersOnConflict>;
};


/** mutation root */
export type MutationRootInsertVendorsArgs = {
  objects: Array<VendorsInsertInput>;
};


/** mutation root */
export type MutationRootInsertVendorsOneArgs = {
  object: VendorsInsertInput;
};


/** mutation root */
export type MutationRootUpdateBankAccountsArgs = {
  _set?: Maybe<BankAccountsSetInput>;
  where: BankAccountsBoolExp;
};


/** mutation root */
export type MutationRootUpdateBankAccountsByPkArgs = {
  _set?: Maybe<BankAccountsSetInput>;
  pk_columns: BankAccountsPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateCompaniesArgs = {
  _set?: Maybe<CompaniesSetInput>;
  where: CompaniesBoolExp;
};


/** mutation root */
export type MutationRootUpdateCompaniesByPkArgs = {
  _set?: Maybe<CompaniesSetInput>;
  pk_columns: CompaniesPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateCompanyAgreementsArgs = {
  _set?: Maybe<CompanyAgreementsSetInput>;
  where: CompanyAgreementsBoolExp;
};


/** mutation root */
export type MutationRootUpdateCompanyAgreementsByPkArgs = {
  _set?: Maybe<CompanyAgreementsSetInput>;
  pk_columns: CompanyAgreementsPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateCompanyLicensesArgs = {
  _set?: Maybe<CompanyLicensesSetInput>;
  where: CompanyLicensesBoolExp;
};


/** mutation root */
export type MutationRootUpdateCompanyLicensesByPkArgs = {
  _set?: Maybe<CompanyLicensesSetInput>;
  pk_columns: CompanyLicensesPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateCompanySettingsArgs = {
  _append?: Maybe<CompanySettingsAppendInput>;
  _delete_at_path?: Maybe<CompanySettingsDeleteAtPathInput>;
  _delete_elem?: Maybe<CompanySettingsDeleteElemInput>;
  _delete_key?: Maybe<CompanySettingsDeleteKeyInput>;
  _prepend?: Maybe<CompanySettingsPrependInput>;
  _set?: Maybe<CompanySettingsSetInput>;
  where: CompanySettingsBoolExp;
};


/** mutation root */
export type MutationRootUpdateCompanySettingsByPkArgs = {
  _append?: Maybe<CompanySettingsAppendInput>;
  _delete_at_path?: Maybe<CompanySettingsDeleteAtPathInput>;
  _delete_elem?: Maybe<CompanySettingsDeleteElemInput>;
  _delete_key?: Maybe<CompanySettingsDeleteKeyInput>;
  _prepend?: Maybe<CompanySettingsPrependInput>;
  _set?: Maybe<CompanySettingsSetInput>;
  pk_columns: CompanySettingsPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateCompanyVendorPartnershipsArgs = {
  _set?: Maybe<CompanyVendorPartnershipsSetInput>;
  where: CompanyVendorPartnershipsBoolExp;
};


/** mutation root */
export type MutationRootUpdateCompanyVendorPartnershipsByPkArgs = {
  _set?: Maybe<CompanyVendorPartnershipsSetInput>;
  pk_columns: CompanyVendorPartnershipsPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateFilesArgs = {
  _inc?: Maybe<FilesIncInput>;
  _set?: Maybe<FilesSetInput>;
  where: FilesBoolExp;
};


/** mutation root */
export type MutationRootUpdateFilesByPkArgs = {
  _inc?: Maybe<FilesIncInput>;
  _set?: Maybe<FilesSetInput>;
  pk_columns: FilesPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdatePaymentsArgs = {
  _append?: Maybe<PaymentsAppendInput>;
  _delete_at_path?: Maybe<PaymentsDeleteAtPathInput>;
  _delete_elem?: Maybe<PaymentsDeleteElemInput>;
  _delete_key?: Maybe<PaymentsDeleteKeyInput>;
  _inc?: Maybe<PaymentsIncInput>;
  _prepend?: Maybe<PaymentsPrependInput>;
  _set?: Maybe<PaymentsSetInput>;
  where: PaymentsBoolExp;
};


/** mutation root */
export type MutationRootUpdatePaymentsByPkArgs = {
  _append?: Maybe<PaymentsAppendInput>;
  _delete_at_path?: Maybe<PaymentsDeleteAtPathInput>;
  _delete_elem?: Maybe<PaymentsDeleteElemInput>;
  _delete_key?: Maybe<PaymentsDeleteKeyInput>;
  _inc?: Maybe<PaymentsIncInput>;
  _prepend?: Maybe<PaymentsPrependInput>;
  _set?: Maybe<PaymentsSetInput>;
  pk_columns: PaymentsPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateProductTypeArgs = {
  _set?: Maybe<ProductTypeSetInput>;
  where: ProductTypeBoolExp;
};


/** mutation root */
export type MutationRootUpdateProductTypeByPkArgs = {
  _set?: Maybe<ProductTypeSetInput>;
  pk_columns: ProductTypePkColumnsInput;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderFileTypeArgs = {
  _set?: Maybe<PurchaseOrderFileTypeSetInput>;
  where: PurchaseOrderFileTypeBoolExp;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderFileTypeByPkArgs = {
  _set?: Maybe<PurchaseOrderFileTypeSetInput>;
  pk_columns: PurchaseOrderFileTypePkColumnsInput;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderFilesArgs = {
  _set?: Maybe<PurchaseOrderFilesSetInput>;
  where: PurchaseOrderFilesBoolExp;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderFilesByPkArgs = {
  _set?: Maybe<PurchaseOrderFilesSetInput>;
  pk_columns: PurchaseOrderFilesPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderLoanPaymentsArgs = {
  _set?: Maybe<PurchaseOrderLoanPaymentsSetInput>;
  where: PurchaseOrderLoanPaymentsBoolExp;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderLoanPaymentsByPkArgs = {
  _set?: Maybe<PurchaseOrderLoanPaymentsSetInput>;
  pk_columns: PurchaseOrderLoanPaymentsPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderLoansArgs = {
  _inc?: Maybe<PurchaseOrderLoansIncInput>;
  _set?: Maybe<PurchaseOrderLoansSetInput>;
  where: PurchaseOrderLoansBoolExp;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderLoansByPkArgs = {
  _inc?: Maybe<PurchaseOrderLoansIncInput>;
  _set?: Maybe<PurchaseOrderLoansSetInput>;
  pk_columns: PurchaseOrderLoansPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrdersArgs = {
  _inc?: Maybe<PurchaseOrdersIncInput>;
  _set?: Maybe<PurchaseOrdersSetInput>;
  where: PurchaseOrdersBoolExp;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrdersByPkArgs = {
  _inc?: Maybe<PurchaseOrdersIncInput>;
  _set?: Maybe<PurchaseOrdersSetInput>;
  pk_columns: PurchaseOrdersPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateRequestStatusArgs = {
  _set?: Maybe<RequestStatusSetInput>;
  where: RequestStatusBoolExp;
};


/** mutation root */
export type MutationRootUpdateRequestStatusByPkArgs = {
  _set?: Maybe<RequestStatusSetInput>;
  pk_columns: RequestStatusPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateRevokedTokensArgs = {
  _set?: Maybe<RevokedTokensSetInput>;
  where: RevokedTokensBoolExp;
};


/** mutation root */
export type MutationRootUpdateRevokedTokensByPkArgs = {
  _set?: Maybe<RevokedTokensSetInput>;
  pk_columns: RevokedTokensPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateTwoFactorLinksArgs = {
  _set?: Maybe<TwoFactorLinksSetInput>;
  where: TwoFactorLinksBoolExp;
};


/** mutation root */
export type MutationRootUpdateTwoFactorLinksByPkArgs = {
  _set?: Maybe<TwoFactorLinksSetInput>;
  pk_columns: TwoFactorLinksPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateUserRolesArgs = {
  _set?: Maybe<UserRolesSetInput>;
  where: UserRolesBoolExp;
};


/** mutation root */
export type MutationRootUpdateUserRolesByPkArgs = {
  _set?: Maybe<UserRolesSetInput>;
  pk_columns: UserRolesPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateUsersArgs = {
  _set?: Maybe<UsersSetInput>;
  where: UsersBoolExp;
};


/** mutation root */
export type MutationRootUpdateUsersByPkArgs = {
  _set?: Maybe<UsersSetInput>;
  pk_columns: UsersPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdateVendorsArgs = {
  _set?: Maybe<VendorsSetInput>;
  where: VendorsBoolExp;
};


/** expression to compare columns of type numeric. All fields are combined with logical 'AND'. */
export type NumericComparisonExp = {
  _eq?: Maybe<Scalars['numeric']>;
  _gt?: Maybe<Scalars['numeric']>;
  _gte?: Maybe<Scalars['numeric']>;
  _in?: Maybe<Array<Scalars['numeric']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['numeric']>;
  _lte?: Maybe<Scalars['numeric']>;
  _neq?: Maybe<Scalars['numeric']>;
  _nin?: Maybe<Array<Scalars['numeric']>>;
};

/** column ordering options */
export enum OrderBy {
  /** in the ascending order, nulls last */
  Asc = 'asc',
  /** in the ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in the ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in the descending order, nulls first */
  Desc = 'desc',
  /** in the descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in the descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** columns and relationships of "payments" */
export type Payments = {
  amount: Scalars['numeric'];
  /** An object relationship */
  bespoke_bank_account?: Maybe<BankAccounts>;
  bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  /** An object relationship */
  company: Companies;
  /** An object relationship */
  company_bank_account?: Maybe<BankAccounts>;
  company_bank_account_id?: Maybe<Scalars['uuid']>;
  company_id: Scalars['uuid'];
  deposit_date?: Maybe<Scalars['date']>;
  direction: Scalars['String'];
  effective_date?: Maybe<Scalars['date']>;
  id: Scalars['uuid'];
  items_covered: Scalars['jsonb'];
  method: Scalars['String'];
  settled_at?: Maybe<Scalars['timestamptz']>;
  submitted_at: Scalars['timestamptz'];
};


/** columns and relationships of "payments" */
export type PaymentsItemsCoveredArgs = {
  path?: Maybe<Scalars['String']>;
};

/** aggregated selection of "payments" */
export type PaymentsAggregate = {
  aggregate?: Maybe<PaymentsAggregateFields>;
  nodes: Array<Payments>;
};

/** aggregate fields of "payments" */
export type PaymentsAggregateFields = {
  avg?: Maybe<PaymentsAvgFields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<PaymentsMaxFields>;
  min?: Maybe<PaymentsMinFields>;
  stddev?: Maybe<PaymentsStddevFields>;
  stddev_pop?: Maybe<PaymentsStddevPopFields>;
  stddev_samp?: Maybe<PaymentsStddevSampFields>;
  sum?: Maybe<PaymentsSumFields>;
  var_pop?: Maybe<PaymentsVarPopFields>;
  var_samp?: Maybe<PaymentsVarSampFields>;
  variance?: Maybe<PaymentsVarianceFields>;
};


/** aggregate fields of "payments" */
export type PaymentsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PaymentsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "payments" */
export type PaymentsAggregateOrderBy = {
  avg?: Maybe<PaymentsAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<PaymentsMaxOrderBy>;
  min?: Maybe<PaymentsMinOrderBy>;
  stddev?: Maybe<PaymentsStddevOrderBy>;
  stddev_pop?: Maybe<PaymentsStddevPopOrderBy>;
  stddev_samp?: Maybe<PaymentsStddevSampOrderBy>;
  sum?: Maybe<PaymentsSumOrderBy>;
  var_pop?: Maybe<PaymentsVarPopOrderBy>;
  var_samp?: Maybe<PaymentsVarSampOrderBy>;
  variance?: Maybe<PaymentsVarianceOrderBy>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type PaymentsAppendInput = {
  items_covered?: Maybe<Scalars['jsonb']>;
};

/** input type for inserting array relation for remote table "payments" */
export type PaymentsArrRelInsertInput = {
  data: Array<PaymentsInsertInput>;
  on_conflict?: Maybe<PaymentsOnConflict>;
};

/** aggregate avg on columns */
export type PaymentsAvgFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "payments" */
export type PaymentsAvgOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "payments". All fields are combined with a logical 'AND'. */
export type PaymentsBoolExp = {
  _and?: Maybe<Array<Maybe<PaymentsBoolExp>>>;
  _not?: Maybe<PaymentsBoolExp>;
  _or?: Maybe<Array<Maybe<PaymentsBoolExp>>>;
  amount?: Maybe<NumericComparisonExp>;
  bespoke_bank_account?: Maybe<BankAccountsBoolExp>;
  bespoke_bank_account_id?: Maybe<UuidComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_bank_account?: Maybe<BankAccountsBoolExp>;
  company_bank_account_id?: Maybe<UuidComparisonExp>;
  company_id?: Maybe<UuidComparisonExp>;
  deposit_date?: Maybe<DateComparisonExp>;
  direction?: Maybe<StringComparisonExp>;
  effective_date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  items_covered?: Maybe<JsonbComparisonExp>;
  method?: Maybe<StringComparisonExp>;
  settled_at?: Maybe<TimestamptzComparisonExp>;
  submitted_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "payments" */
export enum PaymentsConstraint {
  /** unique or primary key constraint */
  PaymentsPkey = 'payments_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type PaymentsDeleteAtPathInput = {
  items_covered?: Maybe<Array<Maybe<Scalars['String']>>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type PaymentsDeleteElemInput = {
  items_covered?: Maybe<Scalars['Int']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type PaymentsDeleteKeyInput = {
  items_covered?: Maybe<Scalars['String']>;
};

/** input type for incrementing integer column in table "payments" */
export type PaymentsIncInput = {
  amount?: Maybe<Scalars['numeric']>;
};

/** input type for inserting data into table "payments" */
export type PaymentsInsertInput = {
  amount?: Maybe<Scalars['numeric']>;
  bespoke_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  company_bank_account_id?: Maybe<Scalars['uuid']>;
  company_id?: Maybe<Scalars['uuid']>;
  deposit_date?: Maybe<Scalars['date']>;
  direction?: Maybe<Scalars['String']>;
  effective_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  items_covered?: Maybe<Scalars['jsonb']>;
  method?: Maybe<Scalars['String']>;
  settled_at?: Maybe<Scalars['timestamptz']>;
  submitted_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type PaymentsMaxFields = {
  amount?: Maybe<Scalars['numeric']>;
  bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  company_bank_account_id?: Maybe<Scalars['uuid']>;
  company_id?: Maybe<Scalars['uuid']>;
  deposit_date?: Maybe<Scalars['date']>;
  direction?: Maybe<Scalars['String']>;
  effective_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  method?: Maybe<Scalars['String']>;
  settled_at?: Maybe<Scalars['timestamptz']>;
  submitted_at?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "payments" */
export type PaymentsMaxOrderBy = {
  amount?: Maybe<OrderBy>;
  bespoke_bank_account_id?: Maybe<OrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  deposit_date?: Maybe<OrderBy>;
  direction?: Maybe<OrderBy>;
  effective_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PaymentsMinFields = {
  amount?: Maybe<Scalars['numeric']>;
  bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  company_bank_account_id?: Maybe<Scalars['uuid']>;
  company_id?: Maybe<Scalars['uuid']>;
  deposit_date?: Maybe<Scalars['date']>;
  direction?: Maybe<Scalars['String']>;
  effective_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  method?: Maybe<Scalars['String']>;
  settled_at?: Maybe<Scalars['timestamptz']>;
  submitted_at?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "payments" */
export type PaymentsMinOrderBy = {
  amount?: Maybe<OrderBy>;
  bespoke_bank_account_id?: Maybe<OrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  deposit_date?: Maybe<OrderBy>;
  direction?: Maybe<OrderBy>;
  effective_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "payments" */
export type PaymentsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<Payments>;
};

/** input type for inserting object relation for remote table "payments" */
export type PaymentsObjRelInsertInput = {
  data: PaymentsInsertInput;
  on_conflict?: Maybe<PaymentsOnConflict>;
};

/** on conflict condition type for table "payments" */
export type PaymentsOnConflict = {
  constraint: PaymentsConstraint;
  update_columns: Array<PaymentsUpdateColumn>;
  where?: Maybe<PaymentsBoolExp>;
};

/** ordering options when selecting data from "payments" */
export type PaymentsOrderBy = {
  amount?: Maybe<OrderBy>;
  bespoke_bank_account?: Maybe<BankAccountsOrderBy>;
  bespoke_bank_account_id?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_bank_account?: Maybe<BankAccountsOrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  deposit_date?: Maybe<OrderBy>;
  direction?: Maybe<OrderBy>;
  effective_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  items_covered?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "payments" */
export type PaymentsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type PaymentsPrependInput = {
  items_covered?: Maybe<Scalars['jsonb']>;
};

/** select columns of table "payments" */
export enum PaymentsSelectColumn {
  /** column name */
  Amount = 'amount',
  /** column name */
  BespokeBankAccountId = 'bespoke_bank_account_id',
  /** column name */
  CompanyBankAccountId = 'company_bank_account_id',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  DepositDate = 'deposit_date',
  /** column name */
  Direction = 'direction',
  /** column name */
  EffectiveDate = 'effective_date',
  /** column name */
  Id = 'id',
  /** column name */
  ItemsCovered = 'items_covered',
  /** column name */
  Method = 'method',
  /** column name */
  SettledAt = 'settled_at',
  /** column name */
  SubmittedAt = 'submitted_at'
}

/** input type for updating data in table "payments" */
export type PaymentsSetInput = {
  amount?: Maybe<Scalars['numeric']>;
  bespoke_bank_account_id?: Maybe<Scalars['uuid']>;
  company_bank_account_id?: Maybe<Scalars['uuid']>;
  company_id?: Maybe<Scalars['uuid']>;
  deposit_date?: Maybe<Scalars['date']>;
  direction?: Maybe<Scalars['String']>;
  effective_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  items_covered?: Maybe<Scalars['jsonb']>;
  method?: Maybe<Scalars['String']>;
  settled_at?: Maybe<Scalars['timestamptz']>;
  submitted_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type PaymentsStddevFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "payments" */
export type PaymentsStddevOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type PaymentsStddevPopFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "payments" */
export type PaymentsStddevPopOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type PaymentsStddevSampFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "payments" */
export type PaymentsStddevSampOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type PaymentsSumFields = {
  amount?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "payments" */
export type PaymentsSumOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** update columns of table "payments" */
export enum PaymentsUpdateColumn {
  /** column name */
  Amount = 'amount',
  /** column name */
  BespokeBankAccountId = 'bespoke_bank_account_id',
  /** column name */
  CompanyBankAccountId = 'company_bank_account_id',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  DepositDate = 'deposit_date',
  /** column name */
  Direction = 'direction',
  /** column name */
  EffectiveDate = 'effective_date',
  /** column name */
  Id = 'id',
  /** column name */
  ItemsCovered = 'items_covered',
  /** column name */
  Method = 'method',
  /** column name */
  SettledAt = 'settled_at',
  /** column name */
  SubmittedAt = 'submitted_at'
}

/** aggregate var_pop on columns */
export type PaymentsVarPopFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "payments" */
export type PaymentsVarPopOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type PaymentsVarSampFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "payments" */
export type PaymentsVarSampOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type PaymentsVarianceFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "payments" */
export type PaymentsVarianceOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** columns and relationships of "product_type" */
export type ProductType = {
  display_name: Scalars['String'];
  value: Scalars['String'];
};

/** aggregated selection of "product_type" */
export type ProductTypeAggregate = {
  aggregate?: Maybe<ProductTypeAggregateFields>;
  nodes: Array<ProductType>;
};

/** aggregate fields of "product_type" */
export type ProductTypeAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<ProductTypeMaxFields>;
  min?: Maybe<ProductTypeMinFields>;
};


/** aggregate fields of "product_type" */
export type ProductTypeAggregateFieldsCountArgs = {
  columns?: Maybe<Array<ProductTypeSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "product_type" */
export type ProductTypeAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<ProductTypeMaxOrderBy>;
  min?: Maybe<ProductTypeMinOrderBy>;
};

/** input type for inserting array relation for remote table "product_type" */
export type ProductTypeArrRelInsertInput = {
  data: Array<ProductTypeInsertInput>;
  on_conflict?: Maybe<ProductTypeOnConflict>;
};

/** Boolean expression to filter rows from the table "product_type". All fields are combined with a logical 'AND'. */
export type ProductTypeBoolExp = {
  _and?: Maybe<Array<Maybe<ProductTypeBoolExp>>>;
  _not?: Maybe<ProductTypeBoolExp>;
  _or?: Maybe<Array<Maybe<ProductTypeBoolExp>>>;
  display_name?: Maybe<StringComparisonExp>;
  value?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "product_type" */
export enum ProductTypeConstraint {
  /** unique or primary key constraint */
  ProductTypePkey = 'product_type_pkey'
}

export enum ProductTypeEnum {
  /** Inventory Financing */
  InventoryFinancing = 'inventory_financing',
  /** Invoice Financing */
  InvoiceFinancing = 'invoice_financing',
  /** Line of Credit */
  LineOfCredit = 'line_of_credit',
  /** None */
  None = 'none',
  /** Purchase Money Financing */
  PurchaseMoneyFinancing = 'purchase_money_financing'
}

/** expression to compare columns of type product_type_enum. All fields are combined with logical 'AND'. */
export type ProductTypeEnumComparisonExp = {
  _eq?: Maybe<ProductTypeEnum>;
  _in?: Maybe<Array<ProductTypeEnum>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _neq?: Maybe<ProductTypeEnum>;
  _nin?: Maybe<Array<ProductTypeEnum>>;
};

/** input type for inserting data into table "product_type" */
export type ProductTypeInsertInput = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type ProductTypeMaxFields = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "product_type" */
export type ProductTypeMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type ProductTypeMinFields = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "product_type" */
export type ProductTypeMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "product_type" */
export type ProductTypeMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<ProductType>;
};

/** input type for inserting object relation for remote table "product_type" */
export type ProductTypeObjRelInsertInput = {
  data: ProductTypeInsertInput;
  on_conflict?: Maybe<ProductTypeOnConflict>;
};

/** on conflict condition type for table "product_type" */
export type ProductTypeOnConflict = {
  constraint: ProductTypeConstraint;
  update_columns: Array<ProductTypeUpdateColumn>;
  where?: Maybe<ProductTypeBoolExp>;
};

/** ordering options when selecting data from "product_type" */
export type ProductTypeOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** primary key columns input for table: "product_type" */
export type ProductTypePkColumnsInput = {
  value: Scalars['String'];
};

/** select columns of table "product_type" */
export enum ProductTypeSelectColumn {
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "product_type" */
export type ProductTypeSetInput = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** update columns of table "product_type" */
export enum ProductTypeUpdateColumn {
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Value = 'value'
}

/**
 * Enum for PurchaseOrderFile types
 * 
 * 
 * columns and relationships of "purchase_order_file_type"
 */
export type PurchaseOrderFileType = {
  display_name: Scalars['String'];
  value: Scalars['String'];
};

/** aggregated selection of "purchase_order_file_type" */
export type PurchaseOrderFileTypeAggregate = {
  aggregate?: Maybe<PurchaseOrderFileTypeAggregateFields>;
  nodes: Array<PurchaseOrderFileType>;
};

/** aggregate fields of "purchase_order_file_type" */
export type PurchaseOrderFileTypeAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<PurchaseOrderFileTypeMaxFields>;
  min?: Maybe<PurchaseOrderFileTypeMinFields>;
};


/** aggregate fields of "purchase_order_file_type" */
export type PurchaseOrderFileTypeAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "purchase_order_file_type" */
export type PurchaseOrderFileTypeAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<PurchaseOrderFileTypeMaxOrderBy>;
  min?: Maybe<PurchaseOrderFileTypeMinOrderBy>;
};

/** input type for inserting array relation for remote table "purchase_order_file_type" */
export type PurchaseOrderFileTypeArrRelInsertInput = {
  data: Array<PurchaseOrderFileTypeInsertInput>;
  on_conflict?: Maybe<PurchaseOrderFileTypeOnConflict>;
};

/** Boolean expression to filter rows from the table "purchase_order_file_type". All fields are combined with a logical 'AND'. */
export type PurchaseOrderFileTypeBoolExp = {
  _and?: Maybe<Array<Maybe<PurchaseOrderFileTypeBoolExp>>>;
  _not?: Maybe<PurchaseOrderFileTypeBoolExp>;
  _or?: Maybe<Array<Maybe<PurchaseOrderFileTypeBoolExp>>>;
  display_name?: Maybe<StringComparisonExp>;
  value?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "purchase_order_file_type" */
export enum PurchaseOrderFileTypeConstraint {
  /** unique or primary key constraint */
  PurchaseOrderFileTypePkey = 'purchase_order_file_type_pkey'
}

export enum PurchaseOrderFileTypeEnum {
  /** Cannabis */
  Cannabis = 'cannabis',
  /** Purchase Order */
  PurchaseOrder = 'purchase_order'
}

/** expression to compare columns of type purchase_order_file_type_enum. All fields are combined with logical 'AND'. */
export type PurchaseOrderFileTypeEnumComparisonExp = {
  _eq?: Maybe<PurchaseOrderFileTypeEnum>;
  _in?: Maybe<Array<PurchaseOrderFileTypeEnum>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _neq?: Maybe<PurchaseOrderFileTypeEnum>;
  _nin?: Maybe<Array<PurchaseOrderFileTypeEnum>>;
};

/** input type for inserting data into table "purchase_order_file_type" */
export type PurchaseOrderFileTypeInsertInput = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type PurchaseOrderFileTypeMaxFields = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "purchase_order_file_type" */
export type PurchaseOrderFileTypeMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrderFileTypeMinFields = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "purchase_order_file_type" */
export type PurchaseOrderFileTypeMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "purchase_order_file_type" */
export type PurchaseOrderFileTypeMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<PurchaseOrderFileType>;
};

/** input type for inserting object relation for remote table "purchase_order_file_type" */
export type PurchaseOrderFileTypeObjRelInsertInput = {
  data: PurchaseOrderFileTypeInsertInput;
  on_conflict?: Maybe<PurchaseOrderFileTypeOnConflict>;
};

/** on conflict condition type for table "purchase_order_file_type" */
export type PurchaseOrderFileTypeOnConflict = {
  constraint: PurchaseOrderFileTypeConstraint;
  update_columns: Array<PurchaseOrderFileTypeUpdateColumn>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};

/** ordering options when selecting data from "purchase_order_file_type" */
export type PurchaseOrderFileTypeOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** primary key columns input for table: "purchase_order_file_type" */
export type PurchaseOrderFileTypePkColumnsInput = {
  value: Scalars['String'];
};

/** select columns of table "purchase_order_file_type" */
export enum PurchaseOrderFileTypeSelectColumn {
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "purchase_order_file_type" */
export type PurchaseOrderFileTypeSetInput = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** update columns of table "purchase_order_file_type" */
export enum PurchaseOrderFileTypeUpdateColumn {
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Value = 'value'
}

/**
 * Files attached to purchase orders
 * 
 * 
 * columns and relationships of "purchase_order_files"
 */
export type PurchaseOrderFiles = {
  /** An object relationship */
  file: Files;
  file_id: Scalars['uuid'];
  file_type: PurchaseOrderFileTypeEnum;
  /** An object relationship */
  purchase_order: PurchaseOrders;
  purchase_order_id: Scalars['uuid'];
};

/** aggregated selection of "purchase_order_files" */
export type PurchaseOrderFilesAggregate = {
  aggregate?: Maybe<PurchaseOrderFilesAggregateFields>;
  nodes: Array<PurchaseOrderFiles>;
};

/** aggregate fields of "purchase_order_files" */
export type PurchaseOrderFilesAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<PurchaseOrderFilesMaxFields>;
  min?: Maybe<PurchaseOrderFilesMinFields>;
};


/** aggregate fields of "purchase_order_files" */
export type PurchaseOrderFilesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "purchase_order_files" */
export type PurchaseOrderFilesAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<PurchaseOrderFilesMaxOrderBy>;
  min?: Maybe<PurchaseOrderFilesMinOrderBy>;
};

/** input type for inserting array relation for remote table "purchase_order_files" */
export type PurchaseOrderFilesArrRelInsertInput = {
  data: Array<PurchaseOrderFilesInsertInput>;
  on_conflict?: Maybe<PurchaseOrderFilesOnConflict>;
};

/** Boolean expression to filter rows from the table "purchase_order_files". All fields are combined with a logical 'AND'. */
export type PurchaseOrderFilesBoolExp = {
  _and?: Maybe<Array<Maybe<PurchaseOrderFilesBoolExp>>>;
  _not?: Maybe<PurchaseOrderFilesBoolExp>;
  _or?: Maybe<Array<Maybe<PurchaseOrderFilesBoolExp>>>;
  file?: Maybe<FilesBoolExp>;
  file_id?: Maybe<UuidComparisonExp>;
  file_type?: Maybe<PurchaseOrderFileTypeEnumComparisonExp>;
  purchase_order?: Maybe<PurchaseOrdersBoolExp>;
  purchase_order_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "purchase_order_files" */
export enum PurchaseOrderFilesConstraint {
  /** unique or primary key constraint */
  PurchaseOrderFilesPkey = 'purchase_order_files_pkey'
}

/** input type for inserting data into table "purchase_order_files" */
export type PurchaseOrderFilesInsertInput = {
  file?: Maybe<FilesObjRelInsertInput>;
  file_id?: Maybe<Scalars['uuid']>;
  file_type?: Maybe<PurchaseOrderFileTypeEnum>;
  purchase_order?: Maybe<PurchaseOrdersObjRelInsertInput>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type PurchaseOrderFilesMaxFields = {
  file_id?: Maybe<Scalars['uuid']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "purchase_order_files" */
export type PurchaseOrderFilesMaxOrderBy = {
  file_id?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrderFilesMinFields = {
  file_id?: Maybe<Scalars['uuid']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "purchase_order_files" */
export type PurchaseOrderFilesMinOrderBy = {
  file_id?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "purchase_order_files" */
export type PurchaseOrderFilesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<PurchaseOrderFiles>;
};

/** input type for inserting object relation for remote table "purchase_order_files" */
export type PurchaseOrderFilesObjRelInsertInput = {
  data: PurchaseOrderFilesInsertInput;
  on_conflict?: Maybe<PurchaseOrderFilesOnConflict>;
};

/** on conflict condition type for table "purchase_order_files" */
export type PurchaseOrderFilesOnConflict = {
  constraint: PurchaseOrderFilesConstraint;
  update_columns: Array<PurchaseOrderFilesUpdateColumn>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};

/** ordering options when selecting data from "purchase_order_files" */
export type PurchaseOrderFilesOrderBy = {
  file?: Maybe<FilesOrderBy>;
  file_id?: Maybe<OrderBy>;
  file_type?: Maybe<OrderBy>;
  purchase_order?: Maybe<PurchaseOrdersOrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "purchase_order_files" */
export type PurchaseOrderFilesPkColumnsInput = {
  file_id: Scalars['uuid'];
  purchase_order_id: Scalars['uuid'];
};

/** select columns of table "purchase_order_files" */
export enum PurchaseOrderFilesSelectColumn {
  /** column name */
  FileId = 'file_id',
  /** column name */
  FileType = 'file_type',
  /** column name */
  PurchaseOrderId = 'purchase_order_id'
}

/** input type for updating data in table "purchase_order_files" */
export type PurchaseOrderFilesSetInput = {
  file_id?: Maybe<Scalars['uuid']>;
  file_type?: Maybe<PurchaseOrderFileTypeEnum>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "purchase_order_files" */
export enum PurchaseOrderFilesUpdateColumn {
  /** column name */
  FileId = 'file_id',
  /** column name */
  FileType = 'file_type',
  /** column name */
  PurchaseOrderId = 'purchase_order_id'
}

/** columns and relationships of "purchase_order_loan_payments" */
export type PurchaseOrderLoanPayments = {
  /** An object relationship */
  loan: PurchaseOrderLoans;
  /** An object relationship */
  payment: Payments;
  payment_id: Scalars['uuid'];
  purchase_order_loan_id: Scalars['uuid'];
};

/** aggregated selection of "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsAggregate = {
  aggregate?: Maybe<PurchaseOrderLoanPaymentsAggregateFields>;
  nodes: Array<PurchaseOrderLoanPayments>;
};

/** aggregate fields of "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<PurchaseOrderLoanPaymentsMaxFields>;
  min?: Maybe<PurchaseOrderLoanPaymentsMinFields>;
};


/** aggregate fields of "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrderLoanPaymentsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<PurchaseOrderLoanPaymentsMaxOrderBy>;
  min?: Maybe<PurchaseOrderLoanPaymentsMinOrderBy>;
};

/** input type for inserting array relation for remote table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsArrRelInsertInput = {
  data: Array<PurchaseOrderLoanPaymentsInsertInput>;
  on_conflict?: Maybe<PurchaseOrderLoanPaymentsOnConflict>;
};

/** Boolean expression to filter rows from the table "purchase_order_loan_payments". All fields are combined with a logical 'AND'. */
export type PurchaseOrderLoanPaymentsBoolExp = {
  _and?: Maybe<Array<Maybe<PurchaseOrderLoanPaymentsBoolExp>>>;
  _not?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
  _or?: Maybe<Array<Maybe<PurchaseOrderLoanPaymentsBoolExp>>>;
  loan?: Maybe<PurchaseOrderLoansBoolExp>;
  payment?: Maybe<PaymentsBoolExp>;
  payment_id?: Maybe<UuidComparisonExp>;
  purchase_order_loan_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "purchase_order_loan_payments" */
export enum PurchaseOrderLoanPaymentsConstraint {
  /** unique or primary key constraint */
  PurchaseOrderLoanPaymentsPkey = 'purchase_order_loan_payments_pkey'
}

/** input type for inserting data into table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsInsertInput = {
  loan?: Maybe<PurchaseOrderLoansObjRelInsertInput>;
  payment?: Maybe<PaymentsObjRelInsertInput>;
  payment_id?: Maybe<Scalars['uuid']>;
  purchase_order_loan_id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type PurchaseOrderLoanPaymentsMaxFields = {
  payment_id?: Maybe<Scalars['uuid']>;
  purchase_order_loan_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsMaxOrderBy = {
  payment_id?: Maybe<OrderBy>;
  purchase_order_loan_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrderLoanPaymentsMinFields = {
  payment_id?: Maybe<Scalars['uuid']>;
  purchase_order_loan_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsMinOrderBy = {
  payment_id?: Maybe<OrderBy>;
  purchase_order_loan_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<PurchaseOrderLoanPayments>;
};

/** input type for inserting object relation for remote table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsObjRelInsertInput = {
  data: PurchaseOrderLoanPaymentsInsertInput;
  on_conflict?: Maybe<PurchaseOrderLoanPaymentsOnConflict>;
};

/** on conflict condition type for table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsOnConflict = {
  constraint: PurchaseOrderLoanPaymentsConstraint;
  update_columns: Array<PurchaseOrderLoanPaymentsUpdateColumn>;
  where?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
};

/** ordering options when selecting data from "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsOrderBy = {
  loan?: Maybe<PurchaseOrderLoansOrderBy>;
  payment?: Maybe<PaymentsOrderBy>;
  payment_id?: Maybe<OrderBy>;
  purchase_order_loan_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsPkColumnsInput = {
  payment_id: Scalars['uuid'];
  purchase_order_loan_id: Scalars['uuid'];
};

/** select columns of table "purchase_order_loan_payments" */
export enum PurchaseOrderLoanPaymentsSelectColumn {
  /** column name */
  PaymentId = 'payment_id',
  /** column name */
  PurchaseOrderLoanId = 'purchase_order_loan_id'
}

/** input type for updating data in table "purchase_order_loan_payments" */
export type PurchaseOrderLoanPaymentsSetInput = {
  payment_id?: Maybe<Scalars['uuid']>;
  purchase_order_loan_id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "purchase_order_loan_payments" */
export enum PurchaseOrderLoanPaymentsUpdateColumn {
  /** column name */
  PaymentId = 'payment_id',
  /** column name */
  PurchaseOrderLoanId = 'purchase_order_loan_id'
}

/** columns and relationships of "purchase_order_loans" */
export type PurchaseOrderLoans = {
  adjusted_maturity_date?: Maybe<Scalars['date']>;
  amount?: Maybe<Scalars['numeric']>;
  amount_owed: Scalars['numeric'];
  closed_at?: Maybe<Scalars['timestamptz']>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars['uuid'];
  id: Scalars['uuid'];
  maturity_date?: Maybe<Scalars['date']>;
  origination_date?: Maybe<Scalars['date']>;
  outstanding_principal_balance: Scalars['numeric'];
  /** An array relationship */
  payments: Array<PurchaseOrderLoanPayments>;
  /** An aggregated array relationship */
  payments_aggregate: PurchaseOrderLoanPaymentsAggregate;
  /** An object relationship */
  purchase_order: PurchaseOrders;
  purchase_order_id: Scalars['uuid'];
  requested_at?: Maybe<Scalars['timestamptz']>;
  /** An object relationship */
  requested_by_user?: Maybe<Users>;
  requested_by_user_id?: Maybe<Scalars['uuid']>;
  status: RequestStatusEnum;
};


/** columns and relationships of "purchase_order_loans" */
export type PurchaseOrderLoansPaymentsArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoanPaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoanPaymentsOrderBy>>;
  where?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
};


/** columns and relationships of "purchase_order_loans" */
export type PurchaseOrderLoansPaymentsAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoanPaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoanPaymentsOrderBy>>;
  where?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
};

/** aggregated selection of "purchase_order_loans" */
export type PurchaseOrderLoansAggregate = {
  aggregate?: Maybe<PurchaseOrderLoansAggregateFields>;
  nodes: Array<PurchaseOrderLoans>;
};

/** aggregate fields of "purchase_order_loans" */
export type PurchaseOrderLoansAggregateFields = {
  avg?: Maybe<PurchaseOrderLoansAvgFields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<PurchaseOrderLoansMaxFields>;
  min?: Maybe<PurchaseOrderLoansMinFields>;
  stddev?: Maybe<PurchaseOrderLoansStddevFields>;
  stddev_pop?: Maybe<PurchaseOrderLoansStddevPopFields>;
  stddev_samp?: Maybe<PurchaseOrderLoansStddevSampFields>;
  sum?: Maybe<PurchaseOrderLoansSumFields>;
  var_pop?: Maybe<PurchaseOrderLoansVarPopFields>;
  var_samp?: Maybe<PurchaseOrderLoansVarSampFields>;
  variance?: Maybe<PurchaseOrderLoansVarianceFields>;
};


/** aggregate fields of "purchase_order_loans" */
export type PurchaseOrderLoansAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrderLoansSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "purchase_order_loans" */
export type PurchaseOrderLoansAggregateOrderBy = {
  avg?: Maybe<PurchaseOrderLoansAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<PurchaseOrderLoansMaxOrderBy>;
  min?: Maybe<PurchaseOrderLoansMinOrderBy>;
  stddev?: Maybe<PurchaseOrderLoansStddevOrderBy>;
  stddev_pop?: Maybe<PurchaseOrderLoansStddevPopOrderBy>;
  stddev_samp?: Maybe<PurchaseOrderLoansStddevSampOrderBy>;
  sum?: Maybe<PurchaseOrderLoansSumOrderBy>;
  var_pop?: Maybe<PurchaseOrderLoansVarPopOrderBy>;
  var_samp?: Maybe<PurchaseOrderLoansVarSampOrderBy>;
  variance?: Maybe<PurchaseOrderLoansVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "purchase_order_loans" */
export type PurchaseOrderLoansArrRelInsertInput = {
  data: Array<PurchaseOrderLoansInsertInput>;
  on_conflict?: Maybe<PurchaseOrderLoansOnConflict>;
};

/** aggregate avg on columns */
export type PurchaseOrderLoansAvgFields = {
  amount?: Maybe<Scalars['Float']>;
  amount_owed?: Maybe<Scalars['Float']>;
  outstanding_principal_balance?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansAvgOrderBy = {
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "purchase_order_loans". All fields are combined with a logical 'AND'. */
export type PurchaseOrderLoansBoolExp = {
  _and?: Maybe<Array<Maybe<PurchaseOrderLoansBoolExp>>>;
  _not?: Maybe<PurchaseOrderLoansBoolExp>;
  _or?: Maybe<Array<Maybe<PurchaseOrderLoansBoolExp>>>;
  adjusted_maturity_date?: Maybe<DateComparisonExp>;
  amount?: Maybe<NumericComparisonExp>;
  amount_owed?: Maybe<NumericComparisonExp>;
  closed_at?: Maybe<TimestamptzComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  maturity_date?: Maybe<DateComparisonExp>;
  origination_date?: Maybe<DateComparisonExp>;
  outstanding_principal_balance?: Maybe<NumericComparisonExp>;
  payments?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
  purchase_order?: Maybe<PurchaseOrdersBoolExp>;
  purchase_order_id?: Maybe<UuidComparisonExp>;
  requested_at?: Maybe<TimestamptzComparisonExp>;
  requested_by_user?: Maybe<UsersBoolExp>;
  requested_by_user_id?: Maybe<UuidComparisonExp>;
  status?: Maybe<RequestStatusEnumComparisonExp>;
};

/** unique or primary key constraints on table "purchase_order_loans" */
export enum PurchaseOrderLoansConstraint {
  /** unique or primary key constraint */
  PurchaseOrderLoansPkey = 'purchase_order_loans_pkey'
}

/** input type for incrementing integer column in table "purchase_order_loans" */
export type PurchaseOrderLoansIncInput = {
  amount?: Maybe<Scalars['numeric']>;
  amount_owed?: Maybe<Scalars['numeric']>;
  outstanding_principal_balance?: Maybe<Scalars['numeric']>;
};

/** input type for inserting data into table "purchase_order_loans" */
export type PurchaseOrderLoansInsertInput = {
  adjusted_maturity_date?: Maybe<Scalars['date']>;
  amount?: Maybe<Scalars['numeric']>;
  amount_owed?: Maybe<Scalars['numeric']>;
  closed_at?: Maybe<Scalars['timestamptz']>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  maturity_date?: Maybe<Scalars['date']>;
  origination_date?: Maybe<Scalars['date']>;
  outstanding_principal_balance?: Maybe<Scalars['numeric']>;
  payments?: Maybe<PurchaseOrderLoanPaymentsArrRelInsertInput>;
  purchase_order?: Maybe<PurchaseOrdersObjRelInsertInput>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  requested_by_user?: Maybe<UsersObjRelInsertInput>;
  requested_by_user_id?: Maybe<Scalars['uuid']>;
  status?: Maybe<RequestStatusEnum>;
};

/** aggregate max on columns */
export type PurchaseOrderLoansMaxFields = {
  adjusted_maturity_date?: Maybe<Scalars['date']>;
  amount?: Maybe<Scalars['numeric']>;
  amount_owed?: Maybe<Scalars['numeric']>;
  closed_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  maturity_date?: Maybe<Scalars['date']>;
  origination_date?: Maybe<Scalars['date']>;
  outstanding_principal_balance?: Maybe<Scalars['numeric']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  requested_by_user_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansMaxOrderBy = {
  adjusted_maturity_date?: Maybe<OrderBy>;
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  closed_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  maturity_date?: Maybe<OrderBy>;
  origination_date?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrderLoansMinFields = {
  adjusted_maturity_date?: Maybe<Scalars['date']>;
  amount?: Maybe<Scalars['numeric']>;
  amount_owed?: Maybe<Scalars['numeric']>;
  closed_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  maturity_date?: Maybe<Scalars['date']>;
  origination_date?: Maybe<Scalars['date']>;
  outstanding_principal_balance?: Maybe<Scalars['numeric']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  requested_by_user_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansMinOrderBy = {
  adjusted_maturity_date?: Maybe<OrderBy>;
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  closed_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  maturity_date?: Maybe<OrderBy>;
  origination_date?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "purchase_order_loans" */
export type PurchaseOrderLoansMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<PurchaseOrderLoans>;
};

/** input type for inserting object relation for remote table "purchase_order_loans" */
export type PurchaseOrderLoansObjRelInsertInput = {
  data: PurchaseOrderLoansInsertInput;
  on_conflict?: Maybe<PurchaseOrderLoansOnConflict>;
};

/** on conflict condition type for table "purchase_order_loans" */
export type PurchaseOrderLoansOnConflict = {
  constraint: PurchaseOrderLoansConstraint;
  update_columns: Array<PurchaseOrderLoansUpdateColumn>;
  where?: Maybe<PurchaseOrderLoansBoolExp>;
};

/** ordering options when selecting data from "purchase_order_loans" */
export type PurchaseOrderLoansOrderBy = {
  adjusted_maturity_date?: Maybe<OrderBy>;
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  closed_at?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  maturity_date?: Maybe<OrderBy>;
  origination_date?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
  payments_aggregate?: Maybe<PurchaseOrderLoanPaymentsAggregateOrderBy>;
  purchase_order?: Maybe<PurchaseOrdersOrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user?: Maybe<UsersOrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  status?: Maybe<OrderBy>;
};

/** primary key columns input for table: "purchase_order_loans" */
export type PurchaseOrderLoansPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "purchase_order_loans" */
export enum PurchaseOrderLoansSelectColumn {
  /** column name */
  AdjustedMaturityDate = 'adjusted_maturity_date',
  /** column name */
  Amount = 'amount',
  /** column name */
  AmountOwed = 'amount_owed',
  /** column name */
  ClosedAt = 'closed_at',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  MaturityDate = 'maturity_date',
  /** column name */
  OriginationDate = 'origination_date',
  /** column name */
  OutstandingPrincipalBalance = 'outstanding_principal_balance',
  /** column name */
  PurchaseOrderId = 'purchase_order_id',
  /** column name */
  RequestedAt = 'requested_at',
  /** column name */
  RequestedByUserId = 'requested_by_user_id',
  /** column name */
  Status = 'status'
}

/** input type for updating data in table "purchase_order_loans" */
export type PurchaseOrderLoansSetInput = {
  adjusted_maturity_date?: Maybe<Scalars['date']>;
  amount?: Maybe<Scalars['numeric']>;
  amount_owed?: Maybe<Scalars['numeric']>;
  closed_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  maturity_date?: Maybe<Scalars['date']>;
  origination_date?: Maybe<Scalars['date']>;
  outstanding_principal_balance?: Maybe<Scalars['numeric']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  requested_by_user_id?: Maybe<Scalars['uuid']>;
  status?: Maybe<RequestStatusEnum>;
};

/** aggregate stddev on columns */
export type PurchaseOrderLoansStddevFields = {
  amount?: Maybe<Scalars['Float']>;
  amount_owed?: Maybe<Scalars['Float']>;
  outstanding_principal_balance?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansStddevOrderBy = {
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type PurchaseOrderLoansStddevPopFields = {
  amount?: Maybe<Scalars['Float']>;
  amount_owed?: Maybe<Scalars['Float']>;
  outstanding_principal_balance?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansStddevPopOrderBy = {
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type PurchaseOrderLoansStddevSampFields = {
  amount?: Maybe<Scalars['Float']>;
  amount_owed?: Maybe<Scalars['Float']>;
  outstanding_principal_balance?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansStddevSampOrderBy = {
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type PurchaseOrderLoansSumFields = {
  amount?: Maybe<Scalars['numeric']>;
  amount_owed?: Maybe<Scalars['numeric']>;
  outstanding_principal_balance?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansSumOrderBy = {
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** update columns of table "purchase_order_loans" */
export enum PurchaseOrderLoansUpdateColumn {
  /** column name */
  AdjustedMaturityDate = 'adjusted_maturity_date',
  /** column name */
  Amount = 'amount',
  /** column name */
  AmountOwed = 'amount_owed',
  /** column name */
  ClosedAt = 'closed_at',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  MaturityDate = 'maturity_date',
  /** column name */
  OriginationDate = 'origination_date',
  /** column name */
  OutstandingPrincipalBalance = 'outstanding_principal_balance',
  /** column name */
  PurchaseOrderId = 'purchase_order_id',
  /** column name */
  RequestedAt = 'requested_at',
  /** column name */
  RequestedByUserId = 'requested_by_user_id',
  /** column name */
  Status = 'status'
}

/** aggregate var_pop on columns */
export type PurchaseOrderLoansVarPopFields = {
  amount?: Maybe<Scalars['Float']>;
  amount_owed?: Maybe<Scalars['Float']>;
  outstanding_principal_balance?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansVarPopOrderBy = {
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type PurchaseOrderLoansVarSampFields = {
  amount?: Maybe<Scalars['Float']>;
  amount_owed?: Maybe<Scalars['Float']>;
  outstanding_principal_balance?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansVarSampOrderBy = {
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type PurchaseOrderLoansVarianceFields = {
  amount?: Maybe<Scalars['Float']>;
  amount_owed?: Maybe<Scalars['Float']>;
  outstanding_principal_balance?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "purchase_order_loans" */
export type PurchaseOrderLoansVarianceOrderBy = {
  amount?: Maybe<OrderBy>;
  amount_owed?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** columns and relationships of "purchase_orders" */
export type PurchaseOrders = {
  amount?: Maybe<Scalars['numeric']>;
  approved_at?: Maybe<Scalars['timestamptz']>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars['uuid'];
  created_at: Scalars['timestamptz'];
  delivery_date?: Maybe<Scalars['date']>;
  id: Scalars['uuid'];
  is_cannabis?: Maybe<Scalars['Boolean']>;
  /** An array relationship */
  loans: Array<PurchaseOrderLoans>;
  /** An aggregated array relationship */
  loans_aggregate: PurchaseOrderLoansAggregate;
  order_date?: Maybe<Scalars['date']>;
  order_number: Scalars['String'];
  /** An array relationship */
  purchase_order_files: Array<PurchaseOrderFiles>;
  /** An aggregated array relationship */
  purchase_order_files_aggregate: PurchaseOrderFilesAggregate;
  rejected_at?: Maybe<Scalars['timestamptz']>;
  rejection_note?: Maybe<Scalars['String']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  status: RequestStatusEnum;
  updated_at: Scalars['timestamptz'];
  /** An object relationship */
  vendor?: Maybe<Vendors>;
  vendor_id: Scalars['uuid'];
};


/** columns and relationships of "purchase_orders" */
export type PurchaseOrdersLoansArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoansOrderBy>>;
  where?: Maybe<PurchaseOrderLoansBoolExp>;
};


/** columns and relationships of "purchase_orders" */
export type PurchaseOrdersLoansAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoansOrderBy>>;
  where?: Maybe<PurchaseOrderLoansBoolExp>;
};


/** columns and relationships of "purchase_orders" */
export type PurchaseOrdersPurchaseOrderFilesArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};


/** columns and relationships of "purchase_orders" */
export type PurchaseOrdersPurchaseOrderFilesAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};

/** aggregated selection of "purchase_orders" */
export type PurchaseOrdersAggregate = {
  aggregate?: Maybe<PurchaseOrdersAggregateFields>;
  nodes: Array<PurchaseOrders>;
};

/** aggregate fields of "purchase_orders" */
export type PurchaseOrdersAggregateFields = {
  avg?: Maybe<PurchaseOrdersAvgFields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<PurchaseOrdersMaxFields>;
  min?: Maybe<PurchaseOrdersMinFields>;
  stddev?: Maybe<PurchaseOrdersStddevFields>;
  stddev_pop?: Maybe<PurchaseOrdersStddevPopFields>;
  stddev_samp?: Maybe<PurchaseOrdersStddevSampFields>;
  sum?: Maybe<PurchaseOrdersSumFields>;
  var_pop?: Maybe<PurchaseOrdersVarPopFields>;
  var_samp?: Maybe<PurchaseOrdersVarSampFields>;
  variance?: Maybe<PurchaseOrdersVarianceFields>;
};


/** aggregate fields of "purchase_orders" */
export type PurchaseOrdersAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "purchase_orders" */
export type PurchaseOrdersAggregateOrderBy = {
  avg?: Maybe<PurchaseOrdersAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<PurchaseOrdersMaxOrderBy>;
  min?: Maybe<PurchaseOrdersMinOrderBy>;
  stddev?: Maybe<PurchaseOrdersStddevOrderBy>;
  stddev_pop?: Maybe<PurchaseOrdersStddevPopOrderBy>;
  stddev_samp?: Maybe<PurchaseOrdersStddevSampOrderBy>;
  sum?: Maybe<PurchaseOrdersSumOrderBy>;
  var_pop?: Maybe<PurchaseOrdersVarPopOrderBy>;
  var_samp?: Maybe<PurchaseOrdersVarSampOrderBy>;
  variance?: Maybe<PurchaseOrdersVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "purchase_orders" */
export type PurchaseOrdersArrRelInsertInput = {
  data: Array<PurchaseOrdersInsertInput>;
  on_conflict?: Maybe<PurchaseOrdersOnConflict>;
};

/** aggregate avg on columns */
export type PurchaseOrdersAvgFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "purchase_orders" */
export type PurchaseOrdersAvgOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "purchase_orders". All fields are combined with a logical 'AND'. */
export type PurchaseOrdersBoolExp = {
  _and?: Maybe<Array<Maybe<PurchaseOrdersBoolExp>>>;
  _not?: Maybe<PurchaseOrdersBoolExp>;
  _or?: Maybe<Array<Maybe<PurchaseOrdersBoolExp>>>;
  amount?: Maybe<NumericComparisonExp>;
  approved_at?: Maybe<TimestamptzComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  delivery_date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  is_cannabis?: Maybe<BooleanComparisonExp>;
  loans?: Maybe<PurchaseOrderLoansBoolExp>;
  order_date?: Maybe<DateComparisonExp>;
  order_number?: Maybe<StringComparisonExp>;
  purchase_order_files?: Maybe<PurchaseOrderFilesBoolExp>;
  rejected_at?: Maybe<TimestamptzComparisonExp>;
  rejection_note?: Maybe<StringComparisonExp>;
  requested_at?: Maybe<TimestamptzComparisonExp>;
  status?: Maybe<RequestStatusEnumComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  vendor?: Maybe<VendorsBoolExp>;
  vendor_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "purchase_orders" */
export enum PurchaseOrdersConstraint {
  /** unique or primary key constraint */
  PurchaseOrdersPkey = 'purchase_orders_pkey'
}

/** input type for incrementing integer column in table "purchase_orders" */
export type PurchaseOrdersIncInput = {
  amount?: Maybe<Scalars['numeric']>;
};

/** input type for inserting data into table "purchase_orders" */
export type PurchaseOrdersInsertInput = {
  amount?: Maybe<Scalars['numeric']>;
  approved_at?: Maybe<Scalars['timestamptz']>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  delivery_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  is_cannabis?: Maybe<Scalars['Boolean']>;
  loans?: Maybe<PurchaseOrderLoansArrRelInsertInput>;
  order_date?: Maybe<Scalars['date']>;
  order_number?: Maybe<Scalars['String']>;
  purchase_order_files?: Maybe<PurchaseOrderFilesArrRelInsertInput>;
  rejected_at?: Maybe<Scalars['timestamptz']>;
  rejection_note?: Maybe<Scalars['String']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  status?: Maybe<RequestStatusEnum>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor?: Maybe<VendorsObjRelInsertInput>;
  vendor_id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type PurchaseOrdersMaxFields = {
  amount?: Maybe<Scalars['numeric']>;
  approved_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  delivery_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  order_date?: Maybe<Scalars['date']>;
  order_number?: Maybe<Scalars['String']>;
  rejected_at?: Maybe<Scalars['timestamptz']>;
  rejection_note?: Maybe<Scalars['String']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "purchase_orders" */
export type PurchaseOrdersMaxOrderBy = {
  amount?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  order_date?: Maybe<OrderBy>;
  order_number?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrdersMinFields = {
  amount?: Maybe<Scalars['numeric']>;
  approved_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  delivery_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  order_date?: Maybe<Scalars['date']>;
  order_number?: Maybe<Scalars['String']>;
  rejected_at?: Maybe<Scalars['timestamptz']>;
  rejection_note?: Maybe<Scalars['String']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "purchase_orders" */
export type PurchaseOrdersMinOrderBy = {
  amount?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  order_date?: Maybe<OrderBy>;
  order_number?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "purchase_orders" */
export type PurchaseOrdersMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<PurchaseOrders>;
};

/** input type for inserting object relation for remote table "purchase_orders" */
export type PurchaseOrdersObjRelInsertInput = {
  data: PurchaseOrdersInsertInput;
  on_conflict?: Maybe<PurchaseOrdersOnConflict>;
};

/** on conflict condition type for table "purchase_orders" */
export type PurchaseOrdersOnConflict = {
  constraint: PurchaseOrdersConstraint;
  update_columns: Array<PurchaseOrdersUpdateColumn>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** ordering options when selecting data from "purchase_orders" */
export type PurchaseOrdersOrderBy = {
  amount?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  is_cannabis?: Maybe<OrderBy>;
  loans_aggregate?: Maybe<PurchaseOrderLoansAggregateOrderBy>;
  order_date?: Maybe<OrderBy>;
  order_number?: Maybe<OrderBy>;
  purchase_order_files_aggregate?: Maybe<PurchaseOrderFilesAggregateOrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  status?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor?: Maybe<VendorsOrderBy>;
  vendor_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "purchase_orders" */
export type PurchaseOrdersPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "purchase_orders" */
export enum PurchaseOrdersSelectColumn {
  /** column name */
  Amount = 'amount',
  /** column name */
  ApprovedAt = 'approved_at',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeliveryDate = 'delivery_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsCannabis = 'is_cannabis',
  /** column name */
  OrderDate = 'order_date',
  /** column name */
  OrderNumber = 'order_number',
  /** column name */
  RejectedAt = 'rejected_at',
  /** column name */
  RejectionNote = 'rejection_note',
  /** column name */
  RequestedAt = 'requested_at',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VendorId = 'vendor_id'
}

/** input type for updating data in table "purchase_orders" */
export type PurchaseOrdersSetInput = {
  amount?: Maybe<Scalars['numeric']>;
  approved_at?: Maybe<Scalars['timestamptz']>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  delivery_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  is_cannabis?: Maybe<Scalars['Boolean']>;
  order_date?: Maybe<Scalars['date']>;
  order_number?: Maybe<Scalars['String']>;
  rejected_at?: Maybe<Scalars['timestamptz']>;
  rejection_note?: Maybe<Scalars['String']>;
  requested_at?: Maybe<Scalars['timestamptz']>;
  status?: Maybe<RequestStatusEnum>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_id?: Maybe<Scalars['uuid']>;
};

/** aggregate stddev on columns */
export type PurchaseOrdersStddevFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "purchase_orders" */
export type PurchaseOrdersStddevOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type PurchaseOrdersStddevPopFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "purchase_orders" */
export type PurchaseOrdersStddevPopOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type PurchaseOrdersStddevSampFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "purchase_orders" */
export type PurchaseOrdersStddevSampOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type PurchaseOrdersSumFields = {
  amount?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "purchase_orders" */
export type PurchaseOrdersSumOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** update columns of table "purchase_orders" */
export enum PurchaseOrdersUpdateColumn {
  /** column name */
  Amount = 'amount',
  /** column name */
  ApprovedAt = 'approved_at',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeliveryDate = 'delivery_date',
  /** column name */
  Id = 'id',
  /** column name */
  IsCannabis = 'is_cannabis',
  /** column name */
  OrderDate = 'order_date',
  /** column name */
  OrderNumber = 'order_number',
  /** column name */
  RejectedAt = 'rejected_at',
  /** column name */
  RejectionNote = 'rejection_note',
  /** column name */
  RequestedAt = 'requested_at',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VendorId = 'vendor_id'
}

/** aggregate var_pop on columns */
export type PurchaseOrdersVarPopFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "purchase_orders" */
export type PurchaseOrdersVarPopOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type PurchaseOrdersVarSampFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "purchase_orders" */
export type PurchaseOrdersVarSampOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type PurchaseOrdersVarianceFields = {
  amount?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "purchase_orders" */
export type PurchaseOrdersVarianceOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** query root */
export type QueryRoot = {
  /** fetch data from the table: "bank_accounts" */
  bank_accounts: Array<BankAccounts>;
  /** fetch aggregated fields from the table: "bank_accounts" */
  bank_accounts_aggregate: BankAccountsAggregate;
  /** fetch data from the table: "bank_accounts" using primary key columns */
  bank_accounts_by_pk?: Maybe<BankAccounts>;
  /** fetch data from the table: "companies" */
  companies: Array<Companies>;
  /** fetch aggregated fields from the table: "companies" */
  companies_aggregate: CompaniesAggregate;
  /** fetch data from the table: "companies" using primary key columns */
  companies_by_pk?: Maybe<Companies>;
  /** fetch data from the table: "company_agreements" */
  company_agreements: Array<CompanyAgreements>;
  /** fetch aggregated fields from the table: "company_agreements" */
  company_agreements_aggregate: CompanyAgreementsAggregate;
  /** fetch data from the table: "company_agreements" using primary key columns */
  company_agreements_by_pk?: Maybe<CompanyAgreements>;
  /** fetch data from the table: "company_licenses" */
  company_licenses: Array<CompanyLicenses>;
  /** fetch aggregated fields from the table: "company_licenses" */
  company_licenses_aggregate: CompanyLicensesAggregate;
  /** fetch data from the table: "company_licenses" using primary key columns */
  company_licenses_by_pk?: Maybe<CompanyLicenses>;
  /** fetch data from the table: "company_settings" */
  company_settings: Array<CompanySettings>;
  /** fetch aggregated fields from the table: "company_settings" */
  company_settings_aggregate: CompanySettingsAggregate;
  /** fetch data from the table: "company_settings" using primary key columns */
  company_settings_by_pk?: Maybe<CompanySettings>;
  /** fetch data from the table: "company_vendor_partnerships" */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** fetch aggregated fields from the table: "company_vendor_partnerships" */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  /** fetch data from the table: "company_vendor_partnerships" using primary key columns */
  company_vendor_partnerships_by_pk?: Maybe<CompanyVendorPartnerships>;
  /** fetch data from the table: "files" */
  files: Array<Files>;
  /** fetch aggregated fields from the table: "files" */
  files_aggregate: FilesAggregate;
  /** fetch data from the table: "files" using primary key columns */
  files_by_pk?: Maybe<Files>;
  /** fetch data from the table: "payments" */
  payments: Array<Payments>;
  /** fetch aggregated fields from the table: "payments" */
  payments_aggregate: PaymentsAggregate;
  /** fetch data from the table: "payments" using primary key columns */
  payments_by_pk?: Maybe<Payments>;
  /** fetch data from the table: "product_type" */
  product_type: Array<ProductType>;
  /** fetch aggregated fields from the table: "product_type" */
  product_type_aggregate: ProductTypeAggregate;
  /** fetch data from the table: "product_type" using primary key columns */
  product_type_by_pk?: Maybe<ProductType>;
  /** fetch data from the table: "purchase_order_file_type" */
  purchase_order_file_type: Array<PurchaseOrderFileType>;
  /** fetch aggregated fields from the table: "purchase_order_file_type" */
  purchase_order_file_type_aggregate: PurchaseOrderFileTypeAggregate;
  /** fetch data from the table: "purchase_order_file_type" using primary key columns */
  purchase_order_file_type_by_pk?: Maybe<PurchaseOrderFileType>;
  /** fetch data from the table: "purchase_order_files" */
  purchase_order_files: Array<PurchaseOrderFiles>;
  /** fetch aggregated fields from the table: "purchase_order_files" */
  purchase_order_files_aggregate: PurchaseOrderFilesAggregate;
  /** fetch data from the table: "purchase_order_files" using primary key columns */
  purchase_order_files_by_pk?: Maybe<PurchaseOrderFiles>;
  /** fetch data from the table: "purchase_order_loan_payments" */
  purchase_order_loan_payments: Array<PurchaseOrderLoanPayments>;
  /** fetch aggregated fields from the table: "purchase_order_loan_payments" */
  purchase_order_loan_payments_aggregate: PurchaseOrderLoanPaymentsAggregate;
  /** fetch data from the table: "purchase_order_loan_payments" using primary key columns */
  purchase_order_loan_payments_by_pk?: Maybe<PurchaseOrderLoanPayments>;
  /** fetch data from the table: "purchase_order_loans" */
  purchase_order_loans: Array<PurchaseOrderLoans>;
  /** fetch aggregated fields from the table: "purchase_order_loans" */
  purchase_order_loans_aggregate: PurchaseOrderLoansAggregate;
  /** fetch data from the table: "purchase_order_loans" using primary key columns */
  purchase_order_loans_by_pk?: Maybe<PurchaseOrderLoans>;
  /** fetch data from the table: "purchase_orders" */
  purchase_orders: Array<PurchaseOrders>;
  /** fetch aggregated fields from the table: "purchase_orders" */
  purchase_orders_aggregate: PurchaseOrdersAggregate;
  /** fetch data from the table: "purchase_orders" using primary key columns */
  purchase_orders_by_pk?: Maybe<PurchaseOrders>;
  /** fetch data from the table: "request_status" */
  request_status: Array<RequestStatus>;
  /** fetch aggregated fields from the table: "request_status" */
  request_status_aggregate: RequestStatusAggregate;
  /** fetch data from the table: "request_status" using primary key columns */
  request_status_by_pk?: Maybe<RequestStatus>;
  /** fetch data from the table: "revoked_tokens" */
  revoked_tokens: Array<RevokedTokens>;
  /** fetch aggregated fields from the table: "revoked_tokens" */
  revoked_tokens_aggregate: RevokedTokensAggregate;
  /** fetch data from the table: "revoked_tokens" using primary key columns */
  revoked_tokens_by_pk?: Maybe<RevokedTokens>;
  /** fetch data from the table: "two_factor_links" */
  two_factor_links: Array<TwoFactorLinks>;
  /** fetch aggregated fields from the table: "two_factor_links" */
  two_factor_links_aggregate: TwoFactorLinksAggregate;
  /** fetch data from the table: "two_factor_links" using primary key columns */
  two_factor_links_by_pk?: Maybe<TwoFactorLinks>;
  /** fetch data from the table: "user_roles" */
  user_roles: Array<UserRoles>;
  /** fetch aggregated fields from the table: "user_roles" */
  user_roles_aggregate: UserRolesAggregate;
  /** fetch data from the table: "user_roles" using primary key columns */
  user_roles_by_pk?: Maybe<UserRoles>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: UsersAggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table: "vendors" */
  vendors: Array<Vendors>;
  /** fetch aggregated fields from the table: "vendors" */
  vendors_aggregate: VendorsAggregate;
};


/** query root */
export type QueryRootBankAccountsArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};


/** query root */
export type QueryRootBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};


/** query root */
export type QueryRootBankAccountsByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootCompaniesArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};


/** query root */
export type QueryRootCompaniesAggregateArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};


/** query root */
export type QueryRootCompaniesByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootCompanyAgreementsArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};


/** query root */
export type QueryRootCompanyAgreementsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};


/** query root */
export type QueryRootCompanyAgreementsByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootCompanyLicensesArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};


/** query root */
export type QueryRootCompanyLicensesAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};


/** query root */
export type QueryRootCompanyLicensesByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootCompanySettingsArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};


/** query root */
export type QueryRootCompanySettingsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};


/** query root */
export type QueryRootCompanySettingsByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** query root */
export type QueryRootCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** query root */
export type QueryRootCompanyVendorPartnershipsByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootFilesArgs = {
  distinct_on?: Maybe<Array<FilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<FilesOrderBy>>;
  where?: Maybe<FilesBoolExp>;
};


/** query root */
export type QueryRootFilesAggregateArgs = {
  distinct_on?: Maybe<Array<FilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<FilesOrderBy>>;
  where?: Maybe<FilesBoolExp>;
};


/** query root */
export type QueryRootFilesByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootPaymentsArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};


/** query root */
export type QueryRootPaymentsAggregateArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};


/** query root */
export type QueryRootPaymentsByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootProductTypeArgs = {
  distinct_on?: Maybe<Array<ProductTypeSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<ProductTypeOrderBy>>;
  where?: Maybe<ProductTypeBoolExp>;
};


/** query root */
export type QueryRootProductTypeAggregateArgs = {
  distinct_on?: Maybe<Array<ProductTypeSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<ProductTypeOrderBy>>;
  where?: Maybe<ProductTypeBoolExp>;
};


/** query root */
export type QueryRootProductTypeByPkArgs = {
  value: Scalars['String'];
};


/** query root */
export type QueryRootPurchaseOrderFileTypeArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFileTypeOrderBy>>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderFileTypeAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFileTypeOrderBy>>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderFileTypeByPkArgs = {
  value: Scalars['String'];
};


/** query root */
export type QueryRootPurchaseOrderFilesArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderFilesAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderFilesByPkArgs = {
  file_id: Scalars['uuid'];
  purchase_order_id: Scalars['uuid'];
};


/** query root */
export type QueryRootPurchaseOrderLoanPaymentsArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoanPaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoanPaymentsOrderBy>>;
  where?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderLoanPaymentsAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoanPaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoanPaymentsOrderBy>>;
  where?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderLoanPaymentsByPkArgs = {
  payment_id: Scalars['uuid'];
  purchase_order_loan_id: Scalars['uuid'];
};


/** query root */
export type QueryRootPurchaseOrderLoansArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoansOrderBy>>;
  where?: Maybe<PurchaseOrderLoansBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderLoansAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoansOrderBy>>;
  where?: Maybe<PurchaseOrderLoansBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderLoansByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootPurchaseOrdersArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrdersAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrdersByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootRequestStatusArgs = {
  distinct_on?: Maybe<Array<RequestStatusSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<RequestStatusOrderBy>>;
  where?: Maybe<RequestStatusBoolExp>;
};


/** query root */
export type QueryRootRequestStatusAggregateArgs = {
  distinct_on?: Maybe<Array<RequestStatusSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<RequestStatusOrderBy>>;
  where?: Maybe<RequestStatusBoolExp>;
};


/** query root */
export type QueryRootRequestStatusByPkArgs = {
  value: Scalars['String'];
};


/** query root */
export type QueryRootRevokedTokensArgs = {
  distinct_on?: Maybe<Array<RevokedTokensSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<RevokedTokensOrderBy>>;
  where?: Maybe<RevokedTokensBoolExp>;
};


/** query root */
export type QueryRootRevokedTokensAggregateArgs = {
  distinct_on?: Maybe<Array<RevokedTokensSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<RevokedTokensOrderBy>>;
  where?: Maybe<RevokedTokensBoolExp>;
};


/** query root */
export type QueryRootRevokedTokensByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootTwoFactorLinksArgs = {
  distinct_on?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<TwoFactorLinksOrderBy>>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};


/** query root */
export type QueryRootTwoFactorLinksAggregateArgs = {
  distinct_on?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<TwoFactorLinksOrderBy>>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};


/** query root */
export type QueryRootTwoFactorLinksByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootUserRolesArgs = {
  distinct_on?: Maybe<Array<UserRolesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UserRolesOrderBy>>;
  where?: Maybe<UserRolesBoolExp>;
};


/** query root */
export type QueryRootUserRolesAggregateArgs = {
  distinct_on?: Maybe<Array<UserRolesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UserRolesOrderBy>>;
  where?: Maybe<UserRolesBoolExp>;
};


/** query root */
export type QueryRootUserRolesByPkArgs = {
  value: Scalars['String'];
};


/** query root */
export type QueryRootUsersArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};


/** query root */
export type QueryRootUsersAggregateArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};


/** query root */
export type QueryRootUsersByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootVendorsArgs = {
  distinct_on?: Maybe<Array<VendorsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<VendorsOrderBy>>;
  where?: Maybe<VendorsBoolExp>;
};


/** query root */
export type QueryRootVendorsAggregateArgs = {
  distinct_on?: Maybe<Array<VendorsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<VendorsOrderBy>>;
  where?: Maybe<VendorsBoolExp>;
};

/** columns and relationships of "request_status" */
export type RequestStatus = {
  display_name: Scalars['String'];
  value: Scalars['String'];
};

/** aggregated selection of "request_status" */
export type RequestStatusAggregate = {
  aggregate?: Maybe<RequestStatusAggregateFields>;
  nodes: Array<RequestStatus>;
};

/** aggregate fields of "request_status" */
export type RequestStatusAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<RequestStatusMaxFields>;
  min?: Maybe<RequestStatusMinFields>;
};


/** aggregate fields of "request_status" */
export type RequestStatusAggregateFieldsCountArgs = {
  columns?: Maybe<Array<RequestStatusSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "request_status" */
export type RequestStatusAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<RequestStatusMaxOrderBy>;
  min?: Maybe<RequestStatusMinOrderBy>;
};

/** input type for inserting array relation for remote table "request_status" */
export type RequestStatusArrRelInsertInput = {
  data: Array<RequestStatusInsertInput>;
  on_conflict?: Maybe<RequestStatusOnConflict>;
};

/** Boolean expression to filter rows from the table "request_status". All fields are combined with a logical 'AND'. */
export type RequestStatusBoolExp = {
  _and?: Maybe<Array<Maybe<RequestStatusBoolExp>>>;
  _not?: Maybe<RequestStatusBoolExp>;
  _or?: Maybe<Array<Maybe<RequestStatusBoolExp>>>;
  display_name?: Maybe<StringComparisonExp>;
  value?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "request_status" */
export enum RequestStatusConstraint {
  /** unique or primary key constraint */
  VendorRequestStatusPkey = 'vendor_request_status_pkey'
}

export enum RequestStatusEnum {
  /** Pending */
  ApprovalRequested = 'approval_requested',
  /** Approved */
  Approved = 'approved',
  /** Draft */
  Drafted = 'drafted',
  /** Rejected */
  Rejected = 'rejected'
}

/** expression to compare columns of type request_status_enum. All fields are combined with logical 'AND'. */
export type RequestStatusEnumComparisonExp = {
  _eq?: Maybe<RequestStatusEnum>;
  _in?: Maybe<Array<RequestStatusEnum>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _neq?: Maybe<RequestStatusEnum>;
  _nin?: Maybe<Array<RequestStatusEnum>>;
};

/** input type for inserting data into table "request_status" */
export type RequestStatusInsertInput = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type RequestStatusMaxFields = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "request_status" */
export type RequestStatusMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type RequestStatusMinFields = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "request_status" */
export type RequestStatusMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "request_status" */
export type RequestStatusMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<RequestStatus>;
};

/** input type for inserting object relation for remote table "request_status" */
export type RequestStatusObjRelInsertInput = {
  data: RequestStatusInsertInput;
  on_conflict?: Maybe<RequestStatusOnConflict>;
};

/** on conflict condition type for table "request_status" */
export type RequestStatusOnConflict = {
  constraint: RequestStatusConstraint;
  update_columns: Array<RequestStatusUpdateColumn>;
  where?: Maybe<RequestStatusBoolExp>;
};

/** ordering options when selecting data from "request_status" */
export type RequestStatusOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** primary key columns input for table: "request_status" */
export type RequestStatusPkColumnsInput = {
  value: Scalars['String'];
};

/** select columns of table "request_status" */
export enum RequestStatusSelectColumn {
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "request_status" */
export type RequestStatusSetInput = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** update columns of table "request_status" */
export enum RequestStatusUpdateColumn {
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Value = 'value'
}

/** columns and relationships of "revoked_tokens" */
export type RevokedTokens = {
  created_at: Scalars['timestamptz'];
  id: Scalars['uuid'];
  jti: Scalars['String'];
  user_id: Scalars['uuid'];
};

/** aggregated selection of "revoked_tokens" */
export type RevokedTokensAggregate = {
  aggregate?: Maybe<RevokedTokensAggregateFields>;
  nodes: Array<RevokedTokens>;
};

/** aggregate fields of "revoked_tokens" */
export type RevokedTokensAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<RevokedTokensMaxFields>;
  min?: Maybe<RevokedTokensMinFields>;
};


/** aggregate fields of "revoked_tokens" */
export type RevokedTokensAggregateFieldsCountArgs = {
  columns?: Maybe<Array<RevokedTokensSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "revoked_tokens" */
export type RevokedTokensAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<RevokedTokensMaxOrderBy>;
  min?: Maybe<RevokedTokensMinOrderBy>;
};

/** input type for inserting array relation for remote table "revoked_tokens" */
export type RevokedTokensArrRelInsertInput = {
  data: Array<RevokedTokensInsertInput>;
  on_conflict?: Maybe<RevokedTokensOnConflict>;
};

/** Boolean expression to filter rows from the table "revoked_tokens". All fields are combined with a logical 'AND'. */
export type RevokedTokensBoolExp = {
  _and?: Maybe<Array<Maybe<RevokedTokensBoolExp>>>;
  _not?: Maybe<RevokedTokensBoolExp>;
  _or?: Maybe<Array<Maybe<RevokedTokensBoolExp>>>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  jti?: Maybe<StringComparisonExp>;
  user_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "revoked_tokens" */
export enum RevokedTokensConstraint {
  /** unique or primary key constraint */
  RevokedTokensPkey = 'revoked_tokens_pkey'
}

/** input type for inserting data into table "revoked_tokens" */
export type RevokedTokensInsertInput = {
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  jti?: Maybe<Scalars['String']>;
  user_id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type RevokedTokensMaxFields = {
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  jti?: Maybe<Scalars['String']>;
  user_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "revoked_tokens" */
export type RevokedTokensMaxOrderBy = {
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  jti?: Maybe<OrderBy>;
  user_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type RevokedTokensMinFields = {
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  jti?: Maybe<Scalars['String']>;
  user_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "revoked_tokens" */
export type RevokedTokensMinOrderBy = {
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  jti?: Maybe<OrderBy>;
  user_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "revoked_tokens" */
export type RevokedTokensMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<RevokedTokens>;
};

/** input type for inserting object relation for remote table "revoked_tokens" */
export type RevokedTokensObjRelInsertInput = {
  data: RevokedTokensInsertInput;
  on_conflict?: Maybe<RevokedTokensOnConflict>;
};

/** on conflict condition type for table "revoked_tokens" */
export type RevokedTokensOnConflict = {
  constraint: RevokedTokensConstraint;
  update_columns: Array<RevokedTokensUpdateColumn>;
  where?: Maybe<RevokedTokensBoolExp>;
};

/** ordering options when selecting data from "revoked_tokens" */
export type RevokedTokensOrderBy = {
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  jti?: Maybe<OrderBy>;
  user_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "revoked_tokens" */
export type RevokedTokensPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "revoked_tokens" */
export enum RevokedTokensSelectColumn {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Jti = 'jti',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "revoked_tokens" */
export type RevokedTokensSetInput = {
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  jti?: Maybe<Scalars['String']>;
  user_id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "revoked_tokens" */
export enum RevokedTokensUpdateColumn {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Jti = 'jti',
  /** column name */
  UserId = 'user_id'
}

/** subscription root */
export type SubscriptionRoot = {
  /** fetch data from the table: "bank_accounts" */
  bank_accounts: Array<BankAccounts>;
  /** fetch aggregated fields from the table: "bank_accounts" */
  bank_accounts_aggregate: BankAccountsAggregate;
  /** fetch data from the table: "bank_accounts" using primary key columns */
  bank_accounts_by_pk?: Maybe<BankAccounts>;
  /** fetch data from the table: "companies" */
  companies: Array<Companies>;
  /** fetch aggregated fields from the table: "companies" */
  companies_aggregate: CompaniesAggregate;
  /** fetch data from the table: "companies" using primary key columns */
  companies_by_pk?: Maybe<Companies>;
  /** fetch data from the table: "company_agreements" */
  company_agreements: Array<CompanyAgreements>;
  /** fetch aggregated fields from the table: "company_agreements" */
  company_agreements_aggregate: CompanyAgreementsAggregate;
  /** fetch data from the table: "company_agreements" using primary key columns */
  company_agreements_by_pk?: Maybe<CompanyAgreements>;
  /** fetch data from the table: "company_licenses" */
  company_licenses: Array<CompanyLicenses>;
  /** fetch aggregated fields from the table: "company_licenses" */
  company_licenses_aggregate: CompanyLicensesAggregate;
  /** fetch data from the table: "company_licenses" using primary key columns */
  company_licenses_by_pk?: Maybe<CompanyLicenses>;
  /** fetch data from the table: "company_settings" */
  company_settings: Array<CompanySettings>;
  /** fetch aggregated fields from the table: "company_settings" */
  company_settings_aggregate: CompanySettingsAggregate;
  /** fetch data from the table: "company_settings" using primary key columns */
  company_settings_by_pk?: Maybe<CompanySettings>;
  /** fetch data from the table: "company_vendor_partnerships" */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** fetch aggregated fields from the table: "company_vendor_partnerships" */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  /** fetch data from the table: "company_vendor_partnerships" using primary key columns */
  company_vendor_partnerships_by_pk?: Maybe<CompanyVendorPartnerships>;
  /** fetch data from the table: "files" */
  files: Array<Files>;
  /** fetch aggregated fields from the table: "files" */
  files_aggregate: FilesAggregate;
  /** fetch data from the table: "files" using primary key columns */
  files_by_pk?: Maybe<Files>;
  /** fetch data from the table: "payments" */
  payments: Array<Payments>;
  /** fetch aggregated fields from the table: "payments" */
  payments_aggregate: PaymentsAggregate;
  /** fetch data from the table: "payments" using primary key columns */
  payments_by_pk?: Maybe<Payments>;
  /** fetch data from the table: "product_type" */
  product_type: Array<ProductType>;
  /** fetch aggregated fields from the table: "product_type" */
  product_type_aggregate: ProductTypeAggregate;
  /** fetch data from the table: "product_type" using primary key columns */
  product_type_by_pk?: Maybe<ProductType>;
  /** fetch data from the table: "purchase_order_file_type" */
  purchase_order_file_type: Array<PurchaseOrderFileType>;
  /** fetch aggregated fields from the table: "purchase_order_file_type" */
  purchase_order_file_type_aggregate: PurchaseOrderFileTypeAggregate;
  /** fetch data from the table: "purchase_order_file_type" using primary key columns */
  purchase_order_file_type_by_pk?: Maybe<PurchaseOrderFileType>;
  /** fetch data from the table: "purchase_order_files" */
  purchase_order_files: Array<PurchaseOrderFiles>;
  /** fetch aggregated fields from the table: "purchase_order_files" */
  purchase_order_files_aggregate: PurchaseOrderFilesAggregate;
  /** fetch data from the table: "purchase_order_files" using primary key columns */
  purchase_order_files_by_pk?: Maybe<PurchaseOrderFiles>;
  /** fetch data from the table: "purchase_order_loan_payments" */
  purchase_order_loan_payments: Array<PurchaseOrderLoanPayments>;
  /** fetch aggregated fields from the table: "purchase_order_loan_payments" */
  purchase_order_loan_payments_aggregate: PurchaseOrderLoanPaymentsAggregate;
  /** fetch data from the table: "purchase_order_loan_payments" using primary key columns */
  purchase_order_loan_payments_by_pk?: Maybe<PurchaseOrderLoanPayments>;
  /** fetch data from the table: "purchase_order_loans" */
  purchase_order_loans: Array<PurchaseOrderLoans>;
  /** fetch aggregated fields from the table: "purchase_order_loans" */
  purchase_order_loans_aggregate: PurchaseOrderLoansAggregate;
  /** fetch data from the table: "purchase_order_loans" using primary key columns */
  purchase_order_loans_by_pk?: Maybe<PurchaseOrderLoans>;
  /** fetch data from the table: "purchase_orders" */
  purchase_orders: Array<PurchaseOrders>;
  /** fetch aggregated fields from the table: "purchase_orders" */
  purchase_orders_aggregate: PurchaseOrdersAggregate;
  /** fetch data from the table: "purchase_orders" using primary key columns */
  purchase_orders_by_pk?: Maybe<PurchaseOrders>;
  /** fetch data from the table: "request_status" */
  request_status: Array<RequestStatus>;
  /** fetch aggregated fields from the table: "request_status" */
  request_status_aggregate: RequestStatusAggregate;
  /** fetch data from the table: "request_status" using primary key columns */
  request_status_by_pk?: Maybe<RequestStatus>;
  /** fetch data from the table: "revoked_tokens" */
  revoked_tokens: Array<RevokedTokens>;
  /** fetch aggregated fields from the table: "revoked_tokens" */
  revoked_tokens_aggregate: RevokedTokensAggregate;
  /** fetch data from the table: "revoked_tokens" using primary key columns */
  revoked_tokens_by_pk?: Maybe<RevokedTokens>;
  /** fetch data from the table: "two_factor_links" */
  two_factor_links: Array<TwoFactorLinks>;
  /** fetch aggregated fields from the table: "two_factor_links" */
  two_factor_links_aggregate: TwoFactorLinksAggregate;
  /** fetch data from the table: "two_factor_links" using primary key columns */
  two_factor_links_by_pk?: Maybe<TwoFactorLinks>;
  /** fetch data from the table: "user_roles" */
  user_roles: Array<UserRoles>;
  /** fetch aggregated fields from the table: "user_roles" */
  user_roles_aggregate: UserRolesAggregate;
  /** fetch data from the table: "user_roles" using primary key columns */
  user_roles_by_pk?: Maybe<UserRoles>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: UsersAggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table: "vendors" */
  vendors: Array<Vendors>;
  /** fetch aggregated fields from the table: "vendors" */
  vendors_aggregate: VendorsAggregate;
};


/** subscription root */
export type SubscriptionRootBankAccountsArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};


/** subscription root */
export type SubscriptionRootBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};


/** subscription root */
export type SubscriptionRootBankAccountsByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootCompaniesArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompaniesAggregateArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompaniesByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootCompanyAgreementsArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanyAgreementsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanyAgreementsByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootCompanyLicensesArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanyLicensesAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanyLicensesByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootCompanySettingsArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanySettingsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanySettingsByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanyVendorPartnershipsByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootFilesArgs = {
  distinct_on?: Maybe<Array<FilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<FilesOrderBy>>;
  where?: Maybe<FilesBoolExp>;
};


/** subscription root */
export type SubscriptionRootFilesAggregateArgs = {
  distinct_on?: Maybe<Array<FilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<FilesOrderBy>>;
  where?: Maybe<FilesBoolExp>;
};


/** subscription root */
export type SubscriptionRootFilesByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootPaymentsArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};


/** subscription root */
export type SubscriptionRootPaymentsAggregateArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};


/** subscription root */
export type SubscriptionRootPaymentsByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootProductTypeArgs = {
  distinct_on?: Maybe<Array<ProductTypeSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<ProductTypeOrderBy>>;
  where?: Maybe<ProductTypeBoolExp>;
};


/** subscription root */
export type SubscriptionRootProductTypeAggregateArgs = {
  distinct_on?: Maybe<Array<ProductTypeSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<ProductTypeOrderBy>>;
  where?: Maybe<ProductTypeBoolExp>;
};


/** subscription root */
export type SubscriptionRootProductTypeByPkArgs = {
  value: Scalars['String'];
};


/** subscription root */
export type SubscriptionRootPurchaseOrderFileTypeArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFileTypeOrderBy>>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderFileTypeAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFileTypeOrderBy>>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderFileTypeByPkArgs = {
  value: Scalars['String'];
};


/** subscription root */
export type SubscriptionRootPurchaseOrderFilesArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderFilesAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderFilesByPkArgs = {
  file_id: Scalars['uuid'];
  purchase_order_id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLoanPaymentsArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoanPaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoanPaymentsOrderBy>>;
  where?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLoanPaymentsAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoanPaymentsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoanPaymentsOrderBy>>;
  where?: Maybe<PurchaseOrderLoanPaymentsBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLoanPaymentsByPkArgs = {
  payment_id: Scalars['uuid'];
  purchase_order_loan_id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLoansArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoansOrderBy>>;
  where?: Maybe<PurchaseOrderLoansBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLoansAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLoansOrderBy>>;
  where?: Maybe<PurchaseOrderLoansBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLoansByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootPurchaseOrdersArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrdersAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrdersByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootRequestStatusArgs = {
  distinct_on?: Maybe<Array<RequestStatusSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<RequestStatusOrderBy>>;
  where?: Maybe<RequestStatusBoolExp>;
};


/** subscription root */
export type SubscriptionRootRequestStatusAggregateArgs = {
  distinct_on?: Maybe<Array<RequestStatusSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<RequestStatusOrderBy>>;
  where?: Maybe<RequestStatusBoolExp>;
};


/** subscription root */
export type SubscriptionRootRequestStatusByPkArgs = {
  value: Scalars['String'];
};


/** subscription root */
export type SubscriptionRootRevokedTokensArgs = {
  distinct_on?: Maybe<Array<RevokedTokensSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<RevokedTokensOrderBy>>;
  where?: Maybe<RevokedTokensBoolExp>;
};


/** subscription root */
export type SubscriptionRootRevokedTokensAggregateArgs = {
  distinct_on?: Maybe<Array<RevokedTokensSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<RevokedTokensOrderBy>>;
  where?: Maybe<RevokedTokensBoolExp>;
};


/** subscription root */
export type SubscriptionRootRevokedTokensByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootTwoFactorLinksArgs = {
  distinct_on?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<TwoFactorLinksOrderBy>>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};


/** subscription root */
export type SubscriptionRootTwoFactorLinksAggregateArgs = {
  distinct_on?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<TwoFactorLinksOrderBy>>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};


/** subscription root */
export type SubscriptionRootTwoFactorLinksByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootUserRolesArgs = {
  distinct_on?: Maybe<Array<UserRolesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UserRolesOrderBy>>;
  where?: Maybe<UserRolesBoolExp>;
};


/** subscription root */
export type SubscriptionRootUserRolesAggregateArgs = {
  distinct_on?: Maybe<Array<UserRolesSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UserRolesOrderBy>>;
  where?: Maybe<UserRolesBoolExp>;
};


/** subscription root */
export type SubscriptionRootUserRolesByPkArgs = {
  value: Scalars['String'];
};


/** subscription root */
export type SubscriptionRootUsersArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};


/** subscription root */
export type SubscriptionRootUsersAggregateArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};


/** subscription root */
export type SubscriptionRootUsersByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootVendorsArgs = {
  distinct_on?: Maybe<Array<VendorsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<VendorsOrderBy>>;
  where?: Maybe<VendorsBoolExp>;
};


/** subscription root */
export type SubscriptionRootVendorsAggregateArgs = {
  distinct_on?: Maybe<Array<VendorsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<VendorsOrderBy>>;
  where?: Maybe<VendorsBoolExp>;
};


/** expression to compare columns of type timestamptz. All fields are combined with logical 'AND'. */
export type TimestamptzComparisonExp = {
  _eq?: Maybe<Scalars['timestamptz']>;
  _gt?: Maybe<Scalars['timestamptz']>;
  _gte?: Maybe<Scalars['timestamptz']>;
  _in?: Maybe<Array<Scalars['timestamptz']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['timestamptz']>;
  _lte?: Maybe<Scalars['timestamptz']>;
  _neq?: Maybe<Scalars['timestamptz']>;
  _nin?: Maybe<Array<Scalars['timestamptz']>>;
};

/**
 * Links that are secured behind two factor auth
 * 
 * 
 * columns and relationships of "two_factor_links"
 */
export type TwoFactorLinks = {
  expires_at: Scalars['timestamptz'];
  form_info: Scalars['json'];
  id: Scalars['uuid'];
  token_states?: Maybe<Scalars['json']>;
};


/**
 * Links that are secured behind two factor auth
 * 
 * 
 * columns and relationships of "two_factor_links"
 */
export type TwoFactorLinksFormInfoArgs = {
  path?: Maybe<Scalars['String']>;
};


/**
 * Links that are secured behind two factor auth
 * 
 * 
 * columns and relationships of "two_factor_links"
 */
export type TwoFactorLinksTokenStatesArgs = {
  path?: Maybe<Scalars['String']>;
};

/** aggregated selection of "two_factor_links" */
export type TwoFactorLinksAggregate = {
  aggregate?: Maybe<TwoFactorLinksAggregateFields>;
  nodes: Array<TwoFactorLinks>;
};

/** aggregate fields of "two_factor_links" */
export type TwoFactorLinksAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<TwoFactorLinksMaxFields>;
  min?: Maybe<TwoFactorLinksMinFields>;
};


/** aggregate fields of "two_factor_links" */
export type TwoFactorLinksAggregateFieldsCountArgs = {
  columns?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "two_factor_links" */
export type TwoFactorLinksAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<TwoFactorLinksMaxOrderBy>;
  min?: Maybe<TwoFactorLinksMinOrderBy>;
};

/** input type for inserting array relation for remote table "two_factor_links" */
export type TwoFactorLinksArrRelInsertInput = {
  data: Array<TwoFactorLinksInsertInput>;
  on_conflict?: Maybe<TwoFactorLinksOnConflict>;
};

/** Boolean expression to filter rows from the table "two_factor_links". All fields are combined with a logical 'AND'. */
export type TwoFactorLinksBoolExp = {
  _and?: Maybe<Array<Maybe<TwoFactorLinksBoolExp>>>;
  _not?: Maybe<TwoFactorLinksBoolExp>;
  _or?: Maybe<Array<Maybe<TwoFactorLinksBoolExp>>>;
  expires_at?: Maybe<TimestamptzComparisonExp>;
  form_info?: Maybe<JsonComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  token_states?: Maybe<JsonComparisonExp>;
};

/** unique or primary key constraints on table "two_factor_links" */
export enum TwoFactorLinksConstraint {
  /** unique or primary key constraint */
  TwoFactorLinksPkey = 'two_factor_links_pkey'
}

/** input type for inserting data into table "two_factor_links" */
export type TwoFactorLinksInsertInput = {
  expires_at?: Maybe<Scalars['timestamptz']>;
  form_info?: Maybe<Scalars['json']>;
  id?: Maybe<Scalars['uuid']>;
  token_states?: Maybe<Scalars['json']>;
};

/** aggregate max on columns */
export type TwoFactorLinksMaxFields = {
  expires_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "two_factor_links" */
export type TwoFactorLinksMaxOrderBy = {
  expires_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type TwoFactorLinksMinFields = {
  expires_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "two_factor_links" */
export type TwoFactorLinksMinOrderBy = {
  expires_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "two_factor_links" */
export type TwoFactorLinksMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<TwoFactorLinks>;
};

/** input type for inserting object relation for remote table "two_factor_links" */
export type TwoFactorLinksObjRelInsertInput = {
  data: TwoFactorLinksInsertInput;
  on_conflict?: Maybe<TwoFactorLinksOnConflict>;
};

/** on conflict condition type for table "two_factor_links" */
export type TwoFactorLinksOnConflict = {
  constraint: TwoFactorLinksConstraint;
  update_columns: Array<TwoFactorLinksUpdateColumn>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};

/** ordering options when selecting data from "two_factor_links" */
export type TwoFactorLinksOrderBy = {
  expires_at?: Maybe<OrderBy>;
  form_info?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  token_states?: Maybe<OrderBy>;
};

/** primary key columns input for table: "two_factor_links" */
export type TwoFactorLinksPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "two_factor_links" */
export enum TwoFactorLinksSelectColumn {
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  FormInfo = 'form_info',
  /** column name */
  Id = 'id',
  /** column name */
  TokenStates = 'token_states'
}

/** input type for updating data in table "two_factor_links" */
export type TwoFactorLinksSetInput = {
  expires_at?: Maybe<Scalars['timestamptz']>;
  form_info?: Maybe<Scalars['json']>;
  id?: Maybe<Scalars['uuid']>;
  token_states?: Maybe<Scalars['json']>;
};

/** update columns of table "two_factor_links" */
export enum TwoFactorLinksUpdateColumn {
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  FormInfo = 'form_info',
  /** column name */
  Id = 'id',
  /** column name */
  TokenStates = 'token_states'
}

/** columns and relationships of "user_roles" */
export type UserRoles = {
  display_name: Scalars['String'];
  value: Scalars['String'];
};

/** aggregated selection of "user_roles" */
export type UserRolesAggregate = {
  aggregate?: Maybe<UserRolesAggregateFields>;
  nodes: Array<UserRoles>;
};

/** aggregate fields of "user_roles" */
export type UserRolesAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<UserRolesMaxFields>;
  min?: Maybe<UserRolesMinFields>;
};


/** aggregate fields of "user_roles" */
export type UserRolesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<UserRolesSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "user_roles" */
export type UserRolesAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<UserRolesMaxOrderBy>;
  min?: Maybe<UserRolesMinOrderBy>;
};

/** input type for inserting array relation for remote table "user_roles" */
export type UserRolesArrRelInsertInput = {
  data: Array<UserRolesInsertInput>;
  on_conflict?: Maybe<UserRolesOnConflict>;
};

/** Boolean expression to filter rows from the table "user_roles". All fields are combined with a logical 'AND'. */
export type UserRolesBoolExp = {
  _and?: Maybe<Array<Maybe<UserRolesBoolExp>>>;
  _not?: Maybe<UserRolesBoolExp>;
  _or?: Maybe<Array<Maybe<UserRolesBoolExp>>>;
  display_name?: Maybe<StringComparisonExp>;
  value?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "user_roles" */
export enum UserRolesConstraint {
  /** unique or primary key constraint */
  UserRolesPkey = 'user_roles_pkey'
}

export enum UserRolesEnum {
  /** Bank Admin */
  BankAdmin = 'bank_admin',
  /** Company Admin */
  CompanyAdmin = 'company_admin'
}

/** expression to compare columns of type user_roles_enum. All fields are combined with logical 'AND'. */
export type UserRolesEnumComparisonExp = {
  _eq?: Maybe<UserRolesEnum>;
  _in?: Maybe<Array<UserRolesEnum>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _neq?: Maybe<UserRolesEnum>;
  _nin?: Maybe<Array<UserRolesEnum>>;
};

/** input type for inserting data into table "user_roles" */
export type UserRolesInsertInput = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type UserRolesMaxFields = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "user_roles" */
export type UserRolesMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type UserRolesMinFields = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "user_roles" */
export type UserRolesMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "user_roles" */
export type UserRolesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<UserRoles>;
};

/** input type for inserting object relation for remote table "user_roles" */
export type UserRolesObjRelInsertInput = {
  data: UserRolesInsertInput;
  on_conflict?: Maybe<UserRolesOnConflict>;
};

/** on conflict condition type for table "user_roles" */
export type UserRolesOnConflict = {
  constraint: UserRolesConstraint;
  update_columns: Array<UserRolesUpdateColumn>;
  where?: Maybe<UserRolesBoolExp>;
};

/** ordering options when selecting data from "user_roles" */
export type UserRolesOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** primary key columns input for table: "user_roles" */
export type UserRolesPkColumnsInput = {
  value: Scalars['String'];
};

/** select columns of table "user_roles" */
export enum UserRolesSelectColumn {
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "user_roles" */
export type UserRolesSetInput = {
  display_name?: Maybe<Scalars['String']>;
  value?: Maybe<Scalars['String']>;
};

/** update columns of table "user_roles" */
export enum UserRolesUpdateColumn {
  /** column name */
  DisplayName = 'display_name',
  /** column name */
  Value = 'value'
}

/** columns and relationships of "users" */
export type Users = {
  /** An object relationship */
  company?: Maybe<Companies>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  email: Scalars['String'];
  first_name: Scalars['String'];
  full_name: Scalars['String'];
  id: Scalars['uuid'];
  last_name: Scalars['String'];
  password?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
  role?: Maybe<UserRolesEnum>;
};

/** aggregated selection of "users" */
export type UsersAggregate = {
  aggregate?: Maybe<UsersAggregateFields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type UsersAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<UsersMaxFields>;
  min?: Maybe<UsersMinFields>;
};


/** aggregate fields of "users" */
export type UsersAggregateFieldsCountArgs = {
  columns?: Maybe<Array<UsersSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "users" */
export type UsersAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<UsersMaxOrderBy>;
  min?: Maybe<UsersMinOrderBy>;
};

/** input type for inserting array relation for remote table "users" */
export type UsersArrRelInsertInput = {
  data: Array<UsersInsertInput>;
  on_conflict?: Maybe<UsersOnConflict>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type UsersBoolExp = {
  _and?: Maybe<Array<Maybe<UsersBoolExp>>>;
  _not?: Maybe<UsersBoolExp>;
  _or?: Maybe<Array<Maybe<UsersBoolExp>>>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  email?: Maybe<StringComparisonExp>;
  first_name?: Maybe<StringComparisonExp>;
  full_name?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  last_name?: Maybe<StringComparisonExp>;
  password?: Maybe<StringComparisonExp>;
  phone_number?: Maybe<StringComparisonExp>;
  role?: Maybe<UserRolesEnumComparisonExp>;
};

/** unique or primary key constraints on table "users" */
export enum UsersConstraint {
  /** unique or primary key constraint */
  UsersPkey = 'users_pkey'
}

/** input type for inserting data into table "users" */
export type UsersInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_name?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
  role?: Maybe<UserRolesEnum>;
};

/** aggregate max on columns */
export type UsersMaxFields = {
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_name?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "users" */
export type UsersMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  email?: Maybe<OrderBy>;
  first_name?: Maybe<OrderBy>;
  full_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  last_name?: Maybe<OrderBy>;
  password?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type UsersMinFields = {
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_name?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "users" */
export type UsersMinOrderBy = {
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  email?: Maybe<OrderBy>;
  first_name?: Maybe<OrderBy>;
  full_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  last_name?: Maybe<OrderBy>;
  password?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
};

/** response of any mutation on the table "users" */
export type UsersMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "users" */
export type UsersObjRelInsertInput = {
  data: UsersInsertInput;
  on_conflict?: Maybe<UsersOnConflict>;
};

/** on conflict condition type for table "users" */
export type UsersOnConflict = {
  constraint: UsersConstraint;
  update_columns: Array<UsersUpdateColumn>;
  where?: Maybe<UsersBoolExp>;
};

/** ordering options when selecting data from "users" */
export type UsersOrderBy = {
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  email?: Maybe<OrderBy>;
  first_name?: Maybe<OrderBy>;
  full_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  last_name?: Maybe<OrderBy>;
  password?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
  role?: Maybe<OrderBy>;
};

/** primary key columns input for table: "users" */
export type UsersPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "users" */
export enum UsersSelectColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  FullName = 'full_name',
  /** column name */
  Id = 'id',
  /** column name */
  LastName = 'last_name',
  /** column name */
  Password = 'password',
  /** column name */
  PhoneNumber = 'phone_number',
  /** column name */
  Role = 'role'
}

/** input type for updating data in table "users" */
export type UsersSetInput = {
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_name?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
  role?: Maybe<UserRolesEnum>;
};

/** update columns of table "users" */
export enum UsersUpdateColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  FullName = 'full_name',
  /** column name */
  Id = 'id',
  /** column name */
  LastName = 'last_name',
  /** column name */
  Password = 'password',
  /** column name */
  PhoneNumber = 'phone_number',
  /** column name */
  Role = 'role'
}


/** expression to compare columns of type uuid. All fields are combined with logical 'AND'. */
export type UuidComparisonExp = {
  _eq?: Maybe<Scalars['uuid']>;
  _gt?: Maybe<Scalars['uuid']>;
  _gte?: Maybe<Scalars['uuid']>;
  _in?: Maybe<Array<Scalars['uuid']>>;
  _is_null?: Maybe<Scalars['Boolean']>;
  _lt?: Maybe<Scalars['uuid']>;
  _lte?: Maybe<Scalars['uuid']>;
  _neq?: Maybe<Scalars['uuid']>;
  _nin?: Maybe<Array<Scalars['uuid']>>;
};

/** columns and relationships of "vendors" */
export type Vendors = {
  address?: Maybe<Scalars['String']>;
  /** An array relationship */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  dba_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
};


/** columns and relationships of "vendors" */
export type VendorsCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};


/** columns and relationships of "vendors" */
export type VendorsCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** aggregated selection of "vendors" */
export type VendorsAggregate = {
  aggregate?: Maybe<VendorsAggregateFields>;
  nodes: Array<Vendors>;
};

/** aggregate fields of "vendors" */
export type VendorsAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<VendorsMaxFields>;
  min?: Maybe<VendorsMinFields>;
};


/** aggregate fields of "vendors" */
export type VendorsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<VendorsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "vendors" */
export type VendorsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<VendorsMaxOrderBy>;
  min?: Maybe<VendorsMinOrderBy>;
};

/** input type for inserting array relation for remote table "vendors" */
export type VendorsArrRelInsertInput = {
  data: Array<VendorsInsertInput>;
};

/** Boolean expression to filter rows from the table "vendors". All fields are combined with a logical 'AND'. */
export type VendorsBoolExp = {
  _and?: Maybe<Array<Maybe<VendorsBoolExp>>>;
  _not?: Maybe<VendorsBoolExp>;
  _or?: Maybe<Array<Maybe<VendorsBoolExp>>>;
  address?: Maybe<StringComparisonExp>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsBoolExp>;
  dba_name?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  name?: Maybe<StringComparisonExp>;
  phone_number?: Maybe<StringComparisonExp>;
};

/** input type for inserting data into table "vendors" */
export type VendorsInsertInput = {
  address?: Maybe<Scalars['String']>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  dba_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type VendorsMaxFields = {
  address?: Maybe<Scalars['String']>;
  dba_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "vendors" */
export type VendorsMaxOrderBy = {
  address?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type VendorsMinFields = {
  address?: Maybe<Scalars['String']>;
  dba_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "vendors" */
export type VendorsMinOrderBy = {
  address?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
};

/** response of any mutation on the table "vendors" */
export type VendorsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<Vendors>;
};

/** input type for inserting object relation for remote table "vendors" */
export type VendorsObjRelInsertInput = {
  data: VendorsInsertInput;
};

/** ordering options when selecting data from "vendors" */
export type VendorsOrderBy = {
  address?: Maybe<OrderBy>;
  company_vendor_partnerships_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  dba_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
};

/** select columns of table "vendors" */
export enum VendorsSelectColumn {
  /** column name */
  Address = 'address',
  /** column name */
  DbaName = 'dba_name',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  PhoneNumber = 'phone_number'
}

/** input type for updating data in table "vendors" */
export type VendorsSetInput = {
  address?: Maybe<Scalars['String']>;
  dba_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
};

export type AddCustomerMutationVariables = Exact<{
  customer: CompaniesInsertInput;
}>;


export type AddCustomerMutation = { insert_companies_one?: Maybe<(
    Pick<Companies, 'id' | 'name'>
    & { settings: Pick<CompanySettings, 'id' | 'product_type'> }
  )> };

export type BankCustomerQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type BankCustomerQuery = { companies_by_pk?: Maybe<BankCustomerFragment> };

export type BankCustomerListVendorPartnershipsQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type BankCustomerListVendorPartnershipsQuery = { company_vendor_partnerships: Array<(
    { vendor: (
      { users: Array<ContactFragment> }
      & VendorFragment
    ), vendor_bank_account?: Maybe<Pick<BankAccounts, 'id' | 'verified_at'>> }
    & BankVendorPartnershipFragment
  )> };

export type ListApprovedPurchaseOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type ListApprovedPurchaseOrdersQuery = { purchase_orders: Array<PurchaseOrderFragment> };

export type AddPurchaseOrderLoanMutationVariables = Exact<{
  purchaseOrderLoan: PurchaseOrderLoansInsertInput;
}>;


export type AddPurchaseOrderLoanMutation = { insert_purchase_order_loans_one?: Maybe<PurchaseOrderLoanFragment> };

export type ListPurchaseOrderLoansForCustomerQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type ListPurchaseOrderLoansForCustomerQuery = { purchase_order_loans: Array<PurchaseOrderLoanFragment> };

export type ApprovedPurchaseOrderLoansQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type ApprovedPurchaseOrderLoansQuery = { purchase_order_loans: Array<PurchaseOrderLoanFragment> };

export type BankAccountsForTransferQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type BankAccountsForTransferQuery = { bank_accounts: Array<BankAccountFragment>, companies_by_pk?: Maybe<(
    Pick<Companies, 'id'>
    & { settings: { collections_bespoke_bank_account?: Maybe<BankAccountFragment> } }
  )> };

export type ListBankAccountsQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type ListBankAccountsQuery = { bank_accounts: Array<BankAccountFragment> };

export type AssignCollectionsBespokeBankAccountMutationVariables = Exact<{
  companySettingsId: Scalars['uuid'];
  bankAccountId?: Maybe<Scalars['uuid']>;
}>;


export type AssignCollectionsBespokeBankAccountMutation = { update_company_settings_by_pk?: Maybe<(
    Pick<CompanySettings, 'id'>
    & { collections_bespoke_bank_account?: Maybe<BankAccountFragment> }
  )> };

export type AssignAdvancesBespokeBankAccountMutationVariables = Exact<{
  companySettingsId: Scalars['uuid'];
  bankAccountId?: Maybe<Scalars['uuid']>;
}>;


export type AssignAdvancesBespokeBankAccountMutation = { update_company_settings_by_pk?: Maybe<(
    Pick<CompanySettings, 'id'>
    & { advances_bespoke_bank_account?: Maybe<BankAccountFragment> }
  )> };

export type CompanyFragment = Pick<Companies, 'id' | 'name' | 'dba_name' | 'employer_identification_number' | 'address' | 'phone_number'>;

export type CompanyQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type CompanyQuery = { companies_by_pk?: Maybe<(
    { bank_accounts: Array<BankAccountFragment>, settings: (
      { collections_bespoke_bank_account?: Maybe<BankAccountFragment>, advances_bespoke_bank_account?: Maybe<BankAccountFragment> }
      & CompanySettingsFragment
    ) }
    & CompanyFragment
  )> };

export type CompanyForCustomerQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type CompanyForCustomerQuery = { companies_by_pk?: Maybe<(
    { bank_accounts: Array<BankAccountFragment>, settings: (
      { collections_bespoke_bank_account?: Maybe<BankAccountFragment> }
      & CompanySettingsForCustomerFragment
    ) }
    & CompanyFragment
  )> };

export type UpdateCompanyProfileMutationVariables = Exact<{
  id: Scalars['uuid'];
  company: CompaniesSetInput;
}>;


export type UpdateCompanyProfileMutation = { update_companies_by_pk?: Maybe<CompanyFragment> };

export type AddCompanyBankAccountMutationVariables = Exact<{
  bankAccount: BankAccountsInsertInput;
}>;


export type AddCompanyBankAccountMutation = { insert_bank_accounts_one?: Maybe<BankAccountFragment> };

export type UpdateCompanyBankAccountMutationVariables = Exact<{
  id: Scalars['uuid'];
  bankAccount: BankAccountsSetInput;
}>;


export type UpdateCompanyBankAccountMutation = { update_bank_accounts_by_pk?: Maybe<BankAccountFragment> };

export type PaymentFragment = (
  Pick<Payments, 'id' | 'amount' | 'method' | 'direction' | 'company_id' | 'submitted_at' | 'settled_at'>
  & { company: Pick<Companies, 'id' | 'name'>, company_bank_account?: Maybe<BankAccountFragment>, bespoke_bank_account?: Maybe<BankAccountFragment> }
);

export type SubmitDisbursementMutationVariables = Exact<{
  purchaseOrderLoanId: Scalars['uuid'];
  payment: PaymentsInsertInput;
}>;


export type SubmitDisbursementMutation = { insert_purchase_order_loan_payments_one?: Maybe<(
    { payment: PaymentFragment }
    & PurchaseOrderLoanPaymentFragment
  )> };

export type PurchaseOrderLoanPaymentFragment = Pick<PurchaseOrderLoanPayments, 'purchase_order_loan_id' | 'payment_id'>;

export type PurchaseOrderLoanFragment = Pick<PurchaseOrderLoans, 'id' | 'status' | 'amount' | 'origination_date' | 'maturity_date' | 'adjusted_maturity_date'>;

export type PurchaseOrderLoanQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type PurchaseOrderLoanQuery = { purchase_order_loans_by_pk?: Maybe<(
    { company: Pick<Companies, 'id' | 'name'>, purchase_order: PurchaseOrderFragment }
    & PurchaseOrderLoanFragment
  )> };

export type PurchaseOrderLoanDisbursementsQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type PurchaseOrderLoanDisbursementsQuery = { purchase_order_loans_by_pk?: Maybe<(
    Pick<PurchaseOrderLoans, 'id'>
    & { payments: Array<(
      { payment: PaymentFragment }
      & PurchaseOrderLoanPaymentFragment
    )> }
  )> };

export type ListVendorsByCompanyQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type ListVendorsByCompanyQuery = { vendors: Array<(
    Pick<Vendors, 'id' | 'name'>
    & { company_vendor_partnerships: Array<Pick<CompanyVendorPartnerships, 'id' | 'approved_at'>> }
  )> };

export type PurchaseOrderFragment = (
  Pick<PurchaseOrders, 'id' | 'company_id' | 'vendor_id' | 'order_number' | 'order_date' | 'delivery_date' | 'amount' | 'is_cannabis' | 'status' | 'created_at'>
  & { company: Pick<Companies, 'id' | 'name'>, vendor?: Maybe<Pick<Vendors, 'id' | 'name'>> }
);

export type FileFragment = Pick<Files, 'id' | 'name' | 'path'>;

export type PurchaseOrderFileFragment = (
  Pick<PurchaseOrderFiles, 'purchase_order_id' | 'file_id' | 'file_type'>
  & { file: (
    Pick<Files, 'id'>
    & FileFragment
  ) }
);

export type ListPurchaseOrdersQueryVariables = Exact<{
  company_id: Scalars['uuid'];
}>;


export type ListPurchaseOrdersQuery = { purchase_orders: Array<(
    { company: Pick<Companies, 'id' | 'name'> }
    & PurchaseOrderFragment
  )> };

export type ListPurchaseOrderVendorsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListPurchaseOrderVendorsQuery = { vendors: Array<Pick<Vendors, 'id' | 'name'>> };

export type PurchaseOrderQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type PurchaseOrderQuery = { purchase_orders_by_pk?: Maybe<(
    { purchase_order_files: Array<PurchaseOrderFileFragment> }
    & PurchaseOrderFragment
  )> };

export type PurchaseOrderForReviewQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type PurchaseOrderForReviewQuery = { purchase_orders_by_pk?: Maybe<(
    Pick<PurchaseOrders, 'id' | 'company_id' | 'vendor_id' | 'order_number' | 'order_date' | 'delivery_date' | 'amount' | 'is_cannabis' | 'status' | 'created_at'>
    & { purchase_order_files: Array<(
      Pick<PurchaseOrderFiles, 'purchase_order_id' | 'file_id'>
      & PurchaseOrderFileFragment
    )>, company: Pick<Companies, 'id' | 'name'> }
  )> };

export type AddPurchaseOrderMutationVariables = Exact<{
  purchase_order: PurchaseOrdersInsertInput;
}>;


export type AddPurchaseOrderMutation = { insert_purchase_orders_one?: Maybe<(
    { purchase_order_files: Array<PurchaseOrderFileFragment> }
    & PurchaseOrderFragment
  )> };

export type UpdatePurchaseOrderMutationVariables = Exact<{
  id: Scalars['uuid'];
  purchaseOrder: PurchaseOrdersSetInput;
  purchaseOrderFiles: Array<PurchaseOrderFilesInsertInput>;
}>;


export type UpdatePurchaseOrderMutation = { delete_purchase_order_files?: Maybe<Pick<PurchaseOrderFilesMutationResponse, 'affected_rows'>>, insert_purchase_order_files?: Maybe<{ returning: Array<Pick<PurchaseOrderFiles, 'purchase_order_id' | 'file_id'>> }>, update_purchase_orders_by_pk?: Maybe<(
    { purchase_order_files: Array<PurchaseOrderFileFragment> }
    & PurchaseOrderFragment
  )> };

export type ContactFragment = Pick<Users, 'id' | 'company_id' | 'full_name' | 'first_name' | 'last_name' | 'email' | 'phone_number' | 'created_at'>;

export type UpdateVendorContactMutationVariables = Exact<{
  userId: Scalars['uuid'];
  contact: UsersSetInput;
}>;


export type UpdateVendorContactMutation = { update_users_by_pk?: Maybe<ContactFragment> };

export type DeleteVendorContactMutationVariables = Exact<{
  userId: Scalars['uuid'];
}>;


export type DeleteVendorContactMutation = { delete_users_by_pk?: Maybe<Pick<Users, 'id'>> };

export type AddVendorContactMutationVariables = Exact<{
  contact: UsersInsertInput;
}>;


export type AddVendorContactMutation = { insert_users_one?: Maybe<ContactFragment> };

export type VendorFragment = Pick<Companies, 'id' | 'name' | 'address' | 'country' | 'state' | 'city' | 'zip_code' | 'phone_number'>;

export type BankVendorPartnershipFragment = (
  Pick<CompanyVendorPartnerships, 'id' | 'company_id' | 'vendor_id' | 'vendor_agreement_id' | 'vendor_license_id' | 'approved_at'>
  & { vendor_bank_account?: Maybe<BankAccountFragment> }
);

export type CompanySettingsFragment = Pick<CompanySettings, 'id' | 'company_id' | 'vendor_agreement_docusign_template' | 'collections_bespoke_bank_account_id' | 'advances_bespoke_bank_account_id' | 'product_type' | 'product_config'>;

export type CompanySettingsForCustomerFragment = Pick<CompanySettings, 'id' | 'company_id' | 'vendor_agreement_docusign_template' | 'collections_bespoke_bank_account_id' | 'product_type' | 'product_config'>;

export type CompanyAgreementFragment = Pick<CompanyAgreements, 'id' | 'company_id' | 'file_id'>;

export type CompanyLicenseFragment = Pick<CompanyLicenses, 'id' | 'company_id' | 'file_id'>;

export type BankAccountFragment = Pick<BankAccounts, 'id' | 'company_id' | 'bank_name' | 'bank_address' | 'account_type' | 'account_number' | 'routing_number' | 'can_ach' | 'can_wire' | 'recipient_name' | 'recipient_address' | 'verified_at'>;

export type BankListVendorPartnershipsQueryVariables = Exact<{ [key: string]: never; }>;


export type BankListVendorPartnershipsQuery = { company_vendor_partnerships: Array<(
    { vendor: (
      { settings: Pick<CompanySettings, 'id'>, users: Array<ContactFragment> }
      & VendorFragment
    ), vendor_bank_account?: Maybe<Pick<BankAccounts, 'id' | 'verified_at'>> }
    & BankVendorPartnershipFragment
  )> };

export type BankVendorPartnershipQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type BankVendorPartnershipQuery = { company_vendor_partnerships_by_pk?: Maybe<(
    { vendor: (
      { settings: (
        Pick<CompanySettings, 'id'>
        & { collections_bespoke_bank_account?: Maybe<BankAccountFragment>, advances_bespoke_bank_account?: Maybe<BankAccountFragment> }
      ), users: Array<ContactFragment> }
      & VendorFragment
    ), company: (
      { users: Array<ContactFragment>, settings: CompanySettingsFragment }
      & CompanyFragment
    ), company_agreement?: Maybe<CompanyAgreementFragment>, company_license?: Maybe<CompanyLicenseFragment> }
    & BankVendorPartnershipFragment
  )> };

export type CompanyBankAccountsQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type CompanyBankAccountsQuery = { bank_accounts: Array<BankAccountFragment> };

export type AddBankAccountMutationVariables = Exact<{
  bankAccount: BankAccountsInsertInput;
}>;


export type AddBankAccountMutation = { insert_bank_accounts_one?: Maybe<BankAccountFragment> };

export type UpdateBankAccountMutationVariables = Exact<{
  id: Scalars['uuid'];
  bankAccount?: Maybe<BankAccountsSetInput>;
}>;


export type UpdateBankAccountMutation = { update_bank_accounts_by_pk?: Maybe<BankAccountFragment> };

export type ChangeBankAccountMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars['uuid'];
  bankAccountId?: Maybe<Scalars['uuid']>;
}>;


export type ChangeBankAccountMutation = { update_company_vendor_partnerships_by_pk?: Maybe<(
    Pick<CompanyVendorPartnerships, 'id'>
    & { vendor_bank_account?: Maybe<BankAccountFragment> }
  )> };

export type UpdateCompanyVendorPartnershipApprovedAtMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars['uuid'];
  approvedAt?: Maybe<Scalars['timestamptz']>;
}>;


export type UpdateCompanyVendorPartnershipApprovedAtMutation = { update_company_vendor_partnerships_by_pk?: Maybe<BankVendorPartnershipFragment> };

export type UpdateVendorInfoMutationVariables = Exact<{
  id: Scalars['uuid'];
  company: CompaniesSetInput;
}>;


export type UpdateVendorInfoMutation = { update_companies_by_pk?: Maybe<VendorFragment> };

export type UpdateVendorAgreementIdMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars['uuid'];
  vendorAgreementId?: Maybe<Scalars['uuid']>;
}>;


export type UpdateVendorAgreementIdMutation = { update_company_vendor_partnerships_by_pk?: Maybe<(
    Pick<CompanyVendorPartnerships, 'id'>
    & { company_agreement?: Maybe<CompanyAgreementFragment> }
  )> };

export type AddCompanyVendorAgreementMutationVariables = Exact<{
  vendorAgreement: CompanyAgreementsInsertInput;
}>;


export type AddCompanyVendorAgreementMutation = { insert_company_agreements_one?: Maybe<CompanyAgreementFragment> };

export type UpdateVendorLicenseIdMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars['uuid'];
  vendorLicenseId: Scalars['uuid'];
}>;


export type UpdateVendorLicenseIdMutation = { update_company_vendor_partnerships_by_pk?: Maybe<(
    Pick<CompanyVendorPartnerships, 'id'>
    & { company_license?: Maybe<CompanyLicenseFragment> }
  )> };

export type AddCompanyVendorLicenseMutationVariables = Exact<{
  vendorLicense: CompanyLicensesInsertInput;
}>;


export type AddCompanyVendorLicenseMutation = { insert_company_licenses_one?: Maybe<CompanyLicenseFragment> };

export type VendorLimitedFragment = Pick<Vendors, 'id' | 'name'>;

export type VendorPartnershipFragment = Pick<CompanyVendorPartnerships, 'id' | 'company_id' | 'vendor_id' | 'vendor_agreement_id' | 'vendor_license_id'>;

export type AddVendorPartnershipMutationVariables = Exact<{
  vendorPartnership: CompanyVendorPartnershipsInsertInput;
}>;


export type AddVendorPartnershipMutation = { insert_company_vendor_partnerships_one?: Maybe<(
    { vendor_limited?: Maybe<VendorLimitedFragment> }
    & VendorPartnershipFragment
  )> };

export type ListVendorPartnershipsQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type ListVendorPartnershipsQuery = { company_vendor_partnerships: Array<(
    { vendor_limited?: Maybe<VendorLimitedFragment>, vendor_bank_account?: Maybe<Pick<BankAccounts, 'id' | 'verified_at'>> }
    & VendorPartnershipFragment
  )> };

export type BankAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type BankAccountsQuery = { bank_accounts: Array<BankAccountFragment> };

export type BankCustomerFragment = Pick<Companies, 'id' | 'name' | 'employer_identification_number' | 'dba_name' | 'address' | 'country' | 'state' | 'city' | 'zip_code' | 'phone_number'>;

export type BankCustomersQueryVariables = Exact<{ [key: string]: never; }>;


export type BankCustomersQuery = { companies: Array<BankCustomerFragment> };

export type CompanyVendorsQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type CompanyVendorsQuery = { company_vendor_partnerships: Array<{ vendor: Pick<Companies, 'name'> }> };

export type UserFragment = Pick<Users, 'id' | 'first_name' | 'last_name' | 'full_name' | 'email' | 'phone_number' | 'role' | 'created_at'>;

export type UserByIdQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type UserByIdQuery = { users_by_pk?: Maybe<UserFragment> };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['uuid'];
  user: UsersSetInput;
}>;


export type UpdateUserMutation = { update_users_by_pk?: Maybe<UserFragment> };

export type UsersByEmailQueryVariables = Exact<{
  email: Scalars['String'];
}>;


export type UsersByEmailQuery = { users: Array<Pick<Users, 'id' | 'company_id' | 'role'>> };

export type ListUsersByRoleQueryVariables = Exact<{
  role?: Maybe<UserRolesEnum>;
}>;


export type ListUsersByRoleQuery = { users: Array<UserFragment> };

export type ListUsersByCompanyIdQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type ListUsersByCompanyIdQuery = { users: Array<UserFragment> };

export type AddUserMutationVariables = Exact<{
  user: UsersInsertInput;
}>;


export type AddUserMutation = { insert_users_one?: Maybe<UserFragment> };

export const CompanyFragmentDoc = gql`
    fragment Company on companies {
  id
  name
  dba_name
  employer_identification_number
  address
  phone_number
}
    `;
export const BankAccountFragmentDoc = gql`
    fragment BankAccount on bank_accounts {
  id
  company_id
  bank_name
  bank_address
  account_type
  account_number
  routing_number
  can_ach
  can_wire
  recipient_name
  recipient_address
  verified_at
}
    `;
export const PaymentFragmentDoc = gql`
    fragment Payment on payments {
  id
  amount
  method
  direction
  company_id
  submitted_at
  settled_at
  company {
    id
    name
  }
  company_bank_account {
    ...BankAccount
  }
  bespoke_bank_account {
    ...BankAccount
  }
}
    ${BankAccountFragmentDoc}`;
export const PurchaseOrderLoanPaymentFragmentDoc = gql`
    fragment PurchaseOrderLoanPayment on purchase_order_loan_payments {
  purchase_order_loan_id
  payment_id
}
    `;
export const PurchaseOrderLoanFragmentDoc = gql`
    fragment PurchaseOrderLoan on purchase_order_loans {
  id
  status
  amount
  origination_date
  maturity_date
  adjusted_maturity_date
}
    `;
export const PurchaseOrderFragmentDoc = gql`
    fragment PurchaseOrder on purchase_orders {
  id
  company_id
  vendor_id
  order_number
  order_date
  delivery_date
  amount
  is_cannabis
  status
  created_at
  company {
    id
    name
  }
  vendor {
    id
    name
  }
}
    `;
export const FileFragmentDoc = gql`
    fragment File on files {
  id
  name
  path
}
    `;
export const PurchaseOrderFileFragmentDoc = gql`
    fragment PurchaseOrderFile on purchase_order_files {
  purchase_order_id
  file_id
  file_type
  file {
    id
    ...File
  }
}
    ${FileFragmentDoc}`;
export const ContactFragmentDoc = gql`
    fragment Contact on users {
  id
  company_id
  full_name
  first_name
  last_name
  email
  phone_number
  created_at
}
    `;
export const VendorFragmentDoc = gql`
    fragment Vendor on companies {
  id
  name
  address
  country
  state
  city
  zip_code
  phone_number
}
    `;
export const BankVendorPartnershipFragmentDoc = gql`
    fragment BankVendorPartnership on company_vendor_partnerships {
  id
  company_id
  vendor_id
  vendor_agreement_id
  vendor_bank_account {
    ...BankAccount
  }
  vendor_license_id
  approved_at
}
    ${BankAccountFragmentDoc}`;
export const CompanySettingsFragmentDoc = gql`
    fragment CompanySettings on company_settings {
  id
  company_id
  vendor_agreement_docusign_template
  collections_bespoke_bank_account_id
  advances_bespoke_bank_account_id
  product_type
  product_config
}
    `;
export const CompanySettingsForCustomerFragmentDoc = gql`
    fragment CompanySettingsForCustomer on company_settings {
  id
  company_id
  vendor_agreement_docusign_template
  collections_bespoke_bank_account_id
  product_type
  product_config
}
    `;
export const CompanyAgreementFragmentDoc = gql`
    fragment CompanyAgreement on company_agreements {
  id
  company_id
  file_id
}
    `;
export const CompanyLicenseFragmentDoc = gql`
    fragment CompanyLicense on company_licenses {
  id
  company_id
  file_id
}
    `;
export const VendorLimitedFragmentDoc = gql`
    fragment VendorLimited on vendors {
  id
  name
}
    `;
export const VendorPartnershipFragmentDoc = gql`
    fragment VendorPartnership on company_vendor_partnerships {
  id
  company_id
  vendor_id
  vendor_agreement_id
  vendor_license_id
}
    `;
export const BankCustomerFragmentDoc = gql`
    fragment BankCustomer on companies {
  id
  name
  employer_identification_number
  dba_name
  address
  country
  state
  city
  zip_code
  phone_number
}
    `;
export const UserFragmentDoc = gql`
    fragment User on users {
  id
  first_name
  last_name
  full_name
  email
  phone_number
  role
  created_at
}
    `;
export const AddCustomerDocument = gql`
    mutation AddCustomer($customer: companies_insert_input!) {
  insert_companies_one(object: $customer) {
    id
    name
    settings {
      id
      product_type
    }
  }
}
    `;
export type AddCustomerMutationFn = Apollo.MutationFunction<AddCustomerMutation, AddCustomerMutationVariables>;

/**
 * __useAddCustomerMutation__
 *
 * To run a mutation, you first call `useAddCustomerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCustomerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCustomerMutation, { data, loading, error }] = useAddCustomerMutation({
 *   variables: {
 *      customer: // value for 'customer'
 *   },
 * });
 */
export function useAddCustomerMutation(baseOptions?: Apollo.MutationHookOptions<AddCustomerMutation, AddCustomerMutationVariables>) {
        return Apollo.useMutation<AddCustomerMutation, AddCustomerMutationVariables>(AddCustomerDocument, baseOptions);
      }
export type AddCustomerMutationHookResult = ReturnType<typeof useAddCustomerMutation>;
export type AddCustomerMutationResult = Apollo.MutationResult<AddCustomerMutation>;
export type AddCustomerMutationOptions = Apollo.BaseMutationOptions<AddCustomerMutation, AddCustomerMutationVariables>;
export const BankCustomerDocument = gql`
    query BankCustomer($id: uuid!) {
  companies_by_pk(id: $id) {
    ...BankCustomer
  }
}
    ${BankCustomerFragmentDoc}`;

/**
 * __useBankCustomerQuery__
 *
 * To run a query within a React component, call `useBankCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useBankCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBankCustomerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useBankCustomerQuery(baseOptions: Apollo.QueryHookOptions<BankCustomerQuery, BankCustomerQueryVariables>) {
        return Apollo.useQuery<BankCustomerQuery, BankCustomerQueryVariables>(BankCustomerDocument, baseOptions);
      }
export function useBankCustomerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BankCustomerQuery, BankCustomerQueryVariables>) {
          return Apollo.useLazyQuery<BankCustomerQuery, BankCustomerQueryVariables>(BankCustomerDocument, baseOptions);
        }
export type BankCustomerQueryHookResult = ReturnType<typeof useBankCustomerQuery>;
export type BankCustomerLazyQueryHookResult = ReturnType<typeof useBankCustomerLazyQuery>;
export type BankCustomerQueryResult = Apollo.QueryResult<BankCustomerQuery, BankCustomerQueryVariables>;
export const BankCustomerListVendorPartnershipsDocument = gql`
    query BankCustomerListVendorPartnerships($companyId: uuid!) {
  company_vendor_partnerships(where: {company_id: {_eq: $companyId}}) {
    ...BankVendorPartnership
    vendor {
      ...Vendor
      users {
        ...Contact
      }
    }
    vendor_bank_account {
      id
      verified_at
    }
  }
}
    ${BankVendorPartnershipFragmentDoc}
${VendorFragmentDoc}
${ContactFragmentDoc}`;

/**
 * __useBankCustomerListVendorPartnershipsQuery__
 *
 * To run a query within a React component, call `useBankCustomerListVendorPartnershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBankCustomerListVendorPartnershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBankCustomerListVendorPartnershipsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useBankCustomerListVendorPartnershipsQuery(baseOptions: Apollo.QueryHookOptions<BankCustomerListVendorPartnershipsQuery, BankCustomerListVendorPartnershipsQueryVariables>) {
        return Apollo.useQuery<BankCustomerListVendorPartnershipsQuery, BankCustomerListVendorPartnershipsQueryVariables>(BankCustomerListVendorPartnershipsDocument, baseOptions);
      }
export function useBankCustomerListVendorPartnershipsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BankCustomerListVendorPartnershipsQuery, BankCustomerListVendorPartnershipsQueryVariables>) {
          return Apollo.useLazyQuery<BankCustomerListVendorPartnershipsQuery, BankCustomerListVendorPartnershipsQueryVariables>(BankCustomerListVendorPartnershipsDocument, baseOptions);
        }
export type BankCustomerListVendorPartnershipsQueryHookResult = ReturnType<typeof useBankCustomerListVendorPartnershipsQuery>;
export type BankCustomerListVendorPartnershipsLazyQueryHookResult = ReturnType<typeof useBankCustomerListVendorPartnershipsLazyQuery>;
export type BankCustomerListVendorPartnershipsQueryResult = Apollo.QueryResult<BankCustomerListVendorPartnershipsQuery, BankCustomerListVendorPartnershipsQueryVariables>;
export const ListApprovedPurchaseOrdersDocument = gql`
    query ListApprovedPurchaseOrders {
  purchase_orders(where: {status: {_eq: approved}}) {
    ...PurchaseOrder
  }
}
    ${PurchaseOrderFragmentDoc}`;

/**
 * __useListApprovedPurchaseOrdersQuery__
 *
 * To run a query within a React component, call `useListApprovedPurchaseOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListApprovedPurchaseOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListApprovedPurchaseOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useListApprovedPurchaseOrdersQuery(baseOptions?: Apollo.QueryHookOptions<ListApprovedPurchaseOrdersQuery, ListApprovedPurchaseOrdersQueryVariables>) {
        return Apollo.useQuery<ListApprovedPurchaseOrdersQuery, ListApprovedPurchaseOrdersQueryVariables>(ListApprovedPurchaseOrdersDocument, baseOptions);
      }
export function useListApprovedPurchaseOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListApprovedPurchaseOrdersQuery, ListApprovedPurchaseOrdersQueryVariables>) {
          return Apollo.useLazyQuery<ListApprovedPurchaseOrdersQuery, ListApprovedPurchaseOrdersQueryVariables>(ListApprovedPurchaseOrdersDocument, baseOptions);
        }
export type ListApprovedPurchaseOrdersQueryHookResult = ReturnType<typeof useListApprovedPurchaseOrdersQuery>;
export type ListApprovedPurchaseOrdersLazyQueryHookResult = ReturnType<typeof useListApprovedPurchaseOrdersLazyQuery>;
export type ListApprovedPurchaseOrdersQueryResult = Apollo.QueryResult<ListApprovedPurchaseOrdersQuery, ListApprovedPurchaseOrdersQueryVariables>;
export const AddPurchaseOrderLoanDocument = gql`
    mutation AddPurchaseOrderLoan($purchaseOrderLoan: purchase_order_loans_insert_input!) {
  insert_purchase_order_loans_one(object: $purchaseOrderLoan) {
    ...PurchaseOrderLoan
  }
}
    ${PurchaseOrderLoanFragmentDoc}`;
export type AddPurchaseOrderLoanMutationFn = Apollo.MutationFunction<AddPurchaseOrderLoanMutation, AddPurchaseOrderLoanMutationVariables>;

/**
 * __useAddPurchaseOrderLoanMutation__
 *
 * To run a mutation, you first call `useAddPurchaseOrderLoanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPurchaseOrderLoanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPurchaseOrderLoanMutation, { data, loading, error }] = useAddPurchaseOrderLoanMutation({
 *   variables: {
 *      purchaseOrderLoan: // value for 'purchaseOrderLoan'
 *   },
 * });
 */
export function useAddPurchaseOrderLoanMutation(baseOptions?: Apollo.MutationHookOptions<AddPurchaseOrderLoanMutation, AddPurchaseOrderLoanMutationVariables>) {
        return Apollo.useMutation<AddPurchaseOrderLoanMutation, AddPurchaseOrderLoanMutationVariables>(AddPurchaseOrderLoanDocument, baseOptions);
      }
export type AddPurchaseOrderLoanMutationHookResult = ReturnType<typeof useAddPurchaseOrderLoanMutation>;
export type AddPurchaseOrderLoanMutationResult = Apollo.MutationResult<AddPurchaseOrderLoanMutation>;
export type AddPurchaseOrderLoanMutationOptions = Apollo.BaseMutationOptions<AddPurchaseOrderLoanMutation, AddPurchaseOrderLoanMutationVariables>;
export const ListPurchaseOrderLoansForCustomerDocument = gql`
    query ListPurchaseOrderLoansForCustomer($companyId: uuid!) {
  purchase_order_loans(where: {company_id: {_eq: $companyId}}) {
    ...PurchaseOrderLoan
  }
}
    ${PurchaseOrderLoanFragmentDoc}`;

/**
 * __useListPurchaseOrderLoansForCustomerQuery__
 *
 * To run a query within a React component, call `useListPurchaseOrderLoansForCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPurchaseOrderLoansForCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPurchaseOrderLoansForCustomerQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useListPurchaseOrderLoansForCustomerQuery(baseOptions: Apollo.QueryHookOptions<ListPurchaseOrderLoansForCustomerQuery, ListPurchaseOrderLoansForCustomerQueryVariables>) {
        return Apollo.useQuery<ListPurchaseOrderLoansForCustomerQuery, ListPurchaseOrderLoansForCustomerQueryVariables>(ListPurchaseOrderLoansForCustomerDocument, baseOptions);
      }
export function useListPurchaseOrderLoansForCustomerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListPurchaseOrderLoansForCustomerQuery, ListPurchaseOrderLoansForCustomerQueryVariables>) {
          return Apollo.useLazyQuery<ListPurchaseOrderLoansForCustomerQuery, ListPurchaseOrderLoansForCustomerQueryVariables>(ListPurchaseOrderLoansForCustomerDocument, baseOptions);
        }
export type ListPurchaseOrderLoansForCustomerQueryHookResult = ReturnType<typeof useListPurchaseOrderLoansForCustomerQuery>;
export type ListPurchaseOrderLoansForCustomerLazyQueryHookResult = ReturnType<typeof useListPurchaseOrderLoansForCustomerLazyQuery>;
export type ListPurchaseOrderLoansForCustomerQueryResult = Apollo.QueryResult<ListPurchaseOrderLoansForCustomerQuery, ListPurchaseOrderLoansForCustomerQueryVariables>;
export const ApprovedPurchaseOrderLoansDocument = gql`
    query ApprovedPurchaseOrderLoans($companyId: uuid!) {
  purchase_order_loans(
    where: {company_id: {_eq: $companyId}, status: {_eq: approved}}
  ) {
    ...PurchaseOrderLoan
  }
}
    ${PurchaseOrderLoanFragmentDoc}`;

/**
 * __useApprovedPurchaseOrderLoansQuery__
 *
 * To run a query within a React component, call `useApprovedPurchaseOrderLoansQuery` and pass it any options that fit your needs.
 * When your component renders, `useApprovedPurchaseOrderLoansQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApprovedPurchaseOrderLoansQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useApprovedPurchaseOrderLoansQuery(baseOptions: Apollo.QueryHookOptions<ApprovedPurchaseOrderLoansQuery, ApprovedPurchaseOrderLoansQueryVariables>) {
        return Apollo.useQuery<ApprovedPurchaseOrderLoansQuery, ApprovedPurchaseOrderLoansQueryVariables>(ApprovedPurchaseOrderLoansDocument, baseOptions);
      }
export function useApprovedPurchaseOrderLoansLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ApprovedPurchaseOrderLoansQuery, ApprovedPurchaseOrderLoansQueryVariables>) {
          return Apollo.useLazyQuery<ApprovedPurchaseOrderLoansQuery, ApprovedPurchaseOrderLoansQueryVariables>(ApprovedPurchaseOrderLoansDocument, baseOptions);
        }
export type ApprovedPurchaseOrderLoansQueryHookResult = ReturnType<typeof useApprovedPurchaseOrderLoansQuery>;
export type ApprovedPurchaseOrderLoansLazyQueryHookResult = ReturnType<typeof useApprovedPurchaseOrderLoansLazyQuery>;
export type ApprovedPurchaseOrderLoansQueryResult = Apollo.QueryResult<ApprovedPurchaseOrderLoansQuery, ApprovedPurchaseOrderLoansQueryVariables>;
export const BankAccountsForTransferDocument = gql`
    query BankAccountsForTransfer($companyId: uuid!) {
  bank_accounts(where: {company_id: {_is_null: true}}) {
    ...BankAccount
  }
  companies_by_pk(id: $companyId) {
    id
    settings {
      collections_bespoke_bank_account {
        ...BankAccount
      }
    }
  }
}
    ${BankAccountFragmentDoc}`;

/**
 * __useBankAccountsForTransferQuery__
 *
 * To run a query within a React component, call `useBankAccountsForTransferQuery` and pass it any options that fit your needs.
 * When your component renders, `useBankAccountsForTransferQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBankAccountsForTransferQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useBankAccountsForTransferQuery(baseOptions: Apollo.QueryHookOptions<BankAccountsForTransferQuery, BankAccountsForTransferQueryVariables>) {
        return Apollo.useQuery<BankAccountsForTransferQuery, BankAccountsForTransferQueryVariables>(BankAccountsForTransferDocument, baseOptions);
      }
export function useBankAccountsForTransferLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BankAccountsForTransferQuery, BankAccountsForTransferQueryVariables>) {
          return Apollo.useLazyQuery<BankAccountsForTransferQuery, BankAccountsForTransferQueryVariables>(BankAccountsForTransferDocument, baseOptions);
        }
export type BankAccountsForTransferQueryHookResult = ReturnType<typeof useBankAccountsForTransferQuery>;
export type BankAccountsForTransferLazyQueryHookResult = ReturnType<typeof useBankAccountsForTransferLazyQuery>;
export type BankAccountsForTransferQueryResult = Apollo.QueryResult<BankAccountsForTransferQuery, BankAccountsForTransferQueryVariables>;
export const ListBankAccountsDocument = gql`
    query ListBankAccounts($companyId: uuid!) {
  bank_accounts(where: {company_id: {_eq: $companyId}}) {
    ...BankAccount
  }
}
    ${BankAccountFragmentDoc}`;

/**
 * __useListBankAccountsQuery__
 *
 * To run a query within a React component, call `useListBankAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListBankAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListBankAccountsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useListBankAccountsQuery(baseOptions: Apollo.QueryHookOptions<ListBankAccountsQuery, ListBankAccountsQueryVariables>) {
        return Apollo.useQuery<ListBankAccountsQuery, ListBankAccountsQueryVariables>(ListBankAccountsDocument, baseOptions);
      }
export function useListBankAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListBankAccountsQuery, ListBankAccountsQueryVariables>) {
          return Apollo.useLazyQuery<ListBankAccountsQuery, ListBankAccountsQueryVariables>(ListBankAccountsDocument, baseOptions);
        }
export type ListBankAccountsQueryHookResult = ReturnType<typeof useListBankAccountsQuery>;
export type ListBankAccountsLazyQueryHookResult = ReturnType<typeof useListBankAccountsLazyQuery>;
export type ListBankAccountsQueryResult = Apollo.QueryResult<ListBankAccountsQuery, ListBankAccountsQueryVariables>;
export const AssignCollectionsBespokeBankAccountDocument = gql`
    mutation AssignCollectionsBespokeBankAccount($companySettingsId: uuid!, $bankAccountId: uuid) {
  update_company_settings_by_pk(
    pk_columns: {id: $companySettingsId}
    _set: {collections_bespoke_bank_account_id: $bankAccountId}
  ) {
    id
    collections_bespoke_bank_account {
      ...BankAccount
    }
  }
}
    ${BankAccountFragmentDoc}`;
export type AssignCollectionsBespokeBankAccountMutationFn = Apollo.MutationFunction<AssignCollectionsBespokeBankAccountMutation, AssignCollectionsBespokeBankAccountMutationVariables>;

/**
 * __useAssignCollectionsBespokeBankAccountMutation__
 *
 * To run a mutation, you first call `useAssignCollectionsBespokeBankAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignCollectionsBespokeBankAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignCollectionsBespokeBankAccountMutation, { data, loading, error }] = useAssignCollectionsBespokeBankAccountMutation({
 *   variables: {
 *      companySettingsId: // value for 'companySettingsId'
 *      bankAccountId: // value for 'bankAccountId'
 *   },
 * });
 */
export function useAssignCollectionsBespokeBankAccountMutation(baseOptions?: Apollo.MutationHookOptions<AssignCollectionsBespokeBankAccountMutation, AssignCollectionsBespokeBankAccountMutationVariables>) {
        return Apollo.useMutation<AssignCollectionsBespokeBankAccountMutation, AssignCollectionsBespokeBankAccountMutationVariables>(AssignCollectionsBespokeBankAccountDocument, baseOptions);
      }
export type AssignCollectionsBespokeBankAccountMutationHookResult = ReturnType<typeof useAssignCollectionsBespokeBankAccountMutation>;
export type AssignCollectionsBespokeBankAccountMutationResult = Apollo.MutationResult<AssignCollectionsBespokeBankAccountMutation>;
export type AssignCollectionsBespokeBankAccountMutationOptions = Apollo.BaseMutationOptions<AssignCollectionsBespokeBankAccountMutation, AssignCollectionsBespokeBankAccountMutationVariables>;
export const AssignAdvancesBespokeBankAccountDocument = gql`
    mutation AssignAdvancesBespokeBankAccount($companySettingsId: uuid!, $bankAccountId: uuid) {
  update_company_settings_by_pk(
    pk_columns: {id: $companySettingsId}
    _set: {advances_bespoke_bank_account_id: $bankAccountId}
  ) {
    id
    advances_bespoke_bank_account {
      ...BankAccount
    }
  }
}
    ${BankAccountFragmentDoc}`;
export type AssignAdvancesBespokeBankAccountMutationFn = Apollo.MutationFunction<AssignAdvancesBespokeBankAccountMutation, AssignAdvancesBespokeBankAccountMutationVariables>;

/**
 * __useAssignAdvancesBespokeBankAccountMutation__
 *
 * To run a mutation, you first call `useAssignAdvancesBespokeBankAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignAdvancesBespokeBankAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignAdvancesBespokeBankAccountMutation, { data, loading, error }] = useAssignAdvancesBespokeBankAccountMutation({
 *   variables: {
 *      companySettingsId: // value for 'companySettingsId'
 *      bankAccountId: // value for 'bankAccountId'
 *   },
 * });
 */
export function useAssignAdvancesBespokeBankAccountMutation(baseOptions?: Apollo.MutationHookOptions<AssignAdvancesBespokeBankAccountMutation, AssignAdvancesBespokeBankAccountMutationVariables>) {
        return Apollo.useMutation<AssignAdvancesBespokeBankAccountMutation, AssignAdvancesBespokeBankAccountMutationVariables>(AssignAdvancesBespokeBankAccountDocument, baseOptions);
      }
export type AssignAdvancesBespokeBankAccountMutationHookResult = ReturnType<typeof useAssignAdvancesBespokeBankAccountMutation>;
export type AssignAdvancesBespokeBankAccountMutationResult = Apollo.MutationResult<AssignAdvancesBespokeBankAccountMutation>;
export type AssignAdvancesBespokeBankAccountMutationOptions = Apollo.BaseMutationOptions<AssignAdvancesBespokeBankAccountMutation, AssignAdvancesBespokeBankAccountMutationVariables>;
export const CompanyDocument = gql`
    query Company($companyId: uuid!) {
  companies_by_pk(id: $companyId) {
    ...Company
    bank_accounts {
      ...BankAccount
    }
    settings {
      ...CompanySettings
      collections_bespoke_bank_account {
        ...BankAccount
      }
      advances_bespoke_bank_account {
        ...BankAccount
      }
    }
  }
}
    ${CompanyFragmentDoc}
${BankAccountFragmentDoc}
${CompanySettingsFragmentDoc}`;

/**
 * __useCompanyQuery__
 *
 * To run a query within a React component, call `useCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useCompanyQuery(baseOptions: Apollo.QueryHookOptions<CompanyQuery, CompanyQueryVariables>) {
        return Apollo.useQuery<CompanyQuery, CompanyQueryVariables>(CompanyDocument, baseOptions);
      }
export function useCompanyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CompanyQuery, CompanyQueryVariables>) {
          return Apollo.useLazyQuery<CompanyQuery, CompanyQueryVariables>(CompanyDocument, baseOptions);
        }
export type CompanyQueryHookResult = ReturnType<typeof useCompanyQuery>;
export type CompanyLazyQueryHookResult = ReturnType<typeof useCompanyLazyQuery>;
export type CompanyQueryResult = Apollo.QueryResult<CompanyQuery, CompanyQueryVariables>;
export const CompanyForCustomerDocument = gql`
    query CompanyForCustomer($companyId: uuid!) {
  companies_by_pk(id: $companyId) {
    ...Company
    bank_accounts {
      ...BankAccount
    }
    settings {
      ...CompanySettingsForCustomer
      collections_bespoke_bank_account {
        ...BankAccount
      }
    }
  }
}
    ${CompanyFragmentDoc}
${BankAccountFragmentDoc}
${CompanySettingsForCustomerFragmentDoc}`;

/**
 * __useCompanyForCustomerQuery__
 *
 * To run a query within a React component, call `useCompanyForCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyForCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyForCustomerQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useCompanyForCustomerQuery(baseOptions: Apollo.QueryHookOptions<CompanyForCustomerQuery, CompanyForCustomerQueryVariables>) {
        return Apollo.useQuery<CompanyForCustomerQuery, CompanyForCustomerQueryVariables>(CompanyForCustomerDocument, baseOptions);
      }
export function useCompanyForCustomerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CompanyForCustomerQuery, CompanyForCustomerQueryVariables>) {
          return Apollo.useLazyQuery<CompanyForCustomerQuery, CompanyForCustomerQueryVariables>(CompanyForCustomerDocument, baseOptions);
        }
export type CompanyForCustomerQueryHookResult = ReturnType<typeof useCompanyForCustomerQuery>;
export type CompanyForCustomerLazyQueryHookResult = ReturnType<typeof useCompanyForCustomerLazyQuery>;
export type CompanyForCustomerQueryResult = Apollo.QueryResult<CompanyForCustomerQuery, CompanyForCustomerQueryVariables>;
export const UpdateCompanyProfileDocument = gql`
    mutation UpdateCompanyProfile($id: uuid!, $company: companies_set_input!) {
  update_companies_by_pk(pk_columns: {id: $id}, _set: $company) {
    ...Company
  }
}
    ${CompanyFragmentDoc}`;
export type UpdateCompanyProfileMutationFn = Apollo.MutationFunction<UpdateCompanyProfileMutation, UpdateCompanyProfileMutationVariables>;

/**
 * __useUpdateCompanyProfileMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyProfileMutation, { data, loading, error }] = useUpdateCompanyProfileMutation({
 *   variables: {
 *      id: // value for 'id'
 *      company: // value for 'company'
 *   },
 * });
 */
export function useUpdateCompanyProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCompanyProfileMutation, UpdateCompanyProfileMutationVariables>) {
        return Apollo.useMutation<UpdateCompanyProfileMutation, UpdateCompanyProfileMutationVariables>(UpdateCompanyProfileDocument, baseOptions);
      }
export type UpdateCompanyProfileMutationHookResult = ReturnType<typeof useUpdateCompanyProfileMutation>;
export type UpdateCompanyProfileMutationResult = Apollo.MutationResult<UpdateCompanyProfileMutation>;
export type UpdateCompanyProfileMutationOptions = Apollo.BaseMutationOptions<UpdateCompanyProfileMutation, UpdateCompanyProfileMutationVariables>;
export const AddCompanyBankAccountDocument = gql`
    mutation AddCompanyBankAccount($bankAccount: bank_accounts_insert_input!) {
  insert_bank_accounts_one(object: $bankAccount) {
    ...BankAccount
  }
}
    ${BankAccountFragmentDoc}`;
export type AddCompanyBankAccountMutationFn = Apollo.MutationFunction<AddCompanyBankAccountMutation, AddCompanyBankAccountMutationVariables>;

/**
 * __useAddCompanyBankAccountMutation__
 *
 * To run a mutation, you first call `useAddCompanyBankAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCompanyBankAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCompanyBankAccountMutation, { data, loading, error }] = useAddCompanyBankAccountMutation({
 *   variables: {
 *      bankAccount: // value for 'bankAccount'
 *   },
 * });
 */
export function useAddCompanyBankAccountMutation(baseOptions?: Apollo.MutationHookOptions<AddCompanyBankAccountMutation, AddCompanyBankAccountMutationVariables>) {
        return Apollo.useMutation<AddCompanyBankAccountMutation, AddCompanyBankAccountMutationVariables>(AddCompanyBankAccountDocument, baseOptions);
      }
export type AddCompanyBankAccountMutationHookResult = ReturnType<typeof useAddCompanyBankAccountMutation>;
export type AddCompanyBankAccountMutationResult = Apollo.MutationResult<AddCompanyBankAccountMutation>;
export type AddCompanyBankAccountMutationOptions = Apollo.BaseMutationOptions<AddCompanyBankAccountMutation, AddCompanyBankAccountMutationVariables>;
export const UpdateCompanyBankAccountDocument = gql`
    mutation UpdateCompanyBankAccount($id: uuid!, $bankAccount: bank_accounts_set_input!) {
  update_bank_accounts_by_pk(pk_columns: {id: $id}, _set: $bankAccount) {
    ...BankAccount
  }
}
    ${BankAccountFragmentDoc}`;
export type UpdateCompanyBankAccountMutationFn = Apollo.MutationFunction<UpdateCompanyBankAccountMutation, UpdateCompanyBankAccountMutationVariables>;

/**
 * __useUpdateCompanyBankAccountMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyBankAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyBankAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyBankAccountMutation, { data, loading, error }] = useUpdateCompanyBankAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      bankAccount: // value for 'bankAccount'
 *   },
 * });
 */
export function useUpdateCompanyBankAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCompanyBankAccountMutation, UpdateCompanyBankAccountMutationVariables>) {
        return Apollo.useMutation<UpdateCompanyBankAccountMutation, UpdateCompanyBankAccountMutationVariables>(UpdateCompanyBankAccountDocument, baseOptions);
      }
export type UpdateCompanyBankAccountMutationHookResult = ReturnType<typeof useUpdateCompanyBankAccountMutation>;
export type UpdateCompanyBankAccountMutationResult = Apollo.MutationResult<UpdateCompanyBankAccountMutation>;
export type UpdateCompanyBankAccountMutationOptions = Apollo.BaseMutationOptions<UpdateCompanyBankAccountMutation, UpdateCompanyBankAccountMutationVariables>;
export const SubmitDisbursementDocument = gql`
    mutation SubmitDisbursement($purchaseOrderLoanId: uuid!, $payment: payments_insert_input!) {
  insert_purchase_order_loan_payments_one(
    object: {purchase_order_loan_id: $purchaseOrderLoanId, payment: {data: $payment}}
  ) {
    ...PurchaseOrderLoanPayment
    payment {
      ...Payment
    }
  }
}
    ${PurchaseOrderLoanPaymentFragmentDoc}
${PaymentFragmentDoc}`;
export type SubmitDisbursementMutationFn = Apollo.MutationFunction<SubmitDisbursementMutation, SubmitDisbursementMutationVariables>;

/**
 * __useSubmitDisbursementMutation__
 *
 * To run a mutation, you first call `useSubmitDisbursementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitDisbursementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitDisbursementMutation, { data, loading, error }] = useSubmitDisbursementMutation({
 *   variables: {
 *      purchaseOrderLoanId: // value for 'purchaseOrderLoanId'
 *      payment: // value for 'payment'
 *   },
 * });
 */
export function useSubmitDisbursementMutation(baseOptions?: Apollo.MutationHookOptions<SubmitDisbursementMutation, SubmitDisbursementMutationVariables>) {
        return Apollo.useMutation<SubmitDisbursementMutation, SubmitDisbursementMutationVariables>(SubmitDisbursementDocument, baseOptions);
      }
export type SubmitDisbursementMutationHookResult = ReturnType<typeof useSubmitDisbursementMutation>;
export type SubmitDisbursementMutationResult = Apollo.MutationResult<SubmitDisbursementMutation>;
export type SubmitDisbursementMutationOptions = Apollo.BaseMutationOptions<SubmitDisbursementMutation, SubmitDisbursementMutationVariables>;
export const PurchaseOrderLoanDocument = gql`
    query PurchaseOrderLoan($id: uuid!) {
  purchase_order_loans_by_pk(id: $id) {
    ...PurchaseOrderLoan
    company {
      id
      name
    }
    purchase_order {
      ...PurchaseOrder
    }
  }
}
    ${PurchaseOrderLoanFragmentDoc}
${PurchaseOrderFragmentDoc}`;

/**
 * __usePurchaseOrderLoanQuery__
 *
 * To run a query within a React component, call `usePurchaseOrderLoanQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseOrderLoanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseOrderLoanQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePurchaseOrderLoanQuery(baseOptions: Apollo.QueryHookOptions<PurchaseOrderLoanQuery, PurchaseOrderLoanQueryVariables>) {
        return Apollo.useQuery<PurchaseOrderLoanQuery, PurchaseOrderLoanQueryVariables>(PurchaseOrderLoanDocument, baseOptions);
      }
export function usePurchaseOrderLoanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseOrderLoanQuery, PurchaseOrderLoanQueryVariables>) {
          return Apollo.useLazyQuery<PurchaseOrderLoanQuery, PurchaseOrderLoanQueryVariables>(PurchaseOrderLoanDocument, baseOptions);
        }
export type PurchaseOrderLoanQueryHookResult = ReturnType<typeof usePurchaseOrderLoanQuery>;
export type PurchaseOrderLoanLazyQueryHookResult = ReturnType<typeof usePurchaseOrderLoanLazyQuery>;
export type PurchaseOrderLoanQueryResult = Apollo.QueryResult<PurchaseOrderLoanQuery, PurchaseOrderLoanQueryVariables>;
export const PurchaseOrderLoanDisbursementsDocument = gql`
    query PurchaseOrderLoanDisbursements($id: uuid!) {
  purchase_order_loans_by_pk(id: $id) {
    id
    payments {
      ...PurchaseOrderLoanPayment
      payment {
        ...Payment
      }
    }
  }
}
    ${PurchaseOrderLoanPaymentFragmentDoc}
${PaymentFragmentDoc}`;

/**
 * __usePurchaseOrderLoanDisbursementsQuery__
 *
 * To run a query within a React component, call `usePurchaseOrderLoanDisbursementsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseOrderLoanDisbursementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseOrderLoanDisbursementsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePurchaseOrderLoanDisbursementsQuery(baseOptions: Apollo.QueryHookOptions<PurchaseOrderLoanDisbursementsQuery, PurchaseOrderLoanDisbursementsQueryVariables>) {
        return Apollo.useQuery<PurchaseOrderLoanDisbursementsQuery, PurchaseOrderLoanDisbursementsQueryVariables>(PurchaseOrderLoanDisbursementsDocument, baseOptions);
      }
export function usePurchaseOrderLoanDisbursementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseOrderLoanDisbursementsQuery, PurchaseOrderLoanDisbursementsQueryVariables>) {
          return Apollo.useLazyQuery<PurchaseOrderLoanDisbursementsQuery, PurchaseOrderLoanDisbursementsQueryVariables>(PurchaseOrderLoanDisbursementsDocument, baseOptions);
        }
export type PurchaseOrderLoanDisbursementsQueryHookResult = ReturnType<typeof usePurchaseOrderLoanDisbursementsQuery>;
export type PurchaseOrderLoanDisbursementsLazyQueryHookResult = ReturnType<typeof usePurchaseOrderLoanDisbursementsLazyQuery>;
export type PurchaseOrderLoanDisbursementsQueryResult = Apollo.QueryResult<PurchaseOrderLoanDisbursementsQuery, PurchaseOrderLoanDisbursementsQueryVariables>;
export const ListVendorsByCompanyDocument = gql`
    query ListVendorsByCompany($companyId: uuid!) {
  vendors(where: {company_vendor_partnerships: {company_id: {_eq: $companyId}}}) {
    id
    name
    company_vendor_partnerships {
      id
      approved_at
    }
  }
}
    `;

/**
 * __useListVendorsByCompanyQuery__
 *
 * To run a query within a React component, call `useListVendorsByCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useListVendorsByCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListVendorsByCompanyQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useListVendorsByCompanyQuery(baseOptions: Apollo.QueryHookOptions<ListVendorsByCompanyQuery, ListVendorsByCompanyQueryVariables>) {
        return Apollo.useQuery<ListVendorsByCompanyQuery, ListVendorsByCompanyQueryVariables>(ListVendorsByCompanyDocument, baseOptions);
      }
export function useListVendorsByCompanyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListVendorsByCompanyQuery, ListVendorsByCompanyQueryVariables>) {
          return Apollo.useLazyQuery<ListVendorsByCompanyQuery, ListVendorsByCompanyQueryVariables>(ListVendorsByCompanyDocument, baseOptions);
        }
export type ListVendorsByCompanyQueryHookResult = ReturnType<typeof useListVendorsByCompanyQuery>;
export type ListVendorsByCompanyLazyQueryHookResult = ReturnType<typeof useListVendorsByCompanyLazyQuery>;
export type ListVendorsByCompanyQueryResult = Apollo.QueryResult<ListVendorsByCompanyQuery, ListVendorsByCompanyQueryVariables>;
export const ListPurchaseOrdersDocument = gql`
    query ListPurchaseOrders($company_id: uuid!) {
  purchase_orders(where: {company_id: {_eq: $company_id}}) {
    ...PurchaseOrder
    company {
      id
      name
    }
  }
}
    ${PurchaseOrderFragmentDoc}`;

/**
 * __useListPurchaseOrdersQuery__
 *
 * To run a query within a React component, call `useListPurchaseOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPurchaseOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPurchaseOrdersQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function useListPurchaseOrdersQuery(baseOptions: Apollo.QueryHookOptions<ListPurchaseOrdersQuery, ListPurchaseOrdersQueryVariables>) {
        return Apollo.useQuery<ListPurchaseOrdersQuery, ListPurchaseOrdersQueryVariables>(ListPurchaseOrdersDocument, baseOptions);
      }
export function useListPurchaseOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListPurchaseOrdersQuery, ListPurchaseOrdersQueryVariables>) {
          return Apollo.useLazyQuery<ListPurchaseOrdersQuery, ListPurchaseOrdersQueryVariables>(ListPurchaseOrdersDocument, baseOptions);
        }
export type ListPurchaseOrdersQueryHookResult = ReturnType<typeof useListPurchaseOrdersQuery>;
export type ListPurchaseOrdersLazyQueryHookResult = ReturnType<typeof useListPurchaseOrdersLazyQuery>;
export type ListPurchaseOrdersQueryResult = Apollo.QueryResult<ListPurchaseOrdersQuery, ListPurchaseOrdersQueryVariables>;
export const ListPurchaseOrderVendorsDocument = gql`
    query ListPurchaseOrderVendors {
  vendors {
    id
    name
  }
}
    `;

/**
 * __useListPurchaseOrderVendorsQuery__
 *
 * To run a query within a React component, call `useListPurchaseOrderVendorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPurchaseOrderVendorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPurchaseOrderVendorsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListPurchaseOrderVendorsQuery(baseOptions?: Apollo.QueryHookOptions<ListPurchaseOrderVendorsQuery, ListPurchaseOrderVendorsQueryVariables>) {
        return Apollo.useQuery<ListPurchaseOrderVendorsQuery, ListPurchaseOrderVendorsQueryVariables>(ListPurchaseOrderVendorsDocument, baseOptions);
      }
export function useListPurchaseOrderVendorsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListPurchaseOrderVendorsQuery, ListPurchaseOrderVendorsQueryVariables>) {
          return Apollo.useLazyQuery<ListPurchaseOrderVendorsQuery, ListPurchaseOrderVendorsQueryVariables>(ListPurchaseOrderVendorsDocument, baseOptions);
        }
export type ListPurchaseOrderVendorsQueryHookResult = ReturnType<typeof useListPurchaseOrderVendorsQuery>;
export type ListPurchaseOrderVendorsLazyQueryHookResult = ReturnType<typeof useListPurchaseOrderVendorsLazyQuery>;
export type ListPurchaseOrderVendorsQueryResult = Apollo.QueryResult<ListPurchaseOrderVendorsQuery, ListPurchaseOrderVendorsQueryVariables>;
export const PurchaseOrderDocument = gql`
    query PurchaseOrder($id: uuid!) {
  purchase_orders_by_pk(id: $id) {
    ...PurchaseOrder
    purchase_order_files {
      ...PurchaseOrderFile
    }
  }
}
    ${PurchaseOrderFragmentDoc}
${PurchaseOrderFileFragmentDoc}`;

/**
 * __usePurchaseOrderQuery__
 *
 * To run a query within a React component, call `usePurchaseOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePurchaseOrderQuery(baseOptions: Apollo.QueryHookOptions<PurchaseOrderQuery, PurchaseOrderQueryVariables>) {
        return Apollo.useQuery<PurchaseOrderQuery, PurchaseOrderQueryVariables>(PurchaseOrderDocument, baseOptions);
      }
export function usePurchaseOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseOrderQuery, PurchaseOrderQueryVariables>) {
          return Apollo.useLazyQuery<PurchaseOrderQuery, PurchaseOrderQueryVariables>(PurchaseOrderDocument, baseOptions);
        }
export type PurchaseOrderQueryHookResult = ReturnType<typeof usePurchaseOrderQuery>;
export type PurchaseOrderLazyQueryHookResult = ReturnType<typeof usePurchaseOrderLazyQuery>;
export type PurchaseOrderQueryResult = Apollo.QueryResult<PurchaseOrderQuery, PurchaseOrderQueryVariables>;
export const PurchaseOrderForReviewDocument = gql`
    query PurchaseOrderForReview($id: uuid!) {
  purchase_orders_by_pk(id: $id) {
    id
    company_id
    vendor_id
    order_number
    order_date
    delivery_date
    amount
    is_cannabis
    status
    created_at
    purchase_order_files {
      purchase_order_id
      file_id
      ...PurchaseOrderFile
    }
    company {
      id
      name
    }
  }
}
    ${PurchaseOrderFileFragmentDoc}`;

/**
 * __usePurchaseOrderForReviewQuery__
 *
 * To run a query within a React component, call `usePurchaseOrderForReviewQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseOrderForReviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseOrderForReviewQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePurchaseOrderForReviewQuery(baseOptions: Apollo.QueryHookOptions<PurchaseOrderForReviewQuery, PurchaseOrderForReviewQueryVariables>) {
        return Apollo.useQuery<PurchaseOrderForReviewQuery, PurchaseOrderForReviewQueryVariables>(PurchaseOrderForReviewDocument, baseOptions);
      }
export function usePurchaseOrderForReviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PurchaseOrderForReviewQuery, PurchaseOrderForReviewQueryVariables>) {
          return Apollo.useLazyQuery<PurchaseOrderForReviewQuery, PurchaseOrderForReviewQueryVariables>(PurchaseOrderForReviewDocument, baseOptions);
        }
export type PurchaseOrderForReviewQueryHookResult = ReturnType<typeof usePurchaseOrderForReviewQuery>;
export type PurchaseOrderForReviewLazyQueryHookResult = ReturnType<typeof usePurchaseOrderForReviewLazyQuery>;
export type PurchaseOrderForReviewQueryResult = Apollo.QueryResult<PurchaseOrderForReviewQuery, PurchaseOrderForReviewQueryVariables>;
export const AddPurchaseOrderDocument = gql`
    mutation AddPurchaseOrder($purchase_order: purchase_orders_insert_input!) {
  insert_purchase_orders_one(object: $purchase_order) {
    ...PurchaseOrder
    purchase_order_files {
      ...PurchaseOrderFile
    }
  }
}
    ${PurchaseOrderFragmentDoc}
${PurchaseOrderFileFragmentDoc}`;
export type AddPurchaseOrderMutationFn = Apollo.MutationFunction<AddPurchaseOrderMutation, AddPurchaseOrderMutationVariables>;

/**
 * __useAddPurchaseOrderMutation__
 *
 * To run a mutation, you first call `useAddPurchaseOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPurchaseOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPurchaseOrderMutation, { data, loading, error }] = useAddPurchaseOrderMutation({
 *   variables: {
 *      purchase_order: // value for 'purchase_order'
 *   },
 * });
 */
export function useAddPurchaseOrderMutation(baseOptions?: Apollo.MutationHookOptions<AddPurchaseOrderMutation, AddPurchaseOrderMutationVariables>) {
        return Apollo.useMutation<AddPurchaseOrderMutation, AddPurchaseOrderMutationVariables>(AddPurchaseOrderDocument, baseOptions);
      }
export type AddPurchaseOrderMutationHookResult = ReturnType<typeof useAddPurchaseOrderMutation>;
export type AddPurchaseOrderMutationResult = Apollo.MutationResult<AddPurchaseOrderMutation>;
export type AddPurchaseOrderMutationOptions = Apollo.BaseMutationOptions<AddPurchaseOrderMutation, AddPurchaseOrderMutationVariables>;
export const UpdatePurchaseOrderDocument = gql`
    mutation UpdatePurchaseOrder($id: uuid!, $purchaseOrder: purchase_orders_set_input!, $purchaseOrderFiles: [purchase_order_files_insert_input!]!) {
  delete_purchase_order_files(where: {purchase_order_id: {_eq: $id}}) {
    affected_rows
  }
  insert_purchase_order_files(objects: $purchaseOrderFiles) {
    returning {
      purchase_order_id
      file_id
    }
  }
  update_purchase_orders_by_pk(pk_columns: {id: $id}, _set: $purchaseOrder) {
    ...PurchaseOrder
    purchase_order_files {
      ...PurchaseOrderFile
    }
  }
}
    ${PurchaseOrderFragmentDoc}
${PurchaseOrderFileFragmentDoc}`;
export type UpdatePurchaseOrderMutationFn = Apollo.MutationFunction<UpdatePurchaseOrderMutation, UpdatePurchaseOrderMutationVariables>;

/**
 * __useUpdatePurchaseOrderMutation__
 *
 * To run a mutation, you first call `useUpdatePurchaseOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePurchaseOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePurchaseOrderMutation, { data, loading, error }] = useUpdatePurchaseOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *      purchaseOrder: // value for 'purchaseOrder'
 *      purchaseOrderFiles: // value for 'purchaseOrderFiles'
 *   },
 * });
 */
export function useUpdatePurchaseOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePurchaseOrderMutation, UpdatePurchaseOrderMutationVariables>) {
        return Apollo.useMutation<UpdatePurchaseOrderMutation, UpdatePurchaseOrderMutationVariables>(UpdatePurchaseOrderDocument, baseOptions);
      }
export type UpdatePurchaseOrderMutationHookResult = ReturnType<typeof useUpdatePurchaseOrderMutation>;
export type UpdatePurchaseOrderMutationResult = Apollo.MutationResult<UpdatePurchaseOrderMutation>;
export type UpdatePurchaseOrderMutationOptions = Apollo.BaseMutationOptions<UpdatePurchaseOrderMutation, UpdatePurchaseOrderMutationVariables>;
export const UpdateVendorContactDocument = gql`
    mutation UpdateVendorContact($userId: uuid!, $contact: users_set_input!) {
  update_users_by_pk(pk_columns: {id: $userId}, _set: $contact) {
    ...Contact
  }
}
    ${ContactFragmentDoc}`;
export type UpdateVendorContactMutationFn = Apollo.MutationFunction<UpdateVendorContactMutation, UpdateVendorContactMutationVariables>;

/**
 * __useUpdateVendorContactMutation__
 *
 * To run a mutation, you first call `useUpdateVendorContactMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVendorContactMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVendorContactMutation, { data, loading, error }] = useUpdateVendorContactMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      contact: // value for 'contact'
 *   },
 * });
 */
export function useUpdateVendorContactMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVendorContactMutation, UpdateVendorContactMutationVariables>) {
        return Apollo.useMutation<UpdateVendorContactMutation, UpdateVendorContactMutationVariables>(UpdateVendorContactDocument, baseOptions);
      }
export type UpdateVendorContactMutationHookResult = ReturnType<typeof useUpdateVendorContactMutation>;
export type UpdateVendorContactMutationResult = Apollo.MutationResult<UpdateVendorContactMutation>;
export type UpdateVendorContactMutationOptions = Apollo.BaseMutationOptions<UpdateVendorContactMutation, UpdateVendorContactMutationVariables>;
export const DeleteVendorContactDocument = gql`
    mutation DeleteVendorContact($userId: uuid!) {
  delete_users_by_pk(id: $userId) {
    id
  }
}
    `;
export type DeleteVendorContactMutationFn = Apollo.MutationFunction<DeleteVendorContactMutation, DeleteVendorContactMutationVariables>;

/**
 * __useDeleteVendorContactMutation__
 *
 * To run a mutation, you first call `useDeleteVendorContactMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteVendorContactMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteVendorContactMutation, { data, loading, error }] = useDeleteVendorContactMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteVendorContactMutation(baseOptions?: Apollo.MutationHookOptions<DeleteVendorContactMutation, DeleteVendorContactMutationVariables>) {
        return Apollo.useMutation<DeleteVendorContactMutation, DeleteVendorContactMutationVariables>(DeleteVendorContactDocument, baseOptions);
      }
export type DeleteVendorContactMutationHookResult = ReturnType<typeof useDeleteVendorContactMutation>;
export type DeleteVendorContactMutationResult = Apollo.MutationResult<DeleteVendorContactMutation>;
export type DeleteVendorContactMutationOptions = Apollo.BaseMutationOptions<DeleteVendorContactMutation, DeleteVendorContactMutationVariables>;
export const AddVendorContactDocument = gql`
    mutation AddVendorContact($contact: users_insert_input!) {
  insert_users_one(object: $contact) {
    ...Contact
  }
}
    ${ContactFragmentDoc}`;
export type AddVendorContactMutationFn = Apollo.MutationFunction<AddVendorContactMutation, AddVendorContactMutationVariables>;

/**
 * __useAddVendorContactMutation__
 *
 * To run a mutation, you first call `useAddVendorContactMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddVendorContactMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addVendorContactMutation, { data, loading, error }] = useAddVendorContactMutation({
 *   variables: {
 *      contact: // value for 'contact'
 *   },
 * });
 */
export function useAddVendorContactMutation(baseOptions?: Apollo.MutationHookOptions<AddVendorContactMutation, AddVendorContactMutationVariables>) {
        return Apollo.useMutation<AddVendorContactMutation, AddVendorContactMutationVariables>(AddVendorContactDocument, baseOptions);
      }
export type AddVendorContactMutationHookResult = ReturnType<typeof useAddVendorContactMutation>;
export type AddVendorContactMutationResult = Apollo.MutationResult<AddVendorContactMutation>;
export type AddVendorContactMutationOptions = Apollo.BaseMutationOptions<AddVendorContactMutation, AddVendorContactMutationVariables>;
export const BankListVendorPartnershipsDocument = gql`
    query BankListVendorPartnerships {
  company_vendor_partnerships {
    ...BankVendorPartnership
    vendor {
      ...Vendor
      settings {
        id
      }
      users {
        ...Contact
      }
    }
    vendor_bank_account {
      id
      verified_at
    }
  }
}
    ${BankVendorPartnershipFragmentDoc}
${VendorFragmentDoc}
${ContactFragmentDoc}`;

/**
 * __useBankListVendorPartnershipsQuery__
 *
 * To run a query within a React component, call `useBankListVendorPartnershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBankListVendorPartnershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBankListVendorPartnershipsQuery({
 *   variables: {
 *   },
 * });
 */
export function useBankListVendorPartnershipsQuery(baseOptions?: Apollo.QueryHookOptions<BankListVendorPartnershipsQuery, BankListVendorPartnershipsQueryVariables>) {
        return Apollo.useQuery<BankListVendorPartnershipsQuery, BankListVendorPartnershipsQueryVariables>(BankListVendorPartnershipsDocument, baseOptions);
      }
export function useBankListVendorPartnershipsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BankListVendorPartnershipsQuery, BankListVendorPartnershipsQueryVariables>) {
          return Apollo.useLazyQuery<BankListVendorPartnershipsQuery, BankListVendorPartnershipsQueryVariables>(BankListVendorPartnershipsDocument, baseOptions);
        }
export type BankListVendorPartnershipsQueryHookResult = ReturnType<typeof useBankListVendorPartnershipsQuery>;
export type BankListVendorPartnershipsLazyQueryHookResult = ReturnType<typeof useBankListVendorPartnershipsLazyQuery>;
export type BankListVendorPartnershipsQueryResult = Apollo.QueryResult<BankListVendorPartnershipsQuery, BankListVendorPartnershipsQueryVariables>;
export const BankVendorPartnershipDocument = gql`
    query BankVendorPartnership($id: uuid!) {
  company_vendor_partnerships_by_pk(id: $id) {
    ...BankVendorPartnership
    vendor {
      ...Vendor
      settings {
        id
        collections_bespoke_bank_account {
          ...BankAccount
        }
        advances_bespoke_bank_account {
          ...BankAccount
        }
      }
      users {
        ...Contact
      }
      settings {
        collections_bespoke_bank_account {
          ...BankAccount
        }
        advances_bespoke_bank_account {
          ...BankAccount
        }
      }
    }
    company {
      ...Company
      users {
        ...Contact
      }
      settings {
        ...CompanySettings
      }
    }
    company_agreement {
      ...CompanyAgreement
    }
    company_license {
      ...CompanyLicense
    }
  }
}
    ${BankVendorPartnershipFragmentDoc}
${VendorFragmentDoc}
${BankAccountFragmentDoc}
${ContactFragmentDoc}
${CompanyFragmentDoc}
${CompanySettingsFragmentDoc}
${CompanyAgreementFragmentDoc}
${CompanyLicenseFragmentDoc}`;

/**
 * __useBankVendorPartnershipQuery__
 *
 * To run a query within a React component, call `useBankVendorPartnershipQuery` and pass it any options that fit your needs.
 * When your component renders, `useBankVendorPartnershipQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBankVendorPartnershipQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useBankVendorPartnershipQuery(baseOptions: Apollo.QueryHookOptions<BankVendorPartnershipQuery, BankVendorPartnershipQueryVariables>) {
        return Apollo.useQuery<BankVendorPartnershipQuery, BankVendorPartnershipQueryVariables>(BankVendorPartnershipDocument, baseOptions);
      }
export function useBankVendorPartnershipLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BankVendorPartnershipQuery, BankVendorPartnershipQueryVariables>) {
          return Apollo.useLazyQuery<BankVendorPartnershipQuery, BankVendorPartnershipQueryVariables>(BankVendorPartnershipDocument, baseOptions);
        }
export type BankVendorPartnershipQueryHookResult = ReturnType<typeof useBankVendorPartnershipQuery>;
export type BankVendorPartnershipLazyQueryHookResult = ReturnType<typeof useBankVendorPartnershipLazyQuery>;
export type BankVendorPartnershipQueryResult = Apollo.QueryResult<BankVendorPartnershipQuery, BankVendorPartnershipQueryVariables>;
export const CompanyBankAccountsDocument = gql`
    query CompanyBankAccounts($companyId: uuid!) {
  bank_accounts(where: {company_id: {_eq: $companyId}}) {
    ...BankAccount
  }
}
    ${BankAccountFragmentDoc}`;

/**
 * __useCompanyBankAccountsQuery__
 *
 * To run a query within a React component, call `useCompanyBankAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyBankAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyBankAccountsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useCompanyBankAccountsQuery(baseOptions: Apollo.QueryHookOptions<CompanyBankAccountsQuery, CompanyBankAccountsQueryVariables>) {
        return Apollo.useQuery<CompanyBankAccountsQuery, CompanyBankAccountsQueryVariables>(CompanyBankAccountsDocument, baseOptions);
      }
export function useCompanyBankAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CompanyBankAccountsQuery, CompanyBankAccountsQueryVariables>) {
          return Apollo.useLazyQuery<CompanyBankAccountsQuery, CompanyBankAccountsQueryVariables>(CompanyBankAccountsDocument, baseOptions);
        }
export type CompanyBankAccountsQueryHookResult = ReturnType<typeof useCompanyBankAccountsQuery>;
export type CompanyBankAccountsLazyQueryHookResult = ReturnType<typeof useCompanyBankAccountsLazyQuery>;
export type CompanyBankAccountsQueryResult = Apollo.QueryResult<CompanyBankAccountsQuery, CompanyBankAccountsQueryVariables>;
export const AddBankAccountDocument = gql`
    mutation AddBankAccount($bankAccount: bank_accounts_insert_input!) {
  insert_bank_accounts_one(object: $bankAccount) {
    ...BankAccount
  }
}
    ${BankAccountFragmentDoc}`;
export type AddBankAccountMutationFn = Apollo.MutationFunction<AddBankAccountMutation, AddBankAccountMutationVariables>;

/**
 * __useAddBankAccountMutation__
 *
 * To run a mutation, you first call `useAddBankAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddBankAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addBankAccountMutation, { data, loading, error }] = useAddBankAccountMutation({
 *   variables: {
 *      bankAccount: // value for 'bankAccount'
 *   },
 * });
 */
export function useAddBankAccountMutation(baseOptions?: Apollo.MutationHookOptions<AddBankAccountMutation, AddBankAccountMutationVariables>) {
        return Apollo.useMutation<AddBankAccountMutation, AddBankAccountMutationVariables>(AddBankAccountDocument, baseOptions);
      }
export type AddBankAccountMutationHookResult = ReturnType<typeof useAddBankAccountMutation>;
export type AddBankAccountMutationResult = Apollo.MutationResult<AddBankAccountMutation>;
export type AddBankAccountMutationOptions = Apollo.BaseMutationOptions<AddBankAccountMutation, AddBankAccountMutationVariables>;
export const UpdateBankAccountDocument = gql`
    mutation UpdateBankAccount($id: uuid!, $bankAccount: bank_accounts_set_input) {
  update_bank_accounts_by_pk(pk_columns: {id: $id}, _set: $bankAccount) {
    ...BankAccount
  }
}
    ${BankAccountFragmentDoc}`;
export type UpdateBankAccountMutationFn = Apollo.MutationFunction<UpdateBankAccountMutation, UpdateBankAccountMutationVariables>;

/**
 * __useUpdateBankAccountMutation__
 *
 * To run a mutation, you first call `useUpdateBankAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateBankAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateBankAccountMutation, { data, loading, error }] = useUpdateBankAccountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      bankAccount: // value for 'bankAccount'
 *   },
 * });
 */
export function useUpdateBankAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateBankAccountMutation, UpdateBankAccountMutationVariables>) {
        return Apollo.useMutation<UpdateBankAccountMutation, UpdateBankAccountMutationVariables>(UpdateBankAccountDocument, baseOptions);
      }
export type UpdateBankAccountMutationHookResult = ReturnType<typeof useUpdateBankAccountMutation>;
export type UpdateBankAccountMutationResult = Apollo.MutationResult<UpdateBankAccountMutation>;
export type UpdateBankAccountMutationOptions = Apollo.BaseMutationOptions<UpdateBankAccountMutation, UpdateBankAccountMutationVariables>;
export const ChangeBankAccountDocument = gql`
    mutation ChangeBankAccount($companyVendorPartnershipId: uuid!, $bankAccountId: uuid) {
  update_company_vendor_partnerships_by_pk(
    pk_columns: {id: $companyVendorPartnershipId}
    _set: {vendor_bank_id: $bankAccountId}
  ) {
    id
    vendor_bank_account {
      ...BankAccount
    }
  }
}
    ${BankAccountFragmentDoc}`;
export type ChangeBankAccountMutationFn = Apollo.MutationFunction<ChangeBankAccountMutation, ChangeBankAccountMutationVariables>;

/**
 * __useChangeBankAccountMutation__
 *
 * To run a mutation, you first call `useChangeBankAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeBankAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeBankAccountMutation, { data, loading, error }] = useChangeBankAccountMutation({
 *   variables: {
 *      companyVendorPartnershipId: // value for 'companyVendorPartnershipId'
 *      bankAccountId: // value for 'bankAccountId'
 *   },
 * });
 */
export function useChangeBankAccountMutation(baseOptions?: Apollo.MutationHookOptions<ChangeBankAccountMutation, ChangeBankAccountMutationVariables>) {
        return Apollo.useMutation<ChangeBankAccountMutation, ChangeBankAccountMutationVariables>(ChangeBankAccountDocument, baseOptions);
      }
export type ChangeBankAccountMutationHookResult = ReturnType<typeof useChangeBankAccountMutation>;
export type ChangeBankAccountMutationResult = Apollo.MutationResult<ChangeBankAccountMutation>;
export type ChangeBankAccountMutationOptions = Apollo.BaseMutationOptions<ChangeBankAccountMutation, ChangeBankAccountMutationVariables>;
export const UpdateCompanyVendorPartnershipApprovedAtDocument = gql`
    mutation UpdateCompanyVendorPartnershipApprovedAt($companyVendorPartnershipId: uuid!, $approvedAt: timestamptz) {
  update_company_vendor_partnerships_by_pk(
    pk_columns: {id: $companyVendorPartnershipId}
    _set: {approved_at: $approvedAt}
  ) {
    ...BankVendorPartnership
  }
}
    ${BankVendorPartnershipFragmentDoc}`;
export type UpdateCompanyVendorPartnershipApprovedAtMutationFn = Apollo.MutationFunction<UpdateCompanyVendorPartnershipApprovedAtMutation, UpdateCompanyVendorPartnershipApprovedAtMutationVariables>;

/**
 * __useUpdateCompanyVendorPartnershipApprovedAtMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyVendorPartnershipApprovedAtMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyVendorPartnershipApprovedAtMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyVendorPartnershipApprovedAtMutation, { data, loading, error }] = useUpdateCompanyVendorPartnershipApprovedAtMutation({
 *   variables: {
 *      companyVendorPartnershipId: // value for 'companyVendorPartnershipId'
 *      approvedAt: // value for 'approvedAt'
 *   },
 * });
 */
export function useUpdateCompanyVendorPartnershipApprovedAtMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCompanyVendorPartnershipApprovedAtMutation, UpdateCompanyVendorPartnershipApprovedAtMutationVariables>) {
        return Apollo.useMutation<UpdateCompanyVendorPartnershipApprovedAtMutation, UpdateCompanyVendorPartnershipApprovedAtMutationVariables>(UpdateCompanyVendorPartnershipApprovedAtDocument, baseOptions);
      }
export type UpdateCompanyVendorPartnershipApprovedAtMutationHookResult = ReturnType<typeof useUpdateCompanyVendorPartnershipApprovedAtMutation>;
export type UpdateCompanyVendorPartnershipApprovedAtMutationResult = Apollo.MutationResult<UpdateCompanyVendorPartnershipApprovedAtMutation>;
export type UpdateCompanyVendorPartnershipApprovedAtMutationOptions = Apollo.BaseMutationOptions<UpdateCompanyVendorPartnershipApprovedAtMutation, UpdateCompanyVendorPartnershipApprovedAtMutationVariables>;
export const UpdateVendorInfoDocument = gql`
    mutation UpdateVendorInfo($id: uuid!, $company: companies_set_input!) {
  update_companies_by_pk(pk_columns: {id: $id}, _set: $company) {
    ...Vendor
  }
}
    ${VendorFragmentDoc}`;
export type UpdateVendorInfoMutationFn = Apollo.MutationFunction<UpdateVendorInfoMutation, UpdateVendorInfoMutationVariables>;

/**
 * __useUpdateVendorInfoMutation__
 *
 * To run a mutation, you first call `useUpdateVendorInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVendorInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVendorInfoMutation, { data, loading, error }] = useUpdateVendorInfoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      company: // value for 'company'
 *   },
 * });
 */
export function useUpdateVendorInfoMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVendorInfoMutation, UpdateVendorInfoMutationVariables>) {
        return Apollo.useMutation<UpdateVendorInfoMutation, UpdateVendorInfoMutationVariables>(UpdateVendorInfoDocument, baseOptions);
      }
export type UpdateVendorInfoMutationHookResult = ReturnType<typeof useUpdateVendorInfoMutation>;
export type UpdateVendorInfoMutationResult = Apollo.MutationResult<UpdateVendorInfoMutation>;
export type UpdateVendorInfoMutationOptions = Apollo.BaseMutationOptions<UpdateVendorInfoMutation, UpdateVendorInfoMutationVariables>;
export const UpdateVendorAgreementIdDocument = gql`
    mutation UpdateVendorAgreementId($companyVendorPartnershipId: uuid!, $vendorAgreementId: uuid) {
  update_company_vendor_partnerships_by_pk(
    pk_columns: {id: $companyVendorPartnershipId}
    _set: {vendor_agreement_id: $vendorAgreementId}
  ) {
    id
    company_agreement {
      ...CompanyAgreement
    }
  }
}
    ${CompanyAgreementFragmentDoc}`;
export type UpdateVendorAgreementIdMutationFn = Apollo.MutationFunction<UpdateVendorAgreementIdMutation, UpdateVendorAgreementIdMutationVariables>;

/**
 * __useUpdateVendorAgreementIdMutation__
 *
 * To run a mutation, you first call `useUpdateVendorAgreementIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVendorAgreementIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVendorAgreementIdMutation, { data, loading, error }] = useUpdateVendorAgreementIdMutation({
 *   variables: {
 *      companyVendorPartnershipId: // value for 'companyVendorPartnershipId'
 *      vendorAgreementId: // value for 'vendorAgreementId'
 *   },
 * });
 */
export function useUpdateVendorAgreementIdMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVendorAgreementIdMutation, UpdateVendorAgreementIdMutationVariables>) {
        return Apollo.useMutation<UpdateVendorAgreementIdMutation, UpdateVendorAgreementIdMutationVariables>(UpdateVendorAgreementIdDocument, baseOptions);
      }
export type UpdateVendorAgreementIdMutationHookResult = ReturnType<typeof useUpdateVendorAgreementIdMutation>;
export type UpdateVendorAgreementIdMutationResult = Apollo.MutationResult<UpdateVendorAgreementIdMutation>;
export type UpdateVendorAgreementIdMutationOptions = Apollo.BaseMutationOptions<UpdateVendorAgreementIdMutation, UpdateVendorAgreementIdMutationVariables>;
export const AddCompanyVendorAgreementDocument = gql`
    mutation AddCompanyVendorAgreement($vendorAgreement: company_agreements_insert_input!) {
  insert_company_agreements_one(object: $vendorAgreement) {
    ...CompanyAgreement
  }
}
    ${CompanyAgreementFragmentDoc}`;
export type AddCompanyVendorAgreementMutationFn = Apollo.MutationFunction<AddCompanyVendorAgreementMutation, AddCompanyVendorAgreementMutationVariables>;

/**
 * __useAddCompanyVendorAgreementMutation__
 *
 * To run a mutation, you first call `useAddCompanyVendorAgreementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCompanyVendorAgreementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCompanyVendorAgreementMutation, { data, loading, error }] = useAddCompanyVendorAgreementMutation({
 *   variables: {
 *      vendorAgreement: // value for 'vendorAgreement'
 *   },
 * });
 */
export function useAddCompanyVendorAgreementMutation(baseOptions?: Apollo.MutationHookOptions<AddCompanyVendorAgreementMutation, AddCompanyVendorAgreementMutationVariables>) {
        return Apollo.useMutation<AddCompanyVendorAgreementMutation, AddCompanyVendorAgreementMutationVariables>(AddCompanyVendorAgreementDocument, baseOptions);
      }
export type AddCompanyVendorAgreementMutationHookResult = ReturnType<typeof useAddCompanyVendorAgreementMutation>;
export type AddCompanyVendorAgreementMutationResult = Apollo.MutationResult<AddCompanyVendorAgreementMutation>;
export type AddCompanyVendorAgreementMutationOptions = Apollo.BaseMutationOptions<AddCompanyVendorAgreementMutation, AddCompanyVendorAgreementMutationVariables>;
export const UpdateVendorLicenseIdDocument = gql`
    mutation UpdateVendorLicenseId($companyVendorPartnershipId: uuid!, $vendorLicenseId: uuid!) {
  update_company_vendor_partnerships_by_pk(
    pk_columns: {id: $companyVendorPartnershipId}
    _set: {vendor_license_id: $vendorLicenseId}
  ) {
    id
    company_license {
      ...CompanyLicense
    }
  }
}
    ${CompanyLicenseFragmentDoc}`;
export type UpdateVendorLicenseIdMutationFn = Apollo.MutationFunction<UpdateVendorLicenseIdMutation, UpdateVendorLicenseIdMutationVariables>;

/**
 * __useUpdateVendorLicenseIdMutation__
 *
 * To run a mutation, you first call `useUpdateVendorLicenseIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVendorLicenseIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVendorLicenseIdMutation, { data, loading, error }] = useUpdateVendorLicenseIdMutation({
 *   variables: {
 *      companyVendorPartnershipId: // value for 'companyVendorPartnershipId'
 *      vendorLicenseId: // value for 'vendorLicenseId'
 *   },
 * });
 */
export function useUpdateVendorLicenseIdMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVendorLicenseIdMutation, UpdateVendorLicenseIdMutationVariables>) {
        return Apollo.useMutation<UpdateVendorLicenseIdMutation, UpdateVendorLicenseIdMutationVariables>(UpdateVendorLicenseIdDocument, baseOptions);
      }
export type UpdateVendorLicenseIdMutationHookResult = ReturnType<typeof useUpdateVendorLicenseIdMutation>;
export type UpdateVendorLicenseIdMutationResult = Apollo.MutationResult<UpdateVendorLicenseIdMutation>;
export type UpdateVendorLicenseIdMutationOptions = Apollo.BaseMutationOptions<UpdateVendorLicenseIdMutation, UpdateVendorLicenseIdMutationVariables>;
export const AddCompanyVendorLicenseDocument = gql`
    mutation AddCompanyVendorLicense($vendorLicense: company_licenses_insert_input!) {
  insert_company_licenses_one(object: $vendorLicense) {
    ...CompanyLicense
  }
}
    ${CompanyLicenseFragmentDoc}`;
export type AddCompanyVendorLicenseMutationFn = Apollo.MutationFunction<AddCompanyVendorLicenseMutation, AddCompanyVendorLicenseMutationVariables>;

/**
 * __useAddCompanyVendorLicenseMutation__
 *
 * To run a mutation, you first call `useAddCompanyVendorLicenseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCompanyVendorLicenseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCompanyVendorLicenseMutation, { data, loading, error }] = useAddCompanyVendorLicenseMutation({
 *   variables: {
 *      vendorLicense: // value for 'vendorLicense'
 *   },
 * });
 */
export function useAddCompanyVendorLicenseMutation(baseOptions?: Apollo.MutationHookOptions<AddCompanyVendorLicenseMutation, AddCompanyVendorLicenseMutationVariables>) {
        return Apollo.useMutation<AddCompanyVendorLicenseMutation, AddCompanyVendorLicenseMutationVariables>(AddCompanyVendorLicenseDocument, baseOptions);
      }
export type AddCompanyVendorLicenseMutationHookResult = ReturnType<typeof useAddCompanyVendorLicenseMutation>;
export type AddCompanyVendorLicenseMutationResult = Apollo.MutationResult<AddCompanyVendorLicenseMutation>;
export type AddCompanyVendorLicenseMutationOptions = Apollo.BaseMutationOptions<AddCompanyVendorLicenseMutation, AddCompanyVendorLicenseMutationVariables>;
export const AddVendorPartnershipDocument = gql`
    mutation AddVendorPartnership($vendorPartnership: company_vendor_partnerships_insert_input!) {
  insert_company_vendor_partnerships_one(object: $vendorPartnership) {
    ...VendorPartnership
    vendor_limited {
      ...VendorLimited
    }
  }
}
    ${VendorPartnershipFragmentDoc}
${VendorLimitedFragmentDoc}`;
export type AddVendorPartnershipMutationFn = Apollo.MutationFunction<AddVendorPartnershipMutation, AddVendorPartnershipMutationVariables>;

/**
 * __useAddVendorPartnershipMutation__
 *
 * To run a mutation, you first call `useAddVendorPartnershipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddVendorPartnershipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addVendorPartnershipMutation, { data, loading, error }] = useAddVendorPartnershipMutation({
 *   variables: {
 *      vendorPartnership: // value for 'vendorPartnership'
 *   },
 * });
 */
export function useAddVendorPartnershipMutation(baseOptions?: Apollo.MutationHookOptions<AddVendorPartnershipMutation, AddVendorPartnershipMutationVariables>) {
        return Apollo.useMutation<AddVendorPartnershipMutation, AddVendorPartnershipMutationVariables>(AddVendorPartnershipDocument, baseOptions);
      }
export type AddVendorPartnershipMutationHookResult = ReturnType<typeof useAddVendorPartnershipMutation>;
export type AddVendorPartnershipMutationResult = Apollo.MutationResult<AddVendorPartnershipMutation>;
export type AddVendorPartnershipMutationOptions = Apollo.BaseMutationOptions<AddVendorPartnershipMutation, AddVendorPartnershipMutationVariables>;
export const ListVendorPartnershipsDocument = gql`
    query ListVendorPartnerships($companyId: uuid!) {
  company_vendor_partnerships(where: {company_id: {_eq: $companyId}}) {
    ...VendorPartnership
    vendor_limited {
      ...VendorLimited
    }
    vendor_bank_account {
      id
      verified_at
    }
  }
}
    ${VendorPartnershipFragmentDoc}
${VendorLimitedFragmentDoc}`;

/**
 * __useListVendorPartnershipsQuery__
 *
 * To run a query within a React component, call `useListVendorPartnershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListVendorPartnershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListVendorPartnershipsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useListVendorPartnershipsQuery(baseOptions: Apollo.QueryHookOptions<ListVendorPartnershipsQuery, ListVendorPartnershipsQueryVariables>) {
        return Apollo.useQuery<ListVendorPartnershipsQuery, ListVendorPartnershipsQueryVariables>(ListVendorPartnershipsDocument, baseOptions);
      }
export function useListVendorPartnershipsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListVendorPartnershipsQuery, ListVendorPartnershipsQueryVariables>) {
          return Apollo.useLazyQuery<ListVendorPartnershipsQuery, ListVendorPartnershipsQueryVariables>(ListVendorPartnershipsDocument, baseOptions);
        }
export type ListVendorPartnershipsQueryHookResult = ReturnType<typeof useListVendorPartnershipsQuery>;
export type ListVendorPartnershipsLazyQueryHookResult = ReturnType<typeof useListVendorPartnershipsLazyQuery>;
export type ListVendorPartnershipsQueryResult = Apollo.QueryResult<ListVendorPartnershipsQuery, ListVendorPartnershipsQueryVariables>;
export const BankAccountsDocument = gql`
    query BankAccounts {
  bank_accounts(where: {company_id: {_is_null: true}}) {
    ...BankAccount
  }
}
    ${BankAccountFragmentDoc}`;

/**
 * __useBankAccountsQuery__
 *
 * To run a query within a React component, call `useBankAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBankAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBankAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useBankAccountsQuery(baseOptions?: Apollo.QueryHookOptions<BankAccountsQuery, BankAccountsQueryVariables>) {
        return Apollo.useQuery<BankAccountsQuery, BankAccountsQueryVariables>(BankAccountsDocument, baseOptions);
      }
export function useBankAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BankAccountsQuery, BankAccountsQueryVariables>) {
          return Apollo.useLazyQuery<BankAccountsQuery, BankAccountsQueryVariables>(BankAccountsDocument, baseOptions);
        }
export type BankAccountsQueryHookResult = ReturnType<typeof useBankAccountsQuery>;
export type BankAccountsLazyQueryHookResult = ReturnType<typeof useBankAccountsLazyQuery>;
export type BankAccountsQueryResult = Apollo.QueryResult<BankAccountsQuery, BankAccountsQueryVariables>;
export const BankCustomersDocument = gql`
    query BankCustomers {
  companies(where: {is_vendor: {_eq: false}}) {
    ...BankCustomer
  }
}
    ${BankCustomerFragmentDoc}`;

/**
 * __useBankCustomersQuery__
 *
 * To run a query within a React component, call `useBankCustomersQuery` and pass it any options that fit your needs.
 * When your component renders, `useBankCustomersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBankCustomersQuery({
 *   variables: {
 *   },
 * });
 */
export function useBankCustomersQuery(baseOptions?: Apollo.QueryHookOptions<BankCustomersQuery, BankCustomersQueryVariables>) {
        return Apollo.useQuery<BankCustomersQuery, BankCustomersQueryVariables>(BankCustomersDocument, baseOptions);
      }
export function useBankCustomersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<BankCustomersQuery, BankCustomersQueryVariables>) {
          return Apollo.useLazyQuery<BankCustomersQuery, BankCustomersQueryVariables>(BankCustomersDocument, baseOptions);
        }
export type BankCustomersQueryHookResult = ReturnType<typeof useBankCustomersQuery>;
export type BankCustomersLazyQueryHookResult = ReturnType<typeof useBankCustomersLazyQuery>;
export type BankCustomersQueryResult = Apollo.QueryResult<BankCustomersQuery, BankCustomersQueryVariables>;
export const CompanyVendorsDocument = gql`
    query CompanyVendors($companyId: uuid!) {
  company_vendor_partnerships(where: {company_id: {_eq: $companyId}}) {
    vendor {
      name
    }
  }
}
    `;

/**
 * __useCompanyVendorsQuery__
 *
 * To run a query within a React component, call `useCompanyVendorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyVendorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyVendorsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useCompanyVendorsQuery(baseOptions: Apollo.QueryHookOptions<CompanyVendorsQuery, CompanyVendorsQueryVariables>) {
        return Apollo.useQuery<CompanyVendorsQuery, CompanyVendorsQueryVariables>(CompanyVendorsDocument, baseOptions);
      }
export function useCompanyVendorsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CompanyVendorsQuery, CompanyVendorsQueryVariables>) {
          return Apollo.useLazyQuery<CompanyVendorsQuery, CompanyVendorsQueryVariables>(CompanyVendorsDocument, baseOptions);
        }
export type CompanyVendorsQueryHookResult = ReturnType<typeof useCompanyVendorsQuery>;
export type CompanyVendorsLazyQueryHookResult = ReturnType<typeof useCompanyVendorsLazyQuery>;
export type CompanyVendorsQueryResult = Apollo.QueryResult<CompanyVendorsQuery, CompanyVendorsQueryVariables>;
export const UserByIdDocument = gql`
    query UserById($id: uuid!) {
  users_by_pk(id: $id) {
    ...User
  }
}
    ${UserFragmentDoc}`;

/**
 * __useUserByIdQuery__
 *
 * To run a query within a React component, call `useUserByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserByIdQuery(baseOptions: Apollo.QueryHookOptions<UserByIdQuery, UserByIdQueryVariables>) {
        return Apollo.useQuery<UserByIdQuery, UserByIdQueryVariables>(UserByIdDocument, baseOptions);
      }
export function useUserByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserByIdQuery, UserByIdQueryVariables>) {
          return Apollo.useLazyQuery<UserByIdQuery, UserByIdQueryVariables>(UserByIdDocument, baseOptions);
        }
export type UserByIdQueryHookResult = ReturnType<typeof useUserByIdQuery>;
export type UserByIdLazyQueryHookResult = ReturnType<typeof useUserByIdLazyQuery>;
export type UserByIdQueryResult = Apollo.QueryResult<UserByIdQuery, UserByIdQueryVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: uuid!, $user: users_set_input!) {
  update_users_by_pk(pk_columns: {id: $id}, _set: $user) {
    ...User
  }
}
    ${UserFragmentDoc}`;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      user: // value for 'user'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, baseOptions);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const UsersByEmailDocument = gql`
    query UsersByEmail($email: String!) {
  users(where: {email: {_eq: $email}}) {
    id
    company_id
    role
  }
}
    `;

/**
 * __useUsersByEmailQuery__
 *
 * To run a query within a React component, call `useUsersByEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersByEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersByEmailQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useUsersByEmailQuery(baseOptions: Apollo.QueryHookOptions<UsersByEmailQuery, UsersByEmailQueryVariables>) {
        return Apollo.useQuery<UsersByEmailQuery, UsersByEmailQueryVariables>(UsersByEmailDocument, baseOptions);
      }
export function useUsersByEmailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersByEmailQuery, UsersByEmailQueryVariables>) {
          return Apollo.useLazyQuery<UsersByEmailQuery, UsersByEmailQueryVariables>(UsersByEmailDocument, baseOptions);
        }
export type UsersByEmailQueryHookResult = ReturnType<typeof useUsersByEmailQuery>;
export type UsersByEmailLazyQueryHookResult = ReturnType<typeof useUsersByEmailLazyQuery>;
export type UsersByEmailQueryResult = Apollo.QueryResult<UsersByEmailQuery, UsersByEmailQueryVariables>;
export const ListUsersByRoleDocument = gql`
    query ListUsersByRole($role: user_roles_enum) {
  users(where: {role: {_eq: $role}}) {
    ...User
  }
}
    ${UserFragmentDoc}`;

/**
 * __useListUsersByRoleQuery__
 *
 * To run a query within a React component, call `useListUsersByRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useListUsersByRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListUsersByRoleQuery({
 *   variables: {
 *      role: // value for 'role'
 *   },
 * });
 */
export function useListUsersByRoleQuery(baseOptions?: Apollo.QueryHookOptions<ListUsersByRoleQuery, ListUsersByRoleQueryVariables>) {
        return Apollo.useQuery<ListUsersByRoleQuery, ListUsersByRoleQueryVariables>(ListUsersByRoleDocument, baseOptions);
      }
export function useListUsersByRoleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListUsersByRoleQuery, ListUsersByRoleQueryVariables>) {
          return Apollo.useLazyQuery<ListUsersByRoleQuery, ListUsersByRoleQueryVariables>(ListUsersByRoleDocument, baseOptions);
        }
export type ListUsersByRoleQueryHookResult = ReturnType<typeof useListUsersByRoleQuery>;
export type ListUsersByRoleLazyQueryHookResult = ReturnType<typeof useListUsersByRoleLazyQuery>;
export type ListUsersByRoleQueryResult = Apollo.QueryResult<ListUsersByRoleQuery, ListUsersByRoleQueryVariables>;
export const ListUsersByCompanyIdDocument = gql`
    query ListUsersByCompanyId($companyId: uuid!) {
  users(where: {company_id: {_eq: $companyId}}) {
    ...User
  }
}
    ${UserFragmentDoc}`;

/**
 * __useListUsersByCompanyIdQuery__
 *
 * To run a query within a React component, call `useListUsersByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useListUsersByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListUsersByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useListUsersByCompanyIdQuery(baseOptions: Apollo.QueryHookOptions<ListUsersByCompanyIdQuery, ListUsersByCompanyIdQueryVariables>) {
        return Apollo.useQuery<ListUsersByCompanyIdQuery, ListUsersByCompanyIdQueryVariables>(ListUsersByCompanyIdDocument, baseOptions);
      }
export function useListUsersByCompanyIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListUsersByCompanyIdQuery, ListUsersByCompanyIdQueryVariables>) {
          return Apollo.useLazyQuery<ListUsersByCompanyIdQuery, ListUsersByCompanyIdQueryVariables>(ListUsersByCompanyIdDocument, baseOptions);
        }
export type ListUsersByCompanyIdQueryHookResult = ReturnType<typeof useListUsersByCompanyIdQuery>;
export type ListUsersByCompanyIdLazyQueryHookResult = ReturnType<typeof useListUsersByCompanyIdLazyQuery>;
export type ListUsersByCompanyIdQueryResult = Apollo.QueryResult<ListUsersByCompanyIdQuery, ListUsersByCompanyIdQueryVariables>;
export const AddUserDocument = gql`
    mutation AddUser($user: users_insert_input!) {
  insert_users_one(object: $user) {
    ...User
  }
}
    ${UserFragmentDoc}`;
export type AddUserMutationFn = Apollo.MutationFunction<AddUserMutation, AddUserMutationVariables>;

/**
 * __useAddUserMutation__
 *
 * To run a mutation, you first call `useAddUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserMutation, { data, loading, error }] = useAddUserMutation({
 *   variables: {
 *      user: // value for 'user'
 *   },
 * });
 */
export function useAddUserMutation(baseOptions?: Apollo.MutationHookOptions<AddUserMutation, AddUserMutationVariables>) {
        return Apollo.useMutation<AddUserMutation, AddUserMutationVariables>(AddUserDocument, baseOptions);
      }
export type AddUserMutationHookResult = ReturnType<typeof useAddUserMutation>;
export type AddUserMutationResult = Apollo.MutationResult<AddUserMutation>;
export type AddUserMutationOptions = Apollo.BaseMutationOptions<AddUserMutation, AddUserMutationVariables>;