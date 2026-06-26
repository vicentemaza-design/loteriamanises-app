import { useNavigate } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/Button';
import { ProfileSubHeader } from '../components/ProfileSubHeader';

export function AccountDeleteConfirmPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col bg-background pb-20">
      <ProfileSubHeader title="Confirmación de baja" subtitle="Último paso" backTo="/profile/account/delete" />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-[1.6rem] border border-red-100 bg-white p-5 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-center text-xl font-black text-manises-blue">Confirmación de baja de la cuenta</h2>
          <p className="mt-2 rounded-xl bg-red-50 px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-red-500">
            Esta acción es irreversible
          </p>
        </section>

        <section className="rounded-[1.45rem] border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-black text-manises-blue">Ten en cuenta que:</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-slate-600">
            <li>Perderás el acceso a la aplicación.</li>
            <li>Se eliminarán tus datos operativos, saldo e historial conforme al proceso de baja.</li>
            <li>No podrás recuperar esta cuenta ni su información asociada.</li>
          </ul>
        </section>

        <div className="space-y-2">
          <Button
            className="w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              toast.success('Solicitud de baja enviada en demo.');
              navigate('/profile/account');
            }}
          >
            Dar de baja mi cuenta
          </Button>
          <Button variant="outline" className="w-full rounded-xl border-slate-200 text-manises-blue" onClick={() => navigate('/profile/account')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
