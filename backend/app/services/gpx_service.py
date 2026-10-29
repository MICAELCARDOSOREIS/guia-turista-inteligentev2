"""Serviço de geração e exportação de arquivos no padrão internacional XML GPX 1.1."""

from xml.sax.saxutils import escape

def gerar_xml_gpx(
    origem: str,
    destino: str,
    coordinates: list[tuple[float, float] | list[float]],
    elevações: list[float] | None = None,
) -> str:
    """Gera o documento XML GPX 1.1 compatível com Garmin, Strava e navegadores GPS."""
    origem_esc = escape(origem)
    destino_esc = escape(destino)

    linhas = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<gpx version="1.1" creator="Guia do Turista Inteligente v2 - FastAPI"',
        '     xmlns="http://www.topografix.com/GPX/1/1"',
        '     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        '     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">',
        '  <metadata>',
        f'    <name>Roteiro: {origem_esc} para {destino_esc}</name>',
        '    <desc>Traçado rodoviário e altimetria gerado pelo Guia do Turista Inteligente v2</desc>',
        '  </metadata>',
    ]

    # Waypoints de Partida e Chegada
    if coordinates:
        p_inicio = coordinates[0]
        p_fim = coordinates[-1]
        linhas.append(f'  <wpt lat="{p_inicio[1]}" lon="{p_inicio[0]}"><name>Partida: {origem_esc}</name></wpt>')
        linhas.append(f'  <wpt lat="{p_fim[1]}" lon="{p_fim[0]}"><name>Destino: {destino_esc}</name></wpt>')

    # Trilhas e pontos
    linhas.append('  <trk>')
    linhas.append(f'    <name>{origem_esc} -> {destino_esc}</name>')
    linhas.append('    <trkseg>')

    for idx, pt in enumerate(coordinates):
        lon = pt[0]
        lat = pt[1]
        if elevações and idx < len(elevações):
            alt = elevações[idx]
            linhas.append(f'      <trkpt lat="{lat}" lon="{lon}"><ele>{alt}</ele></trkpt>')
        else:
            linhas.append(f'      <trkpt lat="{lat}" lon="{lon}"></trkpt>')

    linhas.append('    </trkseg>')
    linhas.append('  </trk>')
    linhas.append('</gpx>')

    return "\n".join(linhas)
