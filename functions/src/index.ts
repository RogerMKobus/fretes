import * as functions from "firebase-functions";
import { xml2js } from "xml-js";
import { PubSub } from "@google-cloud/pubsub";
import admin = require("firebase-admin");
require('dotenv').config()

import correios from "./services/axios";
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export const calculaFrete = functions.https.onRequest(async (req, res) => {
    try {
        const {
            origin_postcode,
            destination_postcode,
            width,
            height,
            length,
            weight,
        } = req.body;

        const { data: pac } = await correios.get(`/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo?nCdEmpresa= &sDsSenha= &nCdServico=04510&sCepOrigem=${origin_postcode}&sCepDestino=${destination_postcode}&nVlPeso=${weight}&nCdFormato=1&nVlComprimento=${length}&nVlAltura=${height}&nVlLargura=${width}&nVlDiametro=0&sCdMaoPropria=s&nVlValorDeclarado=0&sCdAvisoRecebimento=n`);
        const { data: sedex } = await correios.get(`/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo?nCdEmpresa= &sDsSenha= &nCdServico=04014&sCepOrigem=${origin_postcode}&sCepDestino=${destination_postcode}&nVlPeso=${weight}&nCdFormato=1&nVlComprimento=${length}&nVlAltura=${height}&nVlLargura=${width}&nVlDiametro=0&sCdMaoPropria=s&nVlValorDeclarado=0&sCdAvisoRecebimento=n`);

        res.status(200).json({
            pac: xml2js(pac, { compact: true, ignoreDeclaration: true, ignoreAttributes: true }),
            sedex: xml2js(sedex, { compact: true, ignoreDeclaration: true, ignoreAttributes: true }),
        });
    } catch (error) {
        console.log(error);
        res.status(400).json("Error" + error);
    }
});

export const publish = functions.https.onRequest(async (req, res) => {
    try {
        const pubsub = new PubSub({ projectId: process.env.PROJECT_ID });

        const { message } = req.body;
        const dataBuffer = Buffer.from(message);

        const messageId = await pubsub.topic(process.env.TOPIC!).publish(dataBuffer);
        res.status(200).json(`Message ${messageId} published.`);
    } catch (error) {
        console.log(error);
        res.status(400).json("Error" + error);
    }
});


export const listen = functions.https.onRequest(async (req, res) => {
    try {
        const pubsub = new PubSub({ projectId: process.env.PROJECT_ID });
        const subscription = pubsub.subscription(process.env.SUBSCRIPTION!);

        const messageHandler = async (message: { id: any; data: any; attributes: any; ack: () => void; }) => {
            console.log(`Received message ${message.id}:`);
            console.log(`\tData: ${message.data}`);
            console.log(`\tAttributes: ${message.attributes}`);

            const docRef = db.collection(process.env.DB_COLLECTION!).doc();

            await docRef.create({
                message: message.data.toString(),
            });

            message.ack();
        };
        subscription.on("message", messageHandler);

        res.status(200).json("Waiting for messages");
    } catch (error) {
        console.log(error);
        res.status(400).json("Error" + error);
    }
});


export const list = functions.https.onRequest(async (req, res) => {
    try {
        const snapshot = await db.collection(process.env.DB_COLLECTION!).get();
        const messages: FirebaseFirestore.DocumentData[] = [];
        snapshot.forEach((doc) => {
            messages.push(doc.data());
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(400).json("Error" + error);
    }
});
