
// Inicialização do Supabase
const supabaseUrl = 'https://nnakaoghwcwqbztihqlx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uYWthb2dod2N3cWJ6dGlocWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMjY1NzcsImV4cCI6MjA2MDYwMjU3N30.LUsel_BM_tP07B7aQUEQw2Ya6FarDoLJLQzwBTOjyNk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Inicia os eventos quando a página estiver pronta
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('#login-form .btn-auth');
  if (loginBtn) {
    loginBtn.type = 'button';
    loginBtn.onclick = handleLogin;
  }

  const registerBtn = document.querySelector('#register-form .btn-auth');
  if (registerBtn) {
    registerBtn.type = 'button';
    registerBtn.onclick = handleRegister;
  }

  function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(item => item.classList.remove('active'));

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

  window.switchTab = switchTab; // garante acesso global

  window.addEventListener('resize', () => switchTab(
    document.querySelector('.auth-tab:nth-child(1)').classList.contains('active') ? 'login' : 'register'
  ));
});

// LOGIN
async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  errorElement.style.display = 'none';

  if (!email || !password) {
    errorElement.textContent = 'Preencha todos os campos.';
    errorElement.style.display = 'block';
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    errorElement.textContent = 'Erro no login: ' + error.message;
    errorElement.style.display = 'block';
  } else {
    window.location.href = 'vcgosta.html';
  }
}

// CADASTRO
async function handleRegister() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const cpf = document.getElementById('register-cpf').value.replace(/\D/g, '');
  const phone = document.getElementById('register-phone').value.replace(/\D/g, '');
  const type = document.getElementById('register-type').value;
  const discovery = document.getElementById('register-discovery').value;
  const terms = document.getElementById('terms');
  const errorElement = document.getElementById('register-error');
  errorElement.style.display = 'none';

  if (!name || !email || !password || !confirmPassword || !cpf || !phone || !type) {
    errorElement.textContent = 'Preencha todos os campos obrigatórios.';
    errorElement.style.display = 'block';
    return;
  }

  if (password !== confirmPassword) {
    errorElement.textContent = 'As senhas não coincidem.';
    errorElement.style.display = 'block';
    return;
  }

  if (!terms.checked) {
    errorElement.textContent = 'Você deve aceitar os termos.';
    errorElement.style.display = 'block';
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        cpf,
        phone,
        user_type: type,
        discovery_method: discovery
      }
    }
  });

  if (error) {
    errorElement.textContent = 'Erro no cadastro: ' + error.message;
    errorElement.style.display = 'block';
  } else {
    await supabase.from('profiles').insert([{
      id: data.user.id,
      email,
      nome_completo: name,
      cpf,
      telefone: phone,
      tipo_usuario: type,
      como_descobriu: discovery
    }]);

    alert('Cadastro realizado! Verifique seu e-mail.');
    window.location.href = 'vcgosta.html';
  }
}
