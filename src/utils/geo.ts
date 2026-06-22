// src/utils/geo.ts
export const getLocation = (): Promise<{ lat: number; lng: number }> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err.message)
    );
  });