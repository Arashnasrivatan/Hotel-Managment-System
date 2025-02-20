const configs = require("./../configs");

exports.createPayment = async (amountInToman) => {
  try {
        const TomanToRial = amountInToman * 10
    const response = await fetch(`${configs.zibal.base_url}request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant: configs.zibal.merchant,
        amount: TomanToRial,
        callbackUrl: configs.zibal.callback_url,
      }),
    });

    const responseData = await response.json();

    return {
      trackId: responseData.trackId,
      paymentUrl: `${configs.zibal.payment_base_url}${responseData.trackId}`,
    };
  } catch (err) {
    throw err;
  }
};

exports.verifyPayment = async (trackId) => {
  try {
    const response = await fetch(`${configs.zibal.base_url}verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant: configs.zibal.merchant,
        trackId
      }),
    });

    const responseData = await response.json();

    return responseData;
  } catch (err) {
    throw err;
  }
};
