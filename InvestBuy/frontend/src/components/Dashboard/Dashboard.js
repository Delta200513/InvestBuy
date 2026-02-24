import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../App';
import StockMarket from '../StockMarket/StockMarket';
import axios from 'axios';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const handleBuy = async (order) => {
    try {
      await axios.post('http://localhost:5000/api/portfolio/buy', order);
      alert('Покупка успешно выполнена!');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при покупке');
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>📈 InvestMobile</div>
        <div style={styles.navLinks}>
          <Link to="/dashboard" style={styles.navLink}>Главная</Link>
          <Link to="/portfolio" style={styles.navLink}>Портфель</Link>
          <Link to="/education" style={styles.navLink}>📚 Обучение</Link>
          <Link to="/settings" style={styles.navLink}>Настройки</Link>
          <button onClick={logout} style={styles.logoutButton}>Выйти</button>
        </div>
      </nav>
      
      <div style={styles.content}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>Добро пожаловать, {user?.name}!</h1>
          <p style={styles.welcomeText}>
            Ваш виртуальный баланс: <strong>${user?.budget?.toFixed(2)}</strong>
          </p>
          <Link to="/education" style={styles.quickLink}>
            📚 Пройти обучение
          </Link>
        </div>
        
        <StockMarket onBuy={handleBuy} />
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
    fontSize: '14px',
    ':hover': {
      backgroundColor: '#34495e'
    }
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
    padding: '30px'
  },
  welcomeSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    position: 'relative'
  },
  welcomeTitle: {
    color: '#2c3e50',
    margin: '0 0 10px 0'
  },
  welcomeText: {
    color: '#7f8c8d',
    margin: 0,
    fontSize: '18px'
  },
  quickLink: {
    position: 'absolute',
    top: '30px',
    right: '30px',
    backgroundColor: '#3498db',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#2980b9'
    }
  }
};

export default Dashboard;