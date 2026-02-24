import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../App';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  Area, AreaChart, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, ComposedChart, Bar, Scatter,
  Candlestick, BarChart
} from 'recharts';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [expandedStock, setExpandedStock] = useState(null);
  const [stockHistory, setStockHistory] = useState({});
  const [candleData, setCandleData] = useState({});
  const [chartType, setChartType] = useState('candle'); 
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#7f8c8d', '#c0392b'];

  useEffect(() => {
    isMounted.current = true;
    
    fetchPortfolio();
    
    const interval = setInterval(() => {
      if (isMounted.current) {
        fetchPortfolio();
      }
    }, 30000);
    
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (expandedStock && isMounted.current) {
      fetchStockHistory(expandedStock);
    }
  }, [expandedStock, chartPeriod, chartType]);

  useEffect(() => {
    if (portfolio?.stocks && isMounted.current) {
      generatePortfolioHistory();
    }
  }, [portfolio, chartPeriod]);

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/portfolio');
      if (isMounted.current) {
        setPortfolio(response.data);
        setLoading(false);
        const history = {};
        const candles = {};
        response.data.stocks.forEach(stock => {
          history[stock.symbol] = generateHistoricalData(stock.symbol, stock.currentPrice || stock.purchasePrice);
          candles[stock.symbol] = generateCandleData(stock.symbol, stock.currentPrice || stock.purchasePrice);
        });
        setStockHistory(history);
        setCandleData(candles);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const fetchStockHistory = useCallback(async (symbol) => {
    try {
      const currentStock = portfolio?.stocks.find(s => s.symbol === symbol);
      if (currentStock && isMounted.current) {
        const history = generateHistoricalData(symbol, currentStock.currentPrice || currentStock.purchasePrice);
        const candles = generateCandleData(symbol, currentStock.currentPrice || currentStock.purchasePrice);
        setStockHistory(prev => ({
          ...prev,
          [symbol]: history
        }));
        setCandleData(prev => ({
          ...prev,
          [symbol]: candles
        }));
      }
    } catch (error) {
      console.error('Error fetching stock history:', error);
    }
  }, [portfolio]);

  const generateCandleData = (symbol, currentPrice) => {
    const data = [];
    const now = new Date();
    let points = 0;
    let volatility = 0.1;
    
    switch(chartPeriod) {
      case '1D':
        points = 24;
        volatility = 0.03;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 60 * 60 * 1000);
          const trend = Math.sin(i / points * Math.PI * 2) * 0.02;
          const randomBase = (Math.random() * 2 - 1) * volatility;
          const open = currentPrice * (1 + randomBase + trend);
          const close = open * (1 + (Math.random() * 0.04 - 0.02));
          const high = Math.max(open, close) * (1 + Math.random() * 0.02);
          const low = Math.min(open, close) * (1 - Math.random() * 0.02);
          
          data.push({
            time: date.getHours() + ':00',
            open: Number(open.toFixed(2)),
            close: Number(close.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            volume: Math.floor(Math.random() * 1000000) + 500000,
            id: `${symbol}-candle-${i}`
          });
        }
        break;
      case '1W':
        points = 7;
        volatility = 0.08;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const trend = Math.sin(i / points * Math.PI * 2) * 0.05;
          const randomBase = (Math.random() * 2 - 1) * volatility;
          const open = currentPrice * (1 + randomBase + trend);
          const close = open * (1 + (Math.random() * 0.08 - 0.04));
          const high = Math.max(open, close) * (1 + Math.random() * 0.04);
          const low = Math.min(open, close) * (1 - Math.random() * 0.04);
          
          data.push({
            time: date.toLocaleDateString('ru', { weekday: 'short' }),
            open: Number(open.toFixed(2)),
            close: Number(close.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            volume: Math.floor(Math.random() * 5000000) + 1000000,
            id: `${symbol}-candle-${i}`
          });
        }
        break;
      case '1M':
        points = 30;
        volatility = 0.15;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const trend = Math.sin(i / 15 * Math.PI * 2) * 0.1;
          const randomBase = (Math.random() * 2 - 1) * volatility;
          const open = currentPrice * (1 + randomBase + trend);
          const close = open * (1 + (Math.random() * 0.12 - 0.06));
          const high = Math.max(open, close) * (1 + Math.random() * 0.06);
          const low = Math.min(open, close) * (1 - Math.random() * 0.06);
          
          data.push({
            time: date.getDate() + '/' + (date.getMonth() + 1),
            open: Number(open.toFixed(2)),
            close: Number(close.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            volume: Math.floor(Math.random() * 10000000) + 2000000,
            id: `${symbol}-candle-${i}`
          });
        }
        break;
      case '3M':
        points = 13;
        volatility = 0.25;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const trend = Math.sin(i / 6.5 * Math.PI * 2) * 0.15;
          const randomBase = (Math.random() * 2 - 1) * volatility;
          const open = currentPrice * (1 + randomBase + trend);
          const close = open * (1 + (Math.random() * 0.2 - 0.1));
          const high = Math.max(open, close) * (1 + Math.random() * 0.1);
          const low = Math.min(open, close) * (1 - Math.random() * 0.1);
          
          data.push({
            time: 'Нед ' + (points-i),
            open: Number(open.toFixed(2)),
            close: Number(close.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            volume: Math.floor(Math.random() * 20000000) + 5000000,
            id: `${symbol}-candle-${i}`
          });
        }
        break;
      case '1Y':
        points = 12;
        volatility = 0.4;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const trend = Math.sin(i / 6 * Math.PI * 2) * 0.2;
          const randomBase = (Math.random() * 2 - 1) * volatility;
          const open = currentPrice * (1 + randomBase + trend);
          const close = open * (1 + (Math.random() * 0.3 - 0.15));
          const high = Math.max(open, close) * (1 + Math.random() * 0.15);
          const low = Math.min(open, close) * (1 - Math.random() * 0.15);
          
          data.push({
            time: date.toLocaleDateString('ru', { month: 'short' }),
            open: Number(open.toFixed(2)),
            close: Number(close.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            volume: Math.floor(Math.random() * 50000000) + 10000000,
            id: `${symbol}-candle-${i}`
          });
        }
        break;
      default:
        break;
    }
    
    return data;
  };

  const generateHistoricalData = (symbol, currentPrice) => {
    const data = [];
    const now = new Date();
    let points = 0;
    let volatility = 0.1;
    
    switch(chartPeriod) {
      case '1D':
        points = 48; 
        volatility = 0.03;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 30 * 60 * 1000); 
          const trend = Math.sin(i / points * Math.PI * 4) * 0.01; 
          const noise1 = Math.sin(i * 5) * 0.005; 
          const noise2 = Math.cos(i * 3) * 0.003; 
          const random = (Math.random() * 2 - 1) * 0.02; 
          const change = trend + noise1 + noise2 + random;
          const price = currentPrice * (1 + change);
          data.push({
            time: date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
            price: Number(price.toFixed(2)),
            id: `${symbol}-${i}`
          });
        }
        break;
      case '1W':
        points = 7 * 24; 
        volatility = 0.08;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 60 * 60 * 1000);
          const trend = Math.sin(i / points * Math.PI * 4) * 0.03;
          const noise1 = Math.sin(i * 3) * 0.01;
          const noise2 = Math.cos(i * 2) * 0.008;
          const random = (Math.random() * 2 - 1) * 0.03;
          const change = trend + noise1 + noise2 + random;
          const price = currentPrice * (1 + change);
          data.push({
            time: date.getHours() + ':00',
            price: Number(price.toFixed(2)),
            id: `${symbol}-${i}`
          });
        }
        break;
      case '1M':
        points = 30 * 8; 
        volatility = 0.15;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 3 * 60 * 60 * 1000); // Каждые 3 часа
          const trend = Math.sin(i / points * Math.PI * 4) * 0.05;
          const noise1 = Math.sin(i * 2) * 0.02;
          const noise2 = Math.cos(i * 1.5) * 0.015;
          const random = (Math.random() * 2 - 1) * 0.05;
          const change = trend + noise1 + noise2 + random;
          const price = currentPrice * (1 + change);
          data.push({
            time: date.getDate() + '/' + (date.getMonth() + 1) + ' ' + date.getHours() + ':00',
            price: Number(price.toFixed(2)),
            id: `${symbol}-${i}`
          });
        }
        break;
      case '3M':
        points = 90;
        volatility = 0.25;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const trend = Math.sin(i / points * Math.PI * 4) * 0.08;
          const noise1 = Math.sin(i * 1.5) * 0.03;
          const noise2 = Math.cos(i) * 0.02;
          const random = (Math.random() * 2 - 1) * 0.08;
          const change = trend + noise1 + noise2 + random;
          const price = currentPrice * (1 + change);
          data.push({
            time: date.getDate() + '/' + (date.getMonth() + 1),
            price: Number(price.toFixed(2)),
            id: `${symbol}-${i}`
          });
        }
        break;
      case '1Y':
        points = 52;
        volatility = 0.4;
        for (let i = points; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const trend = Math.sin(i / points * Math.PI * 4) * 0.15;
          const noise1 = Math.sin(i) * 0.05;
          const noise2 = Math.cos(i * 0.5) * 0.04;
          const random = (Math.random() * 2 - 1) * 0.15;
          const change = trend + noise1 + noise2 + random;
          const price = currentPrice * (1 + change);
          data.push({
            time: 'Нед ' + (points-i),
            price: Number(price.toFixed(2)),
            id: `${symbol}-${i}`
          });
        }
        break;
      default:
        break;
    }
    
    return data;
  };

  const generatePortfolioHistory = useCallback(() => {
    const history = [];
    const now = new Date();
    const volatility = 0.15;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const trend = Math.sin(i / 15 * Math.PI * 2) * 0.05;
      const noise = Math.sin(i * 2) * 0.02;
      const random = (Math.random() * 2 - 1) * 0.05;
      const change = trend + noise + random;
      
      const totalValue = portfolio?.stocks.reduce((sum, stock) => {
        return sum + (stock.totalValue * (1 + change));
      }, 0) || 0;
      
      history.push({
        date: date.toLocaleDateString('ru', { day: '2-digit', month: '2-digit' }),
        value: Number((totalValue + (portfolio?.budget || 0)).toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 500000,
        id: `history-${i}`
      });
    }
    
    if (isMounted.current) {
      setPortfolioHistory(history);
    }
  }, [portfolio]);

  const handleSell = async () => {
    if (!selectedStock) return;
    
    try {
      await axios.post('http://localhost:5000/api/portfolio/sell', {
        symbol: selectedStock.symbol,
        quantity: sellQuantity,
        price: selectedStock.currentPrice
      });
      
      if (isMounted.current) {
        setSelectedStock(null);
        setSellQuantity(1);
        fetchPortfolio();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при продаже');
    }
  };

  const getTotalProfit = () => {
    if (!portfolio?.stocks) return 0;
    return portfolio.stocks.reduce((sum, stock) => sum + (stock.profit || 0), 0);
  };

  const getTotalReturn = () => {
    const totalInvested = portfolio?.stocks.reduce((sum, stock) => 
      sum + (stock.purchasePrice * stock.quantity), 0) || 0;
    const totalCurrent = portfolio?.totalValue || 0;
    
    if (totalInvested === 0) return 0;
    return ((totalCurrent - totalInvested) / totalInvested * 100).toFixed(2);
  };

  const getChartColor = (value) => {
    return value >= 0 ? '#27ae60' : '#e74c3c';
  };

  const toggleExpand = (symbol) => {
    setExpandedStock(prev => prev === symbol ? null : symbol);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderStockChart = (stock) => {
    const data = candleData[stock.symbol] || [];
    const lineData = stockHistory[stock.symbol] || [];
    
    if (data.length === 0) return null;
    
    switch(chartType) {
      case 'candle':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`candleGradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getChartColor(stock.profit)} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={getChartColor(stock.profit)} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis 
                stroke="#666" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={styles.customTooltip}>
                        <p><strong>Время:</strong> {data.time}</p>
                        <p><strong>Открытие:</strong> ${data.open}</p>
                        <p><strong>Закрытие:</strong> ${data.close}</p>
                        <p><strong>Макс:</strong> ${data.high}</p>
                        <p><strong>Мин:</strong> ${data.low}</p>
                        <p><strong>Объем:</strong> {data.volume.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Свечи */}
              {data.map((entry, index) => {
                const isGreen = entry.close >= entry.open;
                return (
                  <Bar
                    key={`candle-${index}`}
                    dataKey="volume"
                    stackId="a"
                    fill="transparent"
                    shape={({ x, y, width, height }) => {
                      const candleWidth = Math.min(width, 10);
                      const xCenter = x + width / 2;
                      const maxY = y - (entry.high - entry.close) * 10;
                      const minY = y + (entry.close - entry.low) * 10;
                      
                      return (
                        <g>
                          {/* Тень свечи (high-low) */}
                          <line
                            x1={xCenter}
                            y1={y - (entry.high - entry.close) * 10}
                            x2={xCenter}
                            y2={y + (entry.close - entry.low) * 10}
                            stroke="#666"
                            strokeWidth={1}
                          />
                          {/* Тело свечи */}
                          <rect
                            x={xCenter - candleWidth / 2}
                            y={isGreen ? y - (entry.close - entry.open) * 10 : y}
                            width={candleWidth}
                            height={Math.abs(entry.close - entry.open) * 10}
                            fill={isGreen ? '#27ae60' : '#e74c3c'}
                            fillOpacity={0.8}
                          />
                        </g>
                      );
                    }}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`lineGradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getChartColor(stock.profit)} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={getChartColor(stock.profit)} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis 
                stroke="#666" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Цена']}
                labelFormatter={(label) => `Время: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={getChartColor(stock.profit)} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`areaGradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getChartColor(stock.profit)} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getChartColor(stock.profit)} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis 
                stroke="#666" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Цена']}
                labelFormatter={(label) => `Время: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={getChartColor(stock.profit)} 
                fillOpacity={1}
                fill={`url(#areaGradient-${stock.symbol})`}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis 
                stroke="#666" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Цена']}
                labelFormatter={(label) => `Время: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Scatter 
                data={lineData} 
                line={{ stroke: getChartColor(stock.profit), strokeWidth: 1 }}
                lineType="fitting"
                lineJointType="monotoneX"
              >
                {lineData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getChartColor(stock.profit)} 
                    fillOpacity={0.6}
                  />
                ))}
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
              <YAxis 
                yAxisId="left"
                stroke="#666" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
                domain={['auto', 'auto']}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#666" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.toLocaleString()}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={styles.customTooltip}>
                        <p><strong>Время:</strong> {payload[0].payload.time}</p>
                        <p><strong>Цена:</strong> ${payload[0].value}</p>
                        <p><strong>Объем:</strong> {payload[1]?.value.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                yAxisId="right"
                dataKey="volume" 
                fill="#95a5a6" 
                opacity={0.3}
                barSize={10}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="price" 
                stroke={getChartColor(stock.profit)} 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Загрузка портфеля...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Навигационное меню */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>Инвестиционный Трекер</div>
        <div style={styles.navLinks}>
          <Link to="/dashboard" style={styles.navLink}>Главная</Link>
          <Link to="/portfolio" style={{...styles.navLink, ...styles.activeLink}}>Портфель</Link>
          <Link to="/education" style={styles.navLink}>📚 Обучение</Link>
          <Link to="/settings" style={styles.navLink}>Настройки</Link>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </nav>
      

      <div style={styles.content}>
        {/* Шапка портфеля */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Мой портфель</h1>
            <p style={styles.welcome}>Добро пожаловать, {user?.name}!</p>
          </div>
        </div>

        {/* Сводка */}
        <div style={styles.summary}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryLabel}>Доступный баланс</h3>
            <p style={styles.summaryValue}>${portfolio?.budget?.toFixed(2)}</p>
          </div>
          
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryLabel}>Стоимость портфеля</h3>
            <p style={styles.summaryValue}>${portfolio?.totalValue?.toFixed(2)}</p>
          </div>
          
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryLabel}>Общая стоимость</h3>
            <p style={styles.summaryValue}>
              ${((portfolio?.budget || 0) + (portfolio?.totalValue || 0)).toFixed(2)}
            </p>
          </div>
          
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryLabel}>Прибыль/Убыток</h3>
            <p style={{
              ...styles.summaryValue,
              color: getTotalProfit() >= 0 ? '#27ae60' : '#e74c3c'
            }}>
              ${getTotalProfit().toFixed(2)}
            </p>
          </div>
          
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryLabel}>Доходность</h3>
            <p style={{
              ...styles.summaryValue,
              color: getTotalReturn() >= 0 ? '#27ae60' : '#e74c3c'
            }}>
              {getTotalReturn()}%
            </p>
          </div>
        </div>
        
        {/* График портфеля */}
        {portfolioHistory.length > 0 && (
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.sectionTitle}>Динамика портфеля</h3>
              <div style={styles.chartControls}>
                {['1W', '1M', '3M', '1Y'].map(period => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    style={{
                      ...styles.periodButton,
                      ...(chartPeriod === period ? styles.activePeriod : {})
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={portfolioHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3498db" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis 
                  yAxisId="left"
                  stroke="#666"
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#666"
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={styles.customTooltip}>
                          <p><strong>Дата:</strong> {payload[0].payload.date}</p>
                          <p><strong>Стоимость:</strong> ${payload[0].value}</p>
                          <p><strong>Объем:</strong> {payload[1]?.value.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="volume" 
                  fill="#95a5a6" 
                  opacity={0.2}
                  barSize={15}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3498db" 
                  fillOpacity={1}
                  fill="url(#portfolioGradient)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Список акций */}
        <div style={styles.portfolioCard}>
          <div style={styles.stocksHeader}>
            <h2 style={styles.sectionTitle}>Мои акции</h2>
            <div style={styles.chartTypeSelector}>
              <span style={styles.chartTypeLabel}>Тип графика:</span>
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
                style={styles.chartTypeSelect}
              >
                <option value="candle">Свечной</option>
                <option value="line">Линейный</option>
                <option value="area">Область</option>
                <option value="scatter">Точечный</option>
                <option value="bar">Баровый</option>
              </select>
            </div>
          </div>
          
          {!portfolio?.stocks || portfolio.stocks.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyMessage}>У вас пока нет акций</p>
              <p style={styles.emptySubMessage}>Перейдите на главную страницу, чтобы начать торговать</p>
              <Link to="/dashboard" style={styles.goToMarketButton}>
                Перейти к рынку
              </Link>
            </div>
          ) : (
            <div style={styles.stocksList}>
              {portfolio.stocks.map(stock => (
                <div key={stock.symbol} style={styles.stockCard}>
                  <div style={styles.stockHeader} onClick={() => toggleExpand(stock.symbol)}>
                    <div style={styles.stockMainInfo}>
                      <div>
                        <h3 style={styles.stockSymbol}>{stock.symbol}</h3>
                        <span style={styles.stockName}>{stock.name || stock.symbol}</span>
                      </div>
                      <div style={styles.stockPriceInfo}>
                        <span style={styles.stockPrice}>
                          ${stock.currentPrice?.toFixed(2)}
                        </span>
                        <span style={{
                          ...styles.stockChange,
                          color: stock.profit >= 0 ? '#27ae60' : '#e74c3c'
                        }}>
                          {stock.profit >= 0 ? '+' : ''}{stock.profit?.toFixed(2)} 
                          ({((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice * 100).toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div style={styles.expandIcon}>
                      {expandedStock === stock.symbol ? '▼' : '▶'}
                    </div>
                  </div>
                  
                  <div style={styles.stockDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Количество:</span>
                      <span style={styles.detailValue}>{stock.quantity} шт.</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Средняя цена:</span>
                      <span style={styles.detailValue}>${stock.purchasePrice?.toFixed(2)}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Общая стоимость:</span>
                      <span style={styles.detailValue}>${stock.totalValue?.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {expandedStock === stock.symbol && (
                    <div style={styles.expandedContent}>
                      <div style={styles.stockChart}>
                        {renderStockChart(stock)}
                      </div>
                      
                      <button 
                        onClick={() => setSelectedStock(stock)}
                        style={styles.sellButton}
                      >
                        Продать {stock.symbol}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Круговая диаграмма распределения */}
        {portfolio?.stocks && portfolio.stocks.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.sectionTitle}>Распределение портфеля</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={portfolio.stocks.map((stock, index) => ({
                    name: stock.symbol,
                    value: stock.totalValue,
                    id: index
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  outerRadius={120}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {portfolio.stocks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Стоимость']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Модальное окно продажи */}
      {selectedStock && (
        <div style={styles.modalOverlay} onClick={() => setSelectedStock(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Продажа {selectedStock.symbol}</h3>
            
            <div style={styles.modalInfo}>
              <p><strong>В наличии:</strong> {selectedStock.quantity} шт.</p>
              <p><strong>Текущая цена:</strong> ${selectedStock.currentPrice?.toFixed(2)}</p>
              <p><strong>Средняя цена покупки:</strong> ${selectedStock.purchasePrice?.toFixed(2)}</p>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Количество для продажи:</label>
              <input
                type="number"
                min="1"
                max={selectedStock.quantity}
                value={sellQuantity}
                onChange={(e) => setSellQuantity(Math.min(
                  selectedStock.quantity,
                  Math.max(1, parseInt(e.target.value) || 1)
                ))}
                style={styles.input}
              />
            </div>
            
            <div style={styles.total}>
              Итого к получению: ${(selectedStock.currentPrice * sellQuantity).toFixed(2)}
            </div>
            
            <div style={styles.profitLoss}>
              Прибыль/Убыток: 
              <span style={{
                color: ((selectedStock.currentPrice - selectedStock.purchasePrice) * sellQuantity) >= 0 ? '#27ae60' : '#e74c3c',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                ${((selectedStock.currentPrice - selectedStock.purchasePrice) * sellQuantity).toFixed(2)}
              </span>
            </div>
            
            <div style={styles.modalButtons}>
              <button 
                onClick={() => setSelectedStock(null)}
                style={{...styles.button, ...styles.cancelButton}}
              >
                Отмена
              </button>
              <button 
                onClick={handleSell}
                style={{...styles.button, ...styles.sellButtonModal}}
              >
                Продать
              </button>
            </div>
          </div>
        </div>
      )}
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
    padding: '30px'
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loading: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: '18px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#2c3e50',
    margin: '0 0 5px 0',
    fontSize: '24px'
  },
  welcome: {
    color: '#7f8c8d',
    margin: 0,
    fontSize: '14px'
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  },
  summaryLabel: {
    color: '#7f8c8d',
    margin: '0 0 10px 0',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  summaryValue: {
    color: '#2c3e50',
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  chartControls: {
    display: 'flex',
    gap: '10px'
  },
  periodButton: {
    padding: '5px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s'
  },
  activePeriod: {
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db'
  },
  portfolioCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  stocksHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  chartTypeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  chartTypeLabel: {
    color: '#7f8c8d',
    fontSize: '14px'
  },
  chartTypeSelect: {
    padding: '5px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  sectionTitle: {
    color: '#2c3e50',
    margin: 0,
    fontSize: '18px',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  emptyMessage: {
    color: '#2c3e50',
    fontSize: '18px',
    marginBottom: '10px'
  },
  emptySubMessage: {
    color: '#7f8c8d',
    fontSize: '14px',
    marginBottom: '20px'
  },
  goToMarketButton: {
    display: 'inline-block',
    padding: '12px 30px',
    backgroundColor: '#3498db',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'background-color 0.2s'
  },
  stocksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  stockCard: {
    border: '1px solid #ecf0f1',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'all 0.2s'
  },
  stockHeader: {
    padding: '15px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    transition: 'background-color 0.2s'
  },
  stockMainInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginRight: '15px'
  },
  stockSymbol: {
    color: '#2c3e50',
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: '600'
  },
  stockName: {
    color: '#7f8c8d',
    fontSize: '12px'
  },
  stockPriceInfo: {
    textAlign: 'right'
  },
  stockPrice: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    display: 'block',
    marginBottom: '5px'
  },
  stockChange: {
    fontSize: '12px',
    fontWeight: '500'
  },
  expandIcon: {
    fontSize: '16px',
    color: '#7f8c8d',
    width: '30px',
    textAlign: 'center'
  },
  stockDetails: {
    padding: '15px',
    backgroundColor: 'white',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    borderTop: '1px solid #ecf0f1'
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column'
  },
  detailLabel: {
    color: '#7f8c8d',
    fontSize: '11px',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  detailValue: {
    color: '#2c3e50',
    fontSize: '14px',
    fontWeight: '500'
  },
  expandedContent: {
    padding: '15px',
    backgroundColor: '#fafbfc',
    borderTop: '1px solid #ecf0f1'
  },
  stockChart: {
    marginBottom: '15px'
  },
  sellButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  customTooltip: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    fontSize: '12px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1001
  },
  modalTitle: {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: '600'
  },
  modalInfo: {
    marginBottom: '20px',
    color: '#34495e',
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    fontSize: '14px',
    lineHeight: '1.8'
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
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'border-color 0.2s'
  },
  total: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#f0f9f0',
    borderRadius: '4px'
  },
  profitLoss: {
    fontSize: '14px',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  modalButtons: {
    display: 'flex',
    gap: '10px'
  },
  button: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: 'white'
  },
  sellButtonModal: {
    backgroundColor: '#e74c3c',
    color: 'white'
  }
};

export default Portfolio;