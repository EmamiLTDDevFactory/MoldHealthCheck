process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
 
const express = require('express');
const axios = require('axios');
const cors = require('cors');
 
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
 
const app = express();
 
// =========================================================
// 1. CRITICAL: CORS CONFIGURATION
// This allows your frontend (webapp2) to pull data from webapp1
// =========================================================
app.use(cors({
    origin: 'https://emdcindpwebapp2-atd7bmfdcmbzf0hh.centralindia-01.azurewebsites.net',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true // Required if passing cookies/tokens across origins
}));
 
app.use(express.json());
 
/*
   COOKIE JAR
*/
const jar = new CookieJar();
 
/*
   AXIOS CLIENT
   Configured specifically to force SAP to accept API calls
*/
const client = wrapper(
    axios.create({
        jar,
        params: {
            // CRITICAL: Forces SAP to use client 100
            'sap-client': '100',
            // Prevents SAP from trying to redirect to SAML SSO web logins
            'saml2': 'disabled'
        },
        headers: {
            // CRITICAL: Tells SAP this is an API, do not send HTML login pages
            'X-Requested-With': 'XMLHttpRequest',
            'DataServiceVersion': '2.0',
            'Accept': 'application/json'
        }
    })
);
 
/*
   AXIOS INTERCEPTOR (FOR DEBUGGING)
   This will print the exact headers going to SAP in your terminal
*/
client.interceptors.request.use(request => {
    console.log('\n--- SENDING TO SAP ---');
    console.log('URL:', request.url);
    console.log('HEADERS:', JSON.stringify(request.headers, null, 2));
    return request;
});
 
/*
   SAP CONFIG
*/
// const SAP_BASE_URL = 'https://emdcindpwebapp1-bag2gfhjd9d4gkh6.centralindia-01.azurewebsites.net/api/users/';
// const SAP_BASE_URL = 'https://emsygydev.emami.local:4430/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV';
 const SAP_BASE_URL = process.env.SAP_BASE_URL || 'https://emamiapi.emamigroup.com/api/NGD';
/*
   OAUTH CONFIG & TOKEN MANAGER
*/
const OAUTH_URL = 'https://login.microsoftonline.com/d016aebd-1f96-4dd1-a22b-eeb0201fb61e/oauth2/token?sap-client=100';
const CLIENT_ID = '6225aa6f-d228-4127-8f88-81b08e2aca69';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
const SCOPE = 'api://6225aa6f-d228-4127-8f88-81b08e2aca69/Sap.Odata.Access';
 
let cachedToken = null;
let tokenExpiration = null;
 
// Helper function to get or refresh the OAuth token
async function getAccessToken() {
    // If we have a valid token that hasn't expired, return it
    if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
        return cachedToken;
    }
 
    try {
        console.log('\nFetching new OAuth Access Token from Microsoft...');
        const payload = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: SCOPE
        });
 
        const response = await axios.post(OAUTH_URL, payload.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
 
        cachedToken = response.data.access_token;
        // Calculate expiration time (buffer by 5 minutes to prevent edge-case failures)
        const expiresInSeconds = response.data.expires_in || 3599; 
        tokenExpiration = Date.now() + (expiresInSeconds - 300) * 1000;
 
        console.log('Microsoft Token Fetched Successfully.');
        return cachedToken;
    } catch (error) {
        console.error('Failed to fetch OAuth Token:', error.response?.data || error.message);
        throw new Error('OAuth authentication failed');
    }
}
 
/*
   REGISTER API
*/
// app.post('/register', async (req, res) => {
//     try {
//         console.log('STEP 1 -> FETCH TOKEN');
//         const accessToken = await getAccessToken();
 
