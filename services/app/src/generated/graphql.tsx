import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
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
  timestamp: any;
  timestamptz: any;
  uuid: any;
};

/** expression to compare columns of type Boolean. All fields are combined with logical 'AND'. */
export type BooleanComparisonExp = {
  _eq?: Maybe<Scalars["Boolean"]>;
  _gt?: Maybe<Scalars["Boolean"]>;
  _gte?: Maybe<Scalars["Boolean"]>;
  _in?: Maybe<Array<Scalars["Boolean"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["Boolean"]>;
  _lte?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<Scalars["Boolean"]>;
  _nin?: Maybe<Array<Scalars["Boolean"]>>;
};

/** expression to compare columns of type Int. All fields are combined with logical 'AND'. */
export type IntComparisonExp = {
  _eq?: Maybe<Scalars["Int"]>;
  _gt?: Maybe<Scalars["Int"]>;
  _gte?: Maybe<Scalars["Int"]>;
  _in?: Maybe<Array<Scalars["Int"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["Int"]>;
  _lte?: Maybe<Scalars["Int"]>;
  _neq?: Maybe<Scalars["Int"]>;
  _nin?: Maybe<Array<Scalars["Int"]>>;
};

/** expression to compare columns of type String. All fields are combined with logical 'AND'. */
export type StringComparisonExp = {
  _eq?: Maybe<Scalars["String"]>;
  _gt?: Maybe<Scalars["String"]>;
  _gte?: Maybe<Scalars["String"]>;
  _ilike?: Maybe<Scalars["String"]>;
  _in?: Maybe<Array<Scalars["String"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _like?: Maybe<Scalars["String"]>;
  _lt?: Maybe<Scalars["String"]>;
  _lte?: Maybe<Scalars["String"]>;
  _neq?: Maybe<Scalars["String"]>;
  _nilike?: Maybe<Scalars["String"]>;
  _nin?: Maybe<Array<Scalars["String"]>>;
  _nlike?: Maybe<Scalars["String"]>;
  _nsimilar?: Maybe<Scalars["String"]>;
  _similar?: Maybe<Scalars["String"]>;
};

/** columns and relationships of "bank_accounts" */
export type BankAccounts = {
  account_number: Scalars["String"];
  account_title?: Maybe<Scalars["String"]>;
  account_type: Scalars["String"];
  /** An array relationship */
  assigned_companies_for_advances_in_settings: Array<CompanySettings>;
  /** An aggregated array relationship */
  assigned_companies_for_advances_in_settings_aggregate: CompanySettingsAggregate;
  /** An array relationship */
  assigned_companies_for_collection_in_settings: Array<CompanySettings>;
  /** An aggregated array relationship */
  assigned_companies_for_collection_in_settings_aggregate: CompanySettingsAggregate;
  bank_address?: Maybe<Scalars["String"]>;
  bank_name: Scalars["String"];
  can_ach: Scalars["Boolean"];
  can_wire: Scalars["Boolean"];
  /** An object relationship */
  company?: Maybe<Companies>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id: Scalars["uuid"];
  recipient_address?: Maybe<Scalars["String"]>;
  recipient_name?: Maybe<Scalars["String"]>;
  routing_number: Scalars["String"];
  updated_at?: Maybe<Scalars["timestamptz"]>;
  verified_at?: Maybe<Scalars["timestamptz"]>;
  verified_date?: Maybe<Scalars["date"]>;
};

/** columns and relationships of "bank_accounts" */
export type BankAccountsAssignedCompaniesForAdvancesInSettingsArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** columns and relationships of "bank_accounts" */
export type BankAccountsAssignedCompaniesForAdvancesInSettingsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** columns and relationships of "bank_accounts" */
export type BankAccountsAssignedCompaniesForCollectionInSettingsArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** columns and relationships of "bank_accounts" */
export type BankAccountsAssignedCompaniesForCollectionInSettingsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<BankAccountsMaxFields>;
  min?: Maybe<BankAccountsMinFields>;
};

/** aggregate fields of "bank_accounts" */
export type BankAccountsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<BankAccountsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  account_title?: Maybe<StringComparisonExp>;
  account_type?: Maybe<StringComparisonExp>;
  assigned_companies_for_advances_in_settings?: Maybe<CompanySettingsBoolExp>;
  assigned_companies_for_collection_in_settings?: Maybe<CompanySettingsBoolExp>;
  bank_address?: Maybe<StringComparisonExp>;
  bank_name?: Maybe<StringComparisonExp>;
  can_ach?: Maybe<BooleanComparisonExp>;
  can_wire?: Maybe<BooleanComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  recipient_address?: Maybe<StringComparisonExp>;
  recipient_name?: Maybe<StringComparisonExp>;
  routing_number?: Maybe<StringComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  verified_at?: Maybe<TimestamptzComparisonExp>;
  verified_date?: Maybe<DateComparisonExp>;
};

/** unique or primary key constraints on table "bank_accounts" */
export enum BankAccountsConstraint {
  /** unique or primary key constraint */
  CompanyBanksPkey = "company_banks_pkey",
}

/** input type for inserting data into table "bank_accounts" */
export type BankAccountsInsertInput = {
  account_number?: Maybe<Scalars["String"]>;
  account_title?: Maybe<Scalars["String"]>;
  account_type?: Maybe<Scalars["String"]>;
  assigned_companies_for_advances_in_settings?: Maybe<CompanySettingsArrRelInsertInput>;
  assigned_companies_for_collection_in_settings?: Maybe<CompanySettingsArrRelInsertInput>;
  bank_address?: Maybe<Scalars["String"]>;
  bank_name?: Maybe<Scalars["String"]>;
  can_ach?: Maybe<Scalars["Boolean"]>;
  can_wire?: Maybe<Scalars["Boolean"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  recipient_address?: Maybe<Scalars["String"]>;
  recipient_name?: Maybe<Scalars["String"]>;
  routing_number?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  verified_at?: Maybe<Scalars["timestamptz"]>;
  verified_date?: Maybe<Scalars["date"]>;
};

/** aggregate max on columns */
export type BankAccountsMaxFields = {
  account_number?: Maybe<Scalars["String"]>;
  account_title?: Maybe<Scalars["String"]>;
  account_type?: Maybe<Scalars["String"]>;
  bank_address?: Maybe<Scalars["String"]>;
  bank_name?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  recipient_address?: Maybe<Scalars["String"]>;
  recipient_name?: Maybe<Scalars["String"]>;
  routing_number?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  verified_at?: Maybe<Scalars["timestamptz"]>;
  verified_date?: Maybe<Scalars["date"]>;
};

/** order by max() on columns of table "bank_accounts" */
export type BankAccountsMaxOrderBy = {
  account_number?: Maybe<OrderBy>;
  account_title?: Maybe<OrderBy>;
  account_type?: Maybe<OrderBy>;
  bank_address?: Maybe<OrderBy>;
  bank_name?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  recipient_address?: Maybe<OrderBy>;
  recipient_name?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
  verified_date?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type BankAccountsMinFields = {
  account_number?: Maybe<Scalars["String"]>;
  account_title?: Maybe<Scalars["String"]>;
  account_type?: Maybe<Scalars["String"]>;
  bank_address?: Maybe<Scalars["String"]>;
  bank_name?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  recipient_address?: Maybe<Scalars["String"]>;
  recipient_name?: Maybe<Scalars["String"]>;
  routing_number?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  verified_at?: Maybe<Scalars["timestamptz"]>;
  verified_date?: Maybe<Scalars["date"]>;
};

/** order by min() on columns of table "bank_accounts" */
export type BankAccountsMinOrderBy = {
  account_number?: Maybe<OrderBy>;
  account_title?: Maybe<OrderBy>;
  account_type?: Maybe<OrderBy>;
  bank_address?: Maybe<OrderBy>;
  bank_name?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  recipient_address?: Maybe<OrderBy>;
  recipient_name?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
  verified_date?: Maybe<OrderBy>;
};

/** response of any mutation on the table "bank_accounts" */
export type BankAccountsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  account_title?: Maybe<OrderBy>;
  account_type?: Maybe<OrderBy>;
  assigned_companies_for_advances_in_settings_aggregate?: Maybe<CompanySettingsAggregateOrderBy>;
  assigned_companies_for_collection_in_settings_aggregate?: Maybe<CompanySettingsAggregateOrderBy>;
  bank_address?: Maybe<OrderBy>;
  bank_name?: Maybe<OrderBy>;
  can_ach?: Maybe<OrderBy>;
  can_wire?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  recipient_address?: Maybe<OrderBy>;
  recipient_name?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
  verified_date?: Maybe<OrderBy>;
};

/** primary key columns input for table: "bank_accounts" */
export type BankAccountsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "bank_accounts" */
export enum BankAccountsSelectColumn {
  /** column name */
  AccountNumber = "account_number",
  /** column name */
  AccountTitle = "account_title",
  /** column name */
  AccountType = "account_type",
  /** column name */
  BankAddress = "bank_address",
  /** column name */
  BankName = "bank_name",
  /** column name */
  CanAch = "can_ach",
  /** column name */
  CanWire = "can_wire",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  RecipientAddress = "recipient_address",
  /** column name */
  RecipientName = "recipient_name",
  /** column name */
  RoutingNumber = "routing_number",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  VerifiedAt = "verified_at",
  /** column name */
  VerifiedDate = "verified_date",
}

/** input type for updating data in table "bank_accounts" */
export type BankAccountsSetInput = {
  account_number?: Maybe<Scalars["String"]>;
  account_title?: Maybe<Scalars["String"]>;
  account_type?: Maybe<Scalars["String"]>;
  bank_address?: Maybe<Scalars["String"]>;
  bank_name?: Maybe<Scalars["String"]>;
  can_ach?: Maybe<Scalars["Boolean"]>;
  can_wire?: Maybe<Scalars["Boolean"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  recipient_address?: Maybe<Scalars["String"]>;
  recipient_name?: Maybe<Scalars["String"]>;
  routing_number?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  verified_at?: Maybe<Scalars["timestamptz"]>;
  verified_date?: Maybe<Scalars["date"]>;
};

/** update columns of table "bank_accounts" */
export enum BankAccountsUpdateColumn {
  /** column name */
  AccountNumber = "account_number",
  /** column name */
  AccountTitle = "account_title",
  /** column name */
  AccountType = "account_type",
  /** column name */
  BankAddress = "bank_address",
  /** column name */
  BankName = "bank_name",
  /** column name */
  CanAch = "can_ach",
  /** column name */
  CanWire = "can_wire",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  RecipientAddress = "recipient_address",
  /** column name */
  RecipientName = "recipient_name",
  /** column name */
  RoutingNumber = "routing_number",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  VerifiedAt = "verified_at",
  /** column name */
  VerifiedDate = "verified_date",
}

/**
 * This is the financial summary for the bank, where each row represents one day for a particular product type
 *
 *
 * columns and relationships of "bank_financial_summaries"
 */
export type BankFinancialSummaries = {
  available_limit: Scalars["numeric"];
  date: Scalars["date"];
  id: Scalars["uuid"];
  product_type: Scalars["String"];
  total_limit: Scalars["numeric"];
  total_outstanding_fees: Scalars["numeric"];
  total_outstanding_interest: Scalars["numeric"];
  total_outstanding_principal: Scalars["numeric"];
  total_principal_in_requested_state: Scalars["numeric"];
};

/** aggregated selection of "bank_financial_summaries" */
export type BankFinancialSummariesAggregate = {
  aggregate?: Maybe<BankFinancialSummariesAggregateFields>;
  nodes: Array<BankFinancialSummaries>;
};

/** aggregate fields of "bank_financial_summaries" */
export type BankFinancialSummariesAggregateFields = {
  avg?: Maybe<BankFinancialSummariesAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<BankFinancialSummariesMaxFields>;
  min?: Maybe<BankFinancialSummariesMinFields>;
  stddev?: Maybe<BankFinancialSummariesStddevFields>;
  stddev_pop?: Maybe<BankFinancialSummariesStddevPopFields>;
  stddev_samp?: Maybe<BankFinancialSummariesStddevSampFields>;
  sum?: Maybe<BankFinancialSummariesSumFields>;
  var_pop?: Maybe<BankFinancialSummariesVarPopFields>;
  var_samp?: Maybe<BankFinancialSummariesVarSampFields>;
  variance?: Maybe<BankFinancialSummariesVarianceFields>;
};

/** aggregate fields of "bank_financial_summaries" */
export type BankFinancialSummariesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<BankFinancialSummariesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "bank_financial_summaries" */
export type BankFinancialSummariesAggregateOrderBy = {
  avg?: Maybe<BankFinancialSummariesAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<BankFinancialSummariesMaxOrderBy>;
  min?: Maybe<BankFinancialSummariesMinOrderBy>;
  stddev?: Maybe<BankFinancialSummariesStddevOrderBy>;
  stddev_pop?: Maybe<BankFinancialSummariesStddevPopOrderBy>;
  stddev_samp?: Maybe<BankFinancialSummariesStddevSampOrderBy>;
  sum?: Maybe<BankFinancialSummariesSumOrderBy>;
  var_pop?: Maybe<BankFinancialSummariesVarPopOrderBy>;
  var_samp?: Maybe<BankFinancialSummariesVarSampOrderBy>;
  variance?: Maybe<BankFinancialSummariesVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "bank_financial_summaries" */
export type BankFinancialSummariesArrRelInsertInput = {
  data: Array<BankFinancialSummariesInsertInput>;
  on_conflict?: Maybe<BankFinancialSummariesOnConflict>;
};

/** aggregate avg on columns */
export type BankFinancialSummariesAvgFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesAvgOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "bank_financial_summaries". All fields are combined with a logical 'AND'. */
export type BankFinancialSummariesBoolExp = {
  _and?: Maybe<Array<Maybe<BankFinancialSummariesBoolExp>>>;
  _not?: Maybe<BankFinancialSummariesBoolExp>;
  _or?: Maybe<Array<Maybe<BankFinancialSummariesBoolExp>>>;
  available_limit?: Maybe<NumericComparisonExp>;
  date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  product_type?: Maybe<StringComparisonExp>;
  total_limit?: Maybe<NumericComparisonExp>;
  total_outstanding_fees?: Maybe<NumericComparisonExp>;
  total_outstanding_interest?: Maybe<NumericComparisonExp>;
  total_outstanding_principal?: Maybe<NumericComparisonExp>;
  total_principal_in_requested_state?: Maybe<NumericComparisonExp>;
};

/** unique or primary key constraints on table "bank_financial_summaries" */
export enum BankFinancialSummariesConstraint {
  /** unique or primary key constraint */
  BankFinancialSummariesPkey = "bank_financial_summaries_pkey",
}

/** input type for incrementing integer column in table "bank_financial_summaries" */
export type BankFinancialSummariesIncInput = {
  available_limit?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "bank_financial_summaries" */
export type BankFinancialSummariesInsertInput = {
  available_limit?: Maybe<Scalars["numeric"]>;
  date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  product_type?: Maybe<Scalars["String"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** aggregate max on columns */
export type BankFinancialSummariesMaxFields = {
  available_limit?: Maybe<Scalars["numeric"]>;
  date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  product_type?: Maybe<Scalars["String"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by max() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesMaxOrderBy = {
  available_limit?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type BankFinancialSummariesMinFields = {
  available_limit?: Maybe<Scalars["numeric"]>;
  date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  product_type?: Maybe<Scalars["String"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by min() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesMinOrderBy = {
  available_limit?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** response of any mutation on the table "bank_financial_summaries" */
export type BankFinancialSummariesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<BankFinancialSummaries>;
};

/** input type for inserting object relation for remote table "bank_financial_summaries" */
export type BankFinancialSummariesObjRelInsertInput = {
  data: BankFinancialSummariesInsertInput;
  on_conflict?: Maybe<BankFinancialSummariesOnConflict>;
};

/** on conflict condition type for table "bank_financial_summaries" */
export type BankFinancialSummariesOnConflict = {
  constraint: BankFinancialSummariesConstraint;
  update_columns: Array<BankFinancialSummariesUpdateColumn>;
  where?: Maybe<BankFinancialSummariesBoolExp>;
};

/** ordering options when selecting data from "bank_financial_summaries" */
export type BankFinancialSummariesOrderBy = {
  available_limit?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** primary key columns input for table: "bank_financial_summaries" */
export type BankFinancialSummariesPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "bank_financial_summaries" */
export enum BankFinancialSummariesSelectColumn {
  /** column name */
  AvailableLimit = "available_limit",
  /** column name */
  Date = "date",
  /** column name */
  Id = "id",
  /** column name */
  ProductType = "product_type",
  /** column name */
  TotalLimit = "total_limit",
  /** column name */
  TotalOutstandingFees = "total_outstanding_fees",
  /** column name */
  TotalOutstandingInterest = "total_outstanding_interest",
  /** column name */
  TotalOutstandingPrincipal = "total_outstanding_principal",
  /** column name */
  TotalPrincipalInRequestedState = "total_principal_in_requested_state",
}

/** input type for updating data in table "bank_financial_summaries" */
export type BankFinancialSummariesSetInput = {
  available_limit?: Maybe<Scalars["numeric"]>;
  date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  product_type?: Maybe<Scalars["String"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** aggregate stddev on columns */
export type BankFinancialSummariesStddevFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesStddevOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type BankFinancialSummariesStddevPopFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesStddevPopOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type BankFinancialSummariesStddevSampFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesStddevSampOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type BankFinancialSummariesSumFields = {
  available_limit?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesSumOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** update columns of table "bank_financial_summaries" */
export enum BankFinancialSummariesUpdateColumn {
  /** column name */
  AvailableLimit = "available_limit",
  /** column name */
  Date = "date",
  /** column name */
  Id = "id",
  /** column name */
  ProductType = "product_type",
  /** column name */
  TotalLimit = "total_limit",
  /** column name */
  TotalOutstandingFees = "total_outstanding_fees",
  /** column name */
  TotalOutstandingInterest = "total_outstanding_interest",
  /** column name */
  TotalOutstandingPrincipal = "total_outstanding_principal",
  /** column name */
  TotalPrincipalInRequestedState = "total_principal_in_requested_state",
}

/** aggregate var_pop on columns */
export type BankFinancialSummariesVarPopFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesVarPopOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type BankFinancialSummariesVarSampFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesVarSampOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type BankFinancialSummariesVarianceFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesVarianceOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** expression to compare columns of type bigint. All fields are combined with logical 'AND'. */
export type BigintComparisonExp = {
  _eq?: Maybe<Scalars["bigint"]>;
  _gt?: Maybe<Scalars["bigint"]>;
  _gte?: Maybe<Scalars["bigint"]>;
  _in?: Maybe<Array<Scalars["bigint"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["bigint"]>;
  _lte?: Maybe<Scalars["bigint"]>;
  _neq?: Maybe<Scalars["bigint"]>;
  _nin?: Maybe<Array<Scalars["bigint"]>>;
};

/** columns and relationships of "companies" */
export type Companies = {
  address?: Maybe<Scalars["String"]>;
  /** An array relationship */
  agreements: Array<CompanyAgreements>;
  /** An aggregated array relationship */
  agreements_aggregate: CompanyAgreementsAggregate;
  /** An array relationship */
  bank_accounts: Array<BankAccounts>;
  /** An aggregated array relationship */
  bank_accounts_aggregate: BankAccountsAggregate;
  city?: Maybe<Scalars["String"]>;
  company_settings_id: Scalars["uuid"];
  /** An array relationship */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  /** An array relationship */
  company_vendor_partnerships_by_vendor: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_by_vendor_aggregate: CompanyVendorPartnershipsAggregate;
  /** An object relationship */
  contract?: Maybe<Contracts>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at: Scalars["timestamptz"];
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  /** An object relationship */
  financial_summary?: Maybe<FinancialSummaries>;
  id: Scalars["uuid"];
  identifier?: Maybe<Scalars["String"]>;
  is_vendor: Scalars["Boolean"];
  /** The latest loan identifier created for loans belonging to this company; increment this value to get a new loan identifier for a new loan */
  latest_loan_identifier: Scalars["Int"];
  /** An array relationship */
  licenses: Array<CompanyLicenses>;
  /** An aggregated array relationship */
  licenses_aggregate: CompanyLicensesAggregate;
  /** An array relationship */
  loans: Array<Loans>;
  /** An aggregated array relationship */
  loans_aggregate: LoansAggregate;
  name: Scalars["String"];
  phone_number?: Maybe<Scalars["String"]>;
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
  state?: Maybe<Scalars["String"]>;
  updated_at: Scalars["timestamptz"];
  /** An array relationship */
  users: Array<Users>;
  /** An aggregated array relationship */
  users_aggregate: UsersAggregate;
  zip_code?: Maybe<Scalars["String"]>;
};

/** columns and relationships of "companies" */
export type CompaniesAgreementsArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesAgreementsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesBankAccountsArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesCompanyVendorPartnershipsByVendorArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesCompanyVendorPartnershipsByVendorAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesLicensesArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesLicensesAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesLoansArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesLoansAggregateArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesPurchaseOrdersArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesPurchaseOrdersAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesPurchaseOrdersByVendorArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesPurchaseOrdersByVendorAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesUsersArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesUsersAggregateArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  avg?: Maybe<CompaniesAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<CompaniesMaxFields>;
  min?: Maybe<CompaniesMinFields>;
  stddev?: Maybe<CompaniesStddevFields>;
  stddev_pop?: Maybe<CompaniesStddevPopFields>;
  stddev_samp?: Maybe<CompaniesStddevSampFields>;
  sum?: Maybe<CompaniesSumFields>;
  var_pop?: Maybe<CompaniesVarPopFields>;
  var_samp?: Maybe<CompaniesVarSampFields>;
  variance?: Maybe<CompaniesVarianceFields>;
};

/** aggregate fields of "companies" */
export type CompaniesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompaniesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "companies" */
export type CompaniesAggregateOrderBy = {
  avg?: Maybe<CompaniesAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<CompaniesMaxOrderBy>;
  min?: Maybe<CompaniesMinOrderBy>;
  stddev?: Maybe<CompaniesStddevOrderBy>;
  stddev_pop?: Maybe<CompaniesStddevPopOrderBy>;
  stddev_samp?: Maybe<CompaniesStddevSampOrderBy>;
  sum?: Maybe<CompaniesSumOrderBy>;
  var_pop?: Maybe<CompaniesVarPopOrderBy>;
  var_samp?: Maybe<CompaniesVarSampOrderBy>;
  variance?: Maybe<CompaniesVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "companies" */
export type CompaniesArrRelInsertInput = {
  data: Array<CompaniesInsertInput>;
  on_conflict?: Maybe<CompaniesOnConflict>;
};

/** aggregate avg on columns */
export type CompaniesAvgFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "companies" */
export type CompaniesAvgOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
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
  contract?: Maybe<ContractsBoolExp>;
  contract_id?: Maybe<UuidComparisonExp>;
  country?: Maybe<StringComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  dba_name?: Maybe<StringComparisonExp>;
  employer_identification_number?: Maybe<StringComparisonExp>;
  financial_summary?: Maybe<FinancialSummariesBoolExp>;
  id?: Maybe<UuidComparisonExp>;
  identifier?: Maybe<StringComparisonExp>;
  is_vendor?: Maybe<BooleanComparisonExp>;
  latest_loan_identifier?: Maybe<IntComparisonExp>;
  licenses?: Maybe<CompanyLicensesBoolExp>;
  loans?: Maybe<LoansBoolExp>;
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
  CompaniesPkey = "companies_pkey",
}

/** input type for incrementing integer column in table "companies" */
export type CompaniesIncInput = {
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
};

/** input type for inserting data into table "companies" */
export type CompaniesInsertInput = {
  address?: Maybe<Scalars["String"]>;
  agreements?: Maybe<CompanyAgreementsArrRelInsertInput>;
  bank_accounts?: Maybe<BankAccountsArrRelInsertInput>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  company_vendor_partnerships_by_vendor?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  contract?: Maybe<ContractsObjRelInsertInput>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  financial_summary?: Maybe<FinancialSummariesObjRelInsertInput>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  is_vendor?: Maybe<Scalars["Boolean"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  licenses?: Maybe<CompanyLicensesArrRelInsertInput>;
  loans?: Maybe<LoansArrRelInsertInput>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
  purchase_orders?: Maybe<PurchaseOrdersArrRelInsertInput>;
  purchase_orders_by_vendor?: Maybe<PurchaseOrdersArrRelInsertInput>;
  settings?: Maybe<CompanySettingsObjRelInsertInput>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  users?: Maybe<UsersArrRelInsertInput>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type CompaniesMaxFields = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "companies" */
export type CompaniesMaxOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  contract_id?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
  state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  zip_code?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompaniesMinFields = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "companies" */
export type CompaniesMinOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  contract_id?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
  state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  zip_code?: Maybe<OrderBy>;
};

/** response of any mutation on the table "companies" */
export type CompaniesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  contract?: Maybe<ContractsOrderBy>;
  contract_id?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  financial_summary?: Maybe<FinancialSummariesOrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  is_vendor?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  licenses_aggregate?: Maybe<CompanyLicensesAggregateOrderBy>;
  loans_aggregate?: Maybe<LoansAggregateOrderBy>;
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
  id: Scalars["uuid"];
};

/** select columns of table "companies" */
export enum CompaniesSelectColumn {
  /** column name */
  Address = "address",
  /** column name */
  City = "city",
  /** column name */
  CompanySettingsId = "company_settings_id",
  /** column name */
  ContractId = "contract_id",
  /** column name */
  Country = "country",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  DbaName = "dba_name",
  /** column name */
  EmployerIdentificationNumber = "employer_identification_number",
  /** column name */
  Id = "id",
  /** column name */
  Identifier = "identifier",
  /** column name */
  IsVendor = "is_vendor",
  /** column name */
  LatestLoanIdentifier = "latest_loan_identifier",
  /** column name */
  Name = "name",
  /** column name */
  PhoneNumber = "phone_number",
  /** column name */
  State = "state",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  ZipCode = "zip_code",
}

/** input type for updating data in table "companies" */
export type CompaniesSetInput = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  is_vendor?: Maybe<Scalars["Boolean"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** aggregate stddev on columns */
export type CompaniesStddevFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "companies" */
export type CompaniesStddevOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type CompaniesStddevPopFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "companies" */
export type CompaniesStddevPopOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type CompaniesStddevSampFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "companies" */
export type CompaniesStddevSampOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type CompaniesSumFields = {
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
};

/** order by sum() on columns of table "companies" */
export type CompaniesSumOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** update columns of table "companies" */
export enum CompaniesUpdateColumn {
  /** column name */
  Address = "address",
  /** column name */
  City = "city",
  /** column name */
  CompanySettingsId = "company_settings_id",
  /** column name */
  ContractId = "contract_id",
  /** column name */
  Country = "country",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  DbaName = "dba_name",
  /** column name */
  EmployerIdentificationNumber = "employer_identification_number",
  /** column name */
  Id = "id",
  /** column name */
  Identifier = "identifier",
  /** column name */
  IsVendor = "is_vendor",
  /** column name */
  LatestLoanIdentifier = "latest_loan_identifier",
  /** column name */
  Name = "name",
  /** column name */
  PhoneNumber = "phone_number",
  /** column name */
  State = "state",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  ZipCode = "zip_code",
}

/** aggregate var_pop on columns */
export type CompaniesVarPopFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "companies" */
export type CompaniesVarPopOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type CompaniesVarSampFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "companies" */
export type CompaniesVarSampOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type CompaniesVarianceFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "companies" */
export type CompaniesVarianceOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/**
 * Agreements that a company signs with Bespoke, this can be for vendors or customers signing agreeements
 *
 *
 * columns and relationships of "company_agreements"
 */
export type CompanyAgreements = {
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  /** An array relationship */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  file_id: Scalars["uuid"];
  id: Scalars["uuid"];
};

/**
 * Agreements that a company signs with Bespoke, this can be for vendors or customers signing agreeements
 *
 *
 * columns and relationships of "company_agreements"
 */
export type CompanyAgreementsCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<CompanyAgreementsMaxFields>;
  min?: Maybe<CompanyAgreementsMinFields>;
};

/** aggregate fields of "company_agreements" */
export type CompanyAgreementsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  VendorAgreementsPkey = "vendor_agreements_pkey",
}

/** input type for inserting data into table "company_agreements" */
export type CompanyAgreementsInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  file_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type CompanyAgreementsMaxFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
};

/** order by max() on columns of table "company_agreements" */
export type CompanyAgreementsMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  file_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyAgreementsMinFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
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
  affected_rows: Scalars["Int"];
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
  id: Scalars["uuid"];
};

/** select columns of table "company_agreements" */
export enum CompanyAgreementsSelectColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  FileId = "file_id",
  /** column name */
  Id = "id",
}

/** input type for updating data in table "company_agreements" */
export type CompanyAgreementsSetInput = {
  company_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "company_agreements" */
export enum CompanyAgreementsUpdateColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  FileId = "file_id",
  /** column name */
  Id = "id",
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
  company_id: Scalars["uuid"];
  /** An object relationship */
  file: Files;
  file_id: Scalars["uuid"];
  id: Scalars["uuid"];
};

/** aggregated selection of "company_licenses" */
export type CompanyLicensesAggregate = {
  aggregate?: Maybe<CompanyLicensesAggregateFields>;
  nodes: Array<CompanyLicenses>;
};

/** aggregate fields of "company_licenses" */
export type CompanyLicensesAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<CompanyLicensesMaxFields>;
  min?: Maybe<CompanyLicensesMinFields>;
};

/** aggregate fields of "company_licenses" */
export type CompanyLicensesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyLicensesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  CompanyLicensePkey = "company_license_pkey",
}

/** input type for inserting data into table "company_licenses" */
export type CompanyLicensesInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  file?: Maybe<FilesObjRelInsertInput>;
  file_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type CompanyLicensesMaxFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
};

/** order by max() on columns of table "company_licenses" */
export type CompanyLicensesMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  file_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyLicensesMinFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
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
  affected_rows: Scalars["Int"];
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
  id: Scalars["uuid"];
};

/** select columns of table "company_licenses" */
export enum CompanyLicensesSelectColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  FileId = "file_id",
  /** column name */
  Id = "id",
}

/** input type for updating data in table "company_licenses" */
export type CompanyLicensesSetInput = {
  company_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "company_licenses" */
export enum CompanyLicensesUpdateColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  FileId = "file_id",
  /** column name */
  Id = "id",
}

/**
 * Settings are configuration details associated with a company, but are not within a time range like contracts are
 *
 *
 * columns and relationships of "company_settings"
 */
export type CompanySettings = {
  /** An object relationship */
  advances_bespoke_bank_account?: Maybe<BankAccounts>;
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  collections_bespoke_bank_account?: Maybe<BankAccounts>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  company?: Maybe<Companies>;
  company_id?: Maybe<Scalars["uuid"]>;
  id: Scalars["uuid"];
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
};

/** aggregated selection of "company_settings" */
export type CompanySettingsAggregate = {
  aggregate?: Maybe<CompanySettingsAggregateFields>;
  nodes: Array<CompanySettings>;
};

/** aggregate fields of "company_settings" */
export type CompanySettingsAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<CompanySettingsMaxFields>;
  min?: Maybe<CompanySettingsMinFields>;
};

/** aggregate fields of "company_settings" */
export type CompanySettingsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanySettingsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "company_settings" */
export type CompanySettingsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompanySettingsMaxOrderBy>;
  min?: Maybe<CompanySettingsMinOrderBy>;
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
  vendor_agreement_docusign_template?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "company_settings" */
export enum CompanySettingsConstraint {
  /** unique or primary key constraint */
  CompanySettingsPkey = "company_settings_pkey",
}

/** input type for inserting data into table "company_settings" */
export type CompanySettingsInsertInput = {
  advances_bespoke_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  collections_bespoke_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type CompanySettingsMaxFields = {
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
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
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
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
  affected_rows: Scalars["Int"];
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
  vendor_agreement_docusign_template?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_settings" */
export type CompanySettingsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "company_settings" */
export enum CompanySettingsSelectColumn {
  /** column name */
  AdvancesBespokeBankAccountId = "advances_bespoke_bank_account_id",
  /** column name */
  CollectionsBespokeBankAccountId = "collections_bespoke_bank_account_id",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  Id = "id",
  /** column name */
  VendorAgreementDocusignTemplate = "vendor_agreement_docusign_template",
}

/** input type for updating data in table "company_settings" */
export type CompanySettingsSetInput = {
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
};

/** update columns of table "company_settings" */
export enum CompanySettingsUpdateColumn {
  /** column name */
  AdvancesBespokeBankAccountId = "advances_bespoke_bank_account_id",
  /** column name */
  CollectionsBespokeBankAccountId = "collections_bespoke_bank_account_id",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  Id = "id",
  /** column name */
  VendorAgreementDocusignTemplate = "vendor_agreement_docusign_template",
}

/** columns and relationships of "company_vendor_partnerships" */
export type CompanyVendorPartnerships = {
  /** Serves dual purpose of telling us when the vendor was approved */
  approved_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  company: Companies;
  /** An object relationship */
  company_agreement?: Maybe<CompanyAgreements>;
  company_id: Scalars["uuid"];
  /** An object relationship */
  company_license?: Maybe<CompanyLicenses>;
  created_at: Scalars["timestamptz"];
  id: Scalars["uuid"];
  updated_at: Scalars["timestamptz"];
  /** An object relationship */
  vendor: Companies;
  vendor_agreement_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  vendor_bank_account?: Maybe<BankAccounts>;
  vendor_bank_id?: Maybe<Scalars["uuid"]>;
  vendor_id: Scalars["uuid"];
  vendor_license_id?: Maybe<Scalars["uuid"]>;
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
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<CompanyVendorPartnershipsMaxFields>;
  min?: Maybe<CompanyVendorPartnershipsMinFields>;
};

/** aggregate fields of "company_vendor_partnerships" */
export type CompanyVendorPartnershipsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  CompanyVendorPartnershipPkey = "company_vendor_partnership_pkey",
}

/** input type for inserting data into table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsInsertInput = {
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_agreement?: Maybe<CompanyAgreementsObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  company_license?: Maybe<CompanyLicensesObjRelInsertInput>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor?: Maybe<CompaniesObjRelInsertInput>;
  vendor_agreement_id?: Maybe<Scalars["uuid"]>;
  vendor_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  vendor_bank_id?: Maybe<Scalars["uuid"]>;
  vendor_id?: Maybe<Scalars["uuid"]>;
  vendor_license_id?: Maybe<Scalars["uuid"]>;
  vendor_limited?: Maybe<VendorsObjRelInsertInput>;
};

/** aggregate max on columns */
export type CompanyVendorPartnershipsMaxFields = {
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_agreement_id?: Maybe<Scalars["uuid"]>;
  vendor_bank_id?: Maybe<Scalars["uuid"]>;
  vendor_id?: Maybe<Scalars["uuid"]>;
  vendor_license_id?: Maybe<Scalars["uuid"]>;
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
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_agreement_id?: Maybe<Scalars["uuid"]>;
  vendor_bank_id?: Maybe<Scalars["uuid"]>;
  vendor_id?: Maybe<Scalars["uuid"]>;
  vendor_license_id?: Maybe<Scalars["uuid"]>;
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
  affected_rows: Scalars["Int"];
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
  id: Scalars["uuid"];
};

/** select columns of table "company_vendor_partnerships" */
export enum CompanyVendorPartnershipsSelectColumn {
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  VendorAgreementId = "vendor_agreement_id",
  /** column name */
  VendorBankId = "vendor_bank_id",
  /** column name */
  VendorId = "vendor_id",
  /** column name */
  VendorLicenseId = "vendor_license_id",
}

/** input type for updating data in table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsSetInput = {
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_agreement_id?: Maybe<Scalars["uuid"]>;
  vendor_bank_id?: Maybe<Scalars["uuid"]>;
  vendor_id?: Maybe<Scalars["uuid"]>;
  vendor_license_id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "company_vendor_partnerships" */
export enum CompanyVendorPartnershipsUpdateColumn {
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  VendorAgreementId = "vendor_agreement_id",
  /** column name */
  VendorBankId = "vendor_bank_id",
  /** column name */
  VendorId = "vendor_id",
  /** column name */
  VendorLicenseId = "vendor_license_id",
}

/**
 * Contracts are stored for a date range and associated with a company_id
 *
 *
 * columns and relationships of "contracts"
 */
export type Contracts = {
  /** An array relationship */
  companies: Array<Companies>;
  /** An aggregated array relationship */
  companies_aggregate: CompaniesAggregate;
  /** An object relationship */
  company?: Maybe<Companies>;
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id: Scalars["uuid"];
  modified_at: Scalars["timestamptz"];
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  product_config: Scalars["jsonb"];
  product_type: ProductTypeEnum;
  start_date: Scalars["date"];
};

/**
 * Contracts are stored for a date range and associated with a company_id
 *
 *
 * columns and relationships of "contracts"
 */
export type ContractsCompaniesArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};

/**
 * Contracts are stored for a date range and associated with a company_id
 *
 *
 * columns and relationships of "contracts"
 */
export type ContractsCompaniesAggregateArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};

/**
 * Contracts are stored for a date range and associated with a company_id
 *
 *
 * columns and relationships of "contracts"
 */
export type ContractsProductConfigArgs = {
  path?: Maybe<Scalars["String"]>;
};

/** aggregated selection of "contracts" */
export type ContractsAggregate = {
  aggregate?: Maybe<ContractsAggregateFields>;
  nodes: Array<Contracts>;
};

/** aggregate fields of "contracts" */
export type ContractsAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<ContractsMaxFields>;
  min?: Maybe<ContractsMinFields>;
};

/** aggregate fields of "contracts" */
export type ContractsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<ContractsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "contracts" */
export type ContractsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<ContractsMaxOrderBy>;
  min?: Maybe<ContractsMinOrderBy>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type ContractsAppendInput = {
  product_config?: Maybe<Scalars["jsonb"]>;
};

/** input type for inserting array relation for remote table "contracts" */
export type ContractsArrRelInsertInput = {
  data: Array<ContractsInsertInput>;
  on_conflict?: Maybe<ContractsOnConflict>;
};

/** Boolean expression to filter rows from the table "contracts". All fields are combined with a logical 'AND'. */
export type ContractsBoolExp = {
  _and?: Maybe<Array<Maybe<ContractsBoolExp>>>;
  _not?: Maybe<ContractsBoolExp>;
  _or?: Maybe<Array<Maybe<ContractsBoolExp>>>;
  companies?: Maybe<CompaniesBoolExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  end_date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  modified_at?: Maybe<TimestamptzComparisonExp>;
  modified_by_user_id?: Maybe<UuidComparisonExp>;
  product_config?: Maybe<JsonbComparisonExp>;
  product_type?: Maybe<ProductTypeEnumComparisonExp>;
  start_date?: Maybe<DateComparisonExp>;
};

/** unique or primary key constraints on table "contracts" */
export enum ContractsConstraint {
  /** unique or primary key constraint */
  ContractsPkey = "contracts_pkey",
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type ContractsDeleteAtPathInput = {
  product_config?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type ContractsDeleteElemInput = {
  product_config?: Maybe<Scalars["Int"]>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type ContractsDeleteKeyInput = {
  product_config?: Maybe<Scalars["String"]>;
};

/** input type for inserting data into table "contracts" */
export type ContractsInsertInput = {
  companies?: Maybe<CompaniesArrRelInsertInput>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  product_config?: Maybe<Scalars["jsonb"]>;
  product_type?: Maybe<ProductTypeEnum>;
  start_date?: Maybe<Scalars["date"]>;
};

/** aggregate max on columns */
export type ContractsMaxFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  start_date?: Maybe<Scalars["date"]>;
};

/** order by max() on columns of table "contracts" */
export type ContractsMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  end_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  start_date?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type ContractsMinFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  start_date?: Maybe<Scalars["date"]>;
};

/** order by min() on columns of table "contracts" */
export type ContractsMinOrderBy = {
  company_id?: Maybe<OrderBy>;
  end_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  start_date?: Maybe<OrderBy>;
};

/** response of any mutation on the table "contracts" */
export type ContractsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<Contracts>;
};

/** input type for inserting object relation for remote table "contracts" */
export type ContractsObjRelInsertInput = {
  data: ContractsInsertInput;
  on_conflict?: Maybe<ContractsOnConflict>;
};

/** on conflict condition type for table "contracts" */
export type ContractsOnConflict = {
  constraint: ContractsConstraint;
  update_columns: Array<ContractsUpdateColumn>;
  where?: Maybe<ContractsBoolExp>;
};

/** ordering options when selecting data from "contracts" */
export type ContractsOrderBy = {
  companies_aggregate?: Maybe<CompaniesAggregateOrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  end_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  product_config?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  start_date?: Maybe<OrderBy>;
};

/** primary key columns input for table: "contracts" */
export type ContractsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type ContractsPrependInput = {
  product_config?: Maybe<Scalars["jsonb"]>;
};

/** select columns of table "contracts" */
export enum ContractsSelectColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  EndDate = "end_date",
  /** column name */
  Id = "id",
  /** column name */
  ModifiedAt = "modified_at",
  /** column name */
  ModifiedByUserId = "modified_by_user_id",
  /** column name */
  ProductConfig = "product_config",
  /** column name */
  ProductType = "product_type",
  /** column name */
  StartDate = "start_date",
}

/** input type for updating data in table "contracts" */
export type ContractsSetInput = {
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  product_config?: Maybe<Scalars["jsonb"]>;
  product_type?: Maybe<ProductTypeEnum>;
  start_date?: Maybe<Scalars["date"]>;
};

/** update columns of table "contracts" */
export enum ContractsUpdateColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  EndDate = "end_date",
  /** column name */
  Id = "id",
  /** column name */
  ModifiedAt = "modified_at",
  /** column name */
  ModifiedByUserId = "modified_by_user_id",
  /** column name */
  ProductConfig = "product_config",
  /** column name */
  ProductType = "product_type",
  /** column name */
  StartDate = "start_date",
}

/** expression to compare columns of type date. All fields are combined with logical 'AND'. */
export type DateComparisonExp = {
  _eq?: Maybe<Scalars["date"]>;
  _gt?: Maybe<Scalars["date"]>;
  _gte?: Maybe<Scalars["date"]>;
  _in?: Maybe<Array<Scalars["date"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["date"]>;
  _lte?: Maybe<Scalars["date"]>;
  _neq?: Maybe<Scalars["date"]>;
  _nin?: Maybe<Array<Scalars["date"]>>;
};

/** columns and relationships of "ebba_application_files" */
export type EbbaApplicationFiles = {
  /** An object relationship */
  ebba_application: EbbaApplications;
  ebba_application_id: Scalars["uuid"];
  /** An object relationship */
  file: Files;
  file_id: Scalars["uuid"];
};

/** aggregated selection of "ebba_application_files" */
export type EbbaApplicationFilesAggregate = {
  aggregate?: Maybe<EbbaApplicationFilesAggregateFields>;
  nodes: Array<EbbaApplicationFiles>;
};

/** aggregate fields of "ebba_application_files" */
export type EbbaApplicationFilesAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<EbbaApplicationFilesMaxFields>;
  min?: Maybe<EbbaApplicationFilesMinFields>;
};

/** aggregate fields of "ebba_application_files" */
export type EbbaApplicationFilesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<EbbaApplicationFilesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "ebba_application_files" */
export type EbbaApplicationFilesAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<EbbaApplicationFilesMaxOrderBy>;
  min?: Maybe<EbbaApplicationFilesMinOrderBy>;
};

/** input type for inserting array relation for remote table "ebba_application_files" */
export type EbbaApplicationFilesArrRelInsertInput = {
  data: Array<EbbaApplicationFilesInsertInput>;
  on_conflict?: Maybe<EbbaApplicationFilesOnConflict>;
};

/** Boolean expression to filter rows from the table "ebba_application_files". All fields are combined with a logical 'AND'. */
export type EbbaApplicationFilesBoolExp = {
  _and?: Maybe<Array<Maybe<EbbaApplicationFilesBoolExp>>>;
  _not?: Maybe<EbbaApplicationFilesBoolExp>;
  _or?: Maybe<Array<Maybe<EbbaApplicationFilesBoolExp>>>;
  ebba_application?: Maybe<EbbaApplicationsBoolExp>;
  ebba_application_id?: Maybe<UuidComparisonExp>;
  file?: Maybe<FilesBoolExp>;
  file_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "ebba_application_files" */
export enum EbbaApplicationFilesConstraint {
  /** unique or primary key constraint */
  EbbaApplicationFilesPkey = "ebba_application_files_pkey",
}

/** input type for inserting data into table "ebba_application_files" */
export type EbbaApplicationFilesInsertInput = {
  ebba_application?: Maybe<EbbaApplicationsObjRelInsertInput>;
  ebba_application_id?: Maybe<Scalars["uuid"]>;
  file?: Maybe<FilesObjRelInsertInput>;
  file_id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type EbbaApplicationFilesMaxFields = {
  ebba_application_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
};

/** order by max() on columns of table "ebba_application_files" */
export type EbbaApplicationFilesMaxOrderBy = {
  ebba_application_id?: Maybe<OrderBy>;
  file_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type EbbaApplicationFilesMinFields = {
  ebba_application_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
};

/** order by min() on columns of table "ebba_application_files" */
export type EbbaApplicationFilesMinOrderBy = {
  ebba_application_id?: Maybe<OrderBy>;
  file_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "ebba_application_files" */
export type EbbaApplicationFilesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<EbbaApplicationFiles>;
};

/** input type for inserting object relation for remote table "ebba_application_files" */
export type EbbaApplicationFilesObjRelInsertInput = {
  data: EbbaApplicationFilesInsertInput;
  on_conflict?: Maybe<EbbaApplicationFilesOnConflict>;
};

/** on conflict condition type for table "ebba_application_files" */
export type EbbaApplicationFilesOnConflict = {
  constraint: EbbaApplicationFilesConstraint;
  update_columns: Array<EbbaApplicationFilesUpdateColumn>;
  where?: Maybe<EbbaApplicationFilesBoolExp>;
};

/** ordering options when selecting data from "ebba_application_files" */
export type EbbaApplicationFilesOrderBy = {
  ebba_application?: Maybe<EbbaApplicationsOrderBy>;
  ebba_application_id?: Maybe<OrderBy>;
  file?: Maybe<FilesOrderBy>;
  file_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "ebba_application_files" */
export type EbbaApplicationFilesPkColumnsInput = {
  ebba_application_id: Scalars["uuid"];
  file_id: Scalars["uuid"];
};

/** select columns of table "ebba_application_files" */
export enum EbbaApplicationFilesSelectColumn {
  /** column name */
  EbbaApplicationId = "ebba_application_id",
  /** column name */
  FileId = "file_id",
}

/** input type for updating data in table "ebba_application_files" */
export type EbbaApplicationFilesSetInput = {
  ebba_application_id?: Maybe<Scalars["uuid"]>;
  file_id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "ebba_application_files" */
export enum EbbaApplicationFilesUpdateColumn {
  /** column name */
  EbbaApplicationId = "ebba_application_id",
  /** column name */
  FileId = "file_id",
}

/**
 * EBBA stands for Eligible Borrowing Base Amount: this is a table of applications to borrow via a line of credit with information required to determine EBBA
 *
 *
 * columns and relationships of "ebba_applications"
 */
export type EbbaApplications = {
  application_month: Scalars["date"];
  approved_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  created_at: Scalars["timestamptz"];
  /** An array relationship */
  ebba_application_files: Array<EbbaApplicationFiles>;
  /** An aggregated array relationship */
  ebba_application_files_aggregate: EbbaApplicationFilesAggregate;
  id: Scalars["uuid"];
  monthly_accounts_receivable: Scalars["numeric"];
  monthly_cash: Scalars["numeric"];
  monthly_inventory: Scalars["numeric"];
  rejected_at?: Maybe<Scalars["timestamp"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status: RequestStatusEnum;
  updated_at: Scalars["timestamptz"];
};

/**
 * EBBA stands for Eligible Borrowing Base Amount: this is a table of applications to borrow via a line of credit with information required to determine EBBA
 *
 *
 * columns and relationships of "ebba_applications"
 */
export type EbbaApplicationsEbbaApplicationFilesArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationFilesOrderBy>>;
  where?: Maybe<EbbaApplicationFilesBoolExp>;
};

/**
 * EBBA stands for Eligible Borrowing Base Amount: this is a table of applications to borrow via a line of credit with information required to determine EBBA
 *
 *
 * columns and relationships of "ebba_applications"
 */
export type EbbaApplicationsEbbaApplicationFilesAggregateArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationFilesOrderBy>>;
  where?: Maybe<EbbaApplicationFilesBoolExp>;
};

/** aggregated selection of "ebba_applications" */
export type EbbaApplicationsAggregate = {
  aggregate?: Maybe<EbbaApplicationsAggregateFields>;
  nodes: Array<EbbaApplications>;
};

/** aggregate fields of "ebba_applications" */
export type EbbaApplicationsAggregateFields = {
  avg?: Maybe<EbbaApplicationsAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<EbbaApplicationsMaxFields>;
  min?: Maybe<EbbaApplicationsMinFields>;
  stddev?: Maybe<EbbaApplicationsStddevFields>;
  stddev_pop?: Maybe<EbbaApplicationsStddevPopFields>;
  stddev_samp?: Maybe<EbbaApplicationsStddevSampFields>;
  sum?: Maybe<EbbaApplicationsSumFields>;
  var_pop?: Maybe<EbbaApplicationsVarPopFields>;
  var_samp?: Maybe<EbbaApplicationsVarSampFields>;
  variance?: Maybe<EbbaApplicationsVarianceFields>;
};

/** aggregate fields of "ebba_applications" */
export type EbbaApplicationsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<EbbaApplicationsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "ebba_applications" */
export type EbbaApplicationsAggregateOrderBy = {
  avg?: Maybe<EbbaApplicationsAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<EbbaApplicationsMaxOrderBy>;
  min?: Maybe<EbbaApplicationsMinOrderBy>;
  stddev?: Maybe<EbbaApplicationsStddevOrderBy>;
  stddev_pop?: Maybe<EbbaApplicationsStddevPopOrderBy>;
  stddev_samp?: Maybe<EbbaApplicationsStddevSampOrderBy>;
  sum?: Maybe<EbbaApplicationsSumOrderBy>;
  var_pop?: Maybe<EbbaApplicationsVarPopOrderBy>;
  var_samp?: Maybe<EbbaApplicationsVarSampOrderBy>;
  variance?: Maybe<EbbaApplicationsVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "ebba_applications" */
export type EbbaApplicationsArrRelInsertInput = {
  data: Array<EbbaApplicationsInsertInput>;
  on_conflict?: Maybe<EbbaApplicationsOnConflict>;
};

/** aggregate avg on columns */
export type EbbaApplicationsAvgFields = {
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "ebba_applications" */
export type EbbaApplicationsAvgOrderBy = {
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "ebba_applications". All fields are combined with a logical 'AND'. */
export type EbbaApplicationsBoolExp = {
  _and?: Maybe<Array<Maybe<EbbaApplicationsBoolExp>>>;
  _not?: Maybe<EbbaApplicationsBoolExp>;
  _or?: Maybe<Array<Maybe<EbbaApplicationsBoolExp>>>;
  application_month?: Maybe<DateComparisonExp>;
  approved_at?: Maybe<TimestamptzComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  ebba_application_files?: Maybe<EbbaApplicationFilesBoolExp>;
  id?: Maybe<UuidComparisonExp>;
  monthly_accounts_receivable?: Maybe<NumericComparisonExp>;
  monthly_cash?: Maybe<NumericComparisonExp>;
  monthly_inventory?: Maybe<NumericComparisonExp>;
  rejected_at?: Maybe<TimestampComparisonExp>;
  rejection_note?: Maybe<StringComparisonExp>;
  requested_at?: Maybe<TimestamptzComparisonExp>;
  status?: Maybe<RequestStatusEnumComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "ebba_applications" */
export enum EbbaApplicationsConstraint {
  /** unique or primary key constraint */
  EbbaApplicationsPkey = "ebba_applications_pkey",
}

/** input type for incrementing integer column in table "ebba_applications" */
export type EbbaApplicationsIncInput = {
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "ebba_applications" */
export type EbbaApplicationsInsertInput = {
  application_month?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  ebba_application_files?: Maybe<EbbaApplicationFilesArrRelInsertInput>;
  id?: Maybe<Scalars["uuid"]>;
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
  rejected_at?: Maybe<Scalars["timestamp"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status?: Maybe<RequestStatusEnum>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate max on columns */
export type EbbaApplicationsMaxFields = {
  application_month?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
  rejected_at?: Maybe<Scalars["timestamp"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by max() on columns of table "ebba_applications" */
export type EbbaApplicationsMaxOrderBy = {
  application_month?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type EbbaApplicationsMinFields = {
  application_month?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
  rejected_at?: Maybe<Scalars["timestamp"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by min() on columns of table "ebba_applications" */
export type EbbaApplicationsMinOrderBy = {
  application_month?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "ebba_applications" */
export type EbbaApplicationsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<EbbaApplications>;
};

/** input type for inserting object relation for remote table "ebba_applications" */
export type EbbaApplicationsObjRelInsertInput = {
  data: EbbaApplicationsInsertInput;
  on_conflict?: Maybe<EbbaApplicationsOnConflict>;
};

/** on conflict condition type for table "ebba_applications" */
export type EbbaApplicationsOnConflict = {
  constraint: EbbaApplicationsConstraint;
  update_columns: Array<EbbaApplicationsUpdateColumn>;
  where?: Maybe<EbbaApplicationsBoolExp>;
};

/** ordering options when selecting data from "ebba_applications" */
export type EbbaApplicationsOrderBy = {
  application_month?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  ebba_application_files_aggregate?: Maybe<EbbaApplicationFilesAggregateOrderBy>;
  id?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  status?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "ebba_applications" */
export type EbbaApplicationsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "ebba_applications" */
export enum EbbaApplicationsSelectColumn {
  /** column name */
  ApplicationMonth = "application_month",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  MonthlyAccountsReceivable = "monthly_accounts_receivable",
  /** column name */
  MonthlyCash = "monthly_cash",
  /** column name */
  MonthlyInventory = "monthly_inventory",
  /** column name */
  RejectedAt = "rejected_at",
  /** column name */
  RejectionNote = "rejection_note",
  /** column name */
  RequestedAt = "requested_at",
  /** column name */
  Status = "status",
  /** column name */
  UpdatedAt = "updated_at",
}

/** input type for updating data in table "ebba_applications" */
export type EbbaApplicationsSetInput = {
  application_month?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
  rejected_at?: Maybe<Scalars["timestamp"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status?: Maybe<RequestStatusEnum>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate stddev on columns */
export type EbbaApplicationsStddevFields = {
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "ebba_applications" */
export type EbbaApplicationsStddevOrderBy = {
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type EbbaApplicationsStddevPopFields = {
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "ebba_applications" */
export type EbbaApplicationsStddevPopOrderBy = {
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type EbbaApplicationsStddevSampFields = {
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "ebba_applications" */
export type EbbaApplicationsStddevSampOrderBy = {
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type EbbaApplicationsSumFields = {
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "ebba_applications" */
export type EbbaApplicationsSumOrderBy = {
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** update columns of table "ebba_applications" */
export enum EbbaApplicationsUpdateColumn {
  /** column name */
  ApplicationMonth = "application_month",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  MonthlyAccountsReceivable = "monthly_accounts_receivable",
  /** column name */
  MonthlyCash = "monthly_cash",
  /** column name */
  MonthlyInventory = "monthly_inventory",
  /** column name */
  RejectedAt = "rejected_at",
  /** column name */
  RejectionNote = "rejection_note",
  /** column name */
  RequestedAt = "requested_at",
  /** column name */
  Status = "status",
  /** column name */
  UpdatedAt = "updated_at",
}

/** aggregate var_pop on columns */
export type EbbaApplicationsVarPopFields = {
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "ebba_applications" */
export type EbbaApplicationsVarPopOrderBy = {
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type EbbaApplicationsVarSampFields = {
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "ebba_applications" */
export type EbbaApplicationsVarSampOrderBy = {
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type EbbaApplicationsVarianceFields = {
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "ebba_applications" */
export type EbbaApplicationsVarianceOrderBy = {
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
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
  company_id: Scalars["uuid"];
  /** An array relationship */
  company_licenses: Array<CompanyLicenses>;
  /** An aggregated array relationship */
  company_licenses_aggregate: CompanyLicensesAggregate;
  created_at: Scalars["timestamptz"];
  /** An object relationship */
  created_by: Users;
  created_by_user_id: Scalars["uuid"];
  extension: Scalars["String"];
  id: Scalars["uuid"];
  mime_type?: Maybe<Scalars["String"]>;
  name: Scalars["String"];
  path: Scalars["String"];
  /** An array relationship */
  purchase_order_files: Array<PurchaseOrderFiles>;
  /** An aggregated array relationship */
  purchase_order_files_aggregate: PurchaseOrderFilesAggregate;
  sequential_id?: Maybe<Scalars["Int"]>;
  size: Scalars["bigint"];
  updated_at: Scalars["timestamptz"];
};

/**
 * Table to keep track of files stored on the platform
 *
 *
 * columns and relationships of "files"
 */
export type FilesCompanyLicensesArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  count?: Maybe<Scalars["Int"]>;
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
  distinct?: Maybe<Scalars["Boolean"]>;
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
  sequential_id?: Maybe<Scalars["Float"]>;
  size?: Maybe<Scalars["Float"]>;
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
  FilesPkey = "files_pkey",
}

/** input type for incrementing integer column in table "files" */
export type FilesIncInput = {
  sequential_id?: Maybe<Scalars["Int"]>;
  size?: Maybe<Scalars["bigint"]>;
};

/** input type for inserting data into table "files" */
export type FilesInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  company_licenses?: Maybe<CompanyLicensesArrRelInsertInput>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  created_by?: Maybe<UsersObjRelInsertInput>;
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  extension?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  mime_type?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  path?: Maybe<Scalars["String"]>;
  purchase_order_files?: Maybe<PurchaseOrderFilesArrRelInsertInput>;
  sequential_id?: Maybe<Scalars["Int"]>;
  size?: Maybe<Scalars["bigint"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate max on columns */
export type FilesMaxFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  extension?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  mime_type?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  path?: Maybe<Scalars["String"]>;
  sequential_id?: Maybe<Scalars["Int"]>;
  size?: Maybe<Scalars["bigint"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  extension?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  mime_type?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  path?: Maybe<Scalars["String"]>;
  sequential_id?: Maybe<Scalars["Int"]>;
  size?: Maybe<Scalars["bigint"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  affected_rows: Scalars["Int"];
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
  id: Scalars["uuid"];
};

/** select columns of table "files" */
export enum FilesSelectColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  CreatedByUserId = "created_by_user_id",
  /** column name */
  Extension = "extension",
  /** column name */
  Id = "id",
  /** column name */
  MimeType = "mime_type",
  /** column name */
  Name = "name",
  /** column name */
  Path = "path",
  /** column name */
  SequentialId = "sequential_id",
  /** column name */
  Size = "size",
  /** column name */
  UpdatedAt = "updated_at",
}

/** input type for updating data in table "files" */
export type FilesSetInput = {
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  extension?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  mime_type?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  path?: Maybe<Scalars["String"]>;
  sequential_id?: Maybe<Scalars["Int"]>;
  size?: Maybe<Scalars["bigint"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate stddev on columns */
export type FilesStddevFields = {
  sequential_id?: Maybe<Scalars["Float"]>;
  size?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "files" */
export type FilesStddevOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type FilesStddevPopFields = {
  sequential_id?: Maybe<Scalars["Float"]>;
  size?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "files" */
export type FilesStddevPopOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type FilesStddevSampFields = {
  sequential_id?: Maybe<Scalars["Float"]>;
  size?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "files" */
export type FilesStddevSampOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type FilesSumFields = {
  sequential_id?: Maybe<Scalars["Int"]>;
  size?: Maybe<Scalars["bigint"]>;
};

/** order by sum() on columns of table "files" */
export type FilesSumOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** update columns of table "files" */
export enum FilesUpdateColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  CreatedByUserId = "created_by_user_id",
  /** column name */
  Extension = "extension",
  /** column name */
  Id = "id",
  /** column name */
  MimeType = "mime_type",
  /** column name */
  Name = "name",
  /** column name */
  Path = "path",
  /** column name */
  SequentialId = "sequential_id",
  /** column name */
  Size = "size",
  /** column name */
  UpdatedAt = "updated_at",
}

/** aggregate var_pop on columns */
export type FilesVarPopFields = {
  sequential_id?: Maybe<Scalars["Float"]>;
  size?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "files" */
export type FilesVarPopOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type FilesVarSampFields = {
  sequential_id?: Maybe<Scalars["Float"]>;
  size?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "files" */
export type FilesVarSampOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type FilesVarianceFields = {
  sequential_id?: Maybe<Scalars["Float"]>;
  size?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "files" */
export type FilesVarianceOrderBy = {
  sequential_id?: Maybe<OrderBy>;
  size?: Maybe<OrderBy>;
};

/** columns and relationships of "financial_summaries" */
export type FinancialSummaries = {
  available_limit: Scalars["numeric"];
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  id: Scalars["uuid"];
  total_limit: Scalars["numeric"];
  total_outstanding_fees: Scalars["numeric"];
  total_outstanding_interest: Scalars["numeric"];
  total_outstanding_principal: Scalars["numeric"];
  total_principal_in_requested_state: Scalars["numeric"];
};

/** aggregated selection of "financial_summaries" */
export type FinancialSummariesAggregate = {
  aggregate?: Maybe<FinancialSummariesAggregateFields>;
  nodes: Array<FinancialSummaries>;
};

/** aggregate fields of "financial_summaries" */
export type FinancialSummariesAggregateFields = {
  avg?: Maybe<FinancialSummariesAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<FinancialSummariesMaxFields>;
  min?: Maybe<FinancialSummariesMinFields>;
  stddev?: Maybe<FinancialSummariesStddevFields>;
  stddev_pop?: Maybe<FinancialSummariesStddevPopFields>;
  stddev_samp?: Maybe<FinancialSummariesStddevSampFields>;
  sum?: Maybe<FinancialSummariesSumFields>;
  var_pop?: Maybe<FinancialSummariesVarPopFields>;
  var_samp?: Maybe<FinancialSummariesVarSampFields>;
  variance?: Maybe<FinancialSummariesVarianceFields>;
};

/** aggregate fields of "financial_summaries" */
export type FinancialSummariesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<FinancialSummariesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "financial_summaries" */
export type FinancialSummariesAggregateOrderBy = {
  avg?: Maybe<FinancialSummariesAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<FinancialSummariesMaxOrderBy>;
  min?: Maybe<FinancialSummariesMinOrderBy>;
  stddev?: Maybe<FinancialSummariesStddevOrderBy>;
  stddev_pop?: Maybe<FinancialSummariesStddevPopOrderBy>;
  stddev_samp?: Maybe<FinancialSummariesStddevSampOrderBy>;
  sum?: Maybe<FinancialSummariesSumOrderBy>;
  var_pop?: Maybe<FinancialSummariesVarPopOrderBy>;
  var_samp?: Maybe<FinancialSummariesVarSampOrderBy>;
  variance?: Maybe<FinancialSummariesVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "financial_summaries" */
export type FinancialSummariesArrRelInsertInput = {
  data: Array<FinancialSummariesInsertInput>;
  on_conflict?: Maybe<FinancialSummariesOnConflict>;
};

/** aggregate avg on columns */
export type FinancialSummariesAvgFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "financial_summaries" */
export type FinancialSummariesAvgOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "financial_summaries". All fields are combined with a logical 'AND'. */
export type FinancialSummariesBoolExp = {
  _and?: Maybe<Array<Maybe<FinancialSummariesBoolExp>>>;
  _not?: Maybe<FinancialSummariesBoolExp>;
  _or?: Maybe<Array<Maybe<FinancialSummariesBoolExp>>>;
  available_limit?: Maybe<NumericComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  total_limit?: Maybe<NumericComparisonExp>;
  total_outstanding_fees?: Maybe<NumericComparisonExp>;
  total_outstanding_interest?: Maybe<NumericComparisonExp>;
  total_outstanding_principal?: Maybe<NumericComparisonExp>;
  total_principal_in_requested_state?: Maybe<NumericComparisonExp>;
};

/** unique or primary key constraints on table "financial_summaries" */
export enum FinancialSummariesConstraint {
  /** unique or primary key constraint */
  FinancialSummariesCompanyIdKey = "financial_summaries_company_id_key",
  /** unique or primary key constraint */
  FinancialSummariesPkey = "financial_summaries_pkey",
}

/** input type for incrementing integer column in table "financial_summaries" */
export type FinancialSummariesIncInput = {
  available_limit?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "financial_summaries" */
export type FinancialSummariesInsertInput = {
  available_limit?: Maybe<Scalars["numeric"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** aggregate max on columns */
export type FinancialSummariesMaxFields = {
  available_limit?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by max() on columns of table "financial_summaries" */
export type FinancialSummariesMaxOrderBy = {
  available_limit?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type FinancialSummariesMinFields = {
  available_limit?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by min() on columns of table "financial_summaries" */
export type FinancialSummariesMinOrderBy = {
  available_limit?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** response of any mutation on the table "financial_summaries" */
export type FinancialSummariesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<FinancialSummaries>;
};

/** input type for inserting object relation for remote table "financial_summaries" */
export type FinancialSummariesObjRelInsertInput = {
  data: FinancialSummariesInsertInput;
  on_conflict?: Maybe<FinancialSummariesOnConflict>;
};

/** on conflict condition type for table "financial_summaries" */
export type FinancialSummariesOnConflict = {
  constraint: FinancialSummariesConstraint;
  update_columns: Array<FinancialSummariesUpdateColumn>;
  where?: Maybe<FinancialSummariesBoolExp>;
};

/** ordering options when selecting data from "financial_summaries" */
export type FinancialSummariesOrderBy = {
  available_limit?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** primary key columns input for table: "financial_summaries" */
export type FinancialSummariesPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "financial_summaries" */
export enum FinancialSummariesSelectColumn {
  /** column name */
  AvailableLimit = "available_limit",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  Id = "id",
  /** column name */
  TotalLimit = "total_limit",
  /** column name */
  TotalOutstandingFees = "total_outstanding_fees",
  /** column name */
  TotalOutstandingInterest = "total_outstanding_interest",
  /** column name */
  TotalOutstandingPrincipal = "total_outstanding_principal",
  /** column name */
  TotalPrincipalInRequestedState = "total_principal_in_requested_state",
}

/** input type for updating data in table "financial_summaries" */
export type FinancialSummariesSetInput = {
  available_limit?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** aggregate stddev on columns */
export type FinancialSummariesStddevFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "financial_summaries" */
export type FinancialSummariesStddevOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type FinancialSummariesStddevPopFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "financial_summaries" */
export type FinancialSummariesStddevPopOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type FinancialSummariesStddevSampFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "financial_summaries" */
export type FinancialSummariesStddevSampOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type FinancialSummariesSumFields = {
  available_limit?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "financial_summaries" */
export type FinancialSummariesSumOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** update columns of table "financial_summaries" */
export enum FinancialSummariesUpdateColumn {
  /** column name */
  AvailableLimit = "available_limit",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  Id = "id",
  /** column name */
  TotalLimit = "total_limit",
  /** column name */
  TotalOutstandingFees = "total_outstanding_fees",
  /** column name */
  TotalOutstandingInterest = "total_outstanding_interest",
  /** column name */
  TotalOutstandingPrincipal = "total_outstanding_principal",
  /** column name */
  TotalPrincipalInRequestedState = "total_principal_in_requested_state",
}

/** aggregate var_pop on columns */
export type FinancialSummariesVarPopFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "financial_summaries" */
export type FinancialSummariesVarPopOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type FinancialSummariesVarSampFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "financial_summaries" */
export type FinancialSummariesVarSampOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type FinancialSummariesVarianceFields = {
  available_limit?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "financial_summaries" */
export type FinancialSummariesVarianceOrderBy = {
  available_limit?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** expression to compare columns of type json. All fields are combined with logical 'AND'. */
export type JsonComparisonExp = {
  _eq?: Maybe<Scalars["json"]>;
  _gt?: Maybe<Scalars["json"]>;
  _gte?: Maybe<Scalars["json"]>;
  _in?: Maybe<Array<Scalars["json"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["json"]>;
  _lte?: Maybe<Scalars["json"]>;
  _neq?: Maybe<Scalars["json"]>;
  _nin?: Maybe<Array<Scalars["json"]>>;
};

/** expression to compare columns of type jsonb. All fields are combined with logical 'AND'. */
export type JsonbComparisonExp = {
  /** is the column contained in the given json value */
  _contained_in?: Maybe<Scalars["jsonb"]>;
  /** does the column contain the given json value at the top level */
  _contains?: Maybe<Scalars["jsonb"]>;
  _eq?: Maybe<Scalars["jsonb"]>;
  _gt?: Maybe<Scalars["jsonb"]>;
  _gte?: Maybe<Scalars["jsonb"]>;
  /** does the string exist as a top-level key in the column */
  _has_key?: Maybe<Scalars["String"]>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: Maybe<Array<Scalars["String"]>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: Maybe<Array<Scalars["String"]>>;
  _in?: Maybe<Array<Scalars["jsonb"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["jsonb"]>;
  _lte?: Maybe<Scalars["jsonb"]>;
  _neq?: Maybe<Scalars["jsonb"]>;
  _nin?: Maybe<Array<Scalars["jsonb"]>>;
};

/** columns and relationships of "line_of_credits" */
export type LineOfCredits = {
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  created_at?: Maybe<Scalars["timestamptz"]>;
  id: Scalars["uuid"];
  is_credit_for_vendor: Scalars["Boolean"];
  /** An object relationship */
  recipient_vendor?: Maybe<Vendors>;
  recipient_vendor_id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregated selection of "line_of_credits" */
export type LineOfCreditsAggregate = {
  aggregate?: Maybe<LineOfCreditsAggregateFields>;
  nodes: Array<LineOfCredits>;
};

/** aggregate fields of "line_of_credits" */
export type LineOfCreditsAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<LineOfCreditsMaxFields>;
  min?: Maybe<LineOfCreditsMinFields>;
};

/** aggregate fields of "line_of_credits" */
export type LineOfCreditsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<LineOfCreditsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "line_of_credits" */
export type LineOfCreditsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<LineOfCreditsMaxOrderBy>;
  min?: Maybe<LineOfCreditsMinOrderBy>;
};

/** input type for inserting array relation for remote table "line_of_credits" */
export type LineOfCreditsArrRelInsertInput = {
  data: Array<LineOfCreditsInsertInput>;
  on_conflict?: Maybe<LineOfCreditsOnConflict>;
};

/** Boolean expression to filter rows from the table "line_of_credits". All fields are combined with a logical 'AND'. */
export type LineOfCreditsBoolExp = {
  _and?: Maybe<Array<Maybe<LineOfCreditsBoolExp>>>;
  _not?: Maybe<LineOfCreditsBoolExp>;
  _or?: Maybe<Array<Maybe<LineOfCreditsBoolExp>>>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  is_credit_for_vendor?: Maybe<BooleanComparisonExp>;
  recipient_vendor?: Maybe<VendorsBoolExp>;
  recipient_vendor_id?: Maybe<UuidComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "line_of_credits" */
export enum LineOfCreditsConstraint {
  /** unique or primary key constraint */
  LineOfCreditsPkey = "line_of_credits_pkey",
}

/** input type for inserting data into table "line_of_credits" */
export type LineOfCreditsInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_credit_for_vendor?: Maybe<Scalars["Boolean"]>;
  recipient_vendor?: Maybe<VendorsObjRelInsertInput>;
  recipient_vendor_id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate max on columns */
export type LineOfCreditsMaxFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  recipient_vendor_id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by max() on columns of table "line_of_credits" */
export type LineOfCreditsMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  recipient_vendor_id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type LineOfCreditsMinFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  recipient_vendor_id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by min() on columns of table "line_of_credits" */
export type LineOfCreditsMinOrderBy = {
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  recipient_vendor_id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "line_of_credits" */
export type LineOfCreditsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<LineOfCredits>;
};

/** input type for inserting object relation for remote table "line_of_credits" */
export type LineOfCreditsObjRelInsertInput = {
  data: LineOfCreditsInsertInput;
  on_conflict?: Maybe<LineOfCreditsOnConflict>;
};

/** on conflict condition type for table "line_of_credits" */
export type LineOfCreditsOnConflict = {
  constraint: LineOfCreditsConstraint;
  update_columns: Array<LineOfCreditsUpdateColumn>;
  where?: Maybe<LineOfCreditsBoolExp>;
};

/** ordering options when selecting data from "line_of_credits" */
export type LineOfCreditsOrderBy = {
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  is_credit_for_vendor?: Maybe<OrderBy>;
  recipient_vendor?: Maybe<VendorsOrderBy>;
  recipient_vendor_id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "line_of_credits" */
export type LineOfCreditsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "line_of_credits" */
export enum LineOfCreditsSelectColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  IsCreditForVendor = "is_credit_for_vendor",
  /** column name */
  RecipientVendorId = "recipient_vendor_id",
  /** column name */
  UpdatedAt = "updated_at",
}

/** input type for updating data in table "line_of_credits" */
export type LineOfCreditsSetInput = {
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_credit_for_vendor?: Maybe<Scalars["Boolean"]>;
  recipient_vendor_id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** update columns of table "line_of_credits" */
export enum LineOfCreditsUpdateColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  IsCreditForVendor = "is_credit_for_vendor",
  /** column name */
  RecipientVendorId = "recipient_vendor_id",
  /** column name */
  UpdatedAt = "updated_at",
}

/** columns and relationships of "loan_status" */
export type LoanStatus = {
  display_name: Scalars["String"];
  value: Scalars["String"];
};

/** aggregated selection of "loan_status" */
export type LoanStatusAggregate = {
  aggregate?: Maybe<LoanStatusAggregateFields>;
  nodes: Array<LoanStatus>;
};

/** aggregate fields of "loan_status" */
export type LoanStatusAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<LoanStatusMaxFields>;
  min?: Maybe<LoanStatusMinFields>;
};

/** aggregate fields of "loan_status" */
export type LoanStatusAggregateFieldsCountArgs = {
  columns?: Maybe<Array<LoanStatusSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "loan_status" */
export type LoanStatusAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<LoanStatusMaxOrderBy>;
  min?: Maybe<LoanStatusMinOrderBy>;
};

/** input type for inserting array relation for remote table "loan_status" */
export type LoanStatusArrRelInsertInput = {
  data: Array<LoanStatusInsertInput>;
  on_conflict?: Maybe<LoanStatusOnConflict>;
};

/** Boolean expression to filter rows from the table "loan_status". All fields are combined with a logical 'AND'. */
export type LoanStatusBoolExp = {
  _and?: Maybe<Array<Maybe<LoanStatusBoolExp>>>;
  _not?: Maybe<LoanStatusBoolExp>;
  _or?: Maybe<Array<Maybe<LoanStatusBoolExp>>>;
  display_name?: Maybe<StringComparisonExp>;
  value?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "loan_status" */
export enum LoanStatusConstraint {
  /** unique or primary key constraint */
  LoanStatusPkey = "loan_status_pkey",
}

export enum LoanStatusEnum {
  /** Approval Requested */
  ApprovalRequested = "approval_requested",
  /** Approved */
  Approved = "approved",
  /** Closed */
  Closed = "closed",
  /** Drafted */
  Drafted = "drafted",
  /** Funded */
  Funded = "funded",
  /** Past Due */
  PastDue = "past_due",
  /** Rejected */
  Rejected = "rejected",
}

/** expression to compare columns of type loan_status_enum. All fields are combined with logical 'AND'. */
export type LoanStatusEnumComparisonExp = {
  _eq?: Maybe<LoanStatusEnum>;
  _in?: Maybe<Array<LoanStatusEnum>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<LoanStatusEnum>;
  _nin?: Maybe<Array<LoanStatusEnum>>;
};

/** input type for inserting data into table "loan_status" */
export type LoanStatusInsertInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type LoanStatusMaxFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "loan_status" */
export type LoanStatusMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type LoanStatusMinFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "loan_status" */
export type LoanStatusMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "loan_status" */
export type LoanStatusMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<LoanStatus>;
};

/** input type for inserting object relation for remote table "loan_status" */
export type LoanStatusObjRelInsertInput = {
  data: LoanStatusInsertInput;
  on_conflict?: Maybe<LoanStatusOnConflict>;
};

/** on conflict condition type for table "loan_status" */
export type LoanStatusOnConflict = {
  constraint: LoanStatusConstraint;
  update_columns: Array<LoanStatusUpdateColumn>;
  where?: Maybe<LoanStatusBoolExp>;
};

/** ordering options when selecting data from "loan_status" */
export type LoanStatusOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** primary key columns input for table: "loan_status" */
export type LoanStatusPkColumnsInput = {
  value: Scalars["String"];
};

/** select columns of table "loan_status" */
export enum LoanStatusSelectColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** input type for updating data in table "loan_status" */
export type LoanStatusSetInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** update columns of table "loan_status" */
export enum LoanStatusUpdateColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** columns and relationships of "loan_type" */
export type LoanType = {
  display_name: Scalars["String"];
  value: Scalars["String"];
};

/** aggregated selection of "loan_type" */
export type LoanTypeAggregate = {
  aggregate?: Maybe<LoanTypeAggregateFields>;
  nodes: Array<LoanType>;
};

/** aggregate fields of "loan_type" */
export type LoanTypeAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<LoanTypeMaxFields>;
  min?: Maybe<LoanTypeMinFields>;
};

/** aggregate fields of "loan_type" */
export type LoanTypeAggregateFieldsCountArgs = {
  columns?: Maybe<Array<LoanTypeSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "loan_type" */
export type LoanTypeAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<LoanTypeMaxOrderBy>;
  min?: Maybe<LoanTypeMinOrderBy>;
};

/** input type for inserting array relation for remote table "loan_type" */
export type LoanTypeArrRelInsertInput = {
  data: Array<LoanTypeInsertInput>;
  on_conflict?: Maybe<LoanTypeOnConflict>;
};

/** Boolean expression to filter rows from the table "loan_type". All fields are combined with a logical 'AND'. */
export type LoanTypeBoolExp = {
  _and?: Maybe<Array<Maybe<LoanTypeBoolExp>>>;
  _not?: Maybe<LoanTypeBoolExp>;
  _or?: Maybe<Array<Maybe<LoanTypeBoolExp>>>;
  display_name?: Maybe<StringComparisonExp>;
  value?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "loan_type" */
export enum LoanTypeConstraint {
  /** unique or primary key constraint */
  LoanTypePkey = "loan_type_pkey",
}

export enum LoanTypeEnum {
  /** Line of Credit */
  LineOfCredit = "line_of_credit",
  /** Purchase Order */
  PurchaseOrder = "purchase_order",
}

/** expression to compare columns of type loan_type_enum. All fields are combined with logical 'AND'. */
export type LoanTypeEnumComparisonExp = {
  _eq?: Maybe<LoanTypeEnum>;
  _in?: Maybe<Array<LoanTypeEnum>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<LoanTypeEnum>;
  _nin?: Maybe<Array<LoanTypeEnum>>;
};

/** input type for inserting data into table "loan_type" */
export type LoanTypeInsertInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type LoanTypeMaxFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "loan_type" */
export type LoanTypeMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type LoanTypeMinFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "loan_type" */
export type LoanTypeMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "loan_type" */
export type LoanTypeMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<LoanType>;
};

/** input type for inserting object relation for remote table "loan_type" */
export type LoanTypeObjRelInsertInput = {
  data: LoanTypeInsertInput;
  on_conflict?: Maybe<LoanTypeOnConflict>;
};

/** on conflict condition type for table "loan_type" */
export type LoanTypeOnConflict = {
  constraint: LoanTypeConstraint;
  update_columns: Array<LoanTypeUpdateColumn>;
  where?: Maybe<LoanTypeBoolExp>;
};

/** ordering options when selecting data from "loan_type" */
export type LoanTypeOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** primary key columns input for table: "loan_type" */
export type LoanTypePkColumnsInput = {
  value: Scalars["String"];
};

/** select columns of table "loan_type" */
export enum LoanTypeSelectColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** input type for updating data in table "loan_type" */
export type LoanTypeSetInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** update columns of table "loan_type" */
export enum LoanTypeUpdateColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/**
 * All common fields amongst loans go here, and fields specific to that loan type are joined in by the artifact_id
 *
 *
 * columns and relationships of "loans"
 */
export type Loans = {
  adjusted_maturity_date?: Maybe<Scalars["date"]>;
  amount: Scalars["numeric"];
  approved_at?: Maybe<Scalars["timestamptz"]>;
  approved_by_user_id?: Maybe<Scalars["uuid"]>;
  artifact_id?: Maybe<Scalars["uuid"]>;
  closed_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  funded_at?: Maybe<Scalars["timestamptz"]>;
  funded_by_user_id?: Maybe<Scalars["uuid"]>;
  id: Scalars["uuid"];
  identifier?: Maybe<Scalars["String"]>;
  /** An object relationship */
  line_of_credit?: Maybe<LineOfCredits>;
  loan_type?: Maybe<LoanTypeEnum>;
  maturity_date?: Maybe<Scalars["date"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  notes?: Maybe<Scalars["String"]>;
  /** This is the settlement date of the advance that is used to pay out this loan */
  origination_date?: Maybe<Scalars["date"]>;
  outstanding_fees?: Maybe<Scalars["numeric"]>;
  outstanding_interest?: Maybe<Scalars["numeric"]>;
  outstanding_principal_balance?: Maybe<Scalars["numeric"]>;
  /** An object relationship */
  purchase_order?: Maybe<PurchaseOrders>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  /** When the user first requests a loan, they request what day they want the payment to be made to them */
  requested_payment_date?: Maybe<Scalars["date"]>;
  status: LoanStatusEnum;
};

/** aggregated selection of "loans" */
export type LoansAggregate = {
  aggregate?: Maybe<LoansAggregateFields>;
  nodes: Array<Loans>;
};

/** aggregate fields of "loans" */
export type LoansAggregateFields = {
  avg?: Maybe<LoansAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<LoansMaxFields>;
  min?: Maybe<LoansMinFields>;
  stddev?: Maybe<LoansStddevFields>;
  stddev_pop?: Maybe<LoansStddevPopFields>;
  stddev_samp?: Maybe<LoansStddevSampFields>;
  sum?: Maybe<LoansSumFields>;
  var_pop?: Maybe<LoansVarPopFields>;
  var_samp?: Maybe<LoansVarSampFields>;
  variance?: Maybe<LoansVarianceFields>;
};

/** aggregate fields of "loans" */
export type LoansAggregateFieldsCountArgs = {
  columns?: Maybe<Array<LoansSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "loans" */
export type LoansAggregateOrderBy = {
  avg?: Maybe<LoansAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<LoansMaxOrderBy>;
  min?: Maybe<LoansMinOrderBy>;
  stddev?: Maybe<LoansStddevOrderBy>;
  stddev_pop?: Maybe<LoansStddevPopOrderBy>;
  stddev_samp?: Maybe<LoansStddevSampOrderBy>;
  sum?: Maybe<LoansSumOrderBy>;
  var_pop?: Maybe<LoansVarPopOrderBy>;
  var_samp?: Maybe<LoansVarSampOrderBy>;
  variance?: Maybe<LoansVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "loans" */
export type LoansArrRelInsertInput = {
  data: Array<LoansInsertInput>;
  on_conflict?: Maybe<LoansOnConflict>;
};

/** aggregate avg on columns */
export type LoansAvgFields = {
  amount?: Maybe<Scalars["Float"]>;
  outstanding_fees?: Maybe<Scalars["Float"]>;
  outstanding_interest?: Maybe<Scalars["Float"]>;
  outstanding_principal_balance?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "loans" */
export type LoansAvgOrderBy = {
  amount?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "loans". All fields are combined with a logical 'AND'. */
export type LoansBoolExp = {
  _and?: Maybe<Array<Maybe<LoansBoolExp>>>;
  _not?: Maybe<LoansBoolExp>;
  _or?: Maybe<Array<Maybe<LoansBoolExp>>>;
  adjusted_maturity_date?: Maybe<DateComparisonExp>;
  amount?: Maybe<NumericComparisonExp>;
  approved_at?: Maybe<TimestamptzComparisonExp>;
  approved_by_user_id?: Maybe<UuidComparisonExp>;
  artifact_id?: Maybe<UuidComparisonExp>;
  closed_at?: Maybe<TimestamptzComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  funded_at?: Maybe<TimestamptzComparisonExp>;
  funded_by_user_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  identifier?: Maybe<StringComparisonExp>;
  line_of_credit?: Maybe<LineOfCreditsBoolExp>;
  loan_type?: Maybe<LoanTypeEnumComparisonExp>;
  maturity_date?: Maybe<DateComparisonExp>;
  modified_at?: Maybe<TimestamptzComparisonExp>;
  modified_by_user_id?: Maybe<UuidComparisonExp>;
  notes?: Maybe<StringComparisonExp>;
  origination_date?: Maybe<DateComparisonExp>;
  outstanding_fees?: Maybe<NumericComparisonExp>;
  outstanding_interest?: Maybe<NumericComparisonExp>;
  outstanding_principal_balance?: Maybe<NumericComparisonExp>;
  purchase_order?: Maybe<PurchaseOrdersBoolExp>;
  rejected_at?: Maybe<TimestamptzComparisonExp>;
  rejected_by_user_id?: Maybe<UuidComparisonExp>;
  rejection_note?: Maybe<StringComparisonExp>;
  requested_at?: Maybe<TimestamptzComparisonExp>;
  requested_by_user_id?: Maybe<UuidComparisonExp>;
  requested_payment_date?: Maybe<DateComparisonExp>;
  status?: Maybe<LoanStatusEnumComparisonExp>;
};

/** unique or primary key constraints on table "loans" */
export enum LoansConstraint {
  /** unique or primary key constraint */
  LoansPkey = "loans_pkey",
}

/** input type for incrementing integer column in table "loans" */
export type LoansIncInput = {
  amount?: Maybe<Scalars["numeric"]>;
  outstanding_fees?: Maybe<Scalars["numeric"]>;
  outstanding_interest?: Maybe<Scalars["numeric"]>;
  outstanding_principal_balance?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "loans" */
export type LoansInsertInput = {
  adjusted_maturity_date?: Maybe<Scalars["date"]>;
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  approved_by_user_id?: Maybe<Scalars["uuid"]>;
  artifact_id?: Maybe<Scalars["uuid"]>;
  closed_at?: Maybe<Scalars["timestamptz"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  funded_by_user_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  line_of_credit?: Maybe<LineOfCreditsObjRelInsertInput>;
  loan_type?: Maybe<LoanTypeEnum>;
  maturity_date?: Maybe<Scalars["date"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  notes?: Maybe<Scalars["String"]>;
  origination_date?: Maybe<Scalars["date"]>;
  outstanding_fees?: Maybe<Scalars["numeric"]>;
  outstanding_interest?: Maybe<Scalars["numeric"]>;
  outstanding_principal_balance?: Maybe<Scalars["numeric"]>;
  purchase_order?: Maybe<PurchaseOrdersObjRelInsertInput>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  status?: Maybe<LoanStatusEnum>;
};

/** aggregate max on columns */
export type LoansMaxFields = {
  adjusted_maturity_date?: Maybe<Scalars["date"]>;
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  approved_by_user_id?: Maybe<Scalars["uuid"]>;
  artifact_id?: Maybe<Scalars["uuid"]>;
  closed_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  funded_by_user_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  maturity_date?: Maybe<Scalars["date"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  notes?: Maybe<Scalars["String"]>;
  origination_date?: Maybe<Scalars["date"]>;
  outstanding_fees?: Maybe<Scalars["numeric"]>;
  outstanding_interest?: Maybe<Scalars["numeric"]>;
  outstanding_principal_balance?: Maybe<Scalars["numeric"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
};

/** order by max() on columns of table "loans" */
export type LoansMaxOrderBy = {
  adjusted_maturity_date?: Maybe<OrderBy>;
  amount?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  approved_by_user_id?: Maybe<OrderBy>;
  artifact_id?: Maybe<OrderBy>;
  closed_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
  funded_by_user_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  maturity_date?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  notes?: Maybe<OrderBy>;
  origination_date?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejected_by_user_id?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type LoansMinFields = {
  adjusted_maturity_date?: Maybe<Scalars["date"]>;
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  approved_by_user_id?: Maybe<Scalars["uuid"]>;
  artifact_id?: Maybe<Scalars["uuid"]>;
  closed_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  funded_by_user_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  maturity_date?: Maybe<Scalars["date"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  notes?: Maybe<Scalars["String"]>;
  origination_date?: Maybe<Scalars["date"]>;
  outstanding_fees?: Maybe<Scalars["numeric"]>;
  outstanding_interest?: Maybe<Scalars["numeric"]>;
  outstanding_principal_balance?: Maybe<Scalars["numeric"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
};

/** order by min() on columns of table "loans" */
export type LoansMinOrderBy = {
  adjusted_maturity_date?: Maybe<OrderBy>;
  amount?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  approved_by_user_id?: Maybe<OrderBy>;
  artifact_id?: Maybe<OrderBy>;
  closed_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
  funded_by_user_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  maturity_date?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  notes?: Maybe<OrderBy>;
  origination_date?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejected_by_user_id?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
};

/** response of any mutation on the table "loans" */
export type LoansMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<Loans>;
};

/** input type for inserting object relation for remote table "loans" */
export type LoansObjRelInsertInput = {
  data: LoansInsertInput;
  on_conflict?: Maybe<LoansOnConflict>;
};

/** on conflict condition type for table "loans" */
export type LoansOnConflict = {
  constraint: LoansConstraint;
  update_columns: Array<LoansUpdateColumn>;
  where?: Maybe<LoansBoolExp>;
};

/** ordering options when selecting data from "loans" */
export type LoansOrderBy = {
  adjusted_maturity_date?: Maybe<OrderBy>;
  amount?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  approved_by_user_id?: Maybe<OrderBy>;
  artifact_id?: Maybe<OrderBy>;
  closed_at?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
  funded_by_user_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  line_of_credit?: Maybe<LineOfCreditsOrderBy>;
  loan_type?: Maybe<OrderBy>;
  maturity_date?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  notes?: Maybe<OrderBy>;
  origination_date?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
  purchase_order?: Maybe<PurchaseOrdersOrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejected_by_user_id?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  status?: Maybe<OrderBy>;
};

/** primary key columns input for table: "loans" */
export type LoansPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "loans" */
export enum LoansSelectColumn {
  /** column name */
  AdjustedMaturityDate = "adjusted_maturity_date",
  /** column name */
  Amount = "amount",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  ApprovedByUserId = "approved_by_user_id",
  /** column name */
  ArtifactId = "artifact_id",
  /** column name */
  ClosedAt = "closed_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  FundedAt = "funded_at",
  /** column name */
  FundedByUserId = "funded_by_user_id",
  /** column name */
  Id = "id",
  /** column name */
  Identifier = "identifier",
  /** column name */
  LoanType = "loan_type",
  /** column name */
  MaturityDate = "maturity_date",
  /** column name */
  ModifiedAt = "modified_at",
  /** column name */
  ModifiedByUserId = "modified_by_user_id",
  /** column name */
  Notes = "notes",
  /** column name */
  OriginationDate = "origination_date",
  /** column name */
  OutstandingFees = "outstanding_fees",
  /** column name */
  OutstandingInterest = "outstanding_interest",
  /** column name */
  OutstandingPrincipalBalance = "outstanding_principal_balance",
  /** column name */
  RejectedAt = "rejected_at",
  /** column name */
  RejectedByUserId = "rejected_by_user_id",
  /** column name */
  RejectionNote = "rejection_note",
  /** column name */
  RequestedAt = "requested_at",
  /** column name */
  RequestedByUserId = "requested_by_user_id",
  /** column name */
  RequestedPaymentDate = "requested_payment_date",
  /** column name */
  Status = "status",
}

/** input type for updating data in table "loans" */
export type LoansSetInput = {
  adjusted_maturity_date?: Maybe<Scalars["date"]>;
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  approved_by_user_id?: Maybe<Scalars["uuid"]>;
  artifact_id?: Maybe<Scalars["uuid"]>;
  closed_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  funded_by_user_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  loan_type?: Maybe<LoanTypeEnum>;
  maturity_date?: Maybe<Scalars["date"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  notes?: Maybe<Scalars["String"]>;
  origination_date?: Maybe<Scalars["date"]>;
  outstanding_fees?: Maybe<Scalars["numeric"]>;
  outstanding_interest?: Maybe<Scalars["numeric"]>;
  outstanding_principal_balance?: Maybe<Scalars["numeric"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  status?: Maybe<LoanStatusEnum>;
};

/** aggregate stddev on columns */
export type LoansStddevFields = {
  amount?: Maybe<Scalars["Float"]>;
  outstanding_fees?: Maybe<Scalars["Float"]>;
  outstanding_interest?: Maybe<Scalars["Float"]>;
  outstanding_principal_balance?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "loans" */
export type LoansStddevOrderBy = {
  amount?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type LoansStddevPopFields = {
  amount?: Maybe<Scalars["Float"]>;
  outstanding_fees?: Maybe<Scalars["Float"]>;
  outstanding_interest?: Maybe<Scalars["Float"]>;
  outstanding_principal_balance?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "loans" */
export type LoansStddevPopOrderBy = {
  amount?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type LoansStddevSampFields = {
  amount?: Maybe<Scalars["Float"]>;
  outstanding_fees?: Maybe<Scalars["Float"]>;
  outstanding_interest?: Maybe<Scalars["Float"]>;
  outstanding_principal_balance?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "loans" */
export type LoansStddevSampOrderBy = {
  amount?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type LoansSumFields = {
  amount?: Maybe<Scalars["numeric"]>;
  outstanding_fees?: Maybe<Scalars["numeric"]>;
  outstanding_interest?: Maybe<Scalars["numeric"]>;
  outstanding_principal_balance?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "loans" */
export type LoansSumOrderBy = {
  amount?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** update columns of table "loans" */
export enum LoansUpdateColumn {
  /** column name */
  AdjustedMaturityDate = "adjusted_maturity_date",
  /** column name */
  Amount = "amount",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  ApprovedByUserId = "approved_by_user_id",
  /** column name */
  ArtifactId = "artifact_id",
  /** column name */
  ClosedAt = "closed_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  FundedAt = "funded_at",
  /** column name */
  FundedByUserId = "funded_by_user_id",
  /** column name */
  Id = "id",
  /** column name */
  Identifier = "identifier",
  /** column name */
  LoanType = "loan_type",
  /** column name */
  MaturityDate = "maturity_date",
  /** column name */
  ModifiedAt = "modified_at",
  /** column name */
  ModifiedByUserId = "modified_by_user_id",
  /** column name */
  Notes = "notes",
  /** column name */
  OriginationDate = "origination_date",
  /** column name */
  OutstandingFees = "outstanding_fees",
  /** column name */
  OutstandingInterest = "outstanding_interest",
  /** column name */
  OutstandingPrincipalBalance = "outstanding_principal_balance",
  /** column name */
  RejectedAt = "rejected_at",
  /** column name */
  RejectedByUserId = "rejected_by_user_id",
  /** column name */
  RejectionNote = "rejection_note",
  /** column name */
  RequestedAt = "requested_at",
  /** column name */
  RequestedByUserId = "requested_by_user_id",
  /** column name */
  RequestedPaymentDate = "requested_payment_date",
  /** column name */
  Status = "status",
}

/** aggregate var_pop on columns */
export type LoansVarPopFields = {
  amount?: Maybe<Scalars["Float"]>;
  outstanding_fees?: Maybe<Scalars["Float"]>;
  outstanding_interest?: Maybe<Scalars["Float"]>;
  outstanding_principal_balance?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "loans" */
export type LoansVarPopOrderBy = {
  amount?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type LoansVarSampFields = {
  amount?: Maybe<Scalars["Float"]>;
  outstanding_fees?: Maybe<Scalars["Float"]>;
  outstanding_interest?: Maybe<Scalars["Float"]>;
  outstanding_principal_balance?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "loans" */
export type LoansVarSampOrderBy = {
  amount?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type LoansVarianceFields = {
  amount?: Maybe<Scalars["Float"]>;
  outstanding_fees?: Maybe<Scalars["Float"]>;
  outstanding_interest?: Maybe<Scalars["Float"]>;
  outstanding_principal_balance?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "loans" */
export type LoansVarianceOrderBy = {
  amount?: Maybe<OrderBy>;
  outstanding_fees?: Maybe<OrderBy>;
  outstanding_interest?: Maybe<OrderBy>;
  outstanding_principal_balance?: Maybe<OrderBy>;
};

/** mutation root */
export type MutationRoot = {
  /** delete data from the table: "bank_accounts" */
  delete_bank_accounts?: Maybe<BankAccountsMutationResponse>;
  /** delete single row from the table: "bank_accounts" */
  delete_bank_accounts_by_pk?: Maybe<BankAccounts>;
  /** delete data from the table: "bank_financial_summaries" */
  delete_bank_financial_summaries?: Maybe<BankFinancialSummariesMutationResponse>;
  /** delete single row from the table: "bank_financial_summaries" */
  delete_bank_financial_summaries_by_pk?: Maybe<BankFinancialSummaries>;
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
  /** delete data from the table: "contracts" */
  delete_contracts?: Maybe<ContractsMutationResponse>;
  /** delete single row from the table: "contracts" */
  delete_contracts_by_pk?: Maybe<Contracts>;
  /** delete data from the table: "ebba_application_files" */
  delete_ebba_application_files?: Maybe<EbbaApplicationFilesMutationResponse>;
  /** delete single row from the table: "ebba_application_files" */
  delete_ebba_application_files_by_pk?: Maybe<EbbaApplicationFiles>;
  /** delete data from the table: "ebba_applications" */
  delete_ebba_applications?: Maybe<EbbaApplicationsMutationResponse>;
  /** delete single row from the table: "ebba_applications" */
  delete_ebba_applications_by_pk?: Maybe<EbbaApplications>;
  /** delete data from the table: "files" */
  delete_files?: Maybe<FilesMutationResponse>;
  /** delete single row from the table: "files" */
  delete_files_by_pk?: Maybe<Files>;
  /** delete data from the table: "financial_summaries" */
  delete_financial_summaries?: Maybe<FinancialSummariesMutationResponse>;
  /** delete single row from the table: "financial_summaries" */
  delete_financial_summaries_by_pk?: Maybe<FinancialSummaries>;
  /** delete data from the table: "line_of_credits" */
  delete_line_of_credits?: Maybe<LineOfCreditsMutationResponse>;
  /** delete single row from the table: "line_of_credits" */
  delete_line_of_credits_by_pk?: Maybe<LineOfCredits>;
  /** delete data from the table: "loan_status" */
  delete_loan_status?: Maybe<LoanStatusMutationResponse>;
  /** delete single row from the table: "loan_status" */
  delete_loan_status_by_pk?: Maybe<LoanStatus>;
  /** delete data from the table: "loan_type" */
  delete_loan_type?: Maybe<LoanTypeMutationResponse>;
  /** delete single row from the table: "loan_type" */
  delete_loan_type_by_pk?: Maybe<LoanType>;
  /** delete data from the table: "loans" */
  delete_loans?: Maybe<LoansMutationResponse>;
  /** delete single row from the table: "loans" */
  delete_loans_by_pk?: Maybe<Loans>;
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
  /** delete data from the table: "transactions" */
  delete_transactions?: Maybe<TransactionsMutationResponse>;
  /** delete single row from the table: "transactions" */
  delete_transactions_by_pk?: Maybe<Transactions>;
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
  /** insert data into the table: "bank_financial_summaries" */
  insert_bank_financial_summaries?: Maybe<BankFinancialSummariesMutationResponse>;
  /** insert a single row into the table: "bank_financial_summaries" */
  insert_bank_financial_summaries_one?: Maybe<BankFinancialSummaries>;
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
  /** insert data into the table: "contracts" */
  insert_contracts?: Maybe<ContractsMutationResponse>;
  /** insert a single row into the table: "contracts" */
  insert_contracts_one?: Maybe<Contracts>;
  /** insert data into the table: "ebba_application_files" */
  insert_ebba_application_files?: Maybe<EbbaApplicationFilesMutationResponse>;
  /** insert a single row into the table: "ebba_application_files" */
  insert_ebba_application_files_one?: Maybe<EbbaApplicationFiles>;
  /** insert data into the table: "ebba_applications" */
  insert_ebba_applications?: Maybe<EbbaApplicationsMutationResponse>;
  /** insert a single row into the table: "ebba_applications" */
  insert_ebba_applications_one?: Maybe<EbbaApplications>;
  /** insert data into the table: "files" */
  insert_files?: Maybe<FilesMutationResponse>;
  /** insert a single row into the table: "files" */
  insert_files_one?: Maybe<Files>;
  /** insert data into the table: "financial_summaries" */
  insert_financial_summaries?: Maybe<FinancialSummariesMutationResponse>;
  /** insert a single row into the table: "financial_summaries" */
  insert_financial_summaries_one?: Maybe<FinancialSummaries>;
  /** insert data into the table: "line_of_credits" */
  insert_line_of_credits?: Maybe<LineOfCreditsMutationResponse>;
  /** insert a single row into the table: "line_of_credits" */
  insert_line_of_credits_one?: Maybe<LineOfCredits>;
  /** insert data into the table: "loan_status" */
  insert_loan_status?: Maybe<LoanStatusMutationResponse>;
  /** insert a single row into the table: "loan_status" */
  insert_loan_status_one?: Maybe<LoanStatus>;
  /** insert data into the table: "loan_type" */
  insert_loan_type?: Maybe<LoanTypeMutationResponse>;
  /** insert a single row into the table: "loan_type" */
  insert_loan_type_one?: Maybe<LoanType>;
  /** insert data into the table: "loans" */
  insert_loans?: Maybe<LoansMutationResponse>;
  /** insert a single row into the table: "loans" */
  insert_loans_one?: Maybe<Loans>;
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
  /** insert data into the table: "transactions" */
  insert_transactions?: Maybe<TransactionsMutationResponse>;
  /** insert a single row into the table: "transactions" */
  insert_transactions_one?: Maybe<Transactions>;
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
  /** update data of the table: "bank_financial_summaries" */
  update_bank_financial_summaries?: Maybe<BankFinancialSummariesMutationResponse>;
  /** update single row of the table: "bank_financial_summaries" */
  update_bank_financial_summaries_by_pk?: Maybe<BankFinancialSummaries>;
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
  /** update data of the table: "contracts" */
  update_contracts?: Maybe<ContractsMutationResponse>;
  /** update single row of the table: "contracts" */
  update_contracts_by_pk?: Maybe<Contracts>;
  /** update data of the table: "ebba_application_files" */
  update_ebba_application_files?: Maybe<EbbaApplicationFilesMutationResponse>;
  /** update single row of the table: "ebba_application_files" */
  update_ebba_application_files_by_pk?: Maybe<EbbaApplicationFiles>;
  /** update data of the table: "ebba_applications" */
  update_ebba_applications?: Maybe<EbbaApplicationsMutationResponse>;
  /** update single row of the table: "ebba_applications" */
  update_ebba_applications_by_pk?: Maybe<EbbaApplications>;
  /** update data of the table: "files" */
  update_files?: Maybe<FilesMutationResponse>;
  /** update single row of the table: "files" */
  update_files_by_pk?: Maybe<Files>;
  /** update data of the table: "financial_summaries" */
  update_financial_summaries?: Maybe<FinancialSummariesMutationResponse>;
  /** update single row of the table: "financial_summaries" */
  update_financial_summaries_by_pk?: Maybe<FinancialSummaries>;
  /** update data of the table: "line_of_credits" */
  update_line_of_credits?: Maybe<LineOfCreditsMutationResponse>;
  /** update single row of the table: "line_of_credits" */
  update_line_of_credits_by_pk?: Maybe<LineOfCredits>;
  /** update data of the table: "loan_status" */
  update_loan_status?: Maybe<LoanStatusMutationResponse>;
  /** update single row of the table: "loan_status" */
  update_loan_status_by_pk?: Maybe<LoanStatus>;
  /** update data of the table: "loan_type" */
  update_loan_type?: Maybe<LoanTypeMutationResponse>;
  /** update single row of the table: "loan_type" */
  update_loan_type_by_pk?: Maybe<LoanType>;
  /** update data of the table: "loans" */
  update_loans?: Maybe<LoansMutationResponse>;
  /** update single row of the table: "loans" */
  update_loans_by_pk?: Maybe<Loans>;
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
  /** update data of the table: "transactions" */
  update_transactions?: Maybe<TransactionsMutationResponse>;
  /** update single row of the table: "transactions" */
  update_transactions_by_pk?: Maybe<Transactions>;
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
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteBankFinancialSummariesArgs = {
  where: BankFinancialSummariesBoolExp;
};

/** mutation root */
export type MutationRootDeleteBankFinancialSummariesByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteCompaniesArgs = {
  where: CompaniesBoolExp;
};

/** mutation root */
export type MutationRootDeleteCompaniesByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteCompanyAgreementsArgs = {
  where: CompanyAgreementsBoolExp;
};

/** mutation root */
export type MutationRootDeleteCompanyAgreementsByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteCompanyLicensesArgs = {
  where: CompanyLicensesBoolExp;
};

/** mutation root */
export type MutationRootDeleteCompanyLicensesByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteCompanySettingsArgs = {
  where: CompanySettingsBoolExp;
};

/** mutation root */
export type MutationRootDeleteCompanySettingsByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteCompanyVendorPartnershipsArgs = {
  where: CompanyVendorPartnershipsBoolExp;
};

/** mutation root */
export type MutationRootDeleteCompanyVendorPartnershipsByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteContractsArgs = {
  where: ContractsBoolExp;
};

/** mutation root */
export type MutationRootDeleteContractsByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteEbbaApplicationFilesArgs = {
  where: EbbaApplicationFilesBoolExp;
};

/** mutation root */
export type MutationRootDeleteEbbaApplicationFilesByPkArgs = {
  ebba_application_id: Scalars["uuid"];
  file_id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteEbbaApplicationsArgs = {
  where: EbbaApplicationsBoolExp;
};

/** mutation root */
export type MutationRootDeleteEbbaApplicationsByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteFilesArgs = {
  where: FilesBoolExp;
};

/** mutation root */
export type MutationRootDeleteFilesByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteFinancialSummariesArgs = {
  where: FinancialSummariesBoolExp;
};

/** mutation root */
export type MutationRootDeleteFinancialSummariesByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteLineOfCreditsArgs = {
  where: LineOfCreditsBoolExp;
};

/** mutation root */
export type MutationRootDeleteLineOfCreditsByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteLoanStatusArgs = {
  where: LoanStatusBoolExp;
};

/** mutation root */
export type MutationRootDeleteLoanStatusByPkArgs = {
  value: Scalars["String"];
};

/** mutation root */
export type MutationRootDeleteLoanTypeArgs = {
  where: LoanTypeBoolExp;
};

/** mutation root */
export type MutationRootDeleteLoanTypeByPkArgs = {
  value: Scalars["String"];
};

/** mutation root */
export type MutationRootDeleteLoansArgs = {
  where: LoansBoolExp;
};

/** mutation root */
export type MutationRootDeleteLoansByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeletePaymentsArgs = {
  where: PaymentsBoolExp;
};

/** mutation root */
export type MutationRootDeletePaymentsByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteProductTypeArgs = {
  where: ProductTypeBoolExp;
};

/** mutation root */
export type MutationRootDeleteProductTypeByPkArgs = {
  value: Scalars["String"];
};

/** mutation root */
export type MutationRootDeletePurchaseOrderFileTypeArgs = {
  where: PurchaseOrderFileTypeBoolExp;
};

/** mutation root */
export type MutationRootDeletePurchaseOrderFileTypeByPkArgs = {
  value: Scalars["String"];
};

/** mutation root */
export type MutationRootDeletePurchaseOrderFilesArgs = {
  where: PurchaseOrderFilesBoolExp;
};

/** mutation root */
export type MutationRootDeletePurchaseOrderFilesByPkArgs = {
  file_id: Scalars["uuid"];
  purchase_order_id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeletePurchaseOrdersArgs = {
  where: PurchaseOrdersBoolExp;
};

/** mutation root */
export type MutationRootDeletePurchaseOrdersByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteRequestStatusArgs = {
  where: RequestStatusBoolExp;
};

/** mutation root */
export type MutationRootDeleteRequestStatusByPkArgs = {
  value: Scalars["String"];
};

/** mutation root */
export type MutationRootDeleteRevokedTokensArgs = {
  where: RevokedTokensBoolExp;
};

/** mutation root */
export type MutationRootDeleteRevokedTokensByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteTransactionsArgs = {
  where: TransactionsBoolExp;
};

/** mutation root */
export type MutationRootDeleteTransactionsByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteTwoFactorLinksArgs = {
  where: TwoFactorLinksBoolExp;
};

/** mutation root */
export type MutationRootDeleteTwoFactorLinksByPkArgs = {
  id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteUserRolesArgs = {
  where: UserRolesBoolExp;
};

/** mutation root */
export type MutationRootDeleteUserRolesByPkArgs = {
  value: Scalars["String"];
};

/** mutation root */
export type MutationRootDeleteUsersArgs = {
  where: UsersBoolExp;
};

/** mutation root */
export type MutationRootDeleteUsersByPkArgs = {
  id: Scalars["uuid"];
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
export type MutationRootInsertBankFinancialSummariesArgs = {
  objects: Array<BankFinancialSummariesInsertInput>;
  on_conflict?: Maybe<BankFinancialSummariesOnConflict>;
};

/** mutation root */
export type MutationRootInsertBankFinancialSummariesOneArgs = {
  object: BankFinancialSummariesInsertInput;
  on_conflict?: Maybe<BankFinancialSummariesOnConflict>;
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
export type MutationRootInsertContractsArgs = {
  objects: Array<ContractsInsertInput>;
  on_conflict?: Maybe<ContractsOnConflict>;
};

/** mutation root */
export type MutationRootInsertContractsOneArgs = {
  object: ContractsInsertInput;
  on_conflict?: Maybe<ContractsOnConflict>;
};

/** mutation root */
export type MutationRootInsertEbbaApplicationFilesArgs = {
  objects: Array<EbbaApplicationFilesInsertInput>;
  on_conflict?: Maybe<EbbaApplicationFilesOnConflict>;
};

/** mutation root */
export type MutationRootInsertEbbaApplicationFilesOneArgs = {
  object: EbbaApplicationFilesInsertInput;
  on_conflict?: Maybe<EbbaApplicationFilesOnConflict>;
};

/** mutation root */
export type MutationRootInsertEbbaApplicationsArgs = {
  objects: Array<EbbaApplicationsInsertInput>;
  on_conflict?: Maybe<EbbaApplicationsOnConflict>;
};

/** mutation root */
export type MutationRootInsertEbbaApplicationsOneArgs = {
  object: EbbaApplicationsInsertInput;
  on_conflict?: Maybe<EbbaApplicationsOnConflict>;
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
export type MutationRootInsertFinancialSummariesArgs = {
  objects: Array<FinancialSummariesInsertInput>;
  on_conflict?: Maybe<FinancialSummariesOnConflict>;
};

/** mutation root */
export type MutationRootInsertFinancialSummariesOneArgs = {
  object: FinancialSummariesInsertInput;
  on_conflict?: Maybe<FinancialSummariesOnConflict>;
};

/** mutation root */
export type MutationRootInsertLineOfCreditsArgs = {
  objects: Array<LineOfCreditsInsertInput>;
  on_conflict?: Maybe<LineOfCreditsOnConflict>;
};

/** mutation root */
export type MutationRootInsertLineOfCreditsOneArgs = {
  object: LineOfCreditsInsertInput;
  on_conflict?: Maybe<LineOfCreditsOnConflict>;
};

/** mutation root */
export type MutationRootInsertLoanStatusArgs = {
  objects: Array<LoanStatusInsertInput>;
  on_conflict?: Maybe<LoanStatusOnConflict>;
};

/** mutation root */
export type MutationRootInsertLoanStatusOneArgs = {
  object: LoanStatusInsertInput;
  on_conflict?: Maybe<LoanStatusOnConflict>;
};

/** mutation root */
export type MutationRootInsertLoanTypeArgs = {
  objects: Array<LoanTypeInsertInput>;
  on_conflict?: Maybe<LoanTypeOnConflict>;
};

/** mutation root */
export type MutationRootInsertLoanTypeOneArgs = {
  object: LoanTypeInsertInput;
  on_conflict?: Maybe<LoanTypeOnConflict>;
};

/** mutation root */
export type MutationRootInsertLoansArgs = {
  objects: Array<LoansInsertInput>;
  on_conflict?: Maybe<LoansOnConflict>;
};

/** mutation root */
export type MutationRootInsertLoansOneArgs = {
  object: LoansInsertInput;
  on_conflict?: Maybe<LoansOnConflict>;
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
export type MutationRootInsertTransactionsArgs = {
  objects: Array<TransactionsInsertInput>;
  on_conflict?: Maybe<TransactionsOnConflict>;
};

/** mutation root */
export type MutationRootInsertTransactionsOneArgs = {
  object: TransactionsInsertInput;
  on_conflict?: Maybe<TransactionsOnConflict>;
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
export type MutationRootUpdateBankFinancialSummariesArgs = {
  _inc?: Maybe<BankFinancialSummariesIncInput>;
  _set?: Maybe<BankFinancialSummariesSetInput>;
  where: BankFinancialSummariesBoolExp;
};

/** mutation root */
export type MutationRootUpdateBankFinancialSummariesByPkArgs = {
  _inc?: Maybe<BankFinancialSummariesIncInput>;
  _set?: Maybe<BankFinancialSummariesSetInput>;
  pk_columns: BankFinancialSummariesPkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateCompaniesArgs = {
  _inc?: Maybe<CompaniesIncInput>;
  _set?: Maybe<CompaniesSetInput>;
  where: CompaniesBoolExp;
};

/** mutation root */
export type MutationRootUpdateCompaniesByPkArgs = {
  _inc?: Maybe<CompaniesIncInput>;
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
  _set?: Maybe<CompanySettingsSetInput>;
  where: CompanySettingsBoolExp;
};

/** mutation root */
export type MutationRootUpdateCompanySettingsByPkArgs = {
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
export type MutationRootUpdateContractsArgs = {
  _append?: Maybe<ContractsAppendInput>;
  _delete_at_path?: Maybe<ContractsDeleteAtPathInput>;
  _delete_elem?: Maybe<ContractsDeleteElemInput>;
  _delete_key?: Maybe<ContractsDeleteKeyInput>;
  _prepend?: Maybe<ContractsPrependInput>;
  _set?: Maybe<ContractsSetInput>;
  where: ContractsBoolExp;
};

/** mutation root */
export type MutationRootUpdateContractsByPkArgs = {
  _append?: Maybe<ContractsAppendInput>;
  _delete_at_path?: Maybe<ContractsDeleteAtPathInput>;
  _delete_elem?: Maybe<ContractsDeleteElemInput>;
  _delete_key?: Maybe<ContractsDeleteKeyInput>;
  _prepend?: Maybe<ContractsPrependInput>;
  _set?: Maybe<ContractsSetInput>;
  pk_columns: ContractsPkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateEbbaApplicationFilesArgs = {
  _set?: Maybe<EbbaApplicationFilesSetInput>;
  where: EbbaApplicationFilesBoolExp;
};

/** mutation root */
export type MutationRootUpdateEbbaApplicationFilesByPkArgs = {
  _set?: Maybe<EbbaApplicationFilesSetInput>;
  pk_columns: EbbaApplicationFilesPkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateEbbaApplicationsArgs = {
  _inc?: Maybe<EbbaApplicationsIncInput>;
  _set?: Maybe<EbbaApplicationsSetInput>;
  where: EbbaApplicationsBoolExp;
};

/** mutation root */
export type MutationRootUpdateEbbaApplicationsByPkArgs = {
  _inc?: Maybe<EbbaApplicationsIncInput>;
  _set?: Maybe<EbbaApplicationsSetInput>;
  pk_columns: EbbaApplicationsPkColumnsInput;
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
export type MutationRootUpdateFinancialSummariesArgs = {
  _inc?: Maybe<FinancialSummariesIncInput>;
  _set?: Maybe<FinancialSummariesSetInput>;
  where: FinancialSummariesBoolExp;
};

/** mutation root */
export type MutationRootUpdateFinancialSummariesByPkArgs = {
  _inc?: Maybe<FinancialSummariesIncInput>;
  _set?: Maybe<FinancialSummariesSetInput>;
  pk_columns: FinancialSummariesPkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateLineOfCreditsArgs = {
  _set?: Maybe<LineOfCreditsSetInput>;
  where: LineOfCreditsBoolExp;
};

/** mutation root */
export type MutationRootUpdateLineOfCreditsByPkArgs = {
  _set?: Maybe<LineOfCreditsSetInput>;
  pk_columns: LineOfCreditsPkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateLoanStatusArgs = {
  _set?: Maybe<LoanStatusSetInput>;
  where: LoanStatusBoolExp;
};

/** mutation root */
export type MutationRootUpdateLoanStatusByPkArgs = {
  _set?: Maybe<LoanStatusSetInput>;
  pk_columns: LoanStatusPkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateLoanTypeArgs = {
  _set?: Maybe<LoanTypeSetInput>;
  where: LoanTypeBoolExp;
};

/** mutation root */
export type MutationRootUpdateLoanTypeByPkArgs = {
  _set?: Maybe<LoanTypeSetInput>;
  pk_columns: LoanTypePkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateLoansArgs = {
  _inc?: Maybe<LoansIncInput>;
  _set?: Maybe<LoansSetInput>;
  where: LoansBoolExp;
};

/** mutation root */
export type MutationRootUpdateLoansByPkArgs = {
  _inc?: Maybe<LoansIncInput>;
  _set?: Maybe<LoansSetInput>;
  pk_columns: LoansPkColumnsInput;
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
export type MutationRootUpdateTransactionsArgs = {
  _inc?: Maybe<TransactionsIncInput>;
  _set?: Maybe<TransactionsSetInput>;
  where: TransactionsBoolExp;
};

/** mutation root */
export type MutationRootUpdateTransactionsByPkArgs = {
  _inc?: Maybe<TransactionsIncInput>;
  _set?: Maybe<TransactionsSetInput>;
  pk_columns: TransactionsPkColumnsInput;
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
  _eq?: Maybe<Scalars["numeric"]>;
  _gt?: Maybe<Scalars["numeric"]>;
  _gte?: Maybe<Scalars["numeric"]>;
  _in?: Maybe<Array<Scalars["numeric"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["numeric"]>;
  _lte?: Maybe<Scalars["numeric"]>;
  _neq?: Maybe<Scalars["numeric"]>;
  _nin?: Maybe<Array<Scalars["numeric"]>>;
};

/** column ordering options */
export enum OrderBy {
  /** in the ascending order, nulls last */
  Asc = "asc",
  /** in the ascending order, nulls first */
  AscNullsFirst = "asc_nulls_first",
  /** in the ascending order, nulls last */
  AscNullsLast = "asc_nulls_last",
  /** in the descending order, nulls first */
  Desc = "desc",
  /** in the descending order, nulls first */
  DescNullsFirst = "desc_nulls_first",
  /** in the descending order, nulls last */
  DescNullsLast = "desc_nulls_last",
}

/**
 * Payments are dollar amounts transferred to and from the bank
 *
 *
 * columns and relationships of "payments"
 */
export type Payments = {
  amount: Scalars["numeric"];
  /** TODO: remove in favor of settled_at naming convention */
  applied_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  applied_by_user?: Maybe<Users>;
  /** An object relationship */
  bespoke_bank_account?: Maybe<BankAccounts>;
  bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  company: Companies;
  /** An object relationship */
  company_bank_account?: Maybe<BankAccounts>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id: Scalars["uuid"];
  id: Scalars["uuid"];
  /** When a user submits a repayment, describes what loans this payment is intended for */
  items_covered: Scalars["jsonb"];
  method: Scalars["String"];
  /** What day this payment or advance was deposited into a bank */
  payment_date?: Maybe<Scalars["date"]>;
  /** When a customer requests or notifies us a payment should take place, their user id is captured here */
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  /** When a customer requests or notifies us a payment should take place, the date they set is captured here */
  requested_payment_date?: Maybe<Scalars["date"]>;
  /** When this payment has been settled and applied to loans. This can only be done once. */
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  /** The date that this payment or advance is settled and is effective for financial calculations */
  settlement_date?: Maybe<Scalars["date"]>;
  /** When this payment record was originally added to the Postgres DB */
  submitted_at: Scalars["timestamptz"];
  /** An object relationship */
  submitted_by_user?: Maybe<Users>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  type: Scalars["String"];
};

/**
 * Payments are dollar amounts transferred to and from the bank
 *
 *
 * columns and relationships of "payments"
 */
export type PaymentsItemsCoveredArgs = {
  path?: Maybe<Scalars["String"]>;
};

/** aggregated selection of "payments" */
export type PaymentsAggregate = {
  aggregate?: Maybe<PaymentsAggregateFields>;
  nodes: Array<Payments>;
};

/** aggregate fields of "payments" */
export type PaymentsAggregateFields = {
  avg?: Maybe<PaymentsAvgFields>;
  count?: Maybe<Scalars["Int"]>;
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
  distinct?: Maybe<Scalars["Boolean"]>;
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
  items_covered?: Maybe<Scalars["jsonb"]>;
};

/** input type for inserting array relation for remote table "payments" */
export type PaymentsArrRelInsertInput = {
  data: Array<PaymentsInsertInput>;
  on_conflict?: Maybe<PaymentsOnConflict>;
};

/** aggregate avg on columns */
export type PaymentsAvgFields = {
  amount?: Maybe<Scalars["Float"]>;
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
  applied_at?: Maybe<TimestamptzComparisonExp>;
  applied_by_user?: Maybe<UsersBoolExp>;
  bespoke_bank_account?: Maybe<BankAccountsBoolExp>;
  bespoke_bank_account_id?: Maybe<UuidComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_bank_account?: Maybe<BankAccountsBoolExp>;
  company_bank_account_id?: Maybe<UuidComparisonExp>;
  company_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  items_covered?: Maybe<JsonbComparisonExp>;
  method?: Maybe<StringComparisonExp>;
  payment_date?: Maybe<DateComparisonExp>;
  requested_by_user_id?: Maybe<UuidComparisonExp>;
  requested_payment_date?: Maybe<DateComparisonExp>;
  settled_at?: Maybe<TimestamptzComparisonExp>;
  settled_by_user_id?: Maybe<UuidComparisonExp>;
  settlement_date?: Maybe<DateComparisonExp>;
  submitted_at?: Maybe<TimestamptzComparisonExp>;
  submitted_by_user?: Maybe<UsersBoolExp>;
  submitted_by_user_id?: Maybe<UuidComparisonExp>;
  type?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "payments" */
export enum PaymentsConstraint {
  /** unique or primary key constraint */
  PaymentsPkey = "payments_pkey",
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type PaymentsDeleteAtPathInput = {
  items_covered?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type PaymentsDeleteElemInput = {
  items_covered?: Maybe<Scalars["Int"]>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type PaymentsDeleteKeyInput = {
  items_covered?: Maybe<Scalars["String"]>;
};

/** input type for incrementing integer column in table "payments" */
export type PaymentsIncInput = {
  amount?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "payments" */
export type PaymentsInsertInput = {
  amount?: Maybe<Scalars["numeric"]>;
  applied_at?: Maybe<Scalars["timestamptz"]>;
  applied_by_user?: Maybe<UsersObjRelInsertInput>;
  bespoke_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  items_covered?: Maybe<Scalars["jsonb"]>;
  method?: Maybe<Scalars["String"]>;
  payment_date?: Maybe<Scalars["date"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  settlement_date?: Maybe<Scalars["date"]>;
  submitted_at?: Maybe<Scalars["timestamptz"]>;
  submitted_by_user?: Maybe<UsersObjRelInsertInput>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  type?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type PaymentsMaxFields = {
  amount?: Maybe<Scalars["numeric"]>;
  applied_at?: Maybe<Scalars["timestamptz"]>;
  bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  method?: Maybe<Scalars["String"]>;
  payment_date?: Maybe<Scalars["date"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  settlement_date?: Maybe<Scalars["date"]>;
  submitted_at?: Maybe<Scalars["timestamptz"]>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  type?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "payments" */
export type PaymentsMaxOrderBy = {
  amount?: Maybe<OrderBy>;
  applied_at?: Maybe<OrderBy>;
  bespoke_bank_account_id?: Maybe<OrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  payment_date?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  settled_by_user_id?: Maybe<OrderBy>;
  settlement_date?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
  submitted_by_user_id?: Maybe<OrderBy>;
  type?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PaymentsMinFields = {
  amount?: Maybe<Scalars["numeric"]>;
  applied_at?: Maybe<Scalars["timestamptz"]>;
  bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  method?: Maybe<Scalars["String"]>;
  payment_date?: Maybe<Scalars["date"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  settlement_date?: Maybe<Scalars["date"]>;
  submitted_at?: Maybe<Scalars["timestamptz"]>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  type?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "payments" */
export type PaymentsMinOrderBy = {
  amount?: Maybe<OrderBy>;
  applied_at?: Maybe<OrderBy>;
  bespoke_bank_account_id?: Maybe<OrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  payment_date?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  settled_by_user_id?: Maybe<OrderBy>;
  settlement_date?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
  submitted_by_user_id?: Maybe<OrderBy>;
  type?: Maybe<OrderBy>;
};

/** response of any mutation on the table "payments" */
export type PaymentsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  applied_at?: Maybe<OrderBy>;
  applied_by_user?: Maybe<UsersOrderBy>;
  bespoke_bank_account?: Maybe<BankAccountsOrderBy>;
  bespoke_bank_account_id?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_bank_account?: Maybe<BankAccountsOrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  items_covered?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  payment_date?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  settled_by_user_id?: Maybe<OrderBy>;
  settlement_date?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
  submitted_by_user?: Maybe<UsersOrderBy>;
  submitted_by_user_id?: Maybe<OrderBy>;
  type?: Maybe<OrderBy>;
};

/** primary key columns input for table: "payments" */
export type PaymentsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type PaymentsPrependInput = {
  items_covered?: Maybe<Scalars["jsonb"]>;
};

/** select columns of table "payments" */
export enum PaymentsSelectColumn {
  /** column name */
  Amount = "amount",
  /** column name */
  AppliedAt = "applied_at",
  /** column name */
  BespokeBankAccountId = "bespoke_bank_account_id",
  /** column name */
  CompanyBankAccountId = "company_bank_account_id",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  Id = "id",
  /** column name */
  ItemsCovered = "items_covered",
  /** column name */
  Method = "method",
  /** column name */
  PaymentDate = "payment_date",
  /** column name */
  RequestedByUserId = "requested_by_user_id",
  /** column name */
  RequestedPaymentDate = "requested_payment_date",
  /** column name */
  SettledAt = "settled_at",
  /** column name */
  SettledByUserId = "settled_by_user_id",
  /** column name */
  SettlementDate = "settlement_date",
  /** column name */
  SubmittedAt = "submitted_at",
  /** column name */
  SubmittedByUserId = "submitted_by_user_id",
  /** column name */
  Type = "type",
}

/** input type for updating data in table "payments" */
export type PaymentsSetInput = {
  amount?: Maybe<Scalars["numeric"]>;
  applied_at?: Maybe<Scalars["timestamptz"]>;
  bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  items_covered?: Maybe<Scalars["jsonb"]>;
  method?: Maybe<Scalars["String"]>;
  payment_date?: Maybe<Scalars["date"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  settlement_date?: Maybe<Scalars["date"]>;
  submitted_at?: Maybe<Scalars["timestamptz"]>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  type?: Maybe<Scalars["String"]>;
};

/** aggregate stddev on columns */
export type PaymentsStddevFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "payments" */
export type PaymentsStddevOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type PaymentsStddevPopFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "payments" */
export type PaymentsStddevPopOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type PaymentsStddevSampFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "payments" */
export type PaymentsStddevSampOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type PaymentsSumFields = {
  amount?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "payments" */
export type PaymentsSumOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** update columns of table "payments" */
export enum PaymentsUpdateColumn {
  /** column name */
  Amount = "amount",
  /** column name */
  AppliedAt = "applied_at",
  /** column name */
  BespokeBankAccountId = "bespoke_bank_account_id",
  /** column name */
  CompanyBankAccountId = "company_bank_account_id",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  Id = "id",
  /** column name */
  ItemsCovered = "items_covered",
  /** column name */
  Method = "method",
  /** column name */
  PaymentDate = "payment_date",
  /** column name */
  RequestedByUserId = "requested_by_user_id",
  /** column name */
  RequestedPaymentDate = "requested_payment_date",
  /** column name */
  SettledAt = "settled_at",
  /** column name */
  SettledByUserId = "settled_by_user_id",
  /** column name */
  SettlementDate = "settlement_date",
  /** column name */
  SubmittedAt = "submitted_at",
  /** column name */
  SubmittedByUserId = "submitted_by_user_id",
  /** column name */
  Type = "type",
}

/** aggregate var_pop on columns */
export type PaymentsVarPopFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "payments" */
export type PaymentsVarPopOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type PaymentsVarSampFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "payments" */
export type PaymentsVarSampOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type PaymentsVarianceFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "payments" */
export type PaymentsVarianceOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** columns and relationships of "product_type" */
export type ProductType = {
  display_name: Scalars["String"];
  value: Scalars["String"];
};

/** aggregated selection of "product_type" */
export type ProductTypeAggregate = {
  aggregate?: Maybe<ProductTypeAggregateFields>;
  nodes: Array<ProductType>;
};

/** aggregate fields of "product_type" */
export type ProductTypeAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<ProductTypeMaxFields>;
  min?: Maybe<ProductTypeMinFields>;
};

/** aggregate fields of "product_type" */
export type ProductTypeAggregateFieldsCountArgs = {
  columns?: Maybe<Array<ProductTypeSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  ProductTypePkey = "product_type_pkey",
}

export enum ProductTypeEnum {
  /** Inventory Financing */
  InventoryFinancing = "inventory_financing",
  /** Invoice Financing */
  InvoiceFinancing = "invoice_financing",
  /** Line of Credit */
  LineOfCredit = "line_of_credit",
  /** None */
  None = "none",
  /** Purchase Money Financing */
  PurchaseMoneyFinancing = "purchase_money_financing",
}

/** expression to compare columns of type product_type_enum. All fields are combined with logical 'AND'. */
export type ProductTypeEnumComparisonExp = {
  _eq?: Maybe<ProductTypeEnum>;
  _in?: Maybe<Array<ProductTypeEnum>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<ProductTypeEnum>;
  _nin?: Maybe<Array<ProductTypeEnum>>;
};

/** input type for inserting data into table "product_type" */
export type ProductTypeInsertInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type ProductTypeMaxFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "product_type" */
export type ProductTypeMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type ProductTypeMinFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "product_type" */
export type ProductTypeMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "product_type" */
export type ProductTypeMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  value: Scalars["String"];
};

/** select columns of table "product_type" */
export enum ProductTypeSelectColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** input type for updating data in table "product_type" */
export type ProductTypeSetInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** update columns of table "product_type" */
export enum ProductTypeUpdateColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/**
 * Enum for PurchaseOrderFile types
 *
 *
 * columns and relationships of "purchase_order_file_type"
 */
export type PurchaseOrderFileType = {
  display_name: Scalars["String"];
  value: Scalars["String"];
};

/** aggregated selection of "purchase_order_file_type" */
export type PurchaseOrderFileTypeAggregate = {
  aggregate?: Maybe<PurchaseOrderFileTypeAggregateFields>;
  nodes: Array<PurchaseOrderFileType>;
};

/** aggregate fields of "purchase_order_file_type" */
export type PurchaseOrderFileTypeAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<PurchaseOrderFileTypeMaxFields>;
  min?: Maybe<PurchaseOrderFileTypeMinFields>;
};

/** aggregate fields of "purchase_order_file_type" */
export type PurchaseOrderFileTypeAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  PurchaseOrderFileTypePkey = "purchase_order_file_type_pkey",
}

export enum PurchaseOrderFileTypeEnum {
  /** Cannabis */
  Cannabis = "cannabis",
  /** Purchase Order */
  PurchaseOrder = "purchase_order",
}

/** expression to compare columns of type purchase_order_file_type_enum. All fields are combined with logical 'AND'. */
export type PurchaseOrderFileTypeEnumComparisonExp = {
  _eq?: Maybe<PurchaseOrderFileTypeEnum>;
  _in?: Maybe<Array<PurchaseOrderFileTypeEnum>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<PurchaseOrderFileTypeEnum>;
  _nin?: Maybe<Array<PurchaseOrderFileTypeEnum>>;
};

/** input type for inserting data into table "purchase_order_file_type" */
export type PurchaseOrderFileTypeInsertInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type PurchaseOrderFileTypeMaxFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "purchase_order_file_type" */
export type PurchaseOrderFileTypeMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrderFileTypeMinFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "purchase_order_file_type" */
export type PurchaseOrderFileTypeMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "purchase_order_file_type" */
export type PurchaseOrderFileTypeMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  value: Scalars["String"];
};

/** select columns of table "purchase_order_file_type" */
export enum PurchaseOrderFileTypeSelectColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** input type for updating data in table "purchase_order_file_type" */
export type PurchaseOrderFileTypeSetInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** update columns of table "purchase_order_file_type" */
export enum PurchaseOrderFileTypeUpdateColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
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
  file_id: Scalars["uuid"];
  file_type: PurchaseOrderFileTypeEnum;
  /** An object relationship */
  purchase_order: PurchaseOrders;
  purchase_order_id: Scalars["uuid"];
};

/** aggregated selection of "purchase_order_files" */
export type PurchaseOrderFilesAggregate = {
  aggregate?: Maybe<PurchaseOrderFilesAggregateFields>;
  nodes: Array<PurchaseOrderFiles>;
};

/** aggregate fields of "purchase_order_files" */
export type PurchaseOrderFilesAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<PurchaseOrderFilesMaxFields>;
  min?: Maybe<PurchaseOrderFilesMinFields>;
};

/** aggregate fields of "purchase_order_files" */
export type PurchaseOrderFilesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  PurchaseOrderFilesPkey = "purchase_order_files_pkey",
}

/** input type for inserting data into table "purchase_order_files" */
export type PurchaseOrderFilesInsertInput = {
  file?: Maybe<FilesObjRelInsertInput>;
  file_id?: Maybe<Scalars["uuid"]>;
  file_type?: Maybe<PurchaseOrderFileTypeEnum>;
  purchase_order?: Maybe<PurchaseOrdersObjRelInsertInput>;
  purchase_order_id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type PurchaseOrderFilesMaxFields = {
  file_id?: Maybe<Scalars["uuid"]>;
  purchase_order_id?: Maybe<Scalars["uuid"]>;
};

/** order by max() on columns of table "purchase_order_files" */
export type PurchaseOrderFilesMaxOrderBy = {
  file_id?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrderFilesMinFields = {
  file_id?: Maybe<Scalars["uuid"]>;
  purchase_order_id?: Maybe<Scalars["uuid"]>;
};

/** order by min() on columns of table "purchase_order_files" */
export type PurchaseOrderFilesMinOrderBy = {
  file_id?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "purchase_order_files" */
export type PurchaseOrderFilesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  file_id: Scalars["uuid"];
  purchase_order_id: Scalars["uuid"];
};

/** select columns of table "purchase_order_files" */
export enum PurchaseOrderFilesSelectColumn {
  /** column name */
  FileId = "file_id",
  /** column name */
  FileType = "file_type",
  /** column name */
  PurchaseOrderId = "purchase_order_id",
}

/** input type for updating data in table "purchase_order_files" */
export type PurchaseOrderFilesSetInput = {
  file_id?: Maybe<Scalars["uuid"]>;
  file_type?: Maybe<PurchaseOrderFileTypeEnum>;
  purchase_order_id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "purchase_order_files" */
export enum PurchaseOrderFilesUpdateColumn {
  /** column name */
  FileId = "file_id",
  /** column name */
  FileType = "file_type",
  /** column name */
  PurchaseOrderId = "purchase_order_id",
}

/** columns and relationships of "purchase_orders" */
export type PurchaseOrders = {
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  created_at: Scalars["timestamptz"];
  delivery_date?: Maybe<Scalars["date"]>;
  id: Scalars["uuid"];
  is_cannabis?: Maybe<Scalars["Boolean"]>;
  /** An array relationship */
  loans: Array<Loans>;
  /** An aggregated array relationship */
  loans_aggregate: LoansAggregate;
  order_date?: Maybe<Scalars["date"]>;
  order_number: Scalars["String"];
  /** An array relationship */
  purchase_order_files: Array<PurchaseOrderFiles>;
  /** An aggregated array relationship */
  purchase_order_files_aggregate: PurchaseOrderFilesAggregate;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status: RequestStatusEnum;
  updated_at: Scalars["timestamptz"];
  /** An object relationship */
  vendor?: Maybe<Vendors>;
  vendor_id: Scalars["uuid"];
};

/** columns and relationships of "purchase_orders" */
export type PurchaseOrdersLoansArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** columns and relationships of "purchase_orders" */
export type PurchaseOrdersLoansAggregateArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** columns and relationships of "purchase_orders" */
export type PurchaseOrdersPurchaseOrderFilesArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};

/** columns and relationships of "purchase_orders" */
export type PurchaseOrdersPurchaseOrderFilesAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  count?: Maybe<Scalars["Int"]>;
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
  distinct?: Maybe<Scalars["Boolean"]>;
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
  amount?: Maybe<Scalars["Float"]>;
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
  loans?: Maybe<LoansBoolExp>;
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
  PurchaseOrdersPkey = "purchase_orders_pkey",
}

/** input type for incrementing integer column in table "purchase_orders" */
export type PurchaseOrdersIncInput = {
  amount?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "purchase_orders" */
export type PurchaseOrdersInsertInput = {
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  delivery_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_cannabis?: Maybe<Scalars["Boolean"]>;
  loans?: Maybe<LoansArrRelInsertInput>;
  order_date?: Maybe<Scalars["date"]>;
  order_number?: Maybe<Scalars["String"]>;
  purchase_order_files?: Maybe<PurchaseOrderFilesArrRelInsertInput>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status?: Maybe<RequestStatusEnum>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor?: Maybe<VendorsObjRelInsertInput>;
  vendor_id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type PurchaseOrdersMaxFields = {
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  delivery_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  order_date?: Maybe<Scalars["date"]>;
  order_number?: Maybe<Scalars["String"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_id?: Maybe<Scalars["uuid"]>;
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
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  delivery_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  order_date?: Maybe<Scalars["date"]>;
  order_number?: Maybe<Scalars["String"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_id?: Maybe<Scalars["uuid"]>;
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
  affected_rows: Scalars["Int"];
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
  loans_aggregate?: Maybe<LoansAggregateOrderBy>;
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
  id: Scalars["uuid"];
};

/** select columns of table "purchase_orders" */
export enum PurchaseOrdersSelectColumn {
  /** column name */
  Amount = "amount",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  DeliveryDate = "delivery_date",
  /** column name */
  Id = "id",
  /** column name */
  IsCannabis = "is_cannabis",
  /** column name */
  OrderDate = "order_date",
  /** column name */
  OrderNumber = "order_number",
  /** column name */
  RejectedAt = "rejected_at",
  /** column name */
  RejectionNote = "rejection_note",
  /** column name */
  RequestedAt = "requested_at",
  /** column name */
  Status = "status",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  VendorId = "vendor_id",
}

/** input type for updating data in table "purchase_orders" */
export type PurchaseOrdersSetInput = {
  amount?: Maybe<Scalars["numeric"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  delivery_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_cannabis?: Maybe<Scalars["Boolean"]>;
  order_date?: Maybe<Scalars["date"]>;
  order_number?: Maybe<Scalars["String"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status?: Maybe<RequestStatusEnum>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_id?: Maybe<Scalars["uuid"]>;
};

/** aggregate stddev on columns */
export type PurchaseOrdersStddevFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "purchase_orders" */
export type PurchaseOrdersStddevOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type PurchaseOrdersStddevPopFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "purchase_orders" */
export type PurchaseOrdersStddevPopOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type PurchaseOrdersStddevSampFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "purchase_orders" */
export type PurchaseOrdersStddevSampOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type PurchaseOrdersSumFields = {
  amount?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "purchase_orders" */
export type PurchaseOrdersSumOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** update columns of table "purchase_orders" */
export enum PurchaseOrdersUpdateColumn {
  /** column name */
  Amount = "amount",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  DeliveryDate = "delivery_date",
  /** column name */
  Id = "id",
  /** column name */
  IsCannabis = "is_cannabis",
  /** column name */
  OrderDate = "order_date",
  /** column name */
  OrderNumber = "order_number",
  /** column name */
  RejectedAt = "rejected_at",
  /** column name */
  RejectionNote = "rejection_note",
  /** column name */
  RequestedAt = "requested_at",
  /** column name */
  Status = "status",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  VendorId = "vendor_id",
}

/** aggregate var_pop on columns */
export type PurchaseOrdersVarPopFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "purchase_orders" */
export type PurchaseOrdersVarPopOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type PurchaseOrdersVarSampFields = {
  amount?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "purchase_orders" */
export type PurchaseOrdersVarSampOrderBy = {
  amount?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type PurchaseOrdersVarianceFields = {
  amount?: Maybe<Scalars["Float"]>;
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
  /** fetch data from the table: "bank_financial_summaries" */
  bank_financial_summaries: Array<BankFinancialSummaries>;
  /** fetch aggregated fields from the table: "bank_financial_summaries" */
  bank_financial_summaries_aggregate: BankFinancialSummariesAggregate;
  /** fetch data from the table: "bank_financial_summaries" using primary key columns */
  bank_financial_summaries_by_pk?: Maybe<BankFinancialSummaries>;
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
  /** fetch data from the table: "contracts" */
  contracts: Array<Contracts>;
  /** fetch aggregated fields from the table: "contracts" */
  contracts_aggregate: ContractsAggregate;
  /** fetch data from the table: "contracts" using primary key columns */
  contracts_by_pk?: Maybe<Contracts>;
  /** fetch data from the table: "ebba_application_files" */
  ebba_application_files: Array<EbbaApplicationFiles>;
  /** fetch aggregated fields from the table: "ebba_application_files" */
  ebba_application_files_aggregate: EbbaApplicationFilesAggregate;
  /** fetch data from the table: "ebba_application_files" using primary key columns */
  ebba_application_files_by_pk?: Maybe<EbbaApplicationFiles>;
  /** fetch data from the table: "ebba_applications" */
  ebba_applications: Array<EbbaApplications>;
  /** fetch aggregated fields from the table: "ebba_applications" */
  ebba_applications_aggregate: EbbaApplicationsAggregate;
  /** fetch data from the table: "ebba_applications" using primary key columns */
  ebba_applications_by_pk?: Maybe<EbbaApplications>;
  /** fetch data from the table: "files" */
  files: Array<Files>;
  /** fetch aggregated fields from the table: "files" */
  files_aggregate: FilesAggregate;
  /** fetch data from the table: "files" using primary key columns */
  files_by_pk?: Maybe<Files>;
  /** fetch data from the table: "financial_summaries" */
  financial_summaries: Array<FinancialSummaries>;
  /** fetch aggregated fields from the table: "financial_summaries" */
  financial_summaries_aggregate: FinancialSummariesAggregate;
  /** fetch data from the table: "financial_summaries" using primary key columns */
  financial_summaries_by_pk?: Maybe<FinancialSummaries>;
  /** fetch data from the table: "line_of_credits" */
  line_of_credits: Array<LineOfCredits>;
  /** fetch aggregated fields from the table: "line_of_credits" */
  line_of_credits_aggregate: LineOfCreditsAggregate;
  /** fetch data from the table: "line_of_credits" using primary key columns */
  line_of_credits_by_pk?: Maybe<LineOfCredits>;
  /** fetch data from the table: "loan_status" */
  loan_status: Array<LoanStatus>;
  /** fetch aggregated fields from the table: "loan_status" */
  loan_status_aggregate: LoanStatusAggregate;
  /** fetch data from the table: "loan_status" using primary key columns */
  loan_status_by_pk?: Maybe<LoanStatus>;
  /** fetch data from the table: "loan_type" */
  loan_type: Array<LoanType>;
  /** fetch aggregated fields from the table: "loan_type" */
  loan_type_aggregate: LoanTypeAggregate;
  /** fetch data from the table: "loan_type" using primary key columns */
  loan_type_by_pk?: Maybe<LoanType>;
  /** fetch data from the table: "loans" */
  loans: Array<Loans>;
  /** fetch aggregated fields from the table: "loans" */
  loans_aggregate: LoansAggregate;
  /** fetch data from the table: "loans" using primary key columns */
  loans_by_pk?: Maybe<Loans>;
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
  /** fetch data from the table: "transactions" */
  transactions: Array<Transactions>;
  /** fetch aggregated fields from the table: "transactions" */
  transactions_aggregate: TransactionsAggregate;
  /** fetch data from the table: "transactions" using primary key columns */
  transactions_by_pk?: Maybe<Transactions>;
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
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};

/** query root */
export type QueryRootBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};

/** query root */
export type QueryRootBankAccountsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootBankFinancialSummariesArgs = {
  distinct_on?: Maybe<Array<BankFinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankFinancialSummariesOrderBy>>;
  where?: Maybe<BankFinancialSummariesBoolExp>;
};

/** query root */
export type QueryRootBankFinancialSummariesAggregateArgs = {
  distinct_on?: Maybe<Array<BankFinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankFinancialSummariesOrderBy>>;
  where?: Maybe<BankFinancialSummariesBoolExp>;
};

/** query root */
export type QueryRootBankFinancialSummariesByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootCompaniesArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};

/** query root */
export type QueryRootCompaniesAggregateArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};

/** query root */
export type QueryRootCompaniesByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootCompanyAgreementsArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};

/** query root */
export type QueryRootCompanyAgreementsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};

/** query root */
export type QueryRootCompanyAgreementsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootCompanyLicensesArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};

/** query root */
export type QueryRootCompanyLicensesAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};

/** query root */
export type QueryRootCompanyLicensesByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootCompanySettingsArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** query root */
export type QueryRootCompanySettingsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** query root */
export type QueryRootCompanySettingsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** query root */
export type QueryRootCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** query root */
export type QueryRootCompanyVendorPartnershipsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootContractsArgs = {
  distinct_on?: Maybe<Array<ContractsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ContractsOrderBy>>;
  where?: Maybe<ContractsBoolExp>;
};

/** query root */
export type QueryRootContractsAggregateArgs = {
  distinct_on?: Maybe<Array<ContractsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ContractsOrderBy>>;
  where?: Maybe<ContractsBoolExp>;
};

/** query root */
export type QueryRootContractsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootEbbaApplicationFilesArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationFilesOrderBy>>;
  where?: Maybe<EbbaApplicationFilesBoolExp>;
};

/** query root */
export type QueryRootEbbaApplicationFilesAggregateArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationFilesOrderBy>>;
  where?: Maybe<EbbaApplicationFilesBoolExp>;
};

/** query root */
export type QueryRootEbbaApplicationFilesByPkArgs = {
  ebba_application_id: Scalars["uuid"];
  file_id: Scalars["uuid"];
};

/** query root */
export type QueryRootEbbaApplicationsArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationsOrderBy>>;
  where?: Maybe<EbbaApplicationsBoolExp>;
};

/** query root */
export type QueryRootEbbaApplicationsAggregateArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationsOrderBy>>;
  where?: Maybe<EbbaApplicationsBoolExp>;
};

/** query root */
export type QueryRootEbbaApplicationsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootFilesArgs = {
  distinct_on?: Maybe<Array<FilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FilesOrderBy>>;
  where?: Maybe<FilesBoolExp>;
};

/** query root */
export type QueryRootFilesAggregateArgs = {
  distinct_on?: Maybe<Array<FilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FilesOrderBy>>;
  where?: Maybe<FilesBoolExp>;
};

/** query root */
export type QueryRootFilesByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootFinancialSummariesArgs = {
  distinct_on?: Maybe<Array<FinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FinancialSummariesOrderBy>>;
  where?: Maybe<FinancialSummariesBoolExp>;
};

/** query root */
export type QueryRootFinancialSummariesAggregateArgs = {
  distinct_on?: Maybe<Array<FinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FinancialSummariesOrderBy>>;
  where?: Maybe<FinancialSummariesBoolExp>;
};

/** query root */
export type QueryRootFinancialSummariesByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootLineOfCreditsArgs = {
  distinct_on?: Maybe<Array<LineOfCreditsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LineOfCreditsOrderBy>>;
  where?: Maybe<LineOfCreditsBoolExp>;
};

/** query root */
export type QueryRootLineOfCreditsAggregateArgs = {
  distinct_on?: Maybe<Array<LineOfCreditsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LineOfCreditsOrderBy>>;
  where?: Maybe<LineOfCreditsBoolExp>;
};

/** query root */
export type QueryRootLineOfCreditsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootLoanStatusArgs = {
  distinct_on?: Maybe<Array<LoanStatusSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoanStatusOrderBy>>;
  where?: Maybe<LoanStatusBoolExp>;
};

/** query root */
export type QueryRootLoanStatusAggregateArgs = {
  distinct_on?: Maybe<Array<LoanStatusSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoanStatusOrderBy>>;
  where?: Maybe<LoanStatusBoolExp>;
};

/** query root */
export type QueryRootLoanStatusByPkArgs = {
  value: Scalars["String"];
};

/** query root */
export type QueryRootLoanTypeArgs = {
  distinct_on?: Maybe<Array<LoanTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoanTypeOrderBy>>;
  where?: Maybe<LoanTypeBoolExp>;
};

/** query root */
export type QueryRootLoanTypeAggregateArgs = {
  distinct_on?: Maybe<Array<LoanTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoanTypeOrderBy>>;
  where?: Maybe<LoanTypeBoolExp>;
};

/** query root */
export type QueryRootLoanTypeByPkArgs = {
  value: Scalars["String"];
};

/** query root */
export type QueryRootLoansArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** query root */
export type QueryRootLoansAggregateArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** query root */
export type QueryRootLoansByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootPaymentsArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};

/** query root */
export type QueryRootPaymentsAggregateArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};

/** query root */
export type QueryRootPaymentsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootProductTypeArgs = {
  distinct_on?: Maybe<Array<ProductTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ProductTypeOrderBy>>;
  where?: Maybe<ProductTypeBoolExp>;
};

/** query root */
export type QueryRootProductTypeAggregateArgs = {
  distinct_on?: Maybe<Array<ProductTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ProductTypeOrderBy>>;
  where?: Maybe<ProductTypeBoolExp>;
};

/** query root */
export type QueryRootProductTypeByPkArgs = {
  value: Scalars["String"];
};

/** query root */
export type QueryRootPurchaseOrderFileTypeArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFileTypeOrderBy>>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};

/** query root */
export type QueryRootPurchaseOrderFileTypeAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFileTypeOrderBy>>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};

/** query root */
export type QueryRootPurchaseOrderFileTypeByPkArgs = {
  value: Scalars["String"];
};

/** query root */
export type QueryRootPurchaseOrderFilesArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};

/** query root */
export type QueryRootPurchaseOrderFilesAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};

/** query root */
export type QueryRootPurchaseOrderFilesByPkArgs = {
  file_id: Scalars["uuid"];
  purchase_order_id: Scalars["uuid"];
};

/** query root */
export type QueryRootPurchaseOrdersArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** query root */
export type QueryRootPurchaseOrdersAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** query root */
export type QueryRootPurchaseOrdersByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootRequestStatusArgs = {
  distinct_on?: Maybe<Array<RequestStatusSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<RequestStatusOrderBy>>;
  where?: Maybe<RequestStatusBoolExp>;
};

/** query root */
export type QueryRootRequestStatusAggregateArgs = {
  distinct_on?: Maybe<Array<RequestStatusSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<RequestStatusOrderBy>>;
  where?: Maybe<RequestStatusBoolExp>;
};

/** query root */
export type QueryRootRequestStatusByPkArgs = {
  value: Scalars["String"];
};

/** query root */
export type QueryRootRevokedTokensArgs = {
  distinct_on?: Maybe<Array<RevokedTokensSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<RevokedTokensOrderBy>>;
  where?: Maybe<RevokedTokensBoolExp>;
};

/** query root */
export type QueryRootRevokedTokensAggregateArgs = {
  distinct_on?: Maybe<Array<RevokedTokensSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<RevokedTokensOrderBy>>;
  where?: Maybe<RevokedTokensBoolExp>;
};

/** query root */
export type QueryRootRevokedTokensByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootTransactionsArgs = {
  distinct_on?: Maybe<Array<TransactionsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TransactionsOrderBy>>;
  where?: Maybe<TransactionsBoolExp>;
};

/** query root */
export type QueryRootTransactionsAggregateArgs = {
  distinct_on?: Maybe<Array<TransactionsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TransactionsOrderBy>>;
  where?: Maybe<TransactionsBoolExp>;
};

/** query root */
export type QueryRootTransactionsByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootTwoFactorLinksArgs = {
  distinct_on?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TwoFactorLinksOrderBy>>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};

/** query root */
export type QueryRootTwoFactorLinksAggregateArgs = {
  distinct_on?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TwoFactorLinksOrderBy>>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};

/** query root */
export type QueryRootTwoFactorLinksByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootUserRolesArgs = {
  distinct_on?: Maybe<Array<UserRolesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UserRolesOrderBy>>;
  where?: Maybe<UserRolesBoolExp>;
};

/** query root */
export type QueryRootUserRolesAggregateArgs = {
  distinct_on?: Maybe<Array<UserRolesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UserRolesOrderBy>>;
  where?: Maybe<UserRolesBoolExp>;
};

/** query root */
export type QueryRootUserRolesByPkArgs = {
  value: Scalars["String"];
};

/** query root */
export type QueryRootUsersArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};

/** query root */
export type QueryRootUsersAggregateArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};

/** query root */
export type QueryRootUsersByPkArgs = {
  id: Scalars["uuid"];
};

/** query root */
export type QueryRootVendorsArgs = {
  distinct_on?: Maybe<Array<VendorsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<VendorsOrderBy>>;
  where?: Maybe<VendorsBoolExp>;
};

/** query root */
export type QueryRootVendorsAggregateArgs = {
  distinct_on?: Maybe<Array<VendorsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<VendorsOrderBy>>;
  where?: Maybe<VendorsBoolExp>;
};

/** columns and relationships of "request_status" */
export type RequestStatus = {
  display_name: Scalars["String"];
  value: Scalars["String"];
};

/** aggregated selection of "request_status" */
export type RequestStatusAggregate = {
  aggregate?: Maybe<RequestStatusAggregateFields>;
  nodes: Array<RequestStatus>;
};

/** aggregate fields of "request_status" */
export type RequestStatusAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<RequestStatusMaxFields>;
  min?: Maybe<RequestStatusMinFields>;
};

/** aggregate fields of "request_status" */
export type RequestStatusAggregateFieldsCountArgs = {
  columns?: Maybe<Array<RequestStatusSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  VendorRequestStatusPkey = "vendor_request_status_pkey",
}

export enum RequestStatusEnum {
  /** Pending */
  ApprovalRequested = "approval_requested",
  /** Approved */
  Approved = "approved",
  /** Draft */
  Drafted = "drafted",
  /** Rejected */
  Rejected = "rejected",
}

/** expression to compare columns of type request_status_enum. All fields are combined with logical 'AND'. */
export type RequestStatusEnumComparisonExp = {
  _eq?: Maybe<RequestStatusEnum>;
  _in?: Maybe<Array<RequestStatusEnum>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<RequestStatusEnum>;
  _nin?: Maybe<Array<RequestStatusEnum>>;
};

/** input type for inserting data into table "request_status" */
export type RequestStatusInsertInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type RequestStatusMaxFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "request_status" */
export type RequestStatusMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type RequestStatusMinFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "request_status" */
export type RequestStatusMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "request_status" */
export type RequestStatusMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  value: Scalars["String"];
};

/** select columns of table "request_status" */
export enum RequestStatusSelectColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** input type for updating data in table "request_status" */
export type RequestStatusSetInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** update columns of table "request_status" */
export enum RequestStatusUpdateColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** columns and relationships of "revoked_tokens" */
export type RevokedTokens = {
  created_at: Scalars["timestamptz"];
  id: Scalars["uuid"];
  jti: Scalars["String"];
  user_id: Scalars["uuid"];
};

/** aggregated selection of "revoked_tokens" */
export type RevokedTokensAggregate = {
  aggregate?: Maybe<RevokedTokensAggregateFields>;
  nodes: Array<RevokedTokens>;
};

/** aggregate fields of "revoked_tokens" */
export type RevokedTokensAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<RevokedTokensMaxFields>;
  min?: Maybe<RevokedTokensMinFields>;
};

/** aggregate fields of "revoked_tokens" */
export type RevokedTokensAggregateFieldsCountArgs = {
  columns?: Maybe<Array<RevokedTokensSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  RevokedTokensPkey = "revoked_tokens_pkey",
}

/** input type for inserting data into table "revoked_tokens" */
export type RevokedTokensInsertInput = {
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  jti?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type RevokedTokensMaxFields = {
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  jti?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
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
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  jti?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
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
  affected_rows: Scalars["Int"];
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
  id: Scalars["uuid"];
};

/** select columns of table "revoked_tokens" */
export enum RevokedTokensSelectColumn {
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  Jti = "jti",
  /** column name */
  UserId = "user_id",
}

/** input type for updating data in table "revoked_tokens" */
export type RevokedTokensSetInput = {
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  jti?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "revoked_tokens" */
export enum RevokedTokensUpdateColumn {
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  Jti = "jti",
  /** column name */
  UserId = "user_id",
}

/** subscription root */
export type SubscriptionRoot = {
  /** fetch data from the table: "bank_accounts" */
  bank_accounts: Array<BankAccounts>;
  /** fetch aggregated fields from the table: "bank_accounts" */
  bank_accounts_aggregate: BankAccountsAggregate;
  /** fetch data from the table: "bank_accounts" using primary key columns */
  bank_accounts_by_pk?: Maybe<BankAccounts>;
  /** fetch data from the table: "bank_financial_summaries" */
  bank_financial_summaries: Array<BankFinancialSummaries>;
  /** fetch aggregated fields from the table: "bank_financial_summaries" */
  bank_financial_summaries_aggregate: BankFinancialSummariesAggregate;
  /** fetch data from the table: "bank_financial_summaries" using primary key columns */
  bank_financial_summaries_by_pk?: Maybe<BankFinancialSummaries>;
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
  /** fetch data from the table: "contracts" */
  contracts: Array<Contracts>;
  /** fetch aggregated fields from the table: "contracts" */
  contracts_aggregate: ContractsAggregate;
  /** fetch data from the table: "contracts" using primary key columns */
  contracts_by_pk?: Maybe<Contracts>;
  /** fetch data from the table: "ebba_application_files" */
  ebba_application_files: Array<EbbaApplicationFiles>;
  /** fetch aggregated fields from the table: "ebba_application_files" */
  ebba_application_files_aggregate: EbbaApplicationFilesAggregate;
  /** fetch data from the table: "ebba_application_files" using primary key columns */
  ebba_application_files_by_pk?: Maybe<EbbaApplicationFiles>;
  /** fetch data from the table: "ebba_applications" */
  ebba_applications: Array<EbbaApplications>;
  /** fetch aggregated fields from the table: "ebba_applications" */
  ebba_applications_aggregate: EbbaApplicationsAggregate;
  /** fetch data from the table: "ebba_applications" using primary key columns */
  ebba_applications_by_pk?: Maybe<EbbaApplications>;
  /** fetch data from the table: "files" */
  files: Array<Files>;
  /** fetch aggregated fields from the table: "files" */
  files_aggregate: FilesAggregate;
  /** fetch data from the table: "files" using primary key columns */
  files_by_pk?: Maybe<Files>;
  /** fetch data from the table: "financial_summaries" */
  financial_summaries: Array<FinancialSummaries>;
  /** fetch aggregated fields from the table: "financial_summaries" */
  financial_summaries_aggregate: FinancialSummariesAggregate;
  /** fetch data from the table: "financial_summaries" using primary key columns */
  financial_summaries_by_pk?: Maybe<FinancialSummaries>;
  /** fetch data from the table: "line_of_credits" */
  line_of_credits: Array<LineOfCredits>;
  /** fetch aggregated fields from the table: "line_of_credits" */
  line_of_credits_aggregate: LineOfCreditsAggregate;
  /** fetch data from the table: "line_of_credits" using primary key columns */
  line_of_credits_by_pk?: Maybe<LineOfCredits>;
  /** fetch data from the table: "loan_status" */
  loan_status: Array<LoanStatus>;
  /** fetch aggregated fields from the table: "loan_status" */
  loan_status_aggregate: LoanStatusAggregate;
  /** fetch data from the table: "loan_status" using primary key columns */
  loan_status_by_pk?: Maybe<LoanStatus>;
  /** fetch data from the table: "loan_type" */
  loan_type: Array<LoanType>;
  /** fetch aggregated fields from the table: "loan_type" */
  loan_type_aggregate: LoanTypeAggregate;
  /** fetch data from the table: "loan_type" using primary key columns */
  loan_type_by_pk?: Maybe<LoanType>;
  /** fetch data from the table: "loans" */
  loans: Array<Loans>;
  /** fetch aggregated fields from the table: "loans" */
  loans_aggregate: LoansAggregate;
  /** fetch data from the table: "loans" using primary key columns */
  loans_by_pk?: Maybe<Loans>;
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
  /** fetch data from the table: "transactions" */
  transactions: Array<Transactions>;
  /** fetch aggregated fields from the table: "transactions" */
  transactions_aggregate: TransactionsAggregate;
  /** fetch data from the table: "transactions" using primary key columns */
  transactions_by_pk?: Maybe<Transactions>;
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
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};

/** subscription root */
export type SubscriptionRootBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<BankAccountsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankAccountsOrderBy>>;
  where?: Maybe<BankAccountsBoolExp>;
};

/** subscription root */
export type SubscriptionRootBankAccountsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootBankFinancialSummariesArgs = {
  distinct_on?: Maybe<Array<BankFinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankFinancialSummariesOrderBy>>;
  where?: Maybe<BankFinancialSummariesBoolExp>;
};

/** subscription root */
export type SubscriptionRootBankFinancialSummariesAggregateArgs = {
  distinct_on?: Maybe<Array<BankFinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<BankFinancialSummariesOrderBy>>;
  where?: Maybe<BankFinancialSummariesBoolExp>;
};

/** subscription root */
export type SubscriptionRootBankFinancialSummariesByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootCompaniesArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompaniesAggregateArgs = {
  distinct_on?: Maybe<Array<CompaniesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompaniesOrderBy>>;
  where?: Maybe<CompaniesBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompaniesByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootCompanyAgreementsArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyAgreementsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyAgreementsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyAgreementsOrderBy>>;
  where?: Maybe<CompanyAgreementsBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyAgreementsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootCompanyLicensesArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyLicensesAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyLicensesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyLicensesOrderBy>>;
  where?: Maybe<CompanyLicensesBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyLicensesByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootCompanySettingsArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanySettingsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanySettingsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanySettingsOrderBy>>;
  where?: Maybe<CompanySettingsBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanySettingsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyVendorPartnershipsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootContractsArgs = {
  distinct_on?: Maybe<Array<ContractsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ContractsOrderBy>>;
  where?: Maybe<ContractsBoolExp>;
};

/** subscription root */
export type SubscriptionRootContractsAggregateArgs = {
  distinct_on?: Maybe<Array<ContractsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ContractsOrderBy>>;
  where?: Maybe<ContractsBoolExp>;
};

/** subscription root */
export type SubscriptionRootContractsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootEbbaApplicationFilesArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationFilesOrderBy>>;
  where?: Maybe<EbbaApplicationFilesBoolExp>;
};

/** subscription root */
export type SubscriptionRootEbbaApplicationFilesAggregateArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationFilesOrderBy>>;
  where?: Maybe<EbbaApplicationFilesBoolExp>;
};

/** subscription root */
export type SubscriptionRootEbbaApplicationFilesByPkArgs = {
  ebba_application_id: Scalars["uuid"];
  file_id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootEbbaApplicationsArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationsOrderBy>>;
  where?: Maybe<EbbaApplicationsBoolExp>;
};

/** subscription root */
export type SubscriptionRootEbbaApplicationsAggregateArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationsOrderBy>>;
  where?: Maybe<EbbaApplicationsBoolExp>;
};

/** subscription root */
export type SubscriptionRootEbbaApplicationsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootFilesArgs = {
  distinct_on?: Maybe<Array<FilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FilesOrderBy>>;
  where?: Maybe<FilesBoolExp>;
};

/** subscription root */
export type SubscriptionRootFilesAggregateArgs = {
  distinct_on?: Maybe<Array<FilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FilesOrderBy>>;
  where?: Maybe<FilesBoolExp>;
};

/** subscription root */
export type SubscriptionRootFilesByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootFinancialSummariesArgs = {
  distinct_on?: Maybe<Array<FinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FinancialSummariesOrderBy>>;
  where?: Maybe<FinancialSummariesBoolExp>;
};

/** subscription root */
export type SubscriptionRootFinancialSummariesAggregateArgs = {
  distinct_on?: Maybe<Array<FinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FinancialSummariesOrderBy>>;
  where?: Maybe<FinancialSummariesBoolExp>;
};

/** subscription root */
export type SubscriptionRootFinancialSummariesByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootLineOfCreditsArgs = {
  distinct_on?: Maybe<Array<LineOfCreditsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LineOfCreditsOrderBy>>;
  where?: Maybe<LineOfCreditsBoolExp>;
};

/** subscription root */
export type SubscriptionRootLineOfCreditsAggregateArgs = {
  distinct_on?: Maybe<Array<LineOfCreditsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LineOfCreditsOrderBy>>;
  where?: Maybe<LineOfCreditsBoolExp>;
};

/** subscription root */
export type SubscriptionRootLineOfCreditsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootLoanStatusArgs = {
  distinct_on?: Maybe<Array<LoanStatusSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoanStatusOrderBy>>;
  where?: Maybe<LoanStatusBoolExp>;
};

/** subscription root */
export type SubscriptionRootLoanStatusAggregateArgs = {
  distinct_on?: Maybe<Array<LoanStatusSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoanStatusOrderBy>>;
  where?: Maybe<LoanStatusBoolExp>;
};

/** subscription root */
export type SubscriptionRootLoanStatusByPkArgs = {
  value: Scalars["String"];
};

/** subscription root */
export type SubscriptionRootLoanTypeArgs = {
  distinct_on?: Maybe<Array<LoanTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoanTypeOrderBy>>;
  where?: Maybe<LoanTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootLoanTypeAggregateArgs = {
  distinct_on?: Maybe<Array<LoanTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoanTypeOrderBy>>;
  where?: Maybe<LoanTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootLoanTypeByPkArgs = {
  value: Scalars["String"];
};

/** subscription root */
export type SubscriptionRootLoansArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** subscription root */
export type SubscriptionRootLoansAggregateArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** subscription root */
export type SubscriptionRootLoansByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootPaymentsArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};

/** subscription root */
export type SubscriptionRootPaymentsAggregateArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};

/** subscription root */
export type SubscriptionRootPaymentsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootProductTypeArgs = {
  distinct_on?: Maybe<Array<ProductTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ProductTypeOrderBy>>;
  where?: Maybe<ProductTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootProductTypeAggregateArgs = {
  distinct_on?: Maybe<Array<ProductTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ProductTypeOrderBy>>;
  where?: Maybe<ProductTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootProductTypeByPkArgs = {
  value: Scalars["String"];
};

/** subscription root */
export type SubscriptionRootPurchaseOrderFileTypeArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFileTypeOrderBy>>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootPurchaseOrderFileTypeAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFileTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFileTypeOrderBy>>;
  where?: Maybe<PurchaseOrderFileTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootPurchaseOrderFileTypeByPkArgs = {
  value: Scalars["String"];
};

/** subscription root */
export type SubscriptionRootPurchaseOrderFilesArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};

/** subscription root */
export type SubscriptionRootPurchaseOrderFilesAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrderFilesOrderBy>>;
  where?: Maybe<PurchaseOrderFilesBoolExp>;
};

/** subscription root */
export type SubscriptionRootPurchaseOrderFilesByPkArgs = {
  file_id: Scalars["uuid"];
  purchase_order_id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootPurchaseOrdersArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** subscription root */
export type SubscriptionRootPurchaseOrdersAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PurchaseOrdersOrderBy>>;
  where?: Maybe<PurchaseOrdersBoolExp>;
};

/** subscription root */
export type SubscriptionRootPurchaseOrdersByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootRequestStatusArgs = {
  distinct_on?: Maybe<Array<RequestStatusSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<RequestStatusOrderBy>>;
  where?: Maybe<RequestStatusBoolExp>;
};

/** subscription root */
export type SubscriptionRootRequestStatusAggregateArgs = {
  distinct_on?: Maybe<Array<RequestStatusSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<RequestStatusOrderBy>>;
  where?: Maybe<RequestStatusBoolExp>;
};

/** subscription root */
export type SubscriptionRootRequestStatusByPkArgs = {
  value: Scalars["String"];
};

/** subscription root */
export type SubscriptionRootRevokedTokensArgs = {
  distinct_on?: Maybe<Array<RevokedTokensSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<RevokedTokensOrderBy>>;
  where?: Maybe<RevokedTokensBoolExp>;
};

/** subscription root */
export type SubscriptionRootRevokedTokensAggregateArgs = {
  distinct_on?: Maybe<Array<RevokedTokensSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<RevokedTokensOrderBy>>;
  where?: Maybe<RevokedTokensBoolExp>;
};

/** subscription root */
export type SubscriptionRootRevokedTokensByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootTransactionsArgs = {
  distinct_on?: Maybe<Array<TransactionsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TransactionsOrderBy>>;
  where?: Maybe<TransactionsBoolExp>;
};

/** subscription root */
export type SubscriptionRootTransactionsAggregateArgs = {
  distinct_on?: Maybe<Array<TransactionsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TransactionsOrderBy>>;
  where?: Maybe<TransactionsBoolExp>;
};

/** subscription root */
export type SubscriptionRootTransactionsByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootTwoFactorLinksArgs = {
  distinct_on?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TwoFactorLinksOrderBy>>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};

/** subscription root */
export type SubscriptionRootTwoFactorLinksAggregateArgs = {
  distinct_on?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TwoFactorLinksOrderBy>>;
  where?: Maybe<TwoFactorLinksBoolExp>;
};

/** subscription root */
export type SubscriptionRootTwoFactorLinksByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootUserRolesArgs = {
  distinct_on?: Maybe<Array<UserRolesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UserRolesOrderBy>>;
  where?: Maybe<UserRolesBoolExp>;
};

/** subscription root */
export type SubscriptionRootUserRolesAggregateArgs = {
  distinct_on?: Maybe<Array<UserRolesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UserRolesOrderBy>>;
  where?: Maybe<UserRolesBoolExp>;
};

/** subscription root */
export type SubscriptionRootUserRolesByPkArgs = {
  value: Scalars["String"];
};

/** subscription root */
export type SubscriptionRootUsersArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};

/** subscription root */
export type SubscriptionRootUsersAggregateArgs = {
  distinct_on?: Maybe<Array<UsersSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<UsersOrderBy>>;
  where?: Maybe<UsersBoolExp>;
};

/** subscription root */
export type SubscriptionRootUsersByPkArgs = {
  id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootVendorsArgs = {
  distinct_on?: Maybe<Array<VendorsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<VendorsOrderBy>>;
  where?: Maybe<VendorsBoolExp>;
};

/** subscription root */
export type SubscriptionRootVendorsAggregateArgs = {
  distinct_on?: Maybe<Array<VendorsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<VendorsOrderBy>>;
  where?: Maybe<VendorsBoolExp>;
};

/** expression to compare columns of type timestamp. All fields are combined with logical 'AND'. */
export type TimestampComparisonExp = {
  _eq?: Maybe<Scalars["timestamp"]>;
  _gt?: Maybe<Scalars["timestamp"]>;
  _gte?: Maybe<Scalars["timestamp"]>;
  _in?: Maybe<Array<Scalars["timestamp"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["timestamp"]>;
  _lte?: Maybe<Scalars["timestamp"]>;
  _neq?: Maybe<Scalars["timestamp"]>;
  _nin?: Maybe<Array<Scalars["timestamp"]>>;
};

/** expression to compare columns of type timestamptz. All fields are combined with logical 'AND'. */
export type TimestamptzComparisonExp = {
  _eq?: Maybe<Scalars["timestamptz"]>;
  _gt?: Maybe<Scalars["timestamptz"]>;
  _gte?: Maybe<Scalars["timestamptz"]>;
  _in?: Maybe<Array<Scalars["timestamptz"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["timestamptz"]>;
  _lte?: Maybe<Scalars["timestamptz"]>;
  _neq?: Maybe<Scalars["timestamptz"]>;
  _nin?: Maybe<Array<Scalars["timestamptz"]>>;
};

/**
 * Transactions correspond to debits and credits that take place on a loan
 *
 *
 * columns and relationships of "transactions"
 */
export type Transactions = {
  amount: Scalars["numeric"];
  created_at: Scalars["timestamptz"];
  created_by_user_id: Scalars["uuid"];
  /** For financial purposes, this is the date this transaction is considered in effect. */
  effective_date: Scalars["date"];
  id: Scalars["uuid"];
  loan_id: Scalars["uuid"];
  modified_at: Scalars["timestamptz"];
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  payment: Payments;
  payment_id: Scalars["uuid"];
  to_fees: Scalars["numeric"];
  to_interest: Scalars["numeric"];
  to_principal: Scalars["numeric"];
  type: Scalars["String"];
};

/** aggregated selection of "transactions" */
export type TransactionsAggregate = {
  aggregate?: Maybe<TransactionsAggregateFields>;
  nodes: Array<Transactions>;
};

/** aggregate fields of "transactions" */
export type TransactionsAggregateFields = {
  avg?: Maybe<TransactionsAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<TransactionsMaxFields>;
  min?: Maybe<TransactionsMinFields>;
  stddev?: Maybe<TransactionsStddevFields>;
  stddev_pop?: Maybe<TransactionsStddevPopFields>;
  stddev_samp?: Maybe<TransactionsStddevSampFields>;
  sum?: Maybe<TransactionsSumFields>;
  var_pop?: Maybe<TransactionsVarPopFields>;
  var_samp?: Maybe<TransactionsVarSampFields>;
  variance?: Maybe<TransactionsVarianceFields>;
};

/** aggregate fields of "transactions" */
export type TransactionsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<TransactionsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "transactions" */
export type TransactionsAggregateOrderBy = {
  avg?: Maybe<TransactionsAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<TransactionsMaxOrderBy>;
  min?: Maybe<TransactionsMinOrderBy>;
  stddev?: Maybe<TransactionsStddevOrderBy>;
  stddev_pop?: Maybe<TransactionsStddevPopOrderBy>;
  stddev_samp?: Maybe<TransactionsStddevSampOrderBy>;
  sum?: Maybe<TransactionsSumOrderBy>;
  var_pop?: Maybe<TransactionsVarPopOrderBy>;
  var_samp?: Maybe<TransactionsVarSampOrderBy>;
  variance?: Maybe<TransactionsVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "transactions" */
export type TransactionsArrRelInsertInput = {
  data: Array<TransactionsInsertInput>;
  on_conflict?: Maybe<TransactionsOnConflict>;
};

/** aggregate avg on columns */
export type TransactionsAvgFields = {
  amount?: Maybe<Scalars["Float"]>;
  to_fees?: Maybe<Scalars["Float"]>;
  to_interest?: Maybe<Scalars["Float"]>;
  to_principal?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "transactions" */
export type TransactionsAvgOrderBy = {
  amount?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "transactions". All fields are combined with a logical 'AND'. */
export type TransactionsBoolExp = {
  _and?: Maybe<Array<Maybe<TransactionsBoolExp>>>;
  _not?: Maybe<TransactionsBoolExp>;
  _or?: Maybe<Array<Maybe<TransactionsBoolExp>>>;
  amount?: Maybe<NumericComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  created_by_user_id?: Maybe<UuidComparisonExp>;
  effective_date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  loan_id?: Maybe<UuidComparisonExp>;
  modified_at?: Maybe<TimestamptzComparisonExp>;
  modified_by_user_id?: Maybe<UuidComparisonExp>;
  payment?: Maybe<PaymentsBoolExp>;
  payment_id?: Maybe<UuidComparisonExp>;
  to_fees?: Maybe<NumericComparisonExp>;
  to_interest?: Maybe<NumericComparisonExp>;
  to_principal?: Maybe<NumericComparisonExp>;
  type?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "transactions" */
export enum TransactionsConstraint {
  /** unique or primary key constraint */
  TransactionsPkey = "transactions_pkey",
}

/** input type for incrementing integer column in table "transactions" */
export type TransactionsIncInput = {
  amount?: Maybe<Scalars["numeric"]>;
  to_fees?: Maybe<Scalars["numeric"]>;
  to_interest?: Maybe<Scalars["numeric"]>;
  to_principal?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "transactions" */
export type TransactionsInsertInput = {
  amount?: Maybe<Scalars["numeric"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  effective_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  loan_id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  payment?: Maybe<PaymentsObjRelInsertInput>;
  payment_id?: Maybe<Scalars["uuid"]>;
  to_fees?: Maybe<Scalars["numeric"]>;
  to_interest?: Maybe<Scalars["numeric"]>;
  to_principal?: Maybe<Scalars["numeric"]>;
  type?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type TransactionsMaxFields = {
  amount?: Maybe<Scalars["numeric"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  effective_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  loan_id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  to_fees?: Maybe<Scalars["numeric"]>;
  to_interest?: Maybe<Scalars["numeric"]>;
  to_principal?: Maybe<Scalars["numeric"]>;
  type?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "transactions" */
export type TransactionsMaxOrderBy = {
  amount?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  created_by_user_id?: Maybe<OrderBy>;
  effective_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  loan_id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  payment_id?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
  type?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type TransactionsMinFields = {
  amount?: Maybe<Scalars["numeric"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  effective_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  loan_id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  to_fees?: Maybe<Scalars["numeric"]>;
  to_interest?: Maybe<Scalars["numeric"]>;
  to_principal?: Maybe<Scalars["numeric"]>;
  type?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "transactions" */
export type TransactionsMinOrderBy = {
  amount?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  created_by_user_id?: Maybe<OrderBy>;
  effective_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  loan_id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  payment_id?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
  type?: Maybe<OrderBy>;
};

/** response of any mutation on the table "transactions" */
export type TransactionsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<Transactions>;
};

/** input type for inserting object relation for remote table "transactions" */
export type TransactionsObjRelInsertInput = {
  data: TransactionsInsertInput;
  on_conflict?: Maybe<TransactionsOnConflict>;
};

/** on conflict condition type for table "transactions" */
export type TransactionsOnConflict = {
  constraint: TransactionsConstraint;
  update_columns: Array<TransactionsUpdateColumn>;
  where?: Maybe<TransactionsBoolExp>;
};

/** ordering options when selecting data from "transactions" */
export type TransactionsOrderBy = {
  amount?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  created_by_user_id?: Maybe<OrderBy>;
  effective_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  loan_id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  payment?: Maybe<PaymentsOrderBy>;
  payment_id?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
  type?: Maybe<OrderBy>;
};

/** primary key columns input for table: "transactions" */
export type TransactionsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "transactions" */
export enum TransactionsSelectColumn {
  /** column name */
  Amount = "amount",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  CreatedByUserId = "created_by_user_id",
  /** column name */
  EffectiveDate = "effective_date",
  /** column name */
  Id = "id",
  /** column name */
  LoanId = "loan_id",
  /** column name */
  ModifiedAt = "modified_at",
  /** column name */
  ModifiedByUserId = "modified_by_user_id",
  /** column name */
  PaymentId = "payment_id",
  /** column name */
  ToFees = "to_fees",
  /** column name */
  ToInterest = "to_interest",
  /** column name */
  ToPrincipal = "to_principal",
  /** column name */
  Type = "type",
}

/** input type for updating data in table "transactions" */
export type TransactionsSetInput = {
  amount?: Maybe<Scalars["numeric"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  effective_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  loan_id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  to_fees?: Maybe<Scalars["numeric"]>;
  to_interest?: Maybe<Scalars["numeric"]>;
  to_principal?: Maybe<Scalars["numeric"]>;
  type?: Maybe<Scalars["String"]>;
};

/** aggregate stddev on columns */
export type TransactionsStddevFields = {
  amount?: Maybe<Scalars["Float"]>;
  to_fees?: Maybe<Scalars["Float"]>;
  to_interest?: Maybe<Scalars["Float"]>;
  to_principal?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "transactions" */
export type TransactionsStddevOrderBy = {
  amount?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type TransactionsStddevPopFields = {
  amount?: Maybe<Scalars["Float"]>;
  to_fees?: Maybe<Scalars["Float"]>;
  to_interest?: Maybe<Scalars["Float"]>;
  to_principal?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "transactions" */
export type TransactionsStddevPopOrderBy = {
  amount?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type TransactionsStddevSampFields = {
  amount?: Maybe<Scalars["Float"]>;
  to_fees?: Maybe<Scalars["Float"]>;
  to_interest?: Maybe<Scalars["Float"]>;
  to_principal?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "transactions" */
export type TransactionsStddevSampOrderBy = {
  amount?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type TransactionsSumFields = {
  amount?: Maybe<Scalars["numeric"]>;
  to_fees?: Maybe<Scalars["numeric"]>;
  to_interest?: Maybe<Scalars["numeric"]>;
  to_principal?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "transactions" */
export type TransactionsSumOrderBy = {
  amount?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
};

/** update columns of table "transactions" */
export enum TransactionsUpdateColumn {
  /** column name */
  Amount = "amount",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  CreatedByUserId = "created_by_user_id",
  /** column name */
  EffectiveDate = "effective_date",
  /** column name */
  Id = "id",
  /** column name */
  LoanId = "loan_id",
  /** column name */
  ModifiedAt = "modified_at",
  /** column name */
  ModifiedByUserId = "modified_by_user_id",
  /** column name */
  PaymentId = "payment_id",
  /** column name */
  ToFees = "to_fees",
  /** column name */
  ToInterest = "to_interest",
  /** column name */
  ToPrincipal = "to_principal",
  /** column name */
  Type = "type",
}

/** aggregate var_pop on columns */
export type TransactionsVarPopFields = {
  amount?: Maybe<Scalars["Float"]>;
  to_fees?: Maybe<Scalars["Float"]>;
  to_interest?: Maybe<Scalars["Float"]>;
  to_principal?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "transactions" */
export type TransactionsVarPopOrderBy = {
  amount?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type TransactionsVarSampFields = {
  amount?: Maybe<Scalars["Float"]>;
  to_fees?: Maybe<Scalars["Float"]>;
  to_interest?: Maybe<Scalars["Float"]>;
  to_principal?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "transactions" */
export type TransactionsVarSampOrderBy = {
  amount?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type TransactionsVarianceFields = {
  amount?: Maybe<Scalars["Float"]>;
  to_fees?: Maybe<Scalars["Float"]>;
  to_interest?: Maybe<Scalars["Float"]>;
  to_principal?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "transactions" */
export type TransactionsVarianceOrderBy = {
  amount?: Maybe<OrderBy>;
  to_fees?: Maybe<OrderBy>;
  to_interest?: Maybe<OrderBy>;
  to_principal?: Maybe<OrderBy>;
};

/**
 * Links that are secured behind two factor auth
 *
 *
 * columns and relationships of "two_factor_links"
 */
export type TwoFactorLinks = {
  expires_at: Scalars["timestamptz"];
  form_info: Scalars["json"];
  id: Scalars["uuid"];
  /** One link_id may have been sent to many emails. So we want to keep track of each email and what two-factor code they may need to enter separately as a key in this dictionary. */
  token_states?: Maybe<Scalars["json"]>;
};

/**
 * Links that are secured behind two factor auth
 *
 *
 * columns and relationships of "two_factor_links"
 */
export type TwoFactorLinksFormInfoArgs = {
  path?: Maybe<Scalars["String"]>;
};

/**
 * Links that are secured behind two factor auth
 *
 *
 * columns and relationships of "two_factor_links"
 */
export type TwoFactorLinksTokenStatesArgs = {
  path?: Maybe<Scalars["String"]>;
};

/** aggregated selection of "two_factor_links" */
export type TwoFactorLinksAggregate = {
  aggregate?: Maybe<TwoFactorLinksAggregateFields>;
  nodes: Array<TwoFactorLinks>;
};

/** aggregate fields of "two_factor_links" */
export type TwoFactorLinksAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<TwoFactorLinksMaxFields>;
  min?: Maybe<TwoFactorLinksMinFields>;
};

/** aggregate fields of "two_factor_links" */
export type TwoFactorLinksAggregateFieldsCountArgs = {
  columns?: Maybe<Array<TwoFactorLinksSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  TwoFactorLinksPkey = "two_factor_links_pkey",
}

/** input type for inserting data into table "two_factor_links" */
export type TwoFactorLinksInsertInput = {
  expires_at?: Maybe<Scalars["timestamptz"]>;
  form_info?: Maybe<Scalars["json"]>;
  id?: Maybe<Scalars["uuid"]>;
  token_states?: Maybe<Scalars["json"]>;
};

/** aggregate max on columns */
export type TwoFactorLinksMaxFields = {
  expires_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
};

/** order by max() on columns of table "two_factor_links" */
export type TwoFactorLinksMaxOrderBy = {
  expires_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type TwoFactorLinksMinFields = {
  expires_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
};

/** order by min() on columns of table "two_factor_links" */
export type TwoFactorLinksMinOrderBy = {
  expires_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "two_factor_links" */
export type TwoFactorLinksMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  id: Scalars["uuid"];
};

/** select columns of table "two_factor_links" */
export enum TwoFactorLinksSelectColumn {
  /** column name */
  ExpiresAt = "expires_at",
  /** column name */
  FormInfo = "form_info",
  /** column name */
  Id = "id",
  /** column name */
  TokenStates = "token_states",
}

/** input type for updating data in table "two_factor_links" */
export type TwoFactorLinksSetInput = {
  expires_at?: Maybe<Scalars["timestamptz"]>;
  form_info?: Maybe<Scalars["json"]>;
  id?: Maybe<Scalars["uuid"]>;
  token_states?: Maybe<Scalars["json"]>;
};

/** update columns of table "two_factor_links" */
export enum TwoFactorLinksUpdateColumn {
  /** column name */
  ExpiresAt = "expires_at",
  /** column name */
  FormInfo = "form_info",
  /** column name */
  Id = "id",
  /** column name */
  TokenStates = "token_states",
}

/** columns and relationships of "user_roles" */
export type UserRoles = {
  display_name: Scalars["String"];
  value: Scalars["String"];
};

/** aggregated selection of "user_roles" */
export type UserRolesAggregate = {
  aggregate?: Maybe<UserRolesAggregateFields>;
  nodes: Array<UserRoles>;
};

/** aggregate fields of "user_roles" */
export type UserRolesAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<UserRolesMaxFields>;
  min?: Maybe<UserRolesMinFields>;
};

/** aggregate fields of "user_roles" */
export type UserRolesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<UserRolesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  UserRolesPkey = "user_roles_pkey",
}

export enum UserRolesEnum {
  /** Bank Admin */
  BankAdmin = "bank_admin",
  /** Company Admin */
  CompanyAdmin = "company_admin",
}

/** expression to compare columns of type user_roles_enum. All fields are combined with logical 'AND'. */
export type UserRolesEnumComparisonExp = {
  _eq?: Maybe<UserRolesEnum>;
  _in?: Maybe<Array<UserRolesEnum>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<UserRolesEnum>;
  _nin?: Maybe<Array<UserRolesEnum>>;
};

/** input type for inserting data into table "user_roles" */
export type UserRolesInsertInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type UserRolesMaxFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "user_roles" */
export type UserRolesMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type UserRolesMinFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "user_roles" */
export type UserRolesMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "user_roles" */
export type UserRolesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
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
  value: Scalars["String"];
};

/** select columns of table "user_roles" */
export enum UserRolesSelectColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** input type for updating data in table "user_roles" */
export type UserRolesSetInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** update columns of table "user_roles" */
export enum UserRolesUpdateColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** columns and relationships of "users" */
export type Users = {
  /** An object relationship */
  company?: Maybe<Companies>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  email: Scalars["String"];
  first_name: Scalars["String"];
  full_name: Scalars["String"];
  id: Scalars["uuid"];
  last_name: Scalars["String"];
  password?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
  role?: Maybe<UserRolesEnum>;
};

/** aggregated selection of "users" */
export type UsersAggregate = {
  aggregate?: Maybe<UsersAggregateFields>;
  nodes: Array<Users>;
};

/** aggregate fields of "users" */
export type UsersAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<UsersMaxFields>;
  min?: Maybe<UsersMinFields>;
};

/** aggregate fields of "users" */
export type UsersAggregateFieldsCountArgs = {
  columns?: Maybe<Array<UsersSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  UsersEmailKey = "users_email_key",
  /** unique or primary key constraint */
  UsersPkey = "users_pkey",
}

/** input type for inserting data into table "users" */
export type UsersInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  email?: Maybe<Scalars["String"]>;
  first_name?: Maybe<Scalars["String"]>;
  full_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  last_name?: Maybe<Scalars["String"]>;
  password?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
  role?: Maybe<UserRolesEnum>;
};

/** aggregate max on columns */
export type UsersMaxFields = {
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  email?: Maybe<Scalars["String"]>;
  first_name?: Maybe<Scalars["String"]>;
  full_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  last_name?: Maybe<Scalars["String"]>;
  password?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
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
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  email?: Maybe<Scalars["String"]>;
  first_name?: Maybe<Scalars["String"]>;
  full_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  last_name?: Maybe<Scalars["String"]>;
  password?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
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
  affected_rows: Scalars["Int"];
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
  id: Scalars["uuid"];
};

/** select columns of table "users" */
export enum UsersSelectColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Email = "email",
  /** column name */
  FirstName = "first_name",
  /** column name */
  FullName = "full_name",
  /** column name */
  Id = "id",
  /** column name */
  LastName = "last_name",
  /** column name */
  Password = "password",
  /** column name */
  PhoneNumber = "phone_number",
  /** column name */
  Role = "role",
}

/** input type for updating data in table "users" */
export type UsersSetInput = {
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  email?: Maybe<Scalars["String"]>;
  first_name?: Maybe<Scalars["String"]>;
  full_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  last_name?: Maybe<Scalars["String"]>;
  password?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
  role?: Maybe<UserRolesEnum>;
};

/** update columns of table "users" */
export enum UsersUpdateColumn {
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Email = "email",
  /** column name */
  FirstName = "first_name",
  /** column name */
  FullName = "full_name",
  /** column name */
  Id = "id",
  /** column name */
  LastName = "last_name",
  /** column name */
  Password = "password",
  /** column name */
  PhoneNumber = "phone_number",
  /** column name */
  Role = "role",
}

/** expression to compare columns of type uuid. All fields are combined with logical 'AND'. */
export type UuidComparisonExp = {
  _eq?: Maybe<Scalars["uuid"]>;
  _gt?: Maybe<Scalars["uuid"]>;
  _gte?: Maybe<Scalars["uuid"]>;
  _in?: Maybe<Array<Scalars["uuid"]>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _lt?: Maybe<Scalars["uuid"]>;
  _lte?: Maybe<Scalars["uuid"]>;
  _neq?: Maybe<Scalars["uuid"]>;
  _nin?: Maybe<Array<Scalars["uuid"]>>;
};

/** columns and relationships of "vendors" */
export type Vendors = {
  address?: Maybe<Scalars["String"]>;
  /** An array relationship */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  dba_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
};

/** columns and relationships of "vendors" */
export type VendorsCompanyVendorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyVendorPartnershipsOrderBy>>;
  where?: Maybe<CompanyVendorPartnershipsBoolExp>;
};

/** columns and relationships of "vendors" */
export type VendorsCompanyVendorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyVendorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
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
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<VendorsMaxFields>;
  min?: Maybe<VendorsMinFields>;
};

/** aggregate fields of "vendors" */
export type VendorsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<VendorsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
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
  address?: Maybe<Scalars["String"]>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  dba_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type VendorsMaxFields = {
  address?: Maybe<Scalars["String"]>;
  dba_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
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
  address?: Maybe<Scalars["String"]>;
  dba_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
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
  affected_rows: Scalars["Int"];
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
  Address = "address",
  /** column name */
  DbaName = "dba_name",
  /** column name */
  Id = "id",
  /** column name */
  Name = "name",
  /** column name */
  PhoneNumber = "phone_number",
}

/** input type for updating data in table "vendors" */
export type VendorsSetInput = {
  address?: Maybe<Scalars["String"]>;
  dba_name?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  name?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
};

export type GetAdvancesQueryVariables = Exact<{ [key: string]: never }>;

export type GetAdvancesQuery = {
  payments: Array<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name">;
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
    } & PaymentFragment
  >;
};

export type AddCustomerMutationVariables = Exact<{
  customer: CompaniesInsertInput;
}>;

export type AddCustomerMutation = {
  insert_companies_one?: Maybe<
    Pick<Companies, "id" | "name"> & {
      settings: Pick<CompanySettings, "id">;
      contract?: Maybe<Pick<Contracts, "id" | "product_type">>;
    }
  >;
};

export type GetCustomerForBankQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetCustomerForBankQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      contract?: Maybe<Pick<Contracts, "id" | "product_type">>;
    } & CustomerForBankFragment
  >;
};

export type BankCustomerListVendorPartnershipsQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type BankCustomerListVendorPartnershipsQuery = {
  company_vendor_partnerships: Array<
    {
      vendor: { users: Array<ContactFragment> } & VendorFragment;
      vendor_bank_account?: Maybe<Pick<BankAccounts, "id" | "verified_at">>;
    } & BankVendorPartnershipFragment
  >;
};

export type AddLineOfCreditMutationVariables = Exact<{
  lineOfCredit: LineOfCreditsInsertInput;
}>;

export type AddLineOfCreditMutation = {
  insert_line_of_credits_one?: Maybe<
    Pick<LineOfCredits, "id"> & LineOfCreditFragment
  >;
};

export type UpdateLineOfCreditAndLoanMutationVariables = Exact<{
  lineOfCreditId: Scalars["uuid"];
  lineOfCredit: LineOfCreditsSetInput;
  loanId: Scalars["uuid"];
  loan: LoansSetInput;
}>;

export type UpdateLineOfCreditAndLoanMutation = {
  update_line_of_credits_by_pk?: Maybe<
    Pick<LineOfCredits, "id"> & LineOfCreditFragment
  >;
  update_loans_by_pk?: Maybe<Pick<Loans, "id"> & LoanLimitedFragment>;
};

export type LoanSiblingsQueryVariables = Exact<{
  loanId: Scalars["uuid"];
  loanType: LoanTypeEnum;
  artifactId: Scalars["uuid"];
}>;

export type LoanSiblingsQuery = {
  loans: Array<
    Pick<Loans, "id" | "loan_type" | "artifact_id" | "amount" | "status">
  >;
};

export type LoansByCompanyAndLoanTypeForCustomerQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  loanType: LoanTypeEnum;
}>;

export type LoansByCompanyAndLoanTypeForCustomerQuery = {
  loans: Array<
    {
      line_of_credit?: Maybe<Pick<LineOfCredits, "id"> & LineOfCreditFragment>;
      purchase_order?: Maybe<Pick<PurchaseOrders, "id" | "order_number">>;
    } & LoanLimitedFragment
  >;
};

export type GetOutstandingLoansForCustomerQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  loanType: LoanTypeEnum;
}>;

export type GetOutstandingLoansForCustomerQuery = {
  loans: Array<
    {
      line_of_credit?: Maybe<Pick<LineOfCredits, "id"> & LineOfCreditFragment>;
      purchase_order?: Maybe<Pick<PurchaseOrders, "id" | "order_number">>;
    } & LoanLimitedFragment
  >;
};

export type LoansByCompanyAndLoanTypeForBankQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  loanType: LoanTypeEnum;
}>;

export type LoansByCompanyAndLoanTypeForBankQuery = {
  loans: Array<
    Pick<Loans, "id"> & {
      line_of_credit?: Maybe<Pick<LineOfCredits, "id"> & LineOfCreditFragment>;
      purchase_order?: Maybe<Pick<PurchaseOrders, "id" | "order_number">>;
    } & LoanFragment
  >;
};

export type LoansForBankQueryVariables = Exact<{ [key: string]: never }>;

export type LoansForBankQuery = {
  loans: Array<
    Pick<Loans, "id"> & {
      company: Pick<Companies, "id" | "name">;
      line_of_credit?: Maybe<Pick<LineOfCredits, "id"> & LineOfCreditFragment>;
      purchase_order?: Maybe<
        Pick<PurchaseOrders, "id" | "order_number"> & {
          vendor?: Maybe<Pick<Vendors, "id" | "name">>;
        }
      >;
    } & LoanFragment
  >;
};

export type LoansByStatusesForBankQueryVariables = Exact<{
  statuses?: Maybe<Array<LoanStatusEnum>>;
}>;

export type LoansByStatusesForBankQuery = {
  loans: Array<
    Pick<Loans, "id"> & {
      company: Pick<Companies, "id" | "name">;
      line_of_credit?: Maybe<Pick<LineOfCredits, "id"> & LineOfCreditFragment>;
      purchase_order?: Maybe<
        Pick<PurchaseOrders, "id" | "order_number"> & {
          vendor?: Maybe<Pick<Vendors, "id" | "name">>;
        }
      >;
    } & LoanFragment
  >;
};

export type GetLoansByLoanIdsQueryVariables = Exact<{
  loanIds?: Maybe<Array<Scalars["uuid"]>>;
}>;

export type GetLoansByLoanIdsQuery = {
  loans: Array<Pick<Loans, "id"> & LoanFragment>;
};

export type GetPaymentQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetPaymentQuery = {
  payments_by_pk?: Maybe<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name">;
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
    } & PaymentFragment
  >;
};

export type GetPaymentForSettlementQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetPaymentForSettlementQuery = {
  payments_by_pk?: Maybe<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name"> & {
        contract?: Maybe<Pick<Contracts, "id" | "product_type">>;
      };
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
    } & PaymentFragment
  >;
};

export type GetPaymentsQueryVariables = Exact<{ [key: string]: never }>;

export type GetPaymentsQuery = {
  payments: Array<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name">;
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
    } & PaymentFragment
  >;
};

export type GetSubmittedPaymentsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetSubmittedPaymentsQuery = {
  payments: Array<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name">;
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
    } & PaymentFragment
  >;
};

export type BankAccountsForTransferQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type BankAccountsForTransferQuery = {
  bank_accounts: Array<BankAccountFragment>;
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      settings: {
        collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
      };
    }
  >;
};

export type ListBankAccountsQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type ListBankAccountsQuery = {
  bank_accounts: Array<BankAccountFragment>;
};

export type AssignCollectionsBespokeBankAccountMutationVariables = Exact<{
  companySettingsId: Scalars["uuid"];
  bankAccountId?: Maybe<Scalars["uuid"]>;
}>;

export type AssignCollectionsBespokeBankAccountMutation = {
  update_company_settings_by_pk?: Maybe<
    Pick<CompanySettings, "id"> & {
      collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
    }
  >;
};

export type AssignAdvancesBespokeBankAccountMutationVariables = Exact<{
  companySettingsId: Scalars["uuid"];
  bankAccountId?: Maybe<Scalars["uuid"]>;
}>;

export type AssignAdvancesBespokeBankAccountMutation = {
  update_company_settings_by_pk?: Maybe<
    Pick<CompanySettings, "id"> & {
      advances_bespoke_bank_account?: Maybe<BankAccountFragment>;
    }
  >;
};

export type GetCompanyForCustomerOverviewQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetCompanyForCustomerOverviewQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      contract?: Maybe<
        Pick<Contracts, "id" | "product_type" | "product_config">
      >;
      financial_summary?: Maybe<
        Pick<
          FinancialSummaries,
          | "id"
          | "total_limit"
          | "total_outstanding_principal"
          | "total_outstanding_interest"
          | "total_outstanding_fees"
          | "total_principal_in_requested_state"
          | "available_limit"
        >
      >;
    }
  >;
};

export type GetLatestBankFinancialSummariesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetLatestBankFinancialSummariesQuery = {
  bank_financial_summaries: Array<
    Pick<
      BankFinancialSummaries,
      | "id"
      | "date"
      | "product_type"
      | "total_limit"
      | "total_outstanding_principal"
      | "total_outstanding_interest"
      | "total_outstanding_fees"
      | "total_principal_in_requested_state"
      | "available_limit"
    >
  >;
};

export type CompanyWithDetailsByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type CompanyWithDetailsByCompanyIdQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      contract?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
    }
  >;
};

export type GetCompanyNextLoanIdentifierMutationVariables = Exact<{
  companyId: Scalars["uuid"];
  increment: CompaniesIncInput;
}>;

export type GetCompanyNextLoanIdentifierMutation = {
  update_companies_by_pk?: Maybe<
    Pick<Companies, "id" | "latest_loan_identifier">
  >;
};

export type CompanyQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type CompanyQuery = {
  companies_by_pk?: Maybe<
    {
      bank_accounts: Array<BankAccountFragment>;
      settings: {
        collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
        advances_bespoke_bank_account?: Maybe<BankAccountFragment>;
      } & CompanySettingsFragment;
      contract?: Maybe<ContractFragment>;
    } & CompanyFragment
  >;
};

export type CompanyForCustomerQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type CompanyForCustomerQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      bank_accounts: Array<BankAccountFragment>;
      settings: {
        collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
      } & CompanySettingsForCustomerFragment;
      contract?: Maybe<ContractFragment>;
    } & CompanyFragment
  >;
};

export type UpdateCompanyProfileMutationVariables = Exact<{
  id: Scalars["uuid"];
  company: CompaniesSetInput;
}>;

export type UpdateCompanyProfileMutation = {
  update_companies_by_pk?: Maybe<CompanyFragment>;
};

export type AddCompanyBankAccountMutationVariables = Exact<{
  bankAccount: BankAccountsInsertInput;
}>;

export type AddCompanyBankAccountMutation = {
  insert_bank_accounts_one?: Maybe<BankAccountFragment>;
};

export type UpdateCompanyBankAccountMutationVariables = Exact<{
  id: Scalars["uuid"];
  bankAccount: BankAccountsSetInput;
}>;

export type UpdateCompanyBankAccountMutation = {
  update_bank_accounts_by_pk?: Maybe<BankAccountFragment>;
};

export type EbbaApplicationQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type EbbaApplicationQuery = {
  ebba_applications_by_pk?: Maybe<
    Pick<EbbaApplications, "id"> & {
      company: Pick<Companies, "id" | "name">;
      ebba_application_files: Array<EbbaApplicationFileFragment>;
    } & EbbaApplicationFragment
  >;
};

export type AddEbbaApplicationMutationVariables = Exact<{
  ebbaApplication: EbbaApplicationsInsertInput;
}>;

export type AddEbbaApplicationMutation = {
  insert_ebba_applications_one?: Maybe<
    Pick<EbbaApplications, "id"> & EbbaApplicationFragment
  >;
};

export type EbbaApplicationsQueryVariables = Exact<{ [key: string]: never }>;

export type EbbaApplicationsQuery = {
  ebba_applications: Array<
    Pick<EbbaApplications, "id"> & {
      company: Pick<Companies, "id" | "name">;
    } & EbbaApplicationFragment
  >;
};

export type EbbaApplicationsByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type EbbaApplicationsByCompanyIdQuery = {
  ebba_applications: Array<
    Pick<EbbaApplications, "id"> & EbbaApplicationFragment
  >;
};

export type GetLoanQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetLoanQuery = { loans_by_pk?: Maybe<LoanFragment> };

export type GetLoanForCustomerQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetLoanForCustomerQuery = {
  loans_by_pk?: Maybe<LoanLimitedFragment>;
};

export type GetLoanWithArtifactForCustomerQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetLoanWithArtifactForCustomerQuery = {
  loans_by_pk?: Maybe<
    {
      company: Pick<Companies, "id" | "name">;
      line_of_credit?: Maybe<Pick<LineOfCredits, "id"> & LineOfCreditFragment>;
      purchase_order?: Maybe<
        Pick<PurchaseOrders, "id"> & PurchaseOrderFragment
      >;
    } & LoanLimitedFragment
  >;
};

export type AddLoanMutationVariables = Exact<{
  loan: LoansInsertInput;
}>;

export type AddLoanMutation = { insert_loans_one?: Maybe<LoanLimitedFragment> };

export type UpdateLoanMutationVariables = Exact<{
  id: Scalars["uuid"];
  loan: LoansSetInput;
}>;

export type UpdateLoanMutation = {
  update_loans_by_pk?: Maybe<LoanLimitedFragment>;
};

export type PurchaseOrderQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type PurchaseOrderQuery = {
  purchase_orders_by_pk?: Maybe<
    {
      loans: Array<Pick<Loans, "id"> & LoanLimitedFragment>;
      purchase_order_files: Array<PurchaseOrderFileFragment>;
    } & PurchaseOrderFragment
  >;
};

export type PurchaseOrderForReviewQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type PurchaseOrderForReviewQuery = {
  purchase_orders_by_pk?: Maybe<
    Pick<
      PurchaseOrders,
      | "id"
      | "company_id"
      | "vendor_id"
      | "order_number"
      | "order_date"
      | "delivery_date"
      | "amount"
      | "is_cannabis"
      | "status"
      | "created_at"
    > & {
      purchase_order_files: Array<
        Pick<PurchaseOrderFiles, "purchase_order_id" | "file_id"> &
          PurchaseOrderFileFragment
      >;
      company: Pick<Companies, "id" | "name">;
      vendor?: Maybe<Pick<Vendors, "id" | "name">>;
    }
  >;
};

export type AddPurchaseOrderMutationVariables = Exact<{
  purchase_order: PurchaseOrdersInsertInput;
}>;

export type AddPurchaseOrderMutation = {
  insert_purchase_orders_one?: Maybe<
    {
      purchase_order_files: Array<PurchaseOrderFileFragment>;
    } & PurchaseOrderFragment
  >;
};

export type UpdatePurchaseOrderMutationVariables = Exact<{
  id: Scalars["uuid"];
  purchaseOrder: PurchaseOrdersSetInput;
  purchaseOrderFiles: Array<PurchaseOrderFilesInsertInput>;
}>;

export type UpdatePurchaseOrderMutation = {
  delete_purchase_order_files?: Maybe<
    Pick<PurchaseOrderFilesMutationResponse, "affected_rows">
  >;
  insert_purchase_order_files?: Maybe<{
    returning: Array<Pick<PurchaseOrderFiles, "purchase_order_id" | "file_id">>;
  }>;
  update_purchase_orders_by_pk?: Maybe<
    {
      purchase_order_files: Array<PurchaseOrderFileFragment>;
    } & PurchaseOrderFragment
  >;
};

export type VendorsByPartnerCompanyQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type VendorsByPartnerCompanyQuery = {
  vendors: Array<
    Pick<Vendors, "id"> & {
      company_vendor_partnerships: Array<
        Pick<CompanyVendorPartnerships, "id" | "approved_at">
      >;
    } & VendorLimitedFragment
  >;
};

export type ApprovedVendorsByPartnerCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type ApprovedVendorsByPartnerCompanyIdQuery = {
  vendors: Array<
    Pick<Vendors, "id"> & {
      company_vendor_partnerships: Array<
        Pick<CompanyVendorPartnerships, "id" | "approved_at">
      >;
    } & VendorLimitedFragment
  >;
};

export type CompanyVendorPartnershipForVendorQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  vendorId: Scalars["uuid"];
}>;

export type CompanyVendorPartnershipForVendorQuery = {
  company_vendor_partnerships: Array<
    Pick<CompanyVendorPartnerships, "id"> & {
      vendor_bank_account?: Maybe<BankAccountForVendorFragment>;
    }
  >;
};

export type GetPurchaseOrdersQueryVariables = Exact<{ [key: string]: never }>;

export type GetPurchaseOrdersQuery = {
  purchase_orders: Array<Pick<PurchaseOrders, "id"> & PurchaseOrderFragment>;
};

export type PurchaseOrdersByCompanyIdQueryVariables = Exact<{
  company_id: Scalars["uuid"];
}>;

export type PurchaseOrdersByCompanyIdQuery = {
  purchase_orders: Array<
    { company: Pick<Companies, "id" | "name"> } & PurchaseOrderFragment
  >;
};

export type ApprovedPurchaseOrdersQueryVariables = Exact<{
  [key: string]: never;
}>;

export type ApprovedPurchaseOrdersQuery = {
  purchase_orders: Array<PurchaseOrderFragment>;
};

export type ContractQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type ContractQuery = {
  contracts_by_pk?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
};

export type AddContractMutationVariables = Exact<{
  contract: ContractsInsertInput;
}>;

export type AddContractMutation = {
  insert_contracts_one?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
};

export type UpdateContractMutationVariables = Exact<{
  contractId: Scalars["uuid"];
  contract: ContractsSetInput;
}>;

export type UpdateContractMutation = {
  update_contracts_by_pk?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
};

export type UpdateCompanySettingsMutationVariables = Exact<{
  companyId: Scalars["uuid"];
  companySettingsId: Scalars["uuid"];
  vendorAgreementTemplateLink?: Maybe<Scalars["String"]>;
  contractId: Scalars["uuid"];
}>;

export type UpdateCompanySettingsMutation = {
  update_company_settings_by_pk?: Maybe<CompanySettingsFragment>;
  update_companies_by_pk?: Maybe<CompanyFragment>;
};

export type GetCompanySettingsQueryVariables = Exact<{
  companySettingsId: Scalars["uuid"];
}>;

export type GetCompanySettingsQuery = {
  company_settings_by_pk?: Maybe<CompanySettingsFragment>;
};

export type TransactionsQueryVariables = Exact<{ [key: string]: never }>;

export type TransactionsQuery = {
  transactions: Array<
    Pick<Transactions, "id"> & {
      payment: Pick<Payments, "id"> & {
        company: Pick<Companies, "id" | "name">;
      };
    } & TransactionFragment
  >;
};

export type UserFragment = Pick<
  Users,
  | "id"
  | "first_name"
  | "last_name"
  | "full_name"
  | "email"
  | "phone_number"
  | "role"
  | "created_at"
>;

export type CompanyAgreementFragment = Pick<
  CompanyAgreements,
  "id" | "company_id" | "file_id"
>;

export type CompanyLicenseFragment = Pick<
  CompanyLicenses,
  "id" | "company_id" | "file_id"
>;

export type CompanyFragment = Pick<
  Companies,
  | "id"
  | "identifier"
  | "name"
  | "dba_name"
  | "employer_identification_number"
  | "address"
  | "phone_number"
>;

export type ContractFragment = Pick<
  Contracts,
  | "id"
  | "company_id"
  | "product_type"
  | "product_config"
  | "start_date"
  | "end_date"
>;

export type VendorPartnershipFragment = Pick<
  CompanyVendorPartnerships,
  | "id"
  | "company_id"
  | "vendor_id"
  | "vendor_agreement_id"
  | "vendor_license_id"
  | "approved_at"
>;

export type PurchaseOrderFragment = Pick<
  PurchaseOrders,
  | "id"
  | "company_id"
  | "vendor_id"
  | "order_number"
  | "order_date"
  | "delivery_date"
  | "amount"
  | "is_cannabis"
  | "status"
  | "created_at"
> & {
  company: Pick<Companies, "id" | "name">;
  vendor?: Maybe<Pick<Vendors, "id" | "name">>;
};

export type LoanLimitedFragment = Pick<
  Loans,
  | "id"
  | "loan_type"
  | "artifact_id"
  | "identifier"
  | "status"
  | "amount"
  | "requested_payment_date"
  | "origination_date"
  | "maturity_date"
  | "adjusted_maturity_date"
  | "outstanding_principal_balance"
  | "outstanding_interest"
  | "outstanding_fees"
  | "funded_at"
> & { company: Pick<Companies, "id" | "identifier"> };

export type FileFragment = Pick<Files, "id" | "name" | "path">;

export type PurchaseOrderFileFragment = Pick<
  PurchaseOrderFiles,
  "purchase_order_id" | "file_id" | "file_type"
> & { file: Pick<Files, "id"> & FileFragment };

export type BankAccountFragment = Pick<
  BankAccounts,
  | "id"
  | "company_id"
  | "bank_name"
  | "bank_address"
  | "account_title"
  | "account_type"
  | "account_number"
  | "routing_number"
  | "can_ach"
  | "can_wire"
  | "recipient_name"
  | "recipient_address"
  | "verified_at"
  | "verified_date"
>;

export type BankAccountForVendorFragment = Pick<
  BankAccounts,
  | "id"
  | "company_id"
  | "bank_name"
  | "bank_address"
  | "account_title"
  | "account_type"
  | "account_number"
  | "routing_number"
  | "recipient_name"
  | "recipient_address"
>;

export type EbbaApplicationFragment = Pick<
  EbbaApplications,
  | "id"
  | "company_id"
  | "application_month"
  | "monthly_accounts_receivable"
  | "monthly_inventory"
  | "monthly_cash"
  | "status"
  | "rejection_note"
  | "created_at"
>;

export type EbbaApplicationFileFragment = Pick<
  EbbaApplicationFiles,
  "ebba_application_id" | "file_id"
> & { file: Pick<Files, "id"> & FileFragment };

export type LineOfCreditFragment = Pick<
  LineOfCredits,
  "id" | "company_id" | "is_credit_for_vendor" | "recipient_vendor_id"
> & { recipient_vendor?: Maybe<Pick<Vendors, "id" | "name">> };

export type VendorPartnershipsByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type VendorPartnershipsByCompanyIdQuery = {
  company_vendor_partnerships: Array<
    Pick<CompanyVendorPartnerships, "id"> & {
      vendor_limited?: Maybe<VendorLimitedFragment>;
      vendor_bank_account?: Maybe<Pick<BankAccounts, "id" | "verified_at">>;
    } & VendorPartnershipFragment
  >;
};

export type AddVendorPartnershipMutationVariables = Exact<{
  vendorPartnership: CompanyVendorPartnershipsInsertInput;
}>;

export type AddVendorPartnershipMutation = {
  insert_company_vendor_partnerships_one?: Maybe<
    {
      vendor_limited?: Maybe<VendorLimitedFragment>;
    } & VendorPartnershipFragment
  >;
};

export type UpdateVendorContactMutationVariables = Exact<{
  userId: Scalars["uuid"];
  contact: UsersSetInput;
}>;

export type UpdateVendorContactMutation = {
  update_users_by_pk?: Maybe<ContactFragment>;
};

export type DeleteVendorContactMutationVariables = Exact<{
  userId: Scalars["uuid"];
}>;

export type DeleteVendorContactMutation = {
  delete_users_by_pk?: Maybe<Pick<Users, "id">>;
};

export type AddVendorContactMutationVariables = Exact<{
  contact: UsersInsertInput;
}>;

export type AddVendorContactMutation = {
  insert_users_one?: Maybe<ContactFragment>;
};

export type BankListVendorPartnershipsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type BankListVendorPartnershipsQuery = {
  company_vendor_partnerships: Array<
    {
      company: Pick<Companies, "id" | "name">;
      vendor: {
        settings: Pick<CompanySettings, "id">;
        users: Array<ContactFragment>;
      } & VendorFragment;
      vendor_bank_account?: Maybe<Pick<BankAccounts, "id" | "verified_at">>;
    } & BankVendorPartnershipFragment
  >;
};

export type BankVendorPartnershipQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type BankVendorPartnershipQuery = {
  company_vendor_partnerships_by_pk?: Maybe<
    {
      vendor: {
        settings: Pick<CompanySettings, "id"> & {
          collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
          advances_bespoke_bank_account?: Maybe<BankAccountFragment>;
        };
        users: Array<ContactFragment>;
      } & VendorFragment;
      company: {
        users: Array<ContactFragment>;
        settings: CompanySettingsFragment;
      } & CompanyFragment;
      company_agreement?: Maybe<CompanyAgreementFragment>;
      company_license?: Maybe<CompanyLicenseFragment>;
    } & BankVendorPartnershipFragment
  >;
};

export type CompanyBankAccountsQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type CompanyBankAccountsQuery = {
  bank_accounts: Array<BankAccountFragment>;
};

export type AddBankAccountMutationVariables = Exact<{
  bankAccount: BankAccountsInsertInput;
}>;

export type AddBankAccountMutation = {
  insert_bank_accounts_one?: Maybe<BankAccountFragment>;
};

export type UpdateBankAccountMutationVariables = Exact<{
  id: Scalars["uuid"];
  bankAccount?: Maybe<BankAccountsSetInput>;
}>;

export type UpdateBankAccountMutation = {
  update_bank_accounts_by_pk?: Maybe<BankAccountFragment>;
};

export type ChangeBankAccountMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars["uuid"];
  bankAccountId?: Maybe<Scalars["uuid"]>;
}>;

export type ChangeBankAccountMutation = {
  update_company_vendor_partnerships_by_pk?: Maybe<
    Pick<CompanyVendorPartnerships, "id"> & {
      vendor_bank_account?: Maybe<BankAccountFragment>;
    }
  >;
};

export type UpdateCompanyVendorPartnershipApprovedAtMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars["uuid"];
  approvedAt?: Maybe<Scalars["timestamptz"]>;
}>;

export type UpdateCompanyVendorPartnershipApprovedAtMutation = {
  update_company_vendor_partnerships_by_pk?: Maybe<BankVendorPartnershipFragment>;
};

export type UpdateVendorInfoMutationVariables = Exact<{
  id: Scalars["uuid"];
  company: CompaniesSetInput;
}>;

export type UpdateVendorInfoMutation = {
  update_companies_by_pk?: Maybe<VendorFragment>;
};

export type UpdateVendorAgreementIdMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars["uuid"];
  vendorAgreementId?: Maybe<Scalars["uuid"]>;
}>;

export type UpdateVendorAgreementIdMutation = {
  update_company_vendor_partnerships_by_pk?: Maybe<
    Pick<CompanyVendorPartnerships, "id"> & {
      company_agreement?: Maybe<CompanyAgreementFragment>;
    }
  >;
};

export type AddCompanyVendorAgreementMutationVariables = Exact<{
  vendorAgreement: CompanyAgreementsInsertInput;
}>;

export type AddCompanyVendorAgreementMutation = {
  insert_company_agreements_one?: Maybe<CompanyAgreementFragment>;
};

export type UpdateVendorLicenseIdMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars["uuid"];
  vendorLicenseId: Scalars["uuid"];
}>;

export type UpdateVendorLicenseIdMutation = {
  update_company_vendor_partnerships_by_pk?: Maybe<
    Pick<CompanyVendorPartnerships, "id"> & {
      company_license?: Maybe<CompanyLicenseFragment>;
    }
  >;
};

export type AddCompanyVendorLicenseMutationVariables = Exact<{
  vendorLicense: CompanyLicensesInsertInput;
}>;

export type AddCompanyVendorLicenseMutation = {
  insert_company_licenses_one?: Maybe<CompanyLicenseFragment>;
};

export type ContactFragment = Pick<
  Users,
  | "id"
  | "company_id"
  | "full_name"
  | "first_name"
  | "last_name"
  | "email"
  | "phone_number"
  | "created_at"
>;

export type CustomerForBankFragment = Pick<
  Companies,
  | "id"
  | "name"
  | "employer_identification_number"
  | "dba_name"
  | "address"
  | "country"
  | "state"
  | "city"
  | "zip_code"
  | "phone_number"
>;

export type CompanySettingsFragment = Pick<
  CompanySettings,
  | "id"
  | "company_id"
  | "vendor_agreement_docusign_template"
  | "collections_bespoke_bank_account_id"
  | "advances_bespoke_bank_account_id"
>;

export type VendorFragment = Pick<
  Companies,
  | "id"
  | "name"
  | "address"
  | "country"
  | "state"
  | "city"
  | "zip_code"
  | "phone_number"
>;

export type BankVendorPartnershipFragment = Pick<
  CompanyVendorPartnerships,
  | "id"
  | "company_id"
  | "vendor_id"
  | "vendor_agreement_id"
  | "vendor_license_id"
  | "approved_at"
> & { vendor_bank_account?: Maybe<BankAccountFragment> };

export type LoanFragment = Pick<
  Loans,
  | "id"
  | "loan_type"
  | "artifact_id"
  | "identifier"
  | "status"
  | "amount"
  | "requested_payment_date"
  | "origination_date"
  | "maturity_date"
  | "adjusted_maturity_date"
  | "notes"
  | "outstanding_principal_balance"
  | "outstanding_interest"
  | "outstanding_fees"
  | "requested_at"
> & { company: Pick<Companies, "id" | "identifier"> };

export type PaymentFragment = Pick<
  Payments,
  | "id"
  | "amount"
  | "method"
  | "type"
  | "company_id"
  | "submitted_at"
  | "settled_at"
  | "settlement_date"
  | "requested_payment_date"
  | "payment_date"
  | "items_covered"
> & {
  company_bank_account?: Maybe<BankAccountFragment>;
  bespoke_bank_account?: Maybe<BankAccountFragment>;
};

export type TransactionFragment = Pick<
  Transactions,
  | "id"
  | "loan_id"
  | "payment_id"
  | "type"
  | "amount"
  | "to_principal"
  | "to_interest"
  | "to_fees"
>;

export type CompanySettingsForCustomerFragment = Pick<
  CompanySettings,
  | "id"
  | "company_id"
  | "vendor_agreement_docusign_template"
  | "collections_bespoke_bank_account_id"
>;

export type VendorLimitedFragment = Pick<Vendors, "id" | "name">;

export type BankAccountsQueryVariables = Exact<{ [key: string]: never }>;

export type BankAccountsQuery = { bank_accounts: Array<BankAccountFragment> };

export type CustomersForBankQueryVariables = Exact<{ [key: string]: never }>;

export type CustomersForBankQuery = {
  companies: Array<
    Pick<Companies, "id"> & {
      settings: Pick<CompanySettings, "id"> & CompanySettingsFragment;
      contract?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
    } & CustomerForBankFragment
  >;
};

export type CompanyVendorsQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type CompanyVendorsQuery = {
  company_vendor_partnerships: Array<{ vendor: Pick<Companies, "name"> }>;
};

export type UserByIdQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type UserByIdQuery = {
  users_by_pk?: Maybe<
    Pick<Users, "id"> & {
      company?: Maybe<Pick<Companies, "id" | "name">>;
    } & UserFragment
  >;
};

export type UpdateUserMutationVariables = Exact<{
  id: Scalars["uuid"];
  user: UsersSetInput;
}>;

export type UpdateUserMutation = { update_users_by_pk?: Maybe<UserFragment> };

export type UsersByEmailQueryVariables = Exact<{
  email: Scalars["String"];
}>;

export type UsersByEmailQuery = {
  users: Array<Pick<Users, "id" | "company_id" | "role">>;
};

export type ListUsersByRoleQueryVariables = Exact<{
  role?: Maybe<UserRolesEnum>;
}>;

export type ListUsersByRoleQuery = { users: Array<UserFragment> };

export type ListUsersByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type ListUsersByCompanyIdQuery = { users: Array<UserFragment> };

export type AddUserMutationVariables = Exact<{
  user: UsersInsertInput;
}>;

export type AddUserMutation = { insert_users_one?: Maybe<UserFragment> };

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
export const CompanyFragmentDoc = gql`
  fragment Company on companies {
    id
    identifier
    name
    dba_name
    employer_identification_number
    address
    phone_number
  }
`;
export const ContractFragmentDoc = gql`
  fragment Contract on contracts {
    id
    company_id
    product_type
    product_config
    start_date
    end_date
  }
`;
export const VendorPartnershipFragmentDoc = gql`
  fragment VendorPartnership on company_vendor_partnerships {
    id
    company_id
    vendor_id
    vendor_agreement_id
    vendor_license_id
    approved_at
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
export const LoanLimitedFragmentDoc = gql`
  fragment LoanLimited on loans {
    id
    loan_type
    artifact_id
    identifier
    status
    amount
    requested_payment_date
    origination_date
    maturity_date
    adjusted_maturity_date
    outstanding_principal_balance
    outstanding_interest
    outstanding_fees
    funded_at
    company {
      id
      identifier
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
  ${FileFragmentDoc}
`;
export const BankAccountForVendorFragmentDoc = gql`
  fragment BankAccountForVendor on bank_accounts {
    id
    company_id
    bank_name
    bank_address
    account_title
    account_type
    account_number
    routing_number
    recipient_name
    recipient_address
  }
`;
export const EbbaApplicationFragmentDoc = gql`
  fragment EbbaApplication on ebba_applications {
    id
    company_id
    application_month
    monthly_accounts_receivable
    monthly_inventory
    monthly_cash
    status
    rejection_note
    created_at
  }
`;
export const EbbaApplicationFileFragmentDoc = gql`
  fragment EbbaApplicationFile on ebba_application_files {
    ebba_application_id
    file_id
    file {
      id
      ...File
    }
  }
  ${FileFragmentDoc}
`;
export const LineOfCreditFragmentDoc = gql`
  fragment LineOfCredit on line_of_credits {
    id
    company_id
    is_credit_for_vendor
    recipient_vendor_id
    recipient_vendor {
      id
      name
    }
  }
`;
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
export const CustomerForBankFragmentDoc = gql`
  fragment CustomerForBank on companies {
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
export const CompanySettingsFragmentDoc = gql`
  fragment CompanySettings on company_settings {
    id
    company_id
    vendor_agreement_docusign_template
    collections_bespoke_bank_account_id
    advances_bespoke_bank_account_id
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
export const BankAccountFragmentDoc = gql`
  fragment BankAccount on bank_accounts {
    id
    company_id
    bank_name
    bank_address
    account_title
    account_type
    account_number
    routing_number
    can_ach
    can_wire
    recipient_name
    recipient_address
    verified_at
    verified_date
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
  ${BankAccountFragmentDoc}
`;
export const LoanFragmentDoc = gql`
  fragment Loan on loans {
    id
    loan_type
    artifact_id
    identifier
    status
    amount
    requested_payment_date
    origination_date
    maturity_date
    adjusted_maturity_date
    notes
    outstanding_principal_balance
    outstanding_interest
    outstanding_fees
    requested_at
    company {
      id
      identifier
    }
  }
`;
export const PaymentFragmentDoc = gql`
  fragment Payment on payments {
    id
    amount
    method
    type
    company_id
    submitted_at
    settled_at
    settlement_date
    requested_payment_date
    payment_date
    items_covered
    company_bank_account {
      ...BankAccount
    }
    bespoke_bank_account {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;
export const TransactionFragmentDoc = gql`
  fragment Transaction on transactions {
    id
    loan_id
    payment_id
    type
    amount
    to_principal
    to_interest
    to_fees
  }
`;
export const CompanySettingsForCustomerFragmentDoc = gql`
  fragment CompanySettingsForCustomer on company_settings {
    id
    company_id
    vendor_agreement_docusign_template
    collections_bespoke_bank_account_id
  }
`;
export const VendorLimitedFragmentDoc = gql`
  fragment VendorLimited on vendors {
    id
    name
  }
`;
export const GetAdvancesDocument = gql`
  query GetAdvances {
    payments(where: { type: { _eq: "advance" } }) {
      id
      ...Payment
      company {
        id
        name
      }
      submitted_by_user {
        id
        full_name
      }
    }
  }
  ${PaymentFragmentDoc}
`;

/**
 * __useGetAdvancesQuery__
 *
 * To run a query within a React component, call `useGetAdvancesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdvancesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdvancesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAdvancesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetAdvancesQuery,
    GetAdvancesQueryVariables
  >
) {
  return Apollo.useQuery<GetAdvancesQuery, GetAdvancesQueryVariables>(
    GetAdvancesDocument,
    baseOptions
  );
}
export function useGetAdvancesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAdvancesQuery,
    GetAdvancesQueryVariables
  >
) {
  return Apollo.useLazyQuery<GetAdvancesQuery, GetAdvancesQueryVariables>(
    GetAdvancesDocument,
    baseOptions
  );
}
export type GetAdvancesQueryHookResult = ReturnType<typeof useGetAdvancesQuery>;
export type GetAdvancesLazyQueryHookResult = ReturnType<
  typeof useGetAdvancesLazyQuery
>;
export type GetAdvancesQueryResult = Apollo.QueryResult<
  GetAdvancesQuery,
  GetAdvancesQueryVariables
>;
export const AddCustomerDocument = gql`
  mutation AddCustomer($customer: companies_insert_input!) {
    insert_companies_one(object: $customer) {
      id
      name
      settings {
        id
      }
      contract {
        id
        product_type
      }
    }
  }
`;
export type AddCustomerMutationFn = Apollo.MutationFunction<
  AddCustomerMutation,
  AddCustomerMutationVariables
>;

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
export function useAddCustomerMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddCustomerMutation,
    AddCustomerMutationVariables
  >
) {
  return Apollo.useMutation<AddCustomerMutation, AddCustomerMutationVariables>(
    AddCustomerDocument,
    baseOptions
  );
}
export type AddCustomerMutationHookResult = ReturnType<
  typeof useAddCustomerMutation
>;
export type AddCustomerMutationResult = Apollo.MutationResult<AddCustomerMutation>;
export type AddCustomerMutationOptions = Apollo.BaseMutationOptions<
  AddCustomerMutation,
  AddCustomerMutationVariables
>;
export const GetCustomerForBankDocument = gql`
  query GetCustomerForBank($id: uuid!) {
    companies_by_pk(id: $id) {
      id
      ...CustomerForBank
      contract {
        id
        product_type
      }
    }
  }
  ${CustomerForBankFragmentDoc}
`;

/**
 * __useGetCustomerForBankQuery__
 *
 * To run a query within a React component, call `useGetCustomerForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCustomerForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCustomerForBankQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCustomerForBankQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCustomerForBankQuery,
    GetCustomerForBankQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCustomerForBankQuery,
    GetCustomerForBankQueryVariables
  >(GetCustomerForBankDocument, baseOptions);
}
export function useGetCustomerForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCustomerForBankQuery,
    GetCustomerForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCustomerForBankQuery,
    GetCustomerForBankQueryVariables
  >(GetCustomerForBankDocument, baseOptions);
}
export type GetCustomerForBankQueryHookResult = ReturnType<
  typeof useGetCustomerForBankQuery
>;
export type GetCustomerForBankLazyQueryHookResult = ReturnType<
  typeof useGetCustomerForBankLazyQuery
>;
export type GetCustomerForBankQueryResult = Apollo.QueryResult<
  GetCustomerForBankQuery,
  GetCustomerForBankQueryVariables
>;
export const BankCustomerListVendorPartnershipsDocument = gql`
  query BankCustomerListVendorPartnerships($companyId: uuid!) {
    company_vendor_partnerships(where: { company_id: { _eq: $companyId } }) {
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
  ${ContactFragmentDoc}
`;

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
export function useBankCustomerListVendorPartnershipsQuery(
  baseOptions: Apollo.QueryHookOptions<
    BankCustomerListVendorPartnershipsQuery,
    BankCustomerListVendorPartnershipsQueryVariables
  >
) {
  return Apollo.useQuery<
    BankCustomerListVendorPartnershipsQuery,
    BankCustomerListVendorPartnershipsQueryVariables
  >(BankCustomerListVendorPartnershipsDocument, baseOptions);
}
export function useBankCustomerListVendorPartnershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BankCustomerListVendorPartnershipsQuery,
    BankCustomerListVendorPartnershipsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    BankCustomerListVendorPartnershipsQuery,
    BankCustomerListVendorPartnershipsQueryVariables
  >(BankCustomerListVendorPartnershipsDocument, baseOptions);
}
export type BankCustomerListVendorPartnershipsQueryHookResult = ReturnType<
  typeof useBankCustomerListVendorPartnershipsQuery
>;
export type BankCustomerListVendorPartnershipsLazyQueryHookResult = ReturnType<
  typeof useBankCustomerListVendorPartnershipsLazyQuery
>;
export type BankCustomerListVendorPartnershipsQueryResult = Apollo.QueryResult<
  BankCustomerListVendorPartnershipsQuery,
  BankCustomerListVendorPartnershipsQueryVariables
>;
export const AddLineOfCreditDocument = gql`
  mutation AddLineOfCredit($lineOfCredit: line_of_credits_insert_input!) {
    insert_line_of_credits_one(object: $lineOfCredit) {
      id
      ...LineOfCredit
    }
  }
  ${LineOfCreditFragmentDoc}
`;
export type AddLineOfCreditMutationFn = Apollo.MutationFunction<
  AddLineOfCreditMutation,
  AddLineOfCreditMutationVariables
>;

/**
 * __useAddLineOfCreditMutation__
 *
 * To run a mutation, you first call `useAddLineOfCreditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddLineOfCreditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addLineOfCreditMutation, { data, loading, error }] = useAddLineOfCreditMutation({
 *   variables: {
 *      lineOfCredit: // value for 'lineOfCredit'
 *   },
 * });
 */
export function useAddLineOfCreditMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddLineOfCreditMutation,
    AddLineOfCreditMutationVariables
  >
) {
  return Apollo.useMutation<
    AddLineOfCreditMutation,
    AddLineOfCreditMutationVariables
  >(AddLineOfCreditDocument, baseOptions);
}
export type AddLineOfCreditMutationHookResult = ReturnType<
  typeof useAddLineOfCreditMutation
>;
export type AddLineOfCreditMutationResult = Apollo.MutationResult<AddLineOfCreditMutation>;
export type AddLineOfCreditMutationOptions = Apollo.BaseMutationOptions<
  AddLineOfCreditMutation,
  AddLineOfCreditMutationVariables
>;
export const UpdateLineOfCreditAndLoanDocument = gql`
  mutation UpdateLineOfCreditAndLoan(
    $lineOfCreditId: uuid!
    $lineOfCredit: line_of_credits_set_input!
    $loanId: uuid!
    $loan: loans_set_input!
  ) {
    update_line_of_credits_by_pk(
      pk_columns: { id: $lineOfCreditId }
      _set: $lineOfCredit
    ) {
      id
      ...LineOfCredit
    }
    update_loans_by_pk(pk_columns: { id: $loanId }, _set: $loan) {
      id
      ...LoanLimited
    }
  }
  ${LineOfCreditFragmentDoc}
  ${LoanLimitedFragmentDoc}
`;
export type UpdateLineOfCreditAndLoanMutationFn = Apollo.MutationFunction<
  UpdateLineOfCreditAndLoanMutation,
  UpdateLineOfCreditAndLoanMutationVariables
>;

/**
 * __useUpdateLineOfCreditAndLoanMutation__
 *
 * To run a mutation, you first call `useUpdateLineOfCreditAndLoanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLineOfCreditAndLoanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLineOfCreditAndLoanMutation, { data, loading, error }] = useUpdateLineOfCreditAndLoanMutation({
 *   variables: {
 *      lineOfCreditId: // value for 'lineOfCreditId'
 *      lineOfCredit: // value for 'lineOfCredit'
 *      loanId: // value for 'loanId'
 *      loan: // value for 'loan'
 *   },
 * });
 */
export function useUpdateLineOfCreditAndLoanMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateLineOfCreditAndLoanMutation,
    UpdateLineOfCreditAndLoanMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateLineOfCreditAndLoanMutation,
    UpdateLineOfCreditAndLoanMutationVariables
  >(UpdateLineOfCreditAndLoanDocument, baseOptions);
}
export type UpdateLineOfCreditAndLoanMutationHookResult = ReturnType<
  typeof useUpdateLineOfCreditAndLoanMutation
>;
export type UpdateLineOfCreditAndLoanMutationResult = Apollo.MutationResult<UpdateLineOfCreditAndLoanMutation>;
export type UpdateLineOfCreditAndLoanMutationOptions = Apollo.BaseMutationOptions<
  UpdateLineOfCreditAndLoanMutation,
  UpdateLineOfCreditAndLoanMutationVariables
>;
export const LoanSiblingsDocument = gql`
  query LoanSiblings(
    $loanId: uuid!
    $loanType: loan_type_enum!
    $artifactId: uuid!
  ) {
    loans(
      where: {
        _and: [
          { id: { _neq: $loanId } }
          { loan_type: { _eq: $loanType } }
          { artifact_id: { _eq: $artifactId } }
        ]
      }
    ) {
      id
      loan_type
      artifact_id
      amount
      status
    }
  }
`;

/**
 * __useLoanSiblingsQuery__
 *
 * To run a query within a React component, call `useLoanSiblingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoanSiblingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoanSiblingsQuery({
 *   variables: {
 *      loanId: // value for 'loanId'
 *      loanType: // value for 'loanType'
 *      artifactId: // value for 'artifactId'
 *   },
 * });
 */
export function useLoanSiblingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    LoanSiblingsQuery,
    LoanSiblingsQueryVariables
  >
) {
  return Apollo.useQuery<LoanSiblingsQuery, LoanSiblingsQueryVariables>(
    LoanSiblingsDocument,
    baseOptions
  );
}
export function useLoanSiblingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LoanSiblingsQuery,
    LoanSiblingsQueryVariables
  >
) {
  return Apollo.useLazyQuery<LoanSiblingsQuery, LoanSiblingsQueryVariables>(
    LoanSiblingsDocument,
    baseOptions
  );
}
export type LoanSiblingsQueryHookResult = ReturnType<
  typeof useLoanSiblingsQuery
>;
export type LoanSiblingsLazyQueryHookResult = ReturnType<
  typeof useLoanSiblingsLazyQuery
>;
export type LoanSiblingsQueryResult = Apollo.QueryResult<
  LoanSiblingsQuery,
  LoanSiblingsQueryVariables
>;
export const LoansByCompanyAndLoanTypeForCustomerDocument = gql`
  query LoansByCompanyAndLoanTypeForCustomer(
    $companyId: uuid!
    $loanType: loan_type_enum!
  ) {
    loans(
      where: {
        _and: [
          { company_id: { _eq: $companyId } }
          { loan_type: { _eq: $loanType } }
        ]
      }
    ) {
      ...LoanLimited
      line_of_credit {
        id
        ...LineOfCredit
      }
      purchase_order {
        id
        order_number
      }
    }
  }
  ${LoanLimitedFragmentDoc}
  ${LineOfCreditFragmentDoc}
`;

/**
 * __useLoansByCompanyAndLoanTypeForCustomerQuery__
 *
 * To run a query within a React component, call `useLoansByCompanyAndLoanTypeForCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoansByCompanyAndLoanTypeForCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoansByCompanyAndLoanTypeForCustomerQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      loanType: // value for 'loanType'
 *   },
 * });
 */
export function useLoansByCompanyAndLoanTypeForCustomerQuery(
  baseOptions: Apollo.QueryHookOptions<
    LoansByCompanyAndLoanTypeForCustomerQuery,
    LoansByCompanyAndLoanTypeForCustomerQueryVariables
  >
) {
  return Apollo.useQuery<
    LoansByCompanyAndLoanTypeForCustomerQuery,
    LoansByCompanyAndLoanTypeForCustomerQueryVariables
  >(LoansByCompanyAndLoanTypeForCustomerDocument, baseOptions);
}
export function useLoansByCompanyAndLoanTypeForCustomerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LoansByCompanyAndLoanTypeForCustomerQuery,
    LoansByCompanyAndLoanTypeForCustomerQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    LoansByCompanyAndLoanTypeForCustomerQuery,
    LoansByCompanyAndLoanTypeForCustomerQueryVariables
  >(LoansByCompanyAndLoanTypeForCustomerDocument, baseOptions);
}
export type LoansByCompanyAndLoanTypeForCustomerQueryHookResult = ReturnType<
  typeof useLoansByCompanyAndLoanTypeForCustomerQuery
>;
export type LoansByCompanyAndLoanTypeForCustomerLazyQueryHookResult = ReturnType<
  typeof useLoansByCompanyAndLoanTypeForCustomerLazyQuery
>;
export type LoansByCompanyAndLoanTypeForCustomerQueryResult = Apollo.QueryResult<
  LoansByCompanyAndLoanTypeForCustomerQuery,
  LoansByCompanyAndLoanTypeForCustomerQueryVariables
>;
export const GetOutstandingLoansForCustomerDocument = gql`
  query GetOutstandingLoansForCustomer(
    $companyId: uuid!
    $loanType: loan_type_enum!
  ) {
    loans(
      where: {
        _and: [
          { company_id: { _eq: $companyId } }
          { status: { _in: [funded, past_due] } }
          { loan_type: { _eq: $loanType } }
        ]
      }
    ) {
      ...LoanLimited
      line_of_credit {
        id
        ...LineOfCredit
      }
      purchase_order {
        id
        order_number
      }
    }
  }
  ${LoanLimitedFragmentDoc}
  ${LineOfCreditFragmentDoc}
`;

/**
 * __useGetOutstandingLoansForCustomerQuery__
 *
 * To run a query within a React component, call `useGetOutstandingLoansForCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOutstandingLoansForCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOutstandingLoansForCustomerQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      loanType: // value for 'loanType'
 *   },
 * });
 */
export function useGetOutstandingLoansForCustomerQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOutstandingLoansForCustomerQuery,
    GetOutstandingLoansForCustomerQueryVariables
  >
) {
  return Apollo.useQuery<
    GetOutstandingLoansForCustomerQuery,
    GetOutstandingLoansForCustomerQueryVariables
  >(GetOutstandingLoansForCustomerDocument, baseOptions);
}
export function useGetOutstandingLoansForCustomerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOutstandingLoansForCustomerQuery,
    GetOutstandingLoansForCustomerQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetOutstandingLoansForCustomerQuery,
    GetOutstandingLoansForCustomerQueryVariables
  >(GetOutstandingLoansForCustomerDocument, baseOptions);
}
export type GetOutstandingLoansForCustomerQueryHookResult = ReturnType<
  typeof useGetOutstandingLoansForCustomerQuery
>;
export type GetOutstandingLoansForCustomerLazyQueryHookResult = ReturnType<
  typeof useGetOutstandingLoansForCustomerLazyQuery
>;
export type GetOutstandingLoansForCustomerQueryResult = Apollo.QueryResult<
  GetOutstandingLoansForCustomerQuery,
  GetOutstandingLoansForCustomerQueryVariables
>;
export const LoansByCompanyAndLoanTypeForBankDocument = gql`
  query LoansByCompanyAndLoanTypeForBank(
    $companyId: uuid!
    $loanType: loan_type_enum!
  ) {
    loans(
      where: {
        _and: [
          { company_id: { _eq: $companyId } }
          { loan_type: { _eq: $loanType } }
        ]
      }
    ) {
      id
      ...Loan
      line_of_credit {
        id
        ...LineOfCredit
      }
      purchase_order {
        id
        order_number
      }
    }
  }
  ${LoanFragmentDoc}
  ${LineOfCreditFragmentDoc}
`;

/**
 * __useLoansByCompanyAndLoanTypeForBankQuery__
 *
 * To run a query within a React component, call `useLoansByCompanyAndLoanTypeForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoansByCompanyAndLoanTypeForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoansByCompanyAndLoanTypeForBankQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      loanType: // value for 'loanType'
 *   },
 * });
 */
export function useLoansByCompanyAndLoanTypeForBankQuery(
  baseOptions: Apollo.QueryHookOptions<
    LoansByCompanyAndLoanTypeForBankQuery,
    LoansByCompanyAndLoanTypeForBankQueryVariables
  >
) {
  return Apollo.useQuery<
    LoansByCompanyAndLoanTypeForBankQuery,
    LoansByCompanyAndLoanTypeForBankQueryVariables
  >(LoansByCompanyAndLoanTypeForBankDocument, baseOptions);
}
export function useLoansByCompanyAndLoanTypeForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LoansByCompanyAndLoanTypeForBankQuery,
    LoansByCompanyAndLoanTypeForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    LoansByCompanyAndLoanTypeForBankQuery,
    LoansByCompanyAndLoanTypeForBankQueryVariables
  >(LoansByCompanyAndLoanTypeForBankDocument, baseOptions);
}
export type LoansByCompanyAndLoanTypeForBankQueryHookResult = ReturnType<
  typeof useLoansByCompanyAndLoanTypeForBankQuery
>;
export type LoansByCompanyAndLoanTypeForBankLazyQueryHookResult = ReturnType<
  typeof useLoansByCompanyAndLoanTypeForBankLazyQuery
>;
export type LoansByCompanyAndLoanTypeForBankQueryResult = Apollo.QueryResult<
  LoansByCompanyAndLoanTypeForBankQuery,
  LoansByCompanyAndLoanTypeForBankQueryVariables
>;
export const LoansForBankDocument = gql`
  query LoansForBank {
    loans {
      id
      ...Loan
      company {
        id
        name
      }
      line_of_credit {
        id
        ...LineOfCredit
      }
      purchase_order {
        id
        order_number
        vendor {
          id
          name
        }
      }
    }
  }
  ${LoanFragmentDoc}
  ${LineOfCreditFragmentDoc}
`;

/**
 * __useLoansForBankQuery__
 *
 * To run a query within a React component, call `useLoansForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoansForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoansForBankQuery({
 *   variables: {
 *   },
 * });
 */
export function useLoansForBankQuery(
  baseOptions?: Apollo.QueryHookOptions<
    LoansForBankQuery,
    LoansForBankQueryVariables
  >
) {
  return Apollo.useQuery<LoansForBankQuery, LoansForBankQueryVariables>(
    LoansForBankDocument,
    baseOptions
  );
}
export function useLoansForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LoansForBankQuery,
    LoansForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<LoansForBankQuery, LoansForBankQueryVariables>(
    LoansForBankDocument,
    baseOptions
  );
}
export type LoansForBankQueryHookResult = ReturnType<
  typeof useLoansForBankQuery
>;
export type LoansForBankLazyQueryHookResult = ReturnType<
  typeof useLoansForBankLazyQuery
>;
export type LoansForBankQueryResult = Apollo.QueryResult<
  LoansForBankQuery,
  LoansForBankQueryVariables
>;
export const LoansByStatusesForBankDocument = gql`
  query LoansByStatusesForBank($statuses: [loan_status_enum!]) {
    loans(where: { status: { _in: $statuses } }) {
      id
      ...Loan
      company {
        id
        name
      }
      line_of_credit {
        id
        ...LineOfCredit
      }
      purchase_order {
        id
        order_number
        vendor {
          id
          name
        }
      }
    }
  }
  ${LoanFragmentDoc}
  ${LineOfCreditFragmentDoc}
`;

/**
 * __useLoansByStatusesForBankQuery__
 *
 * To run a query within a React component, call `useLoansByStatusesForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoansByStatusesForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoansByStatusesForBankQuery({
 *   variables: {
 *      statuses: // value for 'statuses'
 *   },
 * });
 */
export function useLoansByStatusesForBankQuery(
  baseOptions?: Apollo.QueryHookOptions<
    LoansByStatusesForBankQuery,
    LoansByStatusesForBankQueryVariables
  >
) {
  return Apollo.useQuery<
    LoansByStatusesForBankQuery,
    LoansByStatusesForBankQueryVariables
  >(LoansByStatusesForBankDocument, baseOptions);
}
export function useLoansByStatusesForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LoansByStatusesForBankQuery,
    LoansByStatusesForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    LoansByStatusesForBankQuery,
    LoansByStatusesForBankQueryVariables
  >(LoansByStatusesForBankDocument, baseOptions);
}
export type LoansByStatusesForBankQueryHookResult = ReturnType<
  typeof useLoansByStatusesForBankQuery
>;
export type LoansByStatusesForBankLazyQueryHookResult = ReturnType<
  typeof useLoansByStatusesForBankLazyQuery
>;
export type LoansByStatusesForBankQueryResult = Apollo.QueryResult<
  LoansByStatusesForBankQuery,
  LoansByStatusesForBankQueryVariables
>;
export const GetLoansByLoanIdsDocument = gql`
  query GetLoansByLoanIds($loanIds: [uuid!]) {
    loans(where: { id: { _in: $loanIds } }) {
      id
      ...Loan
    }
  }
  ${LoanFragmentDoc}
`;

/**
 * __useGetLoansByLoanIdsQuery__
 *
 * To run a query within a React component, call `useGetLoansByLoanIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoansByLoanIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoansByLoanIdsQuery({
 *   variables: {
 *      loanIds: // value for 'loanIds'
 *   },
 * });
 */
export function useGetLoansByLoanIdsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetLoansByLoanIdsQuery,
    GetLoansByLoanIdsQueryVariables
  >
) {
  return Apollo.useQuery<
    GetLoansByLoanIdsQuery,
    GetLoansByLoanIdsQueryVariables
  >(GetLoansByLoanIdsDocument, baseOptions);
}
export function useGetLoansByLoanIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLoansByLoanIdsQuery,
    GetLoansByLoanIdsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetLoansByLoanIdsQuery,
    GetLoansByLoanIdsQueryVariables
  >(GetLoansByLoanIdsDocument, baseOptions);
}
export type GetLoansByLoanIdsQueryHookResult = ReturnType<
  typeof useGetLoansByLoanIdsQuery
>;
export type GetLoansByLoanIdsLazyQueryHookResult = ReturnType<
  typeof useGetLoansByLoanIdsLazyQuery
>;
export type GetLoansByLoanIdsQueryResult = Apollo.QueryResult<
  GetLoansByLoanIdsQuery,
  GetLoansByLoanIdsQueryVariables
>;
export const GetPaymentDocument = gql`
  query GetPayment($id: uuid!) {
    payments_by_pk(id: $id) {
      id
      ...Payment
      company {
        id
        name
      }
      submitted_by_user {
        id
        full_name
      }
    }
  }
  ${PaymentFragmentDoc}
`;

/**
 * __useGetPaymentQuery__
 *
 * To run a query within a React component, call `useGetPaymentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPaymentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPaymentQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPaymentQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPaymentQuery,
    GetPaymentQueryVariables
  >
) {
  return Apollo.useQuery<GetPaymentQuery, GetPaymentQueryVariables>(
    GetPaymentDocument,
    baseOptions
  );
}
export function useGetPaymentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPaymentQuery,
    GetPaymentQueryVariables
  >
) {
  return Apollo.useLazyQuery<GetPaymentQuery, GetPaymentQueryVariables>(
    GetPaymentDocument,
    baseOptions
  );
}
export type GetPaymentQueryHookResult = ReturnType<typeof useGetPaymentQuery>;
export type GetPaymentLazyQueryHookResult = ReturnType<
  typeof useGetPaymentLazyQuery
>;
export type GetPaymentQueryResult = Apollo.QueryResult<
  GetPaymentQuery,
  GetPaymentQueryVariables
>;
export const GetPaymentForSettlementDocument = gql`
  query GetPaymentForSettlement($id: uuid!) {
    payments_by_pk(id: $id) {
      id
      ...Payment
      company {
        id
        name
        contract {
          id
          product_type
        }
      }
      submitted_by_user {
        id
        full_name
      }
    }
  }
  ${PaymentFragmentDoc}
`;

/**
 * __useGetPaymentForSettlementQuery__
 *
 * To run a query within a React component, call `useGetPaymentForSettlementQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPaymentForSettlementQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPaymentForSettlementQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPaymentForSettlementQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPaymentForSettlementQuery,
    GetPaymentForSettlementQueryVariables
  >
) {
  return Apollo.useQuery<
    GetPaymentForSettlementQuery,
    GetPaymentForSettlementQueryVariables
  >(GetPaymentForSettlementDocument, baseOptions);
}
export function useGetPaymentForSettlementLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPaymentForSettlementQuery,
    GetPaymentForSettlementQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetPaymentForSettlementQuery,
    GetPaymentForSettlementQueryVariables
  >(GetPaymentForSettlementDocument, baseOptions);
}
export type GetPaymentForSettlementQueryHookResult = ReturnType<
  typeof useGetPaymentForSettlementQuery
>;
export type GetPaymentForSettlementLazyQueryHookResult = ReturnType<
  typeof useGetPaymentForSettlementLazyQuery
>;
export type GetPaymentForSettlementQueryResult = Apollo.QueryResult<
  GetPaymentForSettlementQuery,
  GetPaymentForSettlementQueryVariables
>;
export const GetPaymentsDocument = gql`
  query GetPayments {
    payments(where: { type: { _eq: "repayment" } }) {
      id
      ...Payment
      company {
        id
        name
      }
      submitted_by_user {
        id
        full_name
      }
    }
  }
  ${PaymentFragmentDoc}
`;

/**
 * __useGetPaymentsQuery__
 *
 * To run a query within a React component, call `useGetPaymentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPaymentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPaymentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPaymentsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetPaymentsQuery,
    GetPaymentsQueryVariables
  >
) {
  return Apollo.useQuery<GetPaymentsQuery, GetPaymentsQueryVariables>(
    GetPaymentsDocument,
    baseOptions
  );
}
export function useGetPaymentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPaymentsQuery,
    GetPaymentsQueryVariables
  >
) {
  return Apollo.useLazyQuery<GetPaymentsQuery, GetPaymentsQueryVariables>(
    GetPaymentsDocument,
    baseOptions
  );
}
export type GetPaymentsQueryHookResult = ReturnType<typeof useGetPaymentsQuery>;
export type GetPaymentsLazyQueryHookResult = ReturnType<
  typeof useGetPaymentsLazyQuery
>;
export type GetPaymentsQueryResult = Apollo.QueryResult<
  GetPaymentsQuery,
  GetPaymentsQueryVariables
>;
export const GetSubmittedPaymentsDocument = gql`
  query GetSubmittedPayments {
    payments(
      where: {
        _and: [
          { type: { _eq: "repayment" } }
          { submitted_at: { _is_null: false } }
          { settled_at: { _is_null: true } }
        ]
      }
    ) {
      id
      ...Payment
      company {
        id
        name
      }
      submitted_by_user {
        id
        full_name
      }
    }
  }
  ${PaymentFragmentDoc}
`;

/**
 * __useGetSubmittedPaymentsQuery__
 *
 * To run a query within a React component, call `useGetSubmittedPaymentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubmittedPaymentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubmittedPaymentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSubmittedPaymentsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSubmittedPaymentsQuery,
    GetSubmittedPaymentsQueryVariables
  >
) {
  return Apollo.useQuery<
    GetSubmittedPaymentsQuery,
    GetSubmittedPaymentsQueryVariables
  >(GetSubmittedPaymentsDocument, baseOptions);
}
export function useGetSubmittedPaymentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSubmittedPaymentsQuery,
    GetSubmittedPaymentsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetSubmittedPaymentsQuery,
    GetSubmittedPaymentsQueryVariables
  >(GetSubmittedPaymentsDocument, baseOptions);
}
export type GetSubmittedPaymentsQueryHookResult = ReturnType<
  typeof useGetSubmittedPaymentsQuery
>;
export type GetSubmittedPaymentsLazyQueryHookResult = ReturnType<
  typeof useGetSubmittedPaymentsLazyQuery
>;
export type GetSubmittedPaymentsQueryResult = Apollo.QueryResult<
  GetSubmittedPaymentsQuery,
  GetSubmittedPaymentsQueryVariables
>;
export const BankAccountsForTransferDocument = gql`
  query BankAccountsForTransfer($companyId: uuid!) {
    bank_accounts(where: { company_id: { _is_null: true } }) {
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
  ${BankAccountFragmentDoc}
`;

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
export function useBankAccountsForTransferQuery(
  baseOptions: Apollo.QueryHookOptions<
    BankAccountsForTransferQuery,
    BankAccountsForTransferQueryVariables
  >
) {
  return Apollo.useQuery<
    BankAccountsForTransferQuery,
    BankAccountsForTransferQueryVariables
  >(BankAccountsForTransferDocument, baseOptions);
}
export function useBankAccountsForTransferLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BankAccountsForTransferQuery,
    BankAccountsForTransferQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    BankAccountsForTransferQuery,
    BankAccountsForTransferQueryVariables
  >(BankAccountsForTransferDocument, baseOptions);
}
export type BankAccountsForTransferQueryHookResult = ReturnType<
  typeof useBankAccountsForTransferQuery
>;
export type BankAccountsForTransferLazyQueryHookResult = ReturnType<
  typeof useBankAccountsForTransferLazyQuery
>;
export type BankAccountsForTransferQueryResult = Apollo.QueryResult<
  BankAccountsForTransferQuery,
  BankAccountsForTransferQueryVariables
>;
export const ListBankAccountsDocument = gql`
  query ListBankAccounts($companyId: uuid!) {
    bank_accounts(where: { company_id: { _eq: $companyId } }) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;

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
export function useListBankAccountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    ListBankAccountsQuery,
    ListBankAccountsQueryVariables
  >
) {
  return Apollo.useQuery<ListBankAccountsQuery, ListBankAccountsQueryVariables>(
    ListBankAccountsDocument,
    baseOptions
  );
}
export function useListBankAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListBankAccountsQuery,
    ListBankAccountsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    ListBankAccountsQuery,
    ListBankAccountsQueryVariables
  >(ListBankAccountsDocument, baseOptions);
}
export type ListBankAccountsQueryHookResult = ReturnType<
  typeof useListBankAccountsQuery
>;
export type ListBankAccountsLazyQueryHookResult = ReturnType<
  typeof useListBankAccountsLazyQuery
>;
export type ListBankAccountsQueryResult = Apollo.QueryResult<
  ListBankAccountsQuery,
  ListBankAccountsQueryVariables
>;
export const AssignCollectionsBespokeBankAccountDocument = gql`
  mutation AssignCollectionsBespokeBankAccount(
    $companySettingsId: uuid!
    $bankAccountId: uuid
  ) {
    update_company_settings_by_pk(
      pk_columns: { id: $companySettingsId }
      _set: { collections_bespoke_bank_account_id: $bankAccountId }
    ) {
      id
      collections_bespoke_bank_account {
        ...BankAccount
      }
    }
  }
  ${BankAccountFragmentDoc}
`;
export type AssignCollectionsBespokeBankAccountMutationFn = Apollo.MutationFunction<
  AssignCollectionsBespokeBankAccountMutation,
  AssignCollectionsBespokeBankAccountMutationVariables
>;

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
export function useAssignCollectionsBespokeBankAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AssignCollectionsBespokeBankAccountMutation,
    AssignCollectionsBespokeBankAccountMutationVariables
  >
) {
  return Apollo.useMutation<
    AssignCollectionsBespokeBankAccountMutation,
    AssignCollectionsBespokeBankAccountMutationVariables
  >(AssignCollectionsBespokeBankAccountDocument, baseOptions);
}
export type AssignCollectionsBespokeBankAccountMutationHookResult = ReturnType<
  typeof useAssignCollectionsBespokeBankAccountMutation
>;
export type AssignCollectionsBespokeBankAccountMutationResult = Apollo.MutationResult<AssignCollectionsBespokeBankAccountMutation>;
export type AssignCollectionsBespokeBankAccountMutationOptions = Apollo.BaseMutationOptions<
  AssignCollectionsBespokeBankAccountMutation,
  AssignCollectionsBespokeBankAccountMutationVariables
>;
export const AssignAdvancesBespokeBankAccountDocument = gql`
  mutation AssignAdvancesBespokeBankAccount(
    $companySettingsId: uuid!
    $bankAccountId: uuid
  ) {
    update_company_settings_by_pk(
      pk_columns: { id: $companySettingsId }
      _set: { advances_bespoke_bank_account_id: $bankAccountId }
    ) {
      id
      advances_bespoke_bank_account {
        ...BankAccount
      }
    }
  }
  ${BankAccountFragmentDoc}
`;
export type AssignAdvancesBespokeBankAccountMutationFn = Apollo.MutationFunction<
  AssignAdvancesBespokeBankAccountMutation,
  AssignAdvancesBespokeBankAccountMutationVariables
>;

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
export function useAssignAdvancesBespokeBankAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AssignAdvancesBespokeBankAccountMutation,
    AssignAdvancesBespokeBankAccountMutationVariables
  >
) {
  return Apollo.useMutation<
    AssignAdvancesBespokeBankAccountMutation,
    AssignAdvancesBespokeBankAccountMutationVariables
  >(AssignAdvancesBespokeBankAccountDocument, baseOptions);
}
export type AssignAdvancesBespokeBankAccountMutationHookResult = ReturnType<
  typeof useAssignAdvancesBespokeBankAccountMutation
>;
export type AssignAdvancesBespokeBankAccountMutationResult = Apollo.MutationResult<AssignAdvancesBespokeBankAccountMutation>;
export type AssignAdvancesBespokeBankAccountMutationOptions = Apollo.BaseMutationOptions<
  AssignAdvancesBespokeBankAccountMutation,
  AssignAdvancesBespokeBankAccountMutationVariables
>;
export const GetCompanyForCustomerOverviewDocument = gql`
  query GetCompanyForCustomerOverview($companyId: uuid!) {
    companies_by_pk(id: $companyId) {
      id
      contract {
        id
        product_type
        product_config
      }
      financial_summary {
        id
        total_limit
        total_outstanding_principal
        total_outstanding_interest
        total_outstanding_fees
        total_principal_in_requested_state
        available_limit
      }
    }
  }
`;

/**
 * __useGetCompanyForCustomerOverviewQuery__
 *
 * To run a query within a React component, call `useGetCompanyForCustomerOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyForCustomerOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyForCustomerOverviewQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetCompanyForCustomerOverviewQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyForCustomerOverviewQuery,
    GetCompanyForCustomerOverviewQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCompanyForCustomerOverviewQuery,
    GetCompanyForCustomerOverviewQueryVariables
  >(GetCompanyForCustomerOverviewDocument, baseOptions);
}
export function useGetCompanyForCustomerOverviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyForCustomerOverviewQuery,
    GetCompanyForCustomerOverviewQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCompanyForCustomerOverviewQuery,
    GetCompanyForCustomerOverviewQueryVariables
  >(GetCompanyForCustomerOverviewDocument, baseOptions);
}
export type GetCompanyForCustomerOverviewQueryHookResult = ReturnType<
  typeof useGetCompanyForCustomerOverviewQuery
>;
export type GetCompanyForCustomerOverviewLazyQueryHookResult = ReturnType<
  typeof useGetCompanyForCustomerOverviewLazyQuery
>;
export type GetCompanyForCustomerOverviewQueryResult = Apollo.QueryResult<
  GetCompanyForCustomerOverviewQuery,
  GetCompanyForCustomerOverviewQueryVariables
>;
export const GetLatestBankFinancialSummariesDocument = gql`
  query GetLatestBankFinancialSummaries {
    bank_financial_summaries(limit: 4, order_by: { date: desc }) {
      id
      date
      product_type
      total_limit
      total_outstanding_principal
      total_outstanding_interest
      total_outstanding_fees
      total_principal_in_requested_state
      available_limit
    }
  }
`;

/**
 * __useGetLatestBankFinancialSummariesQuery__
 *
 * To run a query within a React component, call `useGetLatestBankFinancialSummariesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestBankFinancialSummariesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestBankFinancialSummariesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLatestBankFinancialSummariesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetLatestBankFinancialSummariesQuery,
    GetLatestBankFinancialSummariesQueryVariables
  >
) {
  return Apollo.useQuery<
    GetLatestBankFinancialSummariesQuery,
    GetLatestBankFinancialSummariesQueryVariables
  >(GetLatestBankFinancialSummariesDocument, baseOptions);
}
export function useGetLatestBankFinancialSummariesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLatestBankFinancialSummariesQuery,
    GetLatestBankFinancialSummariesQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetLatestBankFinancialSummariesQuery,
    GetLatestBankFinancialSummariesQueryVariables
  >(GetLatestBankFinancialSummariesDocument, baseOptions);
}
export type GetLatestBankFinancialSummariesQueryHookResult = ReturnType<
  typeof useGetLatestBankFinancialSummariesQuery
>;
export type GetLatestBankFinancialSummariesLazyQueryHookResult = ReturnType<
  typeof useGetLatestBankFinancialSummariesLazyQuery
>;
export type GetLatestBankFinancialSummariesQueryResult = Apollo.QueryResult<
  GetLatestBankFinancialSummariesQuery,
  GetLatestBankFinancialSummariesQueryVariables
>;
export const CompanyWithDetailsByCompanyIdDocument = gql`
  query CompanyWithDetailsByCompanyId($companyId: uuid!) {
    companies_by_pk(id: $companyId) {
      id
      contract {
        id
        ...Contract
      }
    }
  }
  ${ContractFragmentDoc}
`;

/**
 * __useCompanyWithDetailsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useCompanyWithDetailsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyWithDetailsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyWithDetailsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useCompanyWithDetailsByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    CompanyWithDetailsByCompanyIdQuery,
    CompanyWithDetailsByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    CompanyWithDetailsByCompanyIdQuery,
    CompanyWithDetailsByCompanyIdQueryVariables
  >(CompanyWithDetailsByCompanyIdDocument, baseOptions);
}
export function useCompanyWithDetailsByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CompanyWithDetailsByCompanyIdQuery,
    CompanyWithDetailsByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    CompanyWithDetailsByCompanyIdQuery,
    CompanyWithDetailsByCompanyIdQueryVariables
  >(CompanyWithDetailsByCompanyIdDocument, baseOptions);
}
export type CompanyWithDetailsByCompanyIdQueryHookResult = ReturnType<
  typeof useCompanyWithDetailsByCompanyIdQuery
>;
export type CompanyWithDetailsByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useCompanyWithDetailsByCompanyIdLazyQuery
>;
export type CompanyWithDetailsByCompanyIdQueryResult = Apollo.QueryResult<
  CompanyWithDetailsByCompanyIdQuery,
  CompanyWithDetailsByCompanyIdQueryVariables
>;
export const GetCompanyNextLoanIdentifierDocument = gql`
  mutation GetCompanyNextLoanIdentifier(
    $companyId: uuid!
    $increment: companies_inc_input!
  ) {
    update_companies_by_pk(pk_columns: { id: $companyId }, _inc: $increment) {
      id
      latest_loan_identifier
    }
  }
`;
export type GetCompanyNextLoanIdentifierMutationFn = Apollo.MutationFunction<
  GetCompanyNextLoanIdentifierMutation,
  GetCompanyNextLoanIdentifierMutationVariables
>;

/**
 * __useGetCompanyNextLoanIdentifierMutation__
 *
 * To run a mutation, you first call `useGetCompanyNextLoanIdentifierMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyNextLoanIdentifierMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [getCompanyNextLoanIdentifierMutation, { data, loading, error }] = useGetCompanyNextLoanIdentifierMutation({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      increment: // value for 'increment'
 *   },
 * });
 */
export function useGetCompanyNextLoanIdentifierMutation(
  baseOptions?: Apollo.MutationHookOptions<
    GetCompanyNextLoanIdentifierMutation,
    GetCompanyNextLoanIdentifierMutationVariables
  >
) {
  return Apollo.useMutation<
    GetCompanyNextLoanIdentifierMutation,
    GetCompanyNextLoanIdentifierMutationVariables
  >(GetCompanyNextLoanIdentifierDocument, baseOptions);
}
export type GetCompanyNextLoanIdentifierMutationHookResult = ReturnType<
  typeof useGetCompanyNextLoanIdentifierMutation
>;
export type GetCompanyNextLoanIdentifierMutationResult = Apollo.MutationResult<GetCompanyNextLoanIdentifierMutation>;
export type GetCompanyNextLoanIdentifierMutationOptions = Apollo.BaseMutationOptions<
  GetCompanyNextLoanIdentifierMutation,
  GetCompanyNextLoanIdentifierMutationVariables
>;
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
      contract {
        ...Contract
      }
    }
  }
  ${CompanyFragmentDoc}
  ${BankAccountFragmentDoc}
  ${CompanySettingsFragmentDoc}
  ${ContractFragmentDoc}
`;

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
export function useCompanyQuery(
  baseOptions: Apollo.QueryHookOptions<CompanyQuery, CompanyQueryVariables>
) {
  return Apollo.useQuery<CompanyQuery, CompanyQueryVariables>(
    CompanyDocument,
    baseOptions
  );
}
export function useCompanyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CompanyQuery, CompanyQueryVariables>
) {
  return Apollo.useLazyQuery<CompanyQuery, CompanyQueryVariables>(
    CompanyDocument,
    baseOptions
  );
}
export type CompanyQueryHookResult = ReturnType<typeof useCompanyQuery>;
export type CompanyLazyQueryHookResult = ReturnType<typeof useCompanyLazyQuery>;
export type CompanyQueryResult = Apollo.QueryResult<
  CompanyQuery,
  CompanyQueryVariables
>;
export const CompanyForCustomerDocument = gql`
  query CompanyForCustomer($companyId: uuid!) {
    companies_by_pk(id: $companyId) {
      id
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
      contract {
        ...Contract
      }
    }
  }
  ${CompanyFragmentDoc}
  ${BankAccountFragmentDoc}
  ${CompanySettingsForCustomerFragmentDoc}
  ${ContractFragmentDoc}
`;

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
export function useCompanyForCustomerQuery(
  baseOptions: Apollo.QueryHookOptions<
    CompanyForCustomerQuery,
    CompanyForCustomerQueryVariables
  >
) {
  return Apollo.useQuery<
    CompanyForCustomerQuery,
    CompanyForCustomerQueryVariables
  >(CompanyForCustomerDocument, baseOptions);
}
export function useCompanyForCustomerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CompanyForCustomerQuery,
    CompanyForCustomerQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    CompanyForCustomerQuery,
    CompanyForCustomerQueryVariables
  >(CompanyForCustomerDocument, baseOptions);
}
export type CompanyForCustomerQueryHookResult = ReturnType<
  typeof useCompanyForCustomerQuery
>;
export type CompanyForCustomerLazyQueryHookResult = ReturnType<
  typeof useCompanyForCustomerLazyQuery
>;
export type CompanyForCustomerQueryResult = Apollo.QueryResult<
  CompanyForCustomerQuery,
  CompanyForCustomerQueryVariables
>;
export const UpdateCompanyProfileDocument = gql`
  mutation UpdateCompanyProfile($id: uuid!, $company: companies_set_input!) {
    update_companies_by_pk(pk_columns: { id: $id }, _set: $company) {
      ...Company
    }
  }
  ${CompanyFragmentDoc}
`;
export type UpdateCompanyProfileMutationFn = Apollo.MutationFunction<
  UpdateCompanyProfileMutation,
  UpdateCompanyProfileMutationVariables
>;

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
export function useUpdateCompanyProfileMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCompanyProfileMutation,
    UpdateCompanyProfileMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateCompanyProfileMutation,
    UpdateCompanyProfileMutationVariables
  >(UpdateCompanyProfileDocument, baseOptions);
}
export type UpdateCompanyProfileMutationHookResult = ReturnType<
  typeof useUpdateCompanyProfileMutation
>;
export type UpdateCompanyProfileMutationResult = Apollo.MutationResult<UpdateCompanyProfileMutation>;
export type UpdateCompanyProfileMutationOptions = Apollo.BaseMutationOptions<
  UpdateCompanyProfileMutation,
  UpdateCompanyProfileMutationVariables
>;
export const AddCompanyBankAccountDocument = gql`
  mutation AddCompanyBankAccount($bankAccount: bank_accounts_insert_input!) {
    insert_bank_accounts_one(object: $bankAccount) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;
export type AddCompanyBankAccountMutationFn = Apollo.MutationFunction<
  AddCompanyBankAccountMutation,
  AddCompanyBankAccountMutationVariables
>;

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
export function useAddCompanyBankAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddCompanyBankAccountMutation,
    AddCompanyBankAccountMutationVariables
  >
) {
  return Apollo.useMutation<
    AddCompanyBankAccountMutation,
    AddCompanyBankAccountMutationVariables
  >(AddCompanyBankAccountDocument, baseOptions);
}
export type AddCompanyBankAccountMutationHookResult = ReturnType<
  typeof useAddCompanyBankAccountMutation
>;
export type AddCompanyBankAccountMutationResult = Apollo.MutationResult<AddCompanyBankAccountMutation>;
export type AddCompanyBankAccountMutationOptions = Apollo.BaseMutationOptions<
  AddCompanyBankAccountMutation,
  AddCompanyBankAccountMutationVariables
>;
export const UpdateCompanyBankAccountDocument = gql`
  mutation UpdateCompanyBankAccount(
    $id: uuid!
    $bankAccount: bank_accounts_set_input!
  ) {
    update_bank_accounts_by_pk(pk_columns: { id: $id }, _set: $bankAccount) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;
export type UpdateCompanyBankAccountMutationFn = Apollo.MutationFunction<
  UpdateCompanyBankAccountMutation,
  UpdateCompanyBankAccountMutationVariables
>;

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
export function useUpdateCompanyBankAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCompanyBankAccountMutation,
    UpdateCompanyBankAccountMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateCompanyBankAccountMutation,
    UpdateCompanyBankAccountMutationVariables
  >(UpdateCompanyBankAccountDocument, baseOptions);
}
export type UpdateCompanyBankAccountMutationHookResult = ReturnType<
  typeof useUpdateCompanyBankAccountMutation
>;
export type UpdateCompanyBankAccountMutationResult = Apollo.MutationResult<UpdateCompanyBankAccountMutation>;
export type UpdateCompanyBankAccountMutationOptions = Apollo.BaseMutationOptions<
  UpdateCompanyBankAccountMutation,
  UpdateCompanyBankAccountMutationVariables
>;
export const EbbaApplicationDocument = gql`
  query EbbaApplication($id: uuid!) {
    ebba_applications_by_pk(id: $id) {
      id
      ...EbbaApplication
      company {
        id
        name
      }
      ebba_application_files {
        ...EbbaApplicationFile
      }
    }
  }
  ${EbbaApplicationFragmentDoc}
  ${EbbaApplicationFileFragmentDoc}
`;

/**
 * __useEbbaApplicationQuery__
 *
 * To run a query within a React component, call `useEbbaApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useEbbaApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEbbaApplicationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEbbaApplicationQuery(
  baseOptions: Apollo.QueryHookOptions<
    EbbaApplicationQuery,
    EbbaApplicationQueryVariables
  >
) {
  return Apollo.useQuery<EbbaApplicationQuery, EbbaApplicationQueryVariables>(
    EbbaApplicationDocument,
    baseOptions
  );
}
export function useEbbaApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EbbaApplicationQuery,
    EbbaApplicationQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    EbbaApplicationQuery,
    EbbaApplicationQueryVariables
  >(EbbaApplicationDocument, baseOptions);
}
export type EbbaApplicationQueryHookResult = ReturnType<
  typeof useEbbaApplicationQuery
>;
export type EbbaApplicationLazyQueryHookResult = ReturnType<
  typeof useEbbaApplicationLazyQuery
>;
export type EbbaApplicationQueryResult = Apollo.QueryResult<
  EbbaApplicationQuery,
  EbbaApplicationQueryVariables
>;
export const AddEbbaApplicationDocument = gql`
  mutation AddEbbaApplication(
    $ebbaApplication: ebba_applications_insert_input!
  ) {
    insert_ebba_applications_one(object: $ebbaApplication) {
      id
      ...EbbaApplication
    }
  }
  ${EbbaApplicationFragmentDoc}
`;
export type AddEbbaApplicationMutationFn = Apollo.MutationFunction<
  AddEbbaApplicationMutation,
  AddEbbaApplicationMutationVariables
>;

/**
 * __useAddEbbaApplicationMutation__
 *
 * To run a mutation, you first call `useAddEbbaApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddEbbaApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addEbbaApplicationMutation, { data, loading, error }] = useAddEbbaApplicationMutation({
 *   variables: {
 *      ebbaApplication: // value for 'ebbaApplication'
 *   },
 * });
 */
export function useAddEbbaApplicationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddEbbaApplicationMutation,
    AddEbbaApplicationMutationVariables
  >
) {
  return Apollo.useMutation<
    AddEbbaApplicationMutation,
    AddEbbaApplicationMutationVariables
  >(AddEbbaApplicationDocument, baseOptions);
}
export type AddEbbaApplicationMutationHookResult = ReturnType<
  typeof useAddEbbaApplicationMutation
>;
export type AddEbbaApplicationMutationResult = Apollo.MutationResult<AddEbbaApplicationMutation>;
export type AddEbbaApplicationMutationOptions = Apollo.BaseMutationOptions<
  AddEbbaApplicationMutation,
  AddEbbaApplicationMutationVariables
>;
export const EbbaApplicationsDocument = gql`
  query EbbaApplications {
    ebba_applications(
      order_by: [{ application_month: desc }, { created_at: desc }]
    ) {
      id
      ...EbbaApplication
      company {
        id
        name
      }
    }
  }
  ${EbbaApplicationFragmentDoc}
`;

/**
 * __useEbbaApplicationsQuery__
 *
 * To run a query within a React component, call `useEbbaApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEbbaApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEbbaApplicationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useEbbaApplicationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    EbbaApplicationsQuery,
    EbbaApplicationsQueryVariables
  >
) {
  return Apollo.useQuery<EbbaApplicationsQuery, EbbaApplicationsQueryVariables>(
    EbbaApplicationsDocument,
    baseOptions
  );
}
export function useEbbaApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EbbaApplicationsQuery,
    EbbaApplicationsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    EbbaApplicationsQuery,
    EbbaApplicationsQueryVariables
  >(EbbaApplicationsDocument, baseOptions);
}
export type EbbaApplicationsQueryHookResult = ReturnType<
  typeof useEbbaApplicationsQuery
>;
export type EbbaApplicationsLazyQueryHookResult = ReturnType<
  typeof useEbbaApplicationsLazyQuery
>;
export type EbbaApplicationsQueryResult = Apollo.QueryResult<
  EbbaApplicationsQuery,
  EbbaApplicationsQueryVariables
>;
export const EbbaApplicationsByCompanyIdDocument = gql`
  query EbbaApplicationsByCompanyId($companyId: uuid!) {
    ebba_applications(
      where: { company_id: { _eq: $companyId } }
      order_by: [{ application_month: desc }, { created_at: desc }]
    ) {
      id
      ...EbbaApplication
    }
  }
  ${EbbaApplicationFragmentDoc}
`;

/**
 * __useEbbaApplicationsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useEbbaApplicationsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useEbbaApplicationsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEbbaApplicationsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useEbbaApplicationsByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    EbbaApplicationsByCompanyIdQuery,
    EbbaApplicationsByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    EbbaApplicationsByCompanyIdQuery,
    EbbaApplicationsByCompanyIdQueryVariables
  >(EbbaApplicationsByCompanyIdDocument, baseOptions);
}
export function useEbbaApplicationsByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EbbaApplicationsByCompanyIdQuery,
    EbbaApplicationsByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    EbbaApplicationsByCompanyIdQuery,
    EbbaApplicationsByCompanyIdQueryVariables
  >(EbbaApplicationsByCompanyIdDocument, baseOptions);
}
export type EbbaApplicationsByCompanyIdQueryHookResult = ReturnType<
  typeof useEbbaApplicationsByCompanyIdQuery
>;
export type EbbaApplicationsByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useEbbaApplicationsByCompanyIdLazyQuery
>;
export type EbbaApplicationsByCompanyIdQueryResult = Apollo.QueryResult<
  EbbaApplicationsByCompanyIdQuery,
  EbbaApplicationsByCompanyIdQueryVariables
>;
export const GetLoanDocument = gql`
  query GetLoan($id: uuid!) {
    loans_by_pk(id: $id) {
      ...Loan
    }
  }
  ${LoanFragmentDoc}
`;

/**
 * __useGetLoanQuery__
 *
 * To run a query within a React component, call `useGetLoanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoanQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLoanQuery(
  baseOptions: Apollo.QueryHookOptions<GetLoanQuery, GetLoanQueryVariables>
) {
  return Apollo.useQuery<GetLoanQuery, GetLoanQueryVariables>(
    GetLoanDocument,
    baseOptions
  );
}
export function useGetLoanLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetLoanQuery, GetLoanQueryVariables>
) {
  return Apollo.useLazyQuery<GetLoanQuery, GetLoanQueryVariables>(
    GetLoanDocument,
    baseOptions
  );
}
export type GetLoanQueryHookResult = ReturnType<typeof useGetLoanQuery>;
export type GetLoanLazyQueryHookResult = ReturnType<typeof useGetLoanLazyQuery>;
export type GetLoanQueryResult = Apollo.QueryResult<
  GetLoanQuery,
  GetLoanQueryVariables
>;
export const GetLoanForCustomerDocument = gql`
  query GetLoanForCustomer($id: uuid!) {
    loans_by_pk(id: $id) {
      ...LoanLimited
    }
  }
  ${LoanLimitedFragmentDoc}
`;

/**
 * __useGetLoanForCustomerQuery__
 *
 * To run a query within a React component, call `useGetLoanForCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoanForCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoanForCustomerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLoanForCustomerQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLoanForCustomerQuery,
    GetLoanForCustomerQueryVariables
  >
) {
  return Apollo.useQuery<
    GetLoanForCustomerQuery,
    GetLoanForCustomerQueryVariables
  >(GetLoanForCustomerDocument, baseOptions);
}
export function useGetLoanForCustomerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLoanForCustomerQuery,
    GetLoanForCustomerQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetLoanForCustomerQuery,
    GetLoanForCustomerQueryVariables
  >(GetLoanForCustomerDocument, baseOptions);
}
export type GetLoanForCustomerQueryHookResult = ReturnType<
  typeof useGetLoanForCustomerQuery
>;
export type GetLoanForCustomerLazyQueryHookResult = ReturnType<
  typeof useGetLoanForCustomerLazyQuery
>;
export type GetLoanForCustomerQueryResult = Apollo.QueryResult<
  GetLoanForCustomerQuery,
  GetLoanForCustomerQueryVariables
>;
export const GetLoanWithArtifactForCustomerDocument = gql`
  query GetLoanWithArtifactForCustomer($id: uuid!) {
    loans_by_pk(id: $id) {
      ...LoanLimited
      company {
        id
        name
      }
      line_of_credit {
        id
        ...LineOfCredit
      }
      purchase_order {
        id
        ...PurchaseOrder
      }
    }
  }
  ${LoanLimitedFragmentDoc}
  ${LineOfCreditFragmentDoc}
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useGetLoanWithArtifactForCustomerQuery__
 *
 * To run a query within a React component, call `useGetLoanWithArtifactForCustomerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoanWithArtifactForCustomerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoanWithArtifactForCustomerQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLoanWithArtifactForCustomerQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLoanWithArtifactForCustomerQuery,
    GetLoanWithArtifactForCustomerQueryVariables
  >
) {
  return Apollo.useQuery<
    GetLoanWithArtifactForCustomerQuery,
    GetLoanWithArtifactForCustomerQueryVariables
  >(GetLoanWithArtifactForCustomerDocument, baseOptions);
}
export function useGetLoanWithArtifactForCustomerLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLoanWithArtifactForCustomerQuery,
    GetLoanWithArtifactForCustomerQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetLoanWithArtifactForCustomerQuery,
    GetLoanWithArtifactForCustomerQueryVariables
  >(GetLoanWithArtifactForCustomerDocument, baseOptions);
}
export type GetLoanWithArtifactForCustomerQueryHookResult = ReturnType<
  typeof useGetLoanWithArtifactForCustomerQuery
>;
export type GetLoanWithArtifactForCustomerLazyQueryHookResult = ReturnType<
  typeof useGetLoanWithArtifactForCustomerLazyQuery
>;
export type GetLoanWithArtifactForCustomerQueryResult = Apollo.QueryResult<
  GetLoanWithArtifactForCustomerQuery,
  GetLoanWithArtifactForCustomerQueryVariables
>;
export const AddLoanDocument = gql`
  mutation AddLoan($loan: loans_insert_input!) {
    insert_loans_one(object: $loan) {
      ...LoanLimited
    }
  }
  ${LoanLimitedFragmentDoc}
`;
export type AddLoanMutationFn = Apollo.MutationFunction<
  AddLoanMutation,
  AddLoanMutationVariables
>;

/**
 * __useAddLoanMutation__
 *
 * To run a mutation, you first call `useAddLoanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddLoanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addLoanMutation, { data, loading, error }] = useAddLoanMutation({
 *   variables: {
 *      loan: // value for 'loan'
 *   },
 * });
 */
export function useAddLoanMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddLoanMutation,
    AddLoanMutationVariables
  >
) {
  return Apollo.useMutation<AddLoanMutation, AddLoanMutationVariables>(
    AddLoanDocument,
    baseOptions
  );
}
export type AddLoanMutationHookResult = ReturnType<typeof useAddLoanMutation>;
export type AddLoanMutationResult = Apollo.MutationResult<AddLoanMutation>;
export type AddLoanMutationOptions = Apollo.BaseMutationOptions<
  AddLoanMutation,
  AddLoanMutationVariables
>;
export const UpdateLoanDocument = gql`
  mutation UpdateLoan($id: uuid!, $loan: loans_set_input!) {
    update_loans_by_pk(pk_columns: { id: $id }, _set: $loan) {
      ...LoanLimited
    }
  }
  ${LoanLimitedFragmentDoc}
`;
export type UpdateLoanMutationFn = Apollo.MutationFunction<
  UpdateLoanMutation,
  UpdateLoanMutationVariables
>;

/**
 * __useUpdateLoanMutation__
 *
 * To run a mutation, you first call `useUpdateLoanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLoanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLoanMutation, { data, loading, error }] = useUpdateLoanMutation({
 *   variables: {
 *      id: // value for 'id'
 *      loan: // value for 'loan'
 *   },
 * });
 */
export function useUpdateLoanMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateLoanMutation,
    UpdateLoanMutationVariables
  >
) {
  return Apollo.useMutation<UpdateLoanMutation, UpdateLoanMutationVariables>(
    UpdateLoanDocument,
    baseOptions
  );
}
export type UpdateLoanMutationHookResult = ReturnType<
  typeof useUpdateLoanMutation
>;
export type UpdateLoanMutationResult = Apollo.MutationResult<UpdateLoanMutation>;
export type UpdateLoanMutationOptions = Apollo.BaseMutationOptions<
  UpdateLoanMutation,
  UpdateLoanMutationVariables
>;
export const PurchaseOrderDocument = gql`
  query PurchaseOrder($id: uuid!) {
    purchase_orders_by_pk(id: $id) {
      ...PurchaseOrder
      loans(where: { loan_type: { _eq: purchase_order } }) {
        id
        ...LoanLimited
      }
      purchase_order_files {
        ...PurchaseOrderFile
      }
    }
  }
  ${PurchaseOrderFragmentDoc}
  ${LoanLimitedFragmentDoc}
  ${PurchaseOrderFileFragmentDoc}
`;

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
export function usePurchaseOrderQuery(
  baseOptions: Apollo.QueryHookOptions<
    PurchaseOrderQuery,
    PurchaseOrderQueryVariables
  >
) {
  return Apollo.useQuery<PurchaseOrderQuery, PurchaseOrderQueryVariables>(
    PurchaseOrderDocument,
    baseOptions
  );
}
export function usePurchaseOrderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PurchaseOrderQuery,
    PurchaseOrderQueryVariables
  >
) {
  return Apollo.useLazyQuery<PurchaseOrderQuery, PurchaseOrderQueryVariables>(
    PurchaseOrderDocument,
    baseOptions
  );
}
export type PurchaseOrderQueryHookResult = ReturnType<
  typeof usePurchaseOrderQuery
>;
export type PurchaseOrderLazyQueryHookResult = ReturnType<
  typeof usePurchaseOrderLazyQuery
>;
export type PurchaseOrderQueryResult = Apollo.QueryResult<
  PurchaseOrderQuery,
  PurchaseOrderQueryVariables
>;
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
      vendor {
        id
        name
      }
    }
  }
  ${PurchaseOrderFileFragmentDoc}
`;

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
export function usePurchaseOrderForReviewQuery(
  baseOptions: Apollo.QueryHookOptions<
    PurchaseOrderForReviewQuery,
    PurchaseOrderForReviewQueryVariables
  >
) {
  return Apollo.useQuery<
    PurchaseOrderForReviewQuery,
    PurchaseOrderForReviewQueryVariables
  >(PurchaseOrderForReviewDocument, baseOptions);
}
export function usePurchaseOrderForReviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PurchaseOrderForReviewQuery,
    PurchaseOrderForReviewQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    PurchaseOrderForReviewQuery,
    PurchaseOrderForReviewQueryVariables
  >(PurchaseOrderForReviewDocument, baseOptions);
}
export type PurchaseOrderForReviewQueryHookResult = ReturnType<
  typeof usePurchaseOrderForReviewQuery
>;
export type PurchaseOrderForReviewLazyQueryHookResult = ReturnType<
  typeof usePurchaseOrderForReviewLazyQuery
>;
export type PurchaseOrderForReviewQueryResult = Apollo.QueryResult<
  PurchaseOrderForReviewQuery,
  PurchaseOrderForReviewQueryVariables
>;
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
  ${PurchaseOrderFileFragmentDoc}
`;
export type AddPurchaseOrderMutationFn = Apollo.MutationFunction<
  AddPurchaseOrderMutation,
  AddPurchaseOrderMutationVariables
>;

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
export function useAddPurchaseOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddPurchaseOrderMutation,
    AddPurchaseOrderMutationVariables
  >
) {
  return Apollo.useMutation<
    AddPurchaseOrderMutation,
    AddPurchaseOrderMutationVariables
  >(AddPurchaseOrderDocument, baseOptions);
}
export type AddPurchaseOrderMutationHookResult = ReturnType<
  typeof useAddPurchaseOrderMutation
>;
export type AddPurchaseOrderMutationResult = Apollo.MutationResult<AddPurchaseOrderMutation>;
export type AddPurchaseOrderMutationOptions = Apollo.BaseMutationOptions<
  AddPurchaseOrderMutation,
  AddPurchaseOrderMutationVariables
>;
export const UpdatePurchaseOrderDocument = gql`
  mutation UpdatePurchaseOrder(
    $id: uuid!
    $purchaseOrder: purchase_orders_set_input!
    $purchaseOrderFiles: [purchase_order_files_insert_input!]!
  ) {
    delete_purchase_order_files(where: { purchase_order_id: { _eq: $id } }) {
      affected_rows
    }
    insert_purchase_order_files(objects: $purchaseOrderFiles) {
      returning {
        purchase_order_id
        file_id
      }
    }
    update_purchase_orders_by_pk(
      pk_columns: { id: $id }
      _set: $purchaseOrder
    ) {
      ...PurchaseOrder
      purchase_order_files {
        ...PurchaseOrderFile
      }
    }
  }
  ${PurchaseOrderFragmentDoc}
  ${PurchaseOrderFileFragmentDoc}
`;
export type UpdatePurchaseOrderMutationFn = Apollo.MutationFunction<
  UpdatePurchaseOrderMutation,
  UpdatePurchaseOrderMutationVariables
>;

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
export function useUpdatePurchaseOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePurchaseOrderMutation,
    UpdatePurchaseOrderMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdatePurchaseOrderMutation,
    UpdatePurchaseOrderMutationVariables
  >(UpdatePurchaseOrderDocument, baseOptions);
}
export type UpdatePurchaseOrderMutationHookResult = ReturnType<
  typeof useUpdatePurchaseOrderMutation
>;
export type UpdatePurchaseOrderMutationResult = Apollo.MutationResult<UpdatePurchaseOrderMutation>;
export type UpdatePurchaseOrderMutationOptions = Apollo.BaseMutationOptions<
  UpdatePurchaseOrderMutation,
  UpdatePurchaseOrderMutationVariables
>;
export const VendorsByPartnerCompanyDocument = gql`
  query VendorsByPartnerCompany($companyId: uuid!) {
    vendors(
      where: {
        company_vendor_partnerships: { company_id: { _eq: $companyId } }
      }
    ) {
      id
      ...VendorLimited
      company_vendor_partnerships {
        id
        approved_at
      }
    }
  }
  ${VendorLimitedFragmentDoc}
`;

/**
 * __useVendorsByPartnerCompanyQuery__
 *
 * To run a query within a React component, call `useVendorsByPartnerCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useVendorsByPartnerCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVendorsByPartnerCompanyQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useVendorsByPartnerCompanyQuery(
  baseOptions: Apollo.QueryHookOptions<
    VendorsByPartnerCompanyQuery,
    VendorsByPartnerCompanyQueryVariables
  >
) {
  return Apollo.useQuery<
    VendorsByPartnerCompanyQuery,
    VendorsByPartnerCompanyQueryVariables
  >(VendorsByPartnerCompanyDocument, baseOptions);
}
export function useVendorsByPartnerCompanyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    VendorsByPartnerCompanyQuery,
    VendorsByPartnerCompanyQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    VendorsByPartnerCompanyQuery,
    VendorsByPartnerCompanyQueryVariables
  >(VendorsByPartnerCompanyDocument, baseOptions);
}
export type VendorsByPartnerCompanyQueryHookResult = ReturnType<
  typeof useVendorsByPartnerCompanyQuery
>;
export type VendorsByPartnerCompanyLazyQueryHookResult = ReturnType<
  typeof useVendorsByPartnerCompanyLazyQuery
>;
export type VendorsByPartnerCompanyQueryResult = Apollo.QueryResult<
  VendorsByPartnerCompanyQuery,
  VendorsByPartnerCompanyQueryVariables
>;
export const ApprovedVendorsByPartnerCompanyIdDocument = gql`
  query ApprovedVendorsByPartnerCompanyId($companyId: uuid!) {
    vendors(
      where: {
        company_vendor_partnerships: {
          _and: [
            { company_id: { _eq: $companyId } }
            { approved_at: { _is_null: false } }
          ]
        }
      }
    ) {
      id
      ...VendorLimited
      company_vendor_partnerships {
        id
        approved_at
      }
    }
  }
  ${VendorLimitedFragmentDoc}
`;

/**
 * __useApprovedVendorsByPartnerCompanyIdQuery__
 *
 * To run a query within a React component, call `useApprovedVendorsByPartnerCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useApprovedVendorsByPartnerCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApprovedVendorsByPartnerCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useApprovedVendorsByPartnerCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    ApprovedVendorsByPartnerCompanyIdQuery,
    ApprovedVendorsByPartnerCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    ApprovedVendorsByPartnerCompanyIdQuery,
    ApprovedVendorsByPartnerCompanyIdQueryVariables
  >(ApprovedVendorsByPartnerCompanyIdDocument, baseOptions);
}
export function useApprovedVendorsByPartnerCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ApprovedVendorsByPartnerCompanyIdQuery,
    ApprovedVendorsByPartnerCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    ApprovedVendorsByPartnerCompanyIdQuery,
    ApprovedVendorsByPartnerCompanyIdQueryVariables
  >(ApprovedVendorsByPartnerCompanyIdDocument, baseOptions);
}
export type ApprovedVendorsByPartnerCompanyIdQueryHookResult = ReturnType<
  typeof useApprovedVendorsByPartnerCompanyIdQuery
>;
export type ApprovedVendorsByPartnerCompanyIdLazyQueryHookResult = ReturnType<
  typeof useApprovedVendorsByPartnerCompanyIdLazyQuery
>;
export type ApprovedVendorsByPartnerCompanyIdQueryResult = Apollo.QueryResult<
  ApprovedVendorsByPartnerCompanyIdQuery,
  ApprovedVendorsByPartnerCompanyIdQueryVariables
>;
export const CompanyVendorPartnershipForVendorDocument = gql`
  query CompanyVendorPartnershipForVendor($companyId: uuid!, $vendorId: uuid!) {
    company_vendor_partnerships(
      where: {
        _and: [
          { company_id: { _eq: $companyId } }
          { vendor_id: { _eq: $vendorId } }
        ]
      }
    ) {
      id
      vendor_bank_account {
        ...BankAccountForVendor
      }
    }
  }
  ${BankAccountForVendorFragmentDoc}
`;

/**
 * __useCompanyVendorPartnershipForVendorQuery__
 *
 * To run a query within a React component, call `useCompanyVendorPartnershipForVendorQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyVendorPartnershipForVendorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyVendorPartnershipForVendorQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      vendorId: // value for 'vendorId'
 *   },
 * });
 */
export function useCompanyVendorPartnershipForVendorQuery(
  baseOptions: Apollo.QueryHookOptions<
    CompanyVendorPartnershipForVendorQuery,
    CompanyVendorPartnershipForVendorQueryVariables
  >
) {
  return Apollo.useQuery<
    CompanyVendorPartnershipForVendorQuery,
    CompanyVendorPartnershipForVendorQueryVariables
  >(CompanyVendorPartnershipForVendorDocument, baseOptions);
}
export function useCompanyVendorPartnershipForVendorLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CompanyVendorPartnershipForVendorQuery,
    CompanyVendorPartnershipForVendorQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    CompanyVendorPartnershipForVendorQuery,
    CompanyVendorPartnershipForVendorQueryVariables
  >(CompanyVendorPartnershipForVendorDocument, baseOptions);
}
export type CompanyVendorPartnershipForVendorQueryHookResult = ReturnType<
  typeof useCompanyVendorPartnershipForVendorQuery
>;
export type CompanyVendorPartnershipForVendorLazyQueryHookResult = ReturnType<
  typeof useCompanyVendorPartnershipForVendorLazyQuery
>;
export type CompanyVendorPartnershipForVendorQueryResult = Apollo.QueryResult<
  CompanyVendorPartnershipForVendorQuery,
  CompanyVendorPartnershipForVendorQueryVariables
>;
export const GetPurchaseOrdersDocument = gql`
  query GetPurchaseOrders {
    purchase_orders {
      id
      ...PurchaseOrder
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useGetPurchaseOrdersQuery__
 *
 * To run a query within a React component, call `useGetPurchaseOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPurchaseOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPurchaseOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPurchaseOrdersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetPurchaseOrdersQuery,
    GetPurchaseOrdersQueryVariables
  >
) {
  return Apollo.useQuery<
    GetPurchaseOrdersQuery,
    GetPurchaseOrdersQueryVariables
  >(GetPurchaseOrdersDocument, baseOptions);
}
export function useGetPurchaseOrdersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPurchaseOrdersQuery,
    GetPurchaseOrdersQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetPurchaseOrdersQuery,
    GetPurchaseOrdersQueryVariables
  >(GetPurchaseOrdersDocument, baseOptions);
}
export type GetPurchaseOrdersQueryHookResult = ReturnType<
  typeof useGetPurchaseOrdersQuery
>;
export type GetPurchaseOrdersLazyQueryHookResult = ReturnType<
  typeof useGetPurchaseOrdersLazyQuery
>;
export type GetPurchaseOrdersQueryResult = Apollo.QueryResult<
  GetPurchaseOrdersQuery,
  GetPurchaseOrdersQueryVariables
>;
export const PurchaseOrdersByCompanyIdDocument = gql`
  query PurchaseOrdersByCompanyId($company_id: uuid!) {
    purchase_orders(where: { company_id: { _eq: $company_id } }) {
      ...PurchaseOrder
      company {
        id
        name
      }
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __usePurchaseOrdersByCompanyIdQuery__
 *
 * To run a query within a React component, call `usePurchaseOrdersByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `usePurchaseOrdersByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePurchaseOrdersByCompanyIdQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function usePurchaseOrdersByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    PurchaseOrdersByCompanyIdQuery,
    PurchaseOrdersByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    PurchaseOrdersByCompanyIdQuery,
    PurchaseOrdersByCompanyIdQueryVariables
  >(PurchaseOrdersByCompanyIdDocument, baseOptions);
}
export function usePurchaseOrdersByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PurchaseOrdersByCompanyIdQuery,
    PurchaseOrdersByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    PurchaseOrdersByCompanyIdQuery,
    PurchaseOrdersByCompanyIdQueryVariables
  >(PurchaseOrdersByCompanyIdDocument, baseOptions);
}
export type PurchaseOrdersByCompanyIdQueryHookResult = ReturnType<
  typeof usePurchaseOrdersByCompanyIdQuery
>;
export type PurchaseOrdersByCompanyIdLazyQueryHookResult = ReturnType<
  typeof usePurchaseOrdersByCompanyIdLazyQuery
>;
export type PurchaseOrdersByCompanyIdQueryResult = Apollo.QueryResult<
  PurchaseOrdersByCompanyIdQuery,
  PurchaseOrdersByCompanyIdQueryVariables
>;
export const ApprovedPurchaseOrdersDocument = gql`
  query ApprovedPurchaseOrders {
    purchase_orders(where: { status: { _eq: approved } }) {
      ...PurchaseOrder
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useApprovedPurchaseOrdersQuery__
 *
 * To run a query within a React component, call `useApprovedPurchaseOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useApprovedPurchaseOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApprovedPurchaseOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useApprovedPurchaseOrdersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ApprovedPurchaseOrdersQuery,
    ApprovedPurchaseOrdersQueryVariables
  >
) {
  return Apollo.useQuery<
    ApprovedPurchaseOrdersQuery,
    ApprovedPurchaseOrdersQueryVariables
  >(ApprovedPurchaseOrdersDocument, baseOptions);
}
export function useApprovedPurchaseOrdersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ApprovedPurchaseOrdersQuery,
    ApprovedPurchaseOrdersQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    ApprovedPurchaseOrdersQuery,
    ApprovedPurchaseOrdersQueryVariables
  >(ApprovedPurchaseOrdersDocument, baseOptions);
}
export type ApprovedPurchaseOrdersQueryHookResult = ReturnType<
  typeof useApprovedPurchaseOrdersQuery
>;
export type ApprovedPurchaseOrdersLazyQueryHookResult = ReturnType<
  typeof useApprovedPurchaseOrdersLazyQuery
>;
export type ApprovedPurchaseOrdersQueryResult = Apollo.QueryResult<
  ApprovedPurchaseOrdersQuery,
  ApprovedPurchaseOrdersQueryVariables
>;
export const ContractDocument = gql`
  query Contract($id: uuid!) {
    contracts_by_pk(id: $id) {
      id
      ...Contract
    }
  }
  ${ContractFragmentDoc}
`;

/**
 * __useContractQuery__
 *
 * To run a query within a React component, call `useContractQuery` and pass it any options that fit your needs.
 * When your component renders, `useContractQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContractQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useContractQuery(
  baseOptions: Apollo.QueryHookOptions<ContractQuery, ContractQueryVariables>
) {
  return Apollo.useQuery<ContractQuery, ContractQueryVariables>(
    ContractDocument,
    baseOptions
  );
}
export function useContractLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ContractQuery,
    ContractQueryVariables
  >
) {
  return Apollo.useLazyQuery<ContractQuery, ContractQueryVariables>(
    ContractDocument,
    baseOptions
  );
}
export type ContractQueryHookResult = ReturnType<typeof useContractQuery>;
export type ContractLazyQueryHookResult = ReturnType<
  typeof useContractLazyQuery
>;
export type ContractQueryResult = Apollo.QueryResult<
  ContractQuery,
  ContractQueryVariables
>;
export const AddContractDocument = gql`
  mutation AddContract($contract: contracts_insert_input!) {
    insert_contracts_one(object: $contract) {
      id
      ...Contract
    }
  }
  ${ContractFragmentDoc}
`;
export type AddContractMutationFn = Apollo.MutationFunction<
  AddContractMutation,
  AddContractMutationVariables
>;

/**
 * __useAddContractMutation__
 *
 * To run a mutation, you first call `useAddContractMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddContractMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addContractMutation, { data, loading, error }] = useAddContractMutation({
 *   variables: {
 *      contract: // value for 'contract'
 *   },
 * });
 */
export function useAddContractMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddContractMutation,
    AddContractMutationVariables
  >
) {
  return Apollo.useMutation<AddContractMutation, AddContractMutationVariables>(
    AddContractDocument,
    baseOptions
  );
}
export type AddContractMutationHookResult = ReturnType<
  typeof useAddContractMutation
>;
export type AddContractMutationResult = Apollo.MutationResult<AddContractMutation>;
export type AddContractMutationOptions = Apollo.BaseMutationOptions<
  AddContractMutation,
  AddContractMutationVariables
>;
export const UpdateContractDocument = gql`
  mutation UpdateContract($contractId: uuid!, $contract: contracts_set_input!) {
    update_contracts_by_pk(pk_columns: { id: $contractId }, _set: $contract) {
      id
      ...Contract
    }
  }
  ${ContractFragmentDoc}
`;
export type UpdateContractMutationFn = Apollo.MutationFunction<
  UpdateContractMutation,
  UpdateContractMutationVariables
>;

/**
 * __useUpdateContractMutation__
 *
 * To run a mutation, you first call `useUpdateContractMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateContractMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateContractMutation, { data, loading, error }] = useUpdateContractMutation({
 *   variables: {
 *      contractId: // value for 'contractId'
 *      contract: // value for 'contract'
 *   },
 * });
 */
export function useUpdateContractMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateContractMutation,
    UpdateContractMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateContractMutation,
    UpdateContractMutationVariables
  >(UpdateContractDocument, baseOptions);
}
export type UpdateContractMutationHookResult = ReturnType<
  typeof useUpdateContractMutation
>;
export type UpdateContractMutationResult = Apollo.MutationResult<UpdateContractMutation>;
export type UpdateContractMutationOptions = Apollo.BaseMutationOptions<
  UpdateContractMutation,
  UpdateContractMutationVariables
>;
export const UpdateCompanySettingsDocument = gql`
  mutation UpdateCompanySettings(
    $companyId: uuid!
    $companySettingsId: uuid!
    $vendorAgreementTemplateLink: String
    $contractId: uuid!
  ) {
    update_company_settings_by_pk(
      pk_columns: { id: $companySettingsId }
      _set: { vendor_agreement_docusign_template: $vendorAgreementTemplateLink }
    ) {
      ...CompanySettings
    }
    update_companies_by_pk(
      pk_columns: { id: $companyId }
      _set: { contract_id: $contractId }
    ) {
      ...Company
    }
  }
  ${CompanySettingsFragmentDoc}
  ${CompanyFragmentDoc}
`;
export type UpdateCompanySettingsMutationFn = Apollo.MutationFunction<
  UpdateCompanySettingsMutation,
  UpdateCompanySettingsMutationVariables
>;

/**
 * __useUpdateCompanySettingsMutation__
 *
 * To run a mutation, you first call `useUpdateCompanySettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanySettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanySettingsMutation, { data, loading, error }] = useUpdateCompanySettingsMutation({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      companySettingsId: // value for 'companySettingsId'
 *      vendorAgreementTemplateLink: // value for 'vendorAgreementTemplateLink'
 *      contractId: // value for 'contractId'
 *   },
 * });
 */
export function useUpdateCompanySettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCompanySettingsMutation,
    UpdateCompanySettingsMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateCompanySettingsMutation,
    UpdateCompanySettingsMutationVariables
  >(UpdateCompanySettingsDocument, baseOptions);
}
export type UpdateCompanySettingsMutationHookResult = ReturnType<
  typeof useUpdateCompanySettingsMutation
>;
export type UpdateCompanySettingsMutationResult = Apollo.MutationResult<UpdateCompanySettingsMutation>;
export type UpdateCompanySettingsMutationOptions = Apollo.BaseMutationOptions<
  UpdateCompanySettingsMutation,
  UpdateCompanySettingsMutationVariables
>;
export const GetCompanySettingsDocument = gql`
  query GetCompanySettings($companySettingsId: uuid!) {
    company_settings_by_pk(id: $companySettingsId) {
      ...CompanySettings
    }
  }
  ${CompanySettingsFragmentDoc}
`;

/**
 * __useGetCompanySettingsQuery__
 *
 * To run a query within a React component, call `useGetCompanySettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanySettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanySettingsQuery({
 *   variables: {
 *      companySettingsId: // value for 'companySettingsId'
 *   },
 * });
 */
export function useGetCompanySettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanySettingsQuery,
    GetCompanySettingsQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCompanySettingsQuery,
    GetCompanySettingsQueryVariables
  >(GetCompanySettingsDocument, baseOptions);
}
export function useGetCompanySettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanySettingsQuery,
    GetCompanySettingsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCompanySettingsQuery,
    GetCompanySettingsQueryVariables
  >(GetCompanySettingsDocument, baseOptions);
}
export type GetCompanySettingsQueryHookResult = ReturnType<
  typeof useGetCompanySettingsQuery
>;
export type GetCompanySettingsLazyQueryHookResult = ReturnType<
  typeof useGetCompanySettingsLazyQuery
>;
export type GetCompanySettingsQueryResult = Apollo.QueryResult<
  GetCompanySettingsQuery,
  GetCompanySettingsQueryVariables
>;
export const TransactionsDocument = gql`
  query Transactions {
    transactions {
      id
      ...Transaction
      payment {
        id
        company {
          id
          name
        }
      }
    }
  }
  ${TransactionFragmentDoc}
`;

/**
 * __useTransactionsQuery__
 *
 * To run a query within a React component, call `useTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransactionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTransactionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    TransactionsQuery,
    TransactionsQueryVariables
  >
) {
  return Apollo.useQuery<TransactionsQuery, TransactionsQueryVariables>(
    TransactionsDocument,
    baseOptions
  );
}
export function useTransactionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    TransactionsQuery,
    TransactionsQueryVariables
  >
) {
  return Apollo.useLazyQuery<TransactionsQuery, TransactionsQueryVariables>(
    TransactionsDocument,
    baseOptions
  );
}
export type TransactionsQueryHookResult = ReturnType<
  typeof useTransactionsQuery
>;
export type TransactionsLazyQueryHookResult = ReturnType<
  typeof useTransactionsLazyQuery
>;
export type TransactionsQueryResult = Apollo.QueryResult<
  TransactionsQuery,
  TransactionsQueryVariables
>;
export const VendorPartnershipsByCompanyIdDocument = gql`
  query VendorPartnershipsByCompanyId($companyId: uuid!) {
    company_vendor_partnerships(where: { company_id: { _eq: $companyId } }) {
      id
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
  ${VendorLimitedFragmentDoc}
`;

/**
 * __useVendorPartnershipsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useVendorPartnershipsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useVendorPartnershipsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVendorPartnershipsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useVendorPartnershipsByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    VendorPartnershipsByCompanyIdQuery,
    VendorPartnershipsByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    VendorPartnershipsByCompanyIdQuery,
    VendorPartnershipsByCompanyIdQueryVariables
  >(VendorPartnershipsByCompanyIdDocument, baseOptions);
}
export function useVendorPartnershipsByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    VendorPartnershipsByCompanyIdQuery,
    VendorPartnershipsByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    VendorPartnershipsByCompanyIdQuery,
    VendorPartnershipsByCompanyIdQueryVariables
  >(VendorPartnershipsByCompanyIdDocument, baseOptions);
}
export type VendorPartnershipsByCompanyIdQueryHookResult = ReturnType<
  typeof useVendorPartnershipsByCompanyIdQuery
>;
export type VendorPartnershipsByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useVendorPartnershipsByCompanyIdLazyQuery
>;
export type VendorPartnershipsByCompanyIdQueryResult = Apollo.QueryResult<
  VendorPartnershipsByCompanyIdQuery,
  VendorPartnershipsByCompanyIdQueryVariables
>;
export const AddVendorPartnershipDocument = gql`
  mutation AddVendorPartnership(
    $vendorPartnership: company_vendor_partnerships_insert_input!
  ) {
    insert_company_vendor_partnerships_one(object: $vendorPartnership) {
      ...VendorPartnership
      vendor_limited {
        ...VendorLimited
      }
    }
  }
  ${VendorPartnershipFragmentDoc}
  ${VendorLimitedFragmentDoc}
`;
export type AddVendorPartnershipMutationFn = Apollo.MutationFunction<
  AddVendorPartnershipMutation,
  AddVendorPartnershipMutationVariables
>;

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
export function useAddVendorPartnershipMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddVendorPartnershipMutation,
    AddVendorPartnershipMutationVariables
  >
) {
  return Apollo.useMutation<
    AddVendorPartnershipMutation,
    AddVendorPartnershipMutationVariables
  >(AddVendorPartnershipDocument, baseOptions);
}
export type AddVendorPartnershipMutationHookResult = ReturnType<
  typeof useAddVendorPartnershipMutation
>;
export type AddVendorPartnershipMutationResult = Apollo.MutationResult<AddVendorPartnershipMutation>;
export type AddVendorPartnershipMutationOptions = Apollo.BaseMutationOptions<
  AddVendorPartnershipMutation,
  AddVendorPartnershipMutationVariables
>;
export const UpdateVendorContactDocument = gql`
  mutation UpdateVendorContact($userId: uuid!, $contact: users_set_input!) {
    update_users_by_pk(pk_columns: { id: $userId }, _set: $contact) {
      ...Contact
    }
  }
  ${ContactFragmentDoc}
`;
export type UpdateVendorContactMutationFn = Apollo.MutationFunction<
  UpdateVendorContactMutation,
  UpdateVendorContactMutationVariables
>;

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
export function useUpdateVendorContactMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateVendorContactMutation,
    UpdateVendorContactMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateVendorContactMutation,
    UpdateVendorContactMutationVariables
  >(UpdateVendorContactDocument, baseOptions);
}
export type UpdateVendorContactMutationHookResult = ReturnType<
  typeof useUpdateVendorContactMutation
>;
export type UpdateVendorContactMutationResult = Apollo.MutationResult<UpdateVendorContactMutation>;
export type UpdateVendorContactMutationOptions = Apollo.BaseMutationOptions<
  UpdateVendorContactMutation,
  UpdateVendorContactMutationVariables
>;
export const DeleteVendorContactDocument = gql`
  mutation DeleteVendorContact($userId: uuid!) {
    delete_users_by_pk(id: $userId) {
      id
    }
  }
`;
export type DeleteVendorContactMutationFn = Apollo.MutationFunction<
  DeleteVendorContactMutation,
  DeleteVendorContactMutationVariables
>;

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
export function useDeleteVendorContactMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteVendorContactMutation,
    DeleteVendorContactMutationVariables
  >
) {
  return Apollo.useMutation<
    DeleteVendorContactMutation,
    DeleteVendorContactMutationVariables
  >(DeleteVendorContactDocument, baseOptions);
}
export type DeleteVendorContactMutationHookResult = ReturnType<
  typeof useDeleteVendorContactMutation
>;
export type DeleteVendorContactMutationResult = Apollo.MutationResult<DeleteVendorContactMutation>;
export type DeleteVendorContactMutationOptions = Apollo.BaseMutationOptions<
  DeleteVendorContactMutation,
  DeleteVendorContactMutationVariables
>;
export const AddVendorContactDocument = gql`
  mutation AddVendorContact($contact: users_insert_input!) {
    insert_users_one(object: $contact) {
      ...Contact
    }
  }
  ${ContactFragmentDoc}
`;
export type AddVendorContactMutationFn = Apollo.MutationFunction<
  AddVendorContactMutation,
  AddVendorContactMutationVariables
>;

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
export function useAddVendorContactMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddVendorContactMutation,
    AddVendorContactMutationVariables
  >
) {
  return Apollo.useMutation<
    AddVendorContactMutation,
    AddVendorContactMutationVariables
  >(AddVendorContactDocument, baseOptions);
}
export type AddVendorContactMutationHookResult = ReturnType<
  typeof useAddVendorContactMutation
>;
export type AddVendorContactMutationResult = Apollo.MutationResult<AddVendorContactMutation>;
export type AddVendorContactMutationOptions = Apollo.BaseMutationOptions<
  AddVendorContactMutation,
  AddVendorContactMutationVariables
>;
export const BankListVendorPartnershipsDocument = gql`
  query BankListVendorPartnerships {
    company_vendor_partnerships {
      ...BankVendorPartnership
      company {
        id
        name
      }
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
  ${ContactFragmentDoc}
`;

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
export function useBankListVendorPartnershipsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    BankListVendorPartnershipsQuery,
    BankListVendorPartnershipsQueryVariables
  >
) {
  return Apollo.useQuery<
    BankListVendorPartnershipsQuery,
    BankListVendorPartnershipsQueryVariables
  >(BankListVendorPartnershipsDocument, baseOptions);
}
export function useBankListVendorPartnershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BankListVendorPartnershipsQuery,
    BankListVendorPartnershipsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    BankListVendorPartnershipsQuery,
    BankListVendorPartnershipsQueryVariables
  >(BankListVendorPartnershipsDocument, baseOptions);
}
export type BankListVendorPartnershipsQueryHookResult = ReturnType<
  typeof useBankListVendorPartnershipsQuery
>;
export type BankListVendorPartnershipsLazyQueryHookResult = ReturnType<
  typeof useBankListVendorPartnershipsLazyQuery
>;
export type BankListVendorPartnershipsQueryResult = Apollo.QueryResult<
  BankListVendorPartnershipsQuery,
  BankListVendorPartnershipsQueryVariables
>;
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
  ${CompanyLicenseFragmentDoc}
`;

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
export function useBankVendorPartnershipQuery(
  baseOptions: Apollo.QueryHookOptions<
    BankVendorPartnershipQuery,
    BankVendorPartnershipQueryVariables
  >
) {
  return Apollo.useQuery<
    BankVendorPartnershipQuery,
    BankVendorPartnershipQueryVariables
  >(BankVendorPartnershipDocument, baseOptions);
}
export function useBankVendorPartnershipLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BankVendorPartnershipQuery,
    BankVendorPartnershipQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    BankVendorPartnershipQuery,
    BankVendorPartnershipQueryVariables
  >(BankVendorPartnershipDocument, baseOptions);
}
export type BankVendorPartnershipQueryHookResult = ReturnType<
  typeof useBankVendorPartnershipQuery
>;
export type BankVendorPartnershipLazyQueryHookResult = ReturnType<
  typeof useBankVendorPartnershipLazyQuery
>;
export type BankVendorPartnershipQueryResult = Apollo.QueryResult<
  BankVendorPartnershipQuery,
  BankVendorPartnershipQueryVariables
>;
export const CompanyBankAccountsDocument = gql`
  query CompanyBankAccounts($companyId: uuid!) {
    bank_accounts(where: { company_id: { _eq: $companyId } }) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;

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
export function useCompanyBankAccountsQuery(
  baseOptions: Apollo.QueryHookOptions<
    CompanyBankAccountsQuery,
    CompanyBankAccountsQueryVariables
  >
) {
  return Apollo.useQuery<
    CompanyBankAccountsQuery,
    CompanyBankAccountsQueryVariables
  >(CompanyBankAccountsDocument, baseOptions);
}
export function useCompanyBankAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CompanyBankAccountsQuery,
    CompanyBankAccountsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    CompanyBankAccountsQuery,
    CompanyBankAccountsQueryVariables
  >(CompanyBankAccountsDocument, baseOptions);
}
export type CompanyBankAccountsQueryHookResult = ReturnType<
  typeof useCompanyBankAccountsQuery
>;
export type CompanyBankAccountsLazyQueryHookResult = ReturnType<
  typeof useCompanyBankAccountsLazyQuery
>;
export type CompanyBankAccountsQueryResult = Apollo.QueryResult<
  CompanyBankAccountsQuery,
  CompanyBankAccountsQueryVariables
>;
export const AddBankAccountDocument = gql`
  mutation AddBankAccount($bankAccount: bank_accounts_insert_input!) {
    insert_bank_accounts_one(object: $bankAccount) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;
export type AddBankAccountMutationFn = Apollo.MutationFunction<
  AddBankAccountMutation,
  AddBankAccountMutationVariables
>;

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
export function useAddBankAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddBankAccountMutation,
    AddBankAccountMutationVariables
  >
) {
  return Apollo.useMutation<
    AddBankAccountMutation,
    AddBankAccountMutationVariables
  >(AddBankAccountDocument, baseOptions);
}
export type AddBankAccountMutationHookResult = ReturnType<
  typeof useAddBankAccountMutation
>;
export type AddBankAccountMutationResult = Apollo.MutationResult<AddBankAccountMutation>;
export type AddBankAccountMutationOptions = Apollo.BaseMutationOptions<
  AddBankAccountMutation,
  AddBankAccountMutationVariables
>;
export const UpdateBankAccountDocument = gql`
  mutation UpdateBankAccount(
    $id: uuid!
    $bankAccount: bank_accounts_set_input
  ) {
    update_bank_accounts_by_pk(pk_columns: { id: $id }, _set: $bankAccount) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;
export type UpdateBankAccountMutationFn = Apollo.MutationFunction<
  UpdateBankAccountMutation,
  UpdateBankAccountMutationVariables
>;

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
export function useUpdateBankAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateBankAccountMutation,
    UpdateBankAccountMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateBankAccountMutation,
    UpdateBankAccountMutationVariables
  >(UpdateBankAccountDocument, baseOptions);
}
export type UpdateBankAccountMutationHookResult = ReturnType<
  typeof useUpdateBankAccountMutation
>;
export type UpdateBankAccountMutationResult = Apollo.MutationResult<UpdateBankAccountMutation>;
export type UpdateBankAccountMutationOptions = Apollo.BaseMutationOptions<
  UpdateBankAccountMutation,
  UpdateBankAccountMutationVariables
>;
export const ChangeBankAccountDocument = gql`
  mutation ChangeBankAccount(
    $companyVendorPartnershipId: uuid!
    $bankAccountId: uuid
  ) {
    update_company_vendor_partnerships_by_pk(
      pk_columns: { id: $companyVendorPartnershipId }
      _set: { vendor_bank_id: $bankAccountId }
    ) {
      id
      vendor_bank_account {
        ...BankAccount
      }
    }
  }
  ${BankAccountFragmentDoc}
`;
export type ChangeBankAccountMutationFn = Apollo.MutationFunction<
  ChangeBankAccountMutation,
  ChangeBankAccountMutationVariables
>;

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
export function useChangeBankAccountMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ChangeBankAccountMutation,
    ChangeBankAccountMutationVariables
  >
) {
  return Apollo.useMutation<
    ChangeBankAccountMutation,
    ChangeBankAccountMutationVariables
  >(ChangeBankAccountDocument, baseOptions);
}
export type ChangeBankAccountMutationHookResult = ReturnType<
  typeof useChangeBankAccountMutation
>;
export type ChangeBankAccountMutationResult = Apollo.MutationResult<ChangeBankAccountMutation>;
export type ChangeBankAccountMutationOptions = Apollo.BaseMutationOptions<
  ChangeBankAccountMutation,
  ChangeBankAccountMutationVariables
>;
export const UpdateCompanyVendorPartnershipApprovedAtDocument = gql`
  mutation UpdateCompanyVendorPartnershipApprovedAt(
    $companyVendorPartnershipId: uuid!
    $approvedAt: timestamptz
  ) {
    update_company_vendor_partnerships_by_pk(
      pk_columns: { id: $companyVendorPartnershipId }
      _set: { approved_at: $approvedAt }
    ) {
      ...BankVendorPartnership
    }
  }
  ${BankVendorPartnershipFragmentDoc}
`;
export type UpdateCompanyVendorPartnershipApprovedAtMutationFn = Apollo.MutationFunction<
  UpdateCompanyVendorPartnershipApprovedAtMutation,
  UpdateCompanyVendorPartnershipApprovedAtMutationVariables
>;

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
export function useUpdateCompanyVendorPartnershipApprovedAtMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCompanyVendorPartnershipApprovedAtMutation,
    UpdateCompanyVendorPartnershipApprovedAtMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateCompanyVendorPartnershipApprovedAtMutation,
    UpdateCompanyVendorPartnershipApprovedAtMutationVariables
  >(UpdateCompanyVendorPartnershipApprovedAtDocument, baseOptions);
}
export type UpdateCompanyVendorPartnershipApprovedAtMutationHookResult = ReturnType<
  typeof useUpdateCompanyVendorPartnershipApprovedAtMutation
>;
export type UpdateCompanyVendorPartnershipApprovedAtMutationResult = Apollo.MutationResult<UpdateCompanyVendorPartnershipApprovedAtMutation>;
export type UpdateCompanyVendorPartnershipApprovedAtMutationOptions = Apollo.BaseMutationOptions<
  UpdateCompanyVendorPartnershipApprovedAtMutation,
  UpdateCompanyVendorPartnershipApprovedAtMutationVariables
>;
export const UpdateVendorInfoDocument = gql`
  mutation UpdateVendorInfo($id: uuid!, $company: companies_set_input!) {
    update_companies_by_pk(pk_columns: { id: $id }, _set: $company) {
      ...Vendor
    }
  }
  ${VendorFragmentDoc}
`;
export type UpdateVendorInfoMutationFn = Apollo.MutationFunction<
  UpdateVendorInfoMutation,
  UpdateVendorInfoMutationVariables
>;

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
export function useUpdateVendorInfoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateVendorInfoMutation,
    UpdateVendorInfoMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateVendorInfoMutation,
    UpdateVendorInfoMutationVariables
  >(UpdateVendorInfoDocument, baseOptions);
}
export type UpdateVendorInfoMutationHookResult = ReturnType<
  typeof useUpdateVendorInfoMutation
>;
export type UpdateVendorInfoMutationResult = Apollo.MutationResult<UpdateVendorInfoMutation>;
export type UpdateVendorInfoMutationOptions = Apollo.BaseMutationOptions<
  UpdateVendorInfoMutation,
  UpdateVendorInfoMutationVariables
>;
export const UpdateVendorAgreementIdDocument = gql`
  mutation UpdateVendorAgreementId(
    $companyVendorPartnershipId: uuid!
    $vendorAgreementId: uuid
  ) {
    update_company_vendor_partnerships_by_pk(
      pk_columns: { id: $companyVendorPartnershipId }
      _set: { vendor_agreement_id: $vendorAgreementId }
    ) {
      id
      company_agreement {
        ...CompanyAgreement
      }
    }
  }
  ${CompanyAgreementFragmentDoc}
`;
export type UpdateVendorAgreementIdMutationFn = Apollo.MutationFunction<
  UpdateVendorAgreementIdMutation,
  UpdateVendorAgreementIdMutationVariables
>;

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
export function useUpdateVendorAgreementIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateVendorAgreementIdMutation,
    UpdateVendorAgreementIdMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateVendorAgreementIdMutation,
    UpdateVendorAgreementIdMutationVariables
  >(UpdateVendorAgreementIdDocument, baseOptions);
}
export type UpdateVendorAgreementIdMutationHookResult = ReturnType<
  typeof useUpdateVendorAgreementIdMutation
>;
export type UpdateVendorAgreementIdMutationResult = Apollo.MutationResult<UpdateVendorAgreementIdMutation>;
export type UpdateVendorAgreementIdMutationOptions = Apollo.BaseMutationOptions<
  UpdateVendorAgreementIdMutation,
  UpdateVendorAgreementIdMutationVariables
>;
export const AddCompanyVendorAgreementDocument = gql`
  mutation AddCompanyVendorAgreement(
    $vendorAgreement: company_agreements_insert_input!
  ) {
    insert_company_agreements_one(object: $vendorAgreement) {
      ...CompanyAgreement
    }
  }
  ${CompanyAgreementFragmentDoc}
`;
export type AddCompanyVendorAgreementMutationFn = Apollo.MutationFunction<
  AddCompanyVendorAgreementMutation,
  AddCompanyVendorAgreementMutationVariables
>;

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
export function useAddCompanyVendorAgreementMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddCompanyVendorAgreementMutation,
    AddCompanyVendorAgreementMutationVariables
  >
) {
  return Apollo.useMutation<
    AddCompanyVendorAgreementMutation,
    AddCompanyVendorAgreementMutationVariables
  >(AddCompanyVendorAgreementDocument, baseOptions);
}
export type AddCompanyVendorAgreementMutationHookResult = ReturnType<
  typeof useAddCompanyVendorAgreementMutation
>;
export type AddCompanyVendorAgreementMutationResult = Apollo.MutationResult<AddCompanyVendorAgreementMutation>;
export type AddCompanyVendorAgreementMutationOptions = Apollo.BaseMutationOptions<
  AddCompanyVendorAgreementMutation,
  AddCompanyVendorAgreementMutationVariables
>;
export const UpdateVendorLicenseIdDocument = gql`
  mutation UpdateVendorLicenseId(
    $companyVendorPartnershipId: uuid!
    $vendorLicenseId: uuid!
  ) {
    update_company_vendor_partnerships_by_pk(
      pk_columns: { id: $companyVendorPartnershipId }
      _set: { vendor_license_id: $vendorLicenseId }
    ) {
      id
      company_license {
        ...CompanyLicense
      }
    }
  }
  ${CompanyLicenseFragmentDoc}
`;
export type UpdateVendorLicenseIdMutationFn = Apollo.MutationFunction<
  UpdateVendorLicenseIdMutation,
  UpdateVendorLicenseIdMutationVariables
>;

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
export function useUpdateVendorLicenseIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateVendorLicenseIdMutation,
    UpdateVendorLicenseIdMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateVendorLicenseIdMutation,
    UpdateVendorLicenseIdMutationVariables
  >(UpdateVendorLicenseIdDocument, baseOptions);
}
export type UpdateVendorLicenseIdMutationHookResult = ReturnType<
  typeof useUpdateVendorLicenseIdMutation
>;
export type UpdateVendorLicenseIdMutationResult = Apollo.MutationResult<UpdateVendorLicenseIdMutation>;
export type UpdateVendorLicenseIdMutationOptions = Apollo.BaseMutationOptions<
  UpdateVendorLicenseIdMutation,
  UpdateVendorLicenseIdMutationVariables
>;
export const AddCompanyVendorLicenseDocument = gql`
  mutation AddCompanyVendorLicense(
    $vendorLicense: company_licenses_insert_input!
  ) {
    insert_company_licenses_one(object: $vendorLicense) {
      ...CompanyLicense
    }
  }
  ${CompanyLicenseFragmentDoc}
`;
export type AddCompanyVendorLicenseMutationFn = Apollo.MutationFunction<
  AddCompanyVendorLicenseMutation,
  AddCompanyVendorLicenseMutationVariables
>;

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
export function useAddCompanyVendorLicenseMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddCompanyVendorLicenseMutation,
    AddCompanyVendorLicenseMutationVariables
  >
) {
  return Apollo.useMutation<
    AddCompanyVendorLicenseMutation,
    AddCompanyVendorLicenseMutationVariables
  >(AddCompanyVendorLicenseDocument, baseOptions);
}
export type AddCompanyVendorLicenseMutationHookResult = ReturnType<
  typeof useAddCompanyVendorLicenseMutation
>;
export type AddCompanyVendorLicenseMutationResult = Apollo.MutationResult<AddCompanyVendorLicenseMutation>;
export type AddCompanyVendorLicenseMutationOptions = Apollo.BaseMutationOptions<
  AddCompanyVendorLicenseMutation,
  AddCompanyVendorLicenseMutationVariables
>;
export const BankAccountsDocument = gql`
  query BankAccounts {
    bank_accounts(where: { company_id: { _is_null: true } }) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;

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
export function useBankAccountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    BankAccountsQuery,
    BankAccountsQueryVariables
  >
) {
  return Apollo.useQuery<BankAccountsQuery, BankAccountsQueryVariables>(
    BankAccountsDocument,
    baseOptions
  );
}
export function useBankAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BankAccountsQuery,
    BankAccountsQueryVariables
  >
) {
  return Apollo.useLazyQuery<BankAccountsQuery, BankAccountsQueryVariables>(
    BankAccountsDocument,
    baseOptions
  );
}
export type BankAccountsQueryHookResult = ReturnType<
  typeof useBankAccountsQuery
>;
export type BankAccountsLazyQueryHookResult = ReturnType<
  typeof useBankAccountsLazyQuery
>;
export type BankAccountsQueryResult = Apollo.QueryResult<
  BankAccountsQuery,
  BankAccountsQueryVariables
>;
export const CustomersForBankDocument = gql`
  query CustomersForBank {
    companies(where: { is_vendor: { _eq: false } }) {
      id
      ...CustomerForBank
      settings {
        id
        ...CompanySettings
      }
      contract {
        id
        ...Contract
      }
    }
  }
  ${CustomerForBankFragmentDoc}
  ${CompanySettingsFragmentDoc}
  ${ContractFragmentDoc}
`;

/**
 * __useCustomersForBankQuery__
 *
 * To run a query within a React component, call `useCustomersForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useCustomersForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCustomersForBankQuery({
 *   variables: {
 *   },
 * });
 */
export function useCustomersForBankQuery(
  baseOptions?: Apollo.QueryHookOptions<
    CustomersForBankQuery,
    CustomersForBankQueryVariables
  >
) {
  return Apollo.useQuery<CustomersForBankQuery, CustomersForBankQueryVariables>(
    CustomersForBankDocument,
    baseOptions
  );
}
export function useCustomersForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CustomersForBankQuery,
    CustomersForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    CustomersForBankQuery,
    CustomersForBankQueryVariables
  >(CustomersForBankDocument, baseOptions);
}
export type CustomersForBankQueryHookResult = ReturnType<
  typeof useCustomersForBankQuery
>;
export type CustomersForBankLazyQueryHookResult = ReturnType<
  typeof useCustomersForBankLazyQuery
>;
export type CustomersForBankQueryResult = Apollo.QueryResult<
  CustomersForBankQuery,
  CustomersForBankQueryVariables
>;
export const CompanyVendorsDocument = gql`
  query CompanyVendors($companyId: uuid!) {
    company_vendor_partnerships(where: { company_id: { _eq: $companyId } }) {
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
export function useCompanyVendorsQuery(
  baseOptions: Apollo.QueryHookOptions<
    CompanyVendorsQuery,
    CompanyVendorsQueryVariables
  >
) {
  return Apollo.useQuery<CompanyVendorsQuery, CompanyVendorsQueryVariables>(
    CompanyVendorsDocument,
    baseOptions
  );
}
export function useCompanyVendorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CompanyVendorsQuery,
    CompanyVendorsQueryVariables
  >
) {
  return Apollo.useLazyQuery<CompanyVendorsQuery, CompanyVendorsQueryVariables>(
    CompanyVendorsDocument,
    baseOptions
  );
}
export type CompanyVendorsQueryHookResult = ReturnType<
  typeof useCompanyVendorsQuery
>;
export type CompanyVendorsLazyQueryHookResult = ReturnType<
  typeof useCompanyVendorsLazyQuery
>;
export type CompanyVendorsQueryResult = Apollo.QueryResult<
  CompanyVendorsQuery,
  CompanyVendorsQueryVariables
>;
export const UserByIdDocument = gql`
  query UserById($id: uuid!) {
    users_by_pk(id: $id) {
      id
      ...User
      company {
        id
        name
      }
    }
  }
  ${UserFragmentDoc}
`;

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
export function useUserByIdQuery(
  baseOptions: Apollo.QueryHookOptions<UserByIdQuery, UserByIdQueryVariables>
) {
  return Apollo.useQuery<UserByIdQuery, UserByIdQueryVariables>(
    UserByIdDocument,
    baseOptions
  );
}
export function useUserByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UserByIdQuery,
    UserByIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<UserByIdQuery, UserByIdQueryVariables>(
    UserByIdDocument,
    baseOptions
  );
}
export type UserByIdQueryHookResult = ReturnType<typeof useUserByIdQuery>;
export type UserByIdLazyQueryHookResult = ReturnType<
  typeof useUserByIdLazyQuery
>;
export type UserByIdQueryResult = Apollo.QueryResult<
  UserByIdQuery,
  UserByIdQueryVariables
>;
export const UpdateUserDocument = gql`
  mutation UpdateUser($id: uuid!, $user: users_set_input!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: $user) {
      ...User
    }
  }
  ${UserFragmentDoc}
`;
export type UpdateUserMutationFn = Apollo.MutationFunction<
  UpdateUserMutation,
  UpdateUserMutationVariables
>;

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
export function useUpdateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >
) {
  return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(
    UpdateUserDocument,
    baseOptions
  );
}
export type UpdateUserMutationHookResult = ReturnType<
  typeof useUpdateUserMutation
>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserMutation,
  UpdateUserMutationVariables
>;
export const UsersByEmailDocument = gql`
  query UsersByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
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
export function useUsersByEmailQuery(
  baseOptions: Apollo.QueryHookOptions<
    UsersByEmailQuery,
    UsersByEmailQueryVariables
  >
) {
  return Apollo.useQuery<UsersByEmailQuery, UsersByEmailQueryVariables>(
    UsersByEmailDocument,
    baseOptions
  );
}
export function useUsersByEmailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UsersByEmailQuery,
    UsersByEmailQueryVariables
  >
) {
  return Apollo.useLazyQuery<UsersByEmailQuery, UsersByEmailQueryVariables>(
    UsersByEmailDocument,
    baseOptions
  );
}
export type UsersByEmailQueryHookResult = ReturnType<
  typeof useUsersByEmailQuery
>;
export type UsersByEmailLazyQueryHookResult = ReturnType<
  typeof useUsersByEmailLazyQuery
>;
export type UsersByEmailQueryResult = Apollo.QueryResult<
  UsersByEmailQuery,
  UsersByEmailQueryVariables
>;
export const ListUsersByRoleDocument = gql`
  query ListUsersByRole($role: user_roles_enum) {
    users(where: { role: { _eq: $role } }) {
      ...User
    }
  }
  ${UserFragmentDoc}
`;

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
export function useListUsersByRoleQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ListUsersByRoleQuery,
    ListUsersByRoleQueryVariables
  >
) {
  return Apollo.useQuery<ListUsersByRoleQuery, ListUsersByRoleQueryVariables>(
    ListUsersByRoleDocument,
    baseOptions
  );
}
export function useListUsersByRoleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListUsersByRoleQuery,
    ListUsersByRoleQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    ListUsersByRoleQuery,
    ListUsersByRoleQueryVariables
  >(ListUsersByRoleDocument, baseOptions);
}
export type ListUsersByRoleQueryHookResult = ReturnType<
  typeof useListUsersByRoleQuery
>;
export type ListUsersByRoleLazyQueryHookResult = ReturnType<
  typeof useListUsersByRoleLazyQuery
>;
export type ListUsersByRoleQueryResult = Apollo.QueryResult<
  ListUsersByRoleQuery,
  ListUsersByRoleQueryVariables
>;
export const ListUsersByCompanyIdDocument = gql`
  query ListUsersByCompanyId($companyId: uuid!) {
    users(where: { company_id: { _eq: $companyId } }) {
      ...User
    }
  }
  ${UserFragmentDoc}
`;

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
export function useListUsersByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    ListUsersByCompanyIdQuery,
    ListUsersByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    ListUsersByCompanyIdQuery,
    ListUsersByCompanyIdQueryVariables
  >(ListUsersByCompanyIdDocument, baseOptions);
}
export function useListUsersByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListUsersByCompanyIdQuery,
    ListUsersByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    ListUsersByCompanyIdQuery,
    ListUsersByCompanyIdQueryVariables
  >(ListUsersByCompanyIdDocument, baseOptions);
}
export type ListUsersByCompanyIdQueryHookResult = ReturnType<
  typeof useListUsersByCompanyIdQuery
>;
export type ListUsersByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useListUsersByCompanyIdLazyQuery
>;
export type ListUsersByCompanyIdQueryResult = Apollo.QueryResult<
  ListUsersByCompanyIdQuery,
  ListUsersByCompanyIdQueryVariables
>;
export const AddUserDocument = gql`
  mutation AddUser($user: users_insert_input!) {
    insert_users_one(object: $user) {
      ...User
    }
  }
  ${UserFragmentDoc}
`;
export type AddUserMutationFn = Apollo.MutationFunction<
  AddUserMutation,
  AddUserMutationVariables
>;

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
export function useAddUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddUserMutation,
    AddUserMutationVariables
  >
) {
  return Apollo.useMutation<AddUserMutation, AddUserMutationVariables>(
    AddUserDocument,
    baseOptions
  );
}
export type AddUserMutationHookResult = ReturnType<typeof useAddUserMutation>;
export type AddUserMutationResult = Apollo.MutationResult<AddUserMutation>;
export type AddUserMutationOptions = Apollo.BaseMutationOptions<
  AddUserMutation,
  AddUserMutationVariables
>;
