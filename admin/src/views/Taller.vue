<template>
  <AdminLayout>
    <div class="flex flex-col bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800" style="height: calc(100vh - 112px);">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Órdenes del Taller</h1>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500"></span>
            </span>
            Monitoreo Activo
          </div>
          <button @click="abrirNuevoServicio" class="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Servicio
          </button>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden mt-2">
        
        <!-- ================= COL 1: RECIBIDO ================= -->
        <div class="flex flex-col rounded-2xl bg-[#F8F9FA] dark:bg-gray-800/40 p-4 border border-gray-100 dark:border-gray-800 h-full overflow-hidden">
          <!-- Column Header -->
          <div class="flex items-center justify-between mb-5 px-1">
            <div class="flex items-center gap-2.5">
              <div class="text-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h2 class="font-extrabold text-[#2D3A4A] dark:text-white text-lg">Recibido</h2>
            </div>
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg px-2.5 py-1 flex items-center justify-center">
              <span class="text-[#2D3A4A] dark:text-white text-sm font-black">{{ recibidos.length }}</span>
            </div>
          </div>
          
          <!-- Column Body -->
          <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar px-1 pb-4">
            <div v-if="recibidos.length === 0" class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex items-center justify-center text-center">
              <span class="text-gray-400 font-medium text-sm">Sin órdenes recibidas</span>
            </div>
            
            <!-- Cards -->
            <div v-for="orden in recibidos" :key="orden.id" class="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <!-- Top Row -->
              <div class="flex justify-between items-start gap-2">
                <h3 class="font-bold text-gray-900 dark:text-white text-[17px] leading-tight">{{ orden.cliente }}</h3>
                <div class="bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ orden.fecha }}
                </div>
              </div>
              
              <!-- Badges -->
              <div class="flex flex-wrap gap-2">
                <div class="bg-[#E6F3F2] dark:bg-teal-500/10 text-[#2D5A5A] dark:text-teal-400 border border-[#D0EBE8] dark:border-teal-500/20 rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                  {{ orden.bicicleta || 'Bicicleta' }}
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01M7 11h.01M7 15h.01M11 7h6M11 11h6M11 15h6"/></svg>
                  {{ orden.numero }}
                </div>
              </div>
              
              <!-- Description & Service -->
              <div class="space-y-1">
                <div v-if="orden.servicio" class="text-[13px] font-bold text-brand-600 dark:text-brand-400 leading-snug">{{ orden.servicio }}</div>
                <p class="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-4 leading-snug whitespace-pre-line">{{ orden.descripcion }}</p>
              </div>
              
              <!-- Bottom Row -->
              <div class="mt-1 flex items-center justify-between">
                <span class="text-xl font-black text-gray-900 dark:text-white tracking-tight">${{ calcularTotalOrden(orden) }}</span>
                <button @click="abrirDetalles(orden)" class="bg-brand-500 hover:bg-brand-600 active:scale-95 transition-all text-white px-4 py-2 rounded-xl font-bold text-[13px] shadow-sm flex items-center gap-1.5">
                  Detalles <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= COL 2: EN PROGRESO ================= -->
        <div class="flex flex-col rounded-2xl bg-[#F8F9FA] dark:bg-gray-800/40 p-4 border border-gray-100 dark:border-gray-800 h-full overflow-hidden">
          <div class="flex items-center justify-between mb-5 px-1">
            <div class="flex items-center gap-2.5">
              <div class="text-[#f97316] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </div>
              <h2 class="font-extrabold text-[#2D3A4A] dark:text-white text-lg">En Progreso</h2>
            </div>
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg px-2.5 py-1 flex items-center justify-center">
              <span class="text-[#2D3A4A] dark:text-white text-sm font-black">{{ enProgreso.length }}</span>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar px-1 pb-4">
            <div v-if="enProgreso.length === 0" class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex items-center justify-center text-center">
              <span class="text-gray-400 font-medium text-sm">Sin órdenes en progreso</span>
            </div>
            
            <div v-for="orden in enProgreso" :key="orden.id" class="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start gap-2">
                <h3 class="font-bold text-gray-900 dark:text-white text-[17px] leading-tight">{{ orden.cliente }}</h3>
                <div class="bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ orden.fecha }}
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2">
                <div class="bg-[#E6F3F2] dark:bg-teal-500/10 text-[#2D5A5A] dark:text-teal-400 border border-[#D0EBE8] dark:border-teal-500/20 rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                  {{ orden.bicicleta || 'Bicicleta' }}
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01M7 11h.01M7 15h.01M11 7h6M11 11h6M11 15h6"/></svg>
                  {{ orden.numero }}
                </div>
              </div>
              
              <div class="space-y-1">
                <div v-if="orden.servicio" class="text-[13px] font-bold text-brand-600 dark:text-brand-400 leading-snug">{{ orden.servicio }}</div>
                <p class="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-4 leading-snug whitespace-pre-line">{{ orden.descripcion }}</p>
              </div>
              
              <div class="mt-2 flex flex-col gap-2">
                <div class="flex items-center justify-between px-1">
                  <span class="text-sm font-bold text-gray-500 dark:text-gray-400">Total:</span>
                  <span class="text-lg font-black text-gray-900 dark:text-white tracking-tight">${{ calcularTotalOrden(orden) }}</span>
                </div>
                <div class="flex gap-2 w-full">
                  <button @click="abrirActualizarOrden(orden)" class="flex-1 bg-brand-500 hover:bg-brand-600 active:scale-95 transition-all text-white py-2 rounded-xl font-bold text-[12px] shadow-sm flex items-center justify-center">
                    Refacciones
                  </button>
                  <button @click="moverA(orden, 'para_entrega')" class="flex-1 bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white py-2 rounded-xl font-bold text-[12px] shadow-sm flex items-center justify-center gap-1">
                    Finalizar <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= COL 3: PARA ENTREGA ================= -->
        <div class="flex flex-col rounded-2xl bg-[#F8F9FA] dark:bg-gray-800/40 p-4 border border-gray-100 dark:border-gray-800 h-full overflow-hidden">
          <div class="flex items-center justify-between mb-5 px-1">
            <div class="flex items-center gap-2.5">
              <div class="text-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <h2 class="font-extrabold text-[#2D3A4A] dark:text-white text-lg">Para Entrega</h2>
            </div>
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg px-2.5 py-1 flex items-center justify-center">
              <span class="text-[#2D3A4A] dark:text-white text-sm font-black">{{ paraEntrega.length }}</span>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar px-1 pb-4">
            <div v-if="paraEntrega.length === 0" class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex items-center justify-center text-center">
              <span class="text-gray-400 font-medium text-sm">Sin órdenes para entregar</span>
            </div>
            
            <div v-for="orden in paraEntrega" :key="orden.id" class="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start gap-2">
                <h3 class="font-bold text-gray-900 dark:text-white text-[17px] leading-tight">{{ orden.cliente }}</h3>
                <div class="bg-green-50 dark:bg-green-500/10 text-green-500 rounded-lg px-2 py-1 text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ orden.fecha }}
                </div>
              </div>
              
              <div class="flex flex-wrap gap-2">
                <div class="bg-[#E6F3F2] dark:bg-teal-500/10 text-[#2D5A5A] dark:text-teal-400 border border-[#D0EBE8] dark:border-teal-500/20 rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                  {{ orden.bicicleta || 'Bicicleta' }}
                </div>
                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01M7 11h.01M7 15h.01M11 7h6M11 11h6M11 15h6"/></svg>
                  {{ orden.numero }}
                </div>
              </div>
              
              <div class="space-y-1">
                <div v-if="orden.servicio" class="text-[13px] font-bold text-brand-600 dark:text-brand-400 leading-snug">{{ orden.servicio }}</div>
                <p class="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-4 leading-snug whitespace-pre-line">{{ orden.descripcion }}</p>
              </div>
              
              <div class="mt-1 flex items-center justify-between">
                <span class="text-xl font-black text-gray-900 dark:text-white tracking-tight">${{ calcularTotalOrden(orden) }}</span>
                <button @click="solicitarEntrega(orden)" class="bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white px-4 py-2 rounded-xl font-bold text-[13px] shadow-sm flex items-center gap-1.5">
                  Entregado <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal de Confirmación (Resumen de Entrega) -->
    <Modal v-if="showModal" :fullScreenBackdrop="true" @close="cancelarEntrega">
      <template #body>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">Resumen de Orden</h2>
            <button @click="cancelarEntrega" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div class="space-y-4 text-left">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
              <p class="text-base font-bold text-gray-900 dark:text-white">{{ ordenSeleccionada?.cliente }} <span v-if="ordenSeleccionada?.bicicleta">- {{ ordenSeleccionada.bicicleta }}</span></p>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[13px] font-bold text-gray-700 dark:text-gray-200">{{ ordenSeleccionada?.servicio || 'Servicio General' }}</span>
                <span class="text-[13px] font-bold text-gray-900 dark:text-white">${{ Number(ordenSeleccionada?.costo || 0).toFixed(2) }}</span>
              </div>
              
              <template v-if="ordenSeleccionada?.piezas?.length > 0">
                <div class="border-t border-gray-200 dark:border-gray-700 my-2 pt-2 space-y-1.5">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Refacciones y Extras</p>
                  <div v-for="(pieza, index) in ordenSeleccionada.piezas" :key="index" class="flex justify-between items-center">
                    <span class="text-[13px] text-gray-600 dark:text-gray-400">- {{ pieza.nombre }}</span>
                    <span class="text-[13px] font-medium text-gray-800 dark:text-gray-300">${{ Number(pieza.precio || 0).toFixed(2) }}</span>
                  </div>
                </div>
              </template>
            </div>
            
            <div class="flex justify-between items-center pt-2 border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
              <span class="text-sm font-bold text-gray-800 dark:text-gray-200">Total Estimado</span>
              <span class="text-xl font-black text-brand-600 dark:text-brand-400">
                ${{ (Number(ordenSeleccionada?.costo || 0) + (ordenSeleccionada?.piezas || []).reduce((acc, p) => acc + Number(p.precio || 0), 0)).toFixed(2) }}
              </span>
            </div>
            
            <div v-if="ordenSeleccionada?.descripcion" class="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 rounded-xl p-3 shadow-sm">
              <p class="text-[11px] font-black text-yellow-800 dark:text-yellow-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                Notas de la Orden
              </p>
              <p class="text-[13px] text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap leading-snug">{{ ordenSeleccionada.descripcion }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 w-full mt-5">
            <button @click="cancelarEntrega" class="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancelar
            </button>
            <button @click="confirmarEntrega" class="flex-1 py-2.5 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center gap-2">
              Cobrar
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Modal Detalles del Servicio -->
    <Modal v-if="showDetallesModal" :fullScreenBackdrop="true" @close="cerrarDetalles">
      <template #body>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100 dark:border-gray-700 relative">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">Detalles del Servicio</h2>
            <button @click="cerrarDetalles" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div class="space-y-4 text-left">
            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
              <p class="text-base font-bold text-gray-900 dark:text-white">{{ ordenEnDetalle?.cliente }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Bicicleta</p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ ordenEnDetalle?.bicicleta || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Teléfono</p>
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ ordenEnDetalle?.telefono || 'N/A' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-if="ordenEnDetalle?.servicio" class="col-span-2">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Servicio Solicitado</p>
                <p class="text-base font-black text-brand-600 dark:text-brand-400">{{ ordenEnDetalle.servicio }}</p>
              </div>

              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Costo Estimado</p>
                <p class="text-lg font-black text-gray-900 dark:text-white">${{ ordenEnDetalle?.costo }}</p>
              </div>
            </div>

            <div>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notas / Descripción</p>
              <div class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ ordenEnDetalle?.descripcion }}</p>
              </div>
            </div>
          </div>

          <div class="pt-6 flex items-center justify-end gap-3">
            <button @click="cerrarDetalles" class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
              Cerrar
            </button>
            <button @click="empezarTrabajo" class="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all flex items-center gap-2 shadow-sm text-sm active:scale-95">
              Comenzar Reparación
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Modal Nuevo Servicio -->
    <Modal v-if="showNuevoServicioModal" :fullScreenBackdrop="true" @close="cerrarNuevoServicio">
      <template #body>
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-gray-100 dark:border-gray-700 relative">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white/90">Nuevo Servicio</h2>
            <button @click="cerrarNuevoServicio" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <form @submit.prevent="guardarNuevoServicio" class="space-y-4">
            <!-- Autocomplete Cliente -->
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">A nombre de:</label>
              <input
                v-model="nuevoServicioForm.cliente"
                @input="buscarClientes"
                @blur="cerrarSugerencias"
                @focus="buscarClientes"
                type="text"
                required
                autocomplete="off"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="Escribe para buscar o crear cliente..."
              >
              <!-- Sugerencias -->
              <div
                v-if="clienteSugerencias.length > 0 && mostrarSugerencias"
                class="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
              >
                <button
                  v-for="c in clienteSugerencias"
                  :key="c.id"
                  type="button"
                  @mousedown.prevent="seleccionarCliente(c)"
                  class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-left transition-colors"
                >
                  <div class="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
                    <span class="text-xs font-bold text-brand-700 dark:text-brand-400">{{ c.nombre.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ c.nombre }}</p>
                    <p v-if="c.telefono" class="text-xs text-gray-500">{{ c.telefono }}</p>
                  </div>
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bicicleta / Marca:</label>
                <input 
                  v-model="nuevoServicioForm.bicicleta" 
                  type="text" 
                  required 
                  class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
                  placeholder="Ej. Trek Marlin 7, Specialized Rockhopper..."
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono:</label>
                <input v-model="nuevoServicioForm.telefono" @input="nuevoServicioForm.telefono = nuevoServicioForm.telefono.replace(/[^0-9]/g, '').slice(0, 10)" type="text" maxlength="10" minlength="10" pattern="[0-9]{10}" title="Debe contener exactamente 10 dígitos" required class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Ej. 5512345678">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción del servicio:</label>
              <textarea v-model="nuevoServicioForm.descripcion" required rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Detalles de la reparación o mantenimiento..."></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Servicio a realizar:</label>
              <select v-model="nuevoServicioForm.servicioSeleccionado" required class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                <option :value="null" disabled selected>Selecciona un servicio</option>
                <option v-for="s in serviciosList" :key="s.id" :value="s">
                  {{ s.nombre }} - ${{ Number(s.precio || 0).toFixed(2) }}
                </option>
              </select>
            </div>

            <div class="pt-4 flex items-center justify-end gap-3">
              <button type="button" @click="cerrarNuevoServicio" class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors">
                Guardar Servicio
              </button>
            </div>
          </form>
        </div>
      </template>
    </Modal>

    <!-- Modal Actualizar Orden -->
    <Modal v-if="showActualizarModal" :fullScreenBackdrop="true" @close="cerrarActualizarOrden">
      <template #body>
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-0 w-full max-w-[1000px] shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row overflow-hidden h-[85vh]">
          <!-- Left Panel: Orden y Carrito (1/3 width) -->
          <div class="w-full md:w-[320px] lg:w-[350px] flex flex-col bg-gray-50/50 dark:bg-gray-800/30 border-r border-gray-200 dark:border-gray-700 shrink-0">
             <!-- Header con Título y Cerrar -->
             <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
               <h2 class="text-lg font-bold text-gray-800 dark:text-white">Actualizar Orden</h2>
               <button @click="cerrarActualizarOrden" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
               </button>
             </div>
             
             <!-- Body del Left Panel -->
             <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                <!-- Cliente -->
                <div class="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                  <p class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
                  <p class="text-[14px] font-bold text-gray-900 dark:text-white">{{ ordenAActualizar?.cliente }} <span v-if="ordenAActualizar?.bicicleta" class="text-brand-600 dark:text-brand-400">- {{ ordenAActualizar.bicicleta }}</span></p>
                </div>
                
                <!-- Piezas Seleccionadas -->
                <div class="flex-1 flex flex-col min-h-[200px]">
                  <p class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cargos Extra ({{ piezasActuales.length }})</p>
                  
                  <div v-if="piezasActuales.length === 0" class="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 p-4">
                    <svg class="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    <span class="text-xs text-center">Selecciona productos de la tienda para añadirlos.</span>
                  </div>
                  
                  <div v-else class="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                    <div v-for="(pieza, i) in piezasActuales" :key="i" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 flex items-center gap-3 shadow-sm group">
                      <div class="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                        <img v-if="pieza.imagen_url" :src="pieza.imagen_url" loading="lazy" decoding="async" alt="" class="h-full w-full object-cover" />
                        <div v-else class="h-full w-full flex items-center justify-center text-gray-300">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-[12px] text-gray-800 dark:text-gray-200 truncate">{{ pieza.nombre }}</h4>
                        <p class="text-brand-600 dark:text-brand-400 text-[11px] font-black">${{ Number(pieza.precio).toFixed(2) }}</p>
                      </div>
                      <button type="button" @click="quitarRefaccion(i)" class="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Notas -->
                <div class="mt-2">
                  <p class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Añadir Nota a la Orden</p>
                  <textarea v-model="nuevaNota" rows="2" class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm resize-none shadow-sm" placeholder="Ej. Se encontraron frenos gastados..."></textarea>
                </div>
             </div>
             
             <!-- Footer Left Panel -->
             <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 space-y-3">
               <div class="flex justify-between items-center px-1">
                 <span class="text-sm font-bold text-gray-600 dark:text-gray-400">Total Extras:</span>
                 <span class="text-lg font-black text-brand-600 dark:text-brand-400">${{ Number(totalPiezasActuales).toFixed(2) }}</span>
               </div>
               <div class="grid grid-cols-2 gap-2">
                 <button type="button" @click="cerrarActualizarOrden" class="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-[13px] shadow-sm">
                   Cancelar
                 </button>
                 <button type="button" @click="guardarCambiosActualizar(false)" class="w-full py-2.5 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 transition-colors text-[13px] shadow-sm flex items-center justify-center gap-1">
                   Finalizar <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                 </button>
               </div>
             </div>
          </div>

          <!-- Right Panel: Tienda (2/3 width) -->
          <div class="flex-1 flex flex-col bg-white dark:bg-gray-900 border-l md:border-l-0 border-t md:border-t-0 border-gray-200 dark:border-gray-800">
            <!-- Header Tienda (Buscador y Tabs) -->
            <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3">
              <div class="flex justify-between items-center gap-3">
                <h3 class="text-xl font-black text-gray-800 dark:text-white tracking-tight">Catálogo Extras</h3>
                <div class="relative w-64">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="busquedaModal" type="text" placeholder="Buscar producto..." class="w-full pl-8 pr-3 py-1.5 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>
              
              <!-- Tabs de Categoría -->
              <div class="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                <button 
                  v-for="cat in categoriasModal" 
                  :key="cat"
                  @click="activeCategoriaModal = cat"
                  :class="activeCategoriaModal === cat ? 'bg-gray-900 text-white dark:bg-brand-500 shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'"
                  class="px-4 py-1.5 rounded-lg font-bold text-[12px] transition-all whitespace-nowrap"
                >
                  {{ cat }}
                </button>
              </div>
            </div>
            
            <!-- Grid de Productos -->
            <div class="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-[#0f172a]/30">
              <div v-if="productosModalFiltrados.length === 0" class="text-center text-gray-400 mt-10">
                No se encontraron productos.
              </div>
              <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-6">
                <div 
                  v-for="producto in productosModalFiltrados" 
                  :key="producto.key"
                  @click="seleccionarRefaccionBuscada(producto)"
                  class="cursor-pointer group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                >
                   <div class="h-28 w-full overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
                      <img v-if="producto.imagen_url" :src="producto.imagen_url" loading="lazy" decoding="async" class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div v-else class="flex h-full items-center justify-center text-gray-300">
                        <svg class="h-6 w-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                      
                      <!-- Precio flotante -->
                      <div class="absolute bottom-1 right-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-lg shadow-sm border border-white/10">
                        <span class="text-[11px] font-black text-white tracking-wide">${{ Number(producto.precio).toFixed(2) }}</span>
                      </div>
                   </div>
                   <div class="p-2 flex-1 flex flex-col justify-between">
                     <h4 class="font-bold text-[11px] text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">{{ producto.nombre }}</h4>
                     <div class="flex justify-between items-center mt-1 gap-1">
                       <p class="text-[9px] text-gray-400 uppercase truncate">{{ producto.es_servicio ? 'Servicio' : producto.tienda }}</p>
                       <span v-if="!producto.es_servicio && producto.stock != null" class="text-[9px] font-bold shrink-0" :class="Number(producto.stock) > 0 ? 'text-green-600' : 'text-red-500'">{{ Number(producto.stock) > 0 ? `${producto.stock} pzas` : 'Agotado' }}</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Modal from '@/components/ui/Modal.vue';

const router = useRouter();

const calcularTotalOrden = (orden) => {
  const costoBase = Number(orden.costo) || 0;
  const costoPiezas = (orden.piezas || []).reduce((acc, p) => acc + Number(p.precio || 0), 0);
  return (costoBase + costoPiezas).toFixed(2);
};

// Productos para el datalist
const productosList = ref([]);
const serviciosList = computed(() => {
  return productosList.value.filter(p => p.es_servicio);
});
// Issue #21 — El catálogo de extras incluye TODO el inventario (refacciones,
// accesorios, etc.) además de los servicios. Antes solo pasaban productos con
// tienda exactamente "refacciones", que en producción no existe.
// Las variaciones se muestran como opciones independientes con su propio precio.
const refaccionesList = computed(() => {
  const lista = [];
  for (const p of productosList.value) {
    const vars = Array.isArray(p.variaciones) ? p.variaciones : [];
    if (!p.es_servicio && vars.length > 0) {
      for (const v of vars) {
        lista.push({
          ...p,
          key: `${p.id}-${v.id}`,
          nombre: `${p.nombre} - ${v.valor}`,
          precio: v.precio ?? p.precio,
          stock: v.stock,
          imagen_url: v.imagen_url || p.imagen_url,
          codigo_barras: v.codigo_barras || p.codigo_barras,
        });
      }
    } else {
      lista.push({ ...p, key: String(p.id) });
    }
  }
  return lista;
});
const fetchProductos = async () => {
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/products');
    if (res.ok) productosList.value = await res.json();
  } catch (e) {
    console.error('Error al cargar productos:', e);
  }
};

// ── Estado Real ─────────────────────────────────────────────────────────────
const ordenes = ref([]);
const loading = ref(true);

const fetchOrdenes = async () => {
  loading.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/taller');
    if (res.ok) ordenes.value = await res.json();
  } catch (e) {
    console.error('Error al cargar órdenes de taller:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProductos();
  fetchOrdenes();
});

const recibidos = computed(() => ordenes.value.filter(o => o.estado === 'recibido'));
const enProgreso = computed(() => ordenes.value.filter(o => o.estado === 'en_progreso'));
const paraEntrega = computed(() => ordenes.value.filter(o => o.estado === 'para_entrega'));

// ── Mover Kanban ────────────────────────────────────────────────────────────
const moverA = async (orden, nuevoEstado) => {
  // Optimistic update
  const index = ordenes.value.findIndex(o => o.id === orden.id);
  const estadoAnterior = orden.estado;
  if (index !== -1) ordenes.value[index].estado = nuevoEstado;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/taller/${orden.id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res.ok) throw new Error();
  } catch (e) {
    console.error('Error al actualizar estado:', e);
    // Rollback
    if (index !== -1) ordenes.value[index].estado = estadoAnterior;
    alert('No se pudo actualizar el estado.');
  }
};