//         /*
//            GET CSRF TOKEN
//         */
//         const tokenResponse = await client.get(
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/`,
//             {
//                 headers: {
//                     'X-CSRF-Token': 'Fetch',
//                     'Authorization': `Bearer ${accessToken}`
//                 }
//             }
//         );
 
//         /*
//            TOKEN
//         */
//         const csrfToken = tokenResponse.headers['x-csrf-token'];
 
//         console.log('CSRF TOKEN:', csrfToken);
//         console.log('STEP 2 -> POST TO SAP');
 
//         /*
//            POST TO SAP
//         */
//         const sapResponse = await client.post(
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/MouldUser001Set`,
//             req.body,
//             {
//                 headers: {
//                     'X-CSRF-Token': csrfToken,
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${accessToken}`
//                 }
//             }
//         );
 
//         console.log('SUCCESS');
 
//         res.json({
//             success: true,
//             data: sapResponse.data
//         });
 
//     } catch (error) {
//         console.log('===== ERROR =====');
//         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
//         console.log(sapErrorDetail);
 
//         res.status(500).json({
//             success: false,
//             error: sapErrorDetail
//         });
//     }
// });

const apiRouter = express.Router();
app.use('/api/users', apiRouter);
 
apiRouter.get('/login', async (req, res) => {
    try {
        const { Email } = req.query;
 
        if (!Email) {
            return res.status(400).json({
                success: false,
                message: 'Missing parameters'
            });
        }
 
        const accessToken = await getAccessToken();
        console.log("Access Token:", accessToken);
        console.log("Email:", Email)
        const url = `${SAP_BASE_URL}/ZMM_MOULD_CARE_SRV/ZmouldLoginSet?$filter=Email eq '${Email}'&$format=json`;
 
        const response = await client.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
 
        const users = response.data?.d?.results || [];
 
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
 
        const user = users[0];
        console.log("Login success:", user);
 
        return res.json({
            success: true,
            user
        });
 
    } catch (error) {
        console.log('===== ERROR =====');
        const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
        console.log(sapErrorDetail);
 
        res.status(500).json({
            success: false,
            error: sapErrorDetail
        });
    }
});
 
apiRouter.get("/dashboard", async (req, res) => {
    try {
        const { SMTP_ADDR } = req.query;
 
        console.log("Received dashboard request for:", SMTP_ADDR);
        if (!SMTP_ADDR) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
 
        const accessToken = await getAccessToken();
        const url = `${SAP_BASE_URL}/ZMM_MOULD_CARE_SRV/ZMouldDetailsSet?$filter=SmtpAddr eq '${SMTP_ADDR}'&$format=json`;
 
        const response = await client.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
 
        const results = response.data?.d?.results || [];
 
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No dashboard data found",
            });
        }
 
        // Vendor Details from First Record
        const vendor = {
            vendorCode: results[0].Lifnr,
            vendorName: results[0].Name1,
            email: results[0].SmtpAddr,
            matnr: results[0].Matnr,
        };
 
        const materials = results.map((item) => ({
            materialCode: item.Matnr,
            materialDescription: item.Maktx,
            componentPart: item.ZzcompPart,
            runnerType: item.Zzrunner,
            granulesGrade: item.Zzgran,
            machineCode: item.Zzmach,
            cavity: item.ZzcavityNo,
            runningCavity: item.ZzrunCavity,
            cycleTime: item.ZzcycTime,
            efficiency: item.ZzfacProd,
            hoursPerDay: item.ZzhoursDay,
            designCode: item.ZzmdsCode,
            mouldLife: item.ZzmoldLife,
            mouldShots: item.ZzmoldShots,
            planningCode: item.ZzplanCode,
            fgDesignCode: item.ZzfgCode,
        }));
 
        return res.json({
            success: true,
            vendor,
            materials,
        });
 
    } catch (error) {
        const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
        console.log(sapErrorDetail);
        return res.status(500).json({
            success: false,
            error: sapErrorDetail,
        });
    }
});

apiRouter.get("/admindashboard", async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const url = `${SAP_BASE_URL}/ZMM_MOULD_CARE_SRV/ZVendDashboardSet?$format=json`;

        const response = await client.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });

        const results = response.data?.d?.results || [];

        return res.json({
            success: true,
            dashboard: results,
        });

    } catch (error) {
        console.log('===== ERROR =====');
        const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
        console.log(sapErrorDetail);
        return res.status(500).json({
            success: false,
            error: sapErrorDetail,
        });
    }
});
 
apiRouter.get("/dropdown", async (req, res) => {
    try {
        const { ZmouldCatId, ZmouldHeadId } = req.query;
 
        if (!ZmouldCatId || !ZmouldHeadId) {
            return res.status(400).json({
                success: false,
                message: "Mould Category ID and Mould Header ID are required",
            });
        }
 
        const accessToken = await getAccessToken();
        const url = `${SAP_BASE_URL}/ZMM_MOULD_CARE_SRV/ZMouldDropDownSet?$filter=ZmouldCatId eq '${ZmouldCatId}' and ZmouldHeadId eq '${ZmouldHeadId}'&$format=json`;
 
        const response = await client.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
 
        const results = response.data?.d?.results || [];
 
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No dropdown data found",
            });
        }
 
        const dropdowns = results.map((item) => ({
            Zmouldfield: item.ZmouldField,
        }));
 
        return res.json({
            success: true,
            dropdowns,
        });
 
    } catch (error) {
        const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
        console.log(sapErrorDetail);
        return res.status(500).json({
            success: false,
            error: sapErrorDetail,
        });
    }
});
 
apiRouter.get("/headerdropdown", async (req, res) => {
    try {
        const { ZmouldCatId, ZmouldHeadId } = req.query;
 
        if (!ZmouldCatId || !ZmouldHeadId) {
            return res.status(400).json({
                success: false,
                message: "Mould Category ID and Mould Header ID are required",
            });
        }
 
        const accessToken = await getAccessToken();
        const url = `${SAP_BASE_URL}/ZMM_MOULD_CARE_SRV/ZMouldHeaderSet?$filter=ZmouldCatId eq '${ZmouldCatId}' and ZmouldHeadId eq '${ZmouldHeadId}'&$format=json`;
 
        const response = await client.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
 
        const results = response.data?.d?.results || [];
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No dropdown data found",
            });
        }
 
        const dropdowns = results.map((item) => ({
            Zmouldfield: item.ZmouldField,
            Zroute: item.Zroute
        }));
 
        return res.json({
            success: true,
            dropdowns,
        });
 
    } catch (error) {
        const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
        console.log(sapErrorDetail);
        return res.status(500).json({
            success: false,
            error: sapErrorDetail,
        });
    }
});
 
/*
   SUBMIT API
*/
apiRouter.post('/submit', async (req, res) => {
    try {
        console.log('STEP 1 -> FETCH TOKEN');
        const accessToken = await getAccessToken();
 
        /*
           GET CSRF TOKEN & COOKIES
        */
        const tokenResponse = await client.get(
            `${SAP_BASE_URL}/ZMM_MOULD_CARE_SRV/ZMouldDataHeaderSet`,
            {
                headers: {
                    'X-CSRF-Token': 'Fetch',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
 
        /*
           TOKEN & COOKIES
        */
        const csrfToken = tokenResponse.headers['x-csrf-token'];
        const cookies = tokenResponse.headers['set-cookie']; // CRITICAL: Extract SAP Session Cookie
 
        console.log('CSRF TOKEN:', csrfToken);
        console.log('STEP 2 -> FORMAT DEEP ENTITY DATA & POST TO SAP');
 
        const { Lifnr, Name1, ZsubDate, CreatedBy, CreatedOn, ChangedBy, ChangedOn, DraftFlag, CompletedFlag, Matnr, ZmouldItemSet } = req.body;
 
        if (!ZmouldItemSet || !Array.isArray(ZmouldItemSet)) {
            return res.status(400).json({
                success: false,
                error: "Invalid payload format. actionMatrix array required."
            });
        }
 
        /*
           CONSTRUCT DEEP ENTITY PAYLOAD
        */
        const sapPayload = {
            Lifnr: Lifnr,
            Name1: (Name1 || "").substring(0, 30),
            ZsubDate: ZsubDate,
            CreatedBy: (CreatedBy || "").substring(0, 10),
            CreatedOn: CreatedOn,
            ChangedBy: ChangedBy,
            ChangedOn: ChangedOn,
            DraftFlag: DraftFlag,
            CompletedFlag: CompletedFlag,
            Matnr: Matnr,
            ZmouldItemSet: ZmouldItemSet.map((row) => ({
                Lifnr: row.Lifnr,
                Name1: row.Name1,
                ZsubDate: row.ZsubDate,
                ZmouldCat: row.ZmouldCat,
                ZmouldCatIdH: row.ZmouldCatIdH,
                ZmouldHeadIdH: row.ZmouldHeadIdH,
                ZmouldColHead: row.ZmouldColHead,
                ZmouldColId: row.ZmouldColId,
                ZmouldColName: row.ZmouldColName,
                ZmouldColVal1: (row.ZmouldColVal1 || "").substring(0, 100),
                ZmouldColVal2: (row.ZmouldColVal2 || "").substring(0, 100),
                ZmouldColVal3: (row.ZmouldColVal3 || "").substring(0, 100)
            }))
        };
 
        /*
           SINGLE POST TO SAP HEADER SET
        */
        const sapResponse = await client.post(
            `${SAP_BASE_URL}/ZMM_MOULD_CARE_SRV/ZMouldDataHeaderSet`,
            sapPayload,
            {
                headers: {
                    'X-CSRF-Token': csrfToken,
                    'Cookie': cookies, // Pass the session cookie here
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
 
        console.log('SUCCESS: DEEP INSERT COMPLETED');
 
        res.json({
            success: true,
            message: "Action matrix successfully saved to SAP!",
            data: sapResponse.data
        });
 
    } catch (error) {
        console.log('===== ERROR =====');
        const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
        console.log(sapErrorDetail);
 
        res.status(500).json({
            success: false,
            error: sapErrorDetail
        });
    }
});
 
apiRouter.get("/getdetails", async (req, res) => {
    try {
        const { Matnr, Lifnr } = req.query;
 
        if (!Matnr || !Lifnr) {
            return res.status(400).json({
                success: false,
                message: "Material Number and Supplier Number are required",
            });
        }
 
        const accessToken = await getAccessToken();
        const url = `${SAP_BASE_URL}/ZMM_MOULD_CARE_SRV/ZMouldGetDataSet?$filter=Matnr eq '${Matnr}' and Lifnr eq '${Lifnr}'&$format=json`;
 
        const response = await client.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });
 
        const results = response.data?.d?.results || [];
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No dropdown data found",
            });
        }
 
        const moulddetails = results.map((item) => ({
            LIFNR: item.Lifnr,
            MATNR: item.Matnr,
            ZMOULD_COL_HEAD: item.ZmouldColHead,
            ZMOULD_COL_ID: item.ZmouldColId,
            ZMOULD_COL_NAME: item.ZmouldColName,
            ZMOULD_COL_VAL1: item.ZmouldColVal1,
            ZMOULD_COL_VAL2: item.ZmouldColVal2,
            ZMOULD_COL_VAL3: item.ZmouldColVal3
        }));
 
        return res.json({
            success: true,
            moulddetails,
        });
 
    } catch (error) {
        const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
        console.log(sapErrorDetail);
        return res.status(500).json({
            success: false,
            error: sapErrorDetail,
        });
    }
});
 
/*
   START SERVER
*/
app.listen(443, '0.0.0.0', () => {
    console.log('Backend running on port 443');
});
 
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
 
// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
 
// const { wrapper } = require('axios-cookiejar-support');
// const { CookieJar } = require('tough-cookie');
 
// const app = express();
 
// app.use(cors());
// app.use(express.json());
 
// /*
//    COOKIE JAR
// */
// const jar = new CookieJar();
 
// /*
//    AXIOS CLIENT
// */
// const client = wrapper(
//     axios.create({
//         jar
//     })
// );
 
// /*
//    SAP CONFIG
// */
// const SAP_BASE_URL =
//     'https://emamidev.emami.local:4440';
 
// const SAP_USERNAME =
//     'IT_FCOMMON';
 
// const SAP_PASSWORD =
//     'Emami@1234';
 
// /*
//    REGISTER API
// */
// app.post('/register', async (req, res) => {
 
//     try {
 
//         console.log('STEP 1 -> FETCH TOKEN');
 
//         /*
//            GET CSRF TOKEN
//         */
//         const tokenResponse = await client.get(
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/`,
//             {
//                 auth: {
//                     username: SAP_USERNAME,
//                     password: SAP_PASSWORD
//                 },
//                 headers: {
//                     'X-CSRF-Token': 'Fetch'
//                 }
//             }
//         );
 
