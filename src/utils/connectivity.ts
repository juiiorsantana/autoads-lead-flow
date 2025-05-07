
/**
 * Utility para verificar e gerenciar a conectividade da aplicação
 */
import React from 'react';

const ONLINE_CHECK_INTERVAL = 30000; // 30 segundos

class ConnectivityManager {
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(online: boolean) => void> = [];
  private checkIntervalId: number | null = null;

  constructor() {
    // Inicializar listeners de eventos
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
    
    // Iniciar verificação periódica
    this.startPeriodicCheck();
  }

  private updateOnlineStatus(online: boolean) {
    // Só notificar se o status mudou
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.notifyListeners();
      
      // Log para depuração
      console.log(`Conectividade alterada: ${online ? 'online' : 'offline'}`);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  private async checkServerConnectivity() {
    try {
      // Usa um endpoint estático para verificar conexão
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      return response.ok;
    } catch (error) {
      console.warn('Erro ao verificar conectividade:', error);
      return false;
    }
  }

  private startPeriodicCheck() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
    
    this.checkIntervalId = window.setInterval(async () => {
      // Apenas verificar se a página estiver visível
      if (document.visibilityState === 'visible') {
        const serverReachable = await this.checkServerConnectivity();
        this.updateOnlineStatus(serverReachable);
      }
    }, ONLINE_CHECK_INTERVAL);
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public addListener(listener: (online: boolean) => void) {
    this.listeners.push(listener);
    // Notificar imediatamente o novo listener com o status atual
    listener(this.isOnline);
    
    // Retornar função para remover o listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Exportar uma única instância
export const connectivityManager = new ConnectivityManager();

// Hook para React
export const useConnectivity = () => {
  const [isOnline, setIsOnline] = React.useState(connectivityManager.getOnlineStatus());
  
  React.useEffect(() => {
    // Registrar listener e obter função para removê-lo
    const removeListener = connectivityManager.addListener((online) => {
      setIsOnline(online);
    });
    
    // Limpar listener quando o componente for desmontado
    return removeListener;
  }, []);
  
  return isOnline;
};

// Exportar helper functions
export const isOffline = () => !connectivityManager.getOnlineStatus();
export const isOnline = () => connectivityManager.getOnlineStatus();
