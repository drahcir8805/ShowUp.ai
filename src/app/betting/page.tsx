"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SiteHeader } from "@/components/marketing/site-header";
import { AddressSearch } from "@/components/AddressSearch";
import { ClassMap } from "@/components/ClassMap";
import { CheckIn } from "@/components/CheckIn";
import { createClassObject } from "@/lib/classes";
import type { ClassRecord } from "@/lib/classes";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { calculateClassAnalytics } from "@/lib/analytics";
import { Auth } from "@/components/Auth";
import { ArrowLeft, X, Plus, MapPin, Clock, DollarSign, Home, ChevronDown, ChevronUp, TrendingUp, AlertCircle, Target, Zap, Calendar, BarChart3, HelpCircle, TrendingDown, Activity } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { FlickeringSectionOverlays } from "@/components/marketing/flickering-section-overlays";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import {
  AnalyticsBentoArt,
  BankrollBentoArt,
  BentoTileArtLayer,
  CalendarBentoArt,
  InsertClassBentoArt,
} from "@/components/betting/bento-tile-art";

/** Modal draft — becomes a `ClassRecord` via `createClassObject` on save. */
interface ClassDraft {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  homeAddress: string;
  homeLat?: number;
  homeLng?: number;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  startDate: string;
  endDate: string;
  betAmount: number;
  lossAmount: number;
}

interface User {
  id: string;
  email?: string;
}

const TOTAL_BANKROLL_HELP =
  "Total bankroll is the sum of stakes you set for each class—your full committed pool across all classes.";

function BettingAnimatedBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <AnimatedGridPattern
          width={32}
          height={32}
          numSquares={55}
          maxOpacity={0.42}
          duration={3}
          repeatDelay={0.45}
          className="h-full min-h-screen w-full text-[#9b59b6]/35 stroke-neutral-400/25"
        />
      </div>
      <FlickeringSectionOverlays />
    </>
  );
}

function TotalBankrollLabel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex items-center gap-1 text-sm text-gray-600">
      <span>Total Bankroll</span>
      <button
        type="button"
        aria-label="What is Total Bankroll?"
        aria-expanded={open}
        className="shrink-0 rounded-full p-0.5 text-gray-500 hover:bg-gray-200/80"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <div
          role="dialog"
          className="absolute left-0 top-full z-[60] mt-1 w-64 rounded-md border border-gray-200 bg-white p-2 text-left text-xs font-normal leading-snug text-gray-700 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {TOTAL_BANKROLL_HELP}
        </div>
      ) : null}
    </div>
  );
}

