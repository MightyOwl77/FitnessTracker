
import { memoryUsageMonitor } from '../controllers/performance.controller';
import logger from '../lib/logger';

/**
 * Background task to monitor system health
 */
const monitorSystemHealth = () => {
  try {
    const memoryUsage = memoryUsageMonitor();
    logger.info(`System Health: ${JSON.stringify(memoryUsage)}`);
    
    // Alert if memory usage is high
    const heapUsed = parseFloat(memoryUsage.heapUsed.split(' ')[0]);
    if (heapUsed > 512) { // Alert if heap usage exceeds 512MB
      logger.warn(`HIGH MEMORY USAGE: ${heapUsed}MB`);
    }
  } catch (error) {
    logger.error(`Error in system health monitoring: ${error}`);
  }
};

/**
 * Start monitoring tasks
 */
export const startMonitoringTasks = () => {
  // Run system health check every 5 minutes
  setInterval(monitorSystemHealth, 5 * 60 * 1000);
  logger.info('System monitoring tasks started');
};

export default startMonitoringTasks;
