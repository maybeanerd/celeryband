const commaDelimitedRoles = process.env.ROLES;
const roles = commaDelimitedRoles ? commaDelimitedRoles.split(',') : ['software engineer', 'product manager', 'designer'];

const commaDelimitedSeniorityLevels = process.env.SENIORITY_LEVELS;
const seniorityLevels = commaDelimitedSeniorityLevels ? commaDelimitedSeniorityLevels.split(',') : ['junior', 'professional', 'senior', 'staff', 'principal'];

const commaDelimitedDepartments = process.env.DEPARTMENTS;
const departments = commaDelimitedDepartments ? commaDelimitedDepartments.split(',') : ['all'];

const currency = process.env.CURRENCY || '€';

export const salaryRangeAttributes = {
  roles,
  seniorityLevels,
  departments,
  currency,
};
