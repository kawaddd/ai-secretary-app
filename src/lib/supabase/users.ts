import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, UserRow } from '@/types/database'

type Client = SupabaseClient<Database>

export async function getUser(client: Client, id: string): Promise<UserRow | null> {
  const { data, error } = await client.from('users').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function upsertUser(
  client: Client,
  payload: { id: string; email: string; name?: string; google_id?: string },
): Promise<UserRow> {
  const { data, error } = await client
    .from('users')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateUser(
  client: Client,
  id: string,
  payload: { name?: string },
): Promise<UserRow> {
  const { data, error } = await client
    .from('users')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
