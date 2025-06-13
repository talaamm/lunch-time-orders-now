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
      
      // Check current permission status
      const permission = Notification.permission;
      console.log('Current notification permission:', permission);
      
      return permission === 'granted';
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported in this browser');
      return false;
    }

    try {
      // For iOS Safari and other browsers that might have restrictions
      const permission = await Notification.requestPermission();
      console.log('Permission request result:', permission);
      
      if (permission === 'granted') {
        // Show a test notification to confirm it's working
        await this.showTestNotification();
        return true;
      } else if (permission === 'denied') {
        console.log('Notification permission denied by user');
        return false;
      } else {
        console.log('Notification permission dismissed');
        return false;
      }
      
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // New method to force re-request permissions
  async toggleNotifications() {
    const currentPermission = Notification.permission;
    
    if (currentPermission === 'denied') {
      // Browser has blocked notifications, user needs to manually enable in settings
      alert('Notifications are blocked. Please enable them in your browser settings:\n\n' +
            'Chrome: Settings > Privacy and security > Site Settings > Notifications\n' +
            'Safari: Settings > Websites > Notifications\n' +
            'Firefox: Settings > Privacy & Security > Permissions > Notifications');
      return false;
    }
    
    if (currentPermission === 'granted') {
      // Already granted, show test notification
      await this.showTestNotification();
      return true;
    }
    
    // Request permission (first time or default state)
    return await this.requestPermission();
  }

  async schedulePickupReminder(pickupTime: string, orderId: string, customerName: string) {
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return;
    }

    // Check permission again before scheduling
    if (Notification.permission !== 'granted') {
      console.log('No notification permission, skipping notification scheduling');
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
    try {
      // Check if we have permission
      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      // For cross-platform compatibility, try both service worker and direct notification
      if (this.swRegistration) {
        await this.swRegistration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'meal-ready',
          requireInteraction: true,
          data: { url },
          // iOS Safari specific options
          silent: false
        });
      } else {
        // Fallback for browsers without service worker support
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'meal-ready',
          requireInteraction: true
        });
      }

      console.log('Notification shown:', title);
    } catch (error) {
      console.error('Error showing notification:', error);
      
      // Fallback to basic notification
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      } catch (fallbackError) {
        console.error('Fallback notification also failed:', fallbackError);
      }
    }
  }

  // Test notification for debugging
  async showTestNotification() {
    if (Notification.permission !== 'granted') {
      console.log('Cannot show test notification - permission not granted');
      return;
    }

    await this.showNotification(
      '🔔 Notifications Enabled!',
      'You will now receive alerts when your meal is ready.',
      '/'
    );
  }

  // Check current permission status
  isPermissionGranted() {
    return Notification.permission === 'granted';
  }

  // Get current permission status as string
  getPermissionStatus() {
    return Notification.permission;
  }
}
