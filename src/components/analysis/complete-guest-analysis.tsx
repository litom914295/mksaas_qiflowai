'use client';

import BaziApiResult from '@/components/qiflow/analysis/bazi-api-result';
import { ReportExportShare } from '@/components/reports/report-export-share';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { LuckPillarAnalysis } from '@/lib/bazi/luck-pillars';
import {
  type FlyingStarExplanation,
  type GenerateFlyingStarOutput,
  generateFlyingStar,
  generateFlyingStarExplanation,
} from '@/lib/fengshui';
import type {
  Room as DetectedRoom,
  Door,
  Point,
  Wall,
  Window,
} from '@/lib/image-processing/types';
import type { BaziReportData } from '@/lib/reports/types';
import type {
  RoomMappingResult,
  SpaceMappingResult,
} from '@/lib/space-mapping/types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  Home,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { FengshuiDisplay } from './fengshui-display';
import { FlyingStarAnalysis } from './flying-star-analysis';
import { StandardFloorPlan } from './standard-floor-plan';

// 导入新的罗盘组件
import CompassThemeSelector from '@/components/compass/compass-theme-selector';
import SimpleCompass from '@/components/compass/simple-compass';
import type { CompassThemeKey } from '@/lib/compass/themes';

interface PersonalData {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  location: string;
}

interface HouseData {
  orientation: number; // Orientation angle (0-360 degrees)
  address: string;
  floor: number;
  roomCount: number;
  compassMethod: 'manual' | 'compass';
}

interface AnalysisData {
  personal: PersonalData;
  house: HouseData;
  floorPlan?: any;
  baziResult?: any;
  fengshuiResult?: GenerateFlyingStarOutput;
  fengshuiExplanation?: FlyingStarExplanation;
}

interface GuestAnalysisPageProps {
  locale?: string;
}

