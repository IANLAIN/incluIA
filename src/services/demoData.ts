import { VacancyItem, MentorItem } from "@/types";

// DEMO USER CREDENTIALS
export const DEMO_USERS: Record<string, {
  email: string;
  password: string;
  id: string;
  role: "candidate" | "organization" | "mentor";
  name: string;
  avatarUrl?: string;
  vocation: string;
  completedOnboarding: boolean;
  profile?: any;
}> = {
  "candidato@astris.org": {
    email: "candidato@astris.org",
    password: "Demo2026",
    id: "demo-cand",
    role: "candidate",
    name: "Bryan Gonzalez",
    avatarUrl: "",
    vocation: "Ingeniero de Sistemas y Computación",
    completedOnboarding: true,
    profile: {
      work_preference: "Remoto / Híbrido",
      ideal_environment: "Entorno silencioso, poca carga sensorial, comunicación asíncrona",
      interests: "Tecnología, Desarrollo web, Accesibilidad, Sistemas distribuidos",
      accessibility_theme: "verde",
      accessibility_font: "opendyslexic",
      neurotype: "TDAH"
    }
  },
  "organizacion@astris.org": {
    email: "organizacion@astris.org",
    password: "Demo2026",
    id: "demo-comp",
    role: "organization",
    name: "Vibra Latina",
    avatarUrl: "",
    vocation: "",
    completedOnboarding: true,
    profile: {
      organization_name: "Vibra Latina",
      industry: "Audiovisual / Producción",
      organization_size: "10-50 empleados",
      country: "Estados Unidos",
      city: "Houston, TX",
      philosophy: "Somos una corporación comprometida con la producción audiovisual y la distribución de contenido. En Vibra Latina tenemos un propósito claro: promover el cambio social y la inserción laboral a través del poder de las historias. Con sede en Houston, Texas, y una sólida presencia en Latinoamérica, nos especializamos en desarrollar obras que abordan temas fundamentales enfocados en la responsabilidad social corporativa, la educación, innovaciones y STEM. Nuestra misión es mostrar historias inspiradoras de comunidades, líderes y personalidades, especialmente dentro de la comunidad hispana bilingüe.",
      noise: "Moderado (ambiente creativo controlado)",
      light: "Luz LED ajustable + luz natural",
      layout: "Espacios abiertos con zonas de enfoque individual",
      accommodations: [
        "Audífonos con cancelación de ruido",
        "Horario flexible",
        "Trabajo remoto o híbrido",
        "Comunicación asíncrona",
        "Salas de descanso sensorial"
      ],
      policies: [
        "Flexibilidad de horario",
        "Pausas activas programadas",
        "Reuniones con agenda previa"
      ],
      work_environment: {
        noise: "Moderado (ambiente creativo controlado)",
        light: "Luz LED ajustable + luz natural",
        layout: "Espacios abiertos con zonas de enfoque individual",
        policies: ["Flexibilidad de horario", "Pausas activas programadas", "Reuniones con agenda previa"],
        organization_size: "10-50 empleados",
        country: "Estados Unidos",
        city: "Houston, TX"
      }
    }
  },
  "mentor@astris.org": {
    email: "mentor@astris.org",
    password: "Demo2026",
    id: "demo-ment",
    role: "mentor",
    name: "Elena Vargas",
    avatarUrl: "",
    vocation: "Especialista en Inclusión Laboral y Coaching Neurodivergente",
    completedOnboarding: true,
    profile: {
      full_name: "Elena Vargas",
      specialty: "Entornos laborales diversos y funciones ejecutivas",
      years_experience: 9,
      modality: "Virtual y Presencial",
      bio: "Psicóloga organizacional con amplia experiencia en acompañamiento de personas con estilos diversos en entornos corporativos y creativos."
    }
  }
};

