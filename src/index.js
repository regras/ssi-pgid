/* ............... DEPENDENCIAS do Servidor ............... */

import {LOCAL_PORT, PUBLIC_PORT, PUBLIC_URL} from "../config.js"
import express, { response } from "express";
const app = express()
import bodyParser from 'body-parser';
app.use(bodyParser.urlencoded({ extended: true }))
import fetch from 'node-fetch'
import * as http from 'http'
const server = http.createServer(app)
import { WebSocketServer, WebSocket } from 'ws'
import path from 'path'

/* ............... DEPENDENCIAS JOLOCOM ............... */

import { JolocomSDK, NaivePasswordStore, JolocomLib } from '@jolocom/sdk'
import { JolocomTypeormStorage } from '@jolocom/sdk-storage-typeorm'
import { createConnection } from 'typeorm'
import { claimsMetadata } from '@jolocom/protocol-ts'
import { SoftwareKeyProvider } from "@jolocom/vaulted-key-provider";


/* ............... back-end de Armazenamento ............... */

const typeOrmConfig = {
    name: 'demoDb',
    type: 'sqlite',
    database: './database/apiDB.sql',
    dropSchema: false,
    entities: ['node_modules/@jolocom/sdk-storage-typeorm/js/src/entities/*.js'],
    synchronize: true,
    logging: false,
  }
  
  const connection = await createConnection(typeOrmConfig)
  const sdk = new JolocomSDK({
    storage: new JolocomTypeormStorage(connection),
  })


/* ............... Websocket ............... */

const wss = new WebSocketServer({server})

wss.on('connection', async function connection(ws, req) {
    
    console.log('\nUm novo cliente foi conectado!')

    ws.on('message', async function message(data) {

        const response = JSON.parse(data)

        console.log(`\nmensagem de um cliente WS recebida: ${response.messageType}`)

        if (response.messageType == "authenticationRequired") {
            const tokenJSON = await fetch(`${PUBLIC_URL}/authenticate`).then(res => res.text()).then(res => JSON.parse(res))
            ws.identifier = tokenJSON.identifier
            const response = {messageType: "authenticationToken", payload: tokenJSON}
            ws.send(JSON.stringify(response))
        } 
        
        else if (response.messageType == "issuanceRequired") {
            const tokenJSON = await fetch(`${PUBLIC_URL}/receive/ProofOfEmailCredential`).then(res => res.text()).then(res => JSON.parse(res))
            ws.identifier = tokenJSON.identifier
            const response = {messageType: "issuanceToken", payload: tokenJSON}
            ws.send(JSON.stringify(response))
        }

        else if (response.messageType == "email") {
            ws.email = response.payload.email
        }
        
    });

})


/* ............... AGENTES ............... */

console.log("\nCriando/Carregando Agentes...")

const passwordAPI = 'secretpasswordAPI'

//Cria????o de um agente com uma identidade aleat??ria
//const API = await sdk.createAgent(passwordAPI, 'jolo') 

//Carregando uma identidade existente
const API = await sdk.loadAgent(passwordAPI, "did:jolo:762e41643998bca0d9df37eef96a9404f308d751bb352ddce7b600c18f75b65c")

console.log(`Agente Criado/Carregado (API): ${API.identityWallet.did}`)

//criar um perfil com informa????es publicas: https://jolocom-lib.readthedocs.io/en/latest/publicProfile.html

/* .............................. Configurando as requisi????es HTTP .............................. */

app.use(function(req, res, next){
    var data = "";
    req.on('data', function(chunk){ data += chunk})
    req.on('end', function(){
       req.rawBody = data;
       next();
    })
    // Site que voc?? deseja permitir a conex??o
    res.setHeader('Access-Control-Allow-Origin', '*');

    // M??todos que voc?? deseja permitir
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); //, OPTIONS, PUT, PATCH, DELETE

    // Cabe??alhos que deseja permitir
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Definido como verdadeiro se voc?? precisar que o site inclua cookies nas solicita????es enviadas
    res.setHeader('Access-Control-Allow-Credentials', true);

 })


/* ............... Requisi????es refente ao fluxo de VERIFICA????O (ProofOfEmailCredential) ............... */

//get em /authenticate gerar?? uma solicita??ao de credencial do tipo 'ProofOfEmailCredential'
app.get('/authenticate', async function (req, res, next) {
    console.log("\nAPI: Requisi????o GET")

    try {
        const credentialRequest = await API.credRequestToken({
            callbackURL: `${PUBLIC_URL}/authenticate`,
            credentialRequirements: [
              {
                type: ['Credential','ProofOfEmailCredential'],
                constraints: [],
              },
            ],
        })
        const enc = credentialRequest.encode()
        res.send({token:enc, identifier: credentialRequest.payload.jti})

        console.log("SUCESSO! Solicita????o de credencial criada e enviada")
    
    } catch (error) {
        console.log("ERRO na gera????o da solicita????o de credencial")
        console.log(error)
        res.send("ERRO na gera????o da solicita????o de credencial")
    }
})

