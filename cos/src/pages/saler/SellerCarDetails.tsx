import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdDetail } from '@/api/vehicles';
import type { AdDetail } from '@/api/vehicles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getStoredSid, getCsrfToken } from '@/api/auth';
import { 
  Loader2, Eye, ImageIcon, MessageSquare, Share2, Heart, Pencil, 
  MapPin, Clock, Edit2, Save, X, Calendar, ChevronDown, Car, Users, 
  Zap, Shield, Cpu, Cloud, Navigation, DoorOpen, Fuel, Palette
} from 'lucide-react';
import ImageGallery from '../../components/ui/ImageGallery';
import ImageEditor from '../../components/ui/ImageEditor';
import {
  getMakes, getModels, getVariants, getYears, getBodyTypes, getColours,
  getGearboxes, getFuelTypes, getEnginePower, getAccelerationRanges,
  getDriveTypes, getBootSpaces, getDoorOptions, getSeatOptions
} from '../../api/frappe-rest-api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
const DOCTYPE = 'Ad';

interface EditState {
  [key: string]: string | number | string[] | Record<string, any>[];
}

interface DropdownOption {
  name: string;
  [key: string]: any;
}

interface OverviewField {
  key: string;
  label: string;
  icon: React.ReactNode;
  fieldName?: string;
  row: number;
  col: number;
}

// Map field names to their API fetcher functions
const fieldApiMap: Record<string, () => Promise<DropdownOption[]>> = {
  make: getMakes,
  model: getModels,
  variant: getVariants,
  year: getYears,
  body_type: getBodyTypes,
  colour: getColours,
  gearbox: getGearboxes,
  fuel_type: getFuelTypes,
  engine_power: getEnginePower,
  acceleration: getAccelerationRanges,
  drive_type: getDriveTypes,
  boot_space: getBootSpaces,
  doors: getDoorOptions,
  seats: getSeatOptions,
};


// Overview field configuration with icons and grid positions
const overviewFields: OverviewField[] = [
  { key: 'mileage', label: 'Mileage', icon: <MapPin className="w-4 h-4" />, row: 1, col: 1 },
  { key: 'year', label: 'Registration', icon: <Calendar className="w-4 h-4" />, row: 1, col: 2 },
  { key: 'fuel_type', label: 'Fuel type', icon: <Fuel className="w-4 h-4" />, fieldName: 'fuel_type', row: 1, col: 3 },
  { key: 'doors', label: 'Doors', icon: <DoorOpen className="w-4 h-4" />, fieldName: 'doors', row: 1, col: 4 },
  { key: 'boot_space', label: 'Range', icon: <Navigation className="w-4 h-4" />, fieldName: 'boot_space', row: 2, col: 1 },
  { key: 'body_type', label: 'Body type', icon: <Car className="w-4 h-4" />, fieldName: 'body_type', row: 2, col: 2 },
  { key: 'gearbox', label: 'Gearbox', icon: <Zap className="w-4 h-4" />, fieldName: 'gearbox', row: 2, col: 3 },
  { key: 'seats', label: 'Seats', icon: <Users className="w-4 h-4" />, fieldName: 'seats', row: 2, col: 4 },
  { key: 'colour', label: 'Body color', icon: <Palette className="w-4 h-4" />, fieldName: 'colour', row: 3, col: 1 },
  { key: 'tax_per_year', label: 'Warranty', icon: <Shield className="w-4 h-4" />, row: 3, col: 2 },
  { key: 'engine_power', label: 'Engine', icon: <Cpu className="w-4 h-4" />, fieldName: 'engine_power', row: 3, col: 3 },
  { key: 'co2_emissions', label: 'Emission class', icon: <Cloud className="w-4 h-4" />, row: 3, col: 4 },
];

// Utility function to convert images array to comma-separated string
function convertImagesToString(images: string[]): string {
  return images.join(',');
}

