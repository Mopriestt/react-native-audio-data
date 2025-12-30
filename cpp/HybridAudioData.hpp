#pragma once

#include <vector>
#include <string>
#include <memory>

// 引入 Nitro 核心模块
#include <NitroModules/Promise.hpp>
#include <NitroModules/ArrayBuffer.hpp>

// 引入 Nitrogen 自动生成的基类 (Spec)
// 这个文件名取决于你的 nitro.json 配置，通常是 "HybridAudioDataSpec.hpp"
#include "HybridAudioDataSpec.hpp"

namespace margelo::nitro::audiodata {

  class HybridAudioData : public HybridAudioDataSpec {
  public:
    HybridAudioData() : HybridObject(TAG) {}
    virtual ~HybridAudioData() {}

    std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> getRawPcmData(const std::string& path) override;
  };

}