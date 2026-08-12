import React, { createContext, useContext, useState } from "react";

type UserType = {
  Email: string;
  vendorCode: string;
  vendorName: string;
  matnr: string;
  email: string;
  Vendor: string;
};

type AuthContextType = {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserType | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);