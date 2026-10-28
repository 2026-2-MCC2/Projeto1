import { useState } from 'react';
import DataTable from './DataTable.jsx';
import DetailsModal from './DetailsModal.jsx';
import { currency, priceOf } from '../../context/StoreContext.jsx';

export default function OrdersTable({ title = 'Últimos pedidos', orders }) {
  const [selected, setSelected] = useState(null);
  const rows = orders.map((o) => ({ ...o, cliente: o.customer.name, dia: new Date(o.createdAt).toLocaleDateString('pt-BR'), valor: currency(o.total) }));
  const columns = [{ key: 'id', label: 'Pedido' }, { key: 'cliente', label: 'Cliente' }, { key: 'dia', label: 'Data' }, { key: 'status', label: 'Status' }, { key: 'valor', label: 'Valor' }];
  return (
    <>
      <DataTable title={title} columns={columns} rows={rows} statusKey="status" onAction={setSelected} empty="Ainda não há pedidos. Faça uma compra no marketplace para ver os dados aqui." />
      {selected && (
        <DetailsModal title={selected.id} onClose={() => setSelected(null)}
          fields={[['Cliente', selected.customer.name], ['E-mail', selected.customer.email], ['Data', new Date(selected.createdAt).toLocaleString('pt-BR')], ['Total', currency(selected.total)]]}>
          <div className="account-order-items">{selected.items.map((i) => <span key={i.id}>{i.quantity} × {i.nome} — {currency(priceOf(i) * i.quantity)}</span>)}</div>
        </DetailsModal>
      )}
    </>
  );
}
