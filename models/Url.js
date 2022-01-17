const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const Schema = mongoose.Schema;

const urlSchema = new Schema({
	path: {
		type: String,
		required: true,
	},
	short: {
		type: String,
		default: () => nanoid(10)
	},
});

module.exports = mongoose.model("Url", urlSchema);