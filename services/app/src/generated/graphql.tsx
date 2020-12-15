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
  date: any;
  timestamptz: any;
  uuid: any;
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

/** columns and relationships of "companies" */
export type Companies = {
  address?: Maybe<Scalars['String']>;
  /** An array relationship */
  agreements: Array<CompanyAgreements>;
  /** An aggregated array relationship */
  agreements_aggregate: CompanyAgreementsAggregate;
  /** An array relationship */
  bank_accounts: Array<CompanyBankAccounts>;
  /** An aggregated array relationship */
  bank_accounts_aggregate: CompanyBankAccountsAggregate;
  city?: Maybe<Scalars['String']>;
  /** An array relationship */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  /** An array relationship */
  company_vendor_partnerships_by_vendor: Array<CompanyVendorPartnerships>;
  /** An aggregated array relationship */
  company_vendor_partnerships_by_vendor_aggregate: CompanyVendorPartnershipsAggregate;
  contact_email_address?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  created_at: Scalars['timestamptz'];
  dba_name?: Maybe<Scalars['String']>;
  employer_identification_number?: Maybe<Scalars['String']>;
  id: Scalars['uuid'];
  /** An array relationship */
  licenses: Array<CompanyLicenses>;
  /** An aggregated array relationship */
  licenses_aggregate: CompanyLicensesAggregate;
  name: Scalars['String'];
  phone_number?: Maybe<Scalars['String']>;
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
  distinct_on?: Maybe<Array<CompanyBankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyBankAccountsOrderBy>>;
  where?: Maybe<CompanyBankAccountsBoolExp>;
};


