const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const studentSchema = new Schema({
    name : {
        type : String
    },
    department : {
        required : true,
        type : String
    },
    level : {
        required : true,
        type : Number
    },
    subject : {
        required : true,
        type : String
    },
    message : {
        required : true,
        type : String
    },
    date : {
        required : true,
        type : String
    }

});

module.exports = mongoose.model('Student', studentSchema);