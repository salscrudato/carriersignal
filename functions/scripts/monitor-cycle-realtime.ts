/**
 * Real-Time Cycle Monitoring Dashboard
 * Continuously monitors the 12-hour update cycle with live metrics
 */

import axios from 'axios';
import * as readline from 'readline';

const BASE_URL = process.env.FIREBASE_FUNCTIONS_URL || 'http://localhost:5001/carriersignal-app/us-central1';
const REFRESH_INTERVAL = 30000; // 30 seconds

interface DashboardState {
  cycleStatus: string;
  hoursSinceLastCycle: number;
  articlesProcessed: number;
  duplicateRate: number;
  feedHealth: number;
  alerts: number;
}

let lastState: DashboardState | null = null;

function clearScreen() {
  console.clear();
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'healthy':
      return '✅';
    case 'degraded':
      return '⚠️ ';
    case 'overdue':
      return '❌';
    default:
      return '❓';
  }
}

function getHealthBar(percentage: number): string {
  const filled = Math.round(percentage / 5);
  const empty = 20 - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

async function fetchDashboard(): Promise<DashboardState | null> {
  try {
    const response = await axios.get(`${BASE_URL}/getCycleDashboard`, {
      timeout: 10000,
    });

    if (!response.data.success) return null;

    const dashboard = response.data.dashboard;
    return {
      cycleStatus: dashboard.cycleHealth.status,
      hoursSinceLastCycle: dashboard.cycleHealth.hoursSinceLastCycle,
      articlesProcessed: dashboard.metrics.articlesAddedThisCycle,
      duplicateRate: dashboard.metrics.duplicateRemovalRate * 100,
      feedHealth: dashboard.metrics.feedHealthScore,
      alerts: dashboard.alerts.length,
    };
  } catch (error) {
    return null;
  }
}

function renderDashboard(state: DashboardState) {
  clearScreen();

  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║          🔄 Real-Time 12-Hour Cycle Monitoring Dashboard          ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Cycle Status
  console.log('📊 CYCLE STATUS');
  console.log(`   ${getStatusIcon(state.cycleStatus)} Status: ${state.cycleStatus.toUpperCase()}`);
  console.log(`   ⏱️  Hours Since Last Cycle: ${state.hoursSinceLastCycle.toFixed(1)}h`);
  console.log(`   ${state.hoursSinceLastCycle > 12.5 ? '⚠️ ' : '✅'} Expected Interval: 12h\n`);

  // Articles
  console.log('📰 ARTICLES');
  console.log(`   ✍️  Processed This Cycle: ${state.articlesProcessed}`);
  console.log(`   🔄 Duplicate Rate: ${state.duplicateRate.toFixed(2)}%`);
  console.log(`   ${state.duplicateRate < 5 ? '✅' : '⚠️ '} Target: <5%\n`);

  // Feed Health
  console.log('🏥 FEED HEALTH');
  console.log(`   ${getHealthBar(state.feedHealth)} ${state.feedHealth.toFixed(1)}%`);
  console.log(`   ${state.feedHealth > 90 ? '✅' : '⚠️ '} Target: >90%\n`);

  // Alerts
  console.log('🚨 ALERTS');
  console.log(`   ${state.alerts > 0 ? '⚠️ ' : '✅'} Active Alerts: ${state.alerts}\n`);

  // Status Indicators
  console.log('📈 OVERALL STATUS');
  const isHealthy = 
    state.cycleStatus === 'healthy' &&
    state.duplicateRate < 5 &&
    state.feedHealth > 90 &&
    state.alerts === 0;

  console.log(`   ${isHealthy ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}\n`);

  // Comparison with last state
  if (lastState) {
    console.log('📊 CHANGES');
    const articlesChange = state.articlesProcessed - lastState.articlesProcessed;
    const dupChange = state.duplicateRate - lastState.duplicateRate;
    const healthChange = state.feedHealth - lastState.feedHealth;

    console.log(`   Articles: ${articlesChange > 0 ? '+' : ''}${articlesChange}`);
    console.log(`   Duplicate Rate: ${dupChange > 0 ? '+' : ''}${dupChange.toFixed(2)}%`);
    console.log(`   Feed Health: ${healthChange > 0 ? '+' : ''}${healthChange.toFixed(1)}%\n`);
  }

  console.log('─'.repeat(70));
  console.log(`Last Updated: ${new Date().toLocaleTimeString()}`);
  console.log('Press Ctrl+C to exit\n');
}

async function monitor() {
  console.log('🚀 Starting Real-Time Cycle Monitoring...\n');

  const interval = setInterval(async () => {
    const state = await fetchDashboard();
    
    if (state) {
      renderDashboard(state);
      lastState = state;
    } else {
      console.log('⚠️  Unable to fetch dashboard data. Retrying...');
    }
  }, REFRESH_INTERVAL);

  // Initial fetch
  const initialState = await fetchDashboard();
  if (initialState) {
    renderDashboard(initialState);
    lastState = initialState;
  }

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('\n\n👋 Monitoring stopped.\n');
    process.exit(0);
  });
}

monitor().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

