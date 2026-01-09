import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';

import { pick, types } from '@react-native-documents/picker';
import { getRawPcmData, getWaveformData } from 'react-native-audio-data';

// --- Waveform 组件保持不变 ---
const WaveformView = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.waveformContainer, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Waveform will appear here</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data, 0.0001);
  const scale = 1 / maxVal;

  return (
    <View style={styles.waveformContainer}>
      <Text style={styles.chartTitle}>WAVEFORM PREVIEW ({data.length} points)</Text>
      <View style={styles.barsContainer}>
        {data.map((value, index) => {
          let heightPercent = (value * scale) * 100;
          heightPercent = Math.max(heightPercent, 2);
          return (
            <View
              key={index}
              style={[
                styles.bar,
                {
                  height: `${heightPercent}%`,
                  opacity: 0.5 + (value * scale) * 0.5,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

export default function App() {
  const [log, setLog] = useState<string>('Waiting for action...');
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // 👈 2. 新增输入框状态，默认 "50"
  const [pointCount, setPointCount] = useState<string>('50');

  const handlePickAndProcess = async () => {
    try {
      setLoading(true);
      setLog('Picking file...');
      setSelectedPath(null);
      setWaveformData([]);

      // 👈 3. 解析输入值，如果是无效数字则回退到 50
      const targetPoints = parseInt(pointCount, 10) || 50;

      const results = await pick({
        type: [types.audio],
        allowMultiSelection: false,
      });

      const file = results[0];
      if (!file) {
        setLog('No file selected');
        return;
      }

      setSelectedPath(file.uri);

      // 👈 4. 使用输入的 targetPoints
      setLog(`Selected: ${file.name}\nProcessing ${targetPoints} points...`);
      const points = await getWaveformData(file.uri, targetPoints);
      setWaveformData(points);

      const result = await getRawPcmData(file.uri);
      const { buffer, channels, sampleRate, totalPCMFrameCount } = result;

      setLog(prev =>
        prev +
        `\n\n✅ Success!` +
        `\nRequested Points: ${targetPoints}` +
        `\nActual Points: ${points.length}` +
        `\nBuffer ByteLength: ${buffer.byteLength}` +
        `\nChannels: ${channels}` +
        `\nSampleRate: ${sampleRate}` +
        `\nTotal Frames: ${totalPCMFrameCount}`
      );

    } catch (err) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as any).code === 'DOCUMENT_PICKER_CANCELED') {
        setLog('User cancelled');
      } else {
        console.error(err);
        setLog(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Audio Data Nitro Demo</Text>

        {selectedPath && (
          <View style={styles.pathContainer}>
            <Text style={styles.pathLabel}>Current File Path:</Text>
            <Text style={styles.pathText} selectable numberOfLines={1} ellipsizeMode="middle">
              {selectedPath}
            </Text>
          </View>
        )}

        <WaveformView data={waveformData} />

        {/* 👈 5. 新增输入框区域 */}
        <View style={styles.settingsContainer}>
          <Text style={styles.settingLabel}>Target Blocks:</Text>
          <TextInput
            style={styles.input}
            value={pointCount}
            onChangeText={setPointCount}
            keyboardType="numeric" // 只允许输入数字
            maxLength={4} // 限制长度，防止输入太多卡死渲染
            placeholder="50"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Processing..." : "Pick Audio & Analyze"}
            onPress={handlePickAndProcess}
            disabled={loading}
          />
        </View>

        <Text style={styles.label}>Log Output:</Text>
        <ScrollView style={styles.logBox}>
          <Text style={styles.logText}>{log}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'stretch',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  pathContainer: {
    backgroundColor: '#e3e3e3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  pathLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  pathText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  waveformContainer: {
    height: 100,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderColor: '#aaa',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  chartTitle: {
    position: 'absolute',
    top: 4,
    left: 8,
    color: '#555',
    fontSize: 9,
    fontWeight: 'bold',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingTop: 8,
  },
  bar: {
    flex: 1,
    backgroundColor: '#00e5ff',
    marginHorizontal: 1,
    borderRadius: 2,
    minHeight: 2,
  },
  // 👈 6. 新增 Settings 样式
  settingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  settingLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  logBox: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
  },
  logText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});