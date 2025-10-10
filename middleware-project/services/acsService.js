const delay = ms => new Promise(res => setTimeout(res, ms));

async function startCall(sessionId, options = {}) {
  await delay(100);
  return { 
    success: true, 
    sessionId, 
    action: 'startCall', 
    message: `Mock: Call started for ${sessionId}`, 
    acsCallId: `ACS-${Date.now()}` 
  };
}

async function stopCall(sessionId) {
  await delay(80);
  return { 
    success: true, 
    sessionId, 
    action: 'stopCall', 
    message: `Mock: Call stopped for ${sessionId}` 
  };
}

async function sendDTMF(sessionId, dtmf) {
  await delay(60);
  return { 
    success: true, 
    sessionId, 
    action: 'sendDTMF', 
    dtmf, 
    message: `Mock: Received DTMF '${dtmf}' for ${sessionId}`
  };
}

async function getBalance(sessionId) {
  await delay(50);
  return { success: true, sessionId, message: `Your account balance is ₹500.` };
}

async function recharge(sessionId, amount = 100) {
  await delay(50);
  return { success: true, sessionId, message: `Recharge successful for ₹${amount}.` };
}

async function reportLostCard(sessionId) {
  await delay(70);
  return {
    success: true,
    sessionId,
    message: `Thank you. Your card has been blocked immediately. A customer service agent will call you shortly to confirm.`
  };
}

async function activateNewCard(sessionId) {
  await delay(70);
  return {
    success: true,
    sessionId,
    message: `To activate your new card, please enter the 16-digit card number followed by the hash key.`
  };
}

async function updateContactDetails(sessionId) {
  await delay(70);
  return {
    success: true,
    sessionId,
    message: `A secure link to update your contact details has been sent to your registered mobile number.`
  };
}

async function reportSuspiciousTransaction(sessionId) {
  await delay(70);
  return {
    success: true,
    sessionId,
    message: `Thank you for reporting this. A temporary hold has been placed on your account. Our fraud protection team will contact you within the next hour.`
  };
}

async function handleQuery(sessionId, queryOrIntent) {
  if (!queryOrIntent) {
    return { success: false, sessionId, error: { message: "Query or intent is required." } };
  }

  const q = queryOrIntent.toString().toLowerCase();

  // First: check if it's an explicit intent string
  switch (queryOrIntent) {
    case "ACS_BALANCE": {
      const r = await getBalance(sessionId);
      return { success: true, sessionId, data: { message: r.message } };
    }
    case "ACS_RECHARGE": {
      const r = await recharge(sessionId);
      return { success: true, sessionId, data: { message: r.message } };
    }
    case "ACS_REPORT_LOST_CARD": {
      const r = await reportLostCard(sessionId);
      return { success: true, sessionId, data: { message: r.message } };
    }
    case "ACS_ACTIVATE_CARD": {
      const r = await activateNewCard(sessionId);
      return { success: true, sessionId, data: { message: r.message } };
    }
    case "ACS_UPDATE_CONTACT": {
      const r = await updateContactDetails(sessionId);
      return { success: true, sessionId, data: { message: r.message } };
    }
    case "ACS_REPORT_SUSPICIOUS": {
      const r = await reportSuspiciousTransaction(sessionId);
      return { success: true, sessionId, data: { message: r.message } };
    }
  }

  // Fallback: free-text matching (for robustness)
  if (q.includes("balance")) {
    const r = await getBalance(sessionId);
    return { success: r.success, sessionId, data: { message: r.message } };
  }

  if (q.includes("recharge")) {
    const amountMatch = q.match(/(\d+)/);
    const amount = amountMatch ? Number(amountMatch[1]) : 100;
    const r = await recharge(sessionId, amount);
    return { success: r.success, sessionId, data: { message: r.message } };
  }

  if (q.includes("lost card") || q.includes("report lost") || q.includes("block card")) {
    const r = await reportLostCard(sessionId);
    return { success: r.success, sessionId, data: { message: r.message } };
  }

  if (q.includes("activate") && q.includes("card")) {
    const r = await activateNewCard(sessionId);
    return { success: r.success, sessionId, data: { message: r.message } };
  }

  if (q.includes("update contact") || q.includes("change contact") || q.includes("update mobile")) {
    const r = await updateContactDetails(sessionId);
    return { success: r.success, sessionId, data: { message: r.message } };
  }

  if (q.includes("suspicious") || q.includes("fraud") || q.includes("transaction")) {
    const r = await reportSuspiciousTransaction(sessionId);
    return { success: r.success, sessionId, data: { message: r.message } };
  }

  return {
    success: false,
    sessionId,
    error: { message: "Unable to map query to ACS action." }
  };
}

module.exports = { 
  startCall,
  stopCall,
  sendDTMF,
  getBalance,
  recharge,
  reportLostCard,
  activateNewCard,
  updateContactDetails,
  reportSuspiciousTransaction,
  handleQuery
};
