import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, IndianRupee, ArrowRight, Store, Route, Cpu } from 'lucide-react';
import { calculateDistanceAndDuration, generateCorridorCode } from '../../services/routingEngine';
import { validateLocationStringAsync } from '../../services/geocodingService';
import { predictFreightPriceAndMatch } from '../../services/mlInferenceService';
import { calculateBackhaulPricing } from '../../services/pricingEngine';
import { NewLoadInput } from '../../types/logistics';

interface PostLoadRequestProps {
  onSubmitLoad: (loadData: NewLoadInput) => void;
  onCancel: () => void;
}

export const PostLoadRequest: React.FC<PostLoadRequestProps> = ({ onSubmitLoad, onCancel }) => {
  const [formData, setFormData] = useState({
    from: 'Hyderabad (Uppal Industrial Area)',
    to: 'Warangal (Hanamkonda Market)',
    corridor: 'HYD-WAR',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeWindow: 'Morning (07:00 AM – 11:00 AM)',
    weight: 500,
    weightUnit: 'Kg' as 'Kg' | 'CBM',
    goodsType: 'Furniture & Display Fixtures',
    budget: 2800,
    specialInstructions: 'Bubble wrapped retail display shelves. Hydraulic lift gate preferred.'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const weightKgCalc = formData.weightUnit === 'CBM' ? formData.weight * 250 : formData.weight;

  const routeInfo = useMemo(() => calculateDistanceAndDuration(formData.from, formData.to), [formData.from, formData.to]);
  const pricingEstimate = useMemo(() => calculateBackhaulPricing({ distanceKm: routeInfo.distanceKm, weightKg: weightKgCalc, corridorId: routeInfo.corridorId, isReturnTrip: true }), [routeInfo.distanceKm, weightKgCalc, routeInfo.corridorId]);
  const mlPrediction = useMemo(() => predictFreightPriceAndMatch({ distanceKm: routeInfo.distanceKm, weightKg: weightKgCalc, corridorId: routeInfo.corridorId }), [routeInfo.distanceKm, weightKgCalc, routeInfo.corridorId]);

  useEffect(() => {
    const code = generateCorridorCode(formData.from, formData.to);
    if (code && code !== formData.corridor) setFormData(prev => ({ ...prev, corridor: code }));
  }, [formData.from, formData.to]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    setIsValidating(true);
    const [fromVal, toVal] = await Promise.all([validateLocationStringAsync(formData.from), validateLocationStringAsync(formData.to)]);
    setIsValidating(false);

    if (!fromVal.isValid) newErrors.from = fromVal.error || 'Location not recognized.';
    if (!toVal.isValid) newErrors.to = toVal.error || 'Location not recognized.';
    if (!formData.date) newErrors.date = 'Shipment date is required.';
    if (formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0.';
    if (formData.budget <= 0) newErrors.budget = 'Budget must be greater than 0.';

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});

    onSubmitLoad({
      ...formData,
      corridor: generateCorridorCode(formData.from, formData.to),
      originCoords: fromVal.location ? { lat: fromVal.location.lat, lng: fromVal.location.lng } : undefined,
      destinationCoords: toVal.location ? { lat: toVal.location.lat, lng: toVal.location.lng } : undefined,
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 0 48px' }} className="animate-fade-in">
      <div className="card card-amber" style={{ padding: '36px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--brand-amber-light)', color: 'var(--brand-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Store size={24} /></div>
          <div>
            <h2 style={{ fontSize: '1.375rem', color: 'var(--brand-navy)' }}>Post Consignment Load Request</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Instantly connect with returning heavy freight trucks for 35% lower transport costs.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-amber" htmlFor="load-pickup">Pickup Location <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <input id="load-pickup" type="text" className="form-input form-input-amber" value={formData.from} onChange={e => setFormData({ ...formData, from: e.target.value })} placeholder="e.g. Hyderabad (Uppal Hub)" style={{ paddingLeft: '36px' }} />
              <MapPin size={16} color="#BA7517" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.from && <div className="form-error">{errors.from}</div>}
          </div>

          <div className="form-group">
            <label className="form-label form-label-amber" htmlFor="load-drop">Drop Location <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <input id="load-drop" type="text" className="form-input form-input-amber" value={formData.to} onChange={e => setFormData({ ...formData, to: e.target.value })} placeholder="e.g. Warangal (Industrial Area)" style={{ paddingLeft: '36px' }} />
              <MapPin size={16} color="#042C53" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.to && <div className="form-error">{errors.to}</div>}
          </div>

          {routeInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'var(--brand-teal-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-teal)', marginBottom: '12px', fontSize: '0.8125rem' }}>
              <Route size={16} color="var(--brand-teal)" />
              <span style={{ color: 'var(--brand-navy)' }}><strong>Route Corridor:</strong> {routeInfo.corridorName} (~{routeInfo.distanceKm} km transit route)</span>
            </div>
          )}

          <div style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#0F172A', fontWeight: 600 }}>
              <Cpu size={16} color="#0D9488" />
              <span>Backhaul Rate: ₹{pricingEstimate.retailerBudget.toLocaleString()} – ₹{pricingEstimate.totalPrice.toLocaleString()}
                {pricingEstimate.savingsPercentage > 0 && <span style={{ marginLeft: '8px', color: '#0D9488' }}>({pricingEstimate.savingsPercentage}% below spot rate)</span>}
              </span>
              <span style={{ marginLeft: 'auto', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>Pricing engine</span>
            </div>
            <p style={{ margin: 0, color: '#64748B' }}>Est. Match Score: {mlPrediction.predictedMatchScore}% · {routeInfo.corridorName} · {routeInfo.distanceKm} km</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label form-label-amber" htmlFor="load-date">Pickup Date <span className="required">*</span></label>
              <input id="load-date" type="date" className="form-input form-input-amber" value={formData.date} min={new Date().toISOString().split('T')[0]} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>
            <div className="form-group">
              <label className="form-label form-label-amber" htmlFor="load-time">Time Window <span className="required">*</span></label>
              <select id="load-time" className="form-select form-select-amber" value={formData.timeWindow} onChange={e => setFormData({ ...formData, timeWindow: e.target.value })}>
                <option value="Morning (07:00 AM – 11:00 AM)">Morning (07:00 AM – 11:00 AM)</option>
                <option value="Afternoon (12:00 PM – 04:00 PM)">Afternoon (12:00 PM – 04:00 PM)</option>
                <option value="Evening (04:00 PM – 08:00 PM)">Evening (04:00 PM – 08:00 PM)</option>
                <option value="Flexible All Day">Flexible (Anytime during daylight)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-amber" htmlFor="load-weight">Weight / Volume <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input id="load-weight" type="number" className="form-input form-input-amber" value={formData.weight} onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })} style={{ flex: 2 }} />
              <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-color)' }}>
                {(['Kg', 'CBM'] as const).map(unit => (
                  <button key={unit} type="button" onClick={() => setFormData({ ...formData, weightUnit: unit })} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: formData.weightUnit === unit ? 'var(--brand-amber)' : 'transparent', color: formData.weightUnit === unit ? '#FFFFFF' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8125rem' }}>{unit}</button>
                ))}
              </div>
            </div>
            {errors.weight && <div className="form-error">{errors.weight}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label form-label-amber" htmlFor="load-goods">Goods Type <span className="required">*</span></label>
              <select id="load-goods" className="form-select form-select-amber" value={formData.goodsType} onChange={e => setFormData({ ...formData, goodsType: e.target.value })}>
                <option value="Furniture & Display Fixtures">Furniture & Retail Displays</option>
                <option value="FMCG Packaged Goods">FMCG & Packaged Groceries</option>
                <option value="Electronics & Appliances">Electronics & Home Appliances</option>
                <option value="Textiles & Garments">Textiles & Garments</option>
                <option value="Industrial Hardware">Industrial Fasteners & Hardware</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label form-label-amber" htmlFor="load-budget">Budget Target (₹) <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input id="load-budget" type="number" className="form-input form-input-amber" value={formData.budget} onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })} style={{ paddingLeft: '32px' }} />
                <IndianRupee size={16} color="#BA7517" style={{ position: 'absolute', left: '10px', top: '13px' }} />
              </div>
              {errors.budget && <div className="form-error">{errors.budget}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-amber" htmlFor="load-instructions">Special Handling Instructions</label>
            <textarea id="load-instructions" className="form-textarea form-textarea-amber" rows={2} value={formData.specialInstructions} onChange={e => setFormData({ ...formData, specialInstructions: e.target.value })} placeholder="e.g. Handle with care, forklift required, fragile..." />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn-outline-navy" onClick={onCancel} style={{ flex: 1, height: '48px' }}>Cancel</button>
            <button type="submit" className="btn-primary-amber" id="submit-find-matches" disabled={isValidating} style={{ flex: 2, height: '48px', opacity: isValidating ? 0.7 : 1 }}>
              <span>{isValidating ? 'Validating Locations...' : 'Find Matches Immediately'}</span><ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
