import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, ShieldAlert, 
  MoreVertical, CheckCircle2, XCircle, Edit3, Eye, UserCheck, UserX, AlertCircle 
} from 'lucide-react';
import { Card, Title, Badge, Btn, Modal, LoadingState, EmptyState, ErrorState } from '../../components/ui.jsx';
import { AdminService } from '../../services/adminService.js';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      
      const res = await AdminService.getUsers(params);
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const reason = nextStatus === 'inactive' ? 'Administrative suspension' : 'Reactivated by administrator';
    
    setActionLoading(true);
    try {
      await AdminService.updateUserStatus(user.id, nextStatus, reason);
      setFeedbackMessage({
        type: 'success',
        text: `User ${user.name} is now ${nextStatus}. Audit event logged.`
      });
      // Refresh local user list
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: `Failed to update status: ${err.message}`
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleSave = async () => {
    if (!editRoleUser || !newRole) return;
    setActionLoading(true);
    try {
      await AdminService.updateUserRole(editRoleUser.id, newRole);
      setFeedbackMessage({
        type: 'success',
        text: `Role for ${editRoleUser.name} changed to ${newRole}.`
      });
      setUsers(prev => prev.map(u => u.id === editRoleUser.id ? { ...u, role: newRole } : u));
      setEditRoleUser(null);
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: `Role update failed: ${err.message}`
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink">User Directory & Role Governance</h2>
          <p className="text-xs text-mute mt-0.5">
            Manage permissions, activate/deactivate accounts, and verify consent status across all college participants.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedbackMessage.text}
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs underline hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Card */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
            <input 
              type="text"
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <Btn type="submit" size="sm" v="primary">
              Filter
            </Btn>
          </div>
        </form>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <LoadingState message="Fetching user directory..." />
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadUsers} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No matching users found" description="Try clearing your search query or role filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-mute">
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Org</th>
                  <th className="py-3 px-4">Consent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-ink">{u.name}</div>
                      <div className="text-xs text-mute">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.role}>{u.role}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-mute font-medium">
                      {u.department || 'General'}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.consentGiven ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 size={13} /> Granted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertCircle size={13} /> Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={u.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          title="View sanitized details"
                          className="p-1.5 rounded-lg text-mute hover:text-indigo hover:bg-indigo/5 transition"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setEditRoleUser(u);
                            setNewRole(u.role);
                          }}
                          title="Change user role"
                          className="p-1.5 rounded-lg text-mute hover:text-teal hover:bg-teal/5 transition"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading}
                          title={u.status === 'active' ? 'Deactivate user' : 'Activate user'}
                          className={`p-1.5 rounded-lg transition ${
                            u.status === 'active' 
                              ? 'text-rose-500 hover:bg-rose-50' 
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Detail Modal */}
      <Modal 
        open={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        title="Sanitized User Record"
        subtitle={`ID: ${selectedUser?.id} · Verified privacy-compliant record`}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-navy text-white font-bold grid place-items-center text-lg">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-ink">{selectedUser.name}</h4>
                <p className="text-xs text-mute">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedUser.role}>{selectedUser.role}</Badge>
                  <Badge status={selectedUser.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100">
                <span className="text-mute block">Department:</span>
                <span className="font-semibold text-ink mt-0.5 block">{selectedUser.department || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <span className="text-mute block">Graduation Batch:</span>
                <span className="font-semibold text-ink mt-0.5 block">{selectedUser.batch || 'Faculty/Staff'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <span className="text-mute block">Data Consent Status:</span>
                <span className={`font-semibold mt-0.5 block ${selectedUser.consentGiven ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedUser.consentGiven ? 'Consent Signed (Opt-in)' : 'Not Consented'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100">
                <span className="text-mute block">Verified Skill Claims:</span>
                <span className="font-semibold text-ink mt-0.5 block">{selectedUser.verifiedSkillsCount || 0} skills</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800">
              <strong>Security Guarantee:</strong> Passwords, password hashes, and external session tokens are excluded from this API response in accordance with the Person 5 security specification.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Btn 
                size="sm" 
                v={selectedUser.status === 'active' ? 'danger' : 'teal'}
                onClick={() => handleToggleStatus(selectedUser)}
              >
                {selectedUser.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
              </Btn>
              <Btn size="sm" v="secondary" onClick={() => setSelectedUser(null)}>
                Close
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        open={!!editRoleUser}
        onClose={() => setEditRoleUser(null)}
        title="Modify User Role"
        subtitle={`Select new administrative or functional role for ${editRoleUser?.name}`}
      >
        {editRoleUser && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-mute">
              Modifying user roles changes server-side authorization tokens and grants access to corresponding portals. All role modifications are audited.
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block mb-1.5">Select Role</label>
              <div className="grid grid-cols-2 gap-2">
                {['student', 'faculty', 'recruiter', 'admin'].map((roleKey) => (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setNewRole(roleKey)}
                    className={`p-3 rounded-xl border text-sm font-medium text-left capitalize transition ${
                      newRole === roleKey 
                        ? 'border-indigo bg-indigo/5 text-indigo ring-2 ring-indigo/20' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {roleKey}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Btn size="sm" v="secondary" onClick={() => setEditRoleUser(null)}>
                Cancel
              </Btn>
              <Btn 
                size="sm" 
                v="primary" 
                onClick={handleRoleSave}
                disabled={actionLoading || newRole === editRoleUser.role}
              >
                Save Role Change
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
