import React, { useState } from 'react';
import { LogoIcon } from './Icons';

interface LoginScreenProps {
  onLogin: (user: string, pass: string) => boolean;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username, password);
    if (!success) {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col items-center space-y-2">
          <LogoIcon className="h-12 w-12 text-indigo-500" />
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
            CONTROLE+
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Usuário
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Senha
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
