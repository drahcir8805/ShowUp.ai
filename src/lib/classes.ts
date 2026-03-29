/** Shape mirrors a future Supabase `classes` row. */

export type ClassFormInput = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  homeAddress: string;
  homeLat: number;
  homeLng: number;
  days: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  betAmount: number;
  lossAmount: number;
  userId?: string | null;
};

export type ClassRecord = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  homeAddress: string;
  homeLat: number;
  homeLng: number;
  days: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  betAmount: number;
  lossAmount: number;
  userId: string | null;
};

export function createClassObject(formData: ClassFormInput): ClassRecord {
  return {
    id: crypto.randomUUID(),
    name: formData.name,
    address: formData.address,
    lat: formData.lat,
    lng: formData.lng,
    homeAddress: formData.homeAddress,
    homeLat: formData.homeLat,
    homeLng: formData.homeLng,
    days: formData.days,
    startTime: formData.startTime,
    endTime: formData.endTime,
    startDate: formData.startDate,
    endDate: formData.endDate,
    betAmount: formData.betAmount,
    lossAmount: formData.lossAmount,
    userId: formData.userId ?? null,
    // TODO: insert into Supabase classes table
  };
}
