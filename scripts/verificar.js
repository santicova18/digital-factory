/**
 * ============================================================================
 * VERIFICAR.JS — Lógica de Verificación Rápida de Asistencia por Código QR
 * Bootcamp Fábrica Digital & IA 2026 • SENA Regional Atlántico
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONFIGURACIÓN DEL BACKEND & PARÁMETROS URL
  // --------------------------------------------------------------------------
  const BACKEND_CONFIG = {
    // URL del Google Apps Script configurado en script.js
    gasUrl: 'https://script.google.com/macros/s/AKfycbwn1utVhQJcmX3EUR4jY5tfSM4ud9GBOYhhcbocbT_buOcJpzA3wb1VXcFvQrwlBIuH/exec',
    // Parámetros admitidos para validar acceso procedente de QR
    allowedKeys: ['access', 'token', 'session'],
    validAccessValues: ['qr', 'dfb-2026', 'digitalfactory', 'asistencia']
  };

  // Referencias a elementos del DOM
  const unauthorizedView = document.getElementById('unauthorizedView');
  const verificationView = document.getElementById('verificationView');
  const attendanceForm = document.getElementById('attendanceForm');
  const docInput = document.getElementById('docInput');
  const btnClearDoc = document.getElementById('btnClearDoc');
  const btnSubmitVerificar = document.getElementById('btnSubmitVerificar');
  const docErrorFeedback = document.getElementById('docErrorFeedback');
  const docErrorText = document.getElementById('docErrorText');
  const resultArea = document.getElementById('resultArea');

  // Barra de pruebas rápidas
  const testerBar = document.getElementById('testerBar');
  const testerParam = document.getElementById('testerParam');
  const testerBtn = document.getElementById('testerBtn');

  // --------------------------------------------------------------------------
  // 2. CONTROL DE ACCESO EXCLUSIVO POR URL (QR GATE)
  // --------------------------------------------------------------------------
  function evaluateQrAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    let isAuthorized = false;
    let detectedParam = null;

    // Verificar ?access=qr
    const accessVal = (urlParams.get('access') || '').trim().toLowerCase();
    if (accessVal === 'qr' || BACKEND_CONFIG.validAccessValues.includes(accessVal)) {
      isAuthorized = true;
      detectedParam = `access=${accessVal}`;
    }

    // Verificar ?token=...
    const tokenVal = (urlParams.get('token') || '').trim();
    if (!isAuthorized && tokenVal.length >= 3) {
      isAuthorized = true;
      detectedParam = `token=${tokenVal}`;
    }

    // Verificar ?session=...
    const sessionVal = (urlParams.get('session') || '').trim();
    if (!isAuthorized && sessionVal.length >= 3) {
      isAuthorized = true;
      detectedParam = `session=${sessionVal}`;
    }

    if (isAuthorized) {
      // Flujo Autorizado
      if (unauthorizedView) unauthorizedView.style.display = 'none';
      if (verificationView) verificationView.style.display = 'block';

      if (testerParam) testerParam.textContent = `Parámetro: ${detectedParam}`;
      if (testerBtn) {
        testerBtn.textContent = 'Simular Sin QR (Acceso Bloqueado)';
        testerBtn.href = window.location.pathname;
      }

      // Enfocar input automáticamente en dispositivos compatibles
      setTimeout(() => {
        if (docInput) docInput.focus();
      }, 300);
    } else {
      // Flujo Bloqueado
      if (unauthorizedView) unauthorizedView.style.display = 'flex';
      if (verificationView) verificationView.style.display = 'none';

      if (testerParam) testerParam.textContent = 'Parámetro: Ninguno (acceso raíz)';
      if (testerBtn) {
        testerBtn.textContent = 'Simular Escaneo QR (?access=qr)';
        testerBtn.href = `${window.location.pathname}?access=qr`;
      }
    }

    return isAuthorized;
  }

  // --------------------------------------------------------------------------
  // 3. EVENTOS DE ENTRADA Y SANEAMIENTO
  // --------------------------------------------------------------------------
  if (docInput) {
    docInput.addEventListener('input', (e) => {
      // Filtrar caracteres no numéricos
      const numeric = e.target.value.replace(/\D/g, '');
      if (e.target.value !== numeric) {
        e.target.value = numeric;
      }

      // Botón limpiar
      if (btnClearDoc) {
        if (numeric.length > 0) {
          btnClearDoc.classList.add('visible');
        } else {
          btnClearDoc.classList.remove('visible');
        }
      }

      // Limpiar mensaje de error reactivo
      if (docInput.classList.contains('has-error')) {
        clearError();
      }
    });
  }

  if (btnClearDoc) {
    btnClearDoc.addEventListener('click', () => {
      docInput.value = '';
      btnClearDoc.classList.remove('visible');
      clearError();
      if (resultArea) resultArea.innerHTML = '';
      docInput.focus();
    });
  }

  function showError(msg) {
    if (!docInput || !docErrorFeedback || !docErrorText) return;
    docInput.classList.add('has-error');
    docInput.classList.remove('is-valid');
    docErrorText.textContent = msg;
    docErrorFeedback.classList.add('visible');
  }

  function clearError() {
    if (!docInput || !docErrorFeedback) return;
    docInput.classList.remove('has-error');
    docErrorFeedback.classList.remove('visible');
  }

  function validateDoc(val) {
    const clean = val.trim();
    if (!clean) {
      showError('Por favor ingresa tu número de documento.');
      return false;
    }
    if (clean.length < 6 || clean.length > 15) {
      showError('El documento debe contener entre 6 y 15 dígitos numéricos.');
      return false;
    }
    clearError();
    docInput.classList.add('is-valid');
    return true;
  }

  // --------------------------------------------------------------------------
  // 4. BASE DE DATOS LOCAL Y SERVICIO DE CONSULTA
  // --------------------------------------------------------------------------
  // Base local de participantes registrados para pruebas en caliente
  const mockAttendees = [
    {
      id: '1020304050',
      nombre: 'Camila Rodriguez Morales',
      rol: 'Aprendiz SENA',
      ficha: 'Ficha 2824912 · ADSO',
      centro: 'Centro Nacional Colombo Alemán',
      asistio: false
    },
    {
      id: '12345678',
      nombre: 'Alejandro Valencia Cruz',
      rol: 'Aprendiz SENA',
      ficha: 'Ficha 2715093 · Automatización',
      centro: 'Sede TIC Nodo Barranquilla',
      asistio: false
    },
    {
      id: '98765432',
      nombre: 'Carlos Eduardo Restrepo',
      rol: 'Invitado Especial / Industria',
      ficha: 'Industrias Metalmecánicas del Caribe S.A.S.',
      centro: 'Sector Metalmecánico Regional',
      asistio: true,
      horaAsistencia: '08:42 a. m.'
    }
  ];

  async function checkAttendance(documento) {
    // Simular tiempo de respuesta de red realista
    await new Promise(r => setTimeout(r, 600));

    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const currentDateStr = now.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // 1. Buscar en registros precargados
    const found = mockAttendees.find(a => a.id === documento);
    if (found) {
      if (found.asistio) {
        return {
          status: 'ALREADY_REGISTERED',
          message: 'Asistencia Registrada Previamente',
          attendee: found,
          hora: found.horaAsistencia || currentTimeStr,
          fecha: currentDateStr
        };
      } else {
        found.asistio = true;
        found.horaAsistencia = currentTimeStr;
        return {
          status: 'SUCCESS',
          message: '¡Asistencia Confirmada Exitosamente!',
          attendee: found,
          hora: currentTimeStr,
          fecha: currentDateStr
        };
      }
    }

    // 2. Registro dinámico para testing con cualquier documento válido (6 a 11 dígitos)
    if (documento.length >= 6 && documento.length <= 11) {
      const dynamicAttendee = {
        id: documento,
        nombre: `Participante Bootcamp (${documento})`,
        rol: 'Aprendiz / Asistente Registrado',
        ficha: 'Bootcamp Fábrica Digital & IA 2026',
        centro: 'Nodo TIC Barranquilla',
        asistio: true,
        horaAsistencia: currentTimeStr
      };
      mockAttendees.push(dynamicAttendee);

      return {
        status: 'SUCCESS',
        message: '¡Asistencia Confirmada Exitosamente!',
        attendee: dynamicAttendee,
        hora: currentTimeStr,
        fecha: currentDateStr
      };
    }

    // 3. No encontrado
    return {
      status: 'NOT_FOUND',
      message: 'Documento No Encontrado en el Sistema',
      documento: documento
    };
  }

  // --------------------------------------------------------------------------
  // 5. RENDERIZADO DEL RESULTADO
  // --------------------------------------------------------------------------
  function renderFeedback(res) {
    if (!resultArea) return;
    let html = '';

    if (res.status === 'SUCCESS') {
      html = `
        <div class="result-card success" role="alert">
          <div class="result-card-header">
            <div class="result-icon-badge">
              <i class="fa-solid fa-check"></i>
            </div>
            <div>
              <h3 class="result-title">${res.message}</h3>
              <p class="result-desc">Tu ingreso al Bootcamp Fábrica Digital ha quedado certificado.</p>
            </div>
          </div>
          <div class="attendee-grid">
            <div class="attendee-item">
              <span class="attendee-item-label">Nombre del Participante</span>
              <span class="attendee-item-value">${res.attendee.nombre}</span>
            </div>
            <div class="attendee-item">
              <span class="attendee-item-label">Documento de Identidad</span>
              <span class="attendee-item-value">${res.attendee.id}</span>
            </div>
            <div class="attendee-item">
              <span class="attendee-item-label">Rol / Tipo</span>
              <span class="attendee-item-value">${res.attendee.rol}</span>
            </div>
            <div class="attendee-item">
              <span class="attendee-item-label">Ficha / Dependencia</span>
              <span class="attendee-item-value">${res.attendee.ficha}</span>
            </div>
            <div class="attendee-stamp">
              <i class="fa-solid fa-clock"></i>
              <span>Marcado hoy a las <strong>${res.hora}</strong> (${res.fecha})</span>
            </div>
          </div>
        </div>
      `;
    } else if (res.status === 'ALREADY_REGISTERED') {
      html = `
        <div class="result-card warning" role="alert">
          <div class="result-card-header">
            <div class="result-icon-badge">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3 class="result-title">${res.message}</h3>
              <p class="result-desc">Este documento ya fue registrado previamente en la mesa de control.</p>
            </div>
          </div>
          <div class="attendee-grid">
            <div class="attendee-item">
              <span class="attendee-item-label">Participante</span>
              <span class="attendee-item-value">${res.attendee.nombre}</span>
            </div>
            <div class="attendee-item">
              <span class="attendee-item-label">Documento</span>
              <span class="attendee-item-value">${res.attendee.id}</span>
            </div>
            <div class="attendee-stamp">
              <i class="fa-solid fa-history"></i>
              <span>Hora original de ingreso: <strong>${res.hora}</strong></span>
            </div>
          </div>
        </div>
      `;
    } else {
      html = `
        <div class="result-card error" role="alert">
          <div class="result-card-header">
            <div class="result-icon-badge">
              <i class="fa-solid fa-xmark"></i>
            </div>
            <div>
              <h3 class="result-title">${res.message}</h3>
              <p class="result-desc">
                El documento <strong>${res.documento}</strong> no aparece en el listado oficial de inscripciones. Si realizaste el registro, por favor dirígete a la mesa de acreditación física.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    resultArea.innerHTML = html;
  }

  // --------------------------------------------------------------------------
  // 6. EVENT LISTENER DEL FORMULARIO
  // --------------------------------------------------------------------------
  if (attendanceForm) {
    attendanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const docVal = (docInput.value || '').trim();
      if (!validateDoc(docVal)) {
        docInput.focus();
        return;
      }

      // Estado de carga
      btnSubmitVerificar.classList.add('loading');
      btnSubmitVerificar.disabled = true;
      docInput.disabled = true;
      resultArea.innerHTML = '';

      try {
        const response = await checkAttendance(docVal);
        renderFeedback(response);
      } catch (err) {
        renderFeedback({
          status: 'ERROR',
          message: 'Error de Red o Servidor',
          documento: docVal
        });
      } finally {
        btnSubmitVerificar.classList.remove('loading');
        btnSubmitVerificar.disabled = false;
        docInput.disabled = false;
        docInput.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. INICIAR EVALUACIÓN AL CARGAR
  // --------------------------------------------------------------------------
  evaluateQrAccess();
});
