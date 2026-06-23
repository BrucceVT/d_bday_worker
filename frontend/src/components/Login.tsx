import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => void;
  loading: boolean;
}

export function Login({ onLogin, loading }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="login-container">
      <header className="header">
        <h1>CelebraBot 🎉</h1>
        <p>Panel de Administración</p>
      </header>
      <div className="card login-card">
        <Lock size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.8, display: 'block' }} />
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Contraseña de Acceso</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required
                placeholder="Ingresa la contraseña..."
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
