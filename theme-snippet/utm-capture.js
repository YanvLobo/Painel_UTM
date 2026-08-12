/**
 * Captura UTM (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
 * na primeira visita, salva em cookie first-touch por 30 dias, e grava os
 * valores como cart attributes para que o Shopify os propague em
 * note_attributes no pedido final.
 *
 * Instalação: colar dentro de <script>...</script> em
 * Online Store > Temas > Editar código > layout/theme.liquid, logo antes
 * de </head>.
 */
(function () {
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "from"];
  var COOKIE_NAME = "utm_attribution";
  var COOKIE_DAYS = 30;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie =
      name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
  }

  function getUtmFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var found = {};
    var hasAny = false;

    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) {
        found[key] = value;
        hasAny = true;
      }
    });

    return hasAny ? found : null;
  }

  function saveToCartAttributes(utm) {
    var attributes = {};
    Object.keys(utm).forEach(function (key) {
      attributes[key] = utm[key];
    });
    attributes["landing_page"] = window.location.href;

    fetch("/cart/update.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attributes: attributes }),
    }).catch(function () {
      // silencioso: não deve travar a navegação do usuário
    });
  }

  var utmFromUrl = getUtmFromUrl();

  if (utmFromUrl) {
    // Nova sessão com UTM na URL: grava first-touch e atualiza o carrinho.
    setCookie(COOKIE_NAME, JSON.stringify(utmFromUrl), COOKIE_DAYS);
    saveToCartAttributes(utmFromUrl);
    return;
  }

  var stored = getCookie(COOKIE_NAME);
  var alreadySyncedThisSession = sessionStorage.getItem("utm_synced");

  if (stored && !alreadySyncedThisSession) {
    try {
      // Garante que o carrinho tem os atributos mesmo em páginas
      // subsequentes sem UTM na URL (ex.: usuário navegando pelo site),
      // mas só uma vez por sessão para não gerar fetch em toda pageview.
      saveToCartAttributes(JSON.parse(stored));
      sessionStorage.setItem("utm_synced", "1");
    } catch {
      // cookie corrompido, ignora
    }
  }
})();
