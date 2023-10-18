import { useState, useCallback } from "react";

export const useLocalStorage = (
  key: string,
  initialValue: () => any,
): [string, (value: string) => void] => {
  const [localValue, setLocalValue] = useState(() => localStorage.getItem(key));

  const setValue = useCallback(
    (value: string) => {
      localStorage.setItem(key, value);
      setLocalValue(value);
    },
    [key],
  );

  if (localValue === null) {
    const item = initialValue();
    setValue(item);
    return [item, setValue];
  }

  return [localValue, setValue];
};
