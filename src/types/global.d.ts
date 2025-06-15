
// Extend the Navigator interface with the non-standard "standalone" property for iOS PWAs
export {};

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}
