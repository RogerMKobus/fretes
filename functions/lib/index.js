"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = exports.listen = exports.publish = exports.calculaFrete = void 0;
const functions = require("firebase-functions");
const xml_js_1 = require("xml-js");
const pubsub_1 = require("@google-cloud/pubsub");
const admin = require("firebase-admin");
const axios_1 = require("./services/axios");
var serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
exports.calculaFrete = functions.https.onRequest(async (req, res) => {
    try {
        const { origin_postcode, destination_postcode, width, height, length, weight } = req.body;
        const { data: pac } = await axios_1.default.get(`/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo?nCdEmpresa= &sDsSenha= &nCdServico=04510&sCepOrigem=${origin_postcode}&sCepDestino=${destination_postcode}&nVlPeso=${weight}&nCdFormato=1&nVlComprimento=${length}&nVlAltura=${height}&nVlLargura=${width}&nVlDiametro=0&sCdMaoPropria=s&nVlValorDeclarado=0&sCdAvisoRecebimento=n`);
        const { data: sedex } = await axios_1.default.get(`/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo?nCdEmpresa= &sDsSenha= &nCdServico=04014&sCepOrigem=${origin_postcode}&sCepDestino=${destination_postcode}&nVlPeso=${weight}&nCdFormato=1&nVlComprimento=${length}&nVlAltura=${height}&nVlLargura=${width}&nVlDiametro=0&sCdMaoPropria=s&nVlValorDeclarado=0&sCdAvisoRecebimento=n`);
        res.status(200).json({
            pac: xml_js_1.xml2js(pac, { compact: true, ignoreDeclaration: true, ignoreAttributes: true }),
            sedex: xml_js_1.xml2js(sedex, { compact: true, ignoreDeclaration: true, ignoreAttributes: true })
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).json("Error" + error);
    }
});
exports.publish = functions.https.onRequest(async (req, res) => {
    try {
        const pubsub = new pubsub_1.PubSub({ projectId: 'seismic-sentry-328923' });
        const { message } = req.body;
        const dataBuffer = Buffer.from(message);
        const messageId = await pubsub.topic('Message').publish(dataBuffer);
        res.status(200).json(`Message ${messageId} published.`);
    }
    catch (error) {
        console.log(error);
        res.status(400).json("Error" + error);
    }
});
exports.listen = functions.https.onRequest(async (req, res) => {
    try {
        const pubsub = new pubsub_1.PubSub({ projectId: 'seismic-sentry-328923' });
        const subscription = pubsub.subscription('Message');
        const messageHandler = async (message) => {
            console.log(`Received message ${message.id}:`);
            console.log(`\tData: ${message.data}`);
            console.log(`\tAttributes: ${message.attributes}`);
            const docRef = db.collection('messages').doc();
            await docRef.create({
                message: message.data.toString()
            });
            message.ack();
        };
        subscription.on('message', messageHandler);
        res.status(200).json("tudo certo");
    }
    catch (error) {
        console.log(error);
        res.status(400).json("Error" + error);
    }
});
exports.list = functions.https.onRequest(async (req, res) => {
    try {
        const snapshot = await db.collection('messages').get();
        let messages = [];
        snapshot.forEach((doc) => {
            messages.push(doc.data());
        });
        res.status(200).json(messages);
    }
    catch (error) {
        console.log(error);
        res.status(400).json("Error" + error);
    }
});
//# sourceMappingURL=index.js.map