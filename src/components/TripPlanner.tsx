'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Users, DollarSign, Plane, 
  Coffee, Camera, Music, Palmtree, Building,
  ChevronRight, ChevronLeft, Sparkles, RotateCcw,
  Save, Download, Trash2, Clock, Star, Check
} from 'lucide-react';

interface TripStop {
  destination: string;
  startDate: string;
  endDate: string;
}

interface TripPreferences {
  interests: string[];
  budget: 'budget' | 'moderate' | 'luxury';
  travelers: number;
  travelStyle: string;
}

interface DayPlan {
  day: number;
  location: string;
  activities: string[];
  meals: string[];
  tips: string;
  estimatedCost: number;
}

interface TripPlan {
  id: string;
  name: string;
  stops: TripStop[];
  preferences: TripPreferences;
  itinerary: DayPlan[];
  totalBudget: number;
  createdAt: string;
}

const INTERESTS = [
  { id: 'culture', label: 'Culture & History', icon: Building },
  { id: 'food', label: 'Food & Dining', icon: Coffee },
  { id: 'nature', label: 'Nature & Outdoors', icon: Palmtree },
  { id: 'adventure', label: 'Adventure', icon: MapPin },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
  { id: 'photography', label: 'Photography', icon: Camera },
];

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'Budget', desc: '$50-100/day', color: 'emerald' },
  { id: 'moderate', label: 'Moderate', desc: '$100-250/day', color: 'amber' },
  { id: 'luxury', label: 'Luxury', desc: '$250+/day', color: 'violet' },
];

