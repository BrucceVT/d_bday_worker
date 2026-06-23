import { useState, useEffect } from 'react';
import type { Birthday } from './types';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { ListView } from './components/ListView';
import { BirthdayModal } from './components/BirthdayModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787';

function App() {
  const [password, setPassword] = useState<string>(() => localStorage.getItem('bday_pwd') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(false);
  
  // View State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | undefined>(undefined);

  const fetchBirthdays = async (pwd: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/birthdays`, {
        headers: {
          'Authorization': pwd
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBirthdays(data);
        setIsAuthenticated(true);
        localStorage.setItem('bday_pwd', pwd);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('bday_pwd');
        if (pwd) alert('Contraseña incorrecta');
      }
    } catch (err) {
      console.error('Error fetching birthdays:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (password) {
      fetchBirthdays(password);
    }
  }, []);

  const handleLogin = (pwd: string) => {
    setPassword(pwd);
    fetchBirthdays(pwd);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('bday_pwd');
  };

  const openAddModal = () => {
    setEditingBirthday(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (bday: Birthday) => {
    setEditingBirthday(bday);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBirthday(undefined);
  };

  const handleSaveBirthday = async (data: Partial<Birthday>) => {
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id ? `${API_URL}/api/birthdays/${data.id}` : `${API_URL}/api/birthdays`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': password
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        closeModal();
        fetchBirthdays(password);
      }
    } catch (err) {
      console.error('Error saving birthday:', err);
    }
  };

  const handleDeleteBirthday = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cumpleaños?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/birthdays/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': password
        }
      });
      
      if (res.ok) {
        fetchBirthdays(password);
      }
    } catch (err) {
      console.error('Error deleting birthday:', err);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        onLogout={handleLogout} 
        onAddBirthday={openAddModal} 
      />

      <main className="main-content">
        {viewMode === 'calendar' ? (
          <CalendarView birthdays={birthdays} onEditBirthday={openEditModal} />
        ) : (
          <ListView 
            birthdays={birthdays} 
            onEditBirthday={openEditModal} 
            onDeleteBirthday={handleDeleteBirthday} 
          />
        )}
      </main>

      {isModalOpen && (
        <BirthdayModal 
          birthday={editingBirthday} 
          onClose={closeModal} 
          onSave={handleSaveBirthday} 
        />
      )}
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
