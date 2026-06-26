import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, Lock, WalletCards } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { ProfileSubHeader } from '../components/ProfileSubHeader';

export function AccountDeleteInfoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Dar de baja la cuenta" subtitle="Información previa" backTo="/profile/account" />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-[1.6rem] border border-slate-100 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-black text-manises-blue">La baja de la cuenta es permanente</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
            Antes de continuar, revisa qué implica cerrar tu acceso a la aplicación y a tu historial de usuario.
          </p>
        </section>

        {[
          { icon: Lock, title: 'No podrás acceder nuevamente con esta cuenta.' },
          { icon: FileText, title: 'El historial de pedidos y movimientos dejará de estar disponible.' },
          { icon: WalletCards, title: 'El saldo pendiente se revisará y devolverá conforme al proceso interno.' },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-manises-blue">
              <item.icon className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm font-semibold leading-relaxed text-slate-600">{item.title}</p>
          </div>
        ))}

        <div className="space-y-2">
          <Button className="w-full rounded-xl bg-manises-blue text-white" onClick={() => navigate('/profile/account/delete/confirm')}>
            Continuar
          </Button>
          <Button variant="outline" className="w-full rounded-xl border-slate-200 text-manises-blue" onClick={() => navigate('/profile/account')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
