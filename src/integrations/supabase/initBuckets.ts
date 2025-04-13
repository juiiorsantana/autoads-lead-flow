
import { supabase } from './client';

/**
 * Inicializa os buckets de armazenamento necessários para a aplicação.
 * Este script pode ser executado uma vez para garantir que os buckets existam.
 */
export async function initBuckets() {
  try {
    // Verificar se o bucket de perfis existe, senão criar
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return;
    }
    
    // Verificar se o bucket já existe
    const profilesBucketExists = buckets?.some(bucket => bucket.name === 'profiles');
    
    // Se não existir, criar o bucket
    if (!profilesBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('profiles', {
        public: true, // Bucket público para permitir acesso às imagens
      });
      
      if (createError) {
        console.error('Erro ao criar bucket de perfis:', createError);
        return;
      }
      
      console.log('Bucket de perfis criado com sucesso!');
    }
    
  } catch (error) {
    console.error('Erro ao inicializar buckets:', error);
  }
}
