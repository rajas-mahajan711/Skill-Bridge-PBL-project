/**
 * User Model & In-Memory / Mongoose Abstraction
 * Enforces role-based schema, validation, and strict data sanitization (no passwords leaked)
 */

export const UserRoles = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  RECRUITER: 'recruiter',
  ADMIN: 'admin'
};

export const UserStatuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Seed dataset for demo/development/testing
const seedUsers = [
  {
    id: 'usr_adm01',
    name: 'Dr. Neha Verma',
    email: 'neha.verma@college.edu',
    role: UserRoles.ADMIN,
    status: UserStatuses.ACTIVE,
    department: 'Administration',
    batch: null,
    consentGiven: true,
    verifiedSkillsCount: 0,
    createdAt: new Date('2026-08-15T09:00:00Z'),
    lastLogin: new Date('2026-10-24T08:15:00Z')
  },
  {
    id: 'usr_stu01',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    role: UserRoles.STUDENT,
    status: UserStatuses.ACTIVE,
    department: 'Computer Science & Engineering',
    batch: '2027',
    consentGiven: true,
    verifiedSkillsCount: 14,
    createdAt: new Date('2026-09-01T10:00:00Z'),
    lastLogin: new Date('2026-10-24T07:30:00Z')
  },
  {
    id: 'usr_stu02',
    name: 'Priya Patel',
    email: 'priya.patel@college.edu',
    role: UserRoles.STUDENT,
    status: UserStatuses.ACTIVE,
    department: 'Information Technology',
    batch: '2026',
    consentGiven: true,
    verifiedSkillsCount: 11,
    createdAt: new Date('2026-09-03T11:20:00Z'),
    lastLogin: new Date('2026-10-23T16:45:00Z')
  },
  {
    id: 'usr_fac01',
    name: 'Prof. Rajesh Kulkarni',
    email: 'rajesh.kulkarni@college.edu',
    role: UserRoles.FACULTY,
    status: UserStatuses.ACTIVE,
    department: 'Computer Science & Engineering',
    batch: null,
    consentGiven: true,
    verifiedSkillsCount: 0,
    createdAt: new Date('2026-08-20T08:00:00Z'),
    lastLogin: new Date('2026-10-24T06:10:00Z')
  },
  {
    id: 'usr_rec01',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@techcorp.in',
    role: UserRoles.RECRUITER,
    status: UserStatuses.ACTIVE,
    department: 'Talent Acquisition - TechCorp',
    batch: null,
    consentGiven: true,
    verifiedSkillsCount: 0,
    createdAt: new Date('2026-09-15T14:00:00Z'),
    lastLogin: new Date('2026-10-23T18:00:00Z')
  },
  {
    id: 'usr_stu03',
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@college.edu',
    role: UserRoles.STUDENT,
    status: UserStatuses.INACTIVE,
    department: 'Electronics & Telecommunication',
    batch: '2027',
    consentGiven: false,
    verifiedSkillsCount: 2,
    createdAt: new Date('2026-09-10T12:00:00Z'),
    lastLogin: new Date('2026-10-10T09:00:00Z')
  }
];

class UserRepository {
  constructor() {
    this.users = new Map();
    // Seed initial users
    for (const u of seedUsers) {
      this.users.set(u.id, { ...u });
    }
  }

  // Sanitizes user record: strips passwords, internal hashes, private tokens
  sanitize(user) {
    if (!user) return null;
    const { password, passwordHash, token, ...sanitized } = user;
    return sanitized;
  }

  async find(filter = {}) {
    let list = Array.from(this.users.values());

    if (filter.role) {
      list = list.filter(u => u.role === filter.role);
    }
    if (filter.status) {
      list = list.filter(u => u.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }

    return list.map(this.sanitize);
  }

  async findById(id) {
    const user = this.users.get(id);
    return user ? this.sanitize(user) : null;
  }

  async findByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user; // Return raw for auth verification
      }
    }
    return null;
  }

  async updateStatus(id, newStatus) {
    const user = this.users.get(id);
    if (!user) return null;
    user.status = newStatus;
    user.updatedAt = new Date();
    this.users.set(id, user);
    return this.sanitize(user);
  }

  async updateRole(id, newRole, department = null) {
    const user = this.users.get(id);
    if (!user) return null;
    user.role = newRole;
    if (department) user.department = department;
    user.updatedAt = new Date();
    this.users.set(id, user);
    return this.sanitize(user);
  }

  async count(filter = {}) {
    const users = await this.find(filter);
    return users.length;
  }

  async resetSeed() {
    this.users.clear();
    for (const u of seedUsers) {
      this.users.set(u.id, { ...u });
    }
  }
}

export const UserModel = new UserRepository();
