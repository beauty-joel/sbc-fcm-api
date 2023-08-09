const Chance = require("chance");
const chance = new Chance();
const { connectFB } = require("../../config/firestore");

connectFB();

const TokenController = require("../token");

describe("when calling the token controller", () => {
  let req;

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  req = {
    body: {
      email: chance.email(),
      token: chance.string(),
      deviceType: "android",
      source: "test",
    },
  };

  beforeEach(() => {
    res = mockResponse();
  });

  it("should save a token", async () => {
    await TokenController.saveToken(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token successfully saved",
      status: "success",
    });
  });

  it("should delete a token", async () => {
    await TokenController.deleteToken(req, res);
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it("should return an error if token does not exists", async () => {
    req = {
      body: {
        token: chance.string(),
        source: "test",
      },
    };
    await TokenController.deleteToken(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: `Token '${req.body.token}' not found!`,
      status: "fail",
    });
  });

  it("should return an error if token is not provided", async () => {
    req = {
      body: {},
    };
    await TokenController.deleteToken(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      message: "A token and source must be provided",
    });
  });
});
