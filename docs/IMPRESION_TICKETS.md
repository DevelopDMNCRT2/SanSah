# Impresión directa de tickets (PC de caja)

Desde el issue #25 el ticket se imprime **en la misma pantalla** (sin abrir pestaña nueva).
Por seguridad, un navegador normal siempre muestra su diálogo de impresión (un clic en *Imprimir*).

Para que el ticket salga **directo a la impresora, sin diálogo**, configura la PC de caja así:

1. Establece la impresora de tickets como **impresora predeterminada** del sistema
   (Windows: *Configuración → Bluetooth y dispositivos → Impresoras* y desactiva
   "Permitir que Windows administre la impresora predeterminada").
2. Cierra **todas** las ventanas de Chrome.
3. Crea un acceso directo a Chrome con este destino (Windows):

   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing https://<dominio-del-admin>/pos
   ```

   En Edge: `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk-printing https://<dominio-del-admin>/pos`

4. Abre el POS **siempre** desde ese acceso directo.

Notas:
- La bandera solo surte efecto si Chrome no estaba ya abierto; si no funciona, cierra Chrome por completo (también desde la bandeja del sistema) y vuelve a abrir con el acceso directo.
- Ajusta una sola vez el tamaño de papel/márgenes en el diálogo de impresión (antes de activar `--kiosk-printing`); Chrome recuerda esa configuración.
- Si en el futuro se necesita imprimir en una impresora distinta a la predeterminada o mandar comandos ESC/POS (corte de papel, abrir cajón), la opción es un agente local como QZ Tray.
