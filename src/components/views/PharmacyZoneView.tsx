import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  MapPin,
  Clock,
  Truck,
  FileText,
  Building2,
  Check
} from 'lucide-react';
import { platformStore } from '../../services/platformStore.ts';
import { Medicine, Pharmacy, DigitalPrescription } from '../../types/platform.ts';

export const PharmacyZoneView: React.FC = () => {
  const [state, setState] = useState(platformStore.getState());
  const { pharmacies, medicines, cart, prescriptions, orders } = state;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [rxFilter, setRxFilter] = useState<'all' | 'rx_only' | 'otc_only'>('all');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('all');
  
  // Checkout Drawer
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Green Park Main, New Delhi 110016');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>(
    prescriptions.length > 0 ? prescriptions[0].id : ''
  );
  const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);

  React.useEffect(() => {
    return platformStore.subscribe(() => {
      setState(platformStore.getState());
    });
  }, []);

  const categories = [
    'All',
    'Analgesics',
    'Antibiotics',
    'Diabetes',
    'Cardiovascular',
    'Gastrointestinal',
    'Respiratory',
    'Vitamins',
    'First Aid'
  ];

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || med.category === selectedCategory;

    const matchesRx =
      rxFilter === 'all' ||
      (rxFilter === 'rx_only' && med.requiresPrescription) ||
      (rxFilter === 'otc_only' && !med.requiresPrescription);

    const matchesPharmacy =
      selectedPharmacyId === 'all' || med.pharmacyId === selectedPharmacyId;

    return matchesSearch && matchesCategory && matchesRx && matchesPharmacy;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const deliveryFee = 40;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartRequiresRx = cart.some(item => item.medicine.requiresPrescription);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (cartRequiresRx && !selectedPrescriptionId) {
      alert('Please attach an active digital prescription to order Rx medications.');
      return;
    }

    const order = platformStore.checkoutOrder(deliveryAddress, selectedPrescriptionId);
    setOrderPlacedId(order.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold tracking-wider text-teal-800 uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Authorized Delhi NCR Retail & Hospital Chemists
              </span>
              <span className="text-xs text-slate-500">Express 2-Hour Delivery</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Medicines & Pharmacy Center
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Dispensing 100% genuine pharmaceutical supplies with mandatory digital prescription validation for scheduled drugs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative px-4 py-2 bg-slate-900 text-white rounded font-medium text-xs flex items-center gap-2 hover:bg-slate-800 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart</span>
              {cartCount > 0 && (
                <span className="bg-teal-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search, Filter, and Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by brand name, salt / generic (Paracetamol, Metformin, Amoxicillin)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Rx Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded text-xs shrink-0">
            <button
              onClick={() => setRxFilter('all')}
              className={`px-3 py-1 rounded font-medium ${
                rxFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setRxFilter('otc_only')}
              className={`px-3 py-1 rounded font-medium ${
                rxFilter === 'otc_only' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              OTC Only
            </button>
            <button
              onClick={() => setRxFilter('rx_only')}
              className={`px-3 py-1 rounded font-medium ${
                rxFilter === 'rx_only' ? 'bg-white text-rose-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Rx Required
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap font-medium ${
                selectedCategory === cat
                  ? 'bg-teal-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Pharmacies Section (Horizontal scroll/grid) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">Partnered Dispensaries Near You (Delhi NCR)</h3>
          </div>
          <span className="text-xs text-slate-500">{pharmacies.length} active retail chemists</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pharmacies.slice(0, 4).map((pharm) => (
            <div
              key={pharm.id}
              onClick={() => setSelectedPharmacyId(selectedPharmacyId === pharm.id ? 'all' : pharm.id)}
              className={`p-3 rounded border text-xs cursor-pointer transition-colors ${
                selectedPharmacyId === pharm.id
                  ? 'border-teal-800 bg-teal-50/50 ring-1 ring-teal-800'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-bold text-slate-900">{pharm.name}</span>
                {pharm.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                )}
              </div>
              <div className="text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{pharm.area} ({pharm.distanceKm} km away)</span>
              </div>
              <div className="text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{pharm.openingHours}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medicines Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.map((med) => {
          const inCart = cart.find(item => item.medicine.id === med.id);
          return (
            <div
              key={med.id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-slate-300 transition-shadow shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{med.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{med.genericName}</p>
                  </div>
                  {med.requiresPrescription ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shrink-0">
                      Rx Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                      OTC
                    </span>
                  )}
                </div>

                <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Brand:</span>
                    <span className="font-medium text-slate-700">{med.brand}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 font-medium">Pack:</span>
                    <span>{med.packSize}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Dispensary: <span className="font-medium text-slate-700">{med.pharmacyName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 italic">
                    {med.usageInstructions}
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-slate-900">₹{med.price}</span>
                  <span className="text-[11px] text-slate-500 ml-1">MRP incl. taxes</span>
                </div>

                {inCart ? (
                  <div className="flex items-center gap-2 bg-slate-100 rounded p-1">
                    <button
                      onClick={() => platformStore.updateCartQuantity(med.id, inCart.quantity - 1)}
                      className="p-1 text-slate-700 hover:text-slate-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 px-1">
                      {inCart.quantity}
                    </span>
                    <button
                      onClick={() => platformStore.updateCartQuantity(med.id, inCart.quantity + 1)}
                      className="p-1 text-slate-700 hover:text-slate-900"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => platformStore.addToCart(med, 1)}
                    className="px-3 py-1.5 bg-teal-800 text-white rounded text-xs font-semibold hover:bg-teal-900 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart & Checkout Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col p-6 shadow-2xl border-l border-slate-200 overflow-y-auto">
            {orderPlacedId ? (
              <div className="my-auto text-center space-y-3 py-12">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-600">
                  Order #{orderPlacedId} has been sent to the dispensary for packaging. Expected delivery within 2 hours.
                </p>
                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setOrderPlacedId(null);
                      setShowCartDrawer(false);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-slate-800" />
                      <h3 className="font-bold text-slate-900 text-base">Pharmacy Basket ({cartCount})</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCartDrawer(false)}
                      className="text-slate-400 hover:text-slate-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      Your cart is currently empty.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {cart.map((item) => (
                        <div key={item.medicine.id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900">{item.medicine.name}</div>
                            <div className="text-[11px] text-slate-500">
                              ₹{item.medicine.price} × {item.quantity} · {item.medicine.requiresPrescription ? 'Rx Required' : 'OTC'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">₹{item.medicine.price * item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => platformStore.updateCartQuantity(item.medicine.id, 0)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Rx Validation Requirement */}
                      {cartRequiresRx && (
                        <div className="bg-rose-50 border border-rose-200 rounded p-3 text-xs text-rose-900 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            Prescription Verification Mandatory
                          </div>
                          <p className="text-[11px] text-rose-800">
                            Your basket includes scheduled medications. Select an authorized digital prescription issued by a verified CareCompass doctor:
                          </p>

                          {prescriptions.length > 0 ? (
                            <select
                              value={selectedPrescriptionId}
                              onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                              className="w-full text-xs p-2 bg-white border border-rose-300 rounded font-medium text-slate-900 focus:outline-none"
                            >
                              {prescriptions.map(rx => (
                                <option key={rx.id} value={rx.id}>
                                  #{rx.id} · Dr. {rx.doctorName} ({rx.consultationDate})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-[11px] text-rose-900 font-semibold">
                              No active prescriptions found. Please book a doctor teleconsultation first.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delivery Address */}
                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Delivery Address (Delhi NCR)
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-300 rounded"
                          required
                        />
                      </div>

                      {/* Bill Breakdown */}
                      <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-600">
                          <span>Items Subtotal:</span>
                          <span>₹{cartSubtotal}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Express Delivery (Delhi NCR):</span>
                          <span>₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                          <span>To Pay:</span>
                          <span className="text-teal-900 font-bold">₹{cartTotal}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={cart.length === 0 || (cartRequiresRx && !selectedPrescriptionId)}
                    className="w-full py-2.5 bg-teal-800 disabled:bg-slate-300 text-white font-semibold rounded text-xs hover:bg-teal-900 transition-colors"
                  >
                    {cartRequiresRx ? 'Authorize Rx & Place Order' : 'Confirm Order & Pay on Delivery'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
