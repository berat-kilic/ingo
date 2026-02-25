import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const removeUserFromRooms = async (userId) => {
  const { data: rooms } = await supabaseAdmin.from('rooms').select('id, players');
  if (!rooms) return;

  for (const r of rooms) {
    if (Array.isArray(r.players) && r.players.some((p) => p.id === userId)) {
      const newPlayers = r.players.filter((p) => p.id !== userId);
      await supabaseAdmin.from('rooms').update({ players: newPlayers }).eq('id', r.id);
    }
  }
};

const hardDeleteUser = async (userId) => {
  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    throw new Error('Auth user delete failed: ' + authDeleteError.message);
  }

  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await removeUserFromRooms(userId);
};

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server env missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    await hardDeleteUser(data.user.id);
    return res.status(200).json({ ok: true, deleted: true });
  } catch (error) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
