import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import { LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GeoMap3D from "@/components/ui/GeoMap3D";
import ReportDetailsModal from "@/components/ui/ReportDetailsModal";
import SectionTitle from "@/components/ui/SectionTitle";
import StatTile from "@/components/ui/StatTile";
import { colors, font, gradients, radius, shadow } from "@/constants/theme";
import { api } from "@/lib/config";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- MOCK DATA ---
const MOCK_VENDORS = [
  { id: "V1001", name: "Alpha Moulding Corp", location: "Pune, MH" },
  { id: "V1002", name: "Precision Plastics", location: "Chennai, TN" },
  { id: "V1003", name: "Omega Tooling Services", location: "Delhi, NCR" },
  { id: "V1004", name: "Global Injectors Ltd", location: "Bangalore, KA" },
];

const MOCK_BRANDS = [
  { id: "B1", name: "Brand Premium" },
  { id: "B2", name: "Brand Standard" },
  { id: "B3", name: "Brand Economy" },
];

const MOCK_PRODUCTS = [
  { id: "P1", name: "Front Bumper Assembly", code: "PROD-FBA-01" },
  { id: "P2", name: "Dashboard Console", code: "PROD-DBC-02" },
  { id: "P3", name: "Door Trims", code: "PROD-DTM-03" },
  { id: "P4", name: "AC Vents", code: "PROD-ACV-04" },
];

const MOCK_REGIONS = [
  { id: "R1", name: "Domestic" },
  { id: "R2", name: "IBD" },
];

const MOCK_CATEGORIES = [
  { id: "C1", name: "Injection" },
  { id: "C2", name: "Cubic" },
  { id: "C3", name: "Core Back" },
];

const MOCK_CRITICALITIES = [
  { id: "CR1", name: "Major" },
  { id: "CR2", name: "Minor" },
  { id: "CR3", name: "Ok" },
  { id: "CR4", name: "Critical" },
];

const MOCK_MOLDS = [
  { moldCode: "MOLD-9001", moldDescription: "Front Bumper Mold A", status: "Running Asset", cost: 1250, region: "R1", category: "C1", criticality: "CR3" },
  { moldCode: "MOLD-9002", moldDescription: "Dashboard Console Mold", status: "Running Asset", cost: 3400, region: "R2", category: "C1", criticality: "CR1" },
  { moldCode: "MOLD-9003", moldDescription: "Door Trim Core", status: "NPA Asset", cost: 890, region: "R1", category: "C2", criticality: "CR2" },
  { moldCode: "MOLD-9004", moldDescription: "AC Vent Mold B", status: "Running Asset", cost: 5200, region: "R2", category: "C3", criticality: "CR4" },
  { moldCode: "MOLD-9005", moldDescription: "Inner Door Panel Mold", status: "NPA Asset", cost: 1100, region: "R1", category: "C1", criticality: "CR2" },
  { moldCode: "MOLD-9006", moldDescription: "Steering Wheel Mold", status: "NPA Asset", cost: 2300, region: "R2", category: "C2", criticality: "CR3" },
];

const MOCK_PURCHASE_ORDERS = [
  { id: "PO-2024-001", date: "2024-07-01", vendorId: "V1001", entity: "Alpha", amount: 15400, status: "Fulfilled" },
  { id: "PO-2024-002", date: "2024-07-05", vendorId: "V1001", entity: "Alpha", amount: 2300, status: "Pending" },
  { id: "PO-2024-003", date: "2024-07-12", vendorId: "V1002", entity: "Precision", amount: 8900, status: "Fulfilled" },
  { id: "PO-2024-004", date: "2024-07-15", vendorId: "V1003", entity: "Omega", amount: 12000, status: "Cancelled" },
  { id: "PO-2024-005", date: "2024-07-20", vendorId: "V1004", entity: "Global", amount: 4500, status: "Fulfilled" },
  { id: "PO-2024-006", date: "2024-07-22", entity: "Premium", amount: 5600, status: "Pending" },
  { id: "PO-2024-007", date: "2024-07-25", entity: "Standard", amount: 3200, status: "Fulfilled" },
  { id: "PO-2024-008", date: "2024-08-01", entity: "FBA", amount: 9800, status: "Fulfilled" },
  { id: "PO-2024-009", date: "2024-08-03", entity: "DBC", amount: 1500, status: "Pending" },
  { id: "PO-2024-010", date: "2024-08-04", entity: "MAT-9001", amount: 4000, status: "Fulfilled" },
  { id: "PO-2024-011", date: "2024-08-05", entity: "MAT-9004", amount: 1200, status: "Pending" },
  { id: "PO-2024-012", date: "2024-08-10", vendorId: "V1001", entity: "Alpha", amount: 4500, status: "Fulfilled" },
  { id: "PO-2024-013", date: "2024-08-11", vendorId: "V1001", entity: "Alpha", amount: 7200, status: "Fulfilled" },
  { id: "PO-2024-014", date: "2024-08-12", vendorId: "V1001", entity: "Alpha", amount: 1800, status: "Pending" },
  { id: "PO-2024-015", date: "2024-08-15", vendorId: "V1002", entity: "Precision", amount: 9300, status: "Fulfilled" },
  { id: "PO-2024-016", date: "2024-08-16", vendorId: "V1002", entity: "Precision", amount: 4100, status: "Cancelled" },
  { id: "PO-2024-017", date: "2024-08-18", vendorId: "V1003", entity: "Omega", amount: 5600, status: "Fulfilled" },
  { id: "PO-2024-018", date: "2024-08-20", vendorId: "V1003", entity: "Omega", amount: 11000, status: "Pending" },
  { id: "PO-2024-019", date: "2024-08-21", vendorId: "V1004", entity: "Global", amount: 8900, status: "Fulfilled" },
  { id: "PO-2024-020", date: "2024-08-25", vendorId: "V1004", entity: "Global", amount: 13500, status: "Fulfilled" },
  { id: "PO-2024-021", date: "2024-08-26", vendorId: "V1004", entity: "Global", amount: 2400, status: "Pending" },
  { id: "PO-2024-022", date: "2024-08-28", vendorId: "V1001", entity: "Alpha", amount: 5000, status: "Pending" },
  { id: "PO-2024-023", date: "2024-08-30", vendorId: "V1002", entity: "Precision", amount: 6200, status: "Fulfilled" },
];

// --- TYPES ---
type DrillState = {
  vendor?: any | null;
  brand?: any | null;
  product?: any | null;
  region?: any | null;
  moldCategory?: any | null;
  assetType?: "Running Asset" | "NPA Asset" | null;
  criticality?: any | null;
  moldDetail?: any | null;
  material?: any | null;
};

// --- 3D HOVER ANIMATION WRAPPER ---
const Hover3DWrapper = ({ children, onPress, style, tooltipText, setGlobalTooltip, hoverScale = 1.05 }: any) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const viewRef = useRef<View>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore
      onHoverIn={() => {
        scale.value = withSpring(hoverScale, { damping: 10, stiffness: 200 });
        translateY.value = withSpring(-8, { damping: 10, stiffness: 200 });

        if (tooltipText && setGlobalTooltip) {
          viewRef.current?.measureInWindow((x, y, width, height) => {
            setGlobalTooltip({ visible: true, text: tooltipText, x: x + width + 5, y: y + height / 2 - 15 });
          });
        }
      }}
      onHoverOut={() => {
        scale.value = withSpring(1);
        translateY.value = withSpring(0);
        if (tooltipText && setGlobalTooltip) {
          setGlobalTooltip(null);
        }
      }}
      onPressIn={() => {
        scale.value = withSpring(0.95);
        translateY.value = withSpring(4);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
        translateY.value = withSpring(0);
      }}
    >
      <Animated.View ref={viewRef} style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// --- STACKED 3D CHART COMPONENT ---
const Stacked3DBar = ({ val1, val2 }: any) => {
  const BAR_WIDTH = 42;
  
  // Non-linear scaling for better visibility of small values
  const h1 = val1 > 0 ? 25 + Math.sqrt(val1) * 15 : 0;
  const h2 = val2 > 0 ? 25 + Math.sqrt(val2) * 15 : 0;
  const totalHeight = h1 + h2;

  if (totalHeight === 0) {
    return (
      <View style={{ alignItems: "center", marginHorizontal: 12, justifyContent: "flex-end", height: 160 }}>
         <View style={{ width: BAR_WIDTH, height: 8, borderRadius: BAR_WIDTH / 2, backgroundColor: '#E5E7EB' }} />
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center", marginHorizontal: 12, justifyContent: "flex-end", height: 160 }}>
      {/* Floating Value Labels */}
      <View style={{ position: 'absolute', bottom: totalHeight + 16, alignItems: 'center', zIndex: 10 }}>
        {val2 > 0 && <Text style={{ fontSize: 11, fontWeight: '900', color: colors.danger, marginBottom: 2 }}>{val2} NPA</Text>}
        {val1 > 0 && <Text style={{ fontSize: 11, fontWeight: '900', color: colors.success }}>{val1} Run</Text>}
      </View>

      <View style={{ height: totalHeight, width: BAR_WIDTH, justifyContent: 'flex-end' }}>
        
        {/* NPA Part (Top) */}
        {h2 > 0 && (
          <View style={{ height: h2, position: 'absolute', bottom: h1, left: 0, right: 0, backgroundColor: colors.danger }}>
             <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(255,255,255,0.3)', 'rgba(0,0,0,0.5)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
             {/* NPA Cylinder Top Lid */}
             <View style={{ position: 'absolute', top: -BAR_WIDTH/4, left: 0, right: 0, height: BAR_WIDTH/2, borderRadius: BAR_WIDTH/4, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger }} />
          </View>
        )}

        {/* Running Part (Bottom) */}
        {h1 > 0 && (
          <View style={{ height: h1, position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.success }}>
             <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(255,255,255,0.4)', 'rgba(0,0,0,0.4)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
             {/* Running Cylinder Top Lid (Only visible if no NPA on top) */}
             {h2 === 0 && (
               <View style={{ position: 'absolute', top: -BAR_WIDTH/4, left: 0, right: 0, height: BAR_WIDTH/2, borderRadius: BAR_WIDTH/4, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.success }} />
             )}
          </View>
        )}

        {/* Cylinder Bottom Base (For depth) */}
        <View style={{ position: 'absolute', bottom: -BAR_WIDTH/4, left: 0, right: 0, height: BAR_WIDTH/2, borderRadius: BAR_WIDTH/4, backgroundColor: h1 > 0 ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.6)', zIndex: -1 }} />

      </View>
    </View>
  );
};

const StackedGroupedChart = ({ label, val1, val2, onPress, setGlobalTooltip }: any) => {
  return (
    <Hover3DWrapper onPress={onPress} tooltipText={`Running: ${val1} | NPA: ${val2}`} setGlobalTooltip={setGlobalTooltip}>
      <View style={{ alignItems: 'center', marginHorizontal: 4, marginTop: 12 }}>
        <Stacked3DBar val1={val1} val2={val2} />
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 12, width: 70, textAlign: 'center', fontWeight: 'bold' }} numberOfLines={2}>{label}</Text>
      </View>
    </Hover3DWrapper>
  );
};

// --- MODERN FLAT BAR CHART COMPONENT (COST ANALYSIS) ---
const ModernBarChart = ({ value, max, label, setGlobalTooltip, onPress }: any) => {
  const BAR_MAX_HEIGHT = 200;
  const BAR_WIDTH = 45;
  const height = Math.max((value / max) * BAR_MAX_HEIGHT, 15);

  return (
    <Hover3DWrapper onPress={onPress} setGlobalTooltip={setGlobalTooltip} tooltipText={`₹${value.toLocaleString()}`}>
      <View style={{ alignItems: "center", marginHorizontal: 16, justifyContent: "flex-end", height: BAR_MAX_HEIGHT + 60 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.ink, marginBottom: 8 }}>₹{value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}</Text>
        <View style={{ height: BAR_MAX_HEIGHT, width: BAR_WIDTH, justifyContent: 'flex-end', backgroundColor: '#F3F4F6', borderRadius: BAR_WIDTH / 2, overflow: 'hidden' }}>
          <LinearGradient colors={['#FF6B6B', '#D8365D']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ height: height, width: '100%', borderRadius: BAR_WIDTH / 2 }} />
        </View>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 16, width: 80, textAlign: 'center', fontWeight: '700' }} numberOfLines={2}>{label}</Text>
      </View>
    </Hover3DWrapper>
  );
};

