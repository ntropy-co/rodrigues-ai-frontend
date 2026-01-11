#!/bin/bash
# Script para sincronizar branch master local com remote

cd "$(dirname "$0")"

echo "🔄 Sincronizando branch master com origin/master..."

# Verificar se está na branch master
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  Não está na branch master. Fazendo checkout para master..."
    git checkout master
fi

# Fazer fetch do remote
echo "📥 Fazendo fetch do remote..."
git fetch origin

# Verificar diferenças antes de sobrescrever
echo ""
echo "📊 Comparando branches:"
echo "Local master:  $(git rev-parse master)"
echo "Remote master: $(git rev-parse origin/master)"
echo ""

if [ "$(git rev-parse master)" != "$(git rev-parse origin/master)" ]; then
    echo "⚠️  As branches são diferentes!"
    echo "🔄 Sobrescrevendo branch local com remote..."
    git reset --hard origin/master
    echo "✅ Branch master local sincronizada com origin/master"
else
    echo "✅ As branches já estão sincronizadas"
fi

echo ""
echo "📋 Status final:"
git status
