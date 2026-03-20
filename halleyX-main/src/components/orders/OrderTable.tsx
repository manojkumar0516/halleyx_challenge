import React, { useState } from 'react';
import { useStore } from '../../store';
import { Button, Modal } from '../ui';
import { OrderForm } from './OrderForm';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

export function OrderTable() {
  const { orders, deleteOrder } = useStore();
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingOrderId(id);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrder(id);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 gap-4 sm:gap-0">
        <h2 className="text-lg font-semibold text-slate-800">Customer Orders</h2>
        <Button className="w-full sm:w-auto" onClick={() => { setEditingOrderId(null); setIsFormOpen(true); }}>
          Create Order
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Qty</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created By</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No orders found. Click "Create Order" to add one.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{order.customerName}</div>
                    <div className="text-slate-500 text-xs">{order.email}</div>
                  </td>
                  <td className="px-6 py-4">{order.product}</td>
                  <td className="px-6 py-4">{Number(order.quantity)}</td>
                  <td className="px-6 py-4">${Number(order.totalAmount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 
                        order.status === 'In progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-amber-100 text-amber-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{order.createdBy}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                      className="p-1 rounded-md hover:bg-slate-200 text-slate-500"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {openMenuId === order.id && (
                      <div className="absolute right-8 top-4 w-32 bg-white rounded-md shadow-lg border border-slate-200 z-10 py-1">
                        <button
                          onClick={() => handleEdit(order.id)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingOrderId ? 'Edit Order' : 'Create Order'}
      >
        <OrderForm onClose={() => setIsFormOpen(false)} orderId={editingOrderId || undefined} />
      </Modal>
    </div>
  );
}
