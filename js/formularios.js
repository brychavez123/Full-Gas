window.FullGasForms = (() => {
  const CLAVES_STORAGE = {
    sesion: 'fullgas_session',
    usuarios: 'fullgas_users',
    recuperaciones: 'fullgas_recoveries'
  };

  const USER_CLIENTE = {
    name: 'Bryan Chavez',
    email: 'bryan@fullgasdetail.cl',
    phone: '927264262',
    address: 'Avenida Llacolen 4165, Coronel',
    role: 'Cliente',
    password: 'Cliente1!'
  };

  const USER_TECNICO = {
    name: 'Carlos Soto',
    email: 'tecnico@fullgasdetail.cl',
    phone: '923456789',
    address: 'Calle Los Aromos 321, Coronel',
    role: 'Tecnico',
    password: 'Tecnico1!'
  };

  const USER_ADMIN = {
    name: 'Admin Principal',
    email: 'admin@fullgasdetail.cl',
    phone: '934567891',
    address: 'Coronel, Concepcion',
    role: 'Administrador',
    password: 'Admin123!'
  };

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

  function notificar(mensaje, tono = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<strong class="d-block mb-1 text-${tono === 'danger' ? 'danger' : tono === 'warning' ? 'warning' : 'success'}">${tono === 'danger' ? 'Atencion' : 'Full Gas Detail'}</strong><span>${mensaje}</span>`;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2800);
  }

  function cargarSesion() {
    return leerJSON(CLAVES_STORAGE.sesion, null);
  }

  function guardarSesion(sesion) {
    escribirJSON(CLAVES_STORAGE.sesion, sesion);
  }

  function cargarUsuarios() {
    return leerJSON(CLAVES_STORAGE.usuarios, []);
  }

  function guardarUsuarios(usuarios) {
    escribirJSON(CLAVES_STORAGE.usuarios, usuarios);
  }

  function cargarRecuperaciones() {
    return leerJSON(CLAVES_STORAGE.recuperaciones, []);
  }

  function guardarRecuperaciones(recuperaciones) {
    escribirJSON(CLAVES_STORAGE.recuperaciones, recuperaciones);
  }

  function asegurarUsuariosDemo() {
    const usuarios = cargarUsuarios();
    if (usuarios.length) return usuarios;
    const usuariosDemo = [USER_CLIENTE, USER_TECNICO, USER_ADMIN];
    guardarUsuarios(usuariosDemo);
    return usuariosDemo;
  }

  function validarContrasena(valor, campo) {
    const reglas = [
      valor.length >= 8,
      valor.length <= 20,
      /[A-Z]/.test(valor),
      /[a-z]/.test(valor),
      /[0-9]/.test(valor),
      /[^A-Za-z0-9]/.test(valor)
    ];
    const valido = reglas.every(Boolean);
    if (campo) {
      campo.setCustomValidity(valido ? '' : 'La contrasena no cumple con las reglas de seguridad.');
    }
    return valido;
  }

  function validarCoincidencia(formulario, selector) {
    const campo = formulario.querySelector(selector);
    const objetivo = selector ? formulario.querySelector(selector) : null;
    if (!campo || !objetivo) return true;
    const valido = campo.value === objetivo.value;
    campo.setCustomValidity(valido ? '' : 'No coincide.');
    return valido;
  }

  function validarCampoCoincidencia(formulario, campo) {
    const objetivo = formulario.querySelector(campo.dataset.match);
    if (!objetivo) return true;
    const valido = campo.value === objetivo.value;
    campo.setCustomValidity(valido ? '' : 'No coincide.');
    return valido;
  }

  function validarCampoContrasena(campo) {
    return validarContrasena(campo.value || '', campo);
  }

  function validarCampoAlfabetico(campo) {
    const valor = String(campo.value || '').trim();
    const valido = valor.length >= 2 && /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(valor);
    campo.setCustomValidity(valido ? '' : 'Solo se permiten letras.');
    return valido;
  }

  function actualizarEstadoValidacion(formulario) {
    let valido = true;
    const campoClave = formulario.querySelector('[data-password-field]');
    if (campoClave) {
      valido = validarCampoContrasena(campoClave) && valido;
    }
    formulario.querySelectorAll('[data-match]').forEach((campo) => {
      valido = validarCampoCoincidencia(formulario, campo) && valido;
    });
    return valido;
  }

  function guardarUsuario(usuario) {
    const usuarios = cargarUsuarios();
    const indice = usuarios.findIndex((entry) => entry.email === usuario.email);
    if (indice >= 0) {
      usuarios[indice] = { ...usuarios[indice], ...usuario };
    } else {
      usuarios.unshift(usuario);
    }
    guardarUsuarios(usuarios);
    return usuarios;
  }

  function agregarRecuperacion(solicitud) {
    const recuperaciones = cargarRecuperaciones();
    recuperaciones.unshift({ ...solicitud, creadoEn: new Date().toISOString() });
    guardarRecuperaciones(recuperaciones);
    return recuperaciones;
  }

  function obtenerUsuarioPorCorreo(correo) {
    return cargarUsuarios().find((usuario) => usuario.email.toLowerCase() === String(correo).toLowerCase());
  }

  function inicializarCamposNumericos(contenedor) {
    contenedor.querySelectorAll('[data-numeric-field]').forEach((campo) => {
      campo.addEventListener('keydown', (e) => {
        const teclasSistema = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (!teclasSistema.includes(e.key) && !/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
      });
      campo.addEventListener('input', () => {
        const cursor = campo.selectionStart;
        const limpio = campo.value.replace(/[^0-9]/g, '');
        if (campo.value !== limpio) {
          campo.value = limpio;
          campo.setSelectionRange(cursor - 1, cursor - 1);
        }
      });
    });
  }

  function normalizarTelefono(valor) {
    const digitos = String(valor || '').replace(/^\+56/, '').replace(/[^0-9]/g, '');
    return digitos;
  }

  return {
    notificar,
    cargarSesion,
    guardarSesion,
    cargarUsuarios,
    guardarUsuarios,
    cargarRecuperaciones,
    guardarRecuperaciones,
    asegurarUsuariosDemo,
    validarCampoContrasena,
    validarCampoAlfabetico,
    validarContrasena,
    validarCoincidencia,
    validarCampoCoincidencia,
    actualizarEstadoValidacion,
    guardarUsuario,
    agregarRecuperacion,
    obtenerUsuarioPorCorreo,
    inicializarCamposNumericos,
    normalizarTelefono
  };
})();
