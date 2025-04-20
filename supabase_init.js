// Arquivo centralizado para inicialização do Supabase
// Este arquivo cria e exporta uma instância global do Supabase para toda a aplicação

// Configurações do Supabase
const supabaseUrl = 'https://qgqahdkthbfvldmdtcyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWFoZGt0aGJmdmxkbWR0Y3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzMjAyMDMsImV4cCI6MjAyODg5NjIwM30.09Jr64KP9clLTx7_gI9IGZ-0JrFSidQtOEroF-1mBy0';

// Inicializar o cliente Supabase como variável global
window.supabase = null;

// Função para inicializar o Supabase
function initSupabase() {
  if (!window.supabase) {
    // Verificar se o Supabase já foi carregado
    if (typeof supabaseJs !== 'undefined') {
      window.supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);
      console.log('Supabase inicializado com sucesso!');
    } else {
      console.error('Biblioteca Supabase não carregada. Carregando agora...');
      
      // Carregar a biblioteca Supabase dinamicamente
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = function() {
        window.supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase carregado e inicializado com sucesso!');
        
        // Disparar evento de inicialização concluída
        const event = new Event('supabaseInitialized');
        document.dispatchEvent(event);
      };
      document.head.appendChild(script);
    }
  }
  
  return window.supabase;
}

// Inicializar o Supabase imediatamente
document.addEventListener('DOMContentLoaded', initSupabase);

// Função para obter a instância do Supabase
function getSupabase() {
  if (!window.supabase) {
    return initSupabase();
  }
  return window.supabase;
}

// Exportar a função para obter o Supabase
window.getSupabase = getSupabase;
