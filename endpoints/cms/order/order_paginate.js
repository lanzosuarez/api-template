const Order = require("../../../models/order"),
  {
    errs: { SERVER_ERROR },
    errMsgs: { SERVER_ERROR_MSG }
  } = require("../../../utils/errors"),
  { sendError, sendData } = require("../../../utils/uni-response"),
  { populateQuery } = require("../../../utils/op-helpers"),
  moment = require("moment");

module.exports = (req, res, next) => {
  const {
    pageSize = 40,
    page = 1,
    q = "",
    fields = "",
    start = "",
    end = "",
    populate = "",
    status = ""
  } = req.query;

  const getOrders = () => {
    let query = {
      status: Number(status) === 0 ? { $gt: 0 } : Number(status)
    };

    if (q !== "") {
      query.order_no = new RegExp(`${q}`, "i");
    }

    if (start !== "" && end !== "") {
      query["$and"] = [
        {
          timestamp: {
            $gte: moment(start)
              .startOf("d")
              .valueOf()
          }
        },
        {
          timestamp: {
            $lte: moment(end)
              .endOf("d")
              .valueOf()
          }
        }
      ];
    } else if (start !== "") {
      query.timestamp = {
        $gte: moment(start)
          .startOf("d")
          .valueOf()
      };
    } else if (end !== "") {
      query.timestamp = {
        $gte: moment(end)
          .startOf("d")
          .valueOf()
      };
    }

    console.log(populateQuery(populate));

    return Order.find(query, fields)
      .populate(populateQuery(populate))
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize))
      .catch(err => {
        throw err;
      });
  };

  async function main() {
    try {
      const orders = await getOrders();
      sendData(res, "", orders, 200);
    } catch (error) {
      console.error(error);
      sendError(res, SERVER_ERROR, SERVER_ERROR_MSG);
    }
  }

  main();
};
