import { useQuery } from "react-query";
import { api } from "./shared";

export const getBySerialNumber = async (serialNumber?: number) => {
  if (!serialNumber) throw new Error("Serial number is required");
  return await api.get(`/exponats/serial/${serialNumber}`);
};

export const useGetBySerialNumber = (serialNumber?: number) => {
  return useQuery(["exponats-serial", serialNumber], () =>
    getBySerialNumber(serialNumber)
  );
};