//         /*
//            TOKEN
//         */
//         const csrfToken =
//             tokenResponse.headers['x-csrf-token'];
 
//         console.log('TOKEN:', csrfToken);
 
//         console.log('STEP 2 -> POST TO SAP');
 
//         /*
//            POST TO SAP
//         */
//         const sapResponse = await client.post(
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/MouldUser001Set`,
//             req.body,
//             {
//                 auth: {
//                     username: SAP_USERNAME,
//                     password: SAP_PASSWORD
//                 },
//                 headers: {
//                     'X-CSRF-Token': csrfToken,
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 }
//             }
//         );
 
//         console.log('SUCCESS');
 
//         res.json({
//             success: true,
//             data: sapResponse.data
//         });
 
//     } catch (error) {
 
//         console.log('===== ERROR =====');
 
//         console.log(error.message);
 
//         console.log(error.response?.data);
 
//         res.status(500).json({
//             success: false,
//             error:
//                 error.response?.data || error.message
//         });
//     }
// });
 
// app.get('/login', async (req, res) => {
 
//     try {
 
//         const { Email } = req.query;
 
//         if (!Email) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing parameters'
//             });
//         }
 
//         const url =
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZmouldLoginSet?$filter=Email eq '${Email}'&$format=json`;
 
//         const response = await client.get(url, {
//             auth: {
//                 username: SAP_USERNAME,
//                 password: SAP_PASSWORD
//             },
//             headers: {
//                 Accept: 'application/json'
//             }
//         });
 
//         const users = response.data?.d?.results || [];
 
//         if (users.length === 0) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }
 
//         const user = users[0];
 
//         console.log("Login success:", user);
 
//         return res.json({
//             success: true,
//             user
//         });
 
//     } catch (error) {
 
//         console.log(error.response?.data || error.message);
 
//         return res.status(500).json({
//             success: false,
//             error: error.message
//         });
//     }
// });
 
// app.get("/dashboard", async (req, res) => {
 
//     try {
 
//         const { SMTP_ADDR } = req.query;
 
//         console.log("Received dashboard request for:", SMTP_ADDR);
//         if (!SMTP_ADDR) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email is required",
//             });
//         }
 
//         // SINGLE ODATA API
//         const url =
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldDetailsSet?$filter=SmtpAddr eq '${SMTP_ADDR}'&$format=json`;
 
//         const response = await client.get(url, {
//             auth: {
//                 username: SAP_USERNAME,
//                 password: SAP_PASSWORD,
//             },
//             headers: {
//                 Accept: "application/json",
//             },
//         });
 
//         const results =
//             response.data?.d?.results || [];
 
//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No dashboard data found",
//             });
//         }
 
//         // Vendor Details from First Record
//         const vendor = {
//             vendorCode: results[0].Lifnr,
//             vendorName: results[0].Name1,
//             email: results[0].SmtpAddr,
//             matnr: results[0].Matnr,
//         };
 
//         const materials = results.map((item) => ({
//             materialCode: item.Matnr,
//             materialDescription: item.Maktx,
//             componentPart: item.ZzcompPart,
//             runnerType: item.Zzrunner,
//             granulesGrade: item.Zzgran,
//             machineCode: item.Zzmach,
//             cavity: item.ZzcavityNo,
//             runningCavity: item.ZzrunCavity,
//             cycleTime: item.ZzcycTime,
//             efficiency: item.ZzfacProd,
//             hoursPerDay: item.ZzhoursDay,
//             designCode: item.ZzmdsCode,
//             mouldLife: item.ZzmoldLife,
//             mouldShots: item.ZzmoldShots,
//             planningCode: item.ZzplanCode,
//             fgDesignCode: item.ZzfgCode,
//         }));
 
//         return res.json({
//             success: true,
//             vendor,
//             materials,
//         });
 
//     } catch (error) {
 
//         console.log(
//             error.response?.data || error.message
//         );
 
//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
// });
 
 
// app.get("/dropdown", async (req, res) => {
 
//     try {
 
//         const { ZmouldCatId, ZmouldHeadId } = req.query;
 
//         if (!ZmouldCatId || !ZmouldHeadId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Mould Category ID and Mould Header ID are required",
//             });
//         }
 
//         // SINGLE ODATA API
//         const url =
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldDropDownSet?$filter=ZmouldCatId eq '${ZmouldCatId}' and ZmouldHeadId eq '${ZmouldHeadId}'&$format=json`;
 
//         const response = await client.get(url, {
//             auth: {
//                 username: SAP_USERNAME,
//                 password: SAP_PASSWORD,
//             },
//             headers: {
//                 Accept: "application/json",
//             },
//         });
 
//         const results =
//             response.data?.d?.results || [];
 
//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No dropdown data found",
//             });
//         }
 
//         const dropdowns = results.map((item) => ({
//             Zmouldfield: item.ZmouldField,
//         }));
 
//         return res.json({
//             success: true,
//             dropdowns,
//         });
 
//     } catch (error) {
 
//         console.log(
//             error.response?.data || error.message
//         );
 
//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
// });
 
// app.get("/headerdropdown", async (req, res) => {
 
//     try {
 
//         const { ZmouldCatId, ZmouldHeadId } = req.query;
 
//         if (!ZmouldCatId || !ZmouldHeadId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Mould Category ID and Mould Header ID are required",
//             });
//         }
 
//         // SINGLE ODATA API
 
