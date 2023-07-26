const Chance = require("chance");
const chance = new Chance();
const { connectFB } = require("../../config/firestore");
connectFB();

const TokenController = require("../token");

const MessageController = require("../message");

describe("when calling the message controller", () => {
  let req, res, testAccounts;

  const testToken = process.env["TESTING_DEVICE_TOKEN"];

  testAccounts = [
    {
      email: "test1@email.com",
      token: testToken,
      deviceType: "android",
    },
    {
      email: "test2@email.com",
      token: testToken,
      deviceType: "android",
    },
    {
      email: "test3@email.com",
      token: testToken,
      deviceType: "android",
    },
  ];

  const messageBatch = [
    {
      notification: { title: "Price drop", body: "2% off all books" },
      topic: "testtopic",
    },
    {
      notification: { title: "Price drop", body: "5% off all electronics" },
      token: testToken,
    },
  ];

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  beforeAll(() => {
    res = mockResponse();
    testAccounts.forEach(async (testAccount) => {
      req = {
        body: testAccount,
      };

      await TokenController.saveToken(req, res);
    });
  });

  beforeEach(() => {
    res = mockResponse();
  });

  it("should send a message to a single device", async () => {
    req = {
      body: {
        title: "Test message",
        body: "Test message body",
        token: testToken,
      },
    };
    await MessageController.sentToSingleDevice(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should send a message batch", async () => {
    req = {
      body: {
        messages: messageBatch,
      },
    };

    await MessageController.sendBatch(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should send a message to a group of devices", async () => {
    req = {
      body: {
        title: "Group message",
        body: "This is a group message",
        tokens: [testToken, testToken, testToken],
      },
    };
    await MessageController.sendToGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should send a message to topic's subscribers", async () => {
    req = {
      body: {
        topic: "testtopic",
        title: "This is a title message",
        body: "This is the body of the message",
      },
    };
    await MessageController.sendToTopic(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should send a message to an account", async () => {
    req = {
      body: {
        email: "test1@email.com",
        title: "Test message to single account",
        body: "This is a message to a single account",
      },
    };
    await MessageController.sendToSingleAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should send a message to multiple accounts", async () => {
    req = {
      body: {
        accounts: ["test1@email.com", "test2@email.com", "test3@email.com"],
        title: "This is a message to multple accounts",
        body: "Message body",
      },
    };
    await MessageController.sendToMultipleAccounts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
