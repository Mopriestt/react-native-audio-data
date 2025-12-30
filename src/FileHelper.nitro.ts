import type { HybridObject } from 'react-native-nitro-modules';

export interface FileHelper extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  resolveFilePath(rawPath: string): Promise<string>;
}