function getValuesFromEnvvar (input: string | undefined, fallbackValues: readonly [string, ...Array<string>]): readonly [string, ...Array<string>] {
  if (!input) {
    return fallbackValues;
  }

  const splitInput = input.split(',');
  if (splitInput.length === 0) {
    throw new Error('If you provide configuration, it needs to include at least one element.');
  }
  return splitInput as [string, ...Array<string>];
}

const commaDelimitedRoles = process.env.ROLES;
const fallbackRoles = ['software engineer', 'product manager', 'designer'] as const;
const roles = getValuesFromEnvvar(commaDelimitedRoles, fallbackRoles);

const commaDelimitedSeniorityLevels = process.env.SENIORITY_LEVELS;
const fallbackSeniorityLevels = ['junior', 'professional', 'senior', 'staff', 'principal'] as const;
const seniorityLevels = getValuesFromEnvvar(commaDelimitedSeniorityLevels, fallbackSeniorityLevels);

const commaDelimitedDepartments = process.env.DEPARTMENTS;
const fallbackDepartments = ['all'] as const;
const departments = getValuesFromEnvvar(commaDelimitedDepartments, fallbackDepartments);

const currency = process.env.CURRENCY || '€' as const;

const acceptedDomain = process.env.ACCEPTED_DOMAIN ?? null;

if (acceptedDomain === null) {
  throw new Error('ACCEPTED_DOMAIN is not set. This is necessary to limit signups to your company.');
}

export const serverConfiguration = {
  roles,
  seniorityLevels,
  departments,
  currency,
  acceptedDomain,

};
