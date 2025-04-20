// simple_fix.js
// Este arquivo é uma versão simplificada do supabase_init.js
// Ele inicializa o Supabase globalmente para ser usado em toda a aplicação

// Configurações do Supabase
const SUPABASE_URL = 'https://qgqahdkthbfvldmdtcyk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWFoZGt0aGJmdmxkbWR0Y3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzMjAyMDMsImV4cCI6MjAyODg5NjIwM30.09Jr64KP9clLTx7_gI9IGZ-0JrFSidQtOEroF-1mBy0';

// Inicializar o Supabase globalmente
window.supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Supabase inicializado globalmente com sucesso');
