const { Kafka, logLevel } = require("kafkajs");
const { env } = require("./config");

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS.split(","),
  logLevel: logLevel.ERROR,
});

async function createProducer() {
  const producer = kafka.producer();
  await producer.connect();
 
  return producer;
}

async function createConsumer(groupId) {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  process.on("SIGTERM", () => consumer.disconnect().catch(() => {}));
  process.on("SIGINT", () => consumer.disconnect().catch(() => {}));
  return consumer;
}

module.exports = {
  kafka,
  createConsumer,
  createProducer,
};
