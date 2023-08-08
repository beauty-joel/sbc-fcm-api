const Chance = require("chance");
const chance = new Chance();
const { connectFB } = require("../../config/firestore");

connectFB();

const SubscriptionController = require("../subscription");
const TokenController = require("../token");

describe("when calling the subscritpion controller", () => {
  let testInitialData, req, res;

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  res = mockResponse();

  testInitialData = {
    email: "chechoperez@email.com",
    token: "abc123",
    deviceType: "android",
    source: "test",
  };

  testData = {
    email: "chechoperez@email.com",
    topic: "testtopic",
    source: "test",
  };

  testWrongData = {
    email: chance.email(),
    topic: chance.string(),
    source: chance.string(),
  };

  beforeAll(async () => {
    req = {
      body: testInitialData,
    };

    await TokenController.saveToken(req, res);
  });

  beforeEach(() => {
    res = mockResponse();
  });

  afterAll(async () => {
    req = {
      body: testInitialData,
    };
    await TokenController.deleteToken(req, res);
  });

  it("should subscribe to a topic", async () => {
    req.body = testData;
    await SubscriptionController.subscribeToTopic(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should unsubscribe from a topic", async () => {
    req.body = testData;
    await SubscriptionController.unsubscribeFromTopic(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return an error if the account doesnt exists", async () => {
    req.body = testWrongData;
    await SubscriptionController.subscribeToTopic(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: `Account ${req.body.email} not found.`,
      status: "fail",
    });
  });

  it("should return an error if missing fields", async () => {
    req = {
      body: {},
    };
    await SubscriptionController.subscribeToTopic(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: `Email, topic and source should be provided!`,
    });
  });
});
