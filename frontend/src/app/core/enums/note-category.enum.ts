export enum NoteCategory {
  OBSERVATION = 'OBSERVATION',
  RECOMMENDATION = 'RECOMMENDATION',
  ALERT = 'ALERT',
}

export const NoteCategoryLabels: Record<NoteCategory, string> = {
  [NoteCategory.OBSERVATION]: 'Observação',
  [NoteCategory.RECOMMENDATION]: 'Recomendação',
  [NoteCategory.ALERT]: 'Alerta',
};

export const NoteCategoryColors: Record<
  NoteCategory,
  { bg: string; text: string; border: string }
> = {
  [NoteCategory.OBSERVATION]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  [NoteCategory.RECOMMENDATION]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  [NoteCategory.ALERT]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};
