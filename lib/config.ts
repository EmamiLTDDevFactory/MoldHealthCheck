import axios from "axios";

// Read from Environment Variables (or fallback to your live values)
export const API_BASE = process.env.EXPO_PUBLIC_SAP_BASE_URL || "https://emamiapi.emamigroup.com/api/NGD";
const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID || "6225aa6f-d228-4127-8f88-81b08e2aca69";
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CLIENT_SECRET || "Mhl8Q~fWLcfyl__RGqWEVQ~avQlBV2KYgpXKhbZO";
const OAUTH_URL = process.env.EXPO_PUBLIC_OAUTH_URL || "https://login.microsoftonline.com/d016aebd-1f96-4dd1-a22b-eeb0201fb61e/oauth2/token?sap-client=100";
const SCOPE = process.env.EXPO_PUBLIC_SCOPE || "api://6225aa6f-d228-4127-8f88-81b08e2aca69/Sap.Odata.Access";

/** Shared axios instance — sane timeout + base URL. */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: true // Required if SAP returns cookies alongside CSRF
});

// OAuth State
let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

async function getAccessToken() {
    if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
        return cachedToken;
    }
    console.log("Fetching new Microsoft OAuth Token...");
    const payload = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: SCOPE
    });

    const response = await axios.post(OAUTH_URL, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    cachedToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in - 300) * 1000;
    return cachedToken;
}

// Intercept all requests to attach OAuth Token and CSRF Token
api.interceptors.request.use(async (config) => {
    // 1. Attach OAuth Token
    const token = await getAccessToken();
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Accept'] = 'application/json';

    // 2. Fetch CSRF Token for state-modifying requests
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        // If we don't already have a CSRF token in the headers for this request, fetch one
        if (!config.headers['X-CSRF-Token']) {
            console.log("Fetching CSRF Token for POST request...");
            try {
                // We use a separate axios instance to prevent infinite interceptor loops
                const csrfRes = await axios.get(API_BASE, {
                    headers: {
                        'X-CSRF-Token': 'Fetch',
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                    withCredentials: true
                });
                const csrfToken = csrfRes.headers['x-csrf-token'];
                if (csrfToken) {
                    config.headers['X-CSRF-Token'] = csrfToken;
                }
            } catch (e) {
                console.warn("Failed to fetch CSRF token. The request might fail if SAP requires it.", e);
            }
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const APP_VERSION = "2.0.0";
export const APP_DEPT = "Maintenance Dept.";
