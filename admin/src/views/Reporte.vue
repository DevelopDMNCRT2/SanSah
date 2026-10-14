<template>
  <AdminLayout>
    <div class="space-y-5 sm:space-y-6">

      <!-- Page Header & Filter Bar -->
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">Estadísticas y Ventas</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Analítica de ingresos, gastos, movimientos y balance general</p>
          </div>
          
          <button @click="downloadSalesPDF" class="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-theme-xs hover:bg-green-700 transition-colors self-start sm:self-auto" title="Descargar Reporte en PDF">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Exportar PDF
          </button>
        </div>

        <!-- Filter Controls Bar -->
        <div class="bg-white dark:bg-white/[0.03] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          
          <!-- Filtro de Período y Categoría -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Período:</label>
              <select v-model="filtroPeriodo" @change="onPeriodoChange" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="mes">Mes específico</option>
                <option value="dia">Día específico</option>
                <option value="rango">Rango de fechas</option>
                <option value="todo">Todo el histórico</option>
              </select>
            </div>

            <!-- Mes específico -->
            <div v-if="filtroPeriodo === 'mes'" class="flex items-center gap-2">
              <select v-model="selectedMes" @change="fetchData" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option v-for="(m, idx) in mesesNombres" :key="idx" :value="idx">{{ m }}</option>
              </select>
              <select v-model="selectedAnio" @change="fetchData" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option v-for="y in aniosDisponibles" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>

            <!-- Día específico -->
            <div v-else-if="filtroPeriodo === 'dia'" class="flex items-center gap-2">
              <flat-pickr
                v-model="selectedDia"
                :config="diaConfig"
                class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-36 text-center cursor-pointer"
                placeholder="Seleccionar día"
                @on-change="fetchData"
              />
            </div>

            <!-- Rango de fechas -->
            <div v-else-if="filtroPeriodo === 'rango'" class="flex items-center gap-2">
              <flat-pickr
                v-model="selectedRango"
                :config="rangoConfig"
                class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-64 text-center cursor-pointer"
                placeholder="Fecha inicio a fin"
                @on-change="onRangoChange"
              />
            </div>

            <!-- Filtro de Categoría -->
            <div class="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-2 sm:pt-0 sm:pl-3">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoría:</label>
              <select v-model="selectedTienda" @change="fetchData" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                <option value="todas">Todas las categorías</option>
                <option v-for="t in tiendas" :key="t.id" :value="t.id">{{ t.nombre }}</option>
              </select>
            </div>
          </div>

          <!-- Resumen de período activo -->
          <div class="text-xs font-medium text-gray-400">
            Mostrando: <span class="font-semibold text-brand-600 dark:text-brand-400">{{ activePeriodoTexto }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <svg class="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <template v-else>
        <!-- Totales Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-2">
          <!-- Ingreso Neto Card -->
          <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="h-14 w-14 rounded-xl bg-success-500/10 flex items-center justify-center text-success-600 dark:text-success-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Ingreso Neto Total</p>
                <h3 class="text-3xl font-bold text-gray-900 dark:text-white/90">${{ (reporteData.ingreso_neto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} <span class="text-lg text-gray-500">MXN</span></h3>
              </div>
            </div>
          </div>

          <!-- Egreso Total Card -->
          <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="h-14 w-14 rounded-xl bg-error-500/10 flex items-center justify-center text-error-600 dark:text-error-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Gastos y Compras Total</p>
                <h3 class="text-3xl font-bold text-gray-900 dark:text-white/90">${{ (reporteData.egreso_total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 }) }} <span class="text-lg text-gray-500">MXN</span></h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección: Desglose Mensual y por Categorías -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <!-- Gráfica Ventas por Mes -->
          <div class="lg:col-span-8 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Ventas Totales por Mes</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">Histórico mensual de ingresos facturados</p>
              </div>
            </div>
            <div class="min-h-[300px]">
              <VueApexCharts type="bar" height="300" :options="mensualOptions" :series="mensualSeries" />
            </div>
          </div>

          <!-- Gráfica Ventas por Categoría -->
          <div class="lg:col-span-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <div class="mb-4">
              <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Ventas por Categoría</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Distribución de ingresos por tipo de producto</p>
            </div>
            <div class="min-h-[300px] flex items-center justify-center">
              <VueApexCharts type="donut" height="300" :options="categoriaOptions" :series="categoriaSeries" />
            </div>
          </div>
        </div>

        <!-- Tabla Resumen: Desglose Mensual de Ventas y Categorías -->
        <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Desglose Detallado por Mes y Categorías</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Resumen mensual de transacciones e ingresos por departamento</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              <thead>
                <tr class="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  <th class="py-3 px-4">Mes / Período</th>
                  <th class="py-3 px-4 text-center">Pedidos</th>
                  <th class="py-3 px-4 text-right">Venta Total</th>
                  <th class="py-3 px-4 text-right">Ticket Promedio</th>
                  <th class="py-3 px-4">Desglose por Categorías</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="m in tablaMensual" :key="m.mes_key" class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td class="py-3.5 px-4 font-semibold text-gray-800 dark:text-white/90">{{ m.mes }}</td>
                  <td class="py-3.5 px-4 text-center font-medium text-gray-700 dark:text-gray-300">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {{ m.pedidos }} pedidos
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right font-bold text-success-600 dark:text-success-400">
                    ${{ m.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </td>
                  <td class="py-3.5 px-4 text-right font-medium text-gray-600 dark:text-gray-400">
                    ${{ m.ticket_promedio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-wrap gap-1.5">
                      <span v-for="c in m.categorias" :key="c.nombre" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20">
                        <span class="font-medium">{{ c.nombre }}:</span>
                        <span class="font-bold">${{ c.total.toLocaleString('es-MX') }}</span>
                        <span class="text-xs opacity-75">({{ c.porcentaje }}%)</span>
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="!tablaMensual || tablaMensual.length === 0">
                  <td colspan="5" class="py-8 text-center text-gray-400">No hay ventas registradas en el período seleccionado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Charts Grid 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          
          <!-- Forma de Pago -->
          <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Ingresos por Forma de Pago</h2>
            <div class="min-h-[300px] flex items-center justify-center">
              <VueApexCharts type="donut" height="320" :options="pagoOptions" :series="pagoSeries" />
            </div>
          </div>

          <!-- Canales de Venta -->
          <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Ingresos por Canal de Venta</h2>
            <div class="min-h-[300px] flex items-center justify-center">
              <VueApexCharts type="donut" height="320" :options="canalOptions" :series="canalSeries" />
            </div>
          </div>

          <!-- Gastos y Compras -->
          <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Desglose de Gastos y Compras</h2>
            <div class="min-h-[300px] flex items-center justify-center">
              <VueApexCharts type="donut" height="320" :options="egresosOptions" :series="egresosSeries" />
            </div>
          </div>
          
        </div>

        <!-- Charts Grid 2 -->
        <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <h2 class="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Top 5 Productos Más Vendidos</h2>
          <div class="min-h-[320px]">
            <VueApexCharts type="bar" height="320" :options="topProductsOptions" :series="topProductsSeries" />
          </div>
        </div>

      </template>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import VueApexCharts from 'vue3-apexcharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SANSAH_LOGO_B64, SANSAH_COLORS } from '@/utils/pdfBrand';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

// --- Estado ---
const loading = ref(true);
const tiendas = ref([]);
const selectedTienda = ref('todas');
const reporteData = ref({});

const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const aniosDisponibles = computed(() => {
  const currentY = new Date().getFullYear();
  return [currentY - 1, currentY, currentY + 1];
});

const now = new Date();
const filtroPeriodo = ref('mes'); // 'mes' | 'dia' | 'rango' | 'todo'
const selectedMes = ref(now.getMonth());
const selectedAnio = ref(now.getFullYear());
const selectedDia = ref(now.toISOString().split('T')[0]);
const selectedRango = ref('');

const diaConfig = {
  locale: Spanish,
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'd/m/Y',
};

const rangoConfig = {
  locale: Spanish,
  mode: 'range',
  dateFormat: 'Y-m-d',
  altInput: true,
  altFormat: 'd/m/Y',
};

const onPeriodoChange = () => {
  fetchData();
};

const onRangoChange = (_selectedDates, dateStr) => {
  if (dateStr && dateStr.includes(' to ')) {
    fetchData();
  }
};

const activePeriodoTexto = computed(() => {
  if (filtroPeriodo.value === 'mes') {
    return `${mesesNombres[selectedMes.value]} ${selectedAnio.value}`;
  } else if (filtroPeriodo.value === 'dia') {
    return selectedDia.value ? `Día ${selectedDia.value}` : 'Día seleccionado';
  } else if (filtroPeriodo.value === 'rango') {
    return selectedRango.value ? selectedRango.value.replace(' to ', ' al ') : 'Rango seleccionado';
  }
  return 'Todo el histórico';
});

// --- Fetch tiendas reales ---
const fetchTiendas = async () => {
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/tiendas');
    if (res.ok) tiendas.value = await res.json();
  } catch (e) { console.error('Error fetching tiendas:', e); }
};

// --- Fetch datos del reporte ---
const fetchData = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (selectedTienda.value !== 'todas') params.append('tienda_id', selectedTienda.value);

    if (filtroPeriodo.value === 'mes') {
      const y = selectedAnio.value;
      const m = selectedMes.value;
      const primerDia = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const ultimoDiaNum = new Date(y, m + 1, 0).getDate();
      const ultimoDia = `${y}-${String(m + 1).padStart(2, '0')}-${String(ultimoDiaNum).padStart(2, '0')}`;
      params.append('fecha_inicio', primerDia);
      params.append('fecha_fin', ultimoDia);
    } else if (filtroPeriodo.value === 'dia') {
      if (selectedDia.value) params.append('fecha', selectedDia.value);
    } else if (filtroPeriodo.value === 'rango') {
      if (selectedRango.value && selectedRango.value.includes(' to ')) {
        const [ini, fin] = selectedRango.value.split(' to ');
        params.append('fecha_inicio', ini);
        params.append('fecha_fin', fin);
      }
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reportes/ventas?${params}`);
    if (res.ok) {
      reporteData.value = await res.json();
    }
  } catch (e) { console.error('Error fetching reporte:', e); }
  finally { loading.value = false; }
};

// --- Tabla y Gráficas Mensuales y por Categoría ---
const tablaMensual = computed(() => reporteData.value?.tabla_mensual || []);

const mensualSeries = computed(() => [{
  name: 'Ventas Totales ($)',
  data: reporteData.value?.ventas_mensuales?.series || []
}]);

const mensualOptions = computed(() => ({
  chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false }, background: 'transparent' },
  colors: ['#E8811E'],
  plotOptions: { 
    bar: { 
      borderRadius: 6,
      columnWidth: '40%',
      distributed: false
    } 
  },
  dataLabels: { 
    enabled: true, 
    formatter: (val) => `$${Number(val).toLocaleString('es-MX')}`,
    style: { fontSize: '11px', fontWeight: 'bold', colors: ['#374151'] },
    offsetY: -20
  },
  legend: { show: false },
  xaxis: {
    categories: reporteData.value?.ventas_mensuales?.labels || [],
    labels: { style: { colors: '#9CA3AF' } }
  },
  yaxis: {
    labels: { 
      formatter: (val) => `$${Number(val).toLocaleString('es-MX')}`,
      style: { colors: '#6B7280' } 
    }
  },
  grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${Number(val).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` }
  }
}));

const categoriaSeries = computed(() => reporteData.value?.ventas_por_categoria?.series || []);
const categoriaOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent' },
  labels: reporteData.value?.ventas_por_categoria?.labels || [],
  colors: ['#E8811E', '#237650', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'],
  stroke: { width: 0 },
  dataLabels: { 
    enabled: true, 
    formatter: (val) => val.toFixed(1) + "%",
    style: { fontSize: '13px', fontWeight: 'bold', colors: ['#000000'] },
    dropShadow: { enabled: false }
  },
  legend: { position: 'bottom', labels: { colors: '#9CA3AF' } },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${Number(val).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN` }
  }
}));

// --- Opciones Gráfica Formas de Pago ---
const pagoSeries = computed(() => reporteData.value?.ingresos_forma_pago?.series || []);
const pagoOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent' },
  labels: reporteData.value?.ingresos_forma_pago?.labels || [],
  colors: ['#3b82f6', '#14b8a6', '#f59e0b', '#8b5cf6'],
  stroke: { width: 0 },
  dataLabels: { 
    enabled: true, 
    formatter: (val) => val.toFixed(1) + "%",
    style: { fontSize: '16px', fontWeight: 'bold', colors: ['#000000', '#000000', '#000000', '#000000', '#000000'] },
    dropShadow: { enabled: false }
  },
  legend: { position: 'bottom', labels: { colors: '#9CA3AF' } },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${val.toLocaleString('es-MX')} MXN` }
  }
}));

