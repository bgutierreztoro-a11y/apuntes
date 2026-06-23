// ── Auth Guard ───────────────────────────────────────────────────────────────
// Carga siempre DESPUÉS de supabase-client.js
// Oculta la página hasta verificar sesión; redirige si no hay sesión activa.
(function () {
  document.documentElement.style.visibility = 'hidden';

  window.sb.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (!session) {
      window.location.href = '../index.html';
      return;
    }
    document.documentElement.style.visibility = '';

    window.sb
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .single()
      .then(function (r) {
        var el = document.getElementById('nav-user');
        if (el && r.data) el.textContent = r.data.display_name;
      });
  });

  window.AppAuth = {
    signOut: function () {
      window.sb.auth.signOut().then(function () {
        window.location.href = '../index.html';
      });
    },

    // Guarda el resultado de una pregunta en Supabase (upsert — actualiza si ya existe)
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