// ── Detalles Servicio ────────────────────────────────────────────────────────
const showDetallesModal = ref(false);
const ordenEnDetalle = ref(null);

const abrirDetalles = (orden) => {
  ordenEnDetalle.value = orden;
  showDetallesModal.value = true;
};

const cerrarDetalles = () => {
  showDetallesModal.value = false;
  ordenEnDetalle.value = null;
};

const empezarTrabajo = () => {
  if (ordenEnDetalle.value) {
    moverA(ordenEnDetalle.value, 'en_progreso');
    cerrarDetalles();
  }
};

// ── Actualizar Orden (En Progreso) ──────────────────────────────────────────
const showActualizarModal = ref(false);
const ordenAActualizar = ref(null);
const nuevaNota = ref('');
const piezasActuales = ref([]);
// Estado del catálogo del modal
const busquedaModal = ref('');
const activeCategoriaModal = ref('Todos');

// Pestañas: Todos, Servicios, y luego cada categoría del inventario
const categoriasModal = computed(() => {
  const cats = new Set(refaccionesList.value.filter(p => !p.es_servicio).map(p => p.tienda || 'General'));
  const sorted = Array.from(cats).sort((a, b) => {
    // "Refacciones" primero si existe
    const ra = /refacc/i.test(a) ? 0 : 1, rb = /refacc/i.test(b) ? 0 : 1;
    return ra - rb || a.localeCompare(b, 'es');
  });
  return ['Todos', 'Servicios', ...sorted];
});

