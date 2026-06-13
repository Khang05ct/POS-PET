import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (dateString, formatStr = 'dd/MM/yyyy HH:mm') => {
  if (!dateString) return '';
  return format(new Date(dateString), formatStr, { locale: vi });
};
