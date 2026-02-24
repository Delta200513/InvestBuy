import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../App';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar ? `http://localhost:5000${user.avatar}` : null);
  const [depositAmount, setDepositAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    if (avatar) {
      formData.append('avatar', avatar);
    }
    
    try {
      const response = await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage('Профиль успешно обновлен!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Ошибка при обновлении профиля');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/api/user/deposit', {
        amount: Number(depositAmount)
      });
      
      setMessage(`Успешно пополнено на $${depositAmount}!`);
      setDepositAmount('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Ошибка при пополнении');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    
    try {
      
      setMessage('Пароль успешно изменен!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError('Ошибка при смене пароля');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!')) {
      
      alert('Аккаунт удален');
      logout();
      navigate('/register');
    }
  };

  const renderProfileTab = () => (
    <div style={styles.tabContent}>
      <h3 style={styles.tabTitle}>Профиль пользователя</h3>
      
      <form onSubmit={handleProfileUpdate} style={styles.form}>
        <div style={styles.avatarSection}>
          <div style={styles.avatarContainer}>
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          <div style={styles.avatarUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={styles.fileInput}
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload" style={styles.uploadButton}>
              Выбрать фото
            </label>
            <p style={styles.uploadHint}>JPG, PNG или GIF до 5MB</p>
          </div>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Имя пользователя</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={user?.email}
            style={{...styles.input, ...styles.disabledInput}}
            disabled
          />
          <p style={styles.inputHint}>Email нельзя изменить</p>
        </div>
        
        <button type="submit" style={styles.saveButton}>
          Сохранить изменения
        </button>
      </form>
    </div>
  );

  const renderDepositTab = () => (
    <div style={styles.tabContent}>
      <h3 style={styles.tabTitle}>Пополнение баланса</h3>
      
      <div style={styles.balanceCard}>
        <div style={styles.balanceLabel}>Текущий баланс</div>
        <div style={styles.balanceValue}>${user?.budget?.toFixed(2)}</div>
      </div>
      
      <form onSubmit={handleDeposit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Сумма пополнения ($)</label>
          <input
            type="number"
            min="1"
            step="10"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            style={styles.input}
            placeholder="Введите сумму"
            required
          />
        </div>
        
        <div style={styles.quickAmounts}>
          <button 
            type="button" 
            onClick={() => setDepositAmount('100')}
            style={styles.quickAmountButton}
          >
            $100
          </button>
          <button 
            type="button" 
            onClick={() => setDepositAmount('500')}
            style={styles.quickAmountButton}
          >
            $500
          </button>
          <button 
            type="button" 
            onClick={() => setDepositAmount('1000')}
            style={styles.quickAmountButton}
          >
            $1000
          </button>
          <button 
            type="button" 
            onClick={() => setDepositAmount('5000')}
            style={styles.quickAmountButton}
          >
            $5000
          </button>
        </div>
        
        <button type="submit" style={{...styles.saveButton, ...styles.depositButton}}>
          Пополнить баланс
        </button>
      </form>
      
      <div style={styles.infoBox}>
        <h4 style={styles.infoTitle}>💡 Информация</h4>
        <p style={styles.infoText}>
          Это виртуальный счет для обучения. Все операции происходят с тестовыми средствами.
          Вы можете пополнять счет неограниченное количество раз для тренировки.
        </p>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div style={styles.tabContent}>
      <h3 style={styles.tabTitle}>Безопасность</h3>
      
      <form onSubmit={handlePasswordChange} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Текущий пароль</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Новый пароль</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
            required
            minLength="6"
          />
          <p style={styles.inputHint}>Минимум 6 символов</p>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Подтверждение пароля</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        
        <button type="submit" style={styles.saveButton}>
          Изменить пароль
        </button>
      </form>
      
      <div style={styles.dangerZone}>
        <h4 style={styles.dangerTitle}>Опасная зона</h4>
        <p style={styles.dangerText}>
          Удаление аккаунта приведет к безвозвратной потере всех данных, включая портфель и историю операций.
        </p>
        <button onClick={handleDeleteAccount} style={styles.deleteButton}>
          Удалить аккаунт
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div style={styles.tabContent}>
      <h3 style={styles.tabTitle}>Уведомления</h3>
      
      <div style={styles.settingsGroup}>
        <div style={styles.settingItem}>
          <div style={styles.settingInfo}>
            <div style={styles.settingName}>Email уведомления</div>
            <div style={styles.settingDesc}>Получать уведомления на email о сделках</div>
          </div>
          <label style={styles.switch}>
            <input 
              type="checkbox" 
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span style={styles.slider}></span>
          </label>
        </div>
        
        <div style={styles.settingItem}>
          <div style={styles.settingInfo}>
            <div style={styles.settingName}>Push уведомления</div>
            <div style={styles.settingDesc}>Уведомления в браузере о изменении цен</div>
          </div>
          <label style={styles.switch}>
            <input 
              type="checkbox" 
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
            />
            <span style={styles.slider}></span>
          </label>
        </div>
      </div>
      
      <div style={styles.settingsGroup}>
        <div style={styles.settingItem}>
          <div style={styles.settingInfo}>
            <div style={styles.settingName}>Тема оформления</div>
            <div style={styles.settingDesc}>Выберите тему для интерфейса</div>
          </div>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            style={styles.themeSelect}
          >
            <option value="light">Светлая</option>
            <option value="dark">Темная</option>
            <option value="system">Системная</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={() => setMessage('Настройки сохранены')} 
        style={styles.saveButton}
      >
        Сохранить настройки
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Навигационное меню */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>Инвестиционный Трекер</div>
        <div style={styles.navLinks}>
          <Link to="/dashboard" style={styles.navLink}>Главная</Link>
          <Link to="/portfolio" style={styles.navLink}>Портфель</Link>
          <Link to="/education" style={styles.navLink}>📚 Обучение</Link>
          <Link to="/settings" style={{...styles.navLink, ...styles.activeLink}}>Настройки</Link>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </nav>
      
      <div style={styles.content}>
        {/* Заголовок */}
        <div style={styles.header}>
          <h1 style={styles.title}>Настройки аккаунта</h1>
          <p style={styles.subtitle}>Управляйте своим профилем и настройками</p>
        </div>
        
        {/* Сообщения */}
        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}
        
        {/* Боковое меню настроек */}
        <div style={styles.settingsLayout}>
          <div style={styles.sidebar}>
            <div style={styles.userInfo}>
              <div style={styles.sidebarAvatar}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar" style={styles.sidebarAvatarImg} />
                ) : (
                  <div style={styles.sidebarAvatarPlaceholder}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div style={styles.sidebarUserName}>{user?.name}</div>
              <div style={styles.sidebarUserEmail}>{user?.email}</div>
            </div>
            
            <div style={styles.sidebarMenu}>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  ...styles.sidebarMenuItem,
                  ...(activeTab === 'profile' ? styles.sidebarMenuItemActive : {})
                }}
              >
                👤 Профиль
              </button>
              <button
                onClick={() => setActiveTab('deposit')}
                style={{
                  ...styles.sidebarMenuItem,
                  ...(activeTab === 'deposit' ? styles.sidebarMenuItemActive : {})
                }}
              >
                💰 Пополнение
              </button>
              <button
                onClick={() => setActiveTab('security')}
                style={{
                  ...styles.sidebarMenuItem,
                  ...(activeTab === 'security' ? styles.sidebarMenuItemActive : {})
                }}
              >
                🔒 Безопасность
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                style={{
                  ...styles.sidebarMenuItem,
                  ...(activeTab === 'notifications' ? styles.sidebarMenuItemActive : {})
                }}
              >
                🔔 Уведомления
              </button>
            </div>
          </div>
          
          <div style={styles.mainContent}>
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'deposit' && renderDepositTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  navbar: {
    backgroundColor: '#2c3e50',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  navBrand: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 15px',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
    fontSize: '14px'
  },
  activeLink: {
    backgroundColor: '#3498db'
  },
  logoutButton: {
    padding: '8px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s'
  },
  content: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    color: '#2c3e50',
    margin: '0 0 10px 0',
    fontSize: '28px'
  },
  subtitle: {
    color: '#7f8c8d',
    margin: 0,
    fontSize: '16px'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  settingsLayout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '30px'
  },
  sidebar: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    alignSelf: 'start'
  },
  userInfo: {
    padding: '30px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #ecf0f1'
  },
  sidebarAvatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    overflow: 'hidden',
    margin: '0 auto 15px',
    backgroundColor: '#3498db'
  },
  sidebarAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  sidebarAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    color: 'white',
    fontSize: '40px',
    fontWeight: 'bold'
  },
  sidebarUserName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '5px'
  },
  sidebarUserEmail: {
    fontSize: '14px',
    color: '#7f8c8d'
  },
  sidebarMenu: {
    padding: '20px'
  },
  sidebarMenuItem: {
    display: 'block',
    width: '100%',
    padding: '12px 15px',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    color: '#34495e',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '5px'
  },
  sidebarMenuItemActive: {
    backgroundColor: '#3498db',
    color: 'white'
  },
  mainContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  tabContent: {
    animation: 'fadeIn 0.3s ease'
  },
  tabTitle: {
    color: '#2c3e50',
    margin: '0 0 25px 0',
    fontSize: '20px',
    fontWeight: '600',
    paddingBottom: '15px',
    borderBottom: '2px solid #ecf0f1'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  avatarContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#3498db',
    flexShrink: 0
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    color: 'white',
    fontSize: '48px',
    fontWeight: 'bold'
  },
  avatarUpload: {
    flex: 1
  },
  uploadButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '8px',
    border: 'none'
  },
  uploadHint: {
    fontSize: '12px',
    color: '#7f8c8d',
    margin: 0
  },
  fileInput: {
    display: 'none'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#34495e',
    fontWeight: '500',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'border-color 0.2s'
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    color: '#95a5a6'
  },
  inputHint: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '5px'
  },
  saveButton: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px'
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '25px',
    textAlign: 'center'
  },
  balanceLabel: {
    color: '#7f8c8d',
    fontSize: '14px',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  balanceValue: {
    color: '#2c3e50',
    fontSize: '36px',
    fontWeight: 'bold'
  },
  quickAmounts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  quickAmountButton: {
    padding: '10px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  depositButton: {
    backgroundColor: '#27ae60',
    fontSize: '16px'
  },
  infoBox: {
    backgroundColor: '#e8f4fd',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '25px',
    border: '1px solid #b8e0fe'
  },
  infoTitle: {
    color: '#2c3e50',
    margin: '0 0 10px 0',
    fontSize: '16px'
  },
  infoText: {
    color: '#34495e',
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.6'
  },
  dangerZone: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#fdf0ed',
    borderRadius: '8px',
    border: '1px solid #fadbd8'
  },
  dangerTitle: {
    color: '#e74c3c',
    margin: '0 0 10px 0',
    fontSize: '18px'
  },
  dangerText: {
    color: '#34495e',
    marginBottom: '15px',
    fontSize: '14px'
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  settingsGroup: {
    marginBottom: '25px'
  },
  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  settingInfo: {
    flex: 1
  },
  settingName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: '5px'
  },
  settingDesc: {
    fontSize: '13px',
    color: '#7f8c8d'
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '24px'
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '.3s',
    borderRadius: '24px',
    '&:before': {
      position: 'absolute',
      content: '""',
      height: '18px',
      width: '18px',
      left: '3px',
      bottom: '3px',
      backgroundColor: 'white',
      transition: '.3s',
      borderRadius: '50%'
    }
  },
  themeSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    width: '150px'
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

export default Settings;