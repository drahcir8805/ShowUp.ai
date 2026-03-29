"use client";

import { useCallback, useEffect, useState } from "react";
import { Auth } from "@/components/Auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { authenticatedFetch } from "@/lib/api-client";
import { getStudentLocation } from "@/lib/location";

type User = { id: string };

type EnrolledClass = {
  id: string;
  code: string;
  name: string;
  startTime?: string;
  endTime?: string;
  building: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
  } | null;
};

type CheckInResponse = {
  accepted: boolean;
  status: "valid" | "blocked" | "suspicious";
  message: string;
  checkInId: string;
  nearestBuildingName?: string;
  attemptedBuildingName: string;
  distanceFromClassMeters: number;
};

export default function CheckInPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const checkAuth = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setAuthChecked(true);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setError("");
      const location = await getStudentLocation();
      setCoords({ lat: location.lat, lng: location.lng });

      const response = await authenticatedFetch("/api/check-in/classes");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load classes.");
      setClasses(data.classes || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load check-in data.");
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const runCheckIn = async (classId: string) => {
    if (!coords) {
      setError("Current location is required before check-in.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authenticatedFetch("/api/check-in", {
        method: "POST",
        body: JSON.stringify({
          classId,
          currentLatitude: coords.lat,
          currentLongitude: coords.lng,
        }),
      });
      const data = (await response.json()) as CheckInResponse | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Check-in failed.");
      }

      setMessage(data.message);
      if (!data.accepted) {
        setError(data.message);
      }
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : "Check-in failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-[#f5f5dc] p-8">Loading...</div>;
  }
  if (!user) {
    return <Auth onAuth={checkAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      <SiteHeader minimal backHref="/betting" />
      <main className="mx-auto max-w-4xl space-y-4 px-6 py-8">
        <h1 className="text-3xl font-bold text-[#4a4a4a]">Class Check-In</h1>
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">Current detected coordinates</p>
            <p className="text-sm text-gray-700">
              {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : "Detecting location..."}
            </p>
          </CardContent>
        </Card>

        {message ? (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-3">
          {classes.length === 0 ? <p>No enrolled classes found.</p> : null}
          {classes.map((classItem) => (
            <Card key={classItem.id}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">
                  {classItem.code} - {classItem.name}
                </h2>
                <p className="text-sm text-gray-700">Building: {classItem.building?.name || "Unknown"}</p>
                <p className="text-sm text-gray-700">
                  Time: {classItem.startTime || "--:--"} - {classItem.endTime || "--:--"}
                </p>
                <Button className="mt-4" onClick={() => runCheckIn(classItem.id)} disabled={loading}>
                  {loading ? "Checking..." : "Check In"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
