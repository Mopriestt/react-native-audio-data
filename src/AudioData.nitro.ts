import type { HybridObject } from 'react-native-nitro-modules';

export interface AudioData extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  getRawPcmData(path: string): Promise<ArrayBuffer>;
}