const productosModalFiltrados = computed(() => {
  let lista = refaccionesList.value; // Solo refacciones y servicios
  
  if (activeCategoriaModal.value === 'Servicios') {
    lista = lista.filter(p => p.es_servicio);
  } else if (activeCategoriaModal.value !== 'Todos') {
    lista = lista.filter(p => !p.es_servicio && (p.tienda || 'General') === activeCategoriaModal.value);
  }
  if (busquedaModal.value.trim()) {
    const q = busquedaModal.value.toLowerCase();
    lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || (p.codigo_barras || '').toLowerCase().includes(q));
  }
  return lista;
});

const seleccionarRefaccionBuscada = (refaccion) => {
  piezasActuales.value.push({
    id: refaccion.id,
    nombre: refaccion.nombre,
    precio: parseFloat(refaccion.precio) || 0,
    imagen_url: refaccion.imagen_url || null
  });
};

const totalPiezasActuales = computed(() => {
  return piezasActuales.value.reduce((acc, p) => acc + (p.precio || 0), 0);
});

const abrirActualizarOrden = (orden) => {
  ordenAActualizar.value = orden;
  piezasActuales.value = Array.isArray(orden.piezas) ? [...orden.piezas] : [];
  nuevaNota.value = '';
  busquedaModal.value = '';
  activeCategoriaModal.value = 'Todos';
  showActualizarModal.value = true;
};

