// API para recebimento de ofertas
// Este arquivo contém as funções para processar ofertas e enviar notificações

const { createClient } = require('@supabase/supabase-js');
const { criarBotTelegram } = require('./telegram_integration');

/**
 * Classe para gerenciar ofertas
 */
class OfertaService {
  /**
   * Inicializa o serviço de ofertas
   * @param {string} supabaseUrl - URL do projeto Supabase
   * @param {string} supabaseKey - Chave anônima do Supabase
   */
  constructor() {
    this.supabase = createClient(
      'https://qgqahdkthbfvldmdtcyk.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFncWFoZGt0aGJmdmxkbWR0Y3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzMjAyMDMsImV4cCI6MjAyODg5NjIwM30.09Jr64KP9clLTx7_gI9IGZ-0JrFSidQtOEroF-1mBy0'
    );
    this.telegramBot = null;

    // Inicializar o bot do Telegram
    this.inicializarTelegramBot();
  }

  async inicializarTelegramBot() {
    try {
      this.telegramBot = await criarBotTelegram(this.supabase);

      if (this.telegramBot) {
        console.log('Bot do Telegram inicializado com sucesso');
      } else {
        console.error('Não foi possível inicializar o bot do Telegram');
      }
    } catch (error) {
      console.error('Erro ao inicializar bot do Telegram:', error);
    }
  }

  async criarOferta(ofertaData, userId) {
    try {
      const { produto_id, valor_oferta, mensagem } = ofertaData;

      const { data: produto, error: produtoError } = await this.supabase
        .from('produtos')
        .select('*')
        .eq('id', produto_id)
        .single();

      if (produtoError) throw produtoError;

      if (!produto) {
        return {
          success: false,
          message: 'Produto não encontrado'
        };
      }

      if (produto.status !== 'ativo') {
        return {
          success: false,
          message: `Este produto não está disponível para ofertas (status: ${produto.status})`
        };
      }

      const { data: usuario, error: usuarioError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (usuarioError) throw usuarioError;

      const { data: oferta, error: ofertaError } = await this.supabase
        .from('ofertas')
        .insert([
          {
            user_id: userId,
            produto_id,
            produto_nome: produto.nome,
            valor_oferta,
            mensagem,
            status: 'pendente',
            notificado: false
          }
        ])
        .select()
        .single();

      if (ofertaError) throw ofertaError;

      await this.notificarOferta(oferta, usuario, produto);

      return {
        success: true,
        message: 'Oferta enviada com sucesso',
        oferta
      };
    } catch (error) {
      console.error('Erro ao criar oferta:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar oferta',
        error
      };
    }
  }

  async notificarOferta(oferta, usuario, produto) {
    try {
      if (!this.telegramBot) {
        await this.inicializarTelegramBot();

        if (!this.telegramBot) {
          throw new Error('Bot do Telegram não inicializado');
        }
      }

      const resultado = await this.telegramBot.notificarNovaOferta(oferta, usuario, produto);

      await this.supabase
        .from('notification_logs')
        .insert([
          {
            oferta_id: oferta.id,
            tipo: 'nova_oferta',
            mensagem: `Nova oferta para o produto ${produto.nome}`,
            status: resultado.success ? 'enviado' : 'falha'
          }
        ]);

      if (resultado.success) {
        await this.supabase
          .from('ofertas')
          .update({ notificado: true })
          .eq('id', oferta.id);
      }

      return resultado;
    } catch (error) {
      console.error('Erro ao notificar oferta:', error);

      await this.supabase
        .from('notification_logs')
        .insert([
          {
            oferta_id: oferta.id,
            tipo: 'nova_oferta',
            mensagem: `Erro ao notificar oferta: ${error.message}`,
            status: 'falha'
          }
        ]);

      return {
        success: false,
        message: error.message || 'Erro ao notificar oferta',
        error
      };
    }
  }

  async getOfertasUsuario(userId) {
    try {
      const { data, error } = await this.supabase
        .from('ofertas')
        .select(`
          *,
          produtos:produto_id (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        ofertas: data
      };
    } catch (error) {
      console.error('Erro ao obter ofertas do usuário:', error);
      return {
        success: false,
        message: error.message || 'Erro ao obter ofertas do usuário',
        error
      };
    }
  }

  async getTodasOfertas() {
    try {
      const { data, error } = await this.supabase
        .from('ofertas')
        .select(`
          *,
          produtos:produto_id (*),
          profiles:user_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        ofertas: data
      };
    } catch (error) {
      console.error('Erro ao obter todas as ofertas:', error);
      return {
        success: false,
        message: error.message || 'Erro ao obter todas as ofertas',
        error
      };
    }
  }

  async atualizarStatusOferta(ofertaId, novoStatus) {
    try {
      if (!['pendente', 'aceita', 'recusada'].includes(novoStatus)) {
        return {
          success: false,
          message: 'Status inválido'
        };
      }

      const { data, error } = await this.supabase
        .from('ofertas')
        .update({ status: novoStatus })
        .eq('id', ofertaId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: `Status da oferta atualizado para ${novoStatus}`,
        oferta: data
      };
    } catch (error) {
      console.error('Erro ao atualizar status da oferta:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar status da oferta',
        error
      };
    }
  }
}

module.exports = OfertaService;
