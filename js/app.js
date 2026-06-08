const CLAVES_STORAGE = {
  carrito: 'fullgas_cart',
  pedidos: 'fullgas_orders',
  sesion: 'fullgas_session'
};

const CATALOGO = {
  productos: [
    { id: 'p1', name: 'Shampoo neutro', category: 'limpieza', price: 8900, description: 'Limpieza segura para pintura y superficies delicadas.' },
    { id: 'p2', name: 'Desengrasante multiuso', category: 'limpieza', price: 12900, description: 'Ideal para llantas, motor y zonas de alta suciedad.' },
    { id: 'p3', name: 'Cera protectora', category: 'proteccion', price: 15400, description: 'Proteccion y brillo duradero para carroceria.' },
    { id: 'p4', name: 'Microfibra premium', category: 'accesorios', price: 4900, description: 'Toalla suave para secado y detallado.' },
    { id: 'p5', name: 'Limpiador interior', category: 'limpieza', price: 11900, description: 'Para plasticos, vinilos y tableros.' },
    { id: 'p6', name: 'Shine de neumaticos', category: 'proteccion', price: 10900, description: 'Acabado negro satinado y proteccion extra.' },
    { id: 'p7', name: 'Cepillo detailing', category: 'accesorios', price: 5800, description: 'Llega a costuras, emblemas y rincones.' },
    { id: 'p8', name: 'Aromatizante premium', category: 'accesorios', price: 6900, description: 'Aroma limpio para una experiencia completa.' }
  ],
  servicios: [
    { id: 'lavado_exterior', name: 'Lavado exterior', type: 'Servicio', price: 18000 },
    { id: 'detalle_interior', name: 'Detalle interior', type: 'Servicio', price: 25000 },
    { id: 'detailing_premium', name: 'Detailing premium', type: 'Servicio', price: 32000 },
    { id: 'flota_empresa', name: 'Flota y empresa', type: 'Servicio', price: 38000 }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  iniciarNavegacion();
  const pagina = document.body.dataset.page;
  if (['login', 'register', 'recover', 'profile'].includes(pagina)) {
    return;
  }
  iniciarFormularios();
  iniciarValidacionContrasena();
  iniciarModulos();
});

function iniciarNavegacion() {
  const pagina = document.body.dataset.page;
  document.querySelectorAll('.nav-link').forEach((enlace) => {
    const href = enlace.getAttribute('href');
    if (href && pagina && href.includes(pagina + '.html')) {
      enlace.classList.add('active');
    }
  });

  const sesion = JSON.parse(localStorage.getItem(CLAVES_STORAGE.sesion) || 'null');
  const esAdmin = ['administrador', 'tecnico'].includes((sesion?.role || '').toLowerCase());
  document.querySelectorAll('[data-admin-only]').forEach((el) => {
    el.classList.toggle('d-none', !esAdmin);
  });

  actualizarBadgeCarrito();
  actualizarNavSesion();
}

function actualizarBadgeCarrito() {
  const carrito = JSON.parse(localStorage.getItem(CLAVES_STORAGE.carrito) || '[]');
  const cantidad = carrito.reduce((suma, item) => suma + (Number(item.quantity) || 0), 0);
  document.querySelectorAll('[href="cart.html"]').forEach((enlace) => {
    let badge = enlace.querySelector('.cart-badge');
    if (cantidad > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        enlace.classList.add('position-relative');
        enlace.appendChild(badge);
      }
      badge.textContent = cantidad;
    } else if (badge) {
      badge.remove();
    }
  });
}

