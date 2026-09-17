<template>
  <AdminLayout>
    <div class="space-y-5 sm:space-y-6" v-if="pedido">

      <!-- Header -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <router-link
            to="/pedidos"
            class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </router-link>
          <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2 flex-wrap">
            Venta <span class="text-brand-500 font-mono">#{{ pedido.orden }}</span>
            
            <span v-if="pedido.canal_venta === 'Tienda en Línea'" class="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              Venta en Línea
            </span>
            <span v-else class="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              POS / Mostrador
            </span>
          </h1>
        </div>

        <button
          @click="imprimirTicket"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Imprimir Ticket
        </button>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-12 gap-5 items-start">

        <!-- ═══ LEFT CARD: Datos del pedido ═══ -->
        <div class="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Información de la Venta</h2>
          </div>

          <div class="px-6 py-6 space-y-6">

            <!-- Fila 1: # Orden, Cliente, Fecha, Total -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Orden</p>
                <p class="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">#{{ pedido.orden }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Cliente</p>
                <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ pedido.cliente }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Fecha</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">{{ pedido.fecha }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Total</p>
                <p class="font-bold text-gray-800 dark:text-white/90 text-sm">${{ pedido.total.toLocaleString('es-MX') }} MXN</p>
              </div>
            </div>



            <div class="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Método de Pago</p>
                <span class="text-sm font-medium text-gray-800 dark:text-white/90">{{ pedido.metodo_pago }}</span>
              </div>

              <div class="col-span-2 sm:col-span-1">
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Estado</p>
                <div class="flex items-center gap-2">
                  <select 
                    v-model="estadoPendiente" 
                    class="h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-brand-500 outline-none flex-1"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Cancelado">Cancelado</option>
                    <option value="Devuelto">Devuelto</option>
                    <option value="Rembolsado">Rembolsado</option>
                    <option value="Fallido">Fallido</option>
                    <option value="Completado">Completado</option>
                  </select>
                  <button 
                    v-if="estadoPendiente !== pedido.estado" 
                    @click="guardarEstado"
                    :disabled="savingEstado"
                    class="h-8 px-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition flex items-center justify-center shrink-0"
                  >
                    Guardar
                  </button>
                </div>
              </div>

              <template v-if="pedido.domicilio">
                <div class="col-span-2">
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1.5">Domicilio de entrega</p>
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ pedido.domicilio }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Ubicación</p>
                  <a
                    :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.domicilio)}`"
                    target="_blank"
                    class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Ver Mapa
                  </a>
                </div>
              </template>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-800" />

            <!-- Notas del cliente -->
            <div>
              <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1.5 block">Notas del cliente</p>
              <div
                v-if="pedido.nota"
                class="w-full rounded-lg border border-warning-200 dark:border-warning-500/30 bg-warning-50 dark:bg-warning-500/10 px-4 py-3 text-sm text-warning-800 dark:text-warning-300 leading-relaxed"
              >
                {{ pedido.nota }}
              </div>
              <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">Sin notas.</p>
            </div>

            <!-- Devolución Button -->
            <div v-if="pedido.estado !== 'Devuelto' && pedido.estado !== 'Cancelado'" class="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                @click="showDevolucionConfirm = true"
                class="px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-theme-xs transition flex items-center gap-2 hover:opacity-90"
                style="background-color: #ff6a00 !important; color: #ffffff !important;"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2v6h6M21.5 22v-6h-6"/><path d="M22 11.5A10 10 0 0 0 9.5 3m-7.2 9.5A10 10 0 0 0 14.5 21"/></svg>
                Devolución
              </button>
            </div>

          </div>
        </div>

        <!-- ═══ RIGHT CARD: Resumen de productos ═══ -->
        <div class="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Productos</h2>
            <span class="rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 text-xs font-semibold px-2.5 py-0.5">
              {{ totalItems }} artículos
            </span>
          </div>

          <!-- Lista de productos -->
          <div class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto custom-scrollbar">
            <div
              v-for="item in pedido.items"
              :key="item.id"
              class="flex gap-3 px-5 py-4"
            >
              <div class="w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img :src="item.imagen" :alt="item.nombre" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{{ item.nombre }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ item.variante }}</p>
                <div class="flex items-center justify-between mt-1.5">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Cant: {{ item.cantidad }}</span>
                  <span class="text-sm font-semibold text-gray-800 dark:text-white/90">
                    ${{ (item.precio * item.cantidad).toLocaleString('es-MX') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div class="px-5 py-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${{ subtotal.toLocaleString('es-MX') }} MXN</span>
            </div>
            <div v-if="pedido.domicilio || pedido.envio > 0" class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Envío</span>
              <span v-if="pedido.envio === 0" class="text-success-600 dark:text-success-500 font-medium">Gratis</span>
              <span v-else>${{ pedido.envio.toLocaleString('es-MX') }} MXN</span>
            </div>
            <div class="border-t border-gray-100 dark:border-gray-800 pt-2.5 flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800 dark:text-white/90">Total</span>
              <span class="text-base font-bold text-brand-600 dark:text-brand-400">
                ${{ pedido.total.toLocaleString('es-MX') }} MXN
              </span>
            </div>
          </div>
        </div>



      </div>
    </div>

    <!-- Not found -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p class="text-lg font-medium text-gray-600 dark:text-gray-400">Pedido no encontrado.</p>
      <router-link to="/pedidos" class="mt-4 text-sm text-brand-500 hover:text-brand-600">← Volver a Pedidos</router-link>
    </div>
  </AdminLayout>

  <!-- Toast de confirmación -->
  <Teleport to="body">
    <transition name="toast-slide">
      <div v-if="toast.show" class="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-medium"
        :class="toast.type === 'success' ? 'bg-success-500 text-white' : 'bg-error-500 text-white'"
      >
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ toast.msg }}
      </div>
    </transition>
  </Teleport>

  <!-- Devolución Confirmation Modal -->
  <Teleport to="body">
    <div v-if="showDevolucionConfirm" class="fixed inset-0 z-[999999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" @click.self="closeDevolucionModal">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 overflow-hidden animate-modal-in">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Confirmar Devolución</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Esta acción regresará los productos de esta orden al inventario y marcará la venta como devuelta.
          </p>
          <p v-if="devolucionError" class="text-xs font-semibold text-error-500 mt-2">
            {{ devolucionError }}
          </p>
        </div>
        
        <div class="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex justify-end gap-3">
          <button
            @click="closeDevolucionModal"
            type="button"
            class="px-4 py-2 text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmDevolucion"
            :disabled="submittingDevolucion"
            type="button"
            class="px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors disabled:opacity-50 hover:opacity-90"
            style="background-color: #ff6a00 !important; color: #ffffff !important;"
          >
            <span v-if="submittingDevolucion">Procesando...</span>
            <span v-else>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { useAuth } from '@/composables/useAuth';
import { printThermalTicket } from '@/utils/thermalTicketPdf';

const { admin } = useAuth();

const route = useRoute();
const pedido = ref(null);
const loading = ref(true);

// Estados que disparan correo al cliente (debe coincidir con EMAIL_TRIGGERS en el server)
const EMAIL_STATES = new Set(['En proceso', 'Completado', 'Cancelado', 'Fallido']);

// Estado local pendiente de guardar
const estadoPendiente = ref('');
const savingEstado    = ref(false);
const toast = ref({ show: false, type: 'success', msg: '' });



function showToast(type, msg) {
  toast.value = { show: true, type, msg };
  setTimeout(() => { toast.value.show = false; }, 3500);
}

const estadoTriggerEmail = computed(() => EMAIL_STATES.has(estadoPendiente.value));

const fetchPedido = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/pedidos/${route.params.id}`);
    if (!res.ok) throw new Error('Pedido no encontrado');
    const data = await res.json();
    
    const d = new Date(data.created_at);
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const fechaFormateada = `${d.getDate().toString().padStart(2,'0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;

    pedido.value = {
      id: data.id,
      orden: data.orden,
      cliente: data.nombre,
      fecha: fechaFormateada,
      ciudad: data.ciudad,
      canal_venta: data.canal_venta || 'Tienda en Línea',
      metodo_pago: data.metodo_pago || 'Tarjeta de Crédito',
      estado: data.estado,
      correo: data.correo,
      telefono: data.telefono,
      domicilio: data.domicilio,
      nota: data.notas,
      items: data.items || [],
      envio: parseFloat(data.envio),
      total: parseFloat(data.total)
    };
    // Inicializar el estado pendiente con el valor guardado en BD
    estadoPendiente.value = data.estado;
  } catch (error) {
    console.error('Error fetching pedido:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPedido();
});

const guardarEstado = async () => {
  if (!pedido.value || savingEstado.value) return;
  if (estadoPendiente.value === pedido.value.estado) return;
  savingEstado.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/pedidos/${pedido.value.id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: estadoPendiente.value })
    });
    if (!res.ok) throw new Error('Error al actualizar el estado');
    const data = await res.json();
    // Actualizar el estado guardado localmente
    pedido.value.estado = estadoPendiente.value;
    const emailMsg = data.emailEnviado ? ' · Correo enviado al cliente ✓' : '';
    showToast('success', `Estado actualizado a "${estadoPendiente.value}"${emailMsg}`);
  } catch (error) {
    console.error('Error updating status:', error);
    // Rollback visual
    estadoPendiente.value = pedido.value.estado;
    showToast('error', 'Error al guardar el estado. Intenta nuevamente.');
  } finally {
    savingEstado.value = false;
  }
};



const showDevolucionConfirm = ref(false);
const submittingDevolucion = ref(false);
const devolucionError = ref('');

const closeDevolucionModal = () => {
  showDevolucionConfirm.value = false;
  devolucionError.value = '';
};

const confirmDevolucion = async () => {
  submittingDevolucion.value = true;
  devolucionError.value = '';
  
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/pedidos/${pedido.value.id}/devolucion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al procesar la devolución');
    
    pedido.value.estado = 'Devuelto';
    estadoPendiente.value = 'Devuelto';
    showToast('success', 'Devolución realizada exitosamente y stock reingresado.');
    closeDevolucionModal();
  } catch (err) {
    console.error(err);
    devolucionError.value = err.message;
  } finally {
    submittingDevolucion.value = false;
  }
};

const esTaller = computed(() => {
  if (!pedido.value) return false;
  return pedido.value.canal_venta === 'Taller' || 
         (pedido.value.canal_venta === 'POS' && 
          pedido.value.items.some(item => (item.nombre || '').toLowerCase().includes('servicio:')));
});

const totalItems = computed(() => pedido.value?.items.reduce((s, x) => s + x.cantidad, 0) ?? 0);
const subtotal   = computed(() => pedido.value?.items.reduce((s, x) => s + (x.precio * x.cantidad), 0) ?? 0);

const estadoTextClase = (estado) => {
  const m = {
    'Nuevo':      'text-blue-light-600 dark:text-blue-light-400',
    'Pendiente':  'text-orange-500 dark:text-orange-400',
    'En proceso': 'text-warning-600 dark:text-warning-400',
    'Completado': 'text-success-600 dark:text-success-500',
    'Fallido':    'text-error-600 dark:text-error-500',
    'Cancelado':  'text-gray-500 dark:text-gray-400',
    'Devuelto':   'text-red-500 dark:text-red-400',
    'Rembolsado': 'text-purple-600 dark:text-purple-400',
  };
  return m[estado] ?? '';
};

const imprimirTicket = () => {
  if (!pedido.value) return;
  printThermalTicket({
    orderNum: pedido.value.orden,
    fecha: pedido.value.fecha,
    cliente: pedido.value.cliente,
    metodoPago: pedido.value.metodo_pago,
    canal: pedido.value.canal_venta,
    items: (pedido.value.items || []).map((it) => ({
      nombre: it.nombre,
      variante: it.variante,
      cantidad: it.cantidad,
      precio: parseFloat(it.precio) || 0,
      subtotal: (parseFloat(it.precio) || 0) * it.cantidad,
    })),
    subtotal: subtotal.value,
    total: pedido.value.total,
    nota: pedido.value.nota,
  });
};
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.animate-spin {
  animation: spin 0.75s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
