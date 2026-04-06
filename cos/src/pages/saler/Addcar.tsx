import React, { useState } from 'react';
import {
  useYears,
  useMakes,
  useModels,
  useVariants,
  useGearboxes,
  useDoorOptions,
  useSeatOptions,
  useFuelTypes,
  useAccelerationRanges,
  useDriveTypes,
  useBootSpaces,
  useColours,
} from '@/hooks/useVehicles';
import { submitAdWithFiles } from '@/api/ad';
import CarInfoModal from '@/components/ui/CarInfoModal';
import type { 
  Gearbox, 
  DoorOption, 
  SeatOption, 
  FuelType, 
  AccelerationRange, 
  DriveType, 
  BootSpace,
  Colour
} from '@/api/vehicles';

interface CarInfo {
  year: string;
  make: string;
  model: string;
  variant: string;
}

interface MediaFile {
  file: File;
  type: 'image' | 'document';
}

interface AdditionalInfo {
  gearbox: string;
  engineSize: string;
  doors: string;
  seats: string;
  fuelType: string;
  batteryRange: string;
  chargingTime: string;
  enginePower: string;
  acceleration: string;
  fuelConsumption: string;
  co2Emissions: string;
  taxPerYear: string;
  driveType: string;
  bootSpace: string;
}

interface ContactInfo {
  contactNumber: boolean;
  systemChat: boolean;
  whatsappContact: boolean;
  otherInformation: boolean;
  agreedToTerms: boolean;
}

interface FormData {
  lotNumber: string;
  vin: string;
  auctionReport: File | null;
  carInfo: CarInfo;
  mileage: string;
  price: string;
  exteriorColor: string;
  description: string;
  country: string;
  city: string;
  area: string;
  mediaFiles: MediaFile[];
  vehicleStatus: string;
  eta: string;
  additionalInfo: AdditionalInfo;
  features: string[];
  contactInfo: ContactInfo;
}

const INITIAL_ADDITIONAL_INFO: AdditionalInfo = {
  gearbox: '',
  engineSize: '',
  doors: '',
  seats: '',
  fuelType: '',
  batteryRange: '',
  chargingTime: '',
  enginePower: '',
  acceleration: '',
  fuelConsumption: '',
  co2Emissions: '',
  taxPerYear: '',
  driveType: '',
  bootSpace: '',
};

const INITIAL_CONTACT_INFO: ContactInfo = {
  contactNumber: false,
  systemChat: false,
  whatsappContact: false,
  otherInformation: false,
  agreedToTerms: false,
};

const FEATURES_LIST = [
  'ABS', 'Air Bags', 'Air Conditioning', 'Alloy Rims', 'Android Auto', 'Apple CarPlay',
  '360 Camera', 'Climate Control', 'Cruise Control', 'DRLs', 'Fog Lights', 'Front Camera',
  'Front Speakers', 'Head Up Display (HUD)', 'Heated Seats', 'Immobilizer Key',
  'Infotainment System', 'Keyless Entry', 'LED Headlights', 'Paddle Shifters',
  'Panoramic Sunroof', 'Parking Sensors', 'Power Locks', 'Power Mirrors', 'Power Seats',
  'Power Steering', 'Push Start', 'Rear AC Vents', 'Rear Camera', 'Rear Speakers',
  'Steering Switches', 'Sun Roof', 'Tyre Pressure Monitoring System (TPMS)',
];

