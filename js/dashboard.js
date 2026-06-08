document.addEventListener('DOMContentLoaded', () => {
  const pagina = document.body.dataset.page;
  if (!['dashboard', 'client-dashboard'].includes(pagina)) return;
  if (!window.FullGasStore || !window.FullGasForms) return;

  if (pagina === 'dashboard') {
    iniciarDashboardAdmin();
  }

  if (pagina === 'client-dashboard') {
    iniciarDashboardCliente();
  }
});

function iniciarDashboardAdmin() {
  FullGasForms.asegurarUsuariosDemo();
  FullGasStore.cargarProductos();
  FullGasStore.cargarClientes();

  enlazarNavDashboard();
  renderizarEstadisticas();
  renderizarTablaProductos();
  renderizarTablaClientes();
  renderizarTablaUsuarios();
  renderizarTablaPedidos();
  enlazarFormProducto();
  enlazarFormCliente();
  enlazarFormUsuario();
  enlazarAccionesDashboard();
}

function enlazarNavDashboard() {
  const botones = document.querySelectorAll('[data-dashboard-nav]');
  const paneles = document.querySelectorAll('[data-dashboard-pane]');
  if (!botones.length || !paneles.length) return;

  const activarPanel = (nombre) => {
    botones.forEach((boton) => {
      boton.classList.toggle('active', boton.dataset.dashboardNav === nombre);
    });
    paneles.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.dashboardPane === nombre);
    });
  };

  botones.forEach((boton) => {
    boton.addEventListener('click', () => activarPanel(boton.dataset.dashboardNav));
  });

  const panelActual = document.querySelector('[data-dashboard-pane].active')?.dataset.dashboardPane || botones[0].dataset.dashboardNav;
  activarPanel(panelActual);
}

function renderizarEstadisticas() {
  const contenedor = document.getElementById('dashboardStats');
  if (!contenedor) return;
  const productos = FullGasStore.cargarProductos();
  const clientes = FullGasStore.cargarClientes();
  const usuarios = FullGasForms.cargarUsuarios();
  const pedidos = FullGasStore.cargarPedidos();
  const stockBajo = productos.filter((p) => Number(p.stock || 0) <= 5).length;

  contenedor.innerHTML = [
    ['Productos', productos.length],
    ['Clientes', clientes.length],
    ['Usuarios', usuarios.length],
    ['Compras', pedidos.length],
    ['Stock bajo', stockBajo]
  ].map(([etiqueta, valor]) => `
    <div class="col-12 col-md-6 col-xl-2"><div class="stat-card h-100"><strong>${valor}</strong><span>${etiqueta}</span></div></div>
  `).join('');
}

