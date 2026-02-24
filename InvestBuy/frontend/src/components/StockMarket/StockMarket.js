import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StockMarket = ({ onBuy }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [chartPeriod, setChartPeriod] = useState('1D');
  const [expandedStock, setExpandedStock] = useState(null);

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stocks');
      setStocks(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setStocks([]);
      setLoading(false);
    }
  };

  const generateHistoricalData = (symbol, currentPrice) => {
    const data = [];
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000);
      const price = currentPrice * (1 + (Math.random() * 0.06 - 0.03));
      data.push({
        time: date.getHours() + ':00',
        price: Number(price.toFixed(2)),
        key: `${symbol}-${i}`
      });
    }
    
    return data;
  };

  const handleBuy = () => {
    if (!selectedStock) return;
    
    onBuy({
      symbol: selectedStock.symbol,
      quantity: quantity,
      price: selectedStock.price
    });
    
    setSelectedStock(null);
    setQuantity(1);
  };

  const toggleExpand = (symbol) => {
    setExpandedStock(expandedStock === symbol ? null : symbol);
  };

  const getChartColor = (change) => {
    return change >= 0 ? '#27ae60' : '#e74c3c';
  };

  if (loading) {
    return <div style={styles.loading}>Загрузка данных рынка...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Рынок акций</h2>
      
      {(!stocks || stocks.length === 0) ? (
        <div style={styles.emptyState}>
          <p>Нет данных об акциях</p>
        </div>
      ) : (
        <div style={styles.stockList}>
          {stocks.map(stock => (
            <div key={stock.symbol} style={styles.stockCard}>
              <div 
                style={styles.stockHeader} 
                onClick={() => toggleExpand(stock.symbol)}
              >
                <div style={styles.stockMainInfo}>
                  <div>
                    <h3 style={styles.stockSymbol}>{stock.symbol}</h3>
                    <span style={styles.stockName}>{stock.name || stock.symbol}</span>
                  </div>
                  <div style={styles.stockPriceInfo}>
                    <span style={styles.stockPrice}>
                      ${stock.price?.toFixed(2) || '0.00'}
                    </span>
                    <span style={{
                      ...styles.stockChange,
                      color: (stock.change || 0) >= 0 ? '#27ae60' : '#e74c3c'
                    }}>
                      {(stock.change || 0) >= 0 ? '+' : ''}{stock.change?.toFixed(2) || '0.00'} 
                      ({stock.changePercent?.toFixed(2) || '0.00'}%)
                    </span>
                  </div>
                </div>
                <div style={styles.expandIcon}>
                  {expandedStock === stock.symbol ? '▼' : '▶'}
                </div>
              </div>
              
              {expandedStock === stock.symbol && (
                <div style={styles.expandedContent}>
                  <div style={styles.chartContainer}>
                    <div style={styles.chartControls}>
                      {['1D', '1W', '1M'].map(period => (
                        <button
                          key={`${stock.symbol}-${period}`}
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
                    
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart 
                        data={generateHistoricalData(stock.symbol, stock.price || 100)}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={getChartColor(stock.change || 0)} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={getChartColor(stock.change || 0)} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
                        <YAxis 
                          stroke="#666" 
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Цена']}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke={getChartColor(stock.change || 0)} 
                          fillOpacity={1}
                          fill={`url(#gradient-${stock.symbol})`}
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStock(stock);
                    }}
                    style={styles.buyButton}
                  >
                    Купить {stock.symbol}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {selectedStock && (
        <div style={styles.modalOverlay} onClick={() => setSelectedStock(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Покупка {selectedStock.symbol}</h3>
            
            <div style={styles.modalInfo}>
              <p>Текущая цена: ${selectedStock.price?.toFixed(2)}</p>
              <p>Компания: {selectedStock.name || selectedStock.symbol}</p>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Количество:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={styles.input}
              />
            </div>
            
            <div style={styles.total}>
              Итого: ${((selectedStock.price || 0) * quantity).toFixed(2)}
            </div>
            
            {error && <div style={styles.error}>{error}</div>}
            
            <div style={styles.modalButtons}>
              <button 
                onClick={() => setSelectedStock(null)}
                style={{...styles.button, ...styles.cancelButton}}
              >
                Отмена
              </button>
              <button 
                onClick={handleBuy}
                style={{...styles.button, ...styles.buyButtonModal}}
              >
                Купить
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
    padding: '20px'
  },
  title: {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '24px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
    fontSize: '16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  stockList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  stockCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  stockHeader: {
    padding: '15px 20px',
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
    fontSize: '18px'
  },
  stockName: {
    color: '#7f8c8d',
    fontSize: '14px'
  },
  stockPriceInfo: {
    textAlign: 'right'
  },
  stockPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    display: 'block',
    marginBottom: '5px'
  },
  stockChange: {
    fontSize: '14px',
    fontWeight: '500'
  },
  expandIcon: {
    fontSize: '20px',
    color: '#7f8c8d',
    width: '30px',
    textAlign: 'center'
  },
  expandedContent: {
    padding: '20px',
    borderTop: '1px solid #ecf0f1',
    backgroundColor: '#fafbfc'
  },
  chartContainer: {
    marginBottom: '20px'
  },
  chartControls: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    justifyContent: 'flex-end'
  },
  periodButton: {
    padding: '5px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  },
  activePeriod: {
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db'
  },
  buyButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
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
    position: 'relative',
    zIndex: 1001
  },
  modalTitle: {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '20px'
  },
  modalInfo: {
    marginBottom: '20px',
    color: '#34495e'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#34495e'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  total: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: '20px'
  },
  error: {
    color: '#e74c3c',
    marginBottom: '15px'
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
    fontSize: '16px',
    cursor: 'pointer'
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    color: 'white'
  },
  buyButtonModal: {
    backgroundColor: '#27ae60',
    color: 'white'
  }
};

export default StockMarket;