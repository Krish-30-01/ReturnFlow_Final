import React, { useState } from 'react';
import { Truck, MapPin, IndianRupee, ArrowRight } from 'lucide-react';
import { validateLocationStringAsync } from '../../services/geocodingService';
import { generateCorridorCode } from '../../services/routingEngine';
import { NewTripInput } from '../../types/logistics';

interface PostReturnTripProps {
  onSubmitTrip: (tripData: NewTripInput) => void;
  onCancel: () => void;
}

export const PostReturnTrip: React.FC<PostReturnTripProps> = ({ onSubmitTrip, onCancel }) => {
  const [formData, setFormData] = useState({
    from: 'Hyderabad (Shamshabad Logistics Hub)',
    to: 'Bangalore (Peenya Industrial Area)',
    corridor: 'HYD-BLR',
    departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    departureTimeWindow: '06:00 AM – 10:00 AM',
    vehicleType: 'TATA Signa 3523.TK (30-Ton Multi-Axle)',
    vehiclePlate: 'TS-07-EA-9912',
    totalCapacityKg: 12000,
    preferredLoadType: 'FMCG / Packaged Goods / Electronics',
    minPrice: 16500,
    notes: 'Scheduled backhaul return. Containerized closed body with double tarp.'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [, setIsValidating] = useState(false);

  const handleCapacityStep = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      totalCapacityKg: Math.max(500, prev.totalCapacityKg + delta)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    setIsValidating(true);
    const [fromVal, toVal] = await Promise.all([
      validateLocationStringAsync(formData.from),
      validateLocationStringAsync(formData.to)
    ]);
    setIsValidating(false);

    if (!fromVal.isValid || !fromVal.location) {
      newErrors.from = fromVal.error || 'Location not recognized, please select a valid city.';
    }

    if (!toVal.isValid || !toVal.location) {
      newErrors.to = toVal.error || 'Location not recognized, please select a valid city.';
    }

    if (!formData.departureDate) newErrors.departureDate = 'Departure date is required.';
    if (formData.totalCapacityKg <= 0) newErrors.totalCapacityKg = 'Capacity must be greater than 0.';
    if (formData.minPrice <= 0) newErrors.minPrice = 'Minimum price must be greater than 0.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const originCoords = { lat: fromVal.location!.lat, lng: fromVal.location!.lng };
    const destinationCoords = { lat: toVal.location!.lat, lng: toVal.location!.lng };
    const corridor = generateCorridorCode(formData.from, formData.to);

    onSubmitTrip({
      ...formData,
      corridor,
      originCoords,
      destinationCoords
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px 0 48px' }} className="animate-fade-in">
      <div
        className="card card-teal"
        style={{
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--brand-teal-light)',
              color: 'var(--brand-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Truck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.375rem', color: 'var(--brand-navy)' }}>Post Return Backhaul Trip</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              List your spare return capacity in under 60 seconds to match regional retailers.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. From */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-from">
              From (Current / Loading Location) <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="trip-from"
                type="text"
                className="form-input"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                placeholder="e.g. Hyderabad (Uppal / Shamshabad)"
                style={{ paddingLeft: '36px' }}
              />
              <MapPin size={16} color="#1D9E75" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.from && <div className="form-error">{errors.from}</div>}
          </div>

          {/* 2. To */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-to">
              To (Return Destination) <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="trip-to"
                type="text"
                className="form-input"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="e.g. Bangalore (Peenya) / Warangal"
                style={{ paddingLeft: '36px' }}
              />
              <MapPin size={16} color="#042C53" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.to && <div className="form-error">{errors.to}</div>}
          </div>

          {/* 3. Date + Time Window */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="trip-date">
                Departure Date <span className="required">*</span>
              </label>
              <input
                id="trip-date"
                type="date"
                className="form-input"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
              />
              {errors.departureDate && <div className="form-error">{errors.departureDate}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trip-time">
                Time Window <span className="required">*</span>
              </label>
              <select
                id="trip-time"
                className="form-select"
                value={formData.departureTimeWindow}
                onChange={(e) => setFormData({ ...formData, departureTimeWindow: e.target.value })}
              >
                <option value="04:00 AM – 08:00 AM">Early Morning (04:00 AM – 08:00 AM)</option>
                <option value="08:00 AM – 12:00 PM">Morning (08:00 AM – 12:00 PM)</option>
                <option value="12:00 PM – 04:00 PM">Afternoon (12:00 PM – 04:00 PM)</option>
                <option value="04:00 PM – 08:00 PM">Evening (04:00 PM – 08:00 PM)</option>
                <option value="08:00 PM – 11:59 PM">Night Run (08:00 PM – 11:59 PM)</option>
              </select>
            </div>
          </div>

          {/* 4. Vehicle Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-vehicle">
              Registered Vehicle <span className="required">*</span>
            </label>
            <select
              id="trip-vehicle"
              className="form-select"
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
            >
              <option value="TATA Signa 3523.TK (30-Ton Multi-Axle)">TATA Signa 3523.TK (30-Ton Multi-Axle) · TS-07-EA-9912</option>
              <option value="TATA 407 (4-Ton Commercial)">TATA 407 (4-Ton Commercial) · TS-09-UB-4421</option>
              <option value="Ashok Leyland 3118 (14-Ton Heavy)">Ashok Leyland 3118 (14-Ton Heavy) · TS-11-FA-2083</option>
              <option value="BharatBenz 3528R (35-Ton Multi-Axle)">BharatBenz 3528R (35-Ton Multi-Axle) · TS-08-KL-7740</option>
            </select>
          </div>

          {/* 5. Available Capacity (Kg) with Stepper Controls */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-capacity">
              Available Return Capacity (Kg) <span className="required">*</span>
            </label>
            <div className="stepper-control">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => handleCapacityStep(-500)}
                aria-label="Decrease capacity by 500 kg"
              >
                - 500 Kg
              </button>
              <div className="stepper-value">
                {formData.totalCapacityKg.toLocaleString()} Kg ({(formData.totalCapacityKg / 1000).toFixed(1)} Tons)
              </div>
              <button
                type="button"
                className="stepper-btn"
                onClick={() => handleCapacityStep(500)}
                aria-label="Increase capacity by 500 kg"
              >
                + 500 Kg
              </button>
            </div>
            {errors.totalCapacityKg && <div className="form-error">{errors.totalCapacityKg}</div>}
          </div>

          {/* 6. Preferred Load Type & 7. Minimum Price */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="trip-load-type">
                Preferred Load Type
              </label>
              <select
                id="trip-load-type"
                className="form-select"
                value={formData.preferredLoadType}
                onChange={(e) => setFormData({ ...formData, preferredLoadType: e.target.value })}
              >
                <option value="FMCG / General Goods">FMCG & Packaged Groceries</option>
                <option value="Furniture & Display Fixtures">Furniture & Retail Displays</option>
                <option value="Electronics & Appliances">Electronics & Appliances</option>
                <option value="Industrial / Auto Parts">Industrial Fasteners & Auto Parts</option>
                <option value="Textiles & Garments">Textiles & Garments</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="trip-price">
                Minimum Reserve Price (₹) <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="trip-price"
                  type="number"
                  className="form-input"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
                  style={{ paddingLeft: '32px' }}
                />
                <IndianRupee size={16} color="#1D9E75" style={{ position: 'absolute', left: '10px', top: '13px' }} />
              </div>
              {errors.minPrice && <div className="form-error">{errors.minPrice}</div>}
            </div>
          </div>

          {/* 8. Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="trip-notes">
              Additional Notes / Instructions
            </label>
            <textarea
              id="trip-notes"
              className="form-textarea"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Waterproof tarpaulin available, side-loading access..."
            />
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn-outline-navy"
              onClick={onCancel}
              style={{ flex: 1, height: '48px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-teal"
              id="submit-post-trip"
              style={{ flex: 2, height: '48px' }}
            >
              <span>Post Trip to Match Engine</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
