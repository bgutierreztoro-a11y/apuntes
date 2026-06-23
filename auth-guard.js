// ── Auth Guard ───────────────────────────────────────────────────────────────
// Carga siempre DESPUÉS de supabase-client.js
// Oculta la página hasta verificar sesión y token de sesión; redirige si no hay sesión.
(function () {
  document.documentElement.style.visibility = 'hidden';

  function genToken() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  window.sb.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (!session) {
      window.location.href = '../index.html';
      return;
    }

    window.sb
      .from('profiles')
      .select('display_name, session_token')
      .eq('id', session.user.id)
      .single()
      .then(function (r) {
        if (r.data && r.data.session_token) {
          var stored = localStorage.getItem('_stkn');
          if (!stored || stored !== r.data.session_token) {
            window.sb.auth.signOut().then(function () {
              window.location.href = '../index.html?msg=kicked';
            });
            return;
          }
        } else {
          // Token aún no existe (primer acceso con nuevo sistema): generarlo
          var newToken = genToken();
          localStorage.setItem('_stkn', newToken);
          window.sb.from('profiles').update({ session_token: newToken }).eq('id', session.user.id);
        }

        document.documentElement.style.visibility = '';
        var el = document.getElementById('nav-user');
        if (el && r.data) el.textContent = r.data.display_name || '';
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
        window.sb
          .from('question_results')
          .upsert(
            {
              user_id:     res.data.session.user.id,
              question_id: questionId,
              subject:     subject,
              topic:       topic,
              correct:     correct,
              answered_at: new Date().toISOString()
            },
            { onConflict: 'user_id,question_id' }
          )
          .then(function (r) {
            if (r.error) console.warn('[Auth] saveProgress error:', r.error.message);
          });
      });
    }
  };
})();
