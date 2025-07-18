import dotenv from 'dotenv';
import app from './app';
import { logger } from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 Z-Clinic Backend rodando na porta ${PORT}`);
  logger.info(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
