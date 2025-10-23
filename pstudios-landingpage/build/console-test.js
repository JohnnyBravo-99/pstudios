// Copy and paste this into browser console on https://www.paradigmstudios.art/admin

console.log('🔍 API Debug Test Starting...');

// Test 1: Health Check
async function testHealth() {
    try {
        const response = await fetch('https://api.paradigmstudios.art/api/health');
        const data = await response.json();
        console.log('✅ Health Check:', response.status, data);
        return true;
    } catch (error) {
        console.log('❌ Health Check Failed:', error.message);
        return false;
    }
}

// Test 2: CORS Test
async function testCORS() {
    try {
        const response = await fetch('https://api.paradigmstudios.art/api/admin/portfolio', {
            method: 'OPTIONS',
            headers: {
                'Access-Control-Request-Method': 'PATCH',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('CORS Status:', response.status);
        console.log('Allow Methods:', response.headers.get('Access-Control-Allow-Methods'));
        console.log('Allow Origin:', response.headers.get('Access-Control-Allow-Origin'));
        console.log('Allow Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
        
        if (response.status === 200) {
            console.log('✅ CORS Test Passed');
            return true;
        } else {
            console.log('❌ CORS Test Failed');
            return false;
        }
    } catch (error) {
        console.log('❌ CORS Test Error:', error.message);
        return false;
    }
}

// Test 3: Authentication
async function testAuth() {
    try {
        const response = await fetch('https://api.paradigmstudios.art/api/auth/me', {
            credentials: 'include'
        });
        
        console.log('Auth Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Auth Test Passed:', data);
            return true;
        } else {
            console.log('❌ Auth Test Failed - Please login first');
            return false;
        }
    } catch (error) {
        console.log('❌ Auth Test Error:', error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting API Tests...');
    
    const health = await testHealth();
    const cors = await testCORS();
    const auth = await testAuth();
    
    console.log('📊 Results:');
    console.log(`Health: ${health ? '✅' : '❌'}`);
    console.log(`CORS: ${cors ? '✅' : '❌'}`);
    console.log(`Auth: ${auth ? '✅' : '❌'}`);
    
    if (!cors) {
        console.log('🔧 CORS Issue: The backend needs to be updated with PATCH method support');
        console.log('💡 Solution: Update the backend CORS configuration on the VPS server');
    }
}

// Auto-run tests
runTests();
