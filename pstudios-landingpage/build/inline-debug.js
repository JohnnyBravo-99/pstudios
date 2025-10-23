// Inline API Debug Script - Copy this into browser console
// Run this on https://www.paradigmstudios.art/admin

console.log('🔍 Starting API Debug for Paradigm Studios...');

const API_BASE_URL = 'https://api.paradigmstudios.art';

// Test 1: Health Check
async function testHealth() {
    console.log('1️⃣ Testing API health...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        console.log('✅ Health check successful:', data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return false;
    }
}

// Test 2: CORS Test
async function testCORS() {
    console.log('2️⃣ Testing CORS configuration...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/portfolio`, {
            method: 'OPTIONS',
            headers: {
                'Access-Control-Request-Method': 'PATCH',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('OPTIONS Response Status:', response.status);
        console.log('Access-Control-Allow-Methods:', response.headers.get('Access-Control-Allow-Methods'));
        console.log('Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
        console.log('Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
        
        if (response.status === 200) {
            console.log('✅ CORS preflight successful');
            return true;
        } else {
            console.log('❌ CORS preflight failed');
            return false;
        }
    } catch (error) {
        console.error('❌ CORS test failed:', error);
        return false;
    }
}

// Test 3: Authentication
async function testAuth() {
    console.log('3️⃣ Testing authentication...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: 'include'
        });
        
        console.log('Auth Response Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Authentication successful:', data);
            return true;
        } else {
            console.log('❌ Authentication failed - please login first');
            return false;
        }
    } catch (error) {
        console.error('❌ Auth test failed:', error);
        return false;
    }
}

// Test 4: PATCH Method
async function testPATCH() {
    console.log('4️⃣ Testing PATCH method...');
    try {
        // First get portfolio items
        const listResponse = await fetch(`${API_BASE_URL}/api/admin/portfolio`, {
            credentials: 'include'
        });
        
        if (!listResponse.ok) {
            console.log('❌ Cannot fetch portfolio list - authentication required');
            return false;
        }
        
        const items = await listResponse.json();
        if (items.length === 0) {
            console.log('❌ No portfolio items found to test with');
            return false;
        }
        
        const testItem = items[0];
        console.log(`Testing with item: ${testItem.title} (ID: ${testItem._id})`);
        
        const response = await fetch(`${API_BASE_URL}/api/admin/portfolio/${testItem._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ isPublished: !testItem.isPublished })
        });
        
        console.log('PATCH Response Status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ PATCH request successful:', data);
            return true;
        } else {
            const errorData = await response.json();
            console.log('❌ PATCH request failed:', errorData);
            return false;
        }
    } catch (error) {
        console.error('❌ PATCH test failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running comprehensive API debug...');
    
    const health = await testHealth();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const cors = await testCORS();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const auth = await testAuth();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const patch = await testPATCH();
    
    console.log('📊 Test Results Summary:');
    console.log(`Health Check: ${health ? '✅' : '❌'}`);
    console.log(`CORS Config: ${cors ? '✅' : '❌'}`);
    console.log(`Authentication: ${auth ? '✅' : '❌'}`);
    console.log(`PATCH Method: ${patch ? '✅' : '❌'}`);
    
    if (health && cors && auth && patch) {
        console.log('🎉 All tests passed! Your API is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check the results above for details.');
    }
}

// Export functions
window.debugAPI = { testHealth, testCORS, testAuth, testPATCH, runAllTests };

console.log('🔧 Debug functions available:');
console.log('- debugAPI.runAllTests() - Run all tests');
console.log('- debugAPI.testHealth() - Test API health');
console.log('- debugAPI.testCORS() - Test CORS configuration');
console.log('- debugAPI.testAuth() - Test authentication');
console.log('- debugAPI.testPATCH() - Test PATCH method');

// Auto-run all tests
runAllTests();
