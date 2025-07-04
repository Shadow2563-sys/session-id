const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    default: Oblivion_Tech,
    useMultiFileAuthState,
    jidNormalizedUser,
    Browsers,
    delay,
    makeInMemoryStore,
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, {
        recursive: true,
        force: true
    })
};

const {
    readFile
} = require("node:fs/promises")
router.get('/', async (req, res) => {
    const id = makeid();
    async function OBLIVION_QR_GENERATOR() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id)
        try {
            let Qr_Code_By_Oblivion = Oblivion_Tech({
                auth: state,
                printQRInTerminal: false,
                logger: pino({
                    level: "silent"
                }),
                browser: Browsers.macOS("Oblivion Terminal"),
            });

            Qr_Code_By_Oblivion.ev.on('creds.update', saveCreds)
            Qr_Code_By_Oblivion.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect,
                    qr
                } = s;
                if (qr) await res.end(await QRCode.toBuffer(qr));
                if (connection == "open") {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    let session = await Qr_Code_By_Oblivion.sendMessage(Qr_Code_By_Oblivion.user.id, { text: '' + b64data });
    
                    let OBLIVION_TEXT = `
*_Oblivion Web Authentication_*
*_Access Granted_*
______________________________________
*_Secure Connection Established_*
*_Oblivion Protocol v3.2.1_*
______________________________________
╔════◇
║ *『 OBLIVION NETWORK ACCESS 』*
║ _Authentication sequence complete._
║ _Session encrypted and secured._
╚══════════════════════╝
╔═════◇
║  『••• SYSTEM LINKS •••』
║❒ *Mainframe:* _oblivion-network.io_
║❒ *Admin:* _https://wa.me/message/2348093017755_
║❒ *Source:* _https://github.com/Oblivion-Web/core_
║❒ *Access Hub:* _https://chat.whatsapp.com/OblivionHub_
║❒ *Data Stream:* _https://whatsapp.com/channel/OblivionData_
║❒ *Modules:* _https://github.com/Oblivion-Web/modules_
╚══════════════════════╝ 
_____________________________________
    
_Initiate sequence complete. Welcome to the network._`
                    await Qr_Code_By_Oblivion.sendMessage(Qr_Code_By_Oblivion.user.id,{text:OBLIVION_TEXT},{quoted:session})

                    await delay(100);
                    await Qr_Code_By_Oblivion.ws.close();
                    return await removeFile("temp/" + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    OBLIVION_QR_GENERATOR();
                }
            });
        } catch (err) {
            if (!res.headersSent) {
                await res.json({
                    code: "SYSTEM ERROR: Connection failed"
                });
            }
            console.log(err);
            await removeFile("temp/" + id);
        }
    }
    return await OBLIVION_QR_GENERATOR()
});
module.exports = router
