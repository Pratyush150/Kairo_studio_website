# Load Testing Guide

Comprehensive load and stress testing guide for Cerebral Machine.

**Project**: Cerebral Machine
**Last Updated**: November 2025

---

## Overview

Load testing ensures the application performs well under various traffic conditions:
- **Load Testing**: Normal expected traffic
- **Stress Testing**: Beyond normal capacity
- **Spike Testing**: Sudden traffic surges
- **Endurance Testing**: Sustained load over time

---

## Testing Tools

### 1. Apache Bench (ab)

**Simple HTTP load testing**

**Installation**:
```bash
# macOS
brew install httpd

# Ubuntu/Debian
sudo apt-get install apache2-utils
```

**Basic Test**:
```bash
# 1000 requests, 10 concurrent
ab -n 1000 -c 10 https://cerebral-machine.com/

# With headers
ab -n 1000 -c 10 -H "Accept-Encoding: gzip" https://cerebral-machine.com/

# POST request
ab -n 100 -c 10 -p post_data.json -T application/json https://cerebral-machine.com/api/endpoint
```

**Expected Results**:
- Requests per second: > 100
- Time per request: < 100ms (mean)
- Failed requests: 0

### 2. Artillery

**Modern, powerful load testing**

**Installation**:
```bash
npm install -g artillery
```

**Configuration** (`artillery.yml`):
```yaml
config:
  target: "https://cerebral-machine.com"
  phases:
    # Warm-up: 10 users for 60s
    - duration: 60
      arrivalRate: 10
      name: "Warm up"

    # Ramp-up: 10 → 50 users over 120s
    - duration: 120
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up"

    # Sustained load: 50 users for 300s
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "Homepage visit"
    flow:
      - get:
          url: "/"
          capture:
            - json: "$.title"
              as: "pageTitle"
      - think: 2

  - name: "Module interaction"
    flow:
      - get:
          url: "/"
      - think: 3
      # Simulate clicking module
      - get:
          url: "/?module=saas"
      - think: 5
      - get:
          url: "/"
      - think: 2
```

**Run Test**:
```bash
artillery run artillery.yml

# Quick test
artillery quick --count 100 --num 10 https://cerebral-machine.com/

# Report
artillery run artillery.yml --output report.json
artillery report report.json
```

**Expected Metrics**:
- HTTP 200 responses: 100%
- Response time p95: < 500ms
- Response time p99: < 1000ms
- RPS: > 50

### 3. k6 (Grafana)

**Modern load testing for DevOps**

**Installation**:
```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Test Script** (`k6-test.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 20 },  // Ramp-up to 20 users
    { duration: '3m', target: 20 },  // Stay at 20 users
    { duration: '1m', target: 50 },  // Ramp-up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1000ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  // Homepage
  let res = http.get('https://cerebral-machine.com/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'page loads in < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(2);

  // Simulate module interaction
  res = http.get('https://cerebral-machine.com/?module=saas');
  check(res, {
    'module loads': (r) => r.status === 200,
  });
  sleep(5);
}
```

**Run Test**:
```bash
k6 run k6-test.js

# With output to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 k6-test.js

# Cloud execution
k6 cloud k6-test.js
```

### 4. Locust

**Python-based load testing**

**Installation**:
```bash
pip install locust
```

**Test Script** (`locustfile.py`):
```python
from locust import HttpUser, task, between

class CerebralMachineUser(HttpUser):
    wait_time = between(1, 5)

    @task(3)
    def view_homepage(self):
        self.client.get("/")

    @task(2)
    def view_module(self):
        modules = ["saas", "automation", "integration"]
        for module in modules:
            self.client.get(f"/?module={module}")
            self.wait()

    @task(1)
    def scroll_page(self):
        self.client.get("/")
        # Simulate scroll interactions
        self.wait()
```

**Run Test**:
```bash
# Web UI
locust -f locustfile.py --host=https://cerebral-machine.com

# Headless
locust -f locustfile.py --host=https://cerebral-machine.com \
  --users 100 --spawn-rate 10 --run-time 5m --headless
