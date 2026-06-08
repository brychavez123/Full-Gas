window.FullGasStore = (() => {
  const CLAVES_STORAGE = {
    productos: 'fullgas_products',
    clientes: 'fullgas_customers',
    pedidos: 'fullgas_orders',
    sesion: 'fullgas_session'
  };

  const productosDefault = [
    { id: 'p1', name: 'Shampoo neutro', category: 'limpieza', price: 8900, stock: 24, active: true, image: 'https://images.pexels.com/photos/4870731/pexels-photo-4870731.jpeg?cs=srgb&dl=pexels-karola-g-4870731.jpg&fm=jpg', description: 'Limpieza segura para pintura y superficies delicadas.' },
    { id: 'p2', name: 'Desengrasante multiuso', category: 'limpieza', price: 12900, stock: 18, active: true, image: 'https://images.pexels.com/photos/17623850/pexels-photo-17623850.jpeg?cs=srgb&dl=pexels-malcolm-garret-3023588-17623850.jpg&fm=jpg', description: 'Ideal para llantas, motor y zonas de alta suciedad.' },
    { id: 'p3', name: 'Cera protectora', category: 'proteccion', price: 15400, stock: 12, active: true, image: 'https://images.pexels.com/photos/33707368/pexels-photo-33707368.jpeg?cs=srgb&dl=pexels-pavel-mudrevsky-3891203-33707368.jpg&fm=jpg', description: 'Proteccion y brillo duradero para carroceria.' },
    { id: 'p4', name: 'Microfibra premium', category: 'accesorios', price: 4900, stock: 40, active: true, image: 'https://images.pexels.com/photos/20042048/pexels-photo-20042048.jpeg?cs=srgb&dl=pexels-wavyvisuals-377312923-20042048.jpg&fm=jpg', description: 'Toalla suave para secado y detallado.' },
    { id: 'p5', name: 'Limpiador interior', category: 'limpieza', price: 11900, stock: 16, active: true, image: 'https://images.pexels.com/photos/31389821/pexels-photo-31389821.jpeg?cs=srgb&dl=pexels-bulat843-1243575272-31389821.jpg&fm=jpg', description: 'Para plasticos, vinilos y tableros.' },
    { id: 'p6', name: 'Shine de neumaticos', category: 'proteccion', price: 10900, stock: 20, active: true, image: 'https://images.pexels.com/photos/32667420/pexels-photo-32667420.jpeg?cs=srgb&dl=pexels-anil-chandran-876746-32667420.jpg&fm=jpg', description: 'Acabado negro satinado y proteccion extra.' },
    { id: 'p7', name: 'Cepillo detailing', category: 'accesorios', price: 5800, stock: 30, active: true, image: 'https://images.pexels.com/photos/4870702/pexels-photo-4870702.jpeg?cs=srgb&dl=pexels-karola-g-4870702.jpg&fm=jpg', description: 'Llega a costuras, emblemas y rincones.' },
    { id: 'p8', name: 'Aromatizante premium', category: 'accesorios', price: 6900, stock: 28, active: true, image: 'https://images.pexels.com/photos/17029947/pexels-photo-17029947.jpeg?cs=srgb&dl=pexels-lasanhasculture-17029947.jpg&fm=jpg', description: 'Aroma limpio para una experiencia completa.' }
  ];

  const clientesDefault = [
    { id: 'c1', name: 'Bryan Andres Chavez Carreño', email: 'bryanandres9@hotmail.com', phone: '927264262', address: 'avenida llacolen 4165', vehicle: 'Sedan', notes: 'Cliente demo', status: 'Activo' },
    { id: 'c2', name: 'Cliente Demo', email: 'cliente@fullgasdetail.cl', phone: '912345678', address: 'Coronel, Concepcion', vehicle: 'SUV', notes: 'Carga inicial', status: 'Activo' }
  ];

  function leerJSON(clave, fallback) {
    try {
      return JSON.parse(localStorage.getItem(clave) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }

  function escribirJSON(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }

  function semillarSiVacio(clave, fallback) {
    const actual = localStorage.getItem(clave);
    if (actual === null) {
      escribirJSON(clave, fallback);
      return fallback;
    }
    return leerJSON(clave, fallback);
  }

  function cargarProductos() {
    return semillarSiVacio(CLAVES_STORAGE.productos, productosDefault).map((producto) => ({
      stock: 0,
      active: true,
      image: '',
      ...producto
    }));
  }

  function guardarProductos(productos) {
    escribirJSON(CLAVES_STORAGE.productos, productos);
  }

  function guardarProducto(producto) {
    const productos = cargarProductos();
    const normalizado = {
      id: producto.id || `prod_${Date.now()}`,
      name: String(producto.name || '').trim(),
      category: String(producto.category || 'limpieza').trim(),
      price: Number(producto.price || 0),
      stock: Number(producto.stock || 0),
      active: Boolean(producto.active),
      image: String(producto.image || '').trim(),
      description: String(producto.description || '').trim()
    };
    const indice = productos.findIndex((entry) => entry.id === normalizado.id);
    if (indice >= 0) {
      productos[indice] = normalizado;
    } else {
      productos.unshift(normalizado);
    }
    guardarProductos(productos);
    return productos;
  }

  function eliminarProducto(id) {
    const productos = cargarProductos().filter((producto) => producto.id !== id);
    guardarProductos(productos);
    return productos;
  }

  function ajustarStock(id, delta) {
    const productos = cargarProductos();
    const producto = productos.find((entry) => entry.id === id);
    if (!producto) return productos;
    producto.stock = Math.max(0, Number(producto.stock || 0) + Number(delta || 0));
    guardarProductos(productos);
    return productos;
  }

  function ajustarInventario(itemsCarrito) {
    const productos = cargarProductos();
    let cambio = false;
    itemsCarrito.forEach((item) => {
      const producto = productos.find((entry) => entry.id === item.id);
      if (producto) {
        producto.stock = Math.max(0, Number(producto.stock || 0) - Number(item.quantity || 0));
        cambio = true;
      }
    });
    if (cambio) {
      guardarProductos(productos);
    }
    return productos;
  }

  function cargarClientes() {
    return semillarSiVacio(CLAVES_STORAGE.clientes, clientesDefault);
  }

  function guardarClientes(clientes) {
    escribirJSON(CLAVES_STORAGE.clientes, clientes);
  }

  function guardarCliente(cliente) {
    const clientes = cargarClientes();
    const normalizado = {
      id: cliente.id || `cust_${Date.now()}`,
      name: String(cliente.name || '').trim(),
      email: String(cliente.email || '').trim(),
      phone: String(cliente.phone || '').trim(),
      address: String(cliente.address || '').trim(),
      vehicle: String(cliente.vehicle || '').trim(),
      notes: String(cliente.notes || '').trim(),
      status: String(cliente.status || 'Activo').trim()
    };
    const indice = clientes.findIndex((entry) => entry.id === normalizado.id || entry.email.toLowerCase() === normalizado.email.toLowerCase());
    if (indice >= 0) {
      clientes[indice] = { ...clientes[indice], ...normalizado };
    } else {
      clientes.unshift(normalizado);
    }
    guardarClientes(clientes);
    return clientes;
  }

  function eliminarCliente(id) {
    const clientes = cargarClientes().filter((cliente) => cliente.id !== id);
    guardarClientes(clientes);
    return clientes;
  }

  function cargarPedidos() {
    return leerJSON(CLAVES_STORAGE.pedidos, []);
  }

  function guardarPedidos(pedidos) {
    escribirJSON(CLAVES_STORAGE.pedidos, pedidos);
  }

  function registrarPedido(pedido) {
    const pedidos = cargarPedidos();
    pedidos.unshift({
      id: pedido.id || `ord_${Date.now()}`,
      type: pedido.type || 'Pedido',
      customerName: pedido.customerName || 'Cliente',
      email: pedido.email || '',
      total: Number(pedido.total || 0),
      items: pedido.items || [],
      status: pedido.status || 'Pagado',
      createdAt: pedido.createdAt || new Date().toISOString()
    });
    guardarPedidos(pedidos);
    return pedidos;
  }

  function obtenerSesionActiva() {
    return leerJSON(CLAVES_STORAGE.sesion, null);
  }

  return {
    cargarProductos,
    guardarProductos,
    guardarProducto,
    eliminarProducto,
    ajustarStock,
    ajustarInventario,
    cargarClientes,
    guardarClientes,
    guardarCliente,
    eliminarCliente,
    cargarPedidos,
    guardarPedidos,
    registrarPedido,
    obtenerSesionActiva
  };
})();
