// utils/detectIntent.js
module.exports = function detectIntent(query) {
  query = query.toLowerCase();

  if (query.includes("balance") || query.includes("recharge")) {
    return "ACS";
  } else if (query.includes("agent") || query.includes("human")) {
    return "BAP";
  } else {
    return "UNKNOWN";
  }
};
