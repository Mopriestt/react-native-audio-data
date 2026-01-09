import { Platform } from 'react-native';
import { NitroModules } from 'react-native-nitro-modules';
import type { AudioData, AudioDataResult } from './AudioData.nitro';
import type { FileHelper } from './FileHelper.nitro';

const AudioDataHybridObject =
  NitroModules.createHybridObject<AudioData>('AudioData');

const FileHelperHybridObject =
  NitroModules.createHybridObject<FileHelper>('FileHelper');

/**
 * Resolves the given file path to a physical path that can be processed by C++.
 * On Android, this handles Content URIs (`content://`) by resolving them to absolute file paths.
 * On other platforms, it returns the path as-is.
 *
 * @param rawPath - The raw file path or URI.
 * @returns A promise resolving to the absolute file path.
 */
export function resolveFilePath(rawPath: string): Promise<string> {
  if (Platform.OS === 'android') {
    return FileHelperHybridObject.resolveFilePath(rawPath);
  }
  return Promise.resolve(rawPath);
}

/**
 * Decodes an audio file and returns the raw PCM data along with metadata.
 * Supported formats: MP3, WAV, FLAC.
 *
 * @param filePath - The path to the audio file.
 * @returns A promise that resolves to an object containing the raw PCM buffer (`ArrayBuffer`), channel count, sample rate, and total frame count.
 * @throws Will throw an error if the file cannot be read or decoded.
 */
export async function getRawPcmData(filePath: string): Promise<AudioDataResult> {
  const physicalPath = await resolveFilePath(filePath);
  return AudioDataHybridObject.getRawPcmData(physicalPath);
}

/**
 * Decodes an audio file and generates a simplified waveform array.
 * The waveform is calculated using RMS (Root Mean Square) for each block of samples.
 *
 * @param filePath - The path to the audio file.
 * @param targetPoints - The desired number of data points in the returned waveform.
 * @returns A promise that resolves to an array of numbers (RMS values) representing the amplitude of the waveform (0.0 to 1.0).
 * @throws Will throw an error if the file cannot be read or decoded.
 */
export async function getWaveformData(filePath: string, targetPoints: number): Promise<number[]> {
  const physicalPath = await resolveFilePath(filePath);
  return AudioDataHybridObject.getWaveformData(physicalPath, targetPoints);
}

export type { AudioDataResult };