async function updateFrappeDoc(docName: string, payload: Record<string, unknown>): Promise<void> {
  const sid = getStoredSid();
  const url = `${BASE_URL}/api/resource/${encodeURIComponent(DOCTYPE)}/${encodeURIComponent(docName)}`;
  const res = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Frappe-CSRF-Token': getCsrfToken(),
      ...(sid ? { 'X-Frappe-Session-Id': sid } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
}

// Converts UI State -> Frappe REST Payload
function mapStateToFrappe(state: EditState) {
  const payload = { ...state };

  // 1. Handle Images (Child Table: Ad detail, Field: attachments)
  if (Array.isArray(payload.images)) {
    payload.attachments = payload.images.map((url) => ({
      image: url // 'image' is the field name in your 'Ad detail' doctype
    }));
    delete payload.images; // Remove the UI-only key
  }

  // 2. Handle Features (Child Table: Ad Features)
  if (Array.isArray(payload.features)) {
    payload.features = payload.features.map((feat) => ({
      feature: feat // Adjust 'feature' to match your child table fieldname
    }));
  }

  return payload;
}

// Converts Frappe API Response -> UI State
// (Ensures images and features are simple string arrays for your components)
function mapFrappeToState(carData: any): EditState {
  const state: EditState = { ...carData };

  if (Array.isArray(carData.attachments)) {
    state.images = carData.attachments.map((row: any) => row.image);
  } else {
    state.images = [];
  }

  if (Array.isArray(carData.features)) {
    state.features = carData.features.map((row: any) => row.feature);
  } else {
    state.features = [];
  }

  return state;
}

interface EditFieldGridProps {
  field: OverviewField;
  value: string | number;
  editing: boolean;
  onChange: (v: string | number) => void;
}

function EditFieldGrid({ field, value, editing, onChange }: EditFieldGridProps) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load options when field is in edit mode and has an API
  useEffect(() => {
    if (editing && field.fieldName && fieldApiMap[field.fieldName]) {
      setIsLoadingOptions(true);
      fieldApiMap[field.fieldName]()
        .then(setOptions)
        .catch((err) => {
          console.error(`Error loading ${field.fieldName} options:`, err);
          setOptions([]);
        })
        .finally(() => setIsLoadingOptions(false));
    }
  }, [editing, field.fieldName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasApiForField = field.fieldName && fieldApiMap[field.fieldName];
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectOption = (optionName: string) => {
    onChange(optionName);
    setSearchTerm('');
    setShowDropdown(false);
  };

  if (!editing) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="text-gray-400">{field.icon}</div>
          <span className="text-[12px] text-gray-600 font-medium">{field.label}</span>
        </div>
        <p className="text-[13px] text-gray-900 font-semibold truncate">{value || '—'}</p>
      </div>
    );
  }

  if (hasApiForField) {
    return (
      <div className="relative" ref={dropdownRef}>
        <div className="p-4 bg-white rounded-lg border border-orange-300">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="text-orange-500">{field.icon}</div>
            <span className="text-[12px] text-gray-600 font-medium">{field.label}</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={showDropdown ? searchTerm : (value as string)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => !isLoadingOptions && setShowDropdown(true)}
              className="text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 w-full transition pr-7"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {isLoadingOptions ? (
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-orange-400 rounded-full animate-spin" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
          </div>

          {showDropdown && !isLoadingOptions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.name}
                    onClick={() => handleSelectOption(option.name)}
                    className={`px-3 py-2 text-[13px] cursor-pointer transition-colors ${
                      String(value) === option.name
                        ? 'bg-orange-50 text-orange-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-[13px] text-gray-500 text-center">No options found</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback to text input for fields without API
  return (
    <div className="p-4 bg-white rounded-lg border border-orange-300">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="text-orange-500">{field.icon}</div>
        <span className="text-[12px] text-gray-600 font-medium">{field.label}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 w-full transition"
      />
    </div>
  );
}

function SectionCard({
  title,
  editing,
  saving,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  title: string
  editing: boolean
  saving?: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  children: React.ReactNode
}) {
  return (
    <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={onCancel}
                disabled={saving}
                className="flex items-center gap-1 text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors px-3 py-1.5 rounded-lg disabled:opacity-60"
                title="Save"
              >
                {saving ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="text-gray-400 transition-colors hover:text-orange-500"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium ${
      type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  );
}

export default function SellerCarDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: car, isLoading, isError } = useQuery({
    queryKey: ['ad-detail', id],
    queryFn: () => getAdDetail(id!),
    enabled: !!id,
  });

  const [editState, setEditState] = useState<EditState | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

const handleSectionEdit = (section: string) => {
  if (car) {
    // 1. Cast car to 'any' so we can access the hidden 'attachments' field
    const rawCar = car as any; 
    
    // 2. Start with a copy of all the basic fields (make, model, price, etc.)
    const state: EditState = { ...rawCar };

    // 3. Map the Child Table (attachments) to the UI array (images)
    if (Array.isArray(rawCar.attachments)) {
      state.images = rawCar.attachments.map((row: any) => row.image);
    } else {
      // Fallback: If it's already a string array (from a previous edit), keep it
      state.images = Array.isArray(rawCar.images) ? rawCar.images : [];
    }

    // 4. Map the Features Child Table
    if (Array.isArray(rawCar.features)) {
      // Check if features are objects from the API or strings from a previous edit
      state.features = rawCar.features.map((row: any) => 
        typeof row === 'object' ? row.feature : row
      );
    } else {
      state.features = [];
    }

    setEditState(state);
    setEditingSection(section);
  }
};


  const handleSectionCancel = () => {
    setEditState(null);
    setEditingSection(null);
  };

const updateMutation = useMutation({
  mutationFn: (fields: EditState) => {
    // TRANSLATION STEP: Turn flat arrays into Child Table objects
    const frappePayload = mapStateToFrappe(fields);
    
    return updateFrappeDoc(car!.name, frappePayload);
  },
  onSuccess: () => {
    setEditState(null);
    setEditingSection(null);
    queryClient.invalidateQueries({ queryKey: ['ad-detail', id] });
    setToast({ message: 'Ad updated successfully.', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  },
    onError: (err: Error) => {
      setToast({ message: `Failed to update: ${err.message}`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const handleSave = () => {
    if (editState) updateMutation.mutate(editState);
  };

  const updateField = (key: string, value: string | number | string[]) => {
    setEditState((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="text-xs text-gray-500">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="mb-3 text-sm font-medium text-red-600">Failed to load ad</p>
          <button onClick={() => navigate('/seller')} className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

const displayValue = (key: string): string | number | string[] => {
  if (editingSection && editState && key in editState) {
    return editState[key] as any;
  }

  const rawCar = car as any; // Cast here too!

  if (key === 'images') {
    // Look at attachments first, then fallback to images
    const attachments = rawCar.attachments;
    if (Array.isArray(attachments)) {
      return attachments.map((row: any) => row.image);
    }
    return Array.isArray(rawCar.images) ? rawCar.images : [];
  }

  const val = rawCar[key];
  return typeof val === 'string' || typeof val === 'number' ? val : '';
};

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-10">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-sm font-semibold text-gray-800">Current Status</h1>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            Gallery
          </button>
          <button className="p-1.5 text-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-6 p-6 max-w-[1400px] mx-auto">
        <div className="flex-1 min-w-0 space-y-6">
          <ImageGallery
            images={(displayValue('images') as string[]) || []}
            onBack={() => navigate('/seller')}
            showAuctionReport={true}
            onAuctionReportClick={() => console.log('Auction Report clicked')}
            containerHeight={380}
          />

          {/* Title & Price Card - Main Details */}
          <SectionCard
            title="Main Details"
            editing={editingSection === 'main'}
            saving={updateMutation.isPending}
            onEdit={() => handleSectionEdit('main')}
            onSave={handleSave}
            onCancel={handleSectionCancel}
          >
            {editingSection === 'main' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1.5">Make & Model</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={displayValue('make')}
                      onChange={(e) => updateField('make', e.target.value)}
                      placeholder="Make"
                      className="flex-1 text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                    />
                    <input
                      type="text"
                      value={displayValue('model')}
                      onChange={(e) => updateField('model', e.target.value)}
                      placeholder="Model"
                      className="flex-1 text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1.5">Variant</label>
                  <input
                    type="text"
                    value={displayValue('variant')}
                    onChange={(e) => updateField('variant', e.target.value)}
                    className="w-full text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1.5">Mileage (km)</label>
                  <input
                    type="number"
                    value={displayValue('mileage')}
                    onChange={(e) => updateField('mileage', parseFloat(e.target.value))}
                    className="w-full text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1.5">Price (£)</label>
                  <input
                    type="number"
                    value={displayValue('price')}
                    onChange={(e) => updateField('price', parseFloat(e.target.value))}
                    className="w-full text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-1.5">Ports</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={displayValue('from_port')}
                      onChange={(e) => updateField('from_port', e.target.value)}
                      placeholder="From Port"
                      className="flex-1 text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                    />
                    <input
                      type="text"
                      value={displayValue('to_port')}
                      onChange={(e) => updateField('to_port', e.target.value)}
                      placeholder="To Port"
                      className="flex-1 text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-900">
                  {displayValue('make')} {displayValue('model')}
                </h2>
                <p className="w-3/4 mt-1 text-sm text-gray-600">
                  {displayValue('mileage')} km • {displayValue('year')}<br/>{displayValue('variant')}
                </p>
                <p className="mt-4 text-3xl font-bold text-[#ff6b4a]">£{displayValue('price')}</p>
                <div className="inline-block mt-4 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg">
                  {displayValue('from_port')} {displayValue('to_port') ? `→ ${displayValue('to_port')}` : ''}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Overview Card - Merged Basic Details & Overview */}
          <SectionCard
            title="Overview"
            editing={editingSection === 'overview'}
            saving={updateMutation.isPending}
            onEdit={() => handleSectionEdit('overview')}
            onSave={handleSave}
            onCancel={handleSectionCancel}
          >
            {editingSection === 'overview' ? (
              <div className="grid grid-cols-4 gap-4">
                {overviewFields.map((field) => (
                  <EditFieldGrid
                    key={field.key}
                    field={field}
                    value={displayValue(field.key) as string | number}
                    editing={true}
                    onChange={(v) => updateField(field.key, v)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {overviewFields.map((field) => (
                  <EditFieldGrid
                    key={field.key}
                    field={field}
                    value={displayValue(field.key) as string | number}
                    editing={false}
                    onChange={(v) => updateField(field.key, v)}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Gallery Card */}
          <SectionCard
            title="Gallery"
            editing={editingSection === 'gallery'}
            saving={updateMutation.isPending}
            onEdit={() => handleSectionEdit('gallery')}
            onSave={handleSave}
            onCancel={handleSectionCancel}
          >
            <ImageEditor
              images={(displayValue('images') as string[]) || []}
              onChange={(imgs) => updateField('images', imgs)}
              editing={editingSection === 'gallery'}
            />
          </SectionCard>

          {/* Description Card */}
          <SectionCard
            title="Description"
            editing={editingSection === 'description'}
            saving={updateMutation.isPending}
            onEdit={() => handleSectionEdit('description')}
            onSave={handleSave}
            onCancel={handleSectionCancel}
          >
            {editingSection === 'description' ? (
              <textarea
                value={displayValue('description')}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full text-[13px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
                rows={4}
              />
            ) : (
              <p className="text-sm leading-relaxed text-gray-600">{displayValue('description') || '—'}</p>
            )}
          </SectionCard>
        </div>

        {/* Right Sidebar */}
        <div className="flex-shrink-0 w-[340px] space-y-4">
          
          {/* Stats Boxes */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-200/60 rounded-xl">
              <div className="flex items-center gap-2 text-gray-700">
                <Eye className="w-4 h-4" /> <span className="text-sm font-medium">View</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">13.6k</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-200/60 rounded-xl">
              <div className="flex items-center gap-2 text-gray-700">
                <ImageIcon className="w-4 h-4" /> <span className="text-sm font-medium">Photos</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{(displayValue('images') as string[])?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-200/60 rounded-xl">
              <div className="flex items-center gap-2 text-gray-700">
                <MessageSquare className="w-4 h-4" /> <span className="text-sm font-medium">Chat</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">0</span>
            </div>
          </div>

          {/* Received Offers Container */}
          <div className="bg-[#181818] rounded-2xl p-4 overflow-hidden shadow-lg">
            <h3 className="mb-4 text-base font-semibold text-white">Received Offers</h3>
            
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
              {[
                { name: 'Elizabeth Henry', price: '£13,500', date: '25/1/2026', time: '5:30pm', status: 'active', num: '01' },
                { name: 'Elizabeth Henry', price: '£13,400', date: '25/1/2026', time: '5:30pm', status: 'active', num: '01' },
                { name: 'Elizabeth Henry', price: '£13,600', date: '25/1/2026', time: '5:30pm', status: 'inactive', num: '01' },
                { name: 'Elizabeth Henry', price: '£13,750', date: '25/1/2026', time: '5:30pm', status: 'active', num: '01' },
                { name: 'Elizabeth Henry', price: '£13,500', date: '25/1/2026', time: '5:30pm', status: 'inactive', num: '01' },
              ].map((offer, i) => (
                <div key={i} className="relative p-3 bg-white shadow-sm rounded-xl">
                  <div className="absolute top-0 left-0 px-1.5 py-0.5 text-[10px] font-bold text-[#ff6b4a] bg-[#ffe4dc] rounded-br-lg rounded-tl-xl">
                    {offer.num}
                  </div>
                  
                  <div className="flex gap-3 mt-3">
                    <div className="flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-200 rounded-full">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 5}`} alt="Avatar" className="w-full h-full" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{offer.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Offer Price</p>
                      <p className="text-lg font-bold text-[#ff6b4a] leading-tight">{offer.price}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {offer.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {offer.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-[85px]">
                      <button className="w-full py-1.5 text-xs font-semibold text-white transition-colors bg-[#ff8b6b] rounded-md hover:bg-[#ff6b4a]">
                        Hold
                      </button>
                      <button 
                        className={`w-full py-1.5 text-xs font-semibold text-white transition-colors rounded-md ${
                          offer.status === 'active' 
                            ? 'bg-[#00d0b0] hover:bg-[#00b599]' 
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        Offer Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}