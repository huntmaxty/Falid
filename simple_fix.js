// Solução simples para o problema "Cannot access 'supabase' before initialization"
// Este script deve ser adicionado antes de qualquer script que use o Supabase

// Configurações do Supabase
const supabaseUrl = 'https://qgqahdkthbfvldmdtcyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWFoZGt0aGJmdmxkbWR0Y3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzMjAyMDMsImV4cCI6MjAyODg5NjIwM30.09Jr64KP9clLTx7_gI9IGZ-0JrFSidQtOEroF-1mBy0';

// Inicializar o cliente Supabase como variável global
window.supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);

// Tornar o supabase disponível globalmente para outros scripts
if (typeof supabase === 'undefined') {
  var supabase = window.supabase;
}

console.log('Supabase inicializado com sucesso!');
