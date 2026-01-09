import type { HybridObject } from 'react-native-nitro-modules';

export interface AudioDataResult {
  buffer: ArrayBuffer;
  channels: number;
  sampleRate: number;
  totalPCMFrameCount: number;
}

export interface AudioData
  extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  getRawPcmData(filePath: string): Promise<AudioDataResult>;

  getWaveformData(filePath: string, targetPoints: number): Promise<number[]>;
}
