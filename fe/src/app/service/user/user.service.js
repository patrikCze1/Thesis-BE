export const getFullName = (user) => {
  if (!user) return "";
  return `${user.lastName} ${user.firstName}`;
};

export const getShortName = (user) => {
  if (!user) return "";
  return `${user?.lastName?.charAt(0).toUpperCase()}${user?.firstName
    ?.charAt(0)
    .toUpperCase()}`;
};
