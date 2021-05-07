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

/**
 * Capture information about business actions
 *
 *
 * columns and relationships of "audit_events"
 */
export type AuditEvents = {
  action: Scalars["String"];
  company_id?: Maybe<Scalars["uuid"]>;
  created_at: Scalars["timestamptz"];
  data?: Maybe<Scalars["jsonb"]>;
  error?: Maybe<Scalars["String"]>;
  id: Scalars["uuid"];
  is_system: Scalars["Boolean"];
  outcome?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
};

/**
 * Capture information about business actions
 *
 *
 * columns and relationships of "audit_events"
 */
export type AuditEventsDataArgs = {
  path?: Maybe<Scalars["String"]>;
};

/** aggregated selection of "audit_events" */
export type AuditEventsAggregate = {
  aggregate?: Maybe<AuditEventsAggregateFields>;
  nodes: Array<AuditEvents>;
};

/** aggregate fields of "audit_events" */
export type AuditEventsAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<AuditEventsMaxFields>;
  min?: Maybe<AuditEventsMinFields>;
};

/** aggregate fields of "audit_events" */
export type AuditEventsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<AuditEventsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "audit_events" */
export type AuditEventsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<AuditEventsMaxOrderBy>;
  min?: Maybe<AuditEventsMinOrderBy>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type AuditEventsAppendInput = {
  data?: Maybe<Scalars["jsonb"]>;
};

/** input type for inserting array relation for remote table "audit_events" */
export type AuditEventsArrRelInsertInput = {
  data: Array<AuditEventsInsertInput>;
  on_conflict?: Maybe<AuditEventsOnConflict>;
};