```

---

## Testing Scenarios

### Scenario 1: Normal Load

**Objective**: Verify performance under expected traffic

**Parameters**:
- Users: 50 concurrent
- Duration: 10 minutes
- Ramp-up: 2 minutes

**Expected Results**:
- Response time p95: < 500ms
- Response time p99: < 1000ms
- Error rate: < 0.1%
- CPU usage: < 70%
- Memory usage: stable

**k6 Configuration**:
```javascript
export let options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp to 50
    { duration: '10m', target: 50 }, // Stay at 50
    { duration: '1m', target: 0 },   // Ramp down
  ],
};
```

### Scenario 2: Stress Test

**Objective**: Find breaking point

**Parameters**:
- Users: 0 → 200 concurrent
- Duration: 20 minutes
- Ramp-up: gradual

**Expected Results**:
- Identify max concurrent users
- Determine resource limits
- Graceful degradation

**k6 Configuration**:
```javascript
export let options = {
  stages: [
    { duration: '5m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '5m', target: 150 },
    { duration: '5m', target: 200 },
  ],
};
```

### Scenario 3: Spike Test

**Objective**: Handle sudden traffic surge

**Parameters**:
- Users: 10 → 200 → 10
- Duration: 5 minutes
- Spike: immediate

**Expected Results**:
- No crashes
- Recovery within 1 minute
- Error rate < 5% during spike

**k6 Configuration**:
```javascript
export let options = {
  stages: [
    { duration: '1m', target: 10 },   // Normal load
    { duration: '30s', target: 200 }, // Spike!
    { duration: '1m', target: 200 },  // Sustained spike
    { duration: '30s', target: 10 },  // Recovery
    { duration: '1m', target: 10 },   // Normal again
  ],
};
```

### Scenario 4: Endurance Test

**Objective**: Ensure stability over time

**Parameters**:
- Users: 30 concurrent
- Duration: 2 hours
- Steady state

**Expected Results**:
- No memory leaks
- Performance stable
- No degradation over time

**k6 Configuration**:
```javascript
export let options = {
  stages: [
    { duration: '5m', target: 30 },    // Ramp-up
    { duration: '120m', target: 30 },  // Endurance
    { duration: '5m', target: 0 },     // Ramp-down
  ],
};
```

---

## CDN Load Testing

### CloudFlare Load Testing

**Objective**: Verify CDN caching and distribution

**Test**:
```bash
# Test from multiple locations
for region in us-east us-west eu-west ap-south; do
  echo "Testing from $region"
  curl -w "@curl-format.txt" -o /dev/null -s \
    "https://cerebral-machine.com/" \
    -H "CF-IPCountry: $region"
done
```

**curl-format.txt**:
```
time_namelookup:  %{time_namelookup}\n
time_connect:     %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer: %{time_pretransfer}\n
time_redirect:    %{time_redirect}\n
time_starttransfer: %{time_starttransfer}\n
time_total:       %{time_total}\n
```

**Expected**:
- First request: < 2s (cache miss)
- Subsequent: < 500ms (cache hit)
- Global: consistent across regions

---

## API Load Testing

### REST API Endpoints

**If you have API endpoints**:

```javascript
// k6-api-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '5m', target: 100 },
  ],
};

