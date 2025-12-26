import { NitroModules } from 'react-native-nitro-modules';
import type { AudioData } from './AudioData.nitro';

const AudioDataHybridObject =
  NitroModules.createHybridObject<AudioData>('AudioData');

export function getRawPcmData(path: string): Promise<ArrayBuffer> {
  return AudioDataHybridObject.getRawPcmData(path);
}
