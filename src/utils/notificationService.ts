export class NotificationService {
  private static instance: NotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async schedulePickupReminder(pickupTime: string, orderId: string) {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return;
    }

    const pickupDate = new Date(pickupTime);
    const now = new Date();
    const timeUntilPickup = pickupDate.getTime() - now.getTime();

    // Schedule notification 5 minutes before pickup time
    const notificationTime = timeUntilPickup - (5 * 60 * 1000);

    if (notificationTime > 0) {
      setTimeout(() => {
        this.showNotification(
          'Time to Pick Up Your Order!',
          'Your food is ready for pickup. Please collect it from the cafeteria.',
          `/orders/${orderId}`
        );
      }, notificationTime);
    }
  }

  private async showNotification(title: string, body: string, url: string) {
    if (!this.swRegistration) return;

    try {
      await this.swRegistration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: { url }
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
} 