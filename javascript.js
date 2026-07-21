// ============ Datos base ============
const ESPECIALIDADES = [
  { id: "general", nombre: "Odontología general" },
  { id: "estetica", nombre: "Estética dental" },
  { id: "ortodoncia", nombre: "Ortodoncia" },
  { id: "endodoncia", nombre: "Endodoncia" }
];

const HORARIOS = ["09:00", "09:30", "10:30", "11:00", "16:00", "16:30", "17:30", "18:00"];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const NUM_DIAS = 7;

const WHATSAPP_NUM = "5491100000000";
const EMAIL_TURNOS = "turnos@sonria-odontologia.com";

// Genera un número estable de "turnos disponibles" a partir de especialidad,
// fecha y horario, simulando una agenda real sin necesidad de backend.
function turnosDisponibles(especialidadId, fechaISO, horario){
  let hash = 0;
  const str = especialidadId + fechaISO + horario;
  for(let i = 0; i < str.length; i++){
    hash = (hash * 31 + str.charCodeAt(i)) % 89;
  }
  return hash % 4; // 0 a 3
}

// ============ Fechas ============
function generarFechas(){
  const hoy = new Date();
  const fechas = [];
  for(let i = 0; i < NUM_DIAS; i++){
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    fechas.push(d);
  }
  return fechas;
}

const fechas = generarFechas();

const estado = {
  especialidad: ESPECIALIDADES[0].id,
  fechaIndex: 0,
  horario: null
};

// ============ Referencias ============
const specRow = document.getElementById("spec-row");
const dateRow = document.getElementById("date-row");
const slotGrid = document.getElementById("slot-grid");
const availHint = document.getElementById("avail-hint");
const bookingSummary = document.getElementById("booking-summary");
const summaryText = document.getElementById("summary-text");
const confirmWhatsapp = document.getElementById("confirm-whatsapp");
const confirmEmail = document.getElementById("confirm-email");

function formatearFechaCorta(d){
  return { dia: DIAS_SEMANA[d.getDay()], num: d.getDate() };
}
function formatearFechaISO(d){
  return d.toISOString().slice(0, 10);
}
function formatearFechaLarga(d){
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}
function nombreEspecialidad(id){
  return ESPECIALIDADES.find(e => e.id === id).nombre;
}

// ============ Render: especialidades ============
function renderEspecialidades(){
  specRow.innerHTML = "";
  ESPECIALIDADES.forEach(esp => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (esp.id === estado.especialidad ? " is-active" : "");
    btn.textContent = esp.nombre;
    btn.addEventListener("click", () => {
      estado.especialidad = esp.id;
      estado.horario = null;
      renderEspecialidades();
      renderSlots();
      ocultarResumen();
    });
    specRow.appendChild(btn);
  });
}

// ============ Render: fechas ============
function renderFechas(){
  dateRow.innerHTML = "";
  fechas.forEach((d, i) => {
    const { dia, num } = formatearFechaCorta(d);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "date-pill" + (i === estado.fechaIndex ? " is-active" : "");
    btn.innerHTML = `<span>${dia}</span><strong>${num}</strong>`;
    btn.addEventListener("click", () => {
      estado.fechaIndex = i;
      estado.horario = null;
      renderFechas();
      renderSlots();
      ocultarResumen();
    });
    dateRow.appendChild(btn);
  });
}

// ============ Render: horarios ============
function renderSlots(){
  const fecha = fechas[estado.fechaIndex];
  const fechaISO = formatearFechaISO(fecha);

  slotGrid.innerHTML = "";
  let disponibles = 0;

  HORARIOS.forEach(hora => {
    const cupos = turnosDisponibles(estado.especialidad, fechaISO, hora);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn" + (estado.horario === hora ? " is-active" : "");

    if(cupos === 0){
      btn.disabled = true;
      btn.innerHTML = `${hora}<small>Ocupado</small>`;
    } else {
      disponibles++;
      btn.innerHTML = `${hora}<small>${cupos} cupo${cupos > 1 ? "s" : ""}</small>`;
      btn.addEventListener("click", () => {
        estado.horario = hora;
        renderSlots();
        mostrarResumen();
      });
    }
    slotGrid.appendChild(btn);
  });

  availHint.textContent = disponibles > 0
    ? `${disponibles} horario${disponibles > 1 ? "s" : ""} disponible${disponibles > 1 ? "s" : ""} para ${nombreEspecialidad(estado.especialidad).toLowerCase()}.`
    : "No quedan horarios disponibles ese día para esta especialidad — probá otra fecha.";
}

// ============ Resumen y confirmación ============
function ocultarResumen(){
  bookingSummary.hidden = true;
}

function mostrarResumen(){
  const fecha = fechas[estado.fechaIndex];
  const fechaLarga = formatearFechaLarga(fecha);
  const especialidad = nombreEspecialidad(estado.especialidad);
  const { horario } = estado;

  summaryText.innerHTML = `Turno de <strong>${especialidad}</strong> el <strong>${fechaLarga}</strong> a las <strong>${horario} hs</strong>.`;

  const mensaje = `Hola! Quiero pedir un turno de ${especialidad} el ${fechaLarga} a las ${horario} hs. ¿Confirmamos?`;
  confirmWhatsapp.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(mensaje)}`;

  const asunto = `Turno Sonría — ${especialidad} — ${fechaLarga} ${horario} hs`;
  confirmEmail.href = `mailto:${EMAIL_TURNOS}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;

  bookingSummary.hidden = false;
}

// ============ Inicio ============
renderEspecialidades();
renderFechas();
renderSlots();

// ============ Tema claro / oscuro ============
const themeToggle = document.getElementById("theme-toggle");
const html = document.documentElement;

function actualizarBotonTema(){
  const esOscuro = html.getAttribute("data-theme") === "oscuro";
  themeToggle.setAttribute("aria-pressed", String(esOscuro));
  themeToggle.setAttribute("aria-label", esOscuro ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  themeToggle.title = esOscuro ? "Tema claro" : "Tema oscuro";
}

themeToggle.addEventListener("click", () => {
  const esOscuro = html.getAttribute("data-theme") === "oscuro";
  if(esOscuro){
    html.removeAttribute("data-theme");
    localStorage.setItem("sonria-tema", "claro");
  } else {
    html.setAttribute("data-theme", "oscuro");
    localStorage.setItem("sonria-tema", "oscuro");
  }
  actualizarBotonTema();
});

actualizarBotonTema();