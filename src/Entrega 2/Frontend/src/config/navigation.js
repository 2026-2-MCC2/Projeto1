import { BarChart3, CalendarDays, CircleHelp, ClipboardList, LayoutDashboard } from 'lucide-react';

const montar = (base, extras) => [
  ['Dashboard', `${base}/dashboard`, LayoutDashboard],
  ...extras,
  ['Análise', `${base}/analise`, BarChart3],
  ['Suporte', `${base}/suporte`, CircleHelp],
];

export const roles = {
  admin: {
    label: 'Administrador', base: '/admin',
    menu: montar('/admin', [['Solicitações', '/admin/solicitacoes', ClipboardList]]),
  },
  fornecedor: {
    label: 'Fornecedor', base: '/fornecedor',
    menu: montar('/fornecedor', [['Eventos', '/fornecedor/eventos', CalendarDays], ['Minhas Solicitações', '/fornecedor/solicitacoes', ClipboardList]]),
  },
  organizador: {
    label: 'Organizador', base: '/organizador',
    menu: montar('/organizador', [['Eventos', '/organizador/eventos', CalendarDays], ['Minhas Solicitações', '/organizador/solicitacoes', ClipboardList]]),
  },
};
