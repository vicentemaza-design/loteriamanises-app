import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PremiumTouchInteraction } from '@/shared/components/PremiumTouchInteraction';
import { CompanyAccessCard } from '../components/CompanyAccessCard';
import { CompanyFeaturedProduct } from '../components/CompanyFeaturedProduct';
import {
  COMPANY_DEMO_COLLECTION,
  DEFAULT_COMPANY_DEMO,
  getCompanyDemoByCode,
  normalizeCompanyCode,
} from '../data/company-demo.mock';

export function CompanyLandingPage() {
  const navigate = useNavigate();
  const { code } = useParams<{ code?: string }>();
  const resolvedCompany = useMemo(() => getCompanyDemoByCode(code) ?? DEFAULT_COMPANY_DEMO, [code]);
  const [accessCode, setAccessCode] = useState(resolvedCompany.code);
  const [selectedQuantity, setSelectedQuantity] = useState(resolvedCompany.featuredProduct.quantityOptions[0] ?? 1);

  useEffect(() => {
    setAccessCode(resolvedCompany.code);
    setSelectedQuantity(resolvedCompany.featuredProduct.quantityOptions[0] ?? 1);
  }, [resolvedCompany]);

  const demoLinkLabel = `/company/${resolvedCompany.slug}`;

  const handleOpenDemo = () => {
    const normalizedCode = normalizeCompanyCode(accessCode);
    const nextCompany = getCompanyDemoByCode(normalizedCode);

    if (!nextCompany) {
      toast.error('Código demo no disponible en esta fase.');
      return;
    }

    navigate(`/company/${nextCompany.slug}`);
  };

  const handleOpenLink = () => {
    navigate(`/company/${resolvedCompany.slug}`);
  };

  const handleParticipateDemo = () => {
    toast.success('Demo · participación pendiente de integración.');
    toast.message('No se realizará ninguna compra demo en esta fase.');
  };

  const handleOpenGame = () => {
    navigate(`/play/${resolvedCompany.featuredProduct.gameId}`);
  };

  return (
    <div className="flex min-h-full flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_16%,#f8fafc_100%)] pb-24">
      <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-100 bg-white/82 px-4 backdrop-blur-md">
        <PremiumTouchInteraction scale={0.94}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-manises-blue/80 transition-all hover:bg-slate-100"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </PremiumTouchInteraction>

        <div className="min-w-0">
          <h1 className="text-sm font-black tracking-tight text-manises-blue">
            Empresas y colectivos
          </h1>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Acceso por colectivo
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 px-4 pt-4">
        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(135deg,#0a4792_0%,#153b6f_62%,#1f2937_100%)] px-4 py-4 text-white shadow-[0_16px_38px_rgba(10,71,146,0.22)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/12 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/80">
                  {resolvedCompany.accentLabel}
                </span>
                <span className="rounded-full bg-manises-gold/20 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-manises-gold">
                  Código demo
                </span>
              </div>
              <h2 className="mt-2.5 max-w-[13rem] text-[1.35rem] font-black leading-[1.02] tracking-tight">
                Acceso compacto para colectivos
              </h2>
              <p className="mt-2 max-w-[17rem] text-[11px] font-medium leading-relaxed text-white/72">
                Accede por código o enlace y revisa el producto protagonista del colectivo en una sola vista.
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-white/10">
              <BriefcaseBusiness className="h-5.5 w-5.5 text-manises-gold" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/60">
                Colectivos demo
              </p>
              <p className="mt-1 text-[13px] font-black text-white">
                {COMPANY_DEMO_COLLECTION.length} activos
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-2.5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/60">
                Flujo
              </p>
              <p className="mt-1 text-[13px] font-black text-white">
                Código o enlace
              </p>
            </div>
          </div>
        </section>

        <CompanyAccessCard
          company={resolvedCompany}
          accessCode={accessCode}
          demoLinkLabel={demoLinkLabel}
          onAccessCodeChange={setAccessCode}
          onOpenDemo={handleOpenDemo}
          onOpenLink={handleOpenLink}
        />

        <CompanyFeaturedProduct
          company={resolvedCompany}
          selectedQuantity={selectedQuantity}
          onSelectQuantity={setSelectedQuantity}
          onParticipateDemo={handleParticipateDemo}
          onOpenGame={handleOpenGame}
        />

        <section className="rounded-[1.45rem] border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                Estado demo
              </p>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
                El colectivo, el código, la cantidad y la participación se muestran solo a nivel visual. No hay validación de acceso, stock, reserva ni compra en esta fase.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
