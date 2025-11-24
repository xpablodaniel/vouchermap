# Vouchermap — Generador de Vouchers (MAP)

Aplicación ligera en HTML/CSS/JavaScript para procesar un CSV de reservas y generar vouchers de "Media Pensión" (cena) listos para imprimir.

Este proyecto está pensado para uso local (en el navegador) sin backend — cargas un archivo CSV y la app muestra los vouchers filtrando y formateando los datos relevantes.

---

## Contenido / objetivo
- Procesar un CSV de reservas.
- Filtrar reservas con servicio de "MEDIA PENSION" (evita salidas que solo tengan "DESAYUNO").
- Generar vouchers por afiliado (normaliza nombre, calcula cantidad de cenas segùn duración y plazas).

---

## Estructura del proyecto

Archivo principal:

- `index.html` — Interfaz web; carga `map_scripts_new.js` y `map_styles.css`.
- `map_scripts_new.js` — Lógica de parsing, filtrado y generación HTML de vouchers.
- `map_styles.css` — Estilos e impresión.
- `pruebas_regimen.csv` — CSV de ejemplo incluido.
- `test_processData.py` — Script de verificación (Python) que emula la lógica y puede ejecutarse localmente.
- `test_processData.js` — Copia del flujo en Node.js para pruebas (requiere Node si quieres usarlo).

---

## CSV esperado (ejemplo)

La app espera un CSV con al menos las columnas (orden basado en `pruebas_regimen.csv`):

0. ID
1. Hotel
2. Habitacion
3. Tipo
4. Observacion
5. Plazas (cantp)
6. Voucher
7. Estado
8. Check In (formato dd/mm/YYYY)
9. Check Out (formato dd/mm/YYYY)
10. Tarifa
11. Categoria
12. DNI
13. Nombre (nombre de pila)
14. Apellido (apellido)
15. Email
16. Servicios (cadena con "MEDIA PENSION" / "DESAYUNO", etc.)

Notas importantes sobre parsing:

- `map_scripts_new.js` combina `fields[13]` y `fields[14]` para formar el nombre completo si el campo 14 parece un apellido (no parece un email y no contiene dígitos).
- La fecha debe venir en formato `dd/mm/YYYY` (el proyecto asume eso para el cálculo de noches).
- Actualmente el CSV es procesado con split(',') en el navegador — esto funciona para CSV sencillos, pero fallará si los campos incluyen comas o comillas. Para CSVs más complejos es recomendable usar un parser robusto (p. ej. PapaParse en el navegador).

---

## Lógica y comportamiento clave

- Se normaliza el `passengerName` a mayúsculas y se combina nombre + apellido cuando aplique.
- Se filtran registros que sólo tengan `DESAYUNO` (si no incluyen `MEDIA PENSION`).
- Para evitar duplicados, la app considera acompañados a los pasajeros que comparten `roomNumber` y `voucher` con otro ya agregado, y omite los acompañantes adicionales.
- Se calcula `stayDuration` desde `Check In` y `Check Out` para obtener la cantidad de noches.
- `cenaCount` = parseInt(plazas) * stayDuration.

---

## Cómo probar / ejecutar

1) Uso en el navegador (modo simple)

	- Abrí `index.html` en tu navegador (doble click o arrastrar al navegador).
	- Haz click en "Cargar Archivo CSV" y selecciona tu CSV (ejemplo incluido: `pruebas_regimen.csv`).
	- La pantalla mostrará los vouchers; usa el botón imprimir para obtener la versión imprimible.

2) Ejecutar pruebas rápidas que emulan la lógica (Python — recomendado si tienes el venv del proyecto):

	- Con el venv que ya está presente en este repo (si corresponde):

	  ```bash
	  ./.venv/bin/python test_processData.py
	  ```

	- O con Python del sistema:

	  ```bash
	  python3 test_processData.py
	  ```

	El script lee `pruebas_regimen.csv`, aplica la misma transformación principal (normalización, filtro, combinaciòn nombre/apellido) y muestra la salida por consola.

3) Ejecutar el script node (opcional — necesita Node.js):

	```bash
	node test_processData.js
	```

---

## Cambios relevantes (recientes)

- `map_scripts_new.js` ahora normaliza `passengerName` aplicando trim() y toUpperCase().
- Cuando el apellido está en la columna siguiente (campo 14) y se detecta como nombre válido, se concatena al nombre.
- Se agregaron scripts de prueba (`test_processData.py`, `test_processData.js`) para validar la lógica localmente.

---

## Limitaciones conocidas y siguientes mejoras recomendadas

1. Parser CSV robusto: actualmente se usa `split(',')` y eso puede romperse si hay comas dentro de campos o comillas; use PapaParse (navegador) o una librería robusta.
2. Validaciones: validar mejor las fechas, DNI y cantidad de plazas — actualmente la validación es mínima.
3. Internacionalización: adaptar formatos de fecha y localización si los CSV provienen de distintos países.
4. Tests automáticos: migrar los scripts de verificación a tests unitarios (Mocha/Jest para JS, pytest para Python).
5. Manejo de errores y mensajes de UI más claros cuando el CSV no cumple el formato esperado.

---

