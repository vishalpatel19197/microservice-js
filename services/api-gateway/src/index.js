const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const {
  createProducer,
  createConsumer,
} = require("../../../libs/kafka/src/kafka");
const { ensureTopic, TOPICS } = require("../../../libs/kafka/src/topics");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/api/v1/create-order", async (req, res) => {
  const producer = await createProducer();
  await ensureTopic(TOPICS.ORDER_CREATED);

  const order = {
    orderId: crypto.randomUUID(),
    price: 20,
    item: [
      {
        sku: "1d5ff5f0",
        qty: 2,
      },
    ],
  };
  await producer
    .send({
      topic: TOPICS.ORDER_CREATED,
      messages: [{ key: order.orderId, value: JSON.stringify(order) }],
    })
    .then((result) => {
      console.log("Message Produced");
    })
    .catch((err) => {
      console.log("Producer error", err);
    });
  return res.status(200).json({
    message: "Order created successfully",
  });
});

const run = async () => {
  const consumer = await createConsumer("test-group");
  await consumer.connect();
  await consumer.subscribe({
    topic: TOPICS.ORDER_CREATED,
    fromBeginning: true,
  });
  await consumer.run({
    // eachBatch: async ({ batch }) => {
    //   console.log(batch)
    // },
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);
    },
  });
};

run().catch((e) => console.error(`[example/consumer] ${e.message}`, e));

// Global error handler
app.use("/", (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log("server connected on", PORT);
});
