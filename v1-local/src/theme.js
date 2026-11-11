// Couleurs et libellés utilisés partout dans l'application.

export const COLORS = {
  primary: '#1E6FE8', // bleu
  success: '#2E9E4F', // vert
  danger: '#E53935', // rouge
  warning: '#F5A623', // orange
  background: '#F5F7FB',
  white: '#FFFFFF',
  text: '#1A1A1A',
  grey: '#7A7A7A',
  border: '#E3E6EC',
};

// Les 3 priorités possibles d'une tâche
export const PRIORITIES = {
  faible: { label: 'Faible', color: COLORS.success, bg: '#E6F6EB' },
  moyenne: { label: 'Moyenne', color: COLORS.warning, bg: '#FFF4E0' },
  elevee: { label: 'Élevée', color: COLORS.danger, bg: '#FDE7E7' },
};

// Les 2 statuts possibles d'une tâche
export const STATUSES = {
  a_faire: { label: 'À faire', color: COLORS.primary, bg: '#E7F0FD' },
  terminee: { label: 'Terminée', color: COLORS.success, bg: '#E6F6EB' },
};
