export type ChecklistSection = { id: string; number: number; name: string; japanese: string; questions: { id: string; short: string; text: string }[] };

export const checklist: ChecklistSection[] = [
  {
    id: "seiri", number: 1, name: "Clasificar", japanese: "Seiri", questions: [
      { id: "q1", short: "Solo lo necesario", text: "En la estación solo hay lo necesario para el trabajo del turno." },
      { id: "q2", short: "Dañados identificados", text: "No hay piezas, material o herramientas dañadas sin identificar." },
      { id: "q3", short: "Sin objetos personales ni basura", text: "No hay objetos personales ni basura en el área de trabajo." },
    ]
  },
  {
    id: "seiton", number: 2, name: "Ordenar", japanese: "Seiton", questions: [
      { id: "q4", short: "Herramientas en su lugar", text: "Cada herramienta tiene un lugar marcado y está en su lugar." },
      { id: "q5", short: "Pasillos libres", text: "Pasillos y delimitaciones del piso están visibles y libres." },
      { id: "q6", short: "Material identificado", text: "El material está identificado y al alcance de la mano." },
    ]
  },
  {
    id: "seiso", number: 3, name: "Limpiar", japanese: "Seiso", questions: [
      { id: "q7", short: "Piso y mesa limpios", text: "Piso y mesa de trabajo limpios: sin derrames, rebabas ni polvo." },
      { id: "q8", short: "Máquina sin fugas", text: "Máquina y herramientas limpias y sin fugas de aceite, aire o agua." },
      { id: "q9", short: "Material de limpieza completo", text: "El material de limpieza está completo y en su lugar." },
    ]
  },
  {
    id: "seiketsu", number: 4, name: "Estandarizar", japanese: "Seiketsu", questions: [
      { id: "q10", short: "Instrucciones visibles", text: "Las instrucciones de trabajo y ayudas visuales están visibles y vigentes." },
      { id: "q11", short: "Rol de limpieza cumplido", text: "Existe un rol de limpieza de la estación y se está cumpliendo." },
      { id: "q12", short: "Anomalías reportadas", text: "Las anomalías se reportan con tarjeta o en el tablero del área." },
    ]
  },
  {
    id: "shitsuke", number: 5, name: "Disciplina", japanese: "Shitsuke", questions: [
      { id: "q13", short: "Uso de EPP", text: "Uso correcto y completo del equipo de protección personal (EPP)." },
      { id: "q14", short: "Sin recordatorio", text: "Las 5S se mantienen sin necesidad de recordatorio del supervisor." },
      { id: "q15", short: "Entrega igual o mejor", text: "La estación se entrega al siguiente turno igual o mejor que como se recibió." },
    ]
  },
];

/** Preguntas con su S y código corto ("1S-1"). */
export const questions = checklist.flatMap((section) => section.questions.map((question, index) => ({ ...question, sectionId: section.id, section: `${section.number}S`, code: `${section.number}S-${index + 1}` })));
