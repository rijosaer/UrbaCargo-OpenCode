import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { findUser, type AppUser } from "@/data/users";
import {
  initialShipments,
  nextStatus,
  type Shipment,
  type ShipmentDraft,
} from "@/data/shipments";
import { nowDate, nowTime } from "@/theme";

interface AppContextValue {
  user: AppUser | null;
  login: (email: string, password: string) => boolean;
  loginWith: (user: AppUser) => void;
  logout: () => void;
  shipments: Shipment[];
  createShipment: (draft: ShipmentDraft) => Shipment;
  advanceStatus: (id: string) => void;
  setRating: (id: string, rating: number) => void;
  getShipment: (id?: string) => Shipment | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);

  const login = useCallback((email: string, password: string) => {
    const found = findUser(email, password);
    if (!found) return false;
    const safe: AppUser = {
      type: found.type,
      name: found.name,
      email: found.email,
      location: found.location,
    };
    setUser(safe);
    return true;
  }, []);

  const loginWith = useCallback((next: AppUser) => {
    const safe: AppUser = {
      type: next.type,
      name: next.name,
      email: next.email,
      location: next.location,
    };
    setUser(safe);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const createShipment = useCallback(
    (draft: ShipmentDraft) => {
      const shipment: Shipment = {
        ...draft,
        id: `ENV-${1001 + shipments.length}`,
        status: "En preparación",
        date: nowDate(),
        time: nowTime(),
        rated: null,
      };
      setShipments((prev) => [shipment, ...prev]);
      return shipment;
    },
    [shipments.length]
  );

  const advanceStatus = useCallback((id: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus(s.status) } : s))
    );
  }, []);

  const setRating = useCallback((id: string, rating: number) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, rated: rating } : s)));
  }, []);

  const getShipment = useCallback(
    (id?: string) => shipments.find((s) => s.id === id),
    [shipments]
  );

  const value = useMemo(
    () => ({
      user,
      login,
      loginWith,
      logout,
      shipments,
      createShipment,
      advanceStatus,
      setRating,
      getShipment,
    }),
    [user, login, loginWith, logout, shipments, createShipment, advanceStatus, setRating, getShipment]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
};