/** columns and relationships of "companies" */
export type CompaniesBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyBankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyBankAccountsOrderBy>>;
  where?: Maybe<CompanyBankAccountsBoolExp>;
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
  bank_accounts?: Maybe<CompanyBankAccountsBoolExp>;
  city?: Maybe<StringComparisonExp>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsBoolExp>;
  company_vendor_partnerships_by_vendor?: Maybe<CompanyVendorPartnershipsBoolExp>;
  contact_email_address?: Maybe<StringComparisonExp>;
  country?: Maybe<StringComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  dba_name?: Maybe<StringComparisonExp>;
  employer_identification_number?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  licenses?: Maybe<CompanyLicensesBoolExp>;
  name?: Maybe<StringComparisonExp>;
  phone_number?: Maybe<StringComparisonExp>;
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
  bank_accounts?: Maybe<CompanyBankAccountsArrRelInsertInput>;
  city?: Maybe<Scalars['String']>;
  company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  company_vendor_partnerships_by_vendor?: Maybe<CompanyVendorPartnershipsArrRelInsertInput>;
  contact_email_address?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  dba_name?: Maybe<Scalars['String']>;
  employer_identification_number?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  licenses?: Maybe<CompanyLicensesArrRelInsertInput>;
  name?: Maybe<Scalars['String']>;
  phone_number?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  users?: Maybe<UsersArrRelInsertInput>;
  zip_code?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type CompaniesMaxFields = {
  address?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  contact_email_address?: Maybe<Scalars['String']>;
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
  contact_email_address?: Maybe<OrderBy>;
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
  contact_email_address?: Maybe<Scalars['String']>;
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
  contact_email_address?: Maybe<OrderBy>;
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
  bank_accounts_aggregate?: Maybe<CompanyBankAccountsAggregateOrderBy>;
  city?: Maybe<OrderBy>;
  company_vendor_partnerships_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  company_vendor_partnerships_by_vendor_aggregate?: Maybe<CompanyVendorPartnershipsAggregateOrderBy>;
  contact_email_address?: Maybe<OrderBy>;
  country?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  dba_name?: Maybe<OrderBy>;
  employer_identification_number?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  licenses_aggregate?: Maybe<CompanyLicensesAggregateOrderBy>;
  name?: Maybe<OrderBy>;
  phone_number?: Maybe<OrderBy>;
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
  ContactEmailAddress = 'contact_email_address',
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
  contact_email_address?: Maybe<Scalars['String']>;
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

/** update columns of table "companies" */
export enum CompaniesUpdateColumn {
  /** column name */
  Address = 'address',
  /** column name */
  City = 'city',
  /** column name */
  ContactEmailAddress = 'contact_email_address',
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

/** columns and relationships of "company_agreements" */
export type CompanyAgreements = {
  agreement_link: Scalars['String'];
  company_id: Scalars['uuid'];
  id: Scalars['uuid'];
  marked_signed_at?: Maybe<Scalars['timestamptz']>;
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
  agreement_link?: Maybe<StringComparisonExp>;
  company_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  marked_signed_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "company_agreements" */
export enum CompanyAgreementsConstraint {
  /** unique or primary key constraint */
  VendorAgreementsPkey = 'vendor_agreements_pkey'
}

/** input type for inserting data into table "company_agreements" */
export type CompanyAgreementsInsertInput = {
  agreement_link?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  marked_signed_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type CompanyAgreementsMaxFields = {
  agreement_link?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  marked_signed_at?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "company_agreements" */
export type CompanyAgreementsMaxOrderBy = {
  agreement_link?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  marked_signed_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyAgreementsMinFields = {
  agreement_link?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  marked_signed_at?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "company_agreements" */
export type CompanyAgreementsMinOrderBy = {
  agreement_link?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  marked_signed_at?: Maybe<OrderBy>;
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
  agreement_link?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  marked_signed_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_agreements" */
export type CompanyAgreementsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "company_agreements" */
export enum CompanyAgreementsSelectColumn {
  /** column name */
  AgreementLink = 'agreement_link',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  MarkedSignedAt = 'marked_signed_at'
}

/** input type for updating data in table "company_agreements" */
export type CompanyAgreementsSetInput = {
  agreement_link?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  marked_signed_at?: Maybe<Scalars['timestamptz']>;
};

/** update columns of table "company_agreements" */
export enum CompanyAgreementsUpdateColumn {
  /** column name */
  AgreementLink = 'agreement_link',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  MarkedSignedAt = 'marked_signed_at'
}

/** columns and relationships of "company_bank_accounts" */
export type CompanyBankAccounts = {
  account_name: Scalars['String'];
  account_number: Scalars['String'];
  /** An object relationship */
  company: Companies;
  company_id: Scalars['uuid'];
  id: Scalars['uuid'];
  name: Scalars['String'];
  notes?: Maybe<Scalars['String']>;
  routing_number: Scalars['String'];
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregated selection of "company_bank_accounts" */
export type CompanyBankAccountsAggregate = {
  aggregate?: Maybe<CompanyBankAccountsAggregateFields>;
  nodes: Array<CompanyBankAccounts>;
};

/** aggregate fields of "company_bank_accounts" */
export type CompanyBankAccountsAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<CompanyBankAccountsMaxFields>;
  min?: Maybe<CompanyBankAccountsMinFields>;
};


/** aggregate fields of "company_bank_accounts" */
export type CompanyBankAccountsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<CompanyBankAccountsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "company_bank_accounts" */
export type CompanyBankAccountsAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<CompanyBankAccountsMaxOrderBy>;
  min?: Maybe<CompanyBankAccountsMinOrderBy>;
};

/** input type for inserting array relation for remote table "company_bank_accounts" */
export type CompanyBankAccountsArrRelInsertInput = {
  data: Array<CompanyBankAccountsInsertInput>;
  on_conflict?: Maybe<CompanyBankAccountsOnConflict>;
};

/** Boolean expression to filter rows from the table "company_bank_accounts". All fields are combined with a logical 'AND'. */
export type CompanyBankAccountsBoolExp = {
  _and?: Maybe<Array<Maybe<CompanyBankAccountsBoolExp>>>;
  _not?: Maybe<CompanyBankAccountsBoolExp>;
  _or?: Maybe<Array<Maybe<CompanyBankAccountsBoolExp>>>;
  account_name?: Maybe<StringComparisonExp>;
  account_number?: Maybe<StringComparisonExp>;
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  name?: Maybe<StringComparisonExp>;
  notes?: Maybe<StringComparisonExp>;
  routing_number?: Maybe<StringComparisonExp>;
  verified_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "company_bank_accounts" */
export enum CompanyBankAccountsConstraint {
  /** unique or primary key constraint */
  CompanyBanksPkey = 'company_banks_pkey'
}

/** input type for inserting data into table "company_bank_accounts" */
export type CompanyBankAccountsInsertInput = {
  account_name?: Maybe<Scalars['String']>;
  account_number?: Maybe<Scalars['String']>;
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  routing_number?: Maybe<Scalars['String']>;
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type CompanyBankAccountsMaxFields = {
  account_name?: Maybe<Scalars['String']>;
  account_number?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  routing_number?: Maybe<Scalars['String']>;
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "company_bank_accounts" */
export type CompanyBankAccountsMaxOrderBy = {
  account_name?: Maybe<OrderBy>;
  account_number?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  notes?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyBankAccountsMinFields = {
  account_name?: Maybe<Scalars['String']>;
  account_number?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  routing_number?: Maybe<Scalars['String']>;
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "company_bank_accounts" */
export type CompanyBankAccountsMinOrderBy = {
  account_name?: Maybe<OrderBy>;
  account_number?: Maybe<OrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  notes?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "company_bank_accounts" */
export type CompanyBankAccountsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<CompanyBankAccounts>;
};

/** input type for inserting object relation for remote table "company_bank_accounts" */
export type CompanyBankAccountsObjRelInsertInput = {
  data: CompanyBankAccountsInsertInput;
  on_conflict?: Maybe<CompanyBankAccountsOnConflict>;
};

/** on conflict condition type for table "company_bank_accounts" */
export type CompanyBankAccountsOnConflict = {
  constraint: CompanyBankAccountsConstraint;
  update_columns: Array<CompanyBankAccountsUpdateColumn>;
  where?: Maybe<CompanyBankAccountsBoolExp>;
};

/** ordering options when selecting data from "company_bank_accounts" */
export type CompanyBankAccountsOrderBy = {
  account_name?: Maybe<OrderBy>;
  account_number?: Maybe<OrderBy>;
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  name?: Maybe<OrderBy>;
  notes?: Maybe<OrderBy>;
  routing_number?: Maybe<OrderBy>;
  verified_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_bank_accounts" */
export type CompanyBankAccountsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "company_bank_accounts" */
export enum CompanyBankAccountsSelectColumn {
  /** column name */
  AccountName = 'account_name',
  /** column name */
  AccountNumber = 'account_number',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Notes = 'notes',
  /** column name */
  RoutingNumber = 'routing_number',
  /** column name */
  VerifiedAt = 'verified_at'
}

/** input type for updating data in table "company_bank_accounts" */
export type CompanyBankAccountsSetInput = {
  account_name?: Maybe<Scalars['String']>;
  account_number?: Maybe<Scalars['String']>;
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  routing_number?: Maybe<Scalars['String']>;
  verified_at?: Maybe<Scalars['timestamptz']>;
};

/** update columns of table "company_bank_accounts" */
export enum CompanyBankAccountsUpdateColumn {
  /** column name */
  AccountName = 'account_name',
  /** column name */
  AccountNumber = 'account_number',
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Notes = 'notes',
  /** column name */
  RoutingNumber = 'routing_number',
  /** column name */
  VerifiedAt = 'verified_at'
}

/** columns and relationships of "company_licenses" */
export type CompanyLicenses = {
  /** An object relationship */
  company: Companies;
  company_id: Scalars['uuid'];
  id: Scalars['uuid'];
  license_link: Scalars['String'];
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
  id?: Maybe<UuidComparisonExp>;
  license_link?: Maybe<StringComparisonExp>;
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
  id?: Maybe<Scalars['uuid']>;
  license_link?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type CompanyLicensesMaxFields = {
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  license_link?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "company_licenses" */
export type CompanyLicensesMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  license_link?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type CompanyLicensesMinFields = {
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  license_link?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "company_licenses" */
export type CompanyLicensesMinOrderBy = {
  company_id?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  license_link?: Maybe<OrderBy>;
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
  id?: Maybe<OrderBy>;
  license_link?: Maybe<OrderBy>;
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
  Id = 'id',
  /** column name */
  LicenseLink = 'license_link'
}

/** input type for updating data in table "company_licenses" */
export type CompanyLicensesSetInput = {
  company_id?: Maybe<Scalars['uuid']>;
  id?: Maybe<Scalars['uuid']>;
  license_link?: Maybe<Scalars['String']>;
};

/** update columns of table "company_licenses" */
export enum CompanyLicensesUpdateColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Id = 'id',
  /** column name */
  LicenseLink = 'license_link'
}

/** columns and relationships of "company_vendor_partnerships" */
export type CompanyVendorPartnerships = {
  /** An object relationship */
  company: Companies;
  company_id: Scalars['uuid'];
  created_at: Scalars['timestamptz'];
  id: Scalars['uuid'];
  updated_at: Scalars['timestamptz'];
  /** An object relationship */
  vendor: Companies;
  vendor_agreement_id?: Maybe<Scalars['uuid']>;
  /** An object relationship */
  vendor_bank_account?: Maybe<CompanyBankAccounts>;
  vendor_bank_id?: Maybe<Scalars['uuid']>;
  vendor_id: Scalars['uuid'];
  vendor_license_id?: Maybe<Scalars['uuid']>;
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
  company?: Maybe<CompaniesBoolExp>;
  company_id?: Maybe<UuidComparisonExp>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  vendor?: Maybe<CompaniesBoolExp>;
  vendor_agreement_id?: Maybe<UuidComparisonExp>;
  vendor_bank_account?: Maybe<CompanyBankAccountsBoolExp>;
  vendor_bank_id?: Maybe<UuidComparisonExp>;
  vendor_id?: Maybe<UuidComparisonExp>;
  vendor_license_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "company_vendor_partnerships" */
export enum CompanyVendorPartnershipsConstraint {
  /** unique or primary key constraint */
  CompanyVendorPartnershipPkey = 'company_vendor_partnership_pkey'
}

/** input type for inserting data into table "company_vendor_partnerships" */
export type CompanyVendorPartnershipsInsertInput = {
  company?: Maybe<CompaniesObjRelInsertInput>;
  company_id?: Maybe<Scalars['uuid']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor?: Maybe<CompaniesObjRelInsertInput>;
  vendor_agreement_id?: Maybe<Scalars['uuid']>;
  vendor_bank_account?: Maybe<CompanyBankAccountsObjRelInsertInput>;
  vendor_bank_id?: Maybe<Scalars['uuid']>;
  vendor_id?: Maybe<Scalars['uuid']>;
  vendor_license_id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type CompanyVendorPartnershipsMaxFields = {
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
  company?: Maybe<CompaniesOrderBy>;
  company_id?: Maybe<OrderBy>;
  created_at?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor?: Maybe<CompaniesOrderBy>;
  vendor_agreement_id?: Maybe<OrderBy>;
  vendor_bank_account?: Maybe<CompanyBankAccountsOrderBy>;
  vendor_bank_id?: Maybe<OrderBy>;
  vendor_id?: Maybe<OrderBy>;
  vendor_license_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "company_vendor_partnerships" */
export type CompanyVendorPartnershipsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "company_vendor_partnerships" */
export enum CompanyVendorPartnershipsSelectColumn {
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

/** columns and relationships of "loans" */
export type Loans = {
  id: Scalars['uuid'];
};

/** aggregated selection of "loans" */
export type LoansAggregate = {
  aggregate?: Maybe<LoansAggregateFields>;
  nodes: Array<Loans>;
};

/** aggregate fields of "loans" */
export type LoansAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<LoansMaxFields>;
  min?: Maybe<LoansMinFields>;
};


/** aggregate fields of "loans" */
export type LoansAggregateFieldsCountArgs = {
  columns?: Maybe<Array<LoansSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "loans" */
export type LoansAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<LoansMaxOrderBy>;
  min?: Maybe<LoansMinOrderBy>;
};

/** input type for inserting array relation for remote table "loans" */
export type LoansArrRelInsertInput = {
  data: Array<LoansInsertInput>;
  on_conflict?: Maybe<LoansOnConflict>;
};

/** Boolean expression to filter rows from the table "loans". All fields are combined with a logical 'AND'. */
export type LoansBoolExp = {
  _and?: Maybe<Array<Maybe<LoansBoolExp>>>;
  _not?: Maybe<LoansBoolExp>;
  _or?: Maybe<Array<Maybe<LoansBoolExp>>>;
  id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "loans" */
export enum LoansConstraint {
  /** unique or primary key constraint */
  LoansPkey = 'loans_pkey'
}

/** input type for inserting data into table "loans" */
export type LoansInsertInput = {
  id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type LoansMaxFields = {
  id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "loans" */
export type LoansMaxOrderBy = {
  id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type LoansMinFields = {
  id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "loans" */
export type LoansMinOrderBy = {
  id?: Maybe<OrderBy>;
};

/** response of any mutation on the table "loans" */
export type LoansMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
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
  id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "loans" */
export type LoansPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "loans" */
export enum LoansSelectColumn {
  /** column name */
  Id = 'id'
}

/** input type for updating data in table "loans" */
export type LoansSetInput = {
  id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "loans" */
export enum LoansUpdateColumn {
  /** column name */
  Id = 'id'
}

/** mutation root */
export type MutationRoot = {
  /** delete data from the table: "companies" */
  delete_companies?: Maybe<CompaniesMutationResponse>;
  /** delete single row from the table: "companies" */
  delete_companies_by_pk?: Maybe<Companies>;
  /** delete data from the table: "company_agreements" */
  delete_company_agreements?: Maybe<CompanyAgreementsMutationResponse>;
  /** delete single row from the table: "company_agreements" */
  delete_company_agreements_by_pk?: Maybe<CompanyAgreements>;
  /** delete data from the table: "company_bank_accounts" */
  delete_company_bank_accounts?: Maybe<CompanyBankAccountsMutationResponse>;
  /** delete single row from the table: "company_bank_accounts" */
  delete_company_bank_accounts_by_pk?: Maybe<CompanyBankAccounts>;
  /** delete data from the table: "company_licenses" */
  delete_company_licenses?: Maybe<CompanyLicensesMutationResponse>;
  /** delete single row from the table: "company_licenses" */
  delete_company_licenses_by_pk?: Maybe<CompanyLicenses>;
  /** delete data from the table: "company_vendor_partnerships" */
  delete_company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsMutationResponse>;
  /** delete single row from the table: "company_vendor_partnerships" */
  delete_company_vendor_partnerships_by_pk?: Maybe<CompanyVendorPartnerships>;
  /** delete data from the table: "loans" */
  delete_loans?: Maybe<LoansMutationResponse>;
  /** delete single row from the table: "loans" */
  delete_loans_by_pk?: Maybe<Loans>;
  /** delete data from the table: "purchase_order_line_items" */
  delete_purchase_order_line_items?: Maybe<PurchaseOrderLineItemsMutationResponse>;
  /** delete single row from the table: "purchase_order_line_items" */
  delete_purchase_order_line_items_by_pk?: Maybe<PurchaseOrderLineItems>;
  /** delete data from the table: "purchase_orders" */
  delete_purchase_orders?: Maybe<PurchaseOrdersMutationResponse>;
  /** delete single row from the table: "purchase_orders" */
  delete_purchase_orders_by_pk?: Maybe<PurchaseOrders>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<UsersMutationResponse>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** insert data into the table: "companies" */
  insert_companies?: Maybe<CompaniesMutationResponse>;
  /** insert a single row into the table: "companies" */
  insert_companies_one?: Maybe<Companies>;
  /** insert data into the table: "company_agreements" */
  insert_company_agreements?: Maybe<CompanyAgreementsMutationResponse>;
  /** insert a single row into the table: "company_agreements" */
  insert_company_agreements_one?: Maybe<CompanyAgreements>;
  /** insert data into the table: "company_bank_accounts" */
  insert_company_bank_accounts?: Maybe<CompanyBankAccountsMutationResponse>;
  /** insert a single row into the table: "company_bank_accounts" */
  insert_company_bank_accounts_one?: Maybe<CompanyBankAccounts>;
  /** insert data into the table: "company_licenses" */
  insert_company_licenses?: Maybe<CompanyLicensesMutationResponse>;
  /** insert a single row into the table: "company_licenses" */
  insert_company_licenses_one?: Maybe<CompanyLicenses>;
  /** insert data into the table: "company_vendor_partnerships" */
  insert_company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsMutationResponse>;
  /** insert a single row into the table: "company_vendor_partnerships" */
  insert_company_vendor_partnerships_one?: Maybe<CompanyVendorPartnerships>;
  /** insert data into the table: "loans" */
  insert_loans?: Maybe<LoansMutationResponse>;
  /** insert a single row into the table: "loans" */
  insert_loans_one?: Maybe<Loans>;
  /** insert data into the table: "purchase_order_line_items" */
  insert_purchase_order_line_items?: Maybe<PurchaseOrderLineItemsMutationResponse>;
  /** insert a single row into the table: "purchase_order_line_items" */
  insert_purchase_order_line_items_one?: Maybe<PurchaseOrderLineItems>;
  /** insert data into the table: "purchase_orders" */
  insert_purchase_orders?: Maybe<PurchaseOrdersMutationResponse>;
  /** insert a single row into the table: "purchase_orders" */
  insert_purchase_orders_one?: Maybe<PurchaseOrders>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<UsersMutationResponse>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** update data of the table: "companies" */
  update_companies?: Maybe<CompaniesMutationResponse>;
  /** update single row of the table: "companies" */
  update_companies_by_pk?: Maybe<Companies>;
  /** update data of the table: "company_agreements" */
  update_company_agreements?: Maybe<CompanyAgreementsMutationResponse>;
  /** update single row of the table: "company_agreements" */
  update_company_agreements_by_pk?: Maybe<CompanyAgreements>;
  /** update data of the table: "company_bank_accounts" */
  update_company_bank_accounts?: Maybe<CompanyBankAccountsMutationResponse>;
  /** update single row of the table: "company_bank_accounts" */
  update_company_bank_accounts_by_pk?: Maybe<CompanyBankAccounts>;
  /** update data of the table: "company_licenses" */
  update_company_licenses?: Maybe<CompanyLicensesMutationResponse>;
  /** update single row of the table: "company_licenses" */
  update_company_licenses_by_pk?: Maybe<CompanyLicenses>;
  /** update data of the table: "company_vendor_partnerships" */
  update_company_vendor_partnerships?: Maybe<CompanyVendorPartnershipsMutationResponse>;
  /** update single row of the table: "company_vendor_partnerships" */
  update_company_vendor_partnerships_by_pk?: Maybe<CompanyVendorPartnerships>;
  /** update data of the table: "loans" */
  update_loans?: Maybe<LoansMutationResponse>;
  /** update single row of the table: "loans" */
  update_loans_by_pk?: Maybe<Loans>;
  /** update data of the table: "purchase_order_line_items" */
  update_purchase_order_line_items?: Maybe<PurchaseOrderLineItemsMutationResponse>;
  /** update single row of the table: "purchase_order_line_items" */
  update_purchase_order_line_items_by_pk?: Maybe<PurchaseOrderLineItems>;
  /** update data of the table: "purchase_orders" */
  update_purchase_orders?: Maybe<PurchaseOrdersMutationResponse>;
  /** update single row of the table: "purchase_orders" */
  update_purchase_orders_by_pk?: Maybe<PurchaseOrders>;
  /** update data of the table: "users" */
  update_users?: Maybe<UsersMutationResponse>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
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
export type MutationRootDeleteCompanyBankAccountsArgs = {
  where: CompanyBankAccountsBoolExp;
};


/** mutation root */
export type MutationRootDeleteCompanyBankAccountsByPkArgs = {
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
export type MutationRootDeleteCompanyVendorPartnershipsArgs = {
  where: CompanyVendorPartnershipsBoolExp;
};


/** mutation root */
export type MutationRootDeleteCompanyVendorPartnershipsByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeleteLoansArgs = {
  where: LoansBoolExp;
};


/** mutation root */
export type MutationRootDeleteLoansByPkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type MutationRootDeletePurchaseOrderLineItemsArgs = {
  where: PurchaseOrderLineItemsBoolExp;
};


/** mutation root */
export type MutationRootDeletePurchaseOrderLineItemsByPkArgs = {
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
export type MutationRootDeleteUsersArgs = {
  where: UsersBoolExp;
};


/** mutation root */
export type MutationRootDeleteUsersByPkArgs = {
  id: Scalars['uuid'];
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
export type MutationRootInsertCompanyBankAccountsArgs = {
  objects: Array<CompanyBankAccountsInsertInput>;
  on_conflict?: Maybe<CompanyBankAccountsOnConflict>;
};


/** mutation root */
export type MutationRootInsertCompanyBankAccountsOneArgs = {
  object: CompanyBankAccountsInsertInput;
  on_conflict?: Maybe<CompanyBankAccountsOnConflict>;
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
export type MutationRootInsertPurchaseOrderLineItemsArgs = {
  objects: Array<PurchaseOrderLineItemsInsertInput>;
  on_conflict?: Maybe<PurchaseOrderLineItemsOnConflict>;
};


/** mutation root */
export type MutationRootInsertPurchaseOrderLineItemsOneArgs = {
  object: PurchaseOrderLineItemsInsertInput;
  on_conflict?: Maybe<PurchaseOrderLineItemsOnConflict>;
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
export type MutationRootUpdateCompanyBankAccountsArgs = {
  _set?: Maybe<CompanyBankAccountsSetInput>;
  where: CompanyBankAccountsBoolExp;
};


/** mutation root */
export type MutationRootUpdateCompanyBankAccountsByPkArgs = {
  _set?: Maybe<CompanyBankAccountsSetInput>;
  pk_columns: CompanyBankAccountsPkColumnsInput;
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
export type MutationRootUpdateLoansArgs = {
  _set?: Maybe<LoansSetInput>;
  where: LoansBoolExp;
};


/** mutation root */
export type MutationRootUpdateLoansByPkArgs = {
  _set?: Maybe<LoansSetInput>;
  pk_columns: LoansPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderLineItemsArgs = {
  _inc?: Maybe<PurchaseOrderLineItemsIncInput>;
  _set?: Maybe<PurchaseOrderLineItemsSetInput>;
  where: PurchaseOrderLineItemsBoolExp;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrderLineItemsByPkArgs = {
  _inc?: Maybe<PurchaseOrderLineItemsIncInput>;
  _set?: Maybe<PurchaseOrderLineItemsSetInput>;
  pk_columns: PurchaseOrderLineItemsPkColumnsInput;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrdersArgs = {
  _set?: Maybe<PurchaseOrdersSetInput>;
  where: PurchaseOrdersBoolExp;
};


/** mutation root */
export type MutationRootUpdatePurchaseOrdersByPkArgs = {
  _set?: Maybe<PurchaseOrdersSetInput>;
  pk_columns: PurchaseOrdersPkColumnsInput;
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

/** columns and relationships of "purchase_order_line_items" */
export type PurchaseOrderLineItems = {
  created_at: Scalars['timestamptz'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['uuid'];
  item: Scalars['String'];
  num_units: Scalars['Int'];
  price_per_unit: Scalars['Int'];
  purchase_order_id: Scalars['uuid'];
  unit: Scalars['String'];
  updated_at: Scalars['timestamptz'];
};

/** aggregated selection of "purchase_order_line_items" */
export type PurchaseOrderLineItemsAggregate = {
  aggregate?: Maybe<PurchaseOrderLineItemsAggregateFields>;
  nodes: Array<PurchaseOrderLineItems>;
};

/** aggregate fields of "purchase_order_line_items" */
export type PurchaseOrderLineItemsAggregateFields = {
  avg?: Maybe<PurchaseOrderLineItemsAvgFields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<PurchaseOrderLineItemsMaxFields>;
  min?: Maybe<PurchaseOrderLineItemsMinFields>;
  stddev?: Maybe<PurchaseOrderLineItemsStddevFields>;
  stddev_pop?: Maybe<PurchaseOrderLineItemsStddevPopFields>;
  stddev_samp?: Maybe<PurchaseOrderLineItemsStddevSampFields>;
  sum?: Maybe<PurchaseOrderLineItemsSumFields>;
  var_pop?: Maybe<PurchaseOrderLineItemsVarPopFields>;
  var_samp?: Maybe<PurchaseOrderLineItemsVarSampFields>;
  variance?: Maybe<PurchaseOrderLineItemsVarianceFields>;
};


/** aggregate fields of "purchase_order_line_items" */
export type PurchaseOrderLineItemsAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrderLineItemsSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsAggregateOrderBy = {
  avg?: Maybe<PurchaseOrderLineItemsAvgOrderBy>;
  count?: Maybe<OrderBy>;
  max?: Maybe<PurchaseOrderLineItemsMaxOrderBy>;
  min?: Maybe<PurchaseOrderLineItemsMinOrderBy>;
  stddev?: Maybe<PurchaseOrderLineItemsStddevOrderBy>;
  stddev_pop?: Maybe<PurchaseOrderLineItemsStddevPopOrderBy>;
  stddev_samp?: Maybe<PurchaseOrderLineItemsStddevSampOrderBy>;
  sum?: Maybe<PurchaseOrderLineItemsSumOrderBy>;
  var_pop?: Maybe<PurchaseOrderLineItemsVarPopOrderBy>;
  var_samp?: Maybe<PurchaseOrderLineItemsVarSampOrderBy>;
  variance?: Maybe<PurchaseOrderLineItemsVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "purchase_order_line_items" */
export type PurchaseOrderLineItemsArrRelInsertInput = {
  data: Array<PurchaseOrderLineItemsInsertInput>;
  on_conflict?: Maybe<PurchaseOrderLineItemsOnConflict>;
};

/** aggregate avg on columns */
export type PurchaseOrderLineItemsAvgFields = {
  num_units?: Maybe<Scalars['Float']>;
  price_per_unit?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsAvgOrderBy = {
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "purchase_order_line_items". All fields are combined with a logical 'AND'. */
export type PurchaseOrderLineItemsBoolExp = {
  _and?: Maybe<Array<Maybe<PurchaseOrderLineItemsBoolExp>>>;
  _not?: Maybe<PurchaseOrderLineItemsBoolExp>;
  _or?: Maybe<Array<Maybe<PurchaseOrderLineItemsBoolExp>>>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  description?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  item?: Maybe<StringComparisonExp>;
  num_units?: Maybe<IntComparisonExp>;
  price_per_unit?: Maybe<IntComparisonExp>;
  purchase_order_id?: Maybe<UuidComparisonExp>;
  unit?: Maybe<StringComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
};

/** unique or primary key constraints on table "purchase_order_line_items" */
export enum PurchaseOrderLineItemsConstraint {
  /** unique or primary key constraint */
  PurchaseOrderLineItemsPkey = 'purchase_order_line_items_pkey'
}

/** input type for incrementing integer column in table "purchase_order_line_items" */
export type PurchaseOrderLineItemsIncInput = {
  num_units?: Maybe<Scalars['Int']>;
  price_per_unit?: Maybe<Scalars['Int']>;
};

/** input type for inserting data into table "purchase_order_line_items" */
export type PurchaseOrderLineItemsInsertInput = {
  created_at?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  item?: Maybe<Scalars['String']>;
  num_units?: Maybe<Scalars['Int']>;
  price_per_unit?: Maybe<Scalars['Int']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
  unit?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type PurchaseOrderLineItemsMaxFields = {
  created_at?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  item?: Maybe<Scalars['String']>;
  num_units?: Maybe<Scalars['Int']>;
  price_per_unit?: Maybe<Scalars['Int']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
  unit?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** order by max() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsMaxOrderBy = {
  created_at?: Maybe<OrderBy>;
  description?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  item?: Maybe<OrderBy>;
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
  unit?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrderLineItemsMinFields = {
  created_at?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  item?: Maybe<Scalars['String']>;
  num_units?: Maybe<Scalars['Int']>;
  price_per_unit?: Maybe<Scalars['Int']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
  unit?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** order by min() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsMinOrderBy = {
  created_at?: Maybe<OrderBy>;
  description?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  item?: Maybe<OrderBy>;
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
  unit?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** response of any mutation on the table "purchase_order_line_items" */
export type PurchaseOrderLineItemsMutationResponse = {
  /** number of affected rows by the mutation */
  affected_rows: Scalars['Int'];
  /** data of the affected rows by the mutation */
  returning: Array<PurchaseOrderLineItems>;
};

/** input type for inserting object relation for remote table "purchase_order_line_items" */
export type PurchaseOrderLineItemsObjRelInsertInput = {
  data: PurchaseOrderLineItemsInsertInput;
  on_conflict?: Maybe<PurchaseOrderLineItemsOnConflict>;
};

/** on conflict condition type for table "purchase_order_line_items" */
export type PurchaseOrderLineItemsOnConflict = {
  constraint: PurchaseOrderLineItemsConstraint;
  update_columns: Array<PurchaseOrderLineItemsUpdateColumn>;
  where?: Maybe<PurchaseOrderLineItemsBoolExp>;
};

/** ordering options when selecting data from "purchase_order_line_items" */
export type PurchaseOrderLineItemsOrderBy = {
  created_at?: Maybe<OrderBy>;
  description?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  item?: Maybe<OrderBy>;
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
  purchase_order_id?: Maybe<OrderBy>;
  unit?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
};

/** primary key columns input for table: "purchase_order_line_items" */
export type PurchaseOrderLineItemsPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "purchase_order_line_items" */
export enum PurchaseOrderLineItemsSelectColumn {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Item = 'item',
  /** column name */
  NumUnits = 'num_units',
  /** column name */
  PricePerUnit = 'price_per_unit',
  /** column name */
  PurchaseOrderId = 'purchase_order_id',
  /** column name */
  Unit = 'unit',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "purchase_order_line_items" */
export type PurchaseOrderLineItemsSetInput = {
  created_at?: Maybe<Scalars['timestamptz']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  item?: Maybe<Scalars['String']>;
  num_units?: Maybe<Scalars['Int']>;
  price_per_unit?: Maybe<Scalars['Int']>;
  purchase_order_id?: Maybe<Scalars['uuid']>;
  unit?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate stddev on columns */
export type PurchaseOrderLineItemsStddevFields = {
  num_units?: Maybe<Scalars['Float']>;
  price_per_unit?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsStddevOrderBy = {
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
};

/** aggregate stddev_pop on columns */
export type PurchaseOrderLineItemsStddevPopFields = {
  num_units?: Maybe<Scalars['Float']>;
  price_per_unit?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsStddevPopOrderBy = {
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
};

/** aggregate stddev_samp on columns */
export type PurchaseOrderLineItemsStddevSampFields = {
  num_units?: Maybe<Scalars['Float']>;
  price_per_unit?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsStddevSampOrderBy = {
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
};

/** aggregate sum on columns */
export type PurchaseOrderLineItemsSumFields = {
  num_units?: Maybe<Scalars['Int']>;
  price_per_unit?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsSumOrderBy = {
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
};

/** update columns of table "purchase_order_line_items" */
export enum PurchaseOrderLineItemsUpdateColumn {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Item = 'item',
  /** column name */
  NumUnits = 'num_units',
  /** column name */
  PricePerUnit = 'price_per_unit',
  /** column name */
  PurchaseOrderId = 'purchase_order_id',
  /** column name */
  Unit = 'unit',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** aggregate var_pop on columns */
export type PurchaseOrderLineItemsVarPopFields = {
  num_units?: Maybe<Scalars['Float']>;
  price_per_unit?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsVarPopOrderBy = {
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
};

/** aggregate var_samp on columns */
export type PurchaseOrderLineItemsVarSampFields = {
  num_units?: Maybe<Scalars['Float']>;
  price_per_unit?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsVarSampOrderBy = {
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
};

/** aggregate variance on columns */
export type PurchaseOrderLineItemsVarianceFields = {
  num_units?: Maybe<Scalars['Float']>;
  price_per_unit?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "purchase_order_line_items" */
export type PurchaseOrderLineItemsVarianceOrderBy = {
  num_units?: Maybe<OrderBy>;
  price_per_unit?: Maybe<OrderBy>;
};

/** columns and relationships of "purchase_orders" */
export type PurchaseOrders = {
  created_at: Scalars['timestamptz'];
  currency: Scalars['String'];
  delivery_date: Scalars['date'];
  id: Scalars['uuid'];
  updated_at: Scalars['timestamptz'];
  vendor_id: Scalars['uuid'];
};

/** aggregated selection of "purchase_orders" */
export type PurchaseOrdersAggregate = {
  aggregate?: Maybe<PurchaseOrdersAggregateFields>;
  nodes: Array<PurchaseOrders>;
};

/** aggregate fields of "purchase_orders" */
export type PurchaseOrdersAggregateFields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<PurchaseOrdersMaxFields>;
  min?: Maybe<PurchaseOrdersMinFields>;
};


/** aggregate fields of "purchase_orders" */
export type PurchaseOrdersAggregateFieldsCountArgs = {
  columns?: Maybe<Array<PurchaseOrdersSelectColumn>>;
  distinct?: Maybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "purchase_orders" */
export type PurchaseOrdersAggregateOrderBy = {
  count?: Maybe<OrderBy>;
  max?: Maybe<PurchaseOrdersMaxOrderBy>;
  min?: Maybe<PurchaseOrdersMinOrderBy>;
};

/** input type for inserting array relation for remote table "purchase_orders" */
export type PurchaseOrdersArrRelInsertInput = {
  data: Array<PurchaseOrdersInsertInput>;
  on_conflict?: Maybe<PurchaseOrdersOnConflict>;
};

/** Boolean expression to filter rows from the table "purchase_orders". All fields are combined with a logical 'AND'. */
export type PurchaseOrdersBoolExp = {
  _and?: Maybe<Array<Maybe<PurchaseOrdersBoolExp>>>;
  _not?: Maybe<PurchaseOrdersBoolExp>;
  _or?: Maybe<Array<Maybe<PurchaseOrdersBoolExp>>>;
  created_at?: Maybe<TimestamptzComparisonExp>;
  currency?: Maybe<StringComparisonExp>;
  delivery_date?: Maybe<DateComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  updated_at?: Maybe<TimestamptzComparisonExp>;
  vendor_id?: Maybe<UuidComparisonExp>;
};

/** unique or primary key constraints on table "purchase_orders" */
export enum PurchaseOrdersConstraint {
  /** unique or primary key constraint */
  PurchaseOrdersPkey = 'purchase_orders_pkey'
}

/** input type for inserting data into table "purchase_orders" */
export type PurchaseOrdersInsertInput = {
  created_at?: Maybe<Scalars['timestamptz']>;
  currency?: Maybe<Scalars['String']>;
  delivery_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_id?: Maybe<Scalars['uuid']>;
};

/** aggregate max on columns */
export type PurchaseOrdersMaxFields = {
  created_at?: Maybe<Scalars['timestamptz']>;
  currency?: Maybe<Scalars['String']>;
  delivery_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_id?: Maybe<Scalars['uuid']>;
};

/** order by max() on columns of table "purchase_orders" */
export type PurchaseOrdersMaxOrderBy = {
  created_at?: Maybe<OrderBy>;
  currency?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor_id?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type PurchaseOrdersMinFields = {
  created_at?: Maybe<Scalars['timestamptz']>;
  currency?: Maybe<Scalars['String']>;
  delivery_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_id?: Maybe<Scalars['uuid']>;
};

/** order by min() on columns of table "purchase_orders" */
export type PurchaseOrdersMinOrderBy = {
  created_at?: Maybe<OrderBy>;
  currency?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
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
  created_at?: Maybe<OrderBy>;
  currency?: Maybe<OrderBy>;
  delivery_date?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  updated_at?: Maybe<OrderBy>;
  vendor_id?: Maybe<OrderBy>;
};

/** primary key columns input for table: "purchase_orders" */
export type PurchaseOrdersPkColumnsInput = {
  id: Scalars['uuid'];
};

/** select columns of table "purchase_orders" */
export enum PurchaseOrdersSelectColumn {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Currency = 'currency',
  /** column name */
  DeliveryDate = 'delivery_date',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VendorId = 'vendor_id'
}

/** input type for updating data in table "purchase_orders" */
export type PurchaseOrdersSetInput = {
  created_at?: Maybe<Scalars['timestamptz']>;
  currency?: Maybe<Scalars['String']>;
  delivery_date?: Maybe<Scalars['date']>;
  id?: Maybe<Scalars['uuid']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
  vendor_id?: Maybe<Scalars['uuid']>;
};

/** update columns of table "purchase_orders" */
export enum PurchaseOrdersUpdateColumn {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Currency = 'currency',
  /** column name */
  DeliveryDate = 'delivery_date',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VendorId = 'vendor_id'
}

/** query root */
export type QueryRoot = {
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
  /** fetch data from the table: "company_bank_accounts" */
  company_bank_accounts: Array<CompanyBankAccounts>;
  /** fetch aggregated fields from the table: "company_bank_accounts" */
  company_bank_accounts_aggregate: CompanyBankAccountsAggregate;
  /** fetch data from the table: "company_bank_accounts" using primary key columns */
  company_bank_accounts_by_pk?: Maybe<CompanyBankAccounts>;
  /** fetch data from the table: "company_licenses" */
  company_licenses: Array<CompanyLicenses>;
  /** fetch aggregated fields from the table: "company_licenses" */
  company_licenses_aggregate: CompanyLicensesAggregate;
  /** fetch data from the table: "company_licenses" using primary key columns */
  company_licenses_by_pk?: Maybe<CompanyLicenses>;
  /** fetch data from the table: "company_vendor_partnerships" */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** fetch aggregated fields from the table: "company_vendor_partnerships" */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  /** fetch data from the table: "company_vendor_partnerships" using primary key columns */
  company_vendor_partnerships_by_pk?: Maybe<CompanyVendorPartnerships>;
  /** fetch data from the table: "loans" */
  loans: Array<Loans>;
  /** fetch aggregated fields from the table: "loans" */
  loans_aggregate: LoansAggregate;
  /** fetch data from the table: "loans" using primary key columns */
  loans_by_pk?: Maybe<Loans>;
  /** fetch data from the table: "purchase_order_line_items" */
  purchase_order_line_items: Array<PurchaseOrderLineItems>;
  /** fetch aggregated fields from the table: "purchase_order_line_items" */
  purchase_order_line_items_aggregate: PurchaseOrderLineItemsAggregate;
  /** fetch data from the table: "purchase_order_line_items" using primary key columns */
  purchase_order_line_items_by_pk?: Maybe<PurchaseOrderLineItems>;
  /** fetch data from the table: "purchase_orders" */
  purchase_orders: Array<PurchaseOrders>;
  /** fetch aggregated fields from the table: "purchase_orders" */
  purchase_orders_aggregate: PurchaseOrdersAggregate;
  /** fetch data from the table: "purchase_orders" using primary key columns */
  purchase_orders_by_pk?: Maybe<PurchaseOrders>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: UsersAggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
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
export type QueryRootCompanyBankAccountsArgs = {
  distinct_on?: Maybe<Array<CompanyBankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyBankAccountsOrderBy>>;
  where?: Maybe<CompanyBankAccountsBoolExp>;
};


/** query root */
export type QueryRootCompanyBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyBankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyBankAccountsOrderBy>>;
  where?: Maybe<CompanyBankAccountsBoolExp>;
};


/** query root */
export type QueryRootCompanyBankAccountsByPkArgs = {
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
export type QueryRootLoansArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};


/** query root */
export type QueryRootLoansAggregateArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};


/** query root */
export type QueryRootLoansByPkArgs = {
  id: Scalars['uuid'];
};


/** query root */
export type QueryRootPurchaseOrderLineItemsArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLineItemsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLineItemsOrderBy>>;
  where?: Maybe<PurchaseOrderLineItemsBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderLineItemsAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLineItemsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLineItemsOrderBy>>;
  where?: Maybe<PurchaseOrderLineItemsBoolExp>;
};


/** query root */
export type QueryRootPurchaseOrderLineItemsByPkArgs = {
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

/** subscription root */
export type SubscriptionRoot = {
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
  /** fetch data from the table: "company_bank_accounts" */
  company_bank_accounts: Array<CompanyBankAccounts>;
  /** fetch aggregated fields from the table: "company_bank_accounts" */
  company_bank_accounts_aggregate: CompanyBankAccountsAggregate;
  /** fetch data from the table: "company_bank_accounts" using primary key columns */
  company_bank_accounts_by_pk?: Maybe<CompanyBankAccounts>;
  /** fetch data from the table: "company_licenses" */
  company_licenses: Array<CompanyLicenses>;
  /** fetch aggregated fields from the table: "company_licenses" */
  company_licenses_aggregate: CompanyLicensesAggregate;
  /** fetch data from the table: "company_licenses" using primary key columns */
  company_licenses_by_pk?: Maybe<CompanyLicenses>;
  /** fetch data from the table: "company_vendor_partnerships" */
  company_vendor_partnerships: Array<CompanyVendorPartnerships>;
  /** fetch aggregated fields from the table: "company_vendor_partnerships" */
  company_vendor_partnerships_aggregate: CompanyVendorPartnershipsAggregate;
  /** fetch data from the table: "company_vendor_partnerships" using primary key columns */
  company_vendor_partnerships_by_pk?: Maybe<CompanyVendorPartnerships>;
  /** fetch data from the table: "loans" */
  loans: Array<Loans>;
  /** fetch aggregated fields from the table: "loans" */
  loans_aggregate: LoansAggregate;
  /** fetch data from the table: "loans" using primary key columns */
  loans_by_pk?: Maybe<Loans>;
  /** fetch data from the table: "purchase_order_line_items" */
  purchase_order_line_items: Array<PurchaseOrderLineItems>;
  /** fetch aggregated fields from the table: "purchase_order_line_items" */
  purchase_order_line_items_aggregate: PurchaseOrderLineItemsAggregate;
  /** fetch data from the table: "purchase_order_line_items" using primary key columns */
  purchase_order_line_items_by_pk?: Maybe<PurchaseOrderLineItems>;
  /** fetch data from the table: "purchase_orders" */
  purchase_orders: Array<PurchaseOrders>;
  /** fetch aggregated fields from the table: "purchase_orders" */
  purchase_orders_aggregate: PurchaseOrdersAggregate;
  /** fetch data from the table: "purchase_orders" using primary key columns */
  purchase_orders_by_pk?: Maybe<PurchaseOrders>;
  /** fetch data from the table: "users" */
  users: Array<Users>;
  /** fetch aggregated fields from the table: "users" */
  users_aggregate: UsersAggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
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
export type SubscriptionRootCompanyBankAccountsArgs = {
  distinct_on?: Maybe<Array<CompanyBankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyBankAccountsOrderBy>>;
  where?: Maybe<CompanyBankAccountsBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanyBankAccountsAggregateArgs = {
  distinct_on?: Maybe<Array<CompanyBankAccountsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<CompanyBankAccountsOrderBy>>;
  where?: Maybe<CompanyBankAccountsBoolExp>;
};


/** subscription root */
export type SubscriptionRootCompanyBankAccountsByPkArgs = {
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
export type SubscriptionRootLoansArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};


/** subscription root */
export type SubscriptionRootLoansAggregateArgs = {
  distinct_on?: Maybe<Array<LoansSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<LoansOrderBy>>;
  where?: Maybe<LoansBoolExp>;
};


/** subscription root */
export type SubscriptionRootLoansByPkArgs = {
  id: Scalars['uuid'];
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLineItemsArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLineItemsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLineItemsOrderBy>>;
  where?: Maybe<PurchaseOrderLineItemsBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLineItemsAggregateArgs = {
  distinct_on?: Maybe<Array<PurchaseOrderLineItemsSelectColumn>>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  order_by?: Maybe<Array<PurchaseOrderLineItemsOrderBy>>;
  where?: Maybe<PurchaseOrderLineItemsBoolExp>;
};


/** subscription root */
export type SubscriptionRootPurchaseOrderLineItemsByPkArgs = {
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

/** columns and relationships of "users" */
export type Users = {
  company_id?: Maybe<Scalars['uuid']>;
  email: Scalars['String'];
  first_name: Scalars['String'];
  full_name: Scalars['String'];
  id: Scalars['uuid'];
  last_name: Scalars['String'];
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
  company_id?: Maybe<UuidComparisonExp>;
  email?: Maybe<StringComparisonExp>;
  first_name?: Maybe<StringComparisonExp>;
  full_name?: Maybe<StringComparisonExp>;
  id?: Maybe<UuidComparisonExp>;
  last_name?: Maybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "users" */
export enum UsersConstraint {
  /** unique or primary key constraint */
  UsersPkey = 'users_pkey'
}

/** input type for inserting data into table "users" */
export type UsersInsertInput = {
  company_id?: Maybe<Scalars['uuid']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_name?: Maybe<Scalars['String']>;
};

/** aggregate max on columns */
export type UsersMaxFields = {
  company_id?: Maybe<Scalars['uuid']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_name?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "users" */
export type UsersMaxOrderBy = {
  company_id?: Maybe<OrderBy>;
  email?: Maybe<OrderBy>;
  first_name?: Maybe<OrderBy>;
  full_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  last_name?: Maybe<OrderBy>;
};

/** aggregate min on columns */
export type UsersMinFields = {
  company_id?: Maybe<Scalars['uuid']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_name?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "users" */
export type UsersMinOrderBy = {
  company_id?: Maybe<OrderBy>;
  email?: Maybe<OrderBy>;
  first_name?: Maybe<OrderBy>;
  full_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  last_name?: Maybe<OrderBy>;
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
  company_id?: Maybe<OrderBy>;
  email?: Maybe<OrderBy>;
  first_name?: Maybe<OrderBy>;
  full_name?: Maybe<OrderBy>;
  id?: Maybe<OrderBy>;
  last_name?: Maybe<OrderBy>;
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
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  FullName = 'full_name',
  /** column name */
  Id = 'id',
  /** column name */
  LastName = 'last_name'
}

/** input type for updating data in table "users" */
export type UsersSetInput = {
  company_id?: Maybe<Scalars['uuid']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  full_name?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['uuid']>;
  last_name?: Maybe<Scalars['String']>;
};

/** update columns of table "users" */
export enum UsersUpdateColumn {
  /** column name */
  CompanyId = 'company_id',
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  FullName = 'full_name',
  /** column name */
  Id = 'id',
  /** column name */
  LastName = 'last_name'
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

export type CompaniesQueryVariables = Exact<{ [key: string]: never; }>;


export type CompaniesQuery = { companies: Array<Pick<Companies, 'id' | 'name'>> };

export type BankVendorPartnershipFragment = (
  Pick<CompanyVendorPartnerships, 'id' | 'company_id' | 'vendor_id' | 'vendor_agreement_id' | 'vendor_license_id'>
  & { vendor_bank_account?: Maybe<BankAccountFragment>, vendor: Pick<Companies, 'id' | 'name' | 'address' | 'country' | 'state' | 'city' | 'zip_code' | 'phone_number'> }
);

export type BankAccountFragment = Pick<CompanyBankAccounts, 'id' | 'company_id' | 'name' | 'account_name' | 'account_number' | 'routing_number' | 'notes' | 'verified_at'>;

export type BankListVendorPartnershipsQueryVariables = Exact<{ [key: string]: never; }>;


export type BankListVendorPartnershipsQuery = { company_vendor_partnerships: Array<BankVendorPartnershipFragment> };

export type BankUpdateVendorPartnershipMutationVariables = Exact<{
  vendor: CompanyVendorPartnershipsInsertInput;
}>;


export type BankUpdateVendorPartnershipMutation = { insert_company_vendor_partnerships_one?: Maybe<BankVendorPartnershipFragment> };

export type BankVendorPartnershipQueryVariables = Exact<{
  id: Scalars['uuid'];
}>;


export type BankVendorPartnershipQuery = { company_vendor_partnerships_by_pk?: Maybe<BankVendorPartnershipFragment> };

export type CompanyBankAccountsQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type CompanyBankAccountsQuery = { company_bank_accounts: Array<BankAccountFragment> };

export type AddBankAccountMutationVariables = Exact<{
  bankAccount: CompanyBankAccountsInsertInput;
}>;


export type AddBankAccountMutation = { insert_company_bank_accounts_one?: Maybe<BankAccountFragment> };

export type UpdateBankAccountMutationVariables = Exact<{
  id: Scalars['uuid'];
  bankAccount?: Maybe<CompanyBankAccountsSetInput>;
}>;


export type UpdateBankAccountMutation = { update_company_bank_accounts_by_pk?: Maybe<BankAccountFragment> };

export type ChangeBankAccountMutationVariables = Exact<{
  companyVendorPartnershipId: Scalars['uuid'];
  bankAccountId: Scalars['uuid'];
}>;


export type ChangeBankAccountMutation = { update_company_vendor_partnerships_by_pk?: Maybe<(
    Pick<CompanyVendorPartnerships, 'id'>
    & { vendor_bank_account?: Maybe<BankAccountFragment> }
  )> };

export type UpdateVendorContactInfoMutationVariables = Exact<{
  id: Scalars['uuid'];
  company: CompaniesSetInput;
}>;


export type UpdateVendorContactInfoMutation = { update_companies_by_pk?: Maybe<VendorFragment> };

export type VendorFragment = Pick<Companies, 'id' | 'name' | 'address' | 'country' | 'state' | 'city' | 'zip_code' | 'phone_number'>;

export type VendorPartnershipFragment = (
  Pick<CompanyVendorPartnerships, 'id' | 'company_id' | 'vendor_id' | 'vendor_agreement_id' | 'vendor_license_id'>
  & { vendor_bank_account?: Maybe<Pick<CompanyBankAccounts, 'id' | 'verified_at'>>, vendor: VendorFragment }
);

export type AddVendorPartnershipMutationVariables = Exact<{
  vendor: CompanyVendorPartnershipsInsertInput;
}>;


export type AddVendorPartnershipMutation = { insert_company_vendor_partnerships_one?: Maybe<VendorPartnershipFragment> };

export type ListVendorPartnershipsQueryVariables = Exact<{
  companyId: Scalars['uuid'];
}>;


export type ListVendorPartnershipsQuery = { company_vendor_partnerships: Array<VendorPartnershipFragment> };

export const BankAccountFragmentDoc = gql`
    fragment BankAccount on company_bank_accounts {
  id
  company_id
  name
  account_name
  account_number
  routing_number
  notes
  verified_at
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
  vendor {
    id
    name
    address
    country
    state
    city
    zip_code
    phone_number
  }
}
    ${BankAccountFragmentDoc}`;
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
export const VendorPartnershipFragmentDoc = gql`
    fragment VendorPartnership on company_vendor_partnerships {
  id
  company_id
  vendor_id
  vendor_agreement_id
  vendor_bank_account {
    id
    verified_at
  }
  vendor_license_id
  vendor {
    ...Vendor
  }
}
    ${VendorFragmentDoc}`;
export const CompaniesDocument = gql`
    query Companies {
  companies(limit: 1) {
    id
    name
  }
}
    `;

/**
 * __useCompaniesQuery__
 *
 * To run a query within a React component, call `useCompaniesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCompaniesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCompaniesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCompaniesQuery(baseOptions?: Apollo.QueryHookOptions<CompaniesQuery, CompaniesQueryVariables>) {
        return Apollo.useQuery<CompaniesQuery, CompaniesQueryVariables>(CompaniesDocument, baseOptions);
      }
export function useCompaniesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CompaniesQuery, CompaniesQueryVariables>) {
          return Apollo.useLazyQuery<CompaniesQuery, CompaniesQueryVariables>(CompaniesDocument, baseOptions);
        }
export type CompaniesQueryHookResult = ReturnType<typeof useCompaniesQuery>;
export type CompaniesLazyQueryHookResult = ReturnType<typeof useCompaniesLazyQuery>;
export type CompaniesQueryResult = Apollo.QueryResult<CompaniesQuery, CompaniesQueryVariables>;
export const BankListVendorPartnershipsDocument = gql`
    query BankListVendorPartnerships {
  company_vendor_partnerships {
    ...BankVendorPartnership
  }
}
    ${BankVendorPartnershipFragmentDoc}`;

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
export const BankUpdateVendorPartnershipDocument = gql`
    mutation BankUpdateVendorPartnership($vendor: company_vendor_partnerships_insert_input!) {
  insert_company_vendor_partnerships_one(object: $vendor) {
    ...BankVendorPartnership
  }
}
    ${BankVendorPartnershipFragmentDoc}`;
export type BankUpdateVendorPartnershipMutationFn = Apollo.MutationFunction<BankUpdateVendorPartnershipMutation, BankUpdateVendorPartnershipMutationVariables>;

/**
 * __useBankUpdateVendorPartnershipMutation__
 *
 * To run a mutation, you first call `useBankUpdateVendorPartnershipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBankUpdateVendorPartnershipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bankUpdateVendorPartnershipMutation, { data, loading, error }] = useBankUpdateVendorPartnershipMutation({
 *   variables: {
 *      vendor: // value for 'vendor'
 *   },
 * });
 */
export function useBankUpdateVendorPartnershipMutation(baseOptions?: Apollo.MutationHookOptions<BankUpdateVendorPartnershipMutation, BankUpdateVendorPartnershipMutationVariables>) {
        return Apollo.useMutation<BankUpdateVendorPartnershipMutation, BankUpdateVendorPartnershipMutationVariables>(BankUpdateVendorPartnershipDocument, baseOptions);
      }
export type BankUpdateVendorPartnershipMutationHookResult = ReturnType<typeof useBankUpdateVendorPartnershipMutation>;
export type BankUpdateVendorPartnershipMutationResult = Apollo.MutationResult<BankUpdateVendorPartnershipMutation>;
export type BankUpdateVendorPartnershipMutationOptions = Apollo.BaseMutationOptions<BankUpdateVendorPartnershipMutation, BankUpdateVendorPartnershipMutationVariables>;
export const BankVendorPartnershipDocument = gql`
    query BankVendorPartnership($id: uuid!) {
  company_vendor_partnerships_by_pk(id: $id) {
    ...BankVendorPartnership
  }
}
    ${BankVendorPartnershipFragmentDoc}`;

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
  company_bank_accounts(where: {company_id: {_eq: $companyId}}) {
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
    mutation AddBankAccount($bankAccount: company_bank_accounts_insert_input!) {
  insert_company_bank_accounts_one(object: $bankAccount) {
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
    mutation UpdateBankAccount($id: uuid!, $bankAccount: company_bank_accounts_set_input) {
  update_company_bank_accounts_by_pk(pk_columns: {id: $id}, _set: $bankAccount) {
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
    mutation ChangeBankAccount($companyVendorPartnershipId: uuid!, $bankAccountId: uuid!) {
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
export const UpdateVendorContactInfoDocument = gql`
    mutation UpdateVendorContactInfo($id: uuid!, $company: companies_set_input!) {
  update_companies_by_pk(pk_columns: {id: $id}, _set: $company) {
    ...Vendor
  }
}
    ${VendorFragmentDoc}`;
export type UpdateVendorContactInfoMutationFn = Apollo.MutationFunction<UpdateVendorContactInfoMutation, UpdateVendorContactInfoMutationVariables>;

/**
 * __useUpdateVendorContactInfoMutation__
 *
 * To run a mutation, you first call `useUpdateVendorContactInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVendorContactInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVendorContactInfoMutation, { data, loading, error }] = useUpdateVendorContactInfoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      company: // value for 'company'
 *   },
 * });
 */
export function useUpdateVendorContactInfoMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVendorContactInfoMutation, UpdateVendorContactInfoMutationVariables>) {
        return Apollo.useMutation<UpdateVendorContactInfoMutation, UpdateVendorContactInfoMutationVariables>(UpdateVendorContactInfoDocument, baseOptions);
      }
export type UpdateVendorContactInfoMutationHookResult = ReturnType<typeof useUpdateVendorContactInfoMutation>;
export type UpdateVendorContactInfoMutationResult = Apollo.MutationResult<UpdateVendorContactInfoMutation>;
export type UpdateVendorContactInfoMutationOptions = Apollo.BaseMutationOptions<UpdateVendorContactInfoMutation, UpdateVendorContactInfoMutationVariables>;
export const AddVendorPartnershipDocument = gql`
    mutation AddVendorPartnership($vendor: company_vendor_partnerships_insert_input!) {
  insert_company_vendor_partnerships_one(object: $vendor) {
    ...VendorPartnership
  }
}
    ${VendorPartnershipFragmentDoc}`;
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
 *      vendor: // value for 'vendor'
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
  }
}
    ${VendorPartnershipFragmentDoc}`;

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