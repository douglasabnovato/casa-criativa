/* Regras de validação de uma ideia (defesa contra URL javascript: e campos vazios) */
const LIMITS = {
  title: [3, 80],
  category: [2, 40],
  description: [10, 500],
};

/* Retorna true apenas para URLs absolutas http(s) */
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/* Normaliza e valida os campos; devolve { value, errors } */
function validateIdea(input = {}) {
  const value = {
    title: String(input.title ?? "").trim(),
    category: String(input.category ?? "").trim(),
    image: String(input.image ?? "").trim(),
    description: String(input.description ?? "").trim(),
    link: String(input.link ?? "").trim(),
  };
  const errors = {};
  for (const [field, [min, max]] of Object.entries(LIMITS)) {
    const size = value[field].length;
    if (size < min || size > max) errors[field] = `Use de ${min} a ${max} caracteres.`;
  }
  if (!isHttpUrl(value.image)) errors.image = "Informe um endereço de imagem começando com http:// ou https://.";
  if (!isHttpUrl(value.link)) errors.link = "Informe um link começando com http:// ou https://.";
  return { value, errors };
}

module.exports = { validateIdea, isHttpUrl, LIMITS };
/* Fim de ideaValidation.js */
