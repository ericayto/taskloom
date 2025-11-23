import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '../stores/useToastStore'

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-auto"
          >
            <div
              className={`
                min-w-[320px] max-w-md p-4 rounded-xl border backdrop-blur-xl shadow-2xl cursor-pointer
                ${
                  toast.type === 'achievement'
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                    : toast.type === 'success'
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
                      : toast.type === 'error'
                        ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30'
                        : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30'
                }
              `}
              onClick={() => removeToast(toast.id)}
            >
              <div className="flex items-start gap-3">
                {toast.badge && (
                  <div className="text-3xl flex-shrink-0">{toast.badge}</div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-base mb-1">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-white/80 text-sm">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeToast(toast.id)
                  }}
                  className="text-white/60 hover:text-white text-lg leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
