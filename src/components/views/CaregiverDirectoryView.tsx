import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import { CaregiverProfile } from '../../types/platform.ts';

export const CaregiverDirectoryView: React.FC = () => {
  const [state, setState] = useState(platformStore.getState());
  const { caregivers, caregiverReviews } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverProfile | null>(null);
  
  // Booking Modal State
  const [bookingModalCaregiver, setBookingModalCaregiver] = useState<CaregiverProfile | null>(null);
  const [bookingHours, setBookingHours] = useState<number>(4);
  const [bookingAddress, setBookingAddress] = useState('B-402, Green Park Main, New Delhi');
  const [bookingDate, setBookingDate] = useState('Tomorrow, 09:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review Modal State
  const [reviewModalCaregiver, setReviewModalCaregiver] = useState<CaregiverProfile | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewCategory, setReviewCategory] = useState('Elderly Assistance');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Listen to store updates
  React.useEffect(() => {
    return platformStore.subscribe(() => {
      setState(platformStore.getState());
    });
  }, []);

  const categories = [
    'All',
    'Elderly Assistance',
    'Post-Surgical Care',
    'Wound Care & Dressing',
    'Mobility & Rehab',
    'Bedridden Care',
    'Vital Monitoring'
  ];

  const filteredCaregivers = caregivers.filter(cg => {
    const matchesSearch =
      cg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cg.qualifications.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cg.serviceAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cg.servicesProvided.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      cg.categories.some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalCaregiver) return;
    platformStore.bookCaregiver(bookingModalCaregiver.id, bookingHours, bookingAddress, bookingDate);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModalCaregiver(null);
    }, 1800);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalCaregiver || !reviewComment.trim()) return;
    platformStore.addCaregiverReview(reviewModalCaregiver.id, reviewRating, reviewComment, reviewCategory);
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setReviewModalCaregiver(null);
      setReviewComment('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Mission */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider text-teal-800 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Verified Healthcare Attendants & Nurses
              </span>
              <span className="text-xs text-slate-500">Delhi NCR Service Grid</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Caregiver & Home Nursing Directory
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Background-checked nurses, GDA certified attendants, and physiotherapists with verified clinical scope limits.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{caregivers.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Active Attendants</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-700">100%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Identity Verified</div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by attendant name, locality (Saket, Dwarka, Noida), or skill (catheter, wound dressing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-medium px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Caregiver Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCaregivers.map((cg) => {
          const reviews = caregiverReviews.filter(r => r.caregiverId === cg.id && !r.isFlagged);
          return (
            <div
              key={cg.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between hover:border-slate-300 transition-shadow shadow-xs"
            >
              <div>
                {/* Header row: Avatar, Name, Verification, Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={cg.avatarUrl}
                      alt={cg.name}
                      className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{cg.name}</h3>
                        {cg.isVerified && (
                          <span className="inline-flex items-center text-xs font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-700" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        {cg.qualifications} · {cg.experienceYears} Years Exp
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{cg.serviceAreas.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 text-amber-800 font-bold text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{cg.rating}</span>
                      <span className="text-xs text-slate-500 font-normal">({cg.completedBookingsCount})</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                      ₹{cg.hourlyRate}<span className="text-xs font-normal text-slate-500">/hr</span>
                    </div>
                  </div>
                </div>

                {/* About & Languages */}
                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {cg.about}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Languages:</span>
                  <span>{cg.languages.join(', ')}</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-slate-700">Available:</span>
                  <span className="text-emerald-700 font-medium">{cg.availability}</span>
                </div>

                {/* Clinical Scope Boundaries: Permitted vs Not Permitted */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-emerald-900 mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Permitted Scope
                    </div>
                    <ul className="space-y-0.5 text-slate-600">
                      {cg.servicesProvided.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="truncate">• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-semibold text-rose-900 mb-1.5 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Strictly Out of Scope
                    </div>
                    <ul className="space-y-0.5 text-slate-500">
                      {cg.servicesNotProvided.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="truncate">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recent Verified Reviews summary */}
                {reviews.length > 0 && (
                  <div className="mt-3 bg-slate-50 p-2.5 rounded border border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between text-slate-700 font-medium mb-1">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-teal-700" />
                        Patient Feedback ({reviews.length})
                      </span>
                      <span className="text-[11px] text-slate-500">Latest: {reviews[0].patientName} ({reviews[0].rating}★)</span>
                    </div>
                    <p className="italic text-slate-600 text-[11px] line-clamp-1">
                      "{reviews[0].reviewText}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalCaregiver(cg)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5 text-slate-400" />
                  Leave Review
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCaregiver(cg)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingModalCaregiver(cg)}
                    className="px-4 py-1.5 bg-teal-800 text-white text-xs font-semibold rounded hover:bg-teal-900 transition-colors shadow-xs"
                  >
                    Book Visit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {bookingModalCaregiver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Booking Confirmed!</h3>
                <p className="text-xs text-slate-600">
                  {bookingModalCaregiver.name} has been notified and will arrive at your address on {bookingDate}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Book Caregiver Visit</h3>
                    <p className="text-xs text-slate-500">Service: {bookingModalCaregiver.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingModalCaregiver(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration Needed (Hours)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 4, 8, 12].map(hr => (
                      <button
                        key={hr}
                        type="button"
                        onClick={() => setBookingHours(hr)}
                        className={`py-1.5 text-xs font-medium rounded border ${
                          bookingHours === hr
                            ? 'bg-teal-800 text-white border-teal-800'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {hr} hrs
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Date & Arrival Time
                  </label>
                  <input
                    type="text"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none"
                    placeholder="e.g. Tomorrow, 09:00 AM"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Address in Delhi NCR
                  </label>
                  <input
                    type="text"
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none"
                    placeholder="Complete house address with landmark"
                    required
                  />
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Hourly Rate:</span>
                    <span>₹{bookingModalCaregiver.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Hours:</span>
                    <span>{bookingHours} hrs</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Service Fee:</span>
                    <span className="text-teal-900 font-bold">₹{bookingModalCaregiver.hourlyRate * bookingHours}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalCaregiver(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-800 text-white text-xs font-semibold rounded hover:bg-teal-900"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalCaregiver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            {reviewSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Review Submitted!</h3>
                <p className="text-xs text-slate-600">Thank you for helping verify quality of home care.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">Rate {reviewModalCaregiver.name}</h3>
                  <button
                    type="button"
                    onClick={() => setReviewModalCaregiver(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-medium text-slate-600 ml-2">
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Performed
                  </label>
                  <select
                    value={reviewCategory}
                    onChange={(e) => setReviewCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700"
                  >
                    <option value="Elderly Assistance">Elderly Assistance</option>
                    <option value="Post-Surgical Care">Post-Surgical Care</option>
                    <option value="Wound Care & Dressing">Wound Care & Dressing</option>
                    <option value="Mobility & Rehab">Mobility & Rehab</option>
                    <option value="Vital Monitoring">Vital Monitoring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Review
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share how punctual, gentle, and knowledgeable the caregiver was..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalCaregiver(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Caregiver Detail Drawer/Modal */}
      {selectedCaregiver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCaregiver.avatarUrl}
                  alt={selectedCaregiver.name}
                  className="w-16 h-16 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedCaregiver.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCaregiver.qualifications} · {selectedCaregiver.experienceYears} Years Clinical Exp</p>
                  <div className="flex items-center gap-1 text-amber-800 font-bold text-xs mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{selectedCaregiver.rating} ({selectedCaregiver.completedBookingsCount} completed assignments)</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaregiver(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">About Caregiver</h4>
                <p className="text-slate-600 leading-relaxed">{selectedCaregiver.about}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1.5">Permitted Services</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCaregiver.servicesProvided.map((s, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-rose-900 mb-1.5">Services Prohibited by Law/Scope</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCaregiver.servicesNotProvided.map((s, i) => (
                    <span key={i} className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
                      ✕ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Verified Patient Reviews</h4>
                <div className="space-y-2 mt-2">
                  {caregiverReviews
                    .filter(r => r.caregiverId === selectedCaregiver.id && !r.isFlagged)
                    .map(r => (
                      <div key={r.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-slate-800">{r.patientName}</span>
                          <span className="text-amber-800 font-bold">{r.rating}★ · {r.date}</span>
                        </div>
                        <p className="text-slate-600 italic">"{r.reviewText}"</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCaregiver(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedCaregiver;
                  setSelectedCaregiver(null);
                  setBookingModalCaregiver(target);
                }}
                className="px-4 py-2 bg-teal-800 text-white text-xs font-semibold rounded hover:bg-teal-900"
              >
                Proceed to Book Visit (₹{selectedCaregiver.hourlyRate}/hr)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
