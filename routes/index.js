const express = require('express');
const router = express.Router();
const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const AssistantV2 = require('ibm-watson/assistant/v2'); // watson sdk
const {IamAuthenticator} = require('ibm-watson/auth');

require('../models/botUsers');
const mongoose = require('mongoose');
const botUsers = mongoose.model('BotUsers');


const {Client, TextContent} = require('@zenvia/sdk');
const zenviaclient = new Client(process.env.ZENVIA_API_TOKEN);
const whatsapp = zenviaclient.getChannel('whatsapp');

const assistant = new AssistantV2({
    version: '2019-02-28',
    authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_ASSISTANT_IAM_APIKEY
    }),
});


const getSession = async () => {
    const response = await assistant.createSession(
        {assistantId: process.env.WATSON_ASSISTANT_ID});
    return response.result.session_id;
};


const getPayload = (message, sessionId) => (
    {
        assistantId: process.env.WATSON_ASSISTANT_ID,
        sessionId: sessionId,
        input: {
            message_type: 'text',
            text: message
        }
    }
);

const sendAssistantMessage = async (payload, user) => {
    try {
        return await assistant.message(payload)
    } catch (e) {
        payload.sessionId = await getSession();
        await botUsers.findByIdAndUpdate(user._id, {
            phone: user.phone,
            sessionId: payload.sessionId
        });
        return await assistant.message(payload)

    }
};

const checkUserSession = async (phone) => {
    try {
        return await botUsers.findOne({phone: phone});
    } catch (e) {
        console.log(e);
    }
};

const addUserToList = async (sessionId, phone) => {
    await new botUsers({sessionId, phone}).save()
};

const recoverBody = (body) => {
    if (process.env.SERVICE === 'twilio') {
        return {
            to: body.To,
            from: body.From,
            body: body.Body
        }
    } else if (process.env.SERVICE === 'zenvia') {
        return {
            to: body.message.to,
            from: body.message.from,
            body: body.message.contents[1].text
        }
    }
};


const sendTwilioMessage = async (from, to, body) => {

    twilioClient.messages
        .create({
            from: to,
            body: body,
            to: from
        })
        .then(() => {
            //do nothing
        });
};

const sendZenviaMessage = async (from, to, body) => {

    const content = new TextContent(body);

    try {
        await  whatsapp.sendMessage(to, from, content);
    }catch (e) {
        console.log(e)
    }

};


const sendMessageToTheProvider = async (from, to, body) => {
    switch (process.env.SERVICE) {
        case 'twilio':
            await sendTwilioMessage(from, to, body);
            break;
        case 'zenvia':
            await sendZenviaMessage(from, to, body);
            break;
        default:
            console.error('You are doing something wrong !')
    }
};


router.post('/', async function (req, res, next) {

    const messageDetails = recoverBody(req.body);
    let sessionId = '';
    const user = await checkUserSession(messageDetails.from);

    if (user && user.sessionId) {
        sessionId = user.sessionId;
    } else {
        sessionId = await getSession();
        await addUserToList(sessionId, messageDetails.from)
    }

    const payload = getPayload(messageDetails.body, sessionId);
    const data = await sendAssistantMessage(payload, user);
    await sendMessageToTheProvider(messageDetails.from, messageDetails.to , data.result.output.generic[0].text)

    res.send('okay')

});

module.exports = router;