export default function () {
  // GET request
  let res = http.get('https://cerebral-machine.com/api/modules');
  check(res, {
    'status 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  // POST request
  const payload = JSON.stringify({
    module: 'saas',
    action: 'view'
  });

  res = http.post('https://cerebral-machine.com/api/analytics', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'status 201': (r) => r.status === 201,
  });
}
```

---

## Performance Budgets

### Response Time Budgets

| Percentile | Target | Stress Limit |
|------------|--------|--------------|
| p50 (median) | < 200ms | < 500ms |
| p95 | < 500ms | < 1000ms |
| p99 | < 1000ms | < 2000ms |
| p99.9 | < 2000ms | < 5000ms |

### Throughput Budgets

| Scenario | Target RPS | Min RPS |
|----------|-----------|---------|
| Normal Load | > 100 | > 50 |
| Peak Load | > 50 | > 25 |
| Spike | > 25 | > 10 |

### Error Rate Budgets

| Scenario | Max Error Rate |
|----------|----------------|
| Normal Load | < 0.1% |
| Stress Test | < 1% |
| Spike Test | < 5% |

---

## Monitoring During Tests

### Server Monitoring

```bash
# CPU usage
top -bn1 | grep "Cpu(s)"

# Memory usage
free -m

# Network connections
netstat -an | grep ESTABLISHED | wc -l

# Nginx connections
nginx -t && curl http://localhost/nginx_status
```

### Application Monitoring

```javascript
// Add to app during testing
setInterval(() => {
  const metrics = {
    timestamp: Date.now(),
    memory: performance.memory?.usedJSHeapSize || 0,
    fps: /* track FPS */,
    activeUsers: /* track active sessions */
  };
  console.log('Metrics:', metrics);
}, 5000);
```

### Real User Monitoring (RUM)

```javascript
// Track real user performance during load test
if (navigator.sendBeacon) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    const data = {
      url: window.location.href,
      loadTime: perfData.loadEventEnd - perfData.fetchStart,
      domReady: perfData.domContentLoadedEventEnd - perfData.fetchStart,
      timestamp: Date.now()
    };

    navigator.sendBeacon('/api/rum', JSON.stringify(data));
  });
}
```

---

## Analysis & Reporting

### Key Metrics to Track

1. **Response Time**:
   - Mean, median, p95, p99
   - Time series graph
   - Identify spikes and trends

2. **Throughput**:
   - Requests per second
   - Successful vs failed
   - Over time

3. **Error Rate**:
   - HTTP error codes (4xx, 5xx)
   - Timeout errors
   - Connection errors

4. **Resource Utilization**:
   - CPU usage %
   - Memory usage (MB/GB)
   - Network bandwidth (Mbps)
   - Disk I/O

5. **CDN Performance**:
   - Cache hit ratio
   - Origin requests
   - Bandwidth savings

### Report Template

```markdown
# Load Test Report

**Date**: [Date]
**Duration**: [Duration]
**Tool**: [Artillery/k6/Locust]
**Target**: https://cerebral-machine.com

## Test Configuration

- **Scenario**: [Normal Load/Stress/Spike/Endurance]
- **Users**: [Concurrent users]
- **Ramp-up**: [Duration]
- **Total Requests**: [Count]

## Results

### Response Times

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Mean | 245ms | < 500ms | ✅ |
| Median (p50) | 180ms | < 200ms | ✅ |
| p95 | 450ms | < 500ms | ✅ |
| p99 | 850ms | < 1000ms | ✅ |

### Throughput

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| RPS | 125 | > 100 | ✅ |
| Total Requests | 75,000 | - | - |
| Successful | 74,950 (99.93%) | > 99.9% | ✅ |
| Failed | 50 (0.07%) | < 0.1% | ✅ |

### Resource Utilization

| Resource | Average | Peak | Status |
|----------|---------|------|--------|
| CPU | 45% | 68% | ✅ |
| Memory | 2.1 GB | 2.8 GB | ✅ |
| Network | 25 Mbps | 45 Mbps | ✅ |

## Observations

- [Key findings]
- [Performance bottlenecks identified]
- [Recommendations]

## Next Steps

- [ ] [Action items]
- [ ] [Optimizations to implement]
```

---

## Sign-off Checklist

- [ ] Normal load test completed (50 users, 10 min)
- [ ] Stress test completed (find breaking point)
- [ ] Spike test completed (sudden surge handled)
- [ ] Response time targets met (p95 < 500ms)
- [ ] Error rate acceptable (< 0.1%)
- [ ] No memory leaks during endurance test
- [ ] CDN caching verified
- [ ] Performance budgets met
- [ ] Bottlenecks identified and documented
- [ ] Recommendations documented

---

**Testing Status**: ⏳ Ready to Execute
**Last Updated**: November 2025
