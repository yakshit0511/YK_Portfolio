import { useEffect, useState } from 'react';

interface NavigatorWithDeviceHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

export function useLowPower(): boolean {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const device = navigator as NavigatorWithDeviceHints;
    setLowPower(
      (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
      device.connection?.saveData === true,
    );
  }, []);

  return lowPower;
}
