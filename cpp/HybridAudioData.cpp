#include "HybridAudioData.hpp"
#include <iostream>
#include <cctype>

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

  std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> HybridAudioData::getRawPcmData(const std::string& path) {
    auto promise = Promise<std::shared_ptr<ArrayBuffer>>::create();

    if (isFormat(path, ".wav")) {
      unsigned int channels;
      unsigned int sampleRate;
      drwav_uint64 totalPCMFrameCount;
      float* pSampleData = drwav_open_file_and_read_pcm_frames_f32(
        path.c_str(),
        &channels,
        &sampleRate,
        &totalPCMFrameCount,
        NULL
      );
      if (pSampleData == NULL) {
        promise->reject(std::make_exception_ptr(std::runtime_error("Failed to decode audio data.")));
      }

      size_t totalSamples = totalPCMFrameCount * channels;
      size_t byteSize = totalSamples * sizeof(float);
      const uint8_t* uInt8Data = reinterpret_cast<const uint8_t*>(pSampleData);
      auto data = std::vector<uint8_t>(uInt8Data, uInt8Data + byteSize);
      auto buffer = ArrayBuffer::copy(data.data(), data.size());
      promise->resolve(buffer);

      drwav_free(pSampleData, NULL);
    } else if (isFormat(path, ".mp3")) {

    } else if (isFormat(path, ".flac")) {

    } else {
      promise->reject(std::make_exception_ptr(std::invalid_argument("Invalid audio format file.")));
    }

    return promise;
  }

}