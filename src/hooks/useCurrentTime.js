import { useEffect, useState } from 'react';

export const useCurrentTime = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, []);

  return now;
};
