export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatWeight(weightKg: number): string {
  if (weightKg >= 1000) {
    const tons = (weightKg / 1000).toFixed(1).replace(/\.0$/, '');
    return `${tons} Tons (${weightKg.toLocaleString()} Kg)`;
  }
  return `${weightKg.toLocaleString()} Kg`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getMatchScoreClass(score: number): { badgeClass: string; textClass: string; label: string } {
  if (score >= 90) {
    return { badgeClass: 'match-high', textClass: 'text-teal', label: 'Excellent Match' };
  } else if (score >= 75) {
    return { badgeClass: 'match-mid', textClass: 'text-amber', label: 'Good Match' };
  } else {
    return { badgeClass: 'match-low', textClass: 'text-gray', label: 'Partial Match' };
  }
}
