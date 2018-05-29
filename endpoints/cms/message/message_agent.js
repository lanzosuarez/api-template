const Message = require("../../../models/message"),
  Thread = require("../../../models/thread"),
  Order = require("../../../models/order"),
  {
    errs: { NOT_FOUND, SERVER_ERROR },
    errMsgs: { SERVER_ERROR_MSG, NOT_FOUND_MSG }
  } = require("../../../utils/errors"),
  { sendError, sendData } = require("../../../utils/uni-response"),
  { decodeToken } = require("../../../utils/security"),
  { isNotExists } = require("../../../utils/op-helpers"),
  {
    Types: { ObjectId }
  } = require("mongoose");

module.exports = (req, res, next) => {
  const { order_no } = req.query;

  const createMessage = message => {
    const newMsg = new Message(message);
    return newMsg.save().catch(err => {
      throw err;
    });
  };

  async function main() {
    try {
      console.log("body", req.body);
      let order = await Order.findOne({ order_no });
      if (isNotExists(order)) {
        sendError(res, NOT_FOUND, NOT_FOUND_MSG);
      } else {
        let checkThread = await Thread.findOne({
          order: ObjectId(order._id),
          status: 1
        });
        if (isNotExists(checkThread)) {
          sendError(res, NOT_FOUND, NOT_FOUND_MSG);
        } else {
          const { _id: threadId } = checkThread;
          const msg = Object.assign({ thread: checkThread._id }, req.body);
          let {
            type,
            message,
            status,
            timestamp,
            thread
          } = await createMessage(msg);

          req.payload = {
            message: {
              type,
              message,
              status,
              timestamp,
              thread
            },
            order_no: order.order_no,
            agent: "5af3db1271f54735bccdacbb"
          };
          next();
        }
      }
    } catch (error) {
      console.error(error);
      sendError(res, SERVER_ERROR, SERVER_ERROR_MSG);
    }
  }

  main();
};
