/**
 * Textes de consentement pour les différents services esthétiques
 * Extraits des formulaires papier
 */

export const MICRODERMABRASION_CONSENT = {
  title: "Formulaire de consentement - Traitement de microdermabrasion",
  sections: [
    {
      title: "Soins post-traitement",
      content: [
        "Certaines raideurs peuvent apparaître, rougeurs et infiltres sensibles (couées ou gonflées), persistent jusqu'à",
        "3 jours maximum pendant que la peau se guérit elle même des contraintes apportées au",
        "moins, un gel d'Aloès ou Gel Torque de la ligne Oxygen Botanicals doit être au",
        "Ne pas retirer manuellement les peaux sèches pelar traitement, elles envolent d'elles-mêmes",
        "Évitez d'agresser la zone traitée, friction, bains chauds, piscine spa etc... jusqu'à disparition des",
        "rougeurs, il est recommandé pour un traitement au niveau du visage d'attendre 4 heures avant",
        "d'appliquer un maquillage.",
      ]
    },
    {
      title: "Recommandations",
      content: [
        "Dans les 7 jours suivants votre traitement, il est découllé d'utilise une méthode épilation (cire,",
        "sucre pince, électrolyse, crème découtants ou crème décapantant à la région traitée.",
        "Il est déconseillé de recevoir un traitement d'exfoliation ou de peeling chimique dans les 7 à 10 ",
        "jours suivante la séance.",
        "Entier toute exposition solaire de traitement ou de micro-démabrasion, Vous devez obligatoirement protéger votre région traitée.",
        "Vous devez être à l'application de Rétin-A ou de crème à base d'acide glycolique pour les 7",
        "jours suivants le traitement.",
      ]
    },
    {
      title: "Pour toutes questions ou inquiétudes, veuillez contacter votre centre de traitement.",
      content: []
    }
  ],
  agreement: "Je soussigné(e), __ [NOM CLIENT] __, reconnais formellement que le technique démabrale a été, j'ai compris les risques, les limitations et les enjeux, les contraintes et les eventuelles complications de ce traitement.",
  signatures: {
    client: "Signature du client : ____________________",
    date: "Date : ____________________",
    estheticienne: "Signature de l'esthéticienne : ____________________"
  },
  contraindications: {
    title: "Contre-indications :",
    items: [
      "Lésions non diagnostiquées",
      "Lésions herpes récurrentes",
      "Veruca",
      "Couperose importante de système immunataire",
      "Diabètes non stabilisés",
      "Grossesse",
      "Cicatrices récentes (Stable 6-8-4)"
    ]
  }
};

export const IPL_CONSENT = {
  title: "Consentement à la Procédure d'ou Traitement - Traitement IPL avec Venus Versa IPL (Épilation à la lumière Intense Pulsée)",
  introduction: `J'ai reçu l'information/conformément écrite suivant pour:

Je reconnais qu'on cours de la procédure/traitement des conditions implévisées peuvent necessaire des procédures
différentes ou additionnelles, J'ai compris que mon médecin, Mon consentement consent au présent formulaire ne
s'étend d'autres procédurs qui suit ont été expliqués et dont je est jugement professionnel nécessaire et déscribble dans l'exercice de sont jugement professionnel qui peut etre obtenues.`,
  procedures: [
    "Je reconnais qu'aucune garantie n'a été donnée quant aux resultats qui peuvent être obtenue.",
    "Dans le cadre des experiences de __ [NOM] __,mon dossier peut être soumis à un examen pour prix par pour le converte de la qualité",
    "Je reconnais et consent à la télédiffusion ou la téléphotographie, y compris de photographie en prises crinque qui des un merite de des",
    "Je consens à la photographie ou la télédiffusion de procedures effectuées, y compris les pitures du visage, à des fins des mesures critiques, photo et documents peut être utilisées pour des finalités médicales, publicitéss ou des interactions publiques sans que le permis ou la procédure à nia satisfaction.",
    "Ces fins de clinication médicale, Je consents à transmission close avoirs dans la salle de traitement.",
  ],
  acknowledgment: [
    "Je comprends de la signature du Lemon (s'il/un non médecin), Sur ce document indique seulement que la signature",
    "J'ai compris et que je suis à déposé sélectionner fourni informations sur le procédure.",
    "L'ai été explicué par mon médecin/sous assistants d'une manière que je comprends:",
  ],
  statement: "Je consens à la procédure d'ou traitement et elles articles mentionnée ci-dessus (ssi).",
  signatures: {
    patient: "Signature Autoncica et Signé pour le patient : ____________________",
    clientName: "Nom en lettres moulées : ____________________",
    representative: "Parent ou la personne Autorisa si Patient Minor: ____________________",
    venus: "Venus Versa – Épilation à la Lumière intense Pulsée"
  }
};

