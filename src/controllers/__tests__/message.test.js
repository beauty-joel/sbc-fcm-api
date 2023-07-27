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
    const testAccountsEmails = testAccounts.map((account) => account.email);

    req = {
      body: {
        accounts: testAccountsEmails,
        title: "This is a message to multple accounts",
        body: "Message body",
      },
    };
    await MessageController.sendToMultipleAccounts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("when calling the message controller with missing fields", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    res = mockResponse();
    req = {
      body: {},
    };
  });

  it("should return an error for the Multiple Account endpoint", async () => {
    await MessageController.sendToMultipleAccounts(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return an error for the Single Account endpoint", async () => {
    await MessageController.sendToSingleAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return an error for the Topic endpoint", async () => {
    await MessageController.sendToTopic(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return an error for the Message Batch endpoint", async () => {
    await MessageController.sendBatch(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return an error for the Single Device", async () => {
    await MessageController.sentToSingleDevice(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