//         const url =
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldHeaderSet?$filter=ZmouldCatId eq '${ZmouldCatId}' and ZmouldHeadId eq '${ZmouldHeadId}'&$format=json`;
 
//         console.log(url)
 
//         const response = await client.get(url, {
//             auth: {
//                 username: SAP_USERNAME,
//                 password: SAP_PASSWORD,
//             },
//             headers: {
//                 Accept: "application/json",
//             },
//         });
 
//         //console.log(response);
//         const results =
//             response.data?.d?.results || [];
//         console.log(results);
//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No dropdown data found",
//             });
//         }
 
//         //console.log(item);
//         const dropdowns = results.map((item) => ({
//             Zmouldfield: item.ZmouldField,
//             Zroute: item.Zroute
//         }));
 
//         console.log(dropdowns);
//         return res.json({
//             success: true,
//             dropdowns,
//         });
 
//     } catch (error) {
 
//         console.log(
//             error.response?.data || error.message
//         );
 
//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
// });
 
// /*
//    REGISTER API
// */
// app.post('/submit', async (req, res) => {
 
//     try {
 
//         console.log('STEP 1 -> FETCH TOKEN');
 
//         /*
//            GET CSRF TOKEN & COOKIES
//         */
//         const tokenResponse = await client.get(
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/`,
//             {
//                 auth: {
//                     username: SAP_USERNAME,
//                     password: SAP_PASSWORD
//                 },
//                 headers: {
//                     'X-CSRF-Token': 'Fetch'
//                 }
//             }
//         );
 
//         /*
//            TOKEN & COOKIES
//         */
//         const csrfToken = tokenResponse.headers['x-csrf-token'];
//         const cookies = tokenResponse.headers['set-cookie']; // CRITICAL: Extract SAP Session Cookie
 
//         console.log('TOKEN:', csrfToken);
 
//         console.log('STEP 2 -> FORMAT DEEP ENTITY DATA & POST TO SAP');
 
//         // Extract the payload sent from your React Native app
//         const { Lifnr, Name1, ZsubDate, CreatedBy, CreatedOn, ChangedBy, ChangedOn, DraftFlag, CompletedFlag, Matnr, ZmouldItemSet } = req.body;
 
//         if (!ZmouldItemSet || !Array.isArray(ZmouldItemSet)) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Invalid payload format. actionMatrix array required."
//             });
//         }
 
//         // Formatting Date for SAP OData V2 (e.g., "/Date(1623849123000)/")
//         const currentDate = new Date();
//         const sapDateString = `\/Date(${currentDate.getTime()})\/`;
 
//         /*
//            CONSTRUCT DEEP ENTITY PAYLOAD
//            One Header Object containing an array of Items
//         */
//         const sapPayload = {
//             // ================= HEADER DETAILS =================
//             Lifnr: Lifnr,
//             Name1: (Name1 || "").substring(0, 30),
//             ZsubDate: ZsubDate,
//             CreatedBy: (CreatedBy || "").substring(0, 10),
//             CreatedOn: CreatedOn,
//             ChangedBy: ChangedBy,                                    // Avoid strict "" if SAP expects a char
//             ChangedOn: ChangedOn,
//             DraftFlag: DraftFlag,                                    // Avoid strict "" if SAP expects a char
//             CompletedFlag: CompletedFlag,
//             Matnr: Matnr,
 
//             // ================= ITEM DETAILS (NESTED ARRAY) =================
//             // CRITICAL: Replace "NavToItems" with the EXACT Navigation Property 
//             // name created in SAP SEGW (e.g., ToItem, Nav_Items, etc.)
//             ZmouldItemSet: ZmouldItemSet.map((row, index) => ({
//                 Lifnr: row.Lifnr,
//                 Name1: row.Name1,
//                 ZsubDate: row.ZsubDate,
//                 ZmouldCat: row.ZmouldCat,
//                 ZmouldCatIdH: row.ZmouldCatIdH,
//                 ZmouldHeadIdH: row.ZmouldHeadIdH,
//                 ZmouldColHead: row.ZmouldColHead,
//                 ZmouldColId: row.ZmouldColId,
//                 ZmouldColName: row.ZmouldColName,
//                 ZmouldColVal1: (row.ZmouldColVal1 || "").substring(0, 100),
//                 ZmouldColVal2: (row.ZmouldColVal2 || "").substring(0, 100),
//                 ZmouldColVal3: (row.ZmouldColVal3 || "").substring(0, 100)
//             }))
//         };
 
//         /*
//            SINGLE POST TO SAP HEADER SET
//         */
//         const sapResponse = await client.post(
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldDataHeaderSet`,
//             sapPayload,
//             {
//                 auth: {
//                     username: SAP_USERNAME,
//                     password: SAP_PASSWORD
//                 },
//                 headers: {
//                     'X-CSRF-Token': csrfToken,
//                     'Cookie': cookies, // Pass the session cookie here
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 }
//             }
//         );
 
//         console.log('SUCCESS: DEEP INSERT COMPLETED');
 
//         res.json({
//             success: true,
//             message: "Action matrix successfully saved to SAP!",
//             data: sapResponse.data
//         });
 
//     } catch (error) {
 
//         console.log('===== ERROR =====');
 
//         console.log(error.message);
 
//         // Dig deeper into SAP's specific OData error message format
//         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data;
//         console.log(sapErrorDetail);
 
//         res.status(500).json({
//             success: false,
//             error: sapErrorDetail || error.message
//         });
//     }
// });
 
// app.get("/getdetails", async (req, res) => {
 
//     try {
 
//         const { Matnr, Lifnr } = req.query;
 
//         if (!Matnr || !Lifnr) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Material Number and Supplier Number are required",
//             });
//         }
 
//         // SINGLE ODATA API
 
//         const url =
//             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldGetDataSet?$filter=Matnr eq '${Matnr}' and Lifnr eq '${Lifnr}'&$format=json`;
 
//         console.log(url)
 
//         const response = await client.get(url, {
//             auth: {
//                 username: SAP_USERNAME,
//                 password: SAP_PASSWORD,
//             },
//             headers: {
//                 Accept: "application/json",
//             },
//         });
 
//         //console.log(response);
//         const results =
//             response.data?.d?.results || [];
//         console.log(results);
//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No dropdown data found",
//             });
//         }
 
//         const moulddetails = results.map((item) => ({
//             LIFNR: item.Lifnr,
//             MATNR: item.Matnr,
//             ZMOULD_COL_HEAD: item.ZmouldColHead,
//             ZMOULD_COL_ID: item.ZmouldColId,
//             ZMOULD_COL_NAME: item.ZmouldColName,
//             ZMOULD_COL_VAL1: item.ZmouldColVal1,
//             ZMOULD_COL_VAL2: item.ZmouldColVal2,
//             ZMOULD_COL_VAL3: item.ZmouldColVal3
//         }));
 
//         console.log(moulddetails);
//         return res.json({
//             success: true,
//             moulddetails,
//         });
 
//     } catch (error) {
 
//         console.log(
//             error.response?.data || error.message
//         );
 
//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
// });
 
// /*
//    START SERVER
// */
// app.listen(3001, '0.0.0.0', () => {
 
//     console.log(
//         'Backend running on port 3001'
//     );
 
// });




// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');

// const { wrapper } = require('axios-cookiejar-support');
// const { CookieJar } = require('tough-cookie');

// const app = express();

// // =========================================================
// // 1. CRITICAL: CORS CONFIGURATION
// // This allows your frontend (webapp2) to pull data from webapp1
// // =========================================================
// app.use(cors({
//     origin: 'https://emdcindpwebapp2-atd7bmfdcmbzf0hh.centralindia-01.azurewebsites.net',
//     methods: ['GET', 'POST', 'OPTIONS'],
//     credentials: true // Required if passing cookies/tokens across origins
// }));

// app.use(express.json());

// /*
//    COOKIE JAR
// */
// const jar = new CookieJar();

