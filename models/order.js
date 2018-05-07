const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  {
    requiredField,
    refGen,
    fieldTypes: { STR, NUM }
  } = require("../utils/database");

const order = new Schema({
  customer: refGen("Delivery-Customer"),
  items: [refGen("Delivery-Item")],
  total_price: requiredField(STR),
  status: requiredField(NUM, true, 1), //0-archived 1-active 2-delivered,
  timestamp: requiredField(NUM, true, Date.now()),
  order_no: requiredField(STR)
});

module.exports = mongoose.model("Delivery-Order", order);
