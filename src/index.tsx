import { Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import type { AudioData, AudioDataResult } from './AudioData.nitro';
import type { FileHelper } from './FileHelper.nitro';

const AudioDataHybridObject =
  NitroModules.createHybridObject<AudioData>('AudioData');

const FileHelperHybridObject =
  NitroModules.createHybridObject<FileHelper>('FileHelper');

export function resolveFilePath(rawPath: string): Promise<string> {
  if (Platform.OS === 'android') {
    return FileHelperHybridObject.resolveFilePath(rawPath);
  }
  return Promise.resolve(rawPath);
}

export async function getRawPcmData(filePath: string): Promise<AudioDataResult> {
  const physicalPath = await resolveFilePath(filePath);
  return AudioDataHybridObject.getRawPcmData(physicalPath);
}

export async function getWaveformData(filePath: string, targetPoints: number): Promise<number[]> {
  const physicalPath = await resolveFilePath(filePath);
  return AudioDataHybridObject.getWaveformData(physicalPath, targetPoints);
}

export type { AudioDataResult };
