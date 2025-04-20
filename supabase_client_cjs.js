// Arquivo centralizado para inicialização do Supabase (versão CommonJS)
// Este arquivo exporta uma instância única do cliente Supabase para ser usada em toda a aplicação

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://qgqahdkthbfvldmdtcyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWFoZGt0aGJmdmxkbWR0Y3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzMjAyMDMsImV4cCI6MjAyODg5NjIwM30.09Jr64KP9clLTx7_gI9IGZ-0JrFSidQtOEroF-1mBy0';

// Inicializar o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Exportar a instância do Supabase
module.exports = supabase;
