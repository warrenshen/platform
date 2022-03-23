import { ContactFragment } from "generated/graphql";

export const consolidateUsers = (
  companyUsers: ContactFragment[],
  parentCompanyUsers: ContactFragment[]
) => {
  return companyUsers.concat(
    parentCompanyUsers.filter((x) => companyUsers.every((y) => y.id !== x.id))
  );
};
