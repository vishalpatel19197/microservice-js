import { Kafka, logLevel } from "kafkajs";
import { env } from "../../config/src/index";
let kafka = null;

export function getKafka() {
  if (!kafka) {
    kafka = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS.split(","),
      logLevel: logLevel.ERROR,
    });
  }
  return kafka;
}

export async function createProducer() {
  const producer = getKafka().producer();
  await producer.connect();
  process.on("SIGTERM", () => producer.disconnect().catch(() => {}));
  process.on("SIGINT", () => producer.disconnect().catch(() => {}));
  return producer;
}

export async function createConsumer(groupId) {
  const consumer = getKafka().consumer({ groupId });
  await consumer.connect();
  process.on("SIGTERM", () => consumer.disconnect().catch(() => {}));
  process.on("SIGINT", () => consumer.disconnect().catch(() => {}));
  return consumer;
}
