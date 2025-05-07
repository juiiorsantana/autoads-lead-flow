
import { supabase } from './client';

/**
 * Inicializa os buckets de armazenamento necessários para a aplicação.
 * Este script pode ser executado uma vez para garantir que os buckets existam.
 */
export async function initBuckets() {
  try {
    console.log('Initializing storage buckets...');
    
    // Verificar se o bucket de perfis existe, senão criar
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return;
    }
    
    const initializationPromises = [];
    
    // Verificar se o bucket já existe
    const profilesBucketExists = buckets?.some(bucket => bucket.name === 'profiles');
    
    // Se não existir, criar o bucket
    if (!profilesBucketExists) {
      const profileBucketPromise = supabase.storage.createBucket('profiles', {
        public: true, // Bucket público para permitir acesso às imagens
      }).then(({ error }) => {
        if (error) {
          console.error('Erro ao criar bucket de perfis:', error);
        } else {
          console.log('Bucket de perfis criado com sucesso!');
        }
      });
      
      initializationPromises.push(profileBucketPromise);
    }
    
    // Verificar se o bucket de anúncios existe, senão criar
    const anunciosBucketExists = buckets?.some(bucket => bucket.name === 'anuncios');
    
    // Se não existir, criar o bucket
    if (!anunciosBucketExists) {
      const anunciosBucketPromise = supabase.storage.createBucket('anuncios', {
        public: true, // Bucket público para permitir acesso às imagens
      }).then(({ error }) => {
        if (error) {
          console.error('Erro ao criar bucket de anúncios:', error);
        } else {
          console.log('Bucket de anúncios criado com sucesso!');
        }
      });
      
      initializationPromises.push(anunciosBucketPromise);
    }
    
    // Esperar todas as promessas terminarem
    await Promise.allSettled(initializationPromises);
    
    console.log('Storage buckets initialization complete');
    
    // Verificar tabela de perfis separadamente para não bloquear a inicialização dos buckets
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (profileError) {
        console.warn('Aviso ao verificar tabela de perfis:', profileError);
      } else {
        console.log('Tabela de perfis verificada com sucesso');
      }
    } catch (error) {
      console.warn('Erro ao verificar tabela de perfis:', error);
    }
    
  } catch (error) {
    console.error('Erro ao inicializar buckets:', error);
  }
}

/**
 * Verifica o estado da conexão com o Supabase
 * Retorna true se a conexão estiver OK, false caso contrário
 */
export async function checkConnection() {
  try {
    const start = Date.now();
    const { error } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
    const elapsed = Date.now() - start;
    
    console.log(`Supabase connection check completed in ${elapsed}ms`);
    
    if (error) {
      console.error('Connection check failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Connection check exception:', error);
    return false;
  }
}
