<template>
  <div class="data-analysis">
    <div class="page-header">
      <h1>数据分析</h1>
    </div>

    <!-- 年份选择器区域 -->
    <div class="filter-section">
      <div class="year-select-container">
        <label class="year-label">选择年份:</label>
        <el-select v-model="selectedYear" class="year-select" style="width: 96px">
          <el-option v-for="year in yearList" :key="year" :value="year">{{ year }}</el-option>
        </el-select>
      </div>
    </div>

    <!-- 图表内容区域 -->
    <div class="content">
      <div class="bar-chart-section">
        <div class="bar-chart-title">{{ selectedYear }}年度营业收入分布</div>
        <div v-if="loading" class="loading-text">数据加载中...</div>
        <div v-else ref="barChartRef" class="bar-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { queryTurnover } from '../api/analysis.js';

// 年份下拉框可选项
const currentYear = new Date().getFullYear();
const startYear = currentYear - 4;
const yearList = [];
for (let year = startYear; year <= currentYear; year++) {
  yearList.push(year);
}

// 响应式数据
const selectedYear = ref(currentYear);
const monthlyIncome = ref([]);
const loading = ref(false);

// ECharts相关
const barChartRef = ref(null);
let barChartInstance = null;

// 获取年度营业额数据
const fetchYearIncome = async (year) => {
  console.log('=== 开始获取年度数据 ===');
  console.log('请求年份:', year);

  loading.value = true;
  try {
    // 添加请求前的日志
    console.log('发送API请求到:', `/order/queryTurnover/${year}`);
    const turnoverData = await queryTurnover(year);
    console.log('API响应成功');
    console.log('后端返回数据:', turnoverData);
    console.log('数据类型:', typeof turnoverData);
    console.log('是否为数组:', Array.isArray(turnoverData));
    // 初始化12个月的数据数组，默认值为0
    const monthlyData = new Array(12).fill(0);

    // 处理后端返回的数据
    if (Array.isArray(turnoverData)) {
      console.log('开始处理数组数据，长度:', turnoverData.length);
      turnoverData.forEach((item, index) => {
        console.log(`处理第${index + 1}项:`, item);
        const monthIndex = parseInt(item.date) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex] = parseFloat(item.turnover) || 0;
          console.log(`月份${item.date}(索引${monthIndex})设置为:`, monthlyData[monthIndex]);
        } else {
          console.warn('无效的月份索引:', monthIndex, '原始date:', item.date);
        }
      });
    } else {
      console.warn('返回数据不是数组格式:', turnoverData);
    }

    console.log('处理后的月度数据:', monthlyData);
    monthlyIncome.value = monthlyData;
    console.log('monthlyIncome.value 已更新:', monthlyIncome.value);

  } catch (error) {
    console.error('=== API请求失败 ===');
    console.error('错误详情:', error);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);

    // 检查是否是网络错误
    if (error.code === 'NETWORK_ERROR') {
      console.error('网络连接错误');
    } else if (error.response) {
      console.error('HTTP错误状态:', error.response.status);
      console.error('HTTP错误数据:', error.response.data);
    }

    monthlyIncome.value = new Array(12).fill(0);
  } finally {
    loading.value = false;
    console.log('=== 数据获取完成 ===');
  }
};

// 渲染柱状图
const renderBarChart = () => {
  console.log('=== 开始渲染图表 ===');
  console.log('barChartRef.value:', barChartRef.value);
  console.log('monthlyIncome.value:', monthlyIncome.value);

  if (!barChartRef.value) {
    console.warn('barChartRef.value 为空，无法渲染图表');
    return;
  }

  // 每次都重新初始化ECharts实例，确保图表能正确渲染
  if (barChartInstance) {
    barChartInstance.dispose(); // 先销毁旧实例
  }
  console.log('重新初始化ECharts实例');
  barChartInstance = echarts.init(barChartRef.value);

  // 计算数据的最大值用于动态设置Y轴范围
  const maxValue = Math.max(...monthlyIncome.value);
  // 修复Y轴最大值计算逻辑
  let yAxisMax;
  if (maxValue > 0) {
    yAxisMax = Math.ceil(maxValue * 1.2);
  } else {
    yAxisMax = 10000; // 当没有数据时，设置一个合理的默认值
  }

  console.log('图表数据最大值:', maxValue);
  console.log('Y轴最大值:', yAxisMax);

  const option = {
    legend: {
      data: ['营业收入（元）'],
      top: 0,
      left: 'center',
      itemWidth: 18,
      itemHeight: 12,
      textStyle: { color: '#666', fontSize: 14 }
    },
    grid: { left: 80, right: 24, top: 48, bottom: 32 },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const data = params[0];
        const formattedValue = data.value.toLocaleString('zh-CN');
        return `${data.name}<br/>${data.seriesName}: ${formattedValue}元`;
      }
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: yAxisMax,
      splitNumber: 5,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#666',
        fontSize: 13,
        formatter: function (value) {
          if (value >= 10000) {
            return (value / 10000) + '万元';
          } else {
            return value + '元';
          }
        }
      },
      splitLine: { lineStyle: { color: '#e0e0e0', type: 'dashed' } }
    },
    series: [
      {
        name: '营业收入（元）',
        type: 'bar',
        barWidth: 32,
        itemStyle: {
          color: '#4fc3f7',
          borderRadius: [6, 6, 0, 0]
        },
        data: monthlyIncome.value
      }
    ]
  };

  console.log('设置图表配置:', option);
  barChartInstance.setOption(option, true); // 添加第二个参数true，强制重新渲染
  console.log('=== 图表渲染完成 ===');
};

// 生命周期和监听器
onMounted(async () => {
  console.log('=== 组件挂载 ===');
  await fetchYearIncome(selectedYear.value);
  await nextTick(() => {
    renderBarChart();
  });
});

watch(selectedYear, async (newYear, oldYear) => {
  console.log('=== 年份变化 ===');
  console.log('从', oldYear, '变更为', newYear);
  await fetchYearIncome(newYear);
  await nextTick(() => {
    renderBarChart();
  });
});

watch(monthlyIncome, (newData, oldData) => {
  console.log('=== 月度数据变化 ===');
  console.log('旧数据:', oldData);
  console.log('新数据:', newData);
  nextTick(() => {
    renderBarChart();
  });
});
</script>

<style scoped>
.data-analysis {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

/* 筛选区域样式 */
.filter-section {
  background: white;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.year-select-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.year-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

/* 内容区域样式 */
.content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.bar-chart-section {
  padding: 32px 24px;
}

.bar-chart-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 96px;
  text-align: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
}

.bar-chart {
  width: 100%;
  height: 450px;
  min-height: 400px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-analysis {
    padding: 16px;
  }

  .filter-section {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .year-select-container {
    width: 100%;
    justify-content: space-between;
  }

  .year-select {
    width: 120px;
  }
}

.loading-text {
  text-align: center;
  color: #666;
  font-size: 16px;
  padding: 200px 0;
}
</style>