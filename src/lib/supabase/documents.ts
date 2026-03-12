import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, DocumentRow, DocumentInsert, DocumentUpdate } from '@/types/database'

type Client = SupabaseClient<Database>
type DocumentType = 'proofread' | 'minutes' | 'research'

export async function getDocuments(
  client: Client,
  userId: string,
  type?: DocumentType,
): Promise<DocumentRow[]> {
  let query = client
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getDocument(client: Client, id: string): Promise<DocumentRow | null> {
  const { data, error } = await client.from('documents').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createDocument(
  client: Client,
  payload: DocumentInsert,
): Promise<DocumentRow> {
  const { data, error } = await client.from('documents').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateDocument(
  client: Client,
  id: string,
  payload: DocumentUpdate,
): Promise<DocumentRow> {
  const { data, error } = await client
    .from('documents')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDocument(client: Client, id: string): Promise<void> {
  const { error } = await client.from('documents').delete().eq('id', id)
  if (error) throw error
}
