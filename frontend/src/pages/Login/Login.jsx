import React, { useState } from 'react';
import { loginUsuario, registrarUsuario } from '../../services/api';
import './Login.css';

export default function Login({ onLoginSucesso }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      if (isLogin) {
        const data = await loginUsuario(email, senha);
        onLoginSucesso(data);
      } else {
        const data = await registrarUsuario(nome, email, senha);
        onLoginSucesso(data);
      }
    } catch (err) {
      setErro(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <header className="login-header">
          <div className="logo-placeholder">📊</div>
          <h1>StatFlow</h1>
          <p>{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta para começar'}</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="input-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required={!isLogin}
                placeholder="Ex: Ricardo Silva"
              />
            </div>
          )}

          <div className="input-group">
            <label>E-mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="seu@email.com"
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <footer className="login-footer">
          <button onClick={() => setIsLogin(!isLogin)} className="btn-switch">
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
          </button>
        </footer>
      </div>
    </div>
  );
}
