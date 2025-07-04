const PastebinAPI = require('pastebin-js'),
    pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require("pino");
let router = express.Router();
const {
    default: Oblivion_Tech, useMultiFileAuthState, delay,
    makeCacheableSignalKeyStore, Browsers
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (fs.existsSync(FilePath)) fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function OBLIVION_PAIRING(retryCount = 0) {
        if (retryCount > 3) return res.send({ code: "SYSTEM OVERLOAD" });

        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Oblivion_Connection = Oblivion_Tech({
                auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })) },
                printQRInTerminal: false, logger: pino({ level: "fatal" }),
                browser: ["Ubuntu", "Chrome", "20.0.04"]
            });

            if (!Oblivion_Connection.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Oblivion_Connection.requestPairingCode(num);
                if (!res.headersSent) res.send({ code });
            }

            Oblivion_Connection.ev.on('creds.update', saveCreds);
            Oblivion_Connection.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    await delay(5000);
                    let sessionData;
                    try {
                        sessionData = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', id, 'creds.json')));
                    } catch (err) { console.error("DATA CORRUPTION:", err); return; }
             let session = {
    noiseKey: sessionData.noiseKey, pairingEphemeralKeyPair: sessionData.pairingEphemeralKeyPair,
    signedIdentityKey: sessionData.signedIdentityKey, signedPreKey: sessionData.signedPreKey,
    registrationId: sessionData.registrationId, advSecretKey: sessionData.advSecretKey,
    processedHistoryMessages: sessionData.processedHistoryMessages || [], timestamp: Date.now(),
    nextPreKeyId: sessionData.nextPreKeyId || null, firstUnuploadedPreKeyId: sessionData.firstUnuploadedPreKeyId || null,
    keyId: sessionData.keyId || null, deviceId: sessionData.deviceId || "unknown",
    phoneId: sessionData.phoneId || "unknown", identityId: sessionData.identityId || null,
    registered: sessionData.registered ?? false, backupToken: sessionData.backupToken || null,
    registration: sessionData.registration || {}, pairingCode: sessionData.pairingCode || "",
    me: sessionData.me || {}, accountSyncCounter: sessionData.accountSyncCounter || 0,
    accountSettings: sessionData.accountSettings || { unarchiveChats: false }, isAuthenticated: sessionData.isAuthenticated ?? false,
    connectionState: sessionData.connectionState || "pending", retryCount: sessionData.retryCount || 0,
    lastError: sessionData.lastError || null, reconnectAttempts: sessionData.reconnectAttempts || 0,
    latency: sessionData.latency || null, dataUsage: sessionData.dataUsage || { sent: 0, received: 0 }, logs: sessionData.logs || [],
    signalIdentities: sessionData.signalIdentities || [], platform: sessionData.platform || "unknown",
    lastAccountSyncTimestamp: sessionData.lastAccountSyncTimestamp || 0, myAppStateKeyId: sessionData.myAppStateKeyId || null,
    account: sessionData.account || {}
};
                    let OBLIVION_SYSTEM_MESSAGE = `
╔════════════════════════╗
║  OBLIVION NETWORK: CONNECTION ESTABLISHED  
║  SECURITY PROTOCOL: ACTIVE  
╚════════════════════════╝

■ INITIATING DEPLOYMENT SEQUENCE ■

[1] DATA EXTRACTION:
   └ SESSION_ID acquired
   └ Security token generated
   └ Encryption layers activated

[2] MAINFRAME CONFIGURATION:
   └ Access Oblivion Network @ https://oblivion-network.io  
   └ Authentication required
   └ Locate Oblivion Core v3.2.1

[3] SECURITY PARAMETERS:
   └ Set access prefix (recommended: !, ., #)
   └ Admin privileges required
   └ Input international format: 234xxxxxxxxxx

[4] SYSTEM TYPE:
   └ Public (open network)
   └ Private (restricted access)

[5] IDENTITY CONFIGURATION:
   └ Set authorization tags
   └ Configure data signatures

[6] DEPLOYMENT:
   └ Execute deployment sequence
   └ System initialization in progress...

━━━━━━━━━━━━━━━━━━━━━━  
■ SYSTEM LINKS ■
[+] Mainframe: https://oblivion-network.io  
[+] Admin: https://wa.me/2347079059033  
[+] Source: https://github.com/Oblivion-Web/core  
[+] Data Channel: https://whatsapp.com/channel/OblivionData  

━━━━━━━━━━━━━━━━━━━━━━  
■ SYSTEM READY ■
■ INITIALIZATION COMPLETE ■
`;

                    let sessionzz = `${JSON.stringify(session)}`;
                    await Oblivion_Connection.sendMessage(Oblivion_Connection.user.id, { text: sessionzz });
                    await Oblivion_Connection.sendMessage(Oblivion_Connection.user.id, { text: OBLIVION_SYSTEM_MESSAGE });

                    await delay(100);
                    await Oblivion_Connection.ws.close();
                    removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log("RECONNECTING...");
                    await delay(10000);
                    OBLIVION_PAIRING(retryCount + 1);
                }
            });
        } catch (err) {
            console.error("SYSTEM FAILURE:", err);
            removeFile('./temp/' + id);
            if (!res.headersSent) res.send({ code: "SYSTEM OFFLINE" });
        }
    }

    return OBLIVION_PAIRING();
});

module.exports = router;
