# Prompt fijo para dar de alta un cliente

Copiá desde la línea de abajo hasta el final, pegalo en una sesión nueva de Claude Code
(repo MADRE) y reemplazá lo que está entre [corchetes].

---

Leé `ESTADO.md` y `docs/PROMPT-NUEVO-CLIENTE.md`. Vamos a dar de alta un cliente nuevo en la App Madre.

**Cliente:** [nombre del negocio]
**Rubro:** [panadería / bar / almacén / etc.]
**Id de la carpeta:** [ej: panaderia-rosa]

**Respuestas del cuestionario:**
[pegá acá las respuestas tal como las mandó el cliente, y las fotos de lista de precios o logo]

**Comentarios míos:** [lo que viste en el local, lo que te pidió de palabra, etc.]

Reglas de trabajo:

1. Antes de escribir código, decime en una lista corta qué módulos le prendés, cuáles faltan
   construir en la madre y si hay alguna respuesta que no entendés. Esperá mi OK.
2. Lo que sea de este cliente va solamente en `clientes/<id>/` (config.json, logo).
   Si hace falta una función nueva, se construye en la madre, genérica, apagada por defecto
   y prendible desde el config, para que sirva a los próximos clientes. Nunca un código
   especial para un solo cliente.
3. No romper a los clientes que ya existen: después de los cambios, probá que
   `?c=la-espiga` y los demás clientes sigan abriendo sin errores.
4. Pensado para Tucumán y negocio chico: celular Android barato, internet y luz que se cortan
   (tiene que andar sin señal), pagos en efectivo, transferencia y Mercado Pago, fiado,
   precios que cambian seguido, horario cortado con siesta, empleados que no son de
   tecnología. Botones grandes, pocos toques y palabras simples.
5. La app es control interno de gestión, no facturación. Se registran todas las ventas; si el
   cliente lo pidió, se marcan las que fueron con factura para pasárselas al contador.
6. Probá en el navegador con un celular simulado, cargá ventas de ejemplo y revisá que
   los números cierren.
7. Al terminar: subí el número de versión en `sw.js`, actualizá `ESTADO.md`, hacé commit,
   subilo a GitHub y pasame el link del cliente.
8. Respuestas cortas y en criollo: qué hiciste, qué probaste y qué tengo que mirar yo.

---

## Catálogo de módulos de la madre

Sirve para traducir las respuestas del cuestionario en módulos. Al lado de cada módulo
están las preguntas que lo deciden. **Estado** dice si ya existe en la madre.

| Módulo | Qué hace | Preguntas | Estado |
|---|---|---|---|
| ventas | Vender en pocos toques, medio de pago, Deshacer | 17–20, 24 | ✅ v0.1 |
| gastos | Cargar gastos por rubro | 42 | ✅ v0.1 |
| caja | Fondo fijo, cierre de caja, avisa si falta o sobra plata | 27, 28 | ⏳ |
| reportes | Día, semana y mes; lo más vendido; lo que más deja; horas pico; comparación con el período anterior | 43, 44 | ⏳ |
| precios | Subir todos o una categoría un % de un toque; precio por mayor; recargo o descuento según medio de pago | 21–23, 25 | ⏳ |
| porPeso | Vender por kilo o gramos con teclado numérico | 18 | ⏳ |
| fiado | Cuentas corrientes de clientes: qué deben, pagos parciales, aviso por WhatsApp | 26 | ⏳ |
| stock | Cuánto queda, semáforo, lista de compras | 36, 37, 41 | ⏳ |
| produccion | Cuánto se hizo, cuánto se vendió, cuánto sobró (merma) | 38 | ⏳ |
| proveedores | Compras, lo que se les debe, pagos | 39, 40 | ⏳ |
| catalogo | Link público para que el cliente arme el pedido y llegue por WhatsApp | 30, 31 | ⏳ |
| envios | Costo de envío por zona, estado del pedido, cadete | 32 | ⏳ |
| encargos | Pedidos para otro día, con seña y fecha de entrega | 33 | ⏳ |
| turnos | Reservas y agenda | 34 | ⏳ |
| mesas | Mesas abiertas y comandas | 35 | ⏳ |
| factura | Marca "con factura" en la venta y resumen para el contador | 29 | ⏳ |
| usuarios | Usuario por persona, permisos del empleado, quién vendió | 9–12 | ⏳ (necesita nube) |
| horarios | Llegada y salida de empleados | 13 | ⏳ (necesita nube) |
| nube | Varios celulares compartiendo datos y ver ventas desde casa (Firebase) | 14, 15 | ⏳ |
| respaldo | Copia de seguridad y exportar planilla | siempre | ⏳ |