//post em /authenticate deve conter a resposta da solicita??ao do cliente atrav??s da key 'token'    
app.post('/authenticate', async function (req, res, next) {
    console.log("\nAPI: Requisi????o POST")
    const token = JSON.parse(req.rawBody).token

    try {

        const interaction =  await JolocomLib.parse.interactionToken.fromJWT(token)
        const providedCredentials = interaction.interactionToken.suppliedCredentials
        const signatureValidationResults = await JolocomLib.util.validateDigestables(providedCredentials)
        if (!signatureValidationResults.includes(false)) {
            console.log("SUCESSO! a credencial fornecida pelo client ?? v??lida!")
            res.send("SUCESSO! a credencial fornecida ?? v??lida!")
            wss.clients.forEach(function each(client) {
                if (client.identifier == interaction.payload.jti & client.readyState === WebSocket.OPEN) {
                    const resposta = {messageType: "successfullyAuthenticated", payload: providedCredentials[0].claim}
                    resposta.payload.issuer = providedCredentials[0].issuer
                    client.send(JSON.stringify(resposta))
                }
            })
        }

        else {
            console.log("ERRO: Forne??a uma resposta de credencial assinada e v??lida pelos padr??es jolocom!")
            res.send("ERRO: Forne??a uma resposta de credencial assinada e v??lida pelos padr??es jolocom!")
        }

    } catch (error) {
        console.log("ERRO: ", error)
        res.send("ERRO: Forne??a uma resposta de credencial assinada e v??lida pelos padr??es jolocom!")
    }

})

/* ............... Requisi????es refente ao fluxo de EMISS??O (ProofOfEmailCredential) ............... */

//get em /receive/ProofOfEmailCredential gerar?? uma oferta de credencial do tipo ProofOfEmailCredential
app.get('/receive/ProofOfEmailCredential', async function (req, res, next) {
    console.log("\nAPI: Requisi????o GET")

    try {
        const credentialOffer  = await API.credOfferToken({
            callbackURL: `${PUBLIC_URL}/receive/ProofOfEmailCredential`,
            offeredCredentials: [
              {
                type: 'ProofOfEmailCredential',
                renderInfo: {
                    renderAs: "document",
                },
                credential: {
                    name: "Email Address",
                    display: {
                      properties: [
                        {
                          path: [ 
                            "$.email" //contem o nome referente a key da claim
                          ],
                          label: "Email", 
                          //value: "your email"
                        },
                      ]
                    }
                },
              },
            ],
        })
        const enc = credentialOffer.encode()
        res.send({token:enc, identifier:credentialOffer.payload.jti})
        console.log("SUCESSO! Oferta de credencial criada e enviada")

    } catch (error) {
        console.log("ERRO na gera????o da oferta de credencial")
        console.log(error)
        res.send("ERRO na gera????o da oferta de credencial")
    }
})

//post em /receive/ProofOfEmailCredential deve conter a resposta da oferta do cliente atrav??s da key 'token'    
app.post('/receive/ProofOfEmailCredential', async function (req, res, next) {
    console.log("\nAPI: Requisi????o POST")

    const token = JSON.parse(req.rawBody).token

    //const response = JSON.parse(Object.keys(req.body)[0]).response

    try {
        const APIInteraction = await API.processJWT(token)
        /*
        const emailAddressSignedCredential = await API.signedCredential({
            metadata:  claimsMetadata.emailAddress,
            subject: APIInteraction.messages[1].payload.iss.split('#')[0],
            claim: {
                email: 'A012345@dac.unicamp.br',
            },
        })*/

        var emailClaim;

        wss.clients.forEach(function each(client) {
            if (client.identifier == APIInteraction.messages[1].payload.jti & client.readyState === WebSocket.OPEN) {
                emailClaim = client.email
            }
        })
        
        const emailAddressSignedCredential = await API.identityWallet.create.signedCredential({
            metadata: claimsMetadata.emailAddress, //gera metadados fornecidos pelo pacote @jolocom/protocol-ts
            claim: { email: emailClaim},
            subject: APIInteraction.messages[1].payload.iss.split('#')[0], // deve-se usar o did do cliente e o email dele
          }, 
        passwordAPI, 
        //customExpiryDate se n??o estiver presente, o padr??o ser?? 1 ano a partir de Date.now()
        )

        const APIIssuance = await APIInteraction.createCredentialReceiveToken([
            emailAddressSignedCredential,
        ])

        const enc = APIIssuance.encode()

        wss.clients.forEach(function each(client) {
            if (client.identifier == APIIssuance.payload.jti & client.readyState === WebSocket.OPEN) {
                const resposta = {messageType: "successfullyIssued", payload: {token:enc}}
                client.send(JSON.stringify(resposta))
            }
        })

	    console.log("SUCESSO! Credencial gerada e enviada!!!")
        res.send(enc)
        
    } catch (error) {
        console.log("ERRO: ", error)
        res.send("ERRO: Forne??a uma resposta de oferta de credencial assinada e v??lida pelos padr??es jolocom!")
    }
})

/* ............... Get na p??gina inicial redireciona para login ............... */

app.get('/', function(req, res) {
    res.redirect('/login');
});

/* ............... Front-End para o Fluxo de VERIFICA????O ............... */

app.get('/login', function(req, res) {
    res.sendFile(path.resolve('./public/login.html'));
});

/* ............... Front-End para o Fluxo de EMISS??O ............... */

app.get('/issuer', function(req, res) {
    res.sendFile(path.resolve('./public/issuer.html'));
});

/* ............... Iniciando Servidor ............... */

console.log("\nIniciando Servidor...")

server.listen(LOCAL_PORT, () => {
    console.log(`Servidor est?? executando em ${PUBLIC_URL}`)
    console.log()
})