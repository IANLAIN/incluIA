export function initOnboarding(root = document) {
  const onboardingRoot = root.querySelector('#onboarding-flow');
  if (!onboardingRoot) return;

  let pasoActual = 1;
  const totalPasos = 5;
  const respuestas = {};

  const btnNext = root.querySelector('#btn-next');
  const btnPrev = root.querySelector('#btn-prev');
  const progressBar = root.querySelector('#barra-progreso');
  const stepText = root.querySelector('#texto-paso');

  function mostrarPaso(paso) {
    root.querySelectorAll('.step-container').forEach(el => el.classList.remove('active'));
    const stepEl = root.querySelector(`#step-${paso}`);
    if (stepEl) {
      stepEl.classList.add('active');
    }
    btnPrev.style.display = paso === 1 ? 'none' : 'block';
    
    // Si estamos en el último paso y ya hay opciones seleccionadas
    if (paso === totalPasos) {
       btnNext.textContent = 'Finalizar';
    } else {
       btnNext.textContent = 'Siguiente';
    }
  }

  function actualizarBarra() {
    const porcentaje = (pasoActual / totalPasos) * 100;
    if (progressBar) progressBar.style.width = `${porcentaje}%`;
    if (stepText) stepText.textContent = `Paso ${pasoActual} de ${totalPasos}`;
  }

  // Handle option clicks
  root.querySelectorAll('.opcion-card').forEach(card => {
    card.addEventListener('click', () => {
      const parentStep = card.closest('.step-container');
      const isMulti = parentStep.dataset.multi === 'true';
      const stepId = parentStep.id;

      if (!isMulti) {
        // Single selection
        parentStep.querySelectorAll('.opcion-card').forEach(c => c.classList.remove('seleccionada'));
        card.classList.add('seleccionada');
        
        // Auto-advance for single selection
        respuestas[stepId] = card.dataset.value;
        setTimeout(() => siguientePaso(), 400);
      } else {
        // Multi selection (Step 5)
        card.classList.toggle('seleccionada');
        const seleccionadas = Array.from(parentStep.querySelectorAll('.opcion-card.seleccionada')).map(c => c.dataset.value);
        respuestas[stepId] = seleccionadas;
        
        // Disable more than 3
        if (seleccionadas.length >= 3) {
           parentStep.querySelectorAll('.opcion-card:not(.seleccionada)').forEach(c => c.style.opacity = '0.5');
        } else {
           parentStep.querySelectorAll('.opcion-card').forEach(c => c.style.opacity = '1');
        }
      }
    });
  });

  async function finalizarOnboarding() {
    btnNext.disabled = true;
    btnNext.textContent = 'Guardando...';
    try {
      const supabaseClient = window.supabase.createClient('https://oupbptgzfevkzzvscekj.supabase.co', 'sb_publishable_Obya200r1UbgWVnMbuhhiw_Xto1ETSE');
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session) {
        const userId = session.user.id;
        await supabaseClient.from('profiles').update({
          gustos: respuestas,
          onboarding_completed: true
        }).eq('id', userId);
      }
      
      const role = localStorage.getItem('user_role') || 'candidate';
      if (window.__spaNavigate) {
        window.__spaNavigate(`pages/dashboard-${role}.html`);
      }
    } catch (err) {
      console.error("Error finalizing onboarding", err);
      btnNext.disabled = false;
      btnNext.textContent = 'Finalizar';
    }
  }

  function siguientePaso() {
    if (pasoActual < totalPasos) {
      pasoActual++;
      mostrarPaso(pasoActual);
      actualizarBarra();
    } else {
      finalizarOnboarding();
    }
  }

  function anteriorPaso() {
    if (pasoActual > 1) {
      pasoActual--;
      mostrarPaso(pasoActual);
      actualizarBarra();
    }
  }

  btnNext?.addEventListener('click', siguientePaso);
  btnPrev?.addEventListener('click', anteriorPaso);

  mostrarPaso(pasoActual);
  actualizarBarra();
}
