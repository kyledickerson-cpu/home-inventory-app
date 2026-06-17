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
        </form>
        <button className="link-button" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? 'Create an account' : 'I already have an account'}
        </button>
        {message && <p className="notice">{message}</p>}
      </section>
    </main>
  );
}

function ItemForm({
  item,
  onCancel,
  onSave
}: {
  item: InventoryItem | null;
  onCancel: () => void;
  onSave: (values: InventoryFormValues) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const values = item ?? blankForm;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    await onSave({
      item_name: String(data.get('item_name') || '').trim(),
      category: String(data.get('category') || '').trim(),
      description: String(data.get('description') || '').trim(),
      quantity: asNumber(data.get('quantity'), 0) ?? 0,
      unit: String(data.get('unit') || '').trim(),
      location: String(data.get('location') || '').trim(),
      supplier_name: String(data.get('supplier_name') || '').trim(),
      supplier_contact: String(data.get('supplier_contact') || '').trim(),
      supplier_website: String(data.get('supplier_website') || '').trim(),
      purchase_date: String(data.get('purchase_date') || '') || null,
      cost: asNumber(data.get('cost'), null),
      notes: String(data.get('notes') || '').trim()
    });
    setSaving(false);
  }

  return (
    <form className="editor" onSubmit={submit}>
      <div className="editor-bar">
        <h2>{item ? 'Edit item' : 'Add item'}</h2>
        <button type="button" className="secondary" onClick={onCancel}>
          Close
        </button>
      </div>
      <label>
        Item name
        <input name="item_name" defaultValue={values.item_name} required />
      </label>
      <label>
        Category
        <input name="category" defaultValue={values.category ?? ''} />
      </label>
      <label>
        Description
        <textarea name="description" defaultValue={values.description ?? ''} rows={3} />
      </label>
      <div className="two-col">
        <label>
          Quantity
          <input name="quantity" type="number" step="0.01" min="0" defaultValue={values.quantity} />
        </label>
        <label>
          Unit
          <input name="unit" defaultValue={values.unit ?? ''} />
        </label>
      </div>
      <label>
        Location
        <input name="location" defaultValue={values.location ?? ''} />
      </label>
      <label>
        Supplier name
        <input name="supplier_name" defaultValue={values.supplier_name ?? ''} />
      </label>
      <label>
        Supplier contact
        <input name="supplier_contact" defaultValue={values.supplier_contact ?? ''} />
      </label>
      <label>
        Supplier website
        <input name="supplier_website" type="text" inputMode="url" defaultValue={values.supplier_website ?? ''} />
      </label>
      <div className="two-col">
        <label>
          Purchase date
          <input name="purchase_date" type="date" defaultValue={values.purchase_date ?? ''} />
        </label>
        <label>
          Cost
          <input name="cost" type="number" step="0.01" min="0" defaultValue={values.cost ?? ''} />
        </label>
      </div>
      <label>
        Notes
        <textarea name="notes" defaultValue={values.notes ?? ''} rows={3} />
      </label>
      <button disabled={saving}>{saving ? 'Saving...' : 'Save item'}</button>
    </form>
  );
}

