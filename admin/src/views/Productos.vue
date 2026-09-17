<template>
  <AdminLayout>
    <div class="space-y-5 sm:space-y-6">

      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">Productos</h1>
        <div class="flex items-center gap-2.5">
          <button
            @click="abrirModalEtiquetas(null)"
            class="flex items-center gap-2 rounded-lg bg-[#2D5A5A] px-3.5 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-[#244a4a] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 5v14"></path>
              <path d="M8 5v14"></path>
              <path d="M12 5v14"></path>
              <path d="M17 5v14"></path>
              <path d="M21 5v14"></path>
            </svg>
            Imprimir Etiquetas
          </button>
          <router-link to="/productos/nuevo"
            class="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Producto
          </router-link>
        </div>
      </div>

      <!-- Card -->
      <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">

        <!-- Filter tabs + search -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-3">
          <div class="flex items-center gap-1">
            <button v-for="tab in tabs" :key="tab.key" @click="filtroActivo = tab.key"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filtroActivo === tab.key
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]">
              {{ tab.label }}
              <span class="ml-1 text-xs opacity-60">({{ conteo(tab.key) }})</span>
            </button>
          </div>
          <div class="flex items-center gap-3">
            <select v-model="filtroTienda" class="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10">
              <option value="todas">Todas las Categorías</option>
              <option value="General">General</option>
              <option v-for="t in tiendasList" :key="t.id" :value="t.nombre">{{ t.nombre }}</option>
            </select>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="busqueda" type="text" placeholder="Buscar productos..."
                class="pl-9 pr-4 py-2 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 w-56" />
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>

        <!-- Table -->
        <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6 w-14"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Img</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Precio</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Stock</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Categoría</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Tipo</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Etiqueta</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Estado</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="p in productosFiltrados" :key="p.id" class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <!-- Img -->
                <td class="px-5 py-3 sm:px-6">
                  <div class="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <img v-if="p.imagen_url" :src="p.imagen_url" :alt="p.nombre" class="w-full h-full object-cover" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                </td>
                <!-- Nombre -->
                <td class="px-5 py-4 sm:px-6 min-w-[180px]">
                  <p class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">{{ p.nombre }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{{ p.slug }}</p>
                </td>
                <!-- Precio -->
                <td class="px-5 py-4 sm:px-6">
                  <span v-if="p.precio" class="font-semibold text-gray-800 dark:text-white/90 text-theme-sm">${{ Number(p.precio).toFixed(2) }} MXN</span>
                  <span v-else class="text-xs text-gray-400 italic">Por variación</span>
                </td>
                <!-- Stock -->
                <td class="px-5 py-4 sm:px-6">
                  <span
                    :class="(p.stock ?? 0) > 10 ? 'text-success-600 dark:text-success-500' : (p.stock ?? 0) > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-error-500'"
                    class="text-theme-sm font-medium"
                  >
                    {{ p.es_variable
                        ? ((p.variaciones && p.variaciones.length > 0) ? `${p.variaciones.length} var.` : '—')
                        : ((p.stock ?? 0) > 0 ? p.stock : 'Sin stock') }}
                  </span>
                </td>
                <!-- Tienda -->
                <td class="px-5 py-4 sm:px-6">
                  <span class="text-theme-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    {{ p.tienda || 'General' }}
                  </span>
                </td>
                <!-- Tipo -->
                <td class="px-5 py-4 sm:px-6">
                  <span :class="p.es_variable ? 'bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
                    class="rounded-full px-2.5 py-0.5 text-theme-xs font-medium">
                    {{ p.es_variable ? 'Variable' : 'Simple' }}
                  </span>
                </td>
                <!-- Flag -->
                <td class="px-5 py-4 sm:px-6">
                  <span v-if="p.flag" class="rounded-full px-2.5 py-0.5 text-theme-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                    {{ p.flag }}
                  </span>
                  <span v-else class="text-gray-400 text-theme-sm">-</span>
                </td>
                <!-- Estado -->
                <td class="px-5 py-4 sm:px-6">
                  <span :class="p.es_publico ? 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
                    class="rounded-full px-2.5 py-0.5 text-theme-xs font-medium">
                    {{ p.es_publico ? 'Publicado' : 'Borrador' }}
                  </span>
                </td>
                <!-- Acciones -->
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-1">
                    <router-link :to="`/productos/${p.id}`" title="Editar"
                      class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-blue-light-50 hover:text-blue-light-500 dark:text-gray-400 dark:hover:bg-blue-light-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </router-link>
                    <button @click="abrirModalEtiquetas(p)" title="Imprimir Etiquetas"
                      class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>
                    </button>
                    <button @click="eliminar(p)" title="Eliminar"
                      class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="productosFiltrados.length === 0 && !loading">
                <td colspan="9" class="px-5 py-16 text-center">
                  <svg class="mx-auto mb-3 text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <p class="text-sm text-gray-400 dark:text-gray-500">No hay productos aún.</p>
                  <router-link to="/productos/nuevo" class="mt-2 inline-block text-sm text-brand-500 hover:underline">Crear el primero</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ═══ Modal: Entrada de Stock ════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showStockModal" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="cerrarModal">
          <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-modal-in">

            <!-- Header -->
            <div class="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Entrada de Inventario</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[280px]">{{ productoActivo?.nombre }}</p>
              </div>
              <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Stock actual -->
            <div class="px-6 pt-4">
              <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-500"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Stock actual</p>
                  <p class="text-xl font-black text-gray-900 dark:text-white">{{ productoActivo?.stock || 0 }} <span class="text-sm font-normal text-gray-400">unidades</span></p>
                </div>
                <div v-if="stockForm.cantidad > 0" class="ml-auto text-right">
                  <p class="text-xs text-gray-400">Nuevo total</p>
                  <p class="text-xl font-black text-success-600 dark:text-success-500">{{ (productoActivo?.stock || 0) + stockForm.cantidad }}</p>
                </div>
              </div>
            </div>

            <!-- Form -->
            <div class="p-6 space-y-4">
              <!-- Referencia -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Referencia
                  <span class="font-normal text-gray-400 ml-1">(Folio, factura o ticket)</span>
                </label>
                <input
                  v-model="stockForm.referencia"
                  type="text"
                  placeholder="Ej. FAC-2024-001, TICKET-452..."
                  class="w-full h-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- Unidades -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Unidades a ingresar <span class="text-error-500">*</span>
                  </label>
                  <input
                    v-model.number="stockForm.cantidad"
                    type="number"
                    min="1"
                    placeholder="0"
                    class="w-full h-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <!-- Costo unitario -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Costo unitario
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">$</span>
                    <input
                      v-model.number="stockForm.costo_unitario"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full h-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent pl-7 pr-4 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              </div>

              <!-- Forma de pago -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Forma de pago
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button @click="stockForm.forma_pago = 'Efectivo'"
                    :class="stockForm.forma_pago === 'Efectivo' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'"
                    class="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                    <span class="text-xs font-semibold">Efectivo</span>
                  </button>
                  <button @click="stockForm.forma_pago = 'Tarjeta'"
                    :class="stockForm.forma_pago === 'Tarjeta' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'"
                    class="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span class="text-xs font-semibold">Tarjeta</span>
                  </button>
                  <button @click="stockForm.forma_pago = 'Transferencia'"
                    :class="stockForm.forma_pago === 'Transferencia' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'"
                    class="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h13.8"/><path d="M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H3.2"/></svg>
                    <span class="text-xs font-semibold">Transf.</span>
                  </button>
                </div>
              </div>

              <!-- Costo Total calculado -->
              <div class="flex items-center justify-between p-4 rounded-xl border-2 border-dashed"
                :class="costoTotal > 0 ? 'border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'">
                <div>
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Costo Total de la Entrada</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ stockForm.cantidad || 0 }} ud. × ${{ (stockForm.costo_unitario || 0).toFixed(2) }}</p>
                </div>
                <p class="text-2xl font-black" :class="costoTotal > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-300 dark:text-gray-600'">
                  ${{ costoTotal.toFixed(2) }}
                </p>
              </div>

              <!-- Error -->
              <p v-if="stockError" class="text-sm text-error-500 text-center">{{ stockError }}</p>
            </div>

            <!-- Footer -->
            <div class="flex items-center gap-3 px-6 pb-6">
              <button @click="cerrarModal" class="flex-1 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button
                @click="guardarEntrada"
                :disabled="guardandoStock || !stockForm.cantidad || stockForm.cantidad <= 0"
                class="flex-1 h-10 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="guardandoStock" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {{ guardandoStock ? 'Guardando...' : 'Registrar Entrada' }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal Impresión de Etiquetas -->
    <EtiquetasModal
      :show="showEtiquetasModal"
      :productos="productos"
      :initial-producto="productoParaEtiquetas"
      @close="showEtiquetasModal = false"
    />

  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import EtiquetasModal from '@/components/inventario/EtiquetasModal.vue';

