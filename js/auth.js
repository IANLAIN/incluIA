/**
 * auth.js — Supabase authentication + UX feedback
 * Handles Google OAuth, email/password login, and role selection.
 */
export function initAuth(root = document) {
  const authRoot = root.querySelector("[data-auth-root]");
  if (!authRoot) return;

  const supabaseUrl = 'https://oupbptgzfevkzzvscekj.supabase.co';
  const supabaseKey = 'sb_publishable_Obya200r1UbgWVnMbuhhiw_Xto1ETSE';

  let supabaseClient = null;
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  }

  if (!supabaseClient) return;

  // ── Global Logout Helper ───────────────────────────────────────
  window.cerrarSesion = async () => {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    if (window.__spaNavigate) {
      window.__spaNavigate("pages/landing.html");
    } else {
      window.location.href = "pages/landing.html";
    }
  };

  // ── Auto-create profile & Onboarding routing ───────────────────
  // We only run this once per session to avoid infinite loops
  if (!window._authListenerAdded) {
    window._authListenerAdded = true;
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = session.user;
        const currentPath = window.location.pathname;
        const isOAuth = user.app_metadata?.provider === 'google';

        // Solo procesamos el routing automático si el usuario viene de un login/oauth
        // y no si ya está navegando dentro del dashboard.
        if (isOAuth) {
          try {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (!profile) {
              const pendingRole = localStorage.getItem('pending_role') || 'candidate';
              await supabaseClient.from('profiles').insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                role: pendingRole,
                onboarding_completed: false,
                created_at: new Date().toISOString()
              });

              localStorage.setItem('user_role', pendingRole);
              localStorage.setItem('user_id', user.id);
              if (window.__spaNavigate) window.__spaNavigate('pages/onboarding.html');
            } else {
              localStorage.setItem('user_role', profile.role);
              localStorage.setItem('user_id', user.id);

              if (!profile.onboarding_completed) {
                if (window.__spaNavigate) window.__spaNavigate('pages/onboarding.html');
              } else {
                if (window.__spaNavigate) window.__spaNavigate(`pages/dashboard-${profile.role}.html`);
              }
            }
          } catch (err) {
            console.error("Error checking profile:", err);
          }
        }
      }
    });
  }

  // ── Role selector guidance ─────────────────────────────────────
  const roleRadios = authRoot.querySelectorAll("input[name='role']");
  const roleOutput = authRoot.querySelector("[data-role-output]");

  function updateRole() {
    if (!roleOutput) return;
    const selected = authRoot.querySelector("input[name='role']:checked");
    const value = selected ? selected.value : "candidate";
    roleOutput.textContent =
      value === "company"
        ? "Vista corporativa con ESG y guía de adaptación."
        : "Vista de candidato con apoyo visual y tareas guiadas.";
  }

  roleRadios.forEach(r => r.addEventListener("change", updateRole));
  updateRole();

  // ── Shared status helpers ──────────────────────────────────────
  function setStatus(el, type, icon, text) {
    if (!el) return;
    el.className = `ms-status msg-${type}`;
    el.innerHTML = `<span aria-hidden="true">${icon}</span> ${text}`;
    el.removeAttribute("hidden");
  }

  function setLoading(btn, loading, originalText) {
    btn.disabled = loading;
    btn.textContent = loading ? "Cargando..." : originalText;
    if (loading) btn.classList.add("is-loading");
    else btn.classList.remove("is-loading");
  }

  // ── Redirect helper — SPA Router ───────────────────────────────
  function redirectToDashboard() {
    const role = localStorage.getItem('user_role') || 'candidate';
    const dest = role === 'company' ? 'pages/dashboard-company.html' : 'pages/dashboard-candidate.html';

    if (window.__spaNavigate) {
      window.__spaNavigate(dest);
    } else {
      console.error("SPA router not found!");
    }
  }

  // ── Google OAuth ───────────────────────────────────────────────
  root.querySelectorAll("[data-google-login]").forEach(btn => {
    const originalText = btn.querySelector("span[data-i18n]")?.textContent || "Continuar con Google";
    const statusEl = authRoot.querySelector("[data-ms-status]");

    btn.addEventListener("click", async e => {
      e.preventDefault();
      setLoading(btn, true, originalText);
      setStatus(statusEl, "info", "⏳", "Conectando con Google...");

      if (!window.supabase) {
        setStatus(statusEl, "error", "⚠️", "Supabase no disponible. Recarga la página.");
        setLoading(btn, false, originalText);
        return;
      }
      if (!supabaseClient) {
        setStatus(statusEl, "error", "⚠️", "Error de configuración. Contacta soporte.");
        setLoading(btn, false, originalText);
        return;
      }

      // Save role choice
      const roleEl = authRoot.querySelector("input[name='role']:checked");
      const role = roleEl?.value || "candidate";
      localStorage.setItem("user_role", role);

      // Redirect URL: always go back to the SPA shell (index.html)
      const redirectTo = window.location.origin;

      try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo }
        });
        if (error) throw error;
      } catch (err) {
        console.error("OAuth error:", err.message);
        setStatus(statusEl, "error", "⚠️", "Error al conectar con Google. Intenta de nuevo.");
        setLoading(btn, false, originalText);
      }
    });
  });

  // ── Email/password forms (Login) ───────────────────────────────
  authRoot.querySelectorAll("form").forEach(form => {
    if (form.id === "register-form") return; // Handled by wizard
    
    const submitBtn = form.querySelector("[type='submit']");
    const originalBtnText = submitBtn?.textContent || "Entrar";
    const statusEl = authRoot.querySelector("[data-ms-status]");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!supabaseClient) {
        setStatus(statusEl, "error", "⚠️", "Backend no configurado. Usa Google por ahora.");
        return;
      }

      const emailEl = form.querySelector("[type='email']");
      const passEl  = form.querySelector("[type='password']");
      const email   = emailEl?.value?.trim();
      const pass    = passEl?.value;

      // Clear previous validation states
      [emailEl, passEl].forEach(el => {
        if (el) { el.classList.remove("error", "success"); }
      });

      // Validaciones obligatorias
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailEl?.classList.add("error");
        setStatus(statusEl, "error", "⚠️", "Por favor ingresa un correo válido.");
        return;
      }
      if (!pass || pass.length < 8) {
        passEl?.classList.add("error");
        setStatus(statusEl, "error", "⚠️", "La contraseña debe tener al menos 8 caracteres.");
        return;
      }

      setLoading(submitBtn, true, originalBtnText);
      setStatus(statusEl, "info", "⏳", "Verificando credenciales...");

      const isRegister = form.id === "register-form";
      const roleEl = authRoot.querySelector("input[name='role']:checked");
      const selectedRole = roleEl?.value || "candidate";

      try {
        let result;
        if (isRegister) {
          result = await supabaseClient.auth.signUp({ 
            email, 
            password: pass,
            options: { data: { role: selectedRole } }
          });
        } else {
          result = await supabaseClient.auth.signInWithPassword({ email, password: pass });
        }

        if (result.error) throw result.error;

        emailEl?.classList.add("success");
        passEl?.classList.add("success");
        setStatus(statusEl, "success", "✅", isRegister
          ? "¡Cuenta creada! Redirigiendo..."
          : "¡Sesión iniciada correctamente!");

        const finalRole = isRegister ? selectedRole : (result.data.user.user_metadata?.role || 'candidate');
        localStorage.setItem('user_role', finalRole);

        setTimeout(() => redirectToDashboard(), 800);
      } catch (err) {
        console.error("Auth error:", err.message);
        setStatus(statusEl, "error", "⚠️", "Correo o contraseña incorrectos.");
        emailEl?.classList.add("error");
      } finally {
        setLoading(submitBtn, false, originalBtnText);
      }
    });
  });

  // ── Sign Out ───────────────────────────────────────────────────
  const logoutBtns = document.querySelectorAll("[data-logout]");
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      localStorage.removeItem("user_role");
      if (window.__spaNavigate) {
        window.__spaNavigate("pages/landing.html");
      }
    });
  });

  // ── Password Toggle & Strength Bar ──────────────────────────────
  function initPasswordToggle(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;
    
    const iconOpen = btn.querySelector('#iconOpen');
    const iconClosed = btn.querySelector('#iconClosed');
    let visible = false;

    btn.addEventListener('click', () => {
      visible = !visible;
      input.type = visible ? 'text' : 'password';
      if (iconOpen) iconOpen.style.display = visible ? 'none' : 'block';
      if (iconClosed) iconClosed.style.display = visible ? 'block' : 'none';
      btn.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
      btn.style.transform = 'scale(1.25)';
      setTimeout(() => btn.style.transform = 'scale(1)', 200);
    });
  }

  function initStrengthBar(inputId) {
    const input = document.getElementById(inputId);
    const bar = document.getElementById('strengthBar');
    const label = document.getElementById('strengthLabel');
    if (!input || !bar || !label) return;

    const levels = [
      { w: '25%', color: '#E57373', text: 'Muy débil' },
      { w: '50%', color: '#FFB74D', text: 'Débil' },
      { w: '75%', color: '#81C784', text: 'Buena' },
      { w: '100%', color: '#4D8FAC', text: 'Muy fuerte ✓' },
    ];
    
    input.addEventListener('input', () => {
      const v = input.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const lvl = v.length === 0 ? null : levels[score - 1] || levels[0];
      bar.style.width = lvl ? lvl.w : '0%';
      bar.style.background = lvl ? lvl.color : 'transparent';
      label.textContent = lvl ? lvl.text : '';
      label.style.color = lvl ? lvl.color : 'var(--text-secondary)';
    });
  }

  // Inicializar al cargar la página o inyectar el componente
  initPasswordToggle('login-password', 'loginEyeBtn');
  initPasswordToggle('password', 'regEyeBtn');
  initPasswordToggle('confirm-password', 'regConfirmEyeBtn');
  initStrengthBar('password');
  
  // ── Register Wizard ─────────────────────────────────────────────
  initRegisterWizard(authRoot, supabaseClient);
}

