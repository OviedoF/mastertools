import { site } from "@/content/site";

export const telHref = `tel:${site.phone.tel}`;

/** Enlace de WhatsApp con mensaje precargado (documento de estructura, 3.4 y 4.3). */
export function waHref(message: string) {
  return `https://wa.me/${site.phone.wa}?text=${encodeURIComponent(message)}`;
}

export const waMessages = {
  general: "Hola, quiero hacer una consulta sobre sus servicios.",
  service: (lineName: string) =>
    `Hola, quiero cotizar un servicio de ${lineName}.`,
  medida:
    "Hola, quiero cotizar un servicio de medida Nivel II o cambio de comercializador.",
  emergency: "EMERGENCIA ELÉCTRICA. Estoy en [ciudad]. Lo que pasa es: ",
};

export const waGeneralHref = waHref(waMessages.general);
export const waEmergencyHref = waHref(waMessages.emergency);
