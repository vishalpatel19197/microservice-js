const { kafka } = require("./kafka");

const TOPICS = {
  ORDER_CREATED: "orders.v1.created",
  PAYMENT_AUTHORIZED: "payments.v1.authorized",
};

async function ensureTopic(topic, partitions = 3, replication = 3) {
  const admin = kafka.admin();
  await admin.connect();
  const existing = await admin.listTopics();
  if (!existing.includes(topic)) {
    await admin.createTopics({
      topics: [
        { topic, numPartitions: partitions, replicationFactor: replication },
      ],
    });
  }
  await admin.disconnect();
}

module.exports = {
  TOPICS,
  ensureTopic,
};
