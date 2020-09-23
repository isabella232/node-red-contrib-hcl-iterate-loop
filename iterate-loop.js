module.exports = function(RED) {
  'use strict';

  function IterateLoopNode(n) {
    RED.nodes.createNode(this, n);
    var node = this;

    node.i = n.i;
    node.startCount = n.startCount;
    node.endCondition = n.endCondition;
    node.operatorEndCondition = n.operatorEndCondition;
    node.increment = n.increment;
    node.varType = n.varType;
    node.startCountType = n.startCountType;
    node.endConditionType = n.endConditionType;
    node.incrementType = n.incrementType;

    this.on("input", function(msg) {

      let i = RED.util.evaluateNodeProperty(node.i, node.varType, node, msg);
      let startCount = RED.util.evaluateNodeProperty(node.startCount, node.startCountType, node, msg);
      let endCondition = RED.util.evaluateNodeProperty(node.endCondition, node.endConditionType, node, msg);
      let increment = RED.util.evaluateNodeProperty(node.increment, node.incrementType, node, msg);

      if (typeof startCount !== "number") {
        sendMsg("error", node, RED._("Start value is not a number = ") + startCount, msg);
      }
      if (typeof endCondition !== "number") {
        sendMsg("error", node, RED._("End value is not a number = ") + endCondition, msg);
      }
      if (typeof increment !== "number") {
        sendMsg("error", node, RED._("Increment value is not a number = ") + increment, msg);
      }
      if (i === void 0 || i === null || i === '') {
          i = startCount;
      } else {
          i += increment;
      }

      setProperty(node, msg, node.i, node.varType, i);
      setProperty(node, msg, node.startCount, node.startCountType, startCount);
      setProperty(node, msg, node.endCondition, node.endConditionType, endCondition);
      setProperty(node, msg, node.increment, node.incrementType, increment);

      let looping = false;
      switch (node.operatorEndCondition) {
        case "eq":
          looping = i == endCondition;
        break;
        case "lt":
          looping = i < endCondition;
        break;
        case "lte":
          looping = i <= endCondition;
        break;
        case "gt":
          looping = i > endCondition;
        break;
        case "gte":
          looping = i >= endCondition;
        break;
        default:
          sendMsg("error",node, RED._("Invalid operator"), msg);
      }

      if (looping) {
        sendMsg("blue", node, "looping... " + i, msg);
      } else {
        sendMsg("grey", node, "terminated loop", msg)
      }
    });
  }

  RED.nodes.registerType("iterate-loop", IterateLoopNode);

  function setProperty(node, msg, name, type, value) {
    switch (type) {
      case "msg":
        msg[name] = value;
        break;
      case "flow":
        node.context().flow.set(name, value);
        break;
      case "global":
        node.context().global.set(name, value);
        break;
      default:

    }
  }

  function sendMsg(type, node, strMsg, msg) {
    switch (type) {
      case "blue":
        node.status({
            fill: type,
            shape: "ring",
            text: strMsg
        });
        node.send([null,msg]);
      break;
      case "grey":
        node.status({
            fill: type,
            shape: "ring",
            text: strMsg
        });
        node.send(msg);
      break;
      case "error":
        node.status({
          fill: "red",
          shape: "ring",
          text: strMsg
        });
        node.error(strMsg, msg);
      break;

    }
  }
}
