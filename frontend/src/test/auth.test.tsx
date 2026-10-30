import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import * as useAuthHook from '../hooks/useAuth';

describe('SkillBridge ProtectedRoute Authentication Guards', () => {
  it('displays loading skeleton while session is validating', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: null,
      profile: null,
      token: null,
      loading: true,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      updateProfileState: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Student Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/Verifying SkillBridge session/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Student Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders protected child component when user has student role', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: {
        id: 'std_123',
        name: 'Aamrapali Sharma',
        email: 'student@skillbridge.edu',
        role: 'student',
      },
      profile: null,
      token: 'valid_jwt_token',
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      updateProfileState: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={['student']}>
          <div>Protected Student Dashboard Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Student Dashboard Content')).toBeInTheDocument();
  });
});
