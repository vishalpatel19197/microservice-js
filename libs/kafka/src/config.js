const toBool = (v) => String(v).toLowerCase() === "true";

const env = {
  // KAFKA_BROKERS: "kafka-1:9092,kafka-2:9092,kafka-3:9092",
  KAFKA_BROKERS: "localhost:9092,localhost:9094,localhost:9096", // for dev
  KAFKA_CLIENT_ID: "microservice-js",
};

const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || "node-kafka-app",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092")
    .split(",")
    .map((s) => s.trim()),
  ssl: toBool(process.env.KAFKA_SSL || "false"),
  sasl: (() => {
    const mech = (process.env.KAFKA_SASL_MECHANISM || "").trim();
    if (!mech) return undefined;
    return {
      mechanism: mech, // 'plain' | 'scram-sha-256' | 'scram-sha-512'
      username: process.env.KAFKA_USERNAME,
      password: process.env.KAFKA_PASSWORD,
    };
  })(),
  // Producer defaults
  producer: {
    allowAutoTopicCreation: false,
    idempotent: true, // safe send behavior (KafkaJS respects acks=all + retries)
    maxInFlightRequests: 1, // safer ordering with retries
    retries: 10,
    acks: -1, // all replicas
  },
  // Consumer defaults
  consumer: {
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    maxBytesPerPartition: 1 * 1024 * 1024, // 1MB
  },
};

module.exports = {
  env,
  kafkaConfig,
};
