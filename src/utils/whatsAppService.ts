
export const sendWhatsAppMessage = async (
  orderSummary: string,
  customerInfo: { name: string; isTakeaway: boolean },
  pickupTime: string,
  totalAmount: number,
  discountApplied?: number
): Promise<boolean> => {
  try {
    // In a real implementation, you would send an API request to WhatsApp Business API
    // For this demo, we'll just log the message and simulate a successful response
    
    const message = `
*New Order from ${customerInfo.name}*
${discountApplied ? `*Discount: ${discountApplied}% applied*\n` : ''}
*Pickup Time: ${pickupTime}*
*Order Type: ${customerInfo.isTakeaway ? 'Takeaway' : 'Dine-in'}*

*Items:*
${orderSummary}

*Total: ₪${totalAmount.toFixed(2)}*
    `;


// Thank you for your order!
    
    
    // console.log("WhatsApp message would be sent:", message);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
     console.log("Sending Telegram message:", message);
 
     const TELEGRAM_BOT_TOKEN = '7692012997:AAFlBqlgNV4oskXXB7cljFRXuTwP98ed8N8';
     const CHAT_ID = '-4773302427';
     const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
 // *Total: ₪${totalAmount.toFixed(2)}*
 
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
    // return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};
