const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const prisma = require('./lib/prisma');

const server = http.createServer(app);

async function start() {
  await prisma.$connect();
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, `${env.APP_NAME} is running`);
  });
}

async function shutdown(signal) {
  logger.info({ signal }, 'Graceful shutdown initiated');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch(async (error) => {
  logger.error({ err: error }, 'Failed to start server');
  await prisma.$disconnect();
  process.exit(1);
});