const router = useRouter();
const filtroActivo = ref('todos');
const filtroTienda = ref('todas');
const busqueda     = ref('');
const loading      = ref(true);
const productos    = ref([]);
const tiendasList  = ref([]);
const showEtiquetasModal = ref(false);
const productoParaEtiquetas = ref(null);

const abrirModalEtiquetas = (p = null) => {
  productoParaEtiquetas.value = p;
  showEtiquetasModal.value = true;
};

const tabs = [
  { key: 'todos',     label: 'Todos'      },
  { key: 'publico',   label: 'Publicados' },
  { key: 'borrador',  label: 'Borradores' },
];

const fetchProductos = async () => {
  loading.value = true;
  try {
    const res = await axios.get((import.meta.env.VITE_API_URL || '') + '/api/products');
    productos.value = res.data;
    
    const tiendasRes = await axios.get((import.meta.env.VITE_API_URL || '') + '/api/tiendas');
    tiendasList.value = tiendasRes.data;
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProductos);

const conteo = (key) => {
  let lista = productos.value;
  if (filtroTienda.value !== 'todas') lista = lista.filter(p => (p.tienda || 'General') === filtroTienda.value);

  if (key === 'todos') return lista.length;
  if (key === 'publico') return lista.filter(p => p.es_publico).length;
  return lista.filter(p => !p.es_publico).length;
};

const productosFiltrados = computed(() => {
  let lista = productos.value;
  if (filtroTienda.value !== 'todas') lista = lista.filter(p => (p.tienda || 'General') === filtroTienda.value);
  if (filtroActivo.value === 'publico')   lista = lista.filter(p => p.es_publico);
  if (filtroActivo.value === 'borrador')  lista = lista.filter(p => !p.es_publico);
  if (busqueda.value) lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()));
  return lista;
});

