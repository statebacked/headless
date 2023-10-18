import { toValidIdentifier } from "../utils";
import { useLocalStorage } from "./useLocalStorage";

const defaultLocalStorageKey = "headless-user-id";

type UserIdProps = {
  userId?: string;
  localStorageKey?: string;
};

export const useUserId = ({
  localStorageKey = defaultLocalStorageKey,
  userId: propUserId,
}: UserIdProps) => {
  const [userId, setUserId] = useLocalStorage(localStorageKey, () =>
    propUserId ? toValidIdentifier(propUserId) : crypto.randomUUID(),
  );

  return userId;
};
