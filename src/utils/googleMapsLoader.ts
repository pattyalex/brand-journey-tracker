
// Google Maps API loader
let isLoaded = false;
let isError = false;
let callbacks: (() => void)[] = [];
let errorCallbacks: (() => void)[] = [];

export const loadGoogleMapsAPI = (callback: () => void, errorCallback?: () => void) => {
  if (isLoaded) {
    callback();
    return;
  }
  
  if (isError && errorCallback) {
    errorCallback();
    return;
  }
  
  callbacks.push(callback);
  if (errorCallback) {
    errorCallbacks.push(errorCallback);
  }
  
  // Only add the script once
  if (callbacks.length === 1) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
    
    // Check if API key is still the placeholder
    if (apiKey === 'YOUR_API_KEY') {
      console.error('Google Maps API key is not configured. Please replace "YOUR_API_KEY" with a valid API key.');
      isError = true;
      errorCallbacks.forEach(cb => cb());
      errorCallbacks = [];
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      callbacks.forEach(cb => cb());
      callbacks = [];
    };
    
    script.onerror = () => {
      isError = true;
      console.error('Failed to load Google Maps API. Please check your API key and network connection.');
      errorCallbacks.forEach(cb => cb());
      errorCallbacks = [];
    };
    
    document.head.appendChild(script);
  }
};

export const isGoogleMapsLoaded = () => isLoaded;
export const hasGoogleMapsError = () => isError;
