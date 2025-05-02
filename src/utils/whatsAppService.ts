
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

Thank you for your order!
    `;
    
    console.log("WhatsApp message would be sent:", message);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};
