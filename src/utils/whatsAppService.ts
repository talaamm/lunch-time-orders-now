
// This is a utility to format and send WhatsApp messages
// In a real application, this would call your backend API

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
    
    // For demonstration purposes, we'll just log the message
    // In a real app, this would call your backend API that integrates with WhatsApp
    console.log("WhatsApp Message to +972522335226:", message);
    
    // Generate a WhatsApp URL (this opens WhatsApp but requires manual sending)
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/972522335226?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // In a real app with a proper backend API, you'd do:
    // const response = await fetch('/api/send-whatsapp', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phone: '+972522335226', message }),
    // });
    // return response.ok;
    
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};