// /*
//    AXIOS CLIENT
//    Configured specifically to force SAP to accept API calls
// */
// const client = wrapper(
//     axios.create({
//         jar,
//         params: {
//             // CRITICAL: Forces SAP to use client 100
//             'sap-client': '100',
//             // Prevents SAP from trying to redirect to SAML SSO web logins
//             'saml2': 'disabled'
//         },
//         headers: {
//             // CRITICAL: Tells SAP this is an API, do not send HTML login pages
//             'X-Requested-With': 'XMLHttpRequest',
//             'DataServiceVersion': '2.0',
//             'Accept': 'application/json'
//         }
//     })
// );

// /*
//    AXIOS INTERCEPTOR (FOR DEBUGGING)
//    This will print the exact headers going to SAP in your terminal
// */
// client.interceptors.request.use(request => {
//     console.log('\n--- SENDING TO SAP ---');
//     console.log('URL:', request.url);
//     console.log('HEADERS:', JSON.stringify(request.headers, null, 2));
//     return request;
// });

// /*
//    SAP CONFIG
// */
// // const SAP_BASE_URL = 'https://emdcindpwebapp1-bag2gfhjd9d4gkh6.centralindia-01.azurewebsites.net/api/users/';
// const SAP_BASE_URL = 'https://emamidev.emami.local:4440/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV';

// /*
//    OAUTH CONFIG & TOKEN MANAGER
// */
// const OAUTH_URL = 'https://login.microsoftonline.com/d016aebd-1f96-4dd1-a22b-eeb0201fb61e/oauth2/token?sap-client=100';
// const CLIENT_ID = '6225aa6f-d228-4127-8f88-81b08e2aca69';
// const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
// const SCOPE = 'api://6225aa6f-d228-4127-8f88-81b08e2aca69/Sap.Odata.Access';

// let cachedToken = null;
// let tokenExpiration = null;

// // Helper function to get or refresh the OAuth token
// async function getAccessToken() {
//     // If we have a valid token that hasn't expired, return it
//     if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
//         return cachedToken;
//     }

//     try {
//         console.log('\nFetching new OAuth Access Token from Microsoft...');
        
//         const payload = new URLSearchParams({
//             grant_type: 'client_credentials',
//             client_id: CLIENT_ID,
//             client_secret: CLIENT_SECRET,
//             scope: SCOPE
//         });

//         const response = await axios.post(OAUTH_URL, payload.toString(), {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             }
//         });

//         cachedToken = response.data.access_token;
        
//         // Calculate expiration time (buffer by 5 minutes to prevent edge-case failures)
//         const expiresInSeconds = response.data.expires_in || 3599; 
//         tokenExpiration = Date.now() + (expiresInSeconds - 300) * 1000;

//         console.log('Microsoft Token Fetched Successfully.');
//         return cachedToken;
//     } catch (error) {
//         console.error('Failed to fetch OAuth Token:', error.response?.data || error.message);
//         throw new Error('OAuth authentication failed');
//     }
// }

// /*
//    REGISTER API
// */
// // app.post('/register', async (req, res) => {
// //     try {
// //         console.log('STEP 1 -> FETCH TOKEN');
// //         const accessToken = await getAccessToken();

// //         /*
// //            GET CSRF TOKEN
// //         */
// //         const tokenResponse = await client.get(
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/`,
// //             {
// //                 headers: {
// //                     'X-CSRF-Token': 'Fetch',
// //                     'Authorization': `Bearer ${accessToken}`
// //                 }
// //             }
// //         );

// //         /*
// //            TOKEN
// //         */
// //         const csrfToken = tokenResponse.headers['x-csrf-token'];

// //         console.log('CSRF TOKEN:', csrfToken);
// //         console.log('STEP 2 -> POST TO SAP');

// //         /*
// //            POST TO SAP
// //         */
// //         const sapResponse = await client.post(
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/MouldUser001Set`,
// //             req.body,
// //             {
// //                 headers: {
// //                     'X-CSRF-Token': csrfToken,
// //                     'Content-Type': 'application/json',
// //                     'Authorization': `Bearer ${accessToken}`
// //                 }
// //             }
// //         );

// //         console.log('SUCCESS');

// //         res.json({
// //             success: true,
// //             data: sapResponse.data
// //         });

// //     } catch (error) {
// //         console.log('===== ERROR =====');
// //         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
// //         console.log(sapErrorDetail);

// //         res.status(500).json({
// //             success: false,
// //             error: sapErrorDetail
// //         });
// //     }
// // });

// const apiRouter = express.Router();

// apiRouter.get('/login', async (req, res) => {
//     try {
//         const { Email } = req.query;

//         if (!Email) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Missing parameters'
//             });
//         }

//         const accessToken = await getAccessToken();
//         console.log("Access Token:", accessToken);
//         console.log("Email:", Email)
//         //console.log(url);
//         const url = `${SAP_BASE_URL}/ZmouldLoginSet?$filter=Email eq '${Email}'&$format=json`;

//         const response = await client.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         });

//         const users = response.data?.d?.results || [];

//         if (users.length === 0) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }

//         const user = users[0];
//         console.log("Login success:", user);

//         return res.json({
//             success: true,
//             user
//         });

//     } catch (error) {
//         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
//         console.log(sapErrorDetail);
        
//         return res.status(500).json({
//             success: false,
//             error: sapErrorDetail
//         });
//     }
// });

// apiRouter.get("/dashboard", async (req, res) => {
//     try {
//         const { SMTP_ADDR } = req.query;

//         console.log("Received dashboard request for:", SMTP_ADDR);
//         if (!SMTP_ADDR) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Email is required",
//             });
//         }

//         const accessToken = await getAccessToken();
//         const url = `${SAP_BASE_URL}/ZMouldDetailsSet?$filter=SmtpAddr eq '${SMTP_ADDR}'&$format=json`;

//         const response = await client.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             },
//         });

//         const results = response.data?.d?.results || [];

//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No dashboard data found",
//             });
//         }

//         // Vendor Details from First Record
//         const vendor = {
//             vendorCode: results[0].Lifnr,
//             vendorName: results[0].Name1,
//             email: results[0].SmtpAddr,
//             matnr: results[0].Matnr,
//         };

//         const materials = results.map((item) => ({
//             materialCode: item.Matnr,
//             materialDescription: item.Maktx,
//             componentPart: item.ZzcompPart,
//             runnerType: item.Zzrunner,
//             granulesGrade: item.Zzgran,
//             machineCode: item.Zzmach,
//             cavity: item.ZzcavityNo,
//             runningCavity: item.ZzrunCavity,
//             cycleTime: item.ZzcycTime,
//             efficiency: item.ZzfacProd,
//             hoursPerDay: item.ZzhoursDay,
//             designCode: item.ZzmdsCode,
//             mouldLife: item.ZzmoldLife,
//             mouldShots: item.ZzmoldShots,
//             planningCode: item.ZzplanCode,
//             fgDesignCode: item.ZzfgCode,
//         }));

//         return res.json({
//             success: true,
//             vendor,
//             materials,
//         });

//     } catch (error) {
//         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
//         console.log(sapErrorDetail);
        
//         return res.status(500).json({
//             success: false,
//             error: sapErrorDetail,
//         });
//     }
// });

// app.get("/dropdown", async (req, res) => {
//     try {
//         const { ZmouldCatId, ZmouldHeadId } = req.query;

//         if (!ZmouldCatId || !ZmouldHeadId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Mould Category ID and Mould Header ID are required",
//             });
//         }