export function TripPlanner() {
  const [currentStep, setCurrentStep] = useState(1);
  const [tripStops, setTripStops] = useState<TripStop[]>([
    { destination: '', startDate: '', endDate: '' }
  ]);
  const [preferences, setPreferences] = useState<TripPreferences>({
    interests: [],
    budget: 'moderate',
    travelers: 2,
    travelStyle: 'balanced',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('saved_trips');
    if (saved) setSavedTrips(JSON.parse(saved));
  }, []);

  const addStop = () => {
    setTripStops([...tripStops, { destination: '', startDate: '', endDate: '' }]);
  };

  const removeStop = (index: number) => {
    if (tripStops.length > 1) {
      setTripStops(tripStops.filter((_, i) => i !== index));
    }
  };

  const updateStop = (index: number, field: keyof TripStop, value: string) => {
    const updated = [...tripStops];
    updated[index] = { ...updated[index], [field]: value };
    setTripStops(updated);
  };

  const toggleInterest = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const generateTrip = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/trip-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stops: tripStops, preferences }),
      });
      const data = await response.json();
      if (data.itinerary) {
        setTripPlan({
          id: Date.now().toString(),
          name: `${tripStops[0]?.destination || 'My Trip'} Adventure`,
          stops: tripStops,
          preferences,
          itinerary: data.itinerary,
          totalBudget: data.totalBudget,
          createdAt: new Date().toISOString(),
        });
        setCurrentStep(5);
      }
    } catch (error) {
      console.error('Failed to generate trip:', error);
    }
    setIsGenerating(false);
  };

  const saveTrip = () => {
    if (tripPlan) {
      const updated = [tripPlan, ...savedTrips].slice(0, 10);
      setSavedTrips(updated);
      localStorage.setItem('saved_trips', JSON.stringify(updated));
    }
  };

  const loadTrip = (trip: TripPlan) => {
    setTripPlan(trip);
    setTripStops(trip.stops);
    setPreferences(trip.preferences);
    setCurrentStep(5);
    setShowSaved(false);
  };

  const deleteTrip = (id: string) => {
    const updated = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updated);
    localStorage.setItem('saved_trips', JSON.stringify(updated));
  };

  const resetPlanner = () => {
    setTripPlan(null);
    setTripStops([{ destination: '', startDate: '', endDate: '' }]);
    setPreferences({ interests: [], budget: 'moderate', travelers: 2, travelStyle: 'balanced' });
    setCurrentStep(1);
  };

  const getTotalDays = () => {
    return tripStops.reduce((total, stop) => {
      if (stop.startDate && stop.endDate) {
        const start = new Date(stop.startDate);
        const end = new Date(stop.endDate);
        return total + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
      return total + 3;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">AI Trip Planner</h2>
            <p className="text-xs text-slate-400">Plan your perfect trip</p>
          </div>
        </div>
        <button
          onClick={() => setShowSaved(!showSaved)}
          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
        >
          <Save className="w-3 h-3" />
          {savedTrips.length} Saved
        </button>
      </div>

      {/* Saved Trips Modal */}
      {showSaved && savedTrips.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 space-y-3 animate-fade-in">
          <h3 className="text-sm font-bold text-white">Saved Trips</h3>
          {savedTrips.map(trip => (
            <div key={trip.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">{trip.name}</p>
                <p className="text-xs text-slate-400">{trip.stops.map(s => s.destination).join(' → ')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => loadTrip(trip)} className="text-xs text-violet-400 hover:text-violet-300">Load</button>
                <button onClick={() => deleteTrip(trip.id)} className="text-xs text-rose-400 hover:text-rose-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Steps */}
      {currentStep < 5 && (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= step 
                  ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white' 
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 rounded-full transition-all ${
                  currentStep > step ? 'bg-violet-500' : 'bg-slate-800'
                }`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Destinations */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-400" />
            Where are you going?
          </h3>
          {tripStops.map((stop, index) => (
            <div key={index} className="glass-panel rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400">Stop {index + 1}</span>
                {tripStops.length > 1 && (
                  <button onClick={() => removeStop(index)} className="text-rose-400 hover:text-rose-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={stop.destination}
                onChange={(e) => updateStop(index, 'destination', e.target.value)}
                placeholder="City or country..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">From</label>
                  <input
                    type="date"
                    value={stop.startDate}
                    onChange={(e) => updateStop(index, 'startDate', e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">To</label>
                  <input
                    type="date"
                    value={stop.endDate}
                    onChange={(e) => updateStop(index, 'endDate', e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-white mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addStop}
            className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-sm text-slate-400 hover:text-violet-400 hover:border-violet-500/50 transition-all flex items-center justify-center gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            Add Another Stop
          </button>
        </div>
      )}

      {/* Step 2: Interests */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-violet-400" />
            What are you into?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {INTERESTS.map(interest => {
              const Icon = interest.icon;
              const isSelected = preferences.interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? 'bg-violet-500/20 border-violet-500/50 text-white'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-400' : ''}`} />
                  <span className="text-xs font-medium">{interest.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Budget & Style */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-violet-400" />
            Budget & Travel Style
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase">Budget Level</label>
            <div className="grid grid-cols-3 gap-2">
              {BUDGET_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => setPreferences(prev => ({ ...prev, budget: option.id as any }))}
                  className={`p-4 rounded-2xl border transition-all ${
                    preferences.budget === option.id
                      ? option.id === 'budget' ? 'bg-emerald-500/20 border-emerald-500/50'
                        : option.id === 'moderate' ? 'bg-amber-500/20 border-amber-500/50'
                        : 'bg-violet-500/20 border-violet-500/50'
                      : 'bg-slate-800/30 border-slate-700/50'
                  }`}
                >
                  <p className="text-sm font-bold text-white">{option.label}</p>
                  <p className="text-xs text-slate-400">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase">Travelers</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPreferences(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                className="w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700"
              >
                -
              </button>
              <span className="text-2xl font-bold text-white">{preferences.travelers}</span>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, travelers: Math.min(10, prev.travelers + 1) }))}
                className="w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700"
              >
                +
              </button>
              <span className="text-sm text-slate-400 ml-2">
                {preferences.travelers === 1 ? 'Traveler' : 'Travelers'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Summary & Generate */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Ready to Plan!
          </h3>
          
          <div className="glass-panel rounded-2xl p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase mb-2">Destinations</p>
              <div className="space-y-2">
                {tripStops.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-violet-400" />
                    <span className="text-white">{stop.destination || 'TBD'}</span>
                    {stop.startDate && (
                      <span className="text-slate-500">
                        {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-500 uppercase mb-2">Preferences</p>
              <div className="flex flex-wrap gap-2">
                {preferences.interests.map(id => {
                  const interest = INTERESTS.find(i => i.id === id);
                  return interest ? (
                    <span key={id} className="px-3 py-1 bg-violet-500/20 rounded-full text-xs text-violet-300">
                      {interest.label}
                    </span>
                  ) : null;
                })}
                <span className="px-3 py-1 bg-amber-500/20 rounded-full text-xs text-amber-300">
                  {BUDGET_OPTIONS.find(b => b.id === preferences.budget)?.label}
                </span>
                <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
                  {preferences.travelers} {preferences.travelers === 1 ? 'traveler' : 'travelers'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <p className="text-xs text-slate-500 uppercase">Estimated Duration</p>
              <p className="text-lg font-bold text-white">{getTotalDays()} days</p>
            </div>
          </div>

          <button
            onClick={generateTrip}
            disabled={isGenerating || !tripStops[0]?.destination}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating your trip...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Trip Plan
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 5: Trip Plan Result */}
      {currentStep === 5 && tripPlan && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">{tripPlan.name}</h3>
            <div className="flex gap-2">
              <button onClick={saveTrip} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                <Save className="w-4 h-4" />
                Save
              </button>
              <button onClick={resetPlanner} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                New Trip
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Estimated Budget</p>
                <p className="text-2xl font-bold text-white">${tripPlan.totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase">Duration</p>
                <p className="text-lg font-bold text-white">{tripPlan.itinerary.length} days</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {tripPlan.itinerary.map((day, index) => (
              <div key={index} className="glass-panel rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-violet-400">D{day.day}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{day.location}</p>
                      <p className="text-xs text-slate-400">Day {day.day}</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400">${day.estimatedCost}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase">Activities</p>
                  <div className="space-y-1">
                    {day.activities.map((activity, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Clock className="w-3 h-3 text-violet-400 mt-1 shrink-0" />
                        <span className="text-slate-300">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase">Meals</p>
                  <div className="flex flex-wrap gap-2">
                    {day.meals.map((meal, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-slate-300">
                        {meal}
                      </span>
                    ))}
                  </div>
                </div>

                {day.tips && (
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Tip
                    </p>
                    <p className="text-xs text-slate-300 mt-1">{day.tips}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {currentStep > 1 && currentStep < 5 && (
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 py-3 bg-slate-800 rounded-xl text-sm font-medium text-white hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {currentStep < 4 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
