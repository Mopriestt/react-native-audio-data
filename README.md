# react-native-audio-data

A React Native module that provides high-performance, cross-platform access to raw audio data for analysis, visualization, and custom DSP in JavaScript and native code.

Powered by [Nitro Modules](https://nitro.margelo.com/) and `dr_libs` for fast, efficient C++ audio decoding.

![Demo](demo.jpg)

## Features

- ⚡️ **High Performance**: Uses C++ directly via JSI for near-native performance.
- 🪶 **Lightweight**: Zero heavy dependencies like FFmpeg. Uses `dr_libs` for minimal footprint.
- 🔊 **Format Support**: Decodes **MP3**, **WAV**, and **FLAC** files.
- 🌊 **Waveform Generation**: High-speed RMS waveform data generation for visualization.
- 🎹 **Raw PCM Data**: Access raw `Float32` audio samples for finding peaks, normalization, or custom processing.
- 📱 **Cross-Platform**: Works on **iOS** and **Android**.

## Installation

```sh
npm install react-native-audio-data react-native-nitro-modules
```

> **Note**: `react-native-nitro-modules` is a required peer dependency.

### Android Setup
No additional setup is required.

### iOS Setup
Install Pods:
```sh
cd ios && pod install
```

## Usage

### 1. Get Raw PCM Data

Decode an audio file to get the full raw PCM data (Float32).

```typescript
import { getRawPcmData } from 'react-native-audio-data';

// ...

try {
  const result = await getRawPcmData('path/to/audio/file.mp3');
  
  console.log('Channels:', result.channels);
  console.log('Sample Rate:', result.sampleRate);
  console.log('Total Frames:', result.totalPCMFrameCount);
  
  // The raw buffer (ArrayBuffer)
  // You can create a Float32Array view on it:
  const float32Data = new Float32Array(result.buffer);
  
} catch (error) {
  console.error("Failed to decode audio", error);
}
```

### 2. Generate Waveform Data

Quickly generate simplified waveform data for UI visualization (e.g., an audio player progress bar).

```typescript
import { getWaveformData } from 'react-native-audio-data';

// ...

// Request 100 data points for the waveform
const points = await getWaveformData('path/to/audio/file.mp3', 100);

// Returns an array of numbers between 0.0 and 1.0 (RMS amplitude)
console.log(points); 
// Output: [0.05, 0.23, 0.55, 0.21, ...]
```

## API Reference

### `getRawPcmData(filePath: string)`

Decodes the audio file and returns the raw PCM data.

- **Parameters**:
  - `filePath` _(string)_: Absolute path or URI to the audio file.
- **Returns**: `Promise<AudioDataResult>`
  - `buffer` _(ArrayBuffer)_: Raw PCM data (Float32).
  - `channels` _(number)_: Number of audio channels.
  - `sampleRate` _(number)_: Sample rate in Hz.
  - `totalPCMFrameCount` _(number)_: Total number of PCM frames.

### `getWaveformData(filePath: string, targetPoints: number)`

Generates a downsampled waveform array for visualization.

- **Parameters**:
  - `filePath` _(string)_: Absolute path or URI to the audio file.
  - `targetPoints` _(number)_: The number of data points you want in the output array.
- **Returns**: `Promise<number[]>` containing RMS amplitude values (0.0 - 1.0).

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
