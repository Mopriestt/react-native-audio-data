import { NitroModules } from 'react-native-nitro-modules';
import type { AudioData } from './AudioData.nitro';
import type { FileHelper } from './FileHelper.nitro';

const AudioDataHybridObject =
  NitroModules.createHybridObject<AudioData>('AudioData');

const FileHelperHybridObject =
  NitroModules.createHybridObject<FileHelper>('FileHelper');

export async function getRawPcmData(path: string): Promise<ArrayBuffer> {
  const physicalPath = await FileHelperHybridObject.resolveFilePath(path);
  return await AudioDataHybridObject.getRawPcmData(physicalPath);
}
