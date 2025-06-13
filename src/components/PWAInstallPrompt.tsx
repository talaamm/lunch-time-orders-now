
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt if not already dismissed and not iOS
      if (!localStorage.getItem('pwaPromptDismissed') && !iOS && !standalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual install instructions if not installed
    if (iOS && !standalone && !localStorage.getItem('pwaPromptDismissed')) {
      setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt && !isIOS) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA install outcome:', outcome);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-navy-800 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white hover:bg-navy-700 p-1"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex items-start space-x-3 pr-8">
        <Smartphone className="h-6 w-6 text-blue-300 mt-1 flex-shrink-0" />
        <div className="flex-grow">
          <h3 className="font-semibold text-sm mb-1">
            {isIOS ? 'Add to Home Screen' : 'Install App'}
          </h3>
          <p className="text-xs text-gray-200 mb-3">
            {isIOS 
              ? 'Tap Share → Add to Home Screen for notifications and faster access!'
              : 'Install for offline access and push notifications!'
            }
          </p>
          
          {!isIOS && deferredPrompt && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
