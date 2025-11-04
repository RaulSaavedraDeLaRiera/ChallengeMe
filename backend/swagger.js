const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChallengeMe API',
      version: '1.0.0',
      description: 'API para la aplicación social de desafíos de ejercicio ChallengeMe',
    },
    servers: [
      {
        url: 'https://challengeme-5cfg.onrender.com',
        description: 'Production server',
      },
     ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;

