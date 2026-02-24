import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../App';

const Education = () => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const lessons = [
    {
      title: 'Введение в инвестиции',
      content: 'Инвестиции — это вложение денег с целью получения дохода или сохранения капитала. Вы можете инвестировать в различные активы: акции, облигации, недвижимость и многое другое. Наш тренажер поможет вам научиться инвестировать без риска потерять реальные деньги.',
      tips: [
        'Начинайте инвестировать раньше — сложный процент работает на вас',
        'Диверсифицируйте портфель — не кладите все яйца в одну корзину',
        'Инвестируйте на долгий срок, а не пытайтесь заработать быстро',
        'Изучайте компании перед покупкой их акций'
      ],
      emoji: '📈'
    },
    {
      title: 'Что такое акции?',
      content: 'Акция — это ценная бумага, которая дает право на владение частью компании. Покупая акцию, вы становитесь совладельцем бизнеса. Компании продают акции, чтобы привлечь деньги для развития. Цены на акции меняются каждый день в зависимости от спроса и предложения.',
      tips: [
        'Обыкновенные акции дают право голоса на собраниях акционеров',
        'Привилегированные акции гарантируют фиксированные дивиденды',
        'Цена акции может расти и падать — это нормально',
        'Дивиденды — это часть прибыли компании, которая выплачивается акционерам'
      ],
      emoji: '📊'
    },
    {
      title: 'Как читать графики акций',
      content: 'Графики акций показывают изменение цены за определенный период. Они помогают понять, как движется цена и принять решение о покупке или продаже. На наших графиках вы видите цену открытия, закрытия, максимум и минимум за период, а также объем торгов.',
      tips: [
        'Зеленый цвет означает рост цены, красный — падение',
        'Чем выше объем торгов, тем значимее движение цены',
        'Используйте разные таймфреймы для анализа (день, неделя, месяц)',
        'Ищите тренды — цена может двигаться вверх, вниз или вбок'
      ],
      emoji: '📉'
    },
    {
      title: 'Управление рисками',
      content: 'Управление рисками — самый важный навык инвестора. Никогда не инвестируйте последние деньги, всегда имейте подушку безопасности. Диверсификация помогает снизить риски: если одна компания падает, другие могут расти и компенсировать убытки.',
      tips: [
        'Не вкладывайте в одну акцию больше 10-20% портфеля',
        'Используйте стоп-лоссы для ограничения убытков',
        'Инвестируйте только те деньги, которые готовы потерять',
        'Регулярно пересматривайте и балансируйте портфель'
      ],
      emoji: '🛡️'
    },
    {
      title: 'Как пользоваться нашим тренажером',
      content: 'Наш тренажер полностью имитирует реальную биржу, но использует виртуальные деньги. Вы можете покупать и продавать акции, следить за портфелем и учиться на своих ошибках без финансовых потерь. Начните со 100 000 виртуальных долларов и попробуйте разные стратегии!',
      tips: [
        'На главной странице вы видите все доступные акции',
        'В портфеле отслеживается ваша прибыль и убытки',
        'Баланс можно пополнять в настройках (виртуально)',
        'Пробуйте разные стратегии — агрессивную и консервативную'
      ],
      emoji: '🎮'
    }
  ];

  const nextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const previousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const completeTraining = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const progress = ((currentLesson + 1) / lessons.length) * 100;

  return (
    <div style={styles.container}>
      {/* Навигационная панель */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>📈 InvestMobile</div>
        <div style={styles.navLinks}>
          <Link to="/dashboard" style={styles.navLink}>Главная</Link>
          <Link to="/portfolio" style={styles.navLink}>Портфель</Link>
          <Link to="/education" style={{...styles.navLink, ...styles.activeLink}}>📚 Обучение</Link>
          <Link to="/settings" style={styles.navLink}>Настройки</Link>
          <button onClick={handleLogout} style={styles.logoutButton}>Выйти</button>
        </div>
      </nav>

      <div style={styles.header}>
        <h1 style={styles.title}>📚 Обучение инвестициям</h1>
        <p style={styles.subtitle}>
          Пройдите короткий курс, чтобы научиться инвестировать
        </p>
      </div>
      
      <div style={styles.lessonContainer}>
        {/* Прогресс-бар */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${progress}%`
              }}
            />
          </div>
          <span style={styles.progressText}>
            Урок {currentLesson + 1} из {lessons.length}
          </span>
        </div>
        
        {/* Карточка с уроком */}
        <div style={styles.lessonCard}>
          <div style={styles.lessonHeader}>
            <span style={styles.lessonEmoji}>{lessons[currentLesson].emoji}</span>
            <h2 style={styles.lessonTitle}>{lessons[currentLesson].title}</h2>
          </div>
          
          <p style={styles.lessonContent}>{lessons[currentLesson].content}</p>
          
          <div style={styles.tipsContainer}>
            <h3 style={styles.tipsTitle}>💡 Важные советы:</h3>
            <ul style={styles.tipsList}>
              {lessons[currentLesson].tips.map((tip, index) => (
                <li key={index} style={styles.tipItem}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Навигация между уроками */}
        <div style={styles.navigation}>
          <button 
            onClick={previousLesson}
            disabled={currentLesson === 0}
            style={{
              ...styles.navButton,
              ...styles.prevButton,
              ...(currentLesson === 0 ? styles.disabledButton : {})
            }}
          >
            ← Назад
          </button>
          
          {currentLesson === lessons.length - 1 ? (
            <button 
              onClick={completeTraining}
              style={{...styles.navButton, ...styles.completeButton}}
            >
              Начать торговлю →
            </button>
          ) : (
            <button 
              onClick={nextLesson}
              style={{...styles.navButton, ...styles.nextButton}}
            >
              Далее →
            </button>
          )}
        </div>
      </div>
      
      {/* Дополнительная информация */}
      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          🎯 После обучения вы попадете на главную страницу, где сможете 
          применить полученные знания на практике с виртуальным счетом в 100 000$
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
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
  header: {
    textAlign: 'center',
    padding: '30px 20px 20px'
  },
  title: {
    color: '#2c3e50',
    fontSize: '36px',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#7f8c8d',
    fontSize: '18px'
  },
  lessonContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px'
  },
  progressContainer: {
    marginBottom: '20px',
    textAlign: 'center'
  },
  progressBar: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    transition: 'width 0.3s ease'
  },
  progressText: {
    color: '#7f8c8d',
    fontSize: '14px'
  },
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  lessonHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #ecf0f1',
    paddingBottom: '15px'
  },
  lessonEmoji: {
    fontSize: '40px',
    marginRight: '15px'
  },
  lessonTitle: {
    color: '#2c3e50',
    fontSize: '24px',
    margin: 0
  },
  lessonContent: {
    color: '#34495e',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '25px'
  },
  tipsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px'
  },
  tipsTitle: {
    color: '#2c3e50',
    fontSize: '18px',
    marginBottom: '15px'
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  tipItem: {
    color: '#34495e',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '10px',
    paddingLeft: '20px'
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px'
  },
  navButton: {
    padding: '12px 25px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  },
  prevButton: {
    backgroundColor: '#95a5a6',
    color: 'white'
  },
  nextButton: {
    backgroundColor: '#3498db',
    color: 'white'
  },
  completeButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    flex: 1,
    maxWidth: '200px',
    marginLeft: 'auto'
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  infoBox: {
    maxWidth: '800px',
    margin: '30px auto 0',
    padding: '20px',
    backgroundColor: '#e8f4fd',
    borderRadius: '8px',
    borderLeft: '4px solid #3498db'
  },
  infoText: {
    color: '#2c3e50',
    fontSize: '15px',
    lineHeight: '1.5',
    margin: 0
  }
};

export default Education;