const cerrarActualizarOrden = () => {
  showActualizarModal.value = false;
  ordenAActualizar.value = null;
};

const quitarRefaccion = (index) => {
  piezasActuales.value.splice(index, 1);
};

const guardarCambiosActualizar = async (finalizar = false) => {
  if (!ordenAActualizar.value) return;
  
  let descripcionActualizada = ordenAActualizar.value.descripcion;
  if (nuevaNota.value.trim()) {
    descripcionActualizada += `\n\n[Nota extra]: ${nuevaNota.value.trim()}`;
  }
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${API_URL}/api/taller/${ordenAActualizar.value.id}/detalles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion: descripcionActualizada,
        piezas: piezasActuales.value
      })
    });
    if (!res.ok) throw new Error();
    
    // Update local state
    const ordenObj = ordenes.value.find(o => o.id === ordenAActualizar.value.id);
    if (ordenObj) {
      ordenObj.descripcion = descripcionActualizada;
      ordenObj.piezas = [...piezasActuales.value];
    }
    
    if (finalizar && ordenObj) {
      await moverA(ordenObj, 'para_entrega');
    }
    cerrarActualizarOrden();
  } catch (e) {
    console.error(e);
    alert('Error al guardar cambios.');
  }
};

// ── Confirmación Entrega ────────────────────────────────────────────────────
const showModal = ref(false);
const ordenSeleccionada = ref(null);

