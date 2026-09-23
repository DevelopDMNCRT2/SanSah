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
                <p class="text-xs text-gray-500 dark:text-gray-400">Rollo térmico estándar 50×25 mm</p>
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

          <!-- Controls Section: Indicador de Medida + Buscador -->
          <div class="px-6 py-3 bg-gray-50/70 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 shrink-0">
            <!-- Indicador de Formato Rollo Térmico -->
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-xs font-semibold text-brand-700 dark:text-brand-400 border border-gray-200 dark:border-gray-700 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                Rollo Térmico 50×25 mm
              </span>
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
              :class="item.selected ? 'border-brand-300 dark:border-brand-500/40 bg-brand-50/20 dark:bg-brand-500/5' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'"
              class="flex items-center justify-between p-3 rounded-xl border transition-all gap-3"
            >
              <!-- Checkbox + Info -->
              <div class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" @click="item.selected = !item.selected">
                <input
                  type="checkbox"
                  v-model="item.selected"
                  @click.stop
                  class="rounded border-gray-300 text-brand-500 focus:ring-brand-400 shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">{{ item.nombre }}</p>
                  <div class="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                    <span v-if="item.variante" class="font-medium text-brand-600 dark:text-brand-400">Var: {{ item.variante }}</span>
                    <span class="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[11px] text-gray-600 dark:text-gray-300">
                      {{ item.codigoBarras }}
                    </span>
                    <span class="font-bold text-gray-700 dark:text-gray-200">${{ Number(item.precio).toFixed(2) }} MXN</span>
                  </div>
                </div>
              </div>

              <!-- Control de Cantidad -->
              <div class="flex items-center gap-1.5 shrink-0" :class="{ 'opacity-40 pointer-events-none': !item.selected }">
                <span class="text-xs text-gray-400 font-medium">Copias:</span>
                <button
                  type="button"
                  @click.stop="item.cantidad = Math.max(1, item.cantidad - 1)"
                  class="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  v-model.number="item.cantidad"
                  min="1"
                  max="500"
                  class="w-12 h-7 text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-white"
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
              <p class="text-[11px] text-gray-400 mt-0.5">Compatible con rollos térmicos de 50×25 mm o superiores</p>
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
import { printBarcodeLabels, type LabelItem } from '@/utils/barcodeLabelsPdf';

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
          selected: !!isMatch,
        });
      });
    } else {
      const pBarcode = p.codigo_barras || p.sku || String(p.id).padStart(8, '0');
      const isMatch = props.initialProducto && props.initialProducto.id === p.id;
      list.push({
        key: `prod_${p.id}`,
        id: p.id,
        nombre: p.nombre,
        variante: '',
        precio: parseFloat(p.precio) || 0,
        codigoBarras: pBarcode,
        cantidad: 1,
        selected: !!isMatch,
      });
    }
  }

  // Si no había initialProducto, por defecto seleccionar los primeros 5 o ninguno
  if (!props.initialProducto && list.length > 0) {
    list.slice(0, 5).forEach((it) => (it.selected = true));
  }

  items.value = list;
};

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

const itemsFiltrados = computed(() => {
  if (!busqueda.value.trim()) return items.value;
  const q = busqueda.value.toLowerCase().trim();
  return items.value.filter(
    (it) =>
      it.nombre.toLowerCase().includes(q) ||
      (it.variante && it.variante.toLowerCase().includes(q)) ||
      it.codigoBarras.toLowerCase().includes(q)
  );
});

const itemsSeleccionados = computed(() => {
  return items.value.filter((it) => it.selected);
});

const totalEtiquetas = computed(() => {
  return itemsSeleccionados.value.reduce((sum, it) => sum + Math.max(1, Number(it.cantidad) || 1), 0);
});

const todosSeleccionados = computed(() => {
  return itemsFiltrados.value.length > 0 && itemsFiltrados.value.every((it) => it.selected);
});

const toggleTodos = () => {
  const nuevoEstado = !todosSeleccionados.value;
  itemsFiltrados.value.forEach((it) => (it.selected = nuevoEstado));
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

    printBarcodeLabels(payload);
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
