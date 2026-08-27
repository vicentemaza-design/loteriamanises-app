if (new URLSearchParams(window.location.search).get('viewportDebug') === '1') {
  void import('./viewport-diagnostic');
}
