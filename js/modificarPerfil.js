document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page !== 'profile') return;
  const formulario = document.querySelector('[data-profile-form]');
  if (!formulario || !window.FullGasForms) return;

  const sesion = FullGasForms.cargarSesion() || {
    name: 'Cliente demo',
    email: 'cliente@fullgasdetail.cl',
    phone: '912345678',
    address: 'Coronel, Concepcion',
    role: 'Cliente'
  };

  const campos = {
    profileName: sesion.name,
    profileRole: sesion.role,
    profileEmail: sesion.email,
    profilePhone: FullGasForms.normalizarTelefono(sesion.phone),
    profileAddress: sesion.address
  };

  Object.entries(campos).forEach(([id, valor]) => {
    const campo = document.getElementById(id);
    if (campo) {
      campo.value = valor;
    }
  });

  const resumen = document.getElementById('sessionSummary');
  if (resumen) {
    resumen.innerHTML = `
      <div class="mb-2"><strong>Nombre:</strong> ${sesion.name}</div>
      <div class="mb-2"><strong>Correo:</strong> ${sesion.email}</div>
      <div class="mb-2"><strong>Rol:</strong> ${sesion.role}</div>
      <div><strong>Direccion:</strong> ${sesion.address}</div>
    `;
  }

  FullGasForms.inicializarCamposNumericos(formulario);

  formulario.addEventListener('input', () => {
    FullGasForms.actualizarEstadoValidacion(formulario);
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const valido = formulario.checkValidity() && FullGasForms.actualizarEstadoValidacion(formulario);
    if (!valido) {
      formulario.classList.add('was-validated');
      return;
    }

    const datos = new FormData(formulario);
    const sesionActualizada = {
      name: String(datos.get('name') || '').trim(),
      email: String(datos.get('email') || '').trim(),
      phone: '+56' + String(datos.get('phone') || '').trim(),
      address: String(datos.get('address') || '').trim(),
      role: sesion.role || 'Cliente'
    };
    const nuevaClave = String(datos.get('password') || '').trim();

    FullGasForms.guardarSesion(sesionActualizada);

    const usuarioActual = FullGasForms.obtenerUsuarioPorCorreo(sesionActualizada.email);
    if (usuarioActual) {
      FullGasForms.guardarUsuario({
        ...usuarioActual,
        ...sesionActualizada,
        password: nuevaClave || usuarioActual.password,
        actualizadoEn: new Date().toISOString()
      });
    } else {
      FullGasForms.guardarUsuario({
        ...sesionActualizada,
        password: nuevaClave || 'FullGas1!'
      });
    }

    FullGasForms.notificar('Perfil actualizado en localStorage.');
    if (resumen) {
      resumen.innerHTML = `
        <div class="mb-2"><strong>Nombre:</strong> ${sesionActualizada.name}</div>
        <div class="mb-2"><strong>Correo:</strong> ${sesionActualizada.email}</div>
        <div class="mb-2"><strong>Rol:</strong> ${sesionActualizada.role}</div>
        <div><strong>Direccion:</strong> ${sesionActualizada.address}</div>
      `;
    }
  });
});
