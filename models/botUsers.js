const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const BotUsersSchema = new Schema({
    phone: String,
    sessionId: String,
});


mongoose.model ('BotUsers',BotUsersSchema);