// --- MODERN HORIZONTAL BAR CHART (WEB VARIANT) ---
const ModernHorizontalBarChart = ({ value, max, label, setGlobalTooltip, onPress }: any) => {
  const widthPercentage = Math.max((value / max) * 100, 5);

  return (
    <Hover3DWrapper onPress={onPress} hoverScale={1.015} setGlobalTooltip={setGlobalTooltip} tooltipText={`₹${value.toLocaleString()}`} style={{ width: '100%', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: "center", width: '100%', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' }}>
        <Text style={{ width: 110, fontSize: 13, color: colors.ink, fontWeight: '700' }} numberOfLines={2}>{label}</Text>
        <View style={{ flex: 1, height: 26, backgroundColor: '#E5E7EB', borderRadius: 16, overflow: 'hidden', marginHorizontal: 12 }}>
          <LinearGradient colors={['#FF6B6B', '#D8365D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', width: `${widthPercentage}%`, borderRadius: 16 }} />
        </View>
        <Text style={{ width: 80, fontSize: 14, fontWeight: '900', color: colors.ink, textAlign: 'right' }}>₹{value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}</Text>
      </View>
    </Hover3DWrapper>
  );
};

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const numColumns = isTablet ? 3 : 2;
  const gap = 12;
  const paddingHorizontal = 40;
  const availableWidth = width - paddingHorizontal - (gap * (numColumns - 1));
  const tileWidth = availableWidth / numColumns;

  const iconSize = isTablet ? 36 : 28;
  const iconWrapSize = isTablet ? 64 : 50;

  const [state, setState] = useState<DrillState>({ vendor: null, brand: null, product: null, region: null, moldCategory: null, assetType: null, criticality: null, moldDetail: null });
  const [hierarchyMode, setHierarchyMode] = useState<"Vendor-wise" | "Brand-wise">("Vendor-wise");
  const [search, setSearch] = useState({ vendor: "", brand: "", product: "", region: "", moldCategory: "", criticality: "", moldDetail: "" });

  const [chartDetail, setChartDetail] = useState<any>(null);
  const [globalTooltip, setGlobalTooltip] = useState<{ visible: boolean, text: string, x: number, y: number } | null>(null);

  const [vendorAssetsData, setVendorAssetsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const res = await api.get('/ZMM_MOULD_CARE_SRV/ZVendDashboardSet', {
          params: { $format: "json" }
        });
        console.log(res);
        setVendorAssetsData(res.data?.d?.results || []);
      } catch (error) {
        console.error("Failed to fetch vendor dashboard data", error);
      }
    };
    fetchVendorData();
  }, []);

  //console.log('Response', res.data?.d?.dashboardData);
  const groupedVendors = React.useMemo(() => {
    if (vendorAssetsData.length === 0) return [];
    const groups: Record<string, { id: string, name: string, running: number, npa: number, materials: any[] }> = {};
    vendorAssetsData.forEach(asset => {
      const lifnr = asset.LIFNR || asset.Lifnr;
      const name1 = asset.NAME1 || asset.Name1;
      const zrunning = asset.ZRUNNING || asset.Zrunning;
      const znpa = asset.ZNPA || asset.Znpa;
      const matnr = asset.MATNR || asset.Matnr;
      const maktx = asset.MAKTX || asset.Maktx;

      if (!lifnr) return; // Skip if no valid vendor ID

      if (!groups[lifnr]) {
        groups[lifnr] = { id: lifnr, name: name1 || `Vendor ${lifnr}`, running: 0, npa: 0, materials: [] };
      }
      if (zrunning === 'X') groups[lifnr].running += 1;
      if (znpa === 'X') groups[lifnr].npa += 1;
      groups[lifnr].materials.push({
        moldCode: matnr,
        description: maktx,
        status: zrunning === 'X' ? 'Running Asset' : 'NPA Asset',
        cost: 0
      });
    });
    return Object.values(groups);
  }, [vendorAssetsData]);

  const groupedBrands = React.useMemo(() => {
    if (vendorAssetsData.length === 0) return [];
    const groups: Record<string, { id: string, name: string, running: number, npa: number, materials: any[] }> = {};
    vendorAssetsData.forEach(asset => {
      const brandDesc = asset.BRANDDESC || asset.BrandDesc || asset.Branddesc || asset.brandDesc;
      if (!brandDesc) return;

      const zrunning = asset.ZRUNNING || asset.Zrunning;
      const znpa = asset.ZNPA || asset.Znpa;
      const matnr = asset.MATNR || asset.Matnr;
      const maktx = asset.MAKTX || asset.Maktx;

      if (!groups[brandDesc]) {
        groups[brandDesc] = { id: brandDesc, name: brandDesc, running: 0, npa: 0, materials: [] };
      }
      if (zrunning === 'X') groups[brandDesc].running += 1;
      if (znpa === 'X') groups[brandDesc].npa += 1;
      groups[brandDesc].materials.push({
        moldCode: matnr,
        description: maktx,
        status: zrunning === 'X' ? 'Running Asset' : 'NPA Asset',
        cost: 0
      });
    });
    return Object.values(groups);
  }, [vendorAssetsData]);

  // Dashboard Widget Expansion State
  const [expandedWidget, setExpandedWidget] = useState<"system" | "cost" | "vendors" | "brands" | "products" | null>(null);

  // Vendor Multi-Select State
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);

  useEffect(() => {
    if (groupedVendors.length > 0) {
      setSelectedVendors(groupedVendors.slice(0, 10).map(v => v.id));
    } else {
      setSelectedVendors(MOCK_VENDORS.slice(0, 10).map(v => v.id));
    }
  }, [groupedVendors]);

  // Brand Multi-Select State
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);

  useEffect(() => {
    if (groupedBrands.length > 0) {
      setSelectedBrands(groupedBrands.slice(0, 10).map(b => b.id));
    } else {
      setSelectedBrands(MOCK_BRANDS.slice(0, 10).map(b => b.id));
    }
  }, [groupedBrands]);

  // Cost Analysis Chart State
  const [costFilter, setCostFilter] = useState<"Vendor" | "Brand" | "Product" | "Material">("Vendor");
  const [costSearch, setCostSearch] = useState("");
  const [selectedCostItem, setSelectedCostItem] = useState<{ label: string, filterType: string } | null>(null);
  const [poSearch, setPoSearch] = useState("");

  const generateCostData = () => {
    if (vendorAssetsData.length > 0) {
      const dataMap: Record<string, number> = {};
      vendorAssetsData.forEach(asset => {
        let label = '';
        if (costFilter === "Vendor") label = asset.NAME1 || asset.Name1 || asset.Liefe || `Vendor ${asset.LIFNR || asset.Lifnr}`;
        else if (costFilter === "Brand") label = asset.BRANDDESC || asset.BrandDesc || asset.Branddesc || asset.brandDesc || `Brand ${asset.ZZBRAND_CODE || asset.ZzbrandCode}`;
        else if (costFilter === "Product") label = asset.ZZSUB_BRAND || asset.ZzsubBrand || 'Unknown Product';
        else if (costFilter === "Material") label = asset.MAKTX || asset.Maktx || asset.MATNR || asset.Matnr || 'Unknown Material';

        if (!label) return;
        const val = parseFloat(asset.KANSW || asset.Kansw || '0') || 0;
        if (!dataMap[label]) dataMap[label] = 0;
        dataMap[label] += val;
      });
      return Object.entries(dataMap).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    }

    if (costFilter === "Vendor") return MOCK_VENDORS.map((v, i) => ({ label: v.name.split(" ")[0], value: 12000 + (i * 5000) }));
    if (costFilter === "Brand") return MOCK_BRANDS.map((b, i) => ({ label: b.name.split(" ")[1], value: 8000 + (i * 3000) }));
    if (costFilter === "Product") return MOCK_PRODUCTS.map((p, i) => ({ label: p.code.split("-")[1], value: 4000 + (i * 1500) }));
    return MOCK_MOLDS.map((m) => ({ label: m.moldCode, value: m.cost }));
  };

  const allCostData = generateCostData();
  const costData = allCostData.filter(d => d.label.toLowerCase().includes(costSearch.toLowerCase()));
  const maxCost = Math.max(...allCostData.map(d => d.value)) * 1.2;

  const resetFromLevel = (level: number) => {
    if (hierarchyMode === "Vendor-wise") {
      if (level <= 1) setState(s => ({ ...s, brand: null, product: null, region: null, moldCategory: null, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 2) setState(s => ({ ...s, product: null, region: null, moldCategory: null, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 3) setState(s => ({ ...s, region: null, moldCategory: null, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 4) setState(s => ({ ...s, moldCategory: null, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 5) setState(s => ({ ...s, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 6) setState(s => ({ ...s, criticality: null, moldDetail: null }));
      else if (level <= 7) setState(s => ({ ...s, moldDetail: null }));
    } else {
      if (level <= 1) setState(s => ({ ...s, product: null, region: null, vendor: null, moldCategory: null, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 2) setState(s => ({ ...s, region: null, vendor: null, moldCategory: null, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 3) setState(s => ({ ...s, vendor: null, moldCategory: null, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 4) setState(s => ({ ...s, moldCategory: null, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 5) setState(s => ({ ...s, assetType: null, criticality: null, moldDetail: null }));
      else if (level <= 6) setState(s => ({ ...s, criticality: null, moldDetail: null }));
      else if (level <= 7) setState(s => ({ ...s, moldDetail: null }));
    }
  };

  const handleBreadcrumbClick = (level: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    resetFromLevel(level);
  };

  const handleSelectVendor = (v: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setState({ ...state, vendor: v });
    resetFromLevel(hierarchyMode === "Vendor-wise" ? 1 : 4);
  };
  const handleSelectBrand = (b: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setState({ ...state, brand: b });
    resetFromLevel(hierarchyMode === "Vendor-wise" ? 2 : 1);
  };
  const handleSelectProduct = (p: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setState({ ...state, product: p });
    resetFromLevel(hierarchyMode === "Vendor-wise" ? 3 : 2);
  };
  const handleSelectRegion = (r: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setState({ ...state, region: r });
    resetFromLevel(hierarchyMode === "Vendor-wise" ? 4 : 3);
  };
  const handleSelectCategory = (c: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setState({ ...state, moldCategory: c });
    resetFromLevel(5);
  };
  const handleSelectAssetType = (type: "Running Asset" | "NPA Asset") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setState({ ...state, assetType: type });
    resetFromLevel(6);
  };
  const handleSelectCriticality = (c: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setState({ ...state, criticality: c });
    resetFromLevel(7);
  };
  const handleSelectMold = (m: any) => {
    Haptics.selectionAsync();
    setState({ ...state, moldDetail: m });
  };

  const currentLevel = hierarchyMode === "Vendor-wise"
    ? (state.criticality ? "Molds" : state.assetType ? "Criticality" : state.moldCategory ? "Asset Types" : state.region ? "Categories" : state.product ? "Regions" : state.brand ? "Products" : state.vendor ? "Brands" : "Vendors")
    : (state.criticality ? "Molds" : state.assetType ? "Criticality" : state.moldCategory ? "Asset Types" : state.vendor ? "Categories" : state.region ? "Vendors" : state.product ? "Regions" : state.brand ? "Products" : "Brands");

  // Criticality calculations for dashboard
  const critCritical = MOCK_MOLDS.filter(m => m.criticality === "CR4").length;
  const critMajor = MOCK_MOLDS.filter(m => m.criticality === "CR1").length;
  const critMinor = MOCK_MOLDS.filter(m => m.criticality === "CR2").length;
  const critOk = MOCK_MOLDS.filter(m => m.criticality === "CR3").length;

  // --- CALCULATED VALUES FOR WIDGETS AND MODALS ---
  const filteredVendors = MOCK_VENDORS.filter(v => selectedVendors.includes(v.id));
  const vendorsRunning = vendorAssetsData.length > 0 
    ? vendorAssetsData.filter(a => selectedVendors.includes(a.LIFNR || a.Lifnr)).filter(a => (a.ZRUNNING || a.Zrunning) === 'X').length 
    : filteredVendors.reduce((acc, v) => acc + 60 + (MOCK_VENDORS.indexOf(v) * 10), 0);
  const vendorsNpa = vendorAssetsData.length > 0 
    ? vendorAssetsData.filter(a => selectedVendors.includes(a.LIFNR || a.Lifnr)).filter(a => (a.ZNPA || a.Znpa) === 'X').length 
    : filteredVendors.reduce((acc, v) => acc + 20 + (MOCK_VENDORS.indexOf(v) * 5), 0);

  const brandMult = selectedVendors.length >= 10 ? 1 : 0.6;
  const filteredBrandsMock = MOCK_BRANDS.filter(b => selectedBrands.includes(b.id));
  const brandsRunning = vendorAssetsData.length > 0
    ? vendorAssetsData.filter(a => selectedBrands.includes(a.BRANDDESC || a.BrandDesc || a.Branddesc || a.brandDesc)).filter(a => (a.ZRUNNING || a.Zrunning) === 'X').length
    : Math.round(filteredBrandsMock.reduce((acc, b, i) => acc + 80 - (i * 15), 0) * brandMult);
  const brandsNpa = vendorAssetsData.length > 0
    ? vendorAssetsData.filter(a => selectedBrands.includes(a.BRANDDESC || a.BrandDesc || a.Branddesc || a.brandDesc)).filter(a => (a.ZNPA || a.Znpa) === 'X').length
    : Math.round(filteredBrandsMock.reduce((acc, b, i) => acc + 15 + (i * 10), 0) * brandMult);

  const productsRunning = Math.round(MOCK_PRODUCTS.reduce((acc, p, i) => acc + 40 + (i * 12), 0) * brandMult);
  const productsNpa = Math.round(MOCK_PRODUCTS.reduce((acc, p, i) => acc + 10 + (i * 8), 0) * brandMult);

  const toggleVendorSelection = (id: string) => {
    setSelectedVendors(prev => {
      if (prev.includes(id)) {
        return prev.filter(v => v !== id);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleBrandSelection = (id: string) => {
    setSelectedBrands(prev => {
      if (prev.includes(id)) {
        return prev.filter(b => b !== id);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const renderVendorDropdown = () => (
    <Modal visible={showVendorDropdown} transparent={true} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '80%', maxHeight: '70%', backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink }}>Select Vendors ({selectedVendors.length}/10)</Text>
            <TouchableOpacity onPress={() => setShowVendorDropdown(false)}>
              <Icons.X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {(groupedVendors.length > 0 ? groupedVendors : MOCK_VENDORS).map(v => {
              const isSelected = selectedVendors.includes(v.id);
              return (
                <TouchableOpacity 
                  key={v.id} 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  onPress={() => toggleVendorSelection(v.id)}
                >
                  {isSelected ? (
                    <Icons.CheckSquare size={24} color={colors.primary} weight="fill" />
                  ) : (
                    <Icons.Square size={24} color={colors.textMuted} />
                  )}
                  <Text style={{ marginLeft: 12, fontSize: 16, color: colors.ink }}>
                    {v.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
          <TouchableOpacity style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 8, marginTop: 16, alignItems: 'center' }} onPress={() => setShowVendorDropdown(false)}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBrandDropdown = () => (
    <Modal visible={showBrandDropdown} transparent={true} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '80%', maxHeight: '70%', backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink }}>Select Brands ({selectedBrands.length}/10)</Text>
            <TouchableOpacity onPress={() => setShowBrandDropdown(false)}>
              <Icons.X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {(groupedBrands.length > 0 ? groupedBrands : MOCK_BRANDS).map(b => {
              const isSelected = selectedBrands.includes(b.id);
              return (
                <TouchableOpacity 
                  key={b.id} 
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  onPress={() => toggleBrandSelection(b.id)}
                >
                  {isSelected ? (
                    <Icons.CheckSquare size={24} color={colors.primary} weight="fill" />
                  ) : (
                    <Icons.Square size={24} color={colors.textMuted} />
                  )}
                  <Text style={{ marginLeft: 12, fontSize: 16, color: colors.ink }}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
          <TouchableOpacity style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 8, marginTop: 16, alignItems: 'center' }} onPress={() => setShowBrandDropdown(false)}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // --- RENDER WIDGETS (Reusable for inline vs full-screen) ---
  const renderSystemOverview = (isExpanded = false) => {
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={isExpanded ? { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'web' ? 40 : insets.top + 20 } : {}}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionTitle title="System Overview" subtitle="3D Insights (Running vs NPA)" />
          {!isExpanded && (
            <TouchableOpacity onPress={() => setExpandedWidget('system')} style={{ padding: 10, marginRight: 20, marginBottom: 20 }}>
              <Icons.ArrowsOut size={22} color={colors.textMuted} weight="bold" />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <TouchableOpacity onPress={() => setShowVendorDropdown(true)} style={[styles.pillBtn, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={[styles.pillText, { color: '#fff', marginRight: 4 }]}>
              Selected Vendors ({selectedVendors.length}/10)
            </Text>
            <Icons.CaretDown size={14} color="#fff" weight="bold" />
          </TouchableOpacity>
          {renderVendorDropdown()}

          <TouchableOpacity onPress={() => setShowBrandDropdown(true)} style={[styles.pillBtn, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={[styles.pillText, { color: '#fff', marginRight: 4 }]}>
              Selected Brands ({selectedBrands.length}/10)
            </Text>
            <Icons.CaretDown size={14} color="#fff" weight="bold" />
          </TouchableOpacity>
          {renderBrandDropdown()}
        </View>

        <ScrollView horizontal={!isExpanded} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} contentContainerStyle={[!isExpanded ? { paddingHorizontal: 20, gap: 20, paddingBottom: 24 } : { paddingHorizontal: 20, gap: 20, paddingBottom: 100, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
          {/* Chart 1: Vendors */}
          <View style={[styles.boxCard3D, shadow.soft, { width: 340, padding: 24, alignItems: 'flex-start', justifyContent: 'flex-start' }]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: font.body, fontWeight: font.bold, color: colors.ink }}>Vendors Overview</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: '600' }}>{vendorsRunning + vendorsNpa} Assets ({vendorsRunning} Running, {vendorsNpa} NPA)</Text>
              </View>
              {!isExpanded && (
                <TouchableOpacity onPress={() => setExpandedWidget('vendors')} style={{ padding: 4 }}>
                  <Icons.ArrowsOut size={18} color={colors.textMuted} weight="bold" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', minHeight: 180, width: '100%', justifyContent: 'center' }}>
              {groupedVendors.length > 0 ? (
                groupedVendors.map((v) => {
                  if (!selectedVendors.includes(v.id)) return null;
                  return <StackedGroupedChart key={v.id} label={v.name.split(" ")[0]} val1={v.running} val2={v.npa} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Vendor: ${v.name}`, running: v.running, npa: v.npa, materials: v.materials })} />
                })
              ) : (
                MOCK_VENDORS.map((v, i) => {
                  if (!selectedVendors.includes(v.id)) return null;
                  return <StackedGroupedChart key={v.id} label={v.name.split(" ")[0]} val1={60 + (i * 10)} val2={20 + (i * 5)} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Vendor: ${v.name}`, running: 60 + (i * 10), npa: 20 + (i * 5), materials: MOCK_MOLDS })} />
                })
              )}
            </View>
          </View>

          {/* Chart 2: Brands */}
          <View style={[styles.boxCard3D, shadow.soft, { width: 300, padding: 24, alignItems: 'flex-start', justifyContent: 'flex-start' }]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: font.body, fontWeight: font.bold, color: colors.ink }}>Brands Overview</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: '600' }}>{brandsRunning + brandsNpa} Assets ({brandsRunning} Running, {brandsNpa} NPA)</Text>
              </View>
              {!isExpanded && (
                <TouchableOpacity onPress={() => setExpandedWidget('brands')} style={{ padding: 4 }}>
                  <Icons.ArrowsOut size={18} color={colors.textMuted} weight="bold" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', minHeight: 180, width: '100%', justifyContent: 'center' }}>
              {groupedBrands.length > 0 ? (
                groupedBrands.map((b) => {
                  if (!selectedBrands.includes(b.id)) return null;
                  return <StackedGroupedChart key={b.id} label={b.name} val1={b.running} val2={b.npa} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Brand: ${b.name}`, running: b.running, npa: b.npa, materials: b.materials })} />
                })
              ) : (
                MOCK_BRANDS.map((b, i) => {
                  if (!selectedBrands.includes(b.id)) return null;
                  const val1 = Math.round((80 - (i * 15)) * brandMult);
                  const val2 = Math.round((15 + (i * 10)) * brandMult);
                  return <StackedGroupedChart key={b.id} label={b.name.split(" ")[1]} val1={val1} val2={val2} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Brand: ${b.name}`, running: val1, npa: val2, materials: MOCK_MOLDS })} />
                })
              )}
            </View>
          </View>

          {/* Chart 3: Products */}
          {/* <View style={[styles.boxCard3D, shadow.soft, { width: 340, padding: 24, alignItems: 'flex-start', justifyContent: 'flex-start' }]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: font.body, fontWeight: font.bold, color: colors.ink }}>Products Overview</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: '600' }}>{productsRunning + productsNpa} Assets ({productsRunning} Running, {productsNpa} NPA)</Text>
              </View>
              {!isExpanded && (
                <TouchableOpacity onPress={() => setExpandedWidget('products')} style={{ padding: 4 }}>
                  <Icons.ArrowsOut size={18} color={colors.textMuted} weight="bold" />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', minHeight: 180, width: '100%', justifyContent: 'center' }}>
              {MOCK_PRODUCTS.map((p, i) => {
                const val1 = Math.round((40 + (i * 12)) * brandMult);
                const val2 = Math.round((10 + (i * 8)) * brandMult);
                return <StackedGroupedChart key={p.id} label={p.code.split("-")[1]} val1={val1} val2={val2} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Product: ${p.name}`, running: val1, npa: val2, materials: MOCK_MOLDS })} />
              })}
            </View>
          </View> */}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 16, alignSelf: 'center', marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: colors.success }} /><Text style={{ fontSize: 13, color: colors.textMuted }}>Running Asset</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: colors.danger }} /><Text style={{ fontSize: 13, color: colors.textMuted }}>NPA Asset</Text></View>
        </View>
      </Animated.View>
    );
  };

  const renderCostAnalysis = (isExpanded = false) => (
    <Animated.View entering={FadeInDown.duration(400).delay(100)} style={isExpanded ? { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: Platform.OS === 'web' ? 40 : insets.top + 20 } : { paddingHorizontal: 20, marginBottom: 32 }}>
      <View style={[styles.modernCard, isExpanded && { flex: 1, borderRadius: 20 }]}>
        <View style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
          {!isExpanded && (
            <TouchableOpacity onPress={() => setExpandedWidget('cost')} style={{ padding: 8 }}>
              <Icons.ArrowsOut size={22} color={colors.textMuted} weight="bold" />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: font.sub, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 }}>Total Spend</Text>
            <Text style={{ fontSize: 36, fontWeight: '900', color: colors.ink, marginTop: 4 }}>
              ₹{allCostData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
            </Text>
          </View>
          <View style={{ backgroundColor: '#FFF5F5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill }}>
            <Text style={{ color: '#D8365D', fontWeight: '800', fontSize: 14 }}>+9.3%</Text>
          </View>
        </View>

        {/* Search & Filters */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32, alignItems: 'center' }}>
          <View style={[styles.searchBar, { flex: 1, marginHorizontal: 0, marginTop: 0, marginBottom: 0, borderRadius: radius.pill, backgroundColor: '#F9FAFB', borderColor: 'transparent', paddingVertical: 12 }]}>
            <Icons.MagnifyingGlass size={20} color={colors.textFaint} />
            <TextInput
              style={[styles.searchInput, { fontSize: font.body }]}
              placeholder={`Search ${costFilter.toLowerCase()}s...`}
              placeholderTextColor={colors.textFaint}
              value={costSearch}
              onChangeText={setCostSearch}
            />
            {costSearch ? (
              <TouchableOpacity onPress={() => setCostSearch("")}>
                <Icons.XCircle size={20} color={colors.textMuted} weight="fill" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, marginBottom: 24 }} contentContainerStyle={{ gap: 10 }}>
          {["Vendor", "Brand", "Product", "Material"].map(f => (
            <TouchableOpacity key={f} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setCostFilter(f as any); setCostSearch(''); }} style={[styles.modernPillBtn, costFilter === f && styles.modernPillBtnActive]}>
              <Text style={[styles.modernPillText, costFilter === f && styles.modernPillTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart View */}
        <View style={isExpanded ? { flex: 1 } : {}}>
          {(Platform.OS === 'web' || isExpanded) ? (
            <View style={isExpanded ? { flex: 1 } : { width: '100%', paddingVertical: 10 }}>
              {isExpanded ? (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
                  {costData.map((d, i) => (
                    <ModernHorizontalBarChart key={i} value={d.value} max={maxCost} label={d.label} setGlobalTooltip={setGlobalTooltip} onPress={() => setSelectedCostItem({ label: d.label, filterType: costFilter })} />
                  ))}
                </ScrollView>
              ) : (
                <View style={{ width: '100%' }}>
                  {costData.map((d, i) => (
                    <ModernHorizontalBarChart key={i} value={d.value} max={maxCost} label={d.label} setGlobalTooltip={setGlobalTooltip} onPress={() => setSelectedCostItem({ label: d.label, filterType: costFilter })} />
                  ))}
                </View>
              )}
              {costData.length === 0 && (
                <View style={{ padding: 40, alignItems: 'center', width: '100%' }}>
                  <Text style={{ color: colors.textMuted, fontSize: font.sub }}>No results found.</Text>
                </View>
              )}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingTop: 10, minHeight: 220, paddingBottom: 20 }}>
                {costData.map((d, i) => (
                  <ModernBarChart key={i} value={d.value} max={maxCost} label={d.label} setGlobalTooltip={setGlobalTooltip} onPress={() => setSelectedCostItem({ label: d.label, filterType: costFilter })} />
                ))}
                {costData.length === 0 && (
                  <View style={{ padding: 40, alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: colors.textMuted, fontSize: font.sub }}>No results found.</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const getDynamicVendors = () => {
    if (vendorAssetsData.length === 0) return MOCK_VENDORS;
    let data = vendorAssetsData;
    if (hierarchyMode === 'Brand-wise') {
      if (state.brand) data = data.filter(a => (a.BRANDDESC || a.BrandDesc || a.Branddesc || a.brandDesc || a.ZZBRAND_CODE || a.ZzbrandCode) === state.brand.id);
      if (state.product) data = data.filter(a => (a.ZZSUB_BRAND || a.ZzsubBrand) === state.product.id);
      if (state.region) data = data.filter(a => (a.VEND_REGION || a.VendRegion || a.STATE || a.State) === state.region.id);
    }
    const map = new Map();
    data.forEach(asset => {
      const id = asset.LIFNR || asset.Lifnr;
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, { id, name: asset.NAME1 || asset.Name1 || `Vendor ${id}`, location: asset.VEND_CITY || asset.VendCity || asset.STATE || asset.State || '' });
      }
    });
    return Array.from(map.values());
  };

  const getDynamicBrands = () => {
    if (vendorAssetsData.length === 0) return MOCK_BRANDS;
    let data = vendorAssetsData;
    if (hierarchyMode === 'Vendor-wise') {
      if (state.vendor) data = data.filter(a => (a.LIFNR || a.Lifnr) === state.vendor.id);
    }
    const map = new Map();
    data.forEach(asset => {
      const id = asset.BRANDDESC || asset.BrandDesc || asset.Branddesc || asset.brandDesc || asset.ZZBRAND_CODE || asset.ZzbrandCode;
      if (!id) return;
      if (!map.has(id)) {
        map.set(id, { id, name: id });
      }
    });
    return Array.from(map.values());
  };

  const getDynamicMolds = () => {
    if (vendorAssetsData.length === 0) {
      let data = MOCK_MOLDS;
      if (state.assetType) data = data.filter(m => m.status === state.assetType);
      if (state.region) data = data.filter(m => m.region === (state.region.id === 'Domestic' ? 'R1' : 'R2'));
      if (state.moldCategory) data = data.filter(m => m.category === state.moldCategory.id);
      return data;
    }

    let data = vendorAssetsData;
    if (state.vendor) data = data.filter(a => (a.LIFNR || a.Lifnr) === state.vendor.id);
    if (state.brand) data = data.filter(a => (a.BRANDDESC || a.BrandDesc || a.Branddesc || a.brandDesc || a.ZZBRAND_CODE || a.ZzbrandCode) === state.brand.id);
    
    if (state.region) {
      const isDomesticState = state.region.id === 'Domestic';
      data = data.filter(a => {
        const country = (a.COUNTRY || a.Country || a.VEND_COUNTRY || a.VendCountry || a.LAND1 || a.Land1 || '').toUpperCase();
        const isDom = country === 'IN' || country === 'INDIA';
        return isDomesticState ? isDom : !isDom;
      });
    }

    if (state.assetType) {
      const isRunning = state.assetType === 'Running Asset';
      data = data.filter(a => isRunning ? (a.ZRUNNING || a.Zrunning) === 'X' : (a.ZNPA || a.Znpa) === 'X');
    }

    if (state.moldCategory) {
      data = data.filter(a => {
        let cat = a.ZZMOLD_CAT || a.ZzmoldCat || a.Zzmoldcat || a.zzmoldcat || a.ZzMoldCat || a.MoldCat || a.Moldcat;
        if (cat === undefined || cat === null || cat === '') cat = 'Unknown';
        if (typeof cat === 'number') cat = cat.toString();
        cat = cat.trim();
        const numCat = parseInt(cat, 10).toString();
        const finalCat = isNaN(parseInt(numCat)) ? cat : numCat;
        return finalCat === state.moldCategory.id;
      });
    }

    const map = new Map();
    data.forEach(a => {
       const isRunning = (a.ZRUNNING || a.Zrunning) === 'X';
       const code = a.MATNR || a.Matnr || a.ANLN1 || a.Anln1;
       if (!code || map.has(code)) return;
       map.set(code, {
         moldCode: code,
         moldDescription: a.MAKTX || a.Maktx || 'Asset',
         status: isRunning ? "Running Asset" : "NPA Asset",
         cost: parseFloat(a.KANSW || a.Kansw || '0')
       });
    });
    return Array.from(map.values());
  };

  const MOLD_CATEGORY_MAP: Record<string, string> = {
    "1": "Bi-Injection (Core Back Technology)",
    "2": "Bi-Injection (Cube Technology)",
    "3": "Blow",
    "4": "EBM",
    "5": "IBM",
    "6": "ISBM",
    "7": "Injection",
    "8": "SBM"
  };

  const getDynamicCategories = () => {
    if (vendorAssetsData.length === 0) return MOCK_CATEGORIES;
    let data = vendorAssetsData;
    if (state.vendor) data = data.filter(a => (a.LIFNR || a.Lifnr) === state.vendor.id);
    if (state.brand) data = data.filter(a => (a.BRANDDESC || a.BrandDesc || a.Branddesc || a.brandDesc || a.ZZBRAND_CODE || a.ZzbrandCode) === state.brand.id);
    if (state.region) {
      const isDomesticState = state.region.id === 'Domestic';
      data = data.filter(a => {
        const country = (a.COUNTRY || a.Country || a.VEND_COUNTRY || a.VendCountry || a.LAND1 || a.Land1 || '').toUpperCase();
        const isDom = country === 'IN' || country === 'INDIA';
        return isDomesticState ? isDom : !isDom;
      });
    }

    const map = new Map();
    data.forEach(a => {
      let id = a.ZZMOLD_CAT || a.ZzmoldCat || a.Zzmoldcat || a.zzmoldcat || a.ZzMoldCat || a.MoldCat || a.Moldcat;
      if (id === undefined || id === null || id === '') id = 'Unknown';
      if (typeof id === 'number') id = id.toString();
      id = id.trim();
      const numId = parseInt(id, 10).toString();
      const finalId = isNaN(parseInt(numId)) ? id : numId;
      
      if (!map.has(finalId)) {
        map.set(finalId, { id: finalId, name: MOLD_CATEGORY_MAP[finalId] || (finalId === 'Unknown' ? 'Other/Unknown' : `Category ${finalId}`) });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderVendorList = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: hierarchyMode === 'Brand-wise' ? 24 : 0 }}>
      <SectionTitle title="Vendors" subtitle={hierarchyMode === 'Vendor-wise' ? "Select a vendor" : `Vendors for ${state.product?.name || ''}`} />
      <View style={styles.searchBar}>
        <Icons.MagnifyingGlass size={16} color={colors.textFaint} />
        <TextInput style={styles.searchInput} placeholder="Search vendors..." placeholderTextColor={colors.textFaint} value={search.vendor} onChangeText={(t) => setSearch({ ...search, vendor: t })} />
        {search.vendor ? <TouchableOpacity onPress={() => setSearch({ ...search, vendor: "" })}><Icons.XCircle size={16} color={colors.textMuted} weight="fill" /></TouchableOpacity> : null}
      </View>
      <View style={styles.gridList}>
        {getDynamicVendors().filter(v => v.name.toLowerCase().includes(search.vendor.toLowerCase()) || v.id.toLowerCase().includes(search.vendor.toLowerCase())).map((v) => {
          const isSelected = state.vendor?.id === v.id;
          return (
            <Hover3DWrapper key={v.id} onPress={() => handleSelectVendor(v)}>
              <View style={[styles.boxCard3D, shadow.soft, isSelected && styles.boxCardSelected3D, { width: tileWidth, padding: isTablet ? 20 : 12 }]}>
                <View style={[styles.iconCircle, isSelected && { backgroundColor: colors.brand }, { width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 }]}><Icons.Buildings size={iconSize} color={isSelected ? "#fff" : colors.brand} weight={isSelected ? "fill" : "duotone"} /></View>
                <Text style={[styles.boxTitle, isSelected && { color: colors.brand }, { fontSize: isTablet ? font.body : font.sub }, { textAlign: "center" }]} numberOfLines={2}>{v.name}</Text>
                <Text style={[styles.boxSubtitle, { fontSize: isTablet ? font.sub : font.micro }]} numberOfLines={1}>{v.location}</Text>
              </View>
            </Hover3DWrapper>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderBrandList = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: hierarchyMode === 'Vendor-wise' ? 24 : 0 }}>
      <SectionTitle title={hierarchyMode === 'Vendor-wise' ? `Brands (${state.assetType || ''})` : "Brands"} subtitle="Select a brand" />
      <View style={styles.searchBar}>
        <Icons.MagnifyingGlass size={16} color={colors.textFaint} />
        <TextInput style={styles.searchInput} placeholder="Search brands..." placeholderTextColor={colors.textFaint} value={search.brand} onChangeText={(t) => setSearch({ ...search, brand: t })} />
        {search.brand ? <TouchableOpacity onPress={() => setSearch({ ...search, brand: "" })}><Icons.XCircle size={16} color={colors.textMuted} weight="fill" /></TouchableOpacity> : null}
      </View>
      <View style={styles.gridList}>
        {getDynamicBrands().filter(b => b.name.toLowerCase().includes(search.brand.toLowerCase())).map((b) => {
          const isSelected = state.brand?.id === b.id;
          return (
            <Hover3DWrapper key={b.id} onPress={() => handleSelectBrand(b)}>
              <View style={[styles.boxCard3D, shadow.soft, isSelected && styles.boxCardSelected3D, { width: tileWidth, padding: isTablet ? 20 : 12 }]}>
                <View style={[styles.iconCircle, { backgroundColor: isSelected ? colors.info : colors.infoSoft, width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 }]}><Icons.Tag size={iconSize} color={isSelected ? "#fff" : colors.info} weight={isSelected ? "fill" : "duotone"} /></View>
                <Text style={[styles.boxTitle, isSelected && { color: colors.brand }, { fontSize: isTablet ? font.body : font.sub }, { textAlign: "center" }]} numberOfLines={2}>{b.name}</Text>
              </View>
            </Hover3DWrapper>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderProductList = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 24 }}>
      <SectionTitle title="Products" subtitle={`Products for ${state.brand?.name || ''}`} />
      <View style={styles.searchBar}>
        <Icons.MagnifyingGlass size={16} color={colors.textFaint} />
        <TextInput style={styles.searchInput} placeholder="Search products..." placeholderTextColor={colors.textFaint} value={search.product} onChangeText={(t) => setSearch({ ...search, product: t })} />
        {search.product ? <TouchableOpacity onPress={() => setSearch({ ...search, product: "" })}><Icons.XCircle size={16} color={colors.textMuted} weight="fill" /></TouchableOpacity> : null}
      </View>
      <View style={styles.gridList}>
        {MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.product.toLowerCase()) || p.code.toLowerCase().includes(search.product.toLowerCase())).map((p) => {
          const isSelected = state.product?.id === p.id;
          return (
            <Hover3DWrapper key={p.id} onPress={() => handleSelectProduct(p)}>
              <View style={[styles.boxCard3D, shadow.soft, isSelected && styles.boxCardSelected3D, { width: tileWidth, padding: isTablet ? 20 : 12 }]}>
                <View style={[styles.iconCircle, { backgroundColor: isSelected ? colors.warning : colors.warningSoft, width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 }]}><Icons.Cube size={iconSize} color={isSelected ? "#fff" : colors.warning} weight={isSelected ? "fill" : "duotone"} /></View>
                <Text style={[styles.boxTitle, isSelected && { color: colors.brand }, { fontSize: isTablet ? font.body : font.sub }, { textAlign: "center" }]} numberOfLines={2}>{p.name}</Text>
                <Text style={[styles.boxSubtitle, { fontSize: isTablet ? font.sub : font.micro }]} numberOfLines={1}>{p.code}</Text>
              </View>
            </Hover3DWrapper>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderAssetTabs = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.assetTabsWrap}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => handleSelectAssetType("Running Asset")} style={[styles.assetTab, state.assetType === "Running Asset" ? { backgroundColor: colors.success, borderColor: colors.success } : { borderColor: colors.successSoft }]}>
        <Icons.PlayCircle size={18} color={state.assetType === "Running Asset" ? "#fff" : colors.success} weight={state.assetType === "Running Asset" ? "fill" : "regular"} />
        <Text style={[styles.assetTabText, state.assetType === "Running Asset" ? { color: "#fff" } : { color: colors.success }]}>Running Asset</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.8} onPress={() => handleSelectAssetType("NPA Asset")} style={[styles.assetTab, state.assetType === "NPA Asset" ? { backgroundColor: colors.danger, borderColor: colors.danger } : { borderColor: colors.dangerSoft }]}>
        <Icons.WarningCircle size={18} color={state.assetType === "NPA Asset" ? "#fff" : colors.danger} weight={state.assetType === "NPA Asset" ? "fill" : "regular"} />
        <Text style={[styles.assetTabText, state.assetType === "NPA Asset" ? { color: "#fff" } : { color: colors.danger }]}>NPA Asset</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRegionList = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 24 }}>
      <SectionTitle title="Regions" subtitle="Domestic / IBD" />
      <View style={styles.searchBar}>
        <Icons.MagnifyingGlass size={16} color={colors.textFaint} />
        <TextInput style={styles.searchInput} placeholder="Search regions..." placeholderTextColor={colors.textFaint} value={search.region} onChangeText={(t) => setSearch({ ...search, region: t })} />
        {search.region ? <TouchableOpacity onPress={() => setSearch({ ...search, region: "" })}><Icons.XCircle size={16} color={colors.textMuted} weight="fill" /></TouchableOpacity> : null}
      </View>
      <View style={styles.gridList}>
        {[{ id: 'Domestic', name: 'Domestic' }, { id: 'IBD', name: 'IBD' }].filter(r => r.name.toLowerCase().includes(search.region.toLowerCase())).map((r) => {
          const isSelected = state.region?.id === r.id;
          return (
            <Hover3DWrapper key={r.id} onPress={() => handleSelectRegion(r)}>
              <View style={[styles.boxCard3D, shadow.soft, isSelected && styles.boxCardSelected3D, { width: tileWidth, padding: isTablet ? 20 : 12 }]}>
                <View style={[styles.iconCircle, { backgroundColor: isSelected ? colors.info : colors.infoSoft, width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 }]}><Icons.Globe size={iconSize} color={isSelected ? "#fff" : colors.info} weight={isSelected ? "fill" : "duotone"} /></View>
                <Text style={[styles.boxTitle, isSelected && { color: colors.brand }, { fontSize: isTablet ? font.body : font.sub }, { textAlign: "center" }]} numberOfLines={1}>{r.name}</Text>
              </View>
            </Hover3DWrapper>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderCategoryList = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 24 }}>
      <SectionTitle title="Mold Categories" subtitle="Injection / Cubic / Core Back" />
      <View style={styles.searchBar}>
        <Icons.MagnifyingGlass size={16} color={colors.textFaint} />
        <TextInput style={styles.searchInput} placeholder="Search categories..." placeholderTextColor={colors.textFaint} value={search.moldCategory} onChangeText={(t) => setSearch({ ...search, moldCategory: t })} />
        {search.moldCategory ? <TouchableOpacity onPress={() => setSearch({ ...search, moldCategory: "" })}><Icons.XCircle size={16} color={colors.textMuted} weight="fill" /></TouchableOpacity> : null}
      </View>
      <View style={styles.gridList}>
        {getDynamicCategories().filter(c => c.name.toLowerCase().includes(search.moldCategory.toLowerCase())).map((c) => {
          const isSelected = state.moldCategory?.id === c.id;
          return (
            <Hover3DWrapper key={c.id} onPress={() => handleSelectCategory(c)}>
              <View style={[styles.boxCard3D, shadow.soft, isSelected && styles.boxCardSelected3D, { width: tileWidth, padding: isTablet ? 20 : 12 }]}>
                <View style={[styles.iconCircle, { backgroundColor: isSelected ? colors.warning : colors.warningSoft, width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 }]}><Icons.Shapes size={iconSize} color={isSelected ? "#fff" : colors.warning} weight={isSelected ? "fill" : "duotone"} /></View>
                <Text style={[styles.boxTitle, isSelected && { color: colors.brand }, { fontSize: isTablet ? font.body : font.sub }, { textAlign: "center" }]} numberOfLines={1}>{c.name}</Text>
              </View>
            </Hover3DWrapper>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderCriticalityList = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 24 }}>
      <SectionTitle title="Criticality" subtitle="Major / Minor / Ok / Critical" />
      <View style={styles.searchBar}>
        <Icons.MagnifyingGlass size={16} color={colors.textFaint} />
        <TextInput style={styles.searchInput} placeholder="Search criticality..." placeholderTextColor={colors.textFaint} value={search.criticality} onChangeText={(t) => setSearch({ ...search, criticality: t })} />
        {search.criticality ? <TouchableOpacity onPress={() => setSearch({ ...search, criticality: "" })}><Icons.XCircle size={16} color={colors.textMuted} weight="fill" /></TouchableOpacity> : null}
      </View>
      <View style={styles.gridList}>
        {MOCK_CRITICALITIES.filter(c => c.name.toLowerCase().includes(search.criticality.toLowerCase())).map((c) => {
          const isSelected = state.criticality?.id === c.id;
          let tColor = colors.ink;
          if (c.name === "Ok") tColor = colors.success;
          if (c.name === "Critical") tColor = colors.danger;
          if (c.name === "Major") tColor = colors.warning;
          if (c.name === "Minor") tColor = colors.info;

          return (
            <Hover3DWrapper key={c.id} onPress={() => handleSelectCriticality(c)}>
              <View style={[styles.boxCard3D, shadow.soft, isSelected && styles.boxCardSelected3D, { width: tileWidth, padding: isTablet ? 20 : 12, borderColor: isSelected ? tColor : 'transparent' }]}>
                <View style={[styles.iconCircle, { backgroundColor: 'transparent', width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 }]}><Icons.Warning size={iconSize} color={tColor} weight={isSelected ? "fill" : "duotone"} /></View>
                <Text style={[styles.boxTitle, { color: tColor, fontSize: isTablet ? font.body : font.sub }, { textAlign: "center" }]} numberOfLines={1}>{c.name}</Text>
              </View>
            </Hover3DWrapper>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderMoldList = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 24 }}>
      <SectionTitle title="Molds" subtitle="Select to view inspection report" />
      <View style={styles.searchBar}>
        <Icons.MagnifyingGlass size={16} color={colors.textFaint} />
        <TextInput style={styles.searchInput} placeholder="Search molds..." placeholderTextColor={colors.textFaint} value={search.moldDetail} onChangeText={(t) => setSearch({ ...search, moldDetail: t })} />
        {search.moldDetail ? <TouchableOpacity onPress={() => setSearch({ ...search, moldDetail: "" })}><Icons.XCircle size={16} color={colors.textMuted} weight="fill" /></TouchableOpacity> : null}
      </View>
      <View style={styles.gridList}>
        {getDynamicMolds().filter(m => m.moldCode.toLowerCase().includes(search.moldDetail.toLowerCase()) || m.moldDescription.toLowerCase().includes(search.moldDetail.toLowerCase())).map((m) => {
          const isRunning = m.status === "Running Asset";
          const themeColor = isRunning ? colors.success : colors.danger;
          const themeSoftColor = isRunning ? colors.successSoft : colors.dangerSoft;

          return (
            <Hover3DWrapper key={m.moldCode} onPress={() => handleSelectMold(m)}>
              <View style={[styles.boxCard3D, shadow.soft, { borderColor: themeSoftColor, width: tileWidth, padding: isTablet ? 20 : 12 }]}>
                <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: themeSoftColor, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}><Text style={{ fontSize: 9, color: themeColor, fontWeight: 'bold' }}>₹{m.cost.toLocaleString()}</Text></View>
                <View style={[styles.iconCircle, { backgroundColor: themeSoftColor, width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2, marginTop: 10 }]}><Icons.ClipboardText size={iconSize} color={themeColor} weight="duotone" /></View>
                <Text style={[styles.boxTitle, { fontSize: isTablet ? font.body : font.sub }]} numberOfLines={1}>{m.moldCode}</Text>
                <Text style={[styles.boxSubtitle, { fontSize: isTablet ? font.sub : font.micro }, { textAlign: "center" }]} numberOfLines={2}>{m.moldDescription}</Text>
                <View style={[styles.viewReportBtn, { backgroundColor: themeSoftColor }]}><Text style={[styles.viewReportText, { color: themeColor }]}>View Report</Text></View>
              </View>
            </Hover3DWrapper>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderVendorWiseFlow = () => (
    <>
      {!state.vendor && renderVendorList()}
      {state.vendor && renderVendorList()}
      {state.vendor && renderBrandList()}
      {/* {state.brand && renderProductList()} */}
      {state.brand && renderRegionList()}
      {state.region && renderCategoryList()}
      {state.moldCategory && renderAssetTabs()}
      {/* {state.assetType && renderCriticalityList()} */}
      {state.assetType && renderMoldList()}
    </>
  );

  const renderBrandWiseFlow = () => (
    <>
      {!state.brand && renderBrandList()}
      {state.brand && renderBrandList()}
      {/* {state.brand && renderProductList()} */}
      {state.brand && renderRegionList()}
      {state.region && renderVendorList()}
      {state.vendor && renderCategoryList()}
      {state.moldCategory && renderAssetTabs()}
      {/* {state.assetType && renderCriticalityList()} */}
      {state.assetType && renderMoldList()}
    </>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* GLOBAL TOOLTIP */}
      {globalTooltip && globalTooltip.visible && (
        <View style={[styles.globalTooltip, { top: globalTooltip.y, left: globalTooltip.x }]} pointerEvents="none">
          <Text style={styles.tooltipText}>{globalTooltip.text}</Text>
        </View>
      )}

      {/* FULL SCREEN WIDGET MODAL */}
      <Modal visible={!!expandedWidget} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {expandedWidget === 'system' && renderSystemOverview(true)}
          {expandedWidget === 'cost' && renderCostAnalysis(true)}

          {/* INDIVIDUAL CARD EXPANSION VIEWS */}
          {expandedWidget === 'vendors' && (
            <View style={{ flex: 1, padding: 40, paddingTop: Platform.OS === 'web' ? 80 : insets.top + 40, alignItems: 'center' }}>
              <View style={[styles.boxCard3D, shadow.soft, { flex: 1, width: '100%', maxWidth: 800, padding: 40 }]}>
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 24, fontWeight: font.bold, color: colors.ink }}>Vendors Overview</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, fontWeight: 'bold' }}>Total: {vendorsRunning + vendorsNpa} Assets ({vendorsRunning} Running, {vendorsNpa} NPA)</Text>
                </View>
                <View style={{ flexDirection: 'row', paddingVertical: 16 }}>
                  <TouchableOpacity onPress={() => setShowVendorDropdown(true)} style={[styles.pillBtn, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }]}>
                    <Text style={[styles.pillText, { color: '#fff', marginRight: 4 }]}>
                      Selected Vendors ({selectedVendors.length}/10)
                    </Text>
                    <Icons.CaretDown size={14} color="#fff" weight="bold" />
                  </TouchableOpacity>
                  {renderVendorDropdown()}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', minHeight: 300, gap: 16 }}>
                    {groupedVendors.length > 0 ? (
                      groupedVendors.map((v) => {
                        if (!selectedVendors.includes(v.id)) return null;
                        return <StackedGroupedChart key={v.id} label={v.name.split(" ")[0]} val1={v.running} val2={v.npa} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Vendor: ${v.name}`, running: v.running, npa: v.npa, materials: v.materials })} />
                      })
                    ) : (
                      MOCK_VENDORS.map((v, i) => {
                        if (!selectedVendors.includes(v.id)) return null;
                        return <StackedGroupedChart key={v.id} label={v.name.split(" ")[0]} val1={60 + (i * 10)} val2={20 + (i * 5)} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Vendor: ${v.name}`, running: 60 + (i * 10), npa: 20 + (i * 5), materials: MOCK_MOLDS })} />
                      })
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {expandedWidget === 'brands' && (
            <View style={{ flex: 1, padding: 40, paddingTop: Platform.OS === 'web' ? 80 : insets.top + 40, alignItems: 'center' }}>
              <View style={[styles.boxCard3D, shadow.soft, { flex: 1, width: '100%', maxWidth: 800, padding: 40 }]}>
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 24, fontWeight: font.bold, color: colors.ink }}>Brands Overview</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, fontWeight: 'bold' }}>Total: {brandsRunning + brandsNpa} Assets ({brandsRunning} Running, {brandsNpa} NPA)</Text>
                </View>
                <View style={{ flexDirection: 'row', paddingVertical: 16 }}>
                  <TouchableOpacity onPress={() => setShowBrandDropdown(true)} style={[styles.pillBtn, { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center' }]}>
                    <Text style={[styles.pillText, { color: '#fff', marginRight: 4 }]}>
                      Selected Brands ({selectedBrands.length}/10)
                    </Text>
                    <Icons.CaretDown size={14} color="#fff" weight="bold" />
                  </TouchableOpacity>
                  {renderBrandDropdown()}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', minHeight: 300, gap: 16 }}>
                    {groupedBrands.length > 0 ? (
                      groupedBrands.map((b) => {
                        if (!selectedBrands.includes(b.id)) return null;
                        return <StackedGroupedChart key={b.id} label={b.name} val1={b.running} val2={b.npa} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Brand: ${b.name}`, running: b.running, npa: b.npa, materials: b.materials })} />
                      })
                    ) : (
                      MOCK_BRANDS.map((b, i) => {
                        if (!selectedBrands.includes(b.id)) return null;
                        const val1 = Math.round((80 - (i * 15)) * brandMult);
                        const val2 = Math.round((15 + (i * 10)) * brandMult);
                        return <StackedGroupedChart key={b.id} label={b.name.split(" ")[1]} val1={val1} val2={val2} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Brand: ${b.name}`, running: val1, npa: val2, materials: MOCK_MOLDS })} />
                      })
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          {/* {expandedWidget === 'products' && (
            <View style={{ flex: 1, padding: 40, paddingTop: Platform.OS === 'web' ? 80 : insets.top + 40, alignItems: 'center' }}>
              <View style={[styles.boxCard3D, shadow.soft, { flex: 1, width: '100%', maxWidth: 800, padding: 40 }]}>
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 24, fontWeight: font.bold, color: colors.ink }}>Products Overview</Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, fontWeight: 'bold' }}>Total: {productsRunning + productsNpa} Assets ({productsRunning} Running, {productsNpa} NPA)</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', minHeight: 300 }}>
                    {MOCK_PRODUCTS.map((p, i) => {
                      const val1 = Math.round((40 + (i * 12)) * brandMult);
                      const val2 = Math.round((10 + (i * 8)) * brandMult);
                      return <StackedGroupedChart key={p.id} label={p.code.split("-")[1]} val1={val1} val2={val2} setGlobalTooltip={setGlobalTooltip} onPress={() => setChartDetail({ title: `Product: ${p.name}`, running: val1, npa: val2, materials: MOCK_MOLDS })} />
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          )} */}

          <TouchableOpacity onPress={() => setExpandedWidget(null)} style={{ position: 'absolute', top: Platform.OS === 'web' ? 40 : insets.top + 20, right: 30, zIndex: 99, padding: 12, backgroundColor: '#fff', borderRadius: 30, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 }}>
            <Icons.X size={24} color={colors.ink} weight="bold" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* PURCHASE ORDER DETAILS MODAL */}
      <Modal visible={!!selectedCostItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%', width: '90%', maxWidth: 600 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                Asset Details: {selectedCostItem?.label}
              </Text>
              <TouchableOpacity onPress={() => { setSelectedCostItem(null); setPoSearch(""); }}>
                <Icons.X size={24} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { marginHorizontal: 0, marginTop: 0, borderRadius: 12, paddingVertical: 8 }]}>
              <Icons.MagnifyingGlass size={18} color={colors.textFaint} />
              <TextInput
                style={[styles.searchInput, { fontSize: 13 }]}
                placeholder="Search Assets..."
                placeholderTextColor={colors.textFaint}
                value={poSearch}
                onChangeText={setPoSearch}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1, marginTop: 12 }} contentContainerStyle={{ paddingBottom: 20 }}>
              {(vendorAssetsData.length > 0 ? vendorAssetsData.filter(asset => {
                let label = '';
                if (selectedCostItem?.filterType === "Vendor") label = asset.NAME1 || asset.Name1 || asset.Liefe || `Vendor ${asset.LIFNR || asset.Lifnr}`;
                else if (selectedCostItem?.filterType === "Brand") label = asset.BRANDDESC || asset.BrandDesc || asset.Branddesc || asset.brandDesc || `Brand ${asset.ZZBRAND_CODE || asset.ZzbrandCode}`;
                else if (selectedCostItem?.filterType === "Product") label = asset.ZZSUB_BRAND || asset.ZzsubBrand || 'Unknown Product';
                else if (selectedCostItem?.filterType === "Material") label = asset.MAKTX || asset.Maktx || asset.MATNR || asset.Matnr || 'Unknown Material';

                if (label !== selectedCostItem?.label) return false;

                const searchLower = poSearch.toLowerCase();
                const assetNo = (asset.ANLN1 || asset.Anln1 || '').toLowerCase();
                const vendorName = (asset.LIEFE || asset.Liefe || asset.NAME1 || asset.Name1 || '').toLowerCase();
                
                if (searchLower && !assetNo.includes(searchLower) && !vendorName.includes(searchLower)) {
                    return false;
                }
                return true;
              }) : []).map((asset, idx) => (
                <View key={idx} style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 15, color: colors.ink }}>Asset: {asset.ANLN1 || asset.Anln1}</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 15, color: colors.ink }}>₹{parseFloat(asset.KANSW || asset.Kansw || '0').toLocaleString()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.textMuted }}>Vendor: {asset.LIEFE || asset.Liefe || asset.NAME1 || asset.Name1}</Text>
                    <Text style={{ fontSize: 13, color: colors.danger, fontWeight: 'bold' }}>Depreciation: ₹{parseFloat(asset.KNAFA || asset.Knafa || '0').toLocaleString()}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: colors.textFaint }}>Acq Year: {asset.ZUJHR || asset.Zujhr} | Run Year: {asset.GJAHR || asset.Gjahr}</Text>
                    <Text style={{ fontSize: 12, color: colors.textFaint }}>Acq Date: {asset.AIBDT || asset.Aibdt}</Text>
                  </View>
                </View>
              ))}
              {vendorAssetsData.length === 0 && (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>No asset details available (waiting for data).</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerIconWrap}>
            <Icons.SquaresFour size={24} color="#fff" weight="duotone" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerKicker}>ADMIN DASHBOARD</Text>
            <Text style={styles.headerTitle}>{currentLevel}</Text>
          </View>
        </View>

        {/* Clickable Breadcrumb */}
        {(hierarchyMode === "Vendor-wise" ? state.vendor : state.brand) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.breadcrumbScroll}>
            <View style={styles.breadcrumb}>
              {hierarchyMode === "Vendor-wise" ? (
                <>
                  <TouchableOpacity onPress={() => handleBreadcrumbClick(1)}>
                    <Text style={styles.breadcrumbText}>{state.vendor?.name}</Text>
                  </TouchableOpacity>
                  {state.brand && (
                    <>
                      <Icons.CaretRight size={14} color="rgba(255,255,255,0.6)" weight="bold" />
                      <TouchableOpacity onPress={() => handleBreadcrumbClick(2)}>
                        <Text style={styles.breadcrumbText}>{state.brand.name}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {state.product && (
                    <>
                      <Icons.CaretRight size={14} color="rgba(255,255,255,0.6)" weight="bold" />
                      <TouchableOpacity activeOpacity={1}>
                        <Text style={styles.breadcrumbText} numberOfLines={1}>{state.product.name}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => handleBreadcrumbClick(1)}>
                    <Text style={styles.breadcrumbText}>{state.brand?.name}</Text>
                  </TouchableOpacity>
                  {state.product && (
                    <>
                      <Icons.CaretRight size={14} color="rgba(255,255,255,0.6)" weight="bold" />
                      <TouchableOpacity onPress={() => handleBreadcrumbClick(2)}>
                        <Text style={styles.breadcrumbText}>{state.product.name}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {state.vendor && (
                    <>
                      <Icons.CaretRight size={14} color="rgba(255,255,255,0.6)" weight="bold" />
                      <TouchableOpacity onPress={() => handleBreadcrumbClick(3)}>
                        <Text style={styles.breadcrumbText}>{state.vendor.name}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {state.assetType && (
                    <>
                      <Icons.CaretRight size={14} color="rgba(255,255,255,0.6)" weight="bold" />
                      <TouchableOpacity activeOpacity={1}>
                        <Text style={styles.breadcrumbText} numberOfLines={1}>{state.assetType}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        )}
      </LinearGradient>

      {/* MAIN CONTENT AREA */}
      {!expandedWidget && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>

          {/* CRITICALITY KPI OVERVIEW */}
          <View style={{ marginBottom: 24 }}>
            <SectionTitle title="Criticality Overview" subtitle="Network asset health" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 }}>
              <View style={{ flex: 1, minWidth: 100 }}>
                <StatTile value={critCritical} label="Critical" icon={<Icons.Warning size={20} color={colors.danger} weight="duotone" />} tint={colors.danger} tintBg={colors.dangerSoft} />
              </View>
              <View style={{ flex: 1, minWidth: 100 }}>
                <StatTile value={critMajor} label="Major" icon={<Icons.WarningCircle size={20} color={colors.warning} weight="duotone" />} tint={colors.warning} tintBg={colors.warningSoft} />
              </View>
              <View style={{ flex: 1, minWidth: 100 }}>
                <StatTile value={critMinor} label="Minor" icon={<Icons.Info size={20} color={colors.info} weight="duotone" />} tint={colors.info} tintBg={colors.infoSoft} />
              </View>
              <View style={{ flex: 1, minWidth: 100 }}>
                <StatTile value={critOk} label="Ok" icon={<Icons.Check size={20} color={colors.success} weight="duotone" />} tint={colors.success} tintBg={colors.successSoft} />
              </View>
            </View>
          </View>

          {renderSystemOverview()}
          <View style={{ paddingHorizontal: 20 }}>
            <GeoMap3D data={vendorAssetsData} />
          </View>
          {renderCostAnalysis()}

          {/* HIERARCHY TOGGLE */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, marginTop: 10, gap: 12 }}>
            <TouchableOpacity onPress={() => { setHierarchyMode("Brand-wise"); setState({ vendor: null, assetType: null, brand: null, product: null, material: null }); }} style={[styles.pillBtn, hierarchyMode === "Brand-wise" && styles.pillBtnActive]}>
              <Text style={[styles.pillText, hierarchyMode === "Brand-wise" && styles.pillTextActive]}>Brand-wise Drilldown</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setHierarchyMode("Vendor-wise"); setState({ vendor: null, assetType: null, brand: null, product: null, material: null }); }} style={[styles.pillBtn, hierarchyMode === "Vendor-wise" && styles.pillBtnActive]}>
              <Text style={[styles.pillText, hierarchyMode === "Vendor-wise" && styles.pillTextActive]}>Vendor-wise Drilldown</Text>
            </TouchableOpacity>
          </View>

          {hierarchyMode === "Vendor-wise" ? renderVendorWiseFlow() : renderBrandWiseFlow()}
        </ScrollView>
      )}

      {/* REPORT MODAL */}
      <ReportDetailsModal
        visible={!!state.material}
        report={state.material ? { Matnr: state.material.materialCode, Lifnr: state.vendor?.id, Maktx: state.material.materialDescription } : null}
        onClose={() => setState({ ...state, material: null })}
      />

      {/* CHART DETAILS MODAL WITH SEGREGATION */}
      <Modal visible={!!chartDetail} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle} numberOfLines={2}>{chartDetail?.title}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, marginBottom: 12 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.success, fontSize: 24, fontWeight: 'bold' }}>{chartDetail?.running}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Running</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.danger, fontSize: 24, fontWeight: 'bold' }}>{chartDetail?.npa}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>NPA</Text>
              </View>
            </View>

            {chartDetail?.materials && (
              <View style={{ flex: 1, width: '100%' }}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.success, marginTop: 16, marginBottom: 8 }}>Running Assets</Text>
                  <View style={{ backgroundColor: colors.successSoft, borderRadius: radius._15, padding: 12 }}>
                    {chartDetail.materials.filter((m: any) => m.status === 'Running Asset').map((m: any, idx: number) => (
                      <View key={`r-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }}>
                        <Icons.PlayCircle size={20} color={colors.success} weight="fill" />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.ink }}>{m.moldCode}</Text>
                          <Text style={{ fontSize: 10, color: colors.textMuted }}>{m.description}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.success }}>${m.cost}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.danger, marginTop: 20, marginBottom: 8 }}>NPA Assets</Text>
                  <View style={{ backgroundColor: colors.dangerSoft, borderRadius: radius._15, padding: 12 }}>
                    {chartDetail.materials.filter((m: any) => m.status === 'NPA Asset').map((m: any, idx: number) => (
                      <View key={`n-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }}>
                        <Icons.WarningCircle size={20} color={colors.danger} weight="fill" />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.ink }}>{m.moldCode}</Text>
                          <Text style={{ fontSize: 10, color: colors.textMuted }}>{m.description}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.danger }}>${m.cost}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setChartDetail(null)}>
              <Text style={styles.closeBtnText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: { flexDirection: "row", alignItems: "center" },
  headerIconWrap: { padding: 10, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: radius._15 },
  headerKicker: { color: "rgba(255,255,255,0.85)", fontSize: font.micro, fontWeight: font.bold, letterSpacing: 1 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: font.black, marginTop: 2 },

  breadcrumbScroll: { marginTop: 16 },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: 6 },
  breadcrumbText: { color: "#fff", fontSize: font.sub, fontWeight: font.semibold },

  content: { paddingVertical: 20 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius._15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: font.sub,
    color: colors.ink,
  },

  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  pillBtnActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  pillText: { fontSize: font.sub, color: colors.textMuted, fontWeight: font.bold },
  pillTextActive: { color: '#fff' },

  gridList: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 10
  },

  boxCard3D: {
    height: "auto",
    minHeight: 150,
    backgroundColor: colors.surface,
    borderRadius: radius._20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderBottomColor: '#E2E2E6',
    borderRightWidth: 2,
    borderRightColor: '#E2E2E6',
  },
  boxCardSelected3D: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
    borderBottomColor: colors.brandLight,
    borderRightColor: colors.brandLight,
  },
  iconCircle: {
    backgroundColor: colors.brandSoft,
    alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  boxTitle: { fontSize: font.sub, fontWeight: font.bold, color: colors.ink, marginBottom: 4 },
  boxSubtitle: { fontSize: font.micro, color: colors.textMuted },

  assetTabsWrap: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  assetTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radius._15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assetTabActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  assetTabText: { fontSize: font.sub, fontWeight: font.bold, color: colors.textMuted },
  assetTabTextActive: { color: "#fff" },

  viewReportBtn: {
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 10,
  },
  viewReportText: { fontSize: font.micro, color: colors.brand, fontWeight: font.bold },

  globalTooltip: {
    position: 'absolute',
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 99999,
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  modernPillBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: '#F3F4F6',
  },
  modernPillBtnActive: {
    backgroundColor: '#1F2937',
  },
  modernPillText: {
    fontSize: font.body,
    color: '#6B7280',
    fontWeight: '700',
  },
  modernPillTextActive: {
    color: '#ffffff',
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: radius._20, padding: 24, width: '80%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 10
  },
  modalTitle: { fontSize: font.h3, fontWeight: font.bold, color: colors.ink },
  closeBtn: { marginTop: 24, backgroundColor: colors.surfaceAlt, paddingVertical: 12, borderRadius: radius.pill, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  closeBtnText: { fontSize: font.body, fontWeight: font.bold, color: colors.ink },
});