const eliminar = async (p) => {
  if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL || ''}/api/products/${p.id}`);
    productos.value = productos.value.filter(x => x.id !== p.id);
  } catch (err) {
    console.error('Error deleting product:', err);
    alert('Error al eliminar el producto');
  }
};

// ── Modal Entrada de Stock ──────────────────────────────────────────────────
const showStockModal  = ref(false);
const productoActivo  = ref(null);
const guardandoStock  = ref(false);
const stockError      = ref('');
const stockForm = ref({ referencia: '', cantidad: null, costo_unitario: null, forma_pago: 'Efectivo' });

const costoTotal = computed(() => {
  const qty   = Number(stockForm.value.cantidad)   || 0;
  const costo = Number(stockForm.value.costo_unitario) || 0;
  return qty * costo;
});

const abrirEntradaStock = (p) => {
  productoActivo.value = p;
  stockForm.value      = { referencia: '', cantidad: null, costo_unitario: null, forma_pago: 'Efectivo' };
  stockError.value     = '';
  showStockModal.value = true;
};

const cerrarModal = () => {
  showStockModal.value = false;
  productoActivo.value = null;
};

const guardarEntrada = async () => {
  stockError.value = '';
  if (!stockForm.value.cantidad || stockForm.value.cantidad <= 0) {
    stockError.value = 'Ingresa una cantidad válida mayor a 0.';
    return;
  }

  guardandoStock.value = true;
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || ''}/api/products/${productoActivo.value.id}/entrada-stock`,
      {
        referencia:     stockForm.value.referencia,
        cantidad:       stockForm.value.cantidad,
        costo_unitario: stockForm.value.costo_unitario,
        forma_pago:     stockForm.value.forma_pago,
      }
    );
    // Actualizar stock en la lista sin recargar
    const idx = productos.value.findIndex(p => p.id === productoActivo.value.id);
    if (idx !== -1) productos.value[idx].stock = res.data.producto.stock;
    cerrarModal();
  } catch (err) {
    stockError.value = err?.response?.data?.error || 'Error al guardar la entrada.';
  } finally {
    guardandoStock.value = false;
  }
};
</script>

<style scoped>
.animate-modal-in {
  animation: modalIn 0.2s ease-out forwards;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
