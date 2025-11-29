//main server entry point : express app with mongodb
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

//http request logging with morgan
if (process.env.NODE_ENV !== 'test') {
  //log to winston stream
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

//health check root route
app.get('/', (req, res) => {
  res.json({ message: 'ChallengeMe API running', docs: '/api-docs' });
});

//swagger documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

//routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const challengeRoutes = require('./routes/challenge.routes');
const userChallengeRoutes = require('./routes/userChallenge.routes');
const postRoutes = require('./routes/post.routes');
const followRoutes = require('./routes/follow.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/user-challenges', userChallengeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);

//connection to mongodb
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('Error connecting to MongoDB:', err));

//only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

//export app for the testing
module.exports = app;
