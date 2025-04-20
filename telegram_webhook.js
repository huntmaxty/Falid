// Configuração das notificações do Telegram
// Este arquivo contém o código para configurar e testar as notificações do Telegram

const express = require('express');
const bodyParser = require('body-parser');
// Importar o cliente Supabase centralizado
const supabase = require('./supabase_client_cjs.js');
const { TelegramIntegration } = require('./telegram_integration');
const OfertaService = require('./oferta_service');

// Inicializar o serviço de ofertas
const ofertaService = new OfertaService();

// Criar o servidor Express
const app = express();
app.use(bodyParser.json());

// Configurar CORS para permitir acesso de qualquer origem
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rota para configurar o bot do Telegram
app.post('/api/telegram/config', async (req, res) => {
  try {
    const { bot_token, chat_id } = req.body;
    
    if (!bot_token || !chat_id) {
      return res.status(400).json({
        success: false,
        message: 'Token do bot e ID do chat são obrigatórios'
      });
    }
    
    // Testar a conexão com o Telegram
    const telegramBot = new TelegramIntegration(bot_token, chat_id);
    const testResult = await telegramBot.testarConexao();
    
    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Falha ao conectar com o Telegram',
        error: testResult.error
      });
    }
    
    // Salvar as configurações no banco de dados
    const { data, error } = await supabase
      .from('telegram_config')
      .upsert([
        {
          bot_token,
          chat_id,
          ativo: true
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    return res.json({
      success: true,
      message: 'Configuração do Telegram salva com sucesso',
      config: {
        id: data.id,
        ativo: data.ativo,
        created_at: data.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao configurar Telegram:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao configurar Telegram',
      error
    });
  }
});

// Rota para testar o envio de notificações
app.post('/api/telegram/test', async (req, res) => {
  try {
    // Buscar configurações do Telegram
    const { data: config, error: configError } = await supabase
      .from('telegram_config')
      .select('*')
      .eq('ativo', true)
      .limit(1)
      .single();
    
    if (configError) throw configError;
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma configuração ativa do Telegram encontrada'
      });
    }
    
    // Criar instância do bot
    const telegramBot = new TelegramIntegration(config.bot_token, config.chat_id);
    
    // Enviar mensagem de teste
    const testResult = await telegramBot.sendMessage(`
🧪 <b>TESTE DE NOTIFICAÇÃO</b>

Este é um teste do sistema de notificações de ofertas da Ello Leilões.
Data/Hora: ${new Date().toLocaleString('pt-BR')}
    `);
    
    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Falha ao enviar mensagem de teste',
        error: testResult.error
      });
    }
    
    return res.json({
      success: true,
      message: 'Mensagem de teste enviada com sucesso',
      result: testResult.data
    });
  } catch (error) {
    console.error('Erro ao testar Telegram:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao testar Telegram',
      error
    });
  }
});

// Webhook para receber ofertas e enviar notificações
app.post('/api/ofertas', async (req, res) => {
  try {
    const { produto_id, valor_oferta, mensagem } = req.body;
    
    // Verificar autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar o token com o Supabase
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado',
        error: authError
      });
    }
    
    // Criar a oferta
    const resultado = await ofertaService.criarOferta(
      { produto_id, valor_oferta, mensagem },
      authData.user.id
    );
    
    if (!resultado.success) {
      return res.status(400).json(resultado);
    }
    
    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao processar oferta:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao processar oferta',
      error
    });
  }
});

// Rota para obter ofertas do usuário atual
app.get('/api/ofertas/minhas', async (req, res) => {
  try {
    // Verificar autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar o token com o Supabase
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado',
        error: authError
      });
    }
    
    // Obter ofertas do usuário
    const resultado = await ofertaService.getOfertasUsuario(authData.user.id);
    
    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao obter ofertas:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter ofertas',
      error
    });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Exportar o app para testes
module.exports = app;