function actualizarNavSesion() {
  const contenedor = document.querySelector('[data-nav-actions]');
  if (!contenedor) return;
  const sesion = JSON.parse(localStorage.getItem(CLAVES_STORAGE.sesion) || 'null');
  if (!sesion) return;

  const destino = ['administrador', 'tecnico'].includes((sesion.role || '').toLowerCase()) ? 'admin.html' : 'mis-compras.html';
  const primerNombre = String(sesion.name || 'Usuario').split(' ')[0];
  contenedor.innerHTML = `
    <span class="text-white-50 small d-none d-lg-inline align-self-center">Hola, ${primerNombre}</span>
    <a class="btn btn-outline-light btn-sm" href="${destino}">Mi cuenta</a>
    <button class="btn btn-outline-danger btn-sm" type="button" data-logout>Salir</button>
    <a class="btn btn-brand btn-sm nav-icon-btn position-relative" href="cart.html" aria-label="Ver carrito"><i class="bi bi-cart3"></i></a>
  `;
  contenedor.querySelector('[data-logout]').addEventListener('click', () => {
    localStorage.removeItem(CLAVES_STORAGE.sesion);
    window.location.href = 'index.html';
  });
  actualizarBadgeCarrito();
}

function iniciarFormularios() {
  document.querySelectorAll('.needs-validation').forEach((formulario) => {
    formulario.addEventListener('submit', (evento) => {
      const valido = formulario.checkValidity() && validarContrasena(formulario) && validarCoincidencia(formulario);
      if (!valido) {
        evento.preventDefault();
        evento.stopPropagation();
      } else if (formulario.hasAttribute('data-checkout-form')) {
        evento.preventDefault();
        completarCheckout();
      } else {
        manejarFormularioSesion(formulario);
      }
      formulario.classList.add('was-validated');
    });
  });
}

function iniciarValidacionContrasena() {
  document.querySelectorAll('[data-password-field]').forEach((campo) => {
    campo.addEventListener('input', () => {
      const formulario = campo.closest('form');
      if (formulario) {
        validarContrasena(formulario);
        validarCoincidencia(formulario);
      }
    });
  });

  document.querySelectorAll('[data-match]').forEach((campo) => {
    campo.addEventListener('input', () => validarCoincidencia(campo.closest('form')));
  });
}

function iniciarModulos() {
  const pagina = document.body.dataset.page;

  if (pagina === 'home') {
    iniciarFormularioContacto();
  }

  if (pagina === 'products') {
    renderizarProductos();
    iniciarFiltros();
    iniciarBuscador();
  }

  if (pagina === 'cart') {
    renderizarCarrito();
  }

  if (pagina === 'checkout') {
    renderizarCheckout();
  }

  if (pagina === 'services') {
    document.querySelectorAll('[data-add-service]').forEach((boton) => {
      boton.addEventListener('click', () => {
        const servicio = CATALOGO.servicios.find((item) => item.id === boton.dataset.addService);
        if (servicio) {
          agregarAlCarrito({ id: servicio.id, name: servicio.name, category: servicio.type, price: servicio.price, quantity: 1 });
          notificar(`${servicio.name} agregado al carrito.`);
        }
      });
    });
  }

  if (pagina === 'profile') {
    hidratarPerfil();
  }
}