/** Boolean expression to filter rows from the table "audit_events". All fields are combined with a logical 'AND'. */
export type AuditEventsBoolExp = {
  _and?: Maybe<Array<Maybe<AuditEventsBoolExp>>>;
  _not?: Maybe<AuditEventsBoolExp>;
  _or?: Maybe<Array<Maybe<AuditEventsBoolExp>>>;
  action?: Maybe<StringComparisonExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  data?: Maybe<JsonbComparisonExp>;
  error?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  is_system?: Maybe<BooleanComparisonExp>;
  outcome?: Maybe<StringComparisonExp>;
  user_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "audit_events" */
export enum AuditEventsConstraint {
  /** unique or primary key constraint */
  AuditEventsPkey = "audit_events_pkey",
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type AuditEventsDeleteAtPathInput = {
  data?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type AuditEventsDeleteElemInput = {
  data?: Maybe<Scalars["Int"]>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type AuditEventsDeleteKeyInput = {
  data?: Maybe<Scalars["String"]>;
};

/** input type for inserting data into table "audit_events" */
export type AuditEventsInsertInput = {
  action?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  data?: Maybe<Scalars["jsonb"]>;
  error?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_system?: Maybe<Scalars["Boolean"]>;
  outcome?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type AuditEventsMaxFields = {
  action?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  error?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  outcome?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
};

/** order by max() on columns of table "audit_events" */
export type AuditEventsMaxOrderBy = {
  action?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  error?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  outcome?: Maybe<OrderBy>;
  user_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type AuditEventsMinFields = {
  action?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  error?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  outcome?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
};

/** order by min() on columns of table "audit_events" */
export type AuditEventsMinOrderBy = {
  action?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  error?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  outcome?: Maybe<OrderBy>;
  user_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "audit_events" */
export type AuditEventsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<AuditEvents>;
};

/** input type for inserting object relation for remote table "audit_events" */
export type AuditEventsObjRelInsertInput = {
  data: AuditEventsInsertInput;
  on_conflict?: Maybe<AuditEventsOnConflict>;
};

/** on conflict condition type for table "audit_events" */
export type AuditEventsOnConflict = {
  constraint: AuditEventsConstraint;
  update_columns: Array<AuditEventsUpdateColumn>;
  where?: Maybe<AuditEventsBoolExp>;
};

/** ordering options when selecting data from "audit_events" */
export type AuditEventsOrderBy = {
  action?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  data?: Maybe<OrderBy>;
  error?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  is_system?: Maybe<OrderBy>;
  outcome?: Maybe<OrderBy>;
  user_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "audit_events" */
export type AuditEventsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type AuditEventsPrependInput = {
  data?: Maybe<Scalars["jsonb"]>;
};

/** select columns of table "audit_events" */
export enum AuditEventsSelectColumn {
  /** column name */
  Action = "action",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Data = "data",
  /** column name */
  Error = "error",
  /** column name */
  Id = "id",
  /** column name */
  IsSystem = "is_system",
  /** column name */
  Outcome = "outcome",
  /** column name */
  UserId = "user_id",
}

/** input type for updating data in table "audit_events" */
export type AuditEventsSetInput = {
  action?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  data?: Maybe<Scalars["jsonb"]>;
  error?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_system?: Maybe<Scalars["Boolean"]>;
  outcome?: Maybe<Scalars["String"]>;
  user_id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "audit_events" */
export enum AuditEventsUpdateColumn {
  /** column name */
  Action = "action",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Data = "data",
  /** column name */
  Error = "error",
  /** column name */
  Id = "id",
  /** column name */
  IsSystem = "is_system",
  /** column name */
  Outcome = "outcome",
  /** column name */
  UserId = "user_id",
}

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
  is_cannabis_compliant: Scalars["Boolean"];
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
  is_cannabis_compliant?: Maybe<BooleanComparisonExp>;
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
  is_cannabis_compliant?: Maybe<Scalars["Boolean"]>;
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
  is_cannabis_compliant?: Maybe<OrderBy>;
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
  IsCannabisCompliant = "is_cannabis_compliant",
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
  is_cannabis_compliant?: Maybe<Scalars["Boolean"]>;
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
  IsCannabisCompliant = "is_cannabis_compliant",
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
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit: Scalars["numeric"];
  created_at: Scalars["timestamptz"];
  date: Scalars["date"];
  id: Scalars["uuid"];
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  product_type: Scalars["String"];
  total_limit: Scalars["numeric"];
  total_outstanding_fees: Scalars["numeric"];
  total_outstanding_interest: Scalars["numeric"];
  total_outstanding_principal: Scalars["numeric"];
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state: Scalars["numeric"];
  updated_at: Scalars["timestamptz"];
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
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesAvgOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "bank_financial_summaries". All fields are combined with a logical 'AND'. */
export type BankFinancialSummariesBoolExp = {
  _and?: Maybe<Array<Maybe<BankFinancialSummariesBoolExp>>>;
  _not?: Maybe<BankFinancialSummariesBoolExp>;
  _or?: Maybe<Array<Maybe<BankFinancialSummariesBoolExp>>>;
  adjusted_total_limit?: Maybe<NumericComparisonExp>;
  available_limit?: Maybe<NumericComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  interest_accrued_today?: Maybe<NumericComparisonExp>;
  product_type?: Maybe<StringComparisonExp>;
  total_limit?: Maybe<NumericComparisonExp>;
  total_outstanding_fees?: Maybe<NumericComparisonExp>;
  total_outstanding_interest?: Maybe<NumericComparisonExp>;
  total_outstanding_principal?: Maybe<NumericComparisonExp>;
  total_outstanding_principal_for_interest?: Maybe<NumericComparisonExp>;
  total_principal_in_requested_state?: Maybe<NumericComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "bank_financial_summaries" */
export enum BankFinancialSummariesConstraint {
  /** unique or primary key constraint */
  BankFinancialSummariesPkey = "bank_financial_summaries_pkey",
}

/** input type for incrementing integer column in table "bank_financial_summaries" */
export type BankFinancialSummariesIncInput = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "bank_financial_summaries" */
export type BankFinancialSummariesInsertInput = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  product_type?: Maybe<Scalars["String"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate max on columns */
export type BankFinancialSummariesMaxFields = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  product_type?: Maybe<Scalars["String"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by max() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesMaxOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type BankFinancialSummariesMinFields = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  product_type?: Maybe<Scalars["String"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by min() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesMinOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
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
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "bank_financial_summaries" */
export type BankFinancialSummariesPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "bank_financial_summaries" */
export enum BankFinancialSummariesSelectColumn {
  /** column name */
  AdjustedTotalLimit = "adjusted_total_limit",
  /** column name */
  AvailableLimit = "available_limit",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Date = "date",
  /** column name */
  Id = "id",
  /** column name */
  InterestAccruedToday = "interest_accrued_today",
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
  TotalOutstandingPrincipalForInterest = "total_outstanding_principal_for_interest",
  /** column name */
  TotalPrincipalInRequestedState = "total_principal_in_requested_state",
  /** column name */
  UpdatedAt = "updated_at",
}

/** input type for updating data in table "bank_financial_summaries" */
export type BankFinancialSummariesSetInput = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  product_type?: Maybe<Scalars["String"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate stddev on columns */
export type BankFinancialSummariesStddevFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesStddevOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type BankFinancialSummariesStddevPopFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesStddevPopOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type BankFinancialSummariesStddevSampFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesStddevSampOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type BankFinancialSummariesSumFields = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesSumOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** update columns of table "bank_financial_summaries" */
export enum BankFinancialSummariesUpdateColumn {
  /** column name */
  AdjustedTotalLimit = "adjusted_total_limit",
  /** column name */
  AvailableLimit = "available_limit",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Date = "date",
  /** column name */
  Id = "id",
  /** column name */
  InterestAccruedToday = "interest_accrued_today",
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
  TotalOutstandingPrincipalForInterest = "total_outstanding_principal_for_interest",
  /** column name */
  TotalPrincipalInRequestedState = "total_principal_in_requested_state",
  /** column name */
  UpdatedAt = "updated_at",
}

/** aggregate var_pop on columns */
export type BankFinancialSummariesVarPopFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesVarPopOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type BankFinancialSummariesVarSampFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesVarSampOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type BankFinancialSummariesVarianceFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "bank_financial_summaries" */
export type BankFinancialSummariesVarianceOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
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
  /** An array relationship */
  company_payor_partnerships: Array<CompanyPayorPartnerships>;
  /** An aggregated array relationship */
  company_payor_partnerships_aggregate: CompanyPayorPartnershipsAggregate;
  /** An array relationship */
  company_payor_partnerships_by_payor: Array<CompanyPayorPartnerships>;
  /** An aggregated array relationship */
  company_payor_partnerships_by_payor_aggregate: CompanyPayorPartnershipsAggregate;
  company_settings_id: Scalars["uuid"];
  company_type: CompanyTypeEnum;
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
  contract_name?: Maybe<Scalars["String"]>;
  /** An array relationship */
  contracts: Array<Contracts>;
  /** An aggregated array relationship */
  contracts_aggregate: ContractsAggregate;
  country?: Maybe<Scalars["String"]>;
  created_at: Scalars["timestamptz"];
  dba_name?: Maybe<Scalars["String"]>;
  /** An array relationship */
  ebba_applications: Array<EbbaApplications>;
  /** An aggregated array relationship */
  ebba_applications_aggregate: EbbaApplicationsAggregate;
  employer_identification_number?: Maybe<Scalars["String"]>;
  /** An array relationship */
  financial_summaries: Array<FinancialSummaries>;
  /** An aggregated array relationship */
  financial_summaries_aggregate: FinancialSummariesAggregate;
  id: Scalars["uuid"];
  identifier?: Maybe<Scalars["String"]>;
  /** An array relationship */
  invoice_by_payor: Array<Invoices>;
  /** An aggregated array relationship */
  invoice_by_payor_aggregate: InvoicesAggregate;
  /** An array relationship */
  invoices: Array<Invoices>;
  /** An aggregated array relationship */
  invoices_aggregate: InvoicesAggregate;
  /** The latest disbursement (payment) identifier assigned to loans belonging to this company when an advance is made; increment this value to get a new disbursement identifier for a new payment */
  latest_disbursement_identifier: Scalars["Int"];
  /** The latest loan identifier created for loans belonging to this company; increment this value to get a new loan identifier for a new loan */
  latest_loan_identifier: Scalars["Int"];
  latest_repayment_identifier: Scalars["Int"];
  /** An array relationship */
  licenses: Array<CompanyLicenses>;
  /** An aggregated array relationship */
  licenses_aggregate: CompanyLicensesAggregate;
  /** An array relationship */
  loans: Array<Loans>;
  /** An aggregated array relationship */
  loans_aggregate: LoansAggregate;
  name: Scalars["String"];
  needs_balance_recomputed: Scalars["Boolean"];
  /** An array relationship */
  payments: Array<Payments>;
  /** An aggregated array relationship */
  payments_aggregate: PaymentsAggregate;
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
  /** An object relationship */
  type: CompanyType;
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
export type CompaniesCompanyPayorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesCompanyPayorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesCompanyPayorPartnershipsByPayorArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesCompanyPayorPartnershipsByPayorAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
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
export type CompaniesContractsArgs = {
  distinct_on?: Maybe<Array<ContractsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ContractsOrderBy>>;
  where?: Maybe<ContractsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesContractsAggregateArgs = {
  distinct_on?: Maybe<Array<ContractsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<ContractsOrderBy>>;
  where?: Maybe<ContractsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesEbbaApplicationsArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationsOrderBy>>;
  where?: Maybe<EbbaApplicationsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesEbbaApplicationsAggregateArgs = {
  distinct_on?: Maybe<Array<EbbaApplicationsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<EbbaApplicationsOrderBy>>;
  where?: Maybe<EbbaApplicationsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesFinancialSummariesArgs = {
  distinct_on?: Maybe<Array<FinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FinancialSummariesOrderBy>>;
  where?: Maybe<FinancialSummariesBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesFinancialSummariesAggregateArgs = {
  distinct_on?: Maybe<Array<FinancialSummariesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<FinancialSummariesOrderBy>>;
  where?: Maybe<FinancialSummariesBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesInvoiceByPayorArgs = {
  distinct_on?: Maybe<Array<InvoicesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoicesOrderBy>>;
  where?: Maybe<InvoicesBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesInvoiceByPayorAggregateArgs = {
  distinct_on?: Maybe<Array<InvoicesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoicesOrderBy>>;
  where?: Maybe<InvoicesBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesInvoicesArgs = {
  distinct_on?: Maybe<Array<InvoicesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoicesOrderBy>>;
  where?: Maybe<InvoicesBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesInvoicesAggregateArgs = {
  distinct_on?: Maybe<Array<InvoicesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoicesOrderBy>>;
  where?: Maybe<InvoicesBoolExp>;
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
export type CompaniesPaymentsArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
};

/** columns and relationships of "companies" */
export type CompaniesPaymentsAggregateArgs = {
  distinct_on?: Maybe<Array<PaymentsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PaymentsOrderBy>>;
  where?: Maybe<PaymentsBoolExp>;
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
  latest_disbursement_identifier?: Maybe<Scalars["Float"]>;
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
  latest_repayment_identifier?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "companies" */
export type CompaniesAvgOrderBy = {
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
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
  company_payor_partnerships?: Maybe<CompanyPayorPartnershipsBoolExp>;
  company_payor_partnerships_by_payor?: Maybe<CompanyPayorPartnershipsBoolExp>;
  company_settings_id?: Maybe<UuidComparisonExp>;
  company_type?: Maybe<CompanyTypeEnumComparisonExp>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsBoolExp>;
  company_vendor_partnerships_by_vendor?: Maybe<CompanyVendorPartnershipsBoolExp>;
  contract?: Maybe<ContractsBoolExp>;
  contract_id?: Maybe<UuidComparisonExp>;
  contract_name?: Maybe<StringComparisonExp>;
  contracts?: Maybe<ContractsBoolExp>;
  country?: Maybe<StringComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  dba_name?: Maybe<StringComparisonExp>;
  ebba_applications?: Maybe<EbbaApplicationsBoolExp>;
  employer_identification_number?: Maybe<StringComparisonExp>;
  financial_summaries?: Maybe<FinancialSummariesBoolExp>;
  id?: Maybe<UuidComparisonExp>;
  identifier?: Maybe<StringComparisonExp>;
  invoice_by_payor?: Maybe<InvoicesBoolExp>;
  invoices?: Maybe<InvoicesBoolExp>;
  latest_disbursement_identifier?: Maybe<IntComparisonExp>;
  latest_loan_identifier?: Maybe<IntComparisonExp>;
  latest_repayment_identifier?: Maybe<IntComparisonExp>;
  licenses?: Maybe<CompanyLicensesBoolExp>;
  loans?: Maybe<LoansBoolExp>;
  name?: Maybe<StringComparisonExp>;
  needs_balance_recomputed?: Maybe<BooleanComparisonExp>;
  payments?: Maybe<PaymentsBoolExp>;
  phone_number?: Maybe<StringComparisonExp>;
  purchase_orders?: Maybe<PurchaseOrdersBoolExp>;
  purchase_orders_by_vendor?: Maybe<PurchaseOrdersBoolExp>;
  settings?: Maybe<CompanySettingsBoolExp>;
  state?: Maybe<StringComparisonExp>;
  type?: Maybe<CompanyTypeBoolExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  users?: Maybe<UsersBoolExp>;
  zip_code?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "companies" */
export enum CompaniesConstraint {
  /** unique or primary key constraint */
  CompaniesCompanySettingsIdKey = "companies_company_settings_id_key",
  /** unique or primary key constraint */
  CompaniesPkey = "companies_pkey",
}

/** input type for incrementing integer column in table "companies" */
export type CompaniesIncInput = {
  latest_disbursement_identifier?: Maybe<Scalars["Int"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  latest_repayment_identifier?: Maybe<Scalars["Int"]>;
};

/** input type for inserting data into table "companies" */
export type CompaniesInsertInput = {
  address?: Maybe<Scalars["String"]>;
  agreements?: Maybe<CompanyAgreementsArrRelInsertInput>;
  bank_accounts?: Maybe<BankAccountsArrRelInsertInput>;
  city?: Maybe<Scalars["String"]>;
  company_payor_partnerships?: Maybe<CompanyPayorPartnershipsArrRelInsertInput>;
  company_payor_partnerships_by_payor?: Maybe<CompanyPayorPartnershipsArrRelInsertInput>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<CompanyTypeEnum>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  company_vendor_partnerships_by_vendor?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  contract?: Maybe<ContractsObjRelInsertInput>;
  contract_id?: Maybe<Scalars["uuid"]>;
  contract_name?: Maybe<Scalars["String"]>;
  contracts?: Maybe<ContractsArrRelInsertInput>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  ebba_applications?: Maybe<EbbaApplicationsArrRelInsertInput>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  financial_summaries?: Maybe<FinancialSummariesArrRelInsertInput>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  invoice_by_payor?: Maybe<InvoicesArrRelInsertInput>;
  invoices?: Maybe<InvoicesArrRelInsertInput>;
  latest_disbursement_identifier?: Maybe<Scalars["Int"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  latest_repayment_identifier?: Maybe<Scalars["Int"]>;
  licenses?: Maybe<CompanyLicensesArrRelInsertInput>;
  loans?: Maybe<LoansArrRelInsertInput>;
  name?: Maybe<Scalars["String"]>;
  needs_balance_recomputed?: Maybe<Scalars["Boolean"]>;
  payments?: Maybe<PaymentsArrRelInsertInput>;
  phone_number?: Maybe<Scalars["String"]>;
  purchase_orders?: Maybe<PurchaseOrdersArrRelInsertInput>;
  purchase_orders_by_vendor?: Maybe<PurchaseOrdersArrRelInsertInput>;
  settings?: Maybe<CompanySettingsObjRelInsertInput>;
  state?: Maybe<Scalars["String"]>;
  type?: Maybe<CompanyTypeObjRelInsertInput>;
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
  contract_name?: Maybe<Scalars["String"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_disbursement_identifier?: Maybe<Scalars["Int"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  latest_repayment_identifier?: Maybe<Scalars["Int"]>;
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
  contract_name?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
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
  contract_name?: Maybe<Scalars["String"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_disbursement_identifier?: Maybe<Scalars["Int"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  latest_repayment_identifier?: Maybe<Scalars["Int"]>;
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
  contract_name?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
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
  company_payor_partnerships_aggregate?: Maybe<CompanyPayorPartnershipsAggregateOrderBy>;
  company_payor_partnerships_by_payor_aggregate?: Maybe<CompanyPayorPartnershipsAggregateOrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  company_type?: Maybe<OrderBy>;
  company_vendor_partnerships_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  company_vendor_partnerships_by_vendor_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  contract?: Maybe<ContractsOrderBy>;
  contract_id?: Maybe<OrderBy>;
  contract_name?: Maybe<OrderBy>;
  contracts_aggregate?: Maybe<ContractsAggregateOrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  ebba_applications_aggregate?: Maybe<EbbaApplicationsAggregateOrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  financial_summaries_aggregate?: Maybe<FinancialSummariesAggregateOrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  invoice_by_payor_aggregate?: Maybe<InvoicesAggregateOrderBy>;
  invoices_aggregate?: Maybe<InvoicesAggregateOrderBy>;
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
  licenses_aggregate?: Maybe<CompanyLicensesAggregateOrderBy>;
  loans_aggregate?: Maybe<LoansAggregateOrderBy>;
  name?: Maybe<OrderBy>;
  needs_balance_recomputed?: Maybe<OrderBy>;
  payments_aggregate?: Maybe<PaymentsAggregateOrderBy>;
  phone_number?: Maybe<OrderBy>;
  purchase_orders_aggregate?: Maybe<PurchaseOrdersAggregateOrderBy>;
  purchase_orders_by_vendor_aggregate?: Maybe<PurchaseOrdersAggregateOrderBy>;
  settings?: Maybe<CompanySettingsOrderBy>;
  state?: Maybe<OrderBy>;
  type?: Maybe<CompanyTypeOrderBy>;
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
  CompanyType = "company_type",
  /** column name */
  ContractId = "contract_id",
  /** column name */
  ContractName = "contract_name",
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
  LatestDisbursementIdentifier = "latest_disbursement_identifier",
  /** column name */
  LatestLoanIdentifier = "latest_loan_identifier",
  /** column name */
  LatestRepaymentIdentifier = "latest_repayment_identifier",
  /** column name */
  Name = "name",
  /** column name */
  NeedsBalanceRecomputed = "needs_balance_recomputed",
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
  company_type?: Maybe<CompanyTypeEnum>;
  contract_id?: Maybe<Scalars["uuid"]>;
  contract_name?: Maybe<Scalars["String"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_disbursement_identifier?: Maybe<Scalars["Int"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  latest_repayment_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  needs_balance_recomputed?: Maybe<Scalars["Boolean"]>;
  phone_number?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** aggregate stddev on columns */
export type CompaniesStddevFields = {
  latest_disbursement_identifier?: Maybe<Scalars["Float"]>;
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
  latest_repayment_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "companies" */
export type CompaniesStddevOrderBy = {
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type CompaniesStddevPopFields = {
  latest_disbursement_identifier?: Maybe<Scalars["Float"]>;
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
  latest_repayment_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "companies" */
export type CompaniesStddevPopOrderBy = {
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type CompaniesStddevSampFields = {
  latest_disbursement_identifier?: Maybe<Scalars["Float"]>;
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
  latest_repayment_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "companies" */
export type CompaniesStddevSampOrderBy = {
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type CompaniesSumFields = {
  latest_disbursement_identifier?: Maybe<Scalars["Int"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  latest_repayment_identifier?: Maybe<Scalars["Int"]>;
};

/** order by sum() on columns of table "companies" */
export type CompaniesSumOrderBy = {
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
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
  CompanyType = "company_type",
  /** column name */
  ContractId = "contract_id",
  /** column name */
  ContractName = "contract_name",
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
  LatestDisbursementIdentifier = "latest_disbursement_identifier",
  /** column name */
  LatestLoanIdentifier = "latest_loan_identifier",
  /** column name */
  LatestRepaymentIdentifier = "latest_repayment_identifier",
  /** column name */
  Name = "name",
  /** column name */
  NeedsBalanceRecomputed = "needs_balance_recomputed",
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
  latest_disbursement_identifier?: Maybe<Scalars["Float"]>;
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
  latest_repayment_identifier?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "companies" */
export type CompaniesVarPopOrderBy = {
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type CompaniesVarSampFields = {
  latest_disbursement_identifier?: Maybe<Scalars["Float"]>;
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
  latest_repayment_identifier?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "companies" */
export type CompaniesVarSampOrderBy = {
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type CompaniesVarianceFields = {
  latest_disbursement_identifier?: Maybe<Scalars["Float"]>;
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
  latest_repayment_identifier?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "companies" */
export type CompaniesVarianceOrderBy = {
  latest_disbursement_identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  latest_repayment_identifier?: Maybe<OrderBy>;
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
  company_payor_partnerships: Array<CompanyPayorPartnerships>;
  /** An aggregated array relationship */
  company_payor_partnerships_aggregate: CompanyPayorPartnershipsAggregate;
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
export type CompanyAgreementsCompanyPayorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/**
 * Agreements that a company signs with Bespoke, this can be for vendors or customers signing agreeements
 *
 *
 * columns and relationships of "company_agreements"
 */
export type CompanyAgreementsCompanyPayorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
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
  company_payor_partnerships?: Maybe<CompanyPayorPartnershipsBoolExp>;
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
  company_payor_partnerships?: Maybe<CompanyPayorPartnershipsArrRelInsertInput>;
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
  company_payor_partnerships_aggregate?: Maybe<CompanyPayorPartnershipsAggregateOrderBy>;
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

/** columns and relationships of "company_payor_partnerships" */
export type CompanyPayorPartnerships = {
  approved_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  created_at?: Maybe<Scalars["timestamptz"]>;
  id: Scalars["uuid"];
  /** An object relationship */
  payor?: Maybe<Companies>;
  /** An object relationship */
  payor_agreement?: Maybe<CompanyAgreements>;
  payor_agreement_id?: Maybe<Scalars["uuid"]>;
  payor_id: Scalars["uuid"];
  /** An object relationship */
  payor_license?: Maybe<CompanyLicenses>;
  payor_license_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  payor_limited?: Maybe<Payors>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregated selection of "company_payor_partnerships" */
export type CompanyPayorPartnershipsAggregate = {
  aggregate?: Maybe<CompanyPayorPartnershipsAggregateFields>;
  nodes: Array<CompanyPayorPartnerships>;
};

/** aggregate fields of "company_payor_partnerships" */
export type CompanyPayorPartnershipsAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<CompanyPayorPartnershipsMaxFields>;
  min?: Maybe<CompanyPayorPartnershipsMinFields>;
};

/** aggregate fields of "company_payor_partnerships" */
export type CompanyPayorPartnershipsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "company_payor_partnerships" */
export type CompanyPayorPartnershipsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompanyPayorPartnershipsMaxOrderBy>;
  min?: Maybe<CompanyPayorPartnershipsMinOrderBy>;
};

/** input type for inserting array relation for remote table "company_payor_partnerships" */
export type CompanyPayorPartnershipsArrRelInsertInput = {
  data: Array<CompanyPayorPartnershipsInsertInput>;
  on_conflict?: Maybe<CompanyPayorPartnershipsOnConflict>;
};

/** Boolean expression to filter rows from the table "company_payor_partnerships". All fields are combined with a logical 'AND'. */
export type CompanyPayorPartnershipsBoolExp = {
  _and?: Maybe<Array<Maybe<CompanyPayorPartnershipsBoolExp>>>;
  _not?: Maybe<CompanyPayorPartnershipsBoolExp>;
  _or?: Maybe<Array<Maybe<CompanyPayorPartnershipsBoolExp>>>;
  approved_at?: Maybe<TimestamptzComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  payor?: Maybe<CompaniesBoolExp>;
  payor_agreement?: Maybe<CompanyAgreementsBoolExp>;
  payor_agreement_id?: Maybe<UuidComparisonExp>;
  payor_id?: Maybe<UuidComparisonExp>;
  payor_license?: Maybe<CompanyLicensesBoolExp>;
  payor_license_id?: Maybe<UuidComparisonExp>;
  payor_limited?: Maybe<PayorsBoolExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "company_payor_partnerships" */
export enum CompanyPayorPartnershipsConstraint {
  /** unique or primary key constraint */
  CompanyPayorPartnershipsCompanyIdPayorIdKey = "company_payor_partnerships_company_id_payor_id_key",
  /** unique or primary key constraint */
  CompanyPayorPartnershipsPkey = "company_payor_partnerships_pkey",
}

/** input type for inserting data into table "company_payor_partnerships" */
export type CompanyPayorPartnershipsInsertInput = {
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  payor?: Maybe<CompaniesObjRelInsertInput>;
  payor_agreement?: Maybe<CompanyAgreementsObjRelInsertInput>;
  payor_agreement_id?: Maybe<Scalars["uuid"]>;
  payor_id?: Maybe<Scalars["uuid"]>;
  payor_license?: Maybe<CompanyLicensesObjRelInsertInput>;
  payor_license_id?: Maybe<Scalars["uuid"]>;
  payor_limited?: Maybe<PayorsObjRelInsertInput>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate max on columns */
export type CompanyPayorPartnershipsMaxFields = {
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  payor_agreement_id?: Maybe<Scalars["uuid"]>;
  payor_id?: Maybe<Scalars["uuid"]>;
  payor_license_id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by max() on columns of table "company_payor_partnerships" */
export type CompanyPayorPartnershipsMaxOrderBy = {
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  payor_agreement_id?: Maybe<OrderBy>;
  payor_id?: Maybe<OrderBy>;
  payor_license_id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyPayorPartnershipsMinFields = {
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  payor_agreement_id?: Maybe<Scalars["uuid"]>;
  payor_id?: Maybe<Scalars["uuid"]>;
  payor_license_id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by min() on columns of table "company_payor_partnerships" */
export type CompanyPayorPartnershipsMinOrderBy = {
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  payor_agreement_id?: Maybe<OrderBy>;
  payor_id?: Maybe<OrderBy>;
  payor_license_id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "company_payor_partnerships" */
export type CompanyPayorPartnershipsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<CompanyPayorPartnerships>;
};

/** input type for inserting object relation for remote table "company_payor_partnerships" */
export type CompanyPayorPartnershipsObjRelInsertInput = {
  data: CompanyPayorPartnershipsInsertInput;
  on_conflict?: Maybe<CompanyPayorPartnershipsOnConflict>;
};

/** on conflict condition type for table "company_payor_partnerships" */
export type CompanyPayorPartnershipsOnConflict = {
  constraint: CompanyPayorPartnershipsConstraint;
  update_columns: Array<CompanyPayorPartnershipsUpdateColumn>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** ordering options when selecting data from "company_payor_partnerships" */
export type CompanyPayorPartnershipsOrderBy = {
  approved_at?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  payor?: Maybe<CompaniesOrderBy>;
  payor_agreement?: Maybe<CompanyAgreementsOrderBy>;
  payor_agreement_id?: Maybe<OrderBy>;
  payor_id?: Maybe<OrderBy>;
  payor_license?: Maybe<CompanyLicensesOrderBy>;
  payor_license_id?: Maybe<OrderBy>;
  payor_limited?: Maybe<PayorsOrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_payor_partnerships" */
export type CompanyPayorPartnershipsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "company_payor_partnerships" */
export enum CompanyPayorPartnershipsSelectColumn {
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  PayorAgreementId = "payor_agreement_id",
  /** column name */
  PayorId = "payor_id",
  /** column name */
  PayorLicenseId = "payor_license_id",
  /** column name */
  UpdatedAt = "updated_at",
}

/** input type for updating data in table "company_payor_partnerships" */
export type CompanyPayorPartnershipsSetInput = {
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  payor_agreement_id?: Maybe<Scalars["uuid"]>;
  payor_id?: Maybe<Scalars["uuid"]>;
  payor_license_id?: Maybe<Scalars["uuid"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** update columns of table "company_payor_partnerships" */
export enum CompanyPayorPartnershipsUpdateColumn {
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  Id = "id",
  /** column name */
  PayorAgreementId = "payor_agreement_id",
  /** column name */
  PayorId = "payor_id",
  /** column name */
  PayorLicenseId = "payor_license_id",
  /** column name */
  UpdatedAt = "updated_at",
}

/**
 * Settings are configuration details associated with a company, but are not within a time range like contracts are
 *
 *
 * columns and relationships of "company_settings"
 */
export type CompanySettings = {
  /** An object relationship */
  active_ebba_application?: Maybe<EbbaApplications>;
  /** If relevant, this foreign key points to the current active ebba_application for this company */
  active_ebba_application_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  advances_bespoke_bank_account?: Maybe<BankAccounts>;
  /** Currently not used */
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  collections_bespoke_bank_account?: Maybe<BankAccounts>;
  /** For CUSTOMER and PAYOR companies, this is the Bespoke Financial bank account company sends payments to */
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  company?: Maybe<Companies>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at: Scalars["timestamptz"];
  has_autofinancing?: Maybe<Scalars["Boolean"]>;
  id: Scalars["uuid"];
  payor_agreement_docusign_template?: Maybe<Scalars["String"]>;
  two_factor_message_method?: Maybe<Scalars["String"]>;
  updated_at: Scalars["timestamptz"];
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
  active_ebba_application?: Maybe<EbbaApplicationsBoolExp>;
  active_ebba_application_id?: Maybe<UuidComparisonExp>;
  advances_bespoke_bank_account?: Maybe<BankAccountsBoolExp>;
  advances_bespoke_bank_account_id?: Maybe<UuidComparisonExp>;
  collections_bespoke_bank_account?: Maybe<BankAccountsBoolExp>;
  collections_bespoke_bank_account_id?: Maybe<UuidComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  has_autofinancing?: Maybe<BooleanComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  payor_agreement_docusign_template?: Maybe<StringComparisonExp>;
  two_factor_message_method?: Maybe<StringComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  vendor_agreement_docusign_template?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "company_settings" */
export enum CompanySettingsConstraint {
  /** unique or primary key constraint */
  CompanySettingsPkey = "company_settings_pkey",
}

/** input type for inserting data into table "company_settings" */
export type CompanySettingsInsertInput = {
  active_ebba_application?: Maybe<EbbaApplicationsObjRelInsertInput>;
  active_ebba_application_id?: Maybe<Scalars["uuid"]>;
  advances_bespoke_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  collections_bespoke_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  has_autofinancing?: Maybe<Scalars["Boolean"]>;
  id?: Maybe<Scalars["uuid"]>;
  payor_agreement_docusign_template?: Maybe<Scalars["String"]>;
  two_factor_message_method?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type CompanySettingsMaxFields = {
  active_ebba_application_id?: Maybe<Scalars["uuid"]>;
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  payor_agreement_docusign_template?: Maybe<Scalars["String"]>;
  two_factor_message_method?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "company_settings" */
export type CompanySettingsMaxOrderBy = {
  active_ebba_application_id?: Maybe<OrderBy>;
  advances_bespoke_bank_account_id?: Maybe<OrderBy>;
  collections_bespoke_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  payor_agreement_docusign_template?: Maybe<OrderBy>;
  two_factor_message_method?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor_agreement_docusign_template?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanySettingsMinFields = {
  active_ebba_application_id?: Maybe<Scalars["uuid"]>;
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  payor_agreement_docusign_template?: Maybe<Scalars["String"]>;
  two_factor_message_method?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "company_settings" */
export type CompanySettingsMinOrderBy = {
  active_ebba_application_id?: Maybe<OrderBy>;
  advances_bespoke_bank_account_id?: Maybe<OrderBy>;
  collections_bespoke_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  payor_agreement_docusign_template?: Maybe<OrderBy>;
  two_factor_message_method?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
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
  active_ebba_application?: Maybe<EbbaApplicationsOrderBy>;
  active_ebba_application_id?: Maybe<OrderBy>;
  advances_bespoke_bank_account?: Maybe<BankAccountsOrderBy>;
  advances_bespoke_bank_account_id?: Maybe<OrderBy>;
  collections_bespoke_bank_account?: Maybe<BankAccountsOrderBy>;
  collections_bespoke_bank_account_id?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  has_autofinancing?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  payor_agreement_docusign_template?: Maybe<OrderBy>;
  two_factor_message_method?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor_agreement_docusign_template?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_settings" */
export type CompanySettingsPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "company_settings" */
export enum CompanySettingsSelectColumn {
  /** column name */
  ActiveEbbaApplicationId = "active_ebba_application_id",
  /** column name */
  AdvancesBespokeBankAccountId = "advances_bespoke_bank_account_id",
  /** column name */
  CollectionsBespokeBankAccountId = "collections_bespoke_bank_account_id",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  HasAutofinancing = "has_autofinancing",
  /** column name */
  Id = "id",
  /** column name */
  PayorAgreementDocusignTemplate = "payor_agreement_docusign_template",
  /** column name */
  TwoFactorMessageMethod = "two_factor_message_method",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  VendorAgreementDocusignTemplate = "vendor_agreement_docusign_template",
}

/** input type for updating data in table "company_settings" */
export type CompanySettingsSetInput = {
  active_ebba_application_id?: Maybe<Scalars["uuid"]>;
  advances_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  collections_bespoke_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  has_autofinancing?: Maybe<Scalars["Boolean"]>;
  id?: Maybe<Scalars["uuid"]>;
  payor_agreement_docusign_template?: Maybe<Scalars["String"]>;
  two_factor_message_method?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  vendor_agreement_docusign_template?: Maybe<Scalars["String"]>;
};

/** update columns of table "company_settings" */
export enum CompanySettingsUpdateColumn {
  /** column name */
  ActiveEbbaApplicationId = "active_ebba_application_id",
  /** column name */
  AdvancesBespokeBankAccountId = "advances_bespoke_bank_account_id",
  /** column name */
  CollectionsBespokeBankAccountId = "collections_bespoke_bank_account_id",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  HasAutofinancing = "has_autofinancing",
  /** column name */
  Id = "id",
  /** column name */
  PayorAgreementDocusignTemplate = "payor_agreement_docusign_template",
  /** column name */
  TwoFactorMessageMethod = "two_factor_message_method",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  VendorAgreementDocusignTemplate = "vendor_agreement_docusign_template",
}

/** columns and relationships of "company_type" */
export type CompanyType = {
  value: Scalars["String"];
};

/** aggregated selection of "company_type" */
export type CompanyTypeAggregate = {
  aggregate?: Maybe<CompanyTypeAggregateFields>;
  nodes: Array<CompanyType>;
};

/** aggregate fields of "company_type" */
export type CompanyTypeAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<CompanyTypeMaxFields>;
  min?: Maybe<CompanyTypeMinFields>;
};

/** aggregate fields of "company_type" */
export type CompanyTypeAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyTypeSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "company_type" */
export type CompanyTypeAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompanyTypeMaxOrderBy>;
  min?: Maybe<CompanyTypeMinOrderBy>;
};

/** input type for inserting array relation for remote table "company_type" */
export type CompanyTypeArrRelInsertInput = {
  data: Array<CompanyTypeInsertInput>;
  on_conflict?: Maybe<CompanyTypeOnConflict>;
};

/** Boolean expression to filter rows from the table "company_type". All fields are combined with a logical 'AND'. */
export type CompanyTypeBoolExp = {
  _and?: Maybe<Array<Maybe<CompanyTypeBoolExp>>>;
  _not?: Maybe<CompanyTypeBoolExp>;
  _or?: Maybe<Array<Maybe<CompanyTypeBoolExp>>>;
  value?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "company_type" */
export enum CompanyTypeConstraint {
  /** unique or primary key constraint */
  CompanyTypePkey = "company_type_pkey",
}

export enum CompanyTypeEnum {
  Customer = "customer",
  Payor = "payor",
  Vendor = "vendor",
}

/** expression to compare columns of type company_type_enum. All fields are combined with logical 'AND'. */
export type CompanyTypeEnumComparisonExp = {
  _eq?: Maybe<CompanyTypeEnum>;
  _in?: Maybe<Array<CompanyTypeEnum>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<CompanyTypeEnum>;
  _nin?: Maybe<Array<CompanyTypeEnum>>;
};

/** input type for inserting data into table "company_type" */
export type CompanyTypeInsertInput = {
  value?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type CompanyTypeMaxFields = {
  value?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "company_type" */
export type CompanyTypeMaxOrderBy = {
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyTypeMinFields = {
  value?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "company_type" */
export type CompanyTypeMinOrderBy = {
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "company_type" */
export type CompanyTypeMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<CompanyType>;
};

/** input type for inserting object relation for remote table "company_type" */
export type CompanyTypeObjRelInsertInput = {
  data: CompanyTypeInsertInput;
  on_conflict?: Maybe<CompanyTypeOnConflict>;
};

/** on conflict condition type for table "company_type" */
export type CompanyTypeOnConflict = {
  constraint: CompanyTypeConstraint;
  update_columns: Array<CompanyTypeUpdateColumn>;
  where?: Maybe<CompanyTypeBoolExp>;
};

/** ordering options when selecting data from "company_type" */
export type CompanyTypeOrderBy = {
  value?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_type" */
export type CompanyTypePkColumnsInput = {
  value: Scalars["String"];
};

/** select columns of table "company_type" */
export enum CompanyTypeSelectColumn {
  /** column name */
  Value = "value",
}

/** input type for updating data in table "company_type" */
export type CompanyTypeSetInput = {
  value?: Maybe<Scalars["String"]>;
};

/** update columns of table "company_type" */
export enum CompanyTypeUpdateColumn {
  /** column name */
  Value = "value",
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
  /** Bank account which Bespoke Financial sends advances to */
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
  /** unique or primary key constraint */
  CompanyVendorPartnershipsCompanyIdVendorIdKey = "company_vendor_partnerships_company_id_vendor_id_key",
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
  /** either the end date, or the termination_date if set */
  adjusted_end_date?: Maybe<Scalars["date"]>;
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
  /** An object relationship */
  modified_by_user?: Maybe<Users>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  product_config: Scalars["jsonb"];
  product_type: ProductTypeEnum;
  start_date: Scalars["date"];
  terminated_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  terminated_by_user?: Maybe<Users>;
  terminated_by_user_id?: Maybe<Scalars["uuid"]>;
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
  adjusted_end_date?: Maybe<DateComparisonExp>;
  companies?: Maybe<CompaniesBoolExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  end_date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  modified_at?: Maybe<TimestamptzComparisonExp>;
  modified_by_user?: Maybe<UsersBoolExp>;
  modified_by_user_id?: Maybe<UuidComparisonExp>;
  product_config?: Maybe<JsonbComparisonExp>;
  product_type?: Maybe<ProductTypeEnumComparisonExp>;
  start_date?: Maybe<DateComparisonExp>;
  terminated_at?: Maybe<TimestamptzComparisonExp>;
  terminated_by_user?: Maybe<UsersBoolExp>;
  terminated_by_user_id?: Maybe<UuidComparisonExp>;
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
  adjusted_end_date?: Maybe<Scalars["date"]>;
  companies?: Maybe<CompaniesArrRelInsertInput>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user?: Maybe<UsersObjRelInsertInput>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  product_config?: Maybe<Scalars["jsonb"]>;
  product_type?: Maybe<ProductTypeEnum>;
  start_date?: Maybe<Scalars["date"]>;
  terminated_at?: Maybe<Scalars["timestamptz"]>;
  terminated_by_user?: Maybe<UsersObjRelInsertInput>;
  terminated_by_user_id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type ContractsMaxFields = {
  adjusted_end_date?: Maybe<Scalars["date"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  start_date?: Maybe<Scalars["date"]>;
  terminated_at?: Maybe<Scalars["timestamptz"]>;
  terminated_by_user_id?: Maybe<Scalars["uuid"]>;
};

/** order by max() on columns of table "contracts" */
export type ContractsMaxOrderBy = {
  adjusted_end_date?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  end_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  start_date?: Maybe<OrderBy>;
  terminated_at?: Maybe<OrderBy>;
  terminated_by_user_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type ContractsMinFields = {
  adjusted_end_date?: Maybe<Scalars["date"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  start_date?: Maybe<Scalars["date"]>;
  terminated_at?: Maybe<Scalars["timestamptz"]>;
  terminated_by_user_id?: Maybe<Scalars["uuid"]>;
};

/** order by min() on columns of table "contracts" */
export type ContractsMinOrderBy = {
  adjusted_end_date?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  end_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  start_date?: Maybe<OrderBy>;
  terminated_at?: Maybe<OrderBy>;
  terminated_by_user_id?: Maybe<OrderBy>;
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
  adjusted_end_date?: Maybe<OrderBy>;
  companies_aggregate?: Maybe<CompaniesAggregateOrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  end_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user?: Maybe<UsersOrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  product_config?: Maybe<OrderBy>;
  product_type?: Maybe<OrderBy>;
  start_date?: Maybe<OrderBy>;
  terminated_at?: Maybe<OrderBy>;
  terminated_by_user?: Maybe<UsersOrderBy>;
  terminated_by_user_id?: Maybe<OrderBy>;
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
  AdjustedEndDate = "adjusted_end_date",
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
  /** column name */
  TerminatedAt = "terminated_at",
  /** column name */
  TerminatedByUserId = "terminated_by_user_id",
}

/** input type for updating data in table "contracts" */
export type ContractsSetInput = {
  adjusted_end_date?: Maybe<Scalars["date"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  end_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  product_config?: Maybe<Scalars["jsonb"]>;
  product_type?: Maybe<ProductTypeEnum>;
  start_date?: Maybe<Scalars["date"]>;
  terminated_at?: Maybe<Scalars["timestamptz"]>;
  terminated_by_user_id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "contracts" */
export enum ContractsUpdateColumn {
  /** column name */
  AdjustedEndDate = "adjusted_end_date",
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
  /** column name */
  TerminatedAt = "terminated_at",
  /** column name */
  TerminatedByUserId = "terminated_by_user_id",
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
 * EBBA stands for Eligible Borrowing Base Amount: this is a table of applications to borrow via a line of credit with information required to determine a Borrowing Base
 *
 *
 * columns and relationships of "ebba_applications"
 */
export type EbbaApplications = {
  amount_cash_in_daca?: Maybe<Scalars["numeric"]>;
  application_date: Scalars["date"];
  approved_at?: Maybe<Scalars["timestamptz"]>;
  calculated_borrowing_base?: Maybe<Scalars["numeric"]>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  created_at: Scalars["timestamptz"];
  /** An array relationship */
  ebba_application_files: Array<EbbaApplicationFiles>;
  /** An aggregated array relationship */
  ebba_application_files_aggregate: EbbaApplicationFilesAggregate;
  expires_at: Scalars["date"];
  id: Scalars["uuid"];
  is_deleted: Scalars["Boolean"];
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
  rejected_at?: Maybe<Scalars["timestamp"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status: RequestStatusEnum;
  updated_at: Scalars["timestamptz"];
};

/**
 * EBBA stands for Eligible Borrowing Base Amount: this is a table of applications to borrow via a line of credit with information required to determine a Borrowing Base
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
 * EBBA stands for Eligible Borrowing Base Amount: this is a table of applications to borrow via a line of credit with information required to determine a Borrowing Base
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
  amount_cash_in_daca?: Maybe<Scalars["Float"]>;
  calculated_borrowing_base?: Maybe<Scalars["Float"]>;
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "ebba_applications" */
export type EbbaApplicationsAvgOrderBy = {
  amount_cash_in_daca?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "ebba_applications". All fields are combined with a logical 'AND'. */
export type EbbaApplicationsBoolExp = {
  _and?: Maybe<Array<Maybe<EbbaApplicationsBoolExp>>>;
  _not?: Maybe<EbbaApplicationsBoolExp>;
  _or?: Maybe<Array<Maybe<EbbaApplicationsBoolExp>>>;
  amount_cash_in_daca?: Maybe<NumericComparisonExp>;
  application_date?: Maybe<DateComparisonExp>;
  approved_at?: Maybe<TimestamptzComparisonExp>;
  calculated_borrowing_base?: Maybe<NumericComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  ebba_application_files?: Maybe<EbbaApplicationFilesBoolExp>;
  expires_at?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  is_deleted?: Maybe<BooleanComparisonExp>;
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
  amount_cash_in_daca?: Maybe<Scalars["numeric"]>;
  calculated_borrowing_base?: Maybe<Scalars["numeric"]>;
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "ebba_applications" */
export type EbbaApplicationsInsertInput = {
  amount_cash_in_daca?: Maybe<Scalars["numeric"]>;
  application_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  calculated_borrowing_base?: Maybe<Scalars["numeric"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  ebba_application_files?: Maybe<EbbaApplicationFilesArrRelInsertInput>;
  expires_at?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
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
  amount_cash_in_daca?: Maybe<Scalars["numeric"]>;
  application_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  calculated_borrowing_base?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  expires_at?: Maybe<Scalars["date"]>;
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
  amount_cash_in_daca?: Maybe<OrderBy>;
  application_date?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  expires_at?: Maybe<OrderBy>;
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
  amount_cash_in_daca?: Maybe<Scalars["numeric"]>;
  application_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  calculated_borrowing_base?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  expires_at?: Maybe<Scalars["date"]>;
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
  amount_cash_in_daca?: Maybe<OrderBy>;
  application_date?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  expires_at?: Maybe<OrderBy>;
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
  amount_cash_in_daca?: Maybe<OrderBy>;
  application_date?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  ebba_application_files_aggregate?: Maybe<EbbaApplicationFilesAggregateOrderBy>;
  expires_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  is_deleted?: Maybe<OrderBy>;
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
  AmountCashInDaca = "amount_cash_in_daca",
  /** column name */
  ApplicationDate = "application_date",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CalculatedBorrowingBase = "calculated_borrowing_base",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  ExpiresAt = "expires_at",
  /** column name */
  Id = "id",
  /** column name */
  IsDeleted = "is_deleted",
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
  amount_cash_in_daca?: Maybe<Scalars["numeric"]>;
  application_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  calculated_borrowing_base?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  expires_at?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
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
  amount_cash_in_daca?: Maybe<Scalars["Float"]>;
  calculated_borrowing_base?: Maybe<Scalars["Float"]>;
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "ebba_applications" */
export type EbbaApplicationsStddevOrderBy = {
  amount_cash_in_daca?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type EbbaApplicationsStddevPopFields = {
  amount_cash_in_daca?: Maybe<Scalars["Float"]>;
  calculated_borrowing_base?: Maybe<Scalars["Float"]>;
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "ebba_applications" */
export type EbbaApplicationsStddevPopOrderBy = {
  amount_cash_in_daca?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type EbbaApplicationsStddevSampFields = {
  amount_cash_in_daca?: Maybe<Scalars["Float"]>;
  calculated_borrowing_base?: Maybe<Scalars["Float"]>;
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "ebba_applications" */
export type EbbaApplicationsStddevSampOrderBy = {
  amount_cash_in_daca?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type EbbaApplicationsSumFields = {
  amount_cash_in_daca?: Maybe<Scalars["numeric"]>;
  calculated_borrowing_base?: Maybe<Scalars["numeric"]>;
  monthly_accounts_receivable?: Maybe<Scalars["numeric"]>;
  monthly_cash?: Maybe<Scalars["numeric"]>;
  monthly_inventory?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "ebba_applications" */
export type EbbaApplicationsSumOrderBy = {
  amount_cash_in_daca?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** update columns of table "ebba_applications" */
export enum EbbaApplicationsUpdateColumn {
  /** column name */
  AmountCashInDaca = "amount_cash_in_daca",
  /** column name */
  ApplicationDate = "application_date",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CalculatedBorrowingBase = "calculated_borrowing_base",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  ExpiresAt = "expires_at",
  /** column name */
  Id = "id",
  /** column name */
  IsDeleted = "is_deleted",
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
  amount_cash_in_daca?: Maybe<Scalars["Float"]>;
  calculated_borrowing_base?: Maybe<Scalars["Float"]>;
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "ebba_applications" */
export type EbbaApplicationsVarPopOrderBy = {
  amount_cash_in_daca?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type EbbaApplicationsVarSampFields = {
  amount_cash_in_daca?: Maybe<Scalars["Float"]>;
  calculated_borrowing_base?: Maybe<Scalars["Float"]>;
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "ebba_applications" */
export type EbbaApplicationsVarSampOrderBy = {
  amount_cash_in_daca?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
  monthly_accounts_receivable?: Maybe<OrderBy>;
  monthly_cash?: Maybe<OrderBy>;
  monthly_inventory?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type EbbaApplicationsVarianceFields = {
  amount_cash_in_daca?: Maybe<Scalars["Float"]>;
  calculated_borrowing_base?: Maybe<Scalars["Float"]>;
  monthly_accounts_receivable?: Maybe<Scalars["Float"]>;
  monthly_cash?: Maybe<Scalars["Float"]>;
  monthly_inventory?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "ebba_applications" */
export type EbbaApplicationsVarianceOrderBy = {
  amount_cash_in_daca?: Maybe<OrderBy>;
  calculated_borrowing_base?: Maybe<OrderBy>;
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
  /** An array relationship */
  invoice_files: Array<InvoiceFiles>;
  /** An aggregated array relationship */
  invoice_files_aggregate: InvoiceFilesAggregate;
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
export type FilesInvoiceFilesArgs = {
  distinct_on?: Maybe<Array<InvoiceFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFilesOrderBy>>;
  where?: Maybe<InvoiceFilesBoolExp>;
};

/**
 * Table to keep track of files stored on the platform
 *
 *
 * columns and relationships of "files"
 */
export type FilesInvoiceFilesAggregateArgs = {
  distinct_on?: Maybe<Array<InvoiceFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFilesOrderBy>>;
  where?: Maybe<InvoiceFilesBoolExp>;
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
  invoice_files?: Maybe<InvoiceFilesBoolExp>;
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
  invoice_files?: Maybe<InvoiceFilesArrRelInsertInput>;
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
  invoice_files_aggregate?: Maybe<InvoiceFilesAggregateOrderBy>;
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
  account_level_balance_payload?: Maybe<Scalars["jsonb"]>;
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit: Scalars["numeric"];
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  date: Scalars["date"];
  /** This is the day the customer met their volume discount threshold for their contract term */
  day_volume_threshold_met?: Maybe<Scalars["date"]>;
  id: Scalars["uuid"];
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  minimum_monthly_payload?: Maybe<Scalars["jsonb"]>;
  total_limit: Scalars["numeric"];
  total_outstanding_fees: Scalars["numeric"];
  total_outstanding_interest: Scalars["numeric"];
  total_outstanding_principal: Scalars["numeric"];
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state: Scalars["numeric"];
};

/** columns and relationships of "financial_summaries" */
export type FinancialSummariesAccountLevelBalancePayloadArgs = {
  path?: Maybe<Scalars["String"]>;
};

/** columns and relationships of "financial_summaries" */
export type FinancialSummariesMinimumMonthlyPayloadArgs = {
  path?: Maybe<Scalars["String"]>;
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

/** append existing jsonb value of filtered columns with new jsonb value */
export type FinancialSummariesAppendInput = {
  account_level_balance_payload?: Maybe<Scalars["jsonb"]>;
  minimum_monthly_payload?: Maybe<Scalars["jsonb"]>;
};

/** input type for inserting array relation for remote table "financial_summaries" */
export type FinancialSummariesArrRelInsertInput = {
  data: Array<FinancialSummariesInsertInput>;
  on_conflict?: Maybe<FinancialSummariesOnConflict>;
};

/** aggregate avg on columns */
export type FinancialSummariesAvgFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "financial_summaries" */
export type FinancialSummariesAvgOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "financial_summaries". All fields are combined with a logical 'AND'. */
export type FinancialSummariesBoolExp = {
  _and?: Maybe<Array<Maybe<FinancialSummariesBoolExp>>>;
  _not?: Maybe<FinancialSummariesBoolExp>;
  _or?: Maybe<Array<Maybe<FinancialSummariesBoolExp>>>;
  account_level_balance_payload?: Maybe<JsonbComparisonExp>;
  adjusted_total_limit?: Maybe<NumericComparisonExp>;
  available_limit?: Maybe<NumericComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  date?: Maybe<DateComparisonExp>;
  day_volume_threshold_met?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  interest_accrued_today?: Maybe<NumericComparisonExp>;
  minimum_monthly_payload?: Maybe<JsonbComparisonExp>;
  total_limit?: Maybe<NumericComparisonExp>;
  total_outstanding_fees?: Maybe<NumericComparisonExp>;
  total_outstanding_interest?: Maybe<NumericComparisonExp>;
  total_outstanding_principal?: Maybe<NumericComparisonExp>;
  total_outstanding_principal_for_interest?: Maybe<NumericComparisonExp>;
  total_principal_in_requested_state?: Maybe<NumericComparisonExp>;
};

/** unique or primary key constraints on table "financial_summaries" */
export enum FinancialSummariesConstraint {
  /** unique or primary key constraint */
  FinancialSummariesCompanyIdDateKey = "financial_summaries_company_id_date_key",
  /** unique or primary key constraint */
  FinancialSummariesPkey = "financial_summaries_pkey",
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type FinancialSummariesDeleteAtPathInput = {
  account_level_balance_payload?: Maybe<Array<Maybe<Scalars["String"]>>>;
  minimum_monthly_payload?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type FinancialSummariesDeleteElemInput = {
  account_level_balance_payload?: Maybe<Scalars["Int"]>;
  minimum_monthly_payload?: Maybe<Scalars["Int"]>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type FinancialSummariesDeleteKeyInput = {
  account_level_balance_payload?: Maybe<Scalars["String"]>;
  minimum_monthly_payload?: Maybe<Scalars["String"]>;
};

/** input type for incrementing integer column in table "financial_summaries" */
export type FinancialSummariesIncInput = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "financial_summaries" */
export type FinancialSummariesInsertInput = {
  account_level_balance_payload?: Maybe<Scalars["jsonb"]>;
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  date?: Maybe<Scalars["date"]>;
  day_volume_threshold_met?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  minimum_monthly_payload?: Maybe<Scalars["jsonb"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** aggregate max on columns */
export type FinancialSummariesMaxFields = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  date?: Maybe<Scalars["date"]>;
  day_volume_threshold_met?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by max() on columns of table "financial_summaries" */
export type FinancialSummariesMaxOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  day_volume_threshold_met?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type FinancialSummariesMinFields = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  date?: Maybe<Scalars["date"]>;
  day_volume_threshold_met?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by min() on columns of table "financial_summaries" */
export type FinancialSummariesMinOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  day_volume_threshold_met?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
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
  account_level_balance_payload?: Maybe<OrderBy>;
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  date?: Maybe<OrderBy>;
  day_volume_threshold_met?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  minimum_monthly_payload?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** primary key columns input for table: "financial_summaries" */
export type FinancialSummariesPkColumnsInput = {
  id: Scalars["uuid"];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type FinancialSummariesPrependInput = {
  account_level_balance_payload?: Maybe<Scalars["jsonb"]>;
  minimum_monthly_payload?: Maybe<Scalars["jsonb"]>;
};

/** select columns of table "financial_summaries" */
export enum FinancialSummariesSelectColumn {
  /** column name */
  AccountLevelBalancePayload = "account_level_balance_payload",
  /** column name */
  AdjustedTotalLimit = "adjusted_total_limit",
  /** column name */
  AvailableLimit = "available_limit",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  Date = "date",
  /** column name */
  DayVolumeThresholdMet = "day_volume_threshold_met",
  /** column name */
  Id = "id",
  /** column name */
  InterestAccruedToday = "interest_accrued_today",
  /** column name */
  MinimumMonthlyPayload = "minimum_monthly_payload",
  /** column name */
  TotalLimit = "total_limit",
  /** column name */
  TotalOutstandingFees = "total_outstanding_fees",
  /** column name */
  TotalOutstandingInterest = "total_outstanding_interest",
  /** column name */
  TotalOutstandingPrincipal = "total_outstanding_principal",
  /** column name */
  TotalOutstandingPrincipalForInterest = "total_outstanding_principal_for_interest",
  /** column name */
  TotalPrincipalInRequestedState = "total_principal_in_requested_state",
}

/** input type for updating data in table "financial_summaries" */
export type FinancialSummariesSetInput = {
  account_level_balance_payload?: Maybe<Scalars["jsonb"]>;
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  date?: Maybe<Scalars["date"]>;
  day_volume_threshold_met?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  minimum_monthly_payload?: Maybe<Scalars["jsonb"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** aggregate stddev on columns */
export type FinancialSummariesStddevFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "financial_summaries" */
export type FinancialSummariesStddevOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type FinancialSummariesStddevPopFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "financial_summaries" */
export type FinancialSummariesStddevPopOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type FinancialSummariesStddevSampFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "financial_summaries" */
export type FinancialSummariesStddevSampOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type FinancialSummariesSumFields = {
  adjusted_total_limit?: Maybe<Scalars["numeric"]>;
  available_limit?: Maybe<Scalars["numeric"]>;
  interest_accrued_today?: Maybe<Scalars["numeric"]>;
  total_limit?: Maybe<Scalars["numeric"]>;
  total_outstanding_fees?: Maybe<Scalars["numeric"]>;
  total_outstanding_interest?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal?: Maybe<Scalars["numeric"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["numeric"]>;
  total_principal_in_requested_state?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "financial_summaries" */
export type FinancialSummariesSumOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** update columns of table "financial_summaries" */
export enum FinancialSummariesUpdateColumn {
  /** column name */
  AccountLevelBalancePayload = "account_level_balance_payload",
  /** column name */
  AdjustedTotalLimit = "adjusted_total_limit",
  /** column name */
  AvailableLimit = "available_limit",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  Date = "date",
  /** column name */
  DayVolumeThresholdMet = "day_volume_threshold_met",
  /** column name */
  Id = "id",
  /** column name */
  InterestAccruedToday = "interest_accrued_today",
  /** column name */
  MinimumMonthlyPayload = "minimum_monthly_payload",
  /** column name */
  TotalLimit = "total_limit",
  /** column name */
  TotalOutstandingFees = "total_outstanding_fees",
  /** column name */
  TotalOutstandingInterest = "total_outstanding_interest",
  /** column name */
  TotalOutstandingPrincipal = "total_outstanding_principal",
  /** column name */
  TotalOutstandingPrincipalForInterest = "total_outstanding_principal_for_interest",
  /** column name */
  TotalPrincipalInRequestedState = "total_principal_in_requested_state",
}

/** aggregate var_pop on columns */
export type FinancialSummariesVarPopFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "financial_summaries" */
export type FinancialSummariesVarPopOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type FinancialSummariesVarSampFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "financial_summaries" */
export type FinancialSummariesVarSampOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type FinancialSummariesVarianceFields = {
  adjusted_total_limit?: Maybe<Scalars["Float"]>;
  available_limit?: Maybe<Scalars["Float"]>;
  interest_accrued_today?: Maybe<Scalars["Float"]>;
  total_limit?: Maybe<Scalars["Float"]>;
  total_outstanding_fees?: Maybe<Scalars["Float"]>;
  total_outstanding_interest?: Maybe<Scalars["Float"]>;
  total_outstanding_principal?: Maybe<Scalars["Float"]>;
  total_outstanding_principal_for_interest?: Maybe<Scalars["Float"]>;
  total_principal_in_requested_state?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "financial_summaries" */
export type FinancialSummariesVarianceOrderBy = {
  adjusted_total_limit?: Maybe<OrderBy>;
  available_limit?: Maybe<OrderBy>;
  interest_accrued_today?: Maybe<OrderBy>;
  total_limit?: Maybe<OrderBy>;
  total_outstanding_fees?: Maybe<OrderBy>;
  total_outstanding_interest?: Maybe<OrderBy>;
  total_outstanding_principal?: Maybe<OrderBy>;
  total_outstanding_principal_for_interest?: Maybe<OrderBy>;
  total_principal_in_requested_state?: Maybe<OrderBy>;
};

/** columns and relationships of "invoice_file_type" */
export type InvoiceFileType = {
  display_name: Scalars["String"];
  value: Scalars["String"];
};

/** aggregated selection of "invoice_file_type" */
export type InvoiceFileTypeAggregate = {
  aggregate?: Maybe<InvoiceFileTypeAggregateFields>;
  nodes: Array<InvoiceFileType>;
};

/** aggregate fields of "invoice_file_type" */
export type InvoiceFileTypeAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<InvoiceFileTypeMaxFields>;
  min?: Maybe<InvoiceFileTypeMinFields>;
};

/** aggregate fields of "invoice_file_type" */
export type InvoiceFileTypeAggregateFieldsCountArgs = {
  columns?: Maybe<Array<InvoiceFileTypeSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "invoice_file_type" */
export type InvoiceFileTypeAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<InvoiceFileTypeMaxOrderBy>;
  min?: Maybe<InvoiceFileTypeMinOrderBy>;
};

/** input type for inserting array relation for remote table "invoice_file_type" */
export type InvoiceFileTypeArrRelInsertInput = {
  data: Array<InvoiceFileTypeInsertInput>;
  on_conflict?: Maybe<InvoiceFileTypeOnConflict>;
};

/** Boolean expression to filter rows from the table "invoice_file_type". All fields are combined with a logical 'AND'. */
export type InvoiceFileTypeBoolExp = {
  _and?: Maybe<Array<Maybe<InvoiceFileTypeBoolExp>>>;
  _not?: Maybe<InvoiceFileTypeBoolExp>;
  _or?: Maybe<Array<Maybe<InvoiceFileTypeBoolExp>>>;
  display_name?: Maybe<StringComparisonExp>;
  value?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "invoice_file_type" */
export enum InvoiceFileTypeConstraint {
  /** unique or primary key constraint */
  InvoiceFileTypePkey = "invoice_file_type_pkey",
}

export enum InvoiceFileTypeEnum {
  /** Cannabis */
  Cannabis = "cannabis",
  /** Invoice */
  Invoice = "invoice",
}

/** expression to compare columns of type invoice_file_type_enum. All fields are combined with logical 'AND'. */
export type InvoiceFileTypeEnumComparisonExp = {
  _eq?: Maybe<InvoiceFileTypeEnum>;
  _in?: Maybe<Array<InvoiceFileTypeEnum>>;
  _is_null?: Maybe<Scalars["Boolean"]>;
  _neq?: Maybe<InvoiceFileTypeEnum>;
  _nin?: Maybe<Array<InvoiceFileTypeEnum>>;
};

/** input type for inserting data into table "invoice_file_type" */
export type InvoiceFileTypeInsertInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type InvoiceFileTypeMaxFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by max() on columns of table "invoice_file_type" */
export type InvoiceFileTypeMaxOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type InvoiceFileTypeMinFields = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** order by min() on columns of table "invoice_file_type" */
export type InvoiceFileTypeMinOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** response of any mutation on the table "invoice_file_type" */
export type InvoiceFileTypeMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<InvoiceFileType>;
};

/** input type for inserting object relation for remote table "invoice_file_type" */
export type InvoiceFileTypeObjRelInsertInput = {
  data: InvoiceFileTypeInsertInput;
  on_conflict?: Maybe<InvoiceFileTypeOnConflict>;
};

/** on conflict condition type for table "invoice_file_type" */
export type InvoiceFileTypeOnConflict = {
  constraint: InvoiceFileTypeConstraint;
  update_columns: Array<InvoiceFileTypeUpdateColumn>;
  where?: Maybe<InvoiceFileTypeBoolExp>;
};

/** ordering options when selecting data from "invoice_file_type" */
export type InvoiceFileTypeOrderBy = {
  display_name?: Maybe<OrderBy>;
  value?: Maybe<OrderBy>;
};

/** primary key columns input for table: "invoice_file_type" */
export type InvoiceFileTypePkColumnsInput = {
  value: Scalars["String"];
};

/** select columns of table "invoice_file_type" */
export enum InvoiceFileTypeSelectColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** input type for updating data in table "invoice_file_type" */
export type InvoiceFileTypeSetInput = {
  display_name?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["String"]>;
};

/** update columns of table "invoice_file_type" */
export enum InvoiceFileTypeUpdateColumn {
  /** column name */
  DisplayName = "display_name",
  /** column name */
  Value = "value",
}

/** columns and relationships of "invoice_files" */
export type InvoiceFiles = {
  /** An object relationship */
  file: Files;
  file_id: Scalars["uuid"];
  file_type: InvoiceFileTypeEnum;
  /** An object relationship */
  invoice: Invoices;
  invoice_id: Scalars["uuid"];
};

/** aggregated selection of "invoice_files" */
export type InvoiceFilesAggregate = {
  aggregate?: Maybe<InvoiceFilesAggregateFields>;
  nodes: Array<InvoiceFiles>;
};

/** aggregate fields of "invoice_files" */
export type InvoiceFilesAggregateFields = {
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<InvoiceFilesMaxFields>;
  min?: Maybe<InvoiceFilesMinFields>;
};

/** aggregate fields of "invoice_files" */
export type InvoiceFilesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<InvoiceFilesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "invoice_files" */
export type InvoiceFilesAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<InvoiceFilesMaxOrderBy>;
  min?: Maybe<InvoiceFilesMinOrderBy>;
};

/** input type for inserting array relation for remote table "invoice_files" */
export type InvoiceFilesArrRelInsertInput = {
  data: Array<InvoiceFilesInsertInput>;
  on_conflict?: Maybe<InvoiceFilesOnConflict>;
};

/** Boolean expression to filter rows from the table "invoice_files". All fields are combined with a logical 'AND'. */
export type InvoiceFilesBoolExp = {
  _and?: Maybe<Array<Maybe<InvoiceFilesBoolExp>>>;
  _not?: Maybe<InvoiceFilesBoolExp>;
  _or?: Maybe<Array<Maybe<InvoiceFilesBoolExp>>>;
  file?: Maybe<FilesBoolExp>;
  file_id?: Maybe<UuidComparisonExp>;
  file_type?: Maybe<InvoiceFileTypeEnumComparisonExp>;
  invoice?: Maybe<InvoicesBoolExp>;
  invoice_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "invoice_files" */
export enum InvoiceFilesConstraint {
  /** unique or primary key constraint */
  InvoiceFilesPkey = "invoice_files_pkey",
}

/** input type for inserting data into table "invoice_files" */
export type InvoiceFilesInsertInput = {
  file?: Maybe<FilesObjRelInsertInput>;
  file_id?: Maybe<Scalars["uuid"]>;
  file_type?: Maybe<InvoiceFileTypeEnum>;
  invoice?: Maybe<InvoicesObjRelInsertInput>;
  invoice_id?: Maybe<Scalars["uuid"]>;
};

/** aggregate max on columns */
export type InvoiceFilesMaxFields = {
  file_id?: Maybe<Scalars["uuid"]>;
  invoice_id?: Maybe<Scalars["uuid"]>;
};

/** order by max() on columns of table "invoice_files" */
export type InvoiceFilesMaxOrderBy = {
  file_id?: Maybe<OrderBy>;
  invoice_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type InvoiceFilesMinFields = {
  file_id?: Maybe<Scalars["uuid"]>;
  invoice_id?: Maybe<Scalars["uuid"]>;
};

/** order by min() on columns of table "invoice_files" */
export type InvoiceFilesMinOrderBy = {
  file_id?: Maybe<OrderBy>;
  invoice_id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "invoice_files" */
export type InvoiceFilesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<InvoiceFiles>;
};

/** input type for inserting object relation for remote table "invoice_files" */
export type InvoiceFilesObjRelInsertInput = {
  data: InvoiceFilesInsertInput;
  on_conflict?: Maybe<InvoiceFilesOnConflict>;
};

/** on conflict condition type for table "invoice_files" */
export type InvoiceFilesOnConflict = {
  constraint: InvoiceFilesConstraint;
  update_columns: Array<InvoiceFilesUpdateColumn>;
  where?: Maybe<InvoiceFilesBoolExp>;
};

/** ordering options when selecting data from "invoice_files" */
export type InvoiceFilesOrderBy = {
  file?: Maybe<FilesOrderBy>;
  file_id?: Maybe<OrderBy>;
  file_type?: Maybe<OrderBy>;
  invoice?: Maybe<InvoicesOrderBy>;
  invoice_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "invoice_files" */
export type InvoiceFilesPkColumnsInput = {
  file_id: Scalars["uuid"];
  invoice_id: Scalars["uuid"];
};

/** select columns of table "invoice_files" */
export enum InvoiceFilesSelectColumn {
  /** column name */
  FileId = "file_id",
  /** column name */
  FileType = "file_type",
  /** column name */
  InvoiceId = "invoice_id",
}

/** input type for updating data in table "invoice_files" */
export type InvoiceFilesSetInput = {
  file_id?: Maybe<Scalars["uuid"]>;
  file_type?: Maybe<InvoiceFileTypeEnum>;
  invoice_id?: Maybe<Scalars["uuid"]>;
};

/** update columns of table "invoice_files" */
export enum InvoiceFilesUpdateColumn {
  /** column name */
  FileId = "file_id",
  /** column name */
  FileType = "file_type",
  /** column name */
  InvoiceId = "invoice_id",
}

/**
 * Maintains the collection of company invoices used for both Invoice Financing and PMF
 *
 *
 * columns and relationships of "invoices"
 */
export type Invoices = {
  advance_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  created_at: Scalars["timestamptz"];
  funded_at?: Maybe<Scalars["timestamptz"]>;
  id: Scalars["uuid"];
  invoice_date: Scalars["date"];
  invoice_due_date: Scalars["date"];
  /** An array relationship */
  invoice_files: Array<InvoiceFiles>;
  /** An aggregated array relationship */
  invoice_files_aggregate: InvoiceFilesAggregate;
  invoice_number: Scalars["String"];
  /** This field is used for Invoice Financing product type but NOT for Purchase Money Financing product type */
  is_cannabis: Scalars["Boolean"];
  is_deleted?: Maybe<Scalars["Boolean"]>;
  /** An array relationship */
  loans: Array<Loans>;
  /** An aggregated array relationship */
  loans_aggregate: LoansAggregate;
  /** An object relationship */
  payment?: Maybe<Payments>;
  payment_confirmed_at?: Maybe<Scalars["timestamptz"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  payment_rejected_at?: Maybe<Scalars["timestamptz"]>;
  payment_rejection_note?: Maybe<Scalars["String"]>;
  payment_requested_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  payor?: Maybe<Payors>;
  payor_id: Scalars["uuid"];
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status: RequestStatusEnum;
  subtotal_amount: Scalars["numeric"];
  taxes_amount: Scalars["numeric"];
  total_amount: Scalars["numeric"];
  updated_at: Scalars["timestamptz"];
};

/**
 * Maintains the collection of company invoices used for both Invoice Financing and PMF
 *
 *
 * columns and relationships of "invoices"
 */
export type InvoicesInvoiceFilesArgs = {
  distinct_on?: Maybe<Array<InvoiceFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFilesOrderBy>>;
  where?: Maybe<InvoiceFilesBoolExp>;
};

/**
 * Maintains the collection of company invoices used for both Invoice Financing and PMF
 *
 *
 * columns and relationships of "invoices"
 */
export type InvoicesInvoiceFilesAggregateArgs = {
  distinct_on?: Maybe<Array<InvoiceFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFilesOrderBy>>;
  where?: Maybe<InvoiceFilesBoolExp>;
};

/**
 * Maintains the collection of company invoices used for both Invoice Financing and PMF
 *
 *
 * columns and relationships of "invoices"
 */
export type InvoicesLoansArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/**
 * Maintains the collection of company invoices used for both Invoice Financing and PMF
 *
 *
 * columns and relationships of "invoices"
 */
export type InvoicesLoansAggregateArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};

/** aggregated selection of "invoices" */
export type InvoicesAggregate = {
  aggregate?: Maybe<InvoicesAggregateFields>;
  nodes: Array<Invoices>;
};

/** aggregate fields of "invoices" */
export type InvoicesAggregateFields = {
  avg?: Maybe<InvoicesAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<InvoicesMaxFields>;
  min?: Maybe<InvoicesMinFields>;
  stddev?: Maybe<InvoicesStddevFields>;
  stddev_pop?: Maybe<InvoicesStddevPopFields>;
  stddev_samp?: Maybe<InvoicesStddevSampFields>;
  sum?: Maybe<InvoicesSumFields>;
  var_pop?: Maybe<InvoicesVarPopFields>;
  var_samp?: Maybe<InvoicesVarSampFields>;
  variance?: Maybe<InvoicesVarianceFields>;
};

/** aggregate fields of "invoices" */
export type InvoicesAggregateFieldsCountArgs = {
  columns?: Maybe<Array<InvoicesSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "invoices" */
export type InvoicesAggregateOrderBy = {
  avg?: Maybe<InvoicesAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<InvoicesMaxOrderBy>;
  min?: Maybe<InvoicesMinOrderBy>;
  stddev?: Maybe<InvoicesStddevOrderBy>;
  stddev_pop?: Maybe<InvoicesStddevPopOrderBy>;
  stddev_samp?: Maybe<InvoicesStddevSampOrderBy>;
  sum?: Maybe<InvoicesSumOrderBy>;
  var_pop?: Maybe<InvoicesVarPopOrderBy>;
  var_samp?: Maybe<InvoicesVarSampOrderBy>;
  variance?: Maybe<InvoicesVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "invoices" */
export type InvoicesArrRelInsertInput = {
  data: Array<InvoicesInsertInput>;
  on_conflict?: Maybe<InvoicesOnConflict>;
};

/** aggregate avg on columns */
export type InvoicesAvgFields = {
  subtotal_amount?: Maybe<Scalars["Float"]>;
  taxes_amount?: Maybe<Scalars["Float"]>;
  total_amount?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "invoices" */
export type InvoicesAvgOrderBy = {
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "invoices". All fields are combined with a logical 'AND'. */
export type InvoicesBoolExp = {
  _and?: Maybe<Array<Maybe<InvoicesBoolExp>>>;
  _not?: Maybe<InvoicesBoolExp>;
  _or?: Maybe<Array<Maybe<InvoicesBoolExp>>>;
  advance_date?: Maybe<DateComparisonExp>;
  approved_at?: Maybe<TimestamptzComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  funded_at?: Maybe<TimestamptzComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  invoice_date?: Maybe<DateComparisonExp>;
  invoice_due_date?: Maybe<DateComparisonExp>;
  invoice_files?: Maybe<InvoiceFilesBoolExp>;
  invoice_number?: Maybe<StringComparisonExp>;
  is_cannabis?: Maybe<BooleanComparisonExp>;
  is_deleted?: Maybe<BooleanComparisonExp>;
  loans?: Maybe<LoansBoolExp>;
  payment?: Maybe<PaymentsBoolExp>;
  payment_confirmed_at?: Maybe<TimestamptzComparisonExp>;
  payment_id?: Maybe<UuidComparisonExp>;
  payment_rejected_at?: Maybe<TimestamptzComparisonExp>;
  payment_rejection_note?: Maybe<StringComparisonExp>;
  payment_requested_at?: Maybe<TimestamptzComparisonExp>;
  payor?: Maybe<PayorsBoolExp>;
  payor_id?: Maybe<UuidComparisonExp>;
  rejected_at?: Maybe<TimestamptzComparisonExp>;
  rejection_note?: Maybe<StringComparisonExp>;
  requested_at?: Maybe<TimestamptzComparisonExp>;
  status?: Maybe<RequestStatusEnumComparisonExp>;
  subtotal_amount?: Maybe<NumericComparisonExp>;
  taxes_amount?: Maybe<NumericComparisonExp>;
  total_amount?: Maybe<NumericComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "invoices" */
export enum InvoicesConstraint {
  /** unique or primary key constraint */
  InvoicesPaymentIdKey = "invoices_payment_id_key",
  /** unique or primary key constraint */
  InvoicesPkey = "invoices_pkey",
}

/** input type for incrementing integer column in table "invoices" */
export type InvoicesIncInput = {
  subtotal_amount?: Maybe<Scalars["numeric"]>;
  taxes_amount?: Maybe<Scalars["numeric"]>;
  total_amount?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "invoices" */
export type InvoicesInsertInput = {
  advance_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  invoice_date?: Maybe<Scalars["date"]>;
  invoice_due_date?: Maybe<Scalars["date"]>;
  invoice_files?: Maybe<InvoiceFilesArrRelInsertInput>;
  invoice_number?: Maybe<Scalars["String"]>;
  is_cannabis?: Maybe<Scalars["Boolean"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
  loans?: Maybe<LoansArrRelInsertInput>;
  payment?: Maybe<PaymentsObjRelInsertInput>;
  payment_confirmed_at?: Maybe<Scalars["timestamptz"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  payment_rejected_at?: Maybe<Scalars["timestamptz"]>;
  payment_rejection_note?: Maybe<Scalars["String"]>;
  payment_requested_at?: Maybe<Scalars["timestamptz"]>;
  payor?: Maybe<PayorsObjRelInsertInput>;
  payor_id?: Maybe<Scalars["uuid"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status?: Maybe<RequestStatusEnum>;
  subtotal_amount?: Maybe<Scalars["numeric"]>;
  taxes_amount?: Maybe<Scalars["numeric"]>;
  total_amount?: Maybe<Scalars["numeric"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate max on columns */
export type InvoicesMaxFields = {
  advance_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  invoice_date?: Maybe<Scalars["date"]>;
  invoice_due_date?: Maybe<Scalars["date"]>;
  invoice_number?: Maybe<Scalars["String"]>;
  payment_confirmed_at?: Maybe<Scalars["timestamptz"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  payment_rejected_at?: Maybe<Scalars["timestamptz"]>;
  payment_rejection_note?: Maybe<Scalars["String"]>;
  payment_requested_at?: Maybe<Scalars["timestamptz"]>;
  payor_id?: Maybe<Scalars["uuid"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  subtotal_amount?: Maybe<Scalars["numeric"]>;
  taxes_amount?: Maybe<Scalars["numeric"]>;
  total_amount?: Maybe<Scalars["numeric"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by max() on columns of table "invoices" */
export type InvoicesMaxOrderBy = {
  advance_date?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  invoice_date?: Maybe<OrderBy>;
  invoice_due_date?: Maybe<OrderBy>;
  invoice_number?: Maybe<OrderBy>;
  payment_confirmed_at?: Maybe<OrderBy>;
  payment_id?: Maybe<OrderBy>;
  payment_rejected_at?: Maybe<OrderBy>;
  payment_rejection_note?: Maybe<OrderBy>;
  payment_requested_at?: Maybe<OrderBy>;
  payor_id?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type InvoicesMinFields = {
  advance_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  invoice_date?: Maybe<Scalars["date"]>;
  invoice_due_date?: Maybe<Scalars["date"]>;
  invoice_number?: Maybe<Scalars["String"]>;
  payment_confirmed_at?: Maybe<Scalars["timestamptz"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  payment_rejected_at?: Maybe<Scalars["timestamptz"]>;
  payment_rejection_note?: Maybe<Scalars["String"]>;
  payment_requested_at?: Maybe<Scalars["timestamptz"]>;
  payor_id?: Maybe<Scalars["uuid"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  subtotal_amount?: Maybe<Scalars["numeric"]>;
  taxes_amount?: Maybe<Scalars["numeric"]>;
  total_amount?: Maybe<Scalars["numeric"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by min() on columns of table "invoices" */
export type InvoicesMinOrderBy = {
  advance_date?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  invoice_date?: Maybe<OrderBy>;
  invoice_due_date?: Maybe<OrderBy>;
  invoice_number?: Maybe<OrderBy>;
  payment_confirmed_at?: Maybe<OrderBy>;
  payment_id?: Maybe<OrderBy>;
  payment_rejected_at?: Maybe<OrderBy>;
  payment_rejection_note?: Maybe<OrderBy>;
  payment_requested_at?: Maybe<OrderBy>;
  payor_id?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "invoices" */
export type InvoicesMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<Invoices>;
};

/** input type for inserting object relation for remote table "invoices" */
export type InvoicesObjRelInsertInput = {
  data: InvoicesInsertInput;
  on_conflict?: Maybe<InvoicesOnConflict>;
};

/** on conflict condition type for table "invoices" */
export type InvoicesOnConflict = {
  constraint: InvoicesConstraint;
  update_columns: Array<InvoicesUpdateColumn>;
  where?: Maybe<InvoicesBoolExp>;
};

/** ordering options when selecting data from "invoices" */
export type InvoicesOrderBy = {
  advance_date?: Maybe<OrderBy>;
  approved_at?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  invoice_date?: Maybe<OrderBy>;
  invoice_due_date?: Maybe<OrderBy>;
  invoice_files_aggregate?: Maybe<InvoiceFilesAggregateOrderBy>;
  invoice_number?: Maybe<OrderBy>;
  is_cannabis?: Maybe<OrderBy>;
  is_deleted?: Maybe<OrderBy>;
  loans_aggregate?: Maybe<LoansAggregateOrderBy>;
  payment?: Maybe<PaymentsOrderBy>;
  payment_confirmed_at?: Maybe<OrderBy>;
  payment_id?: Maybe<OrderBy>;
  payment_rejected_at?: Maybe<OrderBy>;
  payment_rejection_note?: Maybe<OrderBy>;
  payment_requested_at?: Maybe<OrderBy>;
  payor?: Maybe<PayorsOrderBy>;
  payor_id?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  status?: Maybe<OrderBy>;
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "invoices" */
export type InvoicesPkColumnsInput = {
  id: Scalars["uuid"];
};

/** select columns of table "invoices" */
export enum InvoicesSelectColumn {
  /** column name */
  AdvanceDate = "advance_date",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  FundedAt = "funded_at",
  /** column name */
  Id = "id",
  /** column name */
  InvoiceDate = "invoice_date",
  /** column name */
  InvoiceDueDate = "invoice_due_date",
  /** column name */
  InvoiceNumber = "invoice_number",
  /** column name */
  IsCannabis = "is_cannabis",
  /** column name */
  IsDeleted = "is_deleted",
  /** column name */
  PaymentConfirmedAt = "payment_confirmed_at",
  /** column name */
  PaymentId = "payment_id",
  /** column name */
  PaymentRejectedAt = "payment_rejected_at",
  /** column name */
  PaymentRejectionNote = "payment_rejection_note",
  /** column name */
  PaymentRequestedAt = "payment_requested_at",
  /** column name */
  PayorId = "payor_id",
  /** column name */
  RejectedAt = "rejected_at",
  /** column name */
  RejectionNote = "rejection_note",
  /** column name */
  RequestedAt = "requested_at",
  /** column name */
  Status = "status",
  /** column name */
  SubtotalAmount = "subtotal_amount",
  /** column name */
  TaxesAmount = "taxes_amount",
  /** column name */
  TotalAmount = "total_amount",
  /** column name */
  UpdatedAt = "updated_at",
}

/** input type for updating data in table "invoices" */
export type InvoicesSetInput = {
  advance_date?: Maybe<Scalars["date"]>;
  approved_at?: Maybe<Scalars["timestamptz"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  invoice_date?: Maybe<Scalars["date"]>;
  invoice_due_date?: Maybe<Scalars["date"]>;
  invoice_number?: Maybe<Scalars["String"]>;
  is_cannabis?: Maybe<Scalars["Boolean"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
  payment_confirmed_at?: Maybe<Scalars["timestamptz"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  payment_rejected_at?: Maybe<Scalars["timestamptz"]>;
  payment_rejection_note?: Maybe<Scalars["String"]>;
  payment_requested_at?: Maybe<Scalars["timestamptz"]>;
  payor_id?: Maybe<Scalars["uuid"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  status?: Maybe<RequestStatusEnum>;
  subtotal_amount?: Maybe<Scalars["numeric"]>;
  taxes_amount?: Maybe<Scalars["numeric"]>;
  total_amount?: Maybe<Scalars["numeric"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate stddev on columns */
export type InvoicesStddevFields = {
  subtotal_amount?: Maybe<Scalars["Float"]>;
  taxes_amount?: Maybe<Scalars["Float"]>;
  total_amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "invoices" */
export type InvoicesStddevOrderBy = {
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type InvoicesStddevPopFields = {
  subtotal_amount?: Maybe<Scalars["Float"]>;
  taxes_amount?: Maybe<Scalars["Float"]>;
  total_amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "invoices" */
export type InvoicesStddevPopOrderBy = {
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type InvoicesStddevSampFields = {
  subtotal_amount?: Maybe<Scalars["Float"]>;
  taxes_amount?: Maybe<Scalars["Float"]>;
  total_amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "invoices" */
export type InvoicesStddevSampOrderBy = {
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type InvoicesSumFields = {
  subtotal_amount?: Maybe<Scalars["numeric"]>;
  taxes_amount?: Maybe<Scalars["numeric"]>;
  total_amount?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "invoices" */
export type InvoicesSumOrderBy = {
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
};

/** update columns of table "invoices" */
export enum InvoicesUpdateColumn {
  /** column name */
  AdvanceDate = "advance_date",
  /** column name */
  ApprovedAt = "approved_at",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  FundedAt = "funded_at",
  /** column name */
  Id = "id",
  /** column name */
  InvoiceDate = "invoice_date",
  /** column name */
  InvoiceDueDate = "invoice_due_date",
  /** column name */
  InvoiceNumber = "invoice_number",
  /** column name */
  IsCannabis = "is_cannabis",
  /** column name */
  IsDeleted = "is_deleted",
  /** column name */
  PaymentConfirmedAt = "payment_confirmed_at",
  /** column name */
  PaymentId = "payment_id",
  /** column name */
  PaymentRejectedAt = "payment_rejected_at",
  /** column name */
  PaymentRejectionNote = "payment_rejection_note",
  /** column name */
  PaymentRequestedAt = "payment_requested_at",
  /** column name */
  PayorId = "payor_id",
  /** column name */
  RejectedAt = "rejected_at",
  /** column name */
  RejectionNote = "rejection_note",
  /** column name */
  RequestedAt = "requested_at",
  /** column name */
  Status = "status",
  /** column name */
  SubtotalAmount = "subtotal_amount",
  /** column name */
  TaxesAmount = "taxes_amount",
  /** column name */
  TotalAmount = "total_amount",
  /** column name */
  UpdatedAt = "updated_at",
}

/** aggregate var_pop on columns */
export type InvoicesVarPopFields = {
  subtotal_amount?: Maybe<Scalars["Float"]>;
  taxes_amount?: Maybe<Scalars["Float"]>;
  total_amount?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "invoices" */
export type InvoicesVarPopOrderBy = {
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type InvoicesVarSampFields = {
  subtotal_amount?: Maybe<Scalars["Float"]>;
  taxes_amount?: Maybe<Scalars["Float"]>;
  total_amount?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "invoices" */
export type InvoicesVarSampOrderBy = {
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type InvoicesVarianceFields = {
  subtotal_amount?: Maybe<Scalars["Float"]>;
  taxes_amount?: Maybe<Scalars["Float"]>;
  total_amount?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "invoices" */
export type InvoicesVarianceOrderBy = {
  subtotal_amount?: Maybe<OrderBy>;
  taxes_amount?: Maybe<OrderBy>;
  total_amount?: Maybe<OrderBy>;
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
  recipient_vendor?: Maybe<Companies>;
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
  recipient_vendor?: Maybe<CompaniesBoolExp>;
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
  recipient_vendor?: Maybe<CompaniesObjRelInsertInput>;
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
  recipient_vendor?: Maybe<CompaniesOrderBy>;
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
  /** Invoice */
  Invoice = "invoice",
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
  created_at: Scalars["timestamptz"];
  disbursement_identifier?: Maybe<Scalars["String"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  funded_by_user_id?: Maybe<Scalars["uuid"]>;
  id: Scalars["uuid"];
  identifier: Scalars["String"];
  /** An object relationship */
  invoice?: Maybe<Invoices>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
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
  /** The state of a payment which may be relevant to this loan */
  payment_status?: Maybe<Scalars["String"]>;
  /** An object relationship */
  purchase_order?: Maybe<PurchaseOrders>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  /** The date the customer requests the loan to arrive to the recipient bank account (a better name for this column is requested_deposit_date) */
  requested_payment_date?: Maybe<Scalars["date"]>;
  /** This is the loan request status, e.g., drafted, approved, more_details_required, rejected */
  status: LoanStatusEnum;
  /** An array relationship */
  transactions: Array<Transactions>;
  /** An aggregated array relationship */
  transactions_aggregate: TransactionsAggregate;
  updated_at: Scalars["timestamptz"];
};

/**
 * All common fields amongst loans go here, and fields specific to that loan type are joined in by the artifact_id
 *
 *
 * columns and relationships of "loans"
 */
export type LoansTransactionsArgs = {
  distinct_on?: Maybe<Array<TransactionsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TransactionsOrderBy>>;
  where?: Maybe<TransactionsBoolExp>;
};

/**
 * All common fields amongst loans go here, and fields specific to that loan type are joined in by the artifact_id
 *
 *
 * columns and relationships of "loans"
 */
export type LoansTransactionsAggregateArgs = {
  distinct_on?: Maybe<Array<TransactionsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TransactionsOrderBy>>;
  where?: Maybe<TransactionsBoolExp>;
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
  created_at?: Maybe<TimestamptzComparisonExp>;
  disbursement_identifier?: Maybe<StringComparisonExp>;
  funded_at?: Maybe<TimestamptzComparisonExp>;
  funded_by_user_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  identifier?: Maybe<StringComparisonExp>;
  invoice?: Maybe<InvoicesBoolExp>;
  is_deleted?: Maybe<BooleanComparisonExp>;
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
  payment_status?: Maybe<StringComparisonExp>;
  purchase_order?: Maybe<PurchaseOrdersBoolExp>;
  rejected_at?: Maybe<TimestamptzComparisonExp>;
  rejected_by_user_id?: Maybe<UuidComparisonExp>;
  rejection_note?: Maybe<StringComparisonExp>;
  requested_at?: Maybe<TimestamptzComparisonExp>;
  requested_by_user_id?: Maybe<UuidComparisonExp>;
  requested_payment_date?: Maybe<DateComparisonExp>;
  status?: Maybe<LoanStatusEnumComparisonExp>;
  transactions?: Maybe<TransactionsBoolExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "loans" */
export enum LoansConstraint {
  /** unique or primary key constraint */
  LoansCompanyIdIdentifierKey = "loans_company_id_identifier_key",
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
  created_at?: Maybe<Scalars["timestamptz"]>;
  disbursement_identifier?: Maybe<Scalars["String"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  funded_by_user_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  invoice?: Maybe<InvoicesObjRelInsertInput>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
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
  payment_status?: Maybe<Scalars["String"]>;
  purchase_order?: Maybe<PurchaseOrdersObjRelInsertInput>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  status?: Maybe<LoanStatusEnum>;
  transactions?: Maybe<TransactionsArrRelInsertInput>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  created_at?: Maybe<Scalars["timestamptz"]>;
  disbursement_identifier?: Maybe<Scalars["String"]>;
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
  payment_status?: Maybe<Scalars["String"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  created_at?: Maybe<OrderBy>;
  disbursement_identifier?: Maybe<OrderBy>;
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
  payment_status?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejected_by_user_id?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
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
  created_at?: Maybe<Scalars["timestamptz"]>;
  disbursement_identifier?: Maybe<Scalars["String"]>;
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
  payment_status?: Maybe<Scalars["String"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  created_at?: Maybe<OrderBy>;
  disbursement_identifier?: Maybe<OrderBy>;
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
  payment_status?: Maybe<OrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejected_by_user_id?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
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
  created_at?: Maybe<OrderBy>;
  disbursement_identifier?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
  funded_by_user_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  invoice?: Maybe<InvoicesOrderBy>;
  is_deleted?: Maybe<OrderBy>;
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
  payment_status?: Maybe<OrderBy>;
  purchase_order?: Maybe<PurchaseOrdersOrderBy>;
  rejected_at?: Maybe<OrderBy>;
  rejected_by_user_id?: Maybe<OrderBy>;
  rejection_note?: Maybe<OrderBy>;
  requested_at?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  status?: Maybe<OrderBy>;
  transactions_aggregate?: Maybe<TransactionsAggregateOrderBy>;
  updated_at?: Maybe<OrderBy>;
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
  CreatedAt = "created_at",
  /** column name */
  DisbursementIdentifier = "disbursement_identifier",
  /** column name */
  FundedAt = "funded_at",
  /** column name */
  FundedByUserId = "funded_by_user_id",
  /** column name */
  Id = "id",
  /** column name */
  Identifier = "identifier",
  /** column name */
  IsDeleted = "is_deleted",
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
  PaymentStatus = "payment_status",
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
  /** column name */
  UpdatedAt = "updated_at",
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
  created_at?: Maybe<Scalars["timestamptz"]>;
  disbursement_identifier?: Maybe<Scalars["String"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  funded_by_user_id?: Maybe<Scalars["uuid"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
  loan_type?: Maybe<LoanTypeEnum>;
  maturity_date?: Maybe<Scalars["date"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  notes?: Maybe<Scalars["String"]>;
  origination_date?: Maybe<Scalars["date"]>;
  outstanding_fees?: Maybe<Scalars["numeric"]>;
  outstanding_interest?: Maybe<Scalars["numeric"]>;
  outstanding_principal_balance?: Maybe<Scalars["numeric"]>;
  payment_status?: Maybe<Scalars["String"]>;
  rejected_at?: Maybe<Scalars["timestamptz"]>;
  rejected_by_user_id?: Maybe<Scalars["uuid"]>;
  rejection_note?: Maybe<Scalars["String"]>;
  requested_at?: Maybe<Scalars["timestamptz"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  status?: Maybe<LoanStatusEnum>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  CreatedAt = "created_at",
  /** column name */
  DisbursementIdentifier = "disbursement_identifier",
  /** column name */
  FundedAt = "funded_at",
  /** column name */
  FundedByUserId = "funded_by_user_id",
  /** column name */
  Id = "id",
  /** column name */
  Identifier = "identifier",
  /** column name */
  IsDeleted = "is_deleted",
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
  PaymentStatus = "payment_status",
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
  /** column name */
  UpdatedAt = "updated_at",
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
  /** delete data from the table: "audit_events" */
  delete_audit_events?: Maybe<AuditEventsMutationResponse>;
  /** delete single row from the table: "audit_events" */
  delete_audit_events_by_pk?: Maybe<AuditEvents>;
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
  /** delete data from the table: "company_payor_partnerships" */
  delete_company_payor_partnerships?: Maybe<CompanyPayorPartnershipsMutationResponse>;
  /** delete single row from the table: "company_payor_partnerships" */
  delete_company_payor_partnerships_by_pk?: Maybe<CompanyPayorPartnerships>;
  /** delete data from the table: "company_settings" */
  delete_company_settings?: Maybe<CompanySettingsMutationResponse>;
  /** delete single row from the table: "company_settings" */
  delete_company_settings_by_pk?: Maybe<CompanySettings>;
  /** delete data from the table: "company_type" */
  delete_company_type?: Maybe<CompanyTypeMutationResponse>;
  /** delete single row from the table: "company_type" */
  delete_company_type_by_pk?: Maybe<CompanyType>;
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
  /** delete data from the table: "invoice_file_type" */
  delete_invoice_file_type?: Maybe<InvoiceFileTypeMutationResponse>;
  /** delete single row from the table: "invoice_file_type" */
  delete_invoice_file_type_by_pk?: Maybe<InvoiceFileType>;
  /** delete data from the table: "invoice_files" */
  delete_invoice_files?: Maybe<InvoiceFilesMutationResponse>;
  /** delete single row from the table: "invoice_files" */
  delete_invoice_files_by_pk?: Maybe<InvoiceFiles>;
  /** delete data from the table: "invoices" */
  delete_invoices?: Maybe<InvoicesMutationResponse>;
  /** delete single row from the table: "invoices" */
  delete_invoices_by_pk?: Maybe<Invoices>;
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
  /** delete data from the table: "payors" */
  delete_payors?: Maybe<PayorsMutationResponse>;
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
  /** insert data into the table: "audit_events" */
  insert_audit_events?: Maybe<AuditEventsMutationResponse>;
  /** insert a single row into the table: "audit_events" */
  insert_audit_events_one?: Maybe<AuditEvents>;
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
  /** insert data into the table: "company_payor_partnerships" */
  insert_company_payor_partnerships?: Maybe<CompanyPayorPartnershipsMutationResponse>;
  /** insert a single row into the table: "company_payor_partnerships" */
  insert_company_payor_partnerships_one?: Maybe<CompanyPayorPartnerships>;
  /** insert data into the table: "company_settings" */
  insert_company_settings?: Maybe<CompanySettingsMutationResponse>;
  /** insert a single row into the table: "company_settings" */
  insert_company_settings_one?: Maybe<CompanySettings>;
  /** insert data into the table: "company_type" */
  insert_company_type?: Maybe<CompanyTypeMutationResponse>;
  /** insert a single row into the table: "company_type" */
  insert_company_type_one?: Maybe<CompanyType>;
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
  /** insert data into the table: "invoice_file_type" */
  insert_invoice_file_type?: Maybe<InvoiceFileTypeMutationResponse>;
  /** insert a single row into the table: "invoice_file_type" */
  insert_invoice_file_type_one?: Maybe<InvoiceFileType>;
  /** insert data into the table: "invoice_files" */
  insert_invoice_files?: Maybe<InvoiceFilesMutationResponse>;
  /** insert a single row into the table: "invoice_files" */
  insert_invoice_files_one?: Maybe<InvoiceFiles>;
  /** insert data into the table: "invoices" */
  insert_invoices?: Maybe<InvoicesMutationResponse>;
  /** insert a single row into the table: "invoices" */
  insert_invoices_one?: Maybe<Invoices>;
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
  /** insert data into the table: "payors" */
  insert_payors?: Maybe<PayorsMutationResponse>;
  /** insert a single row into the table: "payors" */
  insert_payors_one?: Maybe<Payors>;
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
  /** update data of the table: "audit_events" */
  update_audit_events?: Maybe<AuditEventsMutationResponse>;
  /** update single row of the table: "audit_events" */
  update_audit_events_by_pk?: Maybe<AuditEvents>;
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
  /** update data of the table: "company_payor_partnerships" */
  update_company_payor_partnerships?: Maybe<CompanyPayorPartnershipsMutationResponse>;
  /** update single row of the table: "company_payor_partnerships" */
  update_company_payor_partnerships_by_pk?: Maybe<CompanyPayorPartnerships>;
  /** update data of the table: "company_settings" */
  update_company_settings?: Maybe<CompanySettingsMutationResponse>;
  /** update single row of the table: "company_settings" */
  update_company_settings_by_pk?: Maybe<CompanySettings>;
  /** update data of the table: "company_type" */
  update_company_type?: Maybe<CompanyTypeMutationResponse>;
  /** update single row of the table: "company_type" */
  update_company_type_by_pk?: Maybe<CompanyType>;
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
  /** update data of the table: "invoice_file_type" */
  update_invoice_file_type?: Maybe<InvoiceFileTypeMutationResponse>;
  /** update single row of the table: "invoice_file_type" */
  update_invoice_file_type_by_pk?: Maybe<InvoiceFileType>;
  /** update data of the table: "invoice_files" */
  update_invoice_files?: Maybe<InvoiceFilesMutationResponse>;
  /** update single row of the table: "invoice_files" */
  update_invoice_files_by_pk?: Maybe<InvoiceFiles>;
  /** update data of the table: "invoices" */
  update_invoices?: Maybe<InvoicesMutationResponse>;
  /** update single row of the table: "invoices" */
  update_invoices_by_pk?: Maybe<Invoices>;
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
  /** update data of the table: "payors" */
  update_payors?: Maybe<PayorsMutationResponse>;
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
export type MutationRootDeleteAuditEventsArgs = {
  where: AuditEventsBoolExp;
};

/** mutation root */
export type MutationRootDeleteAuditEventsByPkArgs = {
  id: Scalars["uuid"];
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
export type MutationRootDeleteCompanyPayorPartnershipsArgs = {
  where: CompanyPayorPartnershipsBoolExp;
};

/** mutation root */
export type MutationRootDeleteCompanyPayorPartnershipsByPkArgs = {
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
export type MutationRootDeleteCompanyTypeArgs = {
  where: CompanyTypeBoolExp;
};

/** mutation root */
export type MutationRootDeleteCompanyTypeByPkArgs = {
  value: Scalars["String"];
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
export type MutationRootDeleteInvoiceFileTypeArgs = {
  where: InvoiceFileTypeBoolExp;
};

/** mutation root */
export type MutationRootDeleteInvoiceFileTypeByPkArgs = {
  value: Scalars["String"];
};

/** mutation root */
export type MutationRootDeleteInvoiceFilesArgs = {
  where: InvoiceFilesBoolExp;
};

/** mutation root */
export type MutationRootDeleteInvoiceFilesByPkArgs = {
  file_id: Scalars["uuid"];
  invoice_id: Scalars["uuid"];
};

/** mutation root */
export type MutationRootDeleteInvoicesArgs = {
  where: InvoicesBoolExp;
};

/** mutation root */
export type MutationRootDeleteInvoicesByPkArgs = {
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
export type MutationRootDeletePayorsArgs = {
  where: PayorsBoolExp;
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
export type MutationRootInsertAuditEventsArgs = {
  objects: Array<AuditEventsInsertInput>;
  on_conflict?: Maybe<AuditEventsOnConflict>;
};

/** mutation root */
export type MutationRootInsertAuditEventsOneArgs = {
  object: AuditEventsInsertInput;
  on_conflict?: Maybe<AuditEventsOnConflict>;
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
export type MutationRootInsertCompanyPayorPartnershipsArgs = {
  objects: Array<CompanyPayorPartnershipsInsertInput>;
  on_conflict?: Maybe<CompanyPayorPartnershipsOnConflict>;
};

/** mutation root */
export type MutationRootInsertCompanyPayorPartnershipsOneArgs = {
  object: CompanyPayorPartnershipsInsertInput;
  on_conflict?: Maybe<CompanyPayorPartnershipsOnConflict>;
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
export type MutationRootInsertCompanyTypeArgs = {
  objects: Array<CompanyTypeInsertInput>;
  on_conflict?: Maybe<CompanyTypeOnConflict>;
};

/** mutation root */
export type MutationRootInsertCompanyTypeOneArgs = {
  object: CompanyTypeInsertInput;
  on_conflict?: Maybe<CompanyTypeOnConflict>;
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
export type MutationRootInsertInvoiceFileTypeArgs = {
  objects: Array<InvoiceFileTypeInsertInput>;
  on_conflict?: Maybe<InvoiceFileTypeOnConflict>;
};

/** mutation root */
export type MutationRootInsertInvoiceFileTypeOneArgs = {
  object: InvoiceFileTypeInsertInput;
  on_conflict?: Maybe<InvoiceFileTypeOnConflict>;
};

/** mutation root */
export type MutationRootInsertInvoiceFilesArgs = {
  objects: Array<InvoiceFilesInsertInput>;
  on_conflict?: Maybe<InvoiceFilesOnConflict>;
};

/** mutation root */
export type MutationRootInsertInvoiceFilesOneArgs = {
  object: InvoiceFilesInsertInput;
  on_conflict?: Maybe<InvoiceFilesOnConflict>;
};

/** mutation root */
export type MutationRootInsertInvoicesArgs = {
  objects: Array<InvoicesInsertInput>;
  on_conflict?: Maybe<InvoicesOnConflict>;
};

/** mutation root */
export type MutationRootInsertInvoicesOneArgs = {
  object: InvoicesInsertInput;
  on_conflict?: Maybe<InvoicesOnConflict>;
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
export type MutationRootInsertPayorsArgs = {
  objects: Array<PayorsInsertInput>;
};

/** mutation root */
export type MutationRootInsertPayorsOneArgs = {
  object: PayorsInsertInput;
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
export type MutationRootUpdateAuditEventsArgs = {
  _append?: Maybe<AuditEventsAppendInput>;
  _delete_at_path?: Maybe<AuditEventsDeleteAtPathInput>;
  _delete_elem?: Maybe<AuditEventsDeleteElemInput>;
  _delete_key?: Maybe<AuditEventsDeleteKeyInput>;
  _prepend?: Maybe<AuditEventsPrependInput>;
  _set?: Maybe<AuditEventsSetInput>;
  where: AuditEventsBoolExp;
};

/** mutation root */
export type MutationRootUpdateAuditEventsByPkArgs = {
  _append?: Maybe<AuditEventsAppendInput>;
  _delete_at_path?: Maybe<AuditEventsDeleteAtPathInput>;
  _delete_elem?: Maybe<AuditEventsDeleteElemInput>;
  _delete_key?: Maybe<AuditEventsDeleteKeyInput>;
  _prepend?: Maybe<AuditEventsPrependInput>;
  _set?: Maybe<AuditEventsSetInput>;
  pk_columns: AuditEventsPkColumnsInput;
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
export type MutationRootUpdateCompanyPayorPartnershipsArgs = {
  _set?: Maybe<CompanyPayorPartnershipsSetInput>;
  where: CompanyPayorPartnershipsBoolExp;
};

/** mutation root */
export type MutationRootUpdateCompanyPayorPartnershipsByPkArgs = {
  _set?: Maybe<CompanyPayorPartnershipsSetInput>;
  pk_columns: CompanyPayorPartnershipsPkColumnsInput;
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
export type MutationRootUpdateCompanyTypeArgs = {
  _set?: Maybe<CompanyTypeSetInput>;
  where: CompanyTypeBoolExp;
};

/** mutation root */
export type MutationRootUpdateCompanyTypeByPkArgs = {
  _set?: Maybe<CompanyTypeSetInput>;
  pk_columns: CompanyTypePkColumnsInput;
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
  _append?: Maybe<FinancialSummariesAppendInput>;
  _delete_at_path?: Maybe<FinancialSummariesDeleteAtPathInput>;
  _delete_elem?: Maybe<FinancialSummariesDeleteElemInput>;
  _delete_key?: Maybe<FinancialSummariesDeleteKeyInput>;
  _inc?: Maybe<FinancialSummariesIncInput>;
  _prepend?: Maybe<FinancialSummariesPrependInput>;
  _set?: Maybe<FinancialSummariesSetInput>;
  where: FinancialSummariesBoolExp;
};

/** mutation root */
export type MutationRootUpdateFinancialSummariesByPkArgs = {
  _append?: Maybe<FinancialSummariesAppendInput>;
  _delete_at_path?: Maybe<FinancialSummariesDeleteAtPathInput>;
  _delete_elem?: Maybe<FinancialSummariesDeleteElemInput>;
  _delete_key?: Maybe<FinancialSummariesDeleteKeyInput>;
  _inc?: Maybe<FinancialSummariesIncInput>;
  _prepend?: Maybe<FinancialSummariesPrependInput>;
  _set?: Maybe<FinancialSummariesSetInput>;
  pk_columns: FinancialSummariesPkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateInvoiceFileTypeArgs = {
  _set?: Maybe<InvoiceFileTypeSetInput>;
  where: InvoiceFileTypeBoolExp;
};

/** mutation root */
export type MutationRootUpdateInvoiceFileTypeByPkArgs = {
  _set?: Maybe<InvoiceFileTypeSetInput>;
  pk_columns: InvoiceFileTypePkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateInvoiceFilesArgs = {
  _set?: Maybe<InvoiceFilesSetInput>;
  where: InvoiceFilesBoolExp;
};

/** mutation root */
export type MutationRootUpdateInvoiceFilesByPkArgs = {
  _set?: Maybe<InvoiceFilesSetInput>;
  pk_columns: InvoiceFilesPkColumnsInput;
};

/** mutation root */
export type MutationRootUpdateInvoicesArgs = {
  _inc?: Maybe<InvoicesIncInput>;
  _set?: Maybe<InvoicesSetInput>;
  where: InvoicesBoolExp;
};

/** mutation root */
export type MutationRootUpdateInvoicesByPkArgs = {
  _inc?: Maybe<InvoicesIncInput>;
  _set?: Maybe<InvoicesSetInput>;
  pk_columns: InvoicesPkColumnsInput;
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
export type MutationRootUpdatePayorsArgs = {
  _inc?: Maybe<PayorsIncInput>;
  _set?: Maybe<PayorsSetInput>;
  where: PayorsBoolExp;
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
  _inc?: Maybe<VendorsIncInput>;
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
  /** The amount this payment actually is, as opposed to the requested amount */
  amount?: Maybe<Scalars["numeric"]>;
  bank_note?: Maybe<Scalars["String"]>;
  /** An object relationship */
  company: Companies;
  /** An object relationship */
  company_bank_account?: Maybe<BankAccounts>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id: Scalars["uuid"];
  created_at: Scalars["timestamptz"];
  customer_note?: Maybe<Scalars["String"]>;
  /** The date when payment is credited to destination account */
  deposit_date?: Maybe<Scalars["date"]>;
  id: Scalars["uuid"];
  /** Unique identifier for payments scoped to (company_id, identifier) */
  identifier?: Maybe<Scalars["String"]>;
  /** An object relationship */
  invoice?: Maybe<Invoices>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
  /** JSON blob which records information about this payment: which loans this payment is intended for, how much of this payment is intended to go to principal vs interest, etc */
  items_covered: Scalars["jsonb"];
  method: Scalars["String"];
  /** Mostly used for credits and fees, if this payment for a fee or credit was due to an underlying advance or repayment */
  originating_payment_id?: Maybe<Scalars["uuid"]>;
  /** The date when payment is debited from source account */
  payment_date?: Maybe<Scalars["date"]>;
  /** The amount the customer requests this payment to be */
  requested_amount?: Maybe<Scalars["numeric"]>;
  /** When a customer requests or notifies us a payment should take place, their user id is captured here */
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  /** The date the customer requests the payment to arrive to the recipient bank account (a better name for this column is requested_deposit_date) */
  requested_payment_date?: Maybe<Scalars["date"]>;
  /** When this payment has been settled and applied to loans. This can only be done once. */
  settled_at?: Maybe<Scalars["timestamptz"]>;
  /** An object relationship */
  settled_by_user?: Maybe<Users>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  /** The date when payment is settled and is effective for financial calculations */
  settlement_date?: Maybe<Scalars["date"]>;
  /** Unique identifier for settled payments scoped to (company_id, type, settlement_identifier) */
  settlement_identifier?: Maybe<Scalars["String"]>;
  /** When this payment record was originally added to the Postgres DB */
  submitted_at: Scalars["timestamptz"];
  /** An object relationship */
  submitted_by_user?: Maybe<Users>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  /** An array relationship */
  transactions: Array<Transactions>;
  /** An aggregated array relationship */
  transactions_aggregate: TransactionsAggregate;
  type: Scalars["String"];
  updated_at: Scalars["timestamptz"];
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

/**
 * Payments are dollar amounts transferred to and from the bank
 *
 *
 * columns and relationships of "payments"
 */
export type PaymentsTransactionsArgs = {
  distinct_on?: Maybe<Array<TransactionsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TransactionsOrderBy>>;
  where?: Maybe<TransactionsBoolExp>;
};

/**
 * Payments are dollar amounts transferred to and from the bank
 *
 *
 * columns and relationships of "payments"
 */
export type PaymentsTransactionsAggregateArgs = {
  distinct_on?: Maybe<Array<TransactionsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<TransactionsOrderBy>>;
  where?: Maybe<TransactionsBoolExp>;
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
  requested_amount?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "payments" */
export type PaymentsAvgOrderBy = {
  amount?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "payments". All fields are combined with a logical 'AND'. */
export type PaymentsBoolExp = {
  _and?: Maybe<Array<Maybe<PaymentsBoolExp>>>;
  _not?: Maybe<PaymentsBoolExp>;
  _or?: Maybe<Array<Maybe<PaymentsBoolExp>>>;
  amount?: Maybe<NumericComparisonExp>;
  bank_note?: Maybe<StringComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_bank_account?: Maybe<BankAccountsBoolExp>;
  company_bank_account_id?: Maybe<UuidComparisonExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  customer_note?: Maybe<StringComparisonExp>;
  deposit_date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  identifier?: Maybe<StringComparisonExp>;
  invoice?: Maybe<InvoicesBoolExp>;
  is_deleted?: Maybe<BooleanComparisonExp>;
  items_covered?: Maybe<JsonbComparisonExp>;
  method?: Maybe<StringComparisonExp>;
  originating_payment_id?: Maybe<UuidComparisonExp>;
  payment_date?: Maybe<DateComparisonExp>;
  requested_amount?: Maybe<NumericComparisonExp>;
  requested_by_user_id?: Maybe<UuidComparisonExp>;
  requested_payment_date?: Maybe<DateComparisonExp>;
  settled_at?: Maybe<TimestamptzComparisonExp>;
  settled_by_user?: Maybe<UsersBoolExp>;
  settled_by_user_id?: Maybe<UuidComparisonExp>;
  settlement_date?: Maybe<DateComparisonExp>;
  settlement_identifier?: Maybe<StringComparisonExp>;
  submitted_at?: Maybe<TimestamptzComparisonExp>;
  submitted_by_user?: Maybe<UsersBoolExp>;
  submitted_by_user_id?: Maybe<UuidComparisonExp>;
  transactions?: Maybe<TransactionsBoolExp>;
  type?: Maybe<StringComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
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
  requested_amount?: Maybe<Scalars["numeric"]>;
};

/** input type for inserting data into table "payments" */
export type PaymentsInsertInput = {
  amount?: Maybe<Scalars["numeric"]>;
  bank_note?: Maybe<Scalars["String"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_bank_account?: Maybe<BankAccountsObjRelInsertInput>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  customer_note?: Maybe<Scalars["String"]>;
  deposit_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  invoice?: Maybe<InvoicesObjRelInsertInput>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
  items_covered?: Maybe<Scalars["jsonb"]>;
  method?: Maybe<Scalars["String"]>;
  originating_payment_id?: Maybe<Scalars["uuid"]>;
  payment_date?: Maybe<Scalars["date"]>;
  requested_amount?: Maybe<Scalars["numeric"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user?: Maybe<UsersObjRelInsertInput>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  settlement_date?: Maybe<Scalars["date"]>;
  settlement_identifier?: Maybe<Scalars["String"]>;
  submitted_at?: Maybe<Scalars["timestamptz"]>;
  submitted_by_user?: Maybe<UsersObjRelInsertInput>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  transactions?: Maybe<TransactionsArrRelInsertInput>;
  type?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate max on columns */
export type PaymentsMaxFields = {
  amount?: Maybe<Scalars["numeric"]>;
  bank_note?: Maybe<Scalars["String"]>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  customer_note?: Maybe<Scalars["String"]>;
  deposit_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  method?: Maybe<Scalars["String"]>;
  originating_payment_id?: Maybe<Scalars["uuid"]>;
  payment_date?: Maybe<Scalars["date"]>;
  requested_amount?: Maybe<Scalars["numeric"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  settlement_date?: Maybe<Scalars["date"]>;
  settlement_identifier?: Maybe<Scalars["String"]>;
  submitted_at?: Maybe<Scalars["timestamptz"]>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  type?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by max() on columns of table "payments" */
export type PaymentsMaxOrderBy = {
  amount?: Maybe<OrderBy>;
  bank_note?: Maybe<OrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  customer_note?: Maybe<OrderBy>;
  deposit_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  originating_payment_id?: Maybe<OrderBy>;
  payment_date?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  settled_by_user_id?: Maybe<OrderBy>;
  settlement_date?: Maybe<OrderBy>;
  settlement_identifier?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
  submitted_by_user_id?: Maybe<OrderBy>;
  type?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PaymentsMinFields = {
  amount?: Maybe<Scalars["numeric"]>;
  bank_note?: Maybe<Scalars["String"]>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  customer_note?: Maybe<Scalars["String"]>;
  deposit_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  method?: Maybe<Scalars["String"]>;
  originating_payment_id?: Maybe<Scalars["uuid"]>;
  payment_date?: Maybe<Scalars["date"]>;
  requested_amount?: Maybe<Scalars["numeric"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  settlement_date?: Maybe<Scalars["date"]>;
  settlement_identifier?: Maybe<Scalars["String"]>;
  submitted_at?: Maybe<Scalars["timestamptz"]>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  type?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** order by min() on columns of table "payments" */
export type PaymentsMinOrderBy = {
  amount?: Maybe<OrderBy>;
  bank_note?: Maybe<OrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  customer_note?: Maybe<OrderBy>;
  deposit_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  originating_payment_id?: Maybe<OrderBy>;
  payment_date?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  settled_by_user_id?: Maybe<OrderBy>;
  settlement_date?: Maybe<OrderBy>;
  settlement_identifier?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
  submitted_by_user_id?: Maybe<OrderBy>;
  type?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
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
  bank_note?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_bank_account?: Maybe<BankAccountsOrderBy>;
  company_bank_account_id?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  customer_note?: Maybe<OrderBy>;
  deposit_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  invoice?: Maybe<InvoicesOrderBy>;
  is_deleted?: Maybe<OrderBy>;
  items_covered?: Maybe<OrderBy>;
  method?: Maybe<OrderBy>;
  originating_payment_id?: Maybe<OrderBy>;
  payment_date?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
  requested_by_user_id?: Maybe<OrderBy>;
  requested_payment_date?: Maybe<OrderBy>;
  settled_at?: Maybe<OrderBy>;
  settled_by_user?: Maybe<UsersOrderBy>;
  settled_by_user_id?: Maybe<OrderBy>;
  settlement_date?: Maybe<OrderBy>;
  settlement_identifier?: Maybe<OrderBy>;
  submitted_at?: Maybe<OrderBy>;
  submitted_by_user?: Maybe<UsersOrderBy>;
  submitted_by_user_id?: Maybe<OrderBy>;
  transactions_aggregate?: Maybe<TransactionsAggregateOrderBy>;
  type?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
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
  BankNote = "bank_note",
  /** column name */
  CompanyBankAccountId = "company_bank_account_id",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  CustomerNote = "customer_note",
  /** column name */
  DepositDate = "deposit_date",
  /** column name */
  Id = "id",
  /** column name */
  Identifier = "identifier",
  /** column name */
  IsDeleted = "is_deleted",
  /** column name */
  ItemsCovered = "items_covered",
  /** column name */
  Method = "method",
  /** column name */
  OriginatingPaymentId = "originating_payment_id",
  /** column name */
  PaymentDate = "payment_date",
  /** column name */
  RequestedAmount = "requested_amount",
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
  SettlementIdentifier = "settlement_identifier",
  /** column name */
  SubmittedAt = "submitted_at",
  /** column name */
  SubmittedByUserId = "submitted_by_user_id",
  /** column name */
  Type = "type",
  /** column name */
  UpdatedAt = "updated_at",
}

/** input type for updating data in table "payments" */
export type PaymentsSetInput = {
  amount?: Maybe<Scalars["numeric"]>;
  bank_note?: Maybe<Scalars["String"]>;
  company_bank_account_id?: Maybe<Scalars["uuid"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  customer_note?: Maybe<Scalars["String"]>;
  deposit_date?: Maybe<Scalars["date"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
  items_covered?: Maybe<Scalars["jsonb"]>;
  method?: Maybe<Scalars["String"]>;
  originating_payment_id?: Maybe<Scalars["uuid"]>;
  payment_date?: Maybe<Scalars["date"]>;
  requested_amount?: Maybe<Scalars["numeric"]>;
  requested_by_user_id?: Maybe<Scalars["uuid"]>;
  requested_payment_date?: Maybe<Scalars["date"]>;
  settled_at?: Maybe<Scalars["timestamptz"]>;
  settled_by_user_id?: Maybe<Scalars["uuid"]>;
  settlement_date?: Maybe<Scalars["date"]>;
  settlement_identifier?: Maybe<Scalars["String"]>;
  submitted_at?: Maybe<Scalars["timestamptz"]>;
  submitted_by_user_id?: Maybe<Scalars["uuid"]>;
  type?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
};

/** aggregate stddev on columns */
export type PaymentsStddevFields = {
  amount?: Maybe<Scalars["Float"]>;
  requested_amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "payments" */
export type PaymentsStddevOrderBy = {
  amount?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type PaymentsStddevPopFields = {
  amount?: Maybe<Scalars["Float"]>;
  requested_amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "payments" */
export type PaymentsStddevPopOrderBy = {
  amount?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type PaymentsStddevSampFields = {
  amount?: Maybe<Scalars["Float"]>;
  requested_amount?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "payments" */
export type PaymentsStddevSampOrderBy = {
  amount?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type PaymentsSumFields = {
  amount?: Maybe<Scalars["numeric"]>;
  requested_amount?: Maybe<Scalars["numeric"]>;
};

/** order by sum() on columns of table "payments" */
export type PaymentsSumOrderBy = {
  amount?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
};

/** update columns of table "payments" */
export enum PaymentsUpdateColumn {
  /** column name */
  Amount = "amount",
  /** column name */
  BankNote = "bank_note",
  /** column name */
  CompanyBankAccountId = "company_bank_account_id",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  CustomerNote = "customer_note",
  /** column name */
  DepositDate = "deposit_date",
  /** column name */
  Id = "id",
  /** column name */
  Identifier = "identifier",
  /** column name */
  IsDeleted = "is_deleted",
  /** column name */
  ItemsCovered = "items_covered",
  /** column name */
  Method = "method",
  /** column name */
  OriginatingPaymentId = "originating_payment_id",
  /** column name */
  PaymentDate = "payment_date",
  /** column name */
  RequestedAmount = "requested_amount",
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
  SettlementIdentifier = "settlement_identifier",
  /** column name */
  SubmittedAt = "submitted_at",
  /** column name */
  SubmittedByUserId = "submitted_by_user_id",
  /** column name */
  Type = "type",
  /** column name */
  UpdatedAt = "updated_at",
}

/** aggregate var_pop on columns */
export type PaymentsVarPopFields = {
  amount?: Maybe<Scalars["Float"]>;
  requested_amount?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "payments" */
export type PaymentsVarPopOrderBy = {
  amount?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type PaymentsVarSampFields = {
  amount?: Maybe<Scalars["Float"]>;
  requested_amount?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "payments" */
export type PaymentsVarSampOrderBy = {
  amount?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type PaymentsVarianceFields = {
  amount?: Maybe<Scalars["Float"]>;
  requested_amount?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "payments" */
export type PaymentsVarianceOrderBy = {
  amount?: Maybe<OrderBy>;
  requested_amount?: Maybe<OrderBy>;
};

/** columns and relationships of "payors" */
export type Payors = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  /** An array relationship */
  company_payor_partnerships: Array<CompanyPayorPartnerships>;
  /** An aggregated array relationship */
  company_payor_partnerships_aggregate: CompanyPayorPartnershipsAggregate;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  needs_balance_recomputed?: Maybe<Scalars["Boolean"]>;
  phone_number?: Maybe<Scalars["String"]>;
  /** An object relationship */
  settings?: Maybe<CompanySettings>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** columns and relationships of "payors" */
export type PayorsCompanyPayorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** columns and relationships of "payors" */
export type PayorsCompanyPayorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** aggregated selection of "payors" */
export type PayorsAggregate = {
  aggregate?: Maybe<PayorsAggregateFields>;
  nodes: Array<Payors>;
};

/** aggregate fields of "payors" */
export type PayorsAggregateFields = {
  avg?: Maybe<PayorsAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<PayorsMaxFields>;
  min?: Maybe<PayorsMinFields>;
  stddev?: Maybe<PayorsStddevFields>;
  stddev_pop?: Maybe<PayorsStddevPopFields>;
  stddev_samp?: Maybe<PayorsStddevSampFields>;
  sum?: Maybe<PayorsSumFields>;
  var_pop?: Maybe<PayorsVarPopFields>;
  var_samp?: Maybe<PayorsVarSampFields>;
  variance?: Maybe<PayorsVarianceFields>;
};

/** aggregate fields of "payors" */
export type PayorsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PayorsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "payors" */
export type PayorsAggregateOrderBy = {
  avg?: Maybe<PayorsAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<PayorsMaxOrderBy>;
  min?: Maybe<PayorsMinOrderBy>;
  stddev?: Maybe<PayorsStddevOrderBy>;
  stddev_pop?: Maybe<PayorsStddevPopOrderBy>;
  stddev_samp?: Maybe<PayorsStddevSampOrderBy>;
  sum?: Maybe<PayorsSumOrderBy>;
  var_pop?: Maybe<PayorsVarPopOrderBy>;
  var_samp?: Maybe<PayorsVarSampOrderBy>;
  variance?: Maybe<PayorsVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "payors" */
export type PayorsArrRelInsertInput = {
  data: Array<PayorsInsertInput>;
};

/** aggregate avg on columns */
export type PayorsAvgFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "payors" */
export type PayorsAvgOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "payors". All fields are combined with a logical 'AND'. */
export type PayorsBoolExp = {
  _and?: Maybe<Array<Maybe<PayorsBoolExp>>>;
  _not?: Maybe<PayorsBoolExp>;
  _or?: Maybe<Array<Maybe<PayorsBoolExp>>>;
  address?: Maybe<StringComparisonExp>;
  city?: Maybe<StringComparisonExp>;
  company_payor_partnerships?: Maybe<CompanyPayorPartnershipsBoolExp>;
  company_settings_id?: Maybe<UuidComparisonExp>;
  company_type?: Maybe<StringComparisonExp>;
  contract_id?: Maybe<UuidComparisonExp>;
  country?: Maybe<StringComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  dba_name?: Maybe<StringComparisonExp>;
  employer_identification_number?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  identifier?: Maybe<StringComparisonExp>;
  latest_loan_identifier?: Maybe<IntComparisonExp>;
  name?: Maybe<StringComparisonExp>;
  needs_balance_recomputed?: Maybe<BooleanComparisonExp>;
  phone_number?: Maybe<StringComparisonExp>;
  settings?: Maybe<CompanySettingsBoolExp>;
  state?: Maybe<StringComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  zip_code?: Maybe<StringComparisonExp>;
};

/** input type for incrementing integer column in table "payors" */
export type PayorsIncInput = {
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
};

/** input type for inserting data into table "payors" */
export type PayorsInsertInput = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_payor_partnerships?: Maybe<CompanyPayorPartnershipsArrRelInsertInput>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  needs_balance_recomputed?: Maybe<Scalars["Boolean"]>;
  phone_number?: Maybe<Scalars["String"]>;
  settings?: Maybe<CompanySettingsObjRelInsertInput>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type PayorsMaxFields = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
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

/** order by max() on columns of table "payors" */
export type PayorsMaxOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  company_type?: Maybe<OrderBy>;
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
export type PayorsMinFields = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
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

/** order by min() on columns of table "payors" */
export type PayorsMinOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  company_type?: Maybe<OrderBy>;
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

/** response of any mutation on the table "payors" */
export type PayorsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars["Int"];
  /** data of the affected rows by the mutation */
  returning: Array<Payors>;
};

/** input type for inserting object relation for remote table "payors" */
export type PayorsObjRelInsertInput = {
  data: PayorsInsertInput;
};

/** ordering options when selecting data from "payors" */
export type PayorsOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_payor_partnerships_aggregate?: Maybe<CompanyPayorPartnershipsAggregateOrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  company_type?: Maybe<OrderBy>;
  contract_id?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  needs_balance_recomputed?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
  settings?: Maybe<CompanySettingsOrderBy>;
  state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  zip_code?: Maybe<OrderBy>;
};

/** select columns of table "payors" */
export enum PayorsSelectColumn {
  /** column name */
  Address = "address",
  /** column name */
  City = "city",
  /** column name */
  CompanySettingsId = "company_settings_id",
  /** column name */
  CompanyType = "company_type",
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
  LatestLoanIdentifier = "latest_loan_identifier",
  /** column name */
  Name = "name",
  /** column name */
  NeedsBalanceRecomputed = "needs_balance_recomputed",
  /** column name */
  PhoneNumber = "phone_number",
  /** column name */
  State = "state",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  ZipCode = "zip_code",
}

/** input type for updating data in table "payors" */
export type PayorsSetInput = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  needs_balance_recomputed?: Maybe<Scalars["Boolean"]>;
  phone_number?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** aggregate stddev on columns */
export type PayorsStddevFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "payors" */
export type PayorsStddevOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type PayorsStddevPopFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "payors" */
export type PayorsStddevPopOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type PayorsStddevSampFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "payors" */
export type PayorsStddevSampOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type PayorsSumFields = {
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
};

/** order by sum() on columns of table "payors" */
export type PayorsSumOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate var_pop on columns */
export type PayorsVarPopFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "payors" */
export type PayorsVarPopOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type PayorsVarSampFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "payors" */
export type PayorsVarSampOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type PayorsVarianceFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "payors" */
export type PayorsVarianceOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
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
  /** When bank rejects purchase order, this mandatory note explains the rejection */
  bank_rejection_note?: Maybe<Scalars["String"]>;
  /** An object relationship */
  company: Companies;
  company_id: Scalars["uuid"];
  created_at: Scalars["timestamptz"];
  delivery_date?: Maybe<Scalars["date"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  id: Scalars["uuid"];
  /** Whether this purchase order includes "cannabis or derivatives"; NULL means unknown (neither true nor false) */
  is_cannabis?: Maybe<Scalars["Boolean"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
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
  /** When vendor rejects purchase order, this mandatory note explains the rejection */
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
  bank_rejection_note?: Maybe<StringComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  delivery_date?: Maybe<DateComparisonExp>;
  funded_at?: Maybe<TimestamptzComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  is_cannabis?: Maybe<BooleanComparisonExp>;
  is_deleted?: Maybe<BooleanComparisonExp>;
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
  bank_rejection_note?: Maybe<Scalars["String"]>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  delivery_date?: Maybe<Scalars["date"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_cannabis?: Maybe<Scalars["Boolean"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
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
  bank_rejection_note?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  delivery_date?: Maybe<Scalars["date"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
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
  bank_rejection_note?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
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
  bank_rejection_note?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  delivery_date?: Maybe<Scalars["date"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
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
  bank_rejection_note?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
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
  bank_rejection_note?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  funded_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  is_cannabis?: Maybe<OrderBy>;
  is_deleted?: Maybe<OrderBy>;
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
  BankRejectionNote = "bank_rejection_note",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  DeliveryDate = "delivery_date",
  /** column name */
  FundedAt = "funded_at",
  /** column name */
  Id = "id",
  /** column name */
  IsCannabis = "is_cannabis",
  /** column name */
  IsDeleted = "is_deleted",
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
  bank_rejection_note?: Maybe<Scalars["String"]>;
  company_id?: Maybe<Scalars["uuid"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  delivery_date?: Maybe<Scalars["date"]>;
  funded_at?: Maybe<Scalars["timestamptz"]>;
  id?: Maybe<Scalars["uuid"]>;
  is_cannabis?: Maybe<Scalars["Boolean"]>;
  is_deleted?: Maybe<Scalars["Boolean"]>;
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
  BankRejectionNote = "bank_rejection_note",
  /** column name */
  CompanyId = "company_id",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  DeliveryDate = "delivery_date",
  /** column name */
  FundedAt = "funded_at",
  /** column name */
  Id = "id",
  /** column name */
  IsCannabis = "is_cannabis",
  /** column name */
  IsDeleted = "is_deleted",
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
  /** fetch data from the table: "audit_events" */
  audit_events: Array<AuditEvents>;
  /** fetch aggregated fields from the table: "audit_events" */
  audit_events_aggregate: AuditEventsAggregate;
  /** fetch data from the table: "audit_events" using primary key columns */
  audit_events_by_pk?: Maybe<AuditEvents>;
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
  /** fetch data from the table: "company_payor_partnerships" */
  company_payor_partnerships: Array<CompanyPayorPartnerships>;
  /** fetch aggregated fields from the table: "company_payor_partnerships" */
  company_payor_partnerships_aggregate: CompanyPayorPartnershipsAggregate;
  /** fetch data from the table: "company_payor_partnerships" using primary key columns */
  company_payor_partnerships_by_pk?: Maybe<CompanyPayorPartnerships>;
  /** fetch data from the table: "company_settings" */
  company_settings: Array<CompanySettings>;
  /** fetch aggregated fields from the table: "company_settings" */
  company_settings_aggregate: CompanySettingsAggregate;
  /** fetch data from the table: "company_settings" using primary key columns */
  company_settings_by_pk?: Maybe<CompanySettings>;
  /** fetch data from the table: "company_type" */
  company_type: Array<CompanyType>;
  /** fetch aggregated fields from the table: "company_type" */
  company_type_aggregate: CompanyTypeAggregate;
  /** fetch data from the table: "company_type" using primary key columns */
  company_type_by_pk?: Maybe<CompanyType>;
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
  /** fetch data from the table: "invoice_file_type" */
  invoice_file_type: Array<InvoiceFileType>;
  /** fetch aggregated fields from the table: "invoice_file_type" */
  invoice_file_type_aggregate: InvoiceFileTypeAggregate;
  /** fetch data from the table: "invoice_file_type" using primary key columns */
  invoice_file_type_by_pk?: Maybe<InvoiceFileType>;
  /** fetch data from the table: "invoice_files" */
  invoice_files: Array<InvoiceFiles>;
  /** fetch aggregated fields from the table: "invoice_files" */
  invoice_files_aggregate: InvoiceFilesAggregate;
  /** fetch data from the table: "invoice_files" using primary key columns */
  invoice_files_by_pk?: Maybe<InvoiceFiles>;
  /** fetch data from the table: "invoices" */
  invoices: Array<Invoices>;
  /** fetch aggregated fields from the table: "invoices" */
  invoices_aggregate: InvoicesAggregate;
  /** fetch data from the table: "invoices" using primary key columns */
  invoices_by_pk?: Maybe<Invoices>;
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
  /** fetch data from the table: "payors" */
  payors: Array<Payors>;
  /** fetch aggregated fields from the table: "payors" */
  payors_aggregate: PayorsAggregate;
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
export type QueryRootAuditEventsArgs = {
  distinct_on?: Maybe<Array<AuditEventsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<AuditEventsOrderBy>>;
  where?: Maybe<AuditEventsBoolExp>;
};

/** query root */
export type QueryRootAuditEventsAggregateArgs = {
  distinct_on?: Maybe<Array<AuditEventsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<AuditEventsOrderBy>>;
  where?: Maybe<AuditEventsBoolExp>;
};

/** query root */
export type QueryRootAuditEventsByPkArgs = {
  id: Scalars["uuid"];
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
export type QueryRootCompanyPayorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** query root */
export type QueryRootCompanyPayorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** query root */
export type QueryRootCompanyPayorPartnershipsByPkArgs = {
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
export type QueryRootCompanyTypeArgs = {
  distinct_on?: Maybe<Array<CompanyTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyTypeOrderBy>>;
  where?: Maybe<CompanyTypeBoolExp>;
};

/** query root */
export type QueryRootCompanyTypeAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyTypeOrderBy>>;
  where?: Maybe<CompanyTypeBoolExp>;
};

/** query root */
export type QueryRootCompanyTypeByPkArgs = {
  value: Scalars["String"];
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
export type QueryRootInvoiceFileTypeArgs = {
  distinct_on?: Maybe<Array<InvoiceFileTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFileTypeOrderBy>>;
  where?: Maybe<InvoiceFileTypeBoolExp>;
};

/** query root */
export type QueryRootInvoiceFileTypeAggregateArgs = {
  distinct_on?: Maybe<Array<InvoiceFileTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFileTypeOrderBy>>;
  where?: Maybe<InvoiceFileTypeBoolExp>;
};

/** query root */
export type QueryRootInvoiceFileTypeByPkArgs = {
  value: Scalars["String"];
};

/** query root */
export type QueryRootInvoiceFilesArgs = {
  distinct_on?: Maybe<Array<InvoiceFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFilesOrderBy>>;
  where?: Maybe<InvoiceFilesBoolExp>;
};

/** query root */
export type QueryRootInvoiceFilesAggregateArgs = {
  distinct_on?: Maybe<Array<InvoiceFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFilesOrderBy>>;
  where?: Maybe<InvoiceFilesBoolExp>;
};

/** query root */
export type QueryRootInvoiceFilesByPkArgs = {
  file_id: Scalars["uuid"];
  invoice_id: Scalars["uuid"];
};

/** query root */
export type QueryRootInvoicesArgs = {
  distinct_on?: Maybe<Array<InvoicesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoicesOrderBy>>;
  where?: Maybe<InvoicesBoolExp>;
};

/** query root */
export type QueryRootInvoicesAggregateArgs = {
  distinct_on?: Maybe<Array<InvoicesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoicesOrderBy>>;
  where?: Maybe<InvoicesBoolExp>;
};

/** query root */
export type QueryRootInvoicesByPkArgs = {
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
export type QueryRootPayorsArgs = {
  distinct_on?: Maybe<Array<PayorsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PayorsOrderBy>>;
  where?: Maybe<PayorsBoolExp>;
};

/** query root */
export type QueryRootPayorsAggregateArgs = {
  distinct_on?: Maybe<Array<PayorsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PayorsOrderBy>>;
  where?: Maybe<PayorsBoolExp>;
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
  /** fetch data from the table: "audit_events" */
  audit_events: Array<AuditEvents>;
  /** fetch aggregated fields from the table: "audit_events" */
  audit_events_aggregate: AuditEventsAggregate;
  /** fetch data from the table: "audit_events" using primary key columns */
  audit_events_by_pk?: Maybe<AuditEvents>;
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
  /** fetch data from the table: "company_payor_partnerships" */
  company_payor_partnerships: Array<CompanyPayorPartnerships>;
  /** fetch aggregated fields from the table: "company_payor_partnerships" */
  company_payor_partnerships_aggregate: CompanyPayorPartnershipsAggregate;
  /** fetch data from the table: "company_payor_partnerships" using primary key columns */
  company_payor_partnerships_by_pk?: Maybe<CompanyPayorPartnerships>;
  /** fetch data from the table: "company_settings" */
  company_settings: Array<CompanySettings>;
  /** fetch aggregated fields from the table: "company_settings" */
  company_settings_aggregate: CompanySettingsAggregate;
  /** fetch data from the table: "company_settings" using primary key columns */
  company_settings_by_pk?: Maybe<CompanySettings>;
  /** fetch data from the table: "company_type" */
  company_type: Array<CompanyType>;
  /** fetch aggregated fields from the table: "company_type" */
  company_type_aggregate: CompanyTypeAggregate;
  /** fetch data from the table: "company_type" using primary key columns */
  company_type_by_pk?: Maybe<CompanyType>;
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
  /** fetch data from the table: "invoice_file_type" */
  invoice_file_type: Array<InvoiceFileType>;
  /** fetch aggregated fields from the table: "invoice_file_type" */
  invoice_file_type_aggregate: InvoiceFileTypeAggregate;
  /** fetch data from the table: "invoice_file_type" using primary key columns */
  invoice_file_type_by_pk?: Maybe<InvoiceFileType>;
  /** fetch data from the table: "invoice_files" */
  invoice_files: Array<InvoiceFiles>;
  /** fetch aggregated fields from the table: "invoice_files" */
  invoice_files_aggregate: InvoiceFilesAggregate;
  /** fetch data from the table: "invoice_files" using primary key columns */
  invoice_files_by_pk?: Maybe<InvoiceFiles>;
  /** fetch data from the table: "invoices" */
  invoices: Array<Invoices>;
  /** fetch aggregated fields from the table: "invoices" */
  invoices_aggregate: InvoicesAggregate;
  /** fetch data from the table: "invoices" using primary key columns */
  invoices_by_pk?: Maybe<Invoices>;
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
  /** fetch data from the table: "payors" */
  payors: Array<Payors>;
  /** fetch aggregated fields from the table: "payors" */
  payors_aggregate: PayorsAggregate;
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
export type SubscriptionRootAuditEventsArgs = {
  distinct_on?: Maybe<Array<AuditEventsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<AuditEventsOrderBy>>;
  where?: Maybe<AuditEventsBoolExp>;
};

/** subscription root */
export type SubscriptionRootAuditEventsAggregateArgs = {
  distinct_on?: Maybe<Array<AuditEventsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<AuditEventsOrderBy>>;
  where?: Maybe<AuditEventsBoolExp>;
};

/** subscription root */
export type SubscriptionRootAuditEventsByPkArgs = {
  id: Scalars["uuid"];
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
export type SubscriptionRootCompanyPayorPartnershipsArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyPayorPartnershipsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyPayorPartnershipsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyPayorPartnershipsOrderBy>>;
  where?: Maybe<CompanyPayorPartnershipsBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyPayorPartnershipsByPkArgs = {
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
export type SubscriptionRootCompanyTypeArgs = {
  distinct_on?: Maybe<Array<CompanyTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyTypeOrderBy>>;
  where?: Maybe<CompanyTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyTypeAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<CompanyTypeOrderBy>>;
  where?: Maybe<CompanyTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootCompanyTypeByPkArgs = {
  value: Scalars["String"];
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
export type SubscriptionRootInvoiceFileTypeArgs = {
  distinct_on?: Maybe<Array<InvoiceFileTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFileTypeOrderBy>>;
  where?: Maybe<InvoiceFileTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootInvoiceFileTypeAggregateArgs = {
  distinct_on?: Maybe<Array<InvoiceFileTypeSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFileTypeOrderBy>>;
  where?: Maybe<InvoiceFileTypeBoolExp>;
};

/** subscription root */
export type SubscriptionRootInvoiceFileTypeByPkArgs = {
  value: Scalars["String"];
};

/** subscription root */
export type SubscriptionRootInvoiceFilesArgs = {
  distinct_on?: Maybe<Array<InvoiceFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFilesOrderBy>>;
  where?: Maybe<InvoiceFilesBoolExp>;
};

/** subscription root */
export type SubscriptionRootInvoiceFilesAggregateArgs = {
  distinct_on?: Maybe<Array<InvoiceFilesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoiceFilesOrderBy>>;
  where?: Maybe<InvoiceFilesBoolExp>;
};

/** subscription root */
export type SubscriptionRootInvoiceFilesByPkArgs = {
  file_id: Scalars["uuid"];
  invoice_id: Scalars["uuid"];
};

/** subscription root */
export type SubscriptionRootInvoicesArgs = {
  distinct_on?: Maybe<Array<InvoicesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoicesOrderBy>>;
  where?: Maybe<InvoicesBoolExp>;
};

/** subscription root */
export type SubscriptionRootInvoicesAggregateArgs = {
  distinct_on?: Maybe<Array<InvoicesSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<InvoicesOrderBy>>;
  where?: Maybe<InvoicesBoolExp>;
};

/** subscription root */
export type SubscriptionRootInvoicesByPkArgs = {
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
export type SubscriptionRootPayorsArgs = {
  distinct_on?: Maybe<Array<PayorsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PayorsOrderBy>>;
  where?: Maybe<PayorsBoolExp>;
};

/** subscription root */
export type SubscriptionRootPayorsAggregateArgs = {
  distinct_on?: Maybe<Array<PayorsSelectColumn>>;
  limit?: Maybe<Scalars["Int"]>;
  offset?: Maybe<Scalars["Int"]>;
  order_by?: Maybe<Array<PayorsOrderBy>>;
  where?: Maybe<PayorsBoolExp>;
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
  created_by_user_id?: Maybe<Scalars["uuid"]>;
  /** For financial purposes, this is the date this transaction is considered in effect. */
  effective_date: Scalars["date"];
  id: Scalars["uuid"];
  is_deleted?: Maybe<Scalars["Boolean"]>;
  /** An object relationship */
  loan?: Maybe<Loans>;
  loan_id?: Maybe<Scalars["uuid"]>;
  modified_at: Scalars["timestamptz"];
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  /** An object relationship */
  payment: Payments;
  payment_id: Scalars["uuid"];
  /** For information purposes, to understand why a fee may have been generated, for example */
  subtype?: Maybe<Scalars["String"]>;
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
  is_deleted?: Maybe<BooleanComparisonExp>;
  loan?: Maybe<LoansBoolExp>;
  loan_id?: Maybe<UuidComparisonExp>;
  modified_at?: Maybe<TimestamptzComparisonExp>;
  modified_by_user_id?: Maybe<UuidComparisonExp>;
  payment?: Maybe<PaymentsBoolExp>;
  payment_id?: Maybe<UuidComparisonExp>;
  subtype?: Maybe<StringComparisonExp>;
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
  is_deleted?: Maybe<Scalars["Boolean"]>;
  loan?: Maybe<LoansObjRelInsertInput>;
  loan_id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  payment?: Maybe<PaymentsObjRelInsertInput>;
  payment_id?: Maybe<Scalars["uuid"]>;
  subtype?: Maybe<Scalars["String"]>;
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
  subtype?: Maybe<Scalars["String"]>;
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
  subtype?: Maybe<OrderBy>;
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
  subtype?: Maybe<Scalars["String"]>;
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
  subtype?: Maybe<OrderBy>;
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
  is_deleted?: Maybe<OrderBy>;
  loan?: Maybe<LoansOrderBy>;
  loan_id?: Maybe<OrderBy>;
  modified_at?: Maybe<OrderBy>;
  modified_by_user_id?: Maybe<OrderBy>;
  payment?: Maybe<PaymentsOrderBy>;
  payment_id?: Maybe<OrderBy>;
  subtype?: Maybe<OrderBy>;
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
  IsDeleted = "is_deleted",
  /** column name */
  LoanId = "loan_id",
  /** column name */
  ModifiedAt = "modified_at",
  /** column name */
  ModifiedByUserId = "modified_by_user_id",
  /** column name */
  PaymentId = "payment_id",
  /** column name */
  Subtype = "subtype",
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
  is_deleted?: Maybe<Scalars["Boolean"]>;
  loan_id?: Maybe<Scalars["uuid"]>;
  modified_at?: Maybe<Scalars["timestamptz"]>;
  modified_by_user_id?: Maybe<Scalars["uuid"]>;
  payment_id?: Maybe<Scalars["uuid"]>;
  subtype?: Maybe<Scalars["String"]>;
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
  IsDeleted = "is_deleted",
  /** column name */
  LoanId = "loan_id",
  /** column name */
  ModifiedAt = "modified_at",
  /** column name */
  ModifiedByUserId = "modified_by_user_id",
  /** column name */
  PaymentId = "payment_id",
  /** column name */
  Subtype = "subtype",
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
  /** Bank Read Only */
  BankReadOnly = "bank_read_only",
  /** Company Admin */
  CompanyAdmin = "company_admin",
  /** Company Read Only */
  CompanyReadOnly = "company_read_only",
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
  created_at: Scalars["timestamptz"];
  email: Scalars["String"];
  first_name: Scalars["String"];
  full_name: Scalars["String"];
  id: Scalars["uuid"];
  last_name: Scalars["String"];
  password?: Maybe<Scalars["String"]>;
  phone_number?: Maybe<Scalars["String"]>;
  role?: Maybe<UserRolesEnum>;
  updated_at: Scalars["timestamptz"];
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
  updated_at?: Maybe<TimestamptzComparisonExp>;
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
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  updated_at?: Maybe<OrderBy>;
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
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  updated_at?: Maybe<OrderBy>;
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
  updated_at?: Maybe<OrderBy>;
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
  /** column name */
  UpdatedAt = "updated_at",
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
  updated_at?: Maybe<Scalars["timestamptz"]>;
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
  /** column name */
  UpdatedAt = "updated_at",
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
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
  /** An array relationship */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  needs_balance_recomputed?: Maybe<Scalars["Boolean"]>;
  phone_number?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
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
  avg?: Maybe<VendorsAvgFields>;
  count?: Maybe<Scalars["Int"]>;
  max?: Maybe<VendorsMaxFields>;
  min?: Maybe<VendorsMinFields>;
  stddev?: Maybe<VendorsStddevFields>;
  stddev_pop?: Maybe<VendorsStddevPopFields>;
  stddev_samp?: Maybe<VendorsStddevSampFields>;
  sum?: Maybe<VendorsSumFields>;
  var_pop?: Maybe<VendorsVarPopFields>;
  var_samp?: Maybe<VendorsVarSampFields>;
  variance?: Maybe<VendorsVarianceFields>;
};

/** aggregate fields of "vendors" */
export type VendorsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<VendorsSelectColumn>>;
  distinct?: Maybe<Scalars["Boolean"]>;
};

/** order by aggregate values of table "vendors" */
export type VendorsAggregateOrderBy = {
  avg?: Maybe<VendorsAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<VendorsMaxOrderBy>;
  min?: Maybe<VendorsMinOrderBy>;
  stddev?: Maybe<VendorsStddevOrderBy>;
  stddev_pop?: Maybe<VendorsStddevPopOrderBy>;
  stddev_samp?: Maybe<VendorsStddevSampOrderBy>;
  sum?: Maybe<VendorsSumOrderBy>;
  var_pop?: Maybe<VendorsVarPopOrderBy>;
  var_samp?: Maybe<VendorsVarSampOrderBy>;
  variance?: Maybe<VendorsVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "vendors" */
export type VendorsArrRelInsertInput = {
  data: Array<VendorsInsertInput>;
};

/** aggregate avg on columns */
export type VendorsAvgFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by avg() on columns of table "vendors" */
export type VendorsAvgOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "vendors". All fields are combined with a logical 'AND'. */
export type VendorsBoolExp = {
  _and?: Maybe<Array<Maybe<VendorsBoolExp>>>;
  _not?: Maybe<VendorsBoolExp>;
  _or?: Maybe<Array<Maybe<VendorsBoolExp>>>;
  address?: Maybe<StringComparisonExp>;
  city?: Maybe<StringComparisonExp>;
  company_settings_id?: Maybe<UuidComparisonExp>;
  company_type?: Maybe<StringComparisonExp>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsBoolExp>;
  contract_id?: Maybe<UuidComparisonExp>;
  country?: Maybe<StringComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  dba_name?: Maybe<StringComparisonExp>;
  employer_identification_number?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  identifier?: Maybe<StringComparisonExp>;
  latest_loan_identifier?: Maybe<IntComparisonExp>;
  name?: Maybe<StringComparisonExp>;
  needs_balance_recomputed?: Maybe<BooleanComparisonExp>;
  phone_number?: Maybe<StringComparisonExp>;
  state?: Maybe<StringComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  zip_code?: Maybe<StringComparisonExp>;
};

/** input type for incrementing integer column in table "vendors" */
export type VendorsIncInput = {
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
};

/** input type for inserting data into table "vendors" */
export type VendorsInsertInput = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  needs_balance_recomputed?: Maybe<Scalars["Boolean"]>;
  phone_number?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** aggregate max on columns */
export type VendorsMaxFields = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
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

/** order by max() on columns of table "vendors" */
export type VendorsMaxOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  company_type?: Maybe<OrderBy>;
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
export type VendorsMinFields = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
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

/** order by min() on columns of table "vendors" */
export type VendorsMinOrderBy = {
  address?: Maybe<OrderBy>;
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  company_type?: Maybe<OrderBy>;
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
  city?: Maybe<OrderBy>;
  company_settings_id?: Maybe<OrderBy>;
  company_type?: Maybe<OrderBy>;
  company_vendor_partnerships_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  contract_id?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  identifier?: Maybe<OrderBy>;
  latest_loan_identifier?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  needs_balance_recomputed?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
  state?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  zip_code?: Maybe<OrderBy>;
};

/** select columns of table "vendors" */
export enum VendorsSelectColumn {
  /** column name */
  Address = "address",
  /** column name */
  City = "city",
  /** column name */
  CompanySettingsId = "company_settings_id",
  /** column name */
  CompanyType = "company_type",
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
  LatestLoanIdentifier = "latest_loan_identifier",
  /** column name */
  Name = "name",
  /** column name */
  NeedsBalanceRecomputed = "needs_balance_recomputed",
  /** column name */
  PhoneNumber = "phone_number",
  /** column name */
  State = "state",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  ZipCode = "zip_code",
}

/** input type for updating data in table "vendors" */
export type VendorsSetInput = {
  address?: Maybe<Scalars["String"]>;
  city?: Maybe<Scalars["String"]>;
  company_settings_id?: Maybe<Scalars["uuid"]>;
  company_type?: Maybe<Scalars["String"]>;
  contract_id?: Maybe<Scalars["uuid"]>;
  country?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["timestamptz"]>;
  dba_name?: Maybe<Scalars["String"]>;
  employer_identification_number?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["uuid"]>;
  identifier?: Maybe<Scalars["String"]>;
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
  name?: Maybe<Scalars["String"]>;
  needs_balance_recomputed?: Maybe<Scalars["Boolean"]>;
  phone_number?: Maybe<Scalars["String"]>;
  state?: Maybe<Scalars["String"]>;
  updated_at?: Maybe<Scalars["timestamptz"]>;
  zip_code?: Maybe<Scalars["String"]>;
};

/** aggregate stddev on columns */
export type VendorsStddevFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev() on columns of table "vendors" */
export type VendorsStddevOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type VendorsStddevPopFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev_pop() on columns of table "vendors" */
export type VendorsStddevPopOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type VendorsStddevSampFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by stddev_samp() on columns of table "vendors" */
export type VendorsStddevSampOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type VendorsSumFields = {
  latest_loan_identifier?: Maybe<Scalars["Int"]>;
};

/** order by sum() on columns of table "vendors" */
export type VendorsSumOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate var_pop on columns */
export type VendorsVarPopFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by var_pop() on columns of table "vendors" */
export type VendorsVarPopOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type VendorsVarSampFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by var_samp() on columns of table "vendors" */
export type VendorsVarSampOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type VendorsVarianceFields = {
  latest_loan_identifier?: Maybe<Scalars["Float"]>;
};

/** order by variance() on columns of table "vendors" */
export type VendorsVarianceOrderBy = {
  latest_loan_identifier?: Maybe<OrderBy>;
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

export type GetBespokeBankAccountsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetBespokeBankAccountsQuery = {
  bank_accounts: Array<BankAccountFragment>;
};

export type GetBankAccountsByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetBankAccountsByCompanyIdQuery = {
  bank_accounts: Array<BankAccountFragment>;
};

export type BankAccountsForTransferQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type BankAccountsForTransferQuery = {
  bank_accounts: Array<BankAccountFragment>;
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      settings: Pick<CompanySettings, "id"> & {
        collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
      };
    }
  >;
};

export type GetCustomerOverviewQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  loanType?: Maybe<LoanTypeEnum>;
}>;

export type GetCustomerOverviewQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      financial_summaries: Array<
        Pick<FinancialSummaries, "id"> & FinancialSummaryFragment
      >;
      outstanding_loans: Array<
        Pick<Loans, "id"> & LoanLimitedFragment & LoanArtifactLimitedFragment
      >;
      pending_payments: Array<Pick<Payments, "id"> & PaymentLimitedFragment>;
    }
  >;
};

export type GetCustomerAccountQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetCustomerAccountQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      financial_summaries: Array<
        Pick<FinancialSummaries, "id"> & FinancialSummaryFragment
      >;
      fee_payments: Array<
        Pick<Payments, "id"> & {
          transactions: Array<Pick<Transactions, "id"> & TransactionFragment>;
        } & PaymentLimitedFragment
      >;
      pending_payments: Array<Pick<Payments, "id"> & PaymentLimitedFragment>;
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

export type BankCustomerListPayorPartnershipsQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type BankCustomerListPayorPartnershipsQuery = {
  company_payor_partnerships: Array<
    {
      payor?: Maybe<
        Pick<Companies, "id"> & {
          users: Array<Pick<Users, "id"> & ContactFragment>;
        } & ThirdPartyFragment
      >;
    } & PayorPartnershipFragment
  >;
};

export type GetFinancialSummariesByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetFinancialSummariesByCompanyIdQuery = {
  financial_summaries: Array<
    Pick<FinancialSummaries, "id"> & {
      company: Pick<Companies, "id" | "name">;
    } & FinancialSummaryFragment
  >;
};

export type GetFinancialSummariesByDateQueryVariables = Exact<{
  date: Scalars["date"];
}>;

export type GetFinancialSummariesByDateQuery = {
  financial_summaries: Array<
    Pick<FinancialSummaries, "id"> & {
      company: Pick<Companies, "id" | "name">;
    } & FinancialSummaryFragment
  >;
};

export type GetEbbaApplicationQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetEbbaApplicationQuery = {
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

export type UpdateEbbaApplicationMutationVariables = Exact<{
  id: Scalars["uuid"];
  ebbaApplication: EbbaApplicationsSetInput;
  ebbaApplicationFiles: Array<EbbaApplicationFilesInsertInput>;
}>;

export type UpdateEbbaApplicationMutation = {
  delete_ebba_application_files?: Maybe<
    Pick<EbbaApplicationFilesMutationResponse, "affected_rows">
  >;
  insert_ebba_application_files?: Maybe<{
    returning: Array<
      Pick<EbbaApplicationFiles, "ebba_application_id" | "file_id">
    >;
  }>;
  update_ebba_applications_by_pk?: Maybe<
    Pick<EbbaApplications, "id"> & {
      ebba_application_files: Array<EbbaApplicationFileFragment>;
    } & EbbaApplicationFragment
  >;
};

export type GetOpenEbbaApplicationsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetOpenEbbaApplicationsQuery = {
  ebba_applications: Array<
    Pick<EbbaApplications, "id"> & {
      company: Pick<Companies, "id" | "name">;
    } & EbbaApplicationFragment
  >;
};

export type GetClosedEbbaApplicationsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetClosedEbbaApplicationsQuery = {
  ebba_applications: Array<
    Pick<EbbaApplications, "id"> & {
      company: Pick<Companies, "id" | "name">;
    } & EbbaApplicationFragment
  >;
};

export type PayorsByPartnerCompanyQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type PayorsByPartnerCompanyQuery = {
  payors: Array<
    Pick<Payors, "id"> & {
      company_payor_partnerships: Array<
        Pick<CompanyPayorPartnerships, "id" | "approved_at">
      >;
    } & PayorLimitedFragment
  >;
};

export type ApprovedPayorsByPartnerCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type ApprovedPayorsByPartnerCompanyIdQuery = {
  payors: Array<
    Pick<Payors, "id"> & {
      company_payor_partnerships: Array<
        Pick<CompanyPayorPartnerships, "id" | "approved_at">
      >;
    } & PayorLimitedFragment
  >;
};

export type CompanyPayorPartnershipForPayorQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  payorId: Scalars["uuid"];
}>;

export type CompanyPayorPartnershipForPayorQuery = {
  company_payor_partnerships: Array<Pick<CompanyPayorPartnerships, "id">>;
};

export type GetInvoiceByIdQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetInvoiceByIdQuery = {
  invoices_by_pk?: Maybe<
    {
      company: Pick<Companies, "id"> & {
        contract?: Maybe<Pick<Contracts, "id" | "product_type">>;
      };
      loans: Array<Pick<Loans, "id"> & LoanFragment>;
      invoice_files: Array<InvoiceFileFragment>;
    } & InvoiceFragment
  >;
};

export type GetInvoiceForReviewQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetInvoiceForReviewQuery = {
  invoices_by_pk?: Maybe<
    Pick<
      Invoices,
      | "id"
      | "company_id"
      | "payor_id"
      | "invoice_number"
      | "invoice_date"
      | "invoice_due_date"
      | "subtotal_amount"
      | "total_amount"
      | "taxes_amount"
      | "is_cannabis"
      | "status"
      | "created_at"
      | "payment_requested_at"
      | "payment_confirmed_at"
      | "payment_rejected_at"
      | "payment_rejection_note"
    > & {
      invoice_files: Array<
        Pick<InvoiceFiles, "invoice_id" | "file_id"> & InvoiceFileFragment
      >;
      company: Pick<Companies, "id" | "name">;
      payor?: Maybe<
        Pick<Payors, "id" | "name"> & {
          settings?: Maybe<
            Pick<CompanySettings, "id"> & {
              collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
            }
          >;
        }
      >;
    }
  >;
};

export type GetInvoicesQueryVariables = Exact<{ [key: string]: never }>;

export type GetInvoicesQuery = {
  invoices: Array<Pick<Invoices, "id"> & InvoiceFragment>;
};

export type GetInvoicesByCompanyIdQueryVariables = Exact<{
  company_id: Scalars["uuid"];
}>;

export type GetInvoicesByCompanyIdQuery = {
  invoices: Array<
    {
      company: Pick<Companies, "id" | "name">;
      payor?: Maybe<Pick<Payors, "id" | "name">>;
    } & InvoiceFragment
  >;
};

export type GetOpenInvoicesByCompanyIdQueryVariables = Exact<{
  company_id: Scalars["uuid"];
}>;

export type GetOpenInvoicesByCompanyIdQuery = {
  invoices: Array<
    {
      company: Pick<Companies, "id" | "name">;
      payor?: Maybe<Pick<Payors, "id" | "name">>;
    } & InvoiceFragment
  >;
};

export type GetClosedInvoicesByCompanyIdQueryVariables = Exact<{
  company_id: Scalars["uuid"];
}>;

export type GetClosedInvoicesByCompanyIdQuery = {
  invoices: Array<
    {
      company: Pick<Companies, "id" | "name">;
      payor?: Maybe<Pick<Payors, "id" | "name">>;
    } & InvoiceFragment
  >;
};

export type GetApprovedInvoicesByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetApprovedInvoicesByCompanyIdQuery = {
  invoices: Array<InvoiceFragment>;
};

export type GetPurchaseOrdersForIdsQueryVariables = Exact<{
  purchaseOrderIds?: Maybe<Array<Scalars["uuid"]>>;
}>;

export type GetPurchaseOrdersForIdsQuery = {
  purchase_orders: Array<
    Pick<PurchaseOrders, "id"> & {
      loans: Array<Pick<Loans, "id"> & LoanFragment>;
    } & PurchaseOrderFragment
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
  loans_by_pk?: Maybe<LoanLimitedFragment & LoanArtifactFragment>;
};

export type GetLoanWithArtifactForBankQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetLoanWithArtifactForBankQuery = {
  loans_by_pk?: Maybe<LoanFragment & LoanArtifactFragment>;
};

export type GetTransactionsForLoanQueryVariables = Exact<{
  loan_id: Scalars["uuid"];
}>;

export type GetTransactionsForLoanQuery = {
  transactions: Array<
    {
      payment: Pick<Payments, "id"> & {
        company: Pick<Companies, "id" | "name"> & {
          contract?: Maybe<Pick<Contracts, "id" | "product_type">>;
        };
      } & PaymentFragment;
    } & TransactionFragment
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

export type GetLoansForBankSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetLoansForBankSubscription = {
  loans: Array<
    Pick<Loans, "id"> & {
      company: Pick<Companies, "id" | "name">;
    } & LoanFragment &
      LoanArtifactLimitedFragment
  >;
};

export type GetNotFundedLoansForBankSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetNotFundedLoansForBankSubscription = {
  loans: Array<Pick<Loans, "id"> & LoanFragment & LoanArtifactLimitedFragment>;
};

export type GetFundedLoansForBankSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetFundedLoansForBankSubscription = {
  loans: Array<Pick<Loans, "id"> & LoanFragment & LoanArtifactLimitedFragment>;
};

export type GetActiveLoansForCompanyQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  loanType?: Maybe<LoanTypeEnum>;
}>;

export type GetActiveLoansForCompanyQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      financial_summaries: Array<
        Pick<FinancialSummaries, "id"> & FinancialSummaryFragment
      >;
      loans: Array<
        Pick<Loans, "id"> & LoanLimitedFragment & LoanArtifactLimitedFragment
      >;
    }
  >;
};

export type GetClosedLoansForCompanyQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  loanType?: Maybe<LoanTypeEnum>;
}>;

export type GetClosedLoansForCompanyQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      loans: Array<
        Pick<Loans, "id"> & LoanLimitedFragment & LoanArtifactLimitedFragment
      >;
    }
  >;
};

export type GetAllLoansForCompanyQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  loanType?: Maybe<LoanTypeEnum>;
}>;

export type GetAllLoansForCompanyQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      loans: Array<
        Pick<Loans, "id"> & LoanLimitedFragment & LoanArtifactLimitedFragment
      >;
    }
  >;
};

export type GetLoansByCompanyAndLoanTypeQueryVariables = Exact<{
  companyId: Scalars["uuid"];
  loanType: LoanTypeEnum;
}>;

export type GetLoansByCompanyAndLoanTypeQuery = {
  loans: Array<Pick<Loans, "id"> & LoanFragment & LoanArtifactLimitedFragment>;
};

export type GetLoansByLoanIdsQueryVariables = Exact<{
  loan_ids: Array<Scalars["uuid"]>;
}>;

export type GetLoansByLoanIdsQuery = {
  loans: Array<Pick<Loans, "id"> & LoanFragment & LoanArtifactFragment>;
};

export type GetBankPayorPartnershipQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetBankPayorPartnershipQuery = {
  company_payor_partnerships_by_pk?: Maybe<
    {
      payor?: Maybe<
        {
          settings: Pick<CompanySettings, "id"> & {
            collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
          };
          users: Array<ContactFragment>;
        } & ThirdPartyFragment
      >;
      company: {
        users: Array<ContactFragment>;
        settings: CompanySettingsFragment;
      } & CompanyFragment;
      payor_agreement?: Maybe<CompanyAgreementFragment>;
      payor_license?: Maybe<CompanyLicenseFragment>;
    } & PayorPartnershipFragment
  >;
};

export type GetPayorPartnershipsForBankQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetPayorPartnershipsForBankQuery = {
  company_payor_partnerships: Array<
    {
      company: Pick<Companies, "id" | "name">;
      payor?: Maybe<
        {
          settings: Pick<CompanySettings, "id">;
          users: Array<ContactFragment>;
        } & ThirdPartyFragment
      >;
    } & PayorPartnershipFragment
  >;
};

export type UpdateCompanyPayorPartnershipApprovedAtMutationVariables = Exact<{
  companyPayorPartnershipId: Scalars["uuid"];
  approvedAt?: Maybe<Scalars["timestamptz"]>;
}>;

export type UpdateCompanyPayorPartnershipApprovedAtMutation = {
  update_company_payor_partnerships_by_pk?: Maybe<PayorPartnershipFragment>;
};

export type UpdatePayorInfoMutationVariables = Exact<{
  id: Scalars["uuid"];
  company: CompaniesSetInput;
}>;

export type UpdatePayorInfoMutation = {
  update_companies_by_pk?: Maybe<ThirdPartyFragment>;
};

export type UpdatePayorAgreementIdMutationVariables = Exact<{
  companyPayorPartnershipId: Scalars["uuid"];
  payorAgreementId?: Maybe<Scalars["uuid"]>;
}>;

export type UpdatePayorAgreementIdMutation = {
  update_company_payor_partnerships_by_pk?: Maybe<
    Pick<CompanyPayorPartnerships, "id"> & {
      payor_agreement?: Maybe<CompanyAgreementFragment>;
    }
  >;
};

export type AddCompanyPayorAgreementMutationVariables = Exact<{
  payorAgreement: CompanyAgreementsInsertInput;
}>;

export type AddCompanyPayorAgreementMutation = {
  insert_company_agreements_one?: Maybe<CompanyAgreementFragment>;
};

export type UpdatePayorLicenseIdMutationVariables = Exact<{
  companyPayorPartnershipId: Scalars["uuid"];
  payorLicenseId: Scalars["uuid"];
}>;

export type UpdatePayorLicenseIdMutation = {
  update_company_payor_partnerships_by_pk?: Maybe<
    Pick<CompanyPayorPartnerships, "id"> & {
      payor_license?: Maybe<CompanyLicenseFragment>;
    }
  >;
};

export type AddCompanyPayorLicenseMutationVariables = Exact<{
  payorLicense: CompanyLicensesInsertInput;
}>;

export type AddCompanyPayorLicenseMutation = {
  insert_company_licenses_one?: Maybe<CompanyLicenseFragment>;
};

export type ListPayorPartnershipsByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type ListPayorPartnershipsByCompanyIdQuery = {
  company_payor_partnerships: Array<
    Pick<CompanyPayorPartnerships, "id"> & {
      payor_limited?: Maybe<PayorLimitedFragment>;
    } & PayorPartnershipFragment
  >;
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

export type GetPurchaseOrdersSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetPurchaseOrdersSubscription = {
  purchase_orders: Array<Pick<PurchaseOrders, "id"> & PurchaseOrderFragment>;
};

export type GetNotConfirmedPurchaseOrdersSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetNotConfirmedPurchaseOrdersSubscription = {
  purchase_orders: Array<Pick<PurchaseOrders, "id"> & PurchaseOrderFragment>;
};

export type GetConfirmedPurchaseOrdersSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetConfirmedPurchaseOrdersSubscription = {
  purchase_orders: Array<Pick<PurchaseOrders, "id"> & PurchaseOrderFragment>;
};

export type GetOpenPurchaseOrdersByCompanyIdQueryVariables = Exact<{
  company_id: Scalars["uuid"];
}>;

export type GetOpenPurchaseOrdersByCompanyIdQuery = {
  purchase_orders: Array<PurchaseOrderFragment>;
};

export type GetClosedPurchaseOrdersByCompanyIdQueryVariables = Exact<{
  company_id: Scalars["uuid"];
}>;

export type GetClosedPurchaseOrdersByCompanyIdQuery = {
  purchase_orders: Array<PurchaseOrderFragment>;
};

export type GetFundablePurchaseOrdersByCompanyIdQueryVariables = Exact<{
  company_id: Scalars["uuid"];
}>;

export type GetFundablePurchaseOrdersByCompanyIdQuery = {
  purchase_orders: Array<PurchaseOrderFragment>;
};

export type GetPaymentQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetPaymentQuery = {
  payments_by_pk?: Maybe<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name">;
      settled_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
    } & PaymentLimitedFragment
  >;
};

export type GetPaymentForSettlementQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetPaymentForSettlementQuery = {
  payments_by_pk?: Maybe<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name"> & {
        contract?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
        financial_summaries: Array<
          Pick<FinancialSummaries, "id"> & FinancialSummaryFragment
        >;
      };
      company_bank_account?: Maybe<
        Pick<BankAccounts, "id"> & BankAccountFragment
      >;
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
      invoice?: Maybe<
        Pick<Invoices, "id"> & {
          payor?: Maybe<Pick<Payors, "id"> & BankPayorFragment>;
        }
      >;
    } & PaymentFragment
  >;
};

export type GetPaymentsSubscriptionVariables = Exact<{ [key: string]: never }>;

export type GetPaymentsSubscription = {
  payments: Array<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name">;
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
      settled_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
      invoice?: Maybe<
        Pick<Invoices, "id"> & { payor?: Maybe<Pick<Payors, "id" | "name">> }
      >;
    } & PaymentFragment
  >;
};

export type GetSubmittedPaymentsSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetSubmittedPaymentsSubscription = {
  payments: Array<
    Pick<Payments, "id"> & {
      company: Pick<Companies, "id" | "name">;
      submitted_by_user?: Maybe<Pick<Users, "id" | "full_name">>;
      invoice?: Maybe<
        Pick<Invoices, "id"> & { payor?: Maybe<Pick<Payors, "id" | "name">> }
      >;
    } & PaymentFragment
  >;
};

export type GetPaymentsForCompanyQueryVariables = Exact<{
  company_id: Scalars["uuid"];
}>;

export type GetPaymentsForCompanyQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      payments: Array<
        Pick<Payments, "id"> & {
          transactions: Array<
            Pick<Transactions, "id"> & {
              loan?: Maybe<
                Pick<Loans, "id"> &
                  LoanLimitedFragment &
                  LoanArtifactLimitedFragment
              >;
              payment: Pick<Payments, "id"> & PaymentLimitedFragment;
            } & TransactionFragment
          >;
        } & PaymentLimitedFragment
      >;
    }
  >;
  transactions: Array<
    Pick<Transactions, "id"> & {
      loan?: Maybe<
        Pick<Loans, "id"> & LoanLimitedFragment & LoanArtifactLimitedFragment
      >;
      payment: PaymentLimitedFragment;
    } & TransactionFragment
  >;
};

export type GetCompanySettingsQueryVariables = Exact<{
  company_settings_id: Scalars["uuid"];
}>;

export type GetCompanySettingsQuery = {
  company_settings_by_pk?: Maybe<CompanySettingsFragment>;
};

export type UpdateCustomerSettingsMutationVariables = Exact<{
  companySettingsId: Scalars["uuid"];
  vendorAgreementTemplateLink?: Maybe<Scalars["String"]>;
  payorAgreementTemplateLink?: Maybe<Scalars["String"]>;
  hasAutofinancing?: Maybe<Scalars["Boolean"]>;
}>;

export type UpdateCustomerSettingsMutation = {
  update_company_settings_by_pk?: Maybe<CompanySettingsFragment>;
};

export type UpdateCompanySettingsMutationVariables = Exact<{
  company_settings_id: Scalars["uuid"];
  company_settings: CompanySettingsSetInput;
}>;

export type UpdateCompanySettingsMutation = {
  update_company_settings_by_pk?: Maybe<CompanySettingsFragment>;
};

export type GetContractQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetContractQuery = {
  contracts_by_pk?: Maybe<
    Pick<Contracts, "id"> & {
      company?: Maybe<Pick<Companies, "id" | "name">>;
    } & ContractFragment
  >;
};

export type GetUserQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetUserQuery = {
  users_by_pk?: Maybe<Pick<Users, "id"> & UserFragment>;
};

export type GetUsersByRolesQueryVariables = Exact<{
  roles: Array<UserRolesEnum>;
}>;

export type GetUsersByRolesQuery = {
  users: Array<Pick<Users, "id"> & UserFragment>;
};

export type ListUsersByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type ListUsersByCompanyIdQuery = { users: Array<UserFragment> };

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

export type GetLatestBankFinancialSummariesSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetLatestBankFinancialSummariesSubscription = {
  bank_financial_summaries: Array<
    Pick<BankFinancialSummaries, "id"> & BankFinancialSummaryFragment
  >;
};

export type GetLoansCountForBankSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetLoansCountForBankSubscription = {
  loans: Array<Pick<Loans, "id">>;
};

export type GetPaymentsCountForBankSubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type GetPaymentsCountForBankSubscription = {
  payments: Array<Pick<Payments, "id">>;
};

export type GetCompanyWithActiveContractQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetCompanyWithActiveContractQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      contract?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
    }
  >;
};

export type GetCompanyForCustomerBorrowingBaseQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetCompanyForCustomerBorrowingBaseQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      ebba_applications: Array<
        Pick<EbbaApplications, "id"> & {
          company: Pick<Companies, "id" | "name">;
        } & EbbaApplicationFragment
      >;
      settings: Pick<CompanySettings, "id"> & {
        active_ebba_application?: Maybe<
          Pick<EbbaApplications, "id"> & EbbaApplicationFragment
        >;
      };
    }
  >;
};

export type GetCompanyForCustomerContractPageQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetCompanyForCustomerContractPageQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id"> & {
      contract?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
      contracts: Array<Pick<Contracts, "id"> & ContractFragment>;
    }
  >;
};

export type GetCompanyWithDetailsByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetCompanyWithDetailsByCompanyIdQuery = {
  companies_by_pk?: Maybe<
    Pick<Companies, "id" | "name"> & {
      contract?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
      financial_summaries: Array<
        Pick<FinancialSummaries, "id"> & FinancialSummaryFragment
      >;
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
  | "contract_name"
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
  | "adjusted_end_date"
  | "terminated_at"
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
  | "rejection_note"
  | "bank_rejection_note"
  | "created_at"
  | "requested_at"
  | "approved_at"
  | "funded_at"
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
  | "disbursement_identifier"
  | "status"
  | "rejection_note"
  | "payment_status"
  | "amount"
  | "requested_payment_date"
  | "origination_date"
  | "maturity_date"
  | "adjusted_maturity_date"
  | "outstanding_principal_balance"
  | "outstanding_interest"
  | "outstanding_fees"
  | "approved_at"
  | "funded_at"
> & { company: Pick<Companies, "id" | "identifier" | "name"> };

export type PaymentLimitedFragment = Pick<
  Payments,
  | "id"
  | "settlement_identifier"
  | "submitted_at"
  | "settled_at"
  | "type"
  | "method"
  | "requested_amount"
  | "amount"
  | "requested_payment_date"
  | "payment_date"
  | "deposit_date"
  | "settlement_date"
  | "items_covered"
>;

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
  | "is_cannabis_compliant"
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
  | "application_date"
  | "monthly_accounts_receivable"
  | "monthly_inventory"
  | "monthly_cash"
  | "amount_cash_in_daca"
  | "calculated_borrowing_base"
  | "status"
  | "rejection_note"
  | "created_at"
  | "expires_at"
>;

export type EbbaApplicationFileFragment = Pick<
  EbbaApplicationFiles,
  "ebba_application_id" | "file_id"
> & { file: Pick<Files, "id"> & FileFragment };

export type LineOfCreditFragment = Pick<
  LineOfCredits,
  "id" | "company_id" | "is_credit_for_vendor" | "recipient_vendor_id"
> & { recipient_vendor?: Maybe<Pick<Companies, "id" | "name">> };

export type FinancialSummaryFragment = Pick<
  FinancialSummaries,
  | "id"
  | "company_id"
  | "date"
  | "available_limit"
  | "adjusted_total_limit"
  | "total_outstanding_principal"
  | "total_outstanding_interest"
  | "total_outstanding_fees"
  | "total_principal_in_requested_state"
  | "total_outstanding_principal_for_interest"
  | "minimum_monthly_payload"
  | "account_level_balance_payload"
  | "day_volume_threshold_met"
  | "interest_accrued_today"
>;

export type BankFinancialSummaryFragment = Pick<
  BankFinancialSummaries,
  | "id"
  | "updated_at"
  | "date"
  | "product_type"
  | "adjusted_total_limit"
  | "total_outstanding_principal"
  | "total_outstanding_interest"
  | "total_outstanding_fees"
  | "total_principal_in_requested_state"
  | "available_limit"
  | "interest_accrued_today"
>;

export type InvoiceFileFragment = Pick<
  InvoiceFiles,
  "invoice_id" | "file_id" | "file_type"
> & { file: Pick<Files, "id"> & FileFragment };

export type InvoiceFragment = Pick<
  Invoices,
  | "id"
  | "company_id"
  | "payor_id"
  | "invoice_number"
  | "subtotal_amount"
  | "total_amount"
  | "taxes_amount"
  | "invoice_date"
  | "invoice_due_date"
  | "is_cannabis"
  | "status"
  | "created_at"
  | "approved_at"
  | "funded_at"
  | "payment_requested_at"
  | "payment_confirmed_at"
  | "payment_rejected_at"
> & {
  company: Pick<Companies, "id" | "name">;
  payor?: Maybe<Pick<Payors, "id" | "name">>;
};

export type VendorPartnershipFragment = Pick<
  CompanyVendorPartnerships,
  | "id"
  | "company_id"
  | "vendor_id"
  | "vendor_bank_id"
  | "vendor_agreement_id"
  | "vendor_license_id"
  | "approved_at"
> & {
  company: Pick<Companies, "id" | "name">;
  vendor: Pick<Companies, "id" | "name">;
};

export type PayorPartnershipFragment = Pick<
  CompanyPayorPartnerships,
  | "id"
  | "company_id"
  | "payor_id"
  | "payor_agreement_id"
  | "payor_license_id"
  | "approved_at"
> & {
  company: Pick<Companies, "id" | "name">;
  payor?: Maybe<Pick<Companies, "id" | "name">>;
};

export type UpdateCompanyInfoMutationVariables = Exact<{
  id: Scalars["uuid"];
  company: CompaniesSetInput;
}>;

export type UpdateCompanyInfoMutation = {
  update_companies_by_pk?: Maybe<ThirdPartyFragment>;
};

export type GetTransactionsQueryVariables = Exact<{ [key: string]: never }>;

export type GetTransactionsQuery = {
  transactions: Array<
    Pick<Transactions, "id"> & {
      payment: Pick<Payments, "id"> & {
        company: Pick<Companies, "id" | "name">;
      };
    } & TransactionFragment
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

export type GetVendorPartnershipForBankQueryVariables = Exact<{
  id: Scalars["uuid"];
}>;

export type GetVendorPartnershipForBankQuery = {
  company_vendor_partnerships_by_pk?: Maybe<
    {
      company: {
        users: Array<ContactFragment>;
        settings: CompanySettingsFragment;
      } & CompanyFragment;
      company_agreement?: Maybe<CompanyAgreementFragment>;
      company_license?: Maybe<CompanyLicenseFragment>;
      vendor: {
        settings: Pick<CompanySettings, "id"> & {
          collections_bespoke_bank_account?: Maybe<BankAccountFragment>;
        } & CompanySettingsFragment;
        users: Array<ContactFragment>;
        licenses: Array<CompanyLicenseFragment>;
      } & ThirdPartyFragment;
      vendor_bank_account?: Maybe<
        Pick<BankAccounts, "id"> & BankAccountFragment
      >;
    } & VendorPartnershipFragment
  >;
};

export type GetVendorPartnershipsForBankQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetVendorPartnershipsForBankQuery = {
  company_vendor_partnerships: Array<
    {
      company: Pick<Companies, "id" | "name">;
      vendor: {
        settings: Pick<CompanySettings, "id">;
        users: Array<ContactFragment>;
        licenses: Array<CompanyLicenseFragment>;
      } & ThirdPartyFragment;
      vendor_bank_account?: Maybe<Pick<BankAccounts, "id" | "verified_at">>;
    } & VendorPartnershipFragment
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
  update_company_vendor_partnerships_by_pk?: Maybe<VendorPartnershipFragment>;
};

export type UpdateVendorInfoMutationVariables = Exact<{
  id: Scalars["uuid"];
  company: CompaniesSetInput;
}>;

export type UpdateVendorInfoMutation = {
  update_companies_by_pk?: Maybe<ThirdPartyFragment>;
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

export type GetVendorPartnershipsByCompanyIdQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetVendorPartnershipsByCompanyIdQuery = {
  company_vendor_partnerships: Array<
    {
      vendor_limited?: Maybe<VendorLimitedFragment>;
    } & VendorPartnershipLimitedFragment
  >;
};

export type GetVendorsByPartnerCompanyQueryVariables = Exact<{
  companyId: Scalars["uuid"];
}>;

export type GetVendorsByPartnerCompanyQuery = {
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
  | "identifier"
  | "name"
  | "contract_name"
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
  | "payor_agreement_docusign_template"
  | "collections_bespoke_bank_account_id"
  | "has_autofinancing"
  | "two_factor_message_method"
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

export type LoanFragment = Pick<
  Loans,
  | "id"
  | "loan_type"
  | "artifact_id"
  | "identifier"
  | "disbursement_identifier"
  | "status"
  | "rejection_note"
  | "notes"
  | "payment_status"
  | "amount"
  | "requested_payment_date"
  | "origination_date"
  | "maturity_date"
  | "adjusted_maturity_date"
  | "outstanding_principal_balance"
  | "outstanding_interest"
  | "outstanding_fees"
  | "requested_at"
  | "rejected_at"
  | "funded_at"
  | "closed_at"
> & { company: Pick<Companies, "id" | "identifier" | "name"> };

export type LoanArtifactLimitedFragment = Pick<
  Loans,
  "id" | "loan_type" | "artifact_id" | "identifier"
> & {
  invoice?: Maybe<Pick<Invoices, "id" | "invoice_number">>;
  line_of_credit?: Maybe<Pick<LineOfCredits, "id"> & LineOfCreditFragment>;
  purchase_order?: Maybe<Pick<PurchaseOrders, "id" | "order_number">>;
};

export type LoanArtifactFragment = Pick<
  Loans,
  "id" | "loan_type" | "artifact_id" | "identifier"
> & {
  invoice?: Maybe<Pick<Invoices, "id"> & InvoiceFragment>;
  line_of_credit?: Maybe<Pick<LineOfCredits, "id"> & LineOfCreditFragment>;
  purchase_order?: Maybe<Pick<PurchaseOrders, "id"> & PurchaseOrderFragment>;
};

export type ThirdPartyFragment = Pick<
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

export type BankPayorFragment = Pick<
  Payors,
  | "id"
  | "name"
  | "address"
  | "country"
  | "state"
  | "city"
  | "zip_code"
  | "phone_number"
>;

export type PaymentFragment = Pick<
  Payments,
  | "id"
  | "company_id"
  | "created_at"
  | "submitted_at"
  | "settled_at"
  | "type"
  | "method"
  | "requested_amount"
  | "amount"
  | "requested_payment_date"
  | "payment_date"
  | "deposit_date"
  | "settlement_date"
  | "items_covered"
> & { company_bank_account?: Maybe<BankAccountFragment> };

export type TransactionFragment = Pick<
  Transactions,
  | "id"
  | "created_at"
  | "loan_id"
  | "payment_id"
  | "type"
  | "subtype"
  | "amount"
  | "effective_date"
  | "to_principal"
  | "to_interest"
  | "to_fees"
>;

export type CompanySettingsForCustomerFragment = Pick<
  CompanySettings,
  | "id"
  | "company_id"
  | "vendor_agreement_docusign_template"
  | "payor_agreement_docusign_template"
  | "collections_bespoke_bank_account_id"
  | "has_autofinancing"
>;

export type VendorLimitedFragment = Pick<Vendors, "id" | "name">;

export type PayorLimitedFragment = Pick<Payors, "id" | "name">;

export type VendorPartnershipLimitedFragment = Pick<
  CompanyVendorPartnerships,
  | "id"
  | "company_id"
  | "vendor_id"
  | "vendor_agreement_id"
  | "vendor_license_id"
  | "approved_at"
> & {
  company: Pick<Companies, "id" | "name">;
  vendor: Pick<Companies, "id" | "name">;
};

export type GetCustomersWithMetadataQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCustomersWithMetadataQuery = {
  customers: Array<
    Pick<Companies, "id"> & {
      contract?: Maybe<Pick<Contracts, "id"> & ContractFragment>;
      financial_summaries: Array<
        Pick<FinancialSummaries, "id"> & FinancialSummaryFragment
      >;
      settings: Pick<CompanySettings, "id"> & CompanySettingsFragment;
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

export type UsersByEmailQueryVariables = Exact<{
  email: Scalars["String"];
}>;

export type UsersByEmailQuery = {
  users: Array<Pick<Users, "id" | "company_id" | "role">>;
};

export type UpdateUserMutationVariables = Exact<{
  id: Scalars["uuid"];
  user: UsersSetInput;
}>;

export type UpdateUserMutation = { update_users_by_pk?: Maybe<UserFragment> };

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
    contract_name
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
    adjusted_end_date
    terminated_at
  }
`;
export const LoanLimitedFragmentDoc = gql`
  fragment LoanLimited on loans {
    id
    loan_type
    artifact_id
    identifier
    disbursement_identifier
    status
    rejection_note
    payment_status
    amount
    requested_payment_date
    origination_date
    maturity_date
    adjusted_maturity_date
    outstanding_principal_balance
    outstanding_interest
    outstanding_fees
    approved_at
    funded_at
    company {
      id
      identifier
      name
    }
  }
`;
export const PaymentLimitedFragmentDoc = gql`
  fragment PaymentLimited on payments {
    id
    settlement_identifier
    submitted_at
    settled_at
    type
    method
    requested_amount
    amount
    requested_payment_date
    payment_date
    deposit_date
    settlement_date
    items_covered
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
    application_date
    monthly_accounts_receivable
    monthly_inventory
    monthly_cash
    amount_cash_in_daca
    calculated_borrowing_base
    status
    rejection_note
    created_at
    expires_at
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
export const FinancialSummaryFragmentDoc = gql`
  fragment FinancialSummary on financial_summaries {
    id
    company_id
    date
    available_limit
    adjusted_total_limit
    total_outstanding_principal
    total_outstanding_interest
    total_outstanding_fees
    total_principal_in_requested_state
    total_outstanding_principal_for_interest
    minimum_monthly_payload
    account_level_balance_payload
    day_volume_threshold_met
    interest_accrued_today
  }
`;
export const BankFinancialSummaryFragmentDoc = gql`
  fragment BankFinancialSummary on bank_financial_summaries {
    id
    updated_at
    date
    product_type
    adjusted_total_limit
    total_outstanding_principal
    total_outstanding_interest
    total_outstanding_fees
    total_principal_in_requested_state
    available_limit
    interest_accrued_today
  }
`;
export const InvoiceFileFragmentDoc = gql`
  fragment InvoiceFile on invoice_files {
    invoice_id
    file_id
    file_type
    file {
      id
      ...File
    }
  }
  ${FileFragmentDoc}
`;
export const VendorPartnershipFragmentDoc = gql`
  fragment VendorPartnership on company_vendor_partnerships {
    id
    company_id
    vendor_id
    vendor_bank_id
    vendor_agreement_id
    vendor_license_id
    approved_at
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
export const PayorPartnershipFragmentDoc = gql`
  fragment PayorPartnership on company_payor_partnerships {
    id
    company_id
    payor_id
    payor_agreement_id
    payor_license_id
    approved_at
    company {
      id
      name
    }
    payor {
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
    identifier
    name
    contract_name
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
    payor_agreement_docusign_template
    collections_bespoke_bank_account_id
    has_autofinancing
    two_factor_message_method
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
export const LoanFragmentDoc = gql`
  fragment Loan on loans {
    id
    loan_type
    artifact_id
    identifier
    disbursement_identifier
    status
    rejection_note
    notes
    payment_status
    amount
    requested_payment_date
    origination_date
    maturity_date
    adjusted_maturity_date
    outstanding_principal_balance
    outstanding_interest
    outstanding_fees
    requested_at
    rejected_at
    funded_at
    closed_at
    company {
      id
      identifier
      name
    }
  }
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
export const LoanArtifactLimitedFragmentDoc = gql`
  fragment LoanArtifactLimited on loans {
    id
    loan_type
    artifact_id
    identifier
    invoice {
      id
      invoice_number
    }
    line_of_credit {
      id
      ...LineOfCredit
    }
    purchase_order {
      id
      order_number
    }
  }
  ${LineOfCreditFragmentDoc}
`;
export const InvoiceFragmentDoc = gql`
  fragment Invoice on invoices {
    id
    company_id
    payor_id
    invoice_number
    subtotal_amount
    total_amount
    taxes_amount
    invoice_date
    invoice_due_date
    is_cannabis
    status
    created_at
    approved_at
    funded_at
    payment_requested_at
    payment_confirmed_at
    payment_rejected_at
    company {
      id
      name
    }
    payor {
      id
      name
    }
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
    rejection_note
    bank_rejection_note
    created_at
    requested_at
    approved_at
    funded_at
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
export const LoanArtifactFragmentDoc = gql`
  fragment LoanArtifact on loans {
    id
    loan_type
    artifact_id
    identifier
    invoice {
      id
      ...Invoice
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
  ${InvoiceFragmentDoc}
  ${LineOfCreditFragmentDoc}
  ${PurchaseOrderFragmentDoc}
`;
export const ThirdPartyFragmentDoc = gql`
  fragment ThirdParty on companies {
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
export const BankPayorFragmentDoc = gql`
  fragment BankPayor on payors {
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
    is_cannabis_compliant
  }
`;
export const PaymentFragmentDoc = gql`
  fragment Payment on payments {
    id
    company_id
    created_at
    submitted_at
    settled_at
    type
    method
    requested_amount
    amount
    requested_payment_date
    payment_date
    deposit_date
    settlement_date
    items_covered
    company_bank_account {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;
export const TransactionFragmentDoc = gql`
  fragment Transaction on transactions {
    id
    created_at
    loan_id
    payment_id
    type
    subtype
    amount
    effective_date
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
    payor_agreement_docusign_template
    collections_bespoke_bank_account_id
    has_autofinancing
  }
`;
export const VendorLimitedFragmentDoc = gql`
  fragment VendorLimited on vendors {
    id
    name
  }
`;
export const PayorLimitedFragmentDoc = gql`
  fragment PayorLimited on payors {
    id
    name
  }
`;
export const VendorPartnershipLimitedFragmentDoc = gql`
  fragment VendorPartnershipLimited on company_vendor_partnerships {
    id
    company_id
    vendor_id
    vendor_agreement_id
    vendor_license_id
    approved_at
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
export const GetBespokeBankAccountsDocument = gql`
  query GetBespokeBankAccounts {
    bank_accounts(where: { company_id: { _is_null: true } }) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;

/**
 * __useGetBespokeBankAccountsQuery__
 *
 * To run a query within a React component, call `useGetBespokeBankAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBespokeBankAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBespokeBankAccountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetBespokeBankAccountsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetBespokeBankAccountsQuery,
    GetBespokeBankAccountsQueryVariables
  >
) {
  return Apollo.useQuery<
    GetBespokeBankAccountsQuery,
    GetBespokeBankAccountsQueryVariables
  >(GetBespokeBankAccountsDocument, baseOptions);
}
export function useGetBespokeBankAccountsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBespokeBankAccountsQuery,
    GetBespokeBankAccountsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetBespokeBankAccountsQuery,
    GetBespokeBankAccountsQueryVariables
  >(GetBespokeBankAccountsDocument, baseOptions);
}
export type GetBespokeBankAccountsQueryHookResult = ReturnType<
  typeof useGetBespokeBankAccountsQuery
>;
export type GetBespokeBankAccountsLazyQueryHookResult = ReturnType<
  typeof useGetBespokeBankAccountsLazyQuery
>;
export type GetBespokeBankAccountsQueryResult = Apollo.QueryResult<
  GetBespokeBankAccountsQuery,
  GetBespokeBankAccountsQueryVariables
>;
export const GetBankAccountsByCompanyIdDocument = gql`
  query GetBankAccountsByCompanyId($companyId: uuid!) {
    bank_accounts(where: { company_id: { _eq: $companyId } }) {
      ...BankAccount
    }
  }
  ${BankAccountFragmentDoc}
`;

/**
 * __useGetBankAccountsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetBankAccountsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBankAccountsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBankAccountsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetBankAccountsByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBankAccountsByCompanyIdQuery,
    GetBankAccountsByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetBankAccountsByCompanyIdQuery,
    GetBankAccountsByCompanyIdQueryVariables
  >(GetBankAccountsByCompanyIdDocument, baseOptions);
}
export function useGetBankAccountsByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBankAccountsByCompanyIdQuery,
    GetBankAccountsByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetBankAccountsByCompanyIdQuery,
    GetBankAccountsByCompanyIdQueryVariables
  >(GetBankAccountsByCompanyIdDocument, baseOptions);
}
export type GetBankAccountsByCompanyIdQueryHookResult = ReturnType<
  typeof useGetBankAccountsByCompanyIdQuery
>;
export type GetBankAccountsByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetBankAccountsByCompanyIdLazyQuery
>;
export type GetBankAccountsByCompanyIdQueryResult = Apollo.QueryResult<
  GetBankAccountsByCompanyIdQuery,
  GetBankAccountsByCompanyIdQueryVariables
>;
export const BankAccountsForTransferDocument = gql`
  query BankAccountsForTransfer($companyId: uuid!) {
    bank_accounts(where: { company_id: { _is_null: true } }) {
      ...BankAccount
    }
    companies_by_pk(id: $companyId) {
      id
      settings {
        id
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
export const GetCustomerOverviewDocument = gql`
  query GetCustomerOverview($companyId: uuid!, $loanType: loan_type_enum) {
    companies_by_pk(id: $companyId) {
      id
      financial_summaries(
        order_by: { date: desc }
        where: { date: { _is_null: false } }
        limit: 1
      ) {
        id
        ...FinancialSummary
      }
      outstanding_loans: loans(
        where: {
          _and: [
            {
              _or: [
                { is_deleted: { _is_null: true } }
                { is_deleted: { _eq: false } }
              ]
            }
            { loan_type: { _eq: $loanType } }
            { funded_at: { _is_null: false } }
            { closed_at: { _is_null: true } }
          ]
        }
        order_by: [
          { adjusted_maturity_date: asc }
          { origination_date: asc }
          { amount: asc }
          { created_at: asc }
        ]
      ) {
        id
        ...LoanLimited
        ...LoanArtifactLimited
      }
      pending_payments: payments(
        where: {
          _and: [
            {
              _or: [
                { is_deleted: { _is_null: true } }
                { is_deleted: { _eq: false } }
              ]
            }
            { type: { _in: ["repayment", "repayment_account_fee"] } }
            { submitted_at: { _is_null: false } }
            { settled_at: { _is_null: true } }
          ]
        }
      ) {
        id
        ...PaymentLimited
      }
    }
  }
  ${FinancialSummaryFragmentDoc}
  ${LoanLimitedFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
  ${PaymentLimitedFragmentDoc}
`;

/**
 * __useGetCustomerOverviewQuery__
 *
 * To run a query within a React component, call `useGetCustomerOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCustomerOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCustomerOverviewQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      loanType: // value for 'loanType'
 *   },
 * });
 */
export function useGetCustomerOverviewQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCustomerOverviewQuery,
    GetCustomerOverviewQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCustomerOverviewQuery,
    GetCustomerOverviewQueryVariables
  >(GetCustomerOverviewDocument, baseOptions);
}
export function useGetCustomerOverviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCustomerOverviewQuery,
    GetCustomerOverviewQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCustomerOverviewQuery,
    GetCustomerOverviewQueryVariables
  >(GetCustomerOverviewDocument, baseOptions);
}
export type GetCustomerOverviewQueryHookResult = ReturnType<
  typeof useGetCustomerOverviewQuery
>;
export type GetCustomerOverviewLazyQueryHookResult = ReturnType<
  typeof useGetCustomerOverviewLazyQuery
>;
export type GetCustomerOverviewQueryResult = Apollo.QueryResult<
  GetCustomerOverviewQuery,
  GetCustomerOverviewQueryVariables
>;
export const GetCustomerAccountDocument = gql`
  query GetCustomerAccount($companyId: uuid!) {
    companies_by_pk(id: $companyId) {
      id
      financial_summaries(
        order_by: { date: desc }
        where: { date: { _is_null: false } }
        limit: 1
      ) {
        id
        ...FinancialSummary
      }
      fee_payments: payments(
        where: {
          _and: [
            {
              _or: [
                { is_deleted: { _is_null: true } }
                { is_deleted: { _eq: false } }
              ]
            }
            { type: { _eq: "fee" } }
          ]
        }
        order_by: [{ deposit_date: desc }, { settlement_date: desc }]
      ) {
        id
        ...PaymentLimited
        transactions {
          id
          ...Transaction
        }
      }
      pending_payments: payments(
        where: {
          _and: [
            {
              _or: [
                { is_deleted: { _is_null: true } }
                { is_deleted: { _eq: false } }
              ]
            }
            { type: { _eq: "repayment" } }
            { submitted_at: { _is_null: false } }
            { settled_at: { _is_null: true } }
          ]
        }
        order_by: { created_at: asc }
      ) {
        id
        ...PaymentLimited
      }
    }
  }
  ${FinancialSummaryFragmentDoc}
  ${PaymentLimitedFragmentDoc}
  ${TransactionFragmentDoc}
`;

/**
 * __useGetCustomerAccountQuery__
 *
 * To run a query within a React component, call `useGetCustomerAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCustomerAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCustomerAccountQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetCustomerAccountQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCustomerAccountQuery,
    GetCustomerAccountQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCustomerAccountQuery,
    GetCustomerAccountQueryVariables
  >(GetCustomerAccountDocument, baseOptions);
}
export function useGetCustomerAccountLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCustomerAccountQuery,
    GetCustomerAccountQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCustomerAccountQuery,
    GetCustomerAccountQueryVariables
  >(GetCustomerAccountDocument, baseOptions);
}
export type GetCustomerAccountQueryHookResult = ReturnType<
  typeof useGetCustomerAccountQuery
>;
export type GetCustomerAccountLazyQueryHookResult = ReturnType<
  typeof useGetCustomerAccountLazyQuery
>;
export type GetCustomerAccountQueryResult = Apollo.QueryResult<
  GetCustomerAccountQuery,
  GetCustomerAccountQueryVariables
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
export const BankCustomerListPayorPartnershipsDocument = gql`
  query BankCustomerListPayorPartnerships($companyId: uuid!) {
    company_payor_partnerships(where: { company_id: { _eq: $companyId } }) {
      ...PayorPartnership
      payor {
        id
        ...ThirdParty
        users {
          id
          ...Contact
        }
      }
    }
  }
  ${PayorPartnershipFragmentDoc}
  ${ThirdPartyFragmentDoc}
  ${ContactFragmentDoc}
`;

/**
 * __useBankCustomerListPayorPartnershipsQuery__
 *
 * To run a query within a React component, call `useBankCustomerListPayorPartnershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useBankCustomerListPayorPartnershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBankCustomerListPayorPartnershipsQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useBankCustomerListPayorPartnershipsQuery(
  baseOptions: Apollo.QueryHookOptions<
    BankCustomerListPayorPartnershipsQuery,
    BankCustomerListPayorPartnershipsQueryVariables
  >
) {
  return Apollo.useQuery<
    BankCustomerListPayorPartnershipsQuery,
    BankCustomerListPayorPartnershipsQueryVariables
  >(BankCustomerListPayorPartnershipsDocument, baseOptions);
}
export function useBankCustomerListPayorPartnershipsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BankCustomerListPayorPartnershipsQuery,
    BankCustomerListPayorPartnershipsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    BankCustomerListPayorPartnershipsQuery,
    BankCustomerListPayorPartnershipsQueryVariables
  >(BankCustomerListPayorPartnershipsDocument, baseOptions);
}
export type BankCustomerListPayorPartnershipsQueryHookResult = ReturnType<
  typeof useBankCustomerListPayorPartnershipsQuery
>;
export type BankCustomerListPayorPartnershipsLazyQueryHookResult = ReturnType<
  typeof useBankCustomerListPayorPartnershipsLazyQuery
>;
export type BankCustomerListPayorPartnershipsQueryResult = Apollo.QueryResult<
  BankCustomerListPayorPartnershipsQuery,
  BankCustomerListPayorPartnershipsQueryVariables
>;
export const GetFinancialSummariesByCompanyIdDocument = gql`
  query GetFinancialSummariesByCompanyId($companyId: uuid!) {
    financial_summaries(
      where: { company_id: { _eq: $companyId } }
      order_by: { date: desc }
    ) {
      id
      ...FinancialSummary
      company {
        id
        name
      }
    }
  }
  ${FinancialSummaryFragmentDoc}
`;

/**
 * __useGetFinancialSummariesByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetFinancialSummariesByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFinancialSummariesByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFinancialSummariesByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetFinancialSummariesByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetFinancialSummariesByCompanyIdQuery,
    GetFinancialSummariesByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetFinancialSummariesByCompanyIdQuery,
    GetFinancialSummariesByCompanyIdQueryVariables
  >(GetFinancialSummariesByCompanyIdDocument, baseOptions);
}
export function useGetFinancialSummariesByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFinancialSummariesByCompanyIdQuery,
    GetFinancialSummariesByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetFinancialSummariesByCompanyIdQuery,
    GetFinancialSummariesByCompanyIdQueryVariables
  >(GetFinancialSummariesByCompanyIdDocument, baseOptions);
}
export type GetFinancialSummariesByCompanyIdQueryHookResult = ReturnType<
  typeof useGetFinancialSummariesByCompanyIdQuery
>;
export type GetFinancialSummariesByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetFinancialSummariesByCompanyIdLazyQuery
>;
export type GetFinancialSummariesByCompanyIdQueryResult = Apollo.QueryResult<
  GetFinancialSummariesByCompanyIdQuery,
  GetFinancialSummariesByCompanyIdQueryVariables
>;
export const GetFinancialSummariesByDateDocument = gql`
  query GetFinancialSummariesByDate($date: date!) {
    financial_summaries(where: { date: { _eq: $date } }) {
      id
      ...FinancialSummary
      company {
        id
        name
      }
    }
  }
  ${FinancialSummaryFragmentDoc}
`;

/**
 * __useGetFinancialSummariesByDateQuery__
 *
 * To run a query within a React component, call `useGetFinancialSummariesByDateQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFinancialSummariesByDateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFinancialSummariesByDateQuery({
 *   variables: {
 *      date: // value for 'date'
 *   },
 * });
 */
export function useGetFinancialSummariesByDateQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetFinancialSummariesByDateQuery,
    GetFinancialSummariesByDateQueryVariables
  >
) {
  return Apollo.useQuery<
    GetFinancialSummariesByDateQuery,
    GetFinancialSummariesByDateQueryVariables
  >(GetFinancialSummariesByDateDocument, baseOptions);
}
export function useGetFinancialSummariesByDateLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFinancialSummariesByDateQuery,
    GetFinancialSummariesByDateQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetFinancialSummariesByDateQuery,
    GetFinancialSummariesByDateQueryVariables
  >(GetFinancialSummariesByDateDocument, baseOptions);
}
export type GetFinancialSummariesByDateQueryHookResult = ReturnType<
  typeof useGetFinancialSummariesByDateQuery
>;
export type GetFinancialSummariesByDateLazyQueryHookResult = ReturnType<
  typeof useGetFinancialSummariesByDateLazyQuery
>;
export type GetFinancialSummariesByDateQueryResult = Apollo.QueryResult<
  GetFinancialSummariesByDateQuery,
  GetFinancialSummariesByDateQueryVariables
>;
export const GetEbbaApplicationDocument = gql`
  query GetEbbaApplication($id: uuid!) {
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
 * __useGetEbbaApplicationQuery__
 *
 * To run a query within a React component, call `useGetEbbaApplicationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEbbaApplicationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEbbaApplicationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetEbbaApplicationQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetEbbaApplicationQuery,
    GetEbbaApplicationQueryVariables
  >
) {
  return Apollo.useQuery<
    GetEbbaApplicationQuery,
    GetEbbaApplicationQueryVariables
  >(GetEbbaApplicationDocument, baseOptions);
}
export function useGetEbbaApplicationLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEbbaApplicationQuery,
    GetEbbaApplicationQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetEbbaApplicationQuery,
    GetEbbaApplicationQueryVariables
  >(GetEbbaApplicationDocument, baseOptions);
}
export type GetEbbaApplicationQueryHookResult = ReturnType<
  typeof useGetEbbaApplicationQuery
>;
export type GetEbbaApplicationLazyQueryHookResult = ReturnType<
  typeof useGetEbbaApplicationLazyQuery
>;
export type GetEbbaApplicationQueryResult = Apollo.QueryResult<
  GetEbbaApplicationQuery,
  GetEbbaApplicationQueryVariables
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
export const UpdateEbbaApplicationDocument = gql`
  mutation UpdateEbbaApplication(
    $id: uuid!
    $ebbaApplication: ebba_applications_set_input!
    $ebbaApplicationFiles: [ebba_application_files_insert_input!]!
  ) {
    delete_ebba_application_files(
      where: { ebba_application_id: { _eq: $id } }
    ) {
      affected_rows
    }
    insert_ebba_application_files(objects: $ebbaApplicationFiles) {
      returning {
        ebba_application_id
        file_id
      }
    }
    update_ebba_applications_by_pk(
      pk_columns: { id: $id }
      _set: $ebbaApplication
    ) {
      id
      ...EbbaApplication
      ebba_application_files {
        ...EbbaApplicationFile
      }
    }
  }
  ${EbbaApplicationFragmentDoc}
  ${EbbaApplicationFileFragmentDoc}
`;
export type UpdateEbbaApplicationMutationFn = Apollo.MutationFunction<
  UpdateEbbaApplicationMutation,
  UpdateEbbaApplicationMutationVariables
>;

/**
 * __useUpdateEbbaApplicationMutation__
 *
 * To run a mutation, you first call `useUpdateEbbaApplicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEbbaApplicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEbbaApplicationMutation, { data, loading, error }] = useUpdateEbbaApplicationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      ebbaApplication: // value for 'ebbaApplication'
 *      ebbaApplicationFiles: // value for 'ebbaApplicationFiles'
 *   },
 * });
 */
export function useUpdateEbbaApplicationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateEbbaApplicationMutation,
    UpdateEbbaApplicationMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateEbbaApplicationMutation,
    UpdateEbbaApplicationMutationVariables
  >(UpdateEbbaApplicationDocument, baseOptions);
}
export type UpdateEbbaApplicationMutationHookResult = ReturnType<
  typeof useUpdateEbbaApplicationMutation
>;
export type UpdateEbbaApplicationMutationResult = Apollo.MutationResult<UpdateEbbaApplicationMutation>;
export type UpdateEbbaApplicationMutationOptions = Apollo.BaseMutationOptions<
  UpdateEbbaApplicationMutation,
  UpdateEbbaApplicationMutationVariables
>;
export const GetOpenEbbaApplicationsDocument = gql`
  query GetOpenEbbaApplications {
    ebba_applications(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { approved_at: { _is_null: true } }
        ]
      }
      order_by: [{ application_date: desc }, { created_at: desc }]
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
 * __useGetOpenEbbaApplicationsQuery__
 *
 * To run a query within a React component, call `useGetOpenEbbaApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpenEbbaApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpenEbbaApplicationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOpenEbbaApplicationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetOpenEbbaApplicationsQuery,
    GetOpenEbbaApplicationsQueryVariables
  >
) {
  return Apollo.useQuery<
    GetOpenEbbaApplicationsQuery,
    GetOpenEbbaApplicationsQueryVariables
  >(GetOpenEbbaApplicationsDocument, baseOptions);
}
export function useGetOpenEbbaApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOpenEbbaApplicationsQuery,
    GetOpenEbbaApplicationsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetOpenEbbaApplicationsQuery,
    GetOpenEbbaApplicationsQueryVariables
  >(GetOpenEbbaApplicationsDocument, baseOptions);
}
export type GetOpenEbbaApplicationsQueryHookResult = ReturnType<
  typeof useGetOpenEbbaApplicationsQuery
>;
export type GetOpenEbbaApplicationsLazyQueryHookResult = ReturnType<
  typeof useGetOpenEbbaApplicationsLazyQuery
>;
export type GetOpenEbbaApplicationsQueryResult = Apollo.QueryResult<
  GetOpenEbbaApplicationsQuery,
  GetOpenEbbaApplicationsQueryVariables
>;
export const GetClosedEbbaApplicationsDocument = gql`
  query GetClosedEbbaApplications {
    ebba_applications(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { approved_at: { _is_null: false } }
        ]
      }
      order_by: [{ application_date: desc }, { created_at: desc }]
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
 * __useGetClosedEbbaApplicationsQuery__
 *
 * To run a query within a React component, call `useGetClosedEbbaApplicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClosedEbbaApplicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClosedEbbaApplicationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetClosedEbbaApplicationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetClosedEbbaApplicationsQuery,
    GetClosedEbbaApplicationsQueryVariables
  >
) {
  return Apollo.useQuery<
    GetClosedEbbaApplicationsQuery,
    GetClosedEbbaApplicationsQueryVariables
  >(GetClosedEbbaApplicationsDocument, baseOptions);
}
export function useGetClosedEbbaApplicationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetClosedEbbaApplicationsQuery,
    GetClosedEbbaApplicationsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetClosedEbbaApplicationsQuery,
    GetClosedEbbaApplicationsQueryVariables
  >(GetClosedEbbaApplicationsDocument, baseOptions);
}
export type GetClosedEbbaApplicationsQueryHookResult = ReturnType<
  typeof useGetClosedEbbaApplicationsQuery
>;
export type GetClosedEbbaApplicationsLazyQueryHookResult = ReturnType<
  typeof useGetClosedEbbaApplicationsLazyQuery
>;
export type GetClosedEbbaApplicationsQueryResult = Apollo.QueryResult<
  GetClosedEbbaApplicationsQuery,
  GetClosedEbbaApplicationsQueryVariables
>;
export const PayorsByPartnerCompanyDocument = gql`
  query PayorsByPartnerCompany($companyId: uuid!) {
    payors(
      where: { company_payor_partnerships: { company_id: { _eq: $companyId } } }
    ) {
      id
      ...PayorLimited
      company_payor_partnerships {
        id
        approved_at
      }
    }
  }
  ${PayorLimitedFragmentDoc}
`;

/**
 * __usePayorsByPartnerCompanyQuery__
 *
 * To run a query within a React component, call `usePayorsByPartnerCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `usePayorsByPartnerCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePayorsByPartnerCompanyQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function usePayorsByPartnerCompanyQuery(
  baseOptions: Apollo.QueryHookOptions<
    PayorsByPartnerCompanyQuery,
    PayorsByPartnerCompanyQueryVariables
  >
) {
  return Apollo.useQuery<
    PayorsByPartnerCompanyQuery,
    PayorsByPartnerCompanyQueryVariables
  >(PayorsByPartnerCompanyDocument, baseOptions);
}
export function usePayorsByPartnerCompanyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PayorsByPartnerCompanyQuery,
    PayorsByPartnerCompanyQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    PayorsByPartnerCompanyQuery,
    PayorsByPartnerCompanyQueryVariables
  >(PayorsByPartnerCompanyDocument, baseOptions);
}
export type PayorsByPartnerCompanyQueryHookResult = ReturnType<
  typeof usePayorsByPartnerCompanyQuery
>;
export type PayorsByPartnerCompanyLazyQueryHookResult = ReturnType<
  typeof usePayorsByPartnerCompanyLazyQuery
>;
export type PayorsByPartnerCompanyQueryResult = Apollo.QueryResult<
  PayorsByPartnerCompanyQuery,
  PayorsByPartnerCompanyQueryVariables
>;
export const ApprovedPayorsByPartnerCompanyIdDocument = gql`
  query ApprovedPayorsByPartnerCompanyId($companyId: uuid!) {
    payors(
      where: {
        company_payor_partnerships: {
          _and: [
            { company_id: { _eq: $companyId } }
            { approved_at: { _is_null: false } }
          ]
        }
      }
    ) {
      id
      ...PayorLimited
      company_payor_partnerships {
        id
        approved_at
      }
    }
  }
  ${PayorLimitedFragmentDoc}
`;

/**
 * __useApprovedPayorsByPartnerCompanyIdQuery__
 *
 * To run a query within a React component, call `useApprovedPayorsByPartnerCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useApprovedPayorsByPartnerCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApprovedPayorsByPartnerCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useApprovedPayorsByPartnerCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    ApprovedPayorsByPartnerCompanyIdQuery,
    ApprovedPayorsByPartnerCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    ApprovedPayorsByPartnerCompanyIdQuery,
    ApprovedPayorsByPartnerCompanyIdQueryVariables
  >(ApprovedPayorsByPartnerCompanyIdDocument, baseOptions);
}
export function useApprovedPayorsByPartnerCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ApprovedPayorsByPartnerCompanyIdQuery,
    ApprovedPayorsByPartnerCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    ApprovedPayorsByPartnerCompanyIdQuery,
    ApprovedPayorsByPartnerCompanyIdQueryVariables
  >(ApprovedPayorsByPartnerCompanyIdDocument, baseOptions);
}
export type ApprovedPayorsByPartnerCompanyIdQueryHookResult = ReturnType<
  typeof useApprovedPayorsByPartnerCompanyIdQuery
>;
export type ApprovedPayorsByPartnerCompanyIdLazyQueryHookResult = ReturnType<
  typeof useApprovedPayorsByPartnerCompanyIdLazyQuery
>;
export type ApprovedPayorsByPartnerCompanyIdQueryResult = Apollo.QueryResult<
  ApprovedPayorsByPartnerCompanyIdQuery,
  ApprovedPayorsByPartnerCompanyIdQueryVariables
>;
export const CompanyPayorPartnershipForPayorDocument = gql`
  query CompanyPayorPartnershipForPayor($companyId: uuid!, $payorId: uuid!) {
    company_payor_partnerships(
      where: {
        _and: [
          { company_id: { _eq: $companyId } }
          { payor_id: { _eq: $payorId } }
        ]
      }
    ) {
      id
    }
  }
`;

/**
 * __useCompanyPayorPartnershipForPayorQuery__
 *
 * To run a query within a React component, call `useCompanyPayorPartnershipForPayorQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompanyPayorPartnershipForPayorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompanyPayorPartnershipForPayorQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      payorId: // value for 'payorId'
 *   },
 * });
 */
export function useCompanyPayorPartnershipForPayorQuery(
  baseOptions: Apollo.QueryHookOptions<
    CompanyPayorPartnershipForPayorQuery,
    CompanyPayorPartnershipForPayorQueryVariables
  >
) {
  return Apollo.useQuery<
    CompanyPayorPartnershipForPayorQuery,
    CompanyPayorPartnershipForPayorQueryVariables
  >(CompanyPayorPartnershipForPayorDocument, baseOptions);
}
export function useCompanyPayorPartnershipForPayorLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CompanyPayorPartnershipForPayorQuery,
    CompanyPayorPartnershipForPayorQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    CompanyPayorPartnershipForPayorQuery,
    CompanyPayorPartnershipForPayorQueryVariables
  >(CompanyPayorPartnershipForPayorDocument, baseOptions);
}
export type CompanyPayorPartnershipForPayorQueryHookResult = ReturnType<
  typeof useCompanyPayorPartnershipForPayorQuery
>;
export type CompanyPayorPartnershipForPayorLazyQueryHookResult = ReturnType<
  typeof useCompanyPayorPartnershipForPayorLazyQuery
>;
export type CompanyPayorPartnershipForPayorQueryResult = Apollo.QueryResult<
  CompanyPayorPartnershipForPayorQuery,
  CompanyPayorPartnershipForPayorQueryVariables
>;
export const GetInvoiceByIdDocument = gql`
  query GetInvoiceById($id: uuid!) {
    invoices_by_pk(id: $id) {
      ...Invoice
      company {
        id
        contract {
          id
          product_type
        }
      }
      loans(where: { loan_type: { _eq: invoice } }) {
        id
        ...Loan
      }
      invoice_files {
        ...InvoiceFile
      }
    }
  }
  ${InvoiceFragmentDoc}
  ${LoanFragmentDoc}
  ${InvoiceFileFragmentDoc}
`;

/**
 * __useGetInvoiceByIdQuery__
 *
 * To run a query within a React component, call `useGetInvoiceByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvoiceByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvoiceByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetInvoiceByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetInvoiceByIdQuery,
    GetInvoiceByIdQueryVariables
  >
) {
  return Apollo.useQuery<GetInvoiceByIdQuery, GetInvoiceByIdQueryVariables>(
    GetInvoiceByIdDocument,
    baseOptions
  );
}
export function useGetInvoiceByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetInvoiceByIdQuery,
    GetInvoiceByIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<GetInvoiceByIdQuery, GetInvoiceByIdQueryVariables>(
    GetInvoiceByIdDocument,
    baseOptions
  );
}
export type GetInvoiceByIdQueryHookResult = ReturnType<
  typeof useGetInvoiceByIdQuery
>;
export type GetInvoiceByIdLazyQueryHookResult = ReturnType<
  typeof useGetInvoiceByIdLazyQuery
>;
export type GetInvoiceByIdQueryResult = Apollo.QueryResult<
  GetInvoiceByIdQuery,
  GetInvoiceByIdQueryVariables
>;
export const GetInvoiceForReviewDocument = gql`
  query GetInvoiceForReview($id: uuid!) {
    invoices_by_pk(id: $id) {
      id
      company_id
      payor_id
      invoice_number
      invoice_date
      invoice_due_date
      subtotal_amount
      total_amount
      taxes_amount
      is_cannabis
      status
      created_at
      payment_requested_at
      payment_confirmed_at
      payment_rejected_at
      payment_rejection_note
      invoice_files {
        invoice_id
        file_id
        ...InvoiceFile
      }
      company {
        id
        name
      }
      payor {
        id
        name
        settings {
          id
          collections_bespoke_bank_account {
            ...BankAccount
          }
        }
      }
    }
  }
  ${InvoiceFileFragmentDoc}
  ${BankAccountFragmentDoc}
`;

/**
 * __useGetInvoiceForReviewQuery__
 *
 * To run a query within a React component, call `useGetInvoiceForReviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvoiceForReviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvoiceForReviewQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetInvoiceForReviewQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetInvoiceForReviewQuery,
    GetInvoiceForReviewQueryVariables
  >
) {
  return Apollo.useQuery<
    GetInvoiceForReviewQuery,
    GetInvoiceForReviewQueryVariables
  >(GetInvoiceForReviewDocument, baseOptions);
}
export function useGetInvoiceForReviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetInvoiceForReviewQuery,
    GetInvoiceForReviewQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetInvoiceForReviewQuery,
    GetInvoiceForReviewQueryVariables
  >(GetInvoiceForReviewDocument, baseOptions);
}
export type GetInvoiceForReviewQueryHookResult = ReturnType<
  typeof useGetInvoiceForReviewQuery
>;
export type GetInvoiceForReviewLazyQueryHookResult = ReturnType<
  typeof useGetInvoiceForReviewLazyQuery
>;
export type GetInvoiceForReviewQueryResult = Apollo.QueryResult<
  GetInvoiceForReviewQuery,
  GetInvoiceForReviewQueryVariables
>;
export const GetInvoicesDocument = gql`
  query GetInvoices {
    invoices(
      where: {
        _or: [
          { is_deleted: { _is_null: true } }
          { is_deleted: { _eq: false } }
        ]
      }
    ) {
      id
      ...Invoice
    }
  }
  ${InvoiceFragmentDoc}
`;

/**
 * __useGetInvoicesQuery__
 *
 * To run a query within a React component, call `useGetInvoicesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvoicesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvoicesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetInvoicesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetInvoicesQuery,
    GetInvoicesQueryVariables
  >
) {
  return Apollo.useQuery<GetInvoicesQuery, GetInvoicesQueryVariables>(
    GetInvoicesDocument,
    baseOptions
  );
}
export function useGetInvoicesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetInvoicesQuery,
    GetInvoicesQueryVariables
  >
) {
  return Apollo.useLazyQuery<GetInvoicesQuery, GetInvoicesQueryVariables>(
    GetInvoicesDocument,
    baseOptions
  );
}
export type GetInvoicesQueryHookResult = ReturnType<typeof useGetInvoicesQuery>;
export type GetInvoicesLazyQueryHookResult = ReturnType<
  typeof useGetInvoicesLazyQuery
>;
export type GetInvoicesQueryResult = Apollo.QueryResult<
  GetInvoicesQuery,
  GetInvoicesQueryVariables
>;
export const GetInvoicesByCompanyIdDocument = gql`
  query GetInvoicesByCompanyId($company_id: uuid!) {
    invoices(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { company_id: { _eq: $company_id } }
        ]
      }
    ) {
      ...Invoice
      company {
        id
        name
      }
      payor {
        id
        name
      }
    }
  }
  ${InvoiceFragmentDoc}
`;

/**
 * __useGetInvoicesByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetInvoicesByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvoicesByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvoicesByCompanyIdQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function useGetInvoicesByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetInvoicesByCompanyIdQuery,
    GetInvoicesByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetInvoicesByCompanyIdQuery,
    GetInvoicesByCompanyIdQueryVariables
  >(GetInvoicesByCompanyIdDocument, baseOptions);
}
export function useGetInvoicesByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetInvoicesByCompanyIdQuery,
    GetInvoicesByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetInvoicesByCompanyIdQuery,
    GetInvoicesByCompanyIdQueryVariables
  >(GetInvoicesByCompanyIdDocument, baseOptions);
}
export type GetInvoicesByCompanyIdQueryHookResult = ReturnType<
  typeof useGetInvoicesByCompanyIdQuery
>;
export type GetInvoicesByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetInvoicesByCompanyIdLazyQuery
>;
export type GetInvoicesByCompanyIdQueryResult = Apollo.QueryResult<
  GetInvoicesByCompanyIdQuery,
  GetInvoicesByCompanyIdQueryVariables
>;
export const GetOpenInvoicesByCompanyIdDocument = gql`
  query GetOpenInvoicesByCompanyId($company_id: uuid!) {
    invoices(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { company_id: { _eq: $company_id } }
          { funded_at: { _is_null: true } }
        ]
      }
    ) {
      ...Invoice
      company {
        id
        name
      }
      payor {
        id
        name
      }
    }
  }
  ${InvoiceFragmentDoc}
`;

/**
 * __useGetOpenInvoicesByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetOpenInvoicesByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpenInvoicesByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpenInvoicesByCompanyIdQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function useGetOpenInvoicesByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOpenInvoicesByCompanyIdQuery,
    GetOpenInvoicesByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetOpenInvoicesByCompanyIdQuery,
    GetOpenInvoicesByCompanyIdQueryVariables
  >(GetOpenInvoicesByCompanyIdDocument, baseOptions);
}
export function useGetOpenInvoicesByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOpenInvoicesByCompanyIdQuery,
    GetOpenInvoicesByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetOpenInvoicesByCompanyIdQuery,
    GetOpenInvoicesByCompanyIdQueryVariables
  >(GetOpenInvoicesByCompanyIdDocument, baseOptions);
}
export type GetOpenInvoicesByCompanyIdQueryHookResult = ReturnType<
  typeof useGetOpenInvoicesByCompanyIdQuery
>;
export type GetOpenInvoicesByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetOpenInvoicesByCompanyIdLazyQuery
>;
export type GetOpenInvoicesByCompanyIdQueryResult = Apollo.QueryResult<
  GetOpenInvoicesByCompanyIdQuery,
  GetOpenInvoicesByCompanyIdQueryVariables
>;
export const GetClosedInvoicesByCompanyIdDocument = gql`
  query GetClosedInvoicesByCompanyId($company_id: uuid!) {
    invoices(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { company_id: { _eq: $company_id } }
          { funded_at: { _is_null: false } }
        ]
      }
    ) {
      ...Invoice
      company {
        id
        name
      }
      payor {
        id
        name
      }
    }
  }
  ${InvoiceFragmentDoc}
`;

/**
 * __useGetClosedInvoicesByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetClosedInvoicesByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClosedInvoicesByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClosedInvoicesByCompanyIdQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function useGetClosedInvoicesByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetClosedInvoicesByCompanyIdQuery,
    GetClosedInvoicesByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetClosedInvoicesByCompanyIdQuery,
    GetClosedInvoicesByCompanyIdQueryVariables
  >(GetClosedInvoicesByCompanyIdDocument, baseOptions);
}
export function useGetClosedInvoicesByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetClosedInvoicesByCompanyIdQuery,
    GetClosedInvoicesByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetClosedInvoicesByCompanyIdQuery,
    GetClosedInvoicesByCompanyIdQueryVariables
  >(GetClosedInvoicesByCompanyIdDocument, baseOptions);
}
export type GetClosedInvoicesByCompanyIdQueryHookResult = ReturnType<
  typeof useGetClosedInvoicesByCompanyIdQuery
>;
export type GetClosedInvoicesByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetClosedInvoicesByCompanyIdLazyQuery
>;
export type GetClosedInvoicesByCompanyIdQueryResult = Apollo.QueryResult<
  GetClosedInvoicesByCompanyIdQuery,
  GetClosedInvoicesByCompanyIdQueryVariables
>;
export const GetApprovedInvoicesByCompanyIdDocument = gql`
  query GetApprovedInvoicesByCompanyId($companyId: uuid!) {
    invoices(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { company_id: { _eq: $companyId } }
          { approved_at: { _is_null: false } }
          { funded_at: { _is_null: true } }
        ]
      }
    ) {
      ...Invoice
    }
  }
  ${InvoiceFragmentDoc}
`;

/**
 * __useGetApprovedInvoicesByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetApprovedInvoicesByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetApprovedInvoicesByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetApprovedInvoicesByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetApprovedInvoicesByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetApprovedInvoicesByCompanyIdQuery,
    GetApprovedInvoicesByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetApprovedInvoicesByCompanyIdQuery,
    GetApprovedInvoicesByCompanyIdQueryVariables
  >(GetApprovedInvoicesByCompanyIdDocument, baseOptions);
}
export function useGetApprovedInvoicesByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetApprovedInvoicesByCompanyIdQuery,
    GetApprovedInvoicesByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetApprovedInvoicesByCompanyIdQuery,
    GetApprovedInvoicesByCompanyIdQueryVariables
  >(GetApprovedInvoicesByCompanyIdDocument, baseOptions);
}
export type GetApprovedInvoicesByCompanyIdQueryHookResult = ReturnType<
  typeof useGetApprovedInvoicesByCompanyIdQuery
>;
export type GetApprovedInvoicesByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetApprovedInvoicesByCompanyIdLazyQuery
>;
export type GetApprovedInvoicesByCompanyIdQueryResult = Apollo.QueryResult<
  GetApprovedInvoicesByCompanyIdQuery,
  GetApprovedInvoicesByCompanyIdQueryVariables
>;
export const GetPurchaseOrdersForIdsDocument = gql`
  query GetPurchaseOrdersForIds($purchaseOrderIds: [uuid!]) {
    purchase_orders(
      where: {
        _and: [
          { id: { _in: $purchaseOrderIds } }
          { status: { _eq: approved } }
        ]
      }
    ) {
      id
      ...PurchaseOrder
      loans {
        id
        ...Loan
      }
    }
  }
  ${PurchaseOrderFragmentDoc}
  ${LoanFragmentDoc}
`;

/**
 * __useGetPurchaseOrdersForIdsQuery__
 *
 * To run a query within a React component, call `useGetPurchaseOrdersForIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPurchaseOrdersForIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPurchaseOrdersForIdsQuery({
 *   variables: {
 *      purchaseOrderIds: // value for 'purchaseOrderIds'
 *   },
 * });
 */
export function useGetPurchaseOrdersForIdsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetPurchaseOrdersForIdsQuery,
    GetPurchaseOrdersForIdsQueryVariables
  >
) {
  return Apollo.useQuery<
    GetPurchaseOrdersForIdsQuery,
    GetPurchaseOrdersForIdsQueryVariables
  >(GetPurchaseOrdersForIdsDocument, baseOptions);
}
export function useGetPurchaseOrdersForIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPurchaseOrdersForIdsQuery,
    GetPurchaseOrdersForIdsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetPurchaseOrdersForIdsQuery,
    GetPurchaseOrdersForIdsQueryVariables
  >(GetPurchaseOrdersForIdsDocument, baseOptions);
}
export type GetPurchaseOrdersForIdsQueryHookResult = ReturnType<
  typeof useGetPurchaseOrdersForIdsQuery
>;
export type GetPurchaseOrdersForIdsLazyQueryHookResult = ReturnType<
  typeof useGetPurchaseOrdersForIdsLazyQuery
>;
export type GetPurchaseOrdersForIdsQueryResult = Apollo.QueryResult<
  GetPurchaseOrdersForIdsQuery,
  GetPurchaseOrdersForIdsQueryVariables
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
      ...LoanArtifact
    }
  }
  ${LoanLimitedFragmentDoc}
  ${LoanArtifactFragmentDoc}
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
export const GetLoanWithArtifactForBankDocument = gql`
  query GetLoanWithArtifactForBank($id: uuid!) {
    loans_by_pk(id: $id) {
      ...Loan
      ...LoanArtifact
    }
  }
  ${LoanFragmentDoc}
  ${LoanArtifactFragmentDoc}
`;

/**
 * __useGetLoanWithArtifactForBankQuery__
 *
 * To run a query within a React component, call `useGetLoanWithArtifactForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoanWithArtifactForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoanWithArtifactForBankQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLoanWithArtifactForBankQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLoanWithArtifactForBankQuery,
    GetLoanWithArtifactForBankQueryVariables
  >
) {
  return Apollo.useQuery<
    GetLoanWithArtifactForBankQuery,
    GetLoanWithArtifactForBankQueryVariables
  >(GetLoanWithArtifactForBankDocument, baseOptions);
}
export function useGetLoanWithArtifactForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLoanWithArtifactForBankQuery,
    GetLoanWithArtifactForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetLoanWithArtifactForBankQuery,
    GetLoanWithArtifactForBankQueryVariables
  >(GetLoanWithArtifactForBankDocument, baseOptions);
}
export type GetLoanWithArtifactForBankQueryHookResult = ReturnType<
  typeof useGetLoanWithArtifactForBankQuery
>;
export type GetLoanWithArtifactForBankLazyQueryHookResult = ReturnType<
  typeof useGetLoanWithArtifactForBankLazyQuery
>;
export type GetLoanWithArtifactForBankQueryResult = Apollo.QueryResult<
  GetLoanWithArtifactForBankQuery,
  GetLoanWithArtifactForBankQueryVariables
>;
export const GetTransactionsForLoanDocument = gql`
  query GetTransactionsForLoan($loan_id: uuid!) {
    transactions(where: { loan_id: { _eq: $loan_id } }) {
      ...Transaction
      payment {
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
      }
    }
  }
  ${TransactionFragmentDoc}
  ${PaymentFragmentDoc}
`;

/**
 * __useGetTransactionsForLoanQuery__
 *
 * To run a query within a React component, call `useGetTransactionsForLoanQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionsForLoanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionsForLoanQuery({
 *   variables: {
 *      loan_id: // value for 'loan_id'
 *   },
 * });
 */
export function useGetTransactionsForLoanQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetTransactionsForLoanQuery,
    GetTransactionsForLoanQueryVariables
  >
) {
  return Apollo.useQuery<
    GetTransactionsForLoanQuery,
    GetTransactionsForLoanQueryVariables
  >(GetTransactionsForLoanDocument, baseOptions);
}
export function useGetTransactionsForLoanLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTransactionsForLoanQuery,
    GetTransactionsForLoanQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetTransactionsForLoanQuery,
    GetTransactionsForLoanQueryVariables
  >(GetTransactionsForLoanDocument, baseOptions);
}
export type GetTransactionsForLoanQueryHookResult = ReturnType<
  typeof useGetTransactionsForLoanQuery
>;
export type GetTransactionsForLoanLazyQueryHookResult = ReturnType<
  typeof useGetTransactionsForLoanLazyQuery
>;
export type GetTransactionsForLoanQueryResult = Apollo.QueryResult<
  GetTransactionsForLoanQuery,
  GetTransactionsForLoanQueryVariables
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
export const GetLoansForBankDocument = gql`
  subscription GetLoansForBank {
    loans(
      where: {
        _or: [
          { is_deleted: { _is_null: true } }
          { is_deleted: { _eq: false } }
        ]
      }
      order_by: [
        { adjusted_maturity_date: asc }
        { origination_date: asc }
        { amount: asc }
        { created_at: asc }
      ]
    ) {
      id
      ...Loan
      ...LoanArtifactLimited
      company {
        id
        name
      }
    }
  }
  ${LoanFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
`;

/**
 * __useGetLoansForBankSubscription__
 *
 * To run a query within a React component, call `useGetLoansForBankSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetLoansForBankSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoansForBankSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetLoansForBankSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetLoansForBankSubscription,
    GetLoansForBankSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetLoansForBankSubscription,
    GetLoansForBankSubscriptionVariables
  >(GetLoansForBankDocument, baseOptions);
}
export type GetLoansForBankSubscriptionHookResult = ReturnType<
  typeof useGetLoansForBankSubscription
>;
export type GetLoansForBankSubscriptionResult = Apollo.SubscriptionResult<GetLoansForBankSubscription>;
export const GetNotFundedLoansForBankDocument = gql`
  subscription GetNotFundedLoansForBank {
    loans(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { funded_at: { _is_null: true } }
          { closed_at: { _is_null: true } }
        ]
      }
      order_by: { requested_payment_date: asc }
    ) {
      id
      ...Loan
      ...LoanArtifactLimited
    }
  }
  ${LoanFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
`;

/**
 * __useGetNotFundedLoansForBankSubscription__
 *
 * To run a query within a React component, call `useGetNotFundedLoansForBankSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetNotFundedLoansForBankSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNotFundedLoansForBankSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetNotFundedLoansForBankSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetNotFundedLoansForBankSubscription,
    GetNotFundedLoansForBankSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetNotFundedLoansForBankSubscription,
    GetNotFundedLoansForBankSubscriptionVariables
  >(GetNotFundedLoansForBankDocument, baseOptions);
}
export type GetNotFundedLoansForBankSubscriptionHookResult = ReturnType<
  typeof useGetNotFundedLoansForBankSubscription
>;
export type GetNotFundedLoansForBankSubscriptionResult = Apollo.SubscriptionResult<GetNotFundedLoansForBankSubscription>;
export const GetFundedLoansForBankDocument = gql`
  subscription GetFundedLoansForBank {
    loans(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { funded_at: { _is_null: false } }
          { closed_at: { _is_null: true } }
        ]
      }
      order_by: [
        { adjusted_maturity_date: asc }
        { origination_date: asc }
        { amount: asc }
        { created_at: asc }
      ]
    ) {
      id
      ...Loan
      ...LoanArtifactLimited
    }
  }
  ${LoanFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
`;

/**
 * __useGetFundedLoansForBankSubscription__
 *
 * To run a query within a React component, call `useGetFundedLoansForBankSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetFundedLoansForBankSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFundedLoansForBankSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetFundedLoansForBankSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetFundedLoansForBankSubscription,
    GetFundedLoansForBankSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetFundedLoansForBankSubscription,
    GetFundedLoansForBankSubscriptionVariables
  >(GetFundedLoansForBankDocument, baseOptions);
}
export type GetFundedLoansForBankSubscriptionHookResult = ReturnType<
  typeof useGetFundedLoansForBankSubscription
>;
export type GetFundedLoansForBankSubscriptionResult = Apollo.SubscriptionResult<GetFundedLoansForBankSubscription>;
export const GetActiveLoansForCompanyDocument = gql`
  query GetActiveLoansForCompany($companyId: uuid!, $loanType: loan_type_enum) {
    companies_by_pk(id: $companyId) {
      id
      financial_summaries(
        order_by: { date: desc }
        where: { date: { _is_null: false } }
        limit: 1
      ) {
        id
        ...FinancialSummary
      }
      loans(
        where: {
          _and: [
            {
              _or: [
                { is_deleted: { _is_null: true } }
                { is_deleted: { _eq: false } }
              ]
            }
            { loan_type: { _eq: $loanType } }
            { closed_at: { _is_null: true } }
          ]
        }
        order_by: [
          { adjusted_maturity_date: asc }
          { origination_date: asc }
          { amount: asc }
          { created_at: asc }
        ]
      ) {
        id
        ...LoanLimited
        ...LoanArtifactLimited
      }
    }
  }
  ${FinancialSummaryFragmentDoc}
  ${LoanLimitedFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
`;

/**
 * __useGetActiveLoansForCompanyQuery__
 *
 * To run a query within a React component, call `useGetActiveLoansForCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveLoansForCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveLoansForCompanyQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      loanType: // value for 'loanType'
 *   },
 * });
 */
export function useGetActiveLoansForCompanyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActiveLoansForCompanyQuery,
    GetActiveLoansForCompanyQueryVariables
  >
) {
  return Apollo.useQuery<
    GetActiveLoansForCompanyQuery,
    GetActiveLoansForCompanyQueryVariables
  >(GetActiveLoansForCompanyDocument, baseOptions);
}
export function useGetActiveLoansForCompanyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActiveLoansForCompanyQuery,
    GetActiveLoansForCompanyQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetActiveLoansForCompanyQuery,
    GetActiveLoansForCompanyQueryVariables
  >(GetActiveLoansForCompanyDocument, baseOptions);
}
export type GetActiveLoansForCompanyQueryHookResult = ReturnType<
  typeof useGetActiveLoansForCompanyQuery
>;
export type GetActiveLoansForCompanyLazyQueryHookResult = ReturnType<
  typeof useGetActiveLoansForCompanyLazyQuery
>;
export type GetActiveLoansForCompanyQueryResult = Apollo.QueryResult<
  GetActiveLoansForCompanyQuery,
  GetActiveLoansForCompanyQueryVariables
>;
export const GetClosedLoansForCompanyDocument = gql`
  query GetClosedLoansForCompany($companyId: uuid!, $loanType: loan_type_enum) {
    companies_by_pk(id: $companyId) {
      id
      loans(
        where: {
          _and: [
            {
              _or: [
                { is_deleted: { _is_null: true } }
                { is_deleted: { _eq: false } }
              ]
            }
            { loan_type: { _eq: $loanType } }
            { closed_at: { _is_null: false } }
          ]
        }
        order_by: [
          { adjusted_maturity_date: asc }
          { origination_date: asc }
          { amount: asc }
          { created_at: asc }
        ]
      ) {
        id
        ...LoanLimited
        ...LoanArtifactLimited
      }
    }
  }
  ${LoanLimitedFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
`;

/**
 * __useGetClosedLoansForCompanyQuery__
 *
 * To run a query within a React component, call `useGetClosedLoansForCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClosedLoansForCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClosedLoansForCompanyQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      loanType: // value for 'loanType'
 *   },
 * });
 */
export function useGetClosedLoansForCompanyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetClosedLoansForCompanyQuery,
    GetClosedLoansForCompanyQueryVariables
  >
) {
  return Apollo.useQuery<
    GetClosedLoansForCompanyQuery,
    GetClosedLoansForCompanyQueryVariables
  >(GetClosedLoansForCompanyDocument, baseOptions);
}
export function useGetClosedLoansForCompanyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetClosedLoansForCompanyQuery,
    GetClosedLoansForCompanyQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetClosedLoansForCompanyQuery,
    GetClosedLoansForCompanyQueryVariables
  >(GetClosedLoansForCompanyDocument, baseOptions);
}
export type GetClosedLoansForCompanyQueryHookResult = ReturnType<
  typeof useGetClosedLoansForCompanyQuery
>;
export type GetClosedLoansForCompanyLazyQueryHookResult = ReturnType<
  typeof useGetClosedLoansForCompanyLazyQuery
>;
export type GetClosedLoansForCompanyQueryResult = Apollo.QueryResult<
  GetClosedLoansForCompanyQuery,
  GetClosedLoansForCompanyQueryVariables
>;
export const GetAllLoansForCompanyDocument = gql`
  query GetAllLoansForCompany($companyId: uuid!, $loanType: loan_type_enum) {
    companies_by_pk(id: $companyId) {
      id
      loans(
        where: {
          _and: [
            {
              _or: [
                { is_deleted: { _is_null: true } }
                { is_deleted: { _eq: false } }
              ]
            }
            { loan_type: { _eq: $loanType } }
          ]
        }
        order_by: [
          { adjusted_maturity_date: asc }
          { origination_date: asc }
          { amount: asc }
          { created_at: asc }
        ]
      ) {
        id
        ...LoanLimited
        ...LoanArtifactLimited
      }
    }
  }
  ${LoanLimitedFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
`;

/**
 * __useGetAllLoansForCompanyQuery__
 *
 * To run a query within a React component, call `useGetAllLoansForCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllLoansForCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllLoansForCompanyQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      loanType: // value for 'loanType'
 *   },
 * });
 */
export function useGetAllLoansForCompanyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAllLoansForCompanyQuery,
    GetAllLoansForCompanyQueryVariables
  >
) {
  return Apollo.useQuery<
    GetAllLoansForCompanyQuery,
    GetAllLoansForCompanyQueryVariables
  >(GetAllLoansForCompanyDocument, baseOptions);
}
export function useGetAllLoansForCompanyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAllLoansForCompanyQuery,
    GetAllLoansForCompanyQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetAllLoansForCompanyQuery,
    GetAllLoansForCompanyQueryVariables
  >(GetAllLoansForCompanyDocument, baseOptions);
}
export type GetAllLoansForCompanyQueryHookResult = ReturnType<
  typeof useGetAllLoansForCompanyQuery
>;
export type GetAllLoansForCompanyLazyQueryHookResult = ReturnType<
  typeof useGetAllLoansForCompanyLazyQuery
>;
export type GetAllLoansForCompanyQueryResult = Apollo.QueryResult<
  GetAllLoansForCompanyQuery,
  GetAllLoansForCompanyQueryVariables
>;
export const GetLoansByCompanyAndLoanTypeDocument = gql`
  query GetLoansByCompanyAndLoanType(
    $companyId: uuid!
    $loanType: loan_type_enum!
  ) {
    loans(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { company_id: { _eq: $companyId } }
          { loan_type: { _eq: $loanType } }
        ]
      }
      order_by: [
        { adjusted_maturity_date: asc }
        { origination_date: asc }
        { amount: asc }
        { created_at: asc }
      ]
    ) {
      id
      ...Loan
      ...LoanArtifactLimited
    }
  }
  ${LoanFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
`;

/**
 * __useGetLoansByCompanyAndLoanTypeQuery__
 *
 * To run a query within a React component, call `useGetLoansByCompanyAndLoanTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLoansByCompanyAndLoanTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoansByCompanyAndLoanTypeQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *      loanType: // value for 'loanType'
 *   },
 * });
 */
export function useGetLoansByCompanyAndLoanTypeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetLoansByCompanyAndLoanTypeQuery,
    GetLoansByCompanyAndLoanTypeQueryVariables
  >
) {
  return Apollo.useQuery<
    GetLoansByCompanyAndLoanTypeQuery,
    GetLoansByCompanyAndLoanTypeQueryVariables
  >(GetLoansByCompanyAndLoanTypeDocument, baseOptions);
}
export function useGetLoansByCompanyAndLoanTypeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLoansByCompanyAndLoanTypeQuery,
    GetLoansByCompanyAndLoanTypeQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetLoansByCompanyAndLoanTypeQuery,
    GetLoansByCompanyAndLoanTypeQueryVariables
  >(GetLoansByCompanyAndLoanTypeDocument, baseOptions);
}
export type GetLoansByCompanyAndLoanTypeQueryHookResult = ReturnType<
  typeof useGetLoansByCompanyAndLoanTypeQuery
>;
export type GetLoansByCompanyAndLoanTypeLazyQueryHookResult = ReturnType<
  typeof useGetLoansByCompanyAndLoanTypeLazyQuery
>;
export type GetLoansByCompanyAndLoanTypeQueryResult = Apollo.QueryResult<
  GetLoansByCompanyAndLoanTypeQuery,
  GetLoansByCompanyAndLoanTypeQueryVariables
>;
export const GetLoansByLoanIdsDocument = gql`
  query GetLoansByLoanIds($loan_ids: [uuid!]!) {
    loans(where: { id: { _in: $loan_ids } }) {
      id
      ...Loan
      ...LoanArtifact
    }
  }
  ${LoanFragmentDoc}
  ${LoanArtifactFragmentDoc}
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
 *      loan_ids: // value for 'loan_ids'
 *   },
 * });
 */
export function useGetLoansByLoanIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
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
export const GetBankPayorPartnershipDocument = gql`
  query GetBankPayorPartnership($id: uuid!) {
    company_payor_partnerships_by_pk(id: $id) {
      ...PayorPartnership
      payor {
        ...ThirdParty
        settings {
          id
          collections_bespoke_bank_account {
            ...BankAccount
          }
        }
        users {
          ...Contact
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
      payor_agreement {
        ...CompanyAgreement
      }
      payor_license {
        ...CompanyLicense
      }
    }
  }
  ${PayorPartnershipFragmentDoc}
  ${ThirdPartyFragmentDoc}
  ${BankAccountFragmentDoc}
  ${ContactFragmentDoc}
  ${CompanyFragmentDoc}
  ${CompanySettingsFragmentDoc}
  ${CompanyAgreementFragmentDoc}
  ${CompanyLicenseFragmentDoc}
`;

/**
 * __useGetBankPayorPartnershipQuery__
 *
 * To run a query within a React component, call `useGetBankPayorPartnershipQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBankPayorPartnershipQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBankPayorPartnershipQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetBankPayorPartnershipQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetBankPayorPartnershipQuery,
    GetBankPayorPartnershipQueryVariables
  >
) {
  return Apollo.useQuery<
    GetBankPayorPartnershipQuery,
    GetBankPayorPartnershipQueryVariables
  >(GetBankPayorPartnershipDocument, baseOptions);
}
export function useGetBankPayorPartnershipLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetBankPayorPartnershipQuery,
    GetBankPayorPartnershipQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetBankPayorPartnershipQuery,
    GetBankPayorPartnershipQueryVariables
  >(GetBankPayorPartnershipDocument, baseOptions);
}
export type GetBankPayorPartnershipQueryHookResult = ReturnType<
  typeof useGetBankPayorPartnershipQuery
>;
export type GetBankPayorPartnershipLazyQueryHookResult = ReturnType<
  typeof useGetBankPayorPartnershipLazyQuery
>;
export type GetBankPayorPartnershipQueryResult = Apollo.QueryResult<
  GetBankPayorPartnershipQuery,
  GetBankPayorPartnershipQueryVariables
>;
export const GetPayorPartnershipsForBankDocument = gql`
  query GetPayorPartnershipsForBank {
    company_payor_partnerships(order_by: { payor: { name: asc } }) {
      ...PayorPartnership
      company {
        id
        name
      }
      payor {
        ...ThirdParty
        settings {
          id
        }
        users {
          ...Contact
        }
      }
    }
  }
  ${PayorPartnershipFragmentDoc}
  ${ThirdPartyFragmentDoc}
  ${ContactFragmentDoc}
`;

/**
 * __useGetPayorPartnershipsForBankQuery__
 *
 * To run a query within a React component, call `useGetPayorPartnershipsForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPayorPartnershipsForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPayorPartnershipsForBankQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPayorPartnershipsForBankQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetPayorPartnershipsForBankQuery,
    GetPayorPartnershipsForBankQueryVariables
  >
) {
  return Apollo.useQuery<
    GetPayorPartnershipsForBankQuery,
    GetPayorPartnershipsForBankQueryVariables
  >(GetPayorPartnershipsForBankDocument, baseOptions);
}
export function useGetPayorPartnershipsForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPayorPartnershipsForBankQuery,
    GetPayorPartnershipsForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetPayorPartnershipsForBankQuery,
    GetPayorPartnershipsForBankQueryVariables
  >(GetPayorPartnershipsForBankDocument, baseOptions);
}
export type GetPayorPartnershipsForBankQueryHookResult = ReturnType<
  typeof useGetPayorPartnershipsForBankQuery
>;
export type GetPayorPartnershipsForBankLazyQueryHookResult = ReturnType<
  typeof useGetPayorPartnershipsForBankLazyQuery
>;
export type GetPayorPartnershipsForBankQueryResult = Apollo.QueryResult<
  GetPayorPartnershipsForBankQuery,
  GetPayorPartnershipsForBankQueryVariables
>;
export const UpdateCompanyPayorPartnershipApprovedAtDocument = gql`
  mutation UpdateCompanyPayorPartnershipApprovedAt(
    $companyPayorPartnershipId: uuid!
    $approvedAt: timestamptz
  ) {
    update_company_payor_partnerships_by_pk(
      pk_columns: { id: $companyPayorPartnershipId }
      _set: { approved_at: $approvedAt }
    ) {
      ...PayorPartnership
    }
  }
  ${PayorPartnershipFragmentDoc}
`;
export type UpdateCompanyPayorPartnershipApprovedAtMutationFn = Apollo.MutationFunction<
  UpdateCompanyPayorPartnershipApprovedAtMutation,
  UpdateCompanyPayorPartnershipApprovedAtMutationVariables
>;

/**
 * __useUpdateCompanyPayorPartnershipApprovedAtMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyPayorPartnershipApprovedAtMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyPayorPartnershipApprovedAtMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyPayorPartnershipApprovedAtMutation, { data, loading, error }] = useUpdateCompanyPayorPartnershipApprovedAtMutation({
 *   variables: {
 *      companyPayorPartnershipId: // value for 'companyPayorPartnershipId'
 *      approvedAt: // value for 'approvedAt'
 *   },
 * });
 */
export function useUpdateCompanyPayorPartnershipApprovedAtMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCompanyPayorPartnershipApprovedAtMutation,
    UpdateCompanyPayorPartnershipApprovedAtMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateCompanyPayorPartnershipApprovedAtMutation,
    UpdateCompanyPayorPartnershipApprovedAtMutationVariables
  >(UpdateCompanyPayorPartnershipApprovedAtDocument, baseOptions);
}
export type UpdateCompanyPayorPartnershipApprovedAtMutationHookResult = ReturnType<
  typeof useUpdateCompanyPayorPartnershipApprovedAtMutation
>;
export type UpdateCompanyPayorPartnershipApprovedAtMutationResult = Apollo.MutationResult<UpdateCompanyPayorPartnershipApprovedAtMutation>;
export type UpdateCompanyPayorPartnershipApprovedAtMutationOptions = Apollo.BaseMutationOptions<
  UpdateCompanyPayorPartnershipApprovedAtMutation,
  UpdateCompanyPayorPartnershipApprovedAtMutationVariables
>;
export const UpdatePayorInfoDocument = gql`
  mutation UpdatePayorInfo($id: uuid!, $company: companies_set_input!) {
    update_companies_by_pk(pk_columns: { id: $id }, _set: $company) {
      ...ThirdParty
    }
  }
  ${ThirdPartyFragmentDoc}
`;
export type UpdatePayorInfoMutationFn = Apollo.MutationFunction<
  UpdatePayorInfoMutation,
  UpdatePayorInfoMutationVariables
>;

/**
 * __useUpdatePayorInfoMutation__
 *
 * To run a mutation, you first call `useUpdatePayorInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePayorInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePayorInfoMutation, { data, loading, error }] = useUpdatePayorInfoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      company: // value for 'company'
 *   },
 * });
 */
export function useUpdatePayorInfoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePayorInfoMutation,
    UpdatePayorInfoMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdatePayorInfoMutation,
    UpdatePayorInfoMutationVariables
  >(UpdatePayorInfoDocument, baseOptions);
}
export type UpdatePayorInfoMutationHookResult = ReturnType<
  typeof useUpdatePayorInfoMutation
>;
export type UpdatePayorInfoMutationResult = Apollo.MutationResult<UpdatePayorInfoMutation>;
export type UpdatePayorInfoMutationOptions = Apollo.BaseMutationOptions<
  UpdatePayorInfoMutation,
  UpdatePayorInfoMutationVariables
>;
export const UpdatePayorAgreementIdDocument = gql`
  mutation UpdatePayorAgreementId(
    $companyPayorPartnershipId: uuid!
    $payorAgreementId: uuid
  ) {
    update_company_payor_partnerships_by_pk(
      pk_columns: { id: $companyPayorPartnershipId }
      _set: { payor_agreement_id: $payorAgreementId }
    ) {
      id
      payor_agreement {
        ...CompanyAgreement
      }
    }
  }
  ${CompanyAgreementFragmentDoc}
`;
export type UpdatePayorAgreementIdMutationFn = Apollo.MutationFunction<
  UpdatePayorAgreementIdMutation,
  UpdatePayorAgreementIdMutationVariables
>;

/**
 * __useUpdatePayorAgreementIdMutation__
 *
 * To run a mutation, you first call `useUpdatePayorAgreementIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePayorAgreementIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePayorAgreementIdMutation, { data, loading, error }] = useUpdatePayorAgreementIdMutation({
 *   variables: {
 *      companyPayorPartnershipId: // value for 'companyPayorPartnershipId'
 *      payorAgreementId: // value for 'payorAgreementId'
 *   },
 * });
 */
export function useUpdatePayorAgreementIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePayorAgreementIdMutation,
    UpdatePayorAgreementIdMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdatePayorAgreementIdMutation,
    UpdatePayorAgreementIdMutationVariables
  >(UpdatePayorAgreementIdDocument, baseOptions);
}
export type UpdatePayorAgreementIdMutationHookResult = ReturnType<
  typeof useUpdatePayorAgreementIdMutation
>;
export type UpdatePayorAgreementIdMutationResult = Apollo.MutationResult<UpdatePayorAgreementIdMutation>;
export type UpdatePayorAgreementIdMutationOptions = Apollo.BaseMutationOptions<
  UpdatePayorAgreementIdMutation,
  UpdatePayorAgreementIdMutationVariables
>;
export const AddCompanyPayorAgreementDocument = gql`
  mutation AddCompanyPayorAgreement(
    $payorAgreement: company_agreements_insert_input!
  ) {
    insert_company_agreements_one(object: $payorAgreement) {
      ...CompanyAgreement
    }
  }
  ${CompanyAgreementFragmentDoc}
`;
export type AddCompanyPayorAgreementMutationFn = Apollo.MutationFunction<
  AddCompanyPayorAgreementMutation,
  AddCompanyPayorAgreementMutationVariables
>;

/**
 * __useAddCompanyPayorAgreementMutation__
 *
 * To run a mutation, you first call `useAddCompanyPayorAgreementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCompanyPayorAgreementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCompanyPayorAgreementMutation, { data, loading, error }] = useAddCompanyPayorAgreementMutation({
 *   variables: {
 *      payorAgreement: // value for 'payorAgreement'
 *   },
 * });
 */
export function useAddCompanyPayorAgreementMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddCompanyPayorAgreementMutation,
    AddCompanyPayorAgreementMutationVariables
  >
) {
  return Apollo.useMutation<
    AddCompanyPayorAgreementMutation,
    AddCompanyPayorAgreementMutationVariables
  >(AddCompanyPayorAgreementDocument, baseOptions);
}
export type AddCompanyPayorAgreementMutationHookResult = ReturnType<
  typeof useAddCompanyPayorAgreementMutation
>;
export type AddCompanyPayorAgreementMutationResult = Apollo.MutationResult<AddCompanyPayorAgreementMutation>;
export type AddCompanyPayorAgreementMutationOptions = Apollo.BaseMutationOptions<
  AddCompanyPayorAgreementMutation,
  AddCompanyPayorAgreementMutationVariables
>;
export const UpdatePayorLicenseIdDocument = gql`
  mutation UpdatePayorLicenseId(
    $companyPayorPartnershipId: uuid!
    $payorLicenseId: uuid!
  ) {
    update_company_payor_partnerships_by_pk(
      pk_columns: { id: $companyPayorPartnershipId }
      _set: { payor_license_id: $payorLicenseId }
    ) {
      id
      payor_license {
        ...CompanyLicense
      }
    }
  }
  ${CompanyLicenseFragmentDoc}
`;
export type UpdatePayorLicenseIdMutationFn = Apollo.MutationFunction<
  UpdatePayorLicenseIdMutation,
  UpdatePayorLicenseIdMutationVariables
>;

/**
 * __useUpdatePayorLicenseIdMutation__
 *
 * To run a mutation, you first call `useUpdatePayorLicenseIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePayorLicenseIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePayorLicenseIdMutation, { data, loading, error }] = useUpdatePayorLicenseIdMutation({
 *   variables: {
 *      companyPayorPartnershipId: // value for 'companyPayorPartnershipId'
 *      payorLicenseId: // value for 'payorLicenseId'
 *   },
 * });
 */
export function useUpdatePayorLicenseIdMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePayorLicenseIdMutation,
    UpdatePayorLicenseIdMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdatePayorLicenseIdMutation,
    UpdatePayorLicenseIdMutationVariables
  >(UpdatePayorLicenseIdDocument, baseOptions);
}
export type UpdatePayorLicenseIdMutationHookResult = ReturnType<
  typeof useUpdatePayorLicenseIdMutation
>;
export type UpdatePayorLicenseIdMutationResult = Apollo.MutationResult<UpdatePayorLicenseIdMutation>;
export type UpdatePayorLicenseIdMutationOptions = Apollo.BaseMutationOptions<
  UpdatePayorLicenseIdMutation,
  UpdatePayorLicenseIdMutationVariables
>;
export const AddCompanyPayorLicenseDocument = gql`
  mutation AddCompanyPayorLicense(
    $payorLicense: company_licenses_insert_input!
  ) {
    insert_company_licenses_one(object: $payorLicense) {
      ...CompanyLicense
    }
  }
  ${CompanyLicenseFragmentDoc}
`;
export type AddCompanyPayorLicenseMutationFn = Apollo.MutationFunction<
  AddCompanyPayorLicenseMutation,
  AddCompanyPayorLicenseMutationVariables
>;

/**
 * __useAddCompanyPayorLicenseMutation__
 *
 * To run a mutation, you first call `useAddCompanyPayorLicenseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCompanyPayorLicenseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCompanyPayorLicenseMutation, { data, loading, error }] = useAddCompanyPayorLicenseMutation({
 *   variables: {
 *      payorLicense: // value for 'payorLicense'
 *   },
 * });
 */
export function useAddCompanyPayorLicenseMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddCompanyPayorLicenseMutation,
    AddCompanyPayorLicenseMutationVariables
  >
) {
  return Apollo.useMutation<
    AddCompanyPayorLicenseMutation,
    AddCompanyPayorLicenseMutationVariables
  >(AddCompanyPayorLicenseDocument, baseOptions);
}
export type AddCompanyPayorLicenseMutationHookResult = ReturnType<
  typeof useAddCompanyPayorLicenseMutation
>;
export type AddCompanyPayorLicenseMutationResult = Apollo.MutationResult<AddCompanyPayorLicenseMutation>;
export type AddCompanyPayorLicenseMutationOptions = Apollo.BaseMutationOptions<
  AddCompanyPayorLicenseMutation,
  AddCompanyPayorLicenseMutationVariables
>;
export const ListPayorPartnershipsByCompanyIdDocument = gql`
  query ListPayorPartnershipsByCompanyId($companyId: uuid!) {
    company_payor_partnerships(where: { company_id: { _eq: $companyId } }) {
      id
      ...PayorPartnership
      payor_limited {
        ...PayorLimited
      }
    }
  }
  ${PayorPartnershipFragmentDoc}
  ${PayorLimitedFragmentDoc}
`;

/**
 * __useListPayorPartnershipsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useListPayorPartnershipsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useListPayorPartnershipsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListPayorPartnershipsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useListPayorPartnershipsByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    ListPayorPartnershipsByCompanyIdQuery,
    ListPayorPartnershipsByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    ListPayorPartnershipsByCompanyIdQuery,
    ListPayorPartnershipsByCompanyIdQueryVariables
  >(ListPayorPartnershipsByCompanyIdDocument, baseOptions);
}
export function useListPayorPartnershipsByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ListPayorPartnershipsByCompanyIdQuery,
    ListPayorPartnershipsByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    ListPayorPartnershipsByCompanyIdQuery,
    ListPayorPartnershipsByCompanyIdQueryVariables
  >(ListPayorPartnershipsByCompanyIdDocument, baseOptions);
}
export type ListPayorPartnershipsByCompanyIdQueryHookResult = ReturnType<
  typeof useListPayorPartnershipsByCompanyIdQuery
>;
export type ListPayorPartnershipsByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useListPayorPartnershipsByCompanyIdLazyQuery
>;
export type ListPayorPartnershipsByCompanyIdQueryResult = Apollo.QueryResult<
  ListPayorPartnershipsByCompanyIdQuery,
  ListPayorPartnershipsByCompanyIdQueryVariables
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
export const GetPurchaseOrdersDocument = gql`
  subscription GetPurchaseOrders {
    purchase_orders(
      where: {
        _or: [
          { is_deleted: { _is_null: true } }
          { is_deleted: { _eq: false } }
        ]
      }
      order_by: [{ updated_at: desc }]
    ) {
      id
      ...PurchaseOrder
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useGetPurchaseOrdersSubscription__
 *
 * To run a query within a React component, call `useGetPurchaseOrdersSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetPurchaseOrdersSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPurchaseOrdersSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetPurchaseOrdersSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetPurchaseOrdersSubscription,
    GetPurchaseOrdersSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetPurchaseOrdersSubscription,
    GetPurchaseOrdersSubscriptionVariables
  >(GetPurchaseOrdersDocument, baseOptions);
}
export type GetPurchaseOrdersSubscriptionHookResult = ReturnType<
  typeof useGetPurchaseOrdersSubscription
>;
export type GetPurchaseOrdersSubscriptionResult = Apollo.SubscriptionResult<GetPurchaseOrdersSubscription>;
export const GetNotConfirmedPurchaseOrdersDocument = gql`
  subscription GetNotConfirmedPurchaseOrders {
    purchase_orders(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { approved_at: { _is_null: true } }
        ]
      }
      order_by: [{ requested_at: desc }, { created_at: desc }]
    ) {
      id
      ...PurchaseOrder
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useGetNotConfirmedPurchaseOrdersSubscription__
 *
 * To run a query within a React component, call `useGetNotConfirmedPurchaseOrdersSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetNotConfirmedPurchaseOrdersSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNotConfirmedPurchaseOrdersSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetNotConfirmedPurchaseOrdersSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetNotConfirmedPurchaseOrdersSubscription,
    GetNotConfirmedPurchaseOrdersSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetNotConfirmedPurchaseOrdersSubscription,
    GetNotConfirmedPurchaseOrdersSubscriptionVariables
  >(GetNotConfirmedPurchaseOrdersDocument, baseOptions);
}
export type GetNotConfirmedPurchaseOrdersSubscriptionHookResult = ReturnType<
  typeof useGetNotConfirmedPurchaseOrdersSubscription
>;
export type GetNotConfirmedPurchaseOrdersSubscriptionResult = Apollo.SubscriptionResult<GetNotConfirmedPurchaseOrdersSubscription>;
export const GetConfirmedPurchaseOrdersDocument = gql`
  subscription GetConfirmedPurchaseOrders {
    purchase_orders(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { approved_at: { _is_null: false } }
        ]
      }
      order_by: [{ approved_at: desc }, { created_at: desc }]
    ) {
      id
      ...PurchaseOrder
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useGetConfirmedPurchaseOrdersSubscription__
 *
 * To run a query within a React component, call `useGetConfirmedPurchaseOrdersSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetConfirmedPurchaseOrdersSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetConfirmedPurchaseOrdersSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetConfirmedPurchaseOrdersSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetConfirmedPurchaseOrdersSubscription,
    GetConfirmedPurchaseOrdersSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetConfirmedPurchaseOrdersSubscription,
    GetConfirmedPurchaseOrdersSubscriptionVariables
  >(GetConfirmedPurchaseOrdersDocument, baseOptions);
}
export type GetConfirmedPurchaseOrdersSubscriptionHookResult = ReturnType<
  typeof useGetConfirmedPurchaseOrdersSubscription
>;
export type GetConfirmedPurchaseOrdersSubscriptionResult = Apollo.SubscriptionResult<GetConfirmedPurchaseOrdersSubscription>;
export const GetOpenPurchaseOrdersByCompanyIdDocument = gql`
  query GetOpenPurchaseOrdersByCompanyId($company_id: uuid!) {
    purchase_orders(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { company_id: { _eq: $company_id } }
          { funded_at: { _is_null: true } }
        ]
      }
    ) {
      ...PurchaseOrder
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useGetOpenPurchaseOrdersByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetOpenPurchaseOrdersByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpenPurchaseOrdersByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpenPurchaseOrdersByCompanyIdQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function useGetOpenPurchaseOrdersByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOpenPurchaseOrdersByCompanyIdQuery,
    GetOpenPurchaseOrdersByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetOpenPurchaseOrdersByCompanyIdQuery,
    GetOpenPurchaseOrdersByCompanyIdQueryVariables
  >(GetOpenPurchaseOrdersByCompanyIdDocument, baseOptions);
}
export function useGetOpenPurchaseOrdersByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOpenPurchaseOrdersByCompanyIdQuery,
    GetOpenPurchaseOrdersByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetOpenPurchaseOrdersByCompanyIdQuery,
    GetOpenPurchaseOrdersByCompanyIdQueryVariables
  >(GetOpenPurchaseOrdersByCompanyIdDocument, baseOptions);
}
export type GetOpenPurchaseOrdersByCompanyIdQueryHookResult = ReturnType<
  typeof useGetOpenPurchaseOrdersByCompanyIdQuery
>;
export type GetOpenPurchaseOrdersByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetOpenPurchaseOrdersByCompanyIdLazyQuery
>;
export type GetOpenPurchaseOrdersByCompanyIdQueryResult = Apollo.QueryResult<
  GetOpenPurchaseOrdersByCompanyIdQuery,
  GetOpenPurchaseOrdersByCompanyIdQueryVariables
>;
export const GetClosedPurchaseOrdersByCompanyIdDocument = gql`
  query GetClosedPurchaseOrdersByCompanyId($company_id: uuid!) {
    purchase_orders(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { company_id: { _eq: $company_id } }
          { funded_at: { _is_null: false } }
        ]
      }
    ) {
      ...PurchaseOrder
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useGetClosedPurchaseOrdersByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetClosedPurchaseOrdersByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetClosedPurchaseOrdersByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetClosedPurchaseOrdersByCompanyIdQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function useGetClosedPurchaseOrdersByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetClosedPurchaseOrdersByCompanyIdQuery,
    GetClosedPurchaseOrdersByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetClosedPurchaseOrdersByCompanyIdQuery,
    GetClosedPurchaseOrdersByCompanyIdQueryVariables
  >(GetClosedPurchaseOrdersByCompanyIdDocument, baseOptions);
}
export function useGetClosedPurchaseOrdersByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetClosedPurchaseOrdersByCompanyIdQuery,
    GetClosedPurchaseOrdersByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetClosedPurchaseOrdersByCompanyIdQuery,
    GetClosedPurchaseOrdersByCompanyIdQueryVariables
  >(GetClosedPurchaseOrdersByCompanyIdDocument, baseOptions);
}
export type GetClosedPurchaseOrdersByCompanyIdQueryHookResult = ReturnType<
  typeof useGetClosedPurchaseOrdersByCompanyIdQuery
>;
export type GetClosedPurchaseOrdersByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetClosedPurchaseOrdersByCompanyIdLazyQuery
>;
export type GetClosedPurchaseOrdersByCompanyIdQueryResult = Apollo.QueryResult<
  GetClosedPurchaseOrdersByCompanyIdQuery,
  GetClosedPurchaseOrdersByCompanyIdQueryVariables
>;
export const GetFundablePurchaseOrdersByCompanyIdDocument = gql`
  query GetFundablePurchaseOrdersByCompanyId($company_id: uuid!) {
    purchase_orders(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { company_id: { _eq: $company_id } }
          { approved_at: { _is_null: false } }
          { funded_at: { _is_null: true } }
        ]
      }
    ) {
      ...PurchaseOrder
    }
  }
  ${PurchaseOrderFragmentDoc}
`;

/**
 * __useGetFundablePurchaseOrdersByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetFundablePurchaseOrdersByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFundablePurchaseOrdersByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFundablePurchaseOrdersByCompanyIdQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function useGetFundablePurchaseOrdersByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetFundablePurchaseOrdersByCompanyIdQuery,
    GetFundablePurchaseOrdersByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetFundablePurchaseOrdersByCompanyIdQuery,
    GetFundablePurchaseOrdersByCompanyIdQueryVariables
  >(GetFundablePurchaseOrdersByCompanyIdDocument, baseOptions);
}
export function useGetFundablePurchaseOrdersByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFundablePurchaseOrdersByCompanyIdQuery,
    GetFundablePurchaseOrdersByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetFundablePurchaseOrdersByCompanyIdQuery,
    GetFundablePurchaseOrdersByCompanyIdQueryVariables
  >(GetFundablePurchaseOrdersByCompanyIdDocument, baseOptions);
}
export type GetFundablePurchaseOrdersByCompanyIdQueryHookResult = ReturnType<
  typeof useGetFundablePurchaseOrdersByCompanyIdQuery
>;
export type GetFundablePurchaseOrdersByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetFundablePurchaseOrdersByCompanyIdLazyQuery
>;
export type GetFundablePurchaseOrdersByCompanyIdQueryResult = Apollo.QueryResult<
  GetFundablePurchaseOrdersByCompanyIdQuery,
  GetFundablePurchaseOrdersByCompanyIdQueryVariables
>;
export const GetPaymentDocument = gql`
  query GetPayment($id: uuid!) {
    payments_by_pk(id: $id) {
      id
      ...PaymentLimited
      company {
        id
        name
      }
      settled_by_user {
        id
        full_name
      }
      submitted_by_user {
        id
        full_name
      }
    }
  }
  ${PaymentLimitedFragmentDoc}
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
          ...Contract
        }
        financial_summaries(order_by: { date: desc }, limit: 1) {
          id
          ...FinancialSummary
        }
      }
      company_bank_account {
        id
        ...BankAccount
      }
      submitted_by_user {
        id
        full_name
      }
      invoice {
        id
        payor {
          id
          ...BankPayor
        }
      }
    }
  }
  ${PaymentFragmentDoc}
  ${ContractFragmentDoc}
  ${FinancialSummaryFragmentDoc}
  ${BankAccountFragmentDoc}
  ${BankPayorFragmentDoc}
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
  subscription GetPayments {
    payments(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { type: { _eq: "repayment" } }
        ]
      }
      order_by: { created_at: desc }
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
      settled_by_user {
        id
        full_name
      }
      invoice {
        id
        payor {
          id
          name
        }
      }
    }
  }
  ${PaymentFragmentDoc}
`;

/**
 * __useGetPaymentsSubscription__
 *
 * To run a query within a React component, call `useGetPaymentsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetPaymentsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPaymentsSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetPaymentsSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetPaymentsSubscription,
    GetPaymentsSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetPaymentsSubscription,
    GetPaymentsSubscriptionVariables
  >(GetPaymentsDocument, baseOptions);
}
export type GetPaymentsSubscriptionHookResult = ReturnType<
  typeof useGetPaymentsSubscription
>;
export type GetPaymentsSubscriptionResult = Apollo.SubscriptionResult<GetPaymentsSubscription>;
export const GetSubmittedPaymentsDocument = gql`
  subscription GetSubmittedPayments {
    payments(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { type: { _in: ["repayment", "repayment_account_fee"] } }
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
      invoice {
        id
        payor {
          id
          name
        }
      }
    }
  }
  ${PaymentFragmentDoc}
`;

/**
 * __useGetSubmittedPaymentsSubscription__
 *
 * To run a query within a React component, call `useGetSubmittedPaymentsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetSubmittedPaymentsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubmittedPaymentsSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetSubmittedPaymentsSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetSubmittedPaymentsSubscription,
    GetSubmittedPaymentsSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetSubmittedPaymentsSubscription,
    GetSubmittedPaymentsSubscriptionVariables
  >(GetSubmittedPaymentsDocument, baseOptions);
}
export type GetSubmittedPaymentsSubscriptionHookResult = ReturnType<
  typeof useGetSubmittedPaymentsSubscription
>;
export type GetSubmittedPaymentsSubscriptionResult = Apollo.SubscriptionResult<GetSubmittedPaymentsSubscription>;
export const GetPaymentsForCompanyDocument = gql`
  query GetPaymentsForCompany($company_id: uuid!) {
    companies_by_pk(id: $company_id) {
      id
      payments(
        where: {
          _and: [
            {
              _or: [
                { is_deleted: { _is_null: true } }
                { is_deleted: { _eq: false } }
              ]
            }
            { type: { _eq: "repayment" } }
            { settlement_date: { _is_null: false } }
          ]
        }
        order_by: [{ settlement_date: desc }, { created_at: desc }]
      ) {
        id
        ...PaymentLimited
        transactions {
          id
          ...Transaction
          loan {
            id
            ...LoanLimited
            ...LoanArtifactLimited
          }
          payment {
            id
            ...PaymentLimited
          }
        }
      }
    }
    transactions(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { type: { _eq: "repayment" } }
          { payment: { company_id: { _eq: $company_id } } }
        ]
      }
      order_by: [
        { payment: { deposit_date: desc } }
        { payment: { settlement_date: desc } }
        { payment: { created_at: desc } }
      ]
    ) {
      id
      ...Transaction
      loan {
        id
        ...LoanLimited
        ...LoanArtifactLimited
      }
      payment {
        ...PaymentLimited
      }
    }
  }
  ${PaymentLimitedFragmentDoc}
  ${TransactionFragmentDoc}
  ${LoanLimitedFragmentDoc}
  ${LoanArtifactLimitedFragmentDoc}
`;

/**
 * __useGetPaymentsForCompanyQuery__
 *
 * To run a query within a React component, call `useGetPaymentsForCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPaymentsForCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPaymentsForCompanyQuery({
 *   variables: {
 *      company_id: // value for 'company_id'
 *   },
 * });
 */
export function useGetPaymentsForCompanyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPaymentsForCompanyQuery,
    GetPaymentsForCompanyQueryVariables
  >
) {
  return Apollo.useQuery<
    GetPaymentsForCompanyQuery,
    GetPaymentsForCompanyQueryVariables
  >(GetPaymentsForCompanyDocument, baseOptions);
}
export function useGetPaymentsForCompanyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPaymentsForCompanyQuery,
    GetPaymentsForCompanyQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetPaymentsForCompanyQuery,
    GetPaymentsForCompanyQueryVariables
  >(GetPaymentsForCompanyDocument, baseOptions);
}
export type GetPaymentsForCompanyQueryHookResult = ReturnType<
  typeof useGetPaymentsForCompanyQuery
>;
export type GetPaymentsForCompanyLazyQueryHookResult = ReturnType<
  typeof useGetPaymentsForCompanyLazyQuery
>;
export type GetPaymentsForCompanyQueryResult = Apollo.QueryResult<
  GetPaymentsForCompanyQuery,
  GetPaymentsForCompanyQueryVariables
>;
export const GetCompanySettingsDocument = gql`
  query GetCompanySettings($company_settings_id: uuid!) {
    company_settings_by_pk(id: $company_settings_id) {
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
 *      company_settings_id: // value for 'company_settings_id'
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
export const UpdateCustomerSettingsDocument = gql`
  mutation UpdateCustomerSettings(
    $companySettingsId: uuid!
    $vendorAgreementTemplateLink: String
    $payorAgreementTemplateLink: String
    $hasAutofinancing: Boolean
  ) {
    update_company_settings_by_pk(
      pk_columns: { id: $companySettingsId }
      _set: {
        vendor_agreement_docusign_template: $vendorAgreementTemplateLink
        payor_agreement_docusign_template: $payorAgreementTemplateLink
        has_autofinancing: $hasAutofinancing
      }
    ) {
      ...CompanySettings
    }
  }
  ${CompanySettingsFragmentDoc}
`;
export type UpdateCustomerSettingsMutationFn = Apollo.MutationFunction<
  UpdateCustomerSettingsMutation,
  UpdateCustomerSettingsMutationVariables
>;

/**
 * __useUpdateCustomerSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateCustomerSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCustomerSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCustomerSettingsMutation, { data, loading, error }] = useUpdateCustomerSettingsMutation({
 *   variables: {
 *      companySettingsId: // value for 'companySettingsId'
 *      vendorAgreementTemplateLink: // value for 'vendorAgreementTemplateLink'
 *      payorAgreementTemplateLink: // value for 'payorAgreementTemplateLink'
 *      hasAutofinancing: // value for 'hasAutofinancing'
 *   },
 * });
 */
export function useUpdateCustomerSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCustomerSettingsMutation,
    UpdateCustomerSettingsMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateCustomerSettingsMutation,
    UpdateCustomerSettingsMutationVariables
  >(UpdateCustomerSettingsDocument, baseOptions);
}
export type UpdateCustomerSettingsMutationHookResult = ReturnType<
  typeof useUpdateCustomerSettingsMutation
>;
export type UpdateCustomerSettingsMutationResult = Apollo.MutationResult<UpdateCustomerSettingsMutation>;
export type UpdateCustomerSettingsMutationOptions = Apollo.BaseMutationOptions<
  UpdateCustomerSettingsMutation,
  UpdateCustomerSettingsMutationVariables
>;
export const UpdateCompanySettingsDocument = gql`
  mutation UpdateCompanySettings(
    $company_settings_id: uuid!
    $company_settings: company_settings_set_input!
  ) {
    update_company_settings_by_pk(
      pk_columns: { id: $company_settings_id }
      _set: $company_settings
    ) {
      ...CompanySettings
    }
  }
  ${CompanySettingsFragmentDoc}
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
 *      company_settings_id: // value for 'company_settings_id'
 *      company_settings: // value for 'company_settings'
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
export const GetContractDocument = gql`
  query GetContract($id: uuid!) {
    contracts_by_pk(id: $id) {
      id
      ...Contract
      company {
        id
        name
      }
    }
  }
  ${ContractFragmentDoc}
`;

/**
 * __useGetContractQuery__
 *
 * To run a query within a React component, call `useGetContractQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetContractQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetContractQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetContractQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetContractQuery,
    GetContractQueryVariables
  >
) {
  return Apollo.useQuery<GetContractQuery, GetContractQueryVariables>(
    GetContractDocument,
    baseOptions
  );
}
export function useGetContractLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetContractQuery,
    GetContractQueryVariables
  >
) {
  return Apollo.useLazyQuery<GetContractQuery, GetContractQueryVariables>(
    GetContractDocument,
    baseOptions
  );
}
export type GetContractQueryHookResult = ReturnType<typeof useGetContractQuery>;
export type GetContractLazyQueryHookResult = ReturnType<
  typeof useGetContractLazyQuery
>;
export type GetContractQueryResult = Apollo.QueryResult<
  GetContractQuery,
  GetContractQueryVariables
>;
export const GetUserDocument = gql`
  query GetUser($id: uuid!) {
    users_by_pk(id: $id) {
      id
      ...User
    }
  }
  ${UserFragmentDoc}
`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    baseOptions
  );
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>
) {
  return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    baseOptions
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
>;
export const GetUsersByRolesDocument = gql`
  query GetUsersByRoles($roles: [user_roles_enum!]!) {
    users(where: { role: { _in: $roles } }) {
      id
      ...User
    }
  }
  ${UserFragmentDoc}
`;

/**
 * __useGetUsersByRolesQuery__
 *
 * To run a query within a React component, call `useGetUsersByRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersByRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersByRolesQuery({
 *   variables: {
 *      roles: // value for 'roles'
 *   },
 * });
 */
export function useGetUsersByRolesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUsersByRolesQuery,
    GetUsersByRolesQueryVariables
  >
) {
  return Apollo.useQuery<GetUsersByRolesQuery, GetUsersByRolesQueryVariables>(
    GetUsersByRolesDocument,
    baseOptions
  );
}
export function useGetUsersByRolesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUsersByRolesQuery,
    GetUsersByRolesQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetUsersByRolesQuery,
    GetUsersByRolesQueryVariables
  >(GetUsersByRolesDocument, baseOptions);
}
export type GetUsersByRolesQueryHookResult = ReturnType<
  typeof useGetUsersByRolesQuery
>;
export type GetUsersByRolesLazyQueryHookResult = ReturnType<
  typeof useGetUsersByRolesLazyQuery
>;
export type GetUsersByRolesQueryResult = Apollo.QueryResult<
  GetUsersByRolesQuery,
  GetUsersByRolesQueryVariables
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
export const GetLatestBankFinancialSummariesDocument = gql`
  subscription GetLatestBankFinancialSummaries {
    bank_financial_summaries(limit: 4, order_by: { date: desc }) {
      id
      ...BankFinancialSummary
    }
  }
  ${BankFinancialSummaryFragmentDoc}
`;

/**
 * __useGetLatestBankFinancialSummariesSubscription__
 *
 * To run a query within a React component, call `useGetLatestBankFinancialSummariesSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestBankFinancialSummariesSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestBankFinancialSummariesSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetLatestBankFinancialSummariesSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetLatestBankFinancialSummariesSubscription,
    GetLatestBankFinancialSummariesSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetLatestBankFinancialSummariesSubscription,
    GetLatestBankFinancialSummariesSubscriptionVariables
  >(GetLatestBankFinancialSummariesDocument, baseOptions);
}
export type GetLatestBankFinancialSummariesSubscriptionHookResult = ReturnType<
  typeof useGetLatestBankFinancialSummariesSubscription
>;
export type GetLatestBankFinancialSummariesSubscriptionResult = Apollo.SubscriptionResult<GetLatestBankFinancialSummariesSubscription>;
export const GetLoansCountForBankDocument = gql`
  subscription GetLoansCountForBank {
    loans(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { funded_at: { _is_null: true } }
          { closed_at: { _is_null: true } }
        ]
      }
      order_by: { requested_payment_date: asc }
    ) {
      id
    }
  }
`;

/**
 * __useGetLoansCountForBankSubscription__
 *
 * To run a query within a React component, call `useGetLoansCountForBankSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetLoansCountForBankSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLoansCountForBankSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetLoansCountForBankSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetLoansCountForBankSubscription,
    GetLoansCountForBankSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetLoansCountForBankSubscription,
    GetLoansCountForBankSubscriptionVariables
  >(GetLoansCountForBankDocument, baseOptions);
}
export type GetLoansCountForBankSubscriptionHookResult = ReturnType<
  typeof useGetLoansCountForBankSubscription
>;
export type GetLoansCountForBankSubscriptionResult = Apollo.SubscriptionResult<GetLoansCountForBankSubscription>;
export const GetPaymentsCountForBankDocument = gql`
  subscription GetPaymentsCountForBank {
    payments(
      where: {
        _and: [
          {
            _or: [
              { is_deleted: { _is_null: true } }
              { is_deleted: { _eq: false } }
            ]
          }
          { type: { _eq: "repayment" } }
          { method: { _eq: "reverse_draft_ach" } }
          { payment_date: { _is_null: true } }
        ]
      }
      order_by: { created_at: desc }
    ) {
      id
    }
  }
`;

/**
 * __useGetPaymentsCountForBankSubscription__
 *
 * To run a query within a React component, call `useGetPaymentsCountForBankSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetPaymentsCountForBankSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPaymentsCountForBankSubscription({
 *   variables: {
 *   },
 * });
 */
export function useGetPaymentsCountForBankSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    GetPaymentsCountForBankSubscription,
    GetPaymentsCountForBankSubscriptionVariables
  >
) {
  return Apollo.useSubscription<
    GetPaymentsCountForBankSubscription,
    GetPaymentsCountForBankSubscriptionVariables
  >(GetPaymentsCountForBankDocument, baseOptions);
}
export type GetPaymentsCountForBankSubscriptionHookResult = ReturnType<
  typeof useGetPaymentsCountForBankSubscription
>;
export type GetPaymentsCountForBankSubscriptionResult = Apollo.SubscriptionResult<GetPaymentsCountForBankSubscription>;
export const GetCompanyWithActiveContractDocument = gql`
  query GetCompanyWithActiveContract($companyId: uuid!) {
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
 * __useGetCompanyWithActiveContractQuery__
 *
 * To run a query within a React component, call `useGetCompanyWithActiveContractQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyWithActiveContractQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyWithActiveContractQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetCompanyWithActiveContractQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyWithActiveContractQuery,
    GetCompanyWithActiveContractQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCompanyWithActiveContractQuery,
    GetCompanyWithActiveContractQueryVariables
  >(GetCompanyWithActiveContractDocument, baseOptions);
}
export function useGetCompanyWithActiveContractLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyWithActiveContractQuery,
    GetCompanyWithActiveContractQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCompanyWithActiveContractQuery,
    GetCompanyWithActiveContractQueryVariables
  >(GetCompanyWithActiveContractDocument, baseOptions);
}
export type GetCompanyWithActiveContractQueryHookResult = ReturnType<
  typeof useGetCompanyWithActiveContractQuery
>;
export type GetCompanyWithActiveContractLazyQueryHookResult = ReturnType<
  typeof useGetCompanyWithActiveContractLazyQuery
>;
export type GetCompanyWithActiveContractQueryResult = Apollo.QueryResult<
  GetCompanyWithActiveContractQuery,
  GetCompanyWithActiveContractQueryVariables
>;
export const GetCompanyForCustomerBorrowingBaseDocument = gql`
  query GetCompanyForCustomerBorrowingBase($companyId: uuid!) {
    companies_by_pk(id: $companyId) {
      id
      ebba_applications(
        order_by: [{ application_date: desc }, { created_at: desc }]
      ) {
        id
        ...EbbaApplication
        company {
          id
          name
        }
      }
      settings {
        id
        active_ebba_application {
          id
          ...EbbaApplication
        }
      }
    }
  }
  ${EbbaApplicationFragmentDoc}
`;

/**
 * __useGetCompanyForCustomerBorrowingBaseQuery__
 *
 * To run a query within a React component, call `useGetCompanyForCustomerBorrowingBaseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyForCustomerBorrowingBaseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyForCustomerBorrowingBaseQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetCompanyForCustomerBorrowingBaseQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyForCustomerBorrowingBaseQuery,
    GetCompanyForCustomerBorrowingBaseQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCompanyForCustomerBorrowingBaseQuery,
    GetCompanyForCustomerBorrowingBaseQueryVariables
  >(GetCompanyForCustomerBorrowingBaseDocument, baseOptions);
}
export function useGetCompanyForCustomerBorrowingBaseLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyForCustomerBorrowingBaseQuery,
    GetCompanyForCustomerBorrowingBaseQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCompanyForCustomerBorrowingBaseQuery,
    GetCompanyForCustomerBorrowingBaseQueryVariables
  >(GetCompanyForCustomerBorrowingBaseDocument, baseOptions);
}
export type GetCompanyForCustomerBorrowingBaseQueryHookResult = ReturnType<
  typeof useGetCompanyForCustomerBorrowingBaseQuery
>;
export type GetCompanyForCustomerBorrowingBaseLazyQueryHookResult = ReturnType<
  typeof useGetCompanyForCustomerBorrowingBaseLazyQuery
>;
export type GetCompanyForCustomerBorrowingBaseQueryResult = Apollo.QueryResult<
  GetCompanyForCustomerBorrowingBaseQuery,
  GetCompanyForCustomerBorrowingBaseQueryVariables
>;
export const GetCompanyForCustomerContractPageDocument = gql`
  query GetCompanyForCustomerContractPage($companyId: uuid!) {
    companies_by_pk(id: $companyId) {
      id
      contract {
        id
        ...Contract
      }
      contracts(order_by: [{ adjusted_end_date: desc }]) {
        id
        ...Contract
      }
    }
  }
  ${ContractFragmentDoc}
`;

/**
 * __useGetCompanyForCustomerContractPageQuery__
 *
 * To run a query within a React component, call `useGetCompanyForCustomerContractPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyForCustomerContractPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyForCustomerContractPageQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetCompanyForCustomerContractPageQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyForCustomerContractPageQuery,
    GetCompanyForCustomerContractPageQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCompanyForCustomerContractPageQuery,
    GetCompanyForCustomerContractPageQueryVariables
  >(GetCompanyForCustomerContractPageDocument, baseOptions);
}
export function useGetCompanyForCustomerContractPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyForCustomerContractPageQuery,
    GetCompanyForCustomerContractPageQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCompanyForCustomerContractPageQuery,
    GetCompanyForCustomerContractPageQueryVariables
  >(GetCompanyForCustomerContractPageDocument, baseOptions);
}
export type GetCompanyForCustomerContractPageQueryHookResult = ReturnType<
  typeof useGetCompanyForCustomerContractPageQuery
>;
export type GetCompanyForCustomerContractPageLazyQueryHookResult = ReturnType<
  typeof useGetCompanyForCustomerContractPageLazyQuery
>;
export type GetCompanyForCustomerContractPageQueryResult = Apollo.QueryResult<
  GetCompanyForCustomerContractPageQuery,
  GetCompanyForCustomerContractPageQueryVariables
>;
export const GetCompanyWithDetailsByCompanyIdDocument = gql`
  query GetCompanyWithDetailsByCompanyId($companyId: uuid!) {
    companies_by_pk(id: $companyId) {
      id
      name
      contract {
        id
        ...Contract
      }
      financial_summaries(order_by: { date: desc }, limit: 1) {
        id
        ...FinancialSummary
      }
    }
  }
  ${ContractFragmentDoc}
  ${FinancialSummaryFragmentDoc}
`;

/**
 * __useGetCompanyWithDetailsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetCompanyWithDetailsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyWithDetailsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyWithDetailsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetCompanyWithDetailsByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyWithDetailsByCompanyIdQuery,
    GetCompanyWithDetailsByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCompanyWithDetailsByCompanyIdQuery,
    GetCompanyWithDetailsByCompanyIdQueryVariables
  >(GetCompanyWithDetailsByCompanyIdDocument, baseOptions);
}
export function useGetCompanyWithDetailsByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyWithDetailsByCompanyIdQuery,
    GetCompanyWithDetailsByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCompanyWithDetailsByCompanyIdQuery,
    GetCompanyWithDetailsByCompanyIdQueryVariables
  >(GetCompanyWithDetailsByCompanyIdDocument, baseOptions);
}
export type GetCompanyWithDetailsByCompanyIdQueryHookResult = ReturnType<
  typeof useGetCompanyWithDetailsByCompanyIdQuery
>;
export type GetCompanyWithDetailsByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetCompanyWithDetailsByCompanyIdLazyQuery
>;
export type GetCompanyWithDetailsByCompanyIdQueryResult = Apollo.QueryResult<
  GetCompanyWithDetailsByCompanyIdQuery,
  GetCompanyWithDetailsByCompanyIdQueryVariables
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
export const UpdateCompanyInfoDocument = gql`
  mutation UpdateCompanyInfo($id: uuid!, $company: companies_set_input!) {
    update_companies_by_pk(pk_columns: { id: $id }, _set: $company) {
      ...ThirdParty
    }
  }
  ${ThirdPartyFragmentDoc}
`;
export type UpdateCompanyInfoMutationFn = Apollo.MutationFunction<
  UpdateCompanyInfoMutation,
  UpdateCompanyInfoMutationVariables
>;

/**
 * __useUpdateCompanyInfoMutation__
 *
 * To run a mutation, you first call `useUpdateCompanyInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompanyInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompanyInfoMutation, { data, loading, error }] = useUpdateCompanyInfoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      company: // value for 'company'
 *   },
 * });
 */
export function useUpdateCompanyInfoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCompanyInfoMutation,
    UpdateCompanyInfoMutationVariables
  >
) {
  return Apollo.useMutation<
    UpdateCompanyInfoMutation,
    UpdateCompanyInfoMutationVariables
  >(UpdateCompanyInfoDocument, baseOptions);
}
export type UpdateCompanyInfoMutationHookResult = ReturnType<
  typeof useUpdateCompanyInfoMutation
>;
export type UpdateCompanyInfoMutationResult = Apollo.MutationResult<UpdateCompanyInfoMutation>;
export type UpdateCompanyInfoMutationOptions = Apollo.BaseMutationOptions<
  UpdateCompanyInfoMutation,
  UpdateCompanyInfoMutationVariables
>;
export const GetTransactionsDocument = gql`
  query GetTransactions {
    transactions(order_by: { created_at: desc }) {
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
 * __useGetTransactionsQuery__
 *
 * To run a query within a React component, call `useGetTransactionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTransactionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTransactionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTransactionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetTransactionsQuery,
    GetTransactionsQueryVariables
  >
) {
  return Apollo.useQuery<GetTransactionsQuery, GetTransactionsQueryVariables>(
    GetTransactionsDocument,
    baseOptions
  );
}
export function useGetTransactionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetTransactionsQuery,
    GetTransactionsQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetTransactionsQuery,
    GetTransactionsQueryVariables
  >(GetTransactionsDocument, baseOptions);
}
export type GetTransactionsQueryHookResult = ReturnType<
  typeof useGetTransactionsQuery
>;
export type GetTransactionsLazyQueryHookResult = ReturnType<
  typeof useGetTransactionsLazyQuery
>;
export type GetTransactionsQueryResult = Apollo.QueryResult<
  GetTransactionsQuery,
  GetTransactionsQueryVariables
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
export const GetVendorPartnershipForBankDocument = gql`
  query GetVendorPartnershipForBank($id: uuid!) {
    company_vendor_partnerships_by_pk(id: $id) {
      ...VendorPartnership
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
      vendor {
        ...ThirdParty
        settings {
          id
          ...CompanySettings
          collections_bespoke_bank_account {
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
        }
        licenses {
          ...CompanyLicense
        }
      }
      vendor_bank_account {
        id
        ...BankAccount
      }
    }
  }
  ${VendorPartnershipFragmentDoc}
  ${CompanyFragmentDoc}
  ${ContactFragmentDoc}
  ${CompanySettingsFragmentDoc}
  ${CompanyAgreementFragmentDoc}
  ${CompanyLicenseFragmentDoc}
  ${ThirdPartyFragmentDoc}
  ${BankAccountFragmentDoc}
`;

/**
 * __useGetVendorPartnershipForBankQuery__
 *
 * To run a query within a React component, call `useGetVendorPartnershipForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVendorPartnershipForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVendorPartnershipForBankQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetVendorPartnershipForBankQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetVendorPartnershipForBankQuery,
    GetVendorPartnershipForBankQueryVariables
  >
) {
  return Apollo.useQuery<
    GetVendorPartnershipForBankQuery,
    GetVendorPartnershipForBankQueryVariables
  >(GetVendorPartnershipForBankDocument, baseOptions);
}
export function useGetVendorPartnershipForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetVendorPartnershipForBankQuery,
    GetVendorPartnershipForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetVendorPartnershipForBankQuery,
    GetVendorPartnershipForBankQueryVariables
  >(GetVendorPartnershipForBankDocument, baseOptions);
}
export type GetVendorPartnershipForBankQueryHookResult = ReturnType<
  typeof useGetVendorPartnershipForBankQuery
>;
export type GetVendorPartnershipForBankLazyQueryHookResult = ReturnType<
  typeof useGetVendorPartnershipForBankLazyQuery
>;
export type GetVendorPartnershipForBankQueryResult = Apollo.QueryResult<
  GetVendorPartnershipForBankQuery,
  GetVendorPartnershipForBankQueryVariables
>;
export const GetVendorPartnershipsForBankDocument = gql`
  query GetVendorPartnershipsForBank {
    company_vendor_partnerships(order_by: { vendor: { name: asc } }) {
      ...VendorPartnership
      company {
        id
        name
      }
      vendor {
        ...ThirdParty
        settings {
          id
        }
        users {
          ...Contact
        }
        licenses {
          ...CompanyLicense
        }
      }
      vendor_bank_account {
        id
        verified_at
      }
    }
  }
  ${VendorPartnershipFragmentDoc}
  ${ThirdPartyFragmentDoc}
  ${ContactFragmentDoc}
  ${CompanyLicenseFragmentDoc}
`;

/**
 * __useGetVendorPartnershipsForBankQuery__
 *
 * To run a query within a React component, call `useGetVendorPartnershipsForBankQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVendorPartnershipsForBankQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVendorPartnershipsForBankQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetVendorPartnershipsForBankQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetVendorPartnershipsForBankQuery,
    GetVendorPartnershipsForBankQueryVariables
  >
) {
  return Apollo.useQuery<
    GetVendorPartnershipsForBankQuery,
    GetVendorPartnershipsForBankQueryVariables
  >(GetVendorPartnershipsForBankDocument, baseOptions);
}
export function useGetVendorPartnershipsForBankLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetVendorPartnershipsForBankQuery,
    GetVendorPartnershipsForBankQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetVendorPartnershipsForBankQuery,
    GetVendorPartnershipsForBankQueryVariables
  >(GetVendorPartnershipsForBankDocument, baseOptions);
}
export type GetVendorPartnershipsForBankQueryHookResult = ReturnType<
  typeof useGetVendorPartnershipsForBankQuery
>;
export type GetVendorPartnershipsForBankLazyQueryHookResult = ReturnType<
  typeof useGetVendorPartnershipsForBankLazyQuery
>;
export type GetVendorPartnershipsForBankQueryResult = Apollo.QueryResult<
  GetVendorPartnershipsForBankQuery,
  GetVendorPartnershipsForBankQueryVariables
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
      ...VendorPartnership
    }
  }
  ${VendorPartnershipFragmentDoc}
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
      ...ThirdParty
    }
  }
  ${ThirdPartyFragmentDoc}
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
export const GetVendorPartnershipsByCompanyIdDocument = gql`
  query GetVendorPartnershipsByCompanyId($companyId: uuid!) {
    company_vendor_partnerships(where: { company_id: { _eq: $companyId } }) {
      ...VendorPartnershipLimited
      vendor_limited {
        ...VendorLimited
      }
    }
  }
  ${VendorPartnershipLimitedFragmentDoc}
  ${VendorLimitedFragmentDoc}
`;

/**
 * __useGetVendorPartnershipsByCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetVendorPartnershipsByCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVendorPartnershipsByCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVendorPartnershipsByCompanyIdQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetVendorPartnershipsByCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetVendorPartnershipsByCompanyIdQuery,
    GetVendorPartnershipsByCompanyIdQueryVariables
  >
) {
  return Apollo.useQuery<
    GetVendorPartnershipsByCompanyIdQuery,
    GetVendorPartnershipsByCompanyIdQueryVariables
  >(GetVendorPartnershipsByCompanyIdDocument, baseOptions);
}
export function useGetVendorPartnershipsByCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetVendorPartnershipsByCompanyIdQuery,
    GetVendorPartnershipsByCompanyIdQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetVendorPartnershipsByCompanyIdQuery,
    GetVendorPartnershipsByCompanyIdQueryVariables
  >(GetVendorPartnershipsByCompanyIdDocument, baseOptions);
}
export type GetVendorPartnershipsByCompanyIdQueryHookResult = ReturnType<
  typeof useGetVendorPartnershipsByCompanyIdQuery
>;
export type GetVendorPartnershipsByCompanyIdLazyQueryHookResult = ReturnType<
  typeof useGetVendorPartnershipsByCompanyIdLazyQuery
>;
export type GetVendorPartnershipsByCompanyIdQueryResult = Apollo.QueryResult<
  GetVendorPartnershipsByCompanyIdQuery,
  GetVendorPartnershipsByCompanyIdQueryVariables
>;
export const GetVendorsByPartnerCompanyDocument = gql`
  query GetVendorsByPartnerCompany($companyId: uuid!) {
    vendors(
      where: {
        company_vendor_partnerships: { company_id: { _eq: $companyId } }
      }
      order_by: { name: asc }
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
 * __useGetVendorsByPartnerCompanyQuery__
 *
 * To run a query within a React component, call `useGetVendorsByPartnerCompanyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVendorsByPartnerCompanyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVendorsByPartnerCompanyQuery({
 *   variables: {
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetVendorsByPartnerCompanyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetVendorsByPartnerCompanyQuery,
    GetVendorsByPartnerCompanyQueryVariables
  >
) {
  return Apollo.useQuery<
    GetVendorsByPartnerCompanyQuery,
    GetVendorsByPartnerCompanyQueryVariables
  >(GetVendorsByPartnerCompanyDocument, baseOptions);
}
export function useGetVendorsByPartnerCompanyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetVendorsByPartnerCompanyQuery,
    GetVendorsByPartnerCompanyQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetVendorsByPartnerCompanyQuery,
    GetVendorsByPartnerCompanyQueryVariables
  >(GetVendorsByPartnerCompanyDocument, baseOptions);
}
export type GetVendorsByPartnerCompanyQueryHookResult = ReturnType<
  typeof useGetVendorsByPartnerCompanyQuery
>;
export type GetVendorsByPartnerCompanyLazyQueryHookResult = ReturnType<
  typeof useGetVendorsByPartnerCompanyLazyQuery
>;
export type GetVendorsByPartnerCompanyQueryResult = Apollo.QueryResult<
  GetVendorsByPartnerCompanyQuery,
  GetVendorsByPartnerCompanyQueryVariables
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
export const GetCustomersWithMetadataDocument = gql`
  query GetCustomersWithMetadata {
    customers: companies(
      where: { company_type: { _eq: customer } }
      order_by: { name: asc }
    ) {
      id
      ...CustomerForBank
      contract {
        id
        ...Contract
      }
      financial_summaries(order_by: { date: desc }, limit: 1) {
        id
        ...FinancialSummary
      }
      settings {
        id
        ...CompanySettings
      }
    }
  }
  ${CustomerForBankFragmentDoc}
  ${ContractFragmentDoc}
  ${FinancialSummaryFragmentDoc}
  ${CompanySettingsFragmentDoc}
`;

/**
 * __useGetCustomersWithMetadataQuery__
 *
 * To run a query within a React component, call `useGetCustomersWithMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCustomersWithMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCustomersWithMetadataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCustomersWithMetadataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCustomersWithMetadataQuery,
    GetCustomersWithMetadataQueryVariables
  >
) {
  return Apollo.useQuery<
    GetCustomersWithMetadataQuery,
    GetCustomersWithMetadataQueryVariables
  >(GetCustomersWithMetadataDocument, baseOptions);
}
export function useGetCustomersWithMetadataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCustomersWithMetadataQuery,
    GetCustomersWithMetadataQueryVariables
  >
) {
  return Apollo.useLazyQuery<
    GetCustomersWithMetadataQuery,
    GetCustomersWithMetadataQueryVariables
  >(GetCustomersWithMetadataDocument, baseOptions);
}
export type GetCustomersWithMetadataQueryHookResult = ReturnType<
  typeof useGetCustomersWithMetadataQuery
>;
export type GetCustomersWithMetadataLazyQueryHookResult = ReturnType<
  typeof useGetCustomersWithMetadataLazyQuery
>;
export type GetCustomersWithMetadataQueryResult = Apollo.QueryResult<
  GetCustomersWithMetadataQuery,
  GetCustomersWithMetadataQueryVariables
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
