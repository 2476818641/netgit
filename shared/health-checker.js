// shared/health-checker.js

// 定义需要检测延迟的目标
export const healthCheckTargets = [
  { name: 'GitHub', url: 'https://api.github.com', type: 'api' },
  { name: 'GitHub Raw', url: 'https://raw.githubusercontent.com', type: 'cdn' },
  { name: 'GitLab', url: 'https://gitlab.com', type: 'api' },
  { name: 'Docker Hub', url: 'https://registry-1.docker.io/v2/', type: 'registry' },
  { name: 'NPM Registry', url: 'https://registry.npmjs.org', type: 'registry' },
  { name: 'PyPI', url: 'https://pypi.org', type: 'registry' },
  { name: 'jsDelivr CDN', url: 'https://cdn.jsdelivr.net', type: 'cdn' },
  { name: 'Unpkg CDN', url: 'https://unpkg.com', type: 'cdn' }
];

// 检测单个目标的延迟
export async function checkTargetLatency(target) {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch(target.url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    return {
      name: target.name,
      type: target.type,
      url: target.url,
      status: response.ok ? 'healthy' : 'degraded',
      latency: latency,
      statusCode: response.status,
      available: true
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      name: target.name,
      type: target.type,
      url: target.url,
      status: 'unhealthy',
      latency: latency >= 5000 ? 'timeout' : latency,
      error: error.message,
      available: false
    };
  }
}

// 批量检测所有目标
export async function checkAllTargets() {
  const results = await Promise.all(
    healthCheckTargets.map(target => checkTargetLatency(target))
  );

  const summary = {
    total: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    degraded: results.filter(r => r.status === 'degraded').length,
    unhealthy: results.filter(r => r.status === 'unhealthy').length
  };

  return { targets: results, summary };
}

// 保存检测结果到 KV
export async function saveHealthCheckToKV(KV, checkResults) {
  if (!KV) return null;

  const timestamp = Date.now();
  const dateKey = new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
  const recordKey = `health:${dateKey}:${timestamp}`;

  const record = {
    timestamp,
    date: dateKey,
    checks: checkResults
  };

  try {
    // 保存单次检测记录（30天后过期）
    await KV.put(recordKey, JSON.stringify(record), {
      expirationTtl: 30 * 24 * 60 * 60 // 30天
    });

    // 更新每日汇总统计
    await updateDailyStats(KV, dateKey, checkResults);

    return recordKey;
  } catch (error) {
    console.error('Failed to save to KV:', error);
    return null;
  }
}

// 更新每日统计
async function updateDailyStats(KV, dateKey, checkResults) {
  const statsKey = `stats:daily:${dateKey}`;

  try {
    // 获取当天已有的统计数据
    const existingStatsJson = await KV.get(statsKey);
    let stats = existingStatsJson ? JSON.parse(existingStatsJson) : {
      date: dateKey,
      targets: {},
      checkCount: 0
    };

    stats.checkCount++;

    // 更新每个目标的统计
    checkResults.targets.forEach(target => {
      if (!stats.targets[target.name]) {
        stats.targets[target.name] = {
          name: target.name,
          type: target.type,
          totalLatency: 0,
          latencyCount: 0,
          healthyCount: 0,
          degradedCount: 0,
          unhealthyCount: 0,
          timeoutCount: 0
        };
      }

      const targetStats = stats.targets[target.name];

      if (target.latency !== 'timeout') {
        targetStats.totalLatency += target.latency;
        targetStats.latencyCount++;
      } else {
        targetStats.timeoutCount++;
      }

      if (target.status === 'healthy') targetStats.healthyCount++;
      else if (target.status === 'degraded') targetStats.degradedCount++;
      else targetStats.unhealthyCount++;
    });

    // 保存统计数据（31天后过期，比记录多保留1天）
    await KV.put(statsKey, JSON.stringify(stats), {
      expirationTtl: 31 * 24 * 60 * 60
    });
  } catch (error) {
    console.error('Failed to update daily stats:', error);
  }
}

// 获取30天统计数据
export async function get30DayStats(KV) {
  if (!KV) return null;

  const results = {
    period: '30d',
    targets: {},
    summary: {
      totalChecks: 0,
      daysWithData: 0
    }
  };

  try {
    const today = new Date();
    const promises = [];

    // 获取最近30天的每日统计
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      promises.push(KV.get(`stats:daily:${dateKey}`));
    }

    const dailyStats = await Promise.all(promises);

    // 汇总30天数据
    dailyStats.forEach(statsJson => {
      if (!statsJson) return;

      const dayStats = JSON.parse(statsJson);
      results.summary.totalChecks += dayStats.checkCount;
      results.summary.daysWithData++;

      Object.values(dayStats.targets).forEach(target => {
        if (!results.targets[target.name]) {
          results.targets[target.name] = {
            name: target.name,
            type: target.type,
            totalLatency: 0,
            latencyCount: 0,
            healthyCount: 0,
            degradedCount: 0,
            unhealthyCount: 0,
            timeoutCount: 0,
            avgLatency: 0,
            availability: 0
          };
        }

        const t = results.targets[target.name];
        t.totalLatency += target.totalLatency;
        t.latencyCount += target.latencyCount;
        t.healthyCount += target.healthyCount;
        t.degradedCount += target.degradedCount;
        t.unhealthyCount += target.unhealthyCount;
        t.timeoutCount += target.timeoutCount;
      });
    });

    // 计算平均值和可用率
    Object.values(results.targets).forEach(target => {
      if (target.latencyCount > 0) {
        target.avgLatency = Math.round(target.totalLatency / target.latencyCount);
      }

      const totalAttempts = target.healthyCount + target.degradedCount + target.unhealthyCount;
      if (totalAttempts > 0) {
        target.availability = ((target.healthyCount + target.degradedCount) / totalAttempts * 100).toFixed(2);
      }

      // 清理不需要的原始数据
      delete target.totalLatency;
      delete target.latencyCount;
    });

    return results;
  } catch (error) {
    console.error('Failed to get 30-day stats:', error);
    return null;
  }
}