function renderizarTablaProductos() {
  const cuerpo = document.getElementById('productsTableBody');
  if (!cuerpo) return;
  const productos = FullGasStore.cargarProductos();

  cuerpo.innerHTML = productos.map((producto) => `
    <tr>
      <td><strong>${producto.name}</strong><br><small class="text-white-50">${producto.category}</small></td>
      <td>$${formatearMonto(producto.price)}</td>
      <td>${producto.stock}</td>
      <td>${producto.active ? 'Activo' : 'Inactivo'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-2" data-edit-product="${producto.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-delete-product="${producto.id}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function renderizarTablaClientes() {
  const cuerpo = document.getElementById('customersTableBody');
  if (!cuerpo) return;
  const clientes = FullGasStore.cargarClientes();
  const pedidos = FullGasStore.cargarPedidos();

  cuerpo.innerHTML = clientes.map((cliente) => `
    <tr>
      <td><strong>${cliente.name}</strong><br><small class="text-white-50">${cliente.vehicle || 'Sin vehiculo'}</small></td>
      <td>${cliente.phone}</td>
      <td>${cliente.address || '-'}</td>
      <td>${pedidos.filter((p) => String(p.email || '').toLowerCase() === String(cliente.email || '').toLowerCase()).length}</td>
      <td>${cliente.status || 'Activo'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-2" data-edit-customer="${cliente.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-delete-customer="${cliente.id}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function renderizarTablaUsuarios() {
  const cuerpo = document.getElementById('usersTableBody');
  if (!cuerpo) return;
  const usuarios = FullGasForms.cargarUsuarios();

  cuerpo.innerHTML = usuarios.map((usuario) => `
    <tr>
      <td><strong>${usuario.name}</strong><br><small class="text-white-50">${usuario.email}</small></td>
      <td>${usuario.role}</td>
      <td>${usuario.phone || '-'}</td>
      <td>${usuario.status || (usuario.active === false ? 'Bloqueado' : 'Activo')}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-2" data-edit-user="${usuario.email}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-delete-user="${usuario.email}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  cuerpo.querySelectorAll('[data-delete-user]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const lista = FullGasForms.cargarUsuarios().filter((u) => String(u.email || '').toLowerCase() !== String(boton.dataset.deleteUser).toLowerCase());
      FullGasForms.guardarUsuarios(lista);
      renderizarEstadisticas();
      renderizarTablaUsuarios();
      FullGasForms.notificar('Usuario eliminado.');
    });
  });
}

function renderizarTablaPedidos() {
  const cuerpo = document.getElementById('ordersTableBody');
  if (!cuerpo) return;
  const pedidos = FullGasStore.cargarPedidos();

  cuerpo.innerHTML = pedidos.map((pedido) => `
    <tr>
      <td><strong>${pedido.customerName || 'Cliente'}</strong><br><small class="text-white-50">${pedido.email || '-'}</small></td>
      <td>${pedido.type || 'Pedido'}</td>
      <td>${Array.isArray(pedido.items) ? pedido.items.length : Number(pedido.items || 0)}</td>
      <td>$${formatearMonto(pedido.total || 0)}</td>
      <td>${pedido.status || 'Pagado'}</td>
      <td>${pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('es-CL') : '-'}</td>
    </tr>
  `).join('');
}

function enlazarFormProducto() {
  const formulario = document.getElementById('productForm');
  if (!formulario) return;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!formulario.checkValidity()) {
      formulario.classList.add('was-validated');
      return;
    }

    const datos = new FormData(formulario);
    FullGasStore.guardarProducto({
      id: datos.get('productId') || '',
      name: datos.get('productName'),
      category: datos.get('productCategory'),
      price: datos.get('productPrice'),
      stock: datos.get('productStock'),
      description: datos.get('productDescription'),
      active: datos.get('productActive') === 'on'
    });

    formulario.reset();
    formulario.classList.remove('was-validated');
    renderizarEstadisticas();
    renderizarTablaProductos();
    FullGasForms.notificar('Producto guardado en localStorage.');
  });
}

function enlazarFormCliente() {
  const formulario = document.getElementById('customerForm');
  if (!formulario) return;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!formulario.checkValidity()) {
      formulario.classList.add('was-validated');
      return;
    }

    const datos = new FormData(formulario);
    FullGasStore.guardarCliente({
      id: datos.get('customerId') || '',
      name: datos.get('customerName'),
      email: datos.get('customerEmail'),
      phone: datos.get('customerPhone'),
      address: datos.get('customerAddress'),
      vehicle: datos.get('customerVehicle'),
      notes: datos.get('customerNotes'),
      status: datos.get('customerStatus')
    });

    formulario.reset();
    formulario.classList.remove('was-validated');
    renderizarEstadisticas();
    renderizarTablaClientes();
    FullGasForms.notificar('Cliente guardado en localStorage.');
  });
}

function enlazarFormUsuario() {
  const formulario = document.getElementById('userForm');
  if (!formulario) return;

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!formulario.checkValidity()) {
      formulario.classList.add('was-validated');
      return;
    }

    const datos = new FormData(formulario);
    const actual = FullGasForms.obtenerUsuarioPorCorreo(String(datos.get('userEmail') || '').trim());
    FullGasForms.guardarUsuario({
      ...actual,
      name: String(datos.get('userName') || '').trim(),
      email: String(datos.get('userEmail') || '').trim(),
      phone: String(datos.get('userPhone') || '').trim(),
      address: String(datos.get('userAddress') || '').trim(),
      role: String(datos.get('userRole') || 'Cliente').trim(),
      status: String(datos.get('userStatus') || 'Activo').trim(),
      password: String(datos.get('userPassword') || '').trim() || actual?.password || 'Cliente1!'
    });

    formulario.reset();
    formulario.classList.remove('was-validated');
    renderizarEstadisticas();
    renderizarTablaUsuarios();
    FullGasForms.notificar('Usuario guardado en localStorage.');
  });
}

function enlazarAccionesDashboard() {
  document.addEventListener('click', (evento) => {
    const editarProducto = evento.target.closest('[data-edit-product]');
    const eliminarProducto = evento.target.closest('[data-delete-product]');
    const editarCliente = evento.target.closest('[data-edit-customer]');
    const eliminarCliente = evento.target.closest('[data-delete-customer]');
    const editarUsuario = evento.target.closest('[data-edit-user]');

    if (editarProducto) {
      const producto = FullGasStore.cargarProductos().find((item) => item.id === editarProducto.dataset.editProduct);
      llenarFormProducto(producto);
    }

    if (eliminarProducto) {
      FullGasStore.eliminarProducto(eliminarProducto.dataset.deleteProduct);
      renderizarEstadisticas();
      renderizarTablaProductos();
      FullGasForms.notificar('Producto eliminado.');
    }

    if (editarCliente) {
      const cliente = FullGasStore.cargarClientes().find((item) => item.id === editarCliente.dataset.editCustomer);
      llenarFormCliente(cliente);
    }

    if (eliminarCliente) {
      FullGasStore.eliminarCliente(eliminarCliente.dataset.deleteCustomer);
      renderizarEstadisticas();
      renderizarTablaClientes();
      FullGasForms.notificar('Cliente eliminado.');
    }

    if (editarUsuario) {
      const usuario = FullGasForms.obtenerUsuarioPorCorreo(editarUsuario.dataset.editUser);
      llenarFormUsuario(usuario);
    }
  });
}

function llenarFormProducto(producto) {
  if (!producto) return;
  const formulario = document.getElementById('productForm');
  if (!formulario) return;
  formulario.productId.value = producto.id;
  formulario.productName.value = producto.name;
  formulario.productCategory.value = producto.category;
  formulario.productPrice.value = producto.price;
  formulario.productStock.value = producto.stock;
  formulario.productDescription.value = producto.description;
  formulario.productActive.checked = Boolean(producto.active);
}

function llenarFormCliente(cliente) {
  if (!cliente) return;
  const formulario = document.getElementById('customerForm');
  if (!formulario) return;
  formulario.customerId.value = cliente.id;
  formulario.customerName.value = cliente.name;
  formulario.customerEmail.value = cliente.email;
  formulario.customerPhone.value = cliente.phone;
  formulario.customerAddress.value = cliente.address;
  formulario.customerVehicle.value = cliente.vehicle || '';
  formulario.customerNotes.value = cliente.notes || '';
  formulario.customerStatus.value = cliente.status || 'Activo';
}

function llenarFormUsuario(usuario) {
  if (!usuario) return;
  const formulario = document.getElementById('userForm');
  if (!formulario) return;
  formulario.userName.value = usuario.name;
  formulario.userEmail.value = usuario.email;
  formulario.userPhone.value = usuario.phone || '';
  formulario.userAddress.value = usuario.address || '';
  formulario.userRole.value = usuario.role || 'Cliente';
  formulario.userStatus.value = usuario.status || (usuario.active === false ? 'Bloqueado' : 'Activo');
  formulario.userPassword.value = '';
}

function iniciarDashboardCliente() {
  FullGasForms.asegurarUsuariosDemo();
  const sesion = FullGasForms.cargarSesion() || FullGasStore.obtenerSesionActiva() || {
    name: 'Cliente Demo',
    email: 'cliente@fullgasdetail.cl',
    phone: '912345678',
    address: 'Coronel, Concepcion',
    role: 'Cliente'
  };

  const cliente = FullGasStore.cargarClientes().find((entry) => entry.email.toLowerCase() === String(sesion.email || '').toLowerCase()) || null;
  const pedidos = FullGasStore.cargarPedidos().filter((p) => String(p.email || '').toLowerCase() === String(sesion.email || '').toLowerCase());

  const estadisticas = document.getElementById('clientStats');
  if (estadisticas) {
    const totalGastado = pedidos.reduce((suma, p) => suma + Number(p.total || 0), 0);
    estadisticas.innerHTML = [
      ['Compras', pedidos.length],
      ['Gasto total', `$${formatearMonto(totalGastado)}`],
      ['Rol', sesion.role || 'Cliente']
    ].map(([etiqueta, valor]) => `
      <div class="col-12 col-md-4"><div class="stat-card h-100"><strong>${valor}</strong><span>${etiqueta}</span></div></div>
    `).join('');
  }

  const resumen = document.getElementById('clientSummary');
  if (resumen) {
    resumen.innerHTML = `
      <div class="mb-2"><strong>Nombre:</strong> ${sesion.name}</div>
      <div class="mb-2"><strong>Correo:</strong> ${sesion.email}</div>
      <div class="mb-2"><strong>Telefono:</strong> ${sesion.phone || '-'}</div>
      <div class="mb-2"><strong>Direccion:</strong> ${sesion.address || '-'}</div>
      <div><strong>Vehiculo:</strong> ${cliente?.vehicle || 'No registrado'}</div>
    `;
  }

  const cuerpo = document.getElementById('clientOrdersTableBody');
  if (cuerpo) {
    cuerpo.innerHTML = pedidos.length
      ? pedidos.map((pedido) => `
        <tr>
          <td>${pedido.type || 'Pedido'}</td>
          <td>${Array.isArray(pedido.items) ? pedido.items.length : 0}</td>
          <td>$${formatearMonto(pedido.total || 0)}</td>
          <td>${pedido.status || 'Pagado'}</td>
          <td>${pedido.createdAt ? new Date(pedido.createdAt).toLocaleString('es-CL') : '-'}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="5" class="text-center text-white-50 py-4">Todavia no tienes compras registradas.</td></tr>';
  }
}

function formatearMonto(valor) {
  return new Intl.NumberFormat('es-CL').format(Number(valor || 0));
}
