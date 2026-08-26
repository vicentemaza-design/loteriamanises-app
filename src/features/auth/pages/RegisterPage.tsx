import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  Clock,
  BadgePercent,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Phone,
  Calendar,
  IdCard,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useNavigate } from 'react-router-dom';
import { AuthScreenShell } from '@/features/auth/components/AuthScreenShell';
import { PasswordRequirementsList } from '@/features/auth/components/PasswordRequirementsList';
import { isValidEmail } from '@/features/auth/lib/authValidation';
import { isPasswordValid } from '@/features/auth/lib/passwordRules';
import {
  hasValidDocumentFormat,
  isAdult,
  isValidDocumentNumber,
  isValidPhone,
  normalizeDocumentNumber,
  passwordsMatch,
} from '@/features/auth/lib/registerValidation';
import type { DocumentType, RegisterInput } from '@/services/api/contracts/auth.contracts';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const TRUST_BADGES = [
  { icon: Shield,      label: 'Juego Seguro' },
  { icon: Clock,       label: 'Soporte 24h' },
  { icon: BadgePercent,label: '0 Comisiones' },
];

type RegisterStep = 'access' | 'personal' | 'compliance';

const STEPS: { key: RegisterStep; label: string }[] = [
  { key: 'access', label: 'Acceso' },
  { key: 'personal', label: 'Datos' },
  { key: 'compliance', label: 'Condiciones' },
];

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  NIF: 'NIF',
  NIE: 'NIE',
  PASSPORT: 'Pasaporte',
};

const TODAY_ISO = new Date().toISOString().slice(0, 10);

type FieldErrors = Partial<Record<
  'email' | 'password' | 'repeatPassword' | 'firstName' | 'lastName' | 'documentNumber' | 'birthDate' | 'phone' | 'acceptTerms',
  string
>>;

