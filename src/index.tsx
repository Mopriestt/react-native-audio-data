import { NitroModules } from 'react-native-nitro-modules';
import type { AudioData } from './AudioData.nitro';

const AudioDataHybridObject =
  NitroModules.createHybridObject<AudioData>('AudioData');

export function multiply(a: number, b: number): number {
  return AudioDataHybridObject.multiply(a, b);
}
