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

export function getTestTypeLabel(testType: string | number): string {
  // Handle numeric values from backend (1=SPIRAL, 2=VOICE)
  if (testType === 1 || testType === '1') return 'Espiral';
  if (testType === 2 || testType === '2') return 'Voz';

  // Handle string values
  const labels: Record<string, string> = {
    'SPIRAL_TEST': 'Espiral',
    'VOICE_TEST': 'Voz',
    'spiral': 'Espiral',
    'voice': 'Voz',
  };
  return labels[testType as string] || String(testType);
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

export function getSpiralMethodLabel(method: string | number): string {
  // Handle numeric values from backend (1=PAPER, 2=WEBCAM)
  if (method === 1 || method === '1') return 'Papel';
  if (method === 2 || method === '2') return 'Webcam';

  // Handle string values
  const labels: Record<string, string> = {
    'PAPER': 'Papel',
    'WEBCAM': 'Webcam',
    'paper': 'Papel',
    'webcam': 'Webcam',
  };
  return labels[method as string] || String(method);
}
