// Configuração da integração com o Telegram Bot API
// Este arquivo contém as funções para enviar notificações ao Telegram

const axios = require('axios');
// Importar o cliente Supabase centralizado
const supabase = require('./supabase_client_cjs.js');

/**
 * Classe para gerenciar a integração com o Telegram
 */
class TelegramIntegration {
  /**
   * Inicializa a integração com o Telegram
   * @param {string} botToken - Token do bot do Telegram
   * @param {string} chatId - ID do chat para enviar as mensagens
   */
  constructor(botToken, chatId) {
    this.botToken = botToken || '7651954183:AAEkUjjx0ReZWDabXeJDU9FTx5srg168fB0';
    this.chatId = chatId || '7608902693';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Envia uma mensagem para o chat configurado
   * @param {string} message - Mensagem a ser enviada
   * @returns {Promise} - Resultado da requisição
   */
  async sendMessage(message) {
    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML'
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem para o Telegram:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Formata e envia uma notificação de nova oferta
   * @param {Object} oferta - Dados da oferta
   * @param {Object} usuario - Dados do usuário que fez a oferta
   * @param {Object} produto - Dados do produto
   * @returns {Promise} - Resultado do envio
   */
  async notificarNovaOferta(oferta, usuario, produto) {
    const mensagem = `
<b>🔔 NOVA OFERTA RECEBIDA</b>

<b>Produto:</b> ${produto.nome}
<b>Valor da Oferta:</b> R$ ${oferta.valor_oferta.toFixed(2)}
<b>Valor Inicial:</b> R$ ${produto.valor_inicial.toFixed(2)}

<b>Cliente:</b> ${usuario.nome_completo}
<b>Telefone:</b> ${usuario.telefone}
<b>Tipo:</b> ${usuario.tipo_usuario === 'pessoa_fisica' ? 'Pessoa Física' : 'Empreendedor'}

<b>Mensagem:</b> 
${oferta.mensagem || 'Nenhuma mensagem adicional'}

<b>Data/Hora:</b> ${new Date(oferta.created_at).toLocaleString('pt-BR')}
<b>ID da Oferta:</b> ${oferta.id}
`;

    return this.sendMessage(mensagem);
  }

  /**
   * Testa a conexão com o Telegram enviando uma mensagem de teste
   * @returns {Promise} - Resultado do teste
   */
  async testarConexao() {
    return this.sendMessage(`🔄 Teste de conexão do sistema de ofertas - ${new Date().toLocaleString('pt-BR')}`);
  }
}

/**
 * Função para criar uma instância do bot do Telegram a partir das configurações do banco de dados
 * @param {Object} supabaseClient - Cliente do Supabase
 * @returns {Promise<TelegramIntegration|null>} - Instância do bot ou null em caso de erro
 */
async function criarBotTelegram() {
  try {
    // Buscar configurações do Telegram no banco de dados
    const { data, error } = await supabase
      .from('telegram_config')
      .select('*')
      .eq('ativo', true)
      .limit(1)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      console.error('Nenhuma configuração ativa do Telegram encontrada');
      return null;
    }
    
    return new TelegramIntegration(data.bot_token, data.chat_id);
  } catch (error) {
    console.error('Erro ao criar bot do Telegram:', error);
    return null;
  }
}

module.exports = {
  TelegramIntegration,
  criarBotTelegram
};
