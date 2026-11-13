import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 testMatch:'animal-farm.spec.mjs',
 timeout:30000,
 retries:1,
 reporter:'list',
 use:{baseURL:'http://127.0.0.1:8765',headless:true,...devices['Desktop Chrome']},
 webServer:{command:'python3 -m http.server 8765 --bind 127.0.0.1',url:'http://127.0.0.1:8765/learn.html',reuseExistingServer:!process.env.CI,timeout:15000}
});