const solicitarEntrega = (orden) => {
  ordenSeleccionada.value = orden;
  showModal.value = true;
};

const cancelarEntrega = () => {
  showModal.value = false;
  ordenSeleccionada.value = null;
};

const confirmarEntrega = async () => {
  if (!ordenSeleccionada.value) return;
  const orden = ordenSeleccionada.value;

  try {
    // Delete from DB since it's finished
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/taller/${orden.id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();

    // Guardar para que el POS lo lea
    localStorage.setItem('sansah_pending_service', JSON.stringify({
      id: orden.id,
      cliente: orden.cliente,
      telefono: orden.telefono,
      bicicleta: orden.bicicleta || 'Servicio General',
      descripcion: orden.descripcion,
      costo: orden.costo,
      piezas: orden.piezas || []
    }));

    // Remove from UI
    ordenes.value = ordenes.value.filter(o => o.id !== orden.id);
    
    showModal.value = false;
    ordenSeleccionada.value = null;
    
    router.push('/pos');
  } catch (e) {
    console.error('Error al confirmar entrega:', e);
    alert('No se pudo finalizar la orden.');
  }
};

// ── Nuevo Servicio ──────────────────────────────────────────────────────────
const showNuevoServicioModal = ref(false);
const guardandoServicio = ref(false);
const nuevoServicioForm = reactive({
  cliente: '',
  bicicleta: '',
  descripcion: '',
  telefono: '',
  servicioSeleccionado: null
});

// ── Autocomplete Clientes ────────────────────────────────────────────────────
const clienteSugerencias = ref([]);
const mostrarSugerencias = ref(false);
let buscarTimeout = null;

const buscarClientes = () => {
  mostrarSugerencias.value = true;
  clearTimeout(buscarTimeout);
  const q = nuevoServicioForm.cliente.trim();
  if (!q) { clienteSugerencias.value = []; return; }
  buscarTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/clientes/buscar?q=${encodeURIComponent(q)}`);
      if (res.ok) clienteSugerencias.value = await res.json();
    } catch (e) { console.error(e); }
  }, 220);
};

const seleccionarCliente = (c) => {
  nuevoServicioForm.cliente = c.nombre;
  if (c.telefono) nuevoServicioForm.telefono = c.telefono;
  clienteSugerencias.value = [];
  mostrarSugerencias.value = false;
};

const cerrarSugerencias = () => {
  setTimeout(() => { mostrarSugerencias.value = false; }, 150);
};

const abrirNuevoServicio = () => {
  nuevoServicioForm.cliente = '';
  nuevoServicioForm.bicicleta = '';
  nuevoServicioForm.descripcion = '';
  nuevoServicioForm.telefono = '';
  nuevoServicioForm.servicioSeleccionado = null;
  clienteSugerencias.value = [];
  mostrarSugerencias.value = false;
  showNuevoServicioModal.value = true;
};

const cerrarNuevoServicio = () => {
  showNuevoServicioModal.value = false;
};

const guardarNuevoServicio = async () => {
  if (guardandoServicio.value) return;
  guardandoServicio.value = true;
  
  const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/taller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente: nuevoServicioForm.cliente,
        bicicleta: nuevoServicioForm.bicicleta,
        descripcion: nuevoServicioForm.descripcion,
        telefono: nuevoServicioForm.telefono,
        costo: nuevoServicioForm.servicioSeleccionado?.precio || 0,
        servicio: nuevoServicioForm.servicioSeleccionado?.nombre || '',
        fecha: `${horas}:${minutos}`
      })
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    const nuevaOrden = await res.json();
    
    ordenes.value.unshift(nuevaOrden); // Agregarlo al principio
    cerrarNuevoServicio();
  } catch (e) {
    console.error('Error al guardar nuevo servicio:', e);
    alert('Error al crear el servicio. ' + e.message);
  } finally {
    guardandoServicio.value = false;
  }
};

// ── Autocomplete Logic (removida — campo libre) ─────────────────────────────
// El campo bicicleta ahora es texto libre, no necesita dropdown
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569; 
}
</style>
