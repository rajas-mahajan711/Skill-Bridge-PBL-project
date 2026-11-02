const ROLES = Object.freeze({
  STUDENT: "Student",
  FACULTY: "Faculty/T&P",
  RECRUITER: "Recruiter/Company",
  ADMIN: "Admin"
});

const ROLE_VALUES = Object.values(ROLES);

module.exports = { ROLES, ROLE_VALUES };