//         const accessToken = await getAccessToken();
//         const url = `${SAP_BASE_URL}/ZMouldDropDownSet?$filter=ZmouldCatId eq '${ZmouldCatId}' and ZmouldHeadId eq '${ZmouldHeadId}'&$format=json`;

//         const response = await client.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             },
//         });

//         const results = response.data?.d?.results || [];

//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No dropdown data found",
//             });
//         }

//         const dropdowns = results.map((item) => ({
//             Zmouldfield: item.ZmouldField,
//         }));

//         return res.json({
//             success: true,
//             dropdowns,
//         });

//     } catch (error) {
//         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
//         console.log(sapErrorDetail);
        
//         return res.status(500).json({
//             success: false,
//             error: sapErrorDetail,
//         });
//     }
// });

// app.get("/headerdropdown", async (req, res) => {
//     try {
//         const { ZmouldCatId, ZmouldHeadId } = req.query;

//         if (!ZmouldCatId || !ZmouldHeadId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Mould Category ID and Mould Header ID are required",
//             });
//         }

//         const accessToken = await getAccessToken();
//         const url = `${SAP_BASE_URL}/ZMouldHeaderSet?$filter=ZmouldCatId eq '${ZmouldCatId}' and ZmouldHeadId eq '${ZmouldHeadId}'&$format=json`;

//         const response = await client.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             },
//         });

//         const results = response.data?.d?.results || [];
        
//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No dropdown data found",
//             });
//         }

//         const dropdowns = results.map((item) => ({
//             Zmouldfield: item.ZmouldField,
//             Zroute: item.Zroute
//         }));

//         return res.json({
//             success: true,
//             dropdowns,
//         });

//     } catch (error) {
//         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
//         console.log(sapErrorDetail);
        
//         return res.status(500).json({
//             success: false,
//             error: sapErrorDetail,
//         });
//     }
// });

// /*
//    SUBMIT API
// */
// app.post('/submit', async (req, res) => {
//     try {
//         console.log('STEP 1 -> FETCH TOKEN');
//         const accessToken = await getAccessToken();

//         /*
//            GET CSRF TOKEN & COOKIES
//         */
//         const tokenResponse = await client.get(
//             `${SAP_BASE_URL}/`,
//             {
//                 headers: {
//                     'X-CSRF-Token': 'Fetch',
//                     'Authorization': `Bearer ${accessToken}`
//                 }
//             }
//         );

//         /*
//            TOKEN & COOKIES
//         */
//         const csrfToken = tokenResponse.headers['x-csrf-token'];
//         const cookies = tokenResponse.headers['set-cookie']; // CRITICAL: Extract SAP Session Cookie

//         console.log('CSRF TOKEN:', csrfToken);
//         console.log('STEP 2 -> FORMAT DEEP ENTITY DATA & POST TO SAP');

//         const { Lifnr, Name1, ZsubDate, CreatedBy, CreatedOn, ChangedBy, ChangedOn, DraftFlag, CompletedFlag, Matnr, ZmouldItemSet } = req.body;

//         if (!ZmouldItemSet || !Array.isArray(ZmouldItemSet)) {
//             return res.status(400).json({
//                 success: false,
//                 error: "Invalid payload format. actionMatrix array required."
//             });
//         }

//         /*
//            CONSTRUCT DEEP ENTITY PAYLOAD
//         */
//         const sapPayload = {
//             Lifnr: Lifnr,
//             Name1: (Name1 || "").substring(0, 30),
//             ZsubDate: ZsubDate,
//             CreatedBy: (CreatedBy || "").substring(0, 10),
//             CreatedOn: CreatedOn,
//             ChangedBy: ChangedBy,
//             ChangedOn: ChangedOn,
//             DraftFlag: DraftFlag,
//             CompletedFlag: CompletedFlag,
//             Matnr: Matnr,
//             ZmouldItemSet: ZmouldItemSet.map((row) => ({
//                 Lifnr: row.Lifnr,
//                 Name1: row.Name1,
//                 ZsubDate: row.ZsubDate,
//                 ZmouldCat: row.ZmouldCat,
//                 ZmouldCatIdH: row.ZmouldCatIdH,
//                 ZmouldHeadIdH: row.ZmouldHeadIdH,
//                 ZmouldColHead: row.ZmouldColHead,
//                 ZmouldColId: row.ZmouldColId,
//                 ZmouldColName: row.ZmouldColName,
//                 ZmouldColVal1: (row.ZmouldColVal1 || "").substring(0, 100),
//                 ZmouldColVal2: (row.ZmouldColVal2 || "").substring(0, 100),
//                 ZmouldColVal3: (row.ZmouldColVal3 || "").substring(0, 100)
//             }))
//         };

//         /*
//            SINGLE POST TO SAP HEADER SET
//         */
//         const sapResponse = await client.post(
//             `${SAP_BASE_URL}/ZMouldDataHeaderSet`,
//             sapPayload,
//             {
//                 headers: {
//                     'X-CSRF-Token': csrfToken,
//                     'Cookie': cookies, // Pass the session cookie here
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${accessToken}`
//                 }
//             }
//         );

//         console.log('SUCCESS: DEEP INSERT COMPLETED');

//         res.json({
//             success: true,
//             message: "Action matrix successfully saved to SAP!",
//             data: sapResponse.data
//         });

//     } catch (error) {
//         console.log('===== ERROR =====');
//         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
//         console.log(sapErrorDetail);

//         res.status(500).json({
//             success: false,
//             error: sapErrorDetail
//         });
//     }
// });

// app.get("/getdetails", async (req, res) => {
//     try {
//         const { Matnr, Lifnr } = req.query;

//         if (!Matnr || !Lifnr) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Material Number and Supplier Number are required",
//             });
//         }

//         const accessToken = await getAccessToken();
//         const url = `${SAP_BASE_URL}/ZMouldGetDataSet?$filter=Matnr eq '${Matnr}' and Lifnr eq '${Lifnr}'&$format=json`;

//         const response = await client.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             },
//         });

//         const results = response.data?.d?.results || [];
        
//         if (results.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No dropdown data found",
//             });
//         }

//         const moulddetails = results.map((item) => ({
//             LIFNR: item.Lifnr,
//             MATNR: item.Matnr,
//             ZMOULD_COL_HEAD: item.ZmouldColHead,
//             ZMOULD_COL_ID: item.ZmouldColId,
//             ZMOULD_COL_NAME: item.ZmouldColName,
//             ZMOULD_COL_VAL1: item.ZmouldColVal1,
//             ZMOULD_COL_VAL2: item.ZmouldColVal2,
//             ZMOULD_COL_VAL3: item.ZmouldColVal3
//         }));

//         return res.json({
//             success: true,
//             moulddetails,
//         });

//     } catch (error) {
//         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data || error.message;
//         console.log(sapErrorDetail);
        
//         return res.status(500).json({
//             success: false,
//             error: sapErrorDetail,
//         });
//     }
// });

// /*
//    START SERVER
// */
// app.listen(443, '0.0.0.0', () => {
//     console.log('Backend running on port 443');
// });

// // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// // const express = require('express');
// // const axios = require('axios');
// // const cors = require('cors');

// // const { wrapper } = require('axios-cookiejar-support');
// // const { CookieJar } = require('tough-cookie');

// // const app = express();

// // app.use(cors());
// // app.use(express.json());

// // /*
// //    COOKIE JAR
// // */
// // const jar = new CookieJar();

// // /*
// //    AXIOS CLIENT
// // */
// // const client = wrapper(
// //     axios.create({
// //         jar
// //     })
// // );

// // /*
// //    SAP CONFIG
// // */
// // const SAP_BASE_URL =
// //     'https://emamidev.emami.local:4440';

// // const SAP_USERNAME =
// //     'IT_FCOMMON';

// // const SAP_PASSWORD =
// //     'Emami@1234';

// // /*
// //    REGISTER API
// // */
// // app.post('/register', async (req, res) => {

// //     try {

// //         console.log('STEP 1 -> FETCH TOKEN');

// //         /*
// //            GET CSRF TOKEN
// //         */
// //         const tokenResponse = await client.get(
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/`,
// //             {
// //                 auth: {
// //                     username: SAP_USERNAME,
// //                     password: SAP_PASSWORD
// //                 },
// //                 headers: {
// //                     'X-CSRF-Token': 'Fetch'
// //                 }
// //             }
// //         );

