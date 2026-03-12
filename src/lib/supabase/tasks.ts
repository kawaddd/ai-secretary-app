import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, TaskRow, TaskInsert, TaskUpdate } from '@/types/database'

type Client = SupabaseClient<Database>

export async function getTasks(client: Client, userId: string): Promise<TaskRow[]> {
  const { data, error } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getTask(client: Client, id: string): Promise<TaskRow | null> {
  const { data, error } = await client.from('tasks').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createTask(client: Client, payload: TaskInsert): Promise<TaskRow> {
  const { data, error } = await client.from('tasks').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateTask(
  client: Client,
  id: string,
  payload: TaskUpdate,
): Promise<TaskRow> {
  const { data, error } = await client
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(client: Client, id: string): Promise<void> {
  const { error } = await client.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function getUpcomingTasks(client: Client, userId: string): Promise<TaskRow[]> {
  const twoDaysLater = new Date()
  twoDaysLater.setDate(twoDaysLater.getDate() + 2)

  const { data, error } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('due_date', twoDaysLater.toISOString())
    .order('due_date', { ascending: true })
  if (error) throw error
  return data
}
