import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  ScrollView,
  SafeAreaView,
} from 'react-native';

// 使用新库的具名导入
import { pick, types } from '@react-native-documents/picker';

// 你的库
import { getRawPcmData } from 'react-native-audio-data';

export default function App() {
  const [log, setLog] = useState<string>('Waiting for action...');
  const [loading, setLoading] = useState(false);
  
  // ✨ 新增：专门用于存储和显示路径的状态
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handlePickAndProcess = async () => {
    try {
      setLoading(true);
      setLog('Picking file...');
      setSelectedPath(null); // 重置路径显示

      // 1. 选择文件
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
      
      setLog(`Selected: ${file.name}\nURI: ${file.uri}\n\n Processed Uri: Processing...`);

      const buffer = await getRawPcmData(file.uri);

      const bytes = new Uint8Array(buffer);
      
      setLog(prev => 
        prev + 
        `\n\n✅ Success!` +
        `\nBuffer Size: ${bytes.length} bytes` +
        `\nData Preview: [${bytes.slice(0, 100).join(', ')}...]`
      );

    } catch (err) {
      // 错误处理
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
        
        {/* ✨ 新增：路径显示区域 */}
        {selectedPath && (
          <View style={styles.pathContainer}>
            <Text style={styles.pathLabel}>Current File Path:</Text>
            <Text style={styles.pathText} selectable>
              {selectedPath}
            </Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <Button 
            title={loading ? "Processing..." : "Pick Audio & Get PCM"} 
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
  // ✨ 新增样式
  pathContainer: {
    backgroundColor: '#e3e3e3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  pathLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pathText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace', // 使用等宽字体显示路径更好看
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
    fontSize: 14,
  },
});