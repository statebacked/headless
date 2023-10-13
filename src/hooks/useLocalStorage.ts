import { useState, useCallback } from "react";

export const useLocalStorage = (key: string, initialValue: () => any) => {
  const [localValue, setLocalValue] = useState(() => localStorage.getItem(key));

  const setValue = useCallback(
    (value: any) => {
      localStorage.setItem(key, value);
      setLocalValue(value);
    },
    [key],
  );

  if (typeof localValue === "undefined") {
    const item = initialValue();
    setValue(item);
    return [item, setValue];
  }

  return [localValue, setValue];
};