function InventoryCard({
  item,
  onEdit,
  onDelete
}: {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const supplierUrl = normalizeUrl(item.supplier_website);

  return (
    <article className="item-card">
      <div className="item-main">
        <div>
          <h3>{item.item_name}</h3>
          <p>{item.description || item.category || 'No description'}</p>
        </div>
        <span className="quantity">
          {Number.isInteger(item.quantity) ? item.quantity : item.quantity.toFixed(2)}
        </span>
      </div>
      <dl>
        <div>
          <dt>Category</dt>
          <dd>{item.category || '-'}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{item.location || '-'}</dd>
        </div>
        <div>
          <dt>Supplier</dt>
          <dd>{item.supplier_name || '-'}</dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>{item.cost === null ? '-' : `GBP ${item.cost.toFixed(2)}`}</dd>
        </div>
      </dl>
      {(item.supplier_contact || supplierUrl || item.notes) && (
        <div className="supplier-strip">
          {item.supplier_contact && <span>{item.supplier_contact}</span>}
          {supplierUrl && (
            <a href={supplierUrl} target="_blank" rel="noreferrer">
              Website
            </a>
          )}
          {item.notes && <span>{item.notes}</span>}
        </div>
      )}
      <div className="actions">
        <button className="secondary" onClick={onEdit}>
          Edit
        </button>
        <button className="danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<HouseholdMembership[]>([]);
  const [householdId, setHouseholdId] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const activeSession = session;
    if (!activeSession) return;

    async function loadMemberships() {
      setError('');
      if (!activeSession) {
  return;
}
      const { data, error: membershipError } = await supabase
        .from('household_members')
        .select('household_id, role, approved, households(id, name)')
        .eq('user_id', activeSession.user.id)
        .eq('approved', true)
        .returns<HouseholdMembership[]>();

      if (membershipError) {
        setError(membershipError.message);
        return;
      }

      const approved = data ?? [];
      setMemberships(approved);
      setHouseholdId((current) => current || approved[0]?.household_id || '');
    }

    loadMemberships();
  }, [session]);

  useEffect(() => {
    if (!householdId) {
      setItems([]);
      return;
    }

    async function loadItems() {
      setLoading(true);
      setError('');
      const { data, error: itemError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('household_id', householdId)
        .order('item_name', { ascending: true })
        .returns<InventoryItem[]>();

      setLoading(false);
      if (itemError) {
        setError(itemError.message);
        return;
      }
      setItems(data ?? []);
    }

    loadItems();
  }, [householdId]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [
        item.item_name,
        item.category,
        item.description,
        item.location,
        item.supplier_name,
        item.supplier_contact,
        item.notes
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [items, query]);

  async function saveItem(values: InventoryFormValues) {
    if (!householdId || !session) return;
    setError('');

    const updatePayload: InventoryItemUpdate = {
      ...values,
      household_id: householdId,
      updated_at: new Date().toISOString()
    };

    const insertPayload: InventoryItemInsert = {
      ...values,
      household_id: householdId,
      item_name: values.item_name,
      created_by: session.user.id
    };

    const request = editing
      ? supabase.from('inventory_items').update(updatePayload).eq('id', editing.id).select().single()
      : supabase.from('inventory_items').insert(insertPayload).select().single();

    const { data, error: saveError } = await request;
    if (saveError) {
      setError(saveError.message);
      return;
    }

    const saved = data as InventoryItem;
    setItems((current) =>
      editing
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [...current, saved].sort((a, b) => a.item_name.localeCompare(b.item_name))
    );
    setEditing(null);
    setAdding(false);
  }

  async function deleteItem(item: InventoryItem) {
    if (!window.confirm(`Delete ${item.item_name}?`)) return;
    setError('');
    const { error: deleteError } = await supabase.from('inventory_items').delete().eq('id', item.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
  }

  if (!session) return <AuthPanel />;

  const selectedHousehold = memberships.find((membership) => membership.household_id === householdId);
  const showEditor = adding || editing;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{selectedHousehold?.households?.name || 'Home Inventory'}</p>
          <h1>Inventory</h1>
        </div>
        <button className="secondary" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </header>

      {memberships.length > 1 && (
        <label className="household-picker">
          Household
          <select value={householdId} onChange={(event) => setHouseholdId(event.target.value)}>
            {memberships.map((membership) => (
              <option key={membership.household_id} value={membership.household_id}>
                {membership.households?.name || membership.household_id}
              </option>
            ))}
          </select>
        </label>
      )}

      {!householdId && (
        <section className="empty-state">
          <h2>Approval needed</h2>
          <p>This account is signed in, but it is not approved for a household yet.</p>
        </section>
      )}

      {householdId && (
        <>
          <section className="toolbar">
            <label className="search">
              Search
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Part, supplier, location..."
              />
            </label>
            <div className="button-row">
              <button onClick={() => setAdding(true)}>Add</button>
              <button className="secondary" onClick={() => downloadCsv(filtered, false)}>
                CSV
              </button>
              <button className="secondary" onClick={() => downloadCsv(filtered, true)}>
                Excel CSV
              </button>
            </div>
          </section>

          {error && <p className="error">{error}</p>}

          {showEditor && (
            <ItemForm
              item={editing}
              onCancel={() => {
                setEditing(null);
                setAdding(false);
              }}
              onSave={saveItem}
            />
          )}

          <section className="summary">
            <span>{filtered.length} items</span>
            <span>{items.reduce((total, item) => total + Number(item.quantity || 0), 0)} total units</span>
          </section>

          {loading ? (
            <section className="empty-state">Loading inventory...</section>
          ) : filtered.length === 0 ? (
            <section className="empty-state">No matching items.</section>
          ) : (
            <section className="item-list">
              {filtered.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onEdit={() => setEditing(item)}
                  onDelete={() => deleteItem(item)}
                />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
