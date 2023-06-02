import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

export interface CurrentUserContextValue {
  userId: string;
  setUserId: (userId: string) => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
  userId: "",
  setUserId: () => {},
});

export interface Props {
  children: ReactNode;
  userId: string;
}
export default function CurrentUserProvider({
  children,
  userId: initialUserId,
}: Props) {
  const [userId, setUserId] = useState(initialUserId);

  // initialize a default user if given an empty userId
  useEffect(() => {
    if (!userId) {
      const id = "wconvery";
      setUserId(id);
    }
  }, [userId, setUserId]);

  const value = { userId, setUserId };
  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUserId() {
  const context = useContext(CurrentUserContext);
  return context.userId;
}

export function useSetCurrentUserId() {
  const context = useContext(CurrentUserContext);
  return context.setUserId;
}

export function useCurrentUsername() {
  const userId = useCurrentUserId();
  if (!userId) {
    return "";
  }
  return userId;
}
