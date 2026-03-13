const axios = require('axios');
const io = require('socket.io-client');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting API & WebSocket Tests ---');
  try {
    // 1. WebSocket connection setup
    const socket = io('http://localhost:5000');
    let socketConnected = false;
    socket.on('connect', () => {
      socketConnected = true;
      console.log('✅ WebSocket Connected');
    });

    let lastCreatedEvent = null;
    socket.on('issueCreated', (data) => {
        console.log('✅ WebSocket Received issueCreated');
        lastCreatedEvent = data;
    });

    // 2. Clear Database (Seed)
    console.log('Seeding Database to clean state...');
    await axios.get(`${BASE_URL}/seed`);

    // Wait a bit to ensure socket connection and seeding
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Register Citizen
    const citizenCreds = {
        name: 'Test Citizen',
        email: `citizen_${Date.now()}@test.com`,
        password: 'password123',
        role: 'citizen'
    };
    
    console.log('\nTesting POST /auth/register (Citizen)...');
    const citizenRegRes = await axios.post(`${BASE_URL}/auth/register`, citizenCreds);
    console.log('Response:', citizenRegRes.data);
    const citizenToken = citizenRegRes.data.token;

    // 4. Register Maintenance
    const maintCreds = {
        name: 'Worker Alpha',
        email: `worker_${Date.now()}@test.com`,
        password: 'password123',
        role: 'maintenance'
    };
    const maintRegRes = await axios.post(`${BASE_URL}/auth/register`, maintCreds);
    const maintToken = maintRegRes.data.token;

    // 5. Register Admin
    const adminCreds = {
        name: 'Admin Boss',
        email: `admin_${Date.now()}@test.com`,
        password: 'password123',
        role: 'admin'
    };
    const adminRegRes = await axios.post(`${BASE_URL}/auth/register`, adminCreds);
    const adminToken = adminRegRes.data.token;

    // 6. Citizen generates issue
    console.log('\nTesting POST /issues (Create Issue via Citizen)...');
    const newIssuePayload = {
        title: 'Broken Traffic Light',
        description: 'Traffic light is not working at the junction.',
        lat: '19.123',
        lng: '72.823',
        address: 'Main Junction 42'
    };
    
    const createReqRes = await axios.post(`${BASE_URL}/issues`, newIssuePayload, {
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log('Response:', createReqRes.data);
    const issueId = createReqRes.data._id;

    // Wait to receive socket event
    await new Promise(resolve => setTimeout(resolve, 500));
    if (lastCreatedEvent && lastCreatedEvent._id === issueId) {
        console.log('✅ Verified WebSocket event contained correct issue ID.');
    } else {
        console.warn('⚠️ WebSocket event for issue created was not verified!');
    }

    // 7. Test GET issues for Citizen
    console.log('\nTesting GET /issues...');
    const getRes = await axios.get(`${BASE_URL}/issues`, {
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log(`Citizen sees ${getRes.data.length} issues.`);

    // 8. Admin Assigns Issue
    let lastUpdatedEvent = null;
    socket.on('issueUpdated', (data) => {
        console.log('✅ WebSocket Received issueUpdated for assignment/status update');
        lastUpdatedEvent = data;
    });

    console.log('\nTesting PUT /issues/:id (Admin assigns issue)...');
    const assignRes = await axios.put(`${BASE_URL}/issues/${issueId}`, {
        assignedTo: maintRegRes.data?._id || maintRegRes.data?.user?.id || 'error_no_id',
        status: 'In Progress'
    }, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Response:', assignRes.data);

    // 9. Maintenance worker updates issue status
    console.log('\nTesting PUT /issues/:id (Worker resolves issue)...');
    const resolveRes = await axios.put(`${BASE_URL}/issues/${issueId}`, {
        status: 'Resolved'
    }, {
        headers: { Authorization: `Bearer ${maintToken}` }
    });
    console.log('Response:', resolveRes.data);

    // Wait for subsequent events
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    socket.disconnect();
    console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('TEST FAILED:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

runTests();
