'use client';

import StandardCompass from '@/components/compass/standard-compass';
import { useState } from 'react';

export default function StandardCompassDemoPage() {
  const [direction, setDirection] = useState<number>(0);

  const handleDirectionChange = (newDirection: number) => {
    setDirection(newDirection);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-white mb-4'>标准罗盘演示</h1>
          <p className='text-xl text-gray-300 mb-2'>
            符合主流罗盘工作方式的实现
          </p>
          <div className='text-lg text-gray-400 space-y-1'>
            <p>• 红色十字线固定在屏幕上不动（横线平行屏幕，竖线垂直屏幕）</p>
            <p>• 指南针和罗盘文字一起旋转（代表磁针指向）</p>
            <p>• 通过十字线与刻度的相对位置判断方向</p>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-8 items-start justify-center'>
          {/* 罗盘组件 */}
          <div className='flex-shrink-0'>
            <StandardCompass
              width={500}
              height={500}
              onDirectionChange={handleDirectionChange}
              interactive={true}
              enableAnimation={true}
              showDetailedInfo={true}
            />
          </div>

          {/* 信息面板 */}
          <div className='flex-1 max-w-md'>
            <div className='bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20'>
              <h2 className='text-2xl font-bold text-white mb-4'>
                罗盘工作原理
              </h2>

              <div className='space-y-4 text-gray-300'>
                <div className='p-4 bg-red-500/20 rounded-lg border border-red-500/30'>
                  <h3 className='font-semibold text-red-300 mb-2'>
                    红色十字线（固定）
                  </h3>
                  <p className='text-sm'>
                    固定在手机屏幕上不动，横线平行于屏幕，竖线垂直于屏幕。
                    这是用户读取方向的基准线，不随设备旋转而改变。
                  </p>
                </div>

                <div className='p-4 bg-blue-500/20 rounded-lg border border-blue-500/30'>
                  <h3 className='font-semibold text-blue-300 mb-2'>
                    指南针指针（固定）
                  </h3>
                  <p className='text-sm'>
                    始终指向正南方，不随设备旋转。这是传统罗盘的标准设计。
                  </p>
                </div>

                <div className='p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30'>
                  <h3 className='font-semibold text-yellow-300 mb-2'>
                    罗盘刻度（旋转）
                  </h3>
                  <p className='text-sm'>
                    24山和度数刻度会随设备方向旋转，用户通过观察固定的十字线与旋转刻度的相对位置来判断当前朝向。
                  </p>
                </div>
              </div>

              <div className='mt-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30'>
                <h3 className='font-semibold text-green-300 mb-2'>当前读数</h3>
                <div className='text-lg'>
                  <div className='text-white'>
                    方位角:{' '}
                    <span className='font-bold text-green-400'>
                      {Math.round(direction)}°
                    </span>
                  </div>
                  <div className='text-sm text-gray-300 mt-1'>
                    通过观察固定的红色十字线与旋转罗盘刻度的交叉点来读取精确角度
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20'>
              <h3 className='text-xl font-bold text-white mb-4'>使用方法</h3>
              <ol className='space-y-2 text-gray-300 text-sm'>
                <li className='flex items-start'>
                  <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>
                    1
                  </span>
                  <span>将设备水平放置，确保罗盘稳定</span>
                </li>
                <li className='flex items-start'>
                  <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>
                    2
                  </span>
                  <span>观察固定在屏幕上的红色十字线</span>
                </li>
                <li className='flex items-start'>
                  <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>
                    3
                  </span>
                  <span>读取固定十字线与旋转罗盘刻度的交叉点角度</span>
                </li>
                <li className='flex items-start'>
                  <span className='bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5'>
                    4
                  </span>
                  <span>根据24山确定坐山和朝向</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* 技术说明 */}
        <div className='mt-12 max-w-4xl mx-auto'>
          <div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10'>
            <h3 className='text-xl font-bold text-white mb-4'>技术实现说明</h3>
            <div className='grid md:grid-cols-2 gap-6 text-sm text-gray-300'>
              <div>
                <h4 className='font-semibold text-white mb-2'>核心设计原则</h4>
                <ul className='space-y-1'>
                  <li>• 十字线固定在屏幕上，横线平行屏幕，竖线垂直屏幕</li>
                  <li>• 罗盘刻度使用反向旋转保持相对固定</li>
                  <li>• 指南针指针固定指向正南方</li>
                  <li>• 传感器数据直接控制刻度旋转</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold text-white mb-2'>
                  与传统罗盘对比
                </h4>
                <ul className='space-y-1'>
                  <li>• 符合传统风水罗盘的使用习惯</li>
                  <li>• 固定十字线作为读取基准，旋转刻度作为测量对象</li>
                  <li>• 用户可以通过视觉直观判断方向</li>
                  <li>• 保持了传统罗盘的操作逻辑</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
