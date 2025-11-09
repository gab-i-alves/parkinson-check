/**
 * Shared display helper functions for dashboard components
 */

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getTestTypeLabel(testType: string): string {
  const labels: Record<string, string> = {
    'SPIRAL_TEST': 'Espiral',
    'VOICE_TEST': 'Voz',
    'spiral': 'Espiral',
    'voice': 'Voz',
  };
  return labels[testType] || testType;
}

export function getClassificationLabel(classification: string): string {
  const labels: Record<string, string> = {
    'HEALTHY': 'Saudável',
    'PARKINSON': 'Parkinson',
  };
  return labels[classification] || classification;
}

export function getClassificationColor(classification: string): string {
  const colors: Record<string, string> = {
    'HEALTHY': 'text-green-600',
    'PARKINSON': 'text-red-600',
  };
  return colors[classification] || 'text-gray-600';
}

export function getClassificationBgColor(classification: string): string {
  const colors: Record<string, string> = {
    'HEALTHY': 'bg-green-100',
    'PARKINSON': 'bg-red-100',
  };
  return colors[classification] || 'bg-gray-100';
}

export function formatScore(score: number | null): string {
  if (score === null || score === undefined) return 'N/A';
  return (score * 100).toFixed(1);
}

export function getTrendIcon(trend: string): string {
  const icons: Record<string, string> = {
    'improving': '↑',
    'stable': '→',
    'worsening': '↓',
  };
  return icons[trend] || '•';
}

export function getTrendColor(trend: string): string {
  const colors: Record<string, string> = {
    'improving': 'text-green-600',
    'stable': 'text-yellow-600',
    'worsening': 'text-red-600',
  };
  return colors[trend] || 'text-gray-600';
}

export function getTrendLabel(trend: string): string {
  const labels: Record<string, string> = {
    'improving': 'Melhorando',
    'stable': 'Estável',
    'worsening': 'Piorando',
  };
  return labels[trend] || trend;
}
