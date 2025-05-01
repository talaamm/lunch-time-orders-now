import axios from 'axios';
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
    
    // console.log("Sending WhatsApp Message from +970598419419 to +972522335226:", message);
        console.log("Sending Telegram message:", message);

    // In a real production app, you would use the WhatsApp Business API
    // For demonstration, we're simulating a successful API call

// telegram.ts

const TELEGRAM_BOT_TOKEN = '7692012997:AAFlBqlgNV4oskXXB7cljFRXuTwP98ed8N8';
const CHAT_ID = '-4773302427'; // Replace with your group chat ID

// export async function sendTelegramMessage(text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

//   await axios.post(url, {
//     chat_id: CHAT_ID,
//     text,
//   });
// }

// // Example usage
// sendTelegramMessage("🍕 New order: 1 Pizza + 1 Cola")
//   .then(() => console.log("Message sent"))
//   .catch(console.error);

 // Sending message to Telegram
    const response = await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'  // Specify that the message will use Markdown formatting
    });
    // In real-world implementation, this would be an actual API call:
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //     // 'Authorization': 'Bearer YOUR_API_KEY'
    //   },
    //   body: JSON.stringify({
    //     // from: '+970598419419',  // Your WhatsApp Business number
    //     // to: '+972522335226',    // Recipient number
    //     chat_id: CHAT_ID,
    //     message: message,
    //     type: 'text'
    //   })
    // });
//     return response.ok;

//     // For this demo, we'll just simulate a successful message send
//     console.log("Message sent successfully from WhatsApp Business number +970598419419 to +972522335226");
//     return true;
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);
//     return false;
//   }
// };
     if (response.status === 200) {
      console.log("Message sent successfully to Telegram group");
      return true;
    } else {
      console.error("Failed to send message:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};
