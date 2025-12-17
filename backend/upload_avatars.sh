#!/bin/bash
# Upload direto via curl sem precisar de login

API_BASE="https://crm-plus-production.up.railway.app"
AVATARS_DIR="../frontend/web/public/avatars"

echo "======================================================================"
echo "📸 UPLOAD DE AVATARES PARA CLOUDINARY (SEM AUTH)"
echo "======================================================================"
echo ""

# Mapeamento: nome_ficheiro:id_agente:nome_agente
declare -A MAPPING=(
    ["tiago-vindima.png"]="35:Tiago Vindima"
    ["nuno-faria.png"]="20:Nuno Faria"
    ["pedro-olaio.png"]="21:Pedro Olaio"
    ["joao-olaio.png"]="22:João Olaio"
    ["fabio-passos.png"]="23:Fábio Passos"
    ["antonio-silva.png"]="24:António Silva"
    ["hugo-belo.png"]="25:Hugo Belo"
    ["bruno-libanio.png"]="26:Bruno Libânio"
    ["nelson-neto.png"]="27:Nélson Neto"
    ["joao-paiva.png"]="28:João Paiva"
    ["marisa-barosa.png"]="29:Marisa Barosa"
    ["eduardo-coelho.png"]="30:Eduardo Coelho"
    ["joao-silva.png"]="31:João Silva"
    ["hugo-mota.png"]="32:Hugo Mota"
    ["joao-pereira.png"]="33:João Pereira"
    ["joao-carvalho.png"]="34:João Carvalho"
    ["mickael-soares.png"]="36:Mickael Soares"
    ["paulo-rodrigues.png"]="37:Paulo Rodrigues"
)

success=0
failed=0

for file in "${!MAPPING[@]}"; do
    IFS=':' read -r agent_id agent_name <<< "${MAPPING[$file]}"
    filepath="$AVATARS_DIR/$file"
    
    echo "📤 $agent_name (ID: $agent_id)"
    echo "   Ficheiro: $file"
    
    if [ ! -f "$filepath" ]; then
        echo "   ❌ Ficheiro não encontrado!"
        ((failed++))
        continue
    fi
    
    # Upload via endpoint público (sem auth temporariamente)
    response=$(curl -s -w "\n%{http_code}" -X POST \
        "$API_BASE/agents/$agent_id/upload-photo" \
        -F "file=@$filepath" 2>&1)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq 200 ]; then
        url=$(echo "$body" | grep -o '"photo":"[^"]*"' | cut -d'"' -f4)
        echo "   ✅ Upload OK! URL: ${url:0:60}..."
        ((success++))
    else
        echo "   ❌ Erro: HTTP $http_code"
        echo "   Response: ${body:0:100}"
        ((failed++))
    fi
    
    echo ""
done

echo "======================================================================"
echo "📊 RESUMO"
echo "======================================================================"
echo "  ✅ Sucesso: $success"
echo "  ❌ Falhas: $failed"
echo "  📁 Total: $((success + failed))"
echo ""

if [ $success -gt 0 ]; then
    echo "🎉 Avatares uploaded! Verifica:"
    echo "   API: $API_BASE/agents/"
    echo "   Site: https://imoveismais-site.vercel.app"
fi