export default function BettingPage() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showClassesOverview, setShowClassesOverview] = useState(false);
  const [showBankrollAnalytics, setShowBankrollAnalytics] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);
  const [expandedClassesInOverview, setExpandedClassesInOverview] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Calculate total bankroll dynamically
  const totalBetAmount = classes.reduce((sum, cls) => sum + (cls.betAmount || 0), 0);
  const [currentClass, setCurrentClass] = useState<ClassDraft>({
    name: "",
    address: "",
    homeAddress: "",
    schedule: {
      days: [],
      startTime: "",
      endTime: ""
    },
    startDate: "",
    endDate: "",
    betAmount: 0,
    lossAmount: 0
  });

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAuthChecked(true);
      
      if (currentUser) {
        fetchClasses();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthChecked(true);
      setLoading(false);
    }
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert Supabase data to ClassRecord format
      const classRecords: ClassRecord[] = (data || []).map(cls => createClassObject({
        name: cls.name,
        address: cls.address,
        lat: cls.latitude,
        lng: cls.longitude,
        homeAddress: "", // We'll need to add home address to schema later
        homeLat: 0,
        homeLng: 0,
        days: cls.days_of_week,
        startTime: cls.start_time,
        endTime: cls.end_time,
        startDate: cls.start_date || "",
        endDate: cls.end_date || "",
        betAmount: cls.bet_amount || 0,
        lossAmount: cls.loss_amount,
      }));
      
      setClasses(classRecords);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleClassExpansionInOverview = (classId: string) => {
    setExpandedClassesInOverview((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const handleDayToggle = (day: string) => {
    setCurrentClass(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const addClass = async () => {
    if (
      currentClass.name &&
      currentClass.address &&
      currentClass.homeAddress &&
      currentClass.lat != null &&
      currentClass.lng != null &&
      currentClass.homeLat != null &&
      currentClass.homeLng != null &&
      currentClass.schedule.days.length > 0 &&
      currentClass.startDate &&
      currentClass.endDate &&
      currentClass.betAmount > 0 &&
      currentClass.lossAmount > 0
    ) {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        console.log("Saving class to Supabase...");
        const { data, error } = await supabase
          .from('classes')
          .insert({
            user_id: user.id,
            name: currentClass.name,
            address: currentClass.address,
            latitude: currentClass.lat,
            longitude: currentClass.lng,
            radius: 100, // Default 100m radius
            start_time: currentClass.schedule.startTime,
            end_time: currentClass.schedule.endTime,
            days_of_week: currentClass.schedule.days,
            start_date: currentClass.startDate,
            end_date: currentClass.endDate,
            bet_amount: currentClass.betAmount,
            loss_amount: currentClass.lossAmount,
            current_streak: 0,
            week_attendance: 0,
            total_saved: 0,
          })
          .select()
          .single();

        if (error) throw error;

        // Create ClassRecord from Supabase data
        const record = createClassObject({
          name: data.name,
          address: data.address,
          lat: data.latitude,
          lng: data.longitude,
          homeAddress: currentClass.homeAddress,
          homeLat: currentClass.homeLat!,
          homeLng: currentClass.homeLng!,
          days: data.days_of_week,
          startTime: data.start_time,
          endTime: data.end_time,
          startDate: data.start_date,
          endDate: data.end_date,
          betAmount: data.bet_amount,
          lossAmount: data.loss_amount,
        });

        // Update local state
        setClasses(prev => [record, ...prev]);

        // Reset form
        setCurrentClass({
          name: "",
          address: "",
          homeAddress: "",
          schedule: {
            days: [],
            startTime: "",
            endTime: ""
          },
          startDate: "",
          endDate: "",
          betAmount: 0,
          lossAmount: 0
        });
        setShowInsertModal(false);
      } catch (error) {
        console.error('Error adding class:', error);
        alert('Error adding class. Please try again.');
      }
    }
  };

  const totalPotentialLoss = classes.reduce((sum, cls) => sum + cls.lossAmount, 0);

  const finalizeBets = () => {
    console.log("Final bets:", { totalBetAmount, classes });
    alert(`Betting setup complete! Initial bankroll: $${totalBetAmount}, Potential loss per class: $${totalPotentialLoss}`);
  };

  // Show auth screen if not authenticated
  if (!authChecked) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--landing-base)]">
        <BettingAnimatedBackground />
        <div className="relative z-10 h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Auth onAuth={checkAuth} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--landing-base)]">
      <BettingAnimatedBackground />

      <div className="relative z-10">
      <SiteHeader minimal />

      {/* Insert Class Modal */}
      {showInsertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-[#d4d4aa]/20 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#4a4a4a]">Insert New Class</h2>
                <p className="text-[#6a6a6a] mt-1">Set up your class betting parameters</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowInsertModal(false)}
                className="text-[#6a6a6a] hover:text-[#4a4a4a]"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Bet Amount Section */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#4a4a4a]">Set Bet Amount</h3>
                    <p className="text-sm text-[#6a6a6a]">Your initial bankroll for this class</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[100, 250, 500].map(amount => (
                    <Button
                      key={amount}
                      variant={currentClass.betAmount === amount ? "default" : "outline"}
                      onClick={() => setCurrentClass(prev => ({ ...prev, betAmount: amount }))}
                      className={`${currentClass.betAmount === amount ? 'bg-green-600' : 'border-green-200'} text-[#4a4a4a]`}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={currentClass.betAmount > 0 ? currentClass.betAmount : ""}
                  onChange={(e) => setCurrentClass(prev => ({ ...prev, betAmount: Number(e.target.value) }))}
                  placeholder="Custom bet amount"
                  className="mt-3 bg-white border-green-200"
                />
              </div>

              {/* Class Duration Section */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#4a4a4a]">Class Duration</h3>
                    <p className="text-sm text-[#6a6a6a]">Start and end dates for this semester</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#4a4a4a] font-medium">Start Date</Label>
                    <Input
                      type="date"
                      value={currentClass.startDate}
                      onChange={(e) => setCurrentClass(prev => ({ ...prev, startDate: e.target.value }))}
                      className="mt-2 bg-white border-blue-200"
                    />
                  </div>
                  <div>
                    <Label className="text-[#4a4a4a] font-medium">End Date</Label>
                    <Input
                      type="date"
                      value={currentClass.endDate}
                      onChange={(e) => setCurrentClass(prev => ({ ...prev, endDate: e.target.value }))}
                      className="mt-2 bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Loss Amount Section */}
              <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--yellow)]/10 rounded-xl p-6 border border-[var(--accent)]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#4a4a4a]">Set Loss Amount</h3>
                    <p className="text-sm text-[#6a6a6a]">Amount deducted from your bankroll for each missed class</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 25, 50].map(amount => (
                    <Button
                      key={amount}
                      variant={currentClass.lossAmount === amount ? "default" : "outline"}
                      onClick={() => setCurrentClass(prev => ({ ...prev, lossAmount: amount }))}
                      className={`${currentClass.lossAmount === amount ? 'bg-[var(--accent)]' : 'border-[#d4d4aa]/30'} text-[#4a4a4a]`}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={currentClass.lossAmount > 0 ? currentClass.lossAmount : ""}
                  onChange={(e) => setCurrentClass(prev => ({ ...prev, lossAmount: Number(e.target.value) }))}
                  placeholder="Custom loss amount"
                  className="mt-3 bg-white border-[#d4d4aa]/30"
                />
              </div>

              {/* Class Details */}
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-[#4a4a4a] font-medium">
                    <MapPin className="w-4 h-4" />
                    Class Name
                  </Label>
                  <Input
                    value={currentClass.name}
                    onChange={(e) => setCurrentClass(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., CS 101 - Intro to Computer Science"
                    className="mt-2 bg-white border-[#d4d4aa]/30"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-[#4a4a4a] font-medium">
                    <MapPin className="w-4 h-4" />
                    Class Building Address
                  </Label>
                  <div className="mt-2">
                    <AddressSearch
                      placeholder="e.g., Science Building, Waterloo"
                      onSelect={(location) => {
                        setCurrentClass((prev) => ({
                          ...prev,
                          address: location.address,
                          lat: location.lat,
                          lng: location.lng,
                        }));
                      }}
                    />
                    {currentClass.lat && currentClass.lng && (
                      <div className="mt-3">
                        <ClassMap 
                          lat={currentClass.lat} 
                          lng={currentClass.lng} 
                          enableFlyTo={true}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-[#4a4a4a] font-medium">
                    <Home className="w-4 h-4" />
                    Your Home Address
                  </Label>
                  <div className="mt-2">
                    <AddressSearch
                      placeholder="e.g., Student Residence, Waterloo"
                      onSelect={(location) => {
                        setCurrentClass((prev) => ({
                          ...prev,
                          homeAddress: location.address,
                          homeLat: location.lat,
                          homeLng: location.lng,
                        }));
                      }}
                    />
                    {currentClass.homeLat && currentClass.homeLng && (
                      <div className="mt-3">
                        <ClassMap 
                          lat={currentClass.homeLat} 
                          lng={currentClass.homeLng} 
                          enableFlyTo={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-gradient-to-r from-[var(--yellow)]/10 to-transparent rounded-xl p-6 border border-[var(--yellow)]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[var(--yellow)] rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#4a4a4a]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#4a4a4a]">Class Schedule</h3>
                    <p className="text-sm text-[#6a6a6a]">When does this class meet?</p>
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="text-[#4a4a4a] font-medium mb-2 block">Days of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={currentClass.schedule.days.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <Label htmlFor={day} className="text-sm text-[#4a4a4a]">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#4a4a4a] font-medium">Start Time</Label>
                    <Input
                      type="time"
                      value={currentClass.schedule.startTime}
                      onChange={(e) => setCurrentClass(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, startTime: e.target.value }
                      }))}
                      className="mt-2 bg-white border-[#d4d4aa]/30"
                    />
                  </div>
                  <div>
                    <Label className="text-[#4a4a4a] font-medium">End Time</Label>
                    <Input
                      type="time"
                      value={currentClass.schedule.endTime}
                      onChange={(e) => setCurrentClass(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, endTime: e.target.value }
                      }))}
                      className="mt-2 bg-white border-[#d4d4aa]/30"
                    />
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  🎯 <strong>How it works:</strong> The app uses your location data to verify attendance. 
                  If you&apos;re not at the class address during class time, you&apos;ll lose your bet amount. 
                  If you attend, you keep your money. No deductions for showing up!
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowInsertModal(false)}
                  className="flex-1 border-[#d4d4aa]/30 text-[#4a4a4a]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addClass}
                  className="flex-1 bg-[var(--accent)] text-white"
                  disabled={
                    !currentClass.name ||
                    !currentClass.address ||
                    !currentClass.homeAddress ||
                    currentClass.lat == null ||
                    currentClass.lng == null ||
                    currentClass.homeLat == null ||
                    currentClass.homeLng == null ||
                    currentClass.schedule.days.length === 0 ||
                    currentClass.lossAmount === 0
                  }
                >
                  Add Class - ${currentClass.lossAmount}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classes Overview Modal */}
      {showClassesOverview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#4a4a4a]">Classes Overview</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClassesOverview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Classes Yet</h3>
                  <p className="text-gray-500 mb-6">Start by adding your first class to track attendance</p>
                  <Button
                    onClick={() => {
                      setShowClassesOverview(false);
                      setShowInsertModal(true);
                    }}
                    className="bg-[var(--accent)] text-white"
                  >
                    Add Your First Class
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-purple-600" />
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{classes.length}</div>
                          <div className="text-sm text-gray-600">Total Classes</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-green-600">${totalBetAmount}</div>
                          <TotalBankrollLabel />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{classes.reduce((sum, cls) => sum + cls.days.length, 0)}</div>
                          <div className="text-sm text-gray-600">Weekly Sessions</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Classes List */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">All Classes</h3>
                  <div className="space-y-3">
                    {classes.map((cls) => {
                      const isExpanded = expandedClassesInOverview.has(cls.id);
                      return (
                        <div key={cls.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Clickable Header */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleClassExpansionInOverview(cls.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">{cls.name}</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{cls.address}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{cls.days.join(", ")} • {cls.startTime} - {cls.endTime}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">${cls.betAmount || 0}</div>
                                  <div className="text-xs text-gray-600">bankroll</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-[var(--accent)]">${cls.lossAmount}</div>
                                  <div className="text-xs text-gray-600">for skipping</div>
                                </div>
                                <div className="text-gray-400">
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Content */}
                          {isExpanded && (
                            <div className="border-t border-[#d4d4aa]/20 bg-gradient-to-b from-[#f5f5dc]/10 to-transparent">
                              <div className="p-6 space-y-6">
                                {/* Map Preview */}
                                <div>
                                  <h4 className="text-sm font-semibold text-[#4a4a4a] mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location
                                  </h4>
                                  <ClassMap lat={cls.lat} lng={cls.lng} />
                                </div>

                                {/* Attendance Analytics */}
                                {(() => {
                                  const analytics = calculateClassAnalytics(cls);
                                  return (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <TrendingUp className="w-4 h-4 text-green-600" />
                                          <span className="text-sm font-medium text-green-800">Current Streak</span>
                                        </div>
                                        <div className="text-2xl font-bold text-green-700">{analytics.currentStreak} days</div>
                                        <div className="text-xs text-green-600">
                                          {analytics.currentStreak > 0 ? "Keep it going!" : "Start your streak!"}
                                        </div>
                                      </div>
                                      
                                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Zap className="w-4 h-4 text-blue-600" />
                                          <span className="text-sm font-medium text-blue-800">Total Attendance</span>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-700">{analytics.weekAttendance}</div>
                                        <div className="text-xs text-blue-600">
                                          {analytics.isPerfectWeek ? "Perfect attendance!" : `${analytics.weekAttendancePercent.toFixed(0)}% completion`}
                                        </div>
                                      </div>
                                      
                                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <DollarSign className="w-4 h-4 text-purple-600" />
                                          <span className="text-sm font-medium text-purple-800">Saved</span>
                                        </div>
                                        <div className="text-2xl font-bold text-purple-700">${analytics.totalSaved}</div>
                                        <div className="text-xs text-purple-600">This semester</div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Smart Insights */}
                                <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--yellow)]/10 p-4 rounded-lg border border-[var(--accent)]/20">
                                  <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="w-4 h-4 text-[var(--accent)]" />
                                    <h4 className="text-sm font-semibold text-[#4a4a4a]">Smart Insights</h4>
                                  </div>
                                  <div className="space-y-2 text-sm text-[#6a6a6a]">
                                    <div className="flex items-start gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                      <p>Your attendance rate is <span className="font-semibold text-green-600">92%</span> - above average!</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                      <p>Best performance on <span className="font-semibold">Tuesdays</span> - keep that momentum!</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <div className="w-2 h-2 bg-[var(--accent)] rounded-full mt-1.5"></div>
                                      <p>Next class in <span className="font-semibold">2 hours 15 mins</span> - you&apos;re on track!</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Check-in Component */}
                                <div className="mt-4">
                                  <CheckIn 
                                    classData={{
                                      id: cls.id,
                                      name: cls.name,
                                      lat: cls.lat,
                                      lng: cls.lng,
                                      startTime: cls.startTime,
                                      endTime: cls.endTime,
                                      days: cls.days
                                    }}
                                    onCheckInComplete={(result) => {
                                      console.log('Check-in completed:', result);
                                      // Here you could update UI or save to database
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#6a6a6a] transition-colors hover:text-[#4a4a4a]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Back
          </Link>
          <h1 className="text-4xl font-bold text-[#4a4a4a] mb-2">Your Betting Dashboard</h1>
          <p className="text-[#6a6a6a]">Manage your class bets and track your attendance</p>
        </div>

        {loading ? (
          <Card className="bg-white/80 border-[#d4d4aa]/30 text-center py-16">
            <CardContent>
              <div className="w-20 h-20 bg-[var(--accent)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-[#4a4a4a] mb-2">Loading Classes</h3>
              <p className="text-[#6a6a6a]">Fetching your betting setup...</p>
            </CardContent>
          </Card>
        ) : classes.length === 0 ? (
          <Card className="bg-white/80 border-[#d4d4aa]/30 text-center py-16">
            <CardContent>
              <div className="w-20 h-20 bg-[var(--accent)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-semibold text-[#4a4a4a] mb-2">No Classes Yet</h3>
              <p className="text-[#6a6a6a] mb-6">
                Click &quot;Insert Class&quot; to get started with your betting setup
              </p>
              <Button 
              onClick={() => setShowInsertModal(true)}
              className="bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 hover:scale-105 hover:shadow-lg transition-all duration-200 transform"
            >
                Insert Your First Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Bento Grid Overview */}
            <BentoGrid className="max-w-4xl mx-auto">
              {/* Active Classes - Top Left */}
              <BentoCard
                name="Active Classes"
                description={`${classes.length} classes scheduled this week`}
                className="col-span-3 md:col-span-2"
                background={
                  <BentoTileArtLayer gradient="from-purple-500/30 to-pink-500/30">
                    <CalendarBentoArt className="h-44 w-44 md:h-48 md:w-48" />
                  </BentoTileArtLayer>
                }
                Icon={Calendar}
                href="#"
                cta={`${classes.length} Classes`}
                onClick={() => setShowClassesOverview(true)}
              />
              
              {/* Total Bankroll - Top Right */}
              <BentoCard
                name="Total Bankroll"
                description={`Your current betting portfolio across ${classes.length} classes`}
                className="col-span-3 md:col-span-1"
                background={
                  <BentoTileArtLayer gradient="from-[var(--accent)]/30 to-[var(--yellow)]/30">
                    <BankrollBentoArt className="h-40 w-40 md:h-44 md:w-44" />
                  </BentoTileArtLayer>
                }
                Icon={DollarSign}
                href="#"
                cta={`$${totalBetAmount} Total`}
                info={TOTAL_BANKROLL_HELP}
              />
              
              {/* Insert Class - Bottom Left */}
              <BentoCard
                name="Insert Class"
                description="Add a new class to your betting portfolio"
                className="col-span-3 md:col-span-1"
                background={
                  <BentoTileArtLayer gradient="from-green-500/30 to-emerald-500/30">
                    <InsertClassBentoArt className="h-40 w-40 md:h-44 md:w-44" />
                  </BentoTileArtLayer>
                }
                Icon={Plus}
                href="#"
                cta="Add New"
                onClick={() => setShowInsertModal(true)}
              />
              
              {/* View AI Report - Bottom Right */}
              <BentoCard
                name="View AI Report"
                description="Get insights and analytics on your attendance patterns"
                className="col-span-3 md:col-span-2"
                background={
                  <BentoTileArtLayer gradient="from-blue-500/30 to-cyan-500/30">
                    <AnalyticsBentoArt className="h-44 w-44 md:h-52 md:w-52" />
                  </BentoTileArtLayer>
                }
                Icon={BarChart3}
                href="#"
                cta="View Analytics"
                onClick={() => setShowAIReport(true)}
              />
            </BentoGrid>

            {/* Finalize Button */}
            {classes.length > 0 && (
              <Card className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--yellow)]/10 border-[var(--accent)]/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-[#4a4a4a] mb-2">Ready to Start Betting?</h3>
                  <p className="text-[#6a6a6a] mb-4">
                    Initial bankroll: <span className="font-bold text-[var(--accent)]">${totalBetAmount}</span>
                    {" • "}
                    Max weekly loss: <span className="font-bold text-[var(--yellow)]">${totalPotentialLoss}</span>
                  </p>
                  <Button onClick={finalizeBets} className="bg-[var(--accent)] text-white px-8 hover:bg-[var(--accent)]/90 hover:scale-105 hover:shadow-xl transition-all duration-200 transform">
                    Activate Betting
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* AI Report Modal */}
            {showAIReport && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">AI Analytics Report</h2>
                      <p className="text-sm text-gray-600 mt-1">Smart insights for each of your classes</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowAIReport(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-6 space-y-6">
                    {classes.map((cls) => {
                      const analytics = calculateClassAnalytics(cls);
                      const attendanceRate = analytics.weekAttendancePercent;
                      const missRate = 100 - attendanceRate;
                      const potentialSavings = cls.lossAmount * parseInt(analytics.weekAttendance.split('/')[0]);
                      const potentialLosses = cls.lossAmount * parseInt(analytics.weekAttendance.split('/')[1]) - potentialSavings;

                      return (
                        <div key={cls.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                              <p className="text-sm text-gray-600">{cls.address}</p>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {attendanceRate.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-600">Attendance Rate</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Weekly Performance</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{analytics.weekAttendance}</div>
                              <div className="text-xs text-gray-600">
                                {analytics.isPerfectWeek ? "Perfect attendance!" : `${attendanceRate.toFixed(0)}% completion`}
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Current Streak</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{analytics.currentStreak} days</div>
                              <div className="text-xs text-gray-600">
                                {analytics.currentStreak >= 5 ? "Excellent!" : analytics.currentStreak >= 3 ? "Good progress" : "Keep going!"}
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Saved This Week</span>
                              </div>
                              <div className="text-lg font-bold text-green-600">${potentialSavings}</div>
                              <div className="text-xs text-gray-600">From attended classes</div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-gray-700">Risk Analysis</span>
                              </div>
                              <div className="text-lg font-bold text-red-600">${potentialLosses}</div>
                              <div className="text-xs text-gray-600">Potential losses if missed</div>
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="h-5 w-5 text-yellow-600" />
                              <span className="text-sm font-medium text-gray-700">AI Recommendation</span>
                            </div>
                            <div className="text-sm text-gray-700">
                              {(() => {
                                const className = cls.name.toLowerCase();
                                const daysOfWeek = cls.days?.length || 1;
                                const timeOfDay = cls.startTime?.toLowerCase().includes('am') ? 'morning' : 'afternoon';
                                
                                if (attendanceRate >= 90) {
                                  if (timeOfDay === 'morning') {
                                    return `🌅 Early bird champion! You're mastering ${cls.name} and saving $${cls.lossAmount} per class. Your morning discipline is paying off literally!`;
                                  } else if (className.includes('math') || className.includes('calc')) {
                                    return `🧮 Math whiz! You're calculating your success perfectly in ${cls.name}. Every class attended = $${cls.lossAmount} in your pocket. Keep solving those problems!`;
                                  } else if (className.includes('science') || className.includes('bio') || className.includes('chem')) {
                                    return `🔬 Lab superstar! Your ${cls.name} attendance is experimentally perfect. You're proving your worth $${cls.lossAmount} at a time!`;
                                  } else if (className.includes('english') || className.includes('writing')) {
                                    return `📚 Wordsmith warrior! Your ${cls.name} performance is poetry in motion. Every class you attend writes another $${cls.lossAmount} success story!`;
                                  } else if (className.includes('history') || className.includes('social')) {
                                    return `📜 History maker! You're creating your legacy in ${cls.name}. Each class attended preserves $${cls.lossAmount} of your future!`;
                                  } else {
                                    return `🔥 ${cls.name} master! You're absolutely crushing it and banking $${cls.lossAmount} per class. Your consistency is your superpower!`;
                                  }
                                } else if (attendanceRate >= 70) {
                                  if (daysOfWeek >= 4) {
                                    return `💪 ${cls.name} warrior! With ${daysOfWeek} classes weekly, you're building discipline. Imagine the extra $${potentialLosses} you could keep by perfect attendance!`;
                                  } else if (timeOfDay === 'morning') {
                                    return `⏰ Morning hustler! Your ${cls.name} game is strong. That ${daysOfWeek}x/week routine could earn you an extra $${potentialLosses} - don't hit snooze on your cash!`;
                                  } else {
                                    return `📈 Solid progress in ${cls.name}! You're saving $${potentialSavings} but leaving $${potentialLosses} on the table. Your future self will thank you for showing up!`;
                                  }
                                } else if (attendanceRate >= 50) {
                                  if (className.includes('gym') || className.includes('pe')) {
                                    return `💪 Fitness focus! Every ${cls.name} session you skip is like paying for a gym membership you don't use. Stop wasting $${cls.lossAmount} and get your workout in!`;
                                  } else if (timeOfDay === 'morning') {
                                    return `☕ Coffee money! That $${cls.lossAmount} you lose by skipping ${cls.name} could buy you fancy coffee for a week. Wake up and claim your cash instead!`;
                                  } else if (daysOfWeek === 1) {
                                    return `🎯 One shot! You only have ${cls.name} once a week - missing it costs you $${cls.lossAmount} for 7 days! Make it count and get your money!`;
                                  } else {
                                    return `⚡ Money leak detected! Each ${cls.name} absence drains $${cls.lossAmount} from your wallet. That's ${potentialLosses} weekly you're giving away for free!`;
                                  }
                                } else {
                                  if (className.includes('math') || className.includes('calc')) {
                                    return `🚨 Calculate this loss! You're failing ${cls.name} attendance and losing $${cls.lossAmount} each time. That's ${potentialLosses} weekly - enough for a new calculator!`;
                                  } else if (className.includes('science') || className.includes('lab')) {
                                    return `🔬 Failed experiment! Your ${cls.name} attendance hypothesis is wrong. Each miss costs $${cls.lossAmount} - that's ${potentialLosses} weekly burning a hole in your lab coat!`;
                                  } else if (timeOfDay === 'morning') {
                                    return `⏰ Alarm clock betrayal! You're paying $${cls.lossAmount} to sleep through ${cls.name}. That alarm isn't just waking you up - it's calling you to collect your money!`;
                                  } else if (daysOfWeek >= 3) {
                                    return `📅 Calendar catastrophe! With ${daysOfWeek} ${cls.name} classes weekly, you're scheduling failure. Each missed class is $${cls.lossAmount} you're literally throwing away!`;
                                  } else {
                                    return `💸 Wallet evacuation! Your ${cls.name} attendance is draining $${potentialLosses} weekly. Every class you skip is like setting $${cls.lossAmount} on fire. Stop burning your money!`;
                                  }
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
