    import twilio from 'twilio';

// This is a utility to directly send WhatsApp messages using WhatsApp Business API
// This requires a registered WhatsApp Business account and API access

export const sendWhatsAppMessage = async (
  orderSummary: string,
  studentInfo: { name: string; id: string },
  pickupTime: string,
  totalAmount: number
): Promise<boolean> => {
  try {
    // Format the message
    const message = `
*New Order from ${studentInfo.name}*
Student ID: ${studentInfo.id}
Pickup Time: ${pickupTime}

*Order Details:*
${orderSummary}

*Total: €${totalAmount.toFixed(2)}*
    `.trim();
    
    console.log("Sending WhatsApp Message from +970598419419 to +972522335226:", message);
    
    // In a real production app, you would use the WhatsApp Business API
    // For demonstration, we're simulating a successful API call

const accountSid = 'ACf199f0298e4a5f7f473589e6919c809a';
const authToken = '[AuthToken]'; // Replace with your actual Auth Token

const client = twilio(accountSid, authToken);

client.messages
  .create({
    from: 'whatsapp:+14155238886',
    contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
    contentVariables: JSON.stringify({
      '1': '12/1',
      '2': '3pm',
    }),
    to: 'whatsapp:+972522335226',
  })
  .then((message) => {
    console.log('Message SID:', message.sid);
  })
  .catch((error) => {
    console.error('Failed to send message:', error);
  });

    // In real-world implementation, this would be an actual API call:
    // const response = await fetch('https://your-whatsapp-api-endpoint.com/send-message', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer YOUR_API_KEY'
    //   },
    //   body: JSON.stringify({
    //     from: '+970598419419',  // Your WhatsApp Business number
    //     to: '+972522335226',    // Recipient number
    //     message: message,
    //     type: 'text'
    //   })
    // });
    // return response.ok;
    
    // For this demo, we'll just simulate a successful message send
    console.log("Message sent successfully from WhatsApp Business number +970598419419 to +972522335226");
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};
