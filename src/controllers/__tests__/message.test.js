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
      source: "test",
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

  it("should send a message to an account", async () => {
    req = {
      body: {
        title: "Test message to single account",
        body: "This is a message to a single account",
        email: "test1@email.com",
        source: "test",
      },
    };
    await MessageController.sendToSingleAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
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

  it("should return an error for the Single Account endpoint", async () => {
    await MessageController.sendToSingleAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return an error for the Single Device", async () => {
    await MessageController.sentToSingleDevice(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