// DEMO VACANCIES
export const VACANCIES_FALLBACK: VacancyItem[] = [
  {
    id: "vac-vibra-fullstack",
    title: "Desarrollador Full Stack",
    organization: "Vibra Latina",
    sector: "Tecnología / Audiovisual",
    modality: "Remoto o Híbrido",
    type: "Tiempo completo",
    match: 94,
    socialLevel: "Bajo",
    adjustments: [
      "100% remoto posible",
      "Comunicación asíncrona",
      "Horario flexible",
      "Instrucciones escritas detalladas",
      "Audífonos con cancelación de ruido"
    ],
    desc: "Buscamos un desarrollador Full Stack para construir y mantener la plataforma web de Vibra Latina. Trabajarás con React, Node.js, y servicios en la nube para crear experiencias digitales que conecten a la comunidad latina con contenido audiovisual adaptativo.",
    organizationDesc: "Vibra Latina es una corporación comprometida con la producción audiovisual y la distribución de contenido, con sede en Houston, Texas. Nos especializamos en desarrollar obras que abordan temas de responsabilidad social corporativa, educación, innovación y STEM, mostrando historias inspiradoras de la comunidad hispana bilingüe.",
  },
  {
    id: "vac-vibra-designer",
    title: "Diseñador Gráfico",
    organization: "Vibra Latina",
    sector: "Diseño / Audiovisual",
    modality: "Remoto o Híbrido",
    type: "Tiempo completo",
    match: 87,
    socialLevel: "Bajo",
    adjustments: [
      "Horario flexible",
      "Briefs visuales y escritos",
      "Evaluación por entregables",
      "Comunicación asíncrona"
    ],
    desc: "Buscamos un diseñador gráfico talentoso para crear la identidad visual de nuestros proyectos audiovisuales. Trabajarás en branding, diseño web, y material promocional para campañas digitales.",
    organizationDesc: "Vibra Latina es una corporación comprometida con la producción audiovisual y la distribución de contenido, con sede en Houston, Texas. Nos especializamos en desarrollar obras que abordan temas de responsabilidad social corporativa, educación, innovación y STEM, mostrando historias inspiradoras de la comunidad hispana bilingüe.",
  },
  {
    id: "vac-closer-sysadmin",
    title: "Gerente de Administración de Sistemas",
    organization: "Closer To The Stars Foundation",
    sector: "Tecnología / Gestión",
    modality: "Híbrido",
    type: "Tiempo completo",
    match: 82,
    socialLevel: "Medio",
    adjustments: [
      "Horario flexible",
      "Espacio de trabajo tranquilo",
      "Instrucciones escritas",
      "Comunicación asíncrona",
      "Reuniones con agenda previa"
    ],
    desc: "Lidera la administración de sistemas de la fundación. Gestionarás infraestructura TI, seguridad informática, y coordinarás equipos técnicos en proyectos de impacto social relacionados con la exploración espacial y la divulgación científica.",
    organizationDesc: "Closer To The Stars Foundation es una organización sin fines de lucro dedicada a acercar la ciencia y la exploración espacial a comunidades subrepresentadas, promoviendo la inserción laboral en STEM.",
  },
];

// DEMO MENTORS
export const MENTORS_FALLBACK: MentorItem[] = [
  {
    id: "M-01",
    name: "Elena Vargas",
    specialty: "Entornos laborales diversos y funciones ejecutivas",
    years: 9,
    modality: "Virtual y Presencial",
    bio: "Psicóloga organizacional especializada en estrategias de inserción laboral para perfiles con estilos cognitivos diversos. Experiencia en acompañamiento de personas con estilos diversos en sectores tecnológico y creativo."
  },
  {
    id: "M-02",
    name: "David Morales",
    specialty: "Aprendizaje adaptativo en entornos corporativos",
    years: 5,
    modality: "Virtual",
    bio: "Consultor de accesibilidad laboral con experiencia en mediación organización-candidato. Especialista en diseño de planes de ajuste razonable y comunicación asertiva en equipos diversos."
  },
  {
    id: "M-03",
    name: "Sofía Andrade",
    specialty: "Integración sensorial y entorno laboral",
    years: 6,
    modality: "Virtual",
    bio: "Terapeuta ocupacional con posgrado en accesibilidad laboral. Ayuda a organizaciones a crear entornos sensorialmente seguros y productivos para todos los perfiles."
  },
  {
    id: "M-04",
    name: "Luis Torres",
    specialty: "Transición laboral y autonomía profesional",
    years: 10,
    modality: "Presencial",
    bio: "Coach laboral y educador especializado en autonomía profesional para personas con TDAH y perfiles divergentes. Enfoque práctico en organización y gestión del tiempo."
  },
];

// CANDIDATE RADAR (Bryan Gonzalez)
export const CANDIDATE_RADAR_FINAL = [
  { axis: "Procesamiento", value: 78 },
  { axis: "T. Ambiental", value: 37 },
  { axis: "Ejecución", value: 80 },
  { axis: "Ajustes", value: 86 },
];

