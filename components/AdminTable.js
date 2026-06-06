"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function AdminTable({ initialUsers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const uniqueTeams = [...new Set(initialUsers.map(u => u.team))].filter(Boolean);

  const filteredUsers = initialUsers.filter(u => {
    const searchMatch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        u.githubId.toLowerCase().includes(searchTerm.toLowerCase());
    const teamMatch = teamFilter ? u.team === teamFilter : true;
    
    let riskMatch = true;
    if (riskFilter === 'High Risk') riskMatch = u.isHighRisk;
    if (riskFilter === 'Low Risk') riskMatch = !u.isHighRisk;

    return searchMatch && teamMatch && riskMatch;
  });

  return (
    <div>
      {/* Filter Section */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Search Developer</label>
          <input 
            type="text" 
            placeholder="Search by name or GitHub ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Filter by Team</label>
          <select 
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
          >
            <option value="">All Teams</option>
            {uniqueTeams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Filter by Risk Status</label>
          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
          >
            <option value="">All Statuses</option>
            <option value="Low Risk">Low Risk (Score &gt;= 50)</option>
            <option value="High Risk">High Risk (Score &lt; 50)</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
        Showing {filteredUsers.length} of {initialUsers.length} users
      </div>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>DEVELOPER</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>TEAM / ORG</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>OVERALL SCORE</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>COPILOT (40%)</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>ACTIVITY (40%)</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>RISK STATUS</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No users match your filters.</td>
              </tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.githubId}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ color: '#0f172a' }}>{u.team}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.githubOrg}</div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ 
                    backgroundColor: u.isHighRisk ? '#fef2f2' : '#f0fdf4', 
                    color: u.isHighRisk ? '#991b1b' : '#166534', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontWeight: 700 
                  }}>
                    {u.scores.overallScore} / 100
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{u.scores.copilotAdoptionScore}</td>
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>{u.scores.githubActivityScore}</td>
                <td style={{ padding: '1rem' }}>
                  {u.isHighRisk ? (
                    <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>⚠ High Risk</span>
                  ) : (
                    <span style={{ color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>✓ Low Risk</span>
                  )}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link href={`/?user=${u.githubId}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                    View Scorecard →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
