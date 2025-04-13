
/**
 * Utility functions for webhook integrations
 */

/**
 * Send data to Make.com webhook when a new ad is created
 */
export const notifyAdCreation = async (adData: any, userData: any) => {
  try {
    const response = await fetch(
      'https://hook.us2.make.com/xyn69qyh2y57mep7njyi33ah4ka5ywry',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelo: adData.titulo || '',
          ano: adData.detalhes?.ano || new Date().getFullYear().toString(),
          preco: adData.preco || 0,
          vendedor: userData.user_metadata?.full_name || userData.email || 'Usuário',
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send webhook notification:', await response.text());
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    return false;
  }
};