export function GuestAnalysisPage({}: GuestAnalysisPageProps = {}) {
  const t = useTranslations();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [compassOrientation, setCompassOrientation] = useState<number | null>(
    null
  );
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<any>(null);
  const [selectedCompassTheme, setSelectedCompassTheme] =
    useState<CompassThemeKey>('compass');

  // Complete report data state
  const [completeReportData, setCompleteReportData] =
    useState<BaziReportData | null>(null);
  const [luckPillarsData] = useState<LuckPillarAnalysis[]>([]);

  // Bazi analysis completion callback
  const handleBaziAnalysisComplete = useCallback(
    (result: any) => {
      console.log('Enhanced Bazi analysis completed:', result);

      // Build complete report data
      if (result && analysisData) {
        const reportData: BaziReportData = {
          personalInfo: {
            name: analysisData.personal.name,
            gender: analysisData.personal.gender,
            birthDate: analysisData.personal.birthDate,
            birthTime: analysisData.personal.birthTime || '12:00:00',
            birthLocation: analysisData.personal.location,
          },
          baziAnalysis: result,
          luckPillarsAnalysis: luckPillarsData,
          fengshuiAnalysis: analysisData.fengshuiResult,
          generatedAt: new Date(),
        };

        setCompleteReportData(reportData);
      }
    },
    [analysisData, luckPillarsData, setCompleteReportData]
  );

  // Step configuration
  const steps = [
    {
      id: 1,
      title: t('analysis.steps.personalData'),
      icon: User,
      description: t('analysis.steps.personalDataDesc'),
    },
    {
      id: 2,
      title: t('analysis.steps.houseOrientation'),
      icon: Home,
      description: t('analysis.steps.houseOrientationDesc'),
    },
    {
      id: 3,
      title: t('analysis.steps.baziAnalysis'),
      icon: Star,
      description: t('analysis.steps.baziAnalysisDesc'),
    },
    {
      id: 4,
      title: t('analysis.steps.flyingStar'),
      icon: Sparkles,
      description: t('analysis.steps.flyingStarDesc'),
    },
  ];

  // Handle personal data submission
  const handlePersonalDataSubmit = (data: PersonalData) => {
    setAnalysisData((prev) =>
      prev
        ? {
            ...prev,
            personal: data,
          }
        : {
            personal: data,
            house: {} as HouseData,
          }
    );
    setCurrentStep(2);
  };

  // Handle house orientation submission
  const handleHouseDataSubmit = (data: HouseData) => {
    setAnalysisData((prev) =>
      prev
        ? {
            ...prev,
            house: data,
          }
        : {
            personal: {} as PersonalData,
            house: data,
          }
    );
    setCurrentStep(3);
  };

  // Handle compass orientation update
  const handleCompassOrientation = (orientation: number) => {
    setCompassOrientation(orientation);
  };

  // Handle floor plan selection
  const handleFloorPlanSelect = (floorPlan: any) => {
    setSelectedFloorPlan(floorPlan);
    setAnalysisData((prev) =>
      prev
        ? {
            ...prev,
            floorPlan: floorPlan,
          }
        : {
            personal: {} as PersonalData,
            house: {} as HouseData,
            floorPlan: floorPlan,
          }
    );
  };

  // Fill sample data with one click
  const fillSampleData = () => {
    const samplePersonalData: PersonalData = {
      name: t('guestAnalysis.sampleData.name'),
      birthDate: '1990-05-15',
      birthTime: '14:30',
      gender: 'male',
      location: t('guestAnalysis.sampleData.location'),
    };

    const sampleHouseData: HouseData = {
      orientation: 180,
      address: t('guestAnalysis.sampleData.address'),
      floor: 15,
      roomCount: 3,
      compassMethod: 'manual',
    };

    const sampleFloorPlan = {
      id: 'standard-3room',
      name: t('guestAnalysis.sampleData.floorPlanName'),
      description: t('guestAnalysis.sampleData.floorPlanDescription'),
      orientation: 180,
    };

    setAnalysisData({
      personal: samplePersonalData,
      house: sampleHouseData,
      floorPlan: sampleFloorPlan,
    });
    setCompassOrientation(180);
    setSelectedFloorPlan(sampleFloorPlan);
  };

  // Start analysis
  const startAnalysis = async () => {
    if (!analysisData) return;

    setIsAnalyzing(true);

    try {
      // Simulate analysis process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Bazi analysis results (keeping original mock data)
      const baziResult = {
        fourPillars: {
          year: t('bazi.fourPillars.year'),
          month: t('bazi.fourPillars.month'),
          day: t('bazi.fourPillars.day'),
          hour: t('bazi.fourPillars.hour'),
        },
        fiveElements: {
          wood: 2,
          fire: 2,
          earth: 1,
          metal: 1,
          water: 2,
        },
        favorableElements: ['wood', 'fire'],
        unfavorableElements: ['metal', 'water'],
        analysis: t('bazi.analysis.sampleAnalysis'),
      };

      // Use new Flying Star functionality
      const fengshuiResult = generateFlyingStar({
        observedAt: new Date(),
        facing: { degrees: analysisData.house.orientation },
        config: {
          toleranceDeg: 0.5,
          applyTiGua: false,
          applyFanGua: false,
          evaluationProfile: 'standard',
        },
      });

      // Generate detailed explanation
      const fengshuiExplanation = generateFlyingStarExplanation(
        fengshuiResult.plates.period,
        fengshuiResult.period,
        fengshuiResult.geju!,
        fengshuiResult.wenchangwei!,
        fengshuiResult.caiwei!
      );

      setAnalysisData((prev) =>
        prev
          ? {
              ...prev,
              baziResult,
              fengshuiResult,
              fengshuiExplanation,
            }
          : {
              personal: {} as PersonalData,
              house: {} as HouseData,
              baziResult,
              fengshuiResult,
              fengshuiExplanation,
            }
      );

      setCurrentStep(4);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Build FengshuiDisplay required data based on selected floor plan
  const buildFengshuiInputs = (): {
    rooms: DetectedRoom[];
    walls: Wall[];
    doors: Door[];
    windows: Window[];
    spaceMapping: SpaceMappingResult;
  } | null => {
    if (!selectedFloorPlan) return null;

    // Convert standard floor plan room data to detected room structure
    const unit = 1000; // Unit pixel conversion (virtual)
    const rooms: DetectedRoom[] = (selectedFloorPlan.rooms || []).map(
      (r: any, idx: number) => {
        const x = (r.position?.x ?? 0) * unit;
        const y = (r.position?.y ?? 0) * unit;
        const w = (r.size?.width ?? 3) * unit;
        const h = (r.size?.height ?? 3) * unit;
        const coordinates: Point[] = [
          { x, y },
          { x: x + w, y },
          { x: x + w, y: y + h },
          { x, y: y + h },
        ];
        const center: Point = { x: x + w / 2, y: y + h / 2 };

        const typeMap: Record<string, DetectedRoom['type']> = {
          living: 'living_room',
          living_room: 'living_room',
          bedroom: 'bedroom',
          study: 'study',
          kitchen: 'kitchen',
          bathroom: 'bathroom',
          dining: 'dining_room',
          dining_room: 'dining_room',
        } as const;

        const mappedType = typeMap[r.type] ?? 'unknown';

        return {
          id: r.id ?? `room-${idx + 1}`,
          name: r.name ?? t('floorPlan.roomFallback', { index: idx + 1 }),
          type: mappedType,
          coordinates,
          center,
          area: w * h,
          confidence: 0.9,
          annotations: [],
        } as DetectedRoom;
      }
    );

    // Simple 3x3 Nine Palace mapping: assign rooms to positions 1-9 based on center point
    const getPalaceIndex = (p: Point): number => {
      // Divide into 3x3 grid based on relative x/y size (left-center-right, top-center-bottom)
      const xs = rooms.map((r) => r.center.x);
      const ys = rooms.map((r) => r.center.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const x1 = minX + (maxX - minX) / 3;
      const x2 = minX + ((maxX - minX) * 2) / 3;
      const y1 = minY + (maxY - minY) / 3;
      const y2 = minY + ((maxY - minY) * 2) / 3;

      const col = p.x < x1 ? 1 : p.x < x2 ? 2 : 3; // 1 left, 2 center, 3 right
      const row = p.y < y1 ? 1 : p.y < y2 ? 2 : 3; // 1 top, 2 center, 3 bottom

      // Nine Palace index (top-left to bottom-right 1..9)
      return (row - 1) * 3 + col;
    };

    const roomMappings: RoomMappingResult[] = rooms.map((r) => ({
      roomId: r.id,
      palaceIndex: getPalaceIndex(r.center),
      coordinates: r.coordinates,
      center: r.center,
      area: r.area,
      confidence: 0.9,
      alignmentScore: 0.9,
    }));

    const spaceMapping: SpaceMappingResult = {
      alignment: {
        rotationAngle:
          typeof analysisData?.house?.orientation === 'number'
            ? analysisData!.house.orientation
            : (selectedFloorPlan.orientation ?? 0),
        translation: { x: 0, y: 0 },
        confidence: 0.9,
        method: 'manual',
        processingTime: 10,
      },
      roomMappings,
      overallConfidence: 0.9,
      processingTime: 20,
      success: true,
    };

    // Simplified: no walls, doors, windows needed here, pass empty arrays
    const walls: Wall[] = [];
    const doors: Door[] = [];
    const windows: Window[] = [];

    return { rooms, walls, doors, windows, spaceMapping };
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                isActive
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // Render personal data form
  const renderPersonalDataForm = () => (
    <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            {t('guestAnalysis.personalForm.title')}
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={fillSampleData}
            className="flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            {t('guestAnalysis.personalForm.quickFill')}
          </Button>
        </div>
        <p className="text-gray-600">
          {t('guestAnalysis.personalForm.description')}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data: PersonalData = {
            name: formData.get('name') as string,
            birthDate: formData.get('birthDate') as string,
            birthTime: formData.get('birthTime') as string,
            gender: formData.get('gender') as 'male' | 'female',
            location: formData.get('location') as string,
          };
          handlePersonalDataSubmit(data);
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('guestAnalysis.personalForm.nameRequired')}
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={analysisData?.personal?.name || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('guestAnalysis.personalForm.namePlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('guestAnalysis.personalForm.genderRequired')}
            </label>
            <select
              name="gender"
              required
              defaultValue={analysisData?.personal?.gender || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {t('guestAnalysis.personalForm.genderPlaceholder')}
              </option>
              <option value="male">
                {t('guestAnalysis.personalForm.male')}
              </option>
              <option value="female">
                {t('guestAnalysis.personalForm.female')}
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('guestAnalysis.personalForm.birthDateRequired')}
            </label>
            <input
              type="date"
              name="birthDate"
              required
              defaultValue={analysisData?.personal?.birthDate || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('guestAnalysis.personalForm.birthTime')}
            </label>
            <input
              type="time"
              name="birthTime"
              defaultValue={analysisData?.personal?.birthTime || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('guestAnalysis.personalForm.birthPlaceRequired')}
          </label>
          <input
            type="text"
            name="location"
            required
            defaultValue={analysisData?.personal?.location || ''}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('guestAnalysis.personalForm.birthPlacePlaceholder')}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="px-8 py-3">
            {t('guestAnalysis.personalForm.nextHouseOrientation')}
          </Button>
        </div>
      </form>
    </Card>
  );

  // Render house orientation form
  const renderHouseDataForm = () => (
    <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            {t('guestAnalysis.houseForm.title')}
          </h3>
          <Button
            type="button"
            variant="outline"
            onClick={fillSampleData}
            className="flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            {t('guestAnalysis.houseForm.quickFill')}
          </Button>
        </div>
        <p className="text-gray-600">
          {t('guestAnalysis.houseForm.description')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Floor plan selection */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-green-600" />
            {t('guestAnalysis.houseForm.selectFloorPlan')}
          </h4>
          <StandardFloorPlan
            onFloorPlanSelect={handleFloorPlanSelect}
            selectedFloorPlan={selectedFloorPlan}
          />
        </div>

        {/* Compass component */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            {t('guestAnalysis.houseForm.digitalCompass')}
          </h4>
          {/* 罗盘主题选择器 */}
          <div className="mb-6">
            <h5 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded" />
              选择罗盘样式
            </h5>
            <CompassThemeSelector
              currentTheme={selectedCompassTheme}
              onThemeChange={setSelectedCompassTheme}
            />
          </div>

          {/* 风水罗盘组件 */}
          <div className="mb-4">
            <SimpleCompass
              theme={selectedCompassTheme}
              onDirectionChange={handleCompassOrientation}
              interactive={true}
              enableAnimation={true}
              showDetailedInfo={true}
              width={400}
              height={400}
            />
          </div>
          {compassOrientation !== null && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {t('guestAnalysis.houseForm.currentOrientation')}{' '}
                <span className="font-bold">
                  {compassOrientation.toFixed(1)}°
                </span>
              </p>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data: HouseData = {
              orientation:
                compassOrientation ||
                Number.parseFloat(formData.get('orientation') as string),
              address: formData.get('address') as string,
              floor: Number.parseInt(formData.get('floor') as string),
              roomCount: Number.parseInt(formData.get('roomCount') as string),
              compassMethod: compassOrientation ? 'compass' : 'manual',
            };
            handleHouseDataSubmit(data);
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('guestAnalysis.houseForm.orientationRequired')}
              </label>
              <input
                type="number"
                name="orientation"
                min="0"
                max="360"
                step="0.1"
                value={
                  compassOrientation || analysisData?.house?.orientation || ''
                }
                onChange={(e) =>
                  setCompassOrientation(Number.parseFloat(e.target.value))
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t(
                  'guestAnalysis.houseForm.orientationPlaceholder'
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('guestAnalysis.houseForm.floor')}
              </label>
              <input
                type="number"
                name="floor"
                min="1"
                defaultValue={analysisData?.house?.floor || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('guestAnalysis.houseForm.floorPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('guestAnalysis.houseForm.address')}
              </label>
              <input
                type="text"
                name="address"
                defaultValue={analysisData?.house?.address || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('guestAnalysis.houseForm.addressPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('guestAnalysis.houseForm.roomCount')}
              </label>
              <input
                type="number"
                name="roomCount"
                min="1"
                defaultValue={analysisData?.house?.roomCount || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('guestAnalysis.houseForm.roomCountPlaceholder')}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              {t('analysis.previousStep')}
            </Button>
            <Button type="submit" className="px-8 py-3">
              {t('analysis.nextStep')}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );

  // Render analysis results
  const renderAnalysisResults = () => (
    <div className="space-y-8">
      {/* AI-enhanced Bazi and Luck Pillar analysis results */}
      {analysisData?.baziResult && (
        <Card className="p-8 shadow-xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 backdrop-blur-sm border-2 border-purple-200">
          <div className="mb-6">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              {t('analysis.aiEnhancedBazi')}
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {t('analysis.aiEnhancedBaziDescription')}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-1">
                <Target className="w-4 h-4" />
                {t('analysis.professionalTenGods')}
              </div>
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t('analysis.majorEventPrediction')}
              </div>
              <div className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {t('analysis.yearlyInteraction')}
              </div>
              <div className="px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {t('analysis.lifeFortuneCycle')}
              </div>
            </div>
          </div>
          <BaziApiResult
            personal={{
              name: analysisData.personal.name,
              birthDate: analysisData.personal.birthDate,
              birthTime: analysisData.personal.birthTime || '12:00',
              gender: analysisData.personal.gender,
              birthCity: analysisData.personal.location,
              calendarType: 'solar',
            }}
            onAnalysisComplete={handleBaziAnalysisComplete}
          />
        </Card>
      )}

      {/* Flying Star analysis results */}
      {analysisData?.fengshuiResult && analysisData?.fengshuiExplanation && (
        <div className="space-y-6">
          {/* Use new Nine Palace Flying Star analysis component */}
          <FlyingStarAnalysis
            fengshuiResult={analysisData.fengshuiResult}
            fengshuiExplanation={analysisData.fengshuiExplanation}
          />

          {/* Original floor plan display */}
          {(() => {
            const inputs = buildFengshuiInputs();
            if (!inputs) {
              return (
                <Card className="p-6 shadow-xl bg-white/90 backdrop-blur-sm">
                  <div className="text-sm text-orange-600">
                    {t('guestAnalysis.floorPlan.noSelectionNote')}
                  </div>
                </Card>
              );
            }
            return (
              <Card className="p-6 shadow-xl bg-white/90 backdrop-blur-sm">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('guestAnalysis.floorPlan.sectionTitle')}
                </h4>
                <FengshuiDisplay
                  spaceMapping={inputs.spaceMapping}
                  rooms={inputs.rooms}
                  walls={inputs.walls}
                  doors={inputs.doors}
                  windows={inputs.windows}
                  bazi={analysisData?.baziResult || null}
                />
              </Card>
            );
          })()}
        </div>
      )}

      {/* Report export and sharing functionality */}
      {completeReportData && (
        <ReportExportShare reportData={completeReportData} className="mt-8" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation bar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('guestAnalysis.navigation.back')}
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  {t('guestAnalysis.navigation.title')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step indicator */}
        {renderStepIndicator()}

        {/* Page header */}
        {currentStep <= 2 && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {currentStep === 1
                ? t('guestAnalysis.steps.discoverDestiny')
                : t('guestAnalysis.steps.determineLayout')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {currentStep === 1
                ? t('guestAnalysis.steps.professionalInsights')
                : t('guestAnalysis.steps.preciseLayout')}
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="space-y-8">
          {currentStep === 1 && renderPersonalDataForm()}
          {currentStep === 2 && renderHouseDataForm()}
          {currentStep === 3 && (
            <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('guestAnalysis.analysis.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('guestAnalysis.analysis.description')}
                </p>
                <Button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="px-8 py-3"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t('guestAnalysis.analyzing')}
                    </>
                  ) : (
                    t('guestAnalysis.analysis.start')
                  )}
                </Button>
              </div>
            </Card>
          )}
          {currentStep === 4 && renderAnalysisResults()}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500">
          <p className="text-sm">{t('guestAnalysis.disclaimer')}</p>
        </footer>
      </div>
    </div>
  );
}
