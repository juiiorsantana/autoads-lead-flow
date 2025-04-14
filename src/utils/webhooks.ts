
/**
 * Utility functions for webhook integrations
 */

/**
 * Send data to Make.com webhook when a new ad is created
 */
export const notifyAdCreation = async (adData: any, userData: any) => {
  try {
    console.log('Sending webhook notification for new ad:', adData);
    
    const response = await fetch(
      'https://hook.us2.make.com/4t5z4xt09tdh0lmbrgfca8ic6xqcrcqw',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: adData.titulo || '',
          preco: adData.preco || 0,
          orcamento: adData.orcamento || 0,
          detalhes: adData.detalhes || {},
          // Add additional fields for backward compatibility
          modelo: adData.titulo || '', // Use titulo as modelo for backwards compatibility
          ano: adData.detalhes?.ano || new Date().getFullYear().toString(),
          vendedor: userData.user_metadata?.full_name || userData.email || 'Usuário',
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send webhook notification:', await response.text());
      return false;
    }
    
    console.log('Webhook notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    return false;
  }
};