function iniciarFormularioContacto() {
  const formulario = document.querySelector('[data-contact-form]');
  if (!formulario) return;

  formulario.addEventListener('submit', (evento) => {
    if (!formulario.checkValidity()) {
      evento.preventDefault();
      evento.stopPropagation();
      formulario.classList.add('was-validated');
      return;
    }

    evento.preventDefault();
    const datos = new FormData(formulario);
    const mensajes = JSON.parse(localStorage.getItem('fullgas_contact_messages') || '[]');
    mensajes.unshift({
      name: String(datos.get('name') || '').trim(),
      email: String(datos.get('email') || '').trim(),
      phone: String(datos.get('phone') || '').trim(),
      topic: String(datos.get('topic') || '').trim(),
      message: String(datos.get('message') || '').trim(),
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('fullgas_contact_messages', JSON.stringify(mensajes));
    formulario.reset();
    formulario.classList.remove('was-validated');
    notificar('Mensaje enviado correctamente. Te contactaremos pronto.');
  });
}

function renderizarProductos() {
  const grilla = document.getElementById('productsGrid');
  if (!grilla) return;
  const productos = obtenerProductosFiltrados();
  grilla.innerHTML = productos.map((producto) => `
    <div class="col-12 col-md-6 col-xl-3 product-card" data-category="${producto.category}">
      <div class="service-card product-tile h-100 d-flex flex-column">
        <div class="product-image-wrap mb-3">
          <img class="product-image" src="${producto.image || imagenFallback(producto.category)}" alt="${producto.name}" loading="lazy">
        </div>
        <span class="price-tag">$${formatearMonto(producto.price)}</span>
        <h2 class="h5 mt-3">${producto.name}</h2>
        <p>${producto.description}</p>
        <div class="mt-auto d-flex justify-content-between align-items-center gap-2">
          <small class="text-white-50 text-uppercase">${producto.category}</small>
          <button class="btn btn-brand btn-sm" data-add-product="${producto.id}">Agregar</button>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-add-product]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const producto = obtenerProductosDisponibles().find((item) => item.id === boton.dataset.addProduct);
      if (producto) {
        agregarAlCarrito({ id: producto.id, name: producto.name, category: 'Producto', price: producto.price, quantity: 1 });
        notificar(`${producto.name} agregado al carrito.`);
      }
    });
  });
}

function imagenFallback(categoria) {
  const imagenes = {
    limpieza: 'https://images.pexels.com/photos/29504461/pexels-photo-29504461.jpeg?cs=srgb&dl=pexels-bulat843-1243575272-29504461.jpg&fm=jpg',
    proteccion: 'https://images.pexels.com/photos/29504459/pexels-photo-29504459.jpeg?cs=srgb&dl=pexels-bulat843-1243575272-29504459.jpg&fm=jpg',
    accesorios: 'https://images.pexels.com/photos/20042048/pexels-photo-20042048.jpeg?cs=srgb&dl=pexels-wavyvisuals-377312923-20042048.jpg&fm=jpg'
  };
  return imagenes[categoria] || imagenes.limpieza;
}

function iniciarFiltros() {
  document.querySelectorAll('.filter-btn').forEach((boton) => {
    boton.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
      boton.classList.add('active');
      renderizarProductos();
    });
  });
}

function iniciarBuscador() {
  const buscador = document.getElementById('productSearch');
  if (!buscador) return;
  buscador.addEventListener('input', renderizarProductos);
}

function obtenerProductosFiltrados() {
  const filtroActivo = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const textoBusqueda = document.getElementById('productSearch')?.value.trim().toLowerCase() || '';

  return obtenerProductosDisponibles().filter((producto) => {
    const coincideFiltro = filtroActivo === 'all' || producto.category === filtroActivo;
    const coincideBusqueda = !textoBusqueda || producto.name.toLowerCase().includes(textoBusqueda) || producto.description.toLowerCase().includes(textoBusqueda);
    return coincideFiltro && coincideBusqueda;
  });
}

function obtenerProductosDisponibles() {
  return window.FullGasStore?.cargarProductos ? window.FullGasStore.cargarProductos() : CATALOGO.productos;
}

function renderizarCarrito() {
  const carrito = cargarCarrito();
  const cuerpo = document.getElementById('cartTableBody');
  const resumen = document.getElementById('cartSummary');
  const etiqueta = document.getElementById('cartCountLabel');
  if (!cuerpo || !resumen) return;

  const totalItems = carrito.reduce((suma, item) => suma + item.quantity, 0);
  const total = carrito.reduce((suma, item) => suma + item.price * item.quantity, 0);
  if (etiqueta) {
    etiqueta.textContent = `${totalItems} items`;
  }

  if (!carrito.length) {
    cuerpo.innerHTML = '<tr><td colspan="4" class="text-center text-white-50 py-4">No hay productos agregados.</td></tr>';
  } else {
    cuerpo.innerHTML = carrito.map((item) => `
      <tr>
        <td>
          <strong>${item.name}</strong><br>
          <small class="text-white-50">${item.category}</small>
        </td>
        <td>
          <div class="input-group input-group-sm" style="max-width: 120px;">
            <button class="btn btn-outline-light" type="button" data-cart-minus="${item.id}">-</button>
            <input class="form-control text-center" value="${item.quantity}" readonly>
            <button class="btn btn-outline-light" type="button" data-cart-plus="${item.id}">+</button>
          </div>
        </td>
        <td>$${formatearMonto(item.price * item.quantity)}</td>
        <td><button class="btn btn-sm btn-outline-danger" data-cart-remove="${item.id}">Eliminar</button></td>
      </tr>
    `).join('');
  }

  resumen.innerHTML = `
    <div class="d-flex justify-content-between"><span>Subtotal</span><strong>$${formatearMonto(total)}</strong></div>
    <div class="d-flex justify-content-between mt-2"><span>Despacho</span><strong>Simulado</strong></div>
    <hr class="border-white border-opacity-10">
    <div class="d-flex justify-content-between"><span>Total</span><strong>$${formatearMonto(total)}</strong></div>
  `;

  enlazarBotonesCarrito();
}

function enlazarBotonesCarrito() {
  document.querySelectorAll('[data-cart-plus]').forEach((boton) => {
    boton.addEventListener('click', () => actualizarCantidad(boton.dataset.cartPlus, 1));
  });
  document.querySelectorAll('[data-cart-minus]').forEach((boton) => {
    boton.addEventListener('click', () => actualizarCantidad(boton.dataset.cartMinus, -1));
  });
  document.querySelectorAll('[data-cart-remove]').forEach((boton) => {
    boton.addEventListener('click', () => eliminarDelCarrito(boton.dataset.cartRemove));
  });
}

function renderizarCheckout() {
  const carrito = cargarCarrito();
  const resumen = document.getElementById('checkoutSummary');
  if (!resumen) return;
  const total = carrito.reduce((suma, item) => suma + item.price * item.quantity, 0);
  resumen.innerHTML = carrito.length
    ? carrito.map((item) => `<div class="d-flex justify-content-between mb-2"><span>${item.name} x${item.quantity}</span><strong>$${formatearMonto(item.price * item.quantity)}</strong></div>`).join('') + `<hr class="border-white border-opacity-10"><div class="d-flex justify-content-between"><span>Total</span><strong>$${formatearMonto(total)}</strong></div>`
    : '<p class="text-white-50 mb-0">No hay productos en el carrito. Agrega productos o servicios para completar la simulacion.</p>';
}

function completarCheckout() {
  const carrito = cargarCarrito();
  if (!carrito.length) {
    notificar('Agrega productos o servicios antes de simular el pago.', 'danger');
    return;
  }
  const pedidos = cargarPedidos();
  const total = carrito.reduce((suma, item) => suma + item.price * item.quantity, 0);
  const sesion = cargarSesion();
  pedidos.unshift({
    id: Date.now(),
    type: 'Pedido',
    customerName: sesion?.name || 'Cliente',
    email: sesion?.email || '',
    total,
    items: carrito.map((item) => ({ ...item })),
    status: 'Pagado',
    createdAt: new Date().toISOString()
  });
  guardarPedidos(pedidos);
  if (window.FullGasStore?.ajustarInventario) {
    window.FullGasStore.ajustarInventario(carrito);
  }
  guardarCarrito([]);
  const exito = document.getElementById('checkoutSuccess');
  if (exito) {
    exito.classList.remove('d-none');
  }
  notificar('Pago simulado con exito.', 'success');
  renderizarCheckout();
}

function hidratarPerfil() {
  const sesion = cargarSesion();
  const resumen = document.getElementById('sessionSummary');
  const campos = [
    ['profileName', sesion?.name || 'Cliente demo'],
    ['profileRole', sesion?.role || 'Cliente'],
    ['profileEmail', sesion?.email || 'cliente@fullgasdetail.cl'],
    ['profilePhone', sesion?.phone || '912345678'],
    ['profileAddress', sesion?.address || 'Coronel, Concepcion']
  ];

  campos.forEach(([id, valor]) => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.value = valor;
    }
  });

  if (resumen) {
    resumen.innerHTML = `
      <div class="mb-2"><strong>Nombre:</strong> ${sesion?.name || 'Cliente demo'}</div>
      <div class="mb-2"><strong>Correo:</strong> ${sesion?.email || 'cliente@fullgasdetail.cl'}</div>
      <div class="mb-2"><strong>Rol:</strong> ${sesion?.role || 'Cliente'}</div>
      <div><strong>Direccion:</strong> ${sesion?.address || 'Coronel, Concepcion'}</div>
    `;
  }
}

function manejarFormularioSesion(formulario) {
  if (!formulario.dataset.sessionForm) return;
  const datos = new FormData(formulario);
  const sesion = {
    name: datos.get('name') || `${datos.get('firstName') || ''} ${datos.get('lastName') || ''}`.trim() || 'Cliente demo',
    email: datos.get('email') || 'cliente@fullgasdetail.cl',
    phone: datos.get('phone') || '912345678',
    address: datos.get('address') || 'Coronel, Concepcion',
    role: datos.get('role') || 'Cliente'
  };

  guardarSesion(sesion);

  const redireccion = formulario.dataset.redirect;
  if (redireccion) {
    notificar('Datos guardados correctamente.', 'success');
    window.location.href = redireccion;
  }
}

function validarContrasena(formulario) {
  const campo = formulario.querySelector('[data-password-field]');
  if (!campo) return true;
  const clave = campo.value || '';
  const reglas = [
    clave.length >= 8,
    clave.length <= 20,
    /[A-Z]/.test(clave),
    /[a-z]/.test(clave),
    /[0-9]/.test(clave),
    /[^A-Za-z0-9]/.test(clave)
  ];
  const valido = reglas.every(Boolean);
  campo.setCustomValidity(valido ? '' : 'La contrasena no cumple las reglas.');
  return valido;
}

function validarCoincidencia(formulario) {
  if (!formulario) return true;
  let valido = true;
  formulario.querySelectorAll('[data-match]').forEach((campo) => {
    const objetivo = formulario.querySelector(campo.dataset.match);
    if (objetivo && campo.value !== objetivo.value) {
      campo.setCustomValidity('No coincide.');
      valido = false;
    } else {
      campo.setCustomValidity('');
    }
  });
  return valido;
}

function agregarAlCarrito(item) {
  const carrito = cargarCarrito();
  const encontrado = carrito.find((entry) => entry.id === item.id);
  if (encontrado) {
    encontrado.quantity += item.quantity;
  } else {
    carrito.push(item);
  }
  guardarCarrito(carrito);
}

function actualizarCantidad(id, delta) {
  const carrito = cargarCarrito();
  const item = carrito.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    eliminarDelCarrito(id);
    return;
  }
  guardarCarrito(carrito);
  renderizarCarrito();
  renderizarCheckout();
}

function eliminarDelCarrito(id) {
  const carrito = cargarCarrito().filter((entry) => entry.id !== id);
  guardarCarrito(carrito);
  renderizarCarrito();
  renderizarCheckout();
}

function cargarCarrito() {
  return JSON.parse(localStorage.getItem(CLAVES_STORAGE.carrito) || '[]');
}

function guardarCarrito(carrito) {
  localStorage.setItem(CLAVES_STORAGE.carrito, JSON.stringify(carrito));
}

function cargarPedidos() {
  return JSON.parse(localStorage.getItem(CLAVES_STORAGE.pedidos) || '[]');
}

function guardarPedidos(pedidos) {
  localStorage.setItem(CLAVES_STORAGE.pedidos, JSON.stringify(pedidos));
}

function cargarSesion() {
  return JSON.parse(localStorage.getItem(CLAVES_STORAGE.sesion) || 'null');
}

function guardarSesion(sesion) {
  localStorage.setItem(CLAVES_STORAGE.sesion, JSON.stringify(sesion));
}

function formatearMonto(valor) {
  return new Intl.NumberFormat('es-CL').format(valor);
}

function notificar(mensaje, tono = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<strong class="d-block mb-1 text-${tono === 'danger' ? 'danger' : tono === 'warning' ? 'warning' : 'success'}">${tono === 'danger' ? 'Atencion' : 'Full Gas Detail'}</strong><span>${mensaje}</span>`;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}
