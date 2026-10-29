const net = require('net');
const os = require('os');

/**
 * Checks if a specific IP has port 5555 open
 * @param {string} ip
 * @param {number} port
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
function probePort(ip, port = 5555, timeout = 350) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isSettled = false;

    const cleanup = () => {
      if (!isSettled) {
        isSettled = true;
        socket.destroy();
      }
    };

    socket.setTimeout(timeout);

    socket.once('connect', () => {
      cleanup();
      resolve(true);
    });

    socket.once('timeout', () => {
      cleanup();
      resolve(false);
    });

    socket.once('error', () => {
      cleanup();
      resolve(false);
    });

    try {
      socket.connect(port, ip);
    } catch (_) {
      cleanup();
      resolve(false);
    }
  });
}

/**
 * Finds active local IPv4 subnets (e.g. ['192.168.1', '192.168.0'])
 * Excludes loopback, virtual /30 point-to-point tunnels, and down interfaces
 */
function getActiveSubnets() {
  const ifaces = os.networkInterfaces();
  const subnets = new Set();

  for (const name of Object.keys(ifaces)) {
    const addresses = ifaces[name];
    if (!addresses) continue;

    for (const info of addresses) {
      if (info.family === 'IPv4' && !info.internal) {
        const ip = info.address;
        const parts = ip.split('.');
        if (parts.length === 4) {
          // Exclude point-to-point tunnels with netmask 255.255.255.252 (/30)
          if (info.netmask === '255.255.255.252') continue;
          
          // Private IP ranges standard subnets:
          // 192.168.x.x
          // 10.x.x.x
          // 172.16.x.x - 172.31.x.x
          const p0 = parseInt(parts[0], 10);
          const p1 = parseInt(parts[1], 10);
          const isPrivate =
            (p0 === 192 && p1 === 168) ||
            p0 === 10 ||
            (p0 === 172 && p1 >= 16 && p1 <= 31);

          if (isPrivate) {
            subnets.add(`${parts[0]}.${parts[1]}.${parts[2]}`);
          }
        }
      }
    }
  }

  return Array.from(subnets);
}

/**
 * Scans local subnets for devices with ADB port 5555 open
 * @param {Function} onProgress (percent, currentIp)
 * @returns {Promise<Array<{ip: string, port: number}>>}
 */
async function scanLocalAdbDevices(onProgress = null) {
  const subnets = getActiveSubnets();
  const found = [];

  if (subnets.length === 0) {
    return [];
  }

  const batchSize = 35; // 35 parallel probes per batch for fast & safe scan
  const totalIps = subnets.length * 254;
  let scannedCount = 0;

  for (const subnet of subnets) {
    for (let i = 1; i <= 254; i += batchSize) {
      const batch = [];
      for (let j = i; j < i + batchSize && j <= 254; j++) {
        const targetIp = `${subnet}.${j}`;
        batch.push(
          probePort(targetIp, 5555, 350).then((isOpen) => {
            scannedCount++;
            if (isOpen) {
              found.push({ ip: targetIp, port: 5555 });
            }
            if (onProgress && scannedCount % 10 === 0) {
              const percent = Math.min(100, Math.round((scannedCount / totalIps) * 100));
              onProgress(percent, targetIp, found);
            }
          })
        );
      }
      await Promise.all(batch);
    }
  }

  if (onProgress) {
    onProgress(100, '', found);
  }

  return found;
}

module.exports = {
  probePort,
  getActiveSubnets,
  scanLocalAdbDevices
};
