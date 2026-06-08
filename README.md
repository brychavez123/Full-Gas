# Full Gas Detail

Proyecto de emprendimiento de lavado de autos para el ramo de Desarrollo Fullstack 2. Es una tienda web de productos y servicios de detailing para autos, hecha con HTML, CSS, Bootstrap y JavaScript puro. No tiene backend, todo se guarda en localStorage por ahora.

---

## Como abrir el proyecto

Solo abrir el archivo `index.html` en el navegador. No necesita servidor ni instalar nada.

Si quieres verlo bien, usa la extension **Live Server** en VS Code.

---

## Usuarios de prueba

Hay 3 usuarios ya cargados automaticamente cuando abre la app por primera vez:

| Rol | Correo | Contrasena |
|---|---|---|
| Cliente | bryan@fullgasdetail.cl | Cliente1! |
| Tecnico | tecnico@fullgasdetail.cl | Tecnico1! |
| Administrador | admin@fullgasdetail.cl | Admin123! |

---

## Paginas que tiene

- **index.html** — pagina principal con presentacion del negocio
- **products.html** — catalogo de productos con filtros
- **services.html** — catalogo de servicios
- **checkout.html** — formulario de compra / carrito
- **login.html** — inicio de sesion
- **register.html** — crear cuenta nueva
- **recover.html** — recuperar contrasena
- **profile.html** — ver y editar datos del perfil
- **mis-compras.html** — historial de pedidos del cliente
- **admin.html** — panel de administracion (solo admin/tecnico)
- **cart.html** — resumen del carrito

---

## Como funciona segun el rol

**Sin sesion:** puedes ver productos y servicios, pero no comprar ni acceder al perfil.

**Cliente:** puede agregar productos al carrito, hacer pedidos y ver su historial en "Mis compras".

**Tecnico / Administrador:** tienen acceso al panel admin donde pueden gestionar productos, clientes, usuarios y pedidos.

---

## Validaciones de contrasena

La contrasena debe cumplir:
- Minimo 8 caracteres
- Maximo 20 caracteres
- Al menos una mayuscula
- Al menos una minuscula
- Al menos un numero
- Al menos un caracter especial (!@#$%...)

---

## Tecnologias usadas

- HTML5
- CSS3 con variables personalizadas
- Bootstrap 5.3.3
- JavaScript vanilla (sin frameworks)
- localStorage para persistencia de datos

---

## Archivos JS principales

- `formularios.js` — logica de validacion y sesion de usuarios
- `store.js` — manejo de productos, clientes y pedidos
- `app.js` — navegacion, carrito y renderizado general
- `dashboard.js` — panel de administracion
- `login.js`, `registrar.js`, `recuperar.js`, `modificarPerfil.js` — logica de cada formulario

---

Hecho por Bryan Chavez — Desarrollo Fullstack 2, 2026.
