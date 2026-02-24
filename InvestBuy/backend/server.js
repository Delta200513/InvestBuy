const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  }
});

const DB_PATH = process.env.DB_PATH || 'database';
const DB_FILE = process.env.DB_FILE || 'db.json';
const DB_FULL_PATH = path.join(__dirname, DB_PATH, DB_FILE);

console.log(`Using database: ${DB_FULL_PATH}`);

if (!fs.existsSync(path.dirname(DB_FULL_PATH))) {
  fs.mkdirSync(path.dirname(DB_FULL_PATH), { recursive: true });
}

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

if (!fs.existsSync(DB_FULL_PATH)) {
  const initialData = {
    users: [],
    stocks: [],
    transactions: [],
    portfolios: [],
    lastStockUpdate: null
  };
  fs.writeFileSync(DB_FULL_PATH, JSON.stringify(initialData, null, 2));
  console.log(`Created new database file: ${DB_FILE}`);
}

const adapter = new JSONFile(DB_FULL_PATH);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  if (!db.data) {
    db.data = { 
      users: [], 
      stocks: [], 
      transactions: [], 
      portfolios: [],
      lastStockUpdate: null 
    };
    await db.write();
    console.log('Database initialized');
  }
}
initDB();

const DATA_SOURCE = process.env.DATA_SOURCE || 'api';
const TWELVEDATA_API_KEY = '250526dbb21b4e2aa7d495445633e1fb';
const CACHE_DURATION = 5 * 60 * 1000; 

console.log(`Data source: ${DATA_SOURCE}`);
console.log(`API Key: ${TWELVEDATA_API_KEY ? '✓ Present' : '✗ Missing'}`);
console.log(`Cache: 5 minutes`);

// Функция для локального ценообразования 

function getCompanyName(symbol) {
  const names = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'NVDA': 'NVIDIA Corporation',
    'AMD': 'Advanced Micro Devices Inc.',
    'INTC': 'Intel Corporation',
    'IBM': 'International Business Machines',
    'ORCL': 'Oracle Corporation',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
    'DIS': 'The Walt Disney Company'
  };
  return names[symbol] || symbol;
}

// Реалистичные цены для всех акций (обновляются из API)
const basePrices = {
  'AAPL': 268.89, 'GOOGL': 314.32, 'MSFT': 387.15, 'AMZN': 204.63,
  'TSLA': 396.66, 'META': 643.16, 'NFLX': 76.17, 'NVDA': 191.12,
  'AMD': 165.80, 'INTC': 43.58, 'IBM': 245.38, 'ORCL': 138.85,
  'JPM': 295.61, 'V': 310.62, 'WMT': 125.44, 'DIS': 103.46
};

function getMockStocks() {
  const symbols = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA',
    'AMD', 'INTC', 'IBM', 'ORCL', 'JPM', 'V', 'WMT', 'DIS'
  ];
  
  return symbols.map(symbol => {
    const basePrice = basePrices[symbol] || 100.00;
    
    const changePercent = (Math.random() * 0.2 - 0.1) / 100;
    const change = basePrice * changePercent;
    const currentPrice = basePrice + change;
    
    return {
      symbol,
      name: getCompanyName(symbol),
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number((changePercent * 100).toFixed(2)),
      high: Number((basePrice * 1.01).toFixed(2)),
      low: Number((basePrice * 0.99).toFixed(2)),
      open: Number((basePrice * 0.995).toFixed(2)),
      previousClose: Number(basePrice.toFixed(2))
    };
  });
}

/**
 * ОПТИМИЗИРОВАННАЯ функция для Twelve Data API
 * Запрашивает только ключевые акции, остальные берутся из базы
 */
