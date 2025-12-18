package com.margelo.nitro.audiodata
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class AudioData : HybridAudioDataSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
