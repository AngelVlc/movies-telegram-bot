const { createHandlers } = require("./index.js");

describe("index handlers", () => {
  let bot;
  let searcher;
  let handlers;

  const createResponse = () => {
    return {
      send: jasmine.createSpy("send"),
      sendStatus: jasmine.createSpy("sendStatus"),
      status: jasmine.createSpy("status").and.callFake(() => {
        return {
          send: jasmine.createSpy("statusSend"),
        };
      }),
    };
  };

  beforeEach(() => {
    bot = {
      telegram: {
        setWebhook: jasmine.createSpy("setWebhook").and.returnValue(Promise.resolve(true)),
        sendMessage: jasmine.createSpy("sendMessage"),
      },
    };

    searcher = {
      searchMovie: jasmine.createSpy("searchMovie").and.returnValue(Promise.resolve("movie result")),
    };

    handlers = createHandlers(bot, searcher);
  });

  it("should return OK in root handler", () => {
    const res = createResponse();

    handlers.rootHandler({}, res);

    expect(res.send).toHaveBeenCalledWith("OK");
  });

  it("should set telegram webhook from base64 query", async () => {
    const req = {
      query: {
        url: Buffer.from("https://movies.example.com").toString("base64"),
      },
    };
    const res = createResponse();

    handlers.setWebhookHandler(req, res);
    await Promise.resolve();

    expect(bot.telegram.setWebhook).toHaveBeenCalledWith(
      "https://movies.example.com/webhook-path"
    );
    expect(res.send).toHaveBeenCalledWith("Webhook set");
  });

  it("should ask for title when command is /search", async () => {
    const req = {
      body: {
        message: {
          text: "/search",
          chat: { id: 1 },
        },
      },
    };
    const res = createResponse();

    await handlers.webhookHandler(req, res);

    expect(bot.telegram.sendMessage).toHaveBeenCalledWith(
      1,
      "Title to search:",
      { parse_mode: "HTML" }
    );
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it("should search and return results on title step", async () => {
    const res1 = createResponse();
    const res2 = createResponse();

    await handlers.webhookHandler(
      {
        body: {
          message: {
            text: "/search",
            chat: { id: 1 },
          },
        },
      },
      res1
    );

    await handlers.webhookHandler(
      {
        body: {
          message: {
            text: "Matrix",
            chat: { id: 1 },
          },
        },
      },
      res2
    );

    expect(searcher.searchMovie).toHaveBeenCalledWith("Matrix");
    expect(bot.telegram.sendMessage).toHaveBeenCalledWith(
      1,
      "movie result",
      { parse_mode: "HTML" }
    );
    expect(res2.sendStatus).toHaveBeenCalledWith(200);
  });

  it("should send an error message when search fails", async () => {
    searcher.searchMovie.and.returnValue(Promise.reject("boom"));

    const res1 = createResponse();
    const res2 = createResponse();

    await handlers.webhookHandler(
      {
        body: {
          message: {
            text: "/search",
            chat: { id: 1 },
          },
        },
      },
      res1
    );

    await handlers.webhookHandler(
      {
        body: {
          message: {
            text: "Matrix",
            chat: { id: 1 },
          },
        },
      },
      res2
    );

    expect(bot.telegram.sendMessage).toHaveBeenCalledWith(
      1,
      "ERROR: boom",
      { parse_mode: "HTML" }
    );
    expect(res2.sendStatus).toHaveBeenCalledWith(200);
  });

  it("should send help text for unknown commands", async () => {
    const req = {
      body: {
        message: {
          text: "hello",
          chat: { id: 1 },
        },
      },
    };
    const res = createResponse();

    await handlers.webhookHandler(req, res);

    expect(bot.telegram.sendMessage).toHaveBeenCalledWith(
      1,
      "Valid commands:\n<b>/search</b>",
      { parse_mode: "HTML" }
    );
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });
});
