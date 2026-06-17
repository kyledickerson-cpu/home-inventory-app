import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { downloadCsv } from './export';
import { isSupabaseConfigured, supabase } from './supabase';
import type {
  HouseholdMembership,
  InventoryFormValues,
  InventoryItem,
  InventoryItemInsert,
  InventoryItemUpdate
} from './types';

const blankForm: InventoryFormValues = {
  item_name: '',
  category: '',
  description: '',
  quantity: 1,
  unit: '',
  location: '',
  supplier_name: '',
  supplier_contact: '',
  supplier_website: '',
  purchase_date: '',
  cost: null,
  notes: ''
};

function normalizeUrl(url: string | null) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function asNumber(value: FormDataEntryValue | null, fallback: number | null) {
  if (value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function AuthPanel() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const action =
      mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { error } = await action;
    setLoading(false);
    setMessage(
      error
        ? error.message
        : mode === 'signup'
          ? 'Account created. Ask the household owner to approve this user in Supabase.'
          : ''
    );
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Shared household</p>
          <h1>Inventory</h1>
        </div>
        {!isSupabaseConfigured && (
          <p className="notice">Add Supabase environment variables before signing in.</p>
        )}
        <form onSubmit={submit} className="stack">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </label>
          <button disabled={loading || !isSupabaseConfigured}>
            {loading ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
