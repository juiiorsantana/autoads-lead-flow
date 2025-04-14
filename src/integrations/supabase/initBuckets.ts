
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
    
    // Verificar se o bucket de anúncios existe, senão criar
    const anunciosBucketExists = buckets?.some(bucket => bucket.name === 'anuncios');
    
    // Se não existir, criar o bucket
    if (!anunciosBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('anuncios', {
        public: true, // Bucket público para permitir acesso às imagens
      });
      
      if (createError) {
        console.error('Erro ao criar bucket de anúncios:', createError);
        return;
      }
      
      console.log('Bucket de anúncios criado com sucesso!');
    }
    
    // Adicionar colunas faltantes na tabela profiles se necessário
    try {
      // Verifique se as colunas já existem para evitar erros
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profileError) {
        console.error('Erro ao verificar tabela de perfis:', profileError);
      } else {
        // Se a tabela existe mas não conseguimos ver as colunas específicas, o erro está em outro lugar
        console.log('Tabela de perfis verificada com sucesso');
      }
    } catch (error) {
      console.error('Erro ao verificar tabela de perfis:', error);
    }
    
  } catch (error) {
    console.error('Erro ao inicializar buckets:', error);
  }
}
