const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pino = require("pino");
const { default: Oblivion_Tech, useMultiFileAuthState, Browsers, delay } = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (fs.existsSync(FilePath)) fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    
    try {
        const oblivion = Oblivion_Tech({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: Browsers.macOS("Oblivion Terminal")
        });

        oblivion.ev.on('creds.update', saveCreds);
        oblivion.ev.on("connection.update", async (update) => {
            const { connection, qr } = update;
            if (qr) await res.end(await QRCode.toBuffer(qr));
            if (connection === "open") {
                await delay(3000);
                const sessionData = fs.readFileSync(`./temp/${id}/creds.json`);
                await oblivion.sendMessage(oblivion.user.id, { 
                    text: `OBLIVION_SESSION:${Buffer.from(sessionData).toString('base64')}` 
                });
                await oblivion.ws.close();
                removeFile(`./temp/${id}`);
            }
        });
    } catch (err) {
        console.error("Oblivion Protocol Error:", err);
        removeFile(`./temp/${id}`);
        res.status(500).send("Quantum Link Failure");
    }
});

module.exports = router;