export function RegisterPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { status: registerStatus, errorMessage: registerError, register } = useRegister();

  const [step, setStep] = useState<RegisterStep>('access');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Paso 1 — Acceso
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Paso 2 — Datos personales
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('NIF');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');

  // Paso 3 — Condiciones
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isSubmitting = registerStatus === 'submitting';

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep1 = (): boolean => {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'El email es obligatorio.';
    else if (!isValidEmail(email)) next.email = 'Introduce un email válido.';

    if (!password) next.password = 'La contraseña es obligatoria.';
    else if (!isPasswordValid(password)) next.password = 'La contraseña no cumple todos los requisitos.';

    if (!repeatPassword) next.repeatPassword = 'Repite la contraseña.';
    else if (!passwordsMatch(password, repeatPassword)) next.repeatPassword = 'Las contraseñas no coinciden.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = 'El nombre es obligatorio.';
    if (!lastName.trim()) next.lastName = 'Los apellidos son obligatorios.';

    if (!documentNumber.trim()) next.documentNumber = 'El número de documento es obligatorio.';
    // NIF con formato correcto (8 dígitos + letra) pero letra de control
    // incorrecta: mensaje específico. NIE/PASAPORTE nunca pasan por aquí,
    // solo verifican formato (isValidDocumentNumber === hasValidDocumentFormat
    // para esos dos tipos).
    else if (documentType === 'NIF' && hasValidDocumentFormat('NIF', documentNumber) && !isValidDocumentNumber('NIF', documentNumber)) {
      next.documentNumber = 'NIF no válido';
    }
    else if (!isValidDocumentNumber(documentType, documentNumber)) next.documentNumber = 'Formato de documento no válido.';

    if (!birthDate) next.birthDate = 'La fecha de nacimiento es obligatoria.';
    else if (!isAdult(birthDate)) next.birthDate = 'Debes ser mayor de 18 años para registrarte.';

    if (!phone.trim()) next.phone = 'El teléfono es obligatorio.';
    else if (!isValidPhone(phone)) next.phone = 'Introduce un teléfono válido.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep3 = (): boolean => {
    const next: FieldErrors = {};
    if (!acceptTerms) next.acceptTerms = 'Debes aceptar las condiciones para continuar.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (step === 'access' && validateStep1()) setStep('personal');
    else if (step === 'personal' && validateStep2()) setStep('compliance');
  };

  const goBack = () => {
    setErrors({});
    if (step === 'personal') setStep('access');
    else if (step === 'compliance') setStep('personal');
    else navigate('/login');
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    const input: RegisterInput = {
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      documentType,
      documentNumber: normalizeDocumentNumber(documentNumber),
      birthDate,
      phone: phone.trim(),
      acceptTerms,
      acceptMarketing,
    };

    const result = await register(input);
    if (result) {
      navigate('/register/verify-email', { state: { email: input.email }, replace: true });
    }
  };

  const handleGoogle = async () => {
    if (!acceptTerms) {
      setErrors({ acceptTerms: 'Debes aceptar las condiciones para continuar.' });
      return;
    }
    setIsGoogleLoading(true);
    try {
      const success = await signInWithGoogle();
      if (success) {
        navigate('/home', { replace: true });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthScreenShell contentClassName="gap-5 pt-12">
      <motion.div className="flex min-h-max flex-col items-center justify-start gap-5">

        <div className="w-full max-w-sm flex flex-col items-center gap-8 px-1">
          <motion.button
            onClick={goBack}
            className="self-start flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Volver</span>
          </motion.button>

          <motion.div className="flex flex-col items-center gap-3">
            <motion.img
              src="/assets/branding/logo-white.png"
              alt="Lotería Manises"
              className="h-12 w-auto"
            />
            <p className="text-manises-gold text-[9px] font-black uppercase tracking-[0.4em]">Administración nº 3</p>
          </motion.div>
        </div>

        <motion.div className="text-center space-y-1">
          <h1 className="text-white text-2xl font-black tracking-tight">Crea tu cuenta</h1>
          <p className="text-white/40 text-xs font-medium">
            Registro seguro para jugadores mayores de 18 años
          </p>
        </motion.div>

        <motion.div className="w-full max-w-sm shrink-0">
          <motion.div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">

            {/* Indicador de pasos */}
            <div className="flex items-center justify-between mb-5 px-1">
              {STEPS.map((item, index) => {
                const currentIndex = STEPS.findIndex((s) => s.key === step);
                const isDone = index < currentIndex;
                const isActive = step === item.key;
                return (
                  <div key={item.key} className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-wider">
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-manises-gold shrink-0" aria-hidden="true" />
                    ) : (
                      <Circle className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-white/30'}`} aria-hidden="true" />
                    )}
                    <span className={isActive ? 'text-white' : 'text-white/40'}>
                      {index + 1}. {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ═══════════════════ PASO 1 — ACCESO ═══════════════════ */}
            {step === 'access' && (
              <>
                <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-white/75">
                    El alta te llevará menos de 2 minutos. La verificación de identidad será necesaria para retiradas.
                  </p>
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); goNext(); }}
                  className="space-y-3.5"
                  noValidate
                >
                  <div>
                    <label htmlFor="reg-email" className="sr-only">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'reg-email-error' : undefined}
                        className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                      />
                    </div>
                    {errors.email && <p id="reg-email-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="sr-only">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                      <Input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crea una contraseña"
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? 'reg-password-error' : undefined}
                        className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manises-gold/40"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    </div>
                    <PasswordRequirementsList password={password} />
                    {errors.password && <p id="reg-password-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="reg-repeat-password" className="sr-only">Repetir contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                      <Input
                        id="reg-repeat-password"
                        type={showRepeatPassword ? 'text' : 'password'}
                        placeholder="Repite la contraseña"
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.repeatPassword)}
                        aria-describedby={errors.repeatPassword ? 'reg-repeat-password-error' : undefined}
                        className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                        value={repeatPassword}
                        onChange={(e) => { setRepeatPassword(e.target.value); clearError('repeatPassword'); }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRepeatPassword((prev) => !prev)}
                        aria-label={showRepeatPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manises-gold/40"
                      >
                        {showRepeatPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    </div>
                    {errors.repeatPassword && <p id="reg-repeat-password-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.repeatPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-manises-gold text-manises-blue font-black rounded-xl shadow-gold hover:opacity-90 transition-all"
                  >
                    Continuar
                  </Button>
                </form>
              </>
            )}

            {/* ═══════════════════ PASO 2 — DATOS PERSONALES ═══════════════════ */}
            {step === 'personal' && (
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="reg-firstName" className="sr-only">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                    <Input
                      id="reg-firstName"
                      placeholder="Nombre"
                      autoComplete="given-name"
                      aria-invalid={Boolean(errors.firstName)}
                      aria-describedby={errors.firstName ? 'reg-firstName-error' : undefined}
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
                    />
                  </div>
                  {errors.firstName && <p id="reg-firstName-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="reg-lastName" className="sr-only">Apellidos</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                    <Input
                      id="reg-lastName"
                      placeholder="Apellidos"
                      autoComplete="family-name"
                      aria-invalid={Boolean(errors.lastName)}
                      aria-describedby={errors.lastName ? 'reg-lastName-error' : undefined}
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
                    />
                  </div>
                  {errors.lastName && <p id="reg-lastName-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.lastName}</p>}
                </div>

                <fieldset>
                  <legend className="text-[10px] font-black text-white/40 uppercase tracking-[0.15em] mb-2">Tipo de documento</legend>
                  <div className="flex gap-2">
                    {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
                      <label
                        key={type}
                        className={`flex-1 text-center cursor-pointer rounded-xl border px-2 py-2.5 text-[12px] font-bold transition-colors ${
                          documentType === type ? 'border-manises-gold/60 bg-manises-gold/10 text-white' : 'border-white/10 bg-white/5 text-white/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="documentType"
                          value={type}
                          checked={documentType === type}
                          onChange={() => { setDocumentType(type); clearError('documentNumber'); }}
                          className="sr-only"
                        />
                        {DOCUMENT_TYPE_LABELS[type]}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="reg-documentNumber" className="sr-only">Número de documento</label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                    <Input
                      id="reg-documentNumber"
                      placeholder={documentType === 'PASSPORT' ? 'Número de pasaporte' : `Número de ${documentType}`}
                      autoComplete="off"
                      aria-invalid={Boolean(errors.documentNumber)}
                      aria-describedby={errors.documentNumber ? 'reg-documentNumber-error' : undefined}
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                      value={documentNumber}
                      onChange={(e) => { setDocumentNumber(e.target.value); clearError('documentNumber'); }}
                    />
                  </div>
                  {errors.documentNumber && <p id="reg-documentNumber-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.documentNumber}</p>}
                </div>

                <div className="min-w-0">
                  <label htmlFor="reg-birthDate" className="sr-only">Fecha de nacimiento</label>
                  <div className="relative min-w-0">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                    <Input
                      id="reg-birthDate"
                      type="date"
                      max={TODAY_ISO}
                      autoComplete="bday"
                      aria-invalid={Boolean(errors.birthDate)}
                      aria-describedby={errors.birthDate ? 'reg-birthDate-error' : undefined}
                      // min-w-0 + max-w-full: un <input type="date"> es un
                      // elemento reemplazado cuyo ancho intrínseco (nativo)
                      // puede ignorar el w-full heredado, especialmente en
                      // iOS Safari. text-base (16px): por debajo de 16px,
                      // iOS Safari hace zoom automático de toda la página al
                      // enfocar el campo — eso es lo que se percibe como "el
                      // módulo crece y se sale de los márgenes" al interactuar.
                      className="pl-11 h-12 w-full min-w-0 max-w-full box-border bg-white/5 border-white/10 text-white text-base placeholder:text-white/20 rounded-xl focus:ring-manises-gold [color-scheme:dark]"
                      value={birthDate}
                      onChange={(e) => { setBirthDate(e.target.value); clearError('birthDate'); }}
                    />
                  </div>
                  {errors.birthDate && <p id="reg-birthDate-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.birthDate}</p>}
                </div>

                <div>
                  <label htmlFor="reg-phone" className="sr-only">Teléfono móvil</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" aria-hidden="true" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="Teléfono móvil"
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:ring-manises-gold"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                    />
                  </div>
                  {errors.phone && <p id="reg-phone-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1 pl-1">{errors.phone}</p>}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="flex-1 h-11 border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    onClick={goNext}
                    className="flex-1 h-11 bg-manises-gold text-manises-blue font-black rounded-xl shadow-gold"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* ═══════════════════ PASO 3 — CONDICIONES ═══════════════════ */}
            {step === 'compliance' && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-[11px] font-semibold text-white/75">
                    Para activar tu cuenta de juego necesitamos esta confirmación legal.
                  </p>
                </div>

                <div className={`rounded-xl border px-3 py-3 transition-colors ${
                  errors.acceptTerms ? 'border-red-400/50 bg-red-400/5' : acceptTerms ? 'border-manises-gold/60 bg-manises-gold/10' : 'border-white/10 bg-white/5'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => { setAcceptTerms(e.target.checked); clearError('acceptTerms'); }}
                      aria-required="true"
                      aria-invalid={Boolean(errors.acceptTerms)}
                      aria-describedby={`accept-terms-text${errors.acceptTerms ? ' accept-terms-error' : ''}`}
                      className="mt-0.5 h-4 w-4 rounded accent-manises-gold shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manises-gold/50"
                    />
                    <p id="accept-terms-text" className="text-[12px] font-semibold text-white/80 leading-snug">
                      Confirmo que he leído y acepto las{' '}
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate('/legal/condiciones')}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/legal/condiciones'); }}
                        className="text-manises-gold underline underline-offset-2 cursor-pointer"
                      >
                        Condiciones Generales
                      </span>
                      , los{' '}
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate('/legal/condiciones')}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/legal/condiciones'); }}
                        className="text-manises-gold underline underline-offset-2 cursor-pointer"
                      >
                        Términos de Uso
                      </span>{' '}
                      y la{' '}
                      <span
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate('/legal/privacidad')}
                        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/legal/privacidad'); }}
                        className="text-manises-gold underline underline-offset-2 cursor-pointer"
                      >
                        Política de Privacidad
                      </span>
                      .
                    </p>
                  </div>
                  {errors.acceptTerms && <p id="accept-terms-error" role="alert" className="text-[11px] text-red-300 font-semibold mt-1.5 pl-7">{errors.acceptTerms}</p>}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <div className="flex items-start gap-3">
                    <input
                      id="accept-marketing"
                      type="checkbox"
                      checked={acceptMarketing}
                      onChange={(e) => setAcceptMarketing(e.target.checked)}
                      aria-describedby="accept-marketing-text"
                      className="mt-0.5 h-4 w-4 rounded accent-manises-gold shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manises-gold/50"
                    />
                    <p id="accept-marketing-text" className="text-[12px] font-semibold text-white/60 leading-snug">
                      Quiero recibir por email novedades, promociones, información sobre sorteos y otras comunicaciones comerciales.
                    </p>
                  </div>
                </div>

                {registerStatus === 'error' && registerError && (
                  <div role="alert" aria-live="polite" className="rounded-xl border border-red-400/40 bg-red-400/10 px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-red-100">{registerError}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={isSubmitting}
                    className="flex-1 h-11 border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    disabled={!acceptTerms || isSubmitting}
                    onClick={handleSubmit}
                    className="flex-1 h-11 bg-manises-gold text-manises-blue font-black rounded-xl shadow-gold disabled:opacity-40"
                  >
                    {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                </div>

                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">o continuar con</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <Button
                  onClick={handleGoogle}
                  disabled={isGoogleLoading || !acceptTerms}
                  className="w-full h-12 bg-white text-manises-blue hover:bg-white/90 font-black rounded-xl flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-[0.98] disabled:opacity-40"
                >
                  <GoogleIcon />
                  <span>{isGoogleLoading ? 'Conectando...' : 'Continuar con Google'}</span>
                </Button>
              </div>
            )}

            <p className="text-center text-[11px] text-white/40 mt-6 font-medium">
              Si ya tienes cuenta,{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-manises-gold font-black hover:underline"
              >
                Identifícate
              </button>
            </p>
          </motion.div>
        </motion.div>

        <motion.div className="mt-auto flex justify-center gap-6 pt-2">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              className="flex flex-col items-center gap-1.5 opacity-30"
            >
              <Icon className="w-4 h-4 text-white" aria-hidden="true" />
              <span className="text-[8px] font-black text-white uppercase tracking-widest">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex flex-col items-center gap-3 px-4 opacity-30 mt-2">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <button onClick={() => navigate('/legal/condiciones')} className="text-[9px] font-bold uppercase tracking-wider hover:text-white transition-colors">Términos</button>
            <span className="text-[8px]">•</span>
            <button onClick={() => navigate('/legal/privacidad')} className="text-[9px] font-bold uppercase tracking-wider hover:text-white transition-colors">Privacidad</button>
            <span className="text-[8px]">•</span>
            <button onClick={() => navigate('/legal/juego-responsable')} className="text-[9px] font-bold uppercase tracking-wider hover:text-white transition-colors">Juego responsable</button>
            <span className="text-[8px]">•</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">+18</span>
          </div>
          <p className="text-[9px] font-medium italic text-center leading-tight">
            Juega con responsabilidad. Prohibido a menores de 18 años.
          </p>
        </div>
      </motion.div>
    </AuthScreenShell>
  );
}
