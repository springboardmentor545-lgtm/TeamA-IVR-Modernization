const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  async handleInput(sessionId, inputType, inputValue) {
    await delay(70);
    const val = (typeof inputValue === 'string') ? inputValue.trim() : String(inputValue);

    if (inputType && inputType.toUpperCase() === 'DTMF') {
      if (val === '1') {
        return { success: true, sessionId, intent: 'GetBalance', responseText: 'Your account balance is ₹5,000.00', nextAction: null };
      } else if (val === '2') {
        return { success: true, sessionId, intent: 'TransferToAgent', responseText: 'Please wait while we transfer you to an agent.', nextAction: { transfer: true } };
      } else {
        return { success: false, sessionId, intent: 'UnknownOption', responseText: 'Invalid option. Please try again.', nextAction: null };
      }
    }

    return { success: false, sessionId, intent: 'UnknownInputType', responseText: 'Unable to process input. Please try again.', nextAction: null };
  },

  // NEW: Handle conversational requests
  async handleConversation(sessionId, query) {
    await delay(50);
    return {
      success: true,
      sessionId,
      message: `Connecting you to a live agent.`
    };
  }
};
