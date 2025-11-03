require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Logger middleware
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  next();
});

// Authentication middleware
function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');
  const expected = process.env.API_KEY || 'test-api-key';
  if (key !== expected) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

// In-memory product storage
let products = [
  {
    id: uuidv4(),
    name: 'Blue T-Shirt',
    description: 'Comfortable cotton t-shirt',
    price: 19.99,
    category: 'clothing',
    inStock: true,
  },
  {
    id: uuidv4(),
    name: 'Running Shoes',
    description: 'Lightweight running shoes',
    price: 79.5,
    category: 'footwear',
    inStock: true,
  },
];

// GET /api/products — list all
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id — get one
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products — create
app.post('/api/products', requireApiKey, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || typeof price !== 'number' || !category || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid product data' });
  }
  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id — update
app.put('/api/products/:id', requireApiKey, (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  Object.assign(product, req.body);
  res.json(product);
});

// DELETE /api/products/:id — delete
app.delete('/api/products/:id', requireApiKey, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  const deleted = products.splice(index, 1);
  res.json({ deleted });
});

// Server start
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