// --- Opciones Gráfica Canal de Venta ---
const canalSeries = computed(() => reporteData.value?.ingresos_canal?.series || []);
const canalOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent' },
  labels: reporteData.value?.ingresos_canal?.labels || [],
  colors: ['#f97316', '#237650'],
  stroke: { width: 0 },
  dataLabels: { 
    enabled: true, 
    formatter: (val) => val.toFixed(1) + "%",
    style: { fontSize: '16px', fontWeight: 'bold', colors: ['#000000'] },
    dropShadow: { enabled: false }
  },
  legend: { position: 'bottom', labels: { colors: '#9CA3AF' } },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${val.toLocaleString('es-MX')} MXN` }
  }
}));

// --- Opciones Gráfica Egresos (Gastos y Compras) ---
const egresosSeries = computed(() => reporteData.value?.egresos_desglose?.series || []);
const egresosOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', background: 'transparent' },
  labels: reporteData.value?.egresos_desglose?.labels || [],
  colors: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'],
  stroke: { width: 0 },
  dataLabels: { 
    enabled: true, 
    formatter: (val) => val.toFixed(1) + "%",
    style: { fontSize: '16px', fontWeight: 'bold', colors: ['#000000'] },
    dropShadow: { enabled: false }
  },
  legend: { position: 'bottom', labels: { colors: '#9CA3AF' } },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${val.toLocaleString('es-MX')} MXN` }
  }
}));

