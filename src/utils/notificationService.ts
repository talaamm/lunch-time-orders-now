
export class NotificationService {
  private static instance: NotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private scheduledNotifications: Map<string, ReturnType<typeof setTimeout>> = new Map();

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
      console.log('Notification permission:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async schedulePickupReminder(pickupTime: string, orderId: string, customerName: string) {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return;
    }

    const pickupDate = new Date();
    const [hours, minutes] = pickupTime.split(':');
    pickupDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const now = new Date();
    const timeUntilPickup = pickupDate.getTime() - now.getTime();

    console.log('Scheduling notification for:', pickupTime, 'Time until pickup:', timeUntilPickup);

    // If pickup time is in the past or very soon (less than 1 minute), show notification immediately
    if (timeUntilPickup <= 60000) {
      this.showNotification(
        '🍽️ Your Meal is Ready!',
        `Hi ${customerName}! Your food is ready for pickup at the cafeteria.`,
        `/orders/${orderId}`
      );
      return;
    }

    // Schedule notification at pickup time
    const timeoutId = setTimeout(() => {
      this.showNotification(
        '🍽️ Your Meal is Ready!',
        `Hi ${customerName}! Your food is ready for pickup at the cafeteria.`,
        `/orders/${orderId}`
      );
      this.scheduledNotifications.delete(orderId);
    }, timeUntilPickup);

    // Store the timeout ID so we can cancel it if needed
    this.scheduledNotifications.set(orderId, timeoutId);

    // Also schedule a 5-minute early reminder
    const reminderTime = timeUntilPickup - (5 * 60 * 1000);
    if (reminderTime > 0) {
      setTimeout(() => {
        this.showNotification(
          '⏰ Meal Ready Soon!',
          `Hi ${customerName}! Your meal will be ready in 5 minutes.`,
          `/orders/${orderId}`
        );
      }, reminderTime);
    }
  }

  cancelNotification(orderId: string) {
    const timeoutId = this.scheduledNotifications.get(orderId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(orderId);
      console.log('Cancelled notification for order:', orderId);
    }
  }

  private async showNotification(title: string, body: string, url: string) {
    if (!this.swRegistration) return;

    try {
      // Check if we have permission
      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      await this.swRegistration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'meal-ready',
        requireInteraction: true,
        data: { url }
      });

      console.log('Notification shown:', title);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Test notification for debugging
  async testNotification() {
    await this.showNotification(
      '🔔 Test Notification',
      'This is a test notification to check if everything works!',
      '/'
    );
  }
}
