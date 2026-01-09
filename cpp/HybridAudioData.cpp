#include "HybridAudioData.hpp"
#include <iostream>
#include <cctype>
#include <cmath>
#include <algorithm>

#include "dr_wav.h"
#include "dr_mp3.h"
#include "dr_flac.h"

namespace margelo::nitro::audiodata {

  inline bool isFormat(const std::string& path, const std::string& format) {
    auto len = path.size();
    auto fLen = format.size();
    if (len < fLen + 1) return false;
    for (size_t i = len - fLen, j = 0; i < len; ++i, ++j) {
      if (std::tolower(path[i]) != std::tolower(format[j])) return false;
    }
    return true;
  }

  struct AudioDataStruct {
    std::vector<float> data;
    unsigned int channels;
    unsigned int sampleRate;
    uint64_t totalPCMFrameCount;
  };

  AudioDataStruct loadAudioData(const std::string& path) {
    float* pSampleData = nullptr;
    unsigned int channels = 0;
    unsigned int sampleRate = 0;
    uint64_t totalPCMFrameCount = 0;

    if (isFormat(path, ".wav")) {
      drwav_uint64 frames;
      pSampleData = drwav_open_file_and_read_pcm_frames_f32(path.c_str(), &channels, &sampleRate, &frames, NULL);
      totalPCMFrameCount = frames;
    } 
    else if (isFormat(path, ".mp3")) {
      drmp3_config config;
      drmp3_uint64 frames;
      pSampleData = drmp3_open_file_and_read_pcm_frames_f32(path.c_str(), &config, &frames, NULL);
      channels = config.channels;
      sampleRate = config.sampleRate;
      totalPCMFrameCount = frames;
    } 
    else if (isFormat(path, ".flac")) {
      drflac_uint64 frames;
      pSampleData = drflac_open_file_and_read_pcm_frames_f32(path.c_str(), &channels, &sampleRate, &frames, NULL);
      totalPCMFrameCount = frames;
    } 
    else {
      throw std::invalid_argument("Unsupported audio format");
    }

    if (pSampleData == NULL) {
      throw std::runtime_error("Failed to decode audio data");
    }

    size_t totalSamples = totalPCMFrameCount * channels;
    std::vector<float> data(pSampleData, pSampleData + totalSamples);

    // Free memory using the correct function
    if (isFormat(path, ".wav")) {
      drwav_free(pSampleData, NULL);
    } else if (isFormat(path, ".mp3")) {
      drmp3_free(pSampleData, NULL);
    } else if (isFormat(path, ".flac")) {
      drflac_free(pSampleData, NULL);
    }

    for (size_t i = 0; i < data.size(); ++i) {
        if (data[i] > 1.0f) data[i] = 1.0f;
        else if (data[i] < -1.0f) data[i] = -1.0f;
    }

    return { data, channels, sampleRate, totalPCMFrameCount };
  }

  std::shared_ptr<Promise<AudioDataResult>> HybridAudioData::getRawPcmData(const std::string& path) {
    auto promise = Promise<AudioDataResult>::create();

    try {
      auto audio = loadAudioData(path);

      size_t byteSize = audio.data.size() * sizeof(float);
      const uint8_t* uInt8Data = reinterpret_cast<const uint8_t*>(audio.data.data());
      auto buffer = ArrayBuffer::copy(uInt8Data, byteSize);
      
      AudioDataResult result;
      result.buffer = buffer;
      result.channels = static_cast<double>(audio.channels);
      result.sampleRate = static_cast<double>(audio.sampleRate);
      result.totalPCMFrameCount = static_cast<double>(audio.totalPCMFrameCount);
      
      promise->resolve(result);

    } catch (const std::exception& e) {
      promise->reject(std::make_exception_ptr(e));
    }
    
    return promise;
  }


  std::shared_ptr<Promise<std::vector<double>>> HybridAudioData::getWaveformData(const std::string& path, double targetPoints) {
    auto promise = Promise<std::vector<double>>::create();

    try {
        auto audio = loadAudioData(path);
        
        std::vector<double> waveform;
        waveform.reserve(targetPoints);

        size_t totalSamples = audio.data.size();
        size_t blockSize = std::floor(totalSamples / targetPoints);
        if (blockSize == 0) blockSize = 1;

        for (size_t i = 0; i < targetPoints; ++i) {
            size_t start = i * blockSize;
            size_t end = start + blockSize;
            if (end > totalSamples) end = totalSamples;

            double sumSquares = 0.0;
            size_t count = 0;

            for (size_t j = start; j < end; ++j) {
                float sample = audio.data[j];
                sumSquares += sample * sample;
                count++;
            }

            if (count > 0) {
                double rms = std::sqrt(sumSquares / count);
                waveform.push_back(rms);
            } else {
                waveform.push_back(0.0);
            }
        }
        
        promise->resolve(waveform);

    } catch (const std::exception& e) {
        promise->reject(std::make_exception_ptr(e));
    }

    return promise;
  }
}