async function fetchTwelveDataStocks() {
  // Сначала пробуем получить самые важные акции
  const prioritySymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA'];
  const stocks = [];
  
  console.log('📡 Fetching priority stocks from Twelve Data API...');
  
  
  const currentStocks = db.data?.stocks || [];
  const currentPrices = {};
  currentStocks.forEach(s => { currentPrices[s.symbol] = s.price; });
  
  for (const symbol of prioritySymbols) {
    try {
      const response = await axios.get(
        `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVEDATA_API_KEY}`,
        { timeout: 5000 }
      );
      
      if (response.data && response.data.close && response.data.close !== '0.00') {
        const price = parseFloat(response.data.close);
        stocks.push({
          symbol,
          name: response.data.name || getCompanyName(symbol),
          price,
          change: parseFloat(response.data.change || 0),
          changePercent: parseFloat(response.data.percent_change || 0),
          high: parseFloat(response.data.high || price * 1.02),
          low: parseFloat(response.data.low || price * 0.98),
          open: parseFloat(response.data.open || price),
          previousClose: parseFloat(response.data.previous_close || price)
        });
        
        
        basePrices[symbol] = price;
        console.log(`✅ Twelve Data: ${symbol} $${price.toFixed(2)}`);
      } else {
        console.log(`⚠️ No Twelve Data for ${symbol}`);
      }
    } catch (error) {
      console.log(`⚠️ Twelve Data error for ${symbol}: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return stocks;
}

/**
 * Проверка, нужно ли обновлять кэш
 */
function shouldUpdateCache() {
  if (!db.data.lastStockUpdate) {
    console.log('🕐 No cached data found, need update');
    return true;
  }
  
  const lastUpdate = new Date(db.data.lastStockUpdate);
  const now = new Date();
  const timeDiff = now.getTime() - lastUpdate.getTime();
  const minutesSinceUpdate = Math.floor(timeDiff / (1000 * 60));
  
  console.log(`🕐 Last update: ${minutesSinceUpdate} minutes ago`);
  
  return timeDiff > CACHE_DURATION;
}


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};


app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    await db.read();
    
    if (db.data.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      avatar: null,
      budget: 100000,
      createdAt: new Date().toISOString()
    };
    
    db.data.users.push(newUser);
    db.data.portfolios.push({ userId: newUser.id, stocks: [] });
    await db.write();
    
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: newUser.id, email, name, budget: 100000 } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    await db.read();
    
    const user = db.data.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name, budget: user.budget } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * ГЛАВНЫЙ ЭНДПОИНТ - ПОЛУЧЕНИЕ АКЦИЙ
 */
app.get('/api/stocks', async (req, res) => {
  try {
    await db.read();
    
    const needUpdate = shouldUpdateCache();
    let stocks = [];
    
    if (needUpdate) {
      console.log('🔄 Cache expired, fetching new data...');
      
      
      const freshStocks = await fetchTwelveDataStocks();
      
      // Берем текущие акции из базы
      const currentStocks = db.data.stocks || getMockStocks();
      
      // Обновляем цены для тех, что получили из API
      const updatedStocks = currentStocks.map(stock => {
        const freshStock = freshStocks.find(s => s.symbol === stock.symbol);
        if (freshStock) {
          return freshStock;
        }
        return stock;
      });
      
      stocks = updatedStocks;
      
      
      db.data.stocks = stocks;
      db.data.lastStockUpdate = new Date().toISOString();
      await db.write();
      
      console.log(`✅ Cache updated with ${stocks.length} stocks at ${new Date().toLocaleTimeString()}`);
    } else {
      console.log('📦 Using cached stock data');
      stocks = db.data.stocks || getMockStocks();
    }
    
    res.json(stocks);
  } catch (error) {
    console.error('❌ Error:', error);
    res.json(getMockStocks());
  }
});

app.post('/api/stocks/refresh', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Manual stock refresh requested');
    
    const freshStocks = await fetchTwelveDataStocks();
    const currentStocks = db.data.stocks || getMockStocks();
    
    const updatedStocks = currentStocks.map(stock => {
      const freshStock = freshStocks.find(s => s.symbol === stock.symbol);
      if (freshStock) {
        return freshStock;
      }
      return stock;
    });
    
    db.data.stocks = updatedStocks;
    db.data.lastStockUpdate = new Date().toISOString();
    await db.write();
    
    res.json({ 
      message: 'Stocks refreshed successfully', 
      count: updatedStocks.length,
      timestamp: db.data.lastStockUpdate 
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh stocks' });
  }
});

app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    await db.read();
    const portfolio = db.data.portfolios.find(p => p.userId === req.user.id);
    const user = db.data.users.find(u => u.id === req.user.id);
    
    if (!portfolio) {
      return res.json({ stocks: [], totalValue: 0, budget: user.budget });
    }
    
    const cachedStocks = db.data.stocks || [];
    
    const stocksWithPrices = portfolio.stocks.map(item => {
      const cachedStock = cachedStocks.find(s => s.symbol === item.symbol);
      const currentPrice = cachedStock ? cachedStock.price : item.purchasePrice;
      
      return {
        ...item,
        currentPrice: Number(currentPrice.toFixed(2)),
        totalValue: Number((currentPrice * item.quantity).toFixed(2)),
        profit: Number(((currentPrice - item.purchasePrice) * item.quantity).toFixed(2))
      };
    });
    
    const totalValue = stocksWithPrices.reduce((sum, item) => sum + item.totalValue, 0);
    
    res.json({
      stocks: stocksWithPrices,
      totalValue: Number(totalValue.toFixed(2)),
      budget: user.budget
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

app.post('/api/portfolio/buy', authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    await db.read();
    
    const userIndex = db.data.users.findIndex(u => u.id === req.user.id);
    let portfolioIndex = db.data.portfolios.findIndex(p => p.userId === req.user.id);
    
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    
    if (portfolioIndex === -1) {
      db.data.portfolios.push({ userId: req.user.id, stocks: [] });
      portfolioIndex = db.data.portfolios.length - 1;
    }
    
    const totalCost = price * quantity;
    
    if (db.data.users[userIndex].budget < totalCost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    db.data.users[userIndex].budget -= totalCost;
    
    const existingIndex = db.data.portfolios[portfolioIndex].stocks.findIndex(s => s.symbol === symbol);
    
    if (existingIndex !== -1) {
      const existing = db.data.portfolios[portfolioIndex].stocks[existingIndex];
      const newQuantity = existing.quantity + quantity;
      const newAvgPrice = (existing.quantity * existing.purchasePrice + totalCost) / newQuantity;
      
      db.data.portfolios[portfolioIndex].stocks[existingIndex] = {
        ...existing,
        quantity: newQuantity,
        purchasePrice: Number(newAvgPrice.toFixed(2))
      };
    } else {
      db.data.portfolios[portfolioIndex].stocks.push({
        symbol,
        quantity,
        purchasePrice: price,
        purchaseDate: new Date().toISOString()
      });
    }
    
    db.data.transactions.push({
      id: Date.now().toString(),
      userId: req.user.id,
      symbol,
      quantity,
      price,
      type: 'buy',
      date: new Date().toISOString()
    });
    
    await db.write();
    res.json({ budget: db.data.users[userIndex].budget, message: 'Purchase successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to buy stocks' });
  }
});

app.post('/api/portfolio/sell', authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    await db.read();
    
    const userIndex = db.data.users.findIndex(u => u.id === req.user.id);
    const portfolioIndex = db.data.portfolios.findIndex(p => p.userId === req.user.id);
    
    if (userIndex === -1 || portfolioIndex === -1) {
      return res.status(404).json({ error: 'User or portfolio not found' });
    }
    
    const stockIndex = db.data.portfolios[portfolioIndex].stocks.findIndex(s => s.symbol === symbol);
    
    if (stockIndex === -1) return res.status(400).json({ error: 'Stock not found' });
    
    const stock = db.data.portfolios[portfolioIndex].stocks[stockIndex];
    
    if (stock.quantity < quantity) return res.status(400).json({ error: 'Insufficient shares' });
    
    const totalValue = price * quantity;
    db.data.users[userIndex].budget += totalValue;
    
    if (stock.quantity === quantity) {
      db.data.portfolios[portfolioIndex].stocks.splice(stockIndex, 1);
    } else {
      db.data.portfolios[portfolioIndex].stocks[stockIndex].quantity -= quantity;
    }
    
    db.data.transactions.push({
      id: Date.now().toString(),
      userId: req.user.id,
      symbol,
      quantity,
      price,
      type: 'sell',
      date: new Date().toISOString()
    });
    
    await db.write();
    res.json({ budget: db.data.users[userIndex].budget, message: 'Sale successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sell stocks' });
  }
});

app.get('/api/status', (req, res) => {
  const lastUpdate = db.data?.lastStockUpdate 
    ? new Date(db.data.lastStockUpdate).toLocaleString() 
    : 'Never';
  
  res.json({
    status: 'online',
    stocksCount: db.data?.stocks?.length || 0,
    usersCount: db.data?.users?.length || 0,
    cache: {
      lastUpdate,
      isFresh: !shouldUpdateCache()
    }
  });
});

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 API Key: ${TWELVEDATA_API_KEY ? '✓ Present' : '✗ Missing'}`);
  console.log(`⏱️  Cache: 5 minutes`);
  console.log('=================================');
  console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
  console.log(`🔗 Stocks: http://localhost:${PORT}/api/stocks`);
  console.log(`🔗 Status: http://localhost:${PORT}/api/status`);
});