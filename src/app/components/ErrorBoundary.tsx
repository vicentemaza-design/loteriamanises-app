import * as React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Red de seguridad raíz: si cualquier componente lanza un error durante el
 * render, evita que la app quede en blanco. Nunca expone el mensaje de
 * error/stack trace al usuario (solo va a console.error, igual que el resto
 * de catch de la app — ver AuthProvider.tsx). No sustituye una manejo de
 * errores específico de cada pantalla, es el último recurso.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // `declare`/typed fields below because this repo has no `@types/react`
  // package installed — `React.Component` resolves to `any` under `tsc`, so
  // `props`/`state` aren't inherited on the type level (they still work
  // correctly at runtime; this only restores type-checking for this file).
  declare props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Error de render capturado por ErrorBoundary:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white p-6 text-center"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-boundary-title"
      >
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 id="error-boundary-title" className="text-xl font-black uppercase tracking-tight text-manises-blue">Algo ha ido mal</h1>
        <p className="mt-2 max-w-70 text-sm font-medium text-muted-foreground">
          Ha ocurrido un problema inesperado. Puedes intentar recargar la aplicación para continuar.
        </p>
        <Button className="mt-8 rounded-xl bg-manises-blue px-8 text-white hover:brightness-110" onClick={this.handleReload}>
          <RotateCw className="mr-2 h-4 w-4" />
          Recargar aplicación
        </Button>
      </div>
    );
  }
}
