require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const mongoose = require("mongoose");
const Url = require("./models/Url");
const methodOverride = require("method-override");

mongoose.connect(`mongodb+srv://${process.env.db_USER}:${process.env.db_PASS}@${process.env.db_HOST}/url-shortener?retryWrites=true&w=majority`);
mongoose.connection.on('connection', data => {
	console.log("connection" + data);
});
mongoose.connection.on('error', err => {
	console.log(err);
});

function lookup(url) {
	return new Promise(function (resolve, reject) {
		dns.lookup(url, (err, address, family) => {
			if (err) {
				reject(err);
			} else {
				resolve({ address, family });
			}
		});
	})
}

const port = process.env.PORT || 3000;
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get('/', (req, res) => {
	res.render("index");
});

app.get('/shorturls', async (req, res) => {
	let urls = await Url.find({});
	res.render("list", { urls });
});


app.get("/api/shorturl", async (req, res) => {
	let urls = await Url.find({});
	res.json(urls);
});

app.post("/api/shorturl", async (req, res) => {
	let regex = /^(?:https?:\/\/)?([^\/]*)/;
	let baseUrl = req.body.url.match(regex)[1];
	let path = `https://${baseUrl}`;
	try {
		await lookup(baseUrl);
		const url = await Url.create({ path });
		res.json({ original_url: url.path, short_url: url.short })
	} catch (error) {
		res.json({ error: "Invalid URL" })
	}
});

app.get("/api/shorturl/:shorturl", async (req, res) => {
	let short = req.params.shorturl;
	let url = await Url.findOne({ short });
	res.redirect(url.path)
});

app.delete("/api/shorturl/:id", async (req, res) => {
	let id = req.params.id;
	await Url.findByIdAndDelete(id);
	res.redirect("/api/shorturl");
});

app.listen(port, _ => {
	console.log(`Listening on port ${port}`);
});
