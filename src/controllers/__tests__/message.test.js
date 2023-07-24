const Chance = require("chance");
const chance = new Chance();
const { connectFB } = require("../../config/firestore");

connectFB();

const MessageController = require("../message");

describe("when calling the message controller", () => {
  let req, res;

  const testToken = process.env["TESTING_DEVICE_TOKEN"];

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
  [];
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

  it("should send a message to a group of group of devices", async () => {
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
});
