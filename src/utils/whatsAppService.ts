
export const sendWhatsAppMessage = async (
  orderSummary: string,
  customerInfo: { name: string; isTakeaway: boolean },
  pickupTime: string,
  totalAmount: number
): Promise<boolean> => {
  try {
    // Format the message
    const message = `
*New Order from ${customerInfo.name}*
Order Type: ${customerInfo.isTakeaway ? 'Takeaway' : 'Dine-in'}
Pickup Time: ${pickupTime}

*Order Details:*
${orderSummary}

*Total: €${totalAmount.toFixed(2)}*
    `.trim();
    
    console.log("Sending Telegram message:", message);

    const TELEGRAM_BOT_TOKEN = '7692012997:AAFlBqlgNV4oskXXB7cljFRXuTwP98ed8N8';
    const CHAT_ID = '-4773302427';
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown' 
      })
    });
    
    if (response.status === 200) {
      console.log("Message sent successfully to Telegram group");
      return true;
    } else {
      console.error("Failed to send message:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};