export default function Addcar() {
  const [formData, setFormData] = useState<FormData>({
    lotNumber: '',
    vin: '',
    auctionReport: null,
    carInfo: {
      year: '',
      make: '',
      model: '',
      variant: '',
    },
    mileage: '',
    price: '',
    exteriorColor: '',
    description: '',
    country: '',
    city: '',
    area: '',
    mediaFiles: [],
    vehicleStatus: 'In Use',
    eta: 'Coming in 7 days',
    additionalInfo: INITIAL_ADDITIONAL_INFO,
    features: [],
    contactInfo: INITIAL_CONTACT_INFO,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCarInfo, setSelectedCarInfo] = useState<string>('');
  const [mediaErrors, setMediaErrors] = useState<string[]>([]);
  const [searchFeatures, setSearchFeatures] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ====== API HOOKS - React Query ======
  // Note: These hooks return UseQueryResult objects with { data, isLoading, error, etc. }
  const yearsQuery = useYears();
  const makesQuery = useMakes();
  const modelsQuery = useModels(formData.carInfo.year ? formData.carInfo.make : undefined);
  const variantsQuery = useVariants(formData.carInfo.model);
  const coloursQuery = useColours();

  const gearboxesQuery = useGearboxes();
  const doorsQuery = useDoorOptions();
  const seatsQuery = useSeatOptions();
  const fuelTypesQuery = useFuelTypes();
  const accelerationRangesQuery = useAccelerationRanges();
  const driveTypesQuery = useDriveTypes();
  const bootSpacesQuery = useBootSpaces();

  // Extract data with fallbacks for loading/error states
  const years = yearsQuery.data?.map(y => ({
    ...y,
    year: y.year.toString()
  })) ?? [];
  
  const makes = makesQuery.data ?? [];
  const models = modelsQuery.data ?? [];
  const variants = variantsQuery.data ?? [];
  const colours = coloursQuery.data ?? [];
  const gearboxes = gearboxesQuery.data ?? [];
  const doors = doorsQuery.data ?? [];
  const seats = seatsQuery.data ?? [];
  const fuelTypes = fuelTypesQuery.data ?? [];
  const accelerationRanges = accelerationRangesQuery.data ?? [];
  const driveTypes = driveTypesQuery.data ?? [];
  const bootSpaces = bootSpacesQuery.data ?? [];

  // ====== CAR INFORMATION HANDLERS ======
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCarInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      carInfo: {
        ...prev.carInfo,
        [field]: value,
      },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        auctionReport: e.target.files![0],
      }));
    }
  };

  const handleCarInfoSelect = (carInfo: CarInfo) => {
    setFormData((prev) => ({
      ...prev,
      carInfo,
    }));
    setSelectedCarInfo(
      `${carInfo.year} ${carInfo.make} ${carInfo.model} ${carInfo.variant || ''}`
    );
    setIsModalOpen(false);
  };

  const handleClearCarInfo = () => {
    setSelectedCarInfo('');
    setFormData((prev) => ({
      ...prev,
      carInfo: { year: '', make: '', model: '', variant: '' },
    }));
  };

  // ====== UPLOAD MEDIA HANDLERS ======
  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newErrors: string[] = [];
    const newFiles: MediaFile[] = [...formData.mediaFiles];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name} exceeds 5MB limit`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isDocument = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);

      if (!isImage && !isDocument) {
        newErrors.push(`${file.name} is not a supported file type`);
        return;
      }

      if (isImage && newFiles.filter((f) => f.type === 'image').length >= MAX_IMAGES) {
        newErrors.push(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      newFiles.push({
        file,
        type: isImage ? 'image' : 'document',
      });
    });

    if (newErrors.length === 0) {
      setFormData((prev) => ({
        ...prev,
        mediaFiles: newFiles,
      }));
      setMediaErrors([]);
    } else {
      setMediaErrors(newErrors);
    }

    e.target.value = '';
  };

  const removeMediaFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  // ====== ETA HANDLERS ======
  const handleVehicleStatusChange = (status: string) => {
    setFormData((prev) => ({
      ...prev,
      vehicleStatus: status,
    }));
  };

  const handleETAChange = (eta: string) => {
    setFormData((prev) => ({
      ...prev,
      eta,
    }));
  };

  // ====== ADDITIONAL INFO HANDLERS ======
  const handleAdditionalInfoChange = (field: keyof AdditionalInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [field]: value,
      },
    }));
  };

  // ====== FEATURES HANDLERS ======
  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const filteredFeatures = FEATURES_LIST.filter((feature) =>
    feature.toLowerCase().includes(searchFeatures.toLowerCase())
  );

  // ====== CONTACT INFO HANDLERS ======
  const handleContactInfoChange = (field: keyof ContactInfo, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }));
  };

  // ====== FORM VALIDATION ======
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Uncomment validation as needed
    // if (!formData.lotNumber) errors.push('Lot Number is required');

    if (errors.length > 0) {
      setSubmitMessage({
        type: 'error',
        text: errors.join(', '),
      });
      return false;
    }

    return true;
  };

  // ====== FORM SUBMISSION ======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const result = await submitAdWithFiles(formData);

      setSubmitMessage({
        type: 'success',
        text: `Ad created successfully! ID: ${result.name}`,
      });

      // Reset form after successful submission
      setFormData({
        lotNumber: '',
        vin: '',
        auctionReport: null,
        carInfo: {
          year: '',
          make: '',
          model: '',
          variant: '',
        },
        mileage: '',
        price: '',
        exteriorColor: '',
        description: '',
        country: '',
        city: '',
        area: '',
        mediaFiles: [],
        vehicleStatus: 'In Use',
        eta: 'Coming in 7 days',
        additionalInfo: INITIAL_ADDITIONAL_INFO,
        features: [],
        contactInfo: INITIAL_CONTACT_INFO,
      });
      setSelectedCarInfo('');

      console.log('Form submitted successfully:', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while submitting the form';
      setSubmitMessage({
        type: 'error',
        text: errorMessage,
      });
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageCount = formData.mediaFiles.filter((f) => f.type === 'image').length;
  const documentCount = formData.mediaFiles.filter((f) => f.type === 'document').length;

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ====== SUBMIT MESSAGE ====== */}
          {submitMessage && (
            <div className={`p-4 rounded-lg border ${
              submitMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{submitMessage.text}</p>
            </div>
          )}

          {/* ====== CAR INFORMATION SECTION ====== */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sm:px-8">
              <h1 className="text-2xl font-bold text-gray-900">Car Information</h1>
              <p className="mt-1 text-sm text-gray-600">
                All fields marked with <span className="text-red-500">*</span> are mandatory
              </p>
            </div>

            <div className="px-6 py-8 space-y-6 sm:px-8">
              {/* Lot Number & VIN */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Lot Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleInputChange}
                    placeholder="1234A55"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    VIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    placeholder="1234A55"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Auction Report */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Auction Report</label>
                <label className="relative cursor-pointer">
                  <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
                  <div className="w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-center">
                    <svg
                      className="w-5 h-5 mx-auto mb-1 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {formData.auctionReport ? formData.auctionReport.name : 'Upload report'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Car Info */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Car Info <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedCarInfo}
                    readOnly
                    placeholder="2025 Toyota Yaris Sedan GLi CVT 1.3"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </button>
                  {selectedCarInfo && (
                    <button
                      type="button"
                      onClick={handleClearCarInfo}
                      className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Pakistan"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Karachi"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Defence"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <hr className="my-6" />

              {/* Mileage & Price */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mileage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    placeholder="50000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="2800000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Exterior Color */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Exterior Color <span className="text-red-500">*</span>
                </label>
                <select
                  name="exteriorColor"
                  value={formData.exteriorColor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select a color</option>
                  {colours.map((colour: Colour) => (
                    <option key={colour.name} value={colour.name}>
                      {colour.name}
                    </option>
                  ))}
                </select>
              </div>

              <hr className="my-6" />

              {/* Car Description */}
              <div>
                <label className="flex justify-between block mb-2 text-sm font-medium text-gray-700">
                  <span>
                    Car Description <span className="text-red-500">*</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    Remaining characters: {1000 - formData.description.length}
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your car"
                  maxLength={1000}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
                />
                <p className="mt-1 text-xs text-gray-500">You can also use template suggested by AI.</p>
              </div>
            </div>
          </div>

          {/* ====== UPLOAD MEDIA SECTION ====== */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sm:px-8">
              <h2 className="text-xl font-bold text-gray-900">Upload Media</h2>
            </div>

            <div className="px-6 py-8 space-y-6 sm:px-8">
              <div>
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <div className="w-full px-6 py-8 text-center transition border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 hover:bg-blue-50">
                    <svg
                      className="w-8 h-8 mx-auto mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <button className="inline-block px-4 py-2 text-sm font-medium text-white transition bg-orange-500 rounded hover:bg-orange-600">
                      + Add Photos/Video
                    </button>
                    <p className="mt-2 text-xs text-gray-500">Max up to 10 images (5 MB each)</p>
                  </div>
                </label>

                {/* Error Messages */}
                {mediaErrors.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {mediaErrors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 border border-red-200 rounded-lg bg-red-50">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-red-700">{error}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info Messages */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 p-3 border border-blue-200 rounded-lg bg-blue-50">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-blue-700">Add clear, well-lit photos to help sell your vehicle</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Files List */}
              {formData.mediaFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Uploaded Files ({formData.mediaFiles.length})
                    </h3>
                    <span className="text-xs text-gray-600">
                      Images: {imageCount} | Documents: {documentCount}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {formData.mediaFiles.map((mediaFile, index) => (
                      <div
                        key={index}
                        className="relative p-3 transition border border-gray-200 rounded-lg group hover:border-gray-300"
                      >
                        {mediaFile.type === 'image' ? (
                          <div className="flex items-center justify-center mb-2 bg-gray-100 rounded aspect-square">
                            <img
                              src={URL.createObjectURL(mediaFile.file)}
                              alt={mediaFile.file.name}
                              className="object-cover w-full h-full rounded"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center mb-2 bg-gray-100 rounded aspect-square">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c4.418 0 8-1.79 8-4s-3.582-4-8-4-8 1.79-8 4 3.582 4 8 4zm0 0c-4.418 0-8 1.79-8 4v4c0 2.21 3.582 4 8 4s8-1.79 8-4v-4c0-2.21-3.582-4-8-4z" />
                            </svg>
                          </div>
                        )}
                        <p className="mb-2 text-xs text-gray-700 truncate">{mediaFile.file.name}</p>
                        <p className="mb-2 text-xs text-gray-500">
                          {(mediaFile.file.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          type="button"
                          onClick={() => removeMediaFile(index)}
                          className="absolute p-1 text-white transition bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100 hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ====== ETA SECTION ====== */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sm:px-8">
              <h2 className="text-xl font-bold text-gray-900">ETA</h2>
            </div>

            <div className="px-6 py-8 space-y-6 sm:px-8">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Vehicle Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vehicleStatus}
                  onChange={(e) => handleVehicleStatusChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select status</option>
                  <option value="In Use">In Use</option>
                  <option value="Imported">Imported</option>
                  <option value="New">New</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  ETA <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.eta}
                  onChange={(e) => handleETAChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select ETA</option>
                  <option value="Coming in 7 days">Coming in 7 days</option>
                  <option value="Coming in 15 days">Coming in 15 days</option>
                  <option value="Coming in 30 days">Coming in 30 days</option>
                  <option value="Available Now">Available Now</option>
                </select>
              </div>
            </div>
          </div>

          {/* ====== ADDITIONAL INFORMATION SECTION ====== */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sm:px-8">
              <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
            </div>

            <div className="px-6 py-8 space-y-6 sm:px-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-1 px-[150px]">
                {/* Gearbox */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Gearbox</label>
                  <select
                    value={formData.additionalInfo.gearbox}
                    onChange={(e) => handleAdditionalInfoChange('gearbox', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select Gearbox</option>
                    {gearboxes.map((item: Gearbox) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Engine Size */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Engine Size</label>
                  <input
                    type="text"
                    value={formData.additionalInfo.engineSize}
                    onChange={(e) => handleAdditionalInfoChange('engineSize', e.target.value)}
                    placeholder="Enter engine size (e.g., 1500cc)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Doors */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Doors</label>
                  <select
                    value={formData.additionalInfo.doors}
                    onChange={(e) => handleAdditionalInfoChange('doors', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select Doors</option>
                    {doors.map((item: DoorOption) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seats */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Seats</label>
                  <select
                    value={formData.additionalInfo.seats}
                    onChange={(e) => handleAdditionalInfoChange('seats', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select Seats</option>
                    {seats.map((item: SeatOption) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Fuel Type</label>
                  <select
                    value={formData.additionalInfo.fuelType}
                    onChange={(e) => handleAdditionalInfoChange('fuelType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select Fuel Type</option>
                    {fuelTypes.map((item: FuelType) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Battery Range */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Battery Range</label>
                  <input
                    type="text"
                    value={formData.additionalInfo.batteryRange}
                    onChange={(e) => handleAdditionalInfoChange('batteryRange', e.target.value)}
                    placeholder="Enter battery range (e.g., 300km)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Charging Time */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Charging Time</label>
                  <input
                    type="text"
                    value={formData.additionalInfo.chargingTime}
                    onChange={(e) => handleAdditionalInfoChange('chargingTime', e.target.value)}
                    placeholder="Enter charging time (e.g., 2 hours)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Engine Power */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Engine Power</label>
                  <input
                    type="text"
                    value={formData.additionalInfo.enginePower}
                    onChange={(e) => handleAdditionalInfoChange('enginePower', e.target.value)}
                    placeholder="Enter engine power (e.g., 150hp)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Acceleration */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Acceleration (0-100mph)</label>
                  <select
                    value={formData.additionalInfo.acceleration}
                    onChange={(e) => handleAdditionalInfoChange('acceleration', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select Acceleration</option>
                    {accelerationRanges.map((item: AccelerationRange) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fuel Consumption */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Fuel Consumption</label>
                  <input
                    type="text"
                    value={formData.additionalInfo.fuelConsumption}
                    onChange={(e) => handleAdditionalInfoChange('fuelConsumption', e.target.value)}
                    placeholder="Enter fuel consumption (e.g., 15 km/l)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* CO2 Emissions */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">CO2 Emissions</label>
                  <input
                    type="text"
                    value={formData.additionalInfo.co2Emissions}
                    onChange={(e) => handleAdditionalInfoChange('co2Emissions', e.target.value)}
                    placeholder="Enter CO2 emissions"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Tax Per Year */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Tax Per Year</label>
                  <input
                    type="text"
                    value={formData.additionalInfo.taxPerYear}
                    onChange={(e) => handleAdditionalInfoChange('taxPerYear', e.target.value)}
                    placeholder="Enter tax amount"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Drive Type */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Drive Type</label>
                  <select
                    value={formData.additionalInfo.driveType}
                    onChange={(e) => handleAdditionalInfoChange('driveType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select Drive Type</option>
                    {driveTypes.map((item: DriveType) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Boot Space */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Boot Space</label>
                  <select
                    value={formData.additionalInfo.bootSpace}
                    onChange={(e) => handleAdditionalInfoChange('bootSpace', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Select Boot Space</option>
                    {bootSpaces.map((item: BootSpace) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ====== FEATURES SECTION ====== */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sm:px-8">
              <h2 className="text-xl font-bold text-gray-900">Features</h2>
            </div>

            <div className="px-6 py-8 space-y-6 sm:px-8">
              <div>
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchFeatures}
                  onChange={(e) => setSearchFeatures(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFeatures.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center p-3 transition border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-900">{feature}</span>
                  </label>
                ))}
              </div>

              {filteredFeatures.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500">No features found matching your search</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Selected Features: <span className="font-semibold text-gray-900">{formData.features.length}</span>
                </p>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleFeatureToggle(feature)}
                          className="hover:text-blue-900"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ====== CONTACT INFORMATION SECTION ====== */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sm:px-8">
              <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
            </div>

            <div className="px-6 py-8 space-y-6 sm:px-8">
              <div className="space-y-4">
                {/* Contact Number */}
                <div className="flex items-center justify-between p-4 transition border border-gray-200 rounded-lg hover:bg-gray-50">
                  <label htmlFor="contactNumber" className="flex items-center flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">Contact Number</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleContactInfoChange('contactNumber', !formData.contactInfo.contactNumber)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.contactInfo.contactNumber ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.contactInfo.contactNumber ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* System Chat */}
                <div className="flex items-center justify-between p-4 transition border border-gray-200 rounded-lg hover:bg-gray-50">
                  <label htmlFor="systemChat" className="flex items-center flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">System Chat</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleContactInfoChange('systemChat', !formData.contactInfo.systemChat)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.contactInfo.systemChat ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.contactInfo.systemChat ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* WhatsApp Contact */}
                <div className="flex items-center justify-between p-4 transition border border-gray-200 rounded-lg hover:bg-gray-50">
                  <label htmlFor="whatsappContact" className="flex items-center flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">WhatsApp Contact</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleContactInfoChange('whatsappContact', !formData.contactInfo.whatsappContact)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.contactInfo.whatsappContact ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.contactInfo.whatsappContact ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Other Information */}
                <div className="flex items-center justify-between p-4 transition border border-gray-200 rounded-lg hover:bg-gray-50">
                  <label htmlFor="otherInformation" className="flex items-center flex-1 cursor-pointer">
                    <span className="text-sm font-medium text-gray-900">Other Information</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleContactInfoChange('otherInformation', !formData.contactInfo.otherInformation)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.contactInfo.otherInformation ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.contactInfo.otherInformation ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <hr className="my-6" />

              {/* Legal Agreement */}
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  checked={formData.contactInfo.agreedToTerms}
                  onChange={(e) => handleContactInfoChange('agreedToTerms', e.target.checked)}
                  className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="agreedToTerms" className="flex-1 cursor-pointer">
                  <span className="text-sm font-medium text-orange-600">
                    Yes I have legal rights to upload
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* ====== FORM BUTTONS ====== */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit and Continue'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Car Info Modal */}
      <CarInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleCarInfoSelect}
        years={years}
        makes={makes}
        models={models}
        variants={variants}
        selectedYear={formData.carInfo.year}
        selectedMake={formData.carInfo.make}
        selectedModel={formData.carInfo.model}
        onYearChange={(year) => {
          handleCarInfoChange('year', year);
          handleCarInfoChange('make', '');
          handleCarInfoChange('model', '');
          handleCarInfoChange('variant', '');
        }}
        onMakeChange={(make) => {
          handleCarInfoChange('make', make);
          handleCarInfoChange('model', '');
          handleCarInfoChange('variant', '');
        }}
        onModelChange={(model) => {
          handleCarInfoChange('model', model);
          handleCarInfoChange('variant', '');
        }}
        onVariantChange={(variant) => handleCarInfoChange('variant', variant)}
      />
    </div>
  );
}