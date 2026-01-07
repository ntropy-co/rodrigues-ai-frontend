
const FRONTEND_URL = 'https://verityagro.com.br';

async function testFrontendLogin() {
    console.log(`Testing connection to Frontend: ${FRONTEND_URL}`);

    try {
        const payload = {
            email: 'teste@teste.com',
            password: 'Teste123'
        };

        console.log(`[POST] ${FRONTEND_URL}/api/auth/login`);
        const response = await fetch(`${FRONTEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Response Status:', response.status);
        const text = await response.text();
        console.log('Response Body:', text.slice(0, 500)); // Limit output

        if (response.ok) {
            console.log("SUCCESS: Frontend proxy works and backend accepted credentials.");
        } else if (response.status === 401 || response.status === 400 || response.status === 403 || response.status === 422) {
            console.log("FUNCTIONAL SUCCESS: Frontend reached backend, but credentials/request were rejected (Expected behavior for invalid login, but proves connectivity).");
        } else {
            console.log("FAILURE: Received server error or unexpected status.");
        }

    } catch (error) {
        console.error('CRITICAL FETCH ERROR:', error);
    }
}

testFrontendLogin();
