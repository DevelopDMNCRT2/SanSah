<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[999999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
        @click.self="cerrar"
      >
        <div
          class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 animate-modal-in z-10 flex flex-col max-h-[90vh] overflow-hidden"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 5v14"></path>
                  <path d="M8 5v14"></path>
                  <path d="M12 5v14"></path>
                  <path d="M17 5v14"></path>
                  <path d="M21 5v14"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-base font-bold text-gray-900 dark:text-white">Impresión de Etiquetas con Código de Barras</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">Soporte multiformato para rollo térmico y hoja carta</p>
              </div>
            </div>
            <button
              @click="cerrar"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Controls Section: Selector Multiformato + Buscador -->
          <div class="px-6 py-3 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <!-- Selector de Formato -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Formato:</span>
              <div class="inline-flex rounded-lg p-0.5 bg-gray-200/70 dark:bg-gray-700/60 text-xs font-medium">
                <button
                  type="button"
                  @click="cambiarFormato('50x25')"
                  :class="formato === '50x25' ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
                  class="px-2.5 py-1 rounded-md transition-all"
                >
                  50×25 mm
                </button>
                <button
                  type="button"
                  @click="cambiarFormato('50x30')"
                  :class="formato === '50x30' ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
                  class="px-2.5 py-1 rounded-md transition-all"
                >
                  50×30 mm
                </button>
                <button
                  type="button"
                  @click="cambiarFormato('58x40')"
                  :class="formato === '58x40' ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
                  class="px-2.5 py-1 rounded-md transition-all"
                >
                  58×40 mm
                </button>
                <button
                  type="button"
                  @click="cambiarFormato('hoja')"
                  :class="formato === 'hoja' ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
                  class="px-2.5 py-1 rounded-md transition-all"
                >
                  Hoja Carta
                </button>
              </div>
            </div>

            <!-- Buscador -->
            <div class="relative flex-1 sm:max-w-xs">
              <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                v-model="busqueda"
                type="text"
                placeholder="Buscar por nombre o código..."
                class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <!-- Product Selection List -->
          <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-2">
            <!-- Header de Selección Rápida -->
            <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  :checked="todosSeleccionados"
                  @change="toggleTodos"
                  class="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                />
                <span class="font-semibold text-gray-700 dark:text-gray-300">Seleccionar todos ({{ itemsFiltrados.length }})</span>
              </label>
              <span class="text-xs">{{ itemsSeleccionados.length }} seleccionados</span>
            </div>

            <div v-if="itemsFiltrados.length === 0" class="py-12 text-center text-gray-400 text-xs">
              No se encontraron productos coincidentes con la búsqueda.
            </div>

            <!-- Listado de items -->
            <div
              v-for="item in itemsFiltrados"
              :key="item.key"
              class="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 hover:bg-brand-50/20 dark:hover:bg-brand-900/10 transition-colors"
              :class="item.selected ? 'bg-brand-50/40 dark:bg-brand-900/20 border-brand-300 dark:border-brand-700' : ''"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="checkbox"
                  v-model="item.selected"
                  class="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                />
                <div class="min-w-0 flex-1 pr-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {{ item.nombre }}
                    </span>
                    <span
                      v-if="item.variante"
                      class="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    >
                      {{ item.variante }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                    <span class="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                      {{ item.codigoBarras }}
                    </span>
                    <span class="font-bold text-brand-600 dark:text-brand-400">
                      {{ formatCurrency(item.precio) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Selector de Cantidad de Etiquetas -->
              <div class="flex items-center gap-1.5 shrink-0" v-if="item.selected">
                <span class="text-[11px] text-gray-500 mr-1 hidden sm:inline">Copias:</span>
                <button
                  type="button"
                  @click.stop="item.cantidad = Math.max(1, (item.cantidad || 1) - 1)"
                  class="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="999"
                  v-model.number="item.cantidad"
                  class="w-12 text-center text-xs py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500 font-bold"
                />
                <button
                  type="button"
                  @click.stop="item.cantidad = (item.cantidad || 1) + 1"
                  class="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <!-- Footer con Resumen y Botón Imprimir -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 shrink-0">
            <div class="text-xs text-gray-600 dark:text-gray-300">
              <p>
                Total: <strong class="text-sm font-black text-brand-600 dark:text-brand-400">{{ totalEtiquetas }}</strong> etiquetas
                <span class="opacity-75">({{ itemsSeleccionados.length }} productos seleccionados)</span>
              </p>
              <p class="text-[11px] text-gray-400 mt-0.5">{{ formatoLabelInfo }}</p>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="cerrar"
                class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                @click="generarEImprimir"
                :disabled="totalEtiquetas === 0 || generando"
                class="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-theme-xs active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <div v-if="generando" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                {{ generando ? 'Generando...' : 'Generar e Imprimir' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { printBarcodeLabels, type LabelItem, type LabelFormat } from '@/utils/barcodeLabelsPdf';

interface SelectableItem extends LabelItem {
  key: string;
  selected: boolean;
}

const props = defineProps<{
  show: boolean;
  productos: any[];
  initialProducto?: any | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const STORAGE_KEY = 'sansah_label_format';
const savedFormat = (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null) as LabelFormat | null;
const formato = ref<LabelFormat>(
  savedFormat && ['50x25', '50x30', '58x40', 'hoja'].includes(savedFormat) ? savedFormat : '50x25'
);

const cambiarFormato = (nuevoFormato: LabelFormat) => {
  formato.value = nuevoFormato;
  try {
    localStorage.setItem(STORAGE_KEY, nuevoFormato);
  } catch (e) {
    console.warn('No se pudo guardar el formato en localStorage:', e);
  }
};

const formatoLabelInfo = computed(() => {
  switch (formato.value) {
    case '50x25':
      return 'Rollo térmico 50×25 mm (tamaño estándar universal)';
    case '50x30':
      return 'Rollo térmico 50×30 mm (rollo mediano)';
    case '58x40':
      return 'Rollo térmico 58×40 mm (rollo ancho para impresoras de 58 mm)';
    case 'hoja':
      return 'Hoja Carta autoadherible (cuadrícula 3×10 = 30 etiquetas por página)';
    default:
      return '';
  }
});

const busqueda = ref('');
const generando = ref(false);
const items = ref<SelectableItem[]>([]);

// Construir lista plana de items (expandiendo variantes si existen)
const buildItemsList = () => {
  const list: SelectableItem[] = [];

  for (const p of props.productos || []) {
    // Si tiene variaciones
    if (p.es_variable && Array.isArray(p.variaciones) && p.variaciones.length > 0) {
      p.variaciones.forEach((v: any) => {
        const varBarcode = v.codigo_barras || p.codigo_barras || p.sku || `VAR-${p.id}-${v.id}`;
        const isMatch = props.initialProducto && props.initialProducto.id === p.id;
        list.push({
          key: `prod_${p.id}_var_${v.id}`,
          id: p.id,
          nombre: p.nombre,
          variante: v.nombre || v.valor || `Var #${v.id}`,
          precio: parseFloat(v.precio) || parseFloat(p.precio) || 0,
          codigoBarras: varBarcode,
          cantidad: 1,
          selected: isMatch ? true : false,
        });
      });
    } else {
      // Producto simple
      const barcode = p.codigo_barras || p.sku || `PRD-${p.id}`;
      const isMatch = props.initialProducto && props.initialProducto.id === p.id;
      list.push({
        key: `prod_${p.id}`,
        id: p.id,
        nombre: p.nombre,
        variante: undefined,
        precio: parseFloat(p.precio) || 0,
        codigoBarras: barcode,
        cantidad: 1,
        selected: isMatch ? true : false,
      });
    }
  }

  items.value = list;
};

// Sincronizar items al abrir el modal o cambiar props
watch(
  () => props.show,
  (val) => {
    if (val) {
      buildItemsList();
      busqueda.value = '';
    }
  },
  { immediate: true }
);

// Filtrado reactivo por texto de búsqueda
const itemsFiltrados = computed(() => {
  if (!busqueda.value || !busqueda.value.trim()) {
    return items.value;
  }
  const q = busqueda.value.toLowerCase().trim();
  return items.value.filter((it) => {
    const nombreMatch = it.nombre.toLowerCase().includes(q);
    const codeMatch = it.codigoBarras.toLowerCase().includes(q);
    const varMatch = it.variante ? it.variante.toLowerCase().includes(q) : false;
    return nombreMatch || codeMatch || varMatch;
  });
});

// Selección global
const itemsSeleccionados = computed(() => {
  return items.value.filter((it) => it.selected);
});

const todosSeleccionados = computed(() => {
  if (itemsFiltrados.value.length === 0) return false;
  return itemsFiltrados.value.every((it) => it.selected);
});

const toggleTodos = () => {
  const targetState = !todosSeleccionados.value;
  itemsFiltrados.value.forEach((it) => {
    it.selected = targetState;
  });
};

const totalEtiquetas = computed(() => {
  return itemsSeleccionados.value.reduce((acc, it) => acc + (it.cantidad || 1), 0);
});

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(val);
};

const cerrar = () => {
  emit('close');
};

const generarEImprimir = () => {
  const selected = itemsSeleccionados.value;
  if (selected.length === 0) return;

  generando.value = true;
  try {
    const payload: LabelItem[] = selected.map((it) => ({
      id: it.id,
      nombre: it.nombre,
      variante: it.variante,
      precio: it.precio,
      codigoBarras: it.codigoBarras,
      cantidad: Math.max(1, it.cantidad || 1),
    }));

    printBarcodeLabels(payload, formato.value);
  } catch (err) {
    console.error('Error al imprimir etiquetas:', err);
    alert('Ocurrió un error al generar las etiquetas.');
  } finally {
    generando.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
