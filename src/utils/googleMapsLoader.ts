
// Google Maps API loader
let isLoaded = false;
let callbacks: (() => void)[] = [];

export const loadGoogleMapsAPI = (callback: () => void) => {
  if (isLoaded) {
    callback();
    return;
  }
  
  callbacks.push(callback);
  
  // Only add the script once
  if (callbacks.length === 1) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      callbacks.forEach(cb => cb());
      callbacks = [];
    };
    
    document.head.appendChild(script);
  }
};