function initRegisterWizard(root, supabase) {
  const step1 = root.querySelector('#step-1');
  const step2 = root.querySelector('#step-2');
  const step3 = root.querySelector('#step-3');
  if (!step1 || !step2 || !step3) return;

  const btnToStep2 = root.querySelector('#btn-to-step2');
  const btnBack1 = root.querySelector('#btn-back-1');
  const roleCards = root.querySelectorAll('.role-card');
  const companyFields = root.querySelector('#company-fields');
  const companyBanner = root.querySelector('#company-banner');
  const googleBtnText = root.querySelector('#google-btn-text');
  const nameLabel = root.querySelector('#name-label');
  const formDividerText = root.querySelector('#form-divider-text');
  const roleBadgeContainer = root.querySelector('#role-badge-container');
  const regProgress = root.querySelector('#reg-progress');
  
  let selectedRole = '';

  // Select Role
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      roleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedRole = card.dataset.role;
      btnToStep2.disabled = false;
    });
  });

    // Handle Google Auth for Wizard
    const btnGoogleRegister = root.querySelector('#btn-google-register');
    if (btnGoogleRegister) {
      btnGoogleRegister.addEventListener('click', async (e) => {
        e.preventDefault();
        btnGoogleRegister.disabled = true;
        btnGoogleRegister.textContent = 'Conectando...';
        
        // Save the chosen role so onAuthStateChange can use it
        localStorage.setItem('user_role', selectedRole);
        localStorage.setItem('pending_role', selectedRole);

        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
          });
          if (error) throw error;
        } catch (err) {
          console.error("OAuth error:", err.message);
          btnGoogleRegister.disabled = false;
          btnGoogleRegister.textContent = 'Continuar con Google';
          setStatus('error', '⚠️', 'Error al conectar con Google.');
        }
      });
    }

  // Navigate Step 1 -> Step 2
  btnToStep2.addEventListener('click', () => {
    if (!selectedRole) return;
    
    // Configure Step 2 UI based on role
    if (selectedRole === 'company') {
      companyFields.style.display = 'block';
      companyBanner.style.display = 'flex';
      googleBtnText.textContent = 'Continuar con Google corporativo';
      nameLabel.textContent = 'Nombre y Apellido';
      formDividerText.textContent = 'o completa el formulario';
      roleBadgeContainer.innerHTML = '<span class="chip chip-success">🏢 Empresa / Reclutador</span>';
      // Add required attributes to company fields
      root.querySelector('#company_name').required = true;
      root.querySelector('#company_role').required = true;
    } else {
      companyFields.style.display = 'none';
      companyBanner.style.display = 'none';
      googleBtnText.textContent = 'Continuar con Google';
      nameLabel.textContent = 'Nombre completo';
      formDividerText.textContent = 'o regístrate con correo';
      roleBadgeContainer.innerHTML = '<span class="chip chip-soft">🧠 Candidato / Aliado</span>';
      // Remove required attributes
      root.querySelector('#company_name').required = false;
      root.querySelector('#company_role').required = false;
    }

    // Animate transition
    step1.classList.remove('active');
    setTimeout(() => {
      step2.classList.add('active');
      regProgress.style.width = '66%';
    }, 300);
  });

  // Navigate Step 2 -> Step 1
  btnBack1.addEventListener('click', () => {
    step2.classList.remove('active');
    setTimeout(() => {
      step1.classList.add('active');
      regProgress.style.width = '33%';
    }, 300);
  });

  // Override Form Submit for Step 2
  const registerForm = root.querySelector('#register-form');
  if (registerForm) {
    const submitBtn = registerForm.querySelector('#btn-submit');
    const statusEl = registerForm.querySelector('#status-message');

    function setStatus(type, icon, text) {
      statusEl.className = `ms-status msg-${type}`;
      statusEl.innerHTML = `<span aria-hidden="true">${icon}</span> ${text}`;
      statusEl.removeAttribute('hidden');
    }

    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      
      const email = registerForm.querySelector('#email').value.trim();
      const password = registerForm.querySelector('#password').value;
      const fullName = registerForm.querySelector('#full_name').value.trim();
      
      if (!fullName || !email || !password) {
        setStatus('error', '⚠️', 'Por favor, completa los campos requeridos.');
        return;
      }
      if (password.length < 8) {
        setStatus('error', '⚠️', 'La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creando cuenta...';
      submitBtn.classList.add('is-loading');

      let metadata = { full_name: fullName, role: selectedRole };
      let profileData = { email, full_name: fullName, role: selectedRole, onboarding_completed: false };

      if (selectedRole === 'company') {
        const companyName = registerForm.querySelector('#company_name').value.trim();
        const companyRole = registerForm.querySelector('#company_role').value;
        const companySize = registerForm.querySelector('#company_size').value;
        
        if (!companyName || !companyRole) {
          setStatus('error', '⚠️', 'Faltan datos de la empresa.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Crear mi cuenta';
          submitBtn.classList.remove('is-loading');
          return;
        }
        
        metadata = { ...metadata, company_name: companyName, company_role: companyRole, company_size: companySize };
        profileData = { ...profileData, company_name: companyName, company_role: companyRole, company_size: companySize, verified: false };
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata }
        });

        if (error) throw error;

        // Upsert explicitly to ensure fields exist even before email confirmation
        if (data.user) {
          profileData.id = data.user.id;
          await supabase.from('profiles').upsert(profileData);
          
          // Setup Step 3
          root.querySelector('#verify-email-display').textContent = email;
          
          // Attach resend logic
          const btnResend = root.querySelector('#btn-resend');
          const resendStatus = root.querySelector('#resend-status');
          btnResend.onclick = async () => {
            btnResend.disabled = true;
            await supabase.auth.resend({ type: 'signup', email });
            resendStatus.style.display = 'block';
            resendStatus.className = 'ms-status msg-success';
            resendStatus.innerHTML = '✅ Correo reenviado.';
            setTimeout(() => { btnResend.disabled = false; }, 60000);
          };

          // Animate transition Step 2 -> Step 3
          step2.classList.remove('active');
          setTimeout(() => {
            step3.classList.add('active');
            regProgress.style.width = '100%';
          }, 300);
        }

      } catch (err) {
        console.error("Signup error:", err.message);
        setStatus('error', '⚠️', err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear mi cuenta';
        submitBtn.classList.remove('is-loading');
      }
    });
  }
}
