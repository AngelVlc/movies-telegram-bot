const { Telegraf } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const Searcher = require("./searcher.js");

const searcher = new Searcher(process.env.LAMBDA_URL);

const webhookPath = "/webhook-path";

const expressApp = express();

expressApp.use(bodyParser.json());

const bot = new Telegraf(process.env.BOT_TOKEN);

expressApp.get("/", (_req, res) => {
  res.send("OK");
});

expressApp.get("/setWebhook", (req, res) => {
  const url = Buffer.from(req.query.url, "base64").toString().replace("\n", "");
  const webhookUrl = `${url}${webhookPath}`;
  bot.telegram
    .setWebhook(webhookUrl)
    .then((result) => {
      console.log("Webhook set result: ", result);
      res.send("Webhook set");
    })
    .catch((err) => {
      console.log("Error setting webhook in telegram", err);
    });
});

expressApp.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send("Internal error");
});

var lastCommand = "";

expressApp.post(webhookPath, async (req, res) => {
  const msg = req.body.message;
  const chat = msg.chat;
  const chatId = chat.id;

  if (msg.text.toLowerCase() === "/search") {
    lastCommand = "search";
  }

  const options = {
    parse_mode: "HTML",
  };

  switch (lastCommand) {
    case "search":
      bot.telegram.sendMessage(chatId, "Title to search:", options);
      lastCommand = "title";
      break;

    case "title":
      const title = msg.text;
      lastCommand = "";
      console.log(`search: '${title}' - chatId: '${chatId}`);
      try {
        let searchResult = await searcher.searchMovie(title);
        bot.telegram.sendMessage(chatId, searchResult, options);
      } catch (searchError) {
        console.error(searchError);
        bot.telegram.sendMessage(chatId, `ERROR: ${searchError}`, options);
      }
      break;

    default:
      const text = "Valid commands:\n" + "<b>/search</b>";
      bot.telegram.sendMessage(chatId, text, options);
      break;
  }
  res.sendStatus(200);
});

const port = process.env.PORT;

expressApp.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