export const IPL_INFORMATION = {
  introduction: {
    title: "INTRODUCTION",
    content: `Les poils peuvent voir naisse et peur dans n'importe qu'elle région du corps chez l'homme et la femme. Bien que dans la plupart des cas, les poils qui prise en abondante ne présentent pas de problèmes de sante, ils peuvent être socialement inacceptables et une source d'embarras psychologique. La plupart les tentatives d'épilation traditionnelles sont à long terme, chronophages et temporaries de nature, et peuvent naistre à une repousse et folliculaire. Lequel des méthodes d'épilation traditionnelles ne donne generalement pas de solution permanentes à un problèmes de pilosité excessive. Le traitement proposé consiste en l'utilise de lumière pour réduire sélectivement la pilosité sans endommager les tissus environnants.`
  },
  // ... (les autres sections si nécessaire)
};

export const MANICURE_PEDICURE_QUESTIONS = [
  {
    question: "Avez-vous des problèmes de circulation?",
    type: "yes_no"
  },
  {
    question: "Avez-vous du diabète?",
    type: "yes_no"
  },
  {
    question: "Prenez-vous des médicaments régulièrement? Si oui, lesquels?",
    type: "text"
  },
  {
    question: "Avez-vous des allergies?",
    type: "yes_no"
  },
  {
    question: "Avez-vous des verrues plantaires ou des champignons aux pieds?",
    type: "yes_no"
  }
];

export const MANICURE_PEDICURE_CONSENT = {
  title: "Formulaire de consentement - Soins Manicure / Pédicure",
  introduction: `En acceptant ce traitement de manicure/pédicure, je reconnais avoir fourni des informations complètes et exactes concernant mon état de santé, mes allergies et mes conditions médicales.`,
  sections: [
    {
      title: "Soins et précautions",
      content: [
        "Les soins de manicure et pédicure peuvent inclure le limage, le polissage et le traitement des ongles et de la peau environnante.",
        "Des produits cosmétiques seront appliqués sur vos ongles et votre peau.",
        "Si vous avez des allergies connues à certains produits, veuillez en informer votre technicienne immédiatement.",
        "Toute irritation, rougeur ou inconfort doit être signalé pendant le traitement."
      ]
    },
    {
      title: "Contre-indications et risques",
      content: [
        "Les personnes diabétiques doivent consulter leur médecin avant tout traitement de pédicure.",
        "Les problèmes de circulation peuvent nécessiter des précautions supplémentaires.",
        "Les infections fongiques ou verrues plantaires doivent être traitées médicalement avant le service.",
        "Des réactions allergiques aux produits utilisés sont possibles."
      ]
    },
    {
      title: "Responsabilités du client",
      content: [
        "Informer la technicienne de tout changement dans votre état de santé.",
        "Signaler immédiatement tout inconfort ou réaction pendant le traitement.",
        "Suivre les recommandations post-traitement pour maintenir la santé de vos ongles.",
        "Ne pas utiliser les services si vous avez des plaies ouvertes ou infections actives."
      ]
    }
  ],
  agreement: "Je soussigné(e), __ [NOM CLIENT] __, reconnais avoir lu et compris les informations ci-dessus. J'accepte de recevoir les soins de manicure/pédicure et je dégage le salon et ses employés de toute responsabilité en cas de réaction imprévue, à condition que tous les protocoles de sécurité et d'hygiène aient été respectés.",
  signatures: {
    client: "Signature du client : ____________________",
    date: "Date : ____________________",
    technician: "Signature de la technicienne : ____________________"
  }
};
