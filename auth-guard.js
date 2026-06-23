// ── Auth Guard ───────────────────────────────────────────────────────────────
// Carga siempre DESPUÉS de supabase-client.js
(function () {
  document.documentElement.style.visibility = 'hidden';

  function genToken() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  function kickOut() {
    localStorage.removeItem('_stkn');
    window.sb.auth.signOut().then(function () {
      window.location.href = '../index.html?msg=kicked';
    });
  }

  // Usa getUser() (llamada fresca al servidor) para leer el token real
  function checkToken(onPass) {
    window.sb.auth.getUser().then(function (res) {
      if (!res.data.user) { window.location.href = '../index.html'; return; }
      var user     = res.data.user;
      var dbToken  = user.user_metadata && user.user_metadata.stkn;
      var stored   = localStorage.getItem('_stkn');

      if (!dbToken) {
        // Usuario sin token aún: generar y guardar en metadata
        var newToken = genToken();
        localStorage.setItem('_stkn', newToken);
        window.sb.auth.updateUser({ data: { stkn: newToken } });
        if (onPass) onPass(user.id);
      } else if (!stored || stored !== dbToken) {
        kickOut();
      } else {
        if (onPass) onPass(user.id);
      }
    });
  }

  // Verificación inicial al cargar la página
  window.sb.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (!session) { window.location.href = '../index.html'; return; }

    checkToken(function (uid) {
      document.documentElement.style.visibility = '';

      window.sb.from('profiles').select('display_name').eq('id', uid).single().then(function (r) {
        var el = document.getElementById('nav-user');
        if (el && r.data) el.textContent = r.data.display_name || '';
      });

      // Verificar cada 15 segundos — si otro dispositivo inició sesión, kick
      setInterval(function () { checkToken(null); }, 15000);
    });
  });

  window.AppAuth = {
    signOut: function () {
      localStorage.removeItem('_stkn');
      window.sb.auth.signOut().then(function () {
        window.location.href = '../index.html';
      });
    },

    saveProgress: function (questionId, subject, topic, correct) {
      window.sb.auth.getSession().then(function (res) {
        if (!res.data.session) return;
        window.sb.from('question_results').upsert(
          {
            user_id:     res.data.session.user.id,
            question_id: questionId,
            subject:     subject,
            topic:       topic,
            correct:     correct,
            answered_at: new Date().toISOString()
          },
          { onConflict: 'user_id,question_id' }
        ).then(function (r) {
          if (r.error) console.warn('[Auth] saveProgress error:', r.error.message);
        });
      });
    }
  };
})();
