import express from "express";
import cors from "cors";
import crypto from "crypto";
import { createProducer } from "../../../libs/kafka/src/kafka";
import { ensureTopic, TOPICS } from "../../../libs/kafka/src/topics";

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
  await producer.send({
    topic: TOPICS.ORDER_CREATED,
    messages: [{ key: order.orderId, value: JSON.stringify(order) }],
  });
});

// Global error handler
app.use("/", (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log("server connected on", PORT);
});
