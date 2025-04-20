<!-- auth.js -->
<script type="module">
  import supabase from './supabase_client.js';

  document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    const registerForm = document.getElementById('register-form');
    const registerName = document.getElementById('register-name');
    const registerCpf = document.getElementById('register-cpf');
    const registerPhone = document.getElementById('register-phone');
    const registerType = document.getElementById('register-type');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerConfirmPassword = document.getElementById('register-confirm-password');
    const registerDiscovery = document.getElementById('register-discovery');
    const registerError = document.getElementById('register-error');

    const showError = (element, message) => {
      element.textContent = message;
      element.style.display = 'block';
      setTimeout(() => {
        element.style.display = 'none';
      }, 5000);
    };

    const showSuccess = (message) => {
      const successElement = document.createElement('div');
      successElement.className = 'success-message';
      successElement.textContent = message;
      document.body.appendChild(successElement);
      setTimeout(() => {
        document.body.removeChild(successElement);
      }, 5000);
    };

    const validarCPF = (cpf) => {
      cpf = cpf.replace(/[^\d]/g, '');
      if (cpf.length !== 11) return false;
      if (/^(\d)\1+$/.test(cpf)) return false;

      let soma = 0;
      for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let resto = soma % 11;
      let dv1 = resto < 2 ? 0 : 11 - resto;
      if (parseInt(cpf.charAt(9)) !== dv1) return false;

      soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
      }
      resto = soma % 11;
      let dv2 = resto < 2 ? 0 : 11 - resto;
      return parseInt(cpf.charAt(10)) === dv2;
    };

    const validarFormularioCadastro = () => {
      if (!registerName.value.trim()) {
        showError(registerError, 'Nome completo é obrigatório');
        return false;
      }

      const cpf = registerCpf.value.replace(/[^\d]/g, '');
      if (!cpf || cpf.length !== 11 || !validarCPF(cpf)) {
        showError(registerError, 'CPF inválido');
        return false;
      }

      const phone = registerPhone.value.replace(/[^\d]/g, '');
      if (!phone || phone.length < 10) {
        showError(registerError, 'Telefone inválido');
        return false;
      }

      if (!registerType.value) {
        showError(registerError, 'Selecione o tipo de cadastro');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerEmail.value)) {
        showError(registerError, 'Email inválido');
        return false;
      }

      if (registerPassword.value.length < 6) {
        showError(registerError, 'A senha deve ter pelo menos 6 caracteres');
        return false;
      }

      if (registerPassword.value !== registerConfirmPassword.value) {
        showError(registerError, 'As senhas não coincidem');
        return false;
      }

      return true;
    };

    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = loginEmail.value;
        const password = loginPassword.value;

        if (!email || !password) {
          showError(loginError, 'Email e senha são obrigatórios');
          return;
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          showSuccess('Login realizado com sucesso!');
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 1500);
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          showError(loginError, error.message || 'Erro ao fazer login');
        }
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!validarFormularioCadastro()) return;

        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: registerEmail.value,
            password: registerPassword.value,
          });

          if (authError) throw authError;

          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              nome_completo: registerName.value,
              cpf: registerCpf.value.replace(/[^\d]/g, ''),
              telefone: registerPhone.value.replace(/[^\d]/g, ''),
              tipo_usuario: registerType.value,
              como_descobriu: registerDiscovery.value || null,
            },
          ]);

          if (profileError) throw profileError;

          showSuccess('Cadastro realizado com sucesso! Você já pode fazer login.');
          registerForm.reset();
          switchTab('login');
        } catch (error) {
          console.error('Erro ao registrar usuário:', error);
          showError(registerError, error.message || 'Erro ao registrar usuário');
        }
      });
    }

    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data.user) {
          window.location.href = '/index.html';
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    };

    checkAuth();

    if (registerCpf) {
      registerCpf.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 9) {
          value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
          value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
        } else if (value.length > 3) {
          value = value.replace(/^(\d{3})(\d{0,3}).*/, '$1.$2');
        }
        e.target.value = value;
      });
    }

    if (registerPhone) {
      registerPhone.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 10) {
          value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 6) {
          value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
          value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
        }
        e.target.value = value;
      });
    }
  });

  function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((item) => {
      item.classList.remove('active');
    });

    document.querySelectorAll('.auth-form').forEach((item) => {
      item.classList.remove('active');
    });

    if (tab === 'login') {
      document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
      document.getElementById('login-form').classList.add('active');
      document.querySelector('.auth-tab-slider').style.left = '0';
    } else {
      document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
      document.getElementById('register-form').classList.add('active');
      document.querySelector('.auth-tab-slider').style.left = '50%';
    }

    if (window.innerWidth <= 576) {
      if (tab === 'login') {
        document.querySelector('.auth-tab-slider').style.left = '0';
        document.querySelector('.auth-tab-slider').style.top = '0';
      } else {
        document.querySelector('.auth-tab-slider').style.left = '0';
        document.querySelector('.auth-tab-slider').style.top = '50%';
      }
    }
  }
</script>
