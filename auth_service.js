// API de autenticação usando Supabase
// Este arquivo contém as funções para autenticação de usuários

const { createClient } = require('@supabase/supabase-js');

/**
 * Classe para gerenciar a autenticação de usuários
 */
class AuthService {
  /**
   * Inicializa o serviço de autenticação
   * @param {string} supabaseUrl - URL do projeto Supabase
   * @param {string} supabaseKey - Chave anônima do Supabase
   */
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(
      'https://nnakaoghwcwqbztihqlx.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uYWthb2dod2N3cWJ6dGlocWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMjY1NzcsImV4cCI6MjA2MDYwMjU3N30.LUsel_BM_tP07B7aQUEQw2Ya6FarDoLJLQzwBTOjyNk'
    );
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise} - Resultado do registro
   */
  async registrarUsuario(userData) {
    try {
      const { email, senha, nome_completo, cpf, telefone, tipo_usuario, como_descobriu } = userData;
      
      // Registrar o usuário no sistema de autenticação do Supabase
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password: senha
      });
      
      if (authError) throw authError;
      
      // Criar o perfil do usuário na tabela profiles
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            nome_completo,
            cpf,
            telefone,
            tipo_usuario,
            como_descobriu
          }
        ]);
      
      if (profileError) {
        // Se houver erro ao criar o perfil, tentar excluir o usuário criado
        await this.supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
      
      return {
        success: true,
        message: 'Usuário registrado com sucesso',
        user: authData.user
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return {
        success: false,
        message: error.message || 'Erro ao registrar usuário',
        error
      };
    }
  }

  /**
   * Realiza o login de um usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise} - Resultado do login
   */
  async login(email, senha) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password: senha
      });
      
      if (error) throw error;
      
      // Buscar dados do perfil do usuário
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      return {
        success: true,
        message: 'Login realizado com sucesso',
        session: data.session,
        user: {
          ...data.user,
          profile: profileData
        }
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer login',
        error
      };
    }
  }

  /**
   * Realiza o logout de um usuário
   * @returns {Promise} - Resultado do logout
   */
  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return {
        success: false,
        message: error.message || 'Erro ao fazer logout',
        error
      };
    }
  }

  /**
   * Recupera a senha de um usuário
   * @param {string} email - Email do usuário
   * @returns {Promise} - Resultado da recuperação
   */
  async recuperarSenha(email) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Email de recuperação enviado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      return {
        success: false,
        message: error.message || 'Erro ao recuperar senha',
        error
      };
    }
  }

  /**
   * Obtém o usuário atual
   * @returns {Promise} - Dados do usuário atual
   */
  async getUsuarioAtual() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      
      if (error) throw error;
      
      if (!data.user) {
        return {
          success: false,
          message: 'Nenhum usuário autenticado'
        };
      }
      
      // Buscar dados do perfil do usuário
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) throw profileError;
      
      return {
        success: true,
        user: {
          ...data.user,
          profile: profileData
        }
      };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return {
        success: false,
        message: error.message || 'Erro ao obter usuário atual',
        error
      };
    }
  }

  /**
   * Atualiza os dados do perfil de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} profileData - Novos dados do perfil
   * @returns {Promise} - Resultado da atualização
   */
  async atualizarPerfil(userId, profileData) {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Perfil atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        message: error.message || 'Erro ao atualizar perfil',
        error
      };
    }
  }
}

module.exports = AuthService;
