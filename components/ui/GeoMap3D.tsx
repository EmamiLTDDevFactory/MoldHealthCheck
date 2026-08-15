import React from 'react';
import { View, StyleSheet, Platform, Text, useWindowDimensions, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius, shadow, font } from '@/constants/theme';
import * as Icons from 'phosphor-react-native';

const LOCATIONS = [
  { name: 'Amingaon (India)', lat: 26.18, lng: 91.67, running: 120, npa: 15 },
  { name: 'Ambala (India)', lat: 30.37, lng: 76.77, running: 85, npa: 10 },
  { name: 'Qatar', lat: 25.27, lng: 51.50, running: 250, npa: 55 },
  { name: 'Dubai (UAE)', lat: 25.20, lng: 55.27, running: 400, npa: 80 },
  { name: 'Kuwait', lat: 29.37, lng: 47.97, running: 150, npa: 20 }
];

const getHtmlContent = (locationsObj: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow: hidden; }
    #mapViz { width: 100vw; height: 100vh; }
    .pin-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;
      transition: all 0.2s ease;
      transform-origin: bottom center;
      cursor: pointer;
    }
    .pin-wrapper:hover {
      transform: scale(1.05);
      z-index: 10;
    }
    .pin-glass {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 10px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      margin-bottom: 10px;
      position: relative;
      min-width: 140px;
    }
    .pin-glass::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px 6px 0;
      border-style: solid;
      border-color: rgba(15, 23, 42, 0.85) transparent transparent transparent;
    }
    .pin-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 6px;
    }
    .pin-name {
      color: #f8fafc;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pin-stats {
      display: flex;
      justify-content: space-between;
      gap: 6px;
    }
    .stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(255,255,255,0.05);
      padding: 6px 4px;
      border-radius: 6px;
      flex: 1;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .stat-val {
      font-size: 14px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 4px;
    }
    .stat-lbl {
      font-size: 8px;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .val-run { color: #10b981; }
    .val-npa { color: #f43f5e; }
    
    .pin-marker {
      position: relative;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .core {
      width: 12px;
      height: 12px;
      background: #3b82f6;
      border: 2px solid #fff;
      border-radius: 50%;
      z-index: 2;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
    }
    .pulse {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(59, 130, 246, 0.6);
      border-radius: 50%;
      animation: pulseAnim 2s infinite ease-out;
      z-index: 1;
    }
    @keyframes pulseAnim {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(3.5); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="mapViz"></div>
  <script>
    const locations = ${JSON.stringify(locationsObj)};
    
    // Initialize MapLibre GL JS map with 3D pitch and colorful OpenStreetMap tiles (shows state borders clearly)
    const map = new maplibregl.Map({
      container: 'mapViz',
      style: {
        "version": 8,
        "sources": {
          "osm": {
            "type": "raster",
            "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            "tileSize": 256,
            "attribution": "© OpenStreetMap contributors"
          }
        },
        "layers": [{
          "id": "osm-tiles",
          "type": "raster",
          "source": "osm",
          "minzoom": 0,
          "maxzoom": 19
        }]
      },
      center: [78.9629, 22.5937], // India center [lng, lat]
      zoom: 3.8,
      pitch: 50, // 3D tilt
      bearing: 0,
      dragRotate: true
    });

    // Add navigation controls (zoom, rotation)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    locations.forEach(d => {
      const el = document.createElement('div');
      el.className = 'pin-wrapper';
      el.innerHTML = \`
        <div class="pin-glass">
          <div class="pin-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#3b82f6" viewBox="0 0 256 256"><path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path></svg>
            <div class="pin-name">\${d.name}</div>
          </div>
          <div class="pin-stats">
            <div class="stat-box">
              <span class="stat-val val-run">\${d.running}</span>
              <span class="stat-lbl">Running</span>
            </div>
            <div class="stat-box">
              <span class="stat-val val-npa">\${d.npa}</span>
              <span class="stat-lbl">NPA</span>
            </div>
          </div>
        </div>
        <div class="pin-marker">
          <div class="pulse"></div>
          <div class="core"></div>
        </div>
      \`;

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([d.lng, d.lat])
        .addTo(map);
    });
  </script>
</body>
</html>
`;

export default function GeoMap3D({ data = [] }: { data?: any[] }) {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  
  const dynamicLocations = React.useMemo(() => {
    if (!data || data.length === 0) return LOCATIONS;

    const map = new Map();
    data.forEach(item => {
      const regionName = item.VEND_REG_NAME || item.VendRegName || item.STATE || item.State || 'Unknown Region';
      
      if (!map.has(regionName)) {
        let lat = 22 + (regionName.length % 10);
        let lng = 75 + (regionName.charCodeAt(0) % 15);
        
        const rLower = regionName.toLowerCase();
        if (rLower.includes('bengal') || regionName === 'WBL') {
            lat = 22.98; lng = 87.85;
        } else if (rLower.includes('maharashtra') || regionName === 'MH') {
            lat = 19.75; lng = 75.71;
        } else if (rLower.includes('gujarat') || regionName === 'GJ') {
            lat = 22.25; lng = 71.19;
        } else if (rLower.includes('karnataka') || regionName === 'KA') {
            lat = 15.31; lng = 75.71;
        } else if (regionName === 'URC') {
            lat = 26.18; lng = 91.67;
        }
        
        map.set(regionName, {
          name: regionName,
          lat,
          lng,
          running: 0,
          npa: 0
        });
      }
      
      const loc = map.get(regionName);
      if (item.ZRUNNING === 'X' || item.Zrunning === 'X') {
         loc.running += 1;
      } else if (item.ZNPA === 'X' || item.Znpa === 'X') {
         loc.npa += 1;
      } else {
         loc.running += 1;
      }
    });

    return Array.from(map.values());
  }, [data]);

  const htmlContent = getHtmlContent(dynamicLocations);

  return (
    <View style={[styles.container, shadow.soft]}>
      <View style={styles.header}>
         <Icons.GlobeHemisphereWest size={24} color={colors.brand} weight="duotone" />
         <Text style={styles.title}>Global Asset Distribution</Text>
      </View>
      <Text style={styles.subtitle}>Geographical analysis of Running vs NPA molds</Text>
      
      <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 20 }}>
        {/* Globe Visualization */}
        <View style={[styles.mapWrap, isTablet && { flex: 2 }]}>
          {Platform.OS === 'web' ? (
            <iframe 
              srcDoc={htmlContent} 
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: radius._24 }} 
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <WebView
              source={{ html: htmlContent }}
              style={styles.webview}
              scrollEnabled={false}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
          {/* Legend Overlay on Map */}
          <View style={styles.legend}>
             <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={styles.legendText}>Running</Text>
             </View>
             <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                <Text style={styles.legendText}>NPA</Text>
             </View>
          </View>
        </View>
        
        {/* Region Statistics Panel */}
        <View style={[styles.statsPanel, isTablet && { flex: 1 }]}>
          <Text style={styles.statsTitle}>Region Breakdown</Text>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
             {dynamicLocations.map((loc, i) => (
                <View key={i} style={styles.statCard}>
                   <Text style={styles.statRegion}>{loc.name}</Text>
                   <View style={styles.statRow}>
                      <View style={styles.statBadge}>
                         <View style={[styles.dot, { backgroundColor: colors.success }]} />
                         <Text style={styles.statText}>{loc.running} Running</Text>
                      </View>
                      <View style={styles.statBadge}>
                         <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                         <Text style={styles.statText}>{loc.npa} NPA</Text>
                      </View>
                   </View>
                </View>
             ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: radius._32,
    padding: 20,
    width: '100%',
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: font.bold,
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },
  mapWrap: {
    width: '100%',
    height: 400,
    borderRadius: radius._24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsPanel: {
    width: '100%',
    maxHeight: 400,
    backgroundColor: colors.bg,
    borderRadius: radius._24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: font.bold,
    color: colors.ink,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: radius._12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statRegion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius._6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  }
});
