# ESTADO — App Madre

Para retomar en una sesión nueva: "leé ESTADO.md y seguimos".

## Idea
Una sola app (código común) que se vende a negocios chicos. Cada cliente tiene su
carpeta `clientes/<id>/` con `config.json` (nombre, logo, colores, productos, módulos).
Se abre con `?c=<id>` en el link. Los datos de cada negocio quedan en su celular.

## Hecho (v0.1)
- Base: Hoy (resultado del día, cómo pagaron), Vender (productos del config, carrito,
  medio de pago, Deshacer), Gasto (monto + rubro), Movimientos del día.
- Funciona sin internet (sw.js) y se puede instalar en el celular.
- Cliente de prueba: `clientes/la-espiga` (Panadería La Espiga).

## Próximos pasos
1. Probar en el celular y pulir lo que se vea.
2. Modo Demo (cambiar nombre y color en vivo, sin guardar).
3. Segundo cliente de prueba de otro rubro (bar) para comprobar que la madre se adapta.
4. Módulos: stock, pedidos por WhatsApp, cierre de caja, reportes, turnos.
5. Ícono y nombre de la app instalada según cada cliente.