// --- Opciones Gráfica Top Productos ---
const topProductsSeries = computed(() => [{
  name: 'Unidades Vendidas',
  data: reporteData.value?.top_productos?.series || []
}]);

const topProductsOptions = computed(() => ({
  chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false }, background: 'transparent' },
  colors: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
  plotOptions: { 
    bar: { 
      horizontal: true, 
      borderRadius: 4,
      distributed: true
    } 
  },
  dataLabels: { enabled: true, style: { colors: ['#000000'] }, dropShadow: { enabled: false } },
  legend: { show: false },
  xaxis: {
    categories: reporteData.value?.top_productos?.labels || [],
    labels: { style: { colors: '#9CA3AF' } },
  },
  yaxis: {
    labels: { style: { colors: '#6B7280', fontWeight: 600 } }
  },
  grid: { borderColor: '#F3F4F6', strokeDashArray: 4 },
  tooltip: {
    theme: 'light'
  }
}));

// --- Generador PDF Estilo Excel ---
const downloadSalesPDF = () => {
  const doc = new jsPDF('landscape');
  const pageW = doc.internal.pageSize.getWidth();

  // ── Header band ───────────────────────────────────────────────────────────
  doc.setFillColor(...SANSAH_COLORS.negro);
  doc.rect(0, 0, pageW, 30, 'F');

  // Logo Sansah (más grande en landscape)
  doc.addImage(SANSAH_LOGO_B64, 'PNG', 10, 4, 62, 24);

  // Título a la derecha
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte General de Ventas', pageW - 14, 12, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${activePeriodoTexto.value}`, pageW - 14, 19, { align: 'right' });
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')}`, pageW - 14, 25, { align: 'right' });

  // ── Sub-header info ────────────────────────────────────────────
  doc.setTextColor(...SANSAH_COLORS.negro);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const ingresoFmt = `$${(reporteData.value.ingreso_neto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
  const egresoFmt = `$${(reporteData.value.egreso_total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
  doc.text(`Ingreso Neto: ${ingresoFmt}    |    Egresos Totales: ${egresoFmt}`, 14, 44);

  // ── Línea separadora naranja ──────────────────────────────────
  doc.setDrawColor(...SANSAH_COLORS.naranja);
  doc.setLineWidth(1.2);
  doc.line(14, 48, pageW - 14, 48);

  // ── Tabla 1: Desglose Mensual y por Categorías ─────────────────
  const mensualTableData = (reporteData.value.tabla_mensual || []).map((m) => [
    m.mes,
    String(m.pedidos),
    `$${m.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    `$${m.ticket_promedio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    m.categorias.map(c => `${c.nombre}: $${c.total.toLocaleString('es-MX')} (${c.porcentaje}%)`).join('  |  ')
  ]);

  let nextY = 53;
  if (mensualTableData.length > 0) {
    autoTable(doc, {
      head: [['Mes / Período', 'Pedidos', 'Venta Total', 'Ticket Promedio', 'Desglose por Categorías']],
      body: mensualTableData,
      startY: nextY,
      theme: 'grid',
      headStyles: {
        fillColor: SANSAH_COLORS.naranja,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: SANSAH_COLORS.grisClaro },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right', fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { fontSize: 7.5 }
      }
    });
    nextY = (doc).lastAutoTable.finalY + 12;
  }

  // ── Tabla 2: Listado de Ventas Detalladas ───────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...SANSAH_COLORS.negro);
  doc.text('Detalle de Ventas Registradas', 14, nextY - 4);

  const rowsData = reporteData.value.rows || [];
  const tableData = rowsData.map((r) => [
    r.fecha,
    r.producto,
    r.canal,
    r.pago,
    `$${r.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    head: [['Fecha', 'Producto', 'Canal de Venta', 'Forma de Pago', 'Total (MXN)']],
    body: tableData,
    startY: nextY,
    theme: 'grid',
    headStyles: {
      fillColor: SANSAH_COLORS.negro,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: SANSAH_COLORS.grisClaro },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' }
    },
    didDrawPage: () => {
      // Footer en cada página
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFillColor(...SANSAH_COLORS.negro);
      doc.rect(0, pageH - 10, pageW, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('Sansah Bikes® — Reporte Confidencial', pageW / 2, pageH - 3, { align: 'center' });
    }
  });

  doc.save(`reporte_ventas_${filtroPeriodo.value}_${new Date().toISOString().split('T')[0]}.pdf`);
};

onMounted(async () => {
  await fetchTiendas();
  await fetchData();
});
</script>

<style scoped>
:deep(.apexcharts-pie-label),
:deep(.apexcharts-datalabel),
:deep(.apexcharts-datalabel-value) {
  fill: #000000 !important;
  filter: none !important;
  text-shadow: none !important;
}
</style>
