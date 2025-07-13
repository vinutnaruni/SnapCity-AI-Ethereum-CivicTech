import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadVideo = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, file);

  if (error) throw error;
  return data.path;
};

export const getVideoUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(path);
  return data.publicUrl;
};