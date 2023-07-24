const request = require("supertest");
const Chance = require("chance");
const { connectFB } = require("../config/firestore");

connectFB();

const app = require("../../app");
const chance = new Chance();

describe("When calling the subscriptions endpoint", () => {
  const email = "test@email.com";
  const topic = "testtopic";

  it("should subscribe to topic", async () => {
    const response = await request(app)
      .post("/sbc-fcm-api/v1/subscriptions")
      .send({
        email,
        topic,
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("message");
  });

  it("should unsubscribe from topic", async () => {
    const response = await request(app)
      .delete("/sbc-fcm-api/v1/subscriptions")
      .send({ email, topic });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("message");
  });
});
