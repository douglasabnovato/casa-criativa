/* Comportamento do modal "Nova ideia" e validação do formulário no navegador */
(function () {
  const modal = document.getElementById("modal");
  const form = document.querySelector("[data-idea-form]");
  let lastTrigger = null;

  const RULES = {
    title: [3, 80],
    category: [2, 40],
    description: [10, 500],
  };

  /* Abre o modal, trava a rolagem e leva o foco ao primeiro campo */
  function openModal(trigger) {
    lastTrigger = trigger || null;
    modal.hidden = false;
    modal.classList.remove("hide");
    modal.classList.add("addScroll");
    document.body.classList.add("hideScroll");
    const first = modal.querySelector("[aria-invalid='true']") || modal.querySelector("input, textarea");
    if (first) first.focus();
  }

  /* Fecha o modal e devolve o foco a quem o abriu */
  function closeModal() {
    modal.classList.add("hide");
    modal.classList.remove("addScroll");
    modal.hidden = true;
    document.body.classList.remove("hideScroll");
    if (lastTrigger) lastTrigger.focus();
  }

  /* Valida uma URL http(s) absoluta */
  function isHttpUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  /* Mostra ou limpa a mensagem de erro de um campo */
  function setError(field, message) {
    const hint = document.getElementById("erro-" + field.name);
    hint.textContent = message || "";
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }

  /* Confere todos os campos antes do envio; foca o primeiro com erro */
  function validate(event) {
    let firstInvalid = null;
    Array.from(form.elements).forEach(function (field) {
      if (!field.name) return;
      const value = field.value.trim();
      let message = "";
      if (RULES[field.name]) {
        const min = RULES[field.name][0];
        const max = RULES[field.name][1];
        if (value.length < min || value.length > max) message = "Use de " + min + " a " + max + " caracteres.";
      } else if (!isHttpUrl(value)) {
        message = "Informe um endereço começando com http:// ou https://.";
      }
      setError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.focus();
    }
  }

  document.querySelectorAll("[data-open-modal]").forEach(function (button) {
    button.addEventListener("click", function () { openModal(button); });
  });
  document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", closeModal);
  });
  /* Mantém o Tab dentro do modal aberto (padrão de diálogo modal do WAI-ARIA APG) */
  function trapTab(event) {
    const focusable = Array.from(modal.querySelectorAll("input, textarea, button, a[href]")).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("keydown", function (event) {
    if (modal.hidden) return;
    if (event.key === "Escape") closeModal();
    else if (event.key === "Tab") trapTab(event);
  });
  document.querySelectorAll(".idea img").forEach(function (img) {
    img.addEventListener("error", function () { img.src = "/img/logo.png"; }, { once: true });
  });
  if (form) form.addEventListener("submit", validate);
  if (!modal.hidden) openModal(null);
})();
/* Fim de script.js */