// //         /*
// //            TOKEN
// //         */
// //         const csrfToken =
// //             tokenResponse.headers['x-csrf-token'];

// //         console.log('TOKEN:', csrfToken);

// //         console.log('STEP 2 -> POST TO SAP');

// //         /*
// //            POST TO SAP
// //         */
// //         const sapResponse = await client.post(
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/MouldUser001Set`,
// //             req.body,
// //             {
// //                 auth: {
// //                     username: SAP_USERNAME,
// //                     password: SAP_PASSWORD
// //                 },
// //                 headers: {
// //                     'X-CSRF-Token': csrfToken,
// //                     'Content-Type': 'application/json',
// //                     'Accept': 'application/json'
// //                 }
// //             }
// //         );

// //         console.log('SUCCESS');

// //         res.json({
// //             success: true,
// //             data: sapResponse.data
// //         });

// //     } catch (error) {

// //         console.log('===== ERROR =====');

// //         console.log(error.message);

// //         console.log(error.response?.data);

// //         res.status(500).json({
// //             success: false,
// //             error:
// //                 error.response?.data || error.message
// //         });
// //     }
// // });

// // app.get('/login', async (req, res) => {

// //     try {

// //         const { Email } = req.query;

// //         if (!Email) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: 'Missing parameters'
// //             });
// //         }

// //         const url =
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZmouldLoginSet?$filter=Email eq '${Email}'&$format=json`;

// //         const response = await client.get(url, {
// //             auth: {
// //                 username: SAP_USERNAME,
// //                 password: SAP_PASSWORD
// //             },
// //             headers: {
// //                 Accept: 'application/json'
// //             }
// //         });

// //         const users = response.data?.d?.results || [];

// //         if (users.length === 0) {
// //             return res.status(401).json({
// //                 success: false,
// //                 message: 'User not found'
// //             });
// //         }

// //         const user = users[0];

// //         console.log("Login success:", user);

// //         return res.json({
// //             success: true,
// //             user
// //         });

// //     } catch (error) {

// //         console.log(error.response?.data || error.message);

// //         return res.status(500).json({
// //             success: false,
// //             error: error.message
// //         });
// //     }
// // });

// // app.get("/dashboard", async (req, res) => {

// //     try {

// //         const { SMTP_ADDR } = req.query;

// //         console.log("Received dashboard request for:", SMTP_ADDR);
// //         if (!SMTP_ADDR) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Email is required",
// //             });
// //         }

// //         // SINGLE ODATA API
// //         const url =
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldDetailsSet?$filter=SmtpAddr eq '${SMTP_ADDR}'&$format=json`;

// //         const response = await client.get(url, {
// //             auth: {
// //                 username: SAP_USERNAME,
// //                 password: SAP_PASSWORD,
// //             },
// //             headers: {
// //                 Accept: "application/json",
// //             },
// //         });

// //         const results =
// //             response.data?.d?.results || [];

// //         if (results.length === 0) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: "No dashboard data found",
// //             });
// //         }

// //         // Vendor Details from First Record
// //         const vendor = {
// //             vendorCode: results[0].Lifnr,
// //             vendorName: results[0].Name1,
// //             email: results[0].SmtpAddr,
// //             matnr: results[0].Matnr,
// //         };

// //         const materials = results.map((item) => ({
// //             materialCode: item.Matnr,
// //             materialDescription: item.Maktx,
// //             componentPart: item.ZzcompPart,
// //             runnerType: item.Zzrunner,
// //             granulesGrade: item.Zzgran,
// //             machineCode: item.Zzmach,
// //             cavity: item.ZzcavityNo,
// //             runningCavity: item.ZzrunCavity,
// //             cycleTime: item.ZzcycTime,
// //             efficiency: item.ZzfacProd,
// //             hoursPerDay: item.ZzhoursDay,
// //             designCode: item.ZzmdsCode,
// //             mouldLife: item.ZzmoldLife,
// //             mouldShots: item.ZzmoldShots,
// //             planningCode: item.ZzplanCode,
// //             fgDesignCode: item.ZzfgCode,
// //         }));

// //         return res.json({
// //             success: true,
// //             vendor,
// //             materials,
// //         });

// //     } catch (error) {

// //         console.log(
// //             error.response?.data || error.message
// //         );

// //         return res.status(500).json({
// //             success: false,
// //             error: error.message,
// //         });
// //     }
// // });


// // app.get("/dropdown", async (req, res) => {

// //     try {

// //         const { ZmouldCatId, ZmouldHeadId } = req.query;

// //         if (!ZmouldCatId || !ZmouldHeadId) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Mould Category ID and Mould Header ID are required",
// //             });
// //         }

// //         // SINGLE ODATA API
// //         const url =
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldDropDownSet?$filter=ZmouldCatId eq '${ZmouldCatId}' and ZmouldHeadId eq '${ZmouldHeadId}'&$format=json`;

// //         const response = await client.get(url, {
// //             auth: {
// //                 username: SAP_USERNAME,
// //                 password: SAP_PASSWORD,
// //             },
// //             headers: {
// //                 Accept: "application/json",
// //             },
// //         });

// //         const results =
// //             response.data?.d?.results || [];

// //         if (results.length === 0) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: "No dropdown data found",
// //             });
// //         }

// //         const dropdowns = results.map((item) => ({
// //             Zmouldfield: item.ZmouldField,
// //         }));

// //         return res.json({
// //             success: true,
// //             dropdowns,
// //         });

// //     } catch (error) {

// //         console.log(
// //             error.response?.data || error.message
// //         );

// //         return res.status(500).json({
// //             success: false,
// //             error: error.message,
// //         });
// //     }
// // });

// // app.get("/headerdropdown", async (req, res) => {

// //     try {

// //         const { ZmouldCatId, ZmouldHeadId } = req.query;

// //         if (!ZmouldCatId || !ZmouldHeadId) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Mould Category ID and Mould Header ID are required",
// //             });
// //         }

// //         // SINGLE ODATA API

