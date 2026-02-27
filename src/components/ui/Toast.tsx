import { ToastItem } from '../../hooks/useToast';

const typeStyles: Record<ToastItem['type'], string> = {
  success: 'bg-green-600 text-white',
  info: 'bg-indigo-600 text-white',
  warning: 'bg-amber-500 text-white',
};

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  return (
    <div
      className={`px-4 py-2 rounded-xl shadow-lg text-sm font-medium cursor-pointer select-none ${typeStyles[toast.type]}`}
      onClick={() => onDismiss(toast.id)}
    >
      {toast.message}
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none w-full px-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
