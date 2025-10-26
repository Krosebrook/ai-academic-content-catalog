
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Helper to get current user
const getUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session?.user) throw new Error('User not logged in.');
  return session.user;
};

// --- Persona API ---
export const getPersona = async (): Promise<string> => {
  const user = await getUser();
  const { data, error } = await supabase
    .from('user_personas')
    .select('persona')
    .eq('user_id', user.id)
    .single();
  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    console.error('Error fetching persona:', error);
    throw error;
  }
  return data?.persona || '';
};

export const updatePersona = async (persona: string): Promise<void> => {
  const user = await getUser();
  const { error } = await supabase
    .from('user_personas')
    .upsert({ user_id: user.id, persona }, { onConflict: 'user_id' });
  if (error) {
    console.error('Error updating persona:', error);
    throw error;
  }
};

// --- Content API ---
export const getContent = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('generatedAt', { ascending: false });
  if (error) throw error;
  // The data is stored in a 'data' jsonb column, let's unpack it.
  return data.map(item => ({ ...item.data, id: item.id, user_id: item.user_id, generatedAt: item.generatedAt, collectionId: item.collectionId }));
};

export const createContent = async (contentData: any): Promise<any> => {
    const user = await getUser();
    const id = uuidv4();
    const generatedAt = new Date().toISOString();
    const fullContent = { ...contentData, id, user_id: user.id, generatedAt };

    const { data, error } = await supabase
        .from('content')
        .insert({
            id,
            user_id: user.id,
            generatedAt,
            // Store core queryable fields at top-level, rest in jsonb 'data' column
            title: fullContent.title,
            type: fullContent.type,
            toolId: fullContent.toolId,
            collectionId: fullContent.collectionId || null,
            data: fullContent // Store the full object
        })
        .select()
        .single();
        
    if (error) throw error;
    return { ...data.data, id: data.id, user_id: data.user_id, generatedAt: data.generatedAt, collectionId: data.collectionId };
};

export const batchCreateContent = async (contentItems: any[]): Promise<void> => {
    const user = await getUser();
    const itemsToInsert = contentItems.map(item => {
        const id = item.id || uuidv4();
        return {
            id,
            user_id: user.id,
            generatedAt: item.generatedAt || new Date().toISOString(),
            title: item.title,
            type: item.type,
            toolId: item.toolId,
            collectionId: item.collectionId || null,
            data: { ...item, id, user_id: user.id }
        };
    });

    const { error } = await supabase.from('content').insert(itemsToInsert);
    if (error) throw error;
};


export const updateContent = async (id: string, updates: { collectionId?: string | null }): Promise<any> => {
  const { data, error } = await supabase
    .from('content')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return { ...data.data, id: data.id, user_id: data.user_id, generatedAt: data.generatedAt, collectionId: data.collectionId };
};

// --- Collections API ---
export const getCollections = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createCollection = async (name: string): Promise<any> => {
  const user = await getUser();
  const { data, error } = await supabase
    .from('collections')
    .insert({ name, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};
