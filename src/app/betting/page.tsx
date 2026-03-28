"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SiteHeader } from "@/components/marketing/site-header";
import { AddressSearch } from "@/components/AddressSearch";
import { ClassMap } from "@/components/ClassMap";
import { createClassObject } from "@/lib/classes";
import type { ClassRecord } from "@/lib/classes";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, signIn, signUp } from "@/lib/auth";
import { Auth } from "@/components/Auth";
import { X, Plus, MapPin, Clock, DollarSign, Home, ChevronDown, ChevronUp, TrendingUp, AlertCircle, Target, Zap } from "lucide-react";

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
  lossAmount: number;
}

export default function Betting() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [totalBetAmount] = useState(0); // Initial bankroll
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentClass, setCurrentClass] = useState<ClassDraft>({
    name: "",
    address: "",
    homeAddress: "",
    schedule: {
      days: [],
      startTime: "",
      endTime: ""
    },
    lossAmount: 0
  });

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
  };

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

  const toggleClassExpansion = (classId: string) => {
    setExpandedClasses(prev => {
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
      currentClass.lossAmount > 0
    ) {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Insert class into Supabase
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
            loss_amount: currentClass.lossAmount,
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
      <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuth={checkAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      <SiteHeader />
      
      {/* Insert Class Button */}
      <div className="fixed top-20 right-6 z-40">
        <Button
          onClick={() => setShowInsertModal(true)}
          className="bg-[var(--accent)] text-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Insert Class
        </Button>
      </div>

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
              <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--yellow)]/10 rounded-xl p-6 border border-[var(--accent)]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
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
                className="bg-[var(--accent)] text-white"
              >
                Insert Your First Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/80 border-[#d4d4aa]/30">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-[var(--accent)]">${totalBetAmount}</div>
                  <div className="text-sm text-[#6a6a6a]">Initial Bankroll</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-[#d4d4aa]/30">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-[var(--yellow)]">${totalPotentialLoss}</div>
                  <div className="text-sm text-[#6a6a6a]">Max Loss per Week</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 border-[#d4d4aa]/30">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-600">0%</div>
                  <div className="text-sm text-[#6a6a6a]">Attendance Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Classes List */}
            <div className="space-y-4">
              {classes.map((cls) => (
                <Card key={cls.id} className="bg-white/80 border-[#d4d4aa]/30 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Main Class Info - Clickable Header */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-[#f5f5dc]/20 transition-colors"
                      onClick={() => toggleClassExpansion(cls.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-[#4a4a4a]">{cls.name}</h3>
                            <div className="flex items-center gap-1 text-xs px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full">
                              <Target className="w-3 h-3" />
                              Active
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[#6a6a]">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {cls.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {cls.days.join(", ")} • {cls.startTime}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[var(--accent)]">${cls.lossAmount}</div>
                            <div className="text-sm text-[#6a6a6a]">per absence</div>
                          </div>
                          <div className="text-[#6a6a6a]">
                            {expandedClasses.has(cls.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Content */}
                    {expandedClasses.has(cls.id) && (
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
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Current Streak</span>
                              </div>
                              <div className="text-2xl font-bold text-green-700">5 days</div>
                              <div className="text-xs text-green-600">Keep it going!</div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">This Week</span>
                              </div>
                              <div className="text-2xl font-bold text-blue-700">4/4</div>
                              <div className="text-xs text-blue-600">Perfect attendance</div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">Saved</span>
                              </div>
                              <div className="text-2xl font-bold text-purple-700">${cls.lossAmount * 4}</div>
                              <div className="text-xs text-purple-600">This week</div>
                            </div>
                          </div>

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
                                <p>Next class in <span className="font-semibold">2 hours 15 mins</span> - you're on track!</p>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-3">
                            <Button className="flex-1 bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90">
                              Check In Now
                            </Button>
                            <Button variant="outline" className="border-[#d4d4aa]/30 text-[#4a4a4a]">
                              View History
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

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
                  <Button onClick={finalizeBets} className="bg-[var(--accent)] text-white px-8">
                    Activate Betting
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
