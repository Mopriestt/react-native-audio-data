#pragma once

#include <memory>
#include <NitroModules/HybridObject.hpp>
#include "HybridAudioDataSpec.hpp"

namespace margelo::nitro::audiodata {
    class HybridAudioData : public HybridAudioDataSpec {
    public:
        HybridAudioData() : HybridObject(TAG) {}

        double multiply(double a, double b) override;

        static constexpr auto TAG = "AudioData";
    };
}