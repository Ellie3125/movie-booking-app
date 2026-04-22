require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ─── Connect DB ───────────────────────────────────────────────────────────────
connectDB();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',      require('./routes/auth'));
app.use('/api/v1/movies',    require('./routes/movies'));
app.use('/api/v1/cinemas',   require('./routes/cinemas'));
app.use('/api/v1/showtimes', require('./routes/showtimes'));
app.use('/api/v1/bookings',  require('./routes/bookings'));
app.use('/api/v1/payments',  require('./routes/payments'));
app.use('/api/v1/users',     require('./routes/users'));
app.use('/api/v1/reviews',   require('./routes/reviews'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;