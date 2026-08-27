import { isViewportDiagnosticEnabled } from './viewport-diagnostic-mode';

if (isViewportDiagnosticEnabled()) {
  void import('./viewport-diagnostic');
}
