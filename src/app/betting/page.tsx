"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SiteHeader } from "@/components/marketing/site-header";
import { X, Plus, MapPin, Clock, DollarSign, Home } from "lucide-react";

interface ClassInfo {
  name: string;
  classAddress: string;
  homeAddress: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  lossAmount: number; // Amount lost per missed class
}

export default function Betting() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [totalBetAmount, setTotalBetAmount] = useState(0); // Initial bankroll
  const [betAmountInput, setBetAmountInput] = useState(""); // For input field
  const [currentClass, setCurrentClass] = useState<ClassInfo>({
    name: "",
    classAddress: "",
    homeAddress: "",
    schedule: {
      days: [],
      startTime: "",
      endTime: ""
    },
    lossAmount: 0
  });

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  const addClass = () => {
    if (currentClass.name && currentClass.classAddress && currentClass.homeAddress && 
        currentClass.schedule.days.length > 0 && currentClass.lossAmount > 0) {
      setClasses([...classes, currentClass]);
      setCurrentClass({
        name: "",
        classAddress: "",
        homeAddress: "",
        schedule: {
          days: [],
          startTime: "",
          endTime: ""
        },
        lossAmount: 0
      });
      setShowInsertModal(false);
    }
  };

  const totalPotentialLoss = classes.reduce((sum, cls) => sum + cls.lossAmount, 0);

  const finalizeBets = () => {
    console.log("Final bets:", { totalBetAmount, classes });
    alert(`Betting setup complete! Initial bankroll: $${totalBetAmount}, Potential loss per class: $${totalPotentialLoss}`);
  };

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
                  <Input
                    value={currentClass.classAddress}
                    onChange={(e) => setCurrentClass(prev => ({ ...prev, classAddress: e.target.value }))}
                    placeholder="e.g., 123 Tech Building, Room 101"
                    className="mt-2 bg-white border-[#d4d4aa]/30"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-[#4a4a4a] font-medium">
                    <Home className="w-4 h-4" />
                    Your Home Address
                  </Label>
                  <Input
                    value={currentClass.homeAddress}
                    onChange={(e) => setCurrentClass(prev => ({ ...prev, homeAddress: e.target.value }))}
                    placeholder="e.g., 456 Campus Dorm, Room 202"
                    className="mt-2 bg-white border-[#d4d4aa]/30"
                  />
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
                  If you're not at the class address during class time, you'll lose your bet amount. 
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
                  disabled={!currentClass.name || !currentClass.classAddress || !currentClass.homeAddress || 
                           currentClass.schedule.days.length === 0 || currentClass.lossAmount === 0}
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

        {classes.length === 0 ? (
          <Card className="bg-white/80 border-[#d4d4aa]/30 text-center py-16">
            <CardContent>
              <div className="w-20 h-20 bg-[var(--accent)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-semibold text-[#4a4a4a] mb-2">No Classes Yet</h3>
              <p className="text-[#6a6a6a] mb-6">Click "Insert Class" to get started with your betting setup</p>
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
              {classes.map((cls, index) => (
                <Card key={index} className="bg-white/80 border-[#d4d4aa]/30">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-[#4a4a4a]">{cls.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-[#6a6a6a]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {cls.classAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {cls.schedule.days.join(", ")} • {cls.schedule.startTime}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[var(--accent)]">${cls.lossAmount}</div>
                        <div className="text-sm text-[#6a6a6a]">per absence</div>
                      </div>
                    </div>
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
