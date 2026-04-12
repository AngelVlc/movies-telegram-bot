const { Telegraf } = require("telegraf");
const express = require("express");
const bodyParser = require("body-parser");
const Searcher = require("./searcher.js");

const webhookPath = "/webhook-path";

const createHandlers = (bot, searcher) => {
  let lastCommand = "";

  const rootHandler = (_req, res) => {
    res.send("OK");
  };

  const setWebhookHandler = (req, res) => {
    const url = Buffer.from(req.query.url, "base64")
      .toString()
      .replace("\n", "");
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
  };

  const errorHandler = (err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).send("Internal error");
  };

  const webhookHandler = async (req, res) => {
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
          const searchResult = await searcher.searchMovie(title);
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
  };

  return {
    rootHandler,
    setWebhookHandler,
    errorHandler,
    webhookHandler,
  };
};

const createApp = ({ bot, searcher }) => {
  const expressApp = express();
  const handlers = createHandlers(bot, searcher);

  expressApp.use(bodyParser.json());

  expressApp.get("/", handlers.rootHandler);
  expressApp.get("/setWebhook", handlers.setWebhookHandler);
  expressApp.use(handlers.errorHandler);
  expressApp.post(webhookPath, handlers.webhookHandler);

  return expressApp;
};

const startServer = () => {
  const searcher = new Searcher(process.env.LAMBDA_URL);
  const bot = new Telegraf(process.env.BOT_TOKEN);
  const expressApp = createApp({ bot, searcher });
  const port = process.env.PORT;

  expressApp.listen(port, () => {
    console.log(`App listening on port ${port}!`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = {
  createHandlers,
  createApp,
  startServer,
  webhookPath,
};