// //         const url =
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldHeaderSet?$filter=ZmouldCatId eq '${ZmouldCatId}' and ZmouldHeadId eq '${ZmouldHeadId}'&$format=json`;

// //         console.log(url)

// //         const response = await client.get(url, {
// //             auth: {
// //                 username: SAP_USERNAME,
// //                 password: SAP_PASSWORD,
// //             },
// //             headers: {
// //                 Accept: "application/json",
// //             },
// //         });

// //         //console.log(response);
// //         const results =
// //             response.data?.d?.results || [];
// //         console.log(results);
// //         if (results.length === 0) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: "No dropdown data found",
// //             });
// //         }

// //         //console.log(item);
// //         const dropdowns = results.map((item) => ({
// //             Zmouldfield: item.ZmouldField,
// //             Zroute: item.Zroute
// //         }));

// //         console.log(dropdowns);
// //         return res.json({
// //             success: true,
// //             dropdowns,
// //         });

// //     } catch (error) {

// //         console.log(
// //             error.response?.data || error.message
// //         );

// //         return res.status(500).json({
// //             success: false,
// //             error: error.message,
// //         });
// //     }
// // });

// // /*
// //    REGISTER API
// // */
// // app.post('/submit', async (req, res) => {

// //     try {

// //         console.log('STEP 1 -> FETCH TOKEN');

// //         /*
// //            GET CSRF TOKEN & COOKIES
// //         */
// //         const tokenResponse = await client.get(
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/`,
// //             {
// //                 auth: {
// //                     username: SAP_USERNAME,
// //                     password: SAP_PASSWORD
// //                 },
// //                 headers: {
// //                     'X-CSRF-Token': 'Fetch'
// //                 }
// //             }
// //         );

// //         /*
// //            TOKEN & COOKIES
// //         */
// //         const csrfToken = tokenResponse.headers['x-csrf-token'];
// //         const cookies = tokenResponse.headers['set-cookie']; // CRITICAL: Extract SAP Session Cookie

// //         console.log('TOKEN:', csrfToken);

// //         console.log('STEP 2 -> FORMAT DEEP ENTITY DATA & POST TO SAP');

// //         // Extract the payload sent from your React Native app
// //         const { Lifnr, Name1, ZsubDate, CreatedBy, CreatedOn, ChangedBy, ChangedOn, DraftFlag, CompletedFlag, Matnr, ZmouldItemSet } = req.body;

// //         if (!ZmouldItemSet || !Array.isArray(ZmouldItemSet)) {
// //             return res.status(400).json({
// //                 success: false,
// //                 error: "Invalid payload format. actionMatrix array required."
// //             });
// //         }

// //         // Formatting Date for SAP OData V2 (e.g., "/Date(1623849123000)/")
// //         const currentDate = new Date();
// //         const sapDateString = `\/Date(${currentDate.getTime()})\/`;

// //         /*
// //            CONSTRUCT DEEP ENTITY PAYLOAD
// //            One Header Object containing an array of Items
// //         */
// //         const sapPayload = {
// //             // ================= HEADER DETAILS =================
// //             Lifnr: Lifnr,
// //             Name1: (Name1 || "").substring(0, 30),
// //             ZsubDate: ZsubDate,
// //             CreatedBy: (CreatedBy || "").substring(0, 10),
// //             CreatedOn: CreatedOn,
// //             ChangedBy: ChangedBy,                                    // Avoid strict "" if SAP expects a char
// //             ChangedOn: ChangedOn,
// //             DraftFlag: DraftFlag,                                    // Avoid strict "" if SAP expects a char
// //             CompletedFlag: CompletedFlag,
// //             Matnr: Matnr,

// //             // ================= ITEM DETAILS (NESTED ARRAY) =================
// //             // CRITICAL: Replace "NavToItems" with the EXACT Navigation Property 
// //             // name created in SAP SEGW (e.g., ToItem, Nav_Items, etc.)
// //             ZmouldItemSet: ZmouldItemSet.map((row, index) => ({
// //                 Lifnr: row.Lifnr,
// //                 Name1: row.Name1,
// //                 ZsubDate: row.ZsubDate,
// //                 ZmouldCat: row.ZmouldCat,
// //                 ZmouldCatIdH: row.ZmouldCatIdH,
// //                 ZmouldHeadIdH: row.ZmouldHeadIdH,
// //                 ZmouldColHead: row.ZmouldColHead,
// //                 ZmouldColId: row.ZmouldColId,
// //                 ZmouldColName: row.ZmouldColName,
// //                 ZmouldColVal1: (row.ZmouldColVal1 || "").substring(0, 100),
// //                 ZmouldColVal2: (row.ZmouldColVal2 || "").substring(0, 100),
// //                 ZmouldColVal3: (row.ZmouldColVal3 || "").substring(0, 100)
// //             }))
// //         };

// //         /*
// //            SINGLE POST TO SAP HEADER SET
// //         */
// //         const sapResponse = await client.post(
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldDataHeaderSet`,
// //             sapPayload,
// //             {
// //                 auth: {
// //                     username: SAP_USERNAME,
// //                     password: SAP_PASSWORD
// //                 },
// //                 headers: {
// //                     'X-CSRF-Token': csrfToken,
// //                     'Cookie': cookies, // Pass the session cookie here
// //                     'Content-Type': 'application/json',
// //                     'Accept': 'application/json'
// //                 }
// //             }
// //         );

// //         console.log('SUCCESS: DEEP INSERT COMPLETED');

// //         res.json({
// //             success: true,
// //             message: "Action matrix successfully saved to SAP!",
// //             data: sapResponse.data
// //         });

// //     } catch (error) {

// //         console.log('===== ERROR =====');

// //         console.log(error.message);

// //         // Dig deeper into SAP's specific OData error message format
// //         const sapErrorDetail = error.response?.data?.error?.message?.value || error.response?.data;
// //         console.log(sapErrorDetail);

// //         res.status(500).json({
// //             success: false,
// //             error: sapErrorDetail || error.message
// //         });
// //     }
// // });

// // app.get("/getdetails", async (req, res) => {

// //     try {

// //         const { Matnr, Lifnr } = req.query;

// //         if (!Matnr || !Lifnr) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Material Number and Supplier Number are required",
// //             });
// //         }

// //         // SINGLE ODATA API

// //         const url =
// //             `${SAP_BASE_URL}/sap/opu/odata/sap/ZMM_MOULD_CARE_SRV/ZMouldGetDataSet?$filter=Matnr eq '${Matnr}' and Lifnr eq '${Lifnr}'&$format=json`;

// //         console.log(url)

// //         const response = await client.get(url, {
// //             auth: {
// //                 username: SAP_USERNAME,
// //                 password: SAP_PASSWORD,
// //             },
// //             headers: {
// //                 Accept: "application/json",
// //             },
// //         });

// //         //console.log(response);
// //         const results =
// //             response.data?.d?.results || [];
// //         console.log(results);
// //         if (results.length === 0) {
// //             return res.status(404).json({
// //                 success: false,
// //                 message: "No dropdown data found",
// //             });
// //         }

// //         const moulddetails = results.map((item) => ({
// //             LIFNR: item.Lifnr,
// //             MATNR: item.Matnr,
// //             ZMOULD_COL_HEAD: item.ZmouldColHead,
// //             ZMOULD_COL_ID: item.ZmouldColId,
// //             ZMOULD_COL_NAME: item.ZmouldColName,
// //             ZMOULD_COL_VAL1: item.ZmouldColVal1,
// //             ZMOULD_COL_VAL2: item.ZmouldColVal2,
// //             ZMOULD_COL_VAL3: item.ZmouldColVal3
// //         }));

// //         console.log(moulddetails);
// //         return res.json({
// //             success: true,
// //             moulddetails,
// //         });

// //     } catch (error) {

// //         console.log(
// //             error.response?.data || error.message
// //         );

// //         return res.status(500).json({
// //             success: false,
// //             error: error.message,
// //         });
// //     }
// // });

// // /*
// //    START SERVER
// // */
// // app.listen(3001, '0.0.0.0', () => {

// //     console.log(
// //         'Backend running on port 3001'
// //     );

// // });