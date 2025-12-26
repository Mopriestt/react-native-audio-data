#include "HybridAudioData.hpp"
#include <iostream>

namespace margelo::nitro::audiodata {

  std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> HybridAudioData::getRawPcmData(const std::string& path) {
    // 1. 创建 Promise 对象
    // 注意：Promise 的泛型必须匹配 Spec 中的定义
    auto promise = Promise<std::shared_ptr<ArrayBuffer>>::create();

    // --- 模拟数据处理逻辑 ---
    
    // 打印一下路径，方便调试
    std::cout << "[C++] Processing file path: " << path << std::endl;

    // 2. 准备 Mock 数据 (例如：0-255 的循环数据)
    size_t dataSize = 10; // 假设只有10个字节
    std::vector<uint8_t> mockData(dataSize);
    for (size_t i = 0; i < dataSize; i++) {
        mockData[i] = static_cast<uint8_t>(i);
    }

    // 3. 创建 ArrayBuffer
    // 使用 .copy() 是最安全的，它会将 vector 的数据拷贝到 JSI 管理的堆内存中
    // 这样即使 vector 出栈销毁，JS 侧拿到的 ArrayBuffer 依然有效
    auto buffer = ArrayBuffer::copy(mockData.data(), mockData.size());

    // 4. Resolve Promise
    // 这里的 resolve 会通知 JS 端 await 结束
    promise->resolve(buffer);

    // 5. 返回 Promise 指针
    return promise;
  }

}