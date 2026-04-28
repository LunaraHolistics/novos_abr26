
import { Location } from './types';

export const INITIAL_MAP_CENTER: [number, number] = [-21.788, -48.171]; 
export const INITIAL_ZOOM = 14;

export const COLORS = {
  referencia: '#f1c40f', // Amarelo
  apoio: '#2ecc71',      // Verde
  doacao: '#e67e22',     // Laranja
  all: '#bdc3c7',
  open: '#39ff14',       // Verde Limão (Halo)
  closed: '#ff0000'      // Vermelho (Halo)
};

const STANDARD_HOURS = { type: 'standard' as const, open: '08:00', close: '16:00', days: [1, 2, 3, 4, 5] };
const HOURS_24H = { type: '24h' as const };

export const LOCATIONS_DATA: Location[] = [
  {
    id: 'ref-1',
    name: 'Centro Pop',
    lat: -21.7895843,
    lng: -48.1775678,
    category: 'Serviços de Referência',
    address: 'Av. José Bonifácio, 570, Centro',
    description: 'Serviço especializado para população em situação de rua, oferecendo apoio, higiene e encaminhamentos.',
    image: '/unidades/pop.jpg',
    phone: '(16) 3331-2313',
    hours: STANDARD_HOURS
  },
  {
    id: 'ref-2',
    name: 'Casa de acolhida Assad Kan',
    lat: -21.7905161,
    lng: -48.1917449,
    category: 'Serviços de Referência',
    address: 'Rua Castro Alves, 2697 – Vila Santana',
    description: 'Unidade de acolhimento institucional para pessoas em vulnerabilidade social temporária. Avaliação técnica e atendimento a itinerantes à partir das 16 horas.',
    image: '/unidades/acolhida.jpg',
    phone: '(16) 3333-7510',
    hours: HOURS_24H
  },
  {
    id: 'ref-3',
    name: 'CRAS Central',
    lat: -21.791522,
    lng: -48.173929,
    category: 'Serviços de Referência',
    address: 'Rua Gonçalves Dias, 468 - Centro',
    description: 'Centro de Referência da Assistência Social - Unidade Central de Araraquara.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=600',
    phone: '(16) 3301-1808',
    hours: { type: 'standard' as const, open: '08:00', close: '15:45', days: [1, 2, 3, 4, 5] },
  },
  {
    id: 'ref-4',
    name: 'CAPS AD (Álcool/Drogas)',
    lat: -21.77107,
    lng: -48.18213,
    category: 'Serviços de Referência',
    address: 'Avenida Professor Sebastian de Almeida Machado, 493 - Vila José Bonifácio',
    description: 'CENTRO DE ATENÇÃO PSICOSSOCIAL – ÁLCOOL E DROGAS - DR. CALIL BUAINAIN – CAPS-AD, oferece tratamento ambulatorial para dependentes de álcool e drogas para a população com idade a partir dos 12 anos. Documentos necessários: Cartão SUS (quando houver), Documentos pessoais, Comprovante de endereço,. Veja nosso horário de funcionamento aberto das 08h às 18h de Segunda a Sexta.',
    image: '/unidades/caps2.jpg',
    phone: '(16) 3322-3329',
    hours: { type: 'standard' as const, open: '08:00', close: '18:00', days: [1, 2, 3, 4, 5] },
},
  {
    id: 'apoio-1',
    name: 'Associação São Pio (Masculino)',
    lat: -21.824304,
    lng: -48.2037705,
    category: 'Apoio e Parcerias',
    address: 'Estrada Abílio Augusto Corrêa , 410 (Igreja Nossa Senhora De Fátima) - Machados',
    description: 'Projeto de apoio social e reinserção comunitária voltado ao público masculino.',
    image: '/unidades/sao-pio-m.jpg',
    hours: HOURS_24H
  },
  {
    id: 'apoio-2',
    name: 'Associação São Pio (Feminina)',
    lat: -21.7665622,
    lng: -48.1782641,
    category: 'Apoio e Parcerias',
    address: 'Avenida Benito Barbieri, 1215 - Vila Harmonia',
    description: 'Projeto de apoio social e reinserção comunitária voltado ao público feminino.',
    image: '/unidades/sao-pio-f.jpg',
    hours: HOURS_24H
  },
    {
    id: 'apoio-3',
    name: 'Comunidade Terapêutica Associação Amigos da Vida (AAVida)',
    lat: -21.799075,
    lng: -48.116017,
    category: 'Apoio e Parcerias',
    address: 'Av. José Gorla, 321 - Condomínio Satélite',
    description: 'Objetivo:Acolher depentes químicos do sexo masculino acima de 18 anos de idade em caráter voluntário. Horário de funcionamento para triagem e acolhimento, de segunda à sexta-feira, horário comercial. Critério de acolhimento: voluntário, avaliação médica (UPA OU UBS). Para triagem, entrar em contato através do telefone celular (16)99724-6736.',
    image: '/unidades/aavida.jpg',
    phone: '(16) 99724-6736',
    hours: STANDARD_HOURS
  },
  {
    id: 'doacao-1',
    name: 'Fundo Social de Solidariedade',
    lat: -21.7788367,
    lng: -48.1921867,
    category: 'Pontos de Doação',
    address: 'Rua Imaculada Conceição, 3885 - Santana',
    description: 'Ponto oficial de coleta de doações (alimentos, roupas, cobertores) em Araraquara.',
    image: '/unidades/fss.jpg',
    phone: '(16) 3331-5406',
    hours: { type: 'standard' as const, open: '07:15', close: '15:00', days: [1, 2, 3, 4, 5] },
  },
  {
    id: 'doacao-2',
    name: 'Centro de Referência Afro "Mestre Jorge"',
    lat: -21.7848946,
    lng: -48.1750017,
    category: 'Pontos de Doação',
    address: 'Avenida Mauá, 377, Centro',
    description: 'Espaço cultural e de apoio que atua como ponto de referência e doação. Local também oferece cursos, eventos, oficinas, palestras e formações em horário pós-expediente (das 18h às 23h)',
    image: '/unidades/centro-afro.jpg',
    phone: '(16) 3322-8316',
    hours: STANDARD_HOURS
  }
];
