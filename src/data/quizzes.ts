/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DRRMQuizQuestion } from '../types/game';

export const DRRM_QUIZ_QUESTIONS: DRRMQuizQuestion[] = [
  {
    id: 'q1_mitigation_types',
    question: 'Which of the following is classified as a NON-STRUCTURAL disaster mitigation measure?',
    options: [
      'Building a reinforced concrete curved seawall',
      'Implementing hazard land-use zoning and building restrictions',
      'Installing steel cross-bracing in masonry schools',
      'Excavating a stormwater retention basin',
    ],
    correctIndex: 1,
    explanation: 'Non-structural mitigation modifies human behavior, legal policy, or emergency preparedness (like zoning laws, early warnings, and evacuation drills) without erecting physical engineering barriers.',
    curriculumKey: 'Structural vs Non-Structural Mitigation',
  },
  {
    id: 'q2_liquefaction',
    question: 'Why does soil liquefaction occur during major earthquakes on water-saturated alluvial plains?',
    options: [
      'The soil becomes magnetized by underground tectonic friction',
      'Cyclic shear shaking increases pore water pressure, causing loose sediment to behave like a fluid',
      'Underground tectonic magma melts the topsoil layers',
      'P-waves compress soil into dense solid bedrock',
    ],
    correctIndex: 1,
    explanation: 'During seismic shaking, loosely packed water-saturated sand grains lose contact with one another as pore water pressure spikes, stripping the soil of its load-bearing capacity.',
    curriculumKey: 'Earth Science / Soil Liquefaction',
  },
  {
    id: 'q3_eco_drr',
    question: 'How do mangrove greenbelts provide Nature-Based Disaster Risk Reduction (Eco-DRR) against tsunamis?',
    options: [
      'They evaporate seawater before the surge reaches land',
      'Dense aerial stilt root networks introduce hydraulic drag that cuts wave energy and traps sediments',
      'They emit ultrasonic soundwaves that dissolve ocean crests',
      'They freeze incoming ocean water on contact',
    ],
    correctIndex: 1,
    explanation: 'Mangrove root systems create intense hydraulic friction and drag against moving water columns, significantly attenuating wave velocity, height, and erosive power.',
    curriculumKey: 'Ecosystem-Based Disaster Risk Reduction (Eco-DRR)',
  },
  {
    id: 'q4_fire_triangle',
    question: 'Which component of the Fire Triangle does a 30-meter defensible space firebreak directly eliminate?',
    options: [
      'Oxygen (Atmosphere)',
      'Heat (Ignition temperature)',
      'Fuel (Combustible vegetation and brush)',
      'Chemical Chain Reaction',
    ],
    correctIndex: 2,
    explanation: 'A firebreak physically clears dry trees, ladder fuels, and underbrush, removing the fuel necessary for combustion to bridge the gap into residential neighborhoods.',
    curriculumKey: 'Fire Behavior & WUI Safety',
  },
  {
    id: 'q5_sendai_framework',
    question: 'According to the United Nations Sendai Framework for Disaster Risk Reduction, every $1 invested in pre-disaster mitigation saves approximately how much in emergency recovery costs?',
    options: [
      'Nothing ($0 savings)',
      '$1 to $2',
      '$4 to $7 or more',
      'Exactly $100',
    ],
    correctIndex: 2,
    explanation: 'International disaster economics empirical data shows that every dollar invested in proactive mitigation and resilience saves on average $4 to $7 in emergency response, reconstruction, and business disruption.',
    curriculumKey: 'Sendai Framework & Disaster Economics',
  },
  {
    id: 'q6_hydrograph',
    question: 'What is the primary hydrological effect of an urban retention basin during a flash flood event?',
    options: [
      'It increases peak discharge velocity into downstream rivers',
      'It flattens and delays the peak hydrograph discharge curve by temporarily storing runoff',
      'It prevents clouds from dropping precipitation',
      'It instantly boils floodwater into steam',
    ],
    correctIndex: 1,
    explanation: 'A retention basin acts as a hydrological buffer: it captures peak runoff at the height of a cloudburst and slowly discharges it over hours, preventing riverbanks from overflowing.',
    curriculumKey: 'Hydrology & Watershed Management',
  },
  {
    id: 'q7_p_vs_s_waves',
    question: 'Why do seismic Early Warning Systems rely on detecting P-waves rather than S-waves?',
    options: [
      'P-waves are destructive and cause all building collapses',
      'P-waves travel faster through rock (approx. 6 km/s) than destructive S-waves (approx. 3.5 km/s), providing precious seconds of advance alert',
      'S-waves only travel through air, not rock',
      'P-waves only occur after an earthquake has completely ended',
    ],
    correctIndex: 1,
    explanation: 'Compressional P-waves travel almost twice as fast as shearing S-waves. By detecting harmless P-waves at the epicenter, telemetry networks broadcast alerts before destructive shear waves arrive.',
    curriculumKey: 'Seismology & Early Warning Systems',
  },
];
