import apiClient from "@/lib/apiClient";

let watchId: number | null = null;
let intervalId: NodeJS.Timeout | null = null;
let isWatching = false;

/**
 * Start sending location updates every 30 seconds for the given employee.
 * Automatically clears any previous tracking session to avoid stale state.
 */
export const startLocationTracking = (employeeId: string, intervalMs: number = 30000) => {
  // ✅ Always clear any previous tracker first – don't trust stale isWatching
  stopLocationTracking();

  if (!navigator.geolocation) {
    console.warn('Geolocation not supported');
    return;
  }

  const sendLocation = (lat: number, lng: number) => {
    apiClient.post('/attendance/update-location', {
      employeeId,
      latitude: lat,
      longitude: lng,
    }).catch((err) => console.error('Location update failed:', err));
  };

  // Initial position
  navigator.geolocation.getCurrentPosition(
    (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
    (err) => console.warn('Initial location error:', err),
    { enableHighAccuracy: true, timeout: 10000 }
  );

  // Watch for movement
  watchId = navigator.geolocation.watchPosition(
    (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
    (err) => console.warn('Watch error:', err),
    { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
  );

  // Periodic ping even if no movement
  intervalId = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      (err) => console.warn('Interval location error:', err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, intervalMs);

  isWatching = true;
  console.log(`📍 Location tracking started for employee ${employeeId}`);
};

/**
 * Stop all location tracking and reset state.
 */
export const stopLocationTracking = () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isWatching = false;
  console.log('📍 Location tracking stopped');
};

/**
 * Check if tracking is currently active (useful for debugging).
 */
export const isTrackingActive = () => isWatching;