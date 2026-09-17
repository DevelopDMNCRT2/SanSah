<template>
  <AdminLayout>
    <div class="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">

      <!-- ═══ LEFT: Order Panel ═══ -->
      <div class="w-full lg:w-[320px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm overflow-hidden shrink-0 order-2 lg:order-1">
        <!-- Header -->
        <div class="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 class="text-base font-bold text-gray-800 dark:text-white">Venta Actual</h2>
            <p class="text-[11px] text-brand-600 font-medium">
              Orden #{{ currentOrderNum }}
            </p>
          </div>
          <button @click="clearCart" class="text-gray-400 hover:text-error-500 transition-colors" title="Limpiar orden">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <div v-if="cart.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
            <svg class="h-12 w-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <p class="text-sm">No hay productos en la cuenta</p>
          </div>

          <div v-for="(item, index) in cart" :key="index" class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-2.5 rounded-xl shadow-sm">
            <div class="flex items-center gap-2">
              <div class="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                <img v-if="item.producto.imagen_url" :src="item.producto.imagen_url" loading="lazy" decoding="async" alt="" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center text-gray-300">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-[13px] text-gray-800 dark:text-white truncate">{{ item.producto.nombre }}</h4>
                <p class="text-brand-600 text-[11px] font-bold">{{ formatCurrency(calcItemTotal(item)) }}</p>
              </div>
              <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg p-0.5 border border-gray-100 dark:border-gray-800">
                <button @click="updateQty(index, -1)" class="w-5 h-5 rounded text-[11px] bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 flex items-center justify-center hover:text-brand-500">-</button>
                <span class="font-bold text-[11px] text-gray-800 dark:text-white w-3 text-center">{{ item.cantidad }}</span>
                <button @click="updateQty(index, 1)" class="w-5 h-5 rounded text-[11px] bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600">+</button>
              </div>
            </div>
            <!-- Selected variables -->
            <div v-if="item.variacionSeleccionada" class="mt-1.5 pl-12 flex flex-wrap gap-1">
              <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 text-[10px] font-medium text-brand-700 dark:text-brand-400 ring-1 ring-brand-200 dark:ring-brand-500/20">
                {{ item.variacionSeleccionada.valor }}
              </span>
            </div>
          </div>
        </div>

        <!-- Total and Pay -->
        <div class="p-3 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <div class="space-y-1 mb-3">
            <div class="flex justify-between items-center">
              <span class="font-bold text-sm text-gray-800 dark:text-white">Total</span>
              <span class="text-xl font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(subtotal) }}</span>
            </div>
          </div>
          <!-- Botones: Cotizar PDF + Cobrar -->
          <div class="flex gap-2">
            <!-- Botón Cotización PDF -->
            <button
              @click="generateQuote"
              :disabled="cart.length === 0"
              :class="{ 'opacity-40 cursor-not-allowed': cart.length === 0 }"
              class="w-11 h-11 shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand-600 transition-all flex items-center justify-center shadow-sm"
              title="Descargar Cotización PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </button>
            <!-- Cobrar Orden -->
            <button @click="openPaymentModal" class="flex-1 py-3 rounded-xl bg-[#2D5A5A] text-white font-bold text-sm hover:bg-[#244a4a] transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2" :disabled="cart.length === 0" :class="{ 'opacity-50 cursor-not-allowed': cart.length === 0 }">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Cobrar Orden
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT: Products Panel ═══ -->
      <div class="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-sm overflow-hidden order-1 lg:order-2">
        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4">
          <div class="flex justify-between items-center gap-3">
            <h1 class="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Catálogo POS</h1>
            <div class="flex items-center gap-2">
              <!-- Search -->
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input v-model="busquedaPOS" type="text" placeholder="Buscar producto..."
                  class="pl-8 pr-3 py-1.5 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 w-44" />
              </div>
              <!-- Toggle prices -->
              <button
                @click="showPrices = !showPrices"
                :class="showPrices ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'"
                class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg transition-all shrink-0"
                title="Mostrar/Ocultar Precios"
              >
                $
              </button>
            </div>
          </div>

          <!-- Category Tabs -->
          <div class="flex flex-wrap gap-2 pb-1">
            <button
              v-for="cat in categorias" :key="cat"
              @click="activeCategoria = cat"
              :class="activeCategoria === cat ? 'bg-gray-900 text-white dark:bg-brand-500 shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'"
              class="px-5 py-2 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <div class="flex-1 p-5 overflow-y-auto custom-scrollbar">
          <div v-if="loading" class="flex justify-center p-10 text-gray-400">
             Cargando productos...
          </div>
          <div v-else-if="productos.length === 0" class="text-center text-gray-400 mt-10">
            No hay productos registrados
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
            <div v-for="producto in productosFiltrados" :key="producto.id"
                 @click="handleProductClick(producto)"
                 class="cursor-pointer group flex flex-col">
               <div class="h-36 sm:h-40 w-full mb-3 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900 relative shadow-sm group-hover:shadow-lg transition-all group-hover:-translate-y-1">
                  <img v-if="producto.imagen_url" :src="producto.imagen_url" loading="lazy" decoding="async" alt="" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div v-else class="flex h-full items-center justify-center text-gray-400">
                    <svg class="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <!-- Price badge -->
                  <div v-if="showPrices" class="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-white/10">
                    <span class="text-[13px] font-black text-white tracking-wide">{{ formatCurrency(producto.precio) }}</span>
                  </div>
               </div>
               <h3 class="font-bold text-gray-800 dark:text-white/90 text-sm line-clamp-2 leading-tight px-1 group-hover:text-brand-600 transition-colors">{{ producto.nombre }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: Variaciones ═══ -->
    <Teleport to="body">
      <div v-if="showVariableModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4" @click.self="closeVariableModal">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closeVariableModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in">

          <!-- Modal Header -->
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div v-if="selectedProducto?.imagen_url" class="h-14 w-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
              <img :src="selectedProducto.imagen_url" loading="eager" decoding="async" alt="" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white truncate">{{ selectedProducto?.nombre }}</h3>
              <p class="text-sm text-brand-600 font-semibold">Selecciona una variación</p>
            </div>
            <button @click="closeVariableModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Modal Body: Variables -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            <div class="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4">
              <div class="space-y-2">
                <button v-for="(variacion, vIdx) in selectedProducto?.variaciones" :key="vIdx"
                  @click="selectedVariacion = variacion"
                  :class="selectedVariacion?.id === variacion.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 ring-2 ring-brand-500/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'"
                  class="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left">
                  <div class="flex items-center gap-3">
                    <div :class="[
                      selectedVariacion?.id === variacion.id ? 'bg-brand-500 border-brand-500' : 'border-gray-300 dark:border-gray-600',
                      'rounded-full'
                    ]"
                         class="w-5 h-5 border-2 flex items-center justify-center transition-colors shrink-0">
                      <svg v-if="selectedVariacion?.id === variacion.id" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ variacion.valor }}</span>
                  </div>
                  <span class="text-xs font-bold text-brand-600 dark:text-brand-400">{{ formatCurrency(variacion.precio) }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">Precio final:</span>
              <span class="text-lg font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(selectedVariacion?.precio || 0) }}</span>
            </div>
            <button @click="confirmAddToCart"
              :disabled="!selectedVariacion"
              :class="selectedVariacion ? 'bg-[#2D5A5A] hover:bg-[#244a4a] shadow-md hover:shadow-lg active:scale-[0.98]' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'"
              class="w-full py-3.5 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Agregar a la Orden
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ MODAL: Payment ═══ -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closePaymentModal"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-gray-200 dark:border-gray-700 animate-modal-in">

          <!-- Header -->
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white">Cobrar Orden</h3>
            <p class="text-sm text-gray-500 mt-0.5">Completa los datos para procesar el pago</p>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-5">
            <!-- Resumen -->
            <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-500">{{ cart.length }} producto(s)</span>
                <span class="text-gray-500">Subtotal: {{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-bold text-gray-800 dark:text-white">Total a cobrar</span>
                <span class="text-2xl font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(subtotal) }}</span>
              </div>
            </div>

            <!-- Método de pago -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">Método de Pago</label>
              <div class="grid grid-cols-3 gap-3">
                <button v-for="method in paymentMethods" :key="method.value"
                  @click="paymentData.method = method.value"
                  :class="paymentData.method === method.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 ring-2 ring-brand-500/20 text-brand-700 dark:text-brand-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'"
                  class="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all">
                  <div :class="paymentData.method === method.value ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'" class="w-6 h-6 shrink-0 flex items-center justify-center" v-html="method.svg"></div>
                  <span class="text-xs font-semibold">{{ method.label }}</span>
                </button>
              </div>
            </div>

            <!-- Datos del Cliente -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">Datos del Cliente</label>
              <div class="grid grid-cols-2 gap-3 relative">
                <!-- Autocomplete Input -->
                <div class="relative">
                  <input v-model="paymentData.nombre" 
                    @input="buscarClientes"
                    @blur="cerrarSugerencias"
                    @focus="buscarClientes"
                    type="text" 
                    placeholder="Nombre completo" 
                    autocomplete="off"
                    class="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 text-sm text-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                  
                  <!-- Sugerencias -->
                  <div v-if="clienteSugerencias.length > 0 && mostrarSugerencias" class="absolute z-[99999] top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    <button v-for="c in clienteSugerencias" :key="c.id" type="button" @mousedown.prevent="seleccionarCliente(c)" class="w-full flex items-center gap-3 px-3 py-2 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-left transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                      <div class="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
                        <span class="text-[10px] font-bold text-brand-700 dark:text-brand-400">{{ c.nombre.charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="min-w-0">
                        <p class="text-[13px] font-semibold text-gray-800 dark:text-white truncate">{{ c.nombre }}</p>
                        <p v-if="c.telefono" class="text-[10px] text-gray-500 truncate">{{ c.telefono }}</p>
                      </div>
                    </button>
                  </div>
                </div>
                
                <input v-model="paymentData.telefono" @input="paymentData.telefono = ($event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 10)" maxlength="10" type="tel" placeholder="Teléfono" class="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 text-sm text-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>
            
          </div>

          <!-- Footer -->
          <div class="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex gap-3 rounded-b-2xl">
            <button @click="closePaymentModal" class="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Cancelar</button>
            <button @click="processPayment"
              :disabled="!paymentData.method || isProcessingPayment"
              :class="paymentData.method && !isProcessingPayment ? 'bg-[#2D5A5A] hover:bg-[#244a4a] shadow-md active:scale-[0.98]' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'"
              class="flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
              <div v-if="isProcessingPayment" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              {{ isProcessingPayment ? 'Procesando...' : 'Pagar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ MODAL: Order Confirmation ═══ -->
    <Teleport to="body">
      <div v-if="showConfirmationModal" class="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in text-center">
          <div class="p-8">
            <div class="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-1">¡Pago Exitoso!</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">La venta ha sido procesada correctamente en Sansah Bikes.</p>
            <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 p-4 mb-2 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Orden</span>
                <span class="font-bold text-gray-800 dark:text-white">#{{ confirmedOrder.orderNum }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Pago</span>
                <span class="font-medium text-gray-800 dark:text-white">{{ confirmedOrder.methodLabel }}</span>
              </div>
              <div class="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <span class="font-bold text-gray-800 dark:text-white">Total</span>
                <span class="font-black text-brand-600 dark:text-brand-400">{{ formatCurrency(confirmedOrder.total) }}</span>
              </div>
            </div>
          </div>
          <div class="px-6 pb-6 space-y-2.5">
            <button
              @click="imprimirTicketVenta"
              class="w-full py-3 rounded-xl border-2 border-brand-500 text-brand-600 dark:text-brand-400 font-bold text-sm hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Imprimir Ticket
            </button>
            <button @click="closeConfirmationModal" class="w-full py-3 rounded-xl bg-[#2D5A5A] text-white font-bold text-sm hover:bg-[#244a4a] transition-all shadow-md active:scale-[0.98]">Nueva Venta</button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- ═══ MODAL: Clear Cart Confirmation ═══ -->
    <Teleport to="body">
      <div v-if="showClearModal" class="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="showClearModal = false"></div>
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700 animate-modal-in text-center">
          <div class="p-8">
            <div class="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
              <svg class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-1">¿Limpiar Orden?</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Se eliminarán todos los productos de la venta actual. Esta acción no se puede deshacer.</p>
          </div>
          <div class="px-6 pb-6 flex gap-3">
            <button @click="showClearModal = false" class="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Cancelar</button>
            <button @click="confirmClearCart" class="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all shadow-md active:scale-[0.98]">Limpiar Orden</button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SANSAH_LOGO_B64, SANSAH_COLORS } from '@/utils/pdfBrand';
import { printThermalTicket, type TicketItem } from '@/utils/thermalTicketPdf';
import { useAuth } from '@/composables/useAuth';

const { token } = useAuth();

const productos = ref<any[]>([]);
const loading = ref(true);
const cart = ref<any[]>([]);
const showPrices = ref(true);
const busquedaPOS = ref('');
const activeCategoria = ref('Todos');
const currentOrderNum = ref(Math.floor(Math.random() * 9000) + 1000);

// ── Variable Modal State ──
const showVariableModal = ref(false);
const selectedProducto = ref<any>(null);
const selectedVariacion = ref<any>(null);

// ── Payment Modal State ──
const showPaymentModal = ref(false);
const showConfirmationModal = ref(false);
const showClearModal = ref(false);
const paymentData = ref({ method: '', nombre: '', telefono: '' });
const prefilledClientInfo = ref({ nombre: '', telefono: '' });
const isProcessingPayment = ref(false);
const confirmedOrder = ref<{
  orderNum: number | string;
  methodLabel: string;
  total: number;
  subtotal: number;
  cliente: string;
  fecha: string;
  items: TicketItem[];
}>({
  orderNum: 0,
  methodLabel: '',
  total: 0,
  subtotal: 0,
  cliente: '',
  fecha: '',
  items: []
});
const paymentMethods = [
  { value: 'efectivo', label: 'Efectivo', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/></svg>` },
  { value: 'tarjeta', label: 'Tarjeta', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.625-12h17.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 0 1-1.125-1.125V4.875c0-.621.504-1.125 1.125-1.125Z"/></svg>` },
  { value: 'transferencia', label: 'Transferencia', svg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.053.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg>` }
];

// ── Categories ──
const categorias = computed(() => {
  const cats = new Set(productos.value.map(p => p.tienda || 'General'));
  return ['Todos', ...Array.from(cats)].filter(Boolean);
});

const productosFiltrados = computed(() => {
  let lista = productos.value;
  if (activeCategoria.value !== 'Todos') {
    lista = lista.filter(p => (p.tienda || 'General') === activeCategoria.value);
  }
  if (busquedaPOS.value.trim()) {
    const q = busquedaPOS.value.toLowerCase();
    lista = lista.filter(p => p.nombre.toLowerCase().includes(q));
  }
  return lista;
});

// ── Fetch ──
const fetchProductos = async () => {
  try {
    const res = await axios.get((import.meta.env.VITE_API_URL || '') + '/api/products');
    // Solo mostrar productos visibles en tienda/POS
    productos.value = res.data.filter((p: any) => p.es_publico_pos !== false);
  } catch (e) {
    console.error('Error al cargar productos:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProductos();
  
  const pendingService = localStorage.getItem('sansah_pending_service');
  if (pendingService) {
    try {
      const srv = JSON.parse(pendingService);
      
      prefilledClientInfo.value.nombre = srv.cliente || '';
      prefilledClientInfo.value.telefono = srv.telefono || '';

      // 1. Añadir el servicio principal (costo base)
      cart.value.push({
        producto: {
          id: `taller-${srv.id}`,
          nombre: `Servicio: ${srv.bicicleta} - ${srv.cliente}`,
          precio: parseFloat(srv.costo) || 0,
          imagen_url: '' // Placeholder nativo del POS
        },
        cantidad: 1,
        variacionSeleccionada: null
      });
      
      // 2. Añadir las refacciones extra (si existen)
      if (Array.isArray(srv.piezas)) {
        srv.piezas.forEach((pieza: any) => {
          cart.value.push({
            producto: {
              id: pieza.id,
              nombre: pieza.nombre,
              precio: parseFloat(pieza.precio) || 0,
              imagen_url: pieza.imagen_url || ''
            },
            cantidad: 1,
            variacionSeleccionada: null
          });
        });
      }
      
      localStorage.removeItem('sansah_pending_service');
    } catch(e) {
      console.error("Error parsing pending service", e);
    }
  }
});

// ── Product Click Handler ──
const handleProductClick = (producto: any) => {
  if (producto.es_variable && producto.variaciones && producto.variaciones.length > 0) {
    selectedProducto.value = producto;
    selectedVariacion.value = null;
    showVariableModal.value = true;
  } else {
    addToCartDirect(producto);
  }
};

// ── Add to cart without variables ──
const addToCartDirect = (producto: any) => {
  const existing = cart.value.find(
    item => item.producto.id === producto.id && !item.variacionSeleccionada
  );
  if (existing) {
    existing.cantidad++;
  } else {
    cart.value.push({ producto, cantidad: 1, variacionSeleccionada: null });
  }
};

// ── Modal: confirm ──
const confirmAddToCart = () => {
  if (!selectedVariacion.value || !selectedProducto.value) return;

  const existing = cart.value.find(
    item => item.producto.id === selectedProducto.value.id && item.variacionSeleccionada?.id === selectedVariacion.value.id
  );

  if (existing) {
    existing.cantidad++;
  } else {
    cart.value.push({
      producto: selectedProducto.value,
      cantidad: 1,
      variacionSeleccionada: selectedVariacion.value
    });
  }

  closeVariableModal();
};

const closeVariableModal = () => {
  showVariableModal.value = false;
  selectedProducto.value = null;
  selectedVariacion.value = null;
};

// ── Cart Operations ──
const updateQty = (index: number, delta: number) => {
  const item = cart.value[index];
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    cart.value.splice(index, 1);
  }
};

const clearCart = () => {
  if (cart.value.length === 0) return;
  showClearModal.value = true;
};

const confirmClearCart = () => {
  cart.value = [];
  showClearModal.value = false;
  prefilledClientInfo.value = { nombre: '', telefono: '' };
};

const calcItemTotal = (item: any) => {
  const base = item.variacionSeleccionada ? (parseFloat(item.variacionSeleccionada.precio) || 0) : (parseFloat(item.producto.precio) || 0);
  return base * item.cantidad;
};

const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + calcItemTotal(item), 0);
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

// ── Autocomplete Clientes ────────────────────────────────────────────────────
const clienteSugerencias = ref<any[]>([]);
const mostrarSugerencias = ref(false);
let buscarTimeout: any = null;

const buscarClientes = () => {
  mostrarSugerencias.value = true;
  clearTimeout(buscarTimeout);
  const q = paymentData.value.nombre?.trim();
  if (!q) { clienteSugerencias.value = []; return; }
  buscarTimeout = setTimeout(async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/clientes/buscar?q=${encodeURIComponent(q)}`);
      if (res.ok) clienteSugerencias.value = await res.json();
    } catch (e) { console.error(e); }
  }, 220);
};

const seleccionarCliente = (c: any) => {
  paymentData.value.nombre = c.nombre;
  if (c.telefono) paymentData.value.telefono = c.telefono;
  clienteSugerencias.value = [];
  mostrarSugerencias.value = false;
};

const cerrarSugerencias = () => {
  setTimeout(() => { mostrarSugerencias.value = false; }, 150);
};

// ── Payment Modal Logic ──
const openPaymentModal = () => {
  if (cart.value.length === 0) return;
  paymentData.value = { 
    method: '', 
    nombre: prefilledClientInfo.value.nombre || '', 
    telefono: prefilledClientInfo.value.telefono || '' 
  };
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const processPayment = async () => {
  if (!paymentData.value.method) return;
  isProcessingPayment.value = true;
  
  const method = paymentMethods.find(m => m.value === paymentData.value.method);
  
  try {
    const orderItems = cart.value.map(item => ({
      nombre: item.producto.nombre,
      variante: item.variacionSeleccionada?.valor || null,
      cantidad: item.cantidad,
      precio: item.variacionSeleccionada ? item.variacionSeleccionada.precio : item.producto.precio,
      imagen: item.producto.imagen_url || null
    }));

    const finalTotal = subtotal.value;

    const payload = {
      cliente_id: null,
      nombre: paymentData.value.nombre?.trim() || "Mostrador",
      correo: "pos@sansah.com", // dummy para POS
      telefono: paymentData.value.telefono?.trim() || null,
      ciudad: "Local",
      domicilio: "Tienda Física",
      estado: "Completado",
      envio: 0,
      total: finalTotal,
      metodo_pago: method?.label || 'Efectivo',
      canal_venta: "POS",
      items: orderItems
    };

    const API_URL = import.meta.env.VITE_API_URL || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`;
    }

    const res = await fetch(`${API_URL}/api/pedidos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Error al registrar pedido');
    
    const savedOrder = await res.json();

    const clientName = paymentData.value.nombre?.trim() || 'Público General';
    confirmedOrder.value = {
      orderNum: savedOrder.orden,
      methodLabel: method?.label || 'Efectivo',
      total: finalTotal,
      subtotal: subtotal.value,
      cliente: clientName !== 'Mostrador' ? clientName : 'Público General',
      fecha: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }),
      items: cart.value.map((item) => {
        const unitario = item.variacionSeleccionada
          ? parseFloat(item.variacionSeleccionada.precio) || 0
          : parseFloat(item.producto.precio) || 0;
        return {
          nombre: item.producto.nombre,
          variante: item.variacionSeleccionada ? item.variacionSeleccionada.valor : undefined,
          cantidad: item.cantidad,
          precio: unitario,
          subtotal: unitario * item.cantidad,
        };
      }),
    };
    showPaymentModal.value = false;
    showConfirmationModal.value = true;
  } catch (err) {
    console.error(err);
    alert('Ocurrió un error al procesar el pago.');
  } finally {
    isProcessingPayment.value = false;
  }
};

// ── Generador de Cotización PDF ──────────────────────────────────────────
const generateQuote = () => {
  if (cart.value.length === 0) return;

  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header negro con logo
  doc.setFillColor(...SANSAH_COLORS.negro);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.addImage(SANSAH_LOGO_B64, 'PNG', 10, 4, 52, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cotización', pageW - 14, 14, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Folio: COT-${currentOrderNum.value}`, pageW - 14, 22, { align: 'right' });

  // Sub-info
  doc.setTextColor(...SANSAH_COLORS.negro);
  doc.setFontSize(9);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 42);
  doc.text('Esta cotización no representa una venta confirmada.', 14, 49);

  // Línea naranja
  doc.setDrawColor(...SANSAH_COLORS.naranja);
  doc.setLineWidth(1);
  doc.line(14, 53, pageW - 14, 53);

  // Tabla de productos
  const rows = cart.value.map(item => {
    const unitario = item.variacionSeleccionada
      ? parseFloat(item.variacionSeleccionada.precio) || 0
      : parseFloat(item.producto.precio) || 0;
    return [
      item.producto.nombre + (item.variacionSeleccionada ? `\n  ${item.variacionSeleccionada.valor}` : ''),
      String(item.cantidad),
      formatCurrency(unitario),
      formatCurrency(unitario * item.cantidad)
    ];
  });

  autoTable(doc, {
    head: [['Producto', 'Cant.', 'Precio Unitario', 'Subtotal']],
    body: rows,
    startY: 58,
    theme: 'grid',
    headStyles: {
      fillColor: SANSAH_COLORS.naranja,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: SANSAH_COLORS.grisClaro },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Totales al final
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const total = subtotal.value;

  // Total box naranja
  doc.setFillColor(...SANSAH_COLORS.naranja);
  doc.roundedRect(pageW - 68, finalY, 54, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL:', pageW - 62, finalY + 8.5);
  doc.text(formatCurrency(total), pageW - 14, finalY + 8.5, { align: 'right' });

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...SANSAH_COLORS.negro);
  doc.rect(0, pageH - 10, pageW, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Sansah Bikes® — Esta cotización tiene una vigencia de 7 días.', pageW / 2, pageH - 3, { align: 'center' });

  doc.save(`cotizacion_sansah_${currentOrderNum.value}.pdf`);
};

const imprimirTicketVenta = () => {
  if (!confirmedOrder.value || confirmedOrder.value.items.length === 0) return;
  printThermalTicket({
    orderNum: confirmedOrder.value.orderNum,
    fecha: confirmedOrder.value.fecha,
    cliente: confirmedOrder.value.cliente,
    metodoPago: confirmedOrder.value.methodLabel,
    canal: 'POS / Mostrador',
    items: confirmedOrder.value.items,
    subtotal: confirmedOrder.value.subtotal,
    total: confirmedOrder.value.total,
  });
};

const closeConfirmationModal = () => {
  showConfirmationModal.value = false;
  cart.value = [];
  currentOrderNum.value = Math.floor(Math.random() * 9000) + 1000;
  paymentData.value = { method: '', nombre: '', telefono: '' };
  prefilledClientInfo.value = { nombre: '', telefono: '' };
};
</script>

<style scoped>
.animate-modal-in {
  animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modal-in {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
</style>