// CANDIDATE ADJUSTMENTS
export const CANDIDATE_ADJUSTMENTS = [
  "Trabajo remoto o híbrido",
  "Comunicación asíncrona",
  "Instrucciones escritas detalladas",
  "Control de ruido ambiental",
  "Horario flexible",
  "Audífonos con cancelación de ruido",
  "Tareas divididas en bloques",
];

// COMPANY CANDIDATES DATA (for Vibra Latina)
export const ORGANIZATION_CANDIDATES_DATA = [
  {
    id: "demo-cand",
    match: 94,
    strengths: "Alto enfoque en tareas detalladas. Prefiere entorno silencioso y comunicación asíncrona. Experiencia en desarrollo full stack con React, Node.js y TypeScript. Capacidad de hiperenfoque en problemas complejos.",
    radar: [
      { axis: "Procesamiento", value: 78 },
      { axis: "T. Ambiental", value: 37 },
      { axis: "Ejecución", value: 80 },
      { axis: "Ajustes", value: 86 }
    ],
    env: [
      { req: "Trabajo remoto disponible", met: true },
      { req: "Comunicación asíncrona", met: true },
      { req: "Espacio individual silencioso", met: true },
      { req: "Horario flexible", met: true },
      { req: "Instrucciones escritas", met: true }
    ]
  },
  {
    id: "CAND-B3M9",
    match: 89,
    strengths: "Excelente tolerancia a entornos variables. Habilidad multitarea alta. Comunicación verbal fluida. Portafolio sólido en diseño UX/UI.",
    radar: [
      { axis: "Procesamiento", value: 65 },
      { axis: "T. Ambiental", value: 82 },
      { axis: "Ejecución", value: 68 },
      { axis: "Ajustes", value: 85 }
    ],
    env: [
      { req: "Trabajo remoto disponible", met: true },
      { req: "Comunicación asíncrona", met: false },
      { req: "Instrucciones escritas", met: true },
      { req: "Evaluación por entregables", met: true }
    ]
  },
  {
    id: "CAND-C1K4",
    match: 82,
    strengths: "Alta especialización en administración de sistemas. Experiencia en infraestructura cloud y seguridad informática. Capacidad de planificación estratégica.",
    radar: [
      { axis: "Procesamiento", value: 90 },
      { axis: "T. Ambiental", value: 55 },
      { axis: "Ejecución", value: 85 },
      { axis: "Ajustes", value: 50 }
    ],
    env: [
      { req: "Trabajo remoto disponible", met: true },
      { req: "Gestión visual de tareas", met: true },
      { req: "Control de ruido", met: true },
      { req: "Check-ins diarios estructurados", met: false }
    ]
  },
];

// MENTOR PROCESSES
export const MENTOR_PROCESSES = [
  {
    cid: "demo-cand",
    name: "Bryan Gonzalez",
    organization: "Vibra Latina",
    role: "Desarrollador Full Stack",
    stage: "Preparación — Entrevista",
    stageColor: "#1B4B7A",
    days: 5,
    action: "Sesión de preparación para entrevista técnica con el equipo de Vibra Latina",
    notes: "Candidato motivado y con excelentes habilidades técnicas. Punto de enfoque: estructurar respuestas para preguntas de comportamiento y trabajo en equipo."
  },
  {
    cid: "CAND-B3M9",
    organization: "Vibra Latina",
    role: "Diseñador Gráfico",
    stage: "Onboarding activo",
    stageColor: "#2D7D5F",
    days: 14,
    action: "Check-in semana 2 con líder de equipo creativo",
    notes: "Diseñador adaptándose bien al entorno. Herramientas de diseño colaborativo configuradas. Punto de fricción: reuniones matutinas sin agenda previa."
  },
  {
    cid: "CAND-C1K4",
    organization: "Closer To The Stars Foundation",
    role: "Gerente de Administración de Sistemas",
    stage: "Período de prueba",
    stageColor: "#8B5C3A",
    days: 30,
    action: "Revisión de 30 días con RRHH y candidato",
    notes: "Período de prueba positivo. La fundación confirmó flexibilidad horaria y proporcionó espacio de trabajo individual tranquilo."
  },
];

// MENTOR COMPANIES
export const MENTOR_ORGANIZATIONS = [
  {
    name: "Vibra Latina",
    contact: "RRHH · María Torres",
    status: "Activo",
    color: "#2D7D5F",
    processes: 2
  },
  {
    name: "Closer To The Stars Foundation",
    contact: "People · Carlos Mendoza",
    status: "En proceso",
    color: "#1B4B7A",
    processes: 1
  }
];
