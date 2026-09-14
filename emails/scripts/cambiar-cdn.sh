#!/bin/sh
# Cambia el dominio desde el que las plantillas cargan las imágenes.
#
#   ./cambiar-cdn.sh https://assets.ejemplo.com/correos/
#
# Solo hace falta si NO vais a servir las imágenes desde
# https://cdn.loteriamanises.com/emails/ , que es lo que traen por defecto.
# Reescribe las 34 plantillas y las 3 compartidas. Idempotente.

set -eu
NUEVA="${1:-}"
ACTUAL="https://cdn.loteriamanises.com/emails/"

if [ -z "$NUEVA" ]; then
  echo "Uso: $0 <URL-base-nueva>"
  echo "Ejemplo: $0 https://assets.ejemplo.com/correos/"
  echo
  echo "La URL debe terminar en /"
  exit 1
fi
case "$NUEVA" in */) ;; *) NUEVA="$NUEVA/" ;; esac

DIR="$(cd "$(dirname "$0")" && pwd)/templates"
N=0
for f in "$DIR"/*.html "$DIR"/shared/*.html; do
  [ -f "$f" ] || continue
  if grep -q "$ACTUAL" "$f"; then
    sed "s|$ACTUAL|$NUEVA|g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
    N=$((N+1))
  fi
done

echo "Reescritas $N plantillas."
echo "Ahora las imágenes se cargan desde: $NUEVA"
echo
echo "Comprobación:"
grep -ho 'https://[^"]*/' "$DIR"/*.html "$DIR"/shared/*.html 2>/dev/null \
  | sort -u | head -5 | sed 's/^/  /'
