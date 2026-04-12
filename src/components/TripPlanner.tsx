'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Users, DollarSign, Plane, 
  Coffee, Camera, Palmtree, Building, Music,
  ChevronRight, ChevronLeft, Sparkles, RotateCcw,
  Save, Trash2, Clock, Check, Loader2, Map
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
  { id: 'culture', label: 'Culture', icon: Building, color: 'violet' },
  { id: 'food', label: 'Food & Dining', icon: Coffee, color: 'amber' },
  { id: 'nature', label: 'Nature', icon: Palmtree, color: 'emerald' },
  { id: 'adventure', label: 'Adventure', icon: MapPin, color: 'red' },
  { id: 'nightlife', label: 'Nightlife', icon: Music, color: 'pink' },
  { id: 'photography', label: 'Photo', icon: Camera, color: 'cyan' },
];

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'Budget', desc: '~$60/day', color: 'emerald' },
  { id: 'moderate', label: 'Moderate', desc: '~$120/day', color: 'amber' },
  { id: 'luxury', label: 'Luxury', desc: '~$250/day', color: 'violet' },
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
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState('');

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
    if (!tripStops[0]?.destination?.trim()) {
      setError('Please enter at least one destination');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/trip-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stops: tripStops, preferences }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.itinerary) {
        setTripPlan({
          id: Date.now().toString(),
          name: `${tripStops[0]?.destination} Trip`,
          stops: tripStops,
          preferences,
          itinerary: data.itinerary,
          totalBudget: data.totalBudget,
          createdAt: new Date().toISOString(),
        });
        setCurrentStep(5);
      }
    } catch (err) {
      setError('Failed to generate trip. Please try again.');
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
    setPreferences({ interests: [], budget: 'moderate', travelers: 2 });
    setCurrentStep(1);
    setError('');
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

  const canProceed = () => {
    if (currentStep === 1) return tripStops.some(s => s.destination.trim());
    if (currentStep === 2) return true;
    if (currentStep === 3) return true;
    return true;
  };

  return (
    <div className="space-y-6" data-testid="planner-container">
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

      {/* Saved Trips */}
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
                <button onClick={() => loadTrip(trip)} className="px-3 py-1 bg-violet-500/20 rounded-lg text-xs text-violet-400 hover:bg-violet-500/30">Load</button>
                <button onClick={() => deleteTrip(trip.id)} className="p-1 text-rose-400 hover:text-rose-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4].map((step, idx) => (
          <React.Fragment key={step}>
            <button
              onClick={() => step < currentStep && setCurrentStep(step)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= step 
                  ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white' 
                  : 'bg-slate-800 text-slate-500'
              } ${step < currentStep ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              {currentStep > step ? <Check className="w-4 h-4" /> : step}
            </button>
            {step < 4 && (
              <div className={`flex-1 h-1 rounded-full transition-all ${currentStep > step ? 'bg-violet-500' : 'bg-slate-800'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Destinations */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-400" />
            Where are you going?
          </h3>
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
              {error}
            </div>
          )}
          
          {tripStops.map((stop, index) => (
            <div key={index} className="glass-panel rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400">Stop {index + 1}</span>
                {tripStops.length > 1 && (
                  <button onClick={() => removeStop(index)} className="p-1 text-rose-400 hover:text-rose-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={stop.destination}
                data-testid="planner-destination"
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
            data-testid="planner-add-stop"
          >
            <MapPin className="w-4 h-4" />
            Add Another Stop
          </button>
        </div>
      )}

      {/* Step 2: Interests */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            What are you into?
          </h3>
          <div className="grid grid-cols-3 gap-2" data-testid="planner-interests">
            {INTERESTS.map(interest => {
              const Icon = interest.icon;
              const isSelected = preferences.interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? `bg-${interest.color}-500/20 border-${interest.color}-500/50 text-white`
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                  data-testid={`planner-interest-${interest.id}`}
                  style={isSelected ? {
                    backgroundColor: `var(--tw-${interest.color}-500, rgba(139, 92, 246, 0.2))`,
                    borderColor: `var(--tw-${interest.color}-500, rgba(139, 92, 246, 0.5))`
                  } : {}}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-400' : ''}`} />
                  <span className="text-xs font-medium">{interest.label}</span>
                </button>
              );
            })}
          </div>
          {preferences.interests.length === 0 && (
            <p className="text-xs text-slate-500 text-center">Select at least one interest for better recommendations</p>
          )}
        </div>
      )}

      {/* Step 3: Budget */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-violet-400" />
            Budget & Group Size
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setPreferences(prev => ({ ...prev, budget: option.id as any }))}
                className={`p-4 rounded-2xl border transition-all ${
                  preferences.budget === option.id
                    ? 'bg-violet-500/20 border-violet-500/50'
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}
              >
                <p className="text-sm font-bold text-white">{option.label}</p>
                <p className="text-xs text-slate-400">{option.desc}</p>
              </button>
            ))}
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <label className="text-xs text-slate-500 uppercase">Number of Travelers</label>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setPreferences(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                className="w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center"
              >
                -
              </button>
              <span className="text-2xl font-bold text-white w-12 text-center">{preferences.travelers}</span>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, travelers: Math.min(10, prev.travelers + 1) }))}
                className="w-10 h-10 rounded-xl bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Summary */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Check className="w-4 h-4 text-violet-400" />
            Ready to Go!
          </h3>
          
          <div className="glass-panel rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-400" />
              <span className="text-white">{tripStops.map(s => s.destination || 'TBD').join(' → ')}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {preferences.interests.map(id => {
                const interest = INTERESTS.find(i => i.id === id);
                return interest && (
                  <span key={id} className="px-3 py-1 bg-violet-500/20 rounded-full text-xs text-violet-300">
                    {interest.label}
                  </span>
                );
              })}
              <span className="px-3 py-1 bg-amber-500/20 rounded-full text-xs text-amber-300">
                {BUDGET_OPTIONS.find(b => b.id === preferences.budget)?.label}
              </span>
              <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
                {preferences.travelers} {preferences.travelers === 1 ? 'person' : 'people'}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-500">Estimated Duration</p>
                <p className="text-lg font-bold text-white">{getTotalDays()} days</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Est. Budget</p>
                <p className="text-lg font-bold text-white">
                  ${(getTotalDays() * preferences.travelers * (preferences.budget === 'luxury' ? 250 : preferences.budget === 'moderate' ? 120 : 60)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {currentStep === 5 && tripPlan && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">{tripPlan.name}</h3>
              <p className="text-xs text-slate-400">{tripPlan.itinerary.length} days • ${tripPlan.totalBudget.toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={saveTrip} className="px-3 py-1 bg-violet-500/20 rounded-lg text-xs text-violet-400 hover:bg-violet-500/30">
                <Save className="w-3 h-3 inline mr-1" />
                Save
              </button>
              <button onClick={resetPlanner} className="px-3 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-400 hover:text-white">
                <RotateCcw className="w-3 h-3 inline mr-1" />
                New
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {tripPlan.itinerary.map((day) => (
              <div key={day.day} className="glass-panel rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-400">D{day.day}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{day.location}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-400">${day.estimatedCost}</span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase">Activities</p>
                  <div className="space-y-1">
                    {day.activities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <Clock className="w-3 h-3 text-violet-400 shrink-0" />
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase">Meals</p>
                  <div className="flex gap-2 flex-wrap">
                    {day.meals.map((meal, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800/50 rounded-lg text-xs text-slate-300">
                        {meal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <p className="text-xs text-amber-400">💡 {day.tips}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 py-3 bg-slate-800 rounded-xl text-sm font-medium text-white hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}
        
        {currentStep < 4 && (
          <button
            data-testid="planner-next"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        
        {currentStep === 4 && (
          <button
            data-testid="planner-generate"
            onClick={generateTrip}
            disabled={isGenerating}
            className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Trip
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
