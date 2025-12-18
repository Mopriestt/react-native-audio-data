#include <jni.h>
#include "audiodataOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::audiodata::initialize(vm